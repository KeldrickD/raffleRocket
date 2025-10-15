import { useCallback, useState } from 'react';
import { NFTListItem } from '../types/nft';

interface InteractionState {
  hoveredNFT: NFTListItem | null;
  selectedNFT: NFTListItem | null;
  focusedNFT: NFTListItem | null;
  draggedNFT: NFTListItem | null;
}

export function useNFTInteractionManager() {
  const [state, setState] = useState<InteractionState>({
    hoveredNFT: null,
    selectedNFT: null,
    focusedNFT: null,
    draggedNFT: null,
  });

  const setHoveredNFT = useCallback((nft: NFTListItem | null) => {
    setState((prev) => ({ ...prev, hoveredNFT: nft }));
  }, []);

  const setSelectedNFT = useCallback((nft: NFTListItem | null) => {
    setState((prev) => ({ ...prev, selectedNFT: nft }));
  }, []);

  const setFocusedNFT = useCallback((nft: NFTListItem | null) => {
    setState((prev) => ({ ...prev, focusedNFT: nft }));
  }, []);

  const setDraggedNFT = useCallback((nft: NFTListItem | null) => {
    setState((prev) => ({ ...prev, draggedNFT: nft }));
  }, []);

  const clearInteractions = useCallback(() => {
    setState({
      hoveredNFT: null,
      selectedNFT: null,
      focusedNFT: null,
      draggedNFT: null,
    });
  }, []);

  return {
    ...state,
    setHoveredNFT,
    setSelectedNFT,
    setFocusedNFT,
    setDraggedNFT,
    clearInteractions,
  };
} 