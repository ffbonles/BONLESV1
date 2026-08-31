import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, AlertCircle } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, qty: number) => void;
  onClearCart: () => void;
  onProceedCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onClearCart,
  onProceedCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => {
    const p = item.product;
    const price = p.DISCOUNT_PRICE > 0 && p.DISCOUNT_PRICE < p.PRICE ? p.DISCOUNT_PRICE : p.PRICE;
    return sum + price * item.quantity;
  }, 0);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#161618] border-l border-white/10 flex flex-col justify-between shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#C5A059]" />
              <h2 className="text-lg font-serif-luxury text-white font-medium">Keranjang Belanja</h2>
              <span className="text-xs bg-[#0A0A0B] text-[#C5A059] px-2 py-0.5 rounded-full border border-[#C5A059]/30">
                {totalItems} item
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-[#888888] hover:text-white p-1 rounded-sm border border-white/5 hover:border-white/20 transition-colors"
              aria-label="Tutup Keranjang"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#0A0A0B] border border-white/10 flex items-center justify-center text-[#555555]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Keranjang Anda Masih Kosong</h3>
                  <p className="text-xs text-[#777777] mt-1 max-w-xs">
                    Pilih aneka snack tinggi protein dan oleh-oleh nusantara favorit Anda dari katalog.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="mt-2 bg-[#1F1F23] hover:bg-[#2A2A30] text-[#C5A059] border border-[#C5A059]/30 px-5 py-2 rounded-sm text-xs tracking-wider uppercase font-medium transition-colors"
                >
                  Mulai Belanja
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-white/5 text-xs text-[#888888]">
                  <span>Daftar Produk</span>
                  <button
                    onClick={onClearCart}
                    className="text-red-400 hover:text-red-300 flex items-center gap-1 text-[11px] transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Kosongkan Keranjang
                  </button>
                </div>

                <div className="space-y-3">
                  {cartItems.map(({ product, quantity }) => {
                    const price =
                      product.DISCOUNT_PRICE > 0 && product.DISCOUNT_PRICE < product.PRICE
                        ? product.DISCOUNT_PRICE
                        : product.PRICE;
                    const lineTotal = price * quantity;
                    const isExceedStock = quantity > product.STOCK;

                    return (
                      <div
                        key={product.ID}
                        className="bg-[#0A0A0B] border border-white/5 rounded-sm p-3 flex gap-3 items-center justify-between"
                      >
                        <img
                          src={
                            product.MAIN_IMAGE_URL ||
                            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'
                          }
                          alt={product.NAME}
                          className="w-14 h-14 object-cover rounded-xs border border-white/10 shrink-0"
                        />

                        <div className="flex-1 min-w-0 pr-2">
                          <h4 className="text-xs font-semibold text-white truncate" title={product.NAME}>
                            {product.NAME}
                          </h4>
                          <p className="text-[11px] text-[#888888] font-mono">
                            Rp {price.toLocaleString('id-ID')} x {quantity}
                          </p>
                          <p className="text-xs font-bold text-[#C5A059]">
                            Rp {lineTotal.toLocaleString('id-ID')}
                          </p>

                          {isExceedStock && (
                            <div className="flex items-center gap-1 text-[10px] text-red-400 mt-1">
                              <AlertCircle className="w-3 h-3" />
                              <span>Stok hanya tersisa {product.STOCK}</span>
                            </div>
                          )}
                        </div>

                        {/* Quantity controls */}
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center border border-white/15 rounded-xs bg-[#161618]">
                            <button
                              onClick={() => onUpdateQuantity(product.ID, quantity - 1)}
                              className="px-2 py-1 text-xs text-white hover:text-[#C5A059] transition-colors"
                              aria-label="Kurangi"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 py-0.5 text-xs font-bold text-white font-mono min-w-6 text-center">
                              {quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(product.ID, quantity + 1)}
                              disabled={quantity >= product.STOCK}
                              className="px-2 py-1 text-xs text-white hover:text-[#C5A059] disabled:opacity-30 transition-colors"
                              aria-label="Tambah"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => onUpdateQuantity(product.ID, 0)}
                            className="text-[11px] text-zinc-500 hover:text-red-400 transition-colors"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Footer Summary & Checkout Button */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-[#0A0A0B] space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#888888]">
                  <span>Subtotal Produk</span>
                  <span className="text-white font-mono">Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-[#888888]">
                  <span>Estimasi Pengiriman</span>
                  <span className="text-[#AAAAAA]">Dihitung saat checkout</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                  <span>Total Belanja</span>
                  <span className="text-[#C5A059] font-mono text-base">
                    Rp {subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <button
                onClick={onProceedCheckout}
                className="w-full bg-[#C5A059] hover:bg-[#D4B06A] text-black font-bold py-3.5 rounded-sm text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg shadow-[#C5A059]/20 transition-all cursor-pointer"
              >
                <span>Lanjut ke Form Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
