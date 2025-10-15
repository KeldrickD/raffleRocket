import { useState, useCallback, useMemo } from 'react';
import { NFTListItem } from '../types/nft';

interface PaginationOptions {
  itemsPerPage?: number;
  initialPage?: number;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startIndex: number;
  endIndex: number;
}

export function useNFTPagination(nfts: NFTListItem[], options: PaginationOptions = {}) {
  const { itemsPerPage = 12, initialPage = 1 } = options;
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = useMemo(() => {
    return Math.ceil(nfts.length / itemsPerPage);
  }, [nfts.length, itemsPerPage]);

  const paginationInfo = useMemo((): PaginationInfo => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, nfts.length);

    return {
      currentPage,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      startIndex,
      endIndex,
    };
  }, [currentPage, totalPages, itemsPerPage, nfts.length]);

  const paginatedNFTs = useMemo(() => {
    const { startIndex, endIndex } = paginationInfo;
    return nfts.slice(startIndex, endIndex);
  }, [nfts, paginationInfo]);

  const goToPage = useCallback(
    (page: number) => {
      const targetPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(targetPage);
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    if (paginationInfo.hasNextPage) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, paginationInfo.hasNextPage, goToPage]);

  const previousPage = useCallback(() => {
    if (paginationInfo.hasPreviousPage) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, paginationInfo.hasPreviousPage, goToPage]);

  const firstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const lastPage = useCallback(() => {
    goToPage(totalPages);
  }, [goToPage, totalPages]);

  return {
    paginatedNFTs,
    paginationInfo,
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
  };
}

export function useNFTPaginationInfo(
  nfts: NFTListItem[],
  itemsPerPage: number
) {
  return useMemo(() => {
    const totalItems = nfts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const hasNextPage = (page: number) => page < totalPages - 1;
    const hasPrevPage = (page: number) => page > 0;

    return {
      totalItems,
      totalPages,
      hasNextPage,
      hasPrevPage,
    };
  }, [nfts, itemsPerPage]);
} 