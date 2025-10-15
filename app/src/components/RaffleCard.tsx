import { FC } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { BuyTicketButton } from './BuyTicketButton';
import { formatDistanceToNow } from 'date-fns';

interface RaffleCardProps {
  raffle: {
    publicKey: any;
    account: {
      ticketPrice: number;
      ticketCap: number;
      ticketsSold: number;
      endTime: number;
      nftMint: any;
    };
  };
}

export const RaffleCard: FC<RaffleCardProps> = ({ raffle }) => {
  const { publicKey } = useWallet();
  const { ticketPrice, ticketCap, ticketsSold, endTime, nftMint } = raffle.account;

  const timeLeft = formatDistanceToNow(new Date(endTime * 1000), { addSuffix: true });
  const progress = (ticketsSold / ticketCap) * 100;

  return (
    <div className="card">
      <div className="relative aspect-square mb-4">
        {/* TODO: Add NFT image preview */}
        <div className="absolute inset-0 bg-gray-200 rounded-lg"></div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">NFT Raffle</h3>
          <p className="text-sm text-gray-500">Ends {timeLeft}</p>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Tickets Sold</span>
            <span>{ticketsSold} / {ticketCap}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-500">Price per ticket</span>
            <p className="font-semibold">{ticketPrice / 1e9} SOL</p>
          </div>

          {publicKey && (
            <BuyTicketButton raffle={raffle} />
          )}
        </div>
      </div>
    </div>
  );
}; 