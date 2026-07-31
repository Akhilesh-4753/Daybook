import { getDB } from '../db/database';

export const DiaryRepository = {
  getAll: async () => {
    const db = await getDB();
    const rows = await db.getAllAsync('SELECT * FROM diary_entries ORDER BY created_at DESC;');
    return rows.map((r) => ({
      id: r.id,
      date: r.date,
      formattedDate: r.formatted_date,
      title: r.title,
      mood: r.mood,
      content: r.content,
    }));
  },

  add: async (entry) => {
    const db = await getDB();
    const id = entry.id || 'd_' + Date.now();
    await db.runAsync(
      `INSERT INTO diary_entries (id, date, formatted_date, title, mood, content) VALUES (?, ?, ?, ?, ?, ?);`,
      [
        id,
        entry.date || new Date().toISOString().split('T')[0],
        entry.formattedDate || new Date().toDateString(),
        entry.title,
        entry.mood || 'happy',
        entry.content,
      ]
    );
    return { ...entry, id };
  },

  delete: async (entryId) => {
    const db = await getDB();
    await db.runAsync('DELETE FROM diary_entries WHERE id = ?;', [entryId]);
  },
};
