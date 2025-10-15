import { useState, useCallback, useEffect } from 'react';
import { NFTListItem } from '../types/nft';

interface IntersectionState {
  isIntersecting: boolean;
  intersectionRatio: number;
  target: Element | null;
}

interface IntersectionOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  onIntersect?: (state: IntersectionState) => void;
  onEnter?: () => void;
  onLeave?: () => void;
}

export function useNFTIntersection(options: IntersectionOptions = {}) {
  const [intersectionState, setIntersectionState] = useState<IntersectionState>({
    isIntersecting: false,
    intersectionRatio: 0,
    target: null,
  });

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const entry = entries[0];
    if (!entry) return;

    const newState = {
      isIntersecting: entry.isIntersecting,
      intersectionRatio: entry.intersectionRatio,
      target: entry.target,
    };

    setIntersectionState((prev) => ({
      ...prev,
      ...newState,
    }));

    options.onIntersect?.(newState);

    if (entry.isIntersecting) {
      options.onEnter?.();
    } else {
      options.onLeave?.();
    }
  }, [options.onIntersect, options.onEnter, options.onLeave]);

  useEffect(() => {
    const element = document.createElement('div');
    const observer = new IntersectionObserver(handleIntersection, {
      root: options.root,
      rootMargin: options.rootMargin,
      threshold: options.threshold,
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [handleIntersection, options.root, options.rootMargin, options.threshold]);

  const getIntersectionStyle = useCallback(() => {
    const { isIntersecting, intersectionRatio } = intersectionState;
    return {
      opacity: isIntersecting ? intersectionRatio : 0,
      transform: `scale(${isIntersecting ? 1 + intersectionRatio * 0.1 : 1})`,
      transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
    };
  }, [intersectionState]);

  return {
    intersectionState,
    getIntersectionStyle,
  };
} 