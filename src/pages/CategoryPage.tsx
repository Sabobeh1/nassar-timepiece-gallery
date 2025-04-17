
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WatchCard from "@/components/WatchCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getWatchesByCategory } from "@/data/watches";
import { searchWatches } from "@/utils/searchUtils";

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
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [watches, setWatches] = useState<Watch[]>([]);
  const [filteredWatches, setFilteredWatches] = useState<Watch[]>([]);
  
  useEffect(() => {
    // Get category from URL params or from state if passed via Link
    const categoryFromState = location.state?.category;
    const categoryToUse = category || categoryFromState;
    
    if (!categoryToUse) {
      navigate("/");
      return;
    }
    
    // Capitalize first letter for display and data fetching
    const formattedCategory = categoryToUse.charAt(0).toUpperCase() + categoryToUse.slice(1).toLowerCase();
    
    // Set page title
    document.title = `${formattedCategory} Watches | Nassar Watches`;
    
    // Get watches by category
    const categoryWatches = getWatchesByCategory(formattedCategory);
    setWatches(categoryWatches);
    setFilteredWatches(categoryWatches);
  }, [category, navigate, location.state]);
  
  // Search function using the imported searchWatches utility
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredWatches(watches);
      return;
    }
    
    const filtered = searchWatches(query, watches);
    setFilteredWatches(filtered);
  };
  
  // Format category name for display
  const displayCategory = category 
    ? category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
    : location.state?.category
      ? location.state.category.charAt(0).toUpperCase() + location.state.category.slice(1).toLowerCase()
      : '';

  return (
    <div className="min-h-screen flex flex-col bg-luxuryy-cream">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          {/* Back button */}
          <Button 
            onClick={() => navigate("/")} 
            variant="outline" 
            className="mb-6 textluxuryry-black hover:text-gold"
          >
            <ArrowLeft className="mr-2" size={16} />
            Back to Home
          </Button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <h1 className="text-3xl md:text-4xl font-playfair font-bold texluxuryury-black mb-4 md:mb-0">
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
              <p className="teluxuryxury-charcoal text-lg mb-4">No watches found matching "{searchQuery}"</p>
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
