
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-Rolex-cream">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-playfair text-Rolex-black mb-6">Admin Dashboard</h1>
        <p className="text-Rolex-charcoal">Welcome to the admin dashboard. More features coming soon.</p>
      </div>
    </div>
  );
}
