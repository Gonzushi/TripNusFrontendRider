import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { io, type Socket } from 'socket.io-client';

import NotificationHandler from '../notification-handler';
import {
  DEBOUNCE_SUB_DELAY_MS,
  INTERNAL_SOCKET_EVENTS,
  MAX_CACHE_AGE_MS,
  RIDER_LOCATION_KEY,
} from './constants';
import { debugLog } from './utils';

// Constants
const DEBUG_MODE = false;
const WEBSOCKET_URL = 'wss://ws.trip-nus.com';
// const WEBSOCKET_URL = 'http://localhost:3001';
// const WEBSOCKET_URL = 'http://192.168.100.212:3001';

export type LocationWithHeading = {
  latitude: number;
  longitude: number;
  heading_deg: number;
};
export type DriverLocationListener = (location: LocationWithHeading) => void;

class WebSocketService {
  socket: Socket | null = null;
  private riderId: string | null = null;
  private currentLocation: Location.LocationObject | null = null;
  private subscribedDriverId: string | null = null;
  private lastDriverLocation: LocationWithHeading | null = null;
  private driverLocationListeners: Set<DriverLocationListener> = new Set();

  private lastSubscribeTime = 0;
  private lastUnsubscribeTime = 0;

  private isConnecting = false;
  private hasSetupListeners = false;
  private lastRegisterAt: number = 0;

  constructor() {
    this.socket = null;
    this.riderId = null;
  }

  // Save current location to AsyncStorage
  private async saveCurrentLocation() {
    if (!this.currentLocation) return;

    try {
      await AsyncStorage.setItem(
        RIDER_LOCATION_KEY,
        JSON.stringify({
          ...this.currentLocation,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.warn('⚠️ Failed to save location to storage:', error);
    }
  }

  // Load last known location from AsyncStorage
  private async loadCachedLocation(): Promise<Location.LocationObject | null> {
    try {
      const json = await AsyncStorage.getItem(RIDER_LOCATION_KEY);
      if (json) {
        const parsed = JSON.parse(json);
        if (
          parsed?.coords &&
          typeof parsed.coords.latitude === 'number' &&
          typeof parsed.coords.longitude === 'number' &&
          parsed.timestamp
        ) {
          return parsed as Location.LocationObject;
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to load location from storage:', error);
    }
    return null;
  }

  // Use cached location if recent, otherwise fetch new location
  private async loadOrFetchLocation() {
    const cached = await this.loadCachedLocation();

    if (cached && cached.timestamp) {
      const age = Date.now() - new Date(cached.timestamp).getTime();
      if (age < MAX_CACHE_AGE_MS) {
        this.currentLocation = cached;
        return;
      }
    }

    // If cache is missing or stale
    await this.getCurrentLocation();
  }

  // Request foreground location permissions
  async requestLocationPermission(): Promise<boolean> {
    try {
      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        console.log('Permission to access location was denied');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  // Log all events for debugging
  private async watchAllSocketEvents(socket: Socket) {
    // Custom and dynamic events
    socket.onAny((event, ...args) => {
      console.log(`📥 [socket:onAny] ${event} |`, ...args);
    });

    // Internal events that don't go through onAny
    for (const event of INTERNAL_SOCKET_EVENTS) {
      socket.on(event, (...args) => {
        console.log(`⚙️  [socket:internal] ${event} |`, ...args);
      });
    }
  }

  // Connect to websocket server
  async connect(riderId: string): Promise<void> {
    if (this.isConnecting) {
      console.log(
        '⚠️ WebSocket is currently connecting. Ignoring duplicate call.'
      );
      return;
    }

    this.isConnecting = true;

    try {
      if (this.socket?.connected && this.riderId === riderId) {
        console.log(
          `✅ Websocket already connected with same rider info, connection: ${this.socket.connected} - ${this.socket.id}`
        );
        await this.loadOrFetchLocation();
        await this.sendLocationUpdate();
        return;
      }

      if (this.socket?.connected) {
        console.log('Disconnecting existing connection before reconnecting');
        this.disconnect();
      }

      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        console.error('Location permission denied');
        return;
      }

      this.riderId = riderId;

      return new Promise<void>(async (resolve, reject) => {
        this.socket = io(WEBSOCKET_URL, {
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 2000,
        });

        this.socket.once('connect', async () => {
          // Clean up ghost socket from hot reload
          if (globalThis.__TRIPNUS_SOCKET__?.id !== this.socket?.id) {
            globalThis.__TRIPNUS_SOCKET__?.disconnect?.();
          }
          globalThis.__TRIPNUS_SOCKET__ = this.socket;

          console.log(
            '✅ Websocket Connected to server with ID:',
            this.socket?.id
          );

          try {
            await this.getCurrentLocation();
            await this.registerRider();

            resolve();
          } catch (error) {
            console.error('❌ Error during websocket setup:', error);
            reject(error);
          }
        });

        this.socket.once('connect_error', (err: Error) => {
          console.error('⚠️ Connection error:', err.message);
          this.isConnecting = false;
          reject(err);
        });

        await this.setupEventListeners();
        if (DEBUG_MODE) this.watchAllSocketEvents(this.socket!);
      });
    } catch (error) {
      console.error('❌ Unhandled error during connect:', error);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  // Listen for driver location updates and notify listeners
  private async setupEventListeners() {
    if (!this.socket || this.hasSetupListeners) return;
    this.hasSetupListeners = true;

    this.socket.on('message', async (data) => {
      debugLog(DEBUG_MODE, '📩 Server:', data);
      await NotificationHandler(data, router);
    });

    this.socket.io.on('reconnect', async () => {
      console.log('🔄 Reconnected to server');
      try {
        await this.loadOrFetchLocation();
        await this.registerRider();
        if (this.subscribedDriverId) {
          await this.subscribeToDriver(this.subscribedDriverId);
        }
      } catch (error) {
        console.error('❌ Failed to re-register after reconnect:', error);
      }
    });

    this.socket.io.on('reconnect_failed', () => {
      console.warn(
        '⚠️ Socket temporarily unable to reconnect. Will keep trying.'
      );
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Websocket is disconnected due to:', reason);
    });

    this.socket.on('connect_error', (err: Error) => {
      console.error('⚠️ Connection error (repeat):', err.message);
    });

    this.socket?.on('driver:locationUpdate', (payload: LocationWithHeading) => {
      this.lastDriverLocation = payload;
      for (const listener of this.driverLocationListeners) {
        listener(payload);
      }
    });
  }

  // Fetch current GPS location
  private async getCurrentLocation() {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    this.currentLocation = location;
    await this.saveCurrentLocation();
  }

  // Build driver data payload for register/update
  private createRiderData() {
    if (!this.riderId || !this.currentLocation)
      throw new Error('Missing rider data');

    return {
      socketId: this.socket!.id!,
      role: 'rider',
      id: this.riderId,
      lat: this.currentLocation.coords.latitude,
      lng: this.currentLocation.coords.longitude,
      last_updated_at: new Date().toISOString(),
    };
  }

  // Emit rider registration event
  private async registerRider() {
    if (!this.socket || !this.riderId || !this.currentLocation) return;

    const now = Date.now();
    if (now - this.lastRegisterAt < 3000) return;
    this.lastRegisterAt = now;

    try {
      const data = this.createRiderData();

      this.socket.emit('register', data, async (res: { success: boolean }) => {
        if (res.success) {
          // await this.sendLocationUpdate();
        } else {
          console.error('❌ Registration failed on server.');
        }
      });
    } catch (error) {
      console.error('Failed to register driver:', error);
    }
  }

  // Emit location update to server
  async sendLocationUpdate() {
    if (!this.socket || !this.riderId || !this.currentLocation) return;

    try {
      const data = this.createRiderData();
      this.socket.emit('rider:updateLocation', data);

      console.log(
        `📍 Location Websocket - Lat: ${this.currentLocation.coords.latitude.toFixed(
          6
        )}, Lng: ${this.currentLocation.coords.longitude.toFixed(6)}`
      );
    } catch (error) {
      console.error('Failed to send location update:', error);
    }
  }

  // Subscribe to driver location
  async subscribeToDriver(driverId: string): Promise<void> {
    const now = Date.now();

    if (now - this.lastSubscribeTime < DEBOUNCE_SUB_DELAY_MS) {
      return;
    }

    if (!this.socket) return;
    
    this.lastSubscribeTime = now;
    
    this.subscribedDriverId = driverId;

    return new Promise((resolve, reject) => {
      this.socket!.emit(
        'rider:subscribeToDriver',
        { driverId },
        (response: { success: boolean; message: string }) => {
          if (response?.success) {
            console.log('[websocket] Subscribed to driver', driverId);
            resolve();
          } else {
            this.subscribedDriverId = null;
            reject(new Error('Failed to subscribe'));
          }
        }
      );
    });
  }

  // Unubscribe to driver location
  async unsubscribeFromDriver(): Promise<void> {
    const now = Date.now();

    if (now - this.lastUnsubscribeTime < DEBOUNCE_SUB_DELAY_MS) {
      return;
    }

    if (!this.socket || !this.subscribedDriverId) return;

    this.lastUnsubscribeTime = now;

    const driverId = this.subscribedDriverId;

    return new Promise((resolve, reject) => {
      this.socket!.emit(
        'rider:unsubscribeFromDriver',
        { driverId },
        (response: { success: boolean; message: string }) => {
          if (response?.success) {
            console.log('[websocket] Unsubscribed from driver', driverId);
            this.subscribedDriverId = null;
            resolve();
          } else {
            reject(new Error('Failed to unsubscribe'));
          }
        }
      );
    });
  }

  // Add a listener for driver location
  addDriverLocationListener(listener: DriverLocationListener) {
    this.driverLocationListeners.add(listener);
  }

  // Remove a previously added listener
  removeDriverLocationListener(listener: DriverLocationListener) {
    this.driverLocationListeners.delete(listener);
  }

  // Get last known driver location
  getLastDriverLocation() {
    return this.lastDriverLocation;
  }

  // Remove all socket listeners
  private cleanupEventListeners() {
    if (!this.socket) return;
    this.socket.off('message');
    this.socket.off('reconnect');
    this.socket.off('reconnect_failed');
    this.socket.off('disconnect');
    this.socket.off('connect_error');
    this.socket.off('register');
    this.hasSetupListeners = false;
  }

  // Reset internal state
  private cleanupSocketState() {
    this.socket = null;
    this.currentLocation = null;
    this.isConnecting = false;
    this.lastRegisterAt = 0;
  }

  // Disconnect from server and reset internal state
  async disconnect(fullReset = false) {
    console.log('❌ Disconnecting Websocket');

    this.cleanupEventListeners();

    if (this.socket?.connected) {
      this.socket.disconnect();
    }

    this.cleanupSocketState();

    if (fullReset) {
      this.riderId = null;
    }
  }
}

// Export a singleton instance
export const webSocketService = new WebSocketService();
