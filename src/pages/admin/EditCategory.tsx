
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type Category = Database['public']['Tables']['categories']['Row'];

export const EditCategory = () => {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        if (!id) return;
        
        console.log("Fetching category with id:", id);
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching category:', error);
          throw error;
        }
        
        console.log("Category data fetched:", data);
        setCategory(data);
      } catch (error) {
        console.error('Error fetching category:', error);
        toast.error('Failed to load category data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCategory();
    }
  }, [id]);

  const handleSuccess = () => {
    navigate('/admin/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Category not found</h1>
            <p className="text-gray-600 mb-6">The category you are looking for does not exist or was removed.</p>
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="bg-gold hover:bg-gold/90 text-white py-2 px-6 rounded font-medium transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <CategoryForm initialData={category} onSuccess={handleSuccess} />
    </div>
  );
};
