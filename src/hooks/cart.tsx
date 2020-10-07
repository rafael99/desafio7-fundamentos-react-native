import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const storagedProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (storagedProducts) {
        // await AsyncStorage.clear();
        setProducts([...JSON.parse(storagedProducts)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productInCart = products.findIndex(prod => prod.id === product.id);

      if (productInCart >= 0) {
        await increment(product.id);
        return;
      }

      setProducts([...products, { ...product, quantity: 1 }]);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products, increment],
  );

  const increment = useCallback(
    async id => {
      const productToIncrement = products.find(pro => id === pro.id);

      if (productToIncrement) {
        productToIncrement.quantity += 1;

        setProducts([...products]);

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const productToDecrement = products.find(pro => id === pro.id);

      if (productToDecrement && productToDecrement.quantity > 1) {
        productToDecrement.quantity -= 1;

        setProducts([...products]);

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(products),
        );
      } else {
        const productsUpdated = products.filter(product => product.id !== id);

        setProducts(productsUpdated);

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(productsUpdated),
        );
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
