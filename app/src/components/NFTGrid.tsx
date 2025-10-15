import React from 'react';
import { Box, SimpleGrid, Text, Image, Flex, Badge, Link, Heading, useColorModeValue, Skeleton } from '@chakra-ui/react';

export interface NFTGridItem {
  id: string;
  name?: string;
  image?: string;
  price?: number;
  collection?: string;
  link?: string;
  rarity?: number;
  attributes?: { 
    trait_type: string;
    value: string;
  }[];
}

interface NFTGridProps {
  items: NFTGridItem[];
  columns?: { base: number; md: number; lg: number; xl: number };
  spacing?: number;
  emptyMessage?: string;
  isLoading?: boolean;
  skeletonCount?: number;
}

export const NFTGrid: React.FC<NFTGridProps> = ({
  items,
  columns = { base: 1, md: 2, lg: 3, xl: 4 },
  spacing = 6,
  emptyMessage = "No NFTs found",
  isLoading = false,
  skeletonCount = 8
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('white', 'gray.800');
  
  if (isLoading) {
    return (
      <SimpleGrid columns={columns} spacing={spacing}>
        {Array(skeletonCount).fill(0).map((_, i) => (
          <Box 
            key={`skeleton-${i}`}
            borderWidth="1px" 
            borderRadius="lg" 
            overflow="hidden"
            borderColor={borderColor}
            bg={bgColor}
          >
            <Skeleton height="260px" />
            <Box p={4}>
              <Skeleton height="20px" width="80%" mb={2} />
              <Skeleton height="16px" width="60%" mb={2} />
              <Skeleton height="16px" width="40%" />
            </Box>
          </Box>
        ))}
      </SimpleGrid>
    );
  }
  
  if (items.length === 0) {
    return (
      <Flex 
        justify="center" 
        align="center" 
        height="200px" 
        borderWidth="1px" 
        borderRadius="lg" 
        borderColor={borderColor}
        bg={bgColor}
      >
        <Text fontSize="lg" color="gray.500">{emptyMessage}</Text>
      </Flex>
    );
  }
  
  return (
    <SimpleGrid columns={columns} spacing={spacing}>
      {items.map((item) => (
        <Link 
          key={item.id} 
          href={item.link || `/nft/${item.id}`}
          textDecoration="none" 
          _hover={{ textDecoration: 'none' }}
        >
          <Box 
            borderWidth="1px" 
            borderRadius="lg" 
            overflow="hidden"
            transition="all 0.2s"
            _hover={{ 
              transform: 'translateY(-4px)', 
              boxShadow: 'md',
              borderColor: 'blue.400'
            }}
            height="100%"
            display="flex"
            flexDirection="column"
            borderColor={borderColor}
            bg={bgColor}
          >
            <Box position="relative" paddingBottom="100%" overflow="hidden">
              <Image
                src={item.image || 'https://via.placeholder.com/500?text=No+Image'}
                alt={item.name || 'NFT'}
                position="absolute"
                top="0"
                left="0"
                width="100%"
                height="100%"
                objectFit="cover"
                fallback={<Box width="100%" height="100%" bg="gray.200" />}
              />
              {item.collection && (
                <Badge 
                  position="absolute" 
                  top="2" 
                  left="2" 
                  colorScheme="blue" 
                  borderRadius="full" 
                  px={2}
                >
                  {item.collection}
                </Badge>
              )}
              {item.rarity && (
                <Badge 
                  position="absolute" 
                  top="2" 
                  right="2" 
                  colorScheme="yellow" 
                  borderRadius="full" 
                  px={2}
                >
                  #{item.rarity}
                </Badge>
              )}
            </Box>
            
            <Box p={4} flex="1" display="flex" flexDirection="column">
              <Heading size="md" isTruncated mb={2}>
                {item.name || `NFT #${item.id.substring(0, 6)}`}
              </Heading>
              
              {item.price !== undefined && (
                <Flex align="center" justify="space-between" mt="auto">
                  <Text fontWeight="bold">{item.price.toFixed(2)} SOL</Text>
                </Flex>
              )}
            </Box>
          </Box>
        </Link>
      ))}
    </SimpleGrid>
  );
}; 