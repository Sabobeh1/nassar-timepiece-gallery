import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroBanner from "@/components/HeroBanner";
import { useCategories } from "@/hooks/useCategories";

const Index = () => {
  const navigate = useNavigate();
  const { categories, loading } = useCategories();
  
  // Set page title
  useEffect(() => {
    document.title = "Nassar Watches | Rolex Timepieces";
  }, []);

  // Handler for category navigation
  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    navigate(`/category/${categoryId}`, { state: { category: categoryName } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-Rolex-cream">
        <Navbar />
        <main className="flex-grow">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category) => (
                <div key={category.id} className="relative group overflow-hidden rounded-lg shadow-sm">
                  <img 
                    src={category.image_url || "https://via.placeholder.com/800x600?text=No+Image"} 
                    alt={category.name} 
                    className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                    <h3 className="text-2xl font-playfair font-bold text-white mb-2">{category.name}</h3>
                    <p className="text-sm text-gray-200 mb-4 line-clamp-2">{category.description}</p>
                    <button 
                      onClick={() => handleCategoryClick(category.id, category.name)}
                      className="inline-block bg-gold/80 hover:bg-gold text-white py-2 px-4 rounded text-sm font-montserrat transition-colors"
                    >
                      Explore Collection
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
