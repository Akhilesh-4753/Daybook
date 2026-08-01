let AsyncStorage;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  const memoryStore = {};
  AsyncStorage = {
    getItem: async (k) => memoryStore[k] || null,
    setItem: async (k, v) => { memoryStore[k] = v; },
    removeItem: async (k) => { delete memoryStore[k]; },
  };
}

const getTodayStr = () => new Date().toISOString().split('T')[0];
const getTodayFormatted = () => new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const TASKS_KEY = '@daybook_tasks';
const REMINDERS_KEY = '@daybook_reminders';
const HABITS_KEY = '@daybook_habits';
const DIARY_KEY = '@daybook_diary';
const USER_KEY = '@daybook_user';

export const initialTasks = [];
export const initialReminders = [];
export const initialHabits = [];
export const initialDiaryEntries = [];

export const initialUser = {
  name: 'Akhilesh',
  email: 'akhilesh@daybook.app',
  profilePic: null,
  streak: 12,
  productivityScore: 87,
};

export const StorageService = {
  // Tasks
  getTasks: async () => {
    try {
      const data = await AsyncStorage.getItem(TASKS_KEY);
      if (!data) {
        await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(initialTasks));
        return initialTasks;
      }
      return JSON.parse(data);
    } catch (e) {
      return initialTasks;
    }
  },
  saveTasks: async (tasks) => {
    try {
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error(e);
    }
  },

  // Reminders
  getReminders: async () => {
    try {
      const data = await AsyncStorage.getItem(REMINDERS_KEY);
      if (!data) {
        await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(initialReminders));
        return initialReminders;
      }
      return JSON.parse(data);
    } catch (e) {
      return initialReminders;
    }
  },
  saveReminders: async (reminders) => {
    try {
      await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
    } catch (e) {
      console.error(e);
    }
  },

  // Habits
  getHabits: async () => {
    try {
      const data = await AsyncStorage.getItem(HABITS_KEY);
      if (!data) {
        await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(initialHabits));
        return initialHabits;
      }
      return JSON.parse(data);
    } catch (e) {
      return initialHabits;
    }
  },
  saveHabits: async (habits) => {
    try {
      await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
    } catch (e) {
      console.error(e);
    }
  },

  // Diary
  getDiaryEntries: async () => {
    try {
      const data = await AsyncStorage.getItem(DIARY_KEY);
      if (!data) {
        await AsyncStorage.setItem(DIARY_KEY, JSON.stringify(initialDiaryEntries));
        return initialDiaryEntries;
      }
      return JSON.parse(data);
    } catch (e) {
      return initialDiaryEntries;
    }
  },
  saveDiaryEntries: async (entries) => {
    try {
      await AsyncStorage.setItem(DIARY_KEY, JSON.stringify(entries));
    } catch (e) {
      console.error(e);
    }
  },

  // User
  getUser: async () => {
    try {
      const data = await AsyncStorage.getItem(USER_KEY);
      if (!data) {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(initialUser));
        return initialUser;
      }
      return JSON.parse(data);
    } catch (e) {
      return initialUser;
    }
  },
};
