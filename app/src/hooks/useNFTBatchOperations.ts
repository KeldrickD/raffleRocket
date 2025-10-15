import { useState } from 'react';
import { NFTListItem, BatchOperationType } from '../types/nft';

interface BatchOperationOptions {
  onSuccess?: (operation: BatchOperationType, nfts: NFTListItem[]) => void;
  onError?: (operation: BatchOperationType, error: Error) => void;
}

export const useNFTBatchOperations = (options: BatchOperationOptions = {}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<BatchOperationType | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  // Helper function to make API calls for batch operations
  const processBatchOperation = async (
    operation: BatchOperationType,
    nfts: NFTListItem[],
    params?: Record<string, any>
  ): Promise<void> => {
    if (nfts.length === 0) {
      return;
    }

    setIsProcessing(true);
    setCurrentOperation(operation);
    setProgress(0);
    setError(null);

    try {
      // Start progress animation
      let progressInterval = startProgressSimulation();

      // Call the batch API
      const response = await fetch('/api/nfts/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation,
          mints: nfts.map(nft => nft.mint.toString()),
          params,
        }),
      });

      // Clear the progress simulation
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error during ${operation} operation`);
      }

      const data = await response.json();
      
      // Set progress to complete
      setProgress(100);
      
      if (!data.success) {
        throw new Error(data.error || `Some NFTs failed during ${operation} operation`);
      }

      // Call success callback
      if (options.onSuccess) {
        // Filter the successful NFTs
        const successfulNfts = nfts.filter(nft => 
          data.processed.includes(nft.mint.toString())
        );
        options.onSuccess(operation, successfulNfts);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Unknown error during ${operation}`));
      
      if (options.onError) {
        options.onError(operation, err instanceof Error ? err : new Error(`Unknown error during ${operation}`));
      }
    } finally {
      // Keep the final state for a second so user can see it completed
      setTimeout(() => {
        setIsProcessing(false);
        setCurrentOperation(null);
        setProgress(0);
      }, 1000);
    }
  };

  // Helper function to simulate progress while waiting for API response
  const startProgressSimulation = (): NodeJS.Timeout => {
    setProgress(0);
    
    return setInterval(() => {
      setProgress(prev => {
        // Progress slowly approaches 90% until the real operation completes
        if (prev < 90) {
          return prev + (90 - prev) * 0.1;
        }
        return prev;
      });
    }, 100);
  };

  // Operation-specific functions
  const transferNFTs = (nfts: NFTListItem[], recipient: string) => {
    return processBatchOperation('transfer', nfts, { recipient });
  };

  const listNFTs = (nfts: NFTListItem[], price: number) => {
    return processBatchOperation('list', nfts, { price });
  };

  const delistNFTs = (nfts: NFTListItem[]) => {
    return processBatchOperation('delist', nfts);
  };

  const raffleNFTs = (nfts: NFTListItem[], ticketPrice: number, duration: number) => {
    return processBatchOperation('raffle', nfts, { ticketPrice, duration });
  };

  const burnNFTs = (nfts: NFTListItem[]) => {
    return processBatchOperation('burn', nfts);
  };

  return {
    // State
    isProcessing,
    currentOperation,
    progress,
    error,
    
    // Operations
    transferNFTs,
    listNFTs,
    delistNFTs,
    raffleNFTs,
    burnNFTs,
  };
}; 