import { useEffect, useRef, useState, useCallback } from 'react';
import { NFTListItem } from '../types/nft';

interface IntersectionOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
}

export function useNFTIntersectionObserver(
  nft: NFTListItem,
  options: IntersectionOptions = {}
) {
  const [isVisible, setIsVisible] = useState(false);
  const targetRef = useRef<HTMLElement | null>(null);

  const callback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      setIsVisible(entry.isIntersecting);
    },
    []
  );

  useEffect(() => {
    const observer = new IntersectionObserver(callback, {
      root: options.root || null,
      rootMargin: options.rootMargin || '0px',
      threshold: options.threshold || 0,
    });

    const currentTarget = targetRef.current;

    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [callback, options.root, options.rootMargin, options.threshold]);

  return {
    targetRef,
    isVisible,
  };
} 