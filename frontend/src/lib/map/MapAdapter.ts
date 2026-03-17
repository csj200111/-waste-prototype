export interface MapMarker {
  lat: number;
  lng: number;
  title: string;
  imageUrl?: string;
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
  addMyLocationMarker(lat: number, lng: number): void;
  searchPlaces(keyword: string, region: string): Promise<PlaceResult[]>;
  searchNearby(keyword: string, lat: number, lng: number, radius?: number): Promise<PlaceResult[]>;
  panTo(lat: number, lng: number): void;
  destroy(): void;
}
