import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Flex, 
  Badge, 
  Stat, 
  StatLabel, 
  StatGroup,
  Spinner, 
  Card,
  CardBody,
  CardHeader,
  Button,
  Link,
  Icon,
  List,
  ListItem,
  SimpleGrid,
  useColorMode
} from '@chakra-ui/react';
import { ChevronRight, InfoIcon, Star, Warning } from '@chakra-ui/icons';
import analyticsService, { 
  NFTInsight, 
  CollectionInsight, 
  MarketInsight, 
  PricePrediction,
  ActivityTrend
} from '@/services/analyticsService';

interface InsightsWidgetProps {
  type: 'nft' | 'collection' | 'market';
  id?: string;
  showRecommendations?: boolean;
  maxWidth?: string;
  height?: string;
  compact?: boolean;
}

const InsightsWidget: React.FC<InsightsWidgetProps> = ({ 
  type, 
  id, 
  showRecommendations = true,
  maxWidth = '100%',
  height = 'auto',
  compact = false
}) => {
  const [loading, setLoading] = useState(true);
  const [nftInsight, setNftInsight] = useState<NFTInsight | null>(null);
  const [collectionInsight, setCollectionInsight] = useState<CollectionInsight | null>(null);
  const [marketInsight, setMarketInsight] = useState<MarketInsight | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { colorMode } = useColorMode();
  const bgColor = colorMode === 'light' ? 'white' : 'gray.800';
  const borderColor = colorMode === 'light' ? 'gray.200' : 'gray.700';
  const accentColor = colorMode === 'light' ? 'blue.500' : 'blue.300';
  const recommendationBgColor = colorMode === 'light' ? 'blue.50' : 'blue.900';

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (type === 'nft' && id) {
          const data = await analyticsService.getNFTInsights(id);
          setNftInsight(data);
        } else if (type === 'collection' && id) {
          const data = await analyticsService.getCollectionInsights(id);
          setCollectionInsight(data);
        } else if (type === 'market') {
          const data = await analyticsService.getMarketInsights();
          setMarketInsight(data);
        }
      } catch (err) {
        console.error('Error fetching insights:', err);
        setError('Failed to load insights. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [type, id]);

  const renderTrend = (trend: ActivityTrend) => {
    return (
      <Flex alignItems="center">
        {trend.direction === 'up' ? (
          <Icon viewBox="0 0 24 24" color="green.400">
            <path fill="currentColor" d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z" />
          </Icon>
        ) : trend.direction === 'down' ? (
          <Icon viewBox="0 0 24 24" color="red.400">
            <path fill="currentColor" d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z" />
          </Icon>
        ) : (
          <Icon viewBox="0 0 24 24" color="gray.400">
            <path fill="currentColor" d="M5 12h14" />
          </Icon>
        )}
        <Text fontSize={compact ? "sm" : "md"} fontWeight="medium" ml={1}>
          {trend.direction === 'stable' ? 'No change' : `${trend.percentChange}%`}
        </Text>
        <Text fontSize={compact ? "xs" : "sm"} color="gray.500" ml={1}>
          ({trend.timeframe})
        </Text>
      </Flex>
    );
  };

  const renderNFTInsights = () => {
    if (!nftInsight) return null;

    return (
      <Box>
        <Flex justify="space-between" align="flex-start" mb={4}>
          <Box>
            <Heading size={compact ? "sm" : "md"}>{nftInsight.name || `NFT #${nftInsight.mintId.substring(0, 6)}`}</Heading>
            {nftInsight.rarityRank && (
              <Flex align="center" mt={1}>
                <Icon as={Star} color="yellow.400" mr={1} />
                <Text fontSize="sm">Rarity Rank: #{nftInsight.rarityRank}</Text>
              </Flex>
            )}
          </Box>
          <Badge colorScheme="blue" px={2} py={1} borderRadius="md">
            {nftInsight.pricePrediction.confidence > 0.7 ? 'High Confidence' : 
              nftInsight.pricePrediction.confidence > 0.4 ? 'Medium Confidence' : 'Low Confidence'}
          </Badge>
        </Flex>

        <SimpleGrid columns={compact ? 1 : 2} spacing={4} mb={4}>
          <Box>
            <Text fontWeight="semibold">Predicted Price ({nftInsight.pricePrediction.timeframe})</Text>
            <Text fontSize="2xl" fontWeight="bold">{nftInsight.pricePrediction.estimatedPrice} {nftInsight.pricePrediction.currency}</Text>
            <Text fontSize="sm" color="gray.500">
              Confidence: {Math.round(nftInsight.pricePrediction.confidence * 100)}%
            </Text>
          </Box>
          
          <Box>
            <Text fontWeight="semibold">Liquidity Score</Text>
            <Text fontSize="2xl" fontWeight="bold">{nftInsight.liquidityScore.toFixed(1)}/10</Text>
            <Text fontSize="sm" color="gray.500">
              Average Hold Time: {nftInsight.holdTime} days
            </Text>
          </Box>
        </SimpleGrid>

        {nftInsight.similarNFTs.length > 0 && (
          <Box mt={4}>
            <Text fontWeight="semibold" mb={2}>Similar NFTs</Text>
            <List spacing={2}>
              {nftInsight.similarNFTs.map((similar, index) => (
                <ListItem key={index}>
                  <Flex justify="space-between">
                    <Link color={accentColor} href={`/nft/${similar.mintId}`}>
                      {similar.mintId.substring(0, 8)}...
                    </Link>
                    <Badge>{Math.round(similar.similarity * 100)}% match</Badge>
                  </Flex>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {showRecommendations && nftInsight.recommendation && (
          <Box mt={4} p={3} borderRadius="md" borderWidth="1px" borderColor={borderColor} bg={recommendationBgColor}>
            <Flex>
              <Icon as={InfoIcon} color={accentColor} mt={1} mr={2} />
              <Text fontSize="sm" fontStyle="italic">{nftInsight.recommendation}</Text>
            </Flex>
          </Box>
        )}
      </Box>
    );
  };

  const renderCollectionInsights = () => {
    if (!collectionInsight) return null;

    return (
      <Box>
        <Flex justify="space-between" align="flex-start" mb={4}>
          <Heading size={compact ? "sm" : "md"}>{collectionInsight.name}</Heading>
          <Badge colorScheme={
            collectionInsight.sentiment === 'bullish' ? 'green' : 
            collectionInsight.sentiment === 'bearish' ? 'red' : 'gray'
          }>
            {analyticsService.formatSentiment(collectionInsight.sentiment)}
          </Badge>
        </Flex>
        
        <Text mb={4}>Trending Score: {collectionInsight.trendingScore.toFixed(1)}/10</Text>
        
        <SimpleGrid columns={compact ? 1 : 3} spacing={4} mb={4}>
          <Box>
            <Text fontWeight="semibold">Volume</Text>
            {renderTrend(collectionInsight.volumeChange)}
          </Box>
          
          <Box>
            <Text fontWeight="semibold">Price</Text>
            {renderTrend(collectionInsight.priceChange)}
          </Box>
          
          <Box>
            <Text fontWeight="semibold">Holders</Text>
            {renderTrend(collectionInsight.holderChange)}
          </Box>
        </SimpleGrid>
        
        {showRecommendations && collectionInsight.recommendation && (
          <Box mt={4} p={3} borderRadius="md" borderWidth="1px" borderColor={borderColor} bg={recommendationBgColor}>
            <Flex>
              <Icon as={InfoIcon} color={accentColor} mt={1} mr={2} />
              <Text fontSize="sm" fontStyle="italic">{collectionInsight.recommendation}</Text>
            </Flex>
          </Box>
        )}
      </Box>
    );
  };

  const renderMarketInsights = () => {
    if (!marketInsight) return null;

    return (
      <Box>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size={compact ? "sm" : "md"}>Market Overview</Heading>
          <Badge colorScheme={
            marketInsight.overallSentiment === 'bullish' ? 'green' : 
            marketInsight.overallSentiment === 'bearish' ? 'red' : 'gray'
          } px={2} py={1}>
            {analyticsService.formatSentiment(marketInsight.overallSentiment)}
          </Badge>
        </Flex>
        
        <Box mb={4}>
          <Text fontWeight="semibold" mb={2}>Overall Volume</Text>
          {renderTrend(marketInsight.volumeChange)}
        </Box>
        
        <Box mb={4}>
          <Text fontWeight="semibold" mb={2}>Trending Collections</Text>
          <List spacing={2}>
            {marketInsight.trendingCollections.slice(0, 3).map((collection, index) => (
              <ListItem key={index}>
                <Flex justify="space-between">
                  <Link color={accentColor} href={`/collections/${collection.id}`}>
                    {collection.name}
                  </Link>
                  <Badge colorScheme={
                    collection.volumeChange.direction === 'up' ? 'green' : 
                    collection.volumeChange.direction === 'down' ? 'red' : 'gray'
                  }>
                    {collection.volumeChange.percentChange}% vol
                  </Badge>
                </Flex>
              </ListItem>
            ))}
          </List>
        </Box>
        
        {!compact && (
          <Box>
            <Text fontWeight="semibold" mb={2}>Most Active</Text>
            <SimpleGrid columns={3} spacing={4}>
              <Box>
                <Text fontSize="sm" color="gray.500">Top Buyers</Text>
                <List spacing={1} fontSize="sm">
                  {marketInsight.mostActive.buyers.slice(0, 3).map((buyer, idx) => (
                    <ListItem key={idx}>{buyer}</ListItem>
                  ))}
                </List>
              </Box>
              
              <Box>
                <Text fontSize="sm" color="gray.500">Top Sellers</Text>
                <List spacing={1} fontSize="sm">
                  {marketInsight.mostActive.sellers.slice(0, 3).map((seller, idx) => (
                    <ListItem key={idx}>{seller}</ListItem>
                  ))}
                </List>
              </Box>
              
              <Box>
                <Text fontSize="sm" color="gray.500">Hot Collections</Text>
                <List spacing={1} fontSize="sm">
                  {marketInsight.mostActive.collections.slice(0, 3).map((collection, idx) => (
                    <ListItem key={idx}>{collection}</ListItem>
                  ))}
                </List>
              </Box>
            </SimpleGrid>
          </Box>
        )}
        
        {showRecommendations && marketInsight.recommendation && (
          <Box mt={4} p={3} borderRadius="md" borderWidth="1px" borderColor={borderColor} bg={recommendationBgColor}>
            <Flex>
              <Icon as={InfoIcon} color={accentColor} mt={1} mr={2} />
              <Text fontSize="sm" fontStyle="italic">{marketInsight.recommendation}</Text>
            </Flex>
          </Box>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box 
        maxWidth={maxWidth} 
        height={height} 
        p={4} 
        borderRadius="lg" 
        borderWidth="1px" 
        borderColor={borderColor}
        bg={bgColor}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Spinner color={accentColor} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        maxWidth={maxWidth} 
        height={height} 
        p={4} 
        borderRadius="lg" 
        borderWidth="1px" 
        borderColor={borderColor}
        bg={bgColor}
      >
        <Flex direction="column" align="center" justify="center" height="100%">
          <Icon as={Warning} color="red.500" boxSize={8} mb={3} />
          <Text color="red.500">{error}</Text>
        </Flex>
      </Box>
    );
  }

  return (
    <Box 
      maxWidth={maxWidth} 
      height={height} 
      p={4} 
      borderRadius="lg" 
      borderWidth="1px" 
      borderColor={borderColor}
      bg={bgColor}
      overflowY="auto"
    >
      {type === 'nft' && renderNFTInsights()}
      {type === 'collection' && renderCollectionInsights()}
      {type === 'market' && renderMarketInsights()}
      
      {!compact && (
        <Flex justify="flex-end" mt={4}>
          <Button 
            size="sm" 
            rightIcon={<ChevronRight />} 
            variant="ghost"
            as={Link}
            href={type === 'market' ? '/analytics' : type === 'collection' && id ? `/collections/${id}/analytics` : type === 'nft' && id ? `/nft/${id}/analytics` : '#'}
          >
            View detailed analytics
          </Button>
        </Flex>
      )}
    </Box>
  );
};

export default InsightsWidget; 