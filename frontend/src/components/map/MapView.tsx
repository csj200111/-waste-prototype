import { forwardRef, useImperativeHandle } from 'react';
import { useMap } from '@/lib/map/useMap';
import type { MapMarker } from '@/lib/map/MapAdapter';

interface MapViewProps {
  markers?: MapMarker[];
  className?: string;
}

export interface MapViewHandle {
  panTo: (lat: number, lng: number) => void;
}

const MapView = forwardRef<MapViewHandle, MapViewProps>(
  ({ markers = [], className = '' }, ref) => {
    const { containerRef, panTo } = useMap(markers);

    useImperativeHandle(ref, () => ({ panTo }));

    return (
      <div
        ref={containerRef}
        className={`w-full rounded-xl overflow-hidden ${className}`}
        style={{ height: 300 }}
      />
    );
  },
);

MapView.displayName = 'MapView';
export default MapView;
