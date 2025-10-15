import { useState, useCallback, useEffect } from 'react';
import { NFTListItem } from '../types/nft';

interface TransitionState {
  isTransitioning: boolean;
  progress: number;
  duration: number;
  easing: string;
}

interface TransitionOptions {
  duration?: number;
  easing?: string;
  onComplete?: () => void;
}

export function useNFTTransition(options: TransitionOptions = {}) {
  const [transitionState, setTransitionState] = useState<TransitionState>({
    isTransitioning: false,
    progress: 0,
    duration: options.duration || 500,
    easing: options.easing || 'ease-in-out',
  });

  const startTransition = useCallback(() => {
    setTransitionState((prev) => ({
      ...prev,
      isTransitioning: true,
      progress: 0,
    }));
  }, []);

  const stopTransition = useCallback(() => {
    setTransitionState((prev) => ({
      ...prev,
      isTransitioning: false,
      progress: 0,
    }));
  }, []);

  const pauseTransition = useCallback(() => {
    setTransitionState((prev) => ({
      ...prev,
      isTransitioning: false,
    }));
  }, []);

  const resumeTransition = useCallback(() => {
    setTransitionState((prev) => ({
      ...prev,
      isTransitioning: true,
    }));
  }, []);

  const setProgress = useCallback((progress: number) => {
    setTransitionState((prev) => ({
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
      const progress = Math.min(elapsed / transitionState.duration, 1);

      setTransitionState((prev) => ({
        ...prev,
        progress,
      }));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setTransitionState((prev) => ({
          ...prev,
          isTransitioning: false,
        }));
        options.onComplete?.();
      }
    };

    if (transitionState.isTransitioning) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [transitionState.isTransitioning, transitionState.duration, options.onComplete]);

  const getTransitionStyle = useCallback(() => {
    const { progress, easing } = transitionState;
    return {
      opacity: progress,
      transform: `translateY(${(1 - progress) * 20}px)`,
      transition: `all ${transitionState.duration}ms ${easing}`,
    };
  }, [transitionState]);

  return {
    transitionState,
    startTransition,
    stopTransition,
    pauseTransition,
    resumeTransition,
    setProgress,
    getTransitionStyle,
  };
} 