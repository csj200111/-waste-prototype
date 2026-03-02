import { useRef, useEffect } from 'react';
import type { MapAdapter, MapMarker } from './MapAdapter';
import { createMapAdapter } from './createMapAdapter';

// 서울 시청 기본 좌표
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

interface UseMapOptions {
  showMyLocation?: boolean;
}

export function useMap(markers: MapMarker[], options: UseMapOptions = {}) {
  const { showMyLocation = false } = options;
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

      // 내 위치 마커 표시
      if (showMyLocation && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            adapter.addMyLocationMarker(pos.coords.latitude, pos.coords.longitude);
          },
          () => { /* 위치 권한 거부 시 무시 */ },
          { enableHighAccuracy: true, timeout: 5000 },
        );
      }
    }).catch((err) => {
      console.error('[MapView] 지도 로드 실패:', err);
    });

    return () => {
      adapter.destroy();
      adapterRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markersJson, showMyLocation]);

  const panTo = (lat: number, lng: number) => {
    adapterRef.current?.panTo(lat, lng);
  };

  return { containerRef, panTo };
}
