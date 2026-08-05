import { getDB } from '../db/database';

export const DiaryRepository = {
  getAll: async () => {
    try {
      const db = await getDB();
      const rows = await db.getAllAsync('SELECT * FROM diary_entries ORDER BY created_at DESC;');
      return (rows || []).map((r) => ({
        id: r.id,
        date: r.date,
        formattedDate: r.formatted_date,
        title: r.title,
        mood: r.mood,
        content: r.content,
        createdAt: r.created_at,
        modifiedAt: r.modified_at,
      }));
    } catch (e) {
      return [];
    }
  },

  add: async (entry) => {
    const db = await getDB();
    const id = entry.id || 'd_' + Date.now();
    const nowStr = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO diary_entries (id, date, formatted_date, title, mood, content, created_at, modified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        id,
        entry.date || new Date().toISOString().split('T')[0],
        entry.formattedDate || new Date().toDateString(),
        entry.title,
        entry.mood || 'happy',
        entry.content,
        entry.createdAt || nowStr,
        null,
      ]
    );
    return { ...entry, id, createdAt: entry.createdAt || nowStr, modifiedAt: null };
  },

  delete: async (entryId) => {
    const db = await getDB();
    await db.runAsync('DELETE FROM diary_entries WHERE id = ?;', [entryId]);
  },

  update: async (entry) => {
    try {
      const db = await getDB();
      const modifiedAt = new Date().toISOString();
      await db.runAsync(
        `UPDATE diary_entries SET title = ?, mood = ?, content = ?, modified_at = ? WHERE id = ?;`,
        [entry.title, entry.mood || 'Happy', entry.content, modifiedAt, entry.id]
      );
      return { ...entry, modifiedAt };
    } catch (e) {
      console.log('Diary update error', e);
      return entry;
    }
  },
};
