import * as Location from 'expo-location';
import { io, type Socket } from 'socket.io-client';

// Constants
const WEBSOCKET_URL = 'wss://ws.trip-nus.com';
// const WEBSOCKET_URL = 'http://localhost:3001';
// const WEBSOCKET_URL = 'http://192.168.100.212:3001';

export type LatLng = { latitude: number; longitude: number };
export type DriverLocationListener = (location: LatLng) => void;

class WebSocketService {
  socket: Socket | null = null;
  private riderId: string | null = null;
  private currentLocation: Location.LocationObject | null = null;
  private subscribedDriverId: string | null = null;
  private lastDriverLocation: LatLng | null = null;
  private driverLocationListeners: Set<DriverLocationListener> = new Set();

  constructor() {
    this.socket = null;
    this.riderId = null;
  }

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

  async connect(riderId: string): Promise<void> {
    if (this.socket?.connected && this.riderId === riderId) {
      console.log('✅ Websocket already connected with same rider info');
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

    return new Promise<void>((resolve, reject) => {
      console.log('Connecting to websocket');
      this.socket = io(WEBSOCKET_URL, {
        transports: ['websocket'],
      });

      console.log('Socket', this.socket);
      this.socket.once('connect', async () => {
        console.log(
          '✅ Websocket Connected to server with ID:',
          this.socket?.id
        );

        try {
          await this.getCurrentLocation();
          await this.registerRider();
          await this.handleDriverLocationUpdates();

          resolve();
        } catch (error) {
          console.error('❌ Error during websocket setup:', error);
          reject(error);
        }
      });

      this.socket.once('connect_error', (err: Error) => {
        console.error('⚠️ Connection error:', err.message);
        reject(err);
      });
    });
  }

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

  private async getCurrentLocation() {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    this.currentLocation = location;
  }

  private async registerRider() {
    if (!this.socket || !this.riderId || !this.currentLocation) return;

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

  async sendLocationUpdate() {
    if (!this.socket || !this.riderId || !this.currentLocation) return;

    try {
      await this.getCurrentLocation();

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
    // Already subscribed to the same driver
    if (this.subscribedDriverId === driverId) {
      return;
    }

    return new Promise((resolve, reject) => {
      if (!this.socket) return resolve();

      this.subscribedDriverId = driverId;

      this.socket.emit(
        'rider:subscribeToDriver',
        { driverId },
        (response: { success: boolean; message: string }) => {
          if (response?.success) {
            console.log('[websocket] Subscribed to driver', driverId);
            resolve();
          } else {
            this.subscribedDriverId = null; // Reset on failure
            reject(new Error('Failed to subscribe'));
          }
        }
      );
    });
  }

  // Unsubscribe from current driver
  async unsubscribeFromDriver(): Promise<void> {
    if (!this.socket || !this.subscribedDriverId) return;

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

  // Listen for driver location updates and notify listeners
  private async handleDriverLocationUpdates() {
    this.socket?.on('driver:locationUpdate', (payload: LatLng) => {
      this.lastDriverLocation = payload;
      for (const listener of this.driverLocationListeners) {
        listener(payload);
      }
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

  // Disconnect from server
  async disconnect() {
    console.log(' ❌ Disconnecting websocket');
    if (this.socket) {
      if (this.subscribedDriverId) {
        await this.unsubscribeFromDriver();
      }
      this.socket.disconnect();
      this.socket = null;
      this.riderId = null;
      this.currentLocation = null;
      this.lastDriverLocation = null;
      this.driverLocationListeners.clear();
    }
  }
}

// Export a singleton instance
export const webSocketService = new WebSocketService();
