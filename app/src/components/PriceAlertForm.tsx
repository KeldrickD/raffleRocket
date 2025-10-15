import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Button, FormControl, FormLabel, Input, Select, Switch, VStack, HStack, Text, useToast, Box, Heading, Divider } from '@chakra-ui/react';
import { createPriceAlert, CreatePriceAlertParams, PriceAlert, createDemoPriceAlert } from '../services/priceAlertService';

interface PriceAlertFormProps {
  targetType: 'nft' | 'collection';
  targetId: string;
  targetName?: string;
  onAlertCreated?: (alert: PriceAlert) => void;
  compact?: boolean;
}

const PriceAlertForm: React.FC<PriceAlertFormProps> = ({ 
  targetType, 
  targetId, 
  targetName, 
  onAlertCreated,
  compact = false 
}) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [condition, setCondition] = useState<'above' | 'below' | 'equal'>('above');
  const [price, setPrice] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('SOL');
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (price <= 0) {
      toast({
        title: 'Invalid price',
        description: 'Please enter a price greater than zero',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const alertParams: CreatePriceAlertParams = {
        targetType,
        targetId,
        condition,
        price,
        currency
      };
      
      // For demo/development, use a local function to create a mock alert
      // In production, this would call the API
      let alert: PriceAlert;
      
      try {
        // Try to create the alert via API
        alert = await createPriceAlert(alertParams);
      } catch (error) {
        // Fall back to demo alert if API fails
        console.log('Using demo alert due to API error:', error);
        alert = createDemoPriceAlert(alertParams);
      }
      
      toast({
        title: 'Alert created',
        description: `You'll be notified when the price goes ${condition} ${price} ${currency}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      if (onAlertCreated) {
        onAlertCreated(alert);
      }
      
      // Reset form
      setPrice(0);
    } catch (error) {
      console.error('Error creating alert:', error);
      toast({
        title: 'Error',
        description: 'Failed to create price alert. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const targetDisplay = targetName || targetId;
  
  if (compact) {
    return (
      <Box 
        as="form" 
        onSubmit={handleSubmit} 
        p={3} 
        borderWidth="1px" 
        borderRadius="lg" 
        width="100%"
      >
        <VStack spacing={3} align="stretch">
          <Heading size="sm" mb={1}>Set Price Alert for {targetDisplay}</Heading>
          <HStack>
            <Select 
              value={condition} 
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setCondition(e.target.value as 'above' | 'below' | 'equal')} 
              size="sm" 
              width="auto"
            >
              <option value="above">Above</option>
              <option value="below">Below</option>
              <option value="equal">Equal to</option>
            </Select>
            
            <Input
              type="number"
              step="0.01"
              min="0"
              value={price === 0 ? '' : price}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPrice(parseFloat(e.target.value) || 0)}
              placeholder="Price"
              size="sm"
              width="25%"
            />
            
            <Select
              value={currency}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setCurrency(e.target.value)}
              size="sm"
              width="20%"
            >
              <option value="SOL">SOL</option>
              <option value="USD">USD</option>
            </Select>
            
            <Button 
              type="submit" 
              colorScheme="blue" 
              size="sm" 
              isLoading={isLoading}
            >
              Set Alert
            </Button>
          </HStack>
        </VStack>
      </Box>
    );
  }
  
  return (
    <Box 
      as="form" 
      onSubmit={handleSubmit} 
      p={5} 
      borderWidth="1px" 
      borderRadius="lg" 
      width="100%"
      maxWidth="500px"
      boxShadow="md"
    >
      <VStack spacing={4} align="stretch">
        <Heading size="md">Set Price Alert</Heading>
        <Text>Get notified when the price of {targetDisplay} changes</Text>
        
        <Divider />
        
        <FormControl>
          <FormLabel>When price is:</FormLabel>
          <Select 
            value={condition} 
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setCondition(e.target.value as 'above' | 'below' | 'equal')}
          >
            <option value="above">Above</option>
            <option value="below">Below</option>
            <option value="equal">Equal to</option>
          </Select>
        </FormControl>
        
        <HStack>
          <FormControl>
            <FormLabel>Price</FormLabel>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={price === 0 ? '' : price}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPrice(parseFloat(e.target.value) || 0)}
              placeholder="Enter price"
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Currency</FormLabel>
            <Select
              value={currency}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setCurrency(e.target.value)}
            >
              <option value="SOL">SOL</option>
              <option value="USD">USD</option>
            </Select>
          </FormControl>
        </HStack>
        
        <Button 
          type="submit" 
          colorScheme="blue" 
          isLoading={isLoading}
          mt={2}
        >
          Create Alert
        </Button>
      </VStack>
    </Box>
  );
};

export default PriceAlertForm; 