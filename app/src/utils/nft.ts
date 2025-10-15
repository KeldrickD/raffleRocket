import { Connection, PublicKey, ParsedAccountData } from '@solana/web3.js';
import { PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID } from '@metaplex-foundation/mpl-token-metadata';
import { NFTListItem, NFTMetadata, NFTFilters, NFTSortOptions, PaginationInfo } from '@/types/nft';

export async function getNFTMetadata(
  connection: Connection,
  mint: PublicKey
): Promise<NFTMetadata | null> {
  try {
    // Find the metadata PDA
    const [metadataPDA] = await PublicKey.findProgramAddress(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    // Get the metadata account
    const metadataAccount = await connection.getAccountInfo(metadataPDA);
    if (!metadataAccount) {
      console.error('No metadata account found');
      return null;
    }

    // Get the URI from the metadata
    const metadata = await connection.getParsedAccountInfo(metadataPDA);
    if (!metadata.value?.data) {
      console.error('No metadata data found');
      return null;
    }

    // Check if data is a ParsedAccountData object
    const parsedData = metadata.value.data as ParsedAccountData;
    if (!parsedData.parsed || !parsedData.parsed.info || !parsedData.parsed.info.uri) {
      console.error('No URI found in metadata or data is not in parsed format');
      return null;
    }

    const uri = parsedData.parsed.info.uri;

    // Fetch the JSON metadata
    const response = await fetch(uri);
    if (!response.ok) {
      console.error('Failed to fetch metadata JSON');
      return null;
    }

    const json = await response.json();
    return {
      name: json.name,
      symbol: json.symbol,
      image: json.image,
      description: json.description,
    };
  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    return null;
  }
}

export async function getNFTImage(
  connection: Connection,
  mint: PublicKey
): Promise<string | null> {
  const metadata = await getNFTMetadata(connection, mint);
  return metadata?.image || null;
}

export async function getNFTName(
  connection: Connection,
  mint: PublicKey
): Promise<string | null> {
  const metadata = await getNFTMetadata(connection, mint);
  return metadata?.name || null;
}

interface FetchNFTsOptions {
  filters?: NFTFilters;
  sort?: NFTSortOptions;
  page?: number;
  pageSize?: number;
}

interface FetchNFTsResponse {
  nfts: NFTListItem[];
  pagination: PaginationInfo;
}

/**
 * Fetches NFTs from the API with optional filtering, sorting, and pagination
 */
export const fetchNFTs = async (options: FetchNFTsOptions = {}): Promise<FetchNFTsResponse> => {
  const { filters, sort, page = 1, pageSize = 12 } = options;
  
  // Build query parameters
  const params = new URLSearchParams();
  
  // Add filters
  if (filters?.name) {
    params.append('name', filters.name);
  }
  if (filters?.minPrice !== undefined) {
    params.append('minPrice', filters.minPrice.toString());
  }
  if (filters?.maxPrice !== undefined) {
    params.append('maxPrice', filters.maxPrice.toString());
  }
  
  // Add sorting
  if (sort?.field) {
    params.append('sortField', sort.field);
    params.append('sortDirection', sort.direction);
  }
  
  // Add pagination
  params.append('page', page.toString());
  params.append('pageSize', pageSize.toString());
  
  try {
    const response = await fetch(`/api/nfts?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching NFTs: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      nfts: data.nfts.map((nft: any) => ({
        ...nft,
        mint: new PublicKey(nft.mint),
        createdAt: nft.createdAt ? new Date(nft.createdAt) : undefined,
      })),
      pagination: data.pagination,
    };
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    throw error;
  }
};

/**
 * Fetches a single NFT by mint address
 */
export const fetchNFTByMint = async (mint: PublicKey | string): Promise<NFTListItem> => {
  const mintString = mint instanceof PublicKey ? mint.toString() : mint;
  
  try {
    const response = await fetch(`/api/nfts?mint=${mintString}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching NFT: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Convert string mint to PublicKey
    return {
      ...data,
      mint: new PublicKey(data.mint),
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
    };
  } catch (error) {
    console.error(`Error fetching NFT with mint ${mintString}:`, error);
    throw error;
  }
};

/**
 * Creates a new NFT with the provided metadata
 */
export const createNFT = async (metadata: NFTMetadata): Promise<NFTListItem> => {
  try {
    const response = await fetch('/api/nfts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ metadata }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error creating NFT: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Convert string mint to PublicKey
    return {
      ...data,
      mint: new PublicKey(data.mint),
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
    };
  } catch (error) {
    console.error('Error creating NFT:', error);
    throw error;
  }
}; 