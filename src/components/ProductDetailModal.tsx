import React, { useState } from 'react';
import { X, ShoppingBag, CheckCircle2, AlertTriangle, Ban, Star, ShieldCheck, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  if (!product) return null;

  const [selectedImage, setSelectedImage] = useState<string>(
    product.MAIN_IMAGE_URL || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
  );
  const [quantity, setQuantity] = useState<number>(1);

  const isOutOfStock = product.STOCK <= 0;
  const isLowStock = product.STOCK > 0 && product.STOCK <= 5;
  const hasDiscount = product.DISCOUNT_PRICE > 0 && product.DISCOUNT_PRICE < product.PRICE;
  const effectivePrice = hasDiscount ? product.DISCOUNT_PRICE : product.PRICE;

  // Build available gallery images list
  const galleryList = [
    { title: 'Utama', url: product.MAIN_IMAGE_URL },
    { title: 'Galeri 1', url: product.GALLERY_1_URL },
    { title: 'Galeri 2', url: product.GALLERY_2_URL },
    { title: 'Galeri 3', url: product.GALLERY_3_URL },
  ].filter(item => Boolean(item.url));

  const handleIncrease = () => {
    if (quantity < product.STOCK) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAdd = () => {
    if (!isOutOfStock) {
      onAddToCart(product, quantity);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-[#1E080C] border border-[#D82824]/30 rounded-sm shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold Accent Line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#F5A623] to-transparent" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-[#DCD1C0] hover:text-[#FFFDF9] bg-[#140507]/80 hover:bg-[#140507] p-2 rounded-full border border-[#D82824]/30 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8">
          {/* Left Gallery & Media Column */}
          <div className="md:col-span-5 flex flex-col gap-3">
            <div className="relative aspect-square w-full rounded-sm overflow-hidden bg-[#140507] border border-[#D82824]/20">
              <img
                src={selectedImage}
                alt={product.NAME}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              {product.FEATURED && (
                <span className="absolute top-3 left-3 bg-[#F5A623] text-[#140507] text-[10px] font-bold px-2 py-0.5 rounded-xs tracking-wider uppercase flex items-center gap-1 shadow-md">
                  <Star className="w-3 h-3 fill-[#140507]" />
                  Unggulan
                </span>
              )}
            </div>

            {/* Gallery Thumbnails */}
            {galleryList.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {galleryList.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img.url)}
                    className={`relative w-14 h-14 rounded-xs overflow-hidden border shrink-0 transition-all ${
                      selectedImage === img.url
                        ? 'border-[#F5A623] ring-1 ring-[#F5A623]'
                        : 'border-[#D82824]/20 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Micro Trust Info */}
            <div className="bg-[#140507] border border-[#D82824]/20 p-3 rounded-sm text-xs space-y-1.5 text-[#A89886] mt-auto">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#F5A623]" />
                <span>Pangan Olahan Berkualitas Nusantara</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00D222]" />
                <span>Diproduksi Bersih dengan Standar Higienis</span>
              </div>
            </div>
          </div>

          {/* Right Info Column */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              {/* Category & SKU */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#F5A623] tracking-widest uppercase font-semibold">
                  {product.CATEGORY_NAME}
                </span>
                <span className="font-mono text-[#A89886] bg-[#140507] px-2 py-0.5 rounded-xs border border-[#D82824]/20">
                  SKU: {product.SKU}
                </span>
              </div>

              {/* Product Name */}
              <h2 className="text-xl sm:text-2xl font-serif-luxury text-[#FFFDF9] font-medium leading-snug">
                {product.NAME}
              </h2>

              {/* Price & Weight */}
              <div className="flex items-baseline gap-3 pb-2 border-b border-[#D82824]/20">
                <span className="text-2xl font-bold text-[#FFFDF9] tracking-tight">
                  Rp {effectivePrice.toLocaleString('id-ID')}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-[#A89886] line-through">
                    Rp {product.PRICE.toLocaleString('id-ID')}
                  </span>
                )}
                <span className="ml-auto text-xs text-[#DCD1C0] bg-[#140507] border border-[#D82824]/20 px-2 py-1 rounded-xs">
                  Netto: {product.WEIGHT || '100g'}
                </span>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 text-xs">
                {isOutOfStock ? (
                  <span className="flex items-center gap-1.5 text-[#E53935] bg-[#3B0C10] border border-[#D82824]/60 px-2.5 py-1 rounded-xs font-semibold">
                    <Ban className="w-3.5 h-3.5" />
                    STOK HABIS (Tidak dapat dipesan)
                  </span>
                ) : isLowStock ? (
                  <span className="flex items-center gap-1.5 text-[#F5A623] bg-[#3B220C] border border-[#F5A623]/60 px-2.5 py-1 rounded-xs font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Stok Terbatas: Sisa {product.STOCK} unit
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[#00D222] bg-[#0A2610] border border-[#00D222]/40 px-2.5 py-1 rounded-xs font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Stok Tersedia: {product.STOCK} unit siap kirim
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <h4 className="text-xs uppercase tracking-wider text-[#A89886] font-bold">Deskripsi</h4>
                <p className="text-xs sm:text-sm text-[#DCD1C0] leading-relaxed font-light">
                  {product.DESCRIPTION || 'Deskripsi produk resmi Bonles Food Nusantara.'}
                </p>
              </div>

              {/* Composition & Nutrition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {product.COMPOSITION && (
                  <div className="bg-[#140507] p-2.5 rounded-sm border border-[#D82824]/20">
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#F5A623] mb-1">
                      Komposisi
                    </h5>
                    <p className="text-[11px] text-[#A89886] leading-snug">{product.COMPOSITION}</p>
                  </div>
                )}

                {product.NUTRITION && (
                  <div className="bg-[#140507] p-2.5 rounded-sm border border-[#D82824]/20">
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#F5A623] mb-1">
                      Informasi Gizi
                    </h5>
                    <p className="text-[11px] text-[#A89886] leading-snug">{product.NUTRITION}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity and Add to Cart Section */}
            <div className="pt-4 border-t border-[#D82824]/20 space-y-3">
              {!isOutOfStock && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#A89886] uppercase tracking-wider font-semibold">
                    Jumlah Pesanan:
                  </span>
                  <div className="flex items-center border border-[#D82824]/30 rounded-sm bg-[#140507]">
                    <button
                      onClick={handleDecrease}
                      disabled={quantity <= 1}
                      className="px-3 py-1.5 text-white hover:text-[#F5A623] disabled:opacity-30 disabled:hover:text-white transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 text-sm font-bold text-[#FFFDF9] min-w-10 text-center font-mono">
                      {quantity}
                    </span>
                    <button
                      onClick={handleIncrease}
                      disabled={quantity >= product.STOCK}
                      className="px-3 py-1.5 text-white hover:text-[#F5A623] disabled:opacity-30 disabled:hover:text-white transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={handleAdd}
                disabled={isOutOfStock}
                className={`w-full py-3.5 rounded-sm text-xs tracking-widest uppercase font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isOutOfStock
                    ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#D82824] to-[#B51E1A] hover:from-[#E53935] hover:to-[#D82824] text-white shadow-lg shadow-[#D82824]/30'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {isOutOfStock
                    ? 'Stok Tidak Tersedia'
                    : `Tambah ke Keranjang • Rp ${(effectivePrice * quantity).toLocaleString('id-ID')}`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
