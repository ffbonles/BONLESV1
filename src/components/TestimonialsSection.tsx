import React from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { Testimonial } from '../types';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials }) => {
  return (
    <section className="py-20 bg-[#0A0A0B] border-t border-white/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs tracking-[0.25em] text-[#C5A059] font-bold uppercase block">
            Ulasan Konsumen
          </span>
          <h2 className="text-3xl font-serif-luxury text-white font-medium">
            Apa Kata Mereka Tentang Bonles
          </h2>
          <p className="text-xs text-[#888888]">
            Kepuasan pelanggan atas kerenyahan dan kualitas camilan tinggi protein Bonles Food Nusantara.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item) => (
            <div
              key={item.ID}
              className="bg-[#161618] border border-white/10 p-6 rounded-sm flex flex-col justify-between space-y-4 hover:border-[#C5A059]/40 transition-colors"
            >
              <div className="space-y-3">
                {/* Rating stars */}
                <div className="flex gap-1 text-[#C5A059]">
                  {Array.from({ length: item.RATING || 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#C5A059]" />
                  ))}
                </div>

                <p className="text-xs text-[#CCCCCC] italic leading-relaxed">
                  "{item.MESSAGE}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                <img
                  src={
                    item.PHOTO_URL ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                  }
                  alt={item.CUSTOMER_NAME}
                  className="w-9 h-9 rounded-full object-cover border border-[#C5A059]/30"
                />
                <div>
                  <h4 className="text-xs font-semibold text-white">{item.CUSTOMER_NAME}</h4>
                  <span className="text-[10px] text-[#777777]">Pelanggan Terverifikasi</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
