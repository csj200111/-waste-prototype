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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private myLocationOverlay: any = null;

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

  addMyLocationMarker(lat: number, lng: number): void {
    if (!this.map) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kakao = (window as any).kakao;

    // 이전 오버레이 제거
    if (this.myLocationOverlay) {
      this.myLocationOverlay.setMap(null);
    }

    const content = document.createElement('div');
    content.style.cssText = 'position:relative;width:24px;height:24px;';
    // 펄스 링
    const pulse = document.createElement('div');
    pulse.style.cssText =
      'position:absolute;inset:0;border-radius:50%;background:rgba(59,130,246,0.25);animation:my-loc-pulse 2s ease-out infinite;';
    // 중앙 파란 점
    const dot = document.createElement('div');
    dot.style.cssText =
      'position:absolute;top:50%;left:50%;width:12px;height:12px;border-radius:50%;background:#3b82f6;border:2px solid #fff;box-shadow:0 0 4px rgba(0,0,0,0.3);transform:translate(-50%,-50%);';

    content.appendChild(pulse);
    content.appendChild(dot);

    // 펄스 애니메이션 스타일 주입 (한 번만)
    if (!document.getElementById('my-loc-pulse-style')) {
      const style = document.createElement('style');
      style.id = 'my-loc-pulse-style';
      style.textContent = `@keyframes my-loc-pulse{0%{transform:scale(1);opacity:1}100%{transform:scale(2.2);opacity:0}}`;
      document.head.appendChild(style);
    }

    this.myLocationOverlay = new kakao.maps.CustomOverlay({
      position: new kakao.maps.LatLng(lat, lng),
      content,
      yAnchor: 0.5,
      xAnchor: 0.5,
      zIndex: 100,
    });
    this.myLocationOverlay.setMap(this.map);
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

  async searchNearby(keyword: string, lat: number, lng: number, radius = 5000): Promise<PlaceResult[]> {
    await loadKakaoSDK();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kakao = (window as any).kakao;
    const ps = new kakao.maps.services.Places();

    return new Promise((resolve) => {
      ps.keywordSearch(
        keyword,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data: any[], status: string) => {
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
        },
        {
          location: new kakao.maps.LatLng(lat, lng),
          radius,
          sort: kakao.maps.services.SortBy.DISTANCE,
        },
      );
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
