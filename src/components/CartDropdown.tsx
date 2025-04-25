import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, MessageCircle, ShoppingBag, X, Phone } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const CartDropdown = () => {
  const { cart, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();
  const { toast } = useToast();

  const handleAskQuestion = (productId: string, productName: string) => {
    const productUrl = `${window.location.origin}/watch/${productId}`;
    const whatsappUrl = `https://wa.me/970593484819?text=I have a question about the ${productName} watch. Product link: ${productUrl}`;
    window.open(whatsappUrl, '_blank');
    toast({
      title: "Question about product",
      description: `Opening WhatsApp to ask about ${productName}`,
      duration: 3000
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
      duration: 3000
    });
  };

  if (cart.length === 0) {
    return (
      <div className="p-4 w-full max-w-md mx-auto">
        <div className="flex flex-col items-center justify-center py-8">
          <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mb-2" />
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

  return (
    <div className="relative p-3 w-full max-w-md mx-auto h-[calc(100vh-4rem)] sm:h-auto overflow-hidden flex flex-col">
      <h3 className="font-playfair font-semibold mb-4 pb-2 border-b">
        Your Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
      </h3>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-4 pb-32 sm:pb-24">
          {cart.map((item) => (
            <li key={item.id} className="flex py-2 border-b">
              <div className="h-16 sm:h-20 w-16 sm:w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover object-center"
                />
              </div>

              <div className="ml-4 flex flex-1 flex-col min-w-0">
                <div className="flex justify-between text-base font-medium text-Rolex-black">
                  <Link to={`/watch/${item.id}`} className="truncate">
                    <h3 className="font-playfair hover:text-gold transition-colors">
                      {item.name}
                    </h3>
                  </Link>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-red-500 ml-2"
                  >
                    <X size={16} />
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">{item.brand}</p>
                <div className="flex items-center justify-between text-sm mt-2 flex-wrap gap-2">
                  <div className="flex items-center border rounded">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 sm:px-2 sm:py-1 hover:bg-gray-100"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-2">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 sm:px-2 sm:py-1 hover:bg-gray-100"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <p className="font-semibold text-right">
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
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-white pt-4 pb-3 px-3 shadow-lg">
        <div className="space-y-2">
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
          <Button
            className="w-full bg-[#25D366] hover:bg-[#22c55e] text-white flex items-center justify-center h-12 sm:h-10"
            onClick={handleWhatsappCheckout}
          >
            <Phone size={18} className="mr-2" />
            <span className="text-sm sm:text-base">Contact us on WhatsApp</span>
          </Button>
          <Link to="/">
            <Button
              variant="outline"
              className="w-full border-gold text-gold hover:bg-gold/10 h-12 sm:h-10"
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
