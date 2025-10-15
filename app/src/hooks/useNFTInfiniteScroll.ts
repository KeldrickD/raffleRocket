import { useState, useCallback, useEffect, useRef } from 'react';
import { NFTListItem } from '../types/nft';

interface InfiniteScrollOptions {
  threshold?: number;
  batchSize?: number;
  initialLoad?: number;
}

export function useNFTInfiniteScroll(nfts: NFTListItem[], options: InfiniteScrollOptions = {}) {
  const { threshold = 0.8, batchSize = 12, initialLoad = batchSize } = options;

  const [displayedNFTs, setDisplayedNFTs] = useState<NFTListItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const currentIndex = useRef(0);

  const loadMoreNFTs = useCallback(() => {
    setIsLoading(true);
    const start = currentIndex.current;
    const end = start + batchSize;
    const nextBatch = nfts.slice(start, end);

    if (nextBatch.length > 0) {
      setDisplayedNFTs((prev) => [...prev, ...nextBatch]);
      currentIndex.current = end;
    }

    if (end >= nfts.length) {
      setHasMore(false);
    }

    setIsLoading(false);
  }, [nfts, batchSize]);

  useEffect(() => {
    const initialBatch = nfts.slice(0, initialLoad);
    setDisplayedNFTs(initialBatch);
    currentIndex.current = initialLoad;
    setHasMore(initialLoad < nfts.length);
  }, [nfts, initialLoad]);

  useEffect(() => {
    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !isLoading) {
        loadMoreNFTs();
      }
    };

    observer.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '20px',
      threshold,
    });

    const currentElement = containerRef.current;
    if (currentElement) {
      observer.current.observe(currentElement);
    }

    return () => {
      if (observer.current && currentElement) {
        observer.current.unobserve(currentElement);
      }
    };
  }, [hasMore, isLoading, loadMoreNFTs, threshold]);

  return {
    displayedNFTs,
    hasMore,
    isLoading,
    containerRef,
    loadMoreNFTs,
  };
} 