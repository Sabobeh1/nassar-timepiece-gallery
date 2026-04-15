
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define the Watch type that matches our data structure
export interface CartWatch {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  cart: CartWatch[];
  addToCart: (watch: Omit<CartWatch, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper function to get cart from localStorage
const getCartFromStorage = (): CartWatch[] => {
  if (typeof window === 'undefined') return [];
  
  const storedCart = localStorage.getItem('nassar-watches-cart');
  return storedCart ? JSON.parse(storedCart) : [];
};

// Helper function to save cart to localStorage
const saveCartToStorage = (cart: CartWatch[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('nassar-watches-cart', JSON.stringify(cart));
  }
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartWatch[]>(getCartFromStorage());

  // Save to localStorage whenever cart changes
  useEffect(() => {
    saveCartToStorage(cart);
  }, [cart]);

  const addToCart = (watch: Omit<CartWatch, 'quantity'>) => {
    setCart(prevCart => {
      // Check if the item is already in the cart
      const existingItemIndex = prevCart.findIndex(item => item.id === watch.id);
      
      if (existingItemIndex >= 0) {
        // Item exists, increment quantity
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += 1;
        return newCart;
      } else {
        // Item doesn't exist, add it with quantity 1
        return [...prevCart, { ...watch, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  
  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity, 
    0
  );

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart, 
        totalItems, 
        totalPrice 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
