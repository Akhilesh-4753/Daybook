import * as Notifications from 'expo-notifications';

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (e) {
  console.warn('Expo Notifications handler warning:', e);
}

export const NotificationService = {
  requestPermissions: async () => {
    try {
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
      const targetDate = new Date(`${reminder.date} ${reminder.time || '09:00 AM'}`);

      if (isNaN(targetDate.getTime()) || targetDate <= new Date()) {
        // Fallback: 5 seconds test delay if past time
        trigger = { seconds: 5 };
      } else {
        const secondsUntil = Math.max(2, Math.floor((targetDate.getTime() - Date.now()) / 1000));
        if (reminder.repeat === 'Daily') {
          trigger = { hour: targetDate.getHours(), minute: targetDate.getMinutes(), repeats: true };
        } else if (reminder.repeat === 'Weekly') {
          trigger = { weekday: targetDate.getDay() + 1, hour: targetDate.getHours(), minute: targetDate.getMinutes(), repeats: true };
        } else {
          trigger = { seconds: secondsUntil };
        }
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `🔔 Daybook Reminder: ${reminder.title}`,
          body: reminder.importance || reminder.notes || 'Time to complete your scheduled activity.',
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
