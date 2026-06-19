"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "../../lib/useCartStore";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);
  
  // Checkout States
  const [pinCode, setPinCode] = useState("");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", address: "" });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Hydration protection
  if (!isMounted) return <div className="min-h-screen bg-black pt-32 px-6 text-white text-center">Loading cart...</div>;

  // Calculations
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const discount = subtotal > 500 ? 50 : 0; // Example: $50 off orders over $500
  const finalTotal = subtotal + deliveryFee - discount;

  // Mock Delivery Calculator (checks for a 6 digit PIN)
  const calculateDelivery = () => {
    if (pinCode.length >= 5) {
      setDeliveryFee(15); // Flat $15 fee for valid looking PIN
    } else {
      alert("Please enter a valid PIN/Zip code");
    }
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address || !formData.phone) {
      alert("Please fill in all shipping details before payment.");
      return;
    }
    console.log("Proceeding to payment gateway with data:", { cart, finalTotal, formData });
    // Future step: Redirect to Stripe / Razorpay here
    alert("Redirecting to secure payment gateway...");
  };

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

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* LEFT COLUMN: Cart Items */}
        <div className="lg:col-span-7 space-y-6">
          <h1 className="text-xl tracking-[0.3em] font-light border-b border-white/10 pb-6 mb-8">SHOPPING BAG</h1>
          
          {cart.map((item) => (
            <div key={item.id} className="flex gap-6 bg-white/[0.02] border border-white/5 p-4 items-center">
              {/* Product Image */}
              <div className="w-24 h-32 bg-neutral-900 flex-shrink-0">
                {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />}
              </div>
              
              {/* Product Details */}
              <div className="flex-1 flex flex-col justify-between h-full py-2">
                <div>
                  <h3 className="text-sm tracking-[0.2em]">{item.name}</h3>
                  <p className="text-[10px] uppercase tracking-widest text-amber-500/70 mt-1">{item.note}</p>
                </div>
                <div className="text-xs tracking-wider text-neutral-400">${item.price}</div>
              </div>

              {/* Quantity Controls & Remove */}
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
            
            <div className="space-y-4 text-xs tracking-widest text-neutral-300 font-light mb-8">
              <div className="flex justify-between"><span>SUBTOTAL</span><span>${subtotal}</span></div>
              {discount > 0 && <div className="flex justify-between text-amber-500"><span>DISCOUNT</span><span>-${discount}</span></div>}
              <div className="flex justify-between">
                <span>SHIPPING</span>
                <span>{deliveryFee === 0 ? "Pending" : `$${deliveryFee}`}</span>
              </div>
            </div>

            {/* Delivery Calculator */}
            <div className="mb-8 border-t border-white/10 pt-6">
              <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-3">Calculate Delivery</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter PIN / Zip Code" 
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="flex-1 bg-transparent border-b border-white/20 focus:border-amber-500 outline-none px-2 py-2 text-xs tracking-widest"
                />
                <button onClick={calculateDelivery} className="text-[10px] border border-white/20 px-4 uppercase hover:bg-white hover:text-black transition-colors">
                  Apply
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm tracking-[0.2em] font-medium border-t border-white/10 pt-6 mb-8">
              <span>TOTAL</span>
              <span>${finalTotal}</span>
            </div>

            {/* Checkout Form */}
            <form onSubmit={handleCheckout} className="space-y-6">
              <h2 className="text-[10px] tracking-[0.3em] text-neutral-500 border-b border-white/10 pb-2 mb-4">SHIPPING DETAILS</h2>
              <input type="text" placeholder="FULL NAME" required onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-transparent border-b border-white/20 focus:border-amber-500 outline-none px-2 py-3 text-xs tracking-widest placeholder:text-neutral-700 transition-colors" />
              <input type="email" placeholder="EMAIL ADDRESS" required onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-transparent border-b border-white/20 focus:border-amber-500 outline-none px-2 py-3 text-xs tracking-widest placeholder:text-neutral-700 transition-colors" />
              <input type="tel" placeholder="PHONE NUMBER" required onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-transparent border-b border-white/20 focus:border-amber-500 outline-none px-2 py-3 text-xs tracking-widest placeholder:text-neutral-700 transition-colors" />
              <textarea placeholder="FULL SHIPPING ADDRESS" required rows={2} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-transparent border-b border-white/20 focus:border-amber-500 outline-none px-2 py-3 text-xs tracking-widest placeholder:text-neutral-700 transition-colors resize-none"></textarea>
              
              <button type="submit" className="w-full bg-white text-black py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-amber-500 hover:text-white transition-all duration-300">
                Proceed to Payment
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}