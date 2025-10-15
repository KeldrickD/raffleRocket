import { useState, useCallback, useEffect } from 'react';
import { NFTListItem } from '../types/nft';

interface ResizeState {
  width: number;
  height: number;
  aspectRatio: number;
  isResizing: boolean;
}

interface ResizeOptions {
  onResize?: (state: ResizeState) => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export function useNFTResize(options: ResizeOptions = {}) {
  const [resizeState, setResizeState] = useState<ResizeState>({
    width: 0,
    height: 0,
    aspectRatio: 1,
    isResizing: false,
  });

  const handleResize = useCallback((event: Event) => {
    const target = event.target as HTMLElement;
    const { offsetWidth, offsetHeight } = target;
    const aspectRatio = offsetWidth / offsetHeight;

    setResizeState((prev) => ({
      ...prev,
      width: offsetWidth,
      height: offsetHeight,
      aspectRatio,
    }));

    options.onResize?.(resizeState);
  }, [options.onResize, resizeState]);

  const handleResizeStart = useCallback(() => {
    setResizeState((prev) => ({
      ...prev,
      isResizing: true,
    }));
    options.onResizeStart?.();
  }, [options.onResizeStart]);

  const handleResizeEnd = useCallback(() => {
    setResizeState((prev) => ({
      ...prev,
      isResizing: false,
    }));
    options.onResizeEnd?.();
  }, [options.onResizeEnd]);

  useEffect(() => {
    const element = document.createElement('div');
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const aspectRatio = width / height;

        setResizeState((prev) => ({
          ...prev,
          width,
          height,
          aspectRatio,
        }));

        options.onResize?.(resizeState);
      }
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [options.onResize, resizeState]);

  const resizeTo = useCallback((width: number, height: number) => {
    const element = document.createElement('div');
    const minWidth = options.minWidth || 0;
    const minHeight = options.minHeight || 0;
    const maxWidth = options.maxWidth || Infinity;
    const maxHeight = options.maxHeight || Infinity;

    const constrainedWidth = Math.max(minWidth, Math.min(width, maxWidth));
    const constrainedHeight = Math.max(minHeight, Math.min(height, maxHeight));

    element.style.width = `${constrainedWidth}px`;
    element.style.height = `${constrainedHeight}px`;
  }, [options.minWidth, options.minHeight, options.maxWidth, options.maxHeight]);

  return {
    resizeState,
    resizeTo,
  };
} 