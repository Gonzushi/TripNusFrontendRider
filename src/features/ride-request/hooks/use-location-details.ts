import { useCallback, useState } from 'react';

import { GOOGLE_API_KEY } from '../constants';
import { type Coordinates, type LocationDetail } from '../types';

export function useLocationDetails() {
  const [locationDetail, setLocationDetail] = useState<LocationDetail | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  const fetchLocationDetails = useCallback(
    async (selectedLocation: Coordinates) => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${selectedLocation.latitude},${selectedLocation.longitude}&key=${GOOGLE_API_KEY}`
        );
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const result = data.results[0];
          setLocationDetail({
            title: result.formatted_address.split(',')[0],
            address: result.formatted_address,
            coordinates: {
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            },
          });
        }
      } catch (error) {
        console.error('Error fetching location details:', error);
        setLocationDetail(null);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    locationDetail,
    isLoading,
    setIsLoading,
    fetchLocationDetails,
  };
}
