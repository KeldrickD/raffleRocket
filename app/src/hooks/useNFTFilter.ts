import { useState, useCallback, useMemo } from 'react';
import { NFTListItem } from '../types/nft';

interface FilterOptions {
  name?: string;
  minPrice?: number;
  maxPrice?: number;
  attributes?: Record<string, string[]>;
}

export function useNFTFilter(nfts: NFTListItem[]) {
  const [filters, setFilters] = useState<FilterOptions>({});

  const setNameFilter = useCallback((name: string) => {
    setFilters((prev) => ({ ...prev, name }));
  }, []);

  const setPriceFilter = useCallback((minPrice?: number, maxPrice?: number) => {
    setFilters((prev) => ({ ...prev, minPrice, maxPrice }));
  }, []);

  const setAttributeFilter = useCallback(
    (attribute: string, values: string[]) => {
      setFilters((prev) => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          [attribute]: values,
        },
      }));
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const filteredNFTs = useMemo(() => {
    return nfts.filter((nft) => {
      // Name filter
      if (filters.name && !nft.metadata?.name.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }

      // Price filter
      const price = parseFloat(nft.price?.toString() || '0');
      if (filters.minPrice && price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice && price > filters.maxPrice) {
        return false;
      }

      // Attribute filter
      if (filters.attributes) {
        for (const [attribute, values] of Object.entries(filters.attributes)) {
          const nftAttribute = nft.metadata?.attributes?.find(
            (attr) => attr.trait_type === attribute
          );
          if (!nftAttribute || !values.includes(nftAttribute.value)) {
            return false;
          }
        }
      }

      return true;
    });
  }, [nfts, filters]);

  return {
    filters,
    setNameFilter,
    setPriceFilter,
    setAttributeFilter,
    clearFilters,
    filteredNFTs,
  };
} 