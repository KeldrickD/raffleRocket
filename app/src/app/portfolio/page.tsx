import React from 'react';
import { Box, Container, Heading, Text, SimpleGrid, Flex, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Tabs, TabList, Tab, TabPanels, TabPanel, Badge, Avatar, Button, Link, IconButton, useDisclosure, Select, Table, Thead, Tbody, Tr, Th, Td, useColorModeValue, Progress } from '@chakra-ui/react';
import { ChevronRightIcon, StarIcon, ExternalLinkIcon, DownloadIcon } from '@chakra-ui/icons';
import portfolioService, { NFTItem, NFTCollection, PortfolioStats } from '@/services/portfolioService';
import { InsightsWidget } from '@/components/InsightsWidget';
import { ActivityList } from '@/components/ActivityList';
import { NFTGrid } from '@/components/NFTGrid';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = React.useState<any>(null);
  const [stats, setStats] = React.useState<PortfolioStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [timeframe, setTimeframe] = React.useState<'1d' | '7d' | '30d' | '90d' | '1y' | 'all'>('30d');
  const [selectedTab, setSelectedTab] = React.useState(0);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const accentColor = useColorModeValue('blue.500', 'blue.300');
  
  React.useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        // Using mock data for now
        const data = portfolioService.createMockPortfolio();
        setPortfolio(data);
        
        // Fetch portfolio stats
        try {
          const statsData = await portfolioService.getPortfolioStats();
          setStats(statsData);
        } catch (error) {
          console.error('Error fetching stats, using mock data');
          // Create mock stats if API fails
          setStats({
            totalNFTs: data.items.length,
            uniqueCollections: data.collections.length,
            bestPerformer: {
              mintId: data.items[2].mintId,
              name: data.items[2].name,
              profitLoss: 1.4,
              profitLossPercentage: 36.8
            },
            worstPerformer: {
              mintId: data.items[1].mintId,
              name: data.items[1].name,
              profitLoss: -0.1,
              profitLossPercentage: -4
            },
            mostValuable: {
              mintId: data.items[2].mintId,
              name: data.items[2].name,
              value: 5.2
            },
            valueChangeDay: 3.2,
            valueChangeWeek: -1.5,
            valueChangeMonth: 8.7
          });
        }
      } catch (error) {
        console.error('Error fetching portfolio:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPortfolio();
  }, []);
  
  // Prepare chart data
  const chartData = React.useMemo(() => {
    if (!portfolio) return null;
    
    const historicalData = portfolio.historicalValue;
    
    return {
      labels: historicalData.map((item: any) => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: 'Portfolio Value (SOL)',
          data: historicalData.map((item: any) => item.value),
          borderColor: accentColor,
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          tension: 0.4,
        },
      ],
    };
  }, [portfolio, accentColor]);
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
        text: 'Portfolio Value',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };
  
  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Flex direction="column" align="center" justify="center" h="60vh">
          <Progress size="xs" isIndeterminate w="50%" colorScheme="blue" />
          <Text mt={4}>Loading your portfolio...</Text>
        </Flex>
      </Container>
    );
  }
  
  if (!portfolio) {
    return (
      <Container maxW="container.xl" py={8}>
        <Flex direction="column" align="center" justify="center" h="60vh">
          <Text fontSize="xl">No portfolio data available.</Text>
          <Button mt={4} colorScheme="blue">Connect Wallet</Button>
        </Flex>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.xl" py={8}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="xl">My Portfolio</Heading>
        <Flex gap={2}>
          <Select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value as any)} 
            size="sm" 
            w="120px"
          >
            <option value="1d">1 Day</option>
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="90d">90 Days</option>
            <option value="1y">1 Year</option>
            <option value="all">All Time</option>
          </Select>
          <Button rightIcon={<DownloadIcon />} size="sm" onClick={() => portfolioService.exportPortfolio('csv')}>
            Export
          </Button>
        </Flex>
      </Flex>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5} mb={8}>
        <Stat
          p={4}
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="lg"
          boxShadow="sm"
        >
          <StatLabel>Total Value</StatLabel>
          <StatNumber>{portfolio.totalValue.toFixed(2)} SOL</StatNumber>
          <StatHelpText>
            <StatArrow type={portfolio.profitLoss >= 0 ? 'increase' : 'decrease'} />
            {portfolio.profitLossPercentage.toFixed(2)}% ({portfolio.profitLoss >= 0 ? '+' : ''}{portfolio.profitLoss.toFixed(2)} SOL)
          </StatHelpText>
        </Stat>
        
        <Stat
          p={4}
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="lg"
          boxShadow="sm"
        >
          <StatLabel>Total NFTs</StatLabel>
          <StatNumber>{stats?.totalNFTs || portfolio.items.length}</StatNumber>
          <StatHelpText>
            Across {stats?.uniqueCollections || portfolio.collections.length} collections
          </StatHelpText>
        </Stat>
        
        <Stat
          p={4}
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="lg"
          boxShadow="sm"
        >
          <StatLabel>Best Performer</StatLabel>
          <Flex align="center">
            <StatNumber color="green.500">+{stats?.bestPerformer.profitLossPercentage.toFixed(2)}%</StatNumber>
            <Text ml={2} fontSize="sm">({stats?.bestPerformer.name})</Text>
          </Flex>
          <StatHelpText>
            +{stats?.bestPerformer.profitLoss.toFixed(2)} SOL
          </StatHelpText>
        </Stat>
        
        <Stat
          p={4}
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="lg"
          boxShadow="sm"
        >
          <StatLabel>Recent Change</StatLabel>
          <StatNumber>
            <StatArrow type={stats?.valueChangeDay && stats.valueChangeDay >= 0 ? 'increase' : 'decrease'} />
            {stats?.valueChangeDay ? Math.abs(stats.valueChangeDay).toFixed(2) : 0}%
          </StatNumber>
          <StatHelpText>
            {Math.abs(stats?.valueChangeWeek || 0).toFixed(2)}% (7d)
            <StatArrow type={stats?.valueChangeWeek && stats.valueChangeWeek >= 0 ? 'increase' : 'decrease'} />
          </StatHelpText>
        </Stat>
      </SimpleGrid>
      
      <Box 
        p={5}
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        boxShadow="md" 
        mb={6}
        height="300px"
      >
        {chartData && (
          <Line options={chartOptions} data={chartData} />
        )}
      </Box>
      
      <Tabs 
        isLazy 
        colorScheme="blue" 
        onChange={(index) => setSelectedTab(index)}
        mb={8}
      >
        <TabList>
          <Tab>NFTs ({portfolio.items.length})</Tab>
          <Tab>Collections ({portfolio.collections.length})</Tab>
          <Tab>Activity</Tab>
          <Tab>Analytics</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel p={0} pt={4}>
            <NFTGrid 
              items={portfolio.items.map((item: NFTItem) => ({
                id: item.mintId,
                name: item.name,
                image: item.image || 'https://via.placeholder.com/500',
                price: item.currentPrice,
                collection: item.collection?.name,
                link: `/nft/${item.mintId}`
              }))} 
            />
          </TabPanel>
          
          <TabPanel p={0} pt={4}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
              {portfolio.collections.map((collection: NFTCollection, index: number) => (
                <Box 
                  key={index}
                  p={5}
                  bg={bgColor}
                  borderWidth="1px"
                  borderColor={borderColor}
                  borderRadius="lg"
                  boxShadow="sm"
                  _hover={{ boxShadow: 'md' }}
                  transition="all 0.2s"
                >
                  <Flex align="center" mb={3}>
                    <Avatar 
                      src={collection.image || 'https://via.placeholder.com/150'} 
                      size="md" 
                      mr={3} 
                    />
                    <Box>
                      <Heading size="md">{collection.name}</Heading>
                      <Text fontSize="sm" color="gray.500">
                        {collection.itemCount} NFTs
                      </Text>
                    </Box>
                    <Badge ml="auto" colorScheme={collection.priceChangeDay && collection.priceChangeDay >= 0 ? 'green' : 'red'}>
                      {collection.priceChangeDay ? (collection.priceChangeDay >= 0 ? '+' : '') + collection.priceChangeDay.toFixed(1) + '%' : '0%'}
                    </Badge>
                  </Flex>
                  
                  <SimpleGrid columns={2} spacing={4} mb={4}>
                    <Box>
                      <Text fontWeight="semibold" fontSize="sm">Floor Price</Text>
                      <Text fontSize="xl">{collection.floorPrice?.toFixed(2) || '-'} SOL</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold" fontSize="sm">Total Value</Text>
                      <Text fontSize="xl">{collection.totalValue?.toFixed(2) || '-'} SOL</Text>
                    </Box>
                  </SimpleGrid>
                  
                  <Flex justify="flex-end">
                    <Button 
                      as={Link}
                      href={`/portfolio/collection/${collection.id}`}
                      size="sm" 
                      rightIcon={<ChevronRightIcon />} 
                      variant="ghost"
                    >
                      View NFTs
                    </Button>
                  </Flex>
                </Box>
              ))}
            </SimpleGrid>
          </TabPanel>
          
          <TabPanel p={0} pt={4}>
            <ActivityList activities={portfolio.recentActivity} />
          </TabPanel>
          
          <TabPanel p={0} pt={4}>
            <InsightsWidget type="market" />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
} 