import { useState, useCallback, useEffect } from 'react';
import { NFTListItem } from '../types/nft';

interface AnimationState {
  isAnimating: boolean;
  progress: number;
  duration: number;
  easing: string;
}

interface AnimationOptions {
  duration?: number;
  easing?: string;
  onComplete?: () => void;
}

export function useNFTAnimation(options: AnimationOptions = {}) {
  const [animationState, setAnimationState] = useState<AnimationState>({
    isAnimating: false,
    progress: 0,
    duration: options.duration || 1000,
    easing: options.easing || 'ease-in-out',
  });

  const startAnimation = useCallback(() => {
    setAnimationState((prev: AnimationState) => ({
      ...prev,
      isAnimating: true,
      progress: 0,
    }));
  }, []);

  const stopAnimation = useCallback(() => {
    setAnimationState((prev: AnimationState) => ({
      ...prev,
      isAnimating: false,
      progress: 0,
    }));
  }, []);

  const pauseAnimation = useCallback(() => {
    setAnimationState((prev: AnimationState) => ({
      ...prev,
      isAnimating: false,
    }));
  }, []);

  const resumeAnimation = useCallback(() => {
    setAnimationState((prev: AnimationState) => ({
      ...prev,
      isAnimating: true,
    }));
  }, []);

  const setProgress = useCallback((progress: number) => {
    setAnimationState((prev: AnimationState) => ({
      ...prev,
      progress: Math.max(0, Math.min(1, progress)),
    }));
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    let startTime: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / animationState.duration, 1);

      setAnimationState((prev: AnimationState) => ({
        ...prev,
        progress,
      }));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setAnimationState((prev: AnimationState) => ({
          ...prev,
          isAnimating: false,
        }));
        options.onComplete?.();
      }
    };

    if (animationState.isAnimating) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [animationState.isAnimating, animationState.duration, options.onComplete]);

  const getAnimationStyle = useCallback(() => {
    const { progress, easing } = animationState;
    return {
      transform: `scale(${1 + progress * 0.1})`,
      opacity: 1 - progress * 0.5,
      transition: `all ${animationState.duration}ms ${easing}`,
    };
  }, [animationState]);

  return {
    animationState,
    startAnimation,
    stopAnimation,
    pauseAnimation,
    resumeAnimation,
    setProgress,
    getAnimationStyle,
  };
} 