"use client";

import { useCartStore } from "../lib/useCartStore";

// 1. Define strict types for the incoming product data.
// Permitting 'null' ensures seamless compatibility with Prisma's default return types.
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
  // 2. Isolate the addToCart action to prevent the button from re-rendering 
  // whenever other cart states (like totalItems) change.
  const addToCart = useCartStore((state) => state.addToCart);

  // 3. Handle the click event with precise React MouseEvent typing.
  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevents layout shifts or bubbling if nested inside a Link tag
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      // 4. Safely convert database null values to undefined to satisfy the Zustand store interface.
      imageUrl: product.imageUrl ?? undefined,
      note: product.note ?? undefined,
    });
  };

  // 5. Render the button using Tailwind CSS, maintaining the minimalist Nova Fragrance aesthetic.
  return (
    <button 
      onClick={handleAddToCart}
      aria-label={`Add ${product.name} to cart`}
      className="w-full mt-5 py-3 border border-white/20 bg-transparent text-white hover:bg-white hover:text-black transition-all duration-300 text-[10px] uppercase tracking-[0.2em] font-medium focus:outline-none focus:ring-1 focus:ring-white/50"
    >
      Add To Cart
    </button>
  );
}