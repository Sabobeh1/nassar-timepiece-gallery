
import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, MessageCircle, ShoppingBag, X, Phone } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const CartDropdown = () => {
  const { cart, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();
  const { toast } = useToast();
  
  if (cart.length === 0) {
    return (
      <div className="p-4 min-w-[320px]">
        <div className="flex flex-col items-center justify-center py-8">
          <ShoppingBag className="w-16 h-16 text-gray-300 mb-2" />
          <p className="text-gray-500 font-montserrat">Your cart is empty</p>
          <Link 
            to="/" 
            className="mt-4 text-sm text-gold hover:underline"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }
  
  const handleAskQuestion = (productId: string, productName: string) => {
    const productUrl = `${window.location.origin}/watch/${productId}`;
    const whatsappUrl = `https://wa.me/970593484819?text=I have a question about the ${productName} watch. Product link: ${productUrl}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Question about product",
      description: `Opening WhatsApp to ask about ${productName}`,
    });
  };

  // Generate cart items list for WhatsApp message with product links
  const generateCartItemsList = () => {
    let itemsList = "I would like to purchase the following items:\n\n";
    cart.forEach((item, index) => {
      const productUrl = `${window.location.origin}/watch/${item.id}`;
      itemsList += `${index + 1}. ${item.brand} ${item.name} - ${new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(item.price)} x ${item.quantity}\nProduct link: ${productUrl}\n\n`;
    });
    
    itemsList += `\nTotal: ${new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(totalPrice)}`;
    
    return itemsList;
  };

  const handleWhatsappCheckout = () => {
    const whatsappUrl = `https://wa.me/970593484819?text=${encodeURIComponent(generateCartItemsList())}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Proceeding to WhatsApp",
      description: "Opening WhatsApp to complete your purchase",
    });
  };

  return (
    <div className="p-4 min-w-[320px] max-h-[70vh] overflow-auto">
      <h3 className="font-playfair font-semibold mb-4 pb-2 border-b">
        Your Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
      </h3>
      
      <ul className="space-y-4">
        {cart.map((item) => (
          <li key={item.id} className="flex py-2 border-b">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-cover object-center"
              />
            </div>
            
            <div className="ml-4 flex flex-1 flex-col">
              <div className="flex justify-between text-base font-medium text-Rolex-black">
                <Link to={`/watch/${item.id}`}>
                  <h3 className="font-playfair hover:text-gold transition-colors">
                    {item.name}
                  </h3>
                </Link>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">{item.brand}</p>
              
              <div className="flex items-center justify-between text-sm mt-2">
                <div className="flex items-center border rounded">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-2 py-1 hover:bg-gray-100"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-2">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-2 py-1 hover:bg-gray-100"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <p className="font-semibold">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(item.price)}
                </p>
              </div>
              
              <button
                onClick={() => handleAskQuestion(item.id, item.name)}
                className="flex items-center text-xs text-gold hover:underline mt-2"
              >
                <MessageCircle size={14} className="mr-1" />
                Ask a question
              </button>
            </div>
          </li>
        ))}
      </ul>
      
      <div className="mt-4 space-y-4">
        <div className="flex justify-between font-medium">
          <p>Subtotal</p>
          <p>
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(totalPrice)}
          </p>
        </div>
        
        <div className="space-y-2">
          <Button 
            className="w-full bg-[#25D366] hover:bg-[#22c55e] text-white flex items-center justify-center"
            onClick={handleWhatsappCheckout}
          >
            <Phone size={18} className="mr-2" />
            <span className="text-sm sm:text-base">Contact us on WhatsApp to checkout</span>
          </Button>
          
          <Link to="/">
            <Button 
              variant="outline" 
              className="w-full border-gold text-gold hover:bg-gold/10"
            >
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartDropdown;
