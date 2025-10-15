import { PublicKey } from '@solana/web3.js';

export interface NFTMetadataAttribute {
  trait_type: string;
  value: string | number;
}

export interface NFTCollection {
  id: string;
  name: string;
  symbol?: string;
  description?: string;
  image?: string;
  website?: string;
  mintCount?: number;
  floorPrice?: number;
  verified?: boolean;
  featured?: boolean;
  createdAt?: Date;
}

export interface NFTMetadata {
  name: string;
  symbol: string;
  description?: string;
  image: string;
  attributes?: NFTMetadataAttribute[];
  external_url?: string;
  animation_url?: string;
  properties?: Record<string, any>;
  collection?: {
    name: string;
    family?: string;
  };
  seller_fee_basis_points?: number;
}

export interface NFTListItem {
  mint: PublicKey;
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
  metadata: NFTMetadata;
  price?: number;
  owner?: PublicKey;
  listed?: boolean;
  rarity?: number;
  createdAt?: Date;
  collectionId?: string;
}

export type SortField = 'name' | 'price' | 'rarity' | 'date';
export type SortDirection = 'asc' | 'desc';

export interface NFTSortOptions {
  field: SortField;
  direction: SortDirection;
}

export interface NFTFilters {
  name?: string;
  minPrice?: number;
  maxPrice?: number;
  attributes?: Record<string, string | number>;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export type BatchOperationType = 'transfer' | 'list' | 'delist' | 'raffle' | 'burn'; 