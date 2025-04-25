
import { useNavigate } from 'react-router-dom';
import { Navbar } from "@/components/Navbar";
import ProductForm from "@/components/ProductForm";

export const NewProduct = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Add New Product</h1>
        <ProductForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
};
