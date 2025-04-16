
import { Link } from "react-router-dom";
import ImageGallery from "./ImageGallery";
import { Facebook, Instagram, TikTok, Phone } from "lucide-react";

interface WatchCardProps {
  id: string;
  name: string;
  brand: string;
  price: number;
  images: string[];
  category: string;
  isNew?: boolean;
}

const WatchCard = ({ id, name, brand, price, images, category, isNew = false }: WatchCardProps) => {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

  // Generate share message
  const shareMessage = `Check out this ${brand} ${name} watch for ${formattedPrice} at Nassar Watches!`;
  const productUrl = `${window.location.origin}/watch/${id}`;
  
  // Social media share URLs
  const facebookShareUrl = `https://www.facebook.com/profile.php?id=61555817681896&message=${encodeURIComponent(shareMessage)} ${encodeURIComponent(productUrl)}`;
  const instagramProfile = "https://www.instagram.com/nassar_watches99/";
  const tiktokProfile = "https://www.tiktok.com/@nassar.watches";
  const whatsappShareUrl = `https://wa.me/970595858691?text=${encodeURIComponent(shareMessage)} ${encodeURIComponent(productUrl)}`;

  return (
    <div className="group bg-white rounded-md shadow-sm hover:shadow-md transition duration-300 overflow-hidden">
      <div className="relative">
        <ImageGallery images={images} altText={name} />
        
        {/* New Badge */}
        {isNew && (
          <div className="absolute top-3 left-3 bg-gold text-white text-xs font-bold px-2 py-1 rounded z-10">
            NEW
          </div>
        )}
      </div>
      
      <div className="p-4">
        <Link to={`/watch/${id}`}>
          <h3 className="font-playfair font-semibold text-xl leading-tight group-hover:text-gold transition-colors">
            {name}
          </h3>
        </Link>
        
        <div className="flex justify-between items-center mt-2">
          <p className="text-gray-600 font-montserrat text-sm">{brand}</p>
          <p className="font-montserrat font-semibold text-luxury-charcoal">{formattedPrice}</p>
        </div>
        
        {/* Social Media Share Buttons */}
        <div className="mt-3 flex justify-center space-x-4">
          <a 
            href={facebookShareUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-luxury-black hover:text-[#3b5998] transition-colors" 
            title="Share on Facebook"
          >
            <Facebook size={18} />
          </a>
          <a 
            href={instagramProfile} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-luxury-black hover:text-[#e4405f] transition-colors" 
            title="Share on Instagram"
          >
            <Instagram size={18} />
          </a>
          <a 
            href={tiktokProfile} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-luxury-black hover:text-[#000000] transition-colors" 
            title="Share on TikTok"
          >
            <TikTok size={18} />
          </a>
          <a 
            href={whatsappShareUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-luxury-black hover:text-[#25D366] transition-colors" 
            title="Share on WhatsApp"
          >
            <Phone size={18} />
          </a>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100">
          <Link 
            to={`/watch/${id}`}
            className="block w-full text-center py-2 font-montserrat text-sm font-medium bg-luxury-cream text-luxury-black hover:bg-gold hover:text-white transition-colors rounded"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WatchCard;
