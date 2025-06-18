import { GOOGLE_API_KEY } from '../constants';
import type { Location } from '../types';
import { type RouteDetails } from '../types';
import { decodePolyline } from '../utils';
import fetchFareDetails from './fetch-fare-details';

type FetchRouteDetailsProps = {
  accessToken: string;
  pickup: Location;
  dropoff: Location;
  setRouteDetails: (routeDetails: RouteDetails) => void;
  setIsPolylineDrawn: (isPolylineDrawn: boolean) => void;
  fitToRoute: (
    polyline: Array<{ latitude: number; longitude: number }>
  ) => void;
};

export default async function fetchRouteDetails({
  accessToken,
  pickup,
  dropoff,
  setRouteDetails,
  setIsPolylineDrawn,
  fitToRoute,
}: FetchRouteDetailsProps) {
  try {
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
    const fareDetails = await fetchFareDetails({
      accessToken,
      distanceM,
      durationSec,
      pickup: {
        longitude: pickup.longitude,
        latitude: pickup.latitude,
      },
    });

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
}
