"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "../lib/useCartStore";

export default function Navbar() {
  // 1. Select only the necessary state from Zustand to prevent unnecessary re-renders 
  // if other cart properties (like item arrays) change.
  const totalItems = useCartStore((state) => state.totalItems);
  
  // 2. Initialize UI states for mobile navigation and hydration safety
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 3. Resolve Next.js hydration mismatches by verifying the component has mounted
  // on the client before attempting to read local storage values.
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 4. Lock background scrolling when the mobile menu is open to create a native app feel
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-20 grid grid-cols-3 items-center">
        
        {/* ========================================== */}
        {/* LEFT COLUMN: Navigation & Mobile Toggle    */}
        {/* ========================================== */}
        <div className="flex items-center gap-8 text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400">
          
          {/* 5. Accessible Hamburger Button for Mobile Views */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle mobile menu"
            className="md:hidden hover:text-white transition-colors duration-300 focus:outline-none"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={1.5} 
              stroke="currentColor" 
              className="w-6 h-6 transition-transform duration-300"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"} />
            </svg>
          </button>

          {/* 6. Desktop Links (Hidden on mobile) */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/fragrances" className="hover:text-white transition-colors duration-300 focus:outline-none focus:text-white">
              Fragrances
            </Link>
            <Link href="/discovery" className="hover:text-white transition-colors duration-300 focus:outline-none focus:text-white">
              Discovery
            </Link>
          </div>
        </div>

        {/* ========================================== */}
        {/* CENTER COLUMN: Brand Identity              */}
        {/* ========================================== */}
        <div className="text-center flex justify-center">
          <Link 
            href="/" 
            className="text-lg md:text-xl tracking-[0.3em] text-white whitespace-nowrap focus:outline-none"
            aria-label="Nova Fragrance Home"
          >
            <span className="font-light">Nova</span>
            <span className="font-bold">Fragrance</span>
          </Link>
        </div>

        {/* ========================================== */}
        {/* RIGHT COLUMN: User Actions                 */}
        {/* ========================================== */}
        <div className="flex items-center justify-end gap-6 md:gap-8 text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400">
          <Link href="/login" className="hidden md:block hover:text-white transition-colors duration-300 focus:outline-none focus:text-white">
            Sign In
          </Link>
          
          {/* 7. Interactive Zustand Cart Indicator */}
          <Link 
            href="/cart" 
            aria-label={`Shopping cart with ${isMounted ? totalItems : 0} items`}
            className="flex items-center gap-2 hover:text-white transition-colors duration-300 group focus:outline-none"
          >
            <span className="hidden sm:block">Cart</span>
            <span className="text-[9px] bg-white/10 text-white px-2 py-0.5 rounded-full group-hover:bg-white group-hover:text-black transition-colors min-w-[20px] text-center">
              {isMounted ? totalItems : 0}
            </span>
          </Link>
        </div>

      </div>

      {/* ========================================== */}
      {/* MOBILE MENU OVERLAY (Glassmorphic Dropdown)*/}
      {/* ========================================== */}
      <div 
        className={`md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/5 flex flex-col px-6 shadow-2xl text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400 transition-all duration-300 ease-in-out origin-top ${
          isMobileMenuOpen ? "opacity-100 scale-y-100 py-8 gap-6" : "opacity-0 scale-y-0 h-0 py-0 gap-0 overflow-hidden"
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
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
    </nav>
  );
}