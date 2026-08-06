# 📋 Daybook — Changelog

All notable changes to the Daybook project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2026-08-06

### New Features
- **Custom Date Under-Development Modal**: Added a clean modal overlay when tapping the "Custom Date" filter pill on the Reports page, informing users that the date range picker is under development and scheduled for a future update. Styled consistently with existing app modals (`height: 46`, `borderRadius: 14`, primary shadow, and backdrop overlay).
- **Duplicate Time Prevention**: Added duplicate date and time validation in [AddReminderModal.js](file:///c:/Daybook/src/components/AddReminderModal.js) and [AddTaskModal.js](file:///c:/Daybook/src/components/AddTaskModal.js). Prevents users from booking two reminders or tasks for the exact same date and time, displaying a clear validation message.

### Improvements
- **Reports Filter Range Calculations**: Refactored date range filtering in [ReportsScreen.js](file:///c:/Daybook/src/screens/ReportsScreen.js):
  - **Today**: Strictly includes items matching today's date (`todayStr`).
  - **This Week**: Includes items from Monday to Sunday of the current week (`monStr..sunStr`).
  - **This Month**: Includes all items for the entire current month (`startsWith('YYYY-MM')`).
- **Notification Scheduling Enums**: Explicitly passed `Notifications.SchedulableTriggerInputTypes` enums (`TIME_INTERVAL`, `DAILY`, `WEEKLY`, `CALENDAR`) across iOS and Android notification triggers in [NotificationService.js](file:///c:/Daybook/src/services/NotificationService.js). Added fallback try-catch error handling.
- **Android Auto-Rescheduling**: Added an automatic listener in [TaskContext.js](file:///c:/Daybook/src/context/TaskContext.js) (`loadAllData`) to recalculate and reschedule expired monthly/yearly Android reminders to their next future occurrence on app launch.
- **Starter Defaults**: Initialized new user profile defaults with a `0%` Productivity Score and `0` Day Streak. Default habit templates ("Walking", "Drinking Water", "No Sugar", "Gym Workout", "Meditation") default to `autoAddToday: false`.
- **Static Asset Cleanup**: Pruned unused preview images (`new-logo-removebg-preview.png`, `text-logo-removebg-preview.png`) and unused audio WAV/MP3 files (`brisk_bell.wav`, `cartoon.wav`, `gentle_chime.wav`, `soft_bell.mp3`) to optimize app binary size.

### Bug Fixes
- **Line 218 Notification Exception**: Resolved the `scheduleNotificationAsync` exception on Android by ensuring Android notification channel setup is completed prior to scheduling and trigger shapes conform to SDK 57 enums.
- **Reports Summary Calculation Logic**: Fixed an issue where the Reminders card displayed unfiltered total reminder counts, habits rate displayed stale habit flags, and productivity score defaulted to `100%` when tasks were `0`.
- **Daily Habit Reset**: Updated `TaskContext.js` to automatically reset habit `completedToday` flags to `false` when a new date begins (`lastDateKey !== todayStr`).

### Breaking Changes
- None.

### Other Notes
- Fully validated with `npx expo-doctor` (20/20 checks passed with 0 issues).

---

## [1.1.0] - 2026-08-05

### New Features
- **Android & System Back Navigation**: Implemented system-level hardware back button interception using React Native `BackHandler` and left-edge back swipe gesture handling across all pages and modals.
- **Security Lock System**: Integrated PIN and Biometric (Fingerprint / Face ID) app lock authentication via `expo-local-authentication` and `expo-crypto`.
- **Encrypted Backup & Restore**: Added SQLite database export/import backup functionality using `expo-file-system` and `expo-sharing`.

### Improvements
- **Diary Timestamp Tracking**: Added `created_at` and `modified_at` timestamp tracking to SQLite database schema and Diary UI views.
- **UI Spacing & Typography**: Standardized scroll padding, extended task title length limits, and updated priority badge positioning in `TaskCard.js`.

### Bug Fixes
- Fixed `BackHandler.removeEventListener(...)` unmount crash in navigation listeners.
- Fixed profile picture vector icon rendering in Auth modal dialogs.

### Breaking Changes
- None.

### Other Notes
- Target framework updated to Expo SDK 57 and React Native 0.86.2.

---

## [1.0.0] - 2026-08-01

### New Features
- Initial public release of Daybook.
- Core features: Daily Task Management, Habits Tracker with streak counts, Calendar & Reminders with push notifications, Mood Journal (Diary), Productivity Reports & Charts, Profile Settings, and Dark/Light Mode Theme System.
- SQLite local database storage and Firebase Authentication integration.

### Improvements
- Initial release.

### Bug Fixes
- Initial release.

### Breaking Changes
- None.

### Other Notes
- Built using Expo managed workflow with file-based routing via Expo Router.
