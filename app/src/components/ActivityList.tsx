import React from 'react';
import { Box, VStack, HStack, Text, Avatar, Link, Badge, Flex, Image, Divider, useColorMode, Icon } from '@chakra-ui/react';
import { ExternalLinkIcon, TimeIcon } from '@chakra-ui/icons';
import { NFTActivity } from '@/types/activity';
import { formatDistanceToNow } from 'date-fns';

interface ActivityListProps {
  activities: NFTActivity[];
  maxItems?: number;
  showHeader?: boolean;
  emptyMessage?: string;
  compact?: boolean;
}

export const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  maxItems,
  showHeader = true,
  emptyMessage = "No recent activity",
  compact = false
}) => {
  const { colorMode } = useColorMode();
  const bg = colorMode === 'light' ? 'white' : 'gray.800';
  const borderColor = colorMode === 'light' ? 'gray.200' : 'gray.700';
  
  const displayedActivities = maxItems ? activities.slice(0, maxItems) : activities;
  
  const getActivityTypeColor = (type: string): string => {
    switch (type) {
      case 'mint':
        return colorMode === 'light' ? 'purple.500' : 'purple.300';
      case 'transfer':
        return colorMode === 'light' ? 'yellow.500' : 'yellow.300';
      case 'list':
        return colorMode === 'light' ? 'blue.500' : 'blue.300';
      case 'delist':
        return colorMode === 'light' ? 'gray.500' : 'gray.300';
      case 'sale':
        return colorMode === 'light' ? 'green.500' : 'green.300';
      case 'offer':
        return colorMode === 'light' ? 'cyan.500' : 'cyan.300';
      case 'burn':
        return colorMode === 'light' ? 'red.500' : 'red.300';
      case 'raffle_create':
      case 'raffle_join':
      case 'raffle_complete':
        return colorMode === 'light' ? 'pink.500' : 'pink.300';
      default:
        return colorMode === 'light' ? 'gray.500' : 'gray.300';
    }
  };
  
  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'mint':
        return (
          <Icon viewBox="0 0 24 24" boxSize={5}>
            <path
              fill="currentColor"
              d="M13 5.41V21h-2V5.41l-5.3 5.3-1.4-1.42L12 1.59l7.7 7.7-1.4 1.42z"
            />
          </Icon>
        );
      case 'transfer':
        return (
          <Icon viewBox="0 0 24 24" boxSize={5}>
            <path
              fill="currentColor"
              d="M8 9h8v2H8V9m0 4h8v2H8v-2m0-8h8v2H8V5m10 14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2z"
            />
          </Icon>
        );
      case 'list':
        return (
          <Icon viewBox="0 0 24 24" boxSize={5}>
            <path
              fill="currentColor"
              d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2z"
            />
          </Icon>
        );
      case 'delist':
        return (
          <Icon viewBox="0 0 24 24" boxSize={5}>
            <path
              fill="currentColor"
              d="M19 15l-6 6-1.42-1.42L15.17 16H4V4h2v10h9.17l-3.59-3.58L13 9l6 6z"
            />
          </Icon>
        );
      case 'sale':
        return (
          <Icon viewBox="0 0 24 24" boxSize={5}>
            <path
              fill="currentColor"
              d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"
            />
          </Icon>
        );
      case 'offer':
        return (
          <Icon viewBox="0 0 24 24" boxSize={5}>
            <path
              fill="currentColor"
              d="M21 15h-2v-2h2v2m-4 0h-2v-2h2v2m-4 0h-2v-2h2v2m-4 0H7v-2h2v2M3 9h18v6h-2v2h-2v2H7v-2H5v-2H3V9m2-2V5h14v2H5z"
            />
          </Icon>
        );
      case 'burn':
        return (
          <Icon viewBox="0 0 24 24" boxSize={5}>
            <path
              fill="currentColor"
              d="M12 2c-5.33 4-8 8-8 12 0 4.42 3.58 8 8 8s8-3.58 8-8c0-4-2.67-8-8-12m0 18c-3.31 0-6-2.69-6-6 0-3.1 2-6.3 6-9.5 4 3.2 6 6.4 6 9.5 0 3.31-2.69 6-6 6m-3-6c0 1.66 1.34 3 3 3s3-1.34 3-3c0-2-3-5.4-3-5.4s-3 3.4-3 5.4z"
            />
          </Icon>
        );
      default:
        return (
          <Icon viewBox="0 0 24 24" boxSize={5}>
            <path
              fill="currentColor"
              d="M13 9h-2V7h2v2m0 8h-2v-6h2v6m-1-15A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2z"
            />
          </Icon>
        );
    }
  };
  
  const formatTime = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };
  
  const getActivityTypeName = (type: string): string => {
    switch (type) {
      case 'mint':
        return 'Minted';
      case 'transfer':
        return 'Transferred';
      case 'list':
        return 'Listed';
      case 'delist':
        return 'Delisted';
      case 'sale':
        return 'Sold';
      case 'offer':
        return 'Offer Made';
      case 'burn':
        return 'Burned';
      case 'raffle_create':
        return 'Raffle Created';
      case 'raffle_join':
        return 'Entered Raffle';
      case 'raffle_complete':
        return 'Raffle Completed';
      default:
        return type;
    }
  };
  
  if (activities.length === 0) {
    return (
      <Box
        p={5}
        borderWidth="1px"
        borderRadius="lg"
        borderColor={borderColor}
        bg={bg}
      >
        <Text align="center" color="gray.500">{emptyMessage}</Text>
      </Box>
    );
  }
  
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      bg={bg}
      overflow="hidden"
    >
      {showHeader && (
        <Box p={4} bg={colorMode === 'light' ? 'gray.50' : 'gray.700'}>
          <Text fontWeight="bold" fontSize="lg">Activity</Text>
        </Box>
      )}
      
      <VStack divider={<Divider />} spacing={0} align="stretch">
        {displayedActivities.map((activity) => (
          <Box 
            key={activity.id} 
            p={compact ? 2 : 4} 
            _hover={{ bg: colorMode === 'light' ? 'gray.50' : 'gray.700' }}
            transition="background-color 0.2s"
          >
            <Flex align="center">
              {!compact && (
                <Box 
                  width="40px" 
                  height="40px" 
                  borderRadius="full" 
                  bg={getActivityTypeColor(activity.type)} 
                  color="white" 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center"
                  mr={3}
                >
                  {getActivityIcon(activity.type)}
                </Box>
              )}
              
              <Box flex="1">
                <Flex gap={2} align="center" mb={1}>
                  <Badge 
                    colorScheme={
                      activity.type === 'sale' ? 'green' :
                      activity.type === 'list' ? 'blue' :
                      activity.type === 'mint' ? 'purple' : 
                      activity.type === 'burn' ? 'red' : 'gray'
                    }
                    borderRadius="full"
                    px={2}
                    py={0.5}
                  >
                    {getActivityTypeName(activity.type)}
                  </Badge>
                  
                  {activity.price !== undefined && (
                    <Badge variant="outline" colorScheme="green">
                      {activity.price.toFixed(2)} SOL
                    </Badge>
                  )}
                  
                  <Text fontSize="sm" color="gray.500" ml="auto">
                    <TimeIcon mr={1} />
                    {formatTime(activity.timestamp)}
                  </Text>
                </Flex>
                
                <HStack spacing={2} mb={compact ? 0 : 2}>
                  {activity.nftImage && !compact && (
                    <Image 
                      src={activity.nftImage} 
                      alt={activity.nftName || ''} 
                      width="30px" 
                      height="30px" 
                      borderRadius="md"
                      objectFit="cover"
                    />
                  )}
                  
                  <Text fontWeight="bold">
                    {activity.nftName || activity.mint.substring(0, 8) + '...'}
                  </Text>
                  
                  {activity.collectionName && !compact && (
                    <Text fontSize="sm" color="gray.500">
                      from {activity.collectionName}
                    </Text>
                  )}
                </HStack>
                
                {!compact && (
                  <Flex fontSize="sm" color="gray.500" mt={1}>
                    {activity.fromAddress && (
                      <Text mr={2}>
                        From: {activity.fromAddress.substring(0, 6)}...{activity.fromAddress.substring(activity.fromAddress.length - 4)}
                      </Text>
                    )}
                    
                    {activity.toAddress && (
                      <Text>
                        To: {activity.toAddress.substring(0, 6)}...{activity.toAddress.substring(activity.toAddress.length - 4)}
                      </Text>
                    )}
                    
                    {activity.transactionSignature && (
                      <Link 
                        href={`https://solscan.io/tx/${activity.transactionSignature}`}
                        isExternal
                        ml="auto"
                        display="flex"
                        alignItems="center"
                      >
                        View <ExternalLinkIcon mx={1} />
                      </Link>
                    )}
                  </Flex>
                )}
              </Box>
            </Flex>
          </Box>
        ))}
      </VStack>
      
      {maxItems && activities.length > maxItems && (
        <Box p={3} textAlign="center">
          <Link href="/activity" color="blue.500">
            View all activity
          </Link>
        </Box>
      )}
    </Box>
  );
}; 