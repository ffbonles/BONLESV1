import React from 'react';
import { Sparkles, MessageCircle, Mail, MapPin, ShieldCheck } from 'lucide-react';
import { store } from '../services/store';
import { BonlesLogo } from './BonlesLogo';

export const Footer: React.FC = () => {
  const settings = store.getSettingsMap();
  const storeName = settings['STORE_NAME'] || 'PT. BONLES FOOD NUSANTARA';
  const tagline = settings['TAGLINE'] || 'Snack Tinggi Protein & Oleh-Oleh Khas Nusantara';
  const waNumber = settings['WHATSAPP_NUMBER'] || '6281234567890';
  const email = settings['STORE_EMAIL'] || 'bonlesfoodnusantara@gmail.com';
  const address = settings['STORE_ADDRESS'] || 'Sentra Industri Pangan Nusantara, Indonesia';

  return (
    <footer className="bg-[#0A0A0B] border-t border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand Col with Official Logo */}
          <div className="md:col-span-5 space-y-4">
            <BonlesLogo size="md" variant="horizontal" />

            <p className="text-xs text-[#888888] leading-relaxed max-w-sm">
              {tagline}. Komitmen menyajikan produk camilan sehat dalam kemasan pouch higienis dengan bahan baku lokal terbaik dan standar mutu modern.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-[#00D222]">
              <ShieldCheck className="w-4 h-4" />
              <span>Sistem Database Google Sheets & Google Drive Terintegrasi</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold tracking-widest text-[#C5A059] uppercase">
              Kategori Produk
            </h4>
            <ul className="space-y-2 text-xs text-[#AAAAAA]">
              <li>
                <a href="#catalog" className="hover:text-white transition-colors">
                  Snack Tinggi Protein
                </a>
              </li>
              <li>
                <a href="#catalog" className="hover:text-white transition-colors">
                  Keripik Tempe Crispy
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
            <h4 className="text-xs font-bold tracking-widest text-[#C5A059] uppercase">
              Kontak Resmi
            </h4>
            <ul className="space-y-2.5 text-xs text-[#888888]">
              <li className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-[#50C878] shrink-0" />
                <a
                  href={`https://wa.me/${waNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors text-white font-mono"
                >
                  +{waNumber} (WhatsApp)
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span className="text-[#AAAAAA]">{email}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                <span className="text-[#888888] leading-relaxed">{address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#666666]">
          <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-[#C5A059]">Pemesanan Langsung WhatsApp</span>
            <span>•</span>
            <span>Google Apps Script Backend Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
