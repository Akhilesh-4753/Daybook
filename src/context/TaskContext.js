import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { initDatabase } from '../db/database';
import { TaskRepository } from '../repositories/TaskRepository';
import { DiaryRepository } from '../repositories/DiaryRepository';
import { ReminderRepository } from '../repositories/ReminderRepository';
import { HabitRepository } from '../repositories/HabitRepository';
import { NotificationService } from '../services/NotificationService';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [habits, setHabits] = useState([]);
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const getDaysInCurrentMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  };

  const syncDailyHabitsToTasks = async (currentTasks, currentHabits) => {
    const todayStr = new Date().toISOString().split('T')[0];
    let updatedTasksList = [...currentTasks];
    let changed = false;

    for (const habit of currentHabits) {
      const existingIdx = updatedTasksList.findIndex(
        (t) => t.title.toLowerCase() === habit.title.toLowerCase() && (t.date === todayStr || t.habitId === habit.id)
      );

      if (habit.autoAddToday) {
        if (existingIdx === -1) {
          const habitTask = {
            id: 'h_task_' + habit.id + '_' + Date.now(),
            title: habit.title,
            category: habit.category || 'Health',
            priority: habit.priority || 'Medium',
            time: habit.time || '08:00 AM',
            notes: habit.notes || `Daily Habit Goal`,
            completed: false,
            date: todayStr,
            isHabitTask: true,
            habitId: habit.id,
            icon: habit.icon,
          };
          const savedTask = await TaskRepository.add(habitTask);
          updatedTasksList = [savedTask, ...updatedTasksList];
          changed = true;
        }
      } else {
        if (existingIdx !== -1 && updatedTasksList[existingIdx].isHabitTask) {
          await TaskRepository.delete(updatedTasksList[existingIdx].id);
          updatedTasksList = updatedTasksList.filter((_, idx) => idx !== existingIdx);
          changed = true;
        }
      }
    }

    if (changed) {
      setTasks(updatedTasksList);
    }
  };

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      await initDatabase();

      const [loadedTasks, loadedReminders, loadedHabits, loadedDiary] = await Promise.all([
        TaskRepository.getAll(),
        ReminderRepository.getAll(),
        HabitRepository.getAll(),
        DiaryRepository.getAll(),
      ]);

      const todayStr = new Date().toISOString().split('T')[0];
      const currentMonthKey = todayStr.slice(0, 7); // e.g. "2026-08"

      // Process monthly habit reset if new month started
      const processedHabits = loadedHabits.map((h) => {
        if (h.lastMonthKey && h.lastMonthKey !== currentMonthKey) {
          // New month started: reset monthly streak and line fill
          return { ...h, streak: 0, progress: 0, completedToday: false, lastMonthKey: currentMonthKey };
        }
        return { ...h, lastMonthKey: currentMonthKey };
      });

      // Daily Reset & Carryover Logic (at 12:00 AM / next day)
      // 1. Past completed tasks stay in DB for reports, but filter out of Today screen.
      // 2. Past incomplete/pending tasks carry over to Today marked as Overdue (red).
      const finalTasks = [];
      for (const task of loadedTasks) {
        if (task.date < todayStr) {
          if (!task.completed) {
            // Carry over incomplete task to Today marked as Overdue
            const overdueTask = { ...task, date: todayStr, isOverdue: true };
            await TaskRepository.update(overdueTask);
            finalTasks.push(overdueTask);
          }
          // Completed past tasks are left in DB for Reports but omitted from Today's list
        } else {
          finalTasks.push(task);
        }
      }

      setTasks(finalTasks);
      setReminders(loadedReminders);
      setHabits(processedHabits);
      setDiaryEntries(loadedDiary);

      await syncDailyHabitsToTasks(finalTasks, processedHabits);
    } catch (e) {
      console.error('Error loading SQLite data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Task actions
  const addTask = useCallback(async (newTask) => {
    const created = await TaskRepository.add(newTask);
    setTasks((prev) => [created, ...prev]);
  }, []);

  const toggleTaskCompletion = useCallback(async (taskId, confirmed = false) => {
    await TaskRepository.toggleCompletion(taskId, confirmed ? true : null);
    const totalDays = getDaysInCurrentMonth();

    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === taskId ? { ...t, completed: confirmed ? true : !t.completed } : t));
      const targetTask = updated.find((t) => t.id === taskId);

      if (targetTask) {
        setHabits((prevHabits) =>
          prevHabits.map((h) => {
            if ((targetTask.habitId && targetTask.habitId === h.id) || h.title.trim().toLowerCase() === targetTask.title.trim().toLowerCase()) {
              const isComp = targetTask.completed;
              const newStreak = isComp ? Math.min(totalDays, h.streak + 1) : Math.max(0, h.streak - 1);
              const newProgress = Math.min(100, Math.round((newStreak / totalDays) * 100));
              
              HabitRepository.toggle(h.id);
              return {
                ...h,
                completedToday: isComp,
                streak: newStreak,
                progress: newProgress,
              };
            }
            return h;
          })
        );
      }
      return updated;
    });
  }, []);

  const deleteTask = useCallback(async (taskId) => {
    await TaskRepository.delete(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  // Habit actions
  const toggleHabit = useCallback(async (habitId) => {
    await HabitRepository.toggle(habitId);
    const totalDays = getDaysInCurrentMonth();

    setHabits((prev) => {
      const updated = prev.map((h) => {
        if (h.id === habitId) {
          const nextState = !h.completedToday;
          const newStreak = nextState ? Math.min(totalDays, h.streak + 1) : Math.max(0, h.streak - 1);
          const newProgress = Math.min(100, Math.round((newStreak / totalDays) * 100));

          return {
            ...h,
            completedToday: nextState,
            streak: newStreak,
            progress: newProgress,
          };
        }
        return h;
      });

      const targetHabit = updated.find((h) => h.id === habitId);
      if (targetHabit) {
        const todayStr = new Date().toISOString().split('T')[0];
        setTasks((prevTasks) =>
          prevTasks.map((t) => {
            if (t.title.toLowerCase() === targetHabit.title.toLowerCase() && t.date === todayStr) {
              TaskRepository.toggleCompletion(t.id, targetHabit.completedToday);
              return { ...t, completed: targetHabit.completedToday };
            }
            return t;
          })
        );
      }
      return updated;
    });
  }, []);

  const toggleAutoAddHabit = useCallback(async (habitId) => {
    await HabitRepository.toggleAutoAdd(habitId);
    setHabits((prev) => {
      const updated = prev.map((h) => (h.id === habitId ? { ...h, autoAddToday: !h.autoAddToday } : h));
      syncDailyHabitsToTasks(tasks, updated);
      return updated;
    });
  }, [tasks]);

  const addHabit = useCallback(async (newHabit) => {
    const created = await HabitRepository.add(newHabit);
    setHabits((prev) => {
      const updated = [created, ...prev];
      syncDailyHabitsToTasks(tasks, updated);
      return updated;
    });
  }, [tasks]);

  const updateHabit = useCallback(async (updatedHabit) => {
    await HabitRepository.update(updatedHabit);
    setHabits((prev) => {
      const updated = prev.map((h) => (h.id === updatedHabit.id ? updatedHabit : h));
      syncDailyHabitsToTasks(tasks, updated);
      return updated;
    });
  }, [tasks]);

  const deleteHabit = useCallback(async (habitId) => {
    await HabitRepository.delete(habitId);
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
  }, []);

  // Reminder actions with Expo Local Notifications
  const addReminder = useCallback(async (newReminder) => {
    const notifId = await NotificationService.scheduleReminder(newReminder);
    const created = await ReminderRepository.add({ ...newReminder, notificationId: notifId });
    setReminders((prev) => [created, ...prev]);
  }, []);

  const updateReminder = useCallback(async (updatedReminder) => {
    if (updatedReminder.notificationId) {
      await NotificationService.cancelReminder(updatedReminder.notificationId);
    }
    const notifId = await NotificationService.scheduleReminder(updatedReminder);
    const finalReminder = { ...updatedReminder, notificationId: notifId };
    await ReminderRepository.update(finalReminder);
    setReminders((prev) => prev.map((r) => (r.id === finalReminder.id ? finalReminder : r)));
  }, []);

  const deleteReminder = useCallback(async (reminderId, notificationId) => {
    if (notificationId) {
      await NotificationService.cancelReminder(notificationId);
    }
    await ReminderRepository.delete(reminderId);
    setReminders((prev) => prev.filter((r) => r.id !== reminderId));
  }, []);

  // Diary actions
  const addDiaryEntry = useCallback(async (newEntry) => {
    const created = await DiaryRepository.add(newEntry);
    setDiaryEntries((prev) => [created, ...prev]);
  }, []);

  const contextValue = useMemo(
    () => ({
      tasks,
      reminders,
      habits,
      diaryEntries,
      loading,
      addTask,
      toggleTaskCompletion,
      deleteTask,
      toggleHabit,
      toggleAutoAddHabit,
      addHabit,
      updateHabit,
      deleteHabit,
      addReminder,
      updateReminder,
      deleteReminder,
      addDiaryEntry,
      refreshData: loadAllData,
    }),
    [
      tasks,
      reminders,
      habits,
      diaryEntries,
      loading,
      addTask,
      toggleTaskCompletion,
      deleteTask,
      toggleHabit,
      toggleAutoAddHabit,
      addHabit,
      updateHabit,
      deleteHabit,
      addReminder,
      updateReminder,
      deleteReminder,
      addDiaryEntry,
      loadAllData,
    ]
  );

  return <TaskContext.Provider value={contextValue}>{children}</TaskContext.Provider>;
};

export const useTasks = () => useContext(TaskContext);
