import React, { useState, useEffect } from 'react';
import { Text, useColorModeValue } from '@chakra-ui/react';

interface RaffleCountdownProps {
  endTime: number;
  compact?: boolean;
}

export const RaffleCountdown: React.FC<RaffleCountdownProps> = ({ 
  endTime,
  compact = false
}) => {
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
  
  // Colors for the countdown text
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const urgentColor = useColorModeValue('red.600', 'red.300');
  
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = Math.floor(Date.now() / 1000);
      const total = Math.max(0, endTime - now);
      
      const days = Math.floor(total / 86400);
      const hours = Math.floor((total % 86400) / 3600);
      const minutes = Math.floor((total % 3600) / 60);
      const seconds = total % 60;
      
      setTimeRemaining({ days, hours, minutes, seconds, total });
    };
    
    // Calculate immediately and then set up interval
    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(interval);
  }, [endTime]);
  
  if (timeRemaining.total === 0) {
    return <Text color={textColor} fontSize={compact ? "xs" : "sm"}>Ended</Text>;
  }
  
  // Show different formats based on time remaining
  if (compact) {
    if (timeRemaining.days > 0) {
      return (
        <Text color={textColor} fontSize="xs">
          {timeRemaining.days}d {timeRemaining.hours}h
        </Text>
      );
    }
    
    if (timeRemaining.hours > 0) {
      return (
        <Text color={timeRemaining.hours < 6 ? urgentColor : textColor} fontSize="xs">
          {timeRemaining.hours}h {timeRemaining.minutes}m
        </Text>
      );
    }
    
    return (
      <Text color={urgentColor} fontSize="xs" fontWeight="bold">
        {timeRemaining.minutes}m {timeRemaining.seconds}s
      </Text>
    );
  }
  
  // Non-compact format
  if (timeRemaining.days > 0) {
    return (
      <Text color={textColor} fontSize="sm">
        {timeRemaining.days}d {timeRemaining.hours}h remaining
      </Text>
    );
  }
  
  if (timeRemaining.hours > 0) {
    return (
      <Text 
        color={timeRemaining.hours < 6 ? urgentColor : textColor} 
        fontSize="sm"
        fontWeight={timeRemaining.hours < 6 ? "medium" : "normal"}
      >
        {timeRemaining.hours}h {timeRemaining.minutes}m remaining
      </Text>
    );
  }
  
  return (
    <Text color={urgentColor} fontSize="sm" fontWeight="bold">
      {timeRemaining.minutes}m {timeRemaining.seconds}s remaining
    </Text>
  );
}; 