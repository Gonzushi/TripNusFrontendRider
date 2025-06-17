export const RIDER_LOCATION_KEY = 'rider-location';

export const SAVE_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes
export const MAX_CACHE_AGE_MS = 30 * 60 * 1000;
export const DEBOUNCE_SUB_DELAY_MS = 300;

export const INTERNAL_SOCKET_EVENTS = [
  'connect',
  'disconnect',
  'connect_error',
  'reconnect',
  'reconnect_attempt',
  'reconnect_failed',
  'ping',
  'pong',
];
