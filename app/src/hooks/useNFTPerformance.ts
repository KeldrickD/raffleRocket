import { useState, useCallback, useEffect } from 'react';
import { NFTListItem } from '../types/nft';

interface PerformanceState {
  isMonitoring: boolean;
  renderTime: number;
  memoryUsage: number;
  fps: number;
}

interface PerformanceOptions {
  onPerformanceUpdate?: (state: PerformanceState) => void;
  onThresholdExceeded?: () => void;
  renderTimeThreshold?: number;
  memoryThreshold?: number;
  fpsThreshold?: number;
}

export function useNFTPerformance(options: PerformanceOptions = {}) {
  const [performanceState, setPerformanceState] = useState<PerformanceState>({
    isMonitoring: false,
    renderTime: 0,
    memoryUsage: 0,
    fps: 60,
  });

  const startMonitoring = useCallback(() => {
    setPerformanceState((prev) => ({
      ...prev,
      isMonitoring: true,
    }));
  }, []);

  const stopMonitoring = useCallback(() => {
    setPerformanceState((prev) => ({
      ...prev,
      isMonitoring: false,
    }));
  }, []);

  useEffect(() => {
    if (!performanceState.isMonitoring) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const measurePerformance = (currentTime: number) => {
      frameCount++;
      const elapsed = currentTime - lastTime;

      if (elapsed >= 1000) {
        const fps = Math.round((frameCount * 1000) / elapsed);
        const memory = (performance as any).memory?.usedJSHeapSize || 0;
        const renderTime = elapsed / frameCount;

        setPerformanceState((prev) => ({
          ...prev,
          fps,
          memoryUsage: memory,
          renderTime,
        }));

        options.onPerformanceUpdate?.(performanceState);

        if (
          (options.renderTimeThreshold && renderTime > options.renderTimeThreshold) ||
          (options.memoryThreshold && memory > options.memoryThreshold) ||
          (options.fpsThreshold && fps < options.fpsThreshold)
        ) {
          options.onThresholdExceeded?.();
        }

        frameCount = 0;
        lastTime = currentTime;
      }

      animationFrameId = requestAnimationFrame(measurePerformance);
    };

    animationFrameId = requestAnimationFrame(measurePerformance);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [
    performanceState.isMonitoring,
    options.onPerformanceUpdate,
    options.onThresholdExceeded,
    options.renderTimeThreshold,
    options.memoryThreshold,
    options.fpsThreshold,
    performanceState,
  ]);

  const getPerformanceMetrics = useCallback(() => {
    const { renderTime, memoryUsage, fps } = performanceState;
    return {
      renderTime: `${renderTime.toFixed(2)}ms`,
      memoryUsage: `${(memoryUsage / (1024 * 1024)).toFixed(2)}MB`,
      fps: `${fps} FPS`,
    };
  }, [performanceState]);

  return {
    performanceState,
    startMonitoring,
    stopMonitoring,
    getPerformanceMetrics,
  };
} 