/**
 * Daybook SQLite Database Schema Definition
 */

export const CREATE_TASKS_TABLE = `
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL,
  time TEXT,
  notes TEXT,
  completed INTEGER NOT NULL DEFAULT 0,
  date TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`;

export const CREATE_REMINDERS_TABLE = `
CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  importance TEXT,
  notes TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  alarm_tone TEXT DEFAULT 'Default',
  repeat_rule TEXT DEFAULT 'Does not repeat',
  priority TEXT DEFAULT 'Medium',
  notification INTEGER DEFAULT 1,
  category TEXT DEFAULT 'Personal',
  notification_id TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`;

export const CREATE_HABITS_TABLE = `
CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  frequency TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  completed_today INTEGER DEFAULT 0,
  auto_add_today INTEGER DEFAULT 1,
  icon TEXT DEFAULT 'sparkles',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`;

export const CREATE_DIARY_TABLE = `
CREATE TABLE IF NOT EXISTS diary_entries (
  id TEXT PRIMARY KEY NOT NULL,
  date TEXT NOT NULL,
  formatted_date TEXT NOT NULL,
  title TEXT NOT NULL,
  mood TEXT NOT NULL DEFAULT 'happy',
  content TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  modified_at TEXT
);
`;

export const CREATE_REPORTS_TABLE = `
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY NOT NULL,
  date TEXT NOT NULL UNIQUE,
  productivity_score INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  total_tasks INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`;
