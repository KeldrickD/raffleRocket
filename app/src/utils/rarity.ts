import { NFTListItem, NFTMetadataAttribute } from "@/types/nft";

/**
 * Calculate rarity scores for a collection of NFTs
 * This uses a statistical approach that considers the rarity of each trait
 */
export function calculateRarityScores(nfts: NFTListItem[]): NFTListItem[] {
  if (!nfts || nfts.length === 0) return [];
  
  // Step 1: Count trait frequencies across the collection
  const traitFrequencies: Record<string, Record<string, number>> = {};
  
  // Count occurrences of each trait value
  nfts.forEach(nft => {
    if (!nft.metadata.attributes) return;
    
    nft.metadata.attributes.forEach(attr => {
      const traitType = attr.trait_type;
      const value = attr.value.toString();
      
      // Initialize trait type if not exists
      if (!traitFrequencies[traitType]) {
        traitFrequencies[traitType] = {};
      }
      
      // Increment count
      if (!traitFrequencies[traitType][value]) {
        traitFrequencies[traitType][value] = 1;
      } else {
        traitFrequencies[traitType][value]++;
      }
    });
  });
  
  // Step 2: Calculate rarity score for each NFT
  return nfts.map(nft => {
    let rarityScore = 0;
    
    if (nft.metadata.attributes) {
      nft.metadata.attributes.forEach(attr => {
        const traitType = attr.trait_type;
        const value = attr.value.toString();
        
        // Skip if trait type not tracked (shouldn't happen)
        if (!traitFrequencies[traitType]) return;
        
        // Get frequency of this trait value
        const frequency = traitFrequencies[traitType][value] || 0;
        
        // Calculate rarity score for this trait (rarer = higher score)
        // Formula: 1 / (frequency / total NFTs)
        const traitRarity = nfts.length / frequency;
        rarityScore += traitRarity;
      });
    }
    
    // Create a new NFT object with the rarity score
    return {
      ...nft,
      rarity: parseFloat(rarityScore.toFixed(2)),
    };
  });
}

/**
 * Get rarity rank for an NFT within a collection
 */
export function getRarityRank(nft: NFTListItem, nfts: NFTListItem[]): number {
  if (!nft.rarity || !nfts.length) return 0;
  
  // Sort NFTs by rarity score (higher = better rank)
  const sortedNfts = [...nfts].sort((a, b) => {
    const rarityA = a.rarity || 0;
    const rarityB = b.rarity || 0;
    return rarityB - rarityA;
  });
  
  // Find position of this NFT in the sorted list
  const index = sortedNfts.findIndex(item => item.mint.toString() === nft.mint.toString());
  
  // Return rank (1-based)
  return index >= 0 ? index + 1 : 0;
}

/**
 * Get the rarity label based on percentile
 */
export function getRarityLabel(rank: number, total: number): string {
  const percentile = (rank / total) * 100;
  
  if (percentile <= 1) return "Legendary";
  if (percentile <= 5) return "Epic";
  if (percentile <= 15) return "Rare";
  if (percentile <= 35) return "Uncommon";
  return "Common";
}

/**
 * Calculate trait rarity for a specific attribute
 */
export function calculateTraitRarity(
  attribute: NFTMetadataAttribute,
  nfts: NFTListItem[]
): number {
  if (!nfts.length) return 0;
  
  const traitType = attribute.trait_type;
  const value = attribute.value.toString();
  
  // Count how many NFTs have this exact trait value
  const count = nfts.filter(nft => 
    nft.metadata.attributes?.some(attr => 
      attr.trait_type === traitType && attr.value.toString() === value
    )
  ).length;
  
  // Return the percentage
  return parseFloat(((count / nfts.length) * 100).toFixed(2));
} 