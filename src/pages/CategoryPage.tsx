
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WatchCard from "@/components/WatchCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getWatchesByCategory } from "@/data/watches";

interface Watch {
  id: string;
  name: string;
  brand: string;
  price: number;
  images: string[];
  category: string;
  isNew?: boolean;
}

const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [watches, setWatches] = useState<Watch[]>([]);
  const [filteredWatches, setFilteredWatches] = useState<Watch[]>([]);
  
  useEffect(() => {
    if (!category) {
      navigate("/");
      return;
    }
    
    // Capitalize first letter for display and data fetching
    const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    
    // Set page title
    document.title = `${formattedCategory} Watches | Nassar Watches`;
    
    // Get watches by category
    const categoryWatches = getWatchesByCategory(formattedCategory);
    setWatches(categoryWatches);
    setFilteredWatches(categoryWatches);
  }, [category, navigate]);
  
  // Search function using fuzzy search algorithm
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredWatches(watches);
      return;
    }
    
    // Simple fuzzy search implementation
    const searchTerms = query.toLowerCase().split(' ');
    
    const filtered = watches.filter(watch => {
      const nameAndBrand = `${watch.name} ${watch.brand}`.toLowerCase();
      
      // Check if all search terms are included in the watch name/brand
      return searchTerms.every(term => {
        // Allow for partial matches with a minimum of 2 characters
        if (term.length < 2) return true;
        
        return nameAndBrand.includes(term);
      });
    });
    
    setFilteredWatches(filtered);
  };
  
  // Format category name for display
  const displayCategory = category 
    ? category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
    : '';

  return (
    <div className="min-h-screen flex flex-col bg-luxury-cream">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          {/* Back button */}
          <Button 
            onClick={() => navigate("/")} 
            variant="outline" 
            className="mb-6 text-luxury-black hover:text-gold"
          >
            <ArrowLeft className="mr-2" size={16} />
            Back to Home
          </Button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <h1 className="text-3xl md:text-4xl font-playfair font-bold text-luxury-black mb-4 md:mb-0">
              <span className="text-gold">{displayCategory}</span> Collection
            </h1>
            
            {/* Search Input */}
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search watches..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full md:w-64 border border-gray-200 rounded-md focus:border-gold focus:ring-gold focus:ring-1 focus:outline-none"
              />
            </div>
          </div>
          
          {filteredWatches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-luxury-charcoal text-lg mb-4">No watches found matching "{searchQuery}"</p>
              <Button 
                onClick={() => handleSearch("")}
                variant="outline"
                className="border-gold text-gold hover:bg-gold/10"
              >
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredWatches.map(watch => (
                <WatchCard
                  key={watch.id}
                  id={watch.id}
                  name={watch.name}
                  brand={watch.brand}
                  price={watch.price}
                  images={watch.images}
                  category={watch.category}
                  isNew={watch.isNew}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CategoryPage;
