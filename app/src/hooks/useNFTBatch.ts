import { useState, useCallback } from 'react';
import { NFTListItem } from './useNFTList';

export function useNFTBatch() {
  const [selectedNFTs, setSelectedNFTs] = useState<NFTListItem[]>([]);

  const addToSelection = useCallback((nft: NFTListItem) => {
    setSelectedNFTs((prevSelected) => [...prevSelected, nft]);
  }, []);

  const removeFromSelection = useCallback((mint: string) => {
    setSelectedNFTs((prevSelected) =>
      prevSelected.filter((nft) => nft.mint !== mint)
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedNFTs([]);
  }, []);

  const isSelected = useCallback(
    (mint: string) => {
      return selectedNFTs.some((nft) => nft.mint === mint);
    },
    [selectedNFTs]
  );

  const toggleSelection = useCallback(
    (nft: NFTListItem) => {
      if (isSelected(nft.mint)) {
        removeFromSelection(nft.mint);
      } else {
        addToSelection(nft);
      }
    },
    [isSelected, removeFromSelection, addToSelection]
  );

  return {
    selectedNFTs,
    addToSelection,
    removeFromSelection,
    clearSelection,
    isSelected,
    toggleSelection,
  };
} 