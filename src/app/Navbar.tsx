import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-20 grid grid-cols-3 items-center">
        
        {/* LEFT COLUMN: Navigation */}
        <div className="flex items-center gap-8 text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400">
          <Link href="/fragrances" className="hover:text-white transition-colors duration-300">Fragrances</Link>
          <Link href="/discovery" className="hover:text-white transition-colors duration-300">Discovery</Link>
        </div>

        {/* CENTER COLUMN: Brand Identity */}
        <div className="text-center">
          <Link href="/" className="text-xl tracking-[0.3em] text-white">
            <span className="font-light">DECODE</span>
            <span className="font-bold">PARFUM</span>
          </Link>
        </div>

        {/* RIGHT COLUMN: Actions */}
        <div className="flex items-center justify-end gap-8 text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400">
          <Link href="/login" className="hover:text-white transition-colors duration-300">Sign In</Link>
          <button className="flex items-center gap-2 hover:text-white transition-colors duration-300 group">
            <span>Cart</span>
            <span className="text-[9px] bg-white/10 text-white px-2 py-0.5 rounded-full group-hover:bg-white group-hover:text-black transition-colors">
              0
            </span>
          </button>
        </div>

      </div>
    </nav>
  );
}