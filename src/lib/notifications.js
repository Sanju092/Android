/**
 * Multi-Channel Notification & Haptics Engine for MetroTrack
 * Handles:
 * 1. Physical Android Hardware Vibration (Capacitor Haptics + navigator.vibrate fallback)
 * 2. Android Native Notification Tray (Capacitor LocalNotifications + Notification API fallback)
 * 3. Web Speech API (Automated Voice station announcements)
 */

import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';

export const VIBRATION_PATTERNS = {
  DESTINATION: [600, 200, 600, 200, 1000, 300, 1200], // Intense sustained buzz
  INTERCHANGE: [350, 150, 350, 150, 400],             // Rhythmic double-warning
  UPCOMING: [200, 100, 200],                           // Gentle alert tap
  STATION_ARRIVED: [400, 150, 400],                    // Arrival confirmation
  DOUBLE_BUZZ: [250, 150, 250],                        // Custom pattern 1
  TRIPLE_BUZZ: [200, 100, 200, 100, 200],              // Custom pattern 2
  LONG_PULSE: [1000]                                   // Long pulse
};

/**
 * Triggers hardware vibration using native Capacitor Haptics or Web vibration API
 */
export async function triggerHaptic(type = 'UPCOMING') {
  const pattern = VIBRATION_PATTERNS[type] || [250];

  // Try Capacitor Haptics first (Native Android)
  try {
    if (type === 'DESTINATION') {
      await Haptics.vibrate({ duration: 1500 });
    } else if (type === 'INTERCHANGE') {
      await Haptics.vibrate({ duration: 800 });
    } else {
      await Haptics.vibrate({ duration: 300 });
    }
  } catch (e) {
    // Fall back to navigator.vibrate
  }

  // Also trigger navigator.vibrate for web/webview compatibility
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
      return true;
    } catch (err) {
      console.warn('Navigator vibration error:', err);
    }
  }

  return true;
}

/**
 * Speaks an announcement using Web Speech Synthesis
 */
export function speakAnnouncement(text) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => (v.lang.startsWith('en-IN') || v.lang.startsWith('en-GB') || v.lang.startsWith('en-US')) && !v.name.includes('Google')
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (preferredVoice) utterance.voice = preferredVoice;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech error:', err);
  }
}

/**
 * Requests Notification permissions for both Native Android and Web
 */
export async function requestNotificationPermission() {
  try {
    // 1. Request Capacitor LocalNotifications permission (Android Native)
    const capPerm = await LocalNotifications.requestPermissions();
    if (capPerm.display === 'granted') {
      return 'granted';
    }
  } catch (e) {
    // Not on native device, fallback to browser
  }

  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') return 'granted';
    try {
      const result = await Notification.requestPermission();
      return result;
    } catch (err) {
      return 'denied';
    }
  }
  return 'granted';
}

/**
 * Sends a native status-bar push notification on Android (and web fallback)
 */
export async function sendSystemNotification({ title, body, id = Math.floor(Math.random() * 100000) }) {
  // 1. Try Native Android Notification
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id,
          title,
          body,
          schedule: { at: new Date(Date.now() + 100) },
          sound: undefined,
          actionTypeId: '',
          extra: null
        }
      ]
    });
    return true;
  } catch (e) {
    // Fall back to Web Notification
  }

  // 2. Web Notification fallback
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.svg',
        tag: 'metro-alert',
        renotify: true,
        vibrate: [300, 100, 300]
      });
      return true;
    } catch (err) {
      console.warn('Push error:', err);
    }
  }
  return false;
}
