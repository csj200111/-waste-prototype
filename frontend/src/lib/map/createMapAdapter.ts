import type { MapAdapter } from './MapAdapter';
import { KakaoMapAdapter } from './KakaoMapAdapter';
import { MockMapAdapter } from './MockMapAdapter';

export function createMapAdapter(): MapAdapter {
  if (import.meta.env.VITE_MAP_API_KEY) {
    return new KakaoMapAdapter();
  }
  return new MockMapAdapter();
}
