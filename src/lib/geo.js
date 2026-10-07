/**
 * High-Precision Geolocation & Metro Path Math Library
 * Designed specifically to handle real-world GPS jitter, elevated viaduct reflections,
 * and high-speed transit movement in the Hyderabad Metro network.
 */

const EARTH_RADIUS_METERS = 6371000;

/**
 * Calculates the great-circle distance between two GPS coordinates using the Haversine formula.
 * @returns {number} Distance in meters
 */
export function getDistanceMeters(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return Infinity;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

/**
 * Calculates initial compass bearing from point 1 to point 2.
 * @returns {number} Bearing in degrees (0 - 360)
 */
export function getBearing(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const dLon = toRad(lon2 - lon1);

  const y = Math.sin(dLon) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLon);

  const brng = toDeg(Math.atan2(y, x));
  return (brng + 360) % 360;
}

/**
 * Formats distance into clean human readable string
 */
export function formatDistance(meters) {
  if (meters == null || isNaN(meters) || meters === Infinity) return '--';
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

/**
 * Formats speed in km/h
 */
export function formatSpeed(speedKmh) {
  if (speedKmh == null || isNaN(speedKmh) || speedKmh < 0) return '0 km/h';
  return `${Math.round(speedKmh)} km/h`;
}

/**
 * Formats ETA seconds into human-readable string (e.g. "3 min", "45 sec")
 */
export function formatEta(seconds) {
  if (seconds == null || isNaN(seconds) || seconds < 0 || seconds === Infinity) return 'Calculating...';
  if (seconds < 60) {
    return `${Math.max(5, Math.round(seconds))} sec`;
  }
  const mins = Math.floor(seconds / 60);
  const remSecs = Math.round(seconds % 60);
  if (mins < 60) {
    return remSecs > 10 ? `${mins}m ${remSecs}s` : `${mins} min`;
  }
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hours}h ${remMins}m`;
}

/**
 * Finds the nearest metro station to given coordinates from a station list.
 */
export function findNearestStation(lat, lng, stations) {
  if (!stations || !stations.length || lat == null || lng == null) return null;

  let nearest = null;
  let minDistance = Infinity;

  for (const station of stations) {
    const dist = getDistanceMeters(lat, lng, station.lat, station.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = station;
    }
  }

  return nearest ? { station: nearest, distanceMeters: minDistance } : null;
}

/**
 * Computes estimated time of arrival based on current speed or average metro train speed (38 km/h).
 * Hyderabad Metro average operational cruising speed is ~35-45 km/h including stops.
 */
export function calculateETASeconds(distanceMeters, currentSpeedKmh) {
  if (distanceMeters <= 0) return 0;
  // If current speed is reasonable (> 12 km/h), blend it with standard transit cruising speed
  const effectiveSpeedKmh = currentSpeedKmh && currentSpeedKmh > 12 ? Math.min(65, Math.max(25, currentSpeedKmh)) : 38;
  const speedMps = (effectiveSpeedKmh * 1000) / 3600;
  return Math.round(distanceMeters / speedMps);
}

/**
 * 1D Kalman-inspired Exponential Smoother for GPS coordinates to eliminate
 * multipath and reflection noise from high-rise buildings and metro viaducts.
 */
export class GPSFilter {
  constructor(smoothingFactor = 0.65) {
    this.alpha = smoothingFactor;
    this.lat = null;
    this.lng = null;
    this.lastTimestamp = null;
    this.speedKmh = 0;
  }

  update(rawLat, rawLng, rawSpeedKmh = null, timestamp = Date.now()) {
    if (this.lat === null || this.lng === null) {
      this.lat = rawLat;
      this.lng = rawLng;
      this.lastTimestamp = timestamp;
      this.speedKmh = rawSpeedKmh || 0;
      return { lat: this.lat, lng: this.lng, speedKmh: this.speedKmh };
    }

    const dt = (timestamp - this.lastTimestamp) / 1000;
    const distanceM = getDistanceMeters(this.lat, this.lng, rawLat, rawLng);

    // Filter out physically impossible teleports (e.g., > 120 km/h in metro)
    if (dt > 0 && distanceM / dt > 35) { // 35 m/s = 126 km/h
      // GPS glitch: reject sudden jump or heavily damp
      return { lat: this.lat, lng: this.lng, speedKmh: this.speedKmh };
    }

    // Exponential smoothing
    this.lat = this.lat * (1 - this.alpha) + rawLat * this.alpha;
    this.lng = this.lng * (1 - this.alpha) + rawLng * this.alpha;

    if (rawSpeedKmh !== null && rawSpeedKmh >= 0) {
      this.speedKmh = rawSpeedKmh;
    } else if (dt > 0.5) {
      this.speedKmh = (distanceM / dt) * 3.6;
    }

    this.lastTimestamp = timestamp;
    return { lat: this.lat, lng: this.lng, speedKmh: this.speedKmh };
  }

  reset() {
    this.lat = null;
    this.lng = null;
    this.lastTimestamp = null;
    this.speedKmh = 0;
  }
}
