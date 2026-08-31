import React from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { Testimonial } from '../types';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials }) => {
  return (
    <section className="py-20 bg-[#140507] border-t border-[#D82824]/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs tracking-[0.25em] text-[#F5A623] font-bold uppercase block">
            Ulasan Konsumen
          </span>
          <h2 className="text-3xl font-serif-luxury text-[#FFFDF9] font-medium">
            Apa Kata Mereka Tentang Bonles
          </h2>
          <p className="text-xs text-[#A89886]">
            Kepuasan pelanggan atas kerenyahan dan kualitas camilan tinggi protein Bonles Food Nusantara.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item) => (
            <div
              key={item.ID}
              className="bg-[#240A0E] border border-[#D82824]/20 p-6 rounded-sm flex flex-col justify-between space-y-4 hover:border-[#F5A623]/60 transition-colors shadow-sm"
            >
              <div className="space-y-3">
                {/* Rating stars */}
                <div className="flex gap-1 text-[#F5A623]">
                  {Array.from({ length: item.RATING || 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#F5A623]" />
                  ))}
                </div>

                <p className="text-xs text-[#E5D8C7] italic leading-relaxed">
                  "{item.MESSAGE}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-[#D82824]/15">
                <img
                  src={
                    item.PHOTO_URL ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                  }
                  alt={item.CUSTOMER_NAME}
                  className="w-9 h-9 rounded-full object-cover border border-[#F5A623]/40"
                />
                <div>
                  <h4 className="text-xs font-semibold text-[#FFFDF9]">{item.CUSTOMER_NAME}</h4>
                  <span className="text-[10px] text-[#A89886]">Pelanggan Terverifikasi</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
