
import { watches } from "@/data/watches";

interface Watch {
  id: string;
  name: string;
  brand: string;
  price: number;
  images: string[];
  category: string;
  isNew?: boolean;
}

/**
 * Search watches based on query string using fuzzy search
 * @param query Search query
 * @param watchesToSearch Array of watches to search through
 * @returns Filtered watches matching the search criteria
 */
export const searchWatches = (query: string, watchesToSearch: Watch[] = watches): Watch[] => {
  if (!query.trim()) {
    return watchesToSearch;
  }
  
  const searchTerms = query.toLowerCase().split(' ');
  
  return watchesToSearch.filter(watch => {
    const nameAndBrand = `${watch.name} ${watch.brand}`.toLowerCase();
    
    // Simple fuzzy search - check if all search terms are included
    return searchTerms.every(term => {
      // Ignore very short search terms
      if (term.length < 2) return true;
      
      // Return true if term is found in name or brand
      return nameAndBrand.includes(term);
    });
  });
};

/**
 * Get the relevance score for a watch based on how well it matches the search query
 * Higher score means better match
 * @param watch Watch to check
 * @param query Search query
 * @returns Relevance score
 */
export const getSearchRelevance = (watch: Watch, query: string): number => {
  if (!query.trim()) return 0;
  
  const searchString = `${watch.name} ${watch.brand}`.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // Exact match gives highest score
  if (searchString.includes(queryLower)) {
    return 2;
  }
  
  // Partial match gives lower score
  const terms = queryLower.split(' ').filter(term => term.length >= 2);
  let score = 0;
  
  terms.forEach(term => {
    if (searchString.includes(term)) {
      score += 1;
    }
  });
  
  return score / terms.length;
};
