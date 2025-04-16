
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroBanner from "@/components/HeroBanner";
import BrandSection from "@/components/CategorySection";
import { Watch, Circle, Clock } from "lucide-react";
import { watches, getWatchesByBrand } from "@/data/watches";

const Index = () => {
  // Define luxury watch brands
  const brands = ["Audemars Piguet", "Rolex", "Patek Philippe", "Omega", "Breitling"];
  
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
            
            {/* Brand Circles */}
            <div className="flex flex-wrap justify-center gap-8 mt-16">
              {brands.map((brand) => (
                <Link 
                  key={brand}
                  to={`#${brand.toLowerCase().replace(/\s+/g, '-')}`}
                  className="group flex flex-col items-center"
                >
                  <div className="w-28 h-28 rounded-full border-2 border-gold flex items-center justify-center bg-white shadow-md group-hover:bg-gold/10 transition-all duration-300">
                    {brand === "Audemars Piguet" && <Watch className="w-12 h-12 text-gold" />}
                    {brand === "Rolex" && <Circle className="w-12 h-12 text-gold" />}
                    {brand === "Patek Philippe" && <Clock className="w-12 h-12 text-gold" />}
                    {brand === "Omega" && <Watch className="w-12 h-12 text-gold" />}
                    {brand === "Breitling" && <Circle className="w-12 h-12 text-gold" />}
                  </div>
                  <span className="mt-3 font-montserrat text-luxury-black font-medium group-hover:text-gold transition-colors">
                    {brand}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
        
        {/* Brand Sections */}
        {brands.map((brand) => (
          <div key={brand} id={brand.toLowerCase().replace(/\s+/g, '-')}>
            <BrandSection brand={brand} watches={getWatchesByBrand(brand)} />
          </div>
        ))}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
