import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const initNotificationHandler = () => {
  try {
    if (Notifications && typeof Notifications.setNotificationHandler === 'function') {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
    }
  } catch (e) {
    // Safe fallback
  }
};

const parseReminderDateTime = (dateStr, timeStr) => {
  try {
    if (!dateStr) return new Date(Date.now() + 60000);
    const dateParts = dateStr.split('-').map((p) => parseInt(p, 10));
    if (dateParts.length !== 3 || dateParts.some(isNaN)) return new Date(Date.now() + 60000);

    const year = dateParts[0];
    const month = dateParts[1] - 1;
    const day = dateParts[2];

    let hours = 9;
    let minutes = 0;

    if (timeStr) {
      const isPM = timeStr.toUpperCase().includes('PM');
      const isAM = timeStr.toUpperCase().includes('AM');
      const cleanTime = timeStr.replace(/(AM|PM|\s)/gi, '');
      const timeParts = cleanTime.split(':').map((p) => parseInt(p, 10));

      if (timeParts.length >= 2 && !isNaN(timeParts[0]) && !isNaN(timeParts[1])) {
        hours = timeParts[0];
        minutes = timeParts[1];

        if (isPM && hours < 12) hours += 12;
        if (isAM && hours === 12) hours = 0;
      }
    }

    return new Date(year, month, day, hours, minutes, 0, 0);
  } catch (e) {
    return new Date(Date.now() + 60000);
  }
};

const getNextOccurrence = (dateStr, timeStr, repeat) => {
  const targetDate = parseReminderDateTime(dateStr, timeStr);
  const now = new Date();

  if (targetDate.getTime() > now.getTime()) {
    return targetDate;
  }

  const nextDate = new Date(targetDate.getTime());
  while (nextDate.getTime() <= now.getTime()) {
    if (repeat === 'Monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else if (repeat === 'Yearly') {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    } else {
      break;
    }
  }
  return nextDate;
};

export const NotificationService = {
  setupAndroidChannel: async () => {
    if (Platform.OS === 'android') {
      try {
        if (Notifications && typeof Notifications.setNotificationChannelAsync === 'function') {
          const maxImportance = Notifications.AndroidImportance?.MAX || 5;
          const publicVis = Notifications.AndroidNotificationVisibility?.PUBLIC || 1;
          await Notifications.setNotificationChannelAsync('daybook_alarms', {
            name: 'Daybook Reminders & Alarms',
            importance: maxImportance,
            vibrationPattern: [0, 500, 250, 500],
            lightColor: '#6366F1',
            sound: true, // FIXED: Replaced 'default' string with boolean true to use standard system chime
            enableVibrate: true,
            lockscreenVisibility: publicVis,
          });
        }
      } catch (e) {
        // Safe catch
      }
    }
  },

  requestPermissions: async () => {
    try {
      await NotificationService.setupAndroidChannel();
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      return finalStatus === 'granted';
    } catch (e) {
      console.warn('Notification permission error:', e);
      return false;
    }
  },

  scheduleReminder: async (reminder) => {
    try {
      const hasPermission = await NotificationService.requestPermissions();
      if (!hasPermission) return null;

      let trigger = null;
      const targetDate = parseReminderDateTime(reminder.date, reminder.time);
      const now = new Date();

      // Ensure Android channel is set up
      await NotificationService.setupAndroidChannel();

      const TriggerTypes = Notifications.SchedulableTriggerInputTypes;

      if (Platform.OS === 'ios') {
        // iOS Schedulable Triggers (Native Repeating Calendar Rules)
        if (reminder.repeat === 'Daily') {
          trigger = {
            type: TriggerTypes?.CALENDAR || 'calendar',
            hour: targetDate.getHours(),
            minute: targetDate.getMinutes(),
            repeats: true,
          };
        } else if (reminder.repeat === 'Weekly') {
          trigger = {
            type: TriggerTypes?.CALENDAR || 'calendar',
            weekday: targetDate.getDay() + 1, // Sunday = 1, Saturday = 7
            hour: targetDate.getHours(),
            minute: targetDate.getMinutes(),
            repeats: true,
          };
        } else if (reminder.repeat === 'Monthly') {
          trigger = {
            type: TriggerTypes?.CALENDAR || 'calendar',
            day: targetDate.getDate(),
            hour: targetDate.getHours(),
            minute: targetDate.getMinutes(),
            repeats: true,
          };
        } else if (reminder.repeat === 'Yearly') {
          trigger = {
            type: TriggerTypes?.CALENDAR || 'calendar',
            month: targetDate.getMonth() + 1,
            day: targetDate.getDate(),
            hour: targetDate.getHours(),
            minute: targetDate.getMinutes(),
            repeats: true,
          };
        } else {
          // No Repeat
          const secondsFromNow = Math.max(1, Math.floor((targetDate.getTime() - now.getTime()) / 1000));
          trigger = {
            type: TriggerTypes?.TIME_INTERVAL || 'timeInterval',
            seconds: secondsFromNow,
            repeats: false,
          };
        }
      } else {
        // Android Schedulable Triggers
        if (reminder.repeat === 'Daily') {
          trigger = {
            type: TriggerTypes?.DAILY || 'daily',
            hour: targetDate.getHours(),
            minute: targetDate.getMinutes(),
            repeats: true,
          };
        } else if (reminder.repeat === 'Weekly') {
          trigger = {
            type: TriggerTypes?.WEEKLY || 'weekly',
            weekday: targetDate.getDay() + 1, // Sunday = 1, Saturday = 7
            hour: targetDate.getHours(),
            minute: targetDate.getMinutes(),
            repeats: true,
          };
        } else if (reminder.repeat === 'Monthly') {
          const nextOccur = getNextOccurrence(reminder.date, reminder.time, 'Monthly');
          const secondsFromNow = Math.max(1, Math.floor((nextOccur.getTime() - now.getTime()) / 1000));
          trigger = {
            type: TriggerTypes?.TIME_INTERVAL || 'timeInterval',
            seconds: secondsFromNow,
            repeats: false,
          };
        } else if (reminder.repeat === 'Yearly') {
          const nextOccur = getNextOccurrence(reminder.date, reminder.time, 'Yearly');
          const secondsFromNow = Math.max(1, Math.floor((nextOccur.getTime() - now.getTime()) / 1000));
          trigger = {
            type: TriggerTypes?.TIME_INTERVAL || 'timeInterval',
            seconds: secondsFromNow,
            repeats: false,
          };
        } else {
          // No Repeat
          const secondsFromNow = Math.max(1, Math.floor((targetDate.getTime() - now.getTime()) / 1000));
          trigger = {
            type: TriggerTypes?.TIME_INTERVAL || 'timeInterval',
            seconds: secondsFromNow,
            repeats: false,
          };
        }
      }

      let notificationId = null;
      try {
        notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: `⏰ Daybook Reminder: ${reminder.title}`,
            body: `${reminder.importance || reminder.notes || 'Time for your scheduled activity.'}`,
            sound: true,
            priority: Notifications.AndroidNotificationPriority?.MAX || 'max',
            channelId: 'daybook_alarms',
            data: { reminderId: reminder.id },
          },
          trigger,
        });
      } catch (schedErr) {
        // Fallback to simple time interval trigger if native repeating format fails
        const secondsFromNow = Math.max(1, Math.floor((targetDate.getTime() - now.getTime()) / 1000));
        notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: `⏰ Daybook Reminder: ${reminder.title}`,
            body: `${reminder.importance || reminder.notes || 'Time for your scheduled activity.'}`,
            sound: true,
            priority: Notifications.AndroidNotificationPriority?.MAX || 'max',
            channelId: 'daybook_alarms',
            data: { reminderId: reminder.id },
          },
          trigger: {
            type: TriggerTypes?.TIME_INTERVAL || 'timeInterval',
            seconds: secondsFromNow,
            repeats: false,
          },
        });
      }

      return notificationId;
    } catch (error) {
      console.error('Failed to schedule local notification:', error);
      return null;
    }
  },

  cancelReminder: async (notificationId) => {
    if (!notificationId) return;
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (e) {
      console.error('Cancel notification error:', e);
    }
  },
};