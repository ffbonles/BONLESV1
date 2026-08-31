import React from 'react';
import { Clock, Trash2, ChevronRight, Eye } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface RecentlyViewedSectionProps {
  products: Product[];
  onViewDetail: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onClearHistory: () => void;
}

export const RecentlyViewedSection: React.FC<RecentlyViewedSectionProps> = ({
  products,
  onViewDetail,
  onAddToCart,
  onClearHistory,
}) => {
  // If no items have been viewed yet, return null or an invitation to explore
  if (products.length === 0) {
    return null;
  }

  return (
    <section
      id="recently-viewed-section"
      className="py-16 bg-[#0E0E10] border-t border-white/10 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Title & Clear History Action */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-white/5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="text-[10px] tracking-[0.25em] text-[#C5A059] font-bold uppercase block">
                Riwayat Jelajah
              </span>
            </div>
            <h2 className="text-2xl font-serif-luxury text-white font-medium">
              Terakhir Dilihat
            </h2>
            <p className="text-xs text-[#888888]">
              Menampilkan {products.length} produk terakhir yang baru saja Anda lihat.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-clear-recently-viewed"
              onClick={onClearHistory}
              className="text-xs text-[#888888] hover:text-red-400 flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#161618] border border-white/5 hover:border-red-900/40 transition-colors cursor-pointer"
              title="Hapus riwayat produk yang terakhir dilihat"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Riwayat</span>
            </button>
          </div>
        </div>

        {/* Responsive Grid displaying the last 4 products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 4).map((product) => (
            <ProductCard
              key={`recently-viewed-${product.ID}`}
              product={product}
              onViewDetail={onViewDetail}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
