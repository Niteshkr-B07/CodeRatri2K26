import React, { useEffect, useRef } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { GeoPoint, TravelMode } from '../types';

export interface CalculatedRouteInfo {
  distanceText: string;
  distanceMeters: number;
  durationText: string;
  durationMinutes: number;
  travelMode: TravelMode;
  startAddress: string;
  endAddress: string;
}

interface MapRouteLayerProps {
  origin: GeoPoint;
  destination: GeoPoint | null;
  travelMode: TravelMode;
  onRouteCalculated: (info: CalculatedRouteInfo) => void;
  onRouteError: (errorMessage: string | null) => void;
}

export const MapRouteLayer: React.FC<MapRouteLayerProps> = ({
  origin,
  destination,
  travelMode,
  onRouteCalculated,
  onRouteError,
}) => {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const rendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!map) return;

    // Cleanup previous renderer
    if (!rendererRef.current) {
      if (typeof google !== 'undefined' && google.maps && google.maps.DirectionsRenderer) {
        rendererRef.current = new google.maps.DirectionsRenderer({
          map,
          suppressMarkers: true, // Render custom SafeTrip markers for user & destination
          preserveViewport: false,
          polylineOptions: {
            strokeColor: '#f43f5e', // rose-500 brand color
            strokeWeight: 6,
            strokeOpacity: 0.95,
          },
        });
      }
    }

    if (!destination) {
      if (rendererRef.current) {
        rendererRef.current.setMap(null);
      }
      onRouteError(null);
      return;
    }

    if (typeof google === 'undefined' || !google.maps || !google.maps.DirectionsService) {
      onRouteError('Google Directions service is unavailable. Check Maps Platform configuration.');
      return;
    }

    const directionsService = new google.maps.DirectionsService();

    // Map SafeTrip travel modes to Google Maps TravelMode
    let sdkMode = google.maps.TravelMode.WALKING;
    if (travelMode === 'transit') {
      sdkMode = google.maps.TravelMode.TRANSIT;
    } else if (travelMode === 'cab' || travelMode === 'driving') {
      sdkMode = google.maps.TravelMode.DRIVING;
    } else if (travelMode === 'cycling') {
      sdkMode = google.maps.TravelMode.BICYCLING;
    }

    const request: google.maps.DirectionsRequest = {
      origin: { lat: origin.lat, lng: origin.lng },
      destination: { lat: destination.lat, lng: destination.lng },
      travelMode: sdkMode,
      unitSystem: google.maps.UnitSystem.METRIC,
    };

    directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK && result && result.routes.length > 0) {
        onRouteError(null);
        if (rendererRef.current) {
          rendererRef.current.setMap(map);
          rendererRef.current.setDirections(result);
        }

        const primaryRoute = result.routes[0];
        const leg = primaryRoute.legs[0];

        if (leg) {
          const distanceText = leg.distance?.text || '0 km';
          const distanceMeters = leg.distance?.value || 0;
          const durationText = leg.duration?.text || '0 min';
          const durationMinutes = Math.max(1, Math.ceil((leg.duration?.value || 60) / 60));

          onRouteCalculated({
            distanceText,
            distanceMeters,
            durationText,
            durationMinutes,
            travelMode,
            startAddress: leg.start_address,
            endAddress: leg.end_address || destination.address,
          });
        }

        // Fit map bounds to show full route comfortably
        if (primaryRoute.bounds) {
          map.fitBounds(primaryRoute.bounds, {
            top: 80,
            bottom: 140,
            left: 40,
            right: 40,
          });
        }
      } else {
        if (rendererRef.current) {
          rendererRef.current.setMap(null);
        }

        let errorMsg = `Unable to calculate route (${status}).`;
        if (status === google.maps.DirectionsStatus.ZERO_RESULTS) {
          errorMsg = `No ${travelMode} route found between current location and destination. Try another travel mode.`;
        } else if (status === google.maps.DirectionsStatus.NOT_FOUND) {
          errorMsg = 'Origin or destination coordinates could not be geocoded.';
        } else if (status === google.maps.DirectionsStatus.OVER_QUERY_LIMIT) {
          errorMsg = 'Google Maps routing quota exceeded. Please try again later.';
        } else if (status === google.maps.DirectionsStatus.REQUEST_DENIED) {
          errorMsg = 'Directions request denied. Please check your Google Maps API key configuration.';
        }

        onRouteError(errorMsg);
      }
    });

    return () => {
      if (rendererRef.current) {
        rendererRef.current.setMap(null);
      }
    };
  }, [map, routesLib, origin.lat, origin.lng, destination?.lat, destination?.lng, travelMode]);

  return null;
};
