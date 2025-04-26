import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Search, ShoppingCart, LogIn, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import CartDropdown from "./CartDropdown";
import { useCart } from "@/context/CartContext";
import { useProductSearch } from "@/hooks/useProductSearch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/useCategories";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { DeveloperInfo } from "./DeveloperInfo";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [isFeatured, setIsFeatured] = useState<boolean | undefined>(undefined);
  const { totalItems } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { categories, loading: categoriesLoading } = useCategories();
  const { searchResults, isLoading, searchProducts } = useProductSearch();

  // Get min and max price (will be dynamically determined later)
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(50000);

  // Get price range from database on component mount
  useEffect(() => {
    const fetchPriceRange = async () => {
      try {
        const { data: minData, error: minError } = await supabase
          .from('products')
          .select('price')
          .order('price', { ascending: true })
          .limit(1)
          .single();

        const { data: maxData, error: maxError } = await supabase
          .from('products')
          .select('price')
          .order('price', { ascending: false })
          .limit(1)
          .single();

        if (minError || maxError) throw new Error('Failed to fetch price range');

        if (minData && maxData) {
          const min = Math.floor(minData.price);
          const max = Math.ceil(maxData.price);
          setMinPrice(min);
          setMaxPrice(max);
          setPriceRange([min, max]);
        }
      } catch (error) {
        console.error('Error fetching price range:', error);
        // Keep the default values if there's an error
      }
    };

    fetchPriceRange();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Use our custom hook to search products
    searchProducts(query, {
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      isFeatured: isFeatured
    });
  };

  const handleOpenSearch = () => {
    setIsSearchOpen(true);
    setSearchQuery("");
    setSelectedCategory("all");
    setPriceRange([minPrice, maxPrice]);
    setIsFeatured(undefined);
    setShowAdvancedSearch(false);
    // Clear results
    searchProducts("", {});
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
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
    searchProducts(searchQuery, {
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      isFeatured: isFeatured
    });
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

  // Format currency for displaying price
  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <nav className="w-full bg-white shadow-sm py-4 sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <h1 className="text-xl xs:text-2xl md:text-3xl font-playfair font-bold text-Rolex-black">
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

          {/* Developer Info - Desktop */}
          <div className="hidden md:block ml-8">
            <DeveloperInfo />
          </div>

          {/* Action Icons – Always visible on mobile and desktop */}
          <div className="flex items-center space-x-3 md:space-x-4">
            {/* Mobile: Cart & Search Icons, always visible */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleOpenSearch}
              className="p-2 sm:p-2.5 rounded-full md:hidden flex items-center justify-center focus:ring-2 focus:ring-gold"
              aria-label="Search Watches"
            >
              <Search className="h-6 w-6 text-Rolex-charcoal" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative p-2 sm:p-2.5 rounded-full md:hidden flex items-center justify-center focus:ring-2 focus:ring-gold"
                  aria-label="View Cart"
                >
                  <ShoppingCart className="h-6 w-6 text-Rolex-charcoal" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gold text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="p-0 w-[95vw] max-w-sm sm:max-w-xs">
                <CartDropdown />
              </PopoverContent>
            </Popover>
            {/* Desktop actions retained */}
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

            {/* Hamburger menu on mobile */}
            <button
              className="md:hidden ml-2 text-Rolex-charcoal rounded-full p-2 outline-none focus:ring-2 focus:ring-gold"
              onClick={toggleMenu}
              aria-label="Open main menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Remove the mobile DeveloperInfo from here */}
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
            
            {/* Developer Info - Mobile */}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <DeveloperInfo />
            </div>
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
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
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
                    <span>{formatCurrency(priceRange[0])}</span>
                    <span>{formatCurrency(priceRange[1])}</span>
                  </div>
                </div>
              
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="featured" 
                      checked={isFeatured === true}
                      onCheckedChange={(checked) => {
                        setIsFeatured(checked === 'indeterminate' ? undefined : checked);
                      }}
                    />
                    <Label htmlFor="featured">Featured Products Only</Label>
                  </div>
                </div>
              
                <Button onClick={applyAdvancedSearch} className="w-full">
                  Apply Filters
                </Button>
              </div>
            )}
          
            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
              </div>
            )}
          
            {/* Results */}
            {!isLoading && searchResults.length > 0 && (
              <div className="max-h-96 overflow-y-auto space-y-2">
                {searchResults.map((product) => (
                  <button
                    key={product.id} 
                    onClick={() => handleSearchResultClick(product.id)}
                    className="w-full p-3 hover:bg-gray-100 rounded-lg text-left transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 overflow-hidden rounded bg-gray-100 flex-shrink-0">
                        {product.image_urls?.[0] ? (
                          <img
                            src={product.image_urls[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-watch.jpg';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No image
                          </div>
                        )}
                        {product.is_featured && (
                          <div className="absolute top-0 right-0 bg-gold text-white text-xs px-1 py-0.5">
                            ★
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 line-clamp-1">{product.name}</h3>
                        <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
                        <p className="text-sm font-bold text-gray-900">{formatCurrency(product.price)}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          
            {/* No Results */}
            {!isLoading && searchQuery && searchResults.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                <p>No watches found matching your search criteria.</p>
                <p className="text-sm mt-2">Try different keywords or filters.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default Navbar;
