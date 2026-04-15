import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { ArrowLeft } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signIn(email, password);
      toast({
        title: "Login successful",
        description: "You are now signed in as an admin",
      });
      navigate('/admin/dashboard');
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "Invalid credentials. Please try again.";
      
      if (error.message === "User is not an admin") {
        errorMessage = "This account does not have admin privileges.";
      } else if (error.message === "Invalid login credentials") {
        errorMessage = "Invalid email or password.";
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-Rolex-cream">
      <Navbar />
      <div className="container mx-auto px-4 pt-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-Rolex-charcoal hover:text-gold"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="w-full max-w-md mx-auto p-8 space-y-6 bg-white rounded-lg shadow-lg">
          <h1 className="text-3xl font-playfair text-center text-Rolex-black">Admin Login</h1>
          <p className="text-center text-Rolex-charcoal">Please enter your admin credentials to access the dashboard.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>
            
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-gold hover:bg-gold-dark"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
