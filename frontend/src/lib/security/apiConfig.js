// Check if required environment variables are set
if (!import.meta.env.VITE_API_URL) {
  throw new Error('VITE_API_URL is not set in environment variables');
}

// API configuration
export const API_URL = import.meta.env.VITE_API_URL;

/**
 * Creates security headers for API requests
 * @returns {Object} - Object containing security headers
 */
export const getSecurityHeaders = () => ({
  'Content-Type': 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
  'X-Client-Version': import.meta.env.VITE_CLIENT_VERSION || '1.0.0',
  'X-Client-Timestamp': new Date().toISOString()
});

/**
 * Default axios configuration for secure requests
 */
export const secureAxiosConfig = {
  headers: getSecurityHeaders(),
  withCredentials: true // Enable if using cookies/sessions
}; 