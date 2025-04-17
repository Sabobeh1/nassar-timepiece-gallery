
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Search, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import CartDropdown from "./CartDropdown";
import { useCart } from "@/context/CartContext";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totalItems } = useCart();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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
            <Button variant="ghost" size="icon">
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
              <Button variant="ghost" size="icon">
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
    </nav>
  );
};

export default Navbar;
