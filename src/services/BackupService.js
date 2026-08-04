import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getDB } from '../db/database';

export const BackupService = {
  exportBackup: async () => {
    try {
      const db = await getDB();
      const tasks = await db.getAllAsync('SELECT * FROM tasks;');
      const reminders = await db.getAllAsync('SELECT * FROM reminders;');
      const habits = await db.getAllAsync('SELECT * FROM habits;');
      const diaryEntries = await db.getAllAsync('SELECT * FROM diary_entries;');
      const reports = await db.getAllAsync('SELECT * FROM reports;');

      const backupData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        tasks,
        reminders,
        habits,
        diaryEntries,
        reports,
      };

      const fileUri = `${FileSystem.documentDirectory}daybook_backup.json`;
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backupData, null, 2));

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Daybook Backup',
          UTI: 'public.json',
        });
      }

      return { success: true, fileUri };
    } catch (error) {
      console.error('Export backup error:', error);
      throw error;
    }
  },

  importBackup: async (jsonContent) => {
    try {
      const parsed = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;
      if (!parsed.tasks || !parsed.habits) {
        throw new Error('Invalid backup file format');
      }

      const db = await getDB();
      await db.execAsync('BEGIN TRANSACTION;');

      // Clear existing records
      await db.runAsync('DELETE FROM tasks;');
      await db.runAsync('DELETE FROM reminders;');
      await db.runAsync('DELETE FROM habits;');
      await db.runAsync('DELETE FROM diary_entries;');

      // Restore Tasks
      if (Array.isArray(parsed.tasks)) {
        for (const t of parsed.tasks) {
          await db.runAsync(
            `INSERT INTO tasks (id, title, category, priority, time, notes, completed, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            [t.id, t.title, t.category, t.priority, t.time, t.notes, t.completed, t.date]
          );
        }
      }

      // Restore Reminders
      if (Array.isArray(parsed.reminders)) {
        for (const r of parsed.reminders) {
          await db.runAsync(
            `INSERT INTO reminders (id, title, importance, notes, date, time, alarm_tone, repeat_rule, priority, notification, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [r.id, r.title, r.importance, r.notes, r.date, r.time, r.alarm_tone || r.alarmTone, r.repeat_rule || r.repeat, r.priority, r.notification, r.category]
          );
        }
      }

      // Restore Habits
      if (Array.isArray(parsed.habits)) {
        for (const h of parsed.habits) {
          await db.runAsync(
            `INSERT INTO habits (id, title, frequency, progress, streak, completed_today, auto_add_today, icon) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            [h.id, h.title, h.frequency, h.progress, h.streak, h.completed_today || (h.completedToday ? 1 : 0), h.auto_add_today || (h.autoAddToday ? 1 : 0), h.icon]
          );
        }
      }

      // Restore Diary Entries
      if (Array.isArray(parsed.diaryEntries)) {
        for (const d of parsed.diaryEntries) {
          await db.runAsync(
            `INSERT INTO diary_entries (id, date, formatted_date, title, mood, content) VALUES (?, ?, ?, ?, ?, ?);`,
            [d.id, d.date, d.formatted_date || d.formattedDate, d.title, d.mood, d.content]
          );
        }
      }

      await db.execAsync('COMMIT;');
      return { success: true };
    } catch (error) {
      console.error('Import backup error:', error);
      throw error;
    }
  },
};
