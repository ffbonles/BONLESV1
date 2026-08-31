import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, FolderTree, Image as ImageIcon, ShoppingCart, 
  Users, Settings as SettingsIcon, FileText, Code2, Plus, Edit2, CheckCircle2, 
  AlertTriangle, Ban, Search, Copy, Check, ExternalLink, RefreshCw, Eye, ArrowUpRight,
  LogOut, ShieldCheck, UserCheck, Save, Sparkles, Star, Trash2, CheckCheck,
  Database, Globe, ArrowRight, X
} from 'lucide-react';
import { Product, Category, Order, Customer, Setting, SystemLog, Banner, Testimonial } from '../../types';
import { store } from '../../services/store';
import { SUPERADMIN_CREDENTIALS } from '../../services/auth';
import { APPS_SCRIPT_FILES } from '../../data/appsScriptCode';
import { gasSync } from '../../services/gasSyncService';
import { BonlesLogo } from '../BonlesLogo';
import { ImageUploadOrUrl } from './ImageUploadOrUrl';

interface AdminDashboardProps {
  onCloseAdmin: () => void;
  onRefreshData: () => void;
  onLogout: () => void;
}

type AdminTab = 'summary' | 'products' | 'categories' | 'banners' | 'testimonials' | 'media' | 'orders' | 'customers' | 'settings' | 'logs' | 'codeHub';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onCloseAdmin, onRefreshData, onLogout }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('summary');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  // Data states from store
  const [products, setProducts] = useState<Product[]>(() => store.getProducts(false));
  const [categories, setCategories] = useState<Category[]>(() => store.getCategories());
  const [orders, setOrders] = useState<Order[]>(() => store.getOrders());
  const [customers, setCustomers] = useState<Customer[]>(() => store.getCustomers());
  const [settings, setSettings] = useState<Setting[]>(() => store.getSettings());
  const [banners, setBanners] = useState<Banner[]>(() => store.getBanners());
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => store.getTestimonials());
  const [logs, setLogs] = useState<SystemLog[]>(() => store.getLogs());

  // Cloud Sync states
  const [cloudStatus, setCloudStatus] = useState<{
    checking: boolean;
    tested: boolean;
    success: boolean;
    message: string;
    details?: any;
  }>({
    checking: false,
    tested: false,
    success: false,
    message: '',
  });
  const [isBulkSyncing, setIsBulkSyncing] = useState<boolean>(false);
  const [bulkSyncResult, setBulkSyncResult] = useState<{
    success: boolean;
    message: string;
    timestamp: string;
  } | null>(null);

  // Save state indicators
  const [lastSavedTime, setLastSavedTime] = useState<string>(() => {
    return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessModal, setSaveSuccessModal] = useState<{
    isOpen: boolean;
    timestamp: string;
    productCount: number;
    activeProductCount: number;
    categoryCount: number;
    message: string;
    cloudStatusText?: string;
  } | null>(null);

  // Search & filter
  const [searchProd, setSearchProd] = useState('');
  const [selectedOrderFilter, setSelectedOrderFilter] = useState<string>('ALL');

  // Product Modal Edit State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Category Modal Edit State
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Banner Modal Edit State
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);

  // Testimonial Modal Edit State
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);

  // Settings Edit State
  const [localSettings, setLocalSettings] = useState<Setting[]>(() => store.getSettings());

  // View Order Modal
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  const reloadData = () => {
    const freshProds = store.getProducts(false);
    const freshCats = store.getCategories();
    const freshOrders = store.getOrders();
    const freshCusts = store.getCustomers();
    const freshSettings = store.getSettings();
    const freshBanners = store.getBanners();
    const freshTestis = store.getTestimonials();
    const freshLogs = store.getLogs();

    setProducts(freshProds);
    setCategories(freshCats);
    setOrders(freshOrders);
    setCustomers(freshCusts);
    setSettings(freshSettings);
    setLocalSettings(freshSettings);
    setBanners(freshBanners);
    setTestimonials(freshTestis);
    setLogs(freshLogs);
    
    setLastSavedTime(
      new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB'
    );
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

  // Master Save & Publish All Changes (Guarantees Sync and Gives Superadmin Visual Proof)
  const handleMasterSaveAndPublish = async () => {
    setIsSaving(true);
    // Save local settings if modified
    if (localSettings && localSettings.length > 0) {
      store.saveAllSettings(localSettings);
    }

    const result = store.forceSyncAndVerify(SUPERADMIN_CREDENTIALS.USERNAME);
    reloadData();

    // Await cloud sync result
    let cloudMsg = 'Mengirim data ke Google Spreadsheet & Google Drive...';
    try {
      const cloudRes = await result.cloudSyncPromise;
      if (cloudRes.success) {
        cloudMsg = 'Terekam di Google Spreadsheet & Google Drive (ID: AKfycbz1Trz8B-_7yWWEOBTQOGeP6QOGP03RER4RMdxkfSDqr8V2XCO0wxYZ2PhOfyVQFISkvw)';
      } else {
        cloudMsg = `Catatan: ${cloudRes.message}`;
      }
    } catch {
      cloudMsg = 'Data tersimpan di Web. Pastikan Apps Script Web App ID terhubung.';
    }

    setIsSaving(false);
    reloadData();

    setSaveSuccessModal({
      isOpen: true,
      timestamp: result.timestamp + ' WIB',
      productCount: result.productCount,
      activeProductCount: result.activeProductCount,
      categoryCount: result.categoryCount,
      message: result.message,
      cloudStatusText: cloudMsg,
    });
  };

  // Test Connection to Google Apps Script
  const handleTestConnection = async () => {
    setCloudStatus({
      checking: true,
      tested: true,
      success: false,
      message: 'Menghubungi Google Apps Script (ID: AKfycbz1Trz8B-_7yWWEOBTQOGeP6QOGP03RER4RMdxkfSDqr8V2XCO0wxYZ2PhOfyVQFISkvw)...',
    });

    const res = await gasSync.testConnection();
    setCloudStatus({
      checking: false,
      tested: true,
      success: res.success,
      message: res.message,
      details: res.details,
    });
    if (res.success) {
      store.addLog('SYNC', 'TEST_GAS_SUCCESS', 'ADMIN', 'APPS_SCRIPT', 'Uji koneksi Google Apps Script & Spreadsheet BERHASIL aktif', 'SUCCESS');
    } else {
      store.addLog('ERROR', 'TEST_GAS_FAILED', 'ADMIN', 'APPS_SCRIPT', `Uji koneksi Google Apps Script GAGAL: ${res.message}`, 'FAILED');
    }
    reloadData();
  };

  // Bulk Push All Data to Google Spreadsheet
  const handleBulkSyncNow = async () => {
    setIsBulkSyncing(true);
    setBulkSyncResult(null);
    const res = await store.syncAllToCloudSpreadsheet(SUPERADMIN_CREDENTIALS.USERNAME);
    setIsBulkSyncing(false);
    setBulkSyncResult({
      success: res.success,
      message: res.message,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB',
    });
    reloadData();
  };

  // Pull Live Data from Google Spreadsheet into Web
  const handlePullFromSpreadsheet = async () => {
    setIsBulkSyncing(true);
    setBulkSyncResult(null);
    const res = await store.pullFromCloudSpreadsheet(SUPERADMIN_CREDENTIALS.USERNAME);
    setIsBulkSyncing(false);
    setBulkSyncResult({
      success: res.success,
      message: res.message,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB',
    });
    reloadData();
  };

  // Initialize Database Sheets & Drive Structure
  const handleInitDatabaseAndDrive = async () => {
    setIsBulkSyncing(true);
    const res = await gasSync.initializeSpreadsheet();
    setIsBulkSyncing(false);
    setBulkSyncResult({
      success: res.success,
      message: res.message || 'Inisialisasi 9 Sheet & Folder Drive selesai.',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB',
    });
    reloadData();
  };

  // Handle Save Product
  const handleSaveProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    // Default main image fallback if empty
    const productToSave: Product = {
      ...editingProduct,
      MAIN_IMAGE_URL: editingProduct.MAIN_IMAGE_URL || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    };

    store.saveProduct(productToSave);
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

  // Handle Save Banner
  const handleSaveBannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;

    store.saveBanner(editingBanner);
    setIsBannerModalOpen(false);
    setEditingBanner(null);
    reloadData();
  };

  // Handle Save Testimonial
  const handleSaveTestimonialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial) return;

    store.saveTestimonial(editingTestimonial);
    setIsTestimonialModalOpen(false);
    setEditingTestimonial(null);
    reloadData();
  };

  // Handle Settings Save
  const handleSaveSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.saveAllSettings(localSettings);
    reloadData();
    setSaveSuccessModal({
      isOpen: true,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB',
      productCount: products.length,
      activeProductCount: activeProducts,
      categoryCount: categories.length,
      message: 'Pengaturan toko berhasil disimpan secara permanen dan langsung aktif di website!',
    });
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['STATUS']) => {
    store.updateOrderStatus(orderId, newStatus);
    reloadData();
    if (viewingOrder && viewingOrder.ORDER_ID === orderId) {
      setViewingOrder({ ...viewingOrder, STATUS: newStatus });
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset seluruh data ke konfigurasi dan sample data bawaan?')) {
      store.resetToSampleData();
      reloadData();
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#E2E2E2] flex flex-col selection:bg-[#C5A059] selection:text-black">
      {/* TOP STATUS BAR: CONFIRMATION OF SAVED STATE */}
      <div className="bg-[#111113] border-b border-white/10 px-4 sm:px-8 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D222] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D222]"></span>
          </span>
          <span className="text-[#00D222] font-semibold flex items-center gap-1.5">
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Database Aktif & Tersimpan</span>
          </span>
          <span className="text-[#666666]">|</span>
          <span className="text-[#AAAAAA] text-[11px]">
            Terakhir tersimpan: <strong className="text-white font-mono">{lastSavedTime}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePullFromSpreadsheet}
            disabled={isBulkSyncing || isSaving}
            className="bg-[#1A1A1E] hover:bg-[#25252A] text-[#00D222] border border-[#00D222]/40 hover:border-[#00D222] font-semibold px-3 py-1.5 rounded-sm text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title="Tarik dan muat data langsung dari Google Spreadsheet ke web"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isBulkSyncing ? 'animate-spin' : ''}`} />
            <span>{isBulkSyncing ? 'Menarik...' : 'Tarik dari Spreadsheet'}</span>
          </button>

          <button
            onClick={handleMasterSaveAndPublish}
            disabled={isSaving}
            className="bg-gradient-to-r from-[#C5A059] to-[#E5C378] hover:from-[#D4B06A] hover:to-[#F0D08A] text-black font-bold px-3.5 py-1.5 rounded-sm text-xs flex items-center gap-1.5 shadow-md shadow-[#C5A059]/10 transition-all cursor-pointer disabled:opacity-50"
            title="Pastikan semua perubahan tersimpan dan langsung tampil di website"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{isSaving ? 'Menyimpan...' : 'Simpan & Terapkan ke Web'}</span>
          </button>
        </div>
      </div>

      {/* TOP ADMIN HEADER */}
      <header className="bg-[#161618] border-b border-white/10 px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <BonlesLogo size="sm" variant="horizontal" />
          <span className="hidden md:inline text-xs text-[#666666]">|</span>
          <span className="hidden md:inline text-[10px] tracking-[0.2em] text-[#C5A059] font-bold uppercase bg-[#C5A059]/10 border border-[#C5A059]/20 px-2 py-0.5 rounded-xs">
            Admin & Database Management
          </span>
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-[#1A1A1E] border border-white/10 rounded-xs text-[11px] text-[#C5A059]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00D222]" />
            <span className="font-mono text-white/90">{SUPERADMIN_CREDENTIALS.USERNAME}</span>
            <span className="text-[9px] bg-[#C5A059]/20 px-1 rounded-2xs font-bold text-[#C5A059]">ADMIN</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={reloadData}
            className="bg-[#0A0A0B] hover:bg-[#1F1F23] text-[#AAAAAA] hover:text-white border border-white/10 p-2 rounded-sm text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Muat Ulang Data Terbaru"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={onCloseAdmin}
            className="bg-[#1A1A1E] hover:bg-[#25252A] text-white border border-white/15 px-3.5 py-2 rounded-sm text-xs tracking-wider uppercase transition-colors cursor-pointer flex items-center gap-1.5"
            title="Buka Website Pengunjung"
          >
            <Globe className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Mode Web</span>
          </button>

          <button
            onClick={onLogout}
            className="bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 p-2 rounded-sm text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Logout dari Sesi Admin"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* ADMIN MAIN CONTAINER: SIDEBAR + CONTENT */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 bg-[#111113] border-r border-white/10 p-4 shrink-0 space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] tracking-[0.2em] font-bold text-[#777777] uppercase px-3 block">
              Menu Kontrol
            </span>

            <nav className="space-y-1 text-xs">
              <button
                onClick={() => setActiveTab('summary')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm font-medium transition-colors ${
                  activeTab === 'summary'
                    ? 'bg-[#C5A059] text-black font-bold'
                    : 'text-[#AAAAAA] hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard Ringkasan</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm font-medium transition-colors ${
                  activeTab === 'products'
                    ? 'bg-[#C5A059] text-black font-bold'
                    : 'text-[#AAAAAA] hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4" />
                  <span>Katalog Produk</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-xs bg-black/30">
                  {totalProducts}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('categories')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm font-medium transition-colors ${
                  activeTab === 'categories'
                    ? 'bg-[#C5A059] text-black font-bold'
                    : 'text-[#AAAAAA] hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FolderTree className="w-4 h-4" />
                  <span>Kategori Produk</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-xs bg-black/30">
                  {categories.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('banners')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm font-medium transition-colors ${
                  activeTab === 'banners'
                    ? 'bg-[#C5A059] text-black font-bold'
                    : 'text-[#AAAAAA] hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ImageIcon className="w-4 h-4" />
                  <span>Banner Promo & Hero</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-xs bg-black/30">
                  {banners.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('testimonials')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm font-medium transition-colors ${
                  activeTab === 'testimonials'
                    ? 'bg-[#C5A059] text-black font-bold'
                    : 'text-[#AAAAAA] hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Star className="w-4 h-4" />
                  <span>Testimoni & Review</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-xs bg-black/30">
                  {testimonials.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('media')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm font-medium transition-colors ${
                  activeTab === 'media'
                    ? 'bg-[#C5A059] text-black font-bold'
                    : 'text-[#AAAAAA] hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4" />
                  <span>Media & Google Drive</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm font-medium transition-colors ${
                  activeTab === 'orders'
                    ? 'bg-[#C5A059] text-black font-bold'
                    : 'text-[#AAAAAA] hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Pesanan Masuk</span>
                </div>
                {pendingOrders > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-xs bg-[#E81818] text-white">
                    {pendingOrders} Baru
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('customers')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm font-medium transition-colors ${
                  activeTab === 'customers'
                    ? 'bg-[#C5A059] text-black font-bold'
                    : 'text-[#AAAAAA] hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4" />
                  <span>Data Pelanggan</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-xs bg-black/30">
                  {customers.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm font-medium transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-[#C5A059] text-black font-bold'
                    : 'text-[#AAAAAA] hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <SettingsIcon className="w-4 h-4" />
                  <span>Pengaturan Toko</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('logs')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm font-medium transition-colors ${
                  activeTab === 'logs'
                    ? 'bg-[#C5A059] text-black font-bold'
                    : 'text-[#AAAAAA] hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4" />
                  <span>System Log & Audit</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('codeHub')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm font-medium transition-colors ${
                  activeTab === 'codeHub'
                    ? 'bg-[#C5A059] text-black font-bold'
                    : 'text-[#AAAAAA] hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Code2 className="w-4 h-4" />
                  <span>Apps Script Hub</span>
                </div>
                <span className="text-[9px] bg-green-950 text-green-300 px-1 rounded-2xs font-mono">
                  8 Files
                </span>
              </button>
            </nav>
          </div>

          {/* Quick Save Card in Sidebar */}
          <div className="p-3 bg-[#161618] border border-white/10 rounded-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#888888] uppercase font-bold tracking-wider">Status Sinkronisasi</span>
              <span className="w-2 h-2 rounded-full bg-[#00D222]" />
            </div>
            <p className="text-[11px] text-[#CCCCCC] leading-snug">
              Semua perubahan data langsung tersimpan dan aktif pada website.
            </p>
            <button
              onClick={handleMasterSaveAndPublish}
              className="w-full bg-[#1F1F23] hover:bg-[#2A2A30] text-[#C5A059] border border-[#C5A059]/30 hover:border-[#C5A059] py-1.5 rounded-xs text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-3 h-3" />
              <span>Simpan & Terapkan</span>
            </button>
          </div>
        </aside>

        {/* CONTENT AREA */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {/* TAB 1: SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs tracking-[0.2em] text-[#C5A059] font-bold uppercase block">
                    Ikhtisar Operasional
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif-luxury text-white font-medium">
                    Dashboard Kontrol Toko
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMasterSaveAndPublish}
                    className="bg-[#C5A059] hover:bg-[#D4B06A] text-black font-bold px-4 py-2 rounded-sm text-xs flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan & Terapkan Perubahan</span>
                  </button>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#161618] border border-white/10 p-5 rounded-sm space-y-2">
                  <div className="flex items-center justify-between text-[#888888]">
                    <span className="text-xs font-semibold uppercase">Total Penjualan</span>
                    <ShoppingCart className="w-4 h-4 text-[#C5A059]" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">
                    Rp {totalSales.toLocaleString('id-ID')}
                  </div>
                  <p className="text-[11px] text-[#777777]">{orders.length} total transaksi</p>
                </div>

                <div className="bg-[#161618] border border-white/10 p-5 rounded-sm space-y-2">
                  <div className="flex items-center justify-between text-[#888888]">
                    <span className="text-xs font-semibold uppercase">Total Produk</span>
                    <Package className="w-4 h-4 text-[#00D222]" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">
                    {totalProducts} SKU
                  </div>
                  <p className="text-[11px] text-[#00D222]">{activeProducts} produk aktif live di website</p>
                </div>

                <div className="bg-[#161618] border border-white/10 p-5 rounded-sm space-y-2">
                  <div className="flex items-center justify-between text-[#888888]">
                    <span className="text-xs font-semibold uppercase">Pesanan Menunggu</span>
                    <AlertTriangle className="w-4 h-4 text-[#E81818]" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-amber-400">
                    {pendingOrders} Order
                  </div>
                  <p className="text-[11px] text-[#777777]">{processingOrders} sedang diproses</p>
                </div>

                <div className="bg-[#161618] border border-white/10 p-5 rounded-sm space-y-2">
                  <div className="flex items-center justify-between text-[#888888]">
                    <span className="text-xs font-semibold uppercase">Database Pelanggan</span>
                    <Users className="w-4 h-4 text-[#C5A059]" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">
                    {customers.length} Kontak
                  </div>
                  <p className="text-[11px] text-[#777777]">Tersimpan di Sheet Pelanggan</p>
                </div>
              </div>

              {/* Data Verification Banner */}
              <div className="bg-[#121214] border border-[#00D222]/30 p-5 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#00D222]/10 text-[#00D222] rounded-xs shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Verifikasi Penyimpanan & Tampilan Website</h4>
                    <p className="text-xs text-[#AAAAAA] mt-0.5">
                      Semua data produk, foto (upload/link), kategori, banner, dan pengaturan tersimpan secara permanen di memori lokal dan tersinkronisasi langsung dengan tampilan website.
                    </p>
                  </div>
                </div>

                <button
                  onClick={onCloseAdmin}
                  className="bg-[#00D222] hover:bg-[#00B51D] text-black font-bold px-4 py-2 rounded-sm text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Lihat Tampilan Web</span>
                </button>
              </div>

              {/* Recent Orders Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-serif-luxury text-white font-medium">
                    Pesanan Terbaru
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-[#C5A059] hover:underline flex items-center gap-1"
                  >
                    <span>Lihat Semua Pesanan</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="bg-[#161618] border border-white/10 rounded-sm overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-[#0A0A0B] text-[#888888]">
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Pelanggan</th>
                        <th className="p-3">Total</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {orders.slice(0, 5).map(o => (
                        <tr key={o.ORDER_ID} className="hover:bg-white/5 transition-colors">
                          <td className="p-3 font-mono font-bold text-[#C5A059]">{o.ORDER_ID}</td>
                          <td className="p-3">
                            <p className="text-white font-medium">{o.CUSTOMER_NAME}</p>
                            <p className="text-[10px] text-[#777777]">{o.PHONE}</p>
                          </td>
                          <td className="p-3 font-mono font-bold text-white">
                            Rp {o.TOTAL.toLocaleString('id-ID')}
                          </td>
                          <td className="p-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded-xs font-semibold ${
                              o.STATUS === 'COMPLETED' ? 'bg-green-950 text-green-300' :
                              o.STATUS === 'PENDING' ? 'bg-amber-950 text-amber-300' :
                              o.STATUS === 'CANCELLED' ? 'bg-red-950 text-red-300' :
                              'bg-blue-950 text-blue-300'
                            }`}>
                              {o.STATUS}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => setViewingOrder(o)}
                              className="text-xs text-[#C5A059] hover:underline"
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
            </div>
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs tracking-[0.2em] text-[#C5A059] font-bold uppercase block">
                    Katalog & Manajemen Stok
                  </span>
                  <h2 className="text-2xl font-serif-luxury text-white font-medium">
                    Daftar Produk ({products.length})
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const newProd: Product = {
                        ID: `PRD-${String(products.length + 1).padStart(4, '0')}`,
                        SKU: `BNL-NEW-${String(products.length + 1).padStart(2, '0')}`,
                        NAME: '',
                        CATEGORY_ID: categories[0]?.ID || 'CAT-001',
                        CATEGORY_NAME: categories[0]?.NAME || 'Kripik Tempe',
                        CATEGORY_FOLDER_ID: '',
                        PRODUCT_FOLDER_ID: '',
                        PRICE: 25000,
                        DISCOUNT_PRICE: 0,
                        WEIGHT: '150 Gram',
                        STOCK: 50,
                        DESCRIPTION: '',
                        COMPOSITION: 'Tempe Pilihan, Minyak Nabati, Bumbu Rempah Alami.',
                        NUTRITION: 'Protein 12g, Serat 4g, Energi 160 kkal.',
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
                    className="bg-[#C5A059] hover:bg-[#D4B06A] text-black font-bold px-4 py-2.5 rounded-sm text-xs tracking-wider uppercase flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Produk Baru</span>
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari produk berdasarkan Nama, SKU, atau Kategori..."
                  value={searchProd}
                  onChange={(e) => setSearchProd(e.target.value)}
                  className="w-full bg-[#161618] border border-white/10 rounded-sm pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#666666] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              {/* Product Table */}
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
                      <th className="p-3">Unggulan</th>
                      <th className="p-3">Status Web</th>
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
                              className="w-10 h-10 object-cover rounded-xs border border-white/10 bg-black"
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
                            <span className={p.STOCK <= 0 ? 'text-red-400 font-bold' : p.STOCK <= 5 ? 'text-amber-400 font-bold' : 'text-[#00D222]'}>
                              {p.STOCK} unit
                            </span>
                          </td>
                          <td className="p-3">
                            {p.FEATURED ? (
                              <span className="text-[10px] text-[#C5A059] font-bold flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                <span>Featured</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-[#666666]">-</span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded-xs font-semibold ${
                              p.ACTIVE ? 'bg-green-950 text-green-300' : 'bg-zinc-800 text-zinc-500'
                            }`}>
                              {p.ACTIVE ? 'TAYANG' : 'NONAKTIF'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setEditingProduct({ ...p });
                                setIsProductModalOpen(true);
                              }}
                              className="bg-[#0A0A0B] hover:bg-[#1F1F23] text-[#C5A059] border border-[#C5A059]/40 px-2.5 py-1 rounded-sm text-[11px] font-medium transition-colors cursor-pointer"
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
                    Struktur Kategori & Navigasi
                  </span>
                  <h2 className="text-2xl font-serif-luxury text-white font-medium">
                    Kategori Produk ({categories.length})
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
                  className="bg-[#C5A059] hover:bg-[#D4B06A] text-black font-bold px-4 py-2.5 rounded-sm text-xs tracking-wider uppercase flex items-center gap-2 cursor-pointer"
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
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {cat.IMAGE_URL && (
                          <img
                            src={cat.IMAGE_URL}
                            alt={cat.NAME}
                            className="w-12 h-12 object-cover rounded-xs border border-white/10 shrink-0"
                          />
                        )}
                        <div>
                          <span className="text-[10px] font-mono text-[#C5A059] uppercase tracking-wider">
                            {cat.ID} • Urutan: {cat.SORT_ORDER}
                          </span>
                          <h3 className="text-lg font-serif-luxury text-white font-medium mt-0.5">
                            {cat.NAME}
                          </h3>
                          <p className="text-xs text-[#888888] mt-1">{cat.DESCRIPTION}</p>
                        </div>
                      </div>

                      <span className={`text-[10px] px-2 py-0.5 rounded-xs font-semibold shrink-0 ${
                        cat.ACTIVE ? 'bg-green-950 text-green-300' : 'bg-zinc-800 text-zinc-500'
                      }`}>
                        {cat.ACTIVE ? 'AKTIF' : 'NONAKTIF'}
                      </span>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-white/5">
                      <button
                        onClick={() => {
                          setEditingCategory({ ...cat });
                          setIsCategoryModalOpen(true);
                        }}
                        className="bg-[#0A0A0B] hover:bg-[#1F1F23] text-[#C5A059] border border-[#C5A059]/40 px-3 py-1 rounded-sm text-xs cursor-pointer"
                      >
                        Edit Kategori
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: BANNERS */}
          {activeTab === 'banners' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs tracking-[0.2em] text-[#C5A059] font-bold uppercase block">
                    Visual & Hero Branding
                  </span>
                  <h2 className="text-2xl font-serif-luxury text-white font-medium">
                    Banner Promo & Hero Web ({banners.length})
                  </h2>
                </div>

                <button
                  onClick={() => {
                    const newBanner: Banner = {
                      ID: `BNR-${String(banners.length + 1).padStart(3, '0')}`,
                      TITLE: 'Camilan Premium Khas Nusantara',
                      SUBTITLE: 'Kelezatan Asli & Sehat',
                      DESCRIPTION: 'Dibuat dari bahan pilihan berkualitas tinggi untuk menemani momen istimewa Anda.',
                      IMAGE_FILE_ID: '',
                      IMAGE_URL: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
                      BUTTON_TEXT: 'Pesan Sekarang',
                      BUTTON_LINK: '#catalog',
                      ACTIVE: true,
                      SORT_ORDER: banners.length + 1,
                      CREATED_AT: new Date().toISOString(),
                      UPDATED_AT: new Date().toISOString(),
                    };
                    setEditingBanner(newBanner);
                    setIsBannerModalOpen(true);
                  }}
                  className="bg-[#C5A059] hover:bg-[#D4B06A] text-black font-bold px-4 py-2.5 rounded-sm text-xs tracking-wider uppercase flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Banner</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banners.map(b => (
                  <div key={b.ID} className="bg-[#161618] border border-white/10 rounded-sm overflow-hidden flex flex-col justify-between">
                    <div className="relative h-44 bg-black">
                      <img
                        src={b.IMAGE_URL}
                        alt={b.TITLE}
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-4 flex flex-col justify-end">
                        <span className="text-[10px] text-[#C5A059] font-bold uppercase">{b.SUBTITLE}</span>
                        <h4 className="text-base font-serif-luxury text-white font-medium">{b.TITLE}</h4>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <p className="text-xs text-[#888888]">{b.DESCRIPTION}</p>
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
                        <span className="text-[10px] font-mono text-[#AAAAAA]">Tombol: {b.BUTTON_TEXT}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingBanner({ ...b });
                              setIsBannerModalOpen(true);
                            }}
                            className="text-xs text-[#C5A059] hover:underline"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: TESTIMONIALS */}
          {activeTab === 'testimonials' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs tracking-[0.2em] text-[#C5A059] font-bold uppercase block">
                    Ulasan & Bukti Kepuasan
                  </span>
                  <h2 className="text-2xl font-serif-luxury text-white font-medium">
                    Testimoni Pelanggan ({testimonials.length})
                  </h2>
                </div>

                <button
                  onClick={() => {
                    const newTesti: Testimonial = {
                      ID: `TESTI-${String(testimonials.length + 1).padStart(3, '0')}`,
                      CUSTOMER_NAME: '',
                      MESSAGE: '',
                      PHOTO_FILE_ID: '',
                      PHOTO_URL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                      RATING: 5,
                      ACTIVE: true,
                      SORT_ORDER: testimonials.length + 1,
                      CREATED_AT: new Date().toISOString(),
                      UPDATED_AT: new Date().toISOString(),
                    };
                    setEditingTestimonial(newTesti);
                    setIsTestimonialModalOpen(true);
                  }}
                  className="bg-[#C5A059] hover:bg-[#D4B06A] text-black font-bold px-4 py-2.5 rounded-sm text-xs tracking-wider uppercase flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Testimoni</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {testimonials.map(t => (
                  <div key={t.ID} className="bg-[#161618] border border-white/10 p-5 rounded-sm space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={t.PHOTO_URL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                          alt={t.CUSTOMER_NAME}
                          className="w-10 h-10 rounded-full object-cover border border-white/10"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-white">{t.CUSTOMER_NAME}</h4>
                          <div className="flex items-center text-amber-400 text-xs">
                            {Array.from({ length: t.RATING }).map((_, idx) => (
                              <Star key={idx} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-[#CCCCCC] italic">"{t.MESSAGE}"</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                      <span className={`text-[10px] px-2 py-0.5 rounded-xs font-semibold ${
                        t.ACTIVE ? 'bg-green-950 text-green-300' : 'bg-zinc-800 text-zinc-500'
                      }`}>
                        {t.ACTIVE ? 'TAYANG' : 'NONAKTIF'}
                      </span>
                      <button
                        onClick={() => {
                          setEditingTestimonial({ ...t });
                          setIsTestimonialModalOpen(true);
                        }}
                        className="text-[#C5A059] hover:underline"
                      >
                        Edit
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
                                <span className="text-[#00D222] font-bold">📂 {p.SKU}/</span>
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
                      className={`px-3 py-1.5 rounded-xs text-[11px] font-semibold transition-colors cursor-pointer ${
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
                              className="bg-[#0A0A0B] hover:bg-[#1F1F23] text-[#C5A059] border border-[#C5A059]/40 px-2.5 py-1 rounded-sm text-[11px] cursor-pointer"
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
                        <td className="p-3 font-mono font-bold text-[#00D222]">
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
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs tracking-[0.2em] text-[#C5A059] font-bold uppercase block">
                    Konfigurasi Bisnis
                  </span>
                  <h2 className="text-2xl font-serif-luxury text-white font-medium">
                    Pengaturan Toko & Kontak
                  </h2>
                  <p className="text-xs text-[#888888] mt-1">
                    Semua pengaturan tersimpan dinamis dan tersinkronisasi ke website & Google Sheets.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await handlePullFromSpreadsheet();
                      setLocalSettings(store.getSettings());
                    }}
                    disabled={isBulkSyncing}
                    className="bg-[#1A1A1E] hover:bg-[#25252A] text-[#00D222] border border-[#00D222]/40 hover:border-[#00D222] font-semibold px-3.5 py-2 rounded-sm text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isBulkSyncing ? 'animate-spin' : ''}`} />
                    <span>{isBulkSyncing ? 'Menarik...' : 'Tarik dari Spreadsheet'}</span>
                  </button>

                  <button
                    onClick={handleSaveSettingsSubmit}
                    className="bg-[#C5A059] hover:bg-[#D4B06A] text-black font-bold px-4 py-2 rounded-sm text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-[#C5A059]/10"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Semua Pengaturan</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveSettingsSubmit} className="bg-[#161618] border border-white/10 rounded-sm p-6 space-y-4">
                {localSettings.map((s, idx) => (
                  <div key={s.SETTING} className="space-y-1.5 pb-4 border-b border-white/5">
                    <label className="text-xs font-bold text-white uppercase tracking-wider block font-mono text-[#C5A059]">
                      {s.SETTING}
                    </label>
                    <p className="text-[11px] text-[#777777]">{s.DESCRIPTION}</p>
                    
                    {s.SETTING.includes('URL') || s.SETTING.includes('IMAGE') || s.SETTING.includes('LOGO') ? (
                      <ImageUploadOrUrl
                        label={`Upload / Link Foto (${s.SETTING})`}
                        value={s.VALUE}
                        onChange={(newVal) => {
                          const updated = [...localSettings];
                          updated[idx] = { ...updated[idx], VALUE: newVal };
                          setLocalSettings(updated);
                        }}
                      />
                    ) : (
                      <input
                        type="text"
                        value={s.VALUE}
                        onChange={(e) => {
                          const updated = [...localSettings];
                          updated[idx] = { ...updated[idx], VALUE: e.target.value };
                          setLocalSettings(updated);
                        }}
                        className="w-full bg-[#0A0A0B] border border-white/10 rounded-sm px-3.5 py-2.5 text-xs text-white focus:border-[#C5A059] focus:outline-none"
                      />
                    )}
                  </div>
                ))}

                <div className="pt-4 flex items-center justify-between">
                  <span className="text-xs text-[#888888]">Reset Data Toko ke Contoh Awal</span>
                  <button
                    type="button"
                    onClick={handleResetData}
                    className="bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 px-4 py-2 rounded-sm text-xs cursor-pointer"
                  >
                    Reset Sample Data
                  </button>
                </div>
              </form>
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
                            log.TYPE === 'SYNC' ? 'bg-green-950 text-green-300' :
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
                          <span className={log.STATUS === 'SUCCESS' ? 'text-[#00D222]' : 'text-red-400'}>
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

              {/* Live Cloud Connection & Diagnostic Card */}
              <div className="bg-[#161618] border border-[#C5A059]/30 rounded-sm p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div>
                    <span className="text-[10px] tracking-widest text-[#00D222] font-mono font-bold uppercase flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5" />
                      Status Integrasi Google Apps Script
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">
                      Spreadsheet & Google Drive Live Sync
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={cloudStatus.checking}
                      className="bg-[#1A1A1E] hover:bg-[#25252A] text-white border border-white/15 px-3.5 py-2 rounded-sm text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${cloudStatus.checking ? 'animate-spin' : ''}`} />
                      <span>{cloudStatus.checking ? 'Menguji...' : 'Uji Koneksi'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePullFromSpreadsheet}
                      disabled={isBulkSyncing}
                      className="bg-[#1A1A1E] hover:bg-[#25252A] text-[#00D222] border border-[#00D222]/40 hover:border-[#00D222] font-semibold px-3.5 py-2 rounded-sm text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isBulkSyncing ? 'animate-spin' : ''}`} />
                      <span>{isBulkSyncing ? 'Menarik...' : 'Tarik dari Spreadsheet'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleBulkSyncNow}
                      disabled={isBulkSyncing}
                      className="bg-[#C5A059] hover:bg-[#D4B06A] text-black font-bold px-4 py-2 rounded-sm text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md shadow-[#C5A059]/10"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isBulkSyncing ? 'Menyinkronkan...' : 'Kirim Semua ke Spreadsheet'}</span>
                    </button>
                  </div>
                </div>

                {/* Connection Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#0A0A0B] border border-white/5 rounded-xs space-y-1 font-mono">
                    <span className="text-[10px] text-[#777777] uppercase block font-sans">Deployment Web App ID Terpasang</span>
                    <span className="text-[#C5A059] font-bold text-[11px] break-all">
                      AKfycbz1Trz8B-_7yWWEOBTQOGeP6QOGP03RER4RMdxkfSDqr8V2XCO0wxYZ2PhOfyVQFISkvw
                    </span>
                  </div>

                  <div className="p-3 bg-[#0A0A0B] border border-white/5 rounded-xs space-y-1">
                    <span className="text-[10px] text-[#777777] uppercase block font-sans">Hasil Uji / Sinkronisasi</span>
                    {cloudStatus.tested ? (
                      <p className={`text-xs font-mono font-medium ${cloudStatus.success ? 'text-[#00D222]' : 'text-amber-400'}`}>
                        {cloudStatus.message}
                      </p>
                    ) : bulkSyncResult ? (
                      <p className={`text-xs font-mono font-medium ${bulkSyncResult.success ? 'text-[#00D222]' : 'text-amber-400'}`}>
                        [{bulkSyncResult.timestamp}] {bulkSyncResult.message}
                      </p>
                    ) : (
                      <p className="text-xs text-[#888888]">
                        Klik <strong>"Uji Koneksi"</strong> untuk memastikan Google Apps Script siap menerima data.
                      </p>
                    )}
                  </div>
                </div>

                {/* Important Authorization Warning */}
                <div className="p-3.5 bg-amber-950/20 border border-amber-800/30 rounded-xs space-y-1.5 text-xs text-amber-200">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>PENTING: Mengapa Data Mungkin Belum Terekam di Google Drive / Spreadsheet?</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-[#DDDDDD] pl-1 leading-relaxed">
                    <li>
                      Pastikan di Google Apps Script saat <strong>Deploy → Manage deployments</strong>:
                      <br />• <strong>Execute as</strong>: <strong className="text-white">Me (ffbonles@gmail.com)</strong>
                      <br />• <strong>Who has access</strong>: <strong className="text-[#00D222]">Anyone</strong> (Jika disetel <em>Only myself</em>, browser tidak diizinkan mengirim data POST).
                    </li>
                    <li>
                      Pastikan fungsi <strong>initializeBonlesSystem()</strong> di file <code>Code.gs</code> sudah di-klik <strong>Run</strong> sekali di Apps Script agar 9 Sheet & Folder Drive tercipta.
                    </li>
                    <li>
                      Setelah mengubah kode di Apps Script editor, pastikan membuat <strong>New Version</strong> di menu Deploy!
                    </li>
                  </ul>
                </div>
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
                          className="bg-[#0A0A0B] hover:bg-[#1F1F23] text-white border border-white/10 hover:border-[#C5A059] px-3 py-1.5 rounded-sm text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {copiedFile === f.filename ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#00D222]" />
                              <span className="text-[#00D222]">Tersalin</span>
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

      {/* ===================== MODALS ===================== */}

      {/* 1. PRODUCT EDIT / ADD MODAL WITH PHOTO UPLOAD & URL */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#161618] border border-white/10 rounded-sm shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-serif-luxury text-white font-medium">
                {editingProduct.ID ? `Edit Produk: ${editingProduct.SKU}` : 'Tambah Produk Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="text-[#888888] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProductSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  placeholder="Misal: Keripik Tempe Crispy Bonles Original 150g"
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded-sm p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[#AAAAAA]">Harga Normal (Rp) *</label>
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

              <div className="space-y-1">
                <label className="text-[#AAAAAA]">Berat Bersih / Kemasan</label>
                <input
                  type="text"
                  value={editingProduct.WEIGHT}
                  onChange={(e) => setEditingProduct({ ...editingProduct, WEIGHT: e.target.value })}
                  placeholder="Misal: 150 Gram (Standar Pouch)"
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded-sm p-2 text-white"
                />
              </div>

              {/* PHOTO UPLOAD & URL SECTION FOR PRODUCT */}
              <div className="p-4 bg-[#0F0F11] border border-white/10 rounded-sm space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#C5A059] block">
                  Foto & Galeri Produk (Upload File atau Salin Link)
                </span>

                {/* 1. MAIN IMAGE */}
                <ImageUploadOrUrl
                  label="Foto Utama Produk (Wajib)"
                  value={editingProduct.MAIN_IMAGE_URL}
                  onChange={(url) => setEditingProduct({ ...editingProduct, MAIN_IMAGE_URL: url })}
                  placeholder="https://... atau upload foto kemasan utama"
                  required
                />

                {/* 2. GALLERY 1 */}
                <div className="pt-2 border-t border-white/5">
                  <ImageUploadOrUrl
                    label="Galeri Tambahan 1 (Opsional)"
                    value={editingProduct.GALLERY_1_URL || ''}
                    onChange={(url) => setEditingProduct({ ...editingProduct, GALLERY_1_URL: url })}
                    placeholder="https://... atau upload foto tampak samping/isi"
                  />
                </div>

                {/* 3. GALLERY 2 */}
                <div className="pt-2 border-t border-white/5">
                  <ImageUploadOrUrl
                    label="Galeri Tambahan 2 (Opsional)"
                    value={editingProduct.GALLERY_2_URL || ''}
                    onChange={(url) => setEditingProduct({ ...editingProduct, GALLERY_2_URL: url })}
                    placeholder="https://... atau upload foto sertifikasi/serving suggestion"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#AAAAAA]">Deskripsi Produk</label>
                <textarea
                  rows={2}
                  value={editingProduct.DESCRIPTION}
                  onChange={(e) => setEditingProduct({ ...editingProduct, DESCRIPTION: e.target.value })}
                  placeholder="Jelaskan cita rasa, keunggulan gizi, dan keunikan camilan..."
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded-sm p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[#AAAAAA]">Komposisi Bahan</label>
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
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={editingProduct.ACTIVE}
                    onChange={(e) => setEditingProduct({ ...editingProduct, ACTIVE: e.target.checked })}
                    className="rounded-xs accent-[#C5A059]"
                  />
                  <span>Tayang di Katalog Website (ACTIVE)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={editingProduct.FEATURED}
                    onChange={(e) => setEditingProduct({ ...editingProduct, FEATURED: e.target.checked })}
                    className="rounded-xs accent-[#C5A059]"
                  />
                  <span>Produk Unggulan / Hero (FEATURED)</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-[#0A0A0B] border border-white/10 rounded-sm text-[#888888] hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C5A059] hover:bg-[#D4B06A] text-black font-bold rounded-sm uppercase tracking-wider text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#C5A059]/20"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Produk & Terapkan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. CATEGORY EDIT / ADD MODAL WITH PHOTO UPLOAD & URL */}
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
                  placeholder="Misal: Keripik Tempe Crispy"
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded-sm p-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#AAAAAA]">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={editingCategory.DESCRIPTION}
                  onChange={(e) => setEditingCategory({ ...editingCategory, DESCRIPTION: e.target.value })}
                  placeholder="Keterangan kategori..."
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded-sm p-2 text-white"
                />
              </div>

              {/* Photo Upload or URL for Category */}
              <ImageUploadOrUrl
                label="Foto / Ikon Kategori (Upload / URL)"
                value={editingCategory.IMAGE_URL || ''}
                onChange={(url) => setEditingCategory({ ...editingCategory, IMAGE_URL: url })}
                placeholder="https://... atau upload ikon kategori"
              />

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
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={editingCategory.ACTIVE}
                      onChange={(e) => setEditingCategory({ ...editingCategory, ACTIVE: e.target.checked })}
                      className="accent-[#C5A059]"
                    />
                    <span>Status Aktif</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 bg-[#0A0A0B] border border-white/10 rounded-sm text-[#888888] hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C5A059] hover:bg-[#D4B06A] text-black font-bold rounded-sm uppercase tracking-wider text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Kategori</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. BANNER EDIT / ADD MODAL WITH PHOTO UPLOAD & URL */}
      {isBannerModalOpen && editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#161618] border border-white/10 rounded-sm shadow-2xl p-6 space-y-4 my-8">
            <h3 className="text-base font-serif-luxury text-white font-medium pb-2 border-b border-white/10">
              {editingBanner.ID ? `Edit Banner: ${editingBanner.TITLE}` : 'Tambah Banner Promo'}
            </h3>

            <form onSubmit={handleSaveBannerSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[#AAAAAA]">Judul Banner Utama *</label>
                <input
                  type="text"
                  required
                  value={editingBanner.TITLE}
                  onChange={(e) => setEditingBanner({ ...editingBanner, TITLE: e.target.value })}
                  placeholder="Misal: Camilan Tempe Crispy Tinggi Protein"
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded-sm p-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#AAAAAA]">Subtitle / Tagline Atas</label>
                <input
                  type="text"
                  value={editingBanner.SUBTITLE}
                  onChange={(e) => setEditingBanner({ ...editingBanner, SUBTITLE: e.target.value })}
                  placeholder="Misal: Kelezatan Asli Nusantara"
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded-sm p-2 text-white"
                />
              </div>

              {/* Photo Upload or URL for Banner */}
              <ImageUploadOrUrl
                label="Foto Banner / Background Hero (Upload / URL)"
                value={editingBanner.IMAGE_URL}
                onChange={(url) => setEditingBanner({ ...editingBanner, IMAGE_URL: url })}
                placeholder="https://... atau upload gambar banner resolusi tinggi"
                required
              />

              <div className="space-y-1">
                <label className="text-[#AAAAAA]">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={editingBanner.DESCRIPTION}
                  onChange={(e) => setEditingBanner({ ...editingBanner, DESCRIPTION: e.target.value })}
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded-sm p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[#AAAAAA]">Teks Tombol</label>
                  <input
                    type="text"
                    value={editingBanner.BUTTON_TEXT}
                    onChange={(e) => setEditingBanner({ ...editingBanner, BUTTON_TEXT: e.target.value })}
                    className="w-full bg-[#0A0A0B] border border-white/10 rounded-sm p-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#AAAAAA]">Link Tombol</label>
                  <input
                    type="text"
                    value={editingBanner.BUTTON_LINK}
                    onChange={(e) => setEditingBanner({ ...editingBanner, BUTTON_LINK: e.target.value })}
                    className="w-full bg-[#0A0A0B] border border-white/10 rounded-sm p-2 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  checked={editingBanner.ACTIVE}
                  onChange={(e) => setEditingBanner({ ...editingBanner, ACTIVE: e.target.checked })}
                  className="accent-[#C5A059]"
                />
                <span>Tayangkan Banner di Website</span>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-4 py-2 bg-[#0A0A0B] border border-white/10 rounded-sm text-[#888888] hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C5A059] hover:bg-[#D4B06A] text-black font-bold rounded-sm uppercase tracking-wider text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Banner</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. TESTIMONIAL EDIT / ADD MODAL WITH AVATAR PHOTO UPLOAD & URL */}
      {isTestimonialModalOpen && editingTestimonial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-md bg-[#161618] border border-white/10 rounded-sm shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-serif-luxury text-white font-medium pb-2 border-b border-white/10">
              {editingTestimonial.ID ? `Edit Testimoni: ${editingTestimonial.CUSTOMER_NAME}` : 'Tambah Testimoni'}
            </h3>

            <form onSubmit={handleSaveTestimonialSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[#AAAAAA]">Nama Pelanggan *</label>
                <input
                  type="text"
                  required
                  value={editingTestimonial.CUSTOMER_NAME}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, CUSTOMER_NAME: e.target.value })}
                  placeholder="Misal: Sarah Anggraini (Jakarta)"
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded-sm p-2 text-white"
                />
              </div>

              {/* Photo Upload or URL for Testimonial */}
              <ImageUploadOrUrl
                label="Foto Profil Pelanggan (Upload / URL)"
                value={editingTestimonial.PHOTO_URL}
                onChange={(url) => setEditingTestimonial({ ...editingTestimonial, PHOTO_URL: url })}
                placeholder="https://... atau upload avatar"
              />

              <div className="space-y-1">
                <label className="text-[#AAAAAA]">Rating Bintang (1 - 5)</label>
                <select
                  value={editingTestimonial.RATING}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, RATING: Number(e.target.value) })}
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded-sm p-2 text-white"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 Bintang - Sangat Puas)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 Bintang - Puas)</option>
                  <option value={3}>⭐⭐⭐ (3 Bintang - Cukup)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[#AAAAAA]">Isi Ulasan / Review *</label>
                <textarea
                  rows={3}
                  required
                  value={editingTestimonial.MESSAGE}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, MESSAGE: e.target.value })}
                  placeholder="Tulis ulasan pelanggan tentang kerenyahan dan rasa produk..."
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded-sm p-2 text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  checked={editingTestimonial.ACTIVE}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, ACTIVE: e.target.checked })}
                  className="accent-[#C5A059]"
                />
                <span>Tayangkan Testimoni di Website</span>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsTestimonialModalOpen(false)}
                  className="px-4 py-2 bg-[#0A0A0B] border border-white/10 rounded-sm text-[#888888] hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C5A059] hover:bg-[#D4B06A] text-black font-bold rounded-sm uppercase tracking-wider text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Testimoni</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. VIEW ORDER DETAIL MODAL */}
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
                className="text-[#888888] hover:text-white text-xs cursor-pointer"
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
                className="w-full bg-[#00D222] hover:bg-[#00B51D] text-black font-bold py-2.5 rounded-sm text-xs uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Hubungi Pelanggan di WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 6. SAVE SUCCESS & WEB SYNC VERIFICATION MODAL */}
      {saveSuccessModal && saveSuccessModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#161618] border border-[#00D222]/40 rounded-sm shadow-2xl p-6 space-y-5 text-center">
            <div className="w-14 h-14 bg-[#00D222]/10 border border-[#00D222]/30 rounded-full flex items-center justify-center mx-auto text-[#00D222]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#00D222] font-bold">
                Sinkronisasi Berhasil
              </span>
              <h3 className="text-xl font-serif-luxury text-white font-medium mt-1">
                Semua Perubahan Berhasil Disimpan!
              </h3>
              <p className="text-xs text-[#AAAAAA] mt-2 leading-relaxed">
                {saveSuccessModal.message}
              </p>
              {saveSuccessModal.cloudStatusText && (
                <div className="mt-3 p-2.5 bg-[#0A0A0B] border border-white/10 rounded-xs text-[11px] text-left flex items-start gap-2">
                  <Database className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Status Google Sheets & Drive:</span>
                    <span className="text-[#AAAAAA] font-mono text-[10px] leading-tight">
                      {saveSuccessModal.cloudStatusText}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-[#0A0A0B] border border-white/10 rounded-xs grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-[10px] text-[#777777] block">Produk Aktif</span>
                <span className="font-mono font-bold text-[#00D222] text-sm">
                  {saveSuccessModal.activeProductCount} SKU
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#777777] block">Kategori</span>
                <span className="font-mono font-bold text-[#C5A059] text-sm">
                  {saveSuccessModal.categoryCount}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#777777] block">Waktu Simpan</span>
                <span className="font-mono font-bold text-white text-xs">
                  {saveSuccessModal.timestamp}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSaveSuccessModal(null)}
                className="flex-1 bg-[#1A1A1E] hover:bg-[#25252A] text-white border border-white/10 py-2.5 rounded-sm text-xs font-semibold cursor-pointer"
              >
                Tetap di Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setSaveSuccessModal(null);
                  onCloseAdmin();
                }}
                className="flex-1 bg-gradient-to-r from-[#C5A059] to-[#E5C378] hover:from-[#D4B06A] hover:to-[#F0D08A] text-black font-bold py-2.5 rounded-sm text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Lihat Website Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
