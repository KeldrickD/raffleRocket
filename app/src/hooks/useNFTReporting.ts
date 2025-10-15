import { useState, useCallback, useEffect } from 'react';
import { NFTListItem } from '../types/nft';

interface ReportingMetrics {
  renderCount: number;
  errorCount: number;
  loadTime: number;
  interactionCount: number;
  lastInteraction: Date | null;
}

interface ReportingOptions {
  onMetricsUpdate?: (metrics: ReportingMetrics) => void;
  onThresholdExceeded?: (metric: keyof ReportingMetrics, value: number) => void;
  thresholds?: Partial<Record<keyof ReportingMetrics, number>>;
}

export function useNFTReporting(options: ReportingOptions = {}) {
  const [metrics, setMetrics] = useState<ReportingMetrics>({
    renderCount: 0,
    errorCount: 0,
    loadTime: 0,
    interactionCount: 0,
    lastInteraction: null,
  });

  const incrementRenderCount = useCallback(() => {
    setMetrics((prev) => {
      const newCount = prev.renderCount + 1;
      if (options.thresholds?.renderCount && newCount > options.thresholds.renderCount) {
        options.onThresholdExceeded?.('renderCount', newCount);
      }
      return {
        ...prev,
        renderCount: newCount,
      };
    });
  }, [options.thresholds?.renderCount, options.onThresholdExceeded]);

  const reportError = useCallback(() => {
    setMetrics((prev) => {
      const newCount = prev.errorCount + 1;
      if (options.thresholds?.errorCount && newCount > options.thresholds.errorCount) {
        options.onThresholdExceeded?.('errorCount', newCount);
      }
      return {
        ...prev,
        errorCount: newCount,
      };
    });
  }, [options.thresholds?.errorCount, options.onThresholdExceeded]);

  const recordLoadTime = useCallback((time: number) => {
    setMetrics((prev) => {
      if (options.thresholds?.loadTime && time > options.thresholds.loadTime) {
        options.onThresholdExceeded?.('loadTime', time);
      }
      return {
        ...prev,
        loadTime: time,
      };
    });
  }, [options.thresholds?.loadTime, options.onThresholdExceeded]);

  const recordInteraction = useCallback(() => {
    setMetrics((prev) => {
      const newCount = prev.interactionCount + 1;
      if (options.thresholds?.interactionCount && newCount > options.thresholds.interactionCount) {
        options.onThresholdExceeded?.('interactionCount', newCount);
      }
      return {
        ...prev,
        interactionCount: newCount,
        lastInteraction: new Date(),
      };
    });
  }, [options.thresholds?.interactionCount, options.onThresholdExceeded]);

  useEffect(() => {
    options.onMetricsUpdate?.(metrics);
  }, [metrics, options.onMetricsUpdate]);

  const getMetricsSummary = useCallback(() => {
    return {
      ...metrics,
      lastInteraction: metrics.lastInteraction?.toISOString() || 'Never',
      averageLoadTime: `${(metrics.loadTime / Math.max(1, metrics.renderCount)).toFixed(2)}ms`,
      errorRate: `${((metrics.errorCount / Math.max(1, metrics.renderCount)) * 100).toFixed(2)}%`,
    };
  }, [metrics]);

  return {
    metrics,
    incrementRenderCount,
    reportError,
    recordLoadTime,
    recordInteraction,
    getMetricsSummary,
  };
} 