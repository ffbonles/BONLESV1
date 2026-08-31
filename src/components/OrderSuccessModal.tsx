import React from 'react';
import { CheckCircle2, MessageCircle, Copy, Check, X, ShieldCheck } from 'lucide-react';
import { Order } from '../types';
import { store } from '../services/store';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const [copied, setCopied] = React.useState(false);
  const settings = store.getSettingsMap();
  const waNumber = settings['WHATSAPP_NUMBER'] || '6281234567890';
  const whatsappUrl = store.generateWhatsAppLink(order, waNumber);

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.ORDER_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-lg bg-[#161618] border border-white/10 rounded-sm shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C5A059] to-transparent" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#888888] hover:text-white p-1 rounded-sm transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="w-16 h-16 mx-auto rounded-full bg-[#50C878]/10 border border-[#50C878]/30 flex items-center justify-center text-[#50C878]">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-serif-luxury text-white font-medium">
            Pesanan Berhasil Dibuat
          </h2>
          <p className="text-xs text-[#888888]">
            Terima kasih atas kepercayaan Anda pada produk PT. Bonles Food Nusantara.
          </p>
        </div>

        {/* Order ID Badge */}
        <div className="bg-[#0A0A0B] border border-white/10 rounded-sm p-4 text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-[#AAAAAA] font-semibold">
              Nomor Order:
            </span>
            <button
              onClick={handleCopyOrderId}
              className="text-xs text-[#C5A059] hover:text-white flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>
          <p className="text-lg font-mono font-bold text-[#C5A059] tracking-wider">
            {order.ORDER_ID}
          </p>

          <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[#666666] block">Atas Nama:</span>
              <span className="text-white font-medium">{order.CUSTOMER_NAME}</span>
            </div>
            <div className="text-right">
              <span className="text-[#666666] block">Total Tagihan:</span>
              <span className="text-white font-bold font-mono">
                Rp {order.TOTAL.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* WhatsApp Action Button */}
        <div className="space-y-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#50C878] hover:bg-[#45B068] text-black font-bold py-3.5 px-4 rounded-sm text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg shadow-[#50C878]/20 transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-black" />
            <span>Pesan via WhatsApp Sekarang</span>
          </a>

          <p className="text-[11px] text-[#777777] leading-relaxed">
            Klik tombol hijau di atas untuk mengirimkan rincian pesanan secara otomatis ke nomor resmi WhatsApp Bonles Food Nusantara.
          </p>
        </div>

        <div className="pt-3 border-t border-white/5 flex items-center justify-center gap-2 text-[11px] text-[#888888]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>Data pesanan tersimpan aman di Database Google Sheets</span>
        </div>
      </div>
    </div>
  );
};
