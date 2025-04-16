
import { useState } from "react";
import WatchCard from "./WatchCard";
import { Button } from "./ui/button";

interface Watch {
  id: string;
  name: string;
  brand: string;
  price: number;
  images: string[];
  category: string;
  isNew?: boolean;
}

interface BrandSectionProps {
  brand: string;
  watches: Watch[];
}

const BrandSection = ({ brand, watches }: BrandSectionProps) => {
  const [visibleWatches, setVisibleWatches] = useState(4);

  const handleLoadMore = () => {
    setVisibleWatches(prev => prev + 4);
  };

  return (
    <section className="mb-12 py-8 animate-fade-in-up">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-playfair font-bold text-luxury-black">
            <span className="text-gold">{brand}</span> Collection
          </h2>
          <div className="h-0.5 flex-grow ml-6 bg-gradient-to-r from-gold to-transparent gold-shimmer"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {watches.slice(0, visibleWatches).map((watch, index) => (
            <div 
              key={watch.id} 
              className="transform transition-all duration-500"
              style={{ 
                animationDelay: `${index * 150}ms`,
                animation: 'fade-in-up 0.5s ease-out forwards'
              }}
            >
              <WatchCard
                id={watch.id}
                name={watch.name}
                brand={watch.brand}
                price={watch.price}
                images={watch.images}
                category={watch.category}
                isNew={watch.isNew}
              />
            </div>
          ))}
        </div>
        
        {visibleWatches < watches.length && (
          <div className="mt-8 text-center animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <Button 
              onClick={handleLoadMore}
              className="px-6 py-6 bg-luxury-cream text-luxury-black font-montserrat text-sm font-medium border border-gold hover:bg-gold hover:text-white transition-colors rounded relative overflow-hidden group"
            >
              {/* Gold shimmer effect on hover */}
              <span className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/20 to-gold/0 group-hover:translate-x-full transition-transform duration-1000 ease-in-out opacity-0 group-hover:opacity-50"></span>
              <span className="relative z-10">Load More</span>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default BrandSection;
