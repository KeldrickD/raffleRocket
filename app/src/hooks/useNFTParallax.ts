import { useState, useCallback, useEffect } from 'react';
import { NFTListItem } from '../types/nft';

interface ParallaxState {
  offsetX: number;
  offsetY: number;
  scale: number;
  rotation: number;
}

interface ParallaxOptions {
  sensitivity?: number;
  maxOffset?: number;
  onParallaxChange?: (state: ParallaxState) => void;
}

export function useNFTParallax(options: ParallaxOptions = {}) {
  const [parallaxState, setParallaxState] = useState<ParallaxState>({
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    rotation: 0,
  });

  const handleMouseMove = useCallback((event: MouseEvent) => {
    const { clientX, clientY } = event;
    const { innerWidth, innerHeight } = window;
    const sensitivity = options.sensitivity || 0.1;
    const maxOffset = options.maxOffset || 20;

    const offsetX = ((clientX / innerWidth - 0.5) * 2) * maxOffset * sensitivity;
    const offsetY = ((clientY / innerHeight - 0.5) * 2) * maxOffset * sensitivity;
    const scale = 1 + Math.abs(offsetX + offsetY) * 0.01;
    const rotation = (offsetX + offsetY) * 0.5;

    setParallaxState((prev) => ({
      ...prev,
      offsetX,
      offsetY,
      scale,
      rotation,
    }));

    options.onParallaxChange?.(parallaxState);
  }, [options.sensitivity, options.maxOffset, options.onParallaxChange, parallaxState]);

  const handleMouseLeave = useCallback(() => {
    setParallaxState((prev) => ({
      ...prev,
      offsetX: 0,
      offsetY: 0,
      scale: 1,
      rotation: 0,
    }));
  }, []);

  useEffect(() => {
    const element = document.createElement('div');
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  const getParallaxStyle = useCallback(() => {
    const { offsetX, offsetY, scale, rotation } = parallaxState;
    return {
      transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale}) rotate(${rotation}deg)`,
      transition: 'transform 0.1s ease-out',
    };
  }, [parallaxState]);

  return {
    parallaxState,
    getParallaxStyle,
  };
} 