import { useEffect, useState, useCallback } from 'react';
import { NFTListItem } from '../types/nft';

interface ReportingMetrics {
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
}

export function useNFTReportingObserver(nft: NFTListItem) {
  const [metrics, setMetrics] = useState<ReportingMetrics>({
    largestContentfulPaint: 0,
    firstInputDelay: 0,
    cumulativeLayoutShift: 0,
  });

  const callback = useCallback((list: ReportList) => {
    list.getReports().forEach((report) => {
      if (report.type === 'largest-contentful-paint') {
        setMetrics((prev) => ({
          ...prev,
          largestContentfulPaint: report.body.value,
        }));
      } else if (report.type === 'first-input') {
        setMetrics((prev) => ({
          ...prev,
          firstInputDelay: report.body.value,
        }));
      } else if (report.type === 'layout-shift') {
        setMetrics((prev) => ({
          ...prev,
          cumulativeLayoutShift: prev.cumulativeLayoutShift + report.body.value,
        }));
      }
    });
  }, []);

  useEffect(() => {
    const observer = new ReportingObserver(callback, {
      buffered: true,
      types: ['largest-contentful-paint', 'first-input', 'layout-shift'],
    });

    observer.observe();

    return () => observer.disconnect();
  }, [callback]);

  return metrics;
} 