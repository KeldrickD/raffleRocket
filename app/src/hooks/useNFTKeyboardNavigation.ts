import { useCallback, useState, KeyboardEvent } from 'react';
import { NFTListItem } from '../types/nft';

interface KeyboardNavigationOptions {
  nfts: NFTListItem[];
  onSelect?: (nft: NFTListItem) => void;
  gridColumns?: number;
}

export function useNFTKeyboardNavigation({
  nfts,
  onSelect,
  gridColumns = 4,
}: KeyboardNavigationOptions) {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (nfts.length === 0) return;

      const handleArrowKey = (direction: 'up' | 'down' | 'left' | 'right') => {
        let newIndex = focusedIndex;

        switch (direction) {
          case 'up':
            newIndex = Math.max(0, focusedIndex - gridColumns);
            break;
          case 'down':
            newIndex = Math.min(nfts.length - 1, focusedIndex + gridColumns);
            break;
          case 'left':
            newIndex = Math.max(0, focusedIndex - 1);
            break;
          case 'right':
            newIndex = Math.min(nfts.length - 1, focusedIndex + 1);
            break;
        }

        if (newIndex !== focusedIndex) {
          setFocusedIndex(newIndex);
          const nft = nfts[newIndex];
          if (nft) {
            document.getElementById(`nft-${nft.mint.toString()}`)?.focus();
          }
        }
      };

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          handleArrowKey('up');
          break;
        case 'ArrowDown':
          event.preventDefault();
          handleArrowKey('down');
          break;
        case 'ArrowLeft':
          event.preventDefault();
          handleArrowKey('left');
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleArrowKey('right');
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < nfts.length) {
            onSelect?.(nfts[focusedIndex]);
          }
          break;
      }
    },
    [nfts, focusedIndex, gridColumns, onSelect]
  );

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
  };
} 