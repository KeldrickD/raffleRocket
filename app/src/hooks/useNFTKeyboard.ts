import { useState, useCallback, useEffect } from 'react';
import { NFTListItem } from '../types/nft';

interface KeyboardState {
  selectedIndex: number;
  isActive: boolean;
  lastKey: string | null;
}

interface KeyboardOptions {
  onKeyPress?: (key: string) => void;
  onSelectionChange?: (index: number) => void;
  onActivate?: () => void;
  onDeactivate?: () => void;
  enableArrowKeys?: boolean;
  enableSpaceBar?: boolean;
  enableEnter?: boolean;
}

export function useNFTKeyboard(totalItems: number, options: KeyboardOptions = {}) {
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    selectedIndex: 0,
    isActive: false,
    lastKey: null,
  });

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { key } = event;

    setKeyboardState((prev) => ({
      ...prev,
      lastKey: key,
    }));

    switch (key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        if (options.enableArrowKeys) {
          event.preventDefault();
          setKeyboardState((prev) => {
            const newIndex = Math.max(0, prev.selectedIndex - 1);
            options.onSelectionChange?.(newIndex);
            return {
              ...prev,
              selectedIndex: newIndex,
            };
          });
        }
        break;

      case 'ArrowDown':
      case 'ArrowRight':
        if (options.enableArrowKeys) {
          event.preventDefault();
          setKeyboardState((prev) => {
            const newIndex = Math.min(totalItems - 1, prev.selectedIndex + 1);
            options.onSelectionChange?.(newIndex);
            return {
              ...prev,
              selectedIndex: newIndex,
            };
          });
        }
        break;

      case ' ':
        if (options.enableSpaceBar) {
          event.preventDefault();
          setKeyboardState((prev) => ({
            ...prev,
            isActive: !prev.isActive,
          }));
          if (keyboardState.isActive) {
            options.onDeactivate?.();
          } else {
            options.onActivate?.();
          }
        }
        break;

      case 'Enter':
        if (options.enableEnter) {
          event.preventDefault();
          options.onKeyPress?.('Enter');
        }
        break;

      default:
        options.onKeyPress?.(key);
        break;
    }
  }, [
    totalItems,
    options.enableArrowKeys,
    options.enableSpaceBar,
    options.enableEnter,
    options.onKeyPress,
    options.onSelectionChange,
    options.onActivate,
    options.onDeactivate,
    keyboardState.isActive,
  ]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const resetSelection = useCallback(() => {
    setKeyboardState((prev) => ({
      ...prev,
      selectedIndex: 0,
      isActive: false,
    }));
  }, []);

  return {
    keyboardState,
    resetSelection,
  };
} 