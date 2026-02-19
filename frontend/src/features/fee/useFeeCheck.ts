import { useState, useEffect } from 'react';
import { regionService } from '@/services/regionService';
import { wasteService } from '@/services/wasteService';
import { feeService } from '@/services/feeService';
import type { WasteItem } from '@/types/waste';
import type { FeeInfo } from '@/types/fee';

export function useFeeCheck() {
  const [sidoList, setSidoList] = useState<string[]>([]);
  const [sigunguList, setSigunguList] = useState<string[]>([]);
  const [selectedSido, setSelectedSido] = useState('');
  const [selectedSigungu, setSelectedSigungu] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<WasteItem | null>(null);
  const [fees, setFees] = useState<FeeInfo[]>([]);
  const [selectedFee, setSelectedFee] = useState<FeeInfo | undefined>();

  useEffect(() => {
    regionService.getSido().then(setSidoList);
    wasteService.getCategories().then(setCategories);
  }, []);

  const handleSidoChange = (sido: string) => {
    setSelectedSido(sido);
    setSelectedSigungu('');
    if (sido) {
      regionService.getSigungu(sido).then(setSigunguList);
    } else {
      setSigunguList([]);
    }
  };

  const handleSigunguChange = (sigungu: string) => {
    setSelectedSigungu(sigungu);
    setSelectedItem(null);
    setFees([]);
    setSelectedFee(undefined);
  };

  const selectItem = (item: WasteItem) => {
    setSelectedItem(item);
    setSelectedFee(undefined);
    if (selectedSido && selectedSigungu) {
      feeService
        .getFees({ sido: selectedSido, sigungu: selectedSigungu, wasteName: item.wasteName })
        .then((result) => {
          setFees(result);
          if (result.length === 1) setSelectedFee(result[0]);
        });
    }
  };

  return {
    sidoList,
    sigunguList,
    selectedSido,
    selectedSigungu,
    handleSidoChange,
    handleSigunguChange,
    categories,
    selectedItem,
    selectItem,
    fees,
    selectedFee,
    setSelectedFee,
  };
}
