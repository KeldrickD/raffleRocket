import { useState, useCallback } from 'react';
import { NFTListItem } from '../types/nft';

interface Transform {
  scale: number;
  rotate: number;
  translateX: number;
  translateY: number;
}

interface TransformOptions {
  minScale?: number;
  maxScale?: number;
  minRotate?: number;
  maxRotate?: number;
  minTranslate?: number;
  maxTranslate?: number;
}

const defaultOptions: TransformOptions = {
  minScale: 0.5,
  maxScale: 2,
  minRotate: -180,
  maxRotate: 180,
  minTranslate: -100,
  maxTranslate: 100,
};

export function useNFTTransform(nft?: NFTListItem, options: TransformOptions = {}) {
  const {
    minScale = defaultOptions.minScale,
    maxScale = defaultOptions.maxScale,
    minRotate = defaultOptions.minRotate,
    maxRotate = defaultOptions.maxRotate,
    minTranslate = defaultOptions.minTranslate,
    maxTranslate = defaultOptions.maxTranslate,
  } = options;

  const [transform, setTransform] = useState<Transform>({
    scale: 1,
    rotate: 0,
    translateX: 0,
    translateY: 0,
  });

  const setScale = useCallback(
    (scale: number) => {
      if (!nft) return;
      const clampedScale = Math.min(Math.max(scale, minScale!), maxScale!);
      setTransform((prev) => ({ ...prev, scale: clampedScale }));
    },
    [nft, minScale, maxScale]
  );

  const setRotate = useCallback(
    (rotate: number) => {
      if (!nft) return;
      const clampedRotate = Math.min(Math.max(rotate, minRotate!), maxRotate!);
      setTransform((prev) => ({ ...prev, rotate: clampedRotate }));
    },
    [nft, minRotate, maxRotate]
  );

  const setTranslate = useCallback(
    (x: number, y: number) => {
      if (!nft) return;
      const clampedX = Math.min(Math.max(x, minTranslate!), maxTranslate!);
      const clampedY = Math.min(Math.max(y, minTranslate!), maxTranslate!);
      setTransform((prev) => ({
        ...prev,
        translateX: clampedX,
        translateY: clampedY,
      }));
    },
    [nft, minTranslate, maxTranslate]
  );

  const reset = useCallback(() => {
    if (!nft) return;
    setTransform({
      scale: 1,
      rotate: 0,
      translateX: 0,
      translateY: 0,
    });
  }, [nft]);

  const getTransformStyle = useCallback(() => {
    return {
      transform: `scale(${transform.scale}) rotate(${transform.rotate}deg) translate(${transform.translateX}px, ${transform.translateY}px)`,
    };
  }, [transform]);

  return {
    transform,
    setScale,
    setRotate,
    setTranslate,
    reset,
    getTransformStyle,
  };
} 