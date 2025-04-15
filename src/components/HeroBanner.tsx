
import { Link } from "react-router-dom";

const HeroBanner = () => {
  return (
    <div className="relative bg-luxury-black h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80" 
          alt="Luxury watch" 
          className="w-full h-full object-cover opacity-60"
        />
        {/* Gold Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-luxury-black/90 to-luxury-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
        <div className="max-w-lg md:max-w-xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-white leading-tight mb-4">
            Timeless <span className="text-gold">Elegance</span> on Your Wrist
          </h1>
          <p className="text-lg md:text-xl font-montserrat text-gray-200 mb-8">
            Discover our exclusive collection of luxury timepieces that combine precision engineering with elegant design.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/collections"
              className="px-8 py-3 bg-gold text-white font-montserrat font-medium rounded hover:bg-gold-dark transition-colors text-center"
            >
              Explore Collection
            </Link>
            <Link
              to="/about"
              className="px-8 py-3 bg-transparent border border-white text-white font-montserrat font-medium rounded hover:bg-white/10 transition-colors text-center"
            >
              Our Story
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
