
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col bg-Rolex-cream">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h1 className="font-playfair text-6xl font-bold text-gold mb-4">404</h1>
          <h2 className="font-playfair text-2xl text-Rolex-black mb-6">Page Not Found</h2>
          <p className="font-montserrat text-Rolex-charcoal mb-8">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-gold text-white font-montserrat rounded hover:bg-gold-dark transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
