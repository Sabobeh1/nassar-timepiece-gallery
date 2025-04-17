
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getWatchesByCategory } from "@/data/watches";

const CollectionsPage = () => {
  const navigate = useNavigate();
  const luxuryWatches = getWatchesByCategory("Luxury");
  const classicWatches = getWatchesByCategory("Classic");
  const sportWatches = getWatchesByCategory("Sport");
  const smartWatches = getWatchesByCategory("Smart");
  
  useEffect(() => {
    document.title = "Collections | Nassar Watches";
  }, []);

  // Handler for category navigation
  const handleViewCollection = (category: string) => {
    navigate(`/${category.toLowerCase()}`, { state: { category } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-luxury-cream">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-playfair font-bold text-luxury-black mb-8 text-center">
            Our <span className="text-gold">Collections</span>
          </h1>
          
          <p className="text-center max-w-3xl mx-auto text-luxury-charcoal/80 mb-12">
            Explore our curated collections of exquisite timepieces, each crafted to perfection.
            From opulent luxury watches to rugged sport models, discover the perfect complement to your style.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Luxury Collection */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative h-64">
                <img 
                  src={luxuryWatches[0].images[0]} 
                  alt="Luxury Watches" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <h2 className="absolute bottom-4 left-4 text-3xl font-playfair font-bold text-white">
                  Luxury
                </h2>
              </div>
              <div className="p-6">
                <p className="text-luxury-charcoal/80 mb-4">
                  Our luxury collection showcases the pinnacle of watchmaking excellence. 
                  These premium timepieces blend sophisticated design with exceptional craftsmanship,
                  featuring precious materials and meticulous attention to detail.
                </p>
                <button 
                  onClick={() => handleViewCollection("Luxury")}
                  className="inline-block bg-gold hover:bg-gold/90 text-white py-2 px-6 rounded font-montserrat transition-colors"
                >
                  View Collection
                </button>
              </div>
            </div>
            
            {/* Classic Collection */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative h-64">
                <img 
                  src={classicWatches[0].images[0]} 
                  alt="Classic Watches" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <h2 className="absolute bottom-4 left-4 text-3xl font-playfair font-bold text-white">
                  Classic
                </h2>
              </div>
              <div className="p-6">
                <p className="text-luxury-charcoal/80 mb-4">
                  Our classic collection features timeless designs that never go out of style.
                  These versatile watches offer enduring elegance for everyday wear,
                  with clean lines and thoughtful details that stand the test of time.
                </p>
                <button 
                  onClick={() => handleViewCollection("Classic")}
                  className="inline-block bg-gold hover:bg-gold/90 text-white py-2 px-6 rounded font-montserrat transition-colors"
                >
                  View Collection
                </button>
              </div>
            </div>
            
            {/* Sport Collection */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative h-64">
                <img 
                  src={sportWatches[0].images[0]} 
                  alt="Sport Watches" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <h2 className="absolute bottom-4 left-4 text-3xl font-playfair font-bold text-white">
                  Sport
                </h2>
              </div>
              <div className="p-6">
                <p className="text-luxury-charcoal/80 mb-4">
                  Our sport collection combines robust functionality with athletic design.
                  Built for adventure and active lifestyles, these watches feature enhanced durability,
                  water resistance, and specialized functions for various sporting activities.
                </p>
                <button 
                  onClick={() => handleViewCollection("Sport")}
                  className="inline-block bg-gold hover:bg-gold/90 text-white py-2 px-6 rounded font-montserrat transition-colors"
                >
                  View Collection
                </button>
              </div>
            </div>
            
            {/* Smart Collection */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative h-64">
                <img 
                  src={smartWatches[0].images[0]} 
                  alt="Smart Watches" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <h2 className="absolute bottom-4 left-4 text-3xl font-playfair font-bold text-white">
                  Smart
                </h2>
              </div>
              <div className="p-6">
                <p className="text-luxury-charcoal/80 mb-4">
                  Our smart collection seamlessly blends technology with elegant design.
                  These connected timepieces offer fitness tracking, notifications, and other smart features
                  while maintaining the sophisticated aesthetic of a luxury watch.
                </p>
                <button 
                  onClick={() => handleViewCollection("Smart")}
                  className="inline-block bg-gold hover:bg-gold/90 text-white py-2 px-6 rounded font-montserrat transition-colors"
                >
                  View Collection
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CollectionsPage;
