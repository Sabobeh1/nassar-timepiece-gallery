import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Order } from "@/types/order";
import { Navbar } from "@/components/Navbar";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    country: "",
    region: "",
    city: "",
    address: "",
    postalCode: "",
    notes: "",
  });

  // Calculate shipping fee based on selected region
  const getShippingFee = (region: string): number => {
    switch (region) {
      case "palestine": // الضفة الغربية
        return 20.00;
      case "jordan": // القدس
        return 30.00;
      case "saudi": // الأراضي المحتلة
        return 60.00;
      default:
        return 30.00; // Default shipping fee
    }
  };

  // Calculate current shipping fee based on selected region
  const shippingFee = useMemo(() => getShippingFee(formData.country), [formData.country]);
  
  // Calculate subtotal from cart
  const subtotal = useMemo(() => 
    cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    [cart]
  );
  
  // Calculate grand total with dynamic shipping fee
  const grandTotal = useMemo(() => subtotal + shippingFee, [subtotal, shippingFee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.phone || 
          !formData.country || !formData.region) {
        toast({
          title: "حقول ناقصة", 
          description: "يرجى ملء جميع الحقول المطلوبة",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Calculate shipping fee based on selected region
      const currentShippingFee = getShippingFee(formData.country);
      const total = subtotal + currentShippingFee;

      // Prepare order items - ensure it's in the correct format
      const orderItems = cart.map(item => ({
        product_id: item.id,
        name: item.name,
        price: parseFloat(item.price.toString()),
        quantity: parseInt(item.quantity.toString()),
        image_url: item.image
      }));

      // Prepare order data - remove user_id as it's not in the schema
      const orderData = {
        // The user_id field is causing the error, so we're removing it
        // If you need to track the user, check your schema for the correct column name
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        country: formData.country,
        region: formData.region,
        city: formData.city,
        address: formData.address,
        postal_code: formData.postalCode || null,
        notes: formData.notes || null,
        items: orderItems,
        shipping_fee: parseFloat(currentShippingFee.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        status: 'new'
      };

      console.log('Submitting order:', orderData);

      // Check the table structure first
      console.log('Checking orders table structure...');
      const { data: tableInfo, error: tableError } = await supabase
        .from('orders')
        .select('*')
        .limit(1);
        
      if (tableError) {
        console.error('Error checking table structure:', tableError);
      } else {
        console.log('Table structure seems valid');
      }
      
      // Log the exact data we're trying to insert
      console.log('Order data to insert:', JSON.stringify(orderData, null, 2));
      
      // Insert the order
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData]);

      if (error) {
        console.error('Supabase error details:', error);
        // More detailed error information
        console.error('Error code:', error.code);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        throw new Error(`Error submitting order: ${error.message}`);
      }

      console.log('Order submitted successfully:', data);

      toast({
        title: "تم إرسال طلبك بنجاح!",
        description: "سنقوم بالتواصل معك قريباً لتأكيد الطلب.",
      });

      clearCart();
      // Navigate to homepage with delay to let the user see the success message
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        title: "حدث خطأ",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء إرسال الطلب. الرجاء المحاولة لاحقاً.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Display the region names in Arabic for better UX
  const getRegionDisplayName = (region: string): string => {
    switch (region) {
      case "palestine":
        return "الضفة الغربية";
      case "jordan":
        return "القدس";
      case "saudi":
        return "الأراضي المحتلة";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-Rolex-cream" >
      <Navbar />
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="flex items-center mb-8 ">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-gold hover:text-gold/80  border-2 border-[#FFD700] bg-white"
          >
            <ArrowLeft className="mr-2" />
            العودة للسلة
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-playfair font-semibold text-Rolex-black mb-6">
              ملخص الطلب
            </h2>
            
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-Rolex-black">{item.name}</h3>
                    <p className="text-sm text-Rolex-charcoal">
                      {item.quantity} × {item.price} ₪
                    </p>
                  </div>
                  <p className="font-medium text-Rolex-black">
                    {(item.price * item.quantity).toFixed(2)} ₪
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-Rolex-charcoal/10">
              <div className="flex justify-between mb-2">
                <span className="text-Rolex-charcoal">المجموع الفرعي</span>
                <span className="text-Rolex-black">{subtotal.toFixed(2)} ₪</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-Rolex-charcoal">رسوم الشحن {formData.country ? `(${getRegionDisplayName(formData.country)})` : ""}</span>
                <span className="text-Rolex-black">{shippingFee.toFixed(2)} ₪</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span className="text-Rolex-black">الإجمالي</span>
                <span className="text-gold">{grandTotal.toFixed(2)} ₪</span>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-playfair font-semibold text-Rolex-black mb-6">
              معلومات التوصيل
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-Rolex-charcoal mb-1">
                    الاسم الأول
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full"
                    placeholder="أحمد"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-Rolex-charcoal mb-1">
                    الاسم الأخير
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full"
                    placeholder="محمد"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-Rolex-charcoal mb-1">
                  رقم الهاتف مع المقدمة
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full"
                  placeholder="+972 05* *** ****"
                />
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-Rolex-charcoal mb-1">
                  اختر المنطقة
                </label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر المنطقة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="palestine">الضفة الغربية (₪20)</SelectItem>
                    <SelectItem value="jordan">القدس (₪30)</SelectItem>
                    <SelectItem value="saudi">الأراضي المحتلة (₪60)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="region" className="block text-sm font-medium text-Rolex-charcoal mb-1">
                وصف الموقع (المدينة/البلدة/الشارع)     
                </label>
                <Input
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  required
                  className="w-full"
                  placeholder="طولكرم/عنبتا/شارع السكة بجانب المسجد"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold/90 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "جاري إرسال الطلب..." : "تأكيد الطلب"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;