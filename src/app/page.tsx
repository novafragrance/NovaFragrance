import prisma from "../lib/prisma";
import AddToCartButton from "../components/AddToCartButton";

export default async function HomePage() {
  // Safely fetch exactly 4 products from the database
  const featuredProducts = await prisma.product.findMany({
    where: { isAvailable: true },
    take: 4,
  });

  return (
    <div className="min-h-screen bg-black text-white">
      
      {/* 1. THE HERO SECTION */}
      <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden px-4">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="text-center z-10 space-y-6 max-w-xl">
          <span className="text-[10px] uppercase tracking-[0.3em] text-amber-500 font-medium">
            Now Available Online
          </span>
          <h1 className="text-4xl sm:text-6xl font-light tracking-[0.2em] text-white">
            THE MONOLITH
          </h1>
          <p className="text-xs sm:text-sm font-light tracking-wide text-neutral-400 max-w-sm mx-auto leading-relaxed">
            An architectural approach to sensory design. Dark wood, crushed amber, smoked vetiver.
          </p>
          <div className="pt-4">
            <button className="px-8 py-3 rounded-full bg-white text-black font-semibold tracking-widest text-[10px] uppercase hover:bg-neutral-200 transition-all duration-300 shadow-xl">
              Explore Collection
            </button>
          </div>
        </div>
      </section>

      {/* 2. THE CURATED COLLECTION GRID */}
      <section className="w-full max-w-7xl mx-auto px-6 py-32 border-t border-white/5">
        <div className="flex items-center justify-between mb-16">
          <h2 className="text-sm font-light tracking-[0.3em] uppercase text-neutral-300">
            Featured Signatures
          </h2>
          <button className="text-[10px] uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">
            View All →
          </button>
        </div>


{/* CSS Grid for the Products */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <div 
              key={product.id} 
              className="group relative flex flex-col bg-white/[0.02] border border-white/5 backdrop-blur-md p-6 transition-all duration-500 hover:bg-white/[0.05] hover:border-white/10"
            >
              {/* 1. The Image Container (Cleaned up, no absolute overlay) */}
              <div className="w-full aspect-[4/5] bg-neutral-900 mb-6 flex items-center justify-center relative overflow-hidden">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <span className="text-neutral-800 text-xs uppercase tracking-widest">Image Loading</span>
                )}
              </div>

              {/* 2. Product Meta Data & Button */}
              <div className="flex flex-col flex-grow text-center">
                <span className="text-[10px] uppercase tracking-widest text-amber-500/70 mb-1">
                  {product.note}
                </span>
                <h3 className="text-sm tracking-[0.2em] font-medium text-white mb-2">
                  {product.name}
                </h3>
                <span className="text-xs tracking-wider text-neutral-400 font-light flex-grow">
                  ${product.price}
                </span>
                
                {/* The new button sits safely under the price */}
                <AddToCartButton product={product} />
              </div>
            </div>
          ))}
        </div>


        
        
        {/* Render a clean message if the database is currently empty */}
        {featuredProducts.length === 0 && (
          <div className="text-center py-12 border border-white/5 bg-white/[0.02]">
            <p className="text-xs tracking-widest uppercase text-neutral-500">
              No fragrances in database.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}