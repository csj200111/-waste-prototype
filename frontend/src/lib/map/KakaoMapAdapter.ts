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

    // 이미지 마커 스타일 주입 (한 번만)
    if (!document.getElementById('sharing-marker-style')) {
      const style = document.createElement('style');
      style.id = 'sharing-marker-style';
      style.textContent = `
        .sharing-marker{display:flex;flex-direction:column;align-items:center;cursor:pointer}
        .sharing-marker-img{width:36px;height:36px;min-width:36px;min-height:36px;max-width:36px;max-height:36px;border-radius:6px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);background-size:cover;background-position:center;background-color:#f3f4f6}
        .sharing-marker-arrow{width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:6px solid #fff;margin-top:-1px}
        .sharing-marker-default{width:36px;height:36px;border-radius:6px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);background:#3b82f6;display:flex;align-items:center;justify-content:center}
        .sharing-marker-default svg{width:18px;height:18px;fill:none;stroke:#fff;stroke-width:2}
      `;
      document.head.appendChild(style);
    }

    markers.forEach((m) => {
      if (m.imageUrl) {
        // 이미지가 있는 경우 커스텀 오버레이로 렌더링
        const content = document.createElement('div');
        content.className = 'sharing-marker';
        content.innerHTML = `
          <div class="sharing-marker-img" style="background-image:url('${m.imageUrl}')" title="${m.title}"></div>
          <div class="sharing-marker-arrow"></div>
        `;

        const overlay = new kakao.maps.CustomOverlay({
          position: new kakao.maps.LatLng(m.lat, m.lng),
          content,
          yAnchor: 1.15,
          xAnchor: 0.5,
          zIndex: 10,
        });
        overlay.setMap(this.map);

        // 클릭 시 인포윈도우
        content.addEventListener('click', () => {
          const infoOverlay = document.querySelector('.sharing-info-overlay');
          if (infoOverlay) infoOverlay.remove();

          const info = document.createElement('div');
          info.className = 'sharing-info-overlay';
          info.style.cssText = 'padding:4px 8px;font-size:12px;white-space:nowrap;background:#fff;border-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,0.2);';
          info.textContent = m.title;

          const infoOv = new kakao.maps.CustomOverlay({
            position: new kakao.maps.LatLng(m.lat, m.lng),
            content: info,
            yAnchor: 2.5,
            xAnchor: 0.5,
            zIndex: 20,
          });
          infoOv.setMap(this.map);

          setTimeout(() => infoOv.setMap(null), 3000);
        });
      } else {
        // 이미지가 없는 경우 기본 핀 마커
        const marker = new kakao.maps.Marker({
          position: new kakao.maps.LatLng(m.lat, m.lng),
          map: this.map,
        });

        if (m.title) {
          const infowindow = new kakao.maps.InfoWindow({
            content: `<div style="padding:4px 8px;font-size:12px;white-space:nowrap;">${m.title}</div>`,
          });
          kakao.maps.event.addListener(marker, 'click', () => {
            infowindow.open(this.map, marker);
            setTimeout(() => infowindow.close(), 3000);
          });
        }
      }
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
