import type { FeeInfo } from '@/types/fee';
import fees from '@/lib/mock-data/fees.json';

const FALLBACK_REGION_ID = 'r1';

export const feeService = {
  calculateFee(
    regionId: string,
    wasteItemId: string,
    sizeId: string,
  ): FeeInfo | undefined {
    const allFees = fees as FeeInfo[];

    // Try exact region match first
    const exact = allFees.find(
      (f) =>
        f.regionId === regionId &&
        f.wasteItemId === wasteItemId &&
        f.sizeId === sizeId,
    );
    if (exact) return exact;

    // Fallback to r1 for other regions
    if (regionId !== FALLBACK_REGION_ID) {
      return allFees.find(
        (f) =>
          f.regionId === FALLBACK_REGION_ID &&
          f.wasteItemId === wasteItemId &&
          f.sizeId === sizeId,
      );
    }

    return undefined;
  },

  calculateTotalFee(
    items: {
      wasteItemId: string;
      sizeId: string;
      quantity: number;
      regionId: string;
    }[],
  ): number {
    return items.reduce((total, item) => {
      const feeInfo = this.calculateFee(
        item.regionId,
        item.wasteItemId,
        item.sizeId,
      );
      return total + (feeInfo ? feeInfo.fee * item.quantity : 0);
    }, 0);
  },
};
