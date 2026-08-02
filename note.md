# 📘 Daybook — Technical & Feature Specification Guide

> **Plan Your Day, Organize Your Life.**  
> *A high-fidelity, privacy-focused daily planner, task tracker, habit builder, and reflection diary built with Expo SDK 57 & React Native.*

---

## 🌟 Application Overview

**Daybook** is a comprehensive personal productivity application designed to empower users to organize daily activities, build healthy habits, schedule time-sensitive reminders, track progress analytics, and record personal reflections. Built with a modern design system featuring glassmorphism aesthetics, dynamic dark/light mode switching, responsive safe-area layout handling, and 100% offline data privacy.

---

## 📱 Detailed Page-by-Page Feature Breakdown

### 1. 🔐 Authentication & Onboarding (`AuthScreen.js`)
* **Clean Minimalist Design**: Streamlined authentication flow with seamless tab switching between **Log In** and **Sign Up**.
* **Input Validation**: Real-time email format validation and password length checks with user-friendly error banners.
* **Session Persistence**: Maintains authenticated state securely across app re-launches using `AuthContext`.
* **Default Theme**: Opens by default in **Light Mode** ☀️ for all new app installs.
* **Branding Header**: Displays the color-matched Daybook logo asset (`#6366F1`) with transparent background support.

---

### 2. 📅 Today Tasks Screen (`TodayScreen.js`)
* **Dynamic Header (`Header.js`)**:
  * Displays time-sensitive greetings (*"Good Morning"*, *"Good Afternoon"*, *"Good Evening"*, *"Good Night"*).
  * Displays user profile avatar with fallback initial badge and current formatted date.
* **Productivity Progress Card**:
  * Circular animated progress indicator showing completion percentage (`%`).
  * Live status summary showing completed vs. pending tasks.
* **Task Management Checklist**:
  * Priority badges (*High*, *Medium*, *Low*) and category tags (*Work*, *Health*, *Personal*, *Finance*).
  * Batch selection checkboxes with a primary action button: **"Mark Completed (N)"**.
  * Single task deletion with confirmation modal.
  * Collapsible **Completed Tasks** drawer.
* **Smart Note Layout**:
  * **Single-Line Notes**: Renders as clean, minimal text directly under task titles without container boxes or borders.
  * **Multi-Line Notes**: Automatically formatted with bullet points (`• `) and wrapped inside a soft inset surface card (`📌 NOTES` header tag).
* **Theme-Adaptive Empty State**:
  * Features a high-fidelity 260x260 checklist illustration.
  * **Light Mode**: Renders clean, vibrant artwork.
  * **Dark Mode**: Dynamically switches to a high-contrast version (`empty_state_illustration_dark.png`).

---

### 3. 🎯 Habit Tracker Screen (`HabitsScreen.js` & `AddHabitModal.js`)
* **Habit Creation Modal**:
  * Built 1:1 with `AddTaskModal.js` design for complete UI parity (overlay, character counters, icon selector, category pills, full-width save action).
  * Replaced fallback icons with a clean Note icon (`📝`).
* **Habit Completion Grid**:
  * Day-by-day habit tracking with streak counters and target goal progress.
  * Compact 20px footer spacing for an optimized screen layout.

---

### 4. 🗓️ Calendar & Reminders Screen (`CalendarScreen.js` & `AddReminderModal.js`)
* **Interactive Month Grid**:
  * Timezone-safe date navigation across months.
  * Visual indicators (dots) for dates containing scheduled reminders.
  * Highlights today's date and the active selected date.
* **Collapsible Reminders Section**:
  * **Compact by Default**: Keeps the screen clean upon launch.
  * **Dropdown Chevron Toggle (`›` / `⌄`)**: Displays `›` when collapsed and `⌄` when expanded.
  * **Interactive Trigger**: Tapping the date header or selecting any date on the calendar grid expands the list.
* **Reminder Creation & Local Notifications**:
  * Clean creation modal focusing purely on essential reminder details (title, date, time, repeat rules).
  * Repeat rules support: *Daily*, *Weekly*, *Monthly*, *Yearly*.
  * Integrates with `expo-notifications` using OS default alarm tones.
  * Prevents reminder creation for past dates automatically.

---

### 5. 📖 Diary & Reflections Screen (`DiaryScreen.js`)
* **Mood Tracking**: 5 interactive mood selectors (*Happy 😊*, *Calm 😌*, *Neutral 😐*, *Sad 😔*, *Stressed 😫*).
* **Journal Entry Editor**: Dedicated fields for entry title and daily memories/thoughts.
* **Past Journal Drawer**:
  * Toggle between *"Write Entry"* and *"Past Journal"*.
  * Filter past reflections dynamically by **Year** and **Month**.
  * Delete past journal entries safely.

---

### 6. 📊 Reports & Analytics Screen (`ReportsScreen.js`)
* **Productivity Score Metrics**: Displays an overall productivity index percentage based on completed tasks, habits, and reminders.
* **Visual Charts**:
  * **Task Distribution Donut Chart**: Breakdown across categories (*Work*, *Health*, *Personal*, *Finance*).
  * **Weekly Progress Bar Chart**: Day-by-day task completion visualization.
* **Time Range Filters**: Filter metrics by *Today*, *This Week*, *This Month*, or *Custom Date*.
* **Custom Date Range Modal**: Allows exact range filtering with auto-hyphenated date inputs (`YYYY-MM-DD`) and strict validation (prevents future dates).

---

### 7. ⚙️ User Settings & About Us Screen (`MoreScreen.js`)
* **User Profile Card**: Displays user avatar, display name, email, and a **`⭐ Premium Member`** tier badge.
* **Edit Profile Modal**:
  * **Photo framing screen (`ImageFrameModal.js`)**: Selects 1:1 square photo framing with native cropper, 3x3 grid lines, and top-right **Done** button.
  * **Smart Button Disable**: The *"Update Profile"* button is disabled (50% opacity) when no changes are made.
  * **Stylish Success Alert**: Custom modal featuring a green checkmark badge, title *"Profile Updated"*, and message *"Your profile details have been saved."*
* **Preferences & Security**:
  * **Dark / Light Mode Switch**: Global theme toggle for switching themes anytime.
  * **App Lock & Biometrics**: Setup 4-digit security PIN or enable Biometrics.
* **Disabled Backup Options**:
  * **Export Backup (JSON)** & **Restore Data**: Options are disabled (`disabled: true`, `opacity: 0.4`) with clear status subtitles.
* **About Us & Developer Modal**:
  * **Creator Profile Header**: Displays **Akhilesh** as Creator & Lead Developer of Daybook.
  * **The Story Behind Daybook**: Highlights the journey from handwritten sticky notes to building a unified, private productivity companion.
  * **Keyphrase Accent Bolding**: Highlighted core concepts in bold primary accent typography for maximum readability.
  * **Left-Border Accent Quotes**: Features quote callouts (*"Don't fill your mind with things you can write down..."* and *💡 A Thought to Remember*).
  * **Minimalist Social Connect Pills**: Subtle surface pills for WhatsApp, Instagram, LinkedIn, and GitHub.
  * **Clean 3-Line Version Footer**:
    ```text
    Version 1.0.0
    Built with ❤️ by Akhilesh
    © 2026 Daybook. All Rights Reserved.
    ```

---

## 🔒 Security & Data Privacy

1. **100% Offline Data Privacy Promise**:
   * All user data (tasks, habits, reminders, diary entries, profile details) remains stored **strictly on the user's local device**.
   * Zero external cloud tracking or background data harvesting.
2. **SQLite Database Engine (`expo-sqlite`)**:
   * Primary relational database (`daybook_v2.db`) managing structured tables for `tasks`, `reminders`, `habits`, `diary_entries`, and `reports`.
3. **4-Digit App Lock PIN**:
   * Users can protect application access with a 4-digit PIN stored securely via `SecurityService`.
4. **Biometric Authentication**:
   * Integrated with `expo-local-authentication` supporting **Fingerprint Scanner** and **Face ID**.
5. **Cryptographic Hashing**:
   * Security credentials and PIN hashes utilize `expo-crypto` for secure on-device hashing.

---

## 👨‍💻 About the Author & Story Behind Daybook

* **Author / Developer**: **Akhilesh** (Lead Developer of Daybook).
* **Background**: Transitioned from Accounting into Software Development.
* **The Story**:
  > *"For years, I relied on handwritten notes and sticky notes to remember important tasks, ideas, and daily plans. They helped me stay organized—but were easy to misplace and difficult to manage. I realized I was spending more time trying to remember my plans than actually completing them."*
  > 
  > *"As I transitioned into software development, I saw an opportunity to create something better. That idea became Daybook—a simple, private, and reliable productivity companion that brings your tasks, habits, reminders, and personal journal together in one place."*

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

To generate a standalone Android APK for distribution:

```bash
# Production preview build command
eas build --profile preview --platform android
```
