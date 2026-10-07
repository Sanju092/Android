import { useState, useEffect } from 'react';
import { metroAudio } from '../lib/audio';

const STORAGE_KEY = 'metrotrack_settings_v2';
const CUSTOM_AUDIO_STORAGE_KEY = 'metrotrack_custom_audio_file';

const DEFAULT_SETTINGS = {
  soundEnabled: true,
  vibrationEnabled: true,
  voiceAnnounceEnabled: true,
  systemNotificationsEnabled: false,
  useCustomMusic: false,
  customMusicForInterchange: true,
  customAudioName: '',
  geofenceRadiusMeters: 300, // 300m standard approach alert
  highAccuracyGPS: true,
  autoTrackNearest: true,
  volume: 0.85
};

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [customAudioLoaded, setCustomAudioLoaded] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  }, [settings]);

  // Load custom audio if present on startup
  useEffect(() => {
    try {
      const savedAudio = localStorage.getItem(CUSTOM_AUDIO_STORAGE_KEY);
      if (savedAudio) {
        metroAudio.loadCustomAudio(savedAudio);
        setCustomAudioLoaded(true);
      }
    } catch (e) {
      console.warn('Failed to load custom audio from storage:', e);
    }
  }, []);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  /**
   * Saves a user-uploaded music file
   */
  const saveCustomMusic = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) return reject(new Error('No file selected'));

      // Check size (limit to 10MB to avoid localStorage overflow)
      if (file.size > 10 * 1024 * 1024) {
        return reject(new Error('Audio file must be under 10MB'));
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        try {
          localStorage.setItem(CUSTOM_AUDIO_STORAGE_KEY, dataUrl);
          metroAudio.loadCustomAudio(dataUrl);
          updateSetting('customAudioName', file.name);
          updateSetting('useCustomMusic', true);
          setCustomAudioLoaded(true);
          resolve(file.name);
        } catch (err) {
          reject(new Error('Browser storage full. Please use a smaller audio file (< 4MB).'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read audio file'));
      reader.readAsDataURL(file);
    });
  };

  const removeCustomMusic = () => {
    try {
      localStorage.removeItem(CUSTOM_AUDIO_STORAGE_KEY);
      metroAudio.loadCustomAudio(null);
      updateSetting('customAudioName', '');
      updateSetting('useCustomMusic', false);
      setCustomAudioLoaded(false);
    } catch (e) {
      console.warn(e);
    }
  };

  return {
    settings,
    updateSetting,
    saveCustomMusic,
    removeCustomMusic,
    customAudioLoaded
  };
}
