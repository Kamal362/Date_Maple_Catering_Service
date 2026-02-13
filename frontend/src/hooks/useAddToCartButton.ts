import { useState } from 'react';

export const useAddToCartButton = () => {
  const [buttonStates, setButtonStates] = useState<Record<string, boolean>>({});

  const handleAddToCartClick = (itemId: string) => {
    setButtonStates(prev => ({
      ...prev,
      [itemId]: true
    }));

    // Reset button state after 2 seconds
    setTimeout(() => {
      setButtonStates(prev => ({
        ...prev,
        [itemId]: false
      }));
    }, 2000);
  };

  const isAdded = (itemId: string) => {
    return !!buttonStates[itemId];
  };

  return { handleAddToCartClick, isAdded };
};