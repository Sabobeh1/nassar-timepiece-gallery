import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Search, ShoppingCart, ChevronDown, ArrowUpDown, ArrowDown, ArrowUp, LogIn, Settings, LayoutDashboard, LogOut } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  const { user, signOut, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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
            {isAdmin && (
              <Link 
                to="/admin/dashboard" 
                className="font-montserrat text-gold hover:text-gold-dark transition-colors flex items-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin Dashboard
              </Link>
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
              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <Button 
                    variant="outline" 
                    onClick={handleAdminDashboard}
                    className="flex items-center gap-2 bg-gold text-white hover:bg-gold-dark"
                  >
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Button>
                )}
                <Button 
                  variant="destructive" 
                  onClick={handleSignOut}
                  className="bg-red-500 hover:bg-red-600 flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </div>
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
            
            {isAdmin && (
              <Link 
                to="/admin/dashboard"
                onClick={toggleMenu}
                className="font-montserrat text-gold hover:text-gold-dark transition-colors flex items-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin Dashboard
              </Link>
            )}
            
            <div className="flex space-x-4 pt-2">
              <Button variant="ghost" size="icon" onClick={handleOpenSearch}>
                <Search className="h-5 w-5 text-Rolex-charcoal" />
              </Button>
              
              {/* Mobile Cart Button */}
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
            </div>
            
            {/* Mobile Authentication Buttons */}
            {user ? (
              <div className="flex flex-col space-y-2 w-full">
                {isAdmin && (
                  <Button 
                    variant="outline" 
                    onClick={handleAdminDashboard}
                    className="flex items-center gap-2 bg-gold text-white hover:bg-gold-dark w-full"
                  >
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Button>
                )}
                <Button 
                  variant="destructive" 
                  onClick={handleSignOut}
                  className="bg-red-500 hover:bg-red-600 flex items-center gap-2 w-full"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                onClick={handleAdminLogin}
                className="flex items-center gap-2 w-full"
              >
                <LogIn className="h-4 w-4" /> Admin Sign In
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Advanced Search Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-playfair">Search Watches</DialogTitle>
            <DialogDescription>
              Enter watch name or brand to find the perfect timepiece
            </DialogDescription>
          </DialogHeader>
          <div className="relative my-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Enter watch name or brand..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-md focus:border-gold focus:ring-gold focus:ring-1 focus:outline-none"
              autoFocus
            />
          </div>
          
          {/* Advanced Search Toggle */}
          <div className="mb-4">
            <Button 
              variant="outline" 
              onClick={toggleAdvancedSearch}
              className="w-full flex justify-between items-center text-Rolex-charcoal"
            >
              Advanced Search
              <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showAdvancedSearch ? 'rotate-180' : ''}`} />
            </Button>
          </div>
          
          {/* Advanced Search Options */}
          {showAdvancedSearch && (
            <div className="space-y-4 mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
              {/* Category Selection */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
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
              
              {/* Price Range Slider */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Price Range</Label>
                  <span className="text-sm text-Rolex-charcoal">
                    ${priceRange[0]} - ${priceRange[1]}
                  </span>
                </div>
                <Slider
                  defaultValue={[minPrice, maxPrice]}
                  min={minPrice}
                  max={maxPrice}
                  step={100}
                  value={[priceRange[0], priceRange[1]]}
                  onValueChange={handlePriceRangeChange}
                  className="py-4"
                />
              </div>
              
              {/* Sort Options */}
              <div className="space-y-2">
                <Label>Sort By</Label>
                <RadioGroup value={sortOption} onValueChange={setSortOption} className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="relevance" id="relevance" />
                    <Label htmlFor="relevance" className="cursor-pointer">Relevance</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="price-asc" id="price-asc" />
                    <Label htmlFor="price-asc" className="cursor-pointer flex items-center">
                      Price: Low to High <ArrowUp className="ml-1 h-3 w-3" />
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="price-desc" id="price-desc" />
                    <Label htmlFor="price-desc" className="cursor-pointer flex items-center">
                      Price: High to Low <ArrowDown className="ml-1 h-3 w-3" />
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="name-asc" id="name-asc" />
                    <Label htmlFor="name-asc" className="cursor-pointer flex items-center">
                      Name (A-Z) <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Apply Filters Button */}
              <Button onClick={applyAdvancedSearch} className="w-full bg-gold hover:bg-gold/90 text-white">
                Apply Filters
              </Button>
            </div>
          )}
          
          {/* Search Results */}
          {searchQuery.trim() !== "" || showAdvancedSearch ? (
            <div className="mt-4">
              {searchResults.length === 0 ? (
                <p className="text-center py-8 text-Rolex-charcoal">No watches found matching your criteria</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map(watch => (
                    <div 
                      key={watch.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow bg-white p-4 rounded-lg"
                      onClick={() => handleSearchResultClick(watch.id)}
                    >
                      <div className="aspect-square overflow-hidden rounded-md mb-2">
                        <img src={watch.images[0]} alt={watch.name} className="w-full h-full object-cover" />
                      </div>
                      <h3 className="font-playfair font-bold text-Rolex-black">{watch.name}</h3>
                      <p className="text-Rolex-charcoal text-sm">{watch.brand}</p>
                      <p className="text-gold font-semibold">${watch.price.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-400">Type to search for watches or use advanced search options...</p>
          )}
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default Navbar;
