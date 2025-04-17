
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Facebook, Instagram, ArrowLeft, Phone, ShoppingCart } from "lucide-react";
import TikTokIcon from "@/components/icons/TikTokIcon";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageGallery from "@/components/ImageGallery";
import { Button } from "@/components/ui/button";
import { watches } from "@/data/watches";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/ui/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const WatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [watch, setWatch] = useState<any>(null);
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  useEffect(() => {
    // Find the watch by ID
    const foundWatch = watches.find(w => w.id === id);
    if (foundWatch) {
      setWatch(foundWatch);
      document.title = `${foundWatch.brand} ${foundWatch.name} | Nassar Watches`;
    } else {
      navigate("/not-found");
    }
  }, [id, navigate]);

  if (!watch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-Rolex-cream">
        <div className="animate-pulse text-2xl text-gold font-playfair">Loading...</div>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(watch.price);

  // Generate product URL for sharing
  const productUrl = `${window.location.origin}/watch/${id}`;
  
  // Social media share messages
  const shareMessage = `Check out this ${watch.brand} ${watch.name} watch for ${formattedPrice} at Nassar Watches!`;
  const facebookShareUrl = `https://www.facebook.com/profile.php?id=61555817681896&message=${encodeURIComponent(shareMessage)} ${encodeURIComponent(productUrl)}`;
  const instagramProfile = "https://www.instagram.com/nassar_watches99/";
  const tiktokProfile = "https://www.tiktok.com/@nassar.watches";
  
  // WhatsApp messages
  const whatsappShareUrl = `https://wa.me/970593484819?text=${encodeURIComponent(`I'm interested in the ${watch.brand} ${watch.name} watch priced at ${formattedPrice}. Product link: ${productUrl}`)}`;

  // Handle add to cart
  const handleAddToCart = () => {
    addToCart({
      id: watch.id,
      name: watch.name,
      brand: watch.brand,
      price: watch.price,
      image: watch.images[0],
    });
    
    toast({
      title: "Added to cart",
      description: `${watch.brand} ${watch.name} has been added to your cart`,
    });
  };

  // Random product details
  const randomSpecs = {
    movement: ["Automatic", "Mechanical", "Quartz", "Solar Powered"][Math.floor(Math.random() * 4)],
    caseDiameter: `${Math.floor(Math.random() * 10) + 35}mm`,
    waterResistance: `${(Math.floor(Math.random() * 10) + 3) * 10}m`,
    material: ["Stainless Steel", "Gold", "Titanium", "Ceramic", "Carbon Fiber"][Math.floor(Math.random() * 5)],
    strapMaterial: ["Leather", "Rubber", "Stainless Steel", "Fabric", "Silicone"][Math.floor(Math.random() * 5)],
    crystalType: ["Sapphire", "Mineral", "Acrylic"][Math.floor(Math.random() * 3)],
    powerReserve: `${Math.floor(Math.random() * 70) + 30} hours`,
    functions: ["Date", "Chronograph", "GMT", "Moon Phase", "Perpetual Calendar", "Tourbillon"].slice(0, Math.floor(Math.random() * 3) + 1).join(", ")
  };

  return (
    <div className="min-h-screen flex flex-col bg-Rolex-cream">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          {/* Back button */}
          <Button 
            onClick={() => navigate(-1)} 
            variant="outline" 
            className="mb-6 text-Rolex-black hover:text-gold"
          >
            <ArrowLeft className="mr-2" size={16} />
            Back
          </Button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <ImageGallery 
                images={watch.images} 
                altText={`${watch.brand} ${watch.name}`} 
              />
            </div>
            
            {/* Product Information */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              {watch.isNew && (
                <div className="inline-block bg-gold text-white text-xs font-bold px-2 py-1 rounded mb-4">
                  NEW
                </div>
              )}
              
              <h1 className="font-playfair text-3xl md:text-4xl font-bold text-Rolex-black mb-2">
                {watch.name}
              </h1>
              
              <h2 className="font-montserrat text-xl text-gold mb-4">
                {watch.brand}
              </h2>
              
              <p className="font-playfair text-2xl text-Rolex-black font-semibold mb-6">
                {formattedPrice}
              </p>
              
              <div className="mb-6">
                <h3 className="font-montserrat font-semibold text-Rolex-charcoal mb-3">Description</h3>
                <p className="text-Rolex-charcoal/80">
                  The {watch.brand} {watch.name} is a masterpiece of horological craftsmanship. 
                  This exquisite timepiece combines elegant design with precision engineering, 
                  making it perfect for {watch.category === "Rolex" ? "formal occasions" : 
                                         watch.category === "Omega" ? "active lifestyles" : 
                                         watch.category === "AP" ? "everyday wear" : 
                                         "tech enthusiasts"}.
                </p>
              </div>
              
              {/* Product Specifications */}
              <div className="mb-6">
                <h3 className="font-montserrat font-semibold text-Rolex-charcoal mb-3">Specifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-sm">
                    <p className="text-Rolex-charcoal/60">Category</p>
                    <p className="font-medium">{watch.category}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-Rolex-charcoal/60">Movement</p>
                    <p className="font-medium">{randomSpecs.movement}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-Rolex-charcoal/60">Case Diameter</p>
                    <p className="font-medium">{randomSpecs.caseDiameter}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-Rolex-charcoal/60">Water Resistance</p>
                    <p className="font-medium">{randomSpecs.waterResistance}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-Rolex-charcoal/60">Case Material</p>
                    <p className="font-medium">{randomSpecs.material}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-Rolex-charcoal/60">Strap Material</p>
                    <p className="font-medium">{randomSpecs.strapMaterial}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-Rolex-charcoal/60">Crystal</p>
                    <p className="font-medium">{randomSpecs.crystalType}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-Rolex-charcoal/60">Power Reserve</p>
                    <p className="font-medium">{randomSpecs.powerReserve}</p>
                  </div>
                </div>
                
                {randomSpecs.functions && (
                  <div className="mt-4 text-sm">
                    <p className="text-Rolex-charcoal/60">Functions</p>
                    <p className="font-medium">{randomSpecs.functions}</p>
                  </div>
                )}
              </div>
              
              {/* Contact and Share */}
              <div className="mt-8 space-y-4">
                <h3 className="font-montserrat font-semibold text-Rolex-charcoal mb-2">Interested in this timepiece?</h3>
                
                {/* WhatsApp Contact Button */}
                <a 
                  href={whatsappShareUrl}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full py-3 bg-[#25D366] text-white rounded-md hover:bg-[#22c55e] transition-colors"
                >
                  <Phone className="mr-2" size={18} />
                  Contact us on WhatsApp
                </a>
                
                {/* Share Options Dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      Share this watch
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Share this timepiece</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-3 gap-4 py-4">
                      <a 
                        href={facebookShareUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center p-4 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <Facebook className="text-[#3b5998] mb-2" size={24} />
                        <span className="text-sm">Facebook</span>
                      </a>
                      <a 
                        href={instagramProfile} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center p-4 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <Instagram className="text-[#e4405f] mb-2" size={24} />
                        <span className="text-sm">Instagram</span>
                      </a>
                      <a 
                        href={tiktokProfile} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center p-4 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <TikTokIcon className="text-black mb-2" size={24} />
                        <span className="text-sm">TikTok</span>
                      </a>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm text-gray-500">Or copy the link below:</p>
                      <div className="flex">
                        <input 
                          type="text" 
                          value={productUrl} 
                          readOnly
                          className="flex-1 p-2 text-sm border border-gray-200 rounded-l-md focus:outline-none"
                        />
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(productUrl);
                            toast({
                              title: "Link copied",
                              description: "The product link has been copied to your clipboard",
                            });
                          }}
                          className="rounded-l-none"
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                {/* Add to Cart Button - moved to this position as requested */}
                <Button 
                  onClick={handleAddToCart}
                  className="w-full bg-gold hover:bg-gold/90 text-white font-montserrat"
                >
                  <ShoppingCart className="mr-2" size={18} />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default WatchDetails;
