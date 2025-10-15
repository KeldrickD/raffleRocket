'use client';

import React from 'react';
import { Button, Icon } from '@chakra-ui/react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useColorMode } from '@chakra-ui/color-mode';

interface ColorModeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline';
  isCompact?: boolean;
}

export const ColorModeToggle: React.FC<ColorModeToggleProps> = ({
  size = 'md',
  variant = 'ghost',
  isCompact = false,
}) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  const MotionButton = motion(Button);

  return (
    <MotionButton
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      size={size}
      variant={variant}
      borderRadius={isCompact ? 'md' : 'full'}
      onClick={toggleColorMode}
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      rightIcon={
        <Icon 
          as={isDark ? FaSun : FaMoon} 
          color={isDark ? 'yellow.300' : 'purple.700'} 
        />
      }
      css={{
        '@media (hover: hover)': {
          '&:hover': {
            transform: 'scale(1.05)',
          },
        },
      }}
    >
      {isCompact ? null : (isDark ? 'Light Mode' : 'Dark Mode')}
    </MotionButton>
  );
}; 