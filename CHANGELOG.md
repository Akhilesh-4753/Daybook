# Changelog

All notable changes to **Daybook** are documented here.

> [!NOTE]
> Versioning follows [Semantic Versioning](https://semver.org/).

---

## v1.2.0 `Latest`
*Release Date: August 6, 2026*

### 🚀 New Features
- **Custom Date Modal**: Added a clean under-development alert modal when selecting the Custom Date filter on the Reports screen.
- **Duplicate Time Prevention**: Added date and time validation in reminder and task modals to prevent scheduling duplicate entries for the exact same timestamp.

### ✨ Improvements
- **Reports Filter Engine**: Refactored filter range logic for `Today`, `This Week` (Mon–Sun), and `This Month` (full month `YYYY-MM`).
- **Notification Triggers**: Configured `NotificationService` with Expo SDK 57 `SchedulableTriggerInputTypes` enums and channel initialization.
- **Android Auto-Rescheduling**: Background listener automatically recalculates and reschedules expired monthly/yearly reminders on app launch.
- **Starter Defaults**: Configured fresh accounts to start with `0%` Productivity Score, `0` Day Streak, and unchecked habit templates.
- **Asset Pruning**: Removed unused preview images and audio files to reduce binary size.

### 🐛 Bug Fixes
- Resolved `scheduleNotificationAsync` line 218 exception on Android devices.
- Fixed Reports page habits rate calculation and zero-task productivity score fallback.
- Fixed daily habit completion reset across date changes in `TaskContext.js`.

---

## v1.1.0
*Release Date: August 5, 2026*

### 🚀 New Features
- **Hardware Back & Gesture Navigation**: Intercepted Android hardware back button and implemented left-edge back swipe gesture support across screens.
- **Security Lock System**: Integrated PIN and Biometric (Fingerprint / Face ID) authentication.
- **Encrypted Local Backup**: Full SQLite database export and import backup sharing via file system.

### ✨ Improvements
- Added `created_at` and `modified_at` timestamp tracking to Diary reflections.
- Standardized scroll padding, task title character limits, and priority badge placement.

### 🐛 Bug Fixes
- Fixed `BackHandler.removeEventListener(...)` unmount crash in navigation listeners.
- Fixed profile picture vector icon rendering in Auth modal dialogs.

---

## v1.0.0
*Release Date: August 1, 2026*

### 🚀 New Features
- Initial public release of Daybook.
- Daily Task Management, Habits Tracker, Calendar Reminders, Mood Journal, Reports & Analytics, Dark/Light Themes, Firebase Auth, and Offline SQLite Storage.
