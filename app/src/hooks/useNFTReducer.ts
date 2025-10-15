import { useReducer, useCallback } from 'react';
import { NFTListItem } from '../types/nft';

type NFTState = {
  nfts: NFTListItem[];
  selectedNFT: NFTListItem | null;
  isLoading: boolean;
  error: string | null;
};

type NFTAction =
  | { type: 'SET_NFTS'; payload: NFTListItem[] }
  | { type: 'SELECT_NFT'; payload: NFTListItem }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: NFTState = {
  nfts: [],
  selectedNFT: null,
  isLoading: false,
  error: null,
};

function nftReducer(state: NFTState, action: NFTAction): NFTState {
  switch (action.type) {
    case 'SET_NFTS':
      return { ...state, nfts: action.payload };
    case 'SELECT_NFT':
      return { ...state, selectedNFT: action.payload };
    case 'CLEAR_SELECTION':
      return { ...state, selectedNFT: null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export function useNFTReducer() {
  const [state, dispatch] = useReducer(nftReducer, initialState);

  const setNFTs = useCallback((nfts: NFTListItem[]) => {
    dispatch({ type: 'SET_NFTS', payload: nfts });
  }, []);

  const selectNFT = useCallback((nft: NFTListItem) => {
    dispatch({ type: 'SELECT_NFT', payload: nft });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: isLoading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  return {
    ...state,
    setNFTs,
    selectNFT,
    clearSelection,
    setLoading,
    setError,
  };
} 