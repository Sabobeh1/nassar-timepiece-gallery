
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, Package, Users, Settings, ShoppingCart } from "lucide-react";

export default function AdminDashboard() {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  const adminCards = [
    {
      title: "Product Management",
      description: "Add, edit or remove watches from your inventory",
      icon: Package,
      action: () => console.log("Product management clicked"),
    },
    {
      title: "User Management",
      description: "Manage user accounts and permissions",
      icon: Users,
      action: () => console.log("User management clicked"),
    },
    {
      title: "Order Management",
      description: "View and process customer orders",
      icon: ShoppingCart,
      action: () => console.log("Order management clicked"),
    },
    {
      title: "Site Settings",
      description: "Configure website settings and appearance",
      icon: Settings,
      action: () => console.log("Site settings clicked"),
    },
  ];

  return (
    <div className="min-h-screen bg-Rolex-cream">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-playfair text-Rolex-black">Admin Dashboard</h1>
            <p className="text-Rolex-charcoal mt-2">Welcome back, {user?.email}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-Rolex-charcoal">Admin Status: Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminCards.map((card, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-playfair text-Rolex-black">{card.title}</CardTitle>
                  <card.icon className="h-6 w-6 text-gold" />
                </div>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-2">
                <Button 
                  onClick={card.action} 
                  className="w-full bg-gold hover:bg-gold-dark text-white"
                >
                  Manage
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-playfair text-Rolex-black mb-4">Quick Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Products</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gold">243</p>
                <p className="text-sm text-Rolex-charcoal">Total watches in inventory</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gold">1,205</p>
                <p className="text-sm text-Rolex-charcoal">Registered customers</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gold">$892,453</p>
                <p className="text-sm text-Rolex-charcoal">Total revenue this month</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
