import { Text, View } from 'react-native';

import { type MapRef, type RouteDetails } from '../types';

type DebugOverlayProps = {
  mapRef: MapRef;
  routeDetails: RouteDetails;
};

export default function DebugOverlay({
  mapRef,
  routeDetails,
}: DebugOverlayProps) {
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
        📏 Distance: {routeDetails.distance.toFixed(2)} m
        {'\n'}⏱ Duration: {routeDetails.duration} sec
      </Text>
    </View>
  );
}
