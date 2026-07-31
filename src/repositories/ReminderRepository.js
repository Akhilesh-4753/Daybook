import { getDB } from '../db/database';

export const ReminderRepository = {
  getAll: async () => {
    const db = await getDB();
    const rows = await db.getAllAsync('SELECT * FROM reminders ORDER BY created_at DESC;');
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      importance: r.importance,
      notes: r.notes,
      date: r.date,
      time: r.time,
      alarmTone: r.alarm_tone,
      repeat: r.repeat_rule,
      priority: r.priority,
      notification: Boolean(r.notification),
      category: r.category,
      notificationId: r.notification_id,
    }));
  },

  add: async (reminder) => {
    const db = await getDB();
    const id = reminder.id || 'r_' + Date.now();
    await db.runAsync(
      `INSERT INTO reminders (id, title, importance, notes, date, time, alarm_tone, repeat_rule, priority, notification, category, notification_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        id,
        reminder.title,
        reminder.importance || '',
        reminder.notes || '',
        reminder.date || new Date().toISOString().split('T')[0],
        reminder.time || '09:00 AM',
        reminder.alarmTone || 'Default',
        reminder.repeat || 'Does not repeat',
        reminder.priority || 'Medium',
        reminder.notification ? 1 : 0,
        reminder.category || 'Personal',
        reminder.notificationId || null,
      ]
    );
    return { ...reminder, id };
  },

  update: async (reminder) => {
    const db = await getDB();
    await db.runAsync(
      `UPDATE reminders SET title = ?, importance = ?, notes = ?, date = ?, time = ?, alarm_tone = ?, repeat_rule = ?, priority = ?, notification = ?, category = ? WHERE id = ?;`,
      [
        reminder.title,
        reminder.importance || '',
        reminder.notes || '',
        reminder.date,
        reminder.time,
        reminder.alarmTone || 'Default',
        reminder.repeat || 'Does not repeat',
        reminder.priority || 'Medium',
        reminder.notification ? 1 : 0,
        reminder.category || 'Personal',
        reminder.id,
      ]
    );
    return reminder;
  },

  updateNotificationId: async (id, notificationId) => {
    const db = await getDB();
    await db.runAsync('UPDATE reminders SET notification_id = ? WHERE id = ?;', [notificationId, id]);
  },

  delete: async (id) => {
    const db = await getDB();
    await db.runAsync('DELETE FROM reminders WHERE id = ?;', [id]);
  },
};
