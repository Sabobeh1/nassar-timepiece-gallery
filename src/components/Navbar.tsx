import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Search, ShoppingCart, LogIn, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import CartDropdown from "./CartDropdown";
import { useCart } from "@/context/CartContext";
import { searchWatches } from "@/utils/searchUtils";
import { watches } from "@/data/watches";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Define the Watch interface to match the one used in data/watches.ts
interface Watch {
  id: string;
  name: string;
  brand: string;
  price: number;
  images: string[];
  category: string;
  isNew?: boolean;
}

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Watch[]>([]);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [sortOption, setSortOption] = useState<string>("relevance");
  const { totalItems } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Get min and max price from watches data
  const maxPrice = Math.max(...watches.map(watch => watch.price));
  const minPrice = Math.min(...watches.map(watch => watch.price));

  // Get unique categories from watches data
  const categories = ["all", ...Array.from(new Set(watches.map(watch => watch.category)))];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setSearchResults([]);
    } else {
      performSearch(query);
    }
  };

  const performSearch = (query: string = searchQuery) => {
    // First, filter by search query
    let results = query.trim() !== "" ? searchWatches(query, watches) : [...watches];
    
    // Then apply category filter if not "all"
    if (selectedCategory !== "all") {
      results = results.filter(watch => watch.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    
    // Apply price range filter
    results = results.filter(watch => watch.price >= priceRange[0] && watch.price <= priceRange[1]);
    
    // Sort results based on the selected sort option
    switch (sortOption) {
      case "price-asc":
        results.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        results.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "relevance":
      default:
        // Keep the default relevance sorting (from the searchWatches function)
        break;
    }
    
    setSearchResults(results);
  };

  const handleOpenSearch = () => {
    setIsSearchOpen(true);
    setSearchQuery("");
    setSearchResults([]);
    setShowAdvancedSearch(false);
    // Reset filters
    setSelectedCategory("all");
    setPriceRange([minPrice, maxPrice]);
    setSortOption("relevance");
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleSearchResultClick = (watchId: string) => {
    setIsSearchOpen(false);
    navigate(`/watch/${watchId}`);
  };

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
  };

  const toggleAdvancedSearch = () => {
    setShowAdvancedSearch(!showAdvancedSearch);
  };

  const applyAdvancedSearch = () => {
    performSearch();
  };

  const handleAdminLogin = () => {
    navigate('/admin/login');
  };

  const handleAdminDashboard = () => {
    navigate('/admin/dashboard');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      });
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem signing out",
      });
    }
  };

  return (
    <nav className="w-full bg-white shadow-sm py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl md:text-3xl font-playfair font-bold text-Rolex-black">
              <span className="text-gold">NASSAR</span> WATCHES
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="font-montserrat text-Rolex-charcoal hover:text-gold transition-colors">
              Home
            </Link>
            <Link to="/collections" className="font-montserrat text-Rolex-charcoal hover:text-gold transition-colors">
              Collections
            </Link>
            <Link to="/about" className="font-montserrat text-Rolex-charcoal hover:text-gold transition-colors">
              About
            </Link>
            <Link to="/contact" className="font-montserrat text-Rolex-charcoal hover:text-gold transition-colors">
              Contact
            </Link>
            {user && (
              <div className="flex items-center gap-4">
                <span className="font-montserrat text-gold">Hello Admin</span>
                <Button
                  variant="outline"
                  onClick={handleAdminDashboard}
                  className="flex items-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </div>
            )}
          </div>

          {/* Action Icons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={handleOpenSearch}>
              <Search className="h-5 w-5 text-Rolex-charcoal" />
            </Button>
            
            {/* Cart with Dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5 text-Rolex-charcoal" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gold text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="p-0 w-80">
                <CartDropdown />
              </PopoverContent>
            </Popover>

            {/* Authentication Buttons */}
            {user ? (
                <Button 
                  variant="destructive" 
                  onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-600"
                >
                Sign Out
                </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={handleAdminLogin}
                className="flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" /> Admin Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-Rolex-charcoal" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white py-4 px-4">
          <div className="flex flex-col space-y-4">
            <Link 
              to="/"
              onClick={toggleMenu}
              className="font-montserrat text-Rolex-charcoal hover:text-gold transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/collections"
              onClick={toggleMenu}
              className="font-montserrat text-Rolex-charcoal hover:text-gold transition-colors"
            >
              Collections
            </Link>
            <Link 
              to="/about"
              onClick={toggleMenu}
              className="font-montserrat text-Rolex-charcoal hover:text-gold transition-colors"
            >
              About
            </Link>
            <Link 
              to="/contact"
              onClick={toggleMenu}
              className="font-montserrat text-Rolex-charcoal hover:text-gold transition-colors"
            >
              Contact
            </Link>
            {user && (
              <>
                <span className="font-montserrat text-gold">Hello Admin</span>
                  <Button 
                    variant="outline" 
                  onClick={() => {
                    handleAdminDashboard();
                    toggleMenu();
                  }}
                  className="flex items-center gap-2"
                  >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                  </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    handleSignOut();
                    toggleMenu();
                  }}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Sign Out
                </Button>
              </>
            )}
            {!user && (
              <Button 
                variant="outline" 
                onClick={() => {
                  handleAdminLogin();
                  toggleMenu();
                }}
                className="flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" /> Admin Sign In
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Search Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Search Watches</DialogTitle>
            <DialogDescription>
              Find your perfect timepiece
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
            <Input
                placeholder="Search watches..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={toggleAdvancedSearch}>
                Advanced
            </Button>
          </div>
          
          {showAdvancedSearch && (
              <div className="space-y-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                  <Label>Price Range</Label>
                <Slider
                    value={priceRange}
                    onValueChange={handlePriceRangeChange}
                  min={minPrice}
                  max={maxPrice}
                  step={100}
                    className="w-full"
                />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
              </div>
              
              <div className="space-y-2">
                <Label>Sort By</Label>
                  <Select value={sortOption} onValueChange={setSortOption}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                      <SelectItem value="name-asc">Name: A to Z</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
              
                <Button onClick={applyAdvancedSearch} className="w-full">
                Apply Filters
              </Button>
            </div>
          )}
          
            {searchResults.length > 0 && (
              <div className="max-h-96 overflow-y-auto space-y-2">
                {searchResults.map((watch) => (
                  <button
                      key={watch.id} 
                      onClick={() => handleSearchResultClick(watch.id)}
                    className="w-full p-2 hover:bg-gray-100 rounded-lg text-left"
                    >
                    <div className="flex items-center gap-4">
                      <img
                        src={watch.images[0]}
                        alt={watch.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-medium">{watch.name}</h3>
                        <p className="text-sm text-gray-500">${watch.price}</p>
                      </div>
                    </div>
                  </button>
                  ))}
                </div>
              )}
            </div>
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default Navbar;
