import { useState, useCallback } from 'react';
import { NFTListItem } from '../types/nft';

interface DragState {
  isDragging: boolean;
  draggedNFT: NFTListItem | null;
  draggedIndex: number;
  dropIndex: number;
}

export function useNFTDragAndDrop(nfts: NFTListItem[]) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedNFT: null,
    draggedIndex: -1,
    dropIndex: -1,
  });

  const handleDragStart = useCallback((nft: NFTListItem, index: number) => {
    setDragState({
      isDragging: true,
      draggedNFT: nft,
      draggedIndex: index,
      dropIndex: index,
    });
  }, []);

  const handleDragOver = useCallback(
    (event: React.DragEvent, index: number) => {
      event.preventDefault();
      if (dragState.draggedIndex === index) return;

      setDragState((prev) => ({
        ...prev,
        dropIndex: index,
      }));
    },
    [dragState.draggedIndex]
  );

  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedNFT: null,
      draggedIndex: -1,
      dropIndex: -1,
    });
  }, []);

  const reorderNFTs = useCallback(() => {
    if (!dragState.isDragging || dragState.draggedIndex === dragState.dropIndex) {
      return nfts;
    }

    const reorderedNFTs = [...nfts];
    const [draggedNFT] = reorderedNFTs.splice(dragState.draggedIndex, 1);
    reorderedNFTs.splice(dragState.dropIndex, 0, draggedNFT);

    return reorderedNFTs;
  }, [nfts, dragState]);

  const getDragProps = useCallback(
    (nft: NFTListItem, index: number) => ({
      draggable: true,
      onDragStart: () => handleDragStart(nft, index),
      onDragOver: (event: React.DragEvent) => handleDragOver(event, index),
      onDragEnd: handleDragEnd,
      style: {
        opacity: dragState.draggedIndex === index ? 0.5 : 1,
        cursor: 'grab',
      },
    }),
    [dragState.draggedIndex, handleDragStart, handleDragOver, handleDragEnd]
  );

  return {
    dragState,
    reorderNFTs,
    getDragProps,
  };
} 