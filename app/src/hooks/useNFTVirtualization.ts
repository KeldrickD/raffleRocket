import { useState, useCallback, useEffect, useRef } from 'react';
import { NFTListItem } from '../types/nft';

interface VirtualizationOptions {
  itemHeight: number;
  overscan?: number;
  containerHeight?: number;
}

interface VirtualItem {
  nft: NFTListItem;
  index: number;
  offsetTop: number;
}

export function useNFTVirtualization(
  nfts: NFTListItem[],
  options: VirtualizationOptions
) {
  const {
    itemHeight,
    overscan = 3,
    containerHeight = typeof window !== 'undefined' ? window.innerHeight : 800,
  } = options;

  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLElement | null>(null);

  const getVirtualItems = useCallback(() => {
    const totalHeight = nfts.length * itemHeight;
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      nfts.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const items: VirtualItem[] = [];
    for (let i = startIndex; i < endIndex; i++) {
      items.push({
        nft: nfts[i],
        index: i,
        offsetTop: i * itemHeight,
      });
    }

    return {
      items,
      totalHeight,
      startIndex,
      endIndex,
    };
  }, [nfts, itemHeight, containerHeight, scrollTop, overscan]);

  const handleScroll = useCallback(
    (event: Event) => {
      const target = event.target as HTMLElement;
      setScrollTop(target.scrollTop);
    },
    []
  );

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const scrollToIndex = useCallback(
    (index: number) => {
      if (containerRef.current) {
        containerRef.current.scrollTop = index * itemHeight;
      }
    },
    [itemHeight]
  );

  return {
    containerRef,
    virtualItems: getVirtualItems(),
    scrollToIndex,
  };
} 