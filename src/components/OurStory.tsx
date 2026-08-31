import React, { useState } from 'react';
import { ArrowRight, Compass, Sparkles, Flame, Check, UtensilsCrossed } from 'lucide-react';
import { BONLES_IMAGES } from '../assets/productImages';
import { BonlesLogo } from './BonlesLogo';

interface OurStoryProps {
  onExploreCatalog?: () => void;
}

export const OurStory: React.FC<OurStoryProps> = ({ onExploreCatalog }) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const handleScrollToCatalog = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onExploreCatalog) {
      onExploreCatalog();
    } else {
      const el = document.getElementById('catalog');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section
      id="our-story"
      aria-label="Brand Story — Dari Borneo, Lahir Sebuah Rasa"
      className="relative bg-[#0D0D0F] text-[#E8E4D9] overflow-hidden border-b border-white/10"
    >
      {/* Subtle organic Borneo botanical / water ripple ambient background glows */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-[#0E2A1C]/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-0 w-[600px] h-[600px] bg-[#C5A059]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* ========================================================================= */}
      {/* SECTION HEADER: Editorial Magazine Layout                                */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-16">
        {/* Subtle Borneo Organic Wave divider */}
        <div className="flex items-center gap-3 mb-8">
          <span className="h-px w-10 bg-[#C5A059]/60" />
          <span className="text-[11px] font-sans tracking-[0.3em] text-[#C5A059] font-bold uppercase">
            OUR STORY
          </span>
          <span className="h-px w-20 bg-white/10" />
        </div>

        {/* Asymmetrical Editorial Header Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-end">
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#F4F1EA] font-normal tracking-tight leading-[1.12]">
              Dari Borneo, <br className="hidden sm:inline" />
              <span className="italic font-serif text-[#C5A059] font-normal">Lahir Sebuah Rasa.</span>
            </h2>

            <p className="text-base sm:text-lg text-[#B5B0A4] font-light max-w-2xl leading-relaxed">
              Kekayaan lokal, kreativitas, dan sebuah cerita yang kami bawa lebih jauh.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-end space-y-4">
            <p className="text-xs sm:text-sm text-[#8E8A80] leading-relaxed font-light border-l border-[#C5A059]/40 pl-4">
              Menghubungkan hasil tangkapan nelayan perairan Kalimantan Timur dengan seni pengolahan modern bercita rasa luhur.
            </p>
            <div className="pt-2">
              <a
                href="#story-part-01"
                className="inline-flex items-center gap-2 text-xs font-sans font-semibold tracking-widest uppercase text-[#F4F1EA] hover:text-[#C5A059] transition-colors group"
              >
                <span>Mulai Telusuri Cerita Kami</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#C5A059]" />
              </a>
            </div>
          </div>
        </div>

        {/* Hero Visual Editorial Window */}
        <div className="mt-14 relative rounded-sm overflow-hidden border border-white/10 bg-[#161618] shadow-2xl">
          <div className="relative aspect-[21/9] min-h-[280px] sm:min-h-[420px] w-full overflow-hidden">
            <img
              src={BONLES_IMAGES.borneoRiver}
              alt="Bentang alam perairan Kalimantan Timur Borneo - PT Bonles Food Nusantara"
              referrerPolicy="no-referrer"
              loading="lazy"
              className="w-full h-full object-cover object-center filter brightness-90 hover:scale-[1.02] transition-transform duration-1000"
            />
            {/* Cinematic Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0F] via-transparent to-black/30" />

            {/* Editorial Caption Badge */}
            <div className="absolute bottom-6 left-6 right-6 sm:right-auto max-w-md bg-[#0D0D0F]/90 backdrop-blur-md p-4 sm:p-5 border border-white/10 rounded-sm">
              <div className="flex items-center gap-2 mb-1">
                <Compass className="w-3.5 h-3.5 text-[#00D222]" />
                <span className="text-[10px] tracking-[0.25em] text-[#C5A059] font-bold uppercase">
                  Kalimantan Timur, Indonesia
                </span>
              </div>
              <p className="text-xs text-[#E8E4D9] font-light leading-relaxed">
                Hutan hujan tropis, aliran sungai yang subur, dan pesisir kaya perikanan menjadi titik awal dedikasi kami.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STORYTELLING SEQUENCE: Part 01 to Part 04                                 */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-24 sm:space-y-32">
        
        {/* ----------------------------------------------------------------------- */}
        {/* PART 01: ROOTED IN BORNEO                                              */}
        {/* ----------------------------------------------------------------------- */}
        <article id="story-part-01" className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1 space-y-5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xs bg-[#161618] border border-[#C5A059]/30 text-[#C5A059]">
              <span className="text-[10px] tracking-[0.2em] font-mono font-semibold uppercase">
                01 — ROOTED IN BORNEO
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[#F4F1EA] font-normal leading-snug">
              Berawal dari <br />
              <span className="italic text-[#C5A059]">Kekayaan Lokal</span>
            </h3>

            <p className="text-sm sm:text-base text-[#B5B0A4] leading-relaxed font-light">
              &ldquo;Berawal dari kekayaan hasil perairan Kalimantan Timur, kami ingin membuktikan bahwa pangan lokal Borneo dapat diolah menjadi camilan modern yang memiliki nilai dan cerita.&rdquo;
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs text-[#8E8A80]">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D222]" />
                Bahan Baku Segar Pilihan
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                Kearifan Pangan Nusantara
              </span>
            </div>
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="relative rounded-sm overflow-hidden bg-[#161618] border border-white/10 shadow-xl group">
              <img
                src={BONLES_IMAGES.borneoRiver}
                alt="Perairan dan alam Borneo Kalimantan Timur"
                referrerPolicy="no-referrer"
                loading="lazy"
                className="w-full h-72 sm:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-700 filter brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0D0D0F]/80 via-transparent to-transparent" />
              <div className="absolute top-4 right-4 bg-[#0D0D0F]/80 backdrop-blur-sm border border-white/10 px-3 py-1 rounded-xs text-[10px] uppercase font-mono tracking-widest text-[#E8E4D9]">
                Authentic Origin
              </div>
            </div>
          </div>
        </article>

        {/* ----------------------------------------------------------------------- */}
        {/* PART 02: THE INNOVATION                                                 */}
        {/* ----------------------------------------------------------------------- */}
        <article id="story-part-02" className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 items-center">
          <div className="lg:col-span-7">
            <div className="relative rounded-sm overflow-hidden bg-[#161618] border border-white/10 shadow-xl group">
              <img
                src={BONLES_IMAGES.ikanBawisChips}
                alt="Keripik Ikan Bawis High Protein Fish Crunch tanpa tulang tengah"
                referrerPolicy="no-referrer"
                loading="lazy"
                className="w-full h-72 sm:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0F]/90 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 bg-[#0D0D0F]/85 backdrop-blur-md p-3.5 border border-white/10 rounded-xs flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-[#00D222] font-bold block">
                    Modern Processing
                  </span>
                  <p className="text-xs text-[#F4F1EA] font-medium">Tanpa Tulang Tengah • Ekstra Renyah</p>
                </div>
                <span className="text-xs font-mono font-bold text-[#C5A059] px-2 py-0.5 bg-[#C5A059]/10 rounded-xs">
                  High Protein
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xs bg-[#161618] border border-[#C5A059]/30 text-[#C5A059]">
              <span className="text-[10px] tracking-[0.2em] font-mono font-semibold uppercase">
                02 — THE INNOVATION
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[#F4F1EA] font-normal leading-snug">
              Dari Ikan Bawis <br />
              <span className="italic text-[#C5A059]">Menjadi Sebuah Inovasi</span>
            </h3>

            <p className="text-sm sm:text-base text-[#B5B0A4] leading-relaxed font-light">
              &ldquo;Ikan Bawis kami pilih dan olah menjadi keripik ikan tanpa tulang tengah, sehingga menghasilkan camilan yang renyah, praktis, dan kaya protein.&rdquo;
            </p>

            <p className="text-sm sm:text-base text-[#D4CFBE] leading-relaxed font-normal border-l-2 border-[#C5A059] pl-3">
              &ldquo;Dari sinilah lahir Keripik Ikan Bawis – High Protein Fish Crunch, sebuah inovasi yang membawa potensi ikan lokal ke dalam bentuk yang lebih dekat dengan selera generasi masa kini.&rdquo;
            </p>
          </div>
        </article>

        {/* ----------------------------------------------------------------------- */}
        {/* PART 03: THE BORNEO FLAVOR                                              */}
        {/* ----------------------------------------------------------------------- */}
        <article id="story-part-03" className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1 space-y-5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xs bg-[#161618] border border-[#E81818]/40 text-[#E81818]">
              <span className="text-[10px] tracking-[0.2em] font-mono font-semibold uppercase">
                03 — THE BORNEO FLAVOR
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[#F4F1EA] font-normal leading-snug">
              Sentuhan Rasa <br />
              <span className="italic text-[#E81818]">Khas Borneo</span>
            </h3>

            <p className="text-sm sm:text-base text-[#B5B0A4] leading-relaxed font-light">
              &ldquo;Untuk memberikan pengalaman rasa yang berbeda, kami menghadirkan Sambal Bawang Dayak sebagai varian spesial.&rdquo;
            </p>

            {/* Micro-copy & Dip explanation box */}
            <div className="p-4 rounded-sm bg-[#161618] border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#F4F1EA]">
                <UtensilsCrossed className="w-4 h-4 text-[#E81818]" />
                <span>Keripik Ikan Bawis + 1 Sachet Sambal Bawang Dayak</span>
              </div>

              <div className="inline-block px-2.5 py-1 rounded-xs bg-[#E81818]/15 border border-[#E81818]/30">
                <span className="text-[11px] font-sans font-bold text-[#E81818] tracking-wider uppercase">
                  Cocol sesuai selera.
                </span>
              </div>

              <p className="text-xs text-[#9E9A8E] leading-relaxed font-light">
                Sambal dikemas dalam satu sachet cocolan higienis sehingga konsumen dapat menikmati perpaduan gurih-renyah keripik ikan dengan sensasi pedas dan cita rasa khas Borneo kapan pun diinginkan.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="relative rounded-sm overflow-hidden bg-[#161618] border border-white/10 shadow-xl group">
              <img
                src={BONLES_IMAGES.sambalDayakDip}
                alt="Keripik Ikan Bawis dengan cocolan Sambal Bawang Dayak sachet"
                referrerPolicy="no-referrer"
                loading="lazy"
                className="w-full h-72 sm:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0F]/80 via-transparent to-transparent" />
              <div className="absolute top-4 left-4 bg-[#0D0D0F]/80 backdrop-blur-sm border border-white/10 px-3 py-1 rounded-xs text-[10px] uppercase font-mono tracking-widest text-[#E81818]">
                Signature Dipping Sachet
              </div>
            </div>
          </div>
        </article>

        {/* ----------------------------------------------------------------------- */}
        {/* PART 04: MORE THAN A SNACK                                              */}
        {/* ----------------------------------------------------------------------- */}
        <article id="story-part-04" className="border-t border-white/10 pt-16 sm:pt-20">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-[#161618] border border-[#C5A059]/30 text-[#C5A059]">
              <span className="text-[10px] tracking-[0.25em] font-mono font-semibold uppercase">
                04 — MORE THAN A SNACK
              </span>
            </div>

            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#F4F1EA] font-normal leading-tight">
              Lebih dari Sekadar Keripik
            </h3>

            <p className="text-base sm:text-xl text-[#D4CFBE] font-serif italic leading-relaxed max-w-3xl mx-auto">
              &ldquo;Bagi kami, produk ini bukan sekadar keripik. Ini adalah cerita tentang bagaimana kekayaan alam Borneo dapat diberi sentuhan kreativitas, menjadi produk bernilai tambah, sekaligus memperkenalkan cita rasa lokal kepada Indonesia dan dunia.&rdquo;
            </p>

            {/* Visual Process Journey */}
            <div className="pt-8">
              <div className="p-5 sm:p-6 rounded-sm bg-[#141416] border border-white/10 max-w-3xl mx-auto">
                <span className="text-[10px] tracking-[0.25em] text-[#C5A059] uppercase font-mono font-semibold block mb-4">
                  THE VALUE CREATION JOURNEY
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-sans font-medium text-[#E8E4D9]">
                  <span className="px-3 py-1.5 rounded-xs bg-[#1A1A1E] border border-white/5">Borneo</span>
                  <span className="text-[#C5A059]">→</span>
                  <span className="px-3 py-1.5 rounded-xs bg-[#1A1A1E] border border-white/5">Ikan Bawis</span>
                  <span className="text-[#C5A059]">→</span>
                  <span className="px-3 py-1.5 rounded-xs bg-[#1A1A1E] border border-white/5">Inovasi</span>
                  <span className="text-[#C5A059]">→</span>
                  <span className="px-3 py-1.5 rounded-xs bg-[#1A1A1E] border border-white/5">Fish Crunch</span>
                  <span className="text-[#C5A059]">→</span>
                  <span className="px-3 py-1.5 rounded-xs bg-[#1A1A1E] border border-white/5">Sambal Bawang Dayak</span>
                  <span className="text-[#00D222]">→</span>
                  <span className="px-3 py-1.5 rounded-xs bg-[#00D222]/15 border border-[#00D222]/30 text-[#00D222] font-semibold">
                    Modern Borneo Snack
                  </span>
                </div>
              </div>
            </div>
          </div>
        </article>

      </div>

      {/* ========================================================================= */}
      {/* SIGNATURE QUOTE: Brand Manifesto                                         */}
      {/* ========================================================================= */}
      <div className="relative py-24 sm:py-32 bg-[#08120D] border-y border-white/10 text-center overflow-hidden">
        {/* Subtle deep forest ambient backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(#00D222_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.03] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#0E2A1C]/50 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
          <span className="w-12 h-px bg-[#C5A059] mx-auto block" />

          <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[#F4F1EA] font-normal leading-relaxed max-w-3xl mx-auto">
            &ldquo;Kekayaan daerah bukan hanya untuk dikenang—tetapi bisa dikembangkan, dinikmati, dan dibawa lebih jauh melalui sebuah rasa.&rdquo;
          </blockquote>

          <div className="pt-2">
            <p className="text-xs uppercase font-sans tracking-[0.25em] text-[#C5A059] font-bold">
              PT. BONLES FOOD NUSANTARA
            </p>
            <p className="text-[11px] text-[#7A7568] tracking-widest mt-1">
              AUTHENTIC BORNEO • MODERN CRAFT • PREMIUM SNACK
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CLOSING STATEMENT & CTA                                                   */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[#F4F1EA]">
              Dari <span className="text-[#C5A059] italic font-semibold font-serif">Borneo</span>.
            </p>
            <p className="text-xl sm:text-2xl text-[#B5B0A4] font-serif">
              Lahir dari kekayaan lokal.
            </p>
            <p className="text-xl sm:text-2xl text-[#E8E4D9] font-serif font-light">
              Menuju Indonesia dan dunia.
            </p>
          </div>

          <p className="text-xs sm:text-sm text-[#8E8A80] font-light max-w-lg mx-auto">
            Kunjungi katalog pilihan kami untuk menikmati aneka snack bernutrisi dalam kemasan pouch modern higienis.
          </p>

          <div className="pt-4">
            <button
              onClick={handleScrollToCatalog}
              className="inline-flex items-center gap-3 px-8 py-3.5 rounded-sm bg-[#C5A059] hover:bg-[#D4B06A] text-black font-sans font-semibold text-xs tracking-widest uppercase transition-all shadow-xl shadow-[#C5A059]/15 hover:shadow-[#C5A059]/25 cursor-pointer"
            >
              <span>Kenali Produk Kami</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
