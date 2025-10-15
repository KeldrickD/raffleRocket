import { useEffect, useState, useCallback } from 'react';
import { NFTListItem } from '../types/nft';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
}

export function useNFTPerformanceObserver(nft: NFTListItem) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    interactionTime: 0,
  });

  const callback = useCallback((list: PerformanceObserverEntryList) => {
    const entries = list.getEntries();
    let loadTime = 0;
    let renderTime = 0;
    let interactionTime = 0;

    entries.forEach((entry) => {
      if (entry.entryType === 'resource' && entry instanceof PerformanceResourceTiming) {
        loadTime = entry.duration;
      } else if (entry.entryType === 'paint' && entry instanceof PerformancePaintTiming) {
        renderTime = entry.startTime;
      } else if (entry.entryType === 'first-input' && entry instanceof PerformanceEventTiming) {
        interactionTime = entry.processingStart - entry.startTime;
      }
    });

    setMetrics({
      loadTime,
      renderTime,
      interactionTime,
    });
  }, []);

  useEffect(() => {
    const observer = new PerformanceObserver(callback);
    observer.observe({
      entryTypes: ['resource', 'paint', 'first-input'],
    });

    return () => observer.disconnect();
  }, [callback]);

  return metrics;
} 