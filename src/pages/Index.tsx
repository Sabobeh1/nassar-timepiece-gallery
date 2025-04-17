
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroBanner from "@/components/HeroBanner";
import { getWatchesByCategory } from "@/data/watches";

const Index = () => {
  // Get watches by category for the category cards
  const luxuryWatches = getWatchesByCategory("Luxury");
  const classicWatches = getWatchesByCategory("Classic");
  const sportWatches = getWatchesByCategory("Sport");
  const smartWatches = getWatchesByCategory("Smart");
  
  // Set page title
  useEffect(() => {
    document.title = "Nassar Watches | Luxury Timepieces";
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-luxury-cream">
      <Navbar />
      
      {/* Hero Banner */}
      <HeroBanner />
      
      {/* Main Content */}
      <main>
        {/* Featured Collection */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-playfair font-bold text-luxury-black mb-4">
                Welcome to <span className="text-gold">Nassar Watches</span>
              </h2>
              <p className="font-montserrat text-luxury-charcoal max-w-2xl mx-auto">
                Discover our exquisite collection of timepieces, meticulously crafted for those who appreciate the art of watchmaking and the statement of true luxury.
              </p>
            </div>
            
            {/* Categories Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              {/* Luxury */}
              <div className="relative group overflow-hidden rounded-lg shadow-sm">
                <img 
                  src={luxuryWatches[0].images[0]} 
                  alt="Luxury Watches" 
                  className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-2xl font-playfair font-bold text-white mb-2">Luxury</h3>
                  <p className="text-sm text-gray-200 mb-4">Our premium selection of high-end timepieces</p>
                  <Link 
                    to="/luxury"
                    className="inline-block bg-gold/80 hover:bg-gold text-white py-2 px-4 rounded text-sm font-montserrat transition-colors"
                  >
                    Explore Collection
                  </Link>
                </div>
              </div>
              
              {/* Classic */}
              <div className="relative group overflow-hidden rounded-lg shadow-sm">
                <img 
                  src={classicWatches[0].images[0]} 
                  alt="Classic Watches" 
                  className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-2xl font-playfair font-bold text-white mb-2">Classic</h3>
                  <p className="text-sm text-gray-200 mb-4">Timeless designs that never go out of style</p>
                  <Link 
                    to="/classic"
                    className="inline-block bg-gold/80 hover:bg-gold text-white py-2 px-4 rounded text-sm font-montserrat transition-colors"
                  >
                    Explore Collection
                  </Link>
                </div>
              </div>
              
              {/* Sport */}
              <div className="relative group overflow-hidden rounded-lg shadow-sm">
                <img 
                  src={sportWatches[0].images[0]} 
                  alt="Sport Watches" 
                  className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-2xl font-playfair font-bold text-white mb-2">Sport</h3>
                  <p className="text-sm text-gray-200 mb-4">Rugged timepieces for the active lifestyle</p>
                  <Link 
                    to="/sport"
                    className="inline-block bg-gold/80 hover:bg-gold text-white py-2 px-4 rounded text-sm font-montserrat transition-colors"
                  >
                    Explore Collection
                  </Link>
                </div>
              </div>
              
              {/* Smart */}
              <div className="relative group overflow-hidden rounded-lg shadow-sm">
                <img 
                  src={smartWatches[0].images[0]} 
                  alt="Smart Watches" 
                  className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-2xl font-playfair font-bold text-white mb-2">Smart</h3>
                  <p className="text-sm text-gray-200 mb-4">Modern technology meets elegant design</p>
                  <Link 
                    to="/smart"
                    className="inline-block bg-gold/80 hover:bg-gold text-white py-2 px-4 rounded text-sm font-montserrat transition-colors"
                  >
                    Explore Collection
                  </Link>
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
