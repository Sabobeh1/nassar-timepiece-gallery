import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Facebook, Instagram, ArrowLeft, Phone, ShoppingCart, Heart } from "lucide-react";
import TikTokIcon from "@/components/icons/TikTokIcon";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/ui/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface Product {
  id: string;
  name: string;
  brand?: string;
  price: number;
  description?: string;
  image_urls: string[];
  is_featured?: boolean;
  category_id: string;
  category?: {
    name: string;
  };
}

const WatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Fetch product data from Supabase
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        
        // Query products with category join
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(name)
          `)
          .eq('id', id)
          .single();
          
        if (error) {
          console.error("Error fetching product:", error);
          setError("Failed to load product details");
          return;
        }
        
        if (!data) {
          setError("Product not found");
          return;
        }
        
        // Transform data to match our Product interface
        const productData: Product = {
          ...data,
          brand: data.category?.name || "Nassar Watches",
          image_urls: Array.isArray(data.image_urls) ? data.image_urls : [],
        };
        
        setProduct(productData);
        document.title = `${productData.name} | Nassar Watches`;
        
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProductData();
    }
  }, [id]);

  // Handle back button
  const handleBack = () => {
    navigate(-1);
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      id: product.id,
      name: product.name,
      brand: product.brand || product.category?.name || "Nassar Watches",
      price: product.price,
      image: product.image_urls[0] || "/placeholder-watch.jpg",
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  // Format price with currency
  const formattedPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Generate product URL for sharing
  const productUrl = `${window.location.origin}/watch/${id}`;
  
  // Social media share messages
  const shareMessage = product 
    ? `Check out this ${product.brand} ${product.name} watch for ${formattedPrice(product.price)} at Nassar Watches!` 
    : "Check out this luxury watch at Nassar Watches!";
    
  const facebookShareUrl = `https://www.facebook.com/profile.php?id=61555817681896&message=${encodeURIComponent(shareMessage)} ${encodeURIComponent(productUrl)}`;
  const instagramProfile = "https://www.instagram.com/nassar_watches99/";
  const tiktokProfile = "https://www.tiktok.com/@nassar.watches";
  
  // WhatsApp messages
  const whatsappShareUrl = product 
    ? `https://wa.me/970593484819?text=${encodeURIComponent(`I'm interested in the ${product.name} watch priced at ${formattedPrice(product.price)}. Product link: ${productUrl}`)}`
    : `https://wa.me/970593484819?text=${encodeURIComponent("I'm interested in a watch from your collection. Please provide more information.")}`;

  // Random product details - used for display purposes until real specs are added
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-Rolex-cream">
        <Navbar />
        <main className="flex-grow py-8">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse text-2xl text-gold font-playfair">Loading...</div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-Rolex-cream">
        <Navbar />
        <main className="flex-grow py-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-16">
              <h1 className="text-2xl font-bold text-Rolex-black mb-4">
                {error || "Product Not Found"}
              </h1>
              <p className="text-Rolex-charcoal/80 mb-6">
                We couldn't find the watch you're looking for.
              </p>
              <Button onClick={handleBack} variant="outline">
                <ArrowLeft className="mr-2" size={16} />
                Back to Collection
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-Rolex-cream">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          {/* Back button */}
          <Button 
            onClick={handleBack} 
            variant="outline" 
            className="mb-6 text-Rolex-black hover:text-gold"
          >
            <ArrowLeft className="mr-2" size={16} />
            Back
          </Button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Product Images */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              {/* Main Image Display */}
              <div className="mb-4 aspect-square overflow-hidden rounded-md bg-white border border-gray-200">
                <img 
                  src={product.image_urls[selectedImageIndex] || "/placeholder-watch.jpg"} 
                  alt={product.name}
                  className="w-full h-full object-contain transition-all duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder-watch.jpg";
                  }}
                />
              </div>
              
              {/* Thumbnails */}
              {product.image_urls.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {product.image_urls.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative flex-shrink-0 w-16 h-16 border rounded-md overflow-hidden
                        ${selectedImageIndex === index 
                          ? "border-gold ring-1 ring-gold" 
                          : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <img 
                        src={image} 
                        alt={`${product.name} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder-watch.jpg";
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Product Information */}
            <div className="bg-white p-8 rounded-lg shadow-md flex flex-col">
              <div className="mb-auto">
                <div className="flex justify-between items-start">
                  <div>
                    {product.is_featured && (
                      <div className="inline-block bg-gold text-white text-xs font-bold px-2 py-1 rounded mb-4">
                        FEATURED
                      </div>
                    )}
                    
                    <h1 className="font-playfair text-3xl md:text-4xl font-bold text-Rolex-black mb-2">
                      {product.name}
                    </h1>
                    
                    <h2 className="font-montserrat text-xl text-gold mb-4">
                      {product.brand || product.category?.name || "Nassar Watches"}
                    </h2>
                  </div>
                  
                  <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gold">
                    <Heart size={24} />
                  </Button>
                </div>
                
                <p className="font-playfair text-3xl text-Rolex-black font-semibold mb-6">
                  {formattedPrice(product.price)}
                </p>
                
                <div className="mb-8">
                  <h3 className="font-montserrat font-semibold text-Rolex-charcoal mb-3">Description</h3>
                  <p className="text-Rolex-charcoal/80 leading-relaxed">
                    {product.description || 
                      `The ${product.name} is a masterpiece of horological craftsmanship. 
                      This exquisite timepiece combines elegant design with precision engineering, 
                      making it perfect for any occasion.`}
                  </p>
                </div>
                
                {/* Product Specifications */}
                <div className="mb-8">
                  <h3 className="font-montserrat font-semibold text-Rolex-charcoal mb-3">Specifications</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-sm">
                      <p className="text-Rolex-charcoal/60">Category</p>
                      <p className="font-medium">{product.brand || product.category?.name || "Luxury"}</p>
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
              </div>
              
              {/* Purchase Actions */}
              <div className="space-y-4 mt-4 pt-4 border-t border-gray-200">
                {/* Add to Cart Button */}
                <Button 
                  onClick={handleAddToCart}
                  className="w-full bg-gold hover:bg-gold/90 text-white font-montserrat py-3 h-auto"
                >
                  <ShoppingCart className="mr-2" size={18} />
                  Add to Cart
                </Button>
                
                {/* Contact Buttons */}
                <h3 className="font-montserrat font-semibold text-Rolex-charcoal mt-4 mb-2">Interested in this timepiece?</h3>
                
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
