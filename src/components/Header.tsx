import React from 'react';
import { ShoppingBag, ShieldCheck, Sparkles, Search, UserCheck } from 'lucide-react';
import { BonlesLogo } from './BonlesLogo';
import { store } from '../services/store';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
  onToggleAdmin: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNavigateHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  isAdmin,
  isAuthenticated,
  onToggleAdmin,
  searchQuery,
  onSearchChange,
  onNavigateHome,
}) => {
  const settings = store.getSettingsMap();
  const tagline = settings['TAGLINE'] || 'Snack Tinggi Protein & Oleh-Oleh Khas Nusantara';
  const promoText = settings['PROMO_BANNER_TEXT'] || 'Pemesanan Langsung Terintegrasi WhatsApp';

  return (
    <header className="sticky top-0 z-40 bg-[#160608]/95 backdrop-blur-md border-b border-[#D82824]/20 shadow-lg shadow-black/40">
      {/* Top micro banner - Customer-friendly messaging only */}
      <div className="bg-gradient-to-r from-[#2A0A0E] via-[#3B0E14] to-[#2A0A0E] border-b border-[#D82824]/20 py-1.5 px-4 text-center text-xs tracking-widest text-[#F5A623] uppercase font-semibold flex flex-wrap items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#F5A623]" />
        <span className="text-[#FFF1D6]">{tagline}</span>
        <span className="hidden sm:inline text-white/30">•</span>
        <span className="hidden sm:inline text-white/80">{promoText}</span>
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
            className="text-xs font-sans uppercase tracking-widest text-[#E8DCCB] hover:text-[#F5A623] transition-colors cursor-pointer"
          >
            Our Story
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('catalog');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-xs font-sans uppercase tracking-widest text-[#E8DCCB] hover:text-[#F5A623] transition-colors cursor-pointer"
          >
            Katalog Snack
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('about-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-xs font-sans uppercase tracking-widest text-[#E8DCCB] hover:text-[#F5A623] transition-colors cursor-pointer"
          >
            Tentang Kami
          </button>
        </div>

        {/* Global Catalog Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-xs mx-2 relative">
          <Search className="w-4 h-4 text-[#A89886] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari camilan kemasan..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#240A0E] border border-[#D82824]/30 rounded-sm pl-10 pr-4 py-1.5 text-xs text-[#FFF5E6] placeholder-[#9A8778] focus:outline-none focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623]/40 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 text-xs text-[#A89886] hover:text-white"
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
              placeholder="Cari..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-28 sm:w-36 bg-[#240A0E] border border-[#D82824]/30 rounded-sm px-2.5 py-1.5 text-xs text-[#FFF5E6] placeholder-[#9A8778] focus:outline-none focus:border-[#F5A623]"
            />
          </div>

          {/* Admin Toggle Button (Only displayed when authenticated staff/admin is logged in) */}
          {isAuthenticated && (
            <button
              onClick={onToggleAdmin}
              id="btn-admin-toggle"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-sm border text-xs tracking-wider uppercase font-medium transition-all ${
                isAdmin
                  ? 'bg-gradient-to-r from-[#D82824] to-[#B71C1C] text-white border-[#D82824] font-bold shadow-md shadow-[#D82824]/30'
                  : 'bg-[#240A0E] text-[#00D222] border-[#00D222]/40 hover:border-[#00D222] hover:bg-[#300E14]'
              }`}
              title={isAdmin ? 'Kembali ke Tampilan Web Pengunjung' : 'Buka Dashboard Admin'}
            >
              <UserCheck className="w-3.5 h-3.5 text-[#00D222]" />
              <span className="hidden sm:inline">
                {isAdmin ? 'Tampilan Web' : 'Panel Admin'}
              </span>
            </button>
          )}

          {/* Shopping Cart Button */}
          <button
            onClick={onOpenCart}
            id="btn-open-cart"
            className="relative flex items-center gap-2 bg-[#240A0E] hover:bg-[#320E14] border border-[#D82824]/30 hover:border-[#F5A623]/60 text-white px-3.5 py-2 rounded-sm text-xs tracking-wider uppercase font-medium transition-all shadow-sm cursor-pointer"
            aria-label="Buka Keranjang Belanja"
          >
            <ShoppingBag className="w-4 h-4 text-[#F5A623]" />
            <span className="hidden sm:inline">Keranjang</span>
            {cartCount > 0 && (
              <span className="ml-1 bg-gradient-to-r from-[#D82824] to-[#E53935] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse shadow-sm shadow-[#D82824]/50">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
