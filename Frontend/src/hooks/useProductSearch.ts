
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { debounce } from "lodash";

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  image_urls: string[];
  is_featured?: boolean;
  description?: string;
}

export const useProductSearch = () => {
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce(async (query: string, filters?: {
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      isFeatured?: boolean;
    }) => {
      if (!query.trim() && (!filters || Object.keys(filters).length === 0)) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        let queryBuilder = supabase
          .from('products')
          .select(`
            *,
            categories(name)
          `);

        // Apply search query if provided
        if (query.trim()) {
          queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
        }

        // Apply category filter
        if (filters?.category && filters.category !== 'all') {
          queryBuilder = queryBuilder.eq('category_id', filters.category);
        }

        // Apply price range filter
        if (filters?.minPrice !== undefined) {
          queryBuilder = queryBuilder.gte('price', filters.minPrice);
        }
        if (filters?.maxPrice !== undefined) {
          queryBuilder = queryBuilder.lte('price', filters.maxPrice);
        }

        // Apply featured filter
        if (filters?.isFeatured !== undefined) {
          queryBuilder = queryBuilder.eq('is_featured', filters.isFeatured);
        }

        const { data, error } = await queryBuilder;

        if (error) throw error;

        // Transform the data to match the Product interface
        const products: Product[] = data.map(item => ({
          id: item.id,
          name: item.name,
          brand: item.categories?.name || 'Unknown', // Using category name as brand
          price: item.price,
          category: item.categories?.name || 'Unknown',
          image_urls: item.image_urls || [],
          is_featured: item.is_featured,
          description: item.description
        }));

        setSearchResults(products);
      } catch (err) {
        console.error('Error searching products:', err);
        setError('Failed to search products');
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const searchProducts = useCallback((
    query: string, 
    filters?: {
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      isFeatured?: boolean;
    }
  ) => {
    debouncedSearch(query, filters);
  }, [debouncedSearch]);

  return {
    searchResults,
    isLoading,
    error,
    searchProducts
  };
};
