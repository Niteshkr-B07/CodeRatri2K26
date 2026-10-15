import React, { useState, useEffect } from 'react';
import {
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useApiLoadingStatus,
  APILoadingStatus,
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Shield,
  AlertTriangle,
  Lightbulb,
  Building2,
  Cross,
  Eye,
  Plus,
  ThumbsUp,
  X,
  Compass,
  LocateFixed,
  Navigation,
  RefreshCw,
  Clock,
  ArrowRight,
  Footprints,
  Car,
  Bus,
  Bike,
  AlertCircle,
} from 'lucide-react';
import { GeoPoint, SafetyReport, AssistancePoint, TripSession, TravelMode } from '../types';
import { ASSISTANCE_POINTS } from '../services/storage';
import { computeSafetyScore } from '../services/scoring';
import { PlaceAutocomplete } from './PlaceAutocomplete';
import { MapRouteLayer, CalculatedRouteInfo } from './MapRouteLayer';

interface InteractiveMapProps {
  currentLocation: GeoPoint;
  destination: GeoPoint | null;
  onSelectDestination?: (dest: GeoPoint | null) => void;
  onStartSafeTripWithRoute?: (dest: GeoPoint, mode: TravelMode, durationMinutes: number) => void;
  activeTrip: TripSession | null;
  reports: SafetyReport[];
  isGpsDenied?: boolean;
  onRetryGps?: () => void;
  onUpvoteReport: (reportId: string) => void;
  onOpenReportModal: () => void;
  onOpenScoreDetails: () => void;
  onRequestLocationModal?: () => void;
  isOnline?: boolean;
}

// Controller component inside Map to pan to location changes
const MapRecenterController: React.FC<{
  center: { lat: number; lng: number };
  trigger: number;
}> = ({ center, trigger }) => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      map.panTo(center);
    }
  }, [map, center.lat, center.lng, trigger]);

  return null;
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  currentLocation,
  destination,
  onSelectDestination,
  onStartSafeTripWithRoute,
  activeTrip,
  reports,
  isGpsDenied = false,
  onRetryGps,
  onUpvoteReport,
  onOpenReportModal,
  onOpenScoreDetails,
  onRequestLocationModal,
  isOnline = true,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'hazards' | 'assistance'>('all');
  const [selectedReport, setSelectedReport] = useState<SafetyReport | null>(null);
  const [selectedAssistance, setSelectedAssistance] = useState<AssistancePoint | null>(null);
  const [recenterCount, setRecenterCount] = useState<number>(0);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [travelMode, setTravelMode] = useState<TravelMode>('walking');
  const [routeInfo, setRouteInfo] = useState<CalculatedRouteInfo | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [showSearchBox, setShowSearchBox] = useState<boolean>(!destination);

  const apiStatus = useApiLoadingStatus();
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const isMapApiAvailable = Boolean(apiKey) && apiStatus !== APILoadingStatus.FAILED;

  const filteredReports = activeFilter === 'assistance' ? [] : reports;
  const filteredAssistance = activeFilter === 'hazards' ? [] : ASSISTANCE_POINTS;

  // Clear route info if destination is removed
  useEffect(() => {
    if (!destination) {
      setRouteInfo(null);
      setRouteError(null);
    }
  }, [destination]);

  const handleRecenter = () => {
    setRecenterCount((prev) => prev + 1);
  };

  const handleClearDestination = () => {
    if (onSelectDestination) {
      onSelectDestination(null);
    }
    setRouteInfo(null);
    setRouteError(null);
    setShowSearchBox(true);
  };

  const handleStartTripClick = () => {
    if (!destination) return;
    const duration = routeInfo?.durationMinutes || 25;
    if (onStartSafeTripWithRoute) {
      onStartSafeTripWithRoute(destination, travelMode, duration);
    }
  };

  // Advisory safety score preview for the destination corridor
  const corridorScore = destination
    ? computeSafetyScore(currentLocation, destination, reports)
    : null;

  return (
    <div className="relative w-full h-[450px] sm:h-[540px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl select-none flex flex-col">
      {/* 1. Destination Search Bar Overlay */}
      <div className="absolute top-3 left-3 right-3 z-20 space-y-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="flex-1">
            <PlaceAutocomplete
              onSelectDestination={(dest) => {
                if (onSelectDestination) {
                  onSelectDestination(dest);
                }
                setShowSearchBox(false);
              }}
              currentLocation={currentLocation}
              placeholder="Search destination, college, station..."
              isOnline={isOnline}
            />
          </div>

          <button
            onClick={handleRecenter}
            className="touch-target w-12 h-12 min-w-[48px] min-h-[48px] bg-slate-900/95 backdrop-blur-md hover:bg-slate-800 active:scale-95 text-slate-200 rounded-xl border border-slate-700/80 shadow-lg flex items-center justify-center cursor-pointer transition-all"
            title="Recenter on current location"
            aria-label="Recenter on current location"
          >
            <LocateFixed className="w-5 h-5 text-indigo-400" />
          </button>
        </div>

        {/* Layer Filters & Report Hazard Action */}
        <div className="flex items-center justify-between gap-1.5 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 text-xs shadow-md">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('hazards')}
              className={`px-2 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                activeFilter === 'hazards'
                  ? 'bg-rose-950/90 text-rose-300 border border-rose-800/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Hazards ({reports.length})
            </button>
            <button
              onClick={() => setActiveFilter('assistance')}
              className={`px-2 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                activeFilter === 'assistance'
                  ? 'bg-indigo-950/90 text-indigo-300 border border-indigo-800/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Safe Hubs
            </button>
          </div>

          <button
            onClick={onOpenReportModal}
            className="pointer-events-auto min-h-[36px] px-3 py-1.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-lg shadow-rose-950/60 border border-rose-400/40 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Report Hazard</span>
          </button>
        </div>
      </div>

      {/* 2. GPS / Offline / Maps API Warning Banners */}
      <div className="absolute top-28 left-3 right-3 z-10 space-y-1.5 pointer-events-none">
        {isGpsDenied && (
          <div className="pointer-events-auto bg-amber-950/95 backdrop-blur-md border border-amber-600/80 rounded-xl p-2.5 text-xs text-amber-200 flex items-center justify-between gap-2 shadow-lg animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2 min-w-0">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate">GPS access disabled. Showing default city center.</span>
            </div>
            {onRetryGps && (
              <button
                onClick={onRetryGps}
                className="touch-target px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold shrink-0 cursor-pointer text-[11px] shadow-sm"
              >
                Retry GPS
              </button>
            )}
          </div>
        )}

        {!isOnline && (
          <div className="pointer-events-auto bg-rose-950/90 backdrop-blur-md border border-rose-600/80 rounded-xl p-2.5 text-xs text-rose-200 flex items-center gap-2 shadow-lg">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>You are offline. Live Google Maps routing requires an internet connection.</span>
          </div>
        )}

        {routeError && (
          <div className="pointer-events-auto bg-rose-950/95 backdrop-blur-md border border-rose-600/80 rounded-xl p-2.5 text-xs text-rose-200 flex items-center justify-between gap-2 shadow-lg">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="text-[11px] leading-tight">{routeError}</span>
            </div>
            <button
              onClick={() => setRouteError(null)}
              className="p-1 text-rose-300 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 3. Primary Google Map Canvas */}
      <div className="flex-1 w-full h-full relative">
        {isMapApiAvailable ? (
          <Map
            style={{ width: '100%', height: '100%' }}
            defaultCenter={{ lat: currentLocation.lat, lng: currentLocation.lng }}
            center={{ lat: currentLocation.lat, lng: currentLocation.lng }}
            defaultZoom={15}
            mapId="DEMO_MAP_ID"
            gestureHandling="greedy"
            disableDefaultUI={false}
            mapTypeId={mapType}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          >
            <MapRecenterController
              center={{ lat: currentLocation.lat, lng: currentLocation.lng }}
              trigger={recenterCount}
            />

            {/* Google Directions Route Layer */}
            <MapRouteLayer
              origin={currentLocation}
              destination={destination}
              travelMode={travelMode}
              onRouteCalculated={(info) => {
                setRouteInfo(info);
                setRouteError(null);
              }}
              onRouteError={(err) => {
                setRouteError(err);
                if (err) {
                  setRouteInfo(null);
                }
              }}
            />

            {/* 1. Live User Location Marker */}
            <AdvancedMarker
              position={{ lat: currentLocation.lat, lng: currentLocation.lng }}
              title="Your Current Location"
              zIndex={30}
            >
              <div className="flex flex-col items-center group cursor-pointer">
                <div className="relative flex items-center justify-center">
                  <span className="absolute w-8 h-8 rounded-full bg-indigo-500/40 animate-ping" />
                  <div className="w-6 h-6 rounded-full bg-indigo-600 border-2 border-white shadow-xl flex items-center justify-center text-white">
                    <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
                  </div>
                </div>
                <div className="mt-1 px-2 py-0.5 bg-slate-900/95 text-indigo-200 border border-indigo-500/50 text-[10px] font-bold rounded-full shadow-md whitespace-nowrap">
                  You Are Here
                </div>
              </div>
            </AdvancedMarker>

            {/* 2. Destination Marker */}
            {destination && (
              <AdvancedMarker
                position={{ lat: destination.lat, lng: destination.lng }}
                title={destination.address}
                zIndex={28}
              >
                <div className="flex flex-col items-center cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-8 h-8 rounded-full bg-rose-500/40 animate-pulse" />
                    <div className="w-8 h-8 rounded-full bg-rose-600 border-2 border-white shadow-2xl flex items-center justify-center text-white">
                      <MapPin className="w-4 h-4 fill-white" />
                    </div>
                  </div>
                  <div className="mt-1 px-2 py-0.5 bg-slate-900/95 text-rose-300 border border-rose-500/50 text-[10px] font-bold rounded-full shadow-lg max-w-[140px] truncate">
                    {destination.address}
                  </div>
                </div>
              </AdvancedMarker>
            )}

            {/* 3. Community Safety Hazard Markers */}
            {filteredReports.map((report) => (
              <AdvancedMarker
                key={report.id}
                position={{ lat: report.location.lat, lng: report.location.lng }}
                title={report.description}
                zIndex={20}
                onClick={() => setSelectedReport(report)}
              >
                <div className="flex flex-col items-center cursor-pointer transform hover:scale-110 transition-transform">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center border shadow-lg ${
                      report.category === 'poor_lighting'
                        ? 'bg-amber-950/90 border-amber-500 text-amber-400'
                        : report.category === 'harassment'
                        ? 'bg-rose-950/90 border-rose-500 text-rose-400'
                        : 'bg-orange-950/90 border-orange-500 text-orange-400'
                    }`}
                  >
                    {report.category === 'poor_lighting' ? (
                      <Lightbulb className="w-3.5 h-3.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                  </div>
                </div>
              </AdvancedMarker>
            ))}

            {/* 4. Verified 24/7 Assistance Hubs */}
            {filteredAssistance.map((hub) => (
              <AdvancedMarker
                key={hub.id}
                position={{ lat: hub.lat, lng: hub.lng }}
                title={hub.name}
                zIndex={15}
                onClick={() => setSelectedAssistance(hub)}
              >
                <div className="flex flex-col items-center cursor-pointer transform hover:scale-110 transition-transform">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border shadow-md ${
                      hub.type === 'police'
                        ? 'bg-blue-950/90 border-blue-400 text-blue-300'
                        : 'bg-emerald-950/90 border-emerald-400 text-emerald-300'
                    }`}
                  >
                    {hub.type === 'police' ? (
                      <Shield className="w-3.5 h-3.5" />
                    ) : (
                      <Cross className="w-3.5 h-3.5" />
                    )}
                  </div>
                </div>
              </AdvancedMarker>
            ))}
          </Map>
        ) : (
          /* Google Maps Unavailable State (No fake data rule) */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-950 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Google Maps API Unavailable</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                Live interactive maps and route calculations are currently disabled. Set{' '}
                <code className="text-rose-300 font-mono">VITE_GOOGLE_MAPS_API_KEY</code> in{' '}
                <code className="text-rose-300 font-mono">.env</code> to activate Google Maps.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 4. Bottom Controls: Map View Switcher & Safety Score */}
      <div className="absolute top-20 right-3 z-10 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 text-[11px] shadow-md">
        <button
          onClick={() => setMapType('roadmap')}
          className={`px-2 py-0.5 rounded-lg cursor-pointer transition-colors ${
            mapType === 'roadmap' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Road
        </button>
        <button
          onClick={() => setMapType('satellite')}
          className={`px-2 py-0.5 rounded-lg cursor-pointer transition-colors ${
            mapType === 'satellite' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Sat
        </button>
      </div>

      {/* 5. Floating Route Summary Card with Distance, ETA, and "Start Safe Trip" CTA */}
      {destination && (
        <div className="absolute bottom-3 left-3 right-3 z-30 bg-slate-900/95 backdrop-blur-xl border border-rose-500/40 rounded-2xl p-4 shadow-2xl text-slate-100 space-y-3 animate-in slide-in-from-bottom-3">
          {/* Header & Destination Name */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-400">
                <Navigation className="w-3 h-3" />
                <span>Selected Destination Route</span>
              </div>
              <h4 className="text-sm font-bold text-white truncate mt-0.5">
                {destination.address}
              </h4>
            </div>

            <button
              onClick={handleClearDestination}
              className="touch-target p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Remove destination"
              aria-label="Clear destination"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Travel Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {(
              [
                { id: 'walking', label: 'Walk', icon: Footprints },
                { id: 'transit', label: 'Transit', icon: Bus },
                { id: 'cab', label: 'Drive/Cab', icon: Car },
                { id: 'cycling', label: 'Cycle', icon: Bike },
              ] as const
            ).map((mode) => {
              const Icon = mode.icon;
              const isSelected = travelMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setTravelMode(mode.id)}
                  className={`touch-target flex-1 min-h-[36px] py-1 px-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>

          {/* Real Distance, ETA & Safety Assessment Badges */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Distance</span>
              <p className="text-xs font-bold text-white font-mono mt-0.5">
                {routeInfo ? routeInfo.distanceText : routeError ? '--' : 'Calculating...'}
              </p>
            </div>

            <div className="p-2 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Estimated ETA</span>
              <p className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
                {routeInfo ? routeInfo.durationText : routeError ? '--' : 'Calculating...'}
              </p>
            </div>

            <div className="p-2 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Safety Score</span>
              <p className="text-xs font-bold text-indigo-400 font-mono mt-0.5">
                {corridorScore ? `${corridorScore.score}/100` : '--'}
              </p>
            </div>
          </div>

          {/* Advisory Disclaimer Notice */}
          <p className="text-[10px] text-slate-400 italic">
            * Route metrics provided by Google Maps. Safety score is advisory only and does not guarantee safety.
          </p>

          {/* Primary CTA: Start Safe Trip (Min 48px touch target) */}
          <button
            type="button"
            onClick={handleStartTripClick}
            className="touch-target w-full min-h-[48px] py-3.5 px-4 bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-950/80 border border-rose-400/40 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Shield className="w-4 h-4" />
            <span>Start Safe Trip to This Destination</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Selected Marker Detail Card Popover */}
      {selectedReport && !destination && (
        <div className="absolute bottom-12 left-3 right-3 sm:left-auto sm:right-3 sm:w-80 z-30 bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl text-xs animate-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                Community Hazard Report
              </span>
              <h4 className="text-sm font-bold text-white capitalize mt-0.5">
                {selectedReport.category.replace('_', ' ')}
              </h4>
            </div>
            <button
              onClick={() => setSelectedReport(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              aria-label="Close details"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-slate-300 my-2 leading-relaxed">{selectedReport.description}</p>
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-slate-400 text-[11px]">
            <span className="truncate max-w-[180px]">{selectedReport.location.approxAddress}</span>
            <button
              onClick={() => onUpvoteReport(selectedReport.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedReport.userUpvoted
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <ThumbsUp className="w-3 h-3" />
              <span>{selectedReport.upvotes}</span>
            </button>
          </div>
        </div>
      )}

      {selectedAssistance && !destination && (
        <div className="absolute bottom-12 left-3 right-3 sm:left-auto sm:right-3 sm:w-80 z-30 bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl text-xs animate-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                24/7 Verified Assistance Hub
              </span>
              <h4 className="text-sm font-bold text-white mt-0.5">{selectedAssistance.name}</h4>
            </div>
            <button
              onClick={() => setSelectedAssistance(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              aria-label="Close details"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-slate-300 my-2">{selectedAssistance.address}</p>
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-slate-400 text-[11px]">
            <span className="text-emerald-400 font-medium">Open 24 Hours</span>
            <a
              href={`tel:${selectedAssistance.type === 'police' ? '112' : '108'}`}
              className="text-blue-400 hover:underline font-semibold"
            >
              Call {selectedAssistance.type === 'police' ? '112 Police' : '108 Ambulance'}
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
