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
        <div className="w-screen max-w-md bg-[#1C070B] border-l border-[#D82824]/30 flex flex-col justify-between shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-[#D82824]/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#F5A623]" />
              <h2 className="text-lg font-serif-luxury text-[#FFFDF9] font-medium">Keranjang Belanja</h2>
              <span className="text-xs bg-[#140507] text-[#F5A623] px-2 py-0.5 rounded-full border border-[#F5A623]/30">
                {totalItems} item
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-[#A89886] hover:text-[#FFFDF9] p-1 rounded-sm border border-[#D82824]/20 hover:border-[#D82824] transition-colors"
              aria-label="Tutup Keranjang"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#140507] border border-[#D82824]/30 flex items-center justify-center text-[#A89886]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#FFFDF9]">Keranjang Anda Masih Kosong</h3>
                  <p className="text-xs text-[#A89886] mt-1 max-w-xs">
                    Pilih aneka snack tinggi protein dan oleh-oleh nusantara favorit Anda dari katalog.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="mt-2 bg-[#2B0A0F] hover:bg-[#3E0E16] text-[#F5A623] border border-[#F5A623]/40 px-5 py-2 rounded-sm text-xs tracking-wider uppercase font-medium transition-colors"
                >
                  Mulai Belanja
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-[#D82824]/20 text-xs text-[#A89886]">
                  <span>Daftar Produk</span>
                  <button
                    onClick={onClearCart}
                    className="text-[#E53935] hover:text-[#FF6B6B] flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
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
                        className="bg-[#140507] border border-[#D82824]/20 rounded-sm p-3 flex gap-3 items-center justify-between"
                      >
                        <img
                          src={
                            product.MAIN_IMAGE_URL ||
                            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'
                          }
                          alt={product.NAME}
                          className="w-14 h-14 object-cover rounded-xs border border-[#D82824]/30 shrink-0"
                        />

                        <div className="flex-1 min-w-0 pr-2">
                          <h4 className="text-xs font-semibold text-[#FFFDF9] truncate" title={product.NAME}>
                            {product.NAME}
                          </h4>
                          <p className="text-[11px] text-[#A89886] font-mono">
                            Rp {price.toLocaleString('id-ID')} x {quantity}
                          </p>
                          <p className="text-xs font-bold text-[#F5A623]">
                            Rp {lineTotal.toLocaleString('id-ID')}
                          </p>

                          {isExceedStock && (
                            <div className="flex items-center gap-1 text-[10px] text-[#E53935] mt-1">
                              <AlertCircle className="w-3 h-3" />
                              <span>Stok hanya tersisa {product.STOCK}</span>
                            </div>
                          )}
                        </div>

                        {/* Quantity controls */}
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center border border-[#D82824]/30 rounded-xs bg-[#240A0E]">
                            <button
                              onClick={() => onUpdateQuantity(product.ID, quantity - 1)}
                              className="px-2 py-1 text-xs text-white hover:text-[#F5A623] transition-colors"
                              aria-label="Kurangi"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 py-0.5 text-xs font-bold text-[#FFFDF9] font-mono min-w-6 text-center">
                              {quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(product.ID, quantity + 1)}
                              disabled={quantity >= product.STOCK}
                              className="px-2 py-1 text-xs text-white hover:text-[#F5A623] disabled:opacity-30 transition-colors"
                              aria-label="Tambah"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => onUpdateQuantity(product.ID, 0)}
                            className="text-[11px] text-[#A89886] hover:text-[#E53935] transition-colors cursor-pointer"
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
            <div className="p-6 border-t border-[#D82824]/20 bg-[#140507] space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#A89886]">
                  <span>Subtotal Produk</span>
                  <span className="text-[#FFFDF9] font-mono">Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-[#A89886]">
                  <span>Estimasi Pengiriman</span>
                  <span className="text-[#DCD1C0]">Dihitung saat checkout</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#FFFDF9] pt-2 border-t border-[#D82824]/20">
                  <span>Total Belanja</span>
                  <span className="text-[#F5A623] font-mono text-base">
                    Rp {subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <button
                onClick={onProceedCheckout}
                className="w-full bg-gradient-to-r from-[#D82824] to-[#B51E1A] hover:from-[#E53935] hover:to-[#D82824] text-white font-bold py-3.5 rounded-sm text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg shadow-[#D82824]/30 transition-all cursor-pointer"
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
