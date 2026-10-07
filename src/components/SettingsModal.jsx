import React, { useRef, useState } from 'react';
import {
  X,
  Volume2,
  Vibrate,
  Upload,
  Music,
  Clock,
  Bell,
  Trash2,
  Play,
  Square,
  CheckCircle2,
  Smartphone
} from 'lucide-react';
import { metroAudio } from '../lib/audio';
import {
  triggerHaptic,
  speakAnnouncement,
  requestNotificationPermission,
  sendSystemNotification
} from '../lib/notifications';

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  updateSetting,
  saveCustomMusic,
  removeCustomMusic,
  customAudioLoaded
}) {
  const fileInputRef = useRef(null);
  const [isPlayingTestAudio, setIsPlayingTestAudio] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(null);

    try {
      const name = await saveCustomMusic(file);
      setUploadSuccess(`Uploaded: ${name}`);
    } catch (err) {
      setUploadError(err.message || 'Failed to upload audio file');
    }
  };

  const handleTestVibration = async () => {
    await triggerHaptic(settings.vibrationPattern || 'DOUBLE_BUZZ');
  };

  const handleTestAllAlerts = async () => {
    await triggerHaptic('DESTINATION');
    metroAudio.triggerAlertSound('DESTINATION', settings);
    speakAnnouncement('Approaching destination: LB Nagar. Interchange available.');
    sendSystemNotification({
      title: '🚆 Station Alert: Approaching LB Nagar',
      body: 'Speed: 45 km/h • ETA: 45s • Last passed: Victoria Memorial'
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-panel">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Alert settings</h2>
            <p className="modal-subtitle">Customise how the tracker notifies you at each station.</p>
          </div>
          <button
            onClick={onClose}
            className="close-btn"
            aria-label="Close settings"
          >
            <X />
          </button>
        </div>

        {/* Section 1: Vibration */}
        <div className="settings-section">
          <div className="settings-row">
            <span className="settings-label">
              <Vibrate /> Vibration
            </span>
            <label className="metro-toggle">
              <input
                type="checkbox"
                checked={settings.vibrationEnabled}
                onChange={(e) => updateSetting('vibrationEnabled', e.target.checked)}
              />
              <span className="metro-toggle-slider"></span>
            </label>
          </div>

          <div style={{ paddingLeft: '24px' }}>
            <div className="form-group">
              <label className="form-label">Pattern</label>
              <select
                value={settings.vibrationPattern || 'DOUBLE_BUZZ'}
                onChange={(e) => updateSetting('vibrationPattern', e.target.value)}
                className="form-select"
              >
                <option value="DOUBLE_BUZZ">Double buzz</option>
                <option value="UPCOMING">Single buzz</option>
                <option value="TRIPLE_BUZZ">Triple buzz</option>
                <option value="LONG_PULSE">Long pulse</option>
              </select>
            </div>
          </div>

          <div style={{ paddingLeft: '24px' }}>
            <button onClick={handleTestVibration} className="btn-outline" style={{ width: 'auto', padding: '8px 16px' }}>
              <Smartphone style={{ width: 14, height: 14 }} />
              <span>Test vibration</span>
            </button>
            <p className="settings-hint" style={{ paddingLeft: 0, marginTop: '8px' }}>
              Interchange stations use a long buzz; your destination uses a triple buzz.
            </p>
          </div>
        </div>

        {/* Section 2: Alert sound */}
        <div className="settings-section">
          <div className="settings-row">
            <span className="settings-label">
              <Music /> Alert sound
            </span>
            <label className="metro-toggle">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
              />
              <span className="metro-toggle-slider"></span>
            </label>
          </div>

          <div style={{ paddingLeft: '24px' }}>
            <div className="form-group">
              <label className="form-label">Sound type</label>
              <select
                value={settings.soundType || 'Bell'}
                onChange={(e) => updateSetting('soundType', e.target.value)}
                className="form-select"
              >
                <option value="Bell">Bell</option>
                <option value="Chime">Chime</option>
                <option value="Melody">Melody</option>
                <option value="Custom">Custom music</option>
              </select>
            </div>
          </div>

          {/* Dashed upload box */}
          <div className="upload-zone">
            <input
              type="file"
              ref={fileInputRef}
              accept="audio/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <div className="upload-zone-info">
              <Music />
              <span>{settings.customAudioName || 'No custom music uploaded'}</span>
            </div>

            <button onClick={() => fileInputRef.current?.click()} className="upload-btn">
              <Upload />
              <span>Upload music</span>
            </button>

            {uploadError && (
              <p style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '4px' }}>{uploadError}</p>
            )}
            {uploadSuccess && (
              <p style={{ fontSize: '11px', color: 'var(--success)', marginTop: '4px' }}>{uploadSuccess}</p>
            )}

            <p className="upload-hint">
              Your uploaded track plays at every station alert. It's stored privately on this device.
            </p>
          </div>
        </div>

        {/* Section 3: Early alert lead time */}
        <div className="settings-section">
          <div className="slider-group" style={{ border: 'none', padding: 0, background: 'transparent' }}>
            <div className="slider-header">
              <span className="slider-header-label">
                <Clock /> Early alert lead time
              </span>
              <span className="slider-value">
                {settings.earlyAlertLeadTime || 45}s
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="300"
              step="5"
              value={settings.earlyAlertLeadTime || 45}
              onChange={(e) => updateSetting('earlyAlertLeadTime', Number(e.target.value))}
            />

            <p className="slider-hint">
              How far ahead of each station you get notified (in journey time).
            </p>
          </div>
        </div>

        {/* Section 4: Phone notifications */}
        <div className="settings-section">
          <div className="settings-row">
            <span className="settings-label">
              <Bell /> Phone notifications
            </span>
            <label className="metro-toggle">
              <input
                type="checkbox"
                checked={settings.systemNotificationsEnabled}
                onChange={async (e) => {
                  const checked = e.target.checked;
                  if (checked) {
                    await requestNotificationPermission();
                  }
                  updateSetting('systemNotificationsEnabled', checked);
                }}
              />
              <span className="metro-toggle-slider"></span>
            </label>
          </div>
          <p className="settings-hint">
            System pop-up for every upcoming station.
          </p>
        </div>

        {/* Bottom Button: Test all alerts */}
        <button onClick={handleTestAllAlerts} className="btn-outline">
          Test all alerts
        </button>
      </div>
    </div>
  );
}
