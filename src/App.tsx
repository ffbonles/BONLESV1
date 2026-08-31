import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Filter, ArrowUpDown, Layers, ShoppingBag, 
  HelpCircle, CheckCircle2, ChevronRight, Search 
} from 'lucide-react';
import { Product, Category, CartItem, Order, Banner, Testimonial } from './types';
import { store, clearOldCookiesAndLegacyCache } from './services/store';
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
import { AdminLoginModal } from './components/AdminLoginModal';
import { authService } from './services/auth';

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
  const [isSuperAdminAuthenticated, setIsSuperAdminAuthenticated] = useState<boolean>(() => authService.isAuthenticated());
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState<boolean>(false);
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

  const handleToggleAdmin = () => {
    if (isAdminView) {
      // Toggle back to web store
      setIsAdminView(false);
    } else {
      // Check Super Administrator authentication
      if (authService.isAuthenticated()) {
        setIsAdminView(true);
      } else {
        setIsAdminLoginModalOpen(true);
      }
    }
  };

  const handleSuperAdminLoginSuccess = () => {
    setIsSuperAdminAuthenticated(true);
    setIsAdminView(true);
    showToast('Autentifikasi berhasil: Hak akses Admin aktif.');
  };

  const handleLogoutSuperAdmin = () => {
    authService.logout();
    setIsSuperAdminAuthenticated(false);
    setIsAdminView(false);
    showToast('Sesi Admin telah berhasil di-logout.');
  };

  const [isLiveSyncing, setIsLiveSyncing] = useState<boolean>(false);

  const loadData = () => {
    setProducts(store.getProducts(true)); // only active products for customer view
    setCategories(store.getCategories().filter(c => c.ACTIVE));
    setBanners(store.getBanners().filter(b => b.ACTIVE));
    setTestimonials(store.getTestimonials().filter(t => t.ACTIVE));
    setCartItems(store.getCart());
    setRecentlyViewed(store.getRecentlyViewed(4));
  };

  const handleManualSyncLive = async () => {
    setIsLiveSyncing(true);
    try {
      const res = await store.pullFromCloudSpreadsheet('MANUAL_USER_REFRESH');
      if (res.success) {
        showToast(res.message);
      } else {
        showToast(`Sinkronisasi: ${res.message}`);
      }
    } catch {
      showToast('Gagal menarik data terbaru dari Google Spreadsheet.');
    } finally {
      setIsLiveSyncing(false);
      loadData();
    }
  };

  useEffect(() => {
    // Purge outdated cookies & legacy caches to display fresh data
    clearOldCookiesAndLegacyCache();

    // Initial local load
    loadData();

    // Subscribe to store updates (e.g. from background sync, admin updates, or pull requests)
    const unsubscribe = store.subscribe(() => {
      loadData();
    });

    // Auto pull live data from Google Spreadsheet on website startup
    store.pullFromCloudSpreadsheet('WEBSITE_AUTO_LOAD').then(res => {
      if (res.success && (res.productCount > 0 || res.categoryCount > 0)) {
        console.log(`[Google Sheets Auto-Sync] Data berhasil dimuat: ${res.productCount} produk, ${res.categoryCount} kategori.`);
      }
    }).catch(err => {
      console.warn('[Google Sheets Auto-Sync] Warning:', err);
    });

    // Secret shortcut for admin login (Ctrl+Shift+A or Cmd+Shift+A)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        handleToggleAdmin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      unsubscribe();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAdminView, isSuperAdminAuthenticated]);

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
        onLogout={handleLogoutSuperAdmin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#140507] text-[#F5EFE6] flex flex-col selection:bg-[#D82824] selection:text-white">
      {/* Global Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#240A0E] border border-[#F5A623] text-white px-4 py-3 rounded-sm shadow-2xl flex items-center gap-2.5 animate-slide-up text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-[#00D222]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        isAdmin={isAdminView}
        isAuthenticated={isSuperAdminAuthenticated}
        onToggleAdmin={handleToggleAdmin}
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
        <section className="py-14 bg-[#1A070A] border-b border-[#D82824]/20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[10px] tracking-[0.25em] text-[#F5A623] font-bold uppercase block">
                  Pilihan Rekomendasi
                </span>
                <h2 className="text-2xl font-serif-luxury text-[#FFFDF9] font-medium">
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
                className="text-xs text-[#F5A623] hover:text-white flex items-center gap-1 transition-colors font-medium"
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#D82824]/20 pb-6">
          <div>
            <span className="text-xs tracking-[0.25em] text-[#F5A623] font-bold uppercase block">
              Digital Catalog
            </span>
            <h2 className="text-3xl font-serif-luxury text-[#FFFDF9] font-medium">
              Katalog Produk Resmi
            </h2>
            <p className="text-xs text-[#A89886] mt-1">
              Menampilkan {sortedProducts.length} produk siap pesan langsung via WhatsApp.
            </p>
          </div>

          {/* Controls: Category Filter Pills, Sort & Stock Filter */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Sort Selector */}
            <div className="flex items-center gap-2 bg-[#20080C] border border-[#D82824]/30 rounded-sm px-3 py-1.5 text-xs text-[#E5D8C7]">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#F5A623]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-[#FFFDF9] focus:outline-none cursor-pointer"
              >
                <option value="featured" className="bg-[#20080C] text-white">Produk Unggulan</option>
                <option value="price-low" className="bg-[#20080C] text-white">Harga Terendah</option>
                <option value="price-high" className="bg-[#20080C] text-white">Harga Tertinggi</option>
                <option value="newest" className="bg-[#20080C] text-white">Produk Terbaru</option>
              </select>
            </div>

            {/* Stock Filter Toggle */}
            <button
              onClick={() => setStockFilter(stockFilter === 'all' ? 'in-stock' : 'all')}
              className={`px-3.5 py-1.5 rounded-sm text-xs font-medium border transition-colors ${
                stockFilter === 'in-stock'
                  ? 'bg-[#00D222]/15 text-[#00D222] border-[#00D222]/50'
                  : 'bg-[#20080C] text-[#A89886] border-[#D82824]/30 hover:text-white'
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
                ? 'bg-gradient-to-r from-[#D82824] to-[#B71C1C] text-white shadow-md shadow-[#D82824]/30'
                : 'bg-[#20080C] text-[#A89886] hover:text-white border border-[#D82824]/20 hover:border-[#D82824]/50'
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
                    ? 'bg-gradient-to-r from-[#D82824] to-[#B71C1C] text-white shadow-md shadow-[#D82824]/30'
                    : 'bg-[#20080C] text-[#A89886] hover:text-white border border-[#D82824]/20 hover:border-[#D82824]/50'
                }`}
              >
                {cat.NAME} ({count})
              </button>
            );
          })}
        </div>

        {/* Active Filters Summary */}
        {(searchQuery || selectedCategory !== 'ALL' || stockFilter !== 'all') && (
          <div className="bg-[#20080C] border border-[#D82824]/25 p-3 rounded-sm flex items-center justify-between text-xs text-[#A89886]">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#F5A623]" />
              <span>Filter Aktif: </span>
              {searchQuery && <span className="text-[#FFFDF9] font-mono">"{searchQuery}"</span>}
              {selectedCategory !== 'ALL' && (
                <span className="text-[#F5A623] font-semibold">
                  {categories.find(c => c.ID === selectedCategory)?.NAME}
                </span>
              )}
              {stockFilter === 'in-stock' && <span className="text-[#00D222] font-semibold">• Ready Stock</span>}
            </div>

            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSearchQuery('');
                setStockFilter('all');
              }}
              className="text-xs text-[#F5A623] hover:underline"
            >
              Reset Filter
            </button>
          </div>
        )}

        {/* Products Grid */}
        {sortedProducts.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center bg-[#20080C] border border-[#D82824]/20 rounded-sm p-8 space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#140507] border border-[#D82824]/30 flex items-center justify-center text-[#A89886]">
              <Search className="w-8 h-8 text-[#F5A623]" />
            </div>
            <div>
              <h3 className="text-lg font-serif-luxury text-[#FFFDF9]">Produk Tidak Ditemukan</h3>
              <p className="text-xs text-[#A89886] mt-1">
                Coba gunakan kata kunci atau kategori yang berbeda, atau reset filter pencarian Anda.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSearchQuery('');
                setStockFilter('all');
              }}
              className="bg-gradient-to-r from-[#D82824] to-[#B71C1C] text-white font-semibold px-5 py-2.5 rounded-sm text-xs tracking-wider uppercase transition-all cursor-pointer shadow-md shadow-[#D82824]/20"
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
      <Footer
        onOpenAdminLogin={() => handleToggleAdmin()}
        isAuthenticated={isSuperAdminAuthenticated}
      />

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

      {/* Super Administrator Login Gateway Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onLoginSuccess={handleSuperAdminLoginSuccess}
      />
    </div>
  );
}
