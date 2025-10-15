import { useState, useCallback, useEffect } from 'react';
import { NFTListItem } from '../types/nft';

interface MutationState {
  isMutating: boolean;
  target: Element | null;
  type: MutationType | null;
  oldValue: string | null;
  newValue: string | null;
}

type MutationType = 'attributes' | 'childList' | 'characterData';

interface MutationOptions {
  attributes?: boolean;
  childList?: boolean;
  characterData?: boolean;
  subtree?: boolean;
  attributeFilter?: string[];
  onMutation?: (state: MutationState) => void;
  onMutationStart?: () => void;
  onMutationEnd?: () => void;
}

export function useNFTMutation(options: MutationOptions = {}) {
  const [mutationState, setMutationState] = useState<MutationState>({
    isMutating: false,
    target: null,
    type: null,
    oldValue: null,
    newValue: null,
  });

  const handleMutation = useCallback((mutations: MutationRecord[]) => {
    const mutation = mutations[0];
    if (!mutation) return;

    const newState = {
      isMutating: true,
      target: mutation.target,
      type: mutation.type as MutationType,
      oldValue: mutation.oldValue,
      newValue: mutation.target.textContent,
    };

    setMutationState((prev) => ({
      ...prev,
      ...newState,
    }));

    options.onMutation?.(newState);
    options.onMutationStart?.();

    // Reset mutation state after a short delay
    setTimeout(() => {
      setMutationState((prev) => ({
        ...prev,
        isMutating: false,
      }));
      options.onMutationEnd?.();
    }, 100);
  }, [options.onMutation, options.onMutationStart, options.onMutationEnd]);

  useEffect(() => {
    const element = document.createElement('div');
    const observer = new MutationObserver(handleMutation);

    observer.observe(element, {
      attributes: options.attributes,
      childList: options.childList,
      characterData: options.characterData,
      subtree: options.subtree,
      attributeFilter: options.attributeFilter,
      attributeOldValue: true,
      characterDataOldValue: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [
    handleMutation,
    options.attributes,
    options.childList,
    options.characterData,
    options.subtree,
    options.attributeFilter,
  ]);

  const getMutationStyle = useCallback(() => {
    const { isMutating } = mutationState;
    return {
      transition: 'all 0.3s ease-out',
      transform: isMutating ? 'scale(1.05)' : 'scale(1)',
      opacity: isMutating ? 0.8 : 1,
    };
  }, [mutationState]);

  return {
    mutationState,
    getMutationStyle,
  };
} 