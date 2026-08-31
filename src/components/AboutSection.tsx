import React from 'react';
import { ShieldCheck, HeartHandshake, Zap, Award, PackageCheck } from 'lucide-react';
import { BonlesLogo } from './BonlesLogo';
import { BONLES_IMAGES } from '../assets/productImages';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-[#160608] border-t border-[#D82824]/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Visual Bento with Brand Key Visual Logo */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-sm overflow-hidden bg-[#240A0E] border border-[#D82824]/30 p-2 shadow-2xl">
              <img
                src={BONLES_IMAGES.heroBanner}
                alt="Produksi dan Kemasan Snack PT. Bonles Food Nusantara"
                referrerPolicy="no-referrer"
                className="w-full h-80 object-cover rounded-xs opacity-90"
              />
              <div className="absolute top-4 left-4 bg-[#140507]/90 backdrop-blur-md p-2.5 rounded-sm border border-[#D82824]/30 shadow-lg">
                <BonlesLogo size="sm" variant="horizontal" />
              </div>

              <div className="absolute bottom-4 left-4 right-4 bg-[#140507]/95 backdrop-blur-md p-4 rounded-xs border border-[#D82824]/30">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00D222]" />
                  <span className="text-[10px] tracking-[0.2em] font-bold text-[#F5A623] uppercase block">
                    Key Visual & Kemasan Pouch
                  </span>
                </div>
                <p className="text-xs text-[#FFFDF9] mt-1 font-light">
                  Inovasi camilan ringan kemasan standing pouch zipper berkualitas premium dengan cita rasa nusantara.
                </p>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs tracking-[0.25em] text-[#F5A623] font-bold uppercase">
                  Tentang Brand Kami
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#D82824]" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif-luxury text-[#FFFDF9] font-medium leading-tight">
                PT. Bonles Food Nusantara
              </h2>
            </div>

            <p className="text-sm text-[#DCD1C0] leading-relaxed font-light">
              PT. Bonles Food Nusantara berdedikasi menciptakan inovasi camilan snack kemasan sehat dan oleh-oleh berkualitas tinggi. Melalui perpaduan bahan baku nabati pilihan seperti kedelai nusantara dan rempah tradisional, kami menghadirkan produk snack dengan positioning unggulan: <strong className="text-[#FFFDF9] font-medium">Snack Tinggi Protein dalam Kemasan Pouch Modern</strong> yang lezat, higienis, dan praktis dibawa ke mana saja.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-[#240A0E] border border-[#D82824]/20 p-4 rounded-sm space-y-2 hover:border-[#D82824] transition-colors shadow-sm">
                <div className="flex items-center gap-2 text-[#E53935]">
                  <Zap className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#FFFDF9]">
                    Nutrisi Tinggi Protein
                  </h3>
                </div>
                <p className="text-xs text-[#A89886] leading-relaxed">
                  Diolah dengan teknik pemanggangan presisi guna menjaga keutuhan gizi alami kedelai dan bahan pangan lokal.
                </p>
              </div>

              <div className="bg-[#240A0E] border border-[#00D222]/20 p-4 rounded-sm space-y-2 hover:border-[#00D222] transition-colors shadow-sm">
                <div className="flex items-center gap-2 text-[#00D222]">
                  <PackageCheck className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#FFFDF9]">
                    Kemasan Pouch Zipper
                  </h3>
                </div>
                <p className="text-xs text-[#A89886] leading-relaxed">
                  Kemasan kedap udara aluminium foil yang menjaga kerenyahan maksimal serta higienis dan mudah ditutup kembali.
                </p>
              </div>

              <div className="bg-[#240A0E] border border-[#F5A623]/20 p-4 rounded-sm space-y-2 hover:border-[#F5A623] transition-colors shadow-sm">
                <div className="flex items-center gap-2 text-[#F5A623]">
                  <Award className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#FFFDF9]">
                    Cita Rasa Nusantara
                  </h3>
                </div>
                <p className="text-xs text-[#A89886] leading-relaxed">
                  Formula bumbu rempah autentik tanpa bahan pengawet berlebih untuk kenikmatan rasa yang otentik.
                </p>
              </div>

              <div className="bg-[#240A0E] border border-[#D82824]/20 p-4 rounded-sm space-y-2 hover:border-[#D82824]/60 transition-colors shadow-sm">
                <div className="flex items-center gap-2 text-[#F5A623]">
                  <HeartHandshake className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#FFFDF9]">
                    Pemberdayaan Petani
                  </h3>
                </div>
                <p className="text-xs text-[#A89886] leading-relaxed">
                  Mendukung ketahanan pangan dan kesejahteraan petani kedelai serta hasil bumi lokal Indonesia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
