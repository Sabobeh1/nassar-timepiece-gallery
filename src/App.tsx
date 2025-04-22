import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import Index from "./pages/Index";
import CategoryPage from "./pages/CategoryPage";
import CollectionsPage from "./pages/CollectionsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import NotFound from "./pages/NotFound";
import WatchDetails from "./pages/WatchDetails";
import AdminLogin from "./pages/AdminLogin";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { NewProduct } from "@/pages/admin/NewProduct";
import { EditProduct } from "@/pages/admin/EditProduct";
import { NewCategory } from "@/pages/admin/NewCategory";
import { EditCategory } from "@/pages/admin/EditCategory";

// Create a new QueryClient instance
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/Rolex" element={<CategoryPage />} />
              <Route path="/Ap" element={<CategoryPage />} />
              <Route path="/Omega" element={<CategoryPage />} />
              <Route path="/Patek" element={<CategoryPage />} />
              <Route path="/Breitling" element={<CategoryPage />} />
              <Route path="/collections" element={<CollectionsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/watch/:id" element={<WatchDetails />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="/admin/products/new" element={
                <ProtectedRoute>
                  <NewProduct />
                </ProtectedRoute>
              } />
              <Route path="/admin/products/:id/edit" element={
                <ProtectedRoute>
                  <EditProduct />
                </ProtectedRoute>
              } />
              <Route path="/admin/categories/new" element={
                <ProtectedRoute>
                  <NewCategory />
                </ProtectedRoute>
              } />
              <Route path="/admin/categories/:id/edit" element={
                <ProtectedRoute>
                  <EditCategory />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
