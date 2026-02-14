import { useState, useMemo } from 'react';
import { regionService } from '@/services/regionService';
import { wasteService } from '@/services/wasteService';
import { feeService } from '@/services/feeService';
import type { Region } from '@/types/region';
import type { WasteItem } from '@/types/waste';

export function useFeeCheck() {
  const [regionQuery, setRegionQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedItem, setSelectedItem] = useState<WasteItem | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<string | undefined>();

  const categories = wasteService.getCategories();

  const regionResults = useMemo(() => {
    if (regionQuery.length < 1) return [];
    return regionService.searchRegion(regionQuery).slice(0, 5);
  }, [regionQuery]);

  const fee = useMemo(() => {
    if (!selectedRegion || !selectedItem || !selectedSizeId) return null;
    return feeService.calculateFee(selectedRegion.id, selectedItem.id, selectedSizeId);
  }, [selectedRegion, selectedItem, selectedSizeId]);

  const selectRegion = (region: Region) => {
    setSelectedRegion(region);
    setRegionQuery(regionService.getRegionLabel(region));
  };

  const selectItem = (item: WasteItem) => {
    setSelectedItem(item);
    setSelectedSizeId(undefined);
  };

  return {
    regionQuery,
    setRegionQuery,
    selectedRegion,
    selectRegion,
    regionResults,
    categories,
    selectedItem,
    selectItem,
    selectedSizeId,
    setSelectedSizeId,
    fee,
  };
}
