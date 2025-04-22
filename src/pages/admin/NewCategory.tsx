import { CategoryForm } from "@/components/admin/CategoryForm";
import { Navbar } from "@/components/Navbar";

export const NewCategory = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <CategoryForm />
    </div>
  );
}; 