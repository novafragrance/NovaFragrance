"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "../lib/useCartStore";

export default function Navbar() {
  // 1. Hook into Zustand for the live count
  const totalItems = useCartStore((state) => state.totalItems);
  
  // 2. States for the mobile overlay & hydration fix
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 3. HYDRATION FIX: Wait for the browser to mount before rendering the cart number
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-20 grid grid-cols-3 items-center">
        
        {/* LEFT COLUMN: Navigation & Mobile Menu Toggle */}
        <div className="flex items-center gap-8 text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400">
          
          {/* Hamburger Icon (Only visible on mobile) */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden hover:text-white transition-colors duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"} />
            </svg>
          </button>

          {/* Desktop Links (Hidden on mobile) */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/fragrances" className="hover:text-white transition-colors duration-300">Fragrances</Link>
            <Link href="/discovery" className="hover:text-white transition-colors duration-300">Discovery</Link>
          </div>
        </div>

        {/* CENTER COLUMN: Brand Identity */}
        <div className="text-center flex justify-center">
          <Link href="/" className="text-lg md:text-xl tracking-[0.3em] text-white whitespace-nowrap">
            <span className="font-light">DECODE</span>
            <span className="font-bold">PARFUM</span>
          </Link>
        </div>

        {/* RIGHT COLUMN: Actions */}
        <div className="flex items-center justify-end gap-6 md:gap-8 text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400">
          {/* Sign In is moved to the mobile menu on small screens to save space */}
          <Link href="/login" className="hidden md:block hover:text-white transition-colors duration-300">Sign In</Link>
          
          {/* The Interactive Zustand Cart */}
          {/* Change this from a button to a Link inside your Navbar.tsx */}
          <Link href="/cart" className="flex items-center gap-2 hover:text-white transition-colors duration-300 group">
            <span className="hidden sm:block">Cart</span>
            <span className="text-[9px] bg-white/10 text-white px-2 py-0.5 rounded-full group-hover:bg-white group-hover:text-black transition-colors">
              {isMounted ? totalItems : 0}
            </span>
          </Link>
        </div>

      </div>

      {/* MOBILE MENU OVERLAY (Glassmorphic Dropdown) */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/5 flex flex-col px-6 py-8 gap-6 shadow-2xl text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400">
          <Link 
            href="/fragrances" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="hover:text-white transition-colors duration-300"
          >
            Fragrances
          </Link>
          <Link 
            href="/discovery" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="hover:text-white transition-colors duration-300"
          >
            Discovery
          </Link>
          <div className="pt-4 border-t border-white/5">
            <Link 
              href="/login" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-white transition-colors duration-300 block"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}