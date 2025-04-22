import { ProductForm } from "@/components/admin/ProductForm";
import { Navbar } from "@/components/Navbar";

export const NewProduct = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <ProductForm />
    </div>
  );
}; 