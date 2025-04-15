
import { Link } from "react-router-dom";
import ImageGallery from "./ImageGallery";

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
