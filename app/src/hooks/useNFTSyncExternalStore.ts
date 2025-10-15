import { useSyncExternalStore } from 'react';
import { NFTListItem } from '../types/nft';

interface NFTStore {
  subscribe: (callback: () => void) => () => void;
  getSnapshot: () => NFTListItem[];
  getServerSnapshot?: () => NFTListItem[];
}

export function createNFTStore(): NFTStore {
  const nfts: NFTListItem[] = [];
  const listeners = new Set<() => void>();

  const subscribe = (callback: () => void) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
  };

  const getSnapshot = () => nfts;

  // For internal use when updating the store
  // const emitChange = () => {
  //   listeners.forEach((listener) => listener());
  // };

  return {
    subscribe,
    getSnapshot,
    getServerSnapshot: getSnapshot,
  };
}

export function useNFTSyncExternalStore(store: NFTStore) {
  const nfts = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );

  return nfts;
} 