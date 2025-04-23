import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WatchCard from "@/components/WatchCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type Product = Database['public']['Tables']['products']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (categoryId) {
      fetchCategoryAndProducts();
    }
  }, [categoryId]);

  const fetchCategoryAndProducts = async () => {
    try {
      setLoading(true);
      
      // Fetch category
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single();

      if (categoryError) throw categoryError;
      if (!categoryData) {
        throw new Error('Category not found');
      }
      setCategory(categoryData);

      // Fetch products with their images
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      
      // Ensure products have valid image arrays and format price
      const validProducts = (productsData || []).map(product => ({
        ...product,
        images: Array.isArray(product.images) ? product.images : [],
        price: Number(product.price)
      }));
      
      setProducts(validProducts);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load category data');
      navigate('/collections');
    } finally {
      setLoading(false);
    }
  };
  
  // Search function
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      fetchCategoryAndProducts();
      return;
    }
    
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase())
    );
    setProducts(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-luxuryy-cream">
        <Navbar />
        <main className="flex-grow py-8">
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

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col bg-luxuryy-cream">
        <Navbar />
        <main className="flex-grow py-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-16">
              <h1 className="text-2xl font-bold text-Rolex-black mb-4">Category Not Found</h1>
              <p className="text-Rolex-charcoal/80 mb-6">The collection you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => navigate('/collections')}>Return to Collections</Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-luxuryy-cream">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          {/* Back button */}
          <Button 
            onClick={() => navigate("/collections")} 
            variant="outline" 
            className="mb-6 text-Rolex-black hover:text-gold"
          >
            <ArrowLeft className="mr-2" size={16} />
            Back to Collections
          </Button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <h1 className="text-3xl md:text-4xl font-playfair font-bold text-Rolex-black mb-4 md:mb-0">
              <span className="text-gold">{category.name}</span> Collection
            </h1>
            
            {/* Search Input */}
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search watches..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full md:w-64 border border-gray-200 rounded-md focus:border-gold focus:ring-gold focus:ring-1 focus:outline-none"
              />
            </div>
          </div>
          
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-Rolex-charcoal text-lg mb-4">No watches found in this collection</p>
              <Button 
                onClick={() => navigate('/collections')}
                variant="outline"
                className="border-gold text-gold hover:bg-gold/10"
              >
                Return to Collections
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <WatchCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  brand={category.name}
                  price={product.price}
                  images={product.images}
                  category={category.name}
                  isNew={product.is_featured}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CategoryPage;
