import { useImperativeHandle, forwardRef, ForwardedRef } from 'react';
import { NFTListItem } from '../types/nft';

export interface NFTHandleRef {
  selectNFT: (nft: NFTListItem) => void;
  clearSelection: () => void;
  refresh: () => void;
}

interface Props {
  onSelectNFT: (nft: NFTListItem) => void;
  onClearSelection: () => void;
  onRefresh: () => void;
}

export const NFTImperativeHandle = forwardRef(
  (props: Props, ref: ForwardedRef<NFTHandleRef>) => {
    const { onSelectNFT, onClearSelection, onRefresh } = props;

    useImperativeHandle(
      ref,
      () => ({
        selectNFT: onSelectNFT,
        clearSelection: onClearSelection,
        refresh: onRefresh,
      }),
      [onSelectNFT, onClearSelection, onRefresh]
    );

    return null;
  }
);

NFTImperativeHandle.displayName = 'NFTImperativeHandle'; 