
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getWatchesByCategory } from "@/data/watches";

const CollectionsPage = () => {
  const navigate = useNavigate();
  const luxuryWatches = getWatchesByCategory("Rolex");
  const classicWatches = getWatchesByCategory("Ap");
  const sportWatches = getWatchesByCategory("Omega");
  const patekWatches = getWatchesByCategory("Patek");
  const smartWatches = getWatchesByCategory("Breitling");
  
  useEffect(() => {
    document.title = "Collections | Nassar Watches";
  }, []);

  // Handler for category navigation
  const handleViewCollection = (category: string) => {
    navigate(`/${category}`, { state: { category } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-Rolex-cream">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-playfair font-bold text-Rolex-black mb-8 text-center">
            Our <span className="text-gold">Collections</span>
          </h1>
          
          <p className="text-center max-w-3xl mx-auto text-Rolex-charcoal/80 mb-12">
            Explore our curated collections of exquisite timepieces, each crafted to perfection.
            From opulent Rolex watches to rugged Omega models, discover the perfect complement to your style.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Rolex Collection */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative h-64">
                <img 
                  src="https://robbreport.com/wp-content/uploads/2024/04/RR_042924_Rolex_Trio_Lead.jpg?w=1024" 
                  alt="Rolex Watches" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <h2 className="absolute bottom-4 left-4 text-3xl font-playfair font-bold text-white">
                  Rolex
                </h2>
              </div>
              <div className="p-6">
                <p className="text-Rolex-charcoal/80 mb-4">
                  Our Rolex collection showcases the pinnacle of watchmaking excellence. 
                  These premium timepieces blend sophisticated design with exceptional craftsmanship,
                  featuring precious materials and meticulous attention to detail.
                </p>
                <button 
                  onClick={() => handleViewCollection("Rolex")}
                  className="inline-block bg-gold hover:bg-gold/90 text-white py-2 px-6 rounded font-montserrat transition-colors"
                >
                  View Collection
                </button>
              </div>
            </div>
            
            {/* Audemars Piguet Collection */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative h-64">
                <img 
                  src="https://robbreport.com/wp-content/uploads/2024/06/History-of-the-Royal-Oak-Header.jpg?w=1024"
                  alt="Audemars Piguet Watches" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <h2 className="absolute bottom-4 left-4 text-3xl font-playfair font-bold text-white">
                Audemars Piguet
                </h2>
              </div>
              <div className="p-6">
                <p className="text-Rolex-charcoal/80 mb-4">
                  Our Audemars Piguet collection features timeless designs that never go out of style.
                  These versatile watches offer enduring elegance for everyday wear,
                  with clean lines and thoughtful details that stand the test of time.
                </p>
                <button 
                  onClick={() => handleViewCollection("Ap")}
                  className="inline-block bg-gold hover:bg-gold/90 text-white py-2 px-6 rounded font-montserrat transition-colors"
                >
                  View Collection
                </button>
              </div>
            </div>
            
            {/* Omega Collection */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative h-64">
                <img 
                  src="https://oracleoftime.com/wp-content/uploads/2024/05/A-Beginners-Guide-to-Every-Omega-Model-Featured-3.jpg"
                  alt="Omega Watches" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <h2 className="absolute bottom-4 left-4 text-3xl font-playfair font-bold text-white">
                  Omega
                </h2>
              </div>
              <div className="p-6">
                <p className="text-Rolex-charcoal/80 mb-4">
                  Our Omega collection combines robust functionality with athletic design.
                  Built for adventure and active lifestyles, these watches feature enhanced durability,
                  water resistance, and specialized functions for various sporting activities.
                </p>
                <button 
                  onClick={() => handleViewCollection("Omega")}
                  className="inline-block bg-gold hover:bg-gold/90 text-white py-2 px-6 rounded font-montserrat transition-colors"
                >
                  View Collection
                </button>
              </div>
            </div>

            {/* Patek Philip Collection */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative h-64">
                <img 
                  src="https://magazine.chrono24.com/cdn-cgi/image/f=auto,metadata=none,fit=cover,q=65,w=1200,h=600,dpr=2.0/2024/09/Best-Selling-Patek-Philippe-2-1.jpg"
                  alt="Patek Philip Watches" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <h2 className="absolute bottom-4 left-4 text-3xl font-playfair font-bold text-white">
                  Patek Philip
                </h2>
              </div>
              <div className="p-6">
                <p className="text-Rolex-charcoal/80 mb-4">
                  Our Patek Philip collection combines robust functionality with athletic design.
                  Built for adventure and active lifestyles, these watches feature enhanced durability,
                  water resistance, and specialized functions for various sporting activities.
                </p>
                <button 
                  onClick={() => handleViewCollection("Patek")}
                  className="inline-block bg-gold hover:bg-gold/90 text-white py-2 px-6 rounded font-montserrat transition-colors"
                >
                  View Collection
                </button>
              </div>
            </div>
            
            {/* Breitling Collection */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative h-64">
                <img 
                  src="https://www.theluxuryhut.com/admin/upload/1724156655breitling-watch-buying-guide.jpg"
                  alt="Breitling Watches" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <h2 className="absolute bottom-4 left-4 text-3xl font-playfair font-bold text-white">
                  Breitling
                </h2>
              </div>
              <div className="p-6">
                <p className="text-Rolex-charcoal/80 mb-4">
                  Our Breitling collection seamlessly blends technology with elegant design.
                  These connected timepieces offer fitness tracking, notifications, and other Breitling features
                  while maintaining the sophisticated aesthetic of a Rolex watch.
                </p>
                <button 
                  onClick={() => handleViewCollection("Breitling")}
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
