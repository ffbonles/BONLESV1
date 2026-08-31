import React, { useState } from 'react';
import { X, ShieldCheck, Truck, CreditCard, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem, CheckoutFormData, Order } from '../types';
import { store } from '../services/store';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onOrderCompleted: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onOrderCompleted,
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<CheckoutFormData>({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    shippingMethod: 'JNE Reguler',
    paymentMethod: 'Transfer Bank (BCA/Mandiri/BRI)',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Subtotal calculated fresh from cart items
  const subtotal = cartItems.reduce((sum, item) => {
    const p = item.product;
    const price = p.DISCOUNT_PRICE > 0 && p.DISCOUNT_PRICE < p.PRICE ? p.DISCOUNT_PRICE : p.PRICE;
    return sum + price * item.quantity;
  }, 0);

  const defaultShippingCost = 15000;
  const total = subtotal + defaultShippingCost;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!formData.name.trim()) {
      setErrorMsg('Nama lengkap penerima wajib diisi.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 8) {
      setErrorMsg('Nomor WhatsApp yang aktif dan valid wajib diisi.');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMsg('Alamat pengiriman lengkap wajib diisi.');
      return;
    }
    if (!formData.city.trim()) {
      setErrorMsg('Kota / Kabupaten tujuan pengiriman wajib diisi.');
      return;
    }

    try {
      setLoading(true);
      // Execute atomic order creation in store service
      const order = store.createOrder(formData, cartItems);
      onOrderCompleted(order);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kendala saat memproses pesanan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-4xl bg-[#1C070B] border border-[#D82824]/30 rounded-sm shadow-2xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold Accent Line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#F5A623] to-transparent" />

        {/* Header */}
        <div className="p-6 border-b border-[#D82824]/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#00D222]" />
            <div>
              <h2 className="text-lg font-serif-luxury text-[#FFFDF9] font-medium">
                Formulir Pemesanan Resmi
              </h2>
              <p className="text-xs text-[#A89886]">
                PT. Bonles Food Nusantara • Terhubung Langsung ke WhatsApp Admin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#A89886] hover:text-[#FFFDF9] p-1 rounded-sm border border-[#D82824]/20 hover:border-[#D82824] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-950/70 border border-[#D82824] rounded-sm text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#E53935] shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Customer Data Form */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-xs tracking-widest uppercase font-bold text-[#F5A623] flex items-center gap-2 pb-1 border-b border-[#D82824]/20">
              <span>Data Penerima & Pengiriman</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-[#DCD1C0]">Nama Lengkap *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[#140507] border border-[#D82824]/30 rounded-sm px-3 py-2 text-xs text-[#FFFDF9] placeholder-[#887766] focus:outline-none focus:border-[#F5A623]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#DCD1C0]">Nomor WhatsApp (Aktif) *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="Contoh: 081234567890"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-[#140507] border border-[#D82824]/30 rounded-sm px-3 py-2 text-xs text-[#FFFDF9] placeholder-[#887766] focus:outline-none focus:border-[#F5A623]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[#DCD1C0]">Alamat Email (Opsional)</label>
              <input
                type="email"
                name="email"
                placeholder="nama@email.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-[#140507] border border-[#D82824]/30 rounded-sm px-3 py-2 text-xs text-[#FFFDF9] placeholder-[#887766] focus:outline-none focus:border-[#F5A623]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[#DCD1C0]">Alamat Lengkap Tujuan *</label>
              <textarea
                name="address"
                required
                rows={2}
                placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan..."
                value={formData.address}
                onChange={handleChange}
                className="w-full bg-[#140507] border border-[#D82824]/30 rounded-sm px-3 py-2 text-xs text-[#FFFDF9] placeholder-[#887766] focus:outline-none focus:border-[#F5A623]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-[#DCD1C0]">Kota / Kabupaten *</label>
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="Contoh: Jakarta Selatan"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full bg-[#140507] border border-[#D82824]/30 rounded-sm px-3 py-2 text-xs text-[#FFFDF9] placeholder-[#887766] focus:outline-none focus:border-[#F5A623]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#DCD1C0]">Kode Pos</label>
                <input
                  type="text"
                  name="postalCode"
                  placeholder="Contoh: 12190"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="w-full bg-[#140507] border border-[#D82824]/30 rounded-sm px-3 py-2 text-xs text-[#FFFDF9] placeholder-[#887766] focus:outline-none focus:border-[#F5A623]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs text-[#DCD1C0] flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#F5A623]" />
                  <span>Metode Pengiriman</span>
                </label>
                <select
                  name="shippingMethod"
                  value={formData.shippingMethod}
                  onChange={handleChange}
                  className="w-full bg-[#140507] border border-[#D82824]/30 rounded-sm px-3 py-2 text-xs text-[#FFFDF9] focus:outline-none focus:border-[#F5A623]"
                >
                  <option value="JNE Reguler">JNE Reguler (Estimasi 2-3 Hari)</option>
                  <option value="J&T Express">J&T Express</option>
                  <option value="SiCepat Best">SiCepat Regular</option>
                  <option value="Same Day / Instant">Same Day / Instant (Khusus Area Tertentu)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#DCD1C0] flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#F5A623]" />
                  <span>Metode Pembayaran</span>
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full bg-[#140507] border border-[#D82824]/30 rounded-sm px-3 py-2 text-xs text-[#FFFDF9] focus:outline-none focus:border-[#F5A623]"
                >
                  <option value="Transfer Bank (BCA/Mandiri/BRI)">Transfer Bank (BCA / Mandiri / BRI)</option>
                  <option value="QRIS / E-Wallet (GoPay, OVO, Dana)">QRIS / E-Wallet</option>
                  <option value="Konfirmasi Manual WhatsApp">Konfirmasi Manual via WhatsApp</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[#DCD1C0]">Catatan Khusus Pemesanan</label>
              <input
                type="text"
                name="notes"
                placeholder="Contoh: Tolong packing rapi / untuk oleh-oleh"
                value={formData.notes}
                onChange={handleChange}
                className="w-full bg-[#140507] border border-[#D82824]/30 rounded-sm px-3 py-2 text-xs text-[#FFFDF9] placeholder-[#887766] focus:outline-none focus:border-[#F5A623]"
              />
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-5 bg-[#140507] border border-[#D82824]/25 rounded-sm p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 pb-2 border-b border-[#D82824]/20">
                <ShoppingBag className="w-4 h-4 text-[#F5A623]" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#FFFDF9]">
                  Ringkasan Keranjang
                </h3>
              </div>

              <div className="divide-y divide-[#D82824]/10 max-h-56 overflow-y-auto my-3 pr-1 space-y-2">
                {cartItems.map(({ product, quantity }) => {
                  const p =
                    product.DISCOUNT_PRICE > 0 && product.DISCOUNT_PRICE < product.PRICE
                      ? product.DISCOUNT_PRICE
                      : product.PRICE;
                  return (
                    <div key={product.ID} className="pt-2 flex justify-between items-start text-xs">
                      <div>
                        <p className="text-[#FFFDF9] font-medium line-clamp-1">{product.NAME}</p>
                        <p className="text-[11px] text-[#A89886] font-mono">
                          Rp {p.toLocaleString('id-ID')} x {quantity}
                        </p>
                      </div>
                      <span className="font-mono text-[#F5A623] font-bold">
                        Rp {(p * quantity).toLocaleString('id-ID')}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-[#D82824]/20 space-y-2 text-xs">
                <div className="flex justify-between text-[#A89886]">
                  <span>Subtotal</span>
                  <span className="font-mono text-[#FFFDF9]">Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-[#A89886]">
                  <span>Ongkos Kirim Standar</span>
                  <span className="font-mono text-[#FFFDF9]">
                    Rp {defaultShippingCost.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#FFFDF9] pt-2 border-t border-[#D82824]/20">
                  <span>Total Tagihan</span>
                  <span className="font-mono text-[#F5A623] text-base">
                    Rp {total.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#D82824] to-[#B51E1A] hover:from-[#E53935] hover:to-[#D82824] disabled:opacity-50 text-white font-bold py-3.5 rounded-sm text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg shadow-[#D82824]/30 transition-all cursor-pointer"
              >
                <span>{loading ? 'Memvalidasi Stok...' : 'Konfirmasi & Buat Pesanan'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-[#A89886] text-center leading-relaxed">
                Setelah konfirmasi, Anda akan diarahkan langsung ke WhatsApp admin untuk verifikasi pembayaran dan pengiriman.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
