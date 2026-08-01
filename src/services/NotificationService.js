import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
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

      if (isNaN(targetDate.getTime()) || targetDate <= now) {
        // Fallback: 5 seconds test delay if time has passed
        if (Notifications.SchedulableTriggerInputTypes?.TIME_INTERVAL) {
          trigger = {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 5,
            repeats: false,
          };
        } else {
          trigger = { seconds: 5 };
        }
      } else {
        if (reminder.repeat === 'Daily') {
          if (Notifications.SchedulableTriggerInputTypes?.DAILY) {
            trigger = {
              type: Notifications.SchedulableTriggerInputTypes.DAILY,
              hour: targetDate.getHours(),
              minute: targetDate.getMinutes(),
            };
          } else {
            trigger = { hour: targetDate.getHours(), minute: targetDate.getMinutes(), repeats: true };
          }
        } else if (reminder.repeat === 'Weekly') {
          if (Notifications.SchedulableTriggerInputTypes?.WEEKLY) {
            trigger = {
              type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
              weekday: targetDate.getDay() + 1,
              hour: targetDate.getHours(),
              minute: targetDate.getMinutes(),
            };
          } else {
            trigger = { weekday: targetDate.getDay() + 1, hour: targetDate.getHours(), minute: targetDate.getMinutes(), repeats: true };
          }
        } else {
          // Standard One-Time Alarm at Exact Target Date & Time (e.g., tomorrow at 09:00 AM)
          if (Notifications.SchedulableTriggerInputTypes?.DATE) {
            trigger = {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: targetDate,
            };
          } else {
            trigger = targetDate;
          }
        }
      }

      const toneLabel = reminder.alarmTone || 'Default Ringtone';

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `⏰ Daybook Alarm: ${reminder.title}`,
          body: `${reminder.importance || reminder.notes || 'Time for your scheduled activity.'} (Tone: ${toneLabel})`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          channelId: 'daybook_alarms',
          data: { reminderId: reminder.id, alarmTone: toneLabel },
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
