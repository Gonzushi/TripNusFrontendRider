import Env from '@env';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthContext } from '@/lib/auth';
import {
  type FareResponse,
  type Location,
  type RouteDetails,
} from '@/types/fare';

// Constants
const GOOGLE_API_KEY = Env.GOOGLE_API_KEY;
const dev = false;

// Types
type Coordinates = {
  latitude: number;
  longitude: number;
};

type VehicleType = {
  id: 'motorcycle' | 'car';
  name: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

type DebugData = {
  hasRef: boolean;
  polylineLength: number;
  polylineData: Array<Coordinates>;
};

type MapRef = React.RefObject<MapView | null>;

type LocationMarkerProps = {
  type: 'pickup' | 'dropoff';
  coordinate: Coordinates;
};

type AddressCardProps = {
  pickup: Location;
  dropoff: Location;
  onBack: () => void;
};

type VehicleOptionProps = {
  vehicle: Vehicle;
  isSelected: boolean;
  fares: FareResponse | null;
  onSelect: () => void;
};

type DebugOverlayProps = {
  mapRef: MapRef;
  routeDetails: RouteDetails;
};

// Vehicle Configuration
const VEHICLES: readonly VehicleType[] = [
  {
    id: 'motorcycle',
    name: 'TripNus Bike',
    icon: 'motorbike',
  },
  {
    id: 'car',
    name: 'TripNus Car',
    icon: 'car',
  },
] as const;

type Vehicle = (typeof VEHICLES)[number];

// Debug Tools
const debugTools = {
  log: (message: string, data?: unknown) => {
    if (dev) console.log(`[DEBUG] ${message}`, data || '');
  },
  mapState: (ref: MapRef, polyline: Array<Coordinates>) => {
    if (dev) {
      console.log('[DEBUG] [MAP STATE]', {
        hasRef: !!ref?.current,
        polylineLength: polyline?.length || 0,
        polylineData: polyline?.slice(0, 2) || [],
      } as DebugData);
    }
  },
};

// Components
const LocationMarker = ({ type, coordinate }: LocationMarkerProps) => (
  <Marker
    coordinate={coordinate}
    title={`${type === 'pickup' ? 'Pickup' : 'Drop-off'} Location`}
  >
    <View className="items-center">
      <MaterialCommunityIcons
        name="map-marker"
        size={40}
        color={type === 'pickup' ? '#3B82F6' : '#EF4444'}
      />
    </View>
  </Marker>
);

const AddressCard = ({ pickup, dropoff, onBack }: AddressCardProps) => (
  <View className="absolute left-4 right-4 top-20 z-10">
    <View className="flex-row items-center space-x-3">
      <TouchableOpacity
        onPress={onBack}
        className="my-6 mr-3 self-start rounded-xl bg-white p-2.5 shadow"
      >
        <Ionicons name="arrow-back" size={18} color="#111827" />
      </TouchableOpacity>

      <View className="flex-1 rounded-xl bg-white px-3 py-2.5 shadow-lg">
        <View className="flex-row items-center space-x-3">
          <View className="ml-2 mr-4 justify-between" style={{ width: 12 }}>
            <View className="mx-auto h-3 w-3 rounded-full bg-blue-600" />
            <View className="mx-auto h-6 w-[1px] bg-gray-300" />
            <View className="mx-auto h-3 w-3 rounded-full bg-red-600" />
          </View>
          <View className="flex-1 space-y-2 py-2">
            <View className="border-b border-gray-100 pb-2">
              <Text
                className="text-sm font-medium text-gray-900"
                numberOfLines={1}
              >
                {pickup.address}
              </Text>
            </View>
            <View>
              <Text
                className="pt-2 text-sm font-medium text-gray-900"
                numberOfLines={1}
              >
                {dropoff.address}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  </View>
);

// Add a utility function for number formatting
const formatPrice = (price: number): string => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const VehicleOption = ({
  vehicle,
  isSelected,
  fares,
  onSelect,
}: VehicleOptionProps) => {
  const fare = fares?.[vehicle.id as keyof FareResponse];

  return (
    <TouchableOpacity
      onPress={onSelect}
      className={`mb-2 rounded-xl border px-3 py-2.5 ${
        isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'
      }`}
    >
      <View className="flex-row items-center">
        <View
          className={`rounded-lg p-1.5 ${
            isSelected ? 'bg-blue-100' : 'bg-gray-100'
          }`}
        >
          <MaterialCommunityIcons
            name={vehicle.icon}
            size={20}
            color={isSelected ? '#3B82F6' : '#4B5563'}
          />
        </View>
        <View className="ml-3 flex-1 flex-row items-center justify-between">
          <View>
            <Text className="font-medium text-gray-900">{vehicle.name}</Text>
          </View>
          <Text className="font-medium text-gray-900">
            Rp {fare ? formatPrice(fare.total_fare) : '-'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const DebugOverlay = ({ mapRef, routeDetails }: DebugOverlayProps) => {
  if (!dev) return null;

  return (
    <View
      style={{
        position: 'absolute',
        top: 120,
        left: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 10,
        borderRadius: 8,
        zIndex: 1000,
      }}
    >
      <Text style={{ color: 'white', fontSize: 12 }}>
        🗺 Map Ref: {mapRef.current ? '✅' : '❌'}
        {'\n'}
        📍 Polyline Points: {routeDetails.polyline.length}
        {'\n'}
        🎯 First Point:{' '}
        {routeDetails.polyline[0]
          ? `${routeDetails.polyline[0].latitude.toFixed(
              4
            )}, ${routeDetails.polyline[0].longitude.toFixed(4)}`
          : 'None'}
        {'\n'}
        📏 Distance: {routeDetails.distance.toFixed(2)} km
        {'\n'}⏱ Duration: {routeDetails.duration} mins
      </Text>
    </View>
  );
};

// Utility Functions
const decodePolyline = (encoded: string) => {
  const points = [];
  let index = 0,
    lat = 0,
    lng = 0;

  while (index < encoded.length) {
    let shift = 0,
      result = 0;
    let byte;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({
      latitude: lat * 1e-5,
      longitude: lng * 1e-5,
    });
  }
  return points;
};

const NoRouteError = ({ onBack }: { onBack: () => void }) => (
  <View className="flex-1 items-center justify-center bg-gray-100 px-4">
    <MaterialCommunityIcons name="map-marker-off" size={48} color="#EF4444" />
    <Text className="mt-4 text-center text-lg font-medium text-gray-900">
      No Route Available
    </Text>
    <Text className="mb-6 mt-2 text-center text-gray-600">
      We couldn't find a valid route between these locations. The destination
      might be unreachable or too far.
    </Text>
    <TouchableOpacity
      onPress={onBack}
      className="rounded-xl bg-blue-600 px-6 py-3 active:bg-blue-600"
    >
      <Text className="font-semibold text-white">
        Choose Different Location
      </Text>
    </TouchableOpacity>
  </View>
);

// Main Component
export default function FareCalculation() {
  const authState = useContext(AuthContext);
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  // States
  const [isPolylineDrawn, setIsPolylineDrawn] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>(VEHICLES[0]);
  const [routeDetails, setRouteDetails] = useState<RouteDetails>({
    distance: 0,
    duration: 0,
    polyline: [],
    fares: null,
  });

  // Parse locations from params
  const pickup: Location = {
    latitude: parseFloat(params.pickupLat as string),
    longitude: parseFloat(params.pickupLng as string),
    address: params.pickupAddress as string,
  };

  const dropoff: Location = {
    latitude: parseFloat(params.dropoffLat as string),
    longitude: parseFloat(params.dropoffLng as string),
    address: params.dropoffAddress as string,
  };

  // Map Functions
  const getInitialRegion = () => {
    const minLat = Math.min(pickup.latitude, dropoff.latitude);
    const maxLat = Math.max(pickup.latitude, dropoff.latitude);
    const minLng = Math.min(pickup.longitude, dropoff.longitude);
    const maxLng = Math.max(pickup.longitude, dropoff.longitude);

    const latDelta = (maxLat - minLat) * 1.5;
    const lngDelta = (maxLng - minLng) * 1.5;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.02),
      longitudeDelta: Math.max(lngDelta, 0.02),
    };
  };

  const fitToRoute = (
    polyline: Array<{ latitude: number; longitude: number }>
  ) => {
    if (mapRef.current && polyline.length > 0) {
      mapRef.current.fitToCoordinates(polyline, {
        edgePadding: {
          top: 175,
          right: 50,
          bottom: 125,
          left: 50,
        },
        animated: true,
      });
    }
  };

  // API Functions
  const fetchFareDetails = async (distance: number, duration: number) => {
    try {
      const response = await fetch('https://rest.trip-nus.com/fare/calculate', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer ' + authState.authData?.session.access_token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          distanceM: distance,
          durationSec: duration,
        }),
      });

      const data = await response.json();

      if (data.status === 200) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.log('Error fetching fare:', error);
      return null;
    }
  };

  const fetchRouteDetails = async () => {
    try {
      debugTools.log('Fetching route details...');

      const response = await fetch(
        `https://routes.googleapis.com/directions/v2:computeRoutes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_API_KEY,
            'X-Goog-FieldMask':
              'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline',
          },
          body: JSON.stringify({
            origin: {
              location: {
                latLng: {
                  latitude: pickup.latitude,
                  longitude: pickup.longitude,
                },
              },
            },
            destination: {
              location: {
                latLng: {
                  latitude: dropoff.latitude,
                  longitude: dropoff.longitude,
                },
              },
            },
            travelMode: 'DRIVE',
            routingPreference: 'TRAFFIC_AWARE',
            computeAlternativeRoutes: false,
            languageCode: 'id-ID',
            units: 'METRIC',
            routeModifiers: {
              avoidFerries: true,
            },
          }),
        }
      );

      const data = await response.json();
      debugTools.log('Route API Response:', data);

      // Check if the response is empty or has no routes
      if (!data || !data.routes || data.routes.length === 0) {
        setRouteDetails({
          distance: 0,
          duration: 0,
          polyline: [],
          fares: null,
          error: 'NO_ROUTE',
        });
        return null;
      }

      const route = data.routes[0];
      const distanceM = route.distanceMeters;
      const durationSec = Math.ceil(parseInt(route.duration.replace('s', '')));
      const decodedPolyline = decodePolyline(route.polyline.encodedPolyline);

      // Fetch fare details
      const fareDetails = await fetchFareDetails(distanceM, durationSec);

      const routeData: RouteDetails = {
        distance: distanceM,
        duration: durationSec,
        polyline: decodedPolyline,
        fares: fareDetails,
        error: null,
      };

      setRouteDetails(routeData);

      if (decodedPolyline.length > 0) {
        setIsPolylineDrawn(true);
        setTimeout(() => fitToRoute(decodedPolyline), 500);
      }

      return routeData;
    } catch (error) {
      debugTools.log('Error in fetchRouteDetails:', error);
      console.error('Error fetching route:', error);
      setRouteDetails({
        distance: 0,
        duration: 0,
        polyline: [],
        fares: null,
        error: 'NETWORK_ERROR',
      });
      return null;
    } finally {
    }
  };

  // Event Handlers
  const handleConfirmRide = async () => {
    try {
      if (!routeDetails.fares || !selectedVehicle) return;

      const fareDetails =
        routeDetails.fares[selectedVehicle.id as keyof FareResponse];
      if (!fareDetails) return;

      const response = await fetch('https://rest.trip-nus.com/ride', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${authState.authData?.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          distance_m: routeDetails.distance,
          duration_s: routeDetails.duration,
          vehicle_type: selectedVehicle.id,
          service_variant: fareDetails.service_variant,
          fare: fareDetails.total_fare,
          platform_fee: fareDetails.platform_fee,
          driver_earning: fareDetails.driver_earning,
          app_commission: fareDetails.app_commission,
          fare_breakdown: {
            base_fare: fareDetails.fare_breakdown.base_fare,
            distance_fare: fareDetails.fare_breakdown.distance_fare,
            duration_fare: fareDetails.fare_breakdown.duration_fare,
            rounding_adjustment: fareDetails.fare_breakdown.rounding_adjustment,
            platform_fee: fareDetails.platform_fee,
          },
          planned_pickup_coords: [pickup.longitude, pickup.latitude],
          planned_pickup_address: pickup.address,
          planned_dropoff_coords: [dropoff.longitude, dropoff.latitude],
          planned_dropoff_address: dropoff.address,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Navigate to ride tracking or confirmation screen
        router.replace({
          pathname: '/(protected)/ride-request',
          params: {
            rideId: data.data.id,
            status: 'finding-driver',
          },
        });
      } else {
        Alert.alert(
          'Error',
          data.message || 'Failed to create ride request. Please try again.'
        );
      }
    } catch (error) {
      console.error('Error creating ride:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again later.'
      );
    }
  };

  // Effects
  useEffect(() => {
    fetchRouteDetails();
  }, []);

  return (
    <View className="flex-1 bg-gray-50">
      {routeDetails.error === 'NO_ROUTE' ? (
        <View className="absolute inset-0 z-50 bg-white">
          <NoRouteError onBack={() => router.back()} />
        </View>
      ) : (
        <>
          {/* Map Section */}
          <View className="h-[62%]">
            <AddressCard
              pickup={pickup}
              dropoff={dropoff}
              onBack={() => router.back()}
            />

            {isPolylineDrawn ? (
              <View className="flex-1">
                <MapView
                  ref={mapRef}
                  provider={PROVIDER_GOOGLE}
                  style={{ flex: 1 }}
                  initialRegion={getInitialRegion()}
                  onLayout={() => {
                    if (routeDetails.polyline.length > 0) {
                      fitToRoute(routeDetails.polyline);
                    }
                  }}
                >
                  {routeDetails.polyline.length > 0 && (
                    <Polyline
                      coordinates={routeDetails.polyline}
                      strokeWidth={4}
                      strokeColor="#3B82F6"
                      strokeColors={['#3B82F6']}
                      lineDashPattern={[1]}
                    />
                  )}

                  <LocationMarker type="pickup" coordinate={pickup} />
                  <LocationMarker type="dropoff" coordinate={dropoff} />
                </MapView>
              </View>
            ) : (
              <View className="flex-1 items-center justify-center bg-white pt-40">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="px-4 text-center text-gray-600">
                  Calculating the best route for you...
                </Text>
              </View>
            )}

            <DebugOverlay mapRef={mapRef} routeDetails={routeDetails} />
          </View>

          {/* Details Section */}
          <View className="-mt-1 flex-1 rounded-t-xl bg-white pt-4 shadow-xl">
            <ScrollView className="flex-1">
              {/* Vehicle Selection */}
              <View className="px-4 py-2">
                <Text className="mb-2 text-base font-medium text-gray-900">
                  Select Vehicle Type
                </Text>
                <View className="space-y-2">
                  {VEHICLES.map((vehicle) => (
                    <VehicleOption
                      key={vehicle.id}
                      vehicle={vehicle}
                      isSelected={selectedVehicle.id === vehicle.id}
                      fares={routeDetails.fares}
                      onSelect={() => setSelectedVehicle(vehicle)}
                    />
                  ))}
                </View>
              </View>

              {/* Payment Method */}
              <View className="border-t border-gray-100 px-4 py-2">
                <Text className="mb-2 text-base font-medium text-gray-900">
                  Payment Method
                </Text>
                <View className="rounded-xl border border-gray-200 bg-white px-3 py-2.5">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View className="rounded-lg bg-blue-50 p-1.5">
                        <MaterialCommunityIcons
                          name="qrcode-scan"
                          size={20}
                          color="#3B82F6"
                        />
                      </View>
                      <View className="ml-3">
                        <Text className="font-medium text-gray-900">QRIS</Text>
                        <Text className="text-xs text-gray-500">
                          Scan QR to pay at destination
                        </Text>
                      </View>
                    </View>
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={20}
                      color="#3B82F6"
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Bottom Bar */}
            <View
              className="border-t border-gray-200 bg-white px-4 py-3"
              style={{ paddingBottom: insets.bottom + 12 }}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-xs text-gray-500">Total Fare</Text>
                  <Text className="text-xl font-bold text-gray-900">
                    Rp{' '}
                    {isPolylineDrawn
                      ? formatPrice(
                          routeDetails.fares?.[
                            selectedVehicle.id as keyof FareResponse
                          ]?.total_fare || 0
                        )
                      : '-'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleConfirmRide}
                  disabled={!isPolylineDrawn}
                  className={`rounded-xl px-6 py-3 ${
                    isPolylineDrawn
                      ? 'bg-blue-600 active:bg-blue-700'
                      : 'bg-gray-300'
                  }`}
                >
                  <Text className="font-semibold text-white">Confirm Ride</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </>
      )}
    </View>
  );
}
