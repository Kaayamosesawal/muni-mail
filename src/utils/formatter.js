/**
 * Data Formatting Utilities
 */

// Formats Firebase Timestamps into "2 mins ago" or "Oct 12"
export const formatTimeAgo = (date) => {
  if (!date) return '';
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString('en-UG', { 
    month: 'short', 
    day: 'numeric' 
  });
};

// Formats large numbers (e.g., 1500 -> 1.5k)
export const formatNumber = (num) => {
  return Intl.NumberFormat('en-US', {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(num);
};

// Capitalizes strings (e.g., "science" -> "Science")
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};