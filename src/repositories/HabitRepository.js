import { getDB } from '../db/database';

export const HabitRepository = {
  getAll: async () => {
    const db = await getDB();
    const rows = await db.getAllAsync('SELECT * FROM habits ORDER BY created_at DESC;');
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      frequency: r.frequency,
      progress: r.progress,
      streak: r.streak,
      completedToday: Boolean(r.completed_today),
      autoAddToday: Boolean(r.auto_add_today),
      icon: r.icon,
    }));
  },

  add: async (habit) => {
    const db = await getDB();
    const id = habit.id || 'h_' + Date.now();
    await db.runAsync(
      `INSERT INTO habits (id, title, frequency, progress, streak, completed_today, auto_add_today, icon) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        id,
        habit.title,
        habit.frequency || 'Daily',
        habit.progress || 0,
        habit.streak || 0,
        habit.completedToday ? 1 : 0,
        habit.autoAddToday ? 1 : 0,
        habit.icon || 'sparkles',
      ]
    );
    return { ...habit, id };
  },

  toggle: async (habitId) => {
    const db = await getDB();
    const habit = await db.getFirstAsync('SELECT * FROM habits WHERE id = ?;', [habitId]);
    if (!habit) return;

    const nextState = habit.completed_today === 0;
    const newStreak = nextState ? habit.streak + 1 : Math.max(0, habit.streak - 1);
    const newProgress = nextState ? Math.min(100, habit.progress + 15) : Math.max(0, habit.progress - 15);

    await db.runAsync(
      `UPDATE habits SET completed_today = ?, streak = ?, progress = ? WHERE id = ?;`,
      [nextState ? 1 : 0, newStreak, newProgress, habitId]
    );
  },

  delete: async (habitId) => {
    const db = await getDB();
    await db.runAsync('DELETE FROM habits WHERE id = ?;', [habitId]);
  },
};
