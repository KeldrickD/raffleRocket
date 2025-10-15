import { useEffect, useRef, useState, useCallback } from 'react';
import { NFTListItem } from '../types/nft';

interface MutationOptions {
  attributes?: boolean;
  childList?: boolean;
  subtree?: boolean;
  attributeFilter?: string[];
}

export function useNFTMutationObserver(
  nft: NFTListItem,
  options: MutationOptions = {}
) {
  const [mutations, setMutations] = useState<MutationRecord[]>([]);
  const targetRef = useRef<HTMLElement | null>(null);

  const callback = useCallback((mutationsList: MutationRecord[]) => {
    setMutations(mutationsList);
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(callback);
    const currentTarget = targetRef.current;

    if (currentTarget) {
      observer.observe(currentTarget, {
        attributes: options.attributes ?? true,
        childList: options.childList ?? true,
        subtree: options.subtree ?? true,
        attributeFilter: options.attributeFilter,
      });
    }

    return () => {
      if (currentTarget) {
        observer.disconnect();
      }
    };
  }, [
    callback,
    options.attributes,
    options.childList,
    options.subtree,
    options.attributeFilter,
  ]);

  return {
    targetRef,
    mutations,
  };
} 