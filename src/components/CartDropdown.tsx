import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, MessageCircle, ShoppingBag, X, Phone } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const CartDropdown = () => {
  const { cart, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();
  const { toast } = useToast();
  const cartRef = useRef(null);

  // Handle overflow based on screen height
  useEffect(() => {
    const updateMaxHeight = () => {
      if (cartRef.current) {
        const windowHeight = window.innerHeight;
        const topOffset = cartRef.current.getBoundingClientRect().top;
        const footerHeight = 165; // Approximate height of the footer section
        const maxHeight = windowHeight - topOffset - 20;
        cartRef.current.style.maxHeight = `${maxHeight}px`;
      }
    };

    updateMaxHeight();
    window.addEventListener('resize', updateMaxHeight);
    return () => window.removeEventListener('resize', updateMaxHeight);
  }, []);

  const handleAskQuestion = (productId, productName) => {
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
        currency: 'ILS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(item.price)} x ${item.quantity}\nProduct link: ${productUrl}\n\n`;
    });

    itemsList += `\nTotal: ${new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ILS',
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
          <Link to="/" className="mt-4">
            <Button 
              variant="outline" 
              className="border-gold text-gold hover:bg-gold/10"
            >
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md mx-auto bg-white rounded-md shadow-lg" ref={cartRef}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white p-3 border-b flex justify-between items-center">
        <h3 className="font-playfair font-semibold">
          Your Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
        </h3>
      </div>

      {/* Cart Items - Scrollable Area */}
      <div className="p-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
        <ul className="space-y-4">
          {cart.map((item) => (
            <li key={item.id} className="flex py-2 border-b last:border-0">
              {/* Product Image */}
              <div className="h-16 sm:h-20 w-16 sm:w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover object-center"
                />
              </div>

              {/* Product Details */}
              <div className="ml-4 flex flex-1 flex-col">
                <div className="flex justify-between text-base font-medium text-Rolex-black">
                  <Link to={`/watch/${item.id}`} className="truncate">
                    <h3 className="font-playfair hover:text-gold transition-colors">
                      {item.name}
                    </h3>
                  </Link>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-red-500 ml-2"
                    aria-label="Remove item"
                  >
                    <X size={16} />
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">{item.brand}</p>
                
                {/* Quantity and Price */}
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center border rounded">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="p-1.5 sm:px-2 sm:py-1 hover:bg-gray-100 disabled:opacity-50"
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-2 min-w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 sm:px-2 sm:py-1 hover:bg-gray-100"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <p className="font-semibold text-right">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'ILS',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(item.price)}
                  </p>
                </div>
                
                {/* Ask Question Button */}
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

      {/* Checkout Section - Fixed at Bottom */}
      <div className="sticky bottom-0 bg-white p-4 border-t">
        <div className="space-y-3">
          <div className="flex justify-between font-medium">
            <p>Subtotal</p>
            <p>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'ILS',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(totalPrice)}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Link to="/checkout" className="sm:col-start-1">
              <Button
                className="w-full bg-gold hover:bg-gold/90 text-white flex items-center justify-center h-10"
              >
                <span className="text-sm whitespace-nowrap">Checkout </span>
              </Button>
            </Link>
            <Button
              className="bg-[#25D366] hover:bg-[#22c55e] text-white flex items-center justify-center h-10"
              onClick={handleWhatsappCheckout}
            >
              <Phone size={16} className="mr-2" />
              <span className="text-sm whitespace-nowrap">Order via WhatsApp</span>
            </Button>
            <Link to="/" className="sm:col-start-2">
              <Button
                variant="outline"
                className="w-full border-gold text-gold hover:bg-gold/10 h-10"
              >
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDropdown;