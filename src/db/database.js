import { Platform } from 'react-native';
import {
  CREATE_TASKS_TABLE,
  CREATE_REMINDERS_TABLE,
  CREATE_HABITS_TABLE,
  CREATE_DIARY_TABLE,
  CREATE_REPORTS_TABLE,
} from './schema';
import {
  initialTasks,
  initialReminders,
  initialHabits,
  initialDiaryEntries,
  StorageService,
} from '../services/storage';

let SQLite = null;
try {
  SQLite = require('expo-sqlite');
} catch (e) {
  console.warn('expo-sqlite module load fallback');
}

let dbInstance = null;

// In-memory / storage fallback implementation if WASM or SQLite is unsupported in web mode
const createFallbackDB = () => {
  let memoryTasks = [...initialTasks];
  let memoryReminders = [...initialReminders];
  let memoryHabits = [...initialHabits];
  let memoryDiary = [...initialDiaryEntries];

  return {
    execAsync: async () => {},
    runAsync: async (sql, params = []) => {
      if (sql.includes('INSERT INTO tasks')) {
        memoryTasks.push({ id: params[0], title: params[1], category: params[2], priority: params[3], time: params[4], notes: params[5], completed: Boolean(params[6]), date: params[7] });
      } else if (sql.includes('UPDATE tasks SET completed')) {
        const id = params[1] || params[0];
        memoryTasks = memoryTasks.map(t => t.id === id ? { ...t, completed: params[0] === 1 ? true : params[0] === 0 ? false : !t.completed } : t);
      } else if (sql.includes('DELETE FROM tasks')) {
        memoryTasks = memoryTasks.filter(t => t.id !== params[0]);
      } else if (sql.includes('INSERT INTO diary_entries')) {
        memoryDiary.push({
          id: params[0],
          date: params[1],
          formatted_date: params[2],
          title: params[3],
          mood: params[4],
          content: params[5],
          created_at: params[6] || new Date().toISOString(),
          modified_at: params[7] || null
        });
      } else if (sql.includes('UPDATE diary_entries')) {
        const title = params[0];
        const mood = params[1];
        const content = params[2];
        const modified_at = params[3];
        const id = params[4];
        memoryDiary = memoryDiary.map(d => d.id === id ? { ...d, title, mood, content, modified_at } : d);
      } else if (sql.includes('INSERT INTO habits')) {
        memoryHabits.push({ id: params[0], title: params[1], frequency: params[2], progress: params[3], streak: params[4], completed_today: params[5], auto_add_today: params[6], icon: params[7] });
      } else if (sql.includes('INSERT INTO reminders')) {
        memoryReminders.push({ id: params[0], title: params[1], importance: params[2], notes: params[3], date: params[4], time: params[5], alarm_tone: params[6], repeat_rule: params[7], priority: params[8], notification: params[9], category: params[10] });
      }
    },
    getAllAsync: async (sql) => {
      if (sql.includes('tasks')) return memoryTasks.map(t => ({ ...t, completed: t.completed ? 1 : 0 }));
      if (sql.includes('reminders')) return memoryReminders.map(r => ({ ...r, alarm_tone: r.alarmTone || r.alarm_tone, repeat_rule: r.repeat || r.repeat_rule, notification: r.notification ? 1 : 0 }));
      if (sql.includes('habits')) return memoryHabits.map(h => ({ ...h, completed_today: h.completedToday ? 1 : 0, auto_add_today: h.autoAddToday ? 1 : 0 }));
      if (sql.includes('diary')) return memoryDiary.map(d => ({ ...d, formatted_date: d.formattedDate || d.formatted_date, created_at: d.created_at || d.createdAt || new Date().toISOString(), modified_at: d.modified_at || d.modifiedAt || null }));
      return [];
    },
    getFirstAsync: async () => ({ count: 1 }),
  };
};

export const getDB = async () => {
  if (dbInstance) return dbInstance;

  try {
    if (Platform.OS !== 'web' && SQLite && SQLite.openDatabaseAsync) {
      dbInstance = await SQLite.openDatabaseAsync('daybook_v2.db');
    } else if (Platform.OS !== 'web' && SQLite && SQLite.openDatabaseSync) {
      dbInstance = SQLite.openDatabaseSync('daybook_v2.db');
    } else {
      dbInstance = createFallbackDB();
    }
  } catch (e) {
    console.warn('SQLite openDatabase fallback:', e);
    dbInstance = createFallbackDB();
  }

  return dbInstance;
};

export const initDatabase = async () => {
  const db = await getDB();
  try {
    if (db.execAsync) {
      await db.execAsync(CREATE_TASKS_TABLE).catch(() => {});
      await db.execAsync(CREATE_REMINDERS_TABLE).catch(() => {});
      await db.execAsync(CREATE_HABITS_TABLE).catch(() => {});
      await db.execAsync(CREATE_DIARY_TABLE).catch(() => {});
      await db.execAsync(CREATE_REPORTS_TABLE).catch(() => {});
      // Database Migrations: Add modified_at column if not exists
      await db.execAsync('ALTER TABLE diary_entries ADD COLUMN modified_at TEXT;').catch(() => {});
    }

    await seedInitialDataIfEmpty(db);
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

const seedInitialDataIfEmpty = async (db) => {
  try {
    if (!db.getAllAsync) return;

    // Seed tasks if empty
    const tasksCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM tasks;');
    if (tasksCount && tasksCount.count === 0) {
      for (const t of initialTasks) {
        await db.runAsync(
          `INSERT INTO tasks (id, title, category, priority, time, notes, completed, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
          [t.id, t.title, t.category, t.priority, t.time || '', t.notes || '', t.completed ? 1 : 0, t.date || '2026-07-29']
        );
      }
    }

    // Seed reminders if empty
    const remCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM reminders;');
    if (remCount && remCount.count === 0) {
      for (const r of initialReminders) {
        await db.runAsync(
          `INSERT INTO reminders (id, title, importance, notes, date, time, alarm_tone, repeat_rule, priority, notification, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [r.id, r.title, r.importance || '', r.notes || '', r.date, r.time, r.alarmTone || 'Default', r.repeat || 'Does not repeat', r.priority || 'Medium', r.notification ? 1 : 0, r.category || 'Personal']
        );
      }
    }

    // Seed habits if empty
    const habitCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM habits;');
    if (habitCount && habitCount.count === 0) {
      for (const h of initialHabits) {
        await db.runAsync(
          `INSERT INTO habits (id, title, frequency, progress, streak, completed_today, auto_add_today, icon) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
          [h.id, h.title, h.frequency, h.progress, h.streak, h.completedToday ? 1 : 0, h.autoAddToday ? 1 : 0, h.icon || 'sparkles']
        );
      }
    }

    // Seed diary if empty
    const diaryCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM diary_entries;');
    if (diaryCount && diaryCount.count === 0) {
      for (const d of initialDiaryEntries) {
        await db.runAsync(
          `INSERT INTO diary_entries (id, date, formatted_date, title, mood, content) VALUES (?, ?, ?, ?, ?, ?);`,
          [d.id, d.date, d.formattedDate, d.title, d.mood, d.content]
        );
      }
    }
  } catch (e) {
    console.error('Data seeding error:', e);
  }
};
