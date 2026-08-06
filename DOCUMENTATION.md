# 📓 Daybook — Complete Project Documentation

> **Intended audience:** A beginner React Native developer who has just finished learning React Native and wants to understand every piece of this project without asking questions.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Folder Structure](#2-folder-structure)
3. [Root-Level Files Explained](#3-root-level-files-explained)
4. [The `app/` Directory (Entry Point & Layout)](#4-the-app-directory)
5. [The `src/` Directory (All Application Code)](#5-the-src-directory)
   - [5.1 `components/`](#51-components)
   - [5.2 `screens/`](#52-screens)
   - [5.3 `context/`](#53-context)
   - [5.4 `db/`](#54-db-database)
   - [5.5 `repositories/`](#55-repositories)
   - [5.6 `services/`](#56-services)
   - [5.7 `theme/`](#57-theme)
   - [5.8 `utils/`](#58-utils)
   - [5.9 `navigation/`](#59-navigation)
6. [The `assets/` Directory](#6-the-assets-directory)
7. [Data Flow & Architecture](#7-data-flow--architecture)
8. [Authentication System](#8-authentication-system)
9. [Security & App Lock System](#9-security--app-lock-system)
10. [Database System (SQLite)](#10-database-system-sqlite)
11. [Notification System](#11-notification-system)
12. [Theme System (Light / Dark Mode)](#12-theme-system-light--dark-mode)
13. [Backup & Restore System](#13-backup--restore-system)
14. [Build & Deployment Guide](#14-build--deployment-guide)
15. [Key Libraries & Why We Use Them](#15-key-libraries--why-we-use-them)
16. [Common Developer Tasks](#16-common-developer-tasks)
17. [Frequently Asked Questions](#17-frequently-asked-questions)
18. [Recent Updates & Architectural Enhancements](#18-recent-updates--architectural-enhancements)

---

## 1. Project Overview

### What is Daybook?

**Daybook** is a personal productivity and diary app built with React Native and Expo. It runs on both **Android** and **iOS** from a single shared codebase. The app is designed to help users organise their day, track habits, set reminders, and write a private diary — all stored securely on the device.

### Main Features

| Feature | Description |
|---|---|
| Tasks | Create, complete, and delete daily tasks with priorities and categories |
| Calendar & Reminders | Add timed reminders that fire push notifications |
| Habits | Daily habit tracker that can auto-create tasks from habits |
| Diary | Private journal with mood tracking and rich text entries |
| Reports | Visual productivity score and charts across your data |
| Settings (More) | Profile photo, app lock PIN, biometric authentication, theme toggle, backup & restore |
| App Lock | Optional PIN or fingerprint/face ID gate on startup |
| Firebase Auth | Sign up / Login with email + password via Firebase |
| Offline First | All data is stored locally in SQLite — internet is optional |

### Technologies Used

| Technology | Purpose |
|---|---|
| React Native 0.86 | Cross-platform mobile UI |
| Expo SDK 57 | Native modules, build tools, managed workflow |
| Expo Router | File-based navigation (like Next.js, but for mobile) |
| SQLite (expo-sqlite) | On-device relational database |
| Firebase Auth + Firestore | Cloud authentication and optional user data sync |
| AsyncStorage | Small key-value storage (theme, session, PIN) |
| expo-notifications | Local push notifications for reminders |
| expo-local-authentication | Fingerprint / Face ID app lock |
| expo-crypto | SHA-256 PIN hashing |
| expo-image-picker | Profile photo selection from camera/gallery |
| expo-file-system | File operations for backup export |
| expo-sharing | Share backup file to other apps |
| EAS Build | Cloud build service for APK / IPA generation |

### Project Architecture

Daybook uses a **layered architecture**:

```
Screen (UI)
    |
    v  reads/writes via
Context (Global State)
    |
    v  calls
Repository (Data Access)
    |
    v  reads/writes via
Database (SQLite)
```

And separately:
```
Services (business logic: Firebase, Security, Notifications, Backup)
    ^
    |  called by Contexts and Screens
```

---

## 2. Folder Structure

```
Daybook/
|-- app/                        <- Expo Router entry point & root layout
|   |-- _layout.tsx             <- Wraps entire app in global Providers
|   +-- index.tsx               <- Main app shell (tab navigation + all screens)
|
|-- src/                        <- All application source code
|   |-- components/             <- Reusable UI building blocks
|   |-- screens/                <- Full page screens
|   |-- context/                <- Global React state (Auth, Security, Tasks)
|   |-- db/                     <- SQLite database connection & schema
|   |-- repositories/           <- Database query functions per table
|   |-- services/               <- External integrations (Firebase, Notifications, etc.)
|   |-- theme/                  <- Color palette, typography, dark/light mode
|   |-- utils/                  <- Generic helper functions
|   +-- navigation/             <- (Reserved for future navigation helpers)
|
|-- assets/                     <- Static files (images, icons, sounds)
|   |-- images/                 <- App icon, splash screen, illustrations
|   |-- sounds/                 <- Notification sound files
|   +-- expo.icon/              <- iOS icon folder
|
|-- android/                    <- Native Android project (auto-generated by Expo prebuild)
|-- app.json                    <- Expo app configuration
|-- eas.json                    <- EAS Build profiles (development, preview, production)
|-- package.json                <- Project dependencies and npm scripts
|-- tsconfig.json               <- TypeScript compiler configuration
|-- metro.config.js             <- Metro bundler configuration
|-- eslint.config.js            <- ESLint rules
|-- google-services.json        <- Firebase Android config (keep secret, do not share)
+-- expo-env.d.ts               <- TypeScript type declarations for Expo Router
```

---

## 3. Root-Level Files Explained

### `app.json`

The master configuration file for your Expo app. Every important setting is here.

```json
{
  "expo": {
    "name": "Daybook",
    "slug": "Daybook",
    "version": "1.0.0",
    "icon": "./assets/images/icon.png",
    "scheme": "daybook",
    "userInterfaceStyle": "automatic",
    "android": {
      "package": "com.akhilesh.daybook",
      "permissions": ["..."]
    },
    "plugins": ["..."]
  }
}
```

- `name` — The display name shown under the app icon on the phone home screen
- `slug` — Internal identifier used on expo.dev
- `version` — The version string shown in the app store
- `scheme` — Deep link URL prefix (e.g., `daybook://`)
- `userInterfaceStyle: "automatic"` — Follows the device light/dark setting
- `android.package` — The unique Android application ID (e.g., `com.akhilesh.daybook`)
- `plugins` — List of Expo native plugins that automatically modify `AndroidManifest.xml`

> **Rule:** Every Expo native module you add to `package.json` that needs to modify `AndroidManifest.xml` or `Info.plist` **must also be listed in `plugins`** inside `app.json`.

---

### `eas.json`

Controls how EAS Build creates different versions (APK/IPA) of the app.

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "developmentClient": false,
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "developmentClient": false,
      "android": { "buildType": "apk" }
    }
  }
}
```

| Profile | Use Case | Share With |
|---|---|---|
| `development` | Cable/Wi-Fi live testing during coding. Requires Metro server running | Only yourself |
| `preview` | Standalone APK for testing. Works WITHOUT Metro server | Testers / clients |
| `production` | Final release for Google Play Store submission | Everyone |

---

### `package.json`

Lists all libraries the project depends on and the npm scripts.

**Important scripts:**
```bash
npm start          # Start Metro bundler (for Expo Go or Dev Client)
npm run android    # Run on connected Android device/emulator directly
npm run ios        # Run on iOS simulator (Mac only)
npm run lint       # Check code for errors using ESLint
```

---

### `google-services.json`

Downloaded from the Firebase console. Contains API keys and identifiers so the Android app can connect to your Firebase project.

> **WARNING: Never commit this file to a public GitHub repository.** It contains your Firebase project credentials.

---

### `metro.config.js`

Configuration for Metro, the JavaScript bundler that converts your JS/JSX code into a bundle that React Native can run. You rarely need to edit this unless you are adding custom file transformations.

---

### `tsconfig.json`

TypeScript configuration. Set to strict mode to catch type errors during development. The project uses TypeScript only in the `app/` folder (`.tsx` files). The `src/` folder uses plain JavaScript.

---

## 4. The `app/` Directory

Expo Router uses **file-based routing**, similar to how Next.js works. Every file inside `app/` becomes a route. Currently there are only two files.

### `app/_layout.tsx`

This is the **root layout**. It is the very first component that renders when the app opens. Its only job is to wrap the entire app in all the global **Context Providers**, so every screen and component can access global state.

```tsx
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SecurityProvider>    {/* App lock state */}
        <AuthProvider>      {/* Login/logout state */}
          <TaskProvider>    {/* Tasks, habits, reminders, diary state */}
            <ThemeProvider> {/* Light/dark mode */}
              <Slot />      {/* Renders the current route's content */}
            </ThemeProvider>
          </TaskProvider>
        </AuthProvider>
      </SecurityProvider>
    </SafeAreaProvider>
  );
}
```

Think of this like an **onion** — each Provider layer wraps everything inside it, and any component anywhere inside can "reach up" and read or change that layer's state using a `useContext` hook.

---

### `app/index.tsx`

This is the **main app shell** — the only route in the app. It is a large file that acts as a controller for the entire user experience.

**What it renders depends on the current state:**

```
isLocked = true
    --> Show SecurityLockModal (PIN / biometric screen)

isLocked = false AND isAuthenticated = false
    --> Show Auth/Login/Signup screen

isLocked = false AND isAuthenticated = true
    --> Show the main tab interface
         - TodayScreen (Home tab)
         - CalendarScreen (Calendar tab)
         - DiaryScreen (Diary tab)
         - HabitsScreen (Habits tab)
         - ReportsScreen (Reports tab)
         - MoreScreen (Settings tab)
```

It also hosts the **global modals** that can be triggered from any screen:
- `AddTaskModal`
- `AddReminderModal`
- `AddHabitModal`

These modals are placed here at the root level so they appear over any screen.

---

## 5. The `src/` Directory

All application code lives here, separated by purpose.

---

### 5.1 `components/`

Reusable UI pieces that are used across multiple screens. Think of these as the "LEGO bricks" of the UI.

**Rule for creating new files here:** If you use the same UI pattern in 2 or more screens, extract it into a component here. If it is only used in one screen, keep it in that screen file.

| File | What It Does |
|---|---|
| `AddHabitModal.js` | Full-screen modal form to add a new habit with icon picker, category, frequency, and time |
| `AddReminderModal.js` | Full-screen modal form to add a reminder with date picker, time input, repeat rules, and notification toggle |
| `AddTaskModal.js` | Full-screen modal form to add a task with title, category, priority, date, time, and notes |
| `BottomNavigation.js` | The bottom tab bar with 5 tab icons (Home, Calendar, Diary, Habits, Reports, More). Controls which screen is active |
| `Charts.js` | Draws bar charts and progress rings for the Reports screen using pure React Native Views. No third-party chart library is needed |
| `CompletionModal.js` | The animated success modal shown when a task is completed, deleted, or settings are saved. Custom-designed — NOT the system `Alert` |
| `DeleteConfirmModal.js` | The confirmation modal shown before permanently deleting something. Custom-designed — NOT the system `Alert` |
| `HabitCard.js` | Displays a single habit row with a progress bar, streak counter, and a complete/incomplete toggle button |
| `Header.js` | The top header bar with the Daybook logo, a greeting message, today's date, and a notification bell |
| `Icons.js` | A custom icon system. Uses emoji characters for most icons, and custom drawn React Native Views for special icons like the calendar and user avatar. Avoids needing an icon font library |
| `ProgressCard.js` | A summary card showing the productivity score and the ratio of completed vs total tasks |
| `SecurityLockModal.js` | The full-screen PIN entry pad or biometric prompt shown when the app is locked on startup |
| `TaskCard.js` | Displays a single task row with its priority colour badge, category tag, time, notes preview, and a completion checkbox |
| `TimePickerInput.js` | A styled text input that auto-formats time as HH:MM AM/PM and adds a leading zero if only one digit is entered on focus-out |

---

### 5.2 `screens/`

Full page views that are swapped in and out by the tab navigation in `app/index.tsx`.

| File | Tab | What the User Sees |
|---|---|---|
| `TodayScreen.js` | Home | Today's task list, a productivity progress card, the floating add task button |
| `CalendarScreen.js` | Calendar | Month calendar grid, the reminders list for the selected date, add reminder button |
| `DiaryScreen.js` | Diary | List of diary entries, mood filter, write/edit/delete diary entries |
| `HabitsScreen.js` | Habits | List of habits with progress bars and streak counts, add/toggle/delete habits |
| `ReportsScreen.js` | Reports | Productivity score over time, weekly bar charts for tasks and habits |
| `MoreScreen.js` | More (Settings) | Profile photo upload, user name, logout button, app lock PIN setup, backup/restore, dark mode toggle, app version info |
| `LoginScreen.js` | — | Email and password login form. Shown when the user is not logged in |
| `SignupScreen.js` | — | Registration form (name, email, password). Shown when signing up |
| `AuthScreen.js` | — | The welcome/landing screen that lets the user choose Login or Sign Up |

> **Note:** `LoginScreen`, `SignupScreen`, and `AuthScreen` are not actual navigation tabs. They are conditionally rendered in place of the tab interface when `isAuthenticated = false`.

---

### 5.3 `context/`

React Context provides **global state** — data that many different screens need to read and modify. Without Context, you would need to pass data down as props through every layer of components ("prop drilling"), which becomes unmanageable.

#### `AuthContext.js`

Manages who is currently logged in.

**State it provides to every component:**
- `user` — Object with `{ name, email, uid, photoUri, productivityScore, streak }`
- `isAuthenticated` — `true` if someone is logged in
- `loading` — `true` while checking for a saved session on startup

**Functions it provides:**
- `login(email, password)` — Calls `loginUser()` from Firebase service, saves session to AsyncStorage
- `signup(name, email, password)` — Calls `signUpUser()` from Firebase service, saves session
- `logout()` — Signs out of Firebase, clears session from AsyncStorage
- `updateUserProfile(name, photoUri)` — Updates display name and profile photo
- `setUser(userData)` — Directly updates user state (used during profile editing)

**How to use in any screen or component:**
```js
import { useAuth } from '../context/AuthContext';

const { user, isAuthenticated, login, logout } = useAuth();
```

---

#### `TaskContext.js`

The largest context in the app. Manages all four types of user-created data: tasks, reminders, habits, and diary entries.

**State it holds:**
- `tasks` — Array of task objects
- `reminders` — Array of reminder objects
- `habits` — Array of habit objects
- `diaryEntries` — Array of diary entry objects
- `loading` — `true` while data is being loaded from the database

**Key logic inside `TaskContext`:**

**`loadAllData()`** — Called automatically when the app starts. Fetches all rows from every SQLite table, then runs `syncDailyHabitsToTasks()`.

**`syncDailyHabitsToTasks(currentTasks, currentHabits)`** — This is the intelligent habit-to-task sync system. It loops through every habit. If a habit has `autoAddToday = true`, it checks if a task for that habit already exists today. If not, it auto-creates one. If the user later turns `autoAddToday = false` on a habit, the auto-created task is deleted.

**Functions it provides (examples):**
```js
addTask(task)
toggleTaskCompletion(taskId)
deleteTask(taskId)
addReminder(reminder)
deleteReminder(reminderId)
addHabit(habit)
toggleHabitCompletion(habitId)
addDiaryEntry(entry)
deleteDiaryEntry(entryId)
```

**How to use:**
```js
import { useTaskContext } from '../context/TaskContext';

const { tasks, addTask, deleteTask } = useTaskContext();
```

---

#### `SecurityContext.js`

Manages the app lock state.

**State it provides:**
- `isLocked` — `true` means the PIN screen is being shown
- `isPinSet` — `true` if the user has configured a PIN
- `isBiometricsEnabled` — `true` if the user opted into fingerprint/face ID
- `isBiometricsSupported` — `true` if the current device has biometric hardware
- `loading` — `true` while reading security config from AsyncStorage

**Functions it provides:**
- `unlockWithPin(pin)` — Verifies the PIN hash. If correct, sets `isLocked = false`
- `unlockWithBiometrics()` — Shows the OS biometric prompt. If successful, sets `isLocked = false`
- `setupPin(pin, enableBiometrics)` — Hashes and saves the new PIN, updates state
- `removeSecurity()` — Clears PIN from storage, sets `isPinSet = false`
- `lockApp()` — Manually re-locks the app (called after logout)

**How to use:**
```js
import { useSecurity } from '../context/SecurityContext';

const { isLocked, unlockWithPin } = useSecurity();
```

---

### 5.4 `db/` (Database)

#### `schema.js`

Defines the **SQL table structure** (the columns and types) for each data type. Uses `CREATE TABLE IF NOT EXISTS` so it can be run safely on every startup without error.

**Tables:**

| Table Name | Key Columns |
|---|---|
| `tasks` | `id` (TEXT), `title`, `category`, `priority`, `time`, `notes`, `completed` (0/1), `date` |
| `reminders` | `id`, `title`, `importance`, `notes`, `date`, `time`, `alarm_tone`, `repeat_rule`, `priority`, `notification` (0/1), `category`, `notification_id` |
| `habits` | `id`, `title`, `frequency`, `progress`, `streak`, `completed_today` (0/1), `auto_add_today` (0/1), `icon` |
| `diary_entries` | `id`, `date`, `formatted_date`, `title`, `mood`, `content` |
| `reports` | `id`, `date` (UNIQUE), `productivity_score`, `tasks_completed`, `total_tasks` |

**Note on SQLite booleans:** SQLite does not have a `BOOLEAN` type. The app stores boolean values as integers — `1` for `true` and `0` for `false`. The Repository layer handles converting these to JavaScript booleans.

---

#### `database.js`

Opens the SQLite database and provides the global `db` instance.

**Key functions:**

```js
getDB()
// Returns the database instance.
// If it has already been opened, returns the same instance (Singleton pattern).
// If expo-sqlite is unavailable (on web), returns an in-memory fallback database.

initDatabase()
// Creates all tables by running each CREATE TABLE statement from schema.js.
// Then calls seedInitialDataIfEmpty() to add starter data for new installs.

seedInitialDataIfEmpty(db)
// Checks if each table has zero rows.
// If a table is empty, inserts the default starter data from storage.js
// (e.g., 5 default habits like "Gym Workout" and "Drink Water").
```

**The Singleton Pattern:**
```js
let dbInstance = null;

export const getDB = async () => {
  if (dbInstance) return dbInstance;  // Return cached instance
  dbInstance = await SQLite.openDatabaseAsync('daybook_v2.db');
  return dbInstance;
};
```

This ensures the database file is only opened once per app session, no matter how many times `getDB()` is called.

**The Web Fallback:**
If running on web (`Platform.OS === 'web'`), SQLite is not available. The code creates a JavaScript object called `createFallbackDB()` that mimics the exact same API (`getAllAsync`, `runAsync`, `execAsync`) but stores data in plain arrays in memory. Data is lost on page refresh.

---

### 5.5 `repositories/`

Each file is a **Repository** — a collection of database access functions for one specific table. Repositories are the **only** place that write raw SQL queries. No screen or context should ever write SQL directly.

**Why separate repositories from contexts?**
If you ever switch from SQLite to a different database, or change a table's column names, you only need to update the repository. The screens and contexts remain unchanged.

#### `TaskRepository.js`

```js
TaskRepository.getAll()
// SELECT * FROM tasks ORDER BY created_at DESC
// Returns an array of task objects with completed converted to Boolean

TaskRepository.add(task)
// INSERT INTO tasks (id, title, category, priority, time, notes, completed, date)
// Generates a unique ID if none provided (t_1234567890)
// Returns the saved task object with its ID

TaskRepository.toggleCompletion(taskId, forceState)
// UPDATE tasks SET completed = 1/0 WHERE id = ?
// If forceState is provided, sets to that value. Otherwise flips current value.

TaskRepository.delete(taskId)
// DELETE FROM tasks WHERE id = ?
```

#### `ReminderRepository.js`

```js
ReminderRepository.getAll()
// Fetches all reminders, maps columns to JavaScript-friendly names
// e.g., alarm_tone -> alarmTone, repeat_rule -> repeat

ReminderRepository.add(reminder)
// Inserts a new reminder row. Also calls NotificationService.scheduleReminder()
// and saves the returned notificationId.

ReminderRepository.updateNotificationId(reminderId, notifId)
// UPDATE reminders SET notification_id = ? WHERE id = ?
// Called after scheduling a notification to save its ID for later cancellation

ReminderRepository.delete(reminderId)
// Cancels the associated notification, then deletes the row
```

#### `HabitRepository.js`

```js
HabitRepository.getAll()
HabitRepository.add(habit)
HabitRepository.updateProgress(id, progress, streak, completedToday)
HabitRepository.delete(habitId)
```

#### `DiaryRepository.js`

```js
DiaryRepository.getAll()
DiaryRepository.add(entry)
DiaryRepository.delete(entryId)
```

---

### 5.6 `services/`

Services contain **business logic and integrations with external systems**. They are plain JavaScript objects, not React components. They do not hold state — they perform actions and return results.

---

#### `firebase.js`

Connects to Firebase for authentication and optional cloud data sync.

**Auto-detection:**
The file checks if the Firebase package is installed and the `apiKey` field is not a placeholder:
```js
export const isFirebaseConfigured =
  firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY" && !!initializeApp;
```

**Demo Mode (when `isFirebaseConfigured = false`):**
All functions return a fake user object with a unique generated ID. All local features (tasks, habits, diary, reminders) still work perfectly. This is useful for testing without a real Firebase project.

**Exported functions:**

```js
signUpUser(name, email, password)
// Creates a new Firebase account
// In Demo Mode: returns { user: { uid: 'demo_123', displayName: name, email }, isDemo: true }

loginUser(email, password)
// Signs in to an existing Firebase account
// In Demo Mode: accepts any email/password, returns fake user

logoutUser()
// Signs out of Firebase Auth

resetUserPassword(email)
// Sends a password reset email via Firebase

subscribeToAuthChanges(callback)
// Listens to Firebase auth state changes (called in AuthContext useEffect)
// Returns an unsubscribe function to clean up the listener

syncUserDataToCloud(userId, data)
// Saves user metadata to Firestore (users/{userId} document)
```

---

#### `SecurityService.js`

All security-related operations. Never handles UI — only logic.

```js
SecurityService.checkBiometricsSupport()
// Checks if the device has fingerprint or face recognition hardware AND enrolled credentials
// Returns: Boolean

SecurityService.authenticateBiometrics(promptMessage)
// Shows the OS-native biometric prompt dialog
// Returns: Boolean (true = authenticated successfully)

SecurityService.hashPin(pin)
// Creates a SHA-256 hash of the PIN with a salt prefix: "DAYBOOK_SALT_1234"
// Uses expo-crypto. Falls back to a simple string prefix if crypto unavailable.
// Returns: hash string like "a7b3c9d2e1..."

SecurityService.verifyPin(inputPin)
// Hashes the entered PIN and compares with the stored hash
// Returns: Boolean (true = PIN is correct)

SecurityService.setPin(newPin, enableBiometrics)
// Hashes the new PIN and saves { pinHash, isPinEnabled: true, isBiometricsEnabled } to AsyncStorage

SecurityService.disableSecurity()
// Saves { pinHash: null, isPinEnabled: false, isBiometricsEnabled: false } to AsyncStorage
```

**Why is the PIN hashed?**
The raw PIN (e.g., `1234`) is never stored anywhere. `expo-crypto` converts it to a SHA-256 hash (e.g., `a7b3c9...`). Even if someone reads the device's AsyncStorage directly, they only see a long hash string — they cannot reverse it back to the original PIN.

---

#### `NotificationService.js`

Manages all local push notifications for reminder alerts.

```js
initNotificationHandler()
// MUST be called once at app startup (in app/index.tsx).
// Tells the OS how to display notifications when the app is in the foreground:
// - Show as a banner alert
// - Play the notification sound
// - Update the badge count

NotificationService.setupAndroidChannel()
// Creates the Android notification channel "daybook_alarms" with:
// - MAX importance (heads-up notification)
// - Custom vibration pattern
// - Lock screen visibility PUBLIC

NotificationService.requestPermissions()
// Shows the system permission dialog asking the user to allow notifications
// Returns: Boolean (true = permission granted)

NotificationService.scheduleReminder(reminder)
// Parses reminder.date and reminder.time into a JavaScript Date object
// Calls Notifications.scheduleNotificationAsync() with that date as the trigger
// Returns: the notificationId string (saved to database for later cancellation)

NotificationService.cancelReminder(notificationId)
// Cancels a specific pending notification by its ID

NotificationService.cancelAllReminders()
// Cancels all pending notifications from this app
```

**How time parsing works in `scheduleReminder`:**
```
Input: date = "2026-08-15", time = "09:30 PM"
Step 1: Split date into [2026, 8, 15]
Step 2: Strip "PM" from time -> "09:30" -> [9, 30]
Step 3: It's PM and hours < 12, so hours += 12 -> hours = 21
Result: new Date(2026, 7, 15, 21, 30, 0)  // August 15 at 9:30 PM
```

---

#### `PreferencesService.js`

Stores small user preferences using `AsyncStorage` (a key-value store, like `localStorage` on the web).

**Storage Keys:**

| Key | Type | What Is Stored |
|---|---|---|
| `@daybook_theme` | String | `'light'` or `'dark'` |
| `@daybook_user_session` | JSON string | The logged-in user object |
| `@daybook_pin_security` | JSON string | `{ pinHash, isPinEnabled, isBiometricsEnabled }` |

```js
PreferencesService.getTheme()         // Returns 'light' or 'dark'
PreferencesService.saveTheme('dark')

PreferencesService.getSession()       // Returns user object or null
PreferencesService.saveSession(user)
PreferencesService.clearSession()

PreferencesService.saveProfilePhoto(uri)
// On mobile: Copies the photo from its temporary URI to the app's permanent documents folder
// Returns the permanent file path that survives app restarts

PreferencesService.getSecurityConfig()
PreferencesService.saveSecurityConfig(config)
```

---

#### `BackupService.js`

Exports and imports all app data as a `.json` file.

```js
BackupService.exportBackup()
// 1. Calls getDB().getAllAsync() on every table (tasks, reminders, habits, diary_entries, reports)
// 2. Creates a backup object: { version: '1.0.0', exportedAt: '...', tasks: [...], ... }
// 3. Writes it as JSON to: {documentDirectory}/daybook_backup.json
// 4. Opens the OS share sheet (WhatsApp, email, Files, etc.)
// Returns: { success: true, fileUri: '...' }

BackupService.importBackup(jsonContent)
// 1. Parses the JSON string
// 2. Validates it has 'tasks' and 'habits' keys
// 3. Opens a database transaction
// 4. Deletes all rows from all tables (DELETE FROM tasks; ...)
// 5. Re-inserts all rows from the backup JSON
// 6. Commits the transaction
```

---

#### `storage.js`

Contains the **initial seed data** that is inserted into a fresh install's database and a legacy `StorageService` that wraps AsyncStorage.

**Seed data defined here:**
- `initialHabits` — 5 default habits (Gym Workout, Drink Water, Walking, Meditation, No Sugar)
- `initialTasks` — Empty array (new users start with no tasks)
- `initialReminders` — Empty array
- `initialDiaryEntries` — Empty array

This file is imported by `database.js` and used in the `seedInitialDataIfEmpty` function.

---

### 5.7 `theme/`

#### `theme.js`

Defines two complete design systems: `lightTheme` and `darkTheme`. Every color, font size, spacing value, and border radius used anywhere in the app comes from here.

**Structure:**
```js
export const lightTheme = {
  mode: 'light',
  colors: {
    background: '#F8FAFC',   // Page background
    card: '#FFFFFF',          // Card/panel background
    primary: '#6366F1',       // Main brand color (indigo)
    textPrimary: '#0F172A',   // Main text color
    danger: '#EF4444',        // Delete / error color
    success: '#10B981',       // Completed / positive color
    // ... more colors
  },
  typography: {
    h1: 28,     // Font size in dp
    h2: 22,
    body: 15,
    caption: 13,
  },
  spacing: {
    xs: 4,    // 4dp
    sm: 8,    // 8dp
    md: 16,   // 16dp
    lg: 24,   // 24dp
    xl: 32,   // 32dp
  },
  borderRadius: {
    sm: 8,
    md: 14,
    lg: 20,
    full: 9999,  // Fully round (pill shape)
  }
};
```

**How to use in a component:**
```js
const { theme } = useTheme();

// In StyleSheet or inline style:
style={{ backgroundColor: theme.colors.card }}
style={{ color: theme.colors.textPrimary }}
style={{ padding: theme.spacing.md }}
style={{ borderRadius: theme.borderRadius.md }}
```

---

#### `ThemeContext.js`

A React Context that:
1. Reads the saved theme preference from AsyncStorage on app startup
2. Provides `theme` (the full color/typography/spacing object), `isDarkMode`, and `toggleTheme()` to every component
3. Saves the new preference to AsyncStorage when the user toggles dark mode

**How to use:**
```js
import { useTheme } from '../theme/ThemeContext';

const { theme, isDarkMode, toggleTheme } = useTheme();
```

---

### 5.8 `utils/`

#### `textUtils.js`

Contains one helper function for formatting multi-line notes text.

```js
formatMultiLineText(rawText, bullet = '•')
```

**Examples:**
- Input: `"Single line"` → Output: `"Single line"` (unchanged)
- Input: `"exercise\ndiet\nwater"` → Output: `"• exercise\n• diet\n• water"`

Used to display notes and diary content with neat bullet points when there are multiple lines.

---

### 5.9 `navigation/`

This folder is currently **empty**. It is reserved for future navigation helper files if the routing logic grows more complex. Expo Router currently handles all navigation automatically based on the file structure.

---

## 6. The `assets/` Directory

Static files that are bundled into the app at build time.

### `assets/images/`

| File | Used For |
|---|---|
| `icon.png` | Main app icon (1024×1024 PNG, required by both Android and iOS) |
| `splash-icon.png` | Small centered icon displayed on the loading splash screen |
| `daybook-logo.png` | Larger logo image for the splash screen |
| `android-icon-foreground.png` | Foreground layer of the Android adaptive icon (the icon drawing itself) |
| `android-icon-background.png` | Background layer of the Android adaptive icon (the colored background) |
| `android-icon-monochrome.png` | Monochrome version for Android 13+ themed icons (system-colored icon) |
| `empty_state_illustration.png` | Illustration shown when a list is empty (light mode version) |
| `empty_state_illustration_dark.png` | Same illustration for dark mode |
| `favicon.png` | The icon shown in the browser tab when running as a web app |
| `builder.png` | A developer portrait/branding image shown in the More (Settings) screen |

### `assets/sounds/`

Notification sound files for custom alarm tones. Referenced by name when scheduling a reminder with a non-default tone.

### `assets/expo.icon/`

iOS requires a special icon set format. This folder contains the iOS-specific icon files required for App Store submission.

---

## 7. Data Flow & Architecture

### Step-by-Step: Adding a New Task

```
1. User taps the "+" floating button on TodayScreen
      |
      v
2. TodayScreen calls openAddTaskModal() which was passed as a prop from app/index.tsx
      |
      v
3. app/index.tsx sets showAddTaskModal = true, which renders <AddTaskModal>
      |
      v
4. AddTaskModal appears. User types title "Buy groceries", picks category "Personal", priority "High"
      |
      v
5. User taps "Save"
      |
      v
6. AddTaskModal calls addTask(taskData) from TaskContext (via useTaskContext hook)
      |
      v
7. TaskContext.addTask() calls TaskRepository.add(taskData)
      |
      v
8. TaskRepository.add() runs this SQL:
   INSERT INTO tasks (id, title, category, priority, time, notes, completed, date)
   VALUES ('t_1722764400', 'Buy groceries', 'Personal', 'High', '', '', 0, '2026-08-04')
      |
      v
9. TaskRepository returns the saved task object back up to TaskContext
      |
      v
10. TaskContext updates its tasks state: setTasks(prev => [newTask, ...prev])
      |
      v
11. TodayScreen automatically re-renders (it reads tasks from TaskContext)
      |
      v
12. "Buy groceries" card appears at the top of the task list
```

### Context Provider Nesting Order

The order of providers in `_layout.tsx` matters. Providers higher up can be accessed by providers below them:

```
SecurityProvider (no dependencies)
  └── AuthProvider (no dependencies)
        └── TaskProvider (no dependencies — loads data from DB)
              └── ThemeProvider (reads AsyncStorage)
```

All four contexts are independent of each other — none of them import from the others. They all read and write to their own storage (database, AsyncStorage).

---

## 8. Authentication System

### Sign Up Flow

```
SignupScreen
  -> user enters name, email, password
  -> AuthContext.signup(name, email, password) is called
  -> firebase.js: signUpUser() creates account in Firebase Authentication
  -> firebase.js: updateProfile() sets the displayName on the Firebase user
  -> AuthContext saves { name, email, uid } to AsyncStorage via PreferencesService.saveSession()
  -> AuthContext sets isAuthenticated = true
  -> app/index.tsx shows the main tab interface
```

### Login Flow

```
LoginScreen
  -> user enters email, password
  -> AuthContext.login(email, password) is called
  -> firebase.js: loginUser() signs in to Firebase
  -> AuthContext merges Firebase data with any previously saved profile data (name, photoUri)
  -> Saves merged user to AsyncStorage
  -> isAuthenticated = true -> main tabs appear
```

### Session Persistence (App Restarts)

```
App opens
  -> AuthContext useEffect runs loadInitialSession()
  -> PreferencesService.getSession() checks AsyncStorage for saved user data
  -> If found: user = saved data, isAuthenticated = true (user skips login screen)
  -> Firebase's onAuthStateChanged also fires (if internet available) to refresh the session
```

### Demo Mode

When Firebase is not configured or unavailable:
- `loginUser()` and `signUpUser()` generate a fake user with ID `demo_user` or `demo_{timestamp}`
- All local database operations work exactly as normal
- No cloud account is created
- Useful for offline testing or development

---

## 9. Security & App Lock System

### Setting Up a PIN (First Time)

```
More screen -> "App Security" section -> user taps "Set PIN"
  -> SecurityLockModal shows in "setup" mode
  -> User enters 4 digits
  -> SecurityService.hashPin('1234')
     -> expo-crypto.digestStringAsync(SHA256, 'DAYBOOK_SALT_1234')
     -> Returns hash: 'a7b3c9d2e1f...'
  -> PreferencesService.saveSecurityConfig({ pinHash: 'a7b3c9...', isPinEnabled: true, isBiometricsEnabled: false })
  -> SecurityContext.isPinSet = true
```

### App Lock on Next Startup

```
App opens
  -> SecurityContext.initSecurity() reads security config from AsyncStorage
  -> config.pinHash is not null -> SecurityContext.isLocked = true
  -> app/index.tsx sees isLocked = true -> renders SecurityLockModal
  -> User enters PIN
  -> SecurityService.verifyPin('1234')
     -> Hashes '1234' -> compares with stored hash
     -> Hashes match -> returns true
  -> SecurityContext.isLocked = false
  -> Normal app interface appears
```

### Why SHA-256 Hashing Is Secure

- The raw PIN `1234` is **never saved anywhere**
- Only the hash `a7b3c9d2e1f...` is in AsyncStorage
- SHA-256 is a one-way function — you cannot go from the hash back to `1234`
- The salt prefix `DAYBOOK_SALT_` means the hash is unique to Daybook (prevents precomputed attack tables from working)

---

## 10. Database System (SQLite)

### Why SQLite?

SQLite is a **full relational database** stored as a single `.db` file on the device. Advantages:
- Supports complex queries with `WHERE`, `ORDER BY`, `JOIN`
- Supports transactions (`BEGIN TRANSACTION` / `COMMIT`)
- Extremely fast for local reads and writes
- The same engine used internally by iOS and Android themselves

### The Database File

**Location:** Inside the app's private documents directory. Users cannot access it from a file manager unless the phone is rooted.

**File name:** `daybook_v2.db`

### Common Operations

```js
const db = await getDB();

// Read all rows, returns array of row objects
const tasks = await db.getAllAsync('SELECT * FROM tasks;');

// Read one row, returns single object or null
const task = await db.getFirstAsync('SELECT * FROM tasks WHERE id = ?;', ['t_123']);

// Write data (INSERT / UPDATE / DELETE)
await db.runAsync(
  'INSERT INTO tasks (id, title, completed) VALUES (?, ?, ?);',
  ['t_1', 'Buy milk', 0]
);

// Create tables (DDL commands)
await db.execAsync('CREATE TABLE IF NOT EXISTS tasks (...);');
```

### Boolean Values in SQLite

SQLite does not have a native BOOLEAN type. This project uses:
- `1` to represent `true`
- `0` to represent `false`

The Repository layer converts these when reading:
```js
completed: Boolean(r.completed)  // 1 -> true, 0 -> false
```

And when writing:
```js
task.completed ? 1 : 0   // true -> 1, false -> 0
```

---

## 11. Notification System

### Android Setup

Android requires notifications to belong to a **channel** (introduced in Android 8.0). The app creates its channel in `NotificationService.setupAndroidChannel()`:

| Setting | Value |
|---|---|
| Channel ID | `daybook_alarms` |
| Display Name | "Daybook Reminders & Alarms" |
| Importance | MAX (shows as heads-up popup) |
| Vibration | Custom pattern `[0, 500, 250, 500]` ms |
| Lock Screen | PUBLIC (notification content visible on lock screen) |

### The `notification_id` Column

When a reminder is scheduled, the OS assigns a unique `notificationId` string. This ID is saved to the `reminders` table in the `notification_id` column. When the reminder is deleted, the app uses this ID to cancel the pending notification before it fires.

### Required `app.json` Setup

For notifications to work in a standalone APK, the plugin must be in `app.json`:
```json
{
  "expo": {
    "plugins": [
      "expo-notifications"
    ],
    "android": {
      "permissions": [
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE",
        "SCHEDULE_EXACT_ALARM",
        "NOTIFICATIONS"
      ]
    }
  }
}
```

---

## 12. Theme System (Light / Dark Mode)

### How the Toggle Works

```
User taps dark mode toggle in More screen
  -> ThemeContext.toggleTheme() is called
  -> isDarkMode flips: false -> true
  -> AsyncStorage.setItem('@daybook_theme', 'dark')
  -> theme changes from lightTheme to darkTheme
  -> All components using useTheme() re-render with new colors
```

### Color Reference

| Token | Light Mode | Dark Mode | Used For |
|---|---|---|---|
| `background` | `#F8FAFC` | `#0B0F19` | Page background |
| `card` | `#FFFFFF` | `#161F31` | Card and panel background |
| `primary` | `#6366F1` | `#6366F1` | Brand color, buttons, icons |
| `secondary` | `#8B5CF6` | `#A78BFA` | Secondary accent color |
| `textPrimary` | `#0F172A` | `#F8FAFC` | Main readable text |
| `textSecondary` | `#64748B` | `#94A3B8` | Subtitles, labels |
| `success` | `#10B981` | `#10B981` | Completed tasks, positive states |
| `danger` | `#EF4444` | `#F87171` | Delete buttons, errors |
| `warning` | `#F59E0B` | `#F59E0B` | Medium priority, caution states |
| `border` | `#E2E8F0` | `rgba(255,255,255,0.08)` | Card borders, dividers |

---

## 13. Backup & Restore System

### Export Format

The backup file is a JSON file with this structure:
```json
{
  "version": "1.0.0",
  "exportedAt": "2026-08-04T10:30:00.000Z",
  "tasks": [ ... ],
  "reminders": [ ... ],
  "habits": [ ... ],
  "diaryEntries": [ ... ],
  "reports": [ ... ]
}
```

### Import Safety

The import process uses a **database transaction**:
1. `BEGIN TRANSACTION` — starts an atomic operation
2. Delete all existing rows
3. Insert all backup rows
4. If any step fails, the transaction is rolled back — you never end up with partial data

> **Warning:** Import permanently replaces all current data. There is no undo. Always export a fresh backup before importing.

---

## 14. Build & Deployment Guide

### Start Local Development

```bash
cd Daybook
npm start
```
Scan the QR code with Expo Go app (Android/iOS) to preview changes instantly.

### USB Cable Testing (Development Build)

Step 1 — Build the development client APK (only needed once):
```bash
npx eas build -p android --profile development
```

Step 2 — Install the downloaded APK on your phone.

Step 3 — Start Metro bundler on your laptop:
```bash
npm start
```

Step 4 — Open the installed dev client app and connect to the Metro server. All code changes appear instantly without rebuilding.

### Preview APK (Standalone — for sharing)

```bash
npx eas build -p android --profile preview
```

This builds a complete standalone APK that does not need a Metro server. Share it with anyone via Google Drive, WhatsApp, etc. They install it and test directly.

### Production Build (Play Store)

```bash
npx eas build -p android --profile production
```

Then submit via:
```bash
npx eas submit -p android
```

### When to Regenerate Native Code

Run this command **before building** whenever you:
- Add a new Expo plugin to `app.json`
- Change Android `permissions` in `app.json`
- Upgrade the Expo SDK version

```bash
npx expo prebuild --clean
```

This regenerates the `android/` folder from your current `app.json` configuration.

---

## 15. Key Libraries & Why We Use Them

| Library | Why We Use It |
|---|---|
| `expo-router` | File-based routing — no manual navigation stack configuration needed |
| `expo-sqlite` | Full SQL database on device — structured, fast, works offline |
| `@react-native-async-storage/async-storage` | Simple key-value storage for settings, session, PIN |
| `expo-notifications` | Schedule local notifications for reminder alerts |
| `expo-local-authentication` | Fingerprint / Face ID without any third-party SDK |
| `expo-crypto` | SHA-256 hashing for secure PIN storage |
| `expo-image-picker` | Camera and gallery photo access for profile pictures |
| `expo-file-system` | Read and write files on the device for backup export |
| `expo-sharing` | Open the OS share sheet to send backup files |
| `expo-splash-screen` | Control when the splash screen hides (after data loads) |
| `firebase` | Cloud authentication and optional Firestore user data sync |
| `react-native-safe-area-context` | Prevent content from hiding under phone notches and home bars |
| `react-native-gesture-handler` | Better swipe and touch gesture support |
| `react-native-reanimated` | Smooth high-performance animations |
| `expo-dev-client` | Enables USB cable / Wi-Fi live reload during development |

---

## 16. Common Developer Tasks

### Add a New Tab Screen

1. Create `src/screens/NewScreen.js`
2. Import it in `app/index.tsx`
3. Add a tab icon entry in `src/components/BottomNavigation.js`
4. Add the render condition in `app/index.tsx` (inside the `switch (activeTab)` or equivalent logic)

### Add a New Column to the Tasks Table

1. Add the column to `CREATE_TASKS_TABLE` in `src/db/schema.js`
2. Update `TaskRepository.add()` to include the column in the `INSERT` statement
3. Update `TaskRepository.getAll()` to map the new column in the returned object
4. Update `AddTaskModal.js` to include an input for the new field
5. Update `TaskCard.js` to display the new field if needed
6. **Important:** Uninstall and reinstall the app (or delete the database file) to apply the schema change to an existing database. SQLite `CREATE TABLE IF NOT EXISTS` only creates the table if it does not exist — it does not add new columns to an existing table.

### Change the App's Brand Color

Open `src/theme/theme.js` and change the `primary` value in both `lightTheme.colors` and `darkTheme.colors`:
```js
primary: '#FF6B35',  // Your new brand color
```

### Add a New Setting to the More Screen

1. Open `src/screens/MoreScreen.js`
2. Find the relevant settings section
3. Add your new UI component (toggle, button, input)
4. If the setting needs to be persisted, add a new key to `PreferencesService` in `src/services/PreferencesService.js`

### Change Default Starter Habits

Open `src/services/storage.js` and edit the `initialHabits` array. New habits will appear on fresh installs. Existing installs are not affected because `seedInitialDataIfEmpty` only runs when the table is empty.

---

## 17. Frequently Asked Questions

**Q: Does the app work on both Android and iPhone?**
A: Yes. React Native + Expo compiles the exact same JavaScript code into a native Android APK and a native iOS IPA. One codebase, two platforms.

**Q: Do users need an internet connection to use the app?**
A: No. All data (tasks, reminders, habits, diary) is stored on the device in SQLite. Internet is only used during the initial Firebase login/signup step.

**Q: What happens if a user uninstalls the app?**
A: All local SQLite data is permanently deleted. Firebase accounts remain. This is why the Backup & Restore feature is critical — users should export a backup before uninstalling.

**Q: Why does the app crash on launch when built as a standalone APK?**
A: The most common cause is missing plugins in `app.json`. If you use `expo-notifications` or `expo-local-authentication` in JavaScript, they must also be listed in the `plugins` array. Otherwise, the required entries are missing from `AndroidManifest.xml` and the app crashes when those native modules initialize.

**Q: How do I connect the app to a different Firebase project?**
A: Open `src/services/firebase.js` and replace all values in the `firebaseConfig` object with your new project's credentials from the Firebase console. Also replace `google-services.json` with the new project's file.

**Q: Can the app store images and photos?**
A: Profile photos are copied to the app's permanent documents directory using `expo-file-system` and the path is stored in AsyncStorage. SQLite only stores text — not binary files.

**Q: What is the difference between `AsyncStorage` and `SQLite`?**
A: `AsyncStorage` is a simple key-value store (like `localStorage`). Good for small, flat pieces of data like settings and session tokens. `SQLite` is a full relational database with tables, columns, rows, and SQL queries. Good for large, structured, queryable datasets like tasks and diary entries.

**Q: Why is the `android/` folder in the project?**
A: Running `npx expo prebuild` generates the native Android project. This is required for EAS Build and for running the app with a USB cable via `npm run android`. Do not manually edit files inside `android/` unless you are an experienced Android developer.

**Q: How do I add a new notification sound?**
A: Place the `.wav` or `.mp3` file in `assets/sounds/`. In Android, notification sounds must also be copied to `android/app/src/main/res/raw/`. Then reference the filename in `NotificationService.scheduleReminder()` when calling `setNotificationChannelAsync()`.

---

## 18. Recent Updates & Architectural Enhancements

Since the initial release of Daybook v1.0.0, several key improvements have been made to improve code quality, user experience, and stability.

### 18.1 Navigation & Gesture System
- **Unified Hardware Back Button Support**: Implemented system-level hardware back button interception using React Native's `BackHandler` native subscriptions. Custom back actions now dismiss active modal overlays (Add/Edit Task, Add/Edit Habit, Reminder Modal, Privacy policy sheets), cancel editor states, and navigate back to previous views cleanly.
- **Tab Navigation History**: Tracked tab navigation using a state-based history stack in `app/index.tsx`. Pressing Back pops the active screen and takes the user back through their tab history.
- **Left-Edge Back Swipe Gestures**: Added custom left-edge gesture detection using a global `PanResponder` to support native-style swipe-from-left back navigation on both iOS and Android.

### 18.2 Database Schema Migration
- **Timestamp Tracking (`modified_at`)**: Added a database migration layer inside `initDatabase()` in `database.js` to support adding the `modified_at` text column to the `diary_entries` table on existing databases.
- **Diary Created/Modified Labeling**: Integrated `createdAt` and `modifiedAt` timestamps into the repository layer. The Past Diary section and Diary Details modal now dynamically display either `Created: <timestamp>` or `Modified: <timestamp>` depending on whether the reflection was updated.

### 18.3 UI & Spacing Refinements
- **Character Constraint Validation**: Added immediate validation inside the Habit creator modal, giving instant feedback when attempting to save a blank title.
- **Task Title Space Optimization**: Extended Task Title length constraints to 15 characters, and repositioned the Priority badge in `TaskCard.js` from the title header to the right actions column to prevent early word-wrapping.
- **Unified Layout Margins**: Standardized bottom spacing and content padding across scroll views in `TodayScreen.js`, `DiaryScreen.js`, and `MoreScreen.js` for screen-edge uniformity.

---

*Documentation for Daybook v1.1.0 — Expo SDK 57 — React Native 0.86.2*
