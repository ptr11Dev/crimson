import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Map from timerId -> expo notification identifier
const scheduledIds: Map<string, string> = new Map();

/**
 * Request notification permissions from iOS.
 * Returns true if granted.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') return true;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Configure how notifications look while the app is in foreground.
 */
export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * Schedule a notification 5 real-world minutes before a timer ends.
 * @param timerId  unique stable id (e.g. "speedup", "income", "goldbar", "mission-1234")
 * @param endTimestampMs  real-world epoch ms when the timer ends
 * @param label  human-readable timer name shown in the notification
 */
export async function scheduleTimerNotification(
  timerId: string,
  endTimestampMs: number,
  label: string,
): Promise<void> {
  // Cancel any existing notification for this timer first
  await cancelTimerNotification(timerId);

  const triggerMs = endTimestampMs - 5 * 60 * 1000; // 5 min before end
  const now = Date.now();

  // Don't schedule if the trigger is in the past
  if (triggerMs <= now) return;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '⚔️ Crimson Desert',
      body: `${label} — gotowe za 5 minut!`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(triggerMs),
    },
  });

  scheduledIds.set(timerId, id);
}

/**
 * Cancel the scheduled notification for a specific timer.
 */
export async function cancelTimerNotification(timerId: string): Promise<void> {
  const id = scheduledIds.get(timerId);
  if (id) {
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
    scheduledIds.delete(timerId);
  }
}

/**
 * Cancel all scheduled notifications (e.g. on endSession).
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  scheduledIds.clear();
}
