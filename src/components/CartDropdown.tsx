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

  // Handle overflow based on screen height with improved calculations for desktop
  useEffect(() => {
    const updateMaxHeight = () => {
      if (cartRef.current) {
        const windowHeight = window.innerHeight;
        const topOffset = cartRef.current.getBoundingClientRect().top;
        const footerHeight = 165; // Approximate height of the footer section
        const padding = window.innerWidth >= 1024 ? 40 : 20; // More padding on desktop
        const maxHeight = windowHeight - topOffset - padding;
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
      <div className="p-6 w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
        <div className="flex flex-col items-center justify-center py-12">
          <ShoppingBag className="w-16 h-16 lg:w-20 lg:h-20 text-gray-300 mb-4" />
          <p className="text-lg text-gray-500 font-montserrat">Your cart is empty</p>
          <Link to="/" className="mt-6">
            <Button 
              variant="outline" 
              className="border-gold text-gold hover:bg-gold/10 px-8 py-2 text-base"
            >
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-[380px] max-w-4xl mx-auto bg-white rounded-lg shadow-lg" ref={cartRef}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white p-4 lg:p-6 border-b flex justify-between items-center">
        <h3 className="font-playfair font-semibold text-lg lg:text-xl">
          Your Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
        </h3>
      </div>

      {/* Cart Items - Scrollable Area */}
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        <div className="p-4 lg:p-6">
          <ul className="space-y-6">
            {cart.map((item) => (
              <li key={item.id} className="flex py-4 border-b last:border-0 hover:bg-gray-50/50 rounded-lg transition-colors">
                {/* Product Image - Larger on desktop */}
                <div className="h-24 w-24 lg:h-32 lg:w-32 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover object-center"
                  />
                </div>

                {/* Product Details - More spacious layout on desktop */}
                <div className="ml-4 lg:ml-6 flex flex-1 flex-col">
                  <div className="flex justify-between text-base lg:text-lg font-medium text-Rolex-black">
                    <Link to={`/watch/${item.id}`} className="truncate max-w-xs lg:max-w-md">
                      <h3 className="font-playfair hover:text-gold transition-colors">
                        {item.name}
                      </h3>
                    </Link>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500 ml-2 p-1"
                      aria-label="Remove item"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <p className="mt-1 text-sm lg:text-base text-gray-500">{item.brand}</p>
                  
                  {/* Quantity and Price - Better aligned on desktop */}
                  <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div className="flex items-center border rounded mb-3 sm:mb-0">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="p-2 hover:bg-gray-100 disabled:opacity-50"
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-4 min-w-10 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-100"
                        aria-label="Increase quantity"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <p className="font-semibold text-right text-lg lg:text-xl">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'ILS',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(item.price)}
                    </p>
                  </div>
                  
                  {/* Ask Question Button - More prominent on desktop */}
                  <button
                    onClick={() => handleAskQuestion(item.id, item.name)}
                    className="flex items-center text-sm text-gold hover:underline mt-3 transition-colors hover:text-amber-600"
                  >
                    <MessageCircle size={16} className="mr-2" />
                    Ask a question about this product
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Checkout Section - Fixed at Bottom, better layout for desktop */}
      <div className="sticky bottom-0 bg-white p-4 lg:p-6 border-t shadow-inner">
        <div className="space-y-4">
          <div className="flex justify-between font-medium text-base lg:text-lg">
            <p>Subtotal</p>
            <p className="font-semibold">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'ILS',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(totalPrice)}
            </p>
          </div>
          
          {/* Action Buttons - Stacked vertically */}
          <div className="flex flex-col space-y-3">
            <Link to="/checkout">
              <Button
                className="w-full bg-gold hover:bg-gold/90 text-white flex items-center justify-center h-12 text-base"
              >
                <span>Proceed to Checkout</span>
              </Button>
            </Link>
            <Button
              className="w-full bg-[#25D366] hover:bg-[#22c55e] text-white flex items-center justify-center h-12 text-base"
              onClick={handleWhatsappCheckout}
            >
              <Phone size={18} className="mr-2" />
              <span>Order via WhatsApp</span>
            </Button>
            <Link to="/">
              <Button
                variant="outline"
                className="w-full border-gold text-gold hover:bg-gold/10 h-12 text-base"
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