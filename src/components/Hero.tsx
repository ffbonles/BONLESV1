import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Flame, Award, PackageCheck } from 'lucide-react';
import { Banner } from '../types';
import { BonlesLogo } from './BonlesLogo';

interface HeroProps {
  banner?: Banner;
  onExploreCatalog: () => void;
  onFeaturedClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ banner, onExploreCatalog, onFeaturedClick }) => {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[#0A0A0B]">
      {/* Subtle brand key visual background gradients with red/green energy accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#E81818]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-[#00D222]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#161618] border border-white/10 rounded-sm">
              <span className="w-2 h-2 rounded-full bg-[#00D222] animate-pulse" />
              <span className="text-[11px] tracking-[0.2em] text-[#C5A059] font-bold uppercase">
                PT. BONLES FOOD NUSANTARA • OFFICIAL STORE
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif-luxury text-white tracking-tight leading-[1.15]">
              {banner?.TITLE || 'Inovasi Snack Tinggi Protein Asli Nusantara'}
            </h1>

            <p className="text-sm sm:text-base text-[#AAAAAA] max-w-xl leading-relaxed font-light">
              {banner?.DESCRIPTION ||
                'Diformulasikan dari bahan pangan nabati lokal pilihan berkualitas dalam kemasan pouch modern berpenutup zipper. Camilan renyah bernutrisi tinggi untuk menunjang aktivitas harian dan oleh-oleh istimewa.'}
            </p>

            {/* Feature Badges with Brand Red & Green Accents */}
            <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg">
              <div className="bg-[#161618] border border-white/5 p-3 rounded-sm hover:border-[#E81818]/40 transition-colors">
                <Flame className="w-4 h-4 text-[#E81818] mb-1" />
                <p className="text-xs font-semibold text-white">Tinggi Protein</p>
                <p className="text-[10px] text-[#777777]">Nutrisi padat alami</p>
              </div>
              <div className="bg-[#161618] border border-white/5 p-3 rounded-sm hover:border-[#00D222]/40 transition-colors">
                <PackageCheck className="w-4 h-4 text-[#00D222] mb-1" />
                <p className="text-xs font-semibold text-white">Kemasan Pouch</p>
                <p className="text-[10px] text-[#777777]">Aluminium zipper foil</p>
              </div>
              <div className="bg-[#161618] border border-white/5 p-3 rounded-sm hover:border-[#C5A059]/40 transition-colors">
                <Award className="w-4 h-4 text-[#C5A059] mb-1" />
                <p className="text-xs font-semibold text-white">Rasa Autentik</p>
                <p className="text-[10px] text-[#777777]">Rempah asli nusantara</p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={onExploreCatalog}
                id="hero-btn-catalog"
                className="bg-[#C5A059] hover:bg-[#D4B06A] text-black font-semibold px-6 py-3 rounded-sm text-xs tracking-widest uppercase flex items-center gap-2 shadow-lg shadow-[#C5A059]/20 transition-all cursor-pointer"
              >
                <span>Buka Katalog Snack</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onFeaturedClick}
                id="hero-btn-featured"
                className="bg-[#161618] hover:bg-[#1F1F23] text-white border border-white/15 hover:border-[#C5A059]/60 px-6 py-3 rounded-sm text-xs tracking-widest uppercase transition-all cursor-pointer"
              >
                Koleksi Pilihan
              </button>
            </div>
          </div>

          {/* Right Column Featured Visual / Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md bg-[#161618] border border-white/10 rounded-sm p-4 shadow-2xl">
              {/* Brand Red & Green Gradient Line */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#E81818] via-[#C5A059] to-[#00D222]" />

              <div className="relative h-72 sm:h-80 w-full overflow-hidden rounded-sm bg-[#0A0A0B]">
                <img
                  src={banner?.IMAGE_URL || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
                  alt="PT Bonles Food Nusantara Snack Kemasan"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center opacity-95 hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161618] via-transparent to-transparent opacity-80" />

                {/* Floating Brand Badge */}
                <div className="absolute top-3 right-3 bg-[#0A0A0B]/85 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded-sm flex items-center gap-1.5 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E81818]" />
                  <span className="text-[10px] text-white font-bold tracking-widest uppercase">
                    ORIGINAL PACKAGING
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-[10px] tracking-[0.2em] font-bold text-[#C5A059] uppercase bg-[#0A0A0B]/80 px-2 py-0.5 rounded-xs inline-block mb-1 border border-[#C5A059]/30">
                    Koleksi Camilan Kemasan
                  </span>
                  <h3 className="text-lg font-serif-luxury text-white font-medium">
                    Keripik Tempe Crispy High Protein
                  </h3>
                  <p className="text-xs text-[#888888]">Standing pouch aluminium kedap udara • 120g</p>
                </div>
              </div>

              {/* Bottom Quick Info Strip */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#888888]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#00D222] animate-pulse" />
                  <span className="text-[#E2E2E2] font-medium">Stok Siap Kirim Hari Ini</span>
                </div>
                <span className="text-[#C5A059] font-medium tracking-wider text-[11px]">ORDER VIA WHATSAPP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
