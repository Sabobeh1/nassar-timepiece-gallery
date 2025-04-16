
import { Facebook, Instagram, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import TikTokIcon from "./icons/TikTokIcon";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-luxury-black text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-3xl font-playfair font-bold mb-4">
              <span className="text-gold">NASSAR</span> WATCHES
            </h2>
            <p className="text-gray-300 font-montserrat mb-6 max-w-md">
              Discover our carefully curated collection of luxury timepieces. Each watch represents the pinnacle of craftsmanship and sophistication.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-playfair font-bold mb-4 border-b border-gold pb-2">Quick Links</h3>
            <ul className="space-y-2 font-montserrat">
              <li>
                <Link to="/" className="text-gray-300 hover:text-gold transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/collections" className="text-gray-300 hover:text-gold transition-colors">Collections</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-gold transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-gold transition-colors">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-1">
            <h3 className="text-lg font-playfair font-bold mb-4 border-b border-gold pb-2">Contact</h3>
            <ul className="space-y-2 font-montserrat">
              <li className="text-gray-300">Email: info@nassarwatches.com</li>
              <li className="text-gray-300">Phone: +970595858691</li>
              <li className="text-gray-300">Address: 123 Luxury Lane, New York, NY</li>
            </ul>
            
            {/* Social Media */}
            <div className="mt-6">
              <h3 className="text-lg font-playfair font-bold mb-3 border-b border-gold pb-2">Follow Us</h3>
              <div className="flex space-x-4 mt-3">
                <a href="https://www.facebook.com/profile.php?id=61555817681896" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-gold transition-colors">
                  <Facebook size={20} />
                </a>
                <a href="https://www.instagram.com/nassar_watches99/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-gold transition-colors">
                  <Instagram size={20} />
                </a>
                <a href="https://www.tiktok.com/@nassar.watches" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-gold transition-colors">
                  <TikTokIcon size={20} />
                </a>
                <a href="https://wa.me/970595858691" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-gold transition-colors">
                  <Phone size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-gray-800 text-center">
          <p className="text-gray-400 font-montserrat text-sm">
            &copy; {currentYear} Nassar Watches. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
