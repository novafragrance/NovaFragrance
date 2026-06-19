"use client";

import { useCartStore } from "../lib/useCartStore";

interface ProductProps {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string | null;
    note?: string | null;
  };
}

export default function AddToCartButton({ product }: ProductProps) {
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); 
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl || undefined,
      note: product.note || undefined,
    });
  };

  return (
    <button 
      onClick={handleAddToCart}
      className="w-full mt-5 py-3 border border-white/20 bg-transparent text-white hover:bg-white hover:text-black transition-all duration-300 text-[10px] uppercase tracking-[0.2em] font-medium"
    >
      Add To Cart
    </button>
  );
}