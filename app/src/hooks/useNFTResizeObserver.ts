import { useEffect, useRef, useState, useCallback } from 'react';
import { NFTListItem } from '../types/nft';

interface Size {
  width: number;
  height: number;
}

export function useNFTResizeObserver(nft: NFTListItem) {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  const targetRef = useRef<HTMLElement | null>(null);

  const callback = useCallback((entries: ResizeObserverEntry[]) => {
    const [entry] = entries;
    const { width, height } = entry.contentRect;
    setSize({ width, height });
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver(callback);
    const currentTarget = targetRef.current;

    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [callback]);

  return {
    targetRef,
    size,
  };
} 