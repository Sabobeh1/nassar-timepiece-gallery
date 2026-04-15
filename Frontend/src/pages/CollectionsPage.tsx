import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";

const CollectionsPage = () => {
  const navigate = useNavigate();
  const { categories, loading, error } = useCategories();
  
  useEffect(() => {
    document.title = "Collections | Nassar Watches";
  }, []);

  // Handler for category navigation
  const handleViewCollection = (categoryId: string, categoryName: string) => {
    navigate(`/collections/${categoryId}`, { state: { categoryName } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-Rolex-cream">
        <Navbar />
        <main className="flex-grow py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-Rolex-cream">
        <Navbar />
        <main className="flex-grow py-12">
          <div className="container mx-auto px-4">
            <div className="text-center py-16">
              <h1 className="text-2xl font-bold text-Rolex-black mb-4">Error Loading Collections</h1>
              <p className="text-Rolex-charcoal/80 mb-6">We encountered an error while loading the collections. Please try again later.</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-Rolex-cream">
        <Navbar />
        <main className="flex-grow py-12">
          <div className="container mx-auto px-4">
            <div className="text-center py-16">
              <h1 className="text-2xl font-bold text-Rolex-black mb-4">No Collections Available</h1>
              <p className="text-Rolex-charcoal/80 mb-6">We don't have any collections available at the moment. Please check back later.</p>
              <Button onClick={() => navigate('/')}>Return to Home</Button>
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
            {categories.map((category) => (
              <div 
                key={category.id} 
                className="bg-white rounded-lg overflow-hidden shadow-sm transition-transform duration-300 hover:scale-[1.02]"
              >
                <div className="relative h-64">
                  <img 
                    src={category.image_url || "/placeholder-category.jpg"} 
                    alt={category.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-3xl font-playfair font-bold text-white mb-2">
                      {category.name}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-gold font-montserrat font-medium">
                        {category.product_count} {category.product_count === 1 ? 'Watch' : 'Watches'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-Rolex-charcoal/80 mb-4">
                    {category.description || 'Explore our collection of exquisite timepieces.'}
                  </p>
                  <button 
                    onClick={() => handleViewCollection(category.id, category.name)}
                    className="inline-block bg-gold hover:bg-gold/90 text-white py-2 px-6 rounded font-montserrat transition-colors"
                  >
                    View Collection
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CollectionsPage;
