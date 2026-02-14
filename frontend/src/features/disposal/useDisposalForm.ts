import { useState, useMemo, useCallback } from 'react';
import { useDisposalStore } from '@/stores/useDisposalStore';
import { regionService } from '@/services/regionService';
import { wasteService } from '@/services/wasteService';
import { feeService } from '@/services/feeService';
import { disposalService } from '@/services/disposalService';
import type { Region } from '@/types/region';
import type { WasteItem } from '@/types/waste';
import type { DisposalItem, PaymentMethod } from '@/types/disposal';

export function useDisposalForm() {
  const store = useDisposalStore();

  const [regionQuery, setRegionQuery] = useState('');

  const regionResults = useMemo(() => {
    if (regionQuery.length < 1) return [];
    return regionService.searchRegion(regionQuery).slice(0, 5);
  }, [regionQuery]);

  const selectRegion = (region: Region) => {
    store.setRegion(region);
    setRegionQuery(regionService.getRegionLabel(region));
  };

  const addWasteItem = useCallback(
    (item: WasteItem, sizeId: string, quantity: number) => {
      if (!store.region) return;
      const feeInfo = feeService.calculateFee(store.region.id, item.id, sizeId);
      const size = item.sizes.find((s) => s.id === sizeId);
      if (!feeInfo || !size) return;

      const disposalItem: DisposalItem = {
        wasteItemId: item.id,
        wasteItemName: item.name,
        sizeId,
        sizeLabel: size.label,
        quantity,
        fee: feeInfo.fee,
      };
      store.addItem(disposalItem);
    },
    [store],
  );

  const submitApplication = useCallback(() => {
    if (!store.region || store.items.length === 0) return null;

    const app = disposalService.createApplication({
      userId: 'user1',
      regionId: store.region.id,
      items: store.items,
      disposalAddress: store.disposalAddress,
      preferredDate: store.preferredDate,
      totalFee: store.getTotalFee(),
    });

    return app;
  }, [store]);

  const processPayment = useCallback(
    (method: PaymentMethod) => {
      const { completedApplication } = store;
      if (!completedApplication) return null;
      return disposalService.processPayment(completedApplication.id, method);
    },
    [store],
  );

  return {
    store,
    regionQuery,
    setRegionQuery,
    regionResults,
    selectRegion,
    addWasteItem,
    submitApplication,
    processPayment,
    categories: wasteService.getCategories(),
  };
}
