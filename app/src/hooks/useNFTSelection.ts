import { useState, useCallback } from 'react';
import { NFTListItem } from '../types/nft';

interface UseNFTSelectionOptions {
  allowMultiple?: boolean;
  maxSelections?: number;
}

export function useNFTSelection(options: UseNFTSelectionOptions = {}) {
  const { 
    allowMultiple = true,
    maxSelections = Infinity 
  } = options;

  // For single selection mode
  const [selectedNFT, setSelectedNFT] = useState<NFTListItem | null>(null);
  
  // For multi-selection mode
  const [selectedNFTs, setSelectedNFTs] = useState<NFTListItem[]>([]);
  
  // Toggle selection of a single NFT
  const toggleSelection = useCallback((nft: NFTListItem) => {
    if (!allowMultiple) {
      // Single selection mode
      setSelectedNFT(prev => prev?.mint.toString() === nft.mint.toString() ? null : nft);
      return;
    }
    
    // Multi-selection mode
    setSelectedNFTs(prev => {
      const isSelected = prev.some(item => item.mint.toString() === nft.mint.toString());
      
      if (isSelected) {
        // Remove from selection
        return prev.filter(item => item.mint.toString() !== nft.mint.toString());
      } else {
        // Add to selection if under max limit
        if (prev.length >= maxSelections) {
          return prev;
        }
        return [...prev, nft];
      }
    });
  }, [allowMultiple, maxSelections]);

  // Check if an NFT is selected
  const isSelected = useCallback((nft: NFTListItem) => {
    if (!allowMultiple) {
      return selectedNFT?.mint.toString() === nft.mint.toString();
    }
    return selectedNFTs.some(item => item.mint.toString() === nft.mint.toString());
  }, [allowMultiple, selectedNFT, selectedNFTs]);

  // Clear all selections
  const clearSelection = useCallback(() => {
    if (!allowMultiple) {
      setSelectedNFT(null);
      return;
    }
    setSelectedNFTs([]);
  }, [allowMultiple]);

  // Select all NFTs from a list (up to max limit)
  const selectAll = useCallback((nfts: NFTListItem[]) => {
    if (!allowMultiple) {
      return;
    }
    setSelectedNFTs(nfts.slice(0, maxSelections));
  }, [allowMultiple, maxSelections]);

  // Invert selection from a list of NFTs
  const invertSelection = useCallback((nfts: NFTListItem[]) => {
    if (!allowMultiple) {
      return;
    }
    
    const currentSelectedMints = new Set(selectedNFTs.map(nft => nft.mint.toString()));
    const newSelection = nfts.filter(nft => !currentSelectedMints.has(nft.mint.toString()));
    
    // Apply max selections limit
    setSelectedNFTs(newSelection.slice(0, maxSelections));
  }, [allowMultiple, maxSelections, selectedNFTs]);

  return {
    // For single selection mode
    selectedNFT,
    
    // For multi-selection mode
    selectedNFTs,
    selectionCount: selectedNFTs.length,
    hasSelection: allowMultiple ? selectedNFTs.length > 0 : selectedNFT !== null,
    atMaxSelections: selectedNFTs.length >= maxSelections,
    
    // Actions
    toggleSelection,
    isSelected,
    clearSelection,
    selectAll,
    invertSelection,
  };
} 