# 🚆 MetroTrack Hyderabad

**High-Accuracy Live GPS Metro Journey Navigation, Upcoming Station Alerts, Velocity Tracker & Custom Alarm System**

Built for commuters on the **Hyderabad Metro Rail Network** across all 3 corridors:
- **Red Line (Corridor I)**: Miyapur ⇄ LB Nagar (27 Stations)
- **Blue Line (Corridor III)**: Raidurg ⇄ Nagole (23 Stations)
- **Green Line (Corridor II)**: JBS Parade Ground ⇄ MGBS (9 Stations)

---

## 🌟 Key Features Built to Address Previous Testing Issues

### 1. 📍 Precision GPS Tracking & Noise Filtering
- **Kalman-inspired Exponential Smoothing (`src/lib/geo.js`)**: Eliminates GPS jitter, reflection multipath errors, and false station skips caused by elevated viaducts and underground segments.
- **Station Hysteresis**: Prevents backward bouncing between stations while traveling.
- **Configurable Geofence Thresholds**: Choose between **Strict (150m)**, **Standard (300m)**, and **Early Advance (500m)**.

### 2. 🔔 Multi-Channel Upcoming Station Notifications
- **Live Cockpit Metrics (`JourneyPanel.jsx`)**:
  - **Live Velocity**: Digital speedometer in km/h with cruising status.
  - **Next / Upcoming Station**: Distance in meters/kilometers, dynamic ETA, line badge, and interchange indicators.
  - **Last Passed Station**: Departure timestamp (e.g. `17:42`) and departure speed.
- **Voice Announcements**: Uses Web Speech API to speak announcements (e.g. *"Next station is Ameerpet. Interchange for Blue Line to Raidurg"*).
- **System Push Notifications**: Notifies you even if your phone is in your pocket or the app is minimized.
- **Live Alerts Feed (`AlertsFeed.jsx`)**: Complete timestamped audit trail of station transitions and speeds.

### 3. 📳 Distinct Hardware Haptic Vibrations
- **Destination Arrival**: Heavy sustained rhythmic vibration pattern `[600, 200, 600, 200, 1000, 300, 1200]` to wake commuters up so they never miss their stop!
- **Interchange Stations**: Double-warning pulse `[350, 150, 350, 150, 400]` at Ameerpet, MGBS, and Parade Ground.
- **Regular Intermediate Stops**: Gentle tap `[200, 100, 200]`.
- **Instant Test Button**: Test your phone's vibration pattern anytime from the cockpit or settings.

### 4. 🎵 Custom Music & Ringtone Alarm Mode
- **Upload Any Local Audio**: Commuters can upload their own `.mp3` or `.wav` song from their device!
- **Persistent Storage**: Saved in browser local storage and loaded automatically on every visit.
- **Audio Synthesizer**: Built-in 3-tone Hyderabad Metro Chime, Rapid Interchange Ping, and Destination Fanfare using Web Audio API (zero external sound file dependencies required).

### 5. 🗺️ Interactive Cyber Metro Map
- Interactive Leaflet map rendering all 3 lines in official colors (Red `#EF4444`, Blue `#3B82F6`, Green `#10B981`).
- Custom station markers with glowing pulses for interchange hubs.
- Real-time user position marker with expanding radar ring and live speed tag.
- Active route highlighted with a glowing cyan polyline.

### 6. 🎮 Interactive Train Simulator (Test Anytime Anywhere)
- Don't need to be on an active train to test!
- Click **"Test Ride" / "Start Train Sim"** to simulate a ride along any route at **1x, 2x, 5x, or 10x speed**.
- Simulates real train acceleration, station dwell, speed drop on approach, and triggers all notifications, vibrations, voice alerts, and map tracking!

### 7. 👤 Frictionless Zero-Hassle Login / Profile
- Immediate Guest mode — no blocking login screens.
- Optional commuter profile with basic username and password (no Gmail / Google OAuth complications).

---

## 🚀 Running the App Locally

```bash
# 1. Install dependencies
npm install

# 2. Run the Vite development server
npm run dev

# 3. Access in browser
http://127.0.0.1:5173
```
