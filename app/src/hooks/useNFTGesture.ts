import { useState, useCallback, useEffect } from 'react';
import { NFTListItem } from '../types/nft';

interface GestureState {
  isDragging: boolean;
  isPinching: boolean;
  scale: number;
  rotation: number;
  translateX: number;
  translateY: number;
}

interface GestureOptions {
  onGestureStart?: () => void;
  onGestureEnd?: () => void;
  onGestureChange?: (state: GestureState) => void;
}

export function useNFTGesture(options: GestureOptions = {}) {
  const [gestureState, setGestureState] = useState<GestureState>({
    isDragging: false,
    isPinching: false,
    scale: 1,
    rotation: 0,
    translateX: 0,
    translateY: 0,
  });

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (event.touches.length === 1) {
      setGestureState((prev) => ({
        ...prev,
        isDragging: true,
      }));
      options.onGestureStart?.();
    } else if (event.touches.length === 2) {
      setGestureState((prev) => ({
        ...prev,
        isPinching: true,
      }));
      options.onGestureStart?.();
    }
  }, [options.onGestureStart]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    event.preventDefault();

    if (event.touches.length === 1) {
      const touch = event.touches[0];
      setGestureState((prev) => ({
        ...prev,
        translateX: touch.clientX,
        translateY: touch.clientY,
      }));
    } else if (event.touches.length === 2) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      const angle = Math.atan2(
        touch2.clientY - touch1.clientY,
        touch2.clientX - touch1.clientX
      );

      setGestureState((prev) => ({
        ...prev,
        scale: distance / 100,
        rotation: (angle * 180) / Math.PI,
      }));
    }

    options.onGestureChange?.(gestureState);
  }, [gestureState, options.onGestureChange]);

  const handleTouchEnd = useCallback(() => {
    setGestureState((prev) => ({
      ...prev,
      isDragging: false,
      isPinching: false,
    }));
    options.onGestureEnd?.();
  }, [options.onGestureEnd]);

  useEffect(() => {
    const element = document.createElement('div');
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const getGestureStyle = useCallback(() => {
    const { scale, rotation, translateX, translateY } = gestureState;
    return {
      transform: `translate(${translateX}px, ${translateY}px) scale(${scale}) rotate(${rotation}deg)`,
      touchAction: 'none',
    };
  }, [gestureState]);

  return {
    gestureState,
    getGestureStyle,
  };
} 