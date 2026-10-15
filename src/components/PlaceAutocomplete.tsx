import React, { useState, useEffect, useRef } from 'react';
import { useMapsLibrary, useApiLoadingStatus, APILoadingStatus } from '@vis.gl/react-google-maps';
import { Search, MapPin, X, Loader2, AlertCircle } from 'lucide-react';
import { GeoPoint } from '../types';

interface PlaceAutocompleteProps {
  onSelectDestination: (dest: GeoPoint) => void;
  currentLocation?: GeoPoint;
  placeholder?: string;
  initialValue?: string;
  className?: string;
  isOnline?: boolean;
}

interface PlacePrediction {
  placeId: string;
  mainText: string;
  secondaryText: string;
  description: string;
}

export const PlaceAutocomplete: React.FC<PlaceAutocompleteProps> = ({
  onSelectDestination,
  currentLocation,
  placeholder = 'Search destination, college, or station...',
  initialValue = '',
  className = '',
  isOnline = true,
}) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const placesLib = useMapsLibrary('places');
  const apiStatus = useApiLoadingStatus();
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const dummyDivRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync initialValue changes
  useEffect(() => {
    if (initialValue && initialValue !== inputValue) {
      setInputValue(initialValue);
    }
  }, [initialValue]);

  // Initialize AutocompleteService and PlacesService when library is loaded
  useEffect(() => {
    if (placesLib) {
      try {
        autocompleteServiceRef.current = new placesLib.AutocompleteService();
        if (!dummyDivRef.current) {
          dummyDivRef.current = document.createElement('div');
        }
        placesServiceRef.current = new placesLib.PlacesService(dummyDivRef.current);
      } catch (err) {
        console.error('Failed to initialize Google Places services:', err);
      }
    }
  }, [placesLib]);

  // Handle outside clicks to close predictions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch predictions when input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setInputValue(query);
    setErrorMessage(null);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!query.trim()) {
      setPredictions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    if (!isOnline) {
      setErrorMessage('You are offline. Connect to the internet for live Google Places search.');
      setIsOpen(true);
      return;
    }

    if (apiStatus === APILoadingStatus.FAILED || !placesLib) {
      setErrorMessage('Google Places API is currently unavailable. Check API key configuration.');
      setIsOpen(true);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    debounceTimerRef.current = setTimeout(() => {
      if (!autocompleteServiceRef.current) {
        setIsLoading(false);
        setErrorMessage('Google Places service is initializing. Please try again.');
        return;
      }

      const request: google.maps.places.AutocompletionRequest = {
        input: query,
        componentRestrictions: { country: 'in' }, // Focused on India for SafeTrip
      };

      if (currentLocation && currentLocation.lat && currentLocation.lng) {
        request.locationBias = {
          center: { lat: currentLocation.lat, lng: currentLocation.lng },
          radius: 35000, // 35 km bias around user
        };
      }

      autocompleteServiceRef.current.getPlacePredictions(
        request,
        (results, status) => {
          setIsLoading(false);
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            const formatted: PlacePrediction[] = results.map((item) => ({
              placeId: item.place_id,
              mainText: item.structured_formatting?.main_text || item.description,
              secondaryText: item.structured_formatting?.secondary_text || '',
              description: item.description,
            }));
            setPredictions(formatted);
            setErrorMessage(null);
          } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            setPredictions([]);
            setErrorMessage(`No places found matching "${query}". Try a different spelling or landmark.`);
          } else {
            setPredictions([]);
            setErrorMessage(`Google Places search error (${status}). Please check network or API quota.`);
          }
        }
      );
    }, 280);
  };

  // Select prediction and resolve exact GeoPoint
  const handleSelectPrediction = (prediction: PlacePrediction) => {
    setInputValue(prediction.description);
    setIsOpen(false);
    setIsLoading(true);
    setErrorMessage(null);

    if (placesServiceRef.current) {
      placesServiceRef.current.getDetails(
        {
          placeId: prediction.placeId,
          fields: ['geometry', 'name', 'formatted_address'],
        },
        (place, status) => {
          setIsLoading(false);
          if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
            const dest: GeoPoint = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              address: place.formatted_address || place.name || prediction.description,
            };
            onSelectDestination(dest);
          } else {
            // Geocoder fallback
            geocodePlaceId(prediction.placeId, prediction.description);
          }
        }
      );
    } else {
      geocodePlaceId(prediction.placeId, prediction.description);
    }
  };

  const geocodePlaceId = (placeId: string, fallbackAddress: string) => {
    if (typeof google === 'undefined' || !google.maps || !google.maps.Geocoder) {
      setIsLoading(false);
      setErrorMessage('Google Maps Geocoder is unavailable.');
      return;
    }

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ placeId }, (results, status) => {
      setIsLoading(false);
      if (status === 'OK' && results && results[0]?.geometry?.location) {
        const loc = results[0].geometry.location;
        onSelectDestination({
          lat: loc.lat(),
          lng: loc.lng(),
          address: results[0].formatted_address || fallbackAddress,
        });
      } else {
        setErrorMessage('Could not retrieve precise coordinates for this place.');
      }
    });
  };

  // Handle explicit form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (predictions.length > 0) {
      handleSelectPrediction(predictions[0]);
      return;
    }

    // Direct geocode query
    if (typeof google !== 'undefined' && google.maps && google.maps.Geocoder) {
      setIsLoading(true);
      setErrorMessage(null);
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        { address: inputValue, componentRestrictions: { country: 'in' } },
        (results, status) => {
          setIsLoading(false);
          if (status === 'OK' && results && results[0]?.geometry?.location) {
            const loc = results[0].geometry.location;
            const dest: GeoPoint = {
              lat: loc.lat(),
              lng: loc.lng(),
              address: results[0].formatted_address || inputValue,
            };
            setIsOpen(false);
            onSelectDestination(dest);
          } else {
            setErrorMessage(`Could not locate "${inputValue}". Please pick from suggestions.`);
            setIsOpen(true);
          }
        }
      );
    }
  };

  const handleClear = () => {
    setInputValue('');
    setPredictions([]);
    setErrorMessage(null);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative flex items-center w-full">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none flex items-center justify-center">
          <Search className="w-4 h-4 text-slate-400" />
        </div>

        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (predictions.length > 0 || errorMessage) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-20 py-3 min-h-[48px] text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 transition-all shadow-inner"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="w-4 h-4 text-rose-400 animate-spin mr-1" />
          )}

          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="touch-target p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Clear destination input"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="touch-target min-h-[36px] px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:hover:bg-rose-600 text-white font-semibold rounded-lg text-xs transition-all cursor-pointer flex items-center justify-center shadow-sm"
          >
            Find
          </button>
        </div>
      </form>

      {/* Autocomplete Predictions Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-1">
          {errorMessage && (
            <div className="p-3.5 flex items-start gap-2.5 bg-rose-950/40 border-b border-rose-900/30 text-rose-200 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold block text-rose-300">Places Search Notice</span>
                <p className="text-[11px] text-rose-200/90 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {predictions.length > 0 && (
            <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60 no-scrollbar">
              <div className="px-3 py-1.5 bg-slate-950/60 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Google Places Results</span>
                <span className="text-slate-500 font-mono text-[9px]">Verified</span>
              </div>
              {predictions.map((p) => (
                <button
                  key={p.placeId}
                  type="button"
                  onClick={() => handleSelectPrediction(p)}
                  className="touch-target w-full min-h-[48px] px-3.5 py-2.5 flex items-start gap-3 hover:bg-slate-800/80 active:bg-slate-800 text-left transition-colors cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-100 group-hover:text-rose-300 transition-colors truncate">
                      {p.mainText}
                    </p>
                    {p.secondaryText && (
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {p.secondaryText}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {predictions.length === 0 && !errorMessage && !isLoading && (
            <div className="p-4 text-center text-xs text-slate-400">
              Type at least 2 characters to search Google Places.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
