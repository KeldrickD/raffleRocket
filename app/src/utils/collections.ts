import { NFTCollection } from "@/types/nft";

/**
 * Fetch all NFT collections
 */
export async function fetchCollections(featured?: boolean): Promise<NFTCollection[]> {
  try {
    const url = new URL('/api/collections', window.location.origin);
    
    // Add query parameters if needed
    if (featured !== undefined) {
      url.searchParams.append('featured', featured.toString());
    }
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Error fetching collections: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Convert date strings to Date objects
    return data.map((collection: any) => ({
      ...collection,
      createdAt: collection.createdAt ? new Date(collection.createdAt) : undefined,
    }));
  } catch (error) {
    console.error('Error fetching collections:', error);
    throw error;
  }
}

/**
 * Fetch a specific collection by ID
 */
export async function fetchCollectionById(id: string): Promise<NFTCollection> {
  try {
    const url = new URL('/api/collections', window.location.origin);
    url.searchParams.append('id', id);
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Error fetching collection: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Convert date strings to Date objects
    return {
      ...data,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
    };
  } catch (error) {
    console.error(`Error fetching collection with ID ${id}:`, error);
    throw error;
  }
} 