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

export const initialTasks = [
  {
    id: 't1',
    title: 'Complete UI Design',
    category: 'Work',
    priority: 'High',
    time: '10:00 AM',
    notes: 'Finish high-fidelity dark & light mode screens for Daybook app.',
    completed: false,
    date: getTodayStr(),
  },
  {
    id: 't2',
    title: 'Client Meeting at 11 AM',
    category: 'Work',
    priority: 'Medium',
    time: '11:00 AM',
    notes: 'Discuss project milestones and deliverables.',
    completed: false,
    date: getTodayStr(),
  },
  {
    id: 't3',
    title: 'Finish GST Filing',
    category: 'Finance',
    priority: 'High',
    time: '02:00 PM',
    notes: 'Verify invoices before submission.',
    completed: false,
    date: getTodayStr(),
  },
  {
    id: 't4',
    title: 'Pay Electricity Bill',
    category: 'Finance',
    priority: 'High',
    time: '05:00 PM',
    notes: 'Due date is today.',
    completed: false,
    date: getTodayStr(),
  },
  {
    id: 't5',
    title: 'Drink Water',
    category: 'Health',
    priority: 'Low',
    time: '07:00 AM',
    notes: 'Daily habit goal: 3 liters',
    completed: true,
    date: getTodayStr(),
  },
  {
    id: 't6',
    title: 'Gym Workout',
    category: 'Health',
    priority: 'Low',
    time: '06:00 PM',
    notes: 'Leg day routine & 20 min cardio',
    completed: true,
    date: getTodayStr(),
  },
  {
    id: 't7',
    title: 'Read Book',
    category: 'Personal',
    priority: 'Low',
    time: '08:00 PM',
    notes: 'Atomic Habits - Chapter 4',
    completed: true,
    date: getTodayStr(),
  },
];

export const initialReminders = [
  {
    id: 'r1',
    title: 'Doctor Appointment',
    importance: 'Regular health checkup and routine blood work.',
    notes: "Don't forget to bring previous medical reports.",
    date: getTodayStr(),
    time: '10:00 AM',
    alarmTone: 'Default',
    repeat: 'Does not repeat',
    priority: 'High',
    notification: true,
    category: 'Health',
  },
  {
    id: 'r2',
    title: 'Finish Project Report',
    importance: 'End of month client presentation.',
    notes: 'Include Q3 productivity metrics and budget forecasting.',
    date: getTodayStr(),
    time: '04:00 PM',
    alarmTone: 'Chime',
    repeat: 'Weekly',
    priority: 'High',
    notification: true,
    category: 'Work',
  },
  {
    id: 'r3',
    title: 'Birthday - Rahul',
    importance: " Rahul's 25th Birthday Celebration!",
    notes: 'Buy gift card and call at 12 AM.',
    date: getTodayStr(),
    time: '12:00 AM',
    alarmTone: 'Gentle',
    repeat: 'Yearly',
    priority: 'Critical',
    notification: true,
    category: 'Personal',
  },
];

export const initialHabits = [
  {
    id: 'h1',
    title: 'Drink Water',
    frequency: 'Daily',
    progress: 100,
    streak: 12,
    completedToday: true,
    autoAddToday: true,
    icon: 'droplet',
  },
  {
    id: 'h2',
    title: 'Gym Workout',
    frequency: '5 Times a Week',
    progress: 70,
    streak: 8,
    completedToday: true,
    autoAddToday: true,
    icon: 'dumbbell',
  },
  {
    id: 'h3',
    title: 'Reading',
    frequency: 'Daily',
    progress: 80,
    streak: 15,
    completedToday: false,
    autoAddToday: true,
    icon: 'book',
  },
  {
    id: 'h4',
    title: 'Meditation',
    frequency: 'Daily',
    progress: 60,
    streak: 5,
    completedToday: false,
    autoAddToday: true,
    icon: 'sparkles',
  },
  {
    id: 'h5',
    title: 'No Sugar',
    frequency: 'Daily',
    progress: 40,
    streak: 3,
    completedToday: false,
    autoAddToday: false,
    icon: 'ban',
  },
];

export const initialDiaryEntries = [
  {
    id: 'd1',
    date: getTodayStr(),
    formattedDate: getTodayFormatted(),
    title: 'Productive Day & Milestone Reached',
    mood: 'happy',
    content:
      'Today was a super productive day! Completed all key project design tasks on time. Went for a morning jog which gave me extra energy throughout the day. Grateful for good health and family support.',
  },
  {
    id: 'd2',
    date: getTodayStr(),
    formattedDate: getTodayFormatted(),
    title: 'Planning and System Architecture',
    mood: 'calm',
    content:
      'Spent time organizing goals for the next month. Started reading Atomic Habits again. Consistency is key.',
  },
];

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
