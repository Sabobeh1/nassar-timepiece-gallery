
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroBanner from "@/components/HeroBanner";
import { getWatchesByCategory } from "@/data/watches";

const Index = () => {
  const navigate = useNavigate();
  // Get watches by category for the category cards
  const luxuryWatches = getWatchesByCategory("Rolex");
  const classicWatches = getWatchesByCategory("Ap");
  const sportWatches = getWatchesByCategory("Omega");
  const patekWatches = getWatchesByCategory("Patek");
  const smartWatches = getWatchesByCategory("Breitling");
 
  
  // Set page title
  useEffect(() => {
    document.title = "Nassar Watches | Rolex Timepieces";
  }, []);

  // Handler for category navigation
  const handleCategoryClick = (category: string) => {
    navigate(`/${category}`, { state: { category } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-Rolex-cream">
      <Navbar />
      
      {/* Hero Banner */}
      <HeroBanner />
      
      {/* Main Content */}
      <main>
        {/* Featured Collection */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-playfair font-bold text-Rolex-black mb-4">
                Welcome to <span className="text-gold">Nassar Watches</span>
              </h2>
              <p className="font-montserrat text-Rolex-charcoal max-w-2xl mx-auto">
                Discover our exquisite collection of timepieces, meticulously crafted for those who appreciate the art of watchmaking and the statement of true Rolex.
              </p>
            </div>
            
            {/* Categories Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              {/* Rolex */}
              <div className="relative group overflow-hidden rounded-lg shadow-sm">
                <img 
                  src="https://robbreport.com/wp-content/uploads/2024/04/RR_042924_Rolex_Trio_Lead.jpg?w=1024" 
                  alt="Rolex Watches" 
                  className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-2xl font-playfair font-bold text-white mb-2">Rolex</h3>
                  <p className="text-sm text-gray-200 mb-4">Our premium selection of high-end timepieces</p>
                  <button 
                    onClick={() => handleCategoryClick("Rolex")}
                    className="inline-block bg-gold/80 hover:bg-gold text-white py-2 px-4 rounded text-sm font-montserrat transition-colors"
                  >
                    Explore Collection
                  </button>
                </div>
              </div>
              
              {/* Audemars Piguet */}
              <div className="relative group overflow-hidden rounded-lg shadow-sm">
                <img 
                  src="https://robbreport.com/wp-content/uploads/2024/06/History-of-the-Royal-Oak-Header.jpg?w=1024" 
                  alt="Audemars Piguet Watches" 
                  className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-2xl font-playfair font-bold text-white mb-2">Audemars Piguet</h3>
                  <p className="text-sm text-gray-200 mb-4">Timeless designs that never go out of style</p>
                  <button 
                    onClick={() => handleCategoryClick("Ap")}
                    className="inline-block bg-gold/80 hover:bg-gold text-white py-2 px-4 rounded text-sm font-montserrat transition-colors"
                  >
                    Explore Collection
                  </button>
                </div>
              </div>
              
              {/* Omega */}
              <div className="relative group overflow-hidden rounded-lg shadow-sm">
                <img 
                  src="https://oracleoftime.com/wp-content/uploads/2024/05/A-Beginners-Guide-to-Every-Omega-Model-Featured-3.jpg"
                  alt="Omega Watches" 
                  className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-2xl font-playfair font-bold text-white mb-2">Omega</h3>
                  <p className="text-sm text-gray-200 mb-4">Rugged timepieces for the active lifestyle</p>
                  <button 
                    onClick={() => handleCategoryClick("Omega")}
                    className="inline-block bg-gold/80 hover:bg-gold text-white py-2 px-4 rounded text-sm font-montserrat transition-colors"
                  >
                    Explore Collection
                  </button>
                </div>
              </div>

              {/* Patek Philip */}
              <div className="relative group overflow-hidden rounded-lg shadow-sm">
                <img 
                  src="https://magazine.chrono24.com/cdn-cgi/image/f=auto,metadata=none,fit=cover,q=65,w=1200,h=600,dpr=2.0/2024/09/Best-Selling-Patek-Philippe-2-1.jpg"
                  alt="Patek Philip Watches" 
                  className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-2xl font-playfair font-bold text-white mb-2">Patek Philib</h3>
                  <p className="text-sm text-gray-200 mb-4">Rugged timepieces for the active lifestyle</p>
                  <button 
                    onClick={() => handleCategoryClick("Patek")}
                    className="inline-block bg-gold/80 hover:bg-gold text-white py-2 px-4 rounded text-sm font-montserrat transition-colors"
                  >
                    Explore Collection
                  </button>
                </div>
              </div>
              
              {/* Breitling */}
              <div className="relative group overflow-hidden rounded-lg shadow-sm">
                <img 
                  src="https://www.theluxuryhut.com/admin/upload/1724156655breitling-watch-buying-guide.jpg"
                  alt="Breitling Watches" 
                  className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-2xl font-playfair font-bold text-white mb-2">Breitling</h3>
                  <p className="text-sm text-gray-200 mb-4">Modern technology meets elegant design</p>
                  <button 
                    onClick={() => handleCategoryClick("Breitling")}
                    className="inline-block bg-gold/80 hover:bg-gold text-white py-2 px-4 rounded text-sm font-montserrat transition-colors"
                  >
                    Explore Collection
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
