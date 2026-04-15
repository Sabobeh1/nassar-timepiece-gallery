
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

  const handleAddToCart = () => {
    addToCart({
      id,
      name,
      brand,
      price,
      image: images[0],
    });
    
    toast({
      title: "Added to cart",
      description: `${brand} ${name} has been added to your cart`,
    });
  };

  // Image navigation handlers
  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Ensure we have valid images
  const validImages = images && images.length > 0 ? images : ['/placeholder-watch.jpg'];

  return (
    <div className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="relative">
        <Link to={`/watch/${id}`} className="block">
          <div className="relative aspect-square overflow-hidden">
            <img 
              src={validImages[activeImageIndex]} 
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-watch.jpg';
              }}
            />
          </div>
        </Link>
        
        {/* Image Navigation Controls - IMPORTANT: stopPropagation to prevent navigation */}
        {validImages.length > 1 && (
          <>
            <button 
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 text-Rolex-charcoal hover:bg-white transition shadow z-10"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 text-Rolex-charcoal hover:bg-white transition shadow z-10"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
        
        {/* Image Counter Indicator */}
        {validImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full z-10">
            {activeImageIndex + 1}/{validImages.length}
          </div>
        )}
        
        {/* New Badge */}
        {isNew && (
          <div className="absolute top-3 left-3 bg-gold text-white text-xs font-bold px-2 py-1 rounded-md z-10">
            NEW
          </div>
        )}
      </div>
      
      <div className="p-5">
        <div className="mb-1 text-xs text-gray-500 font-montserrat uppercase tracking-wider">
          {brand}
        </div>
        
        <Link to={`/watch/${id}`}>
          <h3 className="font-playfair font-semibold text-lg leading-tight group-hover:text-gold transition-colors line-clamp-2 min-h-[3.5rem]">
            {name}
          </h3>
        </Link>
        
        <p className="font-montserrat font-bold text-xl text-Rolex-charcoal mt-2">
          {formattedPrice}
        </p>
        
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
          <Button 
            onClick={handleAddToCart}
            className="w-full bg-gold hover:bg-gold/90 text-white font-montserrat text-sm"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add to Cart
          </Button>
          
          <Link to={`/watch/${id}`} className="w-full">
            <Button 
              variant="outline"
              className="w-full border-gold text-gold hover:bg-gold/10 font-montserrat text-sm"
            >
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WatchCard;
