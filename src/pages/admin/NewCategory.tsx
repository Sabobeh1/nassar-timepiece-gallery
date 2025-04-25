
import { useNavigate } from 'react-router-dom';
import { Navbar } from "@/components/Navbar";
import { CategoryForm } from "@/components/admin/CategoryForm";

export const NewCategory = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <CategoryForm onSuccess={handleSuccess} />
    </div>
  );
};
