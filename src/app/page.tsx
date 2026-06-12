export default function HomePage() {
  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden px-4">
      {/* Background Ambience Light Glow */}
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
  );
}