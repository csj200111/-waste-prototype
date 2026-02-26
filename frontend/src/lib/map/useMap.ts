import { useRef, useEffect } from 'react';
import type { MapAdapter, MapMarker } from './MapAdapter';
import { createMapAdapter } from './createMapAdapter';

// 서울 시청 기본 좌표
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

export function useMap(markers: MapMarker[]) {
  const containerRef = useRef<HTMLDivElement>(null);
  const adapterRef = useRef<MapAdapter | null>(null);
  // markers 변경 감지용 (JSON 직렬화)
  const markersJson = JSON.stringify(markers);

  useEffect(() => {
    if (!containerRef.current) return;

    const adapter = createMapAdapter();
    adapterRef.current = adapter;
    const center = markers.length > 0
      ? { lat: markers[0].lat, lng: markers[0].lng }
      : DEFAULT_CENTER;

    adapter.render(containerRef.current, center).then(() => {
      adapter.addMarkers(markers);
    }).catch((err) => {
      console.error('[MapView] 지도 로드 실패:', err);
    });

    return () => {
      adapter.destroy();
      adapterRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markersJson]);

  const panTo = (lat: number, lng: number) => {
    adapterRef.current?.panTo(lat, lng);
  };

  return { containerRef, panTo };
}
