import type { MapAdapter, MapMarker, PlaceResult } from './MapAdapter';

export class MockMapAdapter implements MapAdapter {
  async render(container: HTMLElement): Promise<void> {
    container.innerHTML = `
      <div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f3f4f6;gap:8px;">
        <svg width="48" height="48" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
        </svg>
        <p style="font-size:12px;color:#6b7280;text-align:center;padding:0 16px">
          지도를 표시할 수 없습니다
        </p>
      </div>
    `;
  }

  addMarkers(_markers: MapMarker[]): void {}

  async searchPlaces(_keyword: string, _region: string): Promise<PlaceResult[]> {
    return [];
  }

  panTo(_lat: number, _lng: number): void {}

  destroy(): void {}
}
