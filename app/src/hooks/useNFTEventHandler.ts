import { useCallback } from 'react';
import { NFTListItem } from '../types/nft';

interface NFTEventHandlers {
  onClick: (nft: NFTListItem) => void;
  onMouseEnter: (nft: NFTListItem) => void;
  onMouseLeave: (nft: NFTListItem) => void;
  onFocus: (nft: NFTListItem) => void;
  onBlur: (nft: NFTListItem) => void;
  onDragStart: (nft: NFTListItem) => void;
  onDragEnd: (nft: NFTListItem) => void;
}

export function useNFTEventHandler(handlers: Partial<NFTEventHandlers> = {}) {
  const handleClick = useCallback(
    (nft: NFTListItem) => {
      handlers.onClick?.(nft);
    },
    [handlers.onClick]
  );

  const handleMouseEnter = useCallback(
    (nft: NFTListItem) => {
      handlers.onMouseEnter?.(nft);
    },
    [handlers.onMouseEnter]
  );

  const handleMouseLeave = useCallback(
    (nft: NFTListItem) => {
      handlers.onMouseLeave?.(nft);
    },
    [handlers.onMouseLeave]
  );

  const handleFocus = useCallback(
    (nft: NFTListItem) => {
      handlers.onFocus?.(nft);
    },
    [handlers.onFocus]
  );

  const handleBlur = useCallback(
    (nft: NFTListItem) => {
      handlers.onBlur?.(nft);
    },
    [handlers.onBlur]
  );

  const handleDragStart = useCallback(
    (nft: NFTListItem) => {
      handlers.onDragStart?.(nft);
    },
    [handlers.onDragStart]
  );

  const handleDragEnd = useCallback(
    (nft: NFTListItem) => {
      handlers.onDragEnd?.(nft);
    },
    [handlers.onDragEnd]
  );

  return {
    handleClick,
    handleMouseEnter,
    handleMouseLeave,
    handleFocus,
    handleBlur,
    handleDragStart,
    handleDragEnd,
  };
} 