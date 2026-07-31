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
    let newTasksAdded = false;
    let updatedTasksList = [...currentTasks];

    for (const habit of currentHabits) {
      if (habit.autoAddToday !== false || habit.frequency === 'Daily' || habit.frequency === '5 Times a Week') {
        const existing = updatedTasksList.find((t) => t.title.toLowerCase() === habit.title.toLowerCase() && t.date === todayStr);
        if (!existing) {
          const habitTask = {
            id: 'h_task_' + habit.id + '_' + Date.now(),
            title: habit.title,
            category: 'Health',
            priority: 'Medium',
            time: '08:00 AM',
            notes: `Daily Habit Goal (${habit.frequency})`,
            completed: Boolean(habit.completedToday),
            date: todayStr,
            isHabitTask: true,
            habitId: habit.id,
          };
          const savedTask = await TaskRepository.add(habitTask);
          updatedTasksList = [savedTask, ...updatedTasksList];
          newTasksAdded = true;
        }
      }
    }

    if (newTasksAdded) {
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

      setTasks(loadedTasks);
      setReminders(loadedReminders);
      setHabits(loadedHabits);
      setDiaryEntries(loadedDiary);

      await syncDailyHabitsToTasks(loadedTasks, loadedHabits);
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

      // Sync habit if task corresponds to a habit
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

  const addHabit = useCallback(async (newHabit) => {
    const created = await HabitRepository.add(newHabit);
    setHabits((prev) => {
      const updated = [created, ...prev];
      syncDailyHabitsToTasks(tasks, updated);
      return updated;
    });
  }, [tasks]);

  // Reminder actions with Expo Local Notifications
  const addReminder = useCallback(async (newReminder) => {
    const notifId = await NotificationService.scheduleReminder(newReminder);
    const created = await ReminderRepository.add({ ...newReminder, notificationId: notifId });
    setReminders((prev) => [created, ...prev]);
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
      addHabit,
      addReminder,
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
      addHabit,
      addReminder,
      deleteReminder,
      addDiaryEntry,
      loadAllData,
    ]
  );

  return <TaskContext.Provider value={contextValue}>{children}</TaskContext.Provider>;
};

export const useTasks = () => useContext(TaskContext);
