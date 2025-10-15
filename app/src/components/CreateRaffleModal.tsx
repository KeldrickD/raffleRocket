import { FC, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRaffleProgram } from '@/hooks/useRaffleProgram';
import { createRaffle } from '@/hooks/useRaffleProgram';
import { confirmTransaction, handleTransactionError } from '@/utils/transaction';
import { NFTSelector } from './NFTSelector';
import { UserNFT } from '@/hooks/useUserNFTs';
import { useRaffleRefresh } from '@/hooks/useRaffleRefresh';
import { web3 } from '@project-serum/anchor';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateRaffleModal: FC<Props> = ({ isOpen, onClose }) => {
  const { connected } = useWallet();
  const program = useRaffleProgram();
  const refreshRaffles = useRaffleRefresh();
  const [loading, setLoading] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<UserNFT>();
  const [formData, setFormData] = useState({
    ticketPrice: '',
    ticketCap: '',
    duration: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !program || !selectedNFT) {
      handleTransactionError(new Error('Please connect your wallet and select an NFT'));
      return;
    }

    try {
      setLoading(true);
      const tx = await createRaffle(program, {
        ticketPrice: parseFloat(formData.ticketPrice),
        ticketCap: parseInt(formData.ticketCap),
        duration: parseInt(formData.duration),
        nftMint: new web3.PublicKey(selectedNFT.mint),
        nftTokenAccount: new web3.PublicKey(selectedNFT.tokenAccount),
      });
      await confirmTransaction(program.provider.connection, tx);
      await refreshRaffles();
      onClose();
    } catch (error) {
      handleTransactionError(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Raffle</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select NFT</h3>
            <NFTSelector
              onSelect={setSelectedNFT}
              selectedNFT={selectedNFT}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ticket Price (SOL)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                value={formData.ticketPrice}
                onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ticket Cap
              </label>
              <input
                type="number"
                min="1"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                value={formData.ticketCap}
                onChange={(e) => setFormData({ ...formData, ticketCap: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Duration (days)
              </label>
              <input
                type="number"
                min="1"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !selectedNFT}
            >
              {loading ? 'Creating...' : 'Create Raffle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 