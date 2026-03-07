import { forwardRef, useImperativeHandle, useState, useCallback } from 'react';
import { useMap } from '@/lib/map/useMap';
import type { MapMarker } from '@/lib/map/MapAdapter';

interface MapViewProps {
  markers?: MapMarker[];
  className?: string;
  showMyLocation?: boolean;
  center?: { lat: number; lng: number };
}

export interface MapViewHandle {
  panTo: (lat: number, lng: number) => void;
}

const MapView = forwardRef<MapViewHandle, MapViewProps>(
  ({ markers = [], className = '', showMyLocation = true, center }, ref) => {
    const { containerRef, panTo } = useMap(markers, { showMyLocation, center });
    const [locating, setLocating] = useState(false);

    useImperativeHandle(ref, () => ({ panTo }));

    const handleMyLocation = useCallback(() => {
      if (!navigator.geolocation) return;
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          panTo(pos.coords.latitude, pos.coords.longitude);
          setLocating(false);
        },
        () => setLocating(false),
        { enableHighAccuracy: true, timeout: 5000 },
      );
    }, [panTo]);

    return (
      <div className={`relative w-full rounded-xl overflow-hidden ${className}`} style={{ height: 300 }}>
        <div ref={containerRef} className="absolute inset-0" />

        {/* 내 위치 버튼 */}
        <button
          onClick={handleMyLocation}
          disabled={locating}
          className="absolute bottom-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md active:bg-gray-50 disabled:opacity-60"
          aria-label="내 위치로 이동"
        >
          {locating ? (
            <svg className="h-5 w-5 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
              <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3m0 14v3M2 12h3m14 0h3" strokeLinecap="round" />
              <circle cx="12" cy="12" r="8" opacity="0.3" />
            </svg>
          )}
        </button>
      </div>
    );
  },
);

MapView.displayName = 'MapView';
export default MapView;
