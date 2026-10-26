"use client"; 

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useCartStore, CartItem } from "../../lib/useCartStore"; 

// 1. Declare the Razorpay window interface to eliminate TypeScript 'any' errors
declare global {
  interface Window {
    Razorpay: any;
  }
}

// 2. Define flexible business logic configurations
const DISCOUNT_CONFIG = {
  type: 'PERCENTAGE' as const, 
  value: 10,                          
  minOrderValue: 500,                 
};

const DELIVERY_CONFIG = {
  flatRate: 49,
  freeShippingThreshold: 499,
};

// 3. Dynamically load the Razorpay checkout script only when needed
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCartStore();
  
  // State management
  const [isMounted, setIsMounted] = useState(false); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    phone: "+91", 
    address: "",
    pinCode: ""
  });

  // 4. Prevent Next.js hydration mismatch errors by waiting for client mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 5. Memoize financial calculations to prevent unnecessary recalculations on re-renders
  const subtotal = useMemo(() => {
    return cart.reduce((total: number, item: CartItem) => total + item.price * item.quantity, 0);
  }, [cart]);

  const deliveryFee = useMemo(() => {
    if (subtotal === 0) return 0; 
    return subtotal >= DELIVERY_CONFIG.freeShippingThreshold ? 0 : DELIVERY_CONFIG.flatRate;
  }, [subtotal]);

  const discount = useMemo(() => {
    if (DISCOUNT_CONFIG.type === 'NONE' || subtotal < DISCOUNT_CONFIG.minOrderValue) return 0;
    if (DISCOUNT_CONFIG.type === 'FLAT') return Math.min(DISCOUNT_CONFIG.value, subtotal); 
    if (DISCOUNT_CONFIG.type === 'PERCENTAGE') return (subtotal * DISCOUNT_CONFIG.value) / 100;
    return 0;
  }, [subtotal]);

  const finalTotal = useMemo(() => subtotal + deliveryFee - discount, [subtotal, deliveryFee, discount]);

  // 6. Handle form validation and Razorpay checkout initialization
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault(); 

    // Strict frontend validation
    if (!formData.name || formData.name.length > 70) {
      alert("Name is required and must be under 70 characters.");
      return;
    }

    const emailRegex = /^[^\s@]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    const sanitizedPhone = formData.phone.replace(/\s+/g, ''); 
    const phoneRegex = /^\+\d{1,3}\d{10}$/; 
    if (!phoneRegex.test(sanitizedPhone)) {
      alert("Phone must start with a country code (e.g., +91) followed by exactly 10 digits.");
      return;
    }

    if (!formData.address || formData.address.length > 150) {
      alert("Address is required and must be under 150 characters.");
      return;
    }

    if (!/^\d{6}$/.test(formData.pinCode)) {
      alert("PIN code must be exactly 6 digits.");
      return;
    }

    setIsProcessing(true);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) throw new Error("Razorpay SDK failed to load. Check your network.");

      // 7. Request an order ID from the backend API
      const orderRes = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalTotal }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Failed to initialize order");

      // 8. Configure the Razorpay payment modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount, 
        currency: orderData.currency,
        name: 'Nova Fragrance',
        description: 'Premium Perfume Order',
        order_id: orderData.id,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: sanitizedPhone, 
        },
        // 9. Handle the successful payment response and verify securely on the backend
        handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; }) {
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderDetails: {
                  items: cart,
                  totalAmount: finalTotal,
                  customer: {
                    ...formData,
                    phone: sanitizedPhone
                  },
                },
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              clearCart?.(); 
              alert('Order placed successfully!');
              window.location.href = '/'; 
            } else {
              throw new Error('Payment verification failed.');
            }
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Verification encountered an error.';
            alert(errorMsg);
          } finally {
            setIsProcessing(false); 
          }
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        },
        theme: { color: '#000000' },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error(err);
      const errorMsg = err instanceof Error ? err.message : 'Checkout failed';
      alert(errorMsg);
      setIsProcessing(false); 
    }
  };

  // 10. Handle loading state prior to client hydration
  if (!isMounted) return <div className="min-h-screen bg-black pt-32 px-6 text-white text-center">Loading cart...</div>;

  // 11. Render Empty Cart State
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-black pt-40 flex flex-col items-center text-white">
        <h1 className="text-2xl tracking-[0.3em] font-light mb-6">YOUR CART IS EMPTY</h1>
        <Link href="/" className="px-8 py-3 border border-white/20 hover:bg-white hover:text-black transition-colors text-[10px] uppercase tracking-widest">
          Return to Store
        </Link>
      </div>
    );
  }

  // 12. Render the populated cart and checkout form
  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* LEFT COLUMN: Cart Items */}
        <div className="lg:col-span-7 space-y-6">
          <h1 className="text-xl tracking-[0.3em] font-light border-b border-white/10 pb-6 mb-8">SHOPPING BAG</h1>
          
          {cart.map((item: CartItem) => (
            <div key={item.id} className="flex gap-6 bg-white/[0.02] border border-white/5 p-4 items-center">
              <div className="w-24 h-32 bg-neutral-900 flex-shrink-0">
                {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />}
              </div>
              
              <div className="flex-1 flex flex-col justify-between h-full py-2">
                <div>
                  <h3 className="text-sm tracking-[0.2em]">{item.name}</h3>
                  <p className="text-[10px] uppercase tracking-widest text-amber-500/70 mt-1">{item.note}</p>
                </div>
                <div className="text-xs tracking-wider text-neutral-400">₹{item.price}</div>
              </div>

              <div className="flex flex-col items-end justify-between h-full py-2 space-y-6">
                <button onClick={() => removeFromCart(item.id)} className="text-[10px] text-neutral-500 hover:text-red-500 uppercase tracking-widest transition-colors">
                  Remove
                </button>
                <div className="flex items-center gap-4 border border-white/20 px-3 py-1">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-neutral-400 hover:text-white">-</button>
                  <span className="text-xs">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-neutral-400 hover:text-white">+</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT COLUMN: Summary & Checkout */}
        <div className="lg:col-span-5">
          <div className="bg-white/[0.02] border border-white/5 backdrop-blur-md p-8 sticky top-32">
            <h2 className="text-sm tracking-[0.3em] font-light border-b border-white/10 pb-4 mb-6">ORDER SUMMARY</h2>
            
            <div className="space-y-4 text-xs tracking-widest text-neutral-300 font-light mb-8 border-b border-white/10 pb-6">
              <div className="flex justify-between"><span>SUBTOTAL</span><span>₹{subtotal}</span></div>
              
              {discount > 0 && (
                <div className="flex justify-between text-amber-500">
                  <span>DISCOUNT {DISCOUNT_CONFIG.type === 'PERCENTAGE' && `(${DISCOUNT_CONFIG.value}%)`}</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span>SHIPPING</span>
                <span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm tracking-[0.2em] font-medium mb-8">
              <span>TOTAL</span>
              <span>₹{finalTotal}</span>
            </div>

            <form onSubmit={handleCheckout} className="space-y-6">
              <h2 className="text-[10px] tracking-[0.3em] text-neutral-500 border-b border-white/10 pb-2 mb-4">SHIPPING DETAILS</h2>
              
              <input 
                type="text" 
                placeholder="FULL NAME" 
                maxLength={70}
                required 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                className="w-full bg-transparent border-b border-white/20 focus:border-amber-500 outline-none px-2 py-3 text-xs tracking-widest placeholder:text-neutral-700 transition-colors" 
              />
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                className="w-full bg-transparent border-b border-white/20 focus:border-amber-500 outline-none px-2 py-3 text-xs tracking-widest placeholder:text-neutral-700 transition-colors" 
              />
              <input 
                type="tel" 
                placeholder="PHONE NUMBER (+91...)" 
                maxLength={13}
                required 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                className="w-full bg-transparent border-b border-white/20 focus:border-amber-500 outline-none px-2 py-3 text-xs tracking-widest placeholder:text-neutral-700 transition-colors" 
              />
              <input 
                type="text" 
                placeholder="6-DIGIT PIN CODE" 
                maxLength={6}
                required 
                value={formData.pinCode}
                onChange={(e) => setFormData({...formData, pinCode: e.target.value.replace(/\D/g, "")})} 
                className="w-full bg-transparent border-b border-white/20 focus:border-amber-500 outline-none px-2 py-3 text-xs tracking-widest placeholder:text-neutral-700 transition-colors" 
              />
              <textarea 
                placeholder="FULL SHIPPING ADDRESS" 
                maxLength={150}
                required 
                rows={2} 
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})} 
                className="w-full bg-transparent border-b border-white/20 focus:border-amber-500 outline-none px-2 py-3 text-xs tracking-widest placeholder:text-neutral-700 transition-colors resize-none"
              ></textarea>
              
              <button 
                type="submit" 
                disabled={isProcessing}
                className={`w-full py-4 text-[10px] uppercase tracking-[0.3em] font-bold transition-all duration-300 ${
                  isProcessing 
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' 
                    : 'bg-white text-black hover:bg-amber-500 hover:text-white'
                }`}
              >
                {isProcessing ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}