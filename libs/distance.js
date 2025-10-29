/**
 * Calculate the distance between two geographic coordinates using the Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} Distance in miles
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance; // distance in miles
}

/**
 * Format distance for display
 * @param {number} distance - Distance in miles
 * @returns {string} Formatted distance string
 */
export function formatDistance(distance) {
  if (distance < 0.1) {
    return 'Less than 0.1 miles away';
  } else if (distance < 1) {
    return `${distance.toFixed(1)} miles away`;
  } else {
    return `${distance.toFixed(1)} miles away`;
  }
}
