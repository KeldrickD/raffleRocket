import { useCallback, useEffect, useState } from 'react';
import { NFTListItem } from '../types/nft';
import { useNFTOptimistic } from './useNFTOptimistic';
import { useNFTError } from './useNFTError';
import { useNFTLoading } from './useNFTLoading';
import { useNFTFilter } from './useNFTFilter';
import { useNFTSort } from './useNFTSort';
import { useNFTPagination } from './useNFTPagination';
import { useNFTTransform } from './useNFTTransform';

interface NFTManagerOptions {
  initialNFTs?: NFTListItem[];
  pageSize?: number;
  autoLoad?: boolean;
}

export function useNFTManager(options: NFTManagerOptions = {}) {
  const { 
    initialNFTs = [],
    pageSize = 10,
    autoLoad = true
  } = options;

  // State for storing the full list of NFTs
  const [allNFTs, setAllNFTs] = useState<NFTListItem[]>(initialNFTs);
  const [selectedNFT, setSelectedNFT] = useState<NFTListItem | null>(null);
  
  // Combine our utility hooks
  const { error, handleError, clearError } = useNFTError();
  const { isLoading, startLoading, stopLoading } = useNFTLoading();
  const { nfts: optimisticNFTs, pendingNFTs, addNFT } = useNFTOptimistic(allNFTs);
  
  // Data processing hooks
  const { 
    filters, 
    setNameFilter, 
    setPriceFilter, 
    setAttributeFilter, 
    clearFilters, 
    filteredNFTs 
  } = useNFTFilter(optimisticNFTs);
  
  const { sortOptions, setSortField, sortedNFTs } = useNFTSort(filteredNFTs);
  
  const paginationOptions = { itemsPerPage: pageSize, initialPage: 1 };
  const { 
    paginatedNFTs, 
    paginationInfo, 
    goToPage, 
    nextPage, 
    previousPage: prevPage, 
    firstPage, 
    lastPage 
  } = useNFTPagination(sortedNFTs, paginationOptions);
  
  // Always call useNFTTransform unconditionally to follow React Rules of Hooks
  // Pass undefined for the NFT when no selection is made
  const nftTransform = useNFTTransform(selectedNFT || undefined);

  // Load NFTs from an API or elsewhere
  const loadNFTs = useCallback(async () => {
    if (isLoading) return;
    
    try {
      startLoading();
      clearError();
      
      // Simulate API fetch
      const response = await fetch('/api/nfts');
      if (!response.ok) {
        throw new Error('Failed to fetch NFTs');
      }
      
      const data = await response.json();
      setAllNFTs(data);
    } catch (err) {
      if (err instanceof Error) {
        handleError(err);
      } else {
        handleError(new Error('An unknown error occurred'));
      }
    } finally {
      stopLoading();
    }
  }, [isLoading, startLoading, stopLoading, clearError, handleError]);

  // Create a new NFT
  const createNFT = useCallback(async (nft: NFTListItem) => {
    try {
      // Add optimistically first
      const result = await addNFT(nft);
      
      if (result) {
        // If successful, update the actual list
        setAllNFTs(prev => [...prev, nft]);
        return true;
      }
      return false;
    } catch (err) {
      if (err instanceof Error) {
        handleError(err);
      } else {
        handleError(new Error('Failed to create NFT'));
      }
      return false;
    }
  }, [addNFT, handleError]);

  // Select an NFT
  const selectNFT = useCallback((nft: NFTListItem) => {
    setSelectedNFT(nft);
  }, []);

  // Deselect the currently selected NFT
  const deselectNFT = useCallback(() => {
    setSelectedNFT(null);
  }, []);

  // Reset all filters, sorts, and pagination
  const resetAllFilters = useCallback(() => {
    clearFilters();
    goToPage(1);
  }, [clearFilters, goToPage]);

  // Auto-load NFTs on mount if autoLoad is true
  useEffect(() => {
    if (autoLoad && initialNFTs.length === 0) {
      loadNFTs();
    }
  }, [autoLoad, initialNFTs.length, loadNFTs]);

  // Apply transform to the selected NFT
  const transformNFT = useCallback((transformType: 'scale' | 'rotate' | 'translate', ...args: number[]) => {
    if (!selectedNFT) return;
    
    switch (transformType) {
      case 'scale':
        nftTransform.setScale(args[0]);
        break;
      case 'rotate':
        nftTransform.setRotate(args[0]);
        break;
      case 'translate':
        nftTransform.setTranslate(args[0], args[1] || 0);
        break;
    }
  }, [selectedNFT, nftTransform]);

  return {
    // State
    allNFTs,
    filteredNFTs,
    sortedNFTs,
    paginatedNFTs,
    selectedNFT,
    pendingNFTs,
    isLoading,
    error,
    filters,
    sortOptions,
    paginationInfo,
    transformStyle: selectedNFT ? nftTransform.getTransformStyle() : null,
    
    // Actions
    loadNFTs,
    createNFT,
    selectNFT,
    deselectNFT,
    setNameFilter,
    setPriceFilter,
    setAttributeFilter,
    setSortField,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    transformNFT,
    resetAllFilters,
  };
} 