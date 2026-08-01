# 📘 Daybook — Technical & Feature Specification Guide

> **Plan Your Day, Organize Your Life.**  
> *A high-fidelity, privacy-focused daily planner, task tracker, habit builder, and reflection diary built with Expo SDK 57 & React Native.*

---

## 🌟 Application Overview

**Daybook** is a comprehensive personal productivity application designed to empower users to organize daily activities, build healthy habits, schedule time-sensitive reminders, track progress analytics, and record personal reflections. Built with a modern design system featuring glassmorphism aesthetics, dynamic dark/light mode switching, responsive safe-area layout handling, and 100% offline data privacy.

---

## 📱 Detailed Page-by-Page Feature Breakdown

### 1. 🔐 Authentication & Onboarding Screen (`AuthScreen.js`)
* **Dual-Mode Access**: Seamless tab switching between **Log In** and **Sign Up** workflows.
* **Input Validation**: Real-time email format validation and password length checks with user-friendly error banners.
* **Session Persistence**: Maintains authenticated state securely across app re-launches using `AuthContext`.
* **Branding Header**: Displays the color-matched Daybook logo asset (`#6366F1`) with transparent PNG background support for both Light and Dark modes.

---

### 2. 📅 Today Screen (`TodayScreen.js`)
* **Dynamic Header (`Header.js`)**:
  * Displays time-sensitive greetings (*"Good Morning"*, *"Good Afternoon"*, *"Good Evening"*, *"Good Night"*).
  * Displays user profile avatar with fallback initial badge and current formatted date.
  * **Header Theme Toggle**: Features a standalone **Sun (`☀️`) / Moon (`🌙`)** icon button in the top right to instantly switch between Light and Dark themes.
* **Productivity Progress Card**:
  * Circular animated progress indicator showing completion percentage (`%`).
  * Live status summary showing completed vs. pending tasks.
* **Task Management Checklist**:
  * Priority badges (*High*, *Medium*, *Low*) and category tags (*Work*, *Health*, *Personal*, *Finance*).
  * Batch selection checkboxes with a primary action button: **"Mark Completed (N)"**.
  * Single task deletion with confirmation modal.
  * Collapsible **Completed Tasks** drawer.
* **Theme-Adaptive Empty State**:
  * Features a high-fidelity 260x260 checklist illustration.
  * **Light Mode**: Renders clean, vibrant artwork.
  * **Dark Mode**: Dynamically switches to a high-contrast version (`empty_state_illustration_dark.png`) with bright white text and natural facial details.

---

### 3. 🗓️ Calendar & Schedule Screen (`CalendarScreen.js`)
* **Interactive Month Grid**:
  * Timezone-safe date navigation across months.
  * Visual indicators (dots) for dates containing scheduled reminders.
  * Highlights today's date and the active selected date.
* **Collapsible Reminders Section**:
  * **Hidden by Default**: Keeps the screen compact and clean upon launch.
  * **Dropdown Chevron Toggle (`›` / `⌄`)**: Displays `›` when collapsed and `⌄` when expanded.
  * **Interactive Trigger**: Tapping the *"Reminders for YYYY-MM-DD"* header or selecting any date on the calendar grid expands the list.
* **Reminder Actions & Local Notifications**:
  * Scheduled reminders with priority tags, alarm tone selections, and repeat rules (*Daily*, *Weekly*, *Monthly*, *Yearly*).
  * Integration with `expo-notifications` for background device alarms.
  * Disables reminder creation for past dates automatically.

---

### 4. 📖 Diary & Reflections Screen (`DiaryScreen.js`)
* **Mood Tracking**: 5 interactive mood selectors (*Happy 😊*, *Calm 😌*, *Neutral 😐*, *Sad 😔*, *Stressed 😫*).
* **Journal Entry Editor**: Dedicated fields for entry title and daily memories/thoughts.
* **Past Journal Drawer**:
  * Toggle between *"Write Entry"* and *"Past Journal"*.
  * Filter past reflections dynamically by **Year** and **Month**.
  * Delete past journal entries safely.

---

### 5. 📊 Reports & Analytics Screen (`ReportsScreen.js`)
* **Productivity Score Metrics**: Displays an overall productivity index percentage based on completed tasks, habits, and reminders.
* **Visual Charts**:
  * **Task Distribution Donut Chart**: Breakdown across categories (*Work*, *Health*, *Personal*, *Finance*).
  * **Weekly Progress Bar Chart**: Day-by-day task completion visualization.
* **Time Range Filter Pills**: Filter metrics by *Today*, *This Week*, *This Month*, or *Custom Date*.
* **Custom Date Modal**: Allows exact range filtering with auto-hyphenated date inputs (`YYYY-MM-DD`) and strict validation (prevents future dates and dates prior to account registration).

---

### 6. ⚙️ User & Settings Screen (`MoreScreen.js`)
* **User Profile Card**: Displays user avatar, display name, email, and a **`⭐ Premium Member`** tier badge.
* **Edit Profile Modal**:
  * **Photo framing screen (`ImageFrameModal.js`)**: Selects 1:1 square photo framing with native cropper, 3x3 grid lines, and top-right **Done** button.
  * **Smart Button Disable**: The *"Update Profile"* button is disabled (50% opacity) when no changes are made.
  * **Stylish Success Alert**: Replaces standard system popups with a custom modal featuring a green checkmark badge, title *"Profile Updated"*, and message *"Your profile details have been saved."*
* **Preferences & Security**:
  * **Dark / Light Mode Switch**: Global theme toggle.
  * **App Lock & Biometrics**: Setup 4-digit security PIN or enable Biometrics.
* **Backup & Restore**:
  * **Export Backup (JSON)**: Saves `daybook_backup.json` to local device storage.
  * **Restore Data**: Restores database state from local JSON backup files.
* **About & Legal**: Access developer stories and offline privacy promises.

---

## 🔒 Security & Authentication

1. **4-Digit App Lock PIN**:
   * Users can protect application access with a 4-digit PIN stored securely via `SecurityService`.
   * Enforces verification before modifying security preferences.
2. **Biometric Security**:
   * Integrated with `expo-local-authentication`.
   * Supports device-native **Fingerprint Scanner** and **Face ID / Facial Recognition**.
3. **Cryptographic Hashing**:
   * Security credentials and PIN hashes utilize `expo-crypto` for secure on-device hashing.

---

## 🛡️ Data Privacy & Storage Architecture

1. **100% Local Offline Privacy Promise**:
   * All user data (tasks, habits, reminders, diary entries, profile details) remains stored **strictly on the user's local device**.
   * Zero external cloud tracking or background data harvesting.
2. **SQLite Database Engine (`expo-sqlite`)**:
   * Primary relational database (`daybook_v2.db`) managing structured tables for `tasks`, `reminders`, `habits`, `diary_entries`, and `reports`.
3. **Key-Value Preference Storage (`AsyncStorage`)**:
   * Handles user theme preferences, security locks, and authentication state.
4. **Local Backup & Restore**:
   * Users maintain full data ownership with 1-click JSON export/import via `BackupService`.

---

## 🛠️ Technology Stack

| Component | Technology / Library |
| :--- | :--- |
| **Framework** | Expo SDK 57 (React Native 0.86, React 19) |
| **Navigation** | Expo Router (`expo-router`) & Custom Bottom Navigation |
| **Database** | SQLite via `expo-sqlite` |
| **Storage** | `@react-native-async-storage/async-storage` |
| **Local Notifications** | `expo-notifications` |
| **Biometrics** | `expo-local-authentication` |
| **Crypto & Hashing** | `expo-crypto` |
| **Media Picking** | `expo-image-picker` |
| **Safe Area Insets** | `react-native-safe-area-context` |
| **Theme System** | Custom Theme Provider (Light: `#FFFFFF`, Dark: `#0B0F19`, Primary: `#6366F1`) |

---

## 🚀 Building & Production Release

To create a standalone Android APK for distribution:

```bash
# Production preview build command
eas build --profile preview --platform android
```
