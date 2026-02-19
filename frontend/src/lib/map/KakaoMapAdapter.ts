import type { MapAdapter, MapMarker, PlaceResult } from './MapAdapter';

const API_KEY = import.meta.env.VITE_MAP_API_KEY as string;

let sdkLoaded = false;
let sdkLoadingPromise: Promise<void> | null = null;

function loadKakaoSDK(): Promise<void> {
  if (sdkLoaded) return Promise.resolve();
  if (sdkLoadingPromise) return sdkLoadingPromise;

  sdkLoadingPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${API_KEY}&libraries=services&autoload=false`;
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).kakao.maps.load(() => {
        sdkLoaded = true;
        resolve();
      });
    };
    script.onerror = () => reject(new Error('Kakao Maps SDK 로드 실패'));
    document.head.appendChild(script);
  });

  return sdkLoadingPromise;
}

export class KakaoMapAdapter implements MapAdapter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private map: any = null;

  async render(
    container: HTMLElement,
    center: { lat: number; lng: number },
    zoom = 7,
  ): Promise<void> {
    await loadKakaoSDK();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kakao = (window as any).kakao;
    const options = {
      center: new kakao.maps.LatLng(center.lat, center.lng),
      level: zoom,
    };
    this.map = new kakao.maps.Map(container, options);
  }

  addMarkers(markers: MapMarker[]): void {
    if (!this.map) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kakao = (window as any).kakao;
    markers.forEach((m) => {
      const marker = new kakao.maps.Marker({
        map: this.map,
        position: new kakao.maps.LatLng(m.lat, m.lng),
        title: m.title,
      });

      // 마커 클릭 시 인포윈도우 표시
      const infowindow = new kakao.maps.InfoWindow({
        content: `<div style="padding:4px 8px;font-size:12px;white-space:nowrap">${m.title}</div>`,
      });
      kakao.maps.event.addListener(marker, 'click', () => {
        infowindow.open(this.map, marker);
      });
    });

    // 마커들이 있으면 지도 중심을 첫 번째 마커로 이동
    if (markers.length > 0) {
      this.map.setCenter(new kakao.maps.LatLng(markers[0].lat, markers[0].lng));
    }
  }

  async searchPlaces(keyword: string, region: string): Promise<PlaceResult[]> {
    await loadKakaoSDK();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kakao = (window as any).kakao;
    const ps = new kakao.maps.services.Places();

    const keywords = keyword.split(' ').filter(Boolean);

    const searchOne = (kw: string): Promise<PlaceResult[]> =>
      new Promise((resolve) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ps.keywordSearch(`${region} ${kw}`, (data: any[], status: string) => {
          if (status !== kakao.maps.services.Status.OK) {
            resolve([]);
            return;
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          resolve(data.map((place: any) => ({
            name: place.place_name,
            address: place.road_address_name || place.address_name,
            phone: place.phone || '',
            lat: parseFloat(place.y),
            lng: parseFloat(place.x),
          })));
        });
      });

    const lists = await Promise.all(keywords.map(searchOne));
    const merged = lists.flat();

    // 중복 제거 (같은 이름 + 같은 주소)
    const seen = new Set<string>();
    return merged.filter((p) => {
      const key = `${p.name}_${p.address}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  panTo(lat: number, lng: number): void {
    if (!this.map) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kakao = (window as any).kakao;
    this.map.panTo(new kakao.maps.LatLng(lat, lng));
    this.map.setLevel(3);
  }

  destroy(): void {
    this.map = null;
  }
}
