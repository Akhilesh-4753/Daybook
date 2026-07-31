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
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: confirmed ? true : !t.completed } : t))
    );
  }, []);

  const deleteTask = useCallback(async (taskId) => {
    await TaskRepository.delete(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  // Habit actions
  const toggleHabit = useCallback(async (habitId) => {
    await HabitRepository.toggle(habitId);
    setHabits((prev) =>
      prev.map((h) => {
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
      })
    );
  }, []);

  const addHabit = useCallback(async (newHabit) => {
    const created = await HabitRepository.add(newHabit);
    setHabits((prev) => [created, ...prev]);
  }, []);

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
