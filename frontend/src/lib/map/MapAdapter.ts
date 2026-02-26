export interface MapMarker {
  lat: number;
  lng: number;
  title: string;
}

export interface PlaceResult {
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
}

export interface MapAdapter {
  render(
    container: HTMLElement,
    center: { lat: number; lng: number },
    zoom?: number,
  ): Promise<void>;
  addMarkers(markers: MapMarker[]): void;
  searchPlaces(keyword: string, region: string): Promise<PlaceResult[]>;
  panTo(lat: number, lng: number): void;
  destroy(): void;
}
