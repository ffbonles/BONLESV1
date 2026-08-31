import React from 'react';
import { Sparkles, MessageCircle, Mail, MapPin, CheckCircle2, Lock } from 'lucide-react';
import { store } from '../services/store';
import { BonlesLogo } from './BonlesLogo';

interface FooterProps {
  onOpenAdminLogin?: () => void;
  isAuthenticated?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdminLogin, isAuthenticated }) => {
  const settings = store.getSettingsMap();
  const storeName = settings['STORE_NAME'] || 'PT. BONLES FOOD NUSANTARA';
  const tagline = settings['TAGLINE'] || 'Snack Tinggi Protein & Oleh-Oleh Khas Nusantara';
  const waNumber = settings['WHATSAPP_NUMBER'] || '6285174333902';
  const email = settings['STORE_EMAIL'] || 'bonlesff@gmail.com';
  const address = settings['STORE_ADDRESS'] || 'Jl. MT. Haryono Gg. Mufakat II No.84 Balikpapan Selatan';

  return (
    <footer className="bg-[#100406] border-t border-[#D82824]/20 text-[#F5EFE6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand Col with Official Logo */}
          <div className="md:col-span-5 space-y-4">
            <BonlesLogo size="md" variant="horizontal" />

            <p className="text-xs text-[#A89886] leading-relaxed max-w-sm font-light">
              {tagline}. Komitmen menyajikan produk camilan sehat dalam kemasan pouch higienis dengan bahan baku lokal terbaik dan standar mutu modern.
            </p>

            <div className="pt-2 flex flex-col gap-1.5 text-xs text-[#00D222]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00D222] shrink-0" />
                <span className="text-[#DCD1C0]">Kemasan Standing Pouch Zipper Kedap Udara & Higienis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00D222] shrink-0" />
                <span className="text-[#DCD1C0]">Bahan Baku Pilihan Kaya Nutrisi & Tinggi Protein Alami</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold tracking-widest text-[#F5A623] uppercase">
              Kategori Produk Snack
            </h4>
            <ul className="space-y-2 text-xs text-[#DCD1C0]">
              <li>
                <a href="#catalog" className="hover:text-white transition-colors">
                  Snack Tinggi Protein
                </a>
              </li>
              <li>
                <a href="#catalog" className="hover:text-white transition-colors">
                  Amplang & Keripik Ikan
                </a>
              </li>
              <li>
                <a href="#catalog" className="hover:text-white transition-colors">
                  Oleh-Oleh Khas Nusantara
                </a>
              </li>
              <li>
                <a href="#catalog" className="hover:text-white transition-colors">
                  Paket Gift Box & Hampers
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold tracking-widest text-[#F5A623] uppercase">
              Layanan Pelanggan & Pemesanan
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A89886]">
              <li className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-[#00D222] shrink-0" />
                <a
                  href={`https://wa.me/${waNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#F5A623] transition-colors text-white font-mono"
                >
                  +{waNumber} (WhatsApp CS)
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#F5A623] shrink-0" />
                <span className="text-[#DCD1C0]">{email}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D82824] shrink-0 mt-0.5" />
                <span className="text-[#A89886] leading-relaxed">{address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#D82824]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8C7B6D]">
          <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-[#F5A623]">Pemesanan Cepat WhatsApp</span>
            <span>•</span>
            <span className="text-[#A89886]">Kualitas Terjamin</span>
            
            {onOpenAdminLogin && (
              <>
                <span>•</span>
                <button
                  onClick={onOpenAdminLogin}
                  className="text-[#68574B] hover:text-[#A89886] flex items-center gap-1 transition-colors cursor-pointer"
                  title="Akses Portal Pengelola"
                >
                  <Lock className="w-3 h-3 text-[#68574B]" />
                  <span>{isAuthenticated ? 'Panel Admin' : 'Akses Staf'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
