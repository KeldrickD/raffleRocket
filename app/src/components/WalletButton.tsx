import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { FC } from 'react';

export const WalletButton: FC = () => {
  const { connected } = useWallet();

  return (
    <div className="flex items-center">
      <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
      {connected && (
        <span className="ml-2 text-sm text-gray-600">
          Connected
        </span>
      )}
    </div>
  );
}; 