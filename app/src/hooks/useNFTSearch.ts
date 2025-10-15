import { useState, useCallback, useMemo } from 'react';
import { NFTListItem } from '../types/nft';

interface SearchOptions {
  fields?: ('name' | 'description' | 'attributes')[];
  minScore?: number;
  caseSensitive?: boolean;
}

interface SearchResult {
  nft: NFTListItem;
  score: number;
}

export function useNFTSearch(nfts: NFTListItem[], options: SearchOptions = {}) {
  const {
    fields = ['name', 'description', 'attributes'],
    minScore = 0.3,
    caseSensitive = false,
  } = options;

  const [searchTerm, setSearchTerm] = useState('');

  const searchNFTs = useCallback(
    (term: string) => {
      setSearchTerm(term);
    },
    []
  );

  const searchResults = useMemo(() => {
    if (!searchTerm) return [];

    const results: SearchResult[] = nfts.map((nft) => {
      let score = 0;
      const term = caseSensitive ? searchTerm : searchTerm.toLowerCase();

      if (fields.includes('name') && nft.metadata?.name) {
        const name = caseSensitive ? nft.metadata.name : nft.metadata.name.toLowerCase();
        if (name.includes(term)) {
          score += 0.5;
        }
      }

      if (fields.includes('description') && nft.metadata?.description) {
        const description = caseSensitive
          ? nft.metadata.description
          : nft.metadata.description.toLowerCase();
        if (description.includes(term)) {
          score += 0.3;
        }
      }

      if (fields.includes('attributes') && nft.metadata?.attributes) {
        const attributeMatches = nft.metadata.attributes.some((attr) => {
          const value = caseSensitive ? attr.value : attr.value.toLowerCase();
          return value.includes(term);
        });
        if (attributeMatches) {
          score += 0.2;
        }
      }

      return { nft, score };
    });

    return results
      .filter((result) => result.score >= minScore)
      .sort((a, b) => b.score - a.score);
  }, [nfts, searchTerm, fields, minScore, caseSensitive]);

  const matchedNFTs = useMemo(() => {
    return searchResults.map((result) => result.nft);
  }, [searchResults]);

  return {
    searchTerm,
    searchNFTs,
    searchResults,
    matchedNFTs,
  };
} 