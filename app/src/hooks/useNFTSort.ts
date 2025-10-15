import { useState, useCallback, useMemo } from 'react';
import { NFTListItem } from '../types/nft';

type SortField = 'name' | 'price' | 'date';
type SortDirection = 'asc' | 'desc';

interface SortOptions {
  field: SortField;
  direction: SortDirection;
}

export function useNFTSort(nfts: NFTListItem[]) {
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'name',
    direction: 'asc',
  });

  const setSortField = useCallback((field: SortField) => {
    setSortOptions((prev) => ({
      ...prev,
      field,
      direction: prev.field === field ? toggleDirection(prev.direction) : 'asc',
    }));
  }, []);

  const toggleDirection = (direction: SortDirection): SortDirection => {
    return direction === 'asc' ? 'desc' : 'asc';
  };

  const sortedNFTs = useMemo(() => {
    const { field, direction } = sortOptions;

    return [...nfts].sort((a, b) => {
      let comparison = 0;

      switch (field) {
        case 'name':
          comparison = (a.metadata?.name || '').localeCompare(b.metadata?.name || '');
          break;
        case 'price':
          const priceA = parseFloat(a.price?.toString() || '0');
          const priceB = parseFloat(b.price?.toString() || '0');
          comparison = priceA - priceB;
          break;
        case 'date':
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          comparison = dateA - dateB;
          break;
      }

      return direction === 'asc' ? comparison : -comparison;
    });
  }, [nfts, sortOptions]);

  return {
    sortOptions,
    setSortField,
    sortedNFTs,
  };
} 