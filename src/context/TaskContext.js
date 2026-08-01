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

  const syncDailyHabitsToTasks = async (currentTasks, currentHabits) => {
    const todayStr = new Date().toISOString().split('T')[0];
    let updatedTasksList = [...currentTasks];
    let changed = false;

    for (const habit of currentHabits) {
      const existingIdx = updatedTasksList.findIndex((t) => t.title.toLowerCase() === habit.title.toLowerCase() && t.date === todayStr);

      if (habit.autoAddToday) {
        if (existingIdx === -1) {
          const habitTask = {
            id: 'h_task_' + habit.id + '_' + Date.now(),
            title: habit.title,
            category: habit.category || 'Health',
            priority: habit.priority || 'Medium',
            time: habit.time || '08:00 AM',
            notes: habit.notes || `Daily Habit Goal`,
            completed: Boolean(habit.completedToday),
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

      let finalTasks = loadedTasks;

      setTasks(finalTasks);
      setReminders(loadedReminders);
      setHabits(loadedHabits);
      setDiaryEntries(loadedDiary);

      await syncDailyHabitsToTasks(finalTasks, loadedHabits);
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
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === taskId ? { ...t, completed: confirmed ? true : !t.completed } : t));
      const targetTask = updated.find((t) => t.id === taskId);

      if (targetTask) {
        setHabits((prevHabits) =>
          prevHabits.map((h) => {
            if (h.title.toLowerCase() === targetTask.title.toLowerCase()) {
              HabitRepository.toggle(h.id);
              return {
                ...h,
                completedToday: targetTask.completed,
                streak: targetTask.completed ? h.streak + 1 : Math.max(0, h.streak - 1),
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
    setHabits((prev) => {
      const updated = prev.map((h) => {
        if (h.id === habitId) {
          const nextState = !h.completedToday;
          return {
            ...h,
            completedToday: nextState,
            streak: nextState ? h.streak + 1 : Math.max(0, h.streak - 1),
            progress: nextState ? Math.min(100, h.progress + 15) : Math.max(0, h.progress - 15),
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
    await ReminderRepository.update(updatedReminder);
    setReminders((prev) => prev.map((r) => (r.id === updatedReminder.id ? updatedReminder : r)));
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
