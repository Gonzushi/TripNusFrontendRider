import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fetchRouteDetails } from '@/features/fare-calculation/api';
import fetchNearbyDrivers from '@/features/fare-calculation/api/fetch-nearby-drivers';
import {
  AddressCard,
  DebugOverlay,
  LocationMarker,
  NoRouteError,
  VehicleOption,
} from '@/features/fare-calculation/components';
import { VEHICLES } from '@/features/fare-calculation/constants';
import type { NearbyDrivers } from '@/features/fare-calculation/types';
import {
  type FareResponse,
  type Location,
  type RouteDetails,
  type Vehicle,
} from '@/features/fare-calculation/types';
import { formatPrice } from '@/features/fare-calculation/utils';
import { AuthContext } from '@/lib/auth';
import { webSocketService } from '@/lib/background/websocket-service';

// Constants
const DEBUG_MODE = false;

// Main Component
export default function FareCalculation() {
  const authState = useContext(AuthContext);
  const accessToken = authState.authData!.session.access_token;
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  // States
  const [nearbyDrivers, setNearbyDrivers] = useState<NearbyDrivers | null>(
    null
  );
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
          bottom: 75,
          left: 50,
        },
        animated: true,
      });
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

      await webSocketService.connect(authState.authData!.riderId);

      if (response.ok) {
        router.replace('/active-ride/ride-details');
      } else {
        Alert.alert(
          'Error',
          data.message ||
            'Gagal membuat permintaan perjalanan. Silakan coba lagi.'
        );
      }
    } catch (error) {
      console.error('Error creating ride:', error);
      Alert.alert(
        'Error',
        'Terjadi kesalahan yang tidak terduga. Silakan coba lagi nanti.'
      );
    }
  };

  function getClosestDriverEtaFromResponse(
    drivers: Array<{ distance_km: number }>
  ): number | null {
    if (!drivers.length) return null;

    const closestDistanceKm = Math.min(...drivers.map((d) => d.distance_km));
    const speedKmH = 20;
    const etaMinutes = (closestDistanceKm / speedKmH) * 60;

    return Math.round(etaMinutes);
  }

  // Effects
  useEffect(() => {
    const loadRouteAndDrivers = async () => {
      const route = await fetchRouteDetails({
        accessToken,
        pickup,
        dropoff,
        setRouteDetails,
        setIsPolylineDrawn,
        fitToRoute,
      });

      if (!route || route.error) return;

      const drivers = await fetchNearbyDrivers({
        accessToken,
        pickup,
      });

      if (drivers) {
        setNearbyDrivers(drivers);
      }
    };

    loadRouteAndDrivers();
  }, []);

  const drivers = nearbyDrivers?.[selectedVehicle.id];

  return (
    <View className="flex-1 bg-gray-50">
      {routeDetails.error === 'NO_ROUTE' ? (
        <View className="absolute inset-0 z-50 bg-white">
          <NoRouteError onBack={() => router.back()} />
        </View>
      ) : (
        <>
          {/* Map Section */}
          <View className="flex-1">
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

                  {selectedVehicle &&
                    nearbyDrivers?.[selectedVehicle.id]?.map((driver) => (
                      <LocationMarker
                        key={driver.driver_id}
                        type={selectedVehicle.id as 'motorcycle' | 'car'}
                        coordinate={{
                          latitude: driver.latitude,
                          longitude: driver.longitude,
                        }}
                      />
                    ))}
                </MapView>
              </View>
            ) : (
              <View className="flex-1 items-center justify-center bg-white pt-40">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="px-4 text-center text-gray-600">
                  Menghitung rute terbaik untuk Anda...
                </Text>
              </View>
            )}

            {DEBUG_MODE && (
              <DebugOverlay mapRef={mapRef} routeDetails={routeDetails} />
            )}

            {/* Map Controls */}
            <View className="absolute bottom-4 right-4 flex-row gap-1">
              {/* Conditionally Render Locate Button */}
              {drivers && drivers.length > 0 && (
                <TouchableOpacity
                  className="h-12 w-12 items-center justify-center rounded-full bg-white shadow-md active:bg-gray-100"
                  onPress={() => {
                    const firstThree = drivers.slice(0, 3).map((d) => ({
                      latitude: d.latitude,
                      longitude: d.longitude,
                    }));
                    const coordsToFit = [pickup, ...firstThree];
                    fitToRoute(coordsToFit);
                  }}
                >
                  <Ionicons name="locate" size={24} color="#3B82F6" />
                </TouchableOpacity>
              )}

              {/* Always show Scan Button */}
              <TouchableOpacity
                className="h-12 w-12 items-center justify-center rounded-full bg-white shadow-md active:bg-gray-100"
                onPress={() => {
                  fitToRoute([pickup, dropoff]);
                }}
              >
                <Ionicons name="scan" size={24} color="#3B82F6" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Details Section */}
          <View className="-mt-1 rounded-t-xl bg-white pt-2 shadow-xl">
            {/* Vehicle Selection */}
            <View className="px-4 py-2">
              <Text className="mb-2 text-base font-medium text-gray-900">
                Pilih Jenis Kendaraan
              </Text>
              <View className="space-y-2">
                {VEHICLES.map((vehicle) => {
                  const driversForVehicle = nearbyDrivers?.[vehicle.id] ?? [];
                  const etaMinutes =
                    getClosestDriverEtaFromResponse(driversForVehicle);

                  return (
                    <VehicleOption
                      key={vehicle.id}
                      vehicle={vehicle}
                      isSelected={selectedVehicle.id === vehicle.id}
                      fares={routeDetails.fares}
                      onSelect={() => {
                        if (driversForVehicle.length > 0)
                          setSelectedVehicle(vehicle);
                      }}
                      disabled={driversForVehicle.length === 0}
                      etaMinutes={etaMinutes}
                    />
                  );
                })}
              </View>
            </View>

            {/* Payment Method */}
            <View className="border-t border-gray-100 px-4 py-2 pb-4">
              <Text className="mb-2 text-base font-medium text-gray-900">
                Metode Pembayaran
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
                        Pindai QR untuk membayar di tujuan
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

            {/* Bottom Bar */}
            <View
              className="border-t border-gray-200 bg-white px-4 py-3"
              style={{ paddingBottom: insets.bottom + 12 }}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-xs text-gray-500">Total Biaya</Text>
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
                  disabled={
                    !isPolylineDrawn ||
                    !nearbyDrivers?.[selectedVehicle.id] ||
                    nearbyDrivers[selectedVehicle.id].length === 0
                  }
                  className={`rounded-xl px-6 py-3 ${
                    isPolylineDrawn
                      ? 'bg-blue-600 active:bg-blue-700'
                      : 'bg-gray-300'
                  }`}
                >
                  <Text className="font-semibold text-white">
                    Konfirmasi Perjalanan
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </>
      )}
    </View>
  );
}
