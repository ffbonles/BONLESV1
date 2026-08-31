import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Filter, ArrowUpDown, Layers, ShoppingBag, 
  HelpCircle, CheckCircle2, ChevronRight, Search 
} from 'lucide-react';
import { Product, Category, CartItem, Order, Banner, Testimonial } from './types';
import { store } from './services/store';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { AboutSection } from './components/AboutSection';
import { OurStory } from './components/OurStory';
import { TestimonialsSection } from './components/TestimonialsSection';
import { RecentlyViewedSection } from './components/RecentlyViewedSection';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/Admin/AdminDashboard';

export default function App() {
  // App state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  // Filtering & Sorting
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'newest'>('featured');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock'>('all');

  // UI Modal toggles
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [activeDetailProduct, setActiveDetailProduct] = useState<Product | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Notification toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const loadData = () => {
    setProducts(store.getProducts(true)); // only active products for customer view
    setCategories(store.getCategories().filter(c => c.ACTIVE));
    setBanners(store.getBanners().filter(b => b.ACTIVE));
    setTestimonials(store.getTestimonials().filter(t => t.ACTIVE));
    setCartItems(store.getCart());
    setRecentlyViewed(store.getRecentlyViewed(4));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Track product view and open detail modal
  const handleViewProduct = (product: Product) => {
    setActiveDetailProduct(product);
    const updated = store.addRecentlyViewed(product.ID, 4);
    setRecentlyViewed([...updated]);
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    try {
      const updatedCart = store.addToCart(product, quantity);
      setCartItems([...updatedCart]);
      const updatedRecentlyViewed = store.addRecentlyViewed(product.ID, 4);
      setRecentlyViewed([...updatedRecentlyViewed]);
      showToast(`${quantity}x ${product.NAME} ditambahkan ke keranjang.`);
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan ke keranjang');
    }
  };

  const handleClearRecentlyViewed = () => {
    store.clearRecentlyViewed();
    setRecentlyViewed([]);
    showToast('Riwayat produk terakhir dilihat telah dikosongkan.');
  };

  const handleUpdateCartQty = (productId: string, quantity: number) => {
    try {
      const updatedCart = store.updateCartQuantity(productId, quantity);
      setCartItems([...updatedCart]);
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui kuantitas');
    }
  };

  const handleClearCart = () => {
    store.clearCart();
    setCartItems([]);
    showToast('Keranjang belanja dikosongkan.');
  };

  const handleOrderCompleted = (order: Order) => {
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setCartItems([]);
    loadData(); // refresh product stock
    setCompletedOrder(order);
  };

  // Filter & Sort Logic
  const filteredProducts = products.filter(p => {
    // Category match
    const matchCategory = selectedCategory === 'ALL' || p.CATEGORY_ID === selectedCategory || p.CATEGORY_NAME === selectedCategory;
    // Search match
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || p.NAME.toLowerCase().includes(q) || p.SKU.toLowerCase().includes(q) || p.CATEGORY_NAME.toLowerCase().includes(q) || p.DESCRIPTION.toLowerCase().includes(q);
    // Stock filter
    const matchStock = stockFilter === 'all' || p.STOCK > 0;

    return matchCategory && matchSearch && matchStock;
  });

  // Sort
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.DISCOUNT_PRICE > 0 && a.DISCOUNT_PRICE < a.PRICE ? a.DISCOUNT_PRICE : a.PRICE;
    const priceB = b.DISCOUNT_PRICE > 0 && b.DISCOUNT_PRICE < b.PRICE ? b.DISCOUNT_PRICE : b.PRICE;

    if (sortBy === 'price-low') return priceA - priceB;
    if (sortBy === 'price-high') return priceB - priceA;
    if (sortBy === 'newest') return new Date(b.CREATED_AT).getTime() - new Date(a.CREATED_AT).getTime();
    // Default featured
    return (b.FEATURED ? 1 : 0) - (a.FEATURED ? 1 : 0);
  });

  const featuredProducts = products.filter(p => p.FEATURED);
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (isAdminView) {
    return (
      <AdminDashboard
        onCloseAdmin={() => {
          setIsAdminView(false);
          loadData();
        }}
        onRefreshData={loadData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#E2E2E2] flex flex-col selection:bg-[#C5A059] selection:text-black">
      {/* Global Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161618] border border-[#C5A059] text-white px-4 py-3 rounded-sm shadow-2xl flex items-center gap-2.5 animate-slide-up text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-[#50C878]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        isAdmin={isAdminView}
        onToggleAdmin={() => setIsAdminView(!isAdminView)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNavigateHome={() => {
          setSelectedCategory('ALL');
          setSearchQuery('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Hero Section */}
      <Hero
        banner={banners[0]}
        onExploreCatalog={() => {
          const el = document.getElementById('catalog');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onFeaturedClick={() => {
          setSelectedCategory('ALL');
          setSortBy('featured');
          const el = document.getElementById('catalog');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Signature Brand Story Section — Dari Borneo, Lahir Sebuah Rasa */}
      <OurStory
        onExploreCatalog={() => {
          const el = document.getElementById('catalog');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Featured Showcase Strip (If no search query active) */}
      {!searchQuery && featuredProducts.length > 0 && (
        <section className="py-12 bg-[#0E0E10] border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[10px] tracking-[0.25em] text-[#C5A059] font-bold uppercase block">
                  Pilihan Rekomendasi
                </span>
                <h2 className="text-2xl font-serif-luxury text-white font-medium">
                  Produk Unggulan Bonles
                </h2>
              </div>
              <button
                onClick={() => {
                  setSelectedCategory('ALL');
                  setSortBy('featured');
                  const el = document.getElementById('catalog');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-xs text-[#C5A059] hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>Lihat Semua</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.slice(0, 3).map(product => (
                <ProductCard
                  key={product.ID}
                  product={product}
                  onViewDetail={handleViewProduct}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Catalog Section */}
      <main id="catalog" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div>
            <span className="text-xs tracking-[0.25em] text-[#C5A059] font-bold uppercase block">
              Digital Catalog
            </span>
            <h2 className="text-3xl font-serif-luxury text-white font-medium">
              Katalog Produk Resmi
            </h2>
            <p className="text-xs text-[#888888] mt-1">
              Menampilkan {sortedProducts.length} produk siap pesan via WhatsApp.
            </p>
          </div>

          {/* Controls: Category Filter Pills, Sort & Stock Filter */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Sort Selector */}
            <div className="flex items-center gap-2 bg-[#161618] border border-white/10 rounded-sm px-3 py-1.5 text-xs text-[#CCCCCC]">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#C5A059]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              >
                <option value="featured" className="bg-[#161618] text-white">Produk Unggulan</option>
                <option value="price-low" className="bg-[#161618] text-white">Harga Terendah</option>
                <option value="price-high" className="bg-[#161618] text-white">Harga Tertinggi</option>
                <option value="newest" className="bg-[#161618] text-white">Produk Terbaru</option>
              </select>
            </div>

            {/* Stock Filter Toggle */}
            <button
              onClick={() => setStockFilter(stockFilter === 'all' ? 'in-stock' : 'all')}
              className={`px-3 py-1.5 rounded-sm text-xs font-medium border transition-colors ${
                stockFilter === 'in-stock'
                  ? 'bg-[#50C878]/10 text-[#50C878] border-[#50C878]/50'
                  : 'bg-[#161618] text-[#888888] border-white/10 hover:text-white'
              }`}
            >
              {stockFilter === 'in-stock' ? '✓ Hanya Stok Tersedia' : 'Semua Stok'}
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-sm text-xs tracking-wider uppercase font-semibold shrink-0 transition-all cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-[#C5A059] text-black shadow-md shadow-[#C5A059]/20'
                : 'bg-[#161618] text-[#888888] hover:text-white border border-white/5 hover:border-white/20'
            }`}
          >
            Semua Produk ({products.length})
          </button>

          {categories.map(cat => {
            const count = products.filter(p => p.CATEGORY_ID === cat.ID || p.CATEGORY_NAME === cat.NAME).length;
            return (
              <button
                key={cat.ID}
                onClick={() => setSelectedCategory(cat.ID)}
                className={`px-4 py-2 rounded-sm text-xs tracking-wider uppercase font-semibold shrink-0 transition-all cursor-pointer ${
                  selectedCategory === cat.ID
                    ? 'bg-[#C5A059] text-black shadow-md shadow-[#C5A059]/20'
                    : 'bg-[#161618] text-[#888888] hover:text-white border border-white/5 hover:border-white/20'
                }`}
              >
                {cat.NAME} ({count})
              </button>
            );
          })}
        </div>

        {/* Active Filters Summary */}
        {(searchQuery || selectedCategory !== 'ALL' || stockFilter !== 'all') && (
          <div className="bg-[#161618] border border-white/5 p-3 rounded-sm flex items-center justify-between text-xs text-[#888888]">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Filter Aktif: </span>
              {searchQuery && <span className="text-white font-mono">"{searchQuery}"</span>}
              {selectedCategory !== 'ALL' && (
                <span className="text-[#C5A059]">
                  {categories.find(c => c.ID === selectedCategory)?.NAME}
                </span>
              )}
              {stockFilter === 'in-stock' && <span className="text-[#50C878]">• Ready Stock</span>}
            </div>

            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSearchQuery('');
                setStockFilter('all');
              }}
              className="text-xs text-[#C5A059] hover:underline"
            >
              Reset Filter
            </button>
          </div>
        )}

        {/* Products Grid */}
        {sortedProducts.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center bg-[#161618] border border-white/5 rounded-sm p-8 space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#0A0A0B] border border-white/10 flex items-center justify-center text-[#666666]">
              <Search className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-serif-luxury text-white">Produk Tidak Ditemukan</h3>
              <p className="text-xs text-[#888888] mt-1">
                Coba gunakan kata kunci atau kategori yang berbeda, atau reset filter pencarian Anda.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSearchQuery('');
                setStockFilter('all');
              }}
              className="bg-[#C5A059] text-black font-semibold px-5 py-2 rounded-sm text-xs tracking-wider uppercase transition-all cursor-pointer"
            >
              Lihat Semua Produk
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map(product => (
              <ProductCard
                key={product.ID}
                product={product}
                onViewDetail={handleViewProduct}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </main>

      {/* About Section */}
      <AboutSection />

      {/* Testimonials Section */}
      <TestimonialsSection testimonials={testimonials} />

      {/* Recently Viewed Section (Bottom of Page) */}
      <RecentlyViewedSection
        products={recentlyViewed}
        onViewDetail={handleViewProduct}
        onAddToCart={handleAddToCart}
        onClearHistory={handleClearRecentlyViewed}
      />

      {/* Footer */}
      <Footer />

      {/* MODALS */}
      {/* Product Detail View */}
      <ProductDetailModal
        product={activeDetailProduct}
        onClose={() => setActiveDetailProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQty}
        onClearCart={handleClearCart}
        onProceedCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* Order Success & WhatsApp CTA Modal */}
      <OrderSuccessModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
      />
    </div>
  );
}
