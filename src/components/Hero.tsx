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
    <section className="relative overflow-hidden border-b border-[#D82824]/20 bg-[#160608]">
      {/* Packaging signature warm ambient glows (Scarlet Red, Amplang Gold, Borneo Green) */}
      <div className="absolute top-0 right-1/4 w-[450px] h-[450px] bg-[#D82824]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[400px] bg-[#F5A623]/12 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-80 h-80 bg-[#00D222]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#F5A623_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#260A0E] border border-[#D82824]/30 rounded-sm shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#00D222] animate-pulse" />
              <span className="text-[11px] tracking-[0.2em] text-[#F5A623] font-bold uppercase">
                PT. BONLES FOOD NUSANTARA • OFFICIAL STORE
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif-luxury text-[#FFFDF9] tracking-tight leading-[1.15]">
              {banner?.TITLE || 'Inovasi Snack Tinggi Protein Asli Nusantara'}
            </h1>

            <p className="text-sm sm:text-base text-[#E2D4C3] max-w-xl leading-relaxed font-light">
              {banner?.DESCRIPTION ||
                'Cita rasa asli oleh-oleh Nusantara dengan bahan baku segar pilihan dalam kemasan higienis modern. Camilan renyah, gurih, dan bernutrisi tinggi untuk keluarga tercinta.'}
            </p>

            {/* Feature Badges with Packaging Red, Gold & Green */}
            <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg">
              <div className="bg-[#240A0E] border border-[#D82824]/25 p-3 rounded-sm hover:border-[#D82824] transition-colors shadow-sm">
                <Flame className="w-4 h-4 text-[#E53935] mb-1" />
                <p className="text-xs font-semibold text-[#FFFDF9]">Tinggi Protein</p>
                <p className="text-[10px] text-[#A89886]">Nutrisi padat alami</p>
              </div>
              <div className="bg-[#240A0E] border border-[#00D222]/25 p-3 rounded-sm hover:border-[#00D222] transition-colors shadow-sm">
                <PackageCheck className="w-4 h-4 text-[#00D222] mb-1" />
                <p className="text-xs font-semibold text-[#FFFDF9]">Kemasan Pouch</p>
                <p className="text-[10px] text-[#A89886]">Aluminium zipper foil</p>
              </div>
              <div className="bg-[#240A0E] border border-[#F5A623]/25 p-3 rounded-sm hover:border-[#F5A623] transition-colors shadow-sm">
                <Award className="w-4 h-4 text-[#F5A623] mb-1" />
                <p className="text-xs font-semibold text-[#FFFDF9]">Rasa Autentik</p>
                <p className="text-[10px] text-[#A89886]">Rempah asli nusantara</p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={onExploreCatalog}
                id="hero-btn-catalog"
                className="bg-gradient-to-r from-[#D82824] via-[#BE1A18] to-[#991313] hover:from-[#E53935] hover:to-[#B71C1C] text-white font-semibold px-6 py-3.5 rounded-sm text-xs tracking-widest uppercase flex items-center gap-2 shadow-lg shadow-[#D82824]/25 hover:shadow-[#D82824]/40 transition-all cursor-pointer"
              >
                <span>Buka Katalog Snack</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onFeaturedClick}
                id="hero-btn-featured"
                className="bg-[#240A0E] hover:bg-[#320E14] text-[#FFF1D6] border border-[#F5A623]/40 hover:border-[#F5A623] px-6 py-3.5 rounded-sm text-xs tracking-widest uppercase transition-all cursor-pointer shadow-sm"
              >
                Koleksi Pilihan
              </button>
            </div>
          </div>

          {/* Right Column Featured Visual / Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md bg-[#240A0E] border border-[#D82824]/30 rounded-sm p-4 shadow-2xl">
              {/* Packaging Signature Gradient Line */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#D82824] via-[#F5A623] to-[#00D222]" />

              <div className="relative h-72 sm:h-80 w-full overflow-hidden rounded-sm bg-[#140507]">
                <img
                  src={banner?.IMAGE_URL || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
                  alt="PT Bonles Food Nusantara Snack Kemasan"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center opacity-95 hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#240A0E] via-transparent to-transparent opacity-80" />

                {/* Floating Brand Badge */}
                <div className="absolute top-3 right-3 bg-[#160608]/90 backdrop-blur-sm border border-[#D82824]/40 px-2.5 py-1 rounded-sm flex items-center gap-1.5 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E53935]" />
                  <span className="text-[10px] text-white font-bold tracking-widest uppercase">
                    ORIGINAL PACKAGING
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-[10px] tracking-[0.2em] font-bold text-[#F5A623] uppercase bg-[#140507]/90 px-2 py-0.5 rounded-xs inline-block mb-1 border border-[#F5A623]/40">
                    Oleh-Oleh Khas Kalimantan
                  </span>
                  <h3 className="text-lg font-serif-luxury text-[#FFFDF9] font-medium">
                    Amplang Ikan Tenggiri & Aneka Camilan
                  </h3>
                  <p className="text-xs text-[#C8B8A6]">Kemasan Pouch & Gift Box • Lembut & Gurih</p>
                </div>
              </div>

              {/* Bottom Quick Info Strip */}
              <div className="mt-4 pt-3 border-t border-[#D82824]/20 flex items-center justify-between text-xs text-[#A89886]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#00D222] animate-pulse" />
                  <span className="text-[#FFF5E6] font-medium">Stok Siap Kirim Hari Ini</span>
                </div>
                <span className="text-[#F5A623] font-semibold tracking-wider text-[11px]">ORDER VIA WHATSAPP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
