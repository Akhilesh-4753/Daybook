import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
} catch (e) {
  console.warn('Expo Notifications handler warning:', e);
}

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

export const NotificationService = {
  setupAndroidChannel: async () => {
    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('daybook_alarms', {
          name: 'Daybook Reminders & Alarms',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 500, 250, 500],
          lightColor: '#6366F1',
          sound: true,
          enableVibrate: true,
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        });
      } catch (e) {
        console.warn('Android channel setup warning:', e);
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

      if (reminder.repeat === 'Daily') {
        trigger = Notifications.SchedulableTriggerInputTypes?.DAILY
          ? { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: targetDate.getHours(), minute: targetDate.getMinutes() }
          : { hour: targetDate.getHours(), minute: targetDate.getMinutes(), repeats: true };
      } else if (reminder.repeat === 'Weekly') {
        trigger = Notifications.SchedulableTriggerInputTypes?.WEEKLY
          ? { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: targetDate.getDay() + 1, hour: targetDate.getHours(), minute: targetDate.getMinutes() }
          : { weekday: targetDate.getDay() + 1, hour: targetDate.getHours(), minute: targetDate.getMinutes(), repeats: true };
      } else if (reminder.repeat === 'Monthly') {
        trigger = Notifications.SchedulableTriggerInputTypes?.MONTHLY
          ? { type: Notifications.SchedulableTriggerInputTypes.MONTHLY, day: targetDate.getDate(), hour: targetDate.getHours(), minute: targetDate.getMinutes() }
          : { day: targetDate.getDate(), hour: targetDate.getHours(), minute: targetDate.getMinutes(), repeats: true };
      } else if (reminder.repeat === 'Yearly') {
        trigger = Notifications.SchedulableTriggerInputTypes?.YEARLY
          ? { type: Notifications.SchedulableTriggerInputTypes.YEARLY, month: targetDate.getMonth() + 1, day: targetDate.getDate(), hour: targetDate.getHours(), minute: targetDate.getMinutes() }
          : { month: targetDate.getMonth() + 1, day: targetDate.getDate(), hour: targetDate.getHours(), minute: targetDate.getMinutes(), repeats: true };
      } else {
        // Standard One-Time Notification at Exact Target Date & Time (Does not repeat)
        const secondsFromNow = Math.max(1, Math.floor((targetDate.getTime() - now.getTime()) / 1000));
        if (Notifications.SchedulableTriggerInputTypes?.TIME_INTERVAL) {
          trigger = {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: secondsFromNow,
            repeats: false,
          };
        } else {
          trigger = { seconds: secondsFromNow };
        }
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `⏰ Daybook Reminder: ${reminder.title}`,
          body: `${reminder.importance || reminder.notes || 'Time for your scheduled activity.'}`,
          sound: true, // Native system notification chime
          priority: Notifications.AndroidNotificationPriority.MAX,
          channelId: 'daybook_alarms',
          data: { reminderId: reminder.id },
        },
        trigger,
      });

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
