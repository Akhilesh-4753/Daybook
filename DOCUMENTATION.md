# 📓 Daybook — Documentation

Technical architecture, module guide, database schemas, and system workflows for **Daybook** (v1.2.0).

> [!NOTE]
> Daybook is an offline-first productivity, calendar, habit tracking, and journal application built with React Native and Expo SDK 57.

---

## 1. Project Overview

### 1.1 Core Modules

| Module | Technical Implementation |
|---|---|
| **Tasks** | SQLite table CRUD with category tags, priority levels, and daily carryover |
| **Calendar & Reminders** | Scheduled push alerts via `expo-notifications` with daily/weekly/monthly repeat rules |
| **Habits** | Daily streak tracker with progress bars and automated task sync |
| **Diary** | Journal entries with mood tags and `created_at`/`modified_at` timestamp tracking |
| **Reports** | Analytics engine with task completion donut charts and daily progress bar graphs |
| **App Lock & Security** | PIN authentication (SHA-256 via `expo-crypto`) & Biometric authentication (`expo-local-authentication`) |
| **Backup & Restore** | Database export/import sharing using `expo-file-system` and `expo-sharing` |
| **Authentication** | Firebase Auth (Email/Password & Google Sign-In integration) |

### 1.2 Tech Stack

| Component | Library / Tool |
|---|---|
| **Framework** | React Native 0.86.2 + Expo SDK 57 |
| **Navigation** | Expo Router (File-based navigation) |
| **Database** | SQLite via `expo-sqlite` |
| **Key-Value Store** | `@react-native-async-storage/async-storage` |
| **Notifications** | `expo-notifications` |
| **Authentication** | Firebase Auth (`firebase/auth`) |
| **Security** | `expo-crypto` & `expo-local-authentication` |

---

## 2. Architecture & Data Flow

Daybook follows a strict **Layered Architecture**:

```
[ Screen Components (UI) ]
            │
            ▼
[ State Context (TaskContext / AuthContext) ]
            │
            ▼
[ Repository Layer (TaskRepository / ReminderRepository) ]
            │
            ▼
[ SQLite Engine (database.js) ]
```

- **Screens**: Render UI components, manage local form state, and dispatch actions.
- **Context**: Maintains global state (`tasks`, `reminders`, `habits`, `diaryEntries`), handles reactivity, and runs background logic (auto-rescheduling, daily resets).
- **Repositories**: Encapsulate SQL queries (`SELECT`, `INSERT`, `UPDATE`, `DELETE`).
- **Services**: Handle side effects (Firebase Auth, Notification scheduling, Backup export/import).

---

## 3. Directory Structure

```
Daybook/
├── app/
│   ├── _layout.tsx      # Root provider wrapper & lock screen gate
│   └── index.tsx        # Main tab container & gesture handler
├── src/
│   ├── components/      # UI components & dialog modals
│   ├── context/         # TaskContext & AuthContext state providers
│   ├── db/              # SQLite database initialization & table schemas
│   ├── repositories/   # Data access repositories
│   ├── screens/         # Page views (Today, Calendar, Diary, Habits, Reports, More)
│   ├── services/        # Firebase, Security, Notification & Backup services
│   ├── theme/           # Light & Dark color tokens and ThemeContext
│   └── utils/           # Text formatting & utility functions
└── assets/              # App launcher icons & empty state illustrations
```

---

## 4. Key Systems & Modules

### 4.1 Database (SQLite)
Stored locally in `daybook.db`. Schema consists of 4 main tables:
- `tasks`: `(id, title, category, priority, time, notes, completed, date, is_overdue, habit_id)`
- `reminders`: `(id, title, importance, notes, date, time, alarm_tone, repeat_rule, priority, notification, category, notification_id)`
- `habits`: `(id, title, frequency, progress, streak, completed_today, auto_add_today, icon)`
- `diary_entries`: `(id, title, text, date, time, mood, created_at, modified_at)`

### 4.2 Notification Engine (`NotificationService.js`)
- Schedules local push notifications using Expo SDK 57 `SchedulableTriggerInputTypes` (`TIME_INTERVAL`, `DAILY`, `WEEKLY`, `CALENDAR`).
- **Android Rescheduling**: Background listener in `TaskContext.js` (`loadAllData`) automatically recalculates expired monthly/yearly Android reminders on launch and schedules their next single future occurrence.
- **Duplicate Time Protection**: Modal validation prevents booking two reminders or tasks for the exact same timestamp.

### 4.3 Reports & Analytics Engine (`ReportsScreen.js`)
- **Filter Ranges**:
  - `Today`: Filters tasks and reminders matching today (`todayStr`).
  - `This Week`: Filters items from Monday to Sunday of the current week (`monStr..sunStr`).
  - `This Month`: Filters all items for the entire current month (`startsWith('YYYY-MM')`).
  - `Custom Date`: Displays an under-development modal with a single OK button.
- **Scores**: Productivity score returns `0%` when task count is 0; Habits rate strictly evaluates active habits in the filter period.

### 4.4 App Lock & Privacy (`SecurityService.js`)
- PIN hashing using SHA-256 (`expo-crypto`).
- Hardware biometrics (Fingerprint / Face ID) via `expo-local-authentication`.
- App launch lock overlay rendered in `app/_layout.tsx`.

---

## 5. Development & Build Instructions

### 5.1 Local Execution
```bash
# Start development server
npx expo start

# Run on Android emulator / device
npx expo run:android

# Run project health checks
npx expo-doctor
```

---

*Daybook v1.2.0 Documentation — Managed Expo SDK 57 / React Native 0.86.2*
