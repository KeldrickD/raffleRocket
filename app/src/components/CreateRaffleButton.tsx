import { FC, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { CreateRaffleModal } from './CreateRaffleModal';
import { handleTransactionError } from '@/utils/transaction';
import toast from 'react-hot-toast';

export const CreateRaffleButton: FC = () => {
  const { connected } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    if (!connected) {
      handleTransactionError(new Error('Please connect your wallet first'));
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <>
      <button
        className="py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        onClick={handleClick}
      >
        Create Raffle
      </button>
      <CreateRaffleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}; 