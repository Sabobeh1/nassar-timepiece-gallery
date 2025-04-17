
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Search, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import CartDropdown from "./CartDropdown";
import { useCart } from "@/context/CartContext";
import { searchWatches } from "@/utils/searchUtils";
import { watches } from "@/data/watches";
import WatchCard from "./WatchCard";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(watches);
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setSearchResults([]);
    } else {
      const results = searchWatches(query, watches);
      setSearchResults(results);
    }
  };

  const handleOpenSearch = () => {
    setIsSearchOpen(true);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleSearchResultClick = (watchId: string) => {
    setIsSearchOpen(false);
    navigate(`/watch/${watchId}`);
  };

  return (
    <nav className="w-full bg-white shadow-sm py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl md:text-3xl font-playfair font-bold text-luxury-black">
              <span className="text-gold">NASSAR</span> WATCHES
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="font-montserrat text-luxury-charcoal hover:text-gold transition-colors">
              Home
            </Link>
            <Link to="/collections" className="font-montserrat text-luxury-charcoal hover:text-gold transition-colors">
              Collections
            </Link>
            <Link to="/about" className="font-montserrat text-luxury-charcoal hover:text-gold transition-colors">
              About
            </Link>
            <Link to="/contact" className="font-montserrat text-luxury-charcoal hover:text-gold transition-colors">
              Contact
            </Link>
          </div>

          {/* Action Icons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={handleOpenSearch}>
              <Search className="h-5 w-5 text-luxury-charcoal" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5 text-luxury-charcoal" />
            </Button>
            
            {/* Cart with Dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5 text-luxury-charcoal" />
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

          {/* Mobile Menu Button */}
          <button className="md:hidden text-luxury-charcoal" onClick={toggleMenu}>
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
              className="font-montserrat text-luxury-charcoal hover:text-gold transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/collections"
              onClick={toggleMenu}
              className="font-montserrat text-luxury-charcoal hover:text-gold transition-colors"
            >
              Collections
            </Link>
            <Link 
              to="/about"
              onClick={toggleMenu}
              className="font-montserrat text-luxury-charcoal hover:text-gold transition-colors"
            >
              About
            </Link>
            <Link 
              to="/contact"
              onClick={toggleMenu}
              className="font-montserrat text-luxury-charcoal hover:text-gold transition-colors"
            >
              Contact
            </Link>
            <div className="flex space-x-4 pt-2">
              <Button variant="ghost" size="icon" onClick={handleOpenSearch}>
                <Search className="h-5 w-5 text-luxury-charcoal" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5 text-luxury-charcoal" />
              </Button>
              
              {/* Mobile Cart Button */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5 text-luxury-charcoal" />
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
          </div>
        </div>
      )}

      {/* Search Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-playfair">Search Watches</DialogTitle>
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
          
          {searchQuery.trim() !== "" && (
            <div className="mt-4">
              {searchResults.length === 0 ? (
                <p className="text-center py-8 text-luxury-charcoal">No watches found matching "{searchQuery}"</p>
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
                      <h3 className="font-playfair font-bold text-luxury-black">{watch.name}</h3>
                      <p className="text-luxury-charcoal text-sm">{watch.brand}</p>
                      <p className="text-gold font-semibold">${watch.price.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {searchQuery.trim() === "" && (
            <p className="text-center py-8 text-gray-400">Type to search for watches...</p>
          )}
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default Navbar;
