import { FC, useState } from 'react';
import { useUserNFTs, UserNFT } from '@/hooks/useUserNFTs';
import Image from 'next/image';

interface Props {
  onSelect: (nft: UserNFT) => void;
  selectedNFT?: UserNFT;
}

export const NFTSelector: FC<Props> = ({ onSelect, selectedNFT }) => {
  const nfts = useUserNFTs();
  const [searchTerm, setSearchTerm] = useState('');

  if (!nfts) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const filteredNFTs = nfts.filter((nft) =>
    nft.metadata?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nft.metadata?.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div>
        <input
          type="text"
          placeholder="Search NFTs..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredNFTs.map((nft) => (
          <div
            key={nft.mint}
            className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 ${
              selectedNFT?.mint === nft.mint
                ? 'border-purple-600'
                : 'border-transparent hover:border-purple-300'
            }`}
            onClick={() => onSelect(nft)}
          >
            {nft.metadata?.image ? (
              <Image
                src={nft.metadata.image}
                alt={nft.metadata.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredNFTs.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No NFTs found</p>
        </div>
      )}
    </div>
  );
}; 