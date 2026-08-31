import React from 'react';
import { ShoppingBag, Eye, Star, AlertTriangle, CheckCircle2, Ban } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onViewDetail: (p: Product) => void;
  onAddToCart: (p: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetail,
  onAddToCart,
}) => {
  const isOutOfStock = product.STOCK <= 0;
  const isLowStock = product.STOCK > 0 && product.STOCK <= 5;
  const hasDiscount = product.DISCOUNT_PRICE > 0 && product.DISCOUNT_PRICE < product.PRICE;
  const effectivePrice = hasDiscount ? product.DISCOUNT_PRICE : product.PRICE;

  const fallbackImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';

  return (
    <div
      id={`product-card-${product.SKU}`}
      className="group bg-[#20080C] border border-[#D82824]/25 hover:border-[#D82824] rounded-sm overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-[#D82824]/15"
    >
      {/* Image Container */}
      <div className="relative aspect-4/3 w-full bg-[#140507] overflow-hidden">
        <img
          src={product.MAIN_IMAGE_URL || fallbackImage}
          alt={product.NAME}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImage;
          }}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#20080C] via-transparent to-transparent opacity-60" />

        {/* Badges on Top Left */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.FEATURED && (
            <span className="inline-flex items-center gap-1 bg-[#F5A623] text-black text-[10px] font-bold px-2 py-0.5 rounded-xs tracking-wider uppercase shadow-md">
              <Star className="w-3 h-3 fill-black" />
              Unggulan
            </span>
          )}
          {hasDiscount && (
            <span className="inline-flex items-center bg-[#D82824] text-white text-[10px] font-bold px-2 py-0.5 rounded-xs tracking-wider uppercase shadow-md shadow-[#D82824]/30">
              Hemat Rp {(product.PRICE - product.DISCOUNT_PRICE).toLocaleString('id-ID')}
            </span>
          )}
        </div>

        {/* Stock Badge Top Right */}
        <div className="absolute top-2.5 right-2.5 z-10">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1 bg-red-950/90 border border-red-700 text-red-300 text-[10px] font-semibold px-2 py-0.5 rounded-xs">
              <Ban className="w-3 h-3 text-red-400" />
              STOK HABIS
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center gap-1 bg-amber-950/90 border border-amber-600 text-[#FFD369] text-[10px] font-semibold px-2 py-0.5 rounded-xs animate-pulse">
              <AlertTriangle className="w-3 h-3 text-[#F5A623]" />
              Sisa {product.STOCK}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-[#140507]/85 border border-[#00D222]/40 text-[#00D222] text-[10px] font-medium px-2 py-0.5 rounded-xs">
              <CheckCircle2 className="w-3 h-3 text-[#00D222]" />
              Stok: {product.STOCK}
            </span>
          )}
        </div>

        {/* Quick View Button on Hover */}
        <button
          onClick={() => onViewDetail(product)}
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
          aria-label="Lihat Detail Produk"
        >
          <span className="bg-[#1C070A]/95 text-white border border-[#F5A623] px-3.5 py-1.5 rounded-sm text-xs tracking-wider uppercase font-medium flex items-center gap-1.5 shadow-lg">
            <Eye className="w-3.5 h-3.5 text-[#F5A623]" />
            Lihat Detail
          </span>
        </button>
      </div>

      {/* Content Info */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-[11px] text-[#A89886] mb-1">
            <span className="uppercase tracking-widest text-[#F5A623] font-semibold">{product.CATEGORY_NAME}</span>
            <span className="font-mono text-[#8C7B6D]">{product.SKU}</span>
          </div>

          <h3
            onClick={() => onViewDetail(product)}
            className="text-sm font-semibold text-[#FFFDF9] group-hover:text-[#F5A623] transition-colors line-clamp-2 cursor-pointer"
            title={product.NAME}
          >
            {product.NAME}
          </h3>

          <div className="text-xs text-[#A89886] mt-1">
            <span>Kemasan: </span>
            <span className="text-[#E5D8C7] font-medium">{product.WEIGHT || '100g'}</span>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-2 border-t border-[#D82824]/20">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-base font-bold text-[#FFFDF9] tracking-tight">
              Rp {effectivePrice.toLocaleString('id-ID')}
            </span>
            {hasDiscount && (
              <span className="text-xs text-[#8C7B6D] line-through">
                Rp {product.PRICE.toLocaleString('id-ID')}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onViewDetail(product)}
              className="w-full bg-[#2B0C10] hover:bg-[#381016] text-[#E5D8C7] hover:text-white border border-[#D82824]/30 hover:border-[#D82824]/60 py-2 rounded-sm text-xs tracking-wider uppercase font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#F5A623]" />
              <span>Detail</span>
            </button>

            <button
              onClick={() => onAddToCart(product)}
              disabled={isOutOfStock}
              className={`w-full py-2 rounded-sm text-xs tracking-wider uppercase font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isOutOfStock
                  ? 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#D82824] via-[#BE1A18] to-[#991313] hover:from-[#E53935] hover:to-[#B71C1C] text-white shadow-sm hover:shadow-md hover:shadow-[#D82824]/30'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isOutOfStock ? 'Habis' : '+ Pesan'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
