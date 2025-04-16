
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroBanner from "@/components/HeroBanner";
import BrandSection from "@/components/CategorySection";
import { Watch, Circle, Clock, ShieldCheck, Timer } from "lucide-react";
import { watches, getWatchesByBrand } from "@/data/watches";

const Index = () => {
  // Define luxury watch brands
  const brands = ["Audemars Piguet", "Rolex", "Patek Philippe", "Omega", "Breitling"];
  
  // Brand icons mapping
  const brandIcons = {
    "Audemars Piguet": <Watch className="w-12 h-12 text-gold group-hover:scale-110 transition-transform duration-300" />,
    "Rolex": <Circle className="w-12 h-12 text-gold group-hover:scale-110 transition-transform duration-300" />,
    "Patek Philippe": <Clock className="w-12 h-12 text-gold group-hover:scale-110 transition-transform duration-300" />,
    "Omega": <ShieldCheck className="w-12 h-12 text-gold group-hover:scale-110 transition-transform duration-300" />,
    "Breitling": <Timer className="w-12 h-12 text-gold group-hover:scale-110 transition-transform duration-300" />
  };
  
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
            
            {/* Brand Circles - Enhanced with animations and nicer design */}
            <div className="flex flex-wrap justify-center gap-8 mt-16">
              {brands.map((brand) => (
                <Link 
                  key={brand}
                  to={`#${brand.toLowerCase().replace(/\s+/g, '-')}`}
                  className="group flex flex-col items-center"
                >
                  <div className="w-32 h-32 rounded-full border-2 border-gold flex items-center justify-center bg-white shadow-lg 
                    group-hover:shadow-gold/50 group-hover:border-gold/80 transition-all duration-500
                    relative overflow-hidden animate-fade-in-up">
                    {/* Background pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle,_transparent_35%,_#f5f5f5_100%)] opacity-40"></div>
                    
                    {/* Gold shimmer effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/20 to-gold/0 group-hover:translate-x-full transition-transform duration-1000 ease-in-out opacity-0 group-hover:opacity-50"></div>
                    
                    {/* Brand icon */}
                    <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-300">
                      {brandIcons[brand]}
                    </div>
                  </div>
                  <span className="mt-4 font-montserrat text-luxury-black font-medium group-hover:text-gold transition-colors duration-300 relative">
                    {brand}
                    {/* Animated underline on hover */}
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-gold group-hover:w-full transition-all duration-300"></span>
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
