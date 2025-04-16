
import { useState } from "react";
import WatchCard from "./WatchCard";

interface Watch {
  id: string;
  name: string;
  brand: string;
  price: number;
  images: string[];
  category: string;
  isNew?: boolean;
}

interface CategorySectionProps {
  title: string;
  watches: Watch[];
}

const CategorySection = ({ title, watches }: CategorySectionProps) => {
  const [visibleWatches, setVisibleWatches] = useState(4);

  const handleLoadMore = () => {
    setVisibleWatches(prev => prev + 4);
  };

  return (
    <section className="mb-12 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-playfair font-bold text-luxury-black">
            <span className="text-gold">{title}</span> Collection
          </h2>
          <div className="h-0.5 flex-grow ml-6 bg-gradient-to-r from-gold to-transparent"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {watches.slice(0, visibleWatches).map(watch => (
            <WatchCard
              key={watch.id}
              id={watch.id}
              name={watch.name}
              brand={watch.brand}
              price={watch.price}
              images={watch.images}
              category={watch.category}
              isNew={watch.isNew}
            />
          ))}
        </div>
        
        {visibleWatches < watches.length && (
          <div className="mt-8 text-center">
            <button 
              onClick={handleLoadMore}
              className="inline-block px-6 py-2 bg-luxury-cream text-luxury-black font-montserrat text-sm font-medium border border-gold hover:bg-gold hover:text-white transition-colors rounded"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategorySection;
