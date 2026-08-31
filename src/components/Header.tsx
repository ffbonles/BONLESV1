import React from 'react';
import { ShoppingBag, ShieldCheck, Sparkles, Search } from 'lucide-react';
import { BonlesLogo } from './BonlesLogo';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNavigateHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  isAdmin,
  onToggleAdmin,
  searchQuery,
  onSearchChange,
  onNavigateHome,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0B]/95 backdrop-blur-md border-b border-white/10">
      {/* Top micro banner */}
      <div className="bg-[#161618] border-b border-white/5 py-1.5 px-4 text-center text-xs tracking-widest text-[#C5A059] uppercase font-semibold flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
        <span>Snack Tinggi Protein & Oleh-Oleh Khas Nusantara</span>
        <span className="hidden sm:inline text-white/30">•</span>
        <span className="hidden sm:inline text-white/60">Pemesanan Langsung Terintegrasi WhatsApp</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand identity with Official Key Visual Logo */}
        <button
          onClick={onNavigateHome}
          className="flex items-center text-left focus:outline-none group cursor-pointer"
          aria-label="Kembali ke Beranda Bonles Food"
        >
          <BonlesLogo size="md" variant="horizontal" />
        </button>

        {/* Global Catalog Search Bar & Navigation Links */}
        <div className="hidden lg:flex items-center gap-6">
          <button
            onClick={() => {
              const el = document.getElementById('our-story');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-xs font-sans uppercase tracking-widest text-[#B5B0A4] hover:text-[#C5A059] transition-colors cursor-pointer"
          >
            Our Story
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('catalog');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-xs font-sans uppercase tracking-widest text-[#B5B0A4] hover:text-[#C5A059] transition-colors cursor-pointer"
          >
            Katalog
          </button>
        </div>

        {/* Global Catalog Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-xs mx-2 relative">
          <Search className="w-4 h-4 text-[#888888] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari camilan..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#161618] border border-white/10 rounded-sm pl-10 pr-4 py-1.5 text-xs text-[#E2E2E2] placeholder-[#666666] focus:outline-none focus:border-[#C5A059] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 text-xs text-[#888888] hover:text-white"
            >
              Hapus
            </button>
          )}
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Navigation link for mobile search */}
          <div className="md:hidden flex items-center">
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-32 bg-[#161618] border border-white/10 rounded-sm px-2.5 py-1.5 text-xs text-[#E2E2E2] placeholder-[#666666] focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          {/* Admin Dashboard Toggle */}
          <button
            onClick={onToggleAdmin}
            id="btn-admin-toggle"
            className={`flex items-center gap-2 px-3 py-2 rounded-sm border text-xs tracking-wider uppercase font-medium transition-all ${
              isAdmin
                ? 'bg-[#C5A059] text-black border-[#C5A059] font-bold shadow-md shadow-[#C5A059]/20'
                : 'bg-[#161618] text-[#C5A059] border-[#C5A059]/30 hover:border-[#C5A059] hover:bg-[#1F1F23]'
            }`}
            title="Kelola Produk, Pesanan, Google Sheets & Drive"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">{isAdmin ? 'Mode Web' : 'Admin Panel'}</span>
          </button>

          {/* Shopping Cart Button */}
          <button
            onClick={onOpenCart}
            id="btn-open-cart"
            className="relative flex items-center gap-2 bg-[#161618] hover:bg-[#1F1F23] border border-white/10 hover:border-[#C5A059]/50 text-white px-3.5 py-2 rounded-sm text-xs tracking-wider uppercase font-medium transition-all"
            aria-label="Buka Keranjang Belanja"
          >
            <ShoppingBag className="w-4 h-4 text-[#C5A059]" />
            <span className="hidden sm:inline">Keranjang</span>
            {cartCount > 0 && (
              <span className="ml-1 bg-[#C5A059] text-black text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
