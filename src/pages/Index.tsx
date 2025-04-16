
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroBanner from "@/components/HeroBanner";
import CategorySection from "@/components/CategorySection";
import { watches, getWatchesByBrand } from "@/data/watches";

const Index = () => {
  // Get watches by brand instead of category
  const audemarsPiguetWatches = getWatchesByBrand("Audemars Piguet");
  const rolexWatches = getWatchesByBrand("Rolex");
  const patekPhilippeWatches = getWatchesByBrand("Patek Philippe");
  const omegaWatches = getWatchesByBrand("Omega");
  const breitlingWatches = getWatchesByBrand("Breitling");
  
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
            
            {/* Brand Selection */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 lg:gap-12 mt-12">
              {/* Audemars Piguet */}
              <div className="flex flex-col items-center">
                <Link to="/brand/audemars-piguet" className="block">
                  <div className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full bg-[#1A1F2C] border border-gold flex items-center justify-center mb-2 transition-transform hover:scale-105">
                    <span className="text-gold text-xs md:text-sm lg:text-base font-bold">AUDEMARS PIGUET</span>
                  </div>
                  <span className="block text-center text-sm md:text-base font-montserrat mt-2">AP</span>
                </Link>
              </div>
              
              {/* Rolex */}
              <div className="flex flex-col items-center">
                <Link to="/brand/rolex" className="block">
                  <div className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full bg-[#1A1F2C] border border-gold flex items-center justify-center mb-2 transition-transform hover:scale-105">
                    <span className="text-gold text-xs md:text-sm lg:text-base font-bold">ROLEX</span>
                  </div>
                  <span className="block text-center text-sm md:text-base font-montserrat mt-2">ROLEX</span>
                </Link>
              </div>
              
              {/* Patek Philippe */}
              <div className="flex flex-col items-center">
                <Link to="/brand/patek-philippe" className="block">
                  <div className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full bg-[#1A1F2C] border border-gold flex items-center justify-center mb-2 transition-transform hover:scale-105">
                    <span className="text-gold text-xs md:text-sm lg:text-base font-bold">PATEK PHILIPPE</span>
                  </div>
                  <span className="block text-center text-sm md:text-base font-montserrat mt-2">PATEK PHILIP...</span>
                </Link>
              </div>
              
              {/* Omega */}
              <div className="flex flex-col items-center">
                <Link to="/brand/omega" className="block">
                  <div className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full bg-[#1A1F2C] border border-gold flex items-center justify-center mb-2 transition-transform hover:scale-105">
                    <span className="text-gold text-xs md:text-sm lg:text-base font-bold">OMEGA</span>
                  </div>
                  <span className="block text-center text-sm md:text-base font-montserrat mt-2">OMEGA</span>
                </Link>
              </div>
              
              {/* Breitling */}
              <div className="flex flex-col items-center">
                <Link to="/brand/breitling" className="block">
                  <div className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full bg-[#1A1F2C] border border-gold flex items-center justify-center mb-2 transition-transform hover:scale-105">
                    <span className="text-gold text-xs md:text-sm lg:text-base font-bold">BREITLING</span>
                  </div>
                  <span className="block text-center text-sm md:text-base font-montserrat mt-2">BREITLING</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Brand Sections */}
        {audemarsPiguetWatches.length > 0 && (
          <CategorySection title="Audemars Piguet" watches={audemarsPiguetWatches} />
        )}
        {rolexWatches.length > 0 && (
          <CategorySection title="Rolex" watches={rolexWatches} />
        )}
        {patekPhilippeWatches.length > 0 && (
          <CategorySection title="Patek Philippe" watches={patekPhilippeWatches} />
        )}
        {omegaWatches.length > 0 && (
          <CategorySection title="Omega" watches={omegaWatches} />
        )}
        {breitlingWatches.length > 0 && (
          <CategorySection title="Breitling" watches={breitlingWatches} />
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
