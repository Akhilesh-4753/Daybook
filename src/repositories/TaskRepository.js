import { getDB } from '../db/database';

export const TaskRepository = {
  getAll: async () => {
    try {
      const db = await getDB();
      const rows = await db.getAllAsync('SELECT * FROM tasks ORDER BY created_at DESC;');
      return (rows || []).map((r) => ({
        id: r.id,
        title: r.title,
        category: r.category,
        priority: r.priority,
        time: r.time,
        notes: r.notes,
        completed: Boolean(r.completed),
        date: r.date,
      }));
    } catch (e) {
      return [];
    }
  },

  add: async (task) => {
    const db = await getDB();
    const id = task.id || 't_' + Date.now();
    await db.runAsync(
      `INSERT INTO tasks (id, title, category, priority, time, notes, completed, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        id,
        task.title,
        task.category || 'General',
        task.priority || 'Medium',
        task.time || '',
        task.notes || '',
        task.completed ? 1 : 0,
        task.date || new Date().toISOString().split('T')[0],
      ]
    );
    return { ...task, id };
  },

  toggleCompletion: async (taskId, forceState = null) => {
    const db = await getDB();
    if (forceState !== null) {
      await db.runAsync(`UPDATE tasks SET completed = ? WHERE id = ?;`, [forceState ? 1 : 0, taskId]);
    } else {
      await db.runAsync(`UPDATE tasks SET completed = CASE WHEN completed = 1 THEN 0 ELSE 1 END WHERE id = ?;`, [taskId]);
    }
  },

  delete: async (taskId) => {
    const db = await getDB();
    await db.runAsync('DELETE FROM tasks WHERE id = ?;', [taskId]);
  },
};
