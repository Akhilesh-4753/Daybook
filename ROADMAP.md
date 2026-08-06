# 🗺️ Daybook — Product Roadmap

This document outlines the planned future development, feature enhancements, UI/UX improvements, and long-term goals for the Daybook project.

---

## 1. Next Release (v1.3.0)

- [ ] **Custom Date Range Filter Implementation**: Complete the date range picker UI for the Reports screen to allow custom date range selection beyond standard preset filters.
- [ ] **Rich Text Formatting for Diary**: Add basic formatting tools (Bold, Italics, Bullet points) inside the Diary editor.
- [ ] **Custom Reminder Notification Sounds**: Allow users to select custom chime sounds for local calendar reminders.
- [ ] **Task Subtasks / Checklists**: Enable breaking down complex tasks into subtasks with individual completion checkmarks.

---

## 2. Planned Features

- [ ] **Habit Streak History Calendar**: Visual monthly grid view for each habit showing completion streaks over past months.
- [ ] **Multi-Language Support (i18n)**: Localization for Spanish, French, German, Hindi, and Japanese.
- [ ] **Task Tags & Custom Labels**: Ability to add custom color-coded tags to tasks beyond default categories.
- [ ] **Diary Voice Memos**: Option to attach short audio voice notes to daily journal entries.

---

## 3. UI/UX Improvements

- [ ] **Custom Brand Theme Color Picker**: Allow users to choose their preferred primary accent color in the More settings screen.
- [ ] **First-Time User Onboarding**: Animated onboarding carousel introducing core app features on initial launch.
- [ ] **Interactive Micro-Animations**: Enhanced celebratory confetti animations when completing all daily tasks.
- [ ] **Tablet & Foldable Layout Optimizations**: Dual-column side-by-side view for tablets and wide screens.

---

## 4. Performance Improvements

- [ ] **SQLite Query Pagination**: Lazy-loading pagination for large diary histories to optimize memory usage on low-end devices.
- [ ] **Image Compression Optimization**: Automatic compression and resizing of profile photos before saving to local storage.
- [ ] **List Render Optimization**: Virtualized rendering (`FlashList` or `FlatList`) for long task lists.

---

## 5. Security Improvements

- [ ] **SQLCipher Database Encryption**: Full AES-256 database file encryption for SQLite offline storage.
- [ ] **Inactivity Auto-Lock Timer**: Automatic app locking after 1, 5, or 10 minutes of background inactivity.
- [ ] **Two-Factor Authentication (2FA)**: Optional 2FA step for Firebase email login accounts.

---

## 6. Bug Fixes & Hardening

- [ ] **Leap-Year Edge Case Guard**: Additional unit test assertions for yearly recurring reminders on February 29th.
- [ ] **Small-Screen Keyboard Offsets**: Fine-tuning `KeyboardAvoidingView` behavior on ultra-compact Android devices during diary entry writing.

---

## 7. Future Ideas

- [ ] **AI Daily Insights & Reflection Summaries**: Smart productivity analytics summarizing weekly task trends and mood correlations.
- [ ] **Widget Support (iOS & Android)**: Home screen widgets for Today's Task List and Habit Quick-Check.
- [ ] **Collaborative Reminders**: Shared task lists and reminder alerts for families or teams.

---

## 8. Long-Term Goals

- [ ] **Cloud Sync Engine**: Background sync between local SQLite database and Firebase Firestore with offline conflict resolution.
- [ ] **Desktop Apps (macOS & Windows)**: Cross-platform desktop builds using React Native for Desktop or Electron wrapper.
- [ ] **Wear OS & Apple Watch Companion App**: Quick-add tasks and habit check-ins from smartwatch devices.

---

*Last Updated: August 2026 — Daybook Development Team*
