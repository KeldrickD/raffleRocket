import { useState, useCallback, useEffect } from 'react';
import { NFTListItem } from '../types/nft';

interface ScrollState {
  scrollTop: number;
  scrollLeft: number;
  isScrolling: boolean;
  scrollDirection: 'up' | 'down' | 'left' | 'right' | null;
}

interface ScrollOptions {
  onScroll?: (state: ScrollState) => void;
  onScrollStart?: () => void;
  onScrollEnd?: () => void;
  threshold?: number;
}

export function useNFTScroll(options: ScrollOptions = {}) {
  const [scrollState, setScrollState] = useState<ScrollState>({
    scrollTop: 0,
    scrollLeft: 0,
    isScrolling: false,
    scrollDirection: null,
  });

  const handleScroll = useCallback((event: Event) => {
    const target = event.target as HTMLElement;
    const { scrollTop, scrollLeft } = target;
    const threshold = options.threshold || 10;

    const prevScrollTop = scrollState.scrollTop;
    const prevScrollLeft = scrollState.scrollLeft;

    let scrollDirection: ScrollState['scrollDirection'] = null;

    if (Math.abs(scrollTop - prevScrollTop) > threshold) {
      scrollDirection = scrollTop > prevScrollTop ? 'down' : 'up';
    } else if (Math.abs(scrollLeft - prevScrollLeft) > threshold) {
      scrollDirection = scrollLeft > prevScrollLeft ? 'right' : 'left';
    }

    setScrollState((prev) => ({
      ...prev,
      scrollTop,
      scrollLeft,
      scrollDirection,
    }));

    options.onScroll?.(scrollState);
  }, [options.threshold, options.onScroll, scrollState]);

  const handleScrollStart = useCallback(() => {
    setScrollState((prev) => ({
      ...prev,
      isScrolling: true,
    }));
    options.onScrollStart?.();
  }, [options.onScrollStart]);

  const handleScrollEnd = useCallback(() => {
    setScrollState((prev) => ({
      ...prev,
      isScrolling: false,
      scrollDirection: null,
    }));
    options.onScrollEnd?.();
  }, [options.onScrollEnd]);

  useEffect(() => {
    const element = document.createElement('div');
    element.addEventListener('scroll', handleScroll);
    element.addEventListener('touchstart', handleScrollStart);
    element.addEventListener('touchend', handleScrollEnd);
    element.addEventListener('mouseenter', handleScrollStart);
    element.addEventListener('mouseleave', handleScrollEnd);

    return () => {
      element.removeEventListener('scroll', handleScroll);
      element.removeEventListener('touchstart', handleScrollStart);
      element.removeEventListener('touchend', handleScrollEnd);
      element.removeEventListener('mouseenter', handleScrollStart);
      element.removeEventListener('mouseleave', handleScrollEnd);
    };
  }, [handleScroll, handleScrollStart, handleScrollEnd]);

  const scrollTo = useCallback((x: number, y: number) => {
    const element = document.createElement('div');
    element.scrollTo({
      left: x,
      top: y,
      behavior: 'smooth',
    });
  }, []);

  return {
    scrollState,
    scrollTo,
  };
} 