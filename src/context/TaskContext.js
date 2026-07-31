import React, { createContext, useContext, useState, useEffect } from 'react';
import { StorageService } from '../services/storage';

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

  const loadAllData = async () => {
    try {
      const loadedTasks = await StorageService.getTasks();
      const loadedReminders = await StorageService.getReminders();
      const loadedHabits = await StorageService.getHabits();
      const loadedDiary = await StorageService.getDiaryEntries();

      setTasks(loadedTasks);
      setReminders(loadedReminders);
      setHabits(loadedHabits);
      setDiaryEntries(loadedDiary);
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      setLoading(false);
    }
  };

  // Task actions
  const addTask = async (newTask) => {
    const updated = [newTask, ...tasks];
    setTasks(updated);
    await StorageService.saveTasks(updated);
  };

  const toggleTaskCompletion = async (taskId, confirmed = false) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, completed: confirmed ? true : !t.completed };
      }
      return t;
    });
    setTasks(updated);
    await StorageService.saveTasks(updated);
  };

  const deleteTask = async (taskId) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
    await StorageService.saveTasks(updated);
  };

  // Habit actions
  const toggleHabit = async (habitId) => {
    const updated = habits.map((h) => {
      if (h.id === habitId) {
        const nextState = !h.completedToday;
        return {
          ...h,
          completedToday: nextState,
          streak: nextState ? h.streak + 1 : Math.max(1, h.streak - 1),
          progress: nextState ? Math.min(100, h.progress + 15) : Math.max(0, h.progress - 15),
        };
      }
      return h;
    });
    setHabits(updated);
    await StorageService.saveHabits(updated);
  };

  const addHabit = async (newHabit) => {
    const updated = [newHabit, ...habits];
    setHabits(updated);
    await StorageService.saveHabits(updated);
  };

  // Reminder actions
  const addReminder = async (newReminder) => {
    const updated = [newReminder, ...reminders];
    setReminders(updated);
    await StorageService.saveReminders(updated);
  };

  // Diary actions
  const addDiaryEntry = async (newEntry) => {
    const updated = [newEntry, ...diaryEntries];
    setDiaryEntries(updated);
    await StorageService.saveDiaryEntries(updated);
  };

  return (
    <TaskContext.Provider
      value={{
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
        addDiaryEntry,
        refreshData: loadAllData,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
