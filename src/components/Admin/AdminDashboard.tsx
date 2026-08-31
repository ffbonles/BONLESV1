import React, { useState } from 'react';
import { 
  LayoutDashboard, Package, FolderTree, Image as ImageIcon, ShoppingCart, 
  Users, Settings as SettingsIcon, FileText, Code2, Plus, Edit2, CheckCircle2, 
  AlertTriangle, Ban, Search, Copy, Check, ExternalLink, RefreshCw, Eye, ArrowUpRight,
  LogOut, ShieldCheck, UserCheck
} from 'lucide-react';
import { Product, Category, Order, Customer, Setting, SystemLog } from '../../types';
import { store } from '../../services/store';
import { authService, SUPERADMIN_CREDENTIALS } from '../../services/auth';
import { APPS_SCRIPT_FILES } from '../../data/appsScriptCode';
import { BonlesLogo } from '../BonlesLogo';

interface AdminDashboardProps {
  onCloseAdmin: () => void;
  onRefreshData: () => void;
  onLogout: () => void;
}

type AdminTab = 'summary' | 'products' | 'categories' | 'media' | 'orders' | 'customers' | 'settings' | 'logs' | 'codeHub';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onCloseAdmin, onRefreshData, onLogout }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('summary');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  // Data states
  const [products, setProducts] = useState<Product[]>(() => store.getProducts(false));
  const [categories, setCategories] = useState<Category[]>(() => store.getCategories());
  const [orders, setOrders] = useState<Order[]>(() => store.getOrders());
  const [customers, setCustomers] = useState<Customer[]>(() => store.getCustomers());
  const [settings, setSettings] = useState<Setting[]>(() => store.getSettings());
  const [logs, setLogs] = useState<SystemLog[]>(() => store.getLogs());

  // Search & filter
  const [searchProd, setSearchProd] = useState('');
  const [selectedOrderFilter, setSelectedOrderFilter] = useState<string>('ALL');

  // Product Modal Edit State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Category Modal Edit State
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // View Order Modal
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  const reloadData = () => {
    setProducts(store.getProducts(false));
    setCategories(store.getCategories());
    setOrders(store.getOrders());
    setCustomers(store.getCustomers());
    setSettings(store.getSettings());
    setLogs(store.getLogs());
    onRefreshData();
  };

  // Metrics
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.ACTIVE).length;
  const lowStockProducts = products.filter(p => p.STOCK > 0 && p.STOCK <= 5).length;
  const outOfStockProducts = products.filter(p => p.STOCK <= 0).length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.STATUS === 'PENDING').length;
  const processingOrders = orders.filter(o => o.STATUS === 'PROCESSING').length;
  const completedOrders = orders.filter(o => o.STATUS === 'COMPLETED').length;
  const totalSales = orders.reduce((sum, o) => sum + (o.STATUS !== 'CANCELLED' ? o.TOTAL : 0), 0);

  // Copy code helper
  const handleCopyCode = (filename: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  // Handle Save Product
  const handleSaveProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    store.saveProduct(editingProduct);
    setIsProductModalOpen(false);
    setEditingProduct(null);
    reloadData();
  };

  // Handle Save Category
  const handleSaveCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    store.saveCategory(editingCategory);
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    reloadData();
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['STATUS']) => {
    store.updateOrderStatus(orderId, newStatus);
    reloadData();
    if (viewingOrder && viewingOrder.ORDER_ID === orderId) {
      setViewingOrder({ ...viewingOrder, STATUS: newStatus });
    }
  };

  const handleSettingChange = (key: string, val: string) => {
    store.saveSetting(key, val);
    reloadData();
  };

  const handleResetData = () => {
    if (window.confirm('Reset seluruh data ke konfigurasi dan sample data bawaan?')) {
      store.resetToSampleData();
      reloadData();
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#E2E2E2] flex flex-col">
      {/* Top Admin Navigation Header */}
      <header className="bg-[#161618] border-b border-white/10 px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <BonlesLogo size="sm" variant="horizontal" />
          <span className="hidden md:inline text-xs text-[#666666]">|</span>
          <span className="hidden md:inline text-[10px] tracking-[0.2em] text-[#00D222] font-bold uppercase bg-[#00D222]/10 border border-[#00D222]/20 px-2 py-0.5 rounded-xs">
            Admin & Database Management
          </span>
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-[#1A1A1E] border border-white/10 rounded-xs text-[11px] text-[#C5A059]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00D222]" />
            <span className="font-mono text-white/90">{SUPERADMIN_CREDENTIALS.USERNAME}</span>
            <span className="text-[9px] bg-[#C5A059]/20 px-1 rounded-2xs font-bold text-[#C5A059]">SUPERADMIN</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={reloadData}
            className="bg-[#0A0A0B] hover:bg-[#1F1F23] text-[#AAAAAA] hover:text-white border border-white/10 p-2 rounded-sm text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Muat Ulang Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={onCloseAdmin}
            className="bg-[#1A1A1E] hover:bg-[#25252A] text-white border border-white/15 px-3.5 py-2 rounded-sm text-xs tracking-wider uppercase transition-colors cursor-pointer"
          >
            Mode Web
          </button>

          <button
            onClick={onLogout}
            className="bg-[#E81818]/15 hover:bg-[#E81818]/25 text-[#FF8888] hover:text-white border border-[#E81818]/40 px-3 py-2 rounded-sm text-xs tracking-wider uppercase font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Logout dari Sesi Super Administrator"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-[#111113] border-r border-white/10 p-4 space-y-1.5 shrink-0">
          <div className="px-3 py-2 text-[10px] tracking-widest text-[#777777] uppercase font-bold">
            Menu Administrasi
          </div>

          <button
            onClick={() => setActiveTab('summary')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-sm text-xs font-medium transition-colors ${
              activeTab === 'summary'
                ? 'bg-[#C5A059] text-black font-bold'
                : 'text-[#AAAAAA] hover:text-white hover:bg-[#161618]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Ringkasan Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm text-xs font-medium transition-colors ${
              activeTab === 'products'
                ? 'bg-[#C5A059] text-black font-bold'
                : 'text-[#AAAAAA] hover:text-white hover:bg-[#161618]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4" />
              <span>Manajemen Produk</span>
            </div>
            <span className="text-[10px] opacity-80">{products.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm text-xs font-medium transition-colors ${
              activeTab === 'categories'
                ? 'bg-[#C5A059] text-black font-bold'
                : 'text-[#AAAAAA] hover:text-white hover:bg-[#161618]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FolderTree className="w-4 h-4" />
              <span>Kategori & Folder</span>
            </div>
            <span className="text-[10px] opacity-80">{categories.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-sm text-xs font-medium transition-colors ${
              activeTab === 'media'
                ? 'bg-[#C5A059] text-black font-bold'
                : 'text-[#AAAAAA] hover:text-white hover:bg-[#161618]'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Media & Google Drive</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm text-xs font-medium transition-colors ${
              activeTab === 'orders'
                ? 'bg-[#C5A059] text-black font-bold'
                : 'text-[#AAAAAA] hover:text-white hover:bg-[#161618]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingCart className="w-4 h-4" />
              <span>Pesanan Pelanggan</span>
            </div>
            {pendingOrders > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {pendingOrders}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm text-xs font-medium transition-colors ${
              activeTab === 'customers'
                ? 'bg-[#C5A059] text-black font-bold'
                : 'text-[#AAAAAA] hover:text-white hover:bg-[#161618]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4" />
              <span>Data Pelanggan</span>
            </div>
            <span className="text-[10px] opacity-80">{customers.length}</span>
          </button>

          <div className="pt-3 border-t border-white/10 px-3 py-2 text-[10px] tracking-widest text-[#777777] uppercase font-bold">
            Sistem & Backend
          </div>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-sm text-xs font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-[#C5A059] text-black font-bold'
                : 'text-[#AAAAAA] hover:text-white hover:bg-[#161618]'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Pengaturan Toko</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm text-xs font-medium transition-colors ${
              activeTab === 'logs'
                ? 'bg-[#C5A059] text-black font-bold'
                : 'text-[#AAAAAA] hover:text-white hover:bg-[#161618]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4" />
              <span>System Log (Audit)</span>
            </div>
            <span className="text-[10px] opacity-80">{logs.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('codeHub')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-sm text-xs font-medium transition-colors ${
              activeTab === 'codeHub'
                ? 'bg-[#C5A059] text-black font-bold'
                : 'text-[#C5A059] bg-[#161618] border border-[#C5A059]/30 hover:border-[#C5A059]'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Apps Script & Drive Hub</span>
          </button>

          {/* Super Administrator Profile Card */}
          <div className="pt-4 mt-4 border-t border-white/10">
            <div className="bg-[#161618] border border-white/10 rounded-sm p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059]">
                  <ShieldCheck className="w-4 h-4 text-[#00D222]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-white truncate">Super Administrator</p>
                  <p className="text-[10px] text-[#888888] font-mono truncate">{SUPERADMIN_CREDENTIALS.USERNAME}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#00D222] bg-[#00D222]/10 border border-[#00D222]/20 px-2 py-1 rounded-2xs">
                <span>Status: Otoritas Penuh</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D222] animate-pulse"></span>
              </div>

              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-[#FF8888] hover:text-white bg-[#E81818]/10 hover:bg-[#E81818]/25 border border-[#E81818]/30 py-1.5 rounded-xs transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout Sesi</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-6xl">
          {/* TAB 1: SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-8">
              <div>
                <span className="text-xs tracking-[0.2em] text-[#C5A059] font-bold uppercase block">
                  Dashboard Executive Summary
                </span>
                <h2 className="text-2xl font-serif-luxury text-white font-medium">
                  Performa Operasional Toko
                </h2>
              </div>

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#161618] border border-white/10 p-4 rounded-sm">
                  <p className="text-[11px] text-[#888888] uppercase tracking-wider">Total Penjualan</p>
                  <p className="text-xl font-bold font-mono text-[#50C878] mt-1">
                    Rp {totalSales.toLocaleString('id-ID')}
                  </p>
                  <p className="text-[10px] text-[#666666] mt-1">Akumulasi pesanan valid</p>
                </div>

                <div className="bg-[#161618] border border-white/10 p-4 rounded-sm">
                  <p className="text-[11px] text-[#888888] uppercase tracking-wider">Total Pesanan</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-2xl font-bold font-mono text-white">{totalOrders}</p>
                    {pendingOrders > 0 && (
                      <span className="text-[10px] text-amber-400 font-medium">
                        ({pendingOrders} Pending)
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#666666] mt-1">{completedOrders} Selesai</p>
                </div>

                <div className="bg-[#161618] border border-white/10 p-4 rounded-sm">
                  <p className="text-[11px] text-[#888888] uppercase tracking-wider">Katalog Produk</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-2xl font-bold font-mono text-white">{totalProducts}</p>
                    <span className="text-[10px] text-[#50C878]">({activeProducts} Aktif)</span>
                  </div>
                  <p className="text-[10px] text-[#666666] mt-1">{categories.length} Kategori Produk</p>
                </div>

                <div className="bg-[#161618] border border-white/10 p-4 rounded-sm">
                  <p className="text-[11px] text-[#888888] uppercase tracking-wider">Status Inventori</p>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-xs text-amber-400 font-semibold">
                      {lowStockProducts} Menipis
                    </span>
                    <span className="text-xs text-red-400 font-semibold">
                      {outOfStockProducts} Habis
                    </span>
                  </div>
                  <p className="text-[10px] text-[#666666] mt-1">Siap order dan kirim</p>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="bg-[#161618] border border-white/10 rounded-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Pesanan Terbaru
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-[#C5A059] hover:underline"
                  >
                    Lihat Semua Pesanan →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-[#888888]">
                        <th className="pb-2">Order ID</th>
                        <th className="pb-2">Pemesan</th>
                        <th className="pb-2">WhatsApp</th>
                        <th className="pb-2">Total</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {orders.slice(0, 5).map(o => (
                        <tr key={o.ORDER_ID} className="hover:bg-white/5 transition-colors">
                          <td className="py-2.5 font-mono text-[#C5A059] font-bold">{o.ORDER_ID}</td>
                          <td className="py-2.5 text-white">{o.CUSTOMER_NAME}</td>
                          <td className="py-2.5 text-[#AAAAAA]">{o.PHONE}</td>
                          <td className="py-2.5 font-mono font-bold text-white">
                            Rp {o.TOTAL.toLocaleString('id-ID')}
                          </td>
                          <td className="py-2.5">
                            <span className={`text-[10px] px-2 py-0.5 rounded-xs font-semibold ${
                              o.STATUS === 'COMPLETED' ? 'bg-green-950 text-green-300 border border-green-800' :
                              o.STATUS === 'PROCESSING' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                              o.STATUS === 'PENDING' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                              'bg-zinc-800 text-zinc-400'
                            }`}>
                              {o.STATUS}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs tracking-[0.2em] text-[#C5A059] font-bold uppercase block">
                    Manajemen Katalog
                  </span>
                  <h2 className="text-2xl font-serif-luxury text-white font-medium">
                    Daftar Produk ({products.length})
                  </h2>
                </div>

                <button
                  onClick={() => {
                    const newProd: Product = {
                      ID: `PRD-${String(products.length + 1).padStart(4, '0')}`,
                      SKU: `BNLS-${String(products.length + 1).padStart(3, '0')}`,
                      NAME: '',
                      CATEGORY_ID: categories[0]?.ID || 'CAT-001',
                      CATEGORY_NAME: categories[0]?.NAME || 'Snack Protein',
                      CATEGORY_FOLDER_ID: '',
                      PRODUCT_FOLDER_ID: '',
                      PRICE: 25000,
                      DISCOUNT_PRICE: 0,
                      WEIGHT: '100g',
                      STOCK: 20,
                      DESCRIPTION: '',
                      COMPOSITION: '',
                      NUTRITION: '',
                      MAIN_IMAGE_FILE_ID: '',
                      MAIN_IMAGE_URL: '',
                      GALLERY_1_FILE_ID: '',
                      GALLERY_1_URL: '',
                      GALLERY_2_FILE_ID: '',
                      GALLERY_2_URL: '',
                      GALLERY_3_FILE_ID: '',
                      GALLERY_3_URL: '',
                      FEATURED: false,
                      ACTIVE: true,
                      CREATED_AT: new Date().toISOString(),
                      UPDATED_AT: new Date().toISOString(),
                    };
                    setEditingProduct(newProd);
                    setIsProductModalOpen(true);
                  }}
                  className="bg-[#C5A059] hover:bg-[#D4B06A] text-black font-bold px-4 py-2.5 rounded-sm text-xs tracking-wider uppercase flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Produk Baru</span>
                </button>
              </div>

              {/* Search filter */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#888888] absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan Nama, SKU, atau Kategori..."
                  value={searchProd}
                  onChange={(e) => setSearchProd(e.target.value)}
                  className="w-full bg-[#161618] border border-white/10 rounded-sm pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#666666] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              {/* Table */}
              <div className="bg-[#161618] border border-white/10 rounded-sm overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#0A0A0B] text-[#888888]">
                      <th className="p-3">Foto</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Nama Produk</th>
                      <th className="p-3">Kategori</th>
                      <th className="p-3">Harga</th>
                      <th className="p-3">Stok</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {products
                      .filter(p => 
                        p.NAME.toLowerCase().includes(searchProd.toLowerCase()) ||
                        p.SKU.toLowerCase().includes(searchProd.toLowerCase()) ||
                        p.CATEGORY_NAME.toLowerCase().includes(searchProd.toLowerCase())
                      )
                      .map(p => (
                        <tr key={p.ID} className="hover:bg-white/5 transition-colors">
                          <td className="p-3">
                            <img
                              src={p.MAIN_IMAGE_URL || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80'}
                              alt={p.NAME}
                              className="w-10 h-10 object-cover rounded-xs border border-white/10"
                            />
                          </td>
                          <td className="p-3 font-mono font-semibold text-[#C5A059]">{p.SKU}</td>
                          <td className="p-3">
                            <p className="text-white font-medium">{p.NAME}</p>
                            <p className="text-[10px] text-[#777777]">{p.WEIGHT}</p>
                          </td>
                          <td className="p-3 text-[#AAAAAA]">{p.CATEGORY_NAME}</td>
                          <td className="p-3 font-mono">
                            <span className="text-white font-bold">
                              Rp {(p.DISCOUNT_PRICE > 0 ? p.DISCOUNT_PRICE : p.PRICE).toLocaleString('id-ID')}
                            </span>
                            {p.DISCOUNT_PRICE > 0 && (
                              <span className="text-[10px] text-[#777777] line-through block">
                                Rp {p.PRICE.toLocaleString('id-ID')}
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-mono">
                            <span className={p.STOCK <= 0 ? 'text-red-400 font-bold' : p.STOCK <= 5 ? 'text-amber-400 font-bold' : 'text-[#50C878]'}>
                              {p.STOCK}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded-xs font-semibold ${
                              p.ACTIVE ? 'bg-green-950 text-green-300' : 'bg-zinc-800 text-zinc-500'
                            }`}>
                              {p.ACTIVE ? 'AKTIF' : 'NONAKTIF'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setEditingProduct({ ...p });
                                setIsProductModalOpen(true);
                              }}
                              className="bg-[#0A0A0B] hover:bg-[#1F1F23] text-[#C5A059] border border-[#C5A059]/40 px-2.5 py-1 rounded-sm text-[11px] font-medium transition-colors"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs tracking-[0.2em] text-[#C5A059] font-bold uppercase block">
                    Struktur Kategori & Drive
                  </span>
                  <h2 className="text-2xl font-serif-luxury text-white font-medium">
                    Kategori Produk
                  </h2>
                </div>

                <button
                  onClick={() => {
                    const newCat: Category = {
                      ID: `CAT-${String(categories.length + 1).padStart(3, '0')}`,
                      NAME: '',
                      DESCRIPTION: '',
                      IMAGE_FILE_ID: '',
                      IMAGE_URL: '',
                      ACTIVE: true,
                      SORT_ORDER: categories.length + 1,
                      CREATED_AT: new Date().toISOString(),
                      UPDATED_AT: new Date().toISOString(),
                    };
                    setEditingCategory(newCat);
                    setIsCategoryModalOpen(true);
                  }}
                  className="bg-[#C5A059] hover:bg-[#D4B06A] text-black font-bold px-4 py-2.5 rounded-sm text-xs tracking-wider uppercase flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Kategori</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map(cat => (
                  <div
                    key={cat.ID}
                    className="bg-[#161618] border border-white/10 p-5 rounded-sm flex flex-col justify-between space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-[#C5A059] uppercase tracking-wider">
                          {cat.ID} • Urutan: {cat.SORT_ORDER}
                        </span>
                        <h3 className="text-lg font-serif-luxury text-white font-medium mt-1">
                          {cat.NAME}
                        </h3>
                        <p className="text-xs text-[#888888] mt-1">{cat.DESCRIPTION}</p>
                      </div>

                      <span className={`text-[10px] px-2 py-0.5 rounded-xs font-semibold ${
                        cat.ACTIVE ? 'bg-green-950 text-green-300' : 'bg-zinc-800 text-zinc-500'
                      }`}>
                        {cat.ACTIVE ? 'AKTIF' : 'NONAKTIF'}
                      </span>
                    </div>

                    <div className="bg-[#0A0A0B] p-2.5 rounded-xs border border-white/5 text-[11px] text-[#777777] font-mono flex items-center gap-1.5">
                      <FolderTree className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>Google Drive: BONLES FOOD NUSANTARA/Products/{cat.NAME}/</span>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-white/5">
                      <button
                        onClick={() => {
                          setEditingCategory({ ...cat });
                          setIsCategoryModalOpen(true);
                        }}
                        className="bg-[#0A0A0B] hover:bg-[#1F1F23] text-[#C5A059] border border-[#C5A059]/40 px-3 py-1 rounded-sm text-xs"
                      >
                        Edit Kategori
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MEDIA & DRIVE */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs tracking-[0.2em] text-[#C5A059] font-bold uppercase block">
                  File Storage Architecture
                </span>
                <h2 className="text-2xl font-serif-luxury text-white font-medium">
                  Google Drive Folder & Media Manager
                </h2>
                <p className="text-xs text-[#888888] mt-1">
                  Struktur folder Google Drive terorganisir per SKU untuk kestabilan referensi foto produk.
                </p>
              </div>

              {/* Tree View Box */}
              <div className="bg-[#161618] border border-white/10 rounded-sm p-6 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-white/10 text-xs font-bold text-[#C5A059] uppercase tracking-wider">
                  <FolderTree className="w-4 h-4" />
                  <span>Struktur Folder Drive Aktif: BONLES FOOD NUSANTARA/</span>
                </div>

                <div className="space-y-3 font-mono text-xs text-[#CCCCCC]">
                  {categories.map(cat => {
                    const catProds = products.filter(p => p.CATEGORY_ID === cat.ID || p.CATEGORY_NAME === cat.NAME);
                    return (
                      <div key={cat.ID} className="pl-4 border-l border-white/10 space-y-2">
                        <div className="text-white font-semibold flex items-center gap-2">
                          <span className="text-[#C5A059]">📁 Products / {cat.NAME} /</span>
                          <span className="text-[10px] text-[#777777]">({catProds.length} produk)</span>
                        </div>

                        <div className="pl-6 space-y-2 border-l border-white/5">
                          {catProds.map(p => (
                            <div key={p.SKU} className="bg-[#0A0A0B] p-2.5 rounded-sm border border-white/5 flex items-center justify-between">
                              <div>
                                <span className="text-[#50C878] font-bold">📂 {p.SKU}/</span>
                                <span className="text-xs text-white ml-2">{p.NAME}</span>
                                <div className="text-[10px] text-[#777777] mt-0.5">
                                  File: main.jpg {p.GALLERY_1_URL && '• gallery-1.jpg'} {p.GALLERY_2_URL && '• gallery-2.jpg'}
                                </div>
                              </div>

                              <img
                                src={p.MAIN_IMAGE_URL || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80'}
                                alt={p.SKU}
                                className="w-8 h-8 object-cover rounded-xs border border-white/10"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs tracking-[0.2em] text-[#C5A059] font-bold uppercase block">
                    Transaksi Masuk
                  </span>
                  <h2 className="text-2xl font-serif-luxury text-white font-medium">
                    Manajemen Pesanan ({orders.length})
                  </h2>
                </div>

                {/* Status Filter */}
                <div className="flex flex-wrap gap-1.5">
                  {['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'].map(st => (
                    <button
                      key={st}
                      onClick={() => setSelectedOrderFilter(st)}
                      className={`px-3 py-1.5 rounded-xs text-[11px] font-semibold transition-colors ${
                        selectedOrderFilter === st
                          ? 'bg-[#C5A059] text-black font-bold'
                          : 'bg-[#161618] text-[#888888] hover:text-white border border-white/5'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-[#161618] border border-white/10 rounded-sm overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#0A0A0B] text-[#888888]">
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Tanggal</th>
                      <th className="p-3">Pelanggan</th>
                      <th className="p-3">Kota</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orders
                      .filter(o => selectedOrderFilter === 'ALL' || o.STATUS === selectedOrderFilter)
                      .map(o => (
                        <tr key={o.ORDER_ID} className="hover:bg-white/5 transition-colors">
                          <td className="p-3 font-mono font-bold text-[#C5A059]">{o.ORDER_ID}</td>
                          <td className="p-3 text-[#AAAAAA]">{o.ORDER_DATE.slice(0, 10)}</td>
                          <td className="p-3">
                            <p className="text-white font-medium">{o.CUSTOMER_NAME}</p>
                            <p className="text-[11px] text-[#888888]">{o.PHONE}</p>
                          </td>
                          <td className="p-3 text-[#AAAAAA]">{o.CITY}</td>
                          <td className="p-3 font-mono font-bold text-white">
                            Rp {o.TOTAL.toLocaleString('id-ID')}
                          </td>
                          <td className="p-3">
                            <select
                              value={o.STATUS}
                              onChange={(e) => handleUpdateOrderStatus(o.ORDER_ID, e.target.value as Order['STATUS'])}
                              className="bg-[#0A0A0B] border border-white/10 text-xs text-white rounded-xs px-2 py-1 focus:border-[#C5A059]"
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="PROCESSING">PROCESSING</option>
                              <option value="SHIPPED">SHIPPED</option>
                              <option value="COMPLETED">COMPLETED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => setViewingOrder(o)}
                              className="bg-[#0A0A0B] hover:bg-[#1F1F23] text-[#C5A059] border border-[#C5A059]/40 px-2.5 py-1 rounded-sm text-[11px]"
                            >
                              Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: CUSTOMERS */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs tracking-[0.2em] text-[#C5A059] font-bold uppercase block">
                  Database Kontak
                </span>
                <h2 className="text-2xl font-serif-luxury text-white font-medium">
                  Daftar Pelanggan ({customers.length})
                </h2>
              </div>

              <div className="bg-[#161618] border border-white/10 rounded-sm overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#0A0A0B] text-[#888888]">
                      <th className="p-3">ID Pelanggan</th>
                      <th className="p-3">Nama</th>
                      <th className="p-3">WhatsApp</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Kota</th>
                      <th className="p-3">Total Order</th>
                      <th className="p-3">Total Belanja</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {customers.map(c => (
                      <tr key={c.CUSTOMER_ID} className="hover:bg-white/5 transition-colors">
                        <td className="p-3 font-mono text-[#C5A059]">{c.CUSTOMER_ID}</td>
                        <td className="p-3 text-white font-medium">{c.NAME}</td>
                        <td className="p-3 font-mono">{c.PHONE}</td>
                        <td className="p-3 text-[#888888]">{c.EMAIL || '-'}</td>
                        <td className="p-3 text-[#AAAAAA]">{c.CITY}</td>
                        <td className="p-3 font-mono">{c.ORDER_COUNT || 1} pesanan</td>
                        <td className="p-3 font-mono font-bold text-[#50C878]">
                          Rp {(c.TOTAL_SPENT || 0).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs tracking-[0.2em] text-[#C5A059] font-bold uppercase block">
                  Konfigurasi Bisnis
                </span>
                <h2 className="text-2xl font-serif-luxury text-white font-medium">
                  Pengaturan Toko & Integrasi
                </h2>
                <p className="text-xs text-[#888888] mt-1">
                  Semua pengaturan tersimpan dinamis dan tersinkronisasi ke Google Sheets `Settings`.
                </p>
              </div>

              <div className="bg-[#161618] border border-white/10 rounded-sm p-6 space-y-4">
                {settings.map(s => (
                  <div key={s.SETTING} className="space-y-1 pb-3 border-b border-white/5">
                    <label className="text-xs font-bold text-white uppercase tracking-wider block">
                      {s.SETTING}
                    </label>
                    <p className="text-[11px] text-[#777777]">{s.DESCRIPTION}</p>
                    <input
                      type="text"
                      defaultValue={s.VALUE}
                      onBlur={(e) => handleSettingChange(s.SETTING, e.target.value)}
                      className="w-full bg-[#0A0A0B] border border-white/10 rounded-sm px-3 py-2 text-xs text-white focus:border-[#C5A059]"
                    />
                  </div>
                ))}

                <div className="pt-4 flex items-center justify-between">
                  <span className="text-xs text-[#888888]">Reset Data Toko ke Contoh Awal</span>
                  <button
                    onClick={handleResetData}
                    className="bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 px-4 py-2 rounded-sm text-xs"
                  >
                    Reset Sample Data
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SYSTEM LOG */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs tracking-[0.2em] text-[#C5A059] font-bold uppercase block">
                  Audit Trail & Monitoring
                </span>
                <h2 className="text-2xl font-serif-luxury text-white font-medium">
                  System Log ({logs.length})
                </h2>
              </div>

              <div className="bg-[#161618] border border-white/10 rounded-sm overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#0A0A0B] text-[#888888]">
                      <th className="p-3">Waktu</th>
                      <th className="p-3">Tipe</th>
                      <th className="p-3">Aksi</th>
                      <th className="p-3">User</th>
                      <th className="p-3">Ref ID</th>
                      <th className="p-3">Pesan Aktivitas</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                    {logs.map(log => (
                      <tr key={log.LOG_ID} className="hover:bg-white/5 transition-colors">
                        <td className="p-3 text-[#888888]">{log.TIMESTAMP.slice(11, 19)}</td>
                        <td className="p-3">
                          <span className={`px-1.5 py-0.5 rounded-xs text-[10px] font-bold ${
                            log.TYPE === 'ERROR' ? 'bg-red-950 text-red-400' :
                            log.TYPE === 'AUDIT' ? 'bg-blue-950 text-blue-300' :
                            'bg-zinc-800 text-zinc-300'
                          }`}>
                            {log.TYPE}
                          </span>
                        </td>
                        <td className="p-3 text-[#C5A059] font-semibold">{log.ACTION}</td>
                        <td className="p-3 text-[#AAAAAA]">{log.USER}</td>
                        <td className="p-3 text-[#777777]">{log.REFERENCE_ID}</td>
                        <td className="p-3 text-white font-sans text-xs">{log.MESSAGE}</td>
                        <td className="p-3">
                          <span className={log.STATUS === 'SUCCESS' ? 'text-[#50C878]' : 'text-red-400'}>
                            {log.STATUS}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: APPS SCRIPT CODE & DRIVE HUB */}
          {activeTab === 'codeHub' && (
            <div className="space-y-8">
              <div>
                <span className="text-xs tracking-[0.2em] text-[#C5A059] font-bold uppercase block">
                  Backend Source Code & Deployment
                </span>
                <h2 className="text-2xl font-serif-luxury text-white font-medium">
                  Google Apps Script & Drive Hub
                </h2>
                <p className="text-xs text-[#AAAAAA] mt-1">
                  Salin file script berikut ke menu <strong>Extensions → Apps Script</strong> di Google Spreadsheet Anda untuk mengaktifkan backend resmi.
                </p>
              </div>

              {/* Deployment Step Guide */}
              <div className="bg-[#161618] border border-white/10 rounded-sm p-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#C5A059] flex items-center gap-2">
                  <span>Panduan Langkah Deployment Google Apps Script (11 Langkah)</span>
                </h3>

                <ol className="list-decimal list-inside space-y-2 text-xs text-[#CCCCCC] leading-relaxed">
                  <li>Buat satu <strong>Google Spreadsheet</strong> baru di Google Drive Anda.</li>
                  <li>Buka menu: <code className="bg-[#0A0A0B] text-[#C5A059] px-1.5 py-0.5 rounded-xs">Extensions → Apps Script</code>.</li>
                  <li>Buat file script sesuai daftar di bawah (<code className="text-[#C5A059]">Config.gs, Logger.gs, Utils.gs, Database.gs, DriveManager.gs, Products.gs, Orders.gs, Code.gs</code>).</li>
                  <li>Salin kode dari masing-masing tab file di bawah ini ke editor Apps Script.</li>
                  <li>Pilih fungsi <code className="text-[#C5A059]">initializeBonlesSystem()</code> di toolbar atas Apps Script lalu klik <strong>Run</strong>.</li>
                  <li>Berikan izin akses otorisasi (*Authorization*) untuk Google Sheets & Google Drive.</li>
                  <li>Pastikan 9 Sheet database berhasil dibuat secara otomatis beserta header resminya.</li>
                  <li>Pastikan folder <code className="text-[#C5A059]">BONLES FOOD NUSANTARA/</code> dan subfoldernya berhasil dibuat di Google Drive.</li>
                  <li>Klik tombol <strong>Deploy → New Deployment</strong>.</li>
                  <li>Pilih type <strong>Web App</strong>, set <em>Execute as: Me</em>, dan <em>Who has access: Anyone</em>.</li>
                  <li>Salin <strong>Web App URL</strong> dan tempel di Pengaturan Toko (<code className="text-[#C5A059]">APPS_SCRIPT_WEBAPP_URL</code>).</li>
                </ol>
              </div>

              {/* File Tabs & Code viewer */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white">
                  Source Code Google Apps Script
                </h3>

                <div className="space-y-4">
                  {APPS_SCRIPT_FILES.map((f) => (
                    <div key={f.filename} className="bg-[#161618] border border-white/10 rounded-sm overflow-hidden">
                      <div className="p-3 bg-[#111113] border-b border-white/10 flex items-center justify-between">
                        <div>
                          <span className="font-mono text-xs font-bold text-[#C5A059]">{f.filename}</span>
                          <p className="text-[11px] text-[#777777]">{f.description}</p>
                        </div>

                        <button
                          onClick={() => handleCopyCode(f.filename, f.code)}
                          className="bg-[#0A0A0B] hover:bg-[#1F1F23] text-white border border-white/10 hover:border-[#C5A059] px-3 py-1.5 rounded-sm text-xs flex items-center gap-1.5 transition-colors"
                        >
                          {copiedFile === f.filename ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#50C878]" />
                              <span className="text-[#50C878]">Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-[#C5A059]" />
                              <span>Salin Kode</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="p-4 bg-[#0A0A0B] max-h-72 overflow-y-auto font-mono text-[11px] text-[#BBBBBB] whitespace-pre">
                        {f.code}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* PRODUCT EDIT / ADD MODAL */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#161618] border border-white/10 rounded-sm shadow-2xl p-6 space-y-4 my-8">
            <h3 className="text-base font-serif-luxury text-white font-medium pb-2 border-b border-white/10">
              {editingProduct.ID ? `Edit Produk: ${editingProduct.SKU}` : 'Tambah Produk Baru'}
            </h3>

            <form onSubmit={handleSaveProductSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[#AAAAAA]">SKU Produk *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.SKU}
                    onChange={(e) => setEditingProduct({ ...editingProduct, SKU: e.target.value })}
                    className="w-full bg-[#0A0A0B] border border-white/10 rounded-sm p-2 text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#AAAAAA]">Kategori *</label>
                  <select
                    value={editingProduct.CATEGORY_ID}
                    onChange={(e) => {
                      const cat = categories.find(c => c.ID === e.target.value);
                      setEditingProduct({
                        ...editingProduct,
                        CATEGORY_ID: e.target.value,
                        CATEGORY_NAME: cat?.NAME || editingProduct.CATEGORY_NAME,
                      });
                    }}
                    className="w-full bg-[#0A0A0B] border border-white/10 rounded-sm p-2 text-white"
                  >
                    {categories.map(c => (
                      <option key={c.ID} value={c.ID}>{c.NAME}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#AAAAAA]">Nama Produk Lengkap *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.NAME}
                  onChange={(e) => setEditingProduct({ ...editingProduct, NAME: e.target.value })}
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded-sm p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[#AAAAAA]">Harga Reguler (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.PRICE}
                    onChange={(e) => setEditingProduct({ ...editingProduct, PRICE: Number(e.target.value) })}
                    className="w-full bg-[#0A0A0B] border border-white/10 rounded-sm p-2 text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#AAAAAA]">Harga Diskon (Rp)</label>
                  <input
                    type="number"
                    value={editingProduct.DISCOUNT_PRICE}
                    onChange={(e) => setEditingProduct({ ...editingProduct, DISCOUNT_PRICE: Number(e.target.value) })}
                    className="w-full bg-[#0A0A0B] border border-white/10 rounded-sm p-2 text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#AAAAAA]">Stok Fisik *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.STOCK}
                    onChange={(e) => setEditingProduct({ ...editingProduct, STOCK: Number(e.target.value) })}
                    className="w-full bg-[#0A0A0B] border border-white/10 rounded-sm p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[#AAAAAA]">Berat Kemasan</label>
                  <input
                    type="text"
                    value={editingProduct.WEIGHT}
                    onChange={(e) => setEditingProduct({ ...editingProduct, WEIGHT: e.target.value })}
                    className="w-full bg-[#0A0A0B] border border-white/10 rounded-sm p-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#AAAAAA]">URL Foto Utama (Drive/CDN)</label>
                  <input
                    type="text"
                    value={editingProduct.MAIN_IMAGE_URL}
                    onChange={(e) => setEditingProduct({ ...editingProduct, MAIN_IMAGE_URL: e.target.value })}
                    className="w-full bg-[#0A0A0B] border border-white/10 rounded-sm p-2 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#AAAAAA]">Deskripsi Produk</label>
                <textarea
                  rows={2}
                  value={editingProduct.DESCRIPTION}
                  onChange={(e) => setEditingProduct({ ...editingProduct, DESCRIPTION: e.target.value })}
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded-sm p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[#AAAAAA]">Komposisi</label>
                  <input
                    type="text"
                    value={editingProduct.COMPOSITION}
                    onChange={(e) => setEditingProduct({ ...editingProduct, COMPOSITION: e.target.value })}
                    className="w-full bg-[#0A0A0B] border border-white/10 rounded-sm p-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#AAAAAA]">Informasi Gizi / Nutrisi</label>
                  <input
                    type="text"
                    value={editingProduct.NUTRITION}
                    onChange={(e) => setEditingProduct({ ...editingProduct, NUTRITION: e.target.value })}
                    className="w-full bg-[#0A0A0B] border border-white/10 rounded-sm p-2 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.ACTIVE}
                    onChange={(e) => setEditingProduct({ ...editingProduct, ACTIVE: e.target.checked })}
                    className="rounded-xs"
                  />
                  <span>Tayang di Katalog (ACTIVE)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.FEATURED}
                    onChange={(e) => setEditingProduct({ ...editingProduct, FEATURED: e.target.checked })}
                    className="rounded-xs"
                  />
                  <span>Produk Unggulan (FEATURED)</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-[#0A0A0B] border border-white/10 rounded-sm text-[#888888] hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C5A059] hover:bg-[#D4B06A] text-black font-bold rounded-sm uppercase tracking-wider text-xs"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY EDIT / ADD MODAL */}
      {isCategoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-md bg-[#161618] border border-white/10 rounded-sm shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-serif-luxury text-white font-medium pb-2 border-b border-white/10">
              {editingCategory.ID ? `Edit Kategori: ${editingCategory.NAME}` : 'Tambah Kategori'}
            </h3>

            <form onSubmit={handleSaveCategorySubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[#AAAAAA]">Nama Kategori *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.NAME}
                  onChange={(e) => setEditingCategory({ ...editingCategory, NAME: e.target.value })}
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded-sm p-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#AAAAAA]">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={editingCategory.DESCRIPTION}
                  onChange={(e) => setEditingCategory({ ...editingCategory, DESCRIPTION: e.target.value })}
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded-sm p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[#AAAAAA]">Urutan Tampilan</label>
                  <input
                    type="number"
                    value={editingCategory.SORT_ORDER}
                    onChange={(e) => setEditingCategory({ ...editingCategory, SORT_ORDER: Number(e.target.value) })}
                    className="w-full bg-[#0A0A0B] border border-white/10 rounded-sm p-2 text-white font-mono"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingCategory.ACTIVE}
                      onChange={(e) => setEditingCategory({ ...editingCategory, ACTIVE: e.target.checked })}
                    />
                    <span>Status Aktif</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 bg-[#0A0A0B] border border-white/10 rounded-sm text-[#888888] hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C5A059] hover:bg-[#D4B06A] text-black font-bold rounded-sm uppercase tracking-wider text-xs"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW ORDER DETAIL MODAL */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#161618] border border-white/10 rounded-sm shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] uppercase font-mono text-[#C5A059]">Rincian Transaksi</span>
                <h3 className="text-base font-bold text-white font-mono">{viewingOrder.ORDER_ID}</h3>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="text-[#888888] hover:text-white text-xs"
              >
                Tutup
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 text-[#AAAAAA]">
                <p>Nama: <span className="text-white font-medium">{viewingOrder.CUSTOMER_NAME}</span></p>
                <p>WhatsApp: <span className="text-white font-mono">{viewingOrder.PHONE}</span></p>
                <p>Kota: <span className="text-white">{viewingOrder.CITY}</span></p>
                <p>Status: <span className="text-[#C5A059] font-bold">{viewingOrder.STATUS}</span></p>
              </div>
              <p className="text-[#AAAAAA]">Alamat: <span className="text-white">{viewingOrder.ADDRESS}</span></p>
              {viewingOrder.NOTES && (
                <p className="text-[#AAAAAA]">Catatan: <span className="text-amber-300">{viewingOrder.NOTES}</span></p>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-[#0A0A0B] p-3 rounded-sm border border-white/5 space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-[#888888] font-bold">Barang Dipesan:</span>
              <div className="divide-y divide-white/5 space-y-1">
                {viewingOrder.ITEMS?.map((item, idx) => (
                  <div key={idx} className="pt-1 flex justify-between text-xs">
                    <span>{item.PRODUCT_NAME} x{item.QUANTITY}</span>
                    <span className="font-mono text-white">Rp {item.SUBTOTAL.toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-xs text-[#C5A059]">
                <span>Total Tagihan</span>
                <span className="font-mono text-sm">Rp {viewingOrder.TOTAL.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Direct WhatsApp Contact CTA */}
            <div className="pt-2">
              <a
                href={`https://wa.me/${viewingOrder.PHONE.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#50C878] hover:bg-[#45B068] text-black font-bold py-2.5 rounded-sm text-xs uppercase flex items-center justify-center gap-2"
              >
                <span>Hubungi Pelanggan di WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
