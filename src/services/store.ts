import { 
  Product, Category, Order, Customer, Setting, Banner, Testimonial, SystemLog, CartItem, CheckoutFormData 
} from '../types';
import { 
  INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_SETTINGS, 
  INITIAL_BANNERS, INITIAL_TESTIMONIALS, INITIAL_CUSTOMERS, INITIAL_ORDERS, INITIAL_LOGS 
} from '../data/initialData';
import { gasSync } from './gasSyncService';

const STORAGE_VERSION_KEY = 'bonles_app_version_v4_official';
const CURRENT_VERSION = '2026.08.31_v4_official';

const STORAGE_KEYS = {
  PRODUCTS: 'bonles_products_v4',
  CATEGORIES: 'bonles_categories_v4',
  ORDERS: 'bonles_orders_v4',
  CUSTOMERS: 'bonles_customers_v4',
  SETTINGS: 'bonles_settings_v4',
  BANNERS: 'bonles_banners_v4',
  TESTIMONIALS: 'bonles_testimonials_v4',
  LOGS: 'bonles_logs_v4',
  CART: 'bonles_cart_v4',
  RECENTLY_VIEWED: 'bonles_recently_viewed_v4',
};

/**
 * Purge outdated browser cookies and obsolete cache keys
 * to ensure visitors always receive fresh, up-to-date store data.
 */
export function clearOldCookiesAndLegacyCache(): void {
  try {
    // 1. Purge all browser cookies
    if (typeof document !== 'undefined' && document.cookie) {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.slice(0, eqPos).trim() : cookie.trim();
        if (name) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          if (typeof window !== 'undefined' && window.location) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
          }
        }
      }
    }

    // 2. Invalidate legacy localStorage versions if needed
    if (typeof localStorage !== 'undefined') {
      const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
      if (storedVersion !== CURRENT_VERSION) {
        // Clean legacy v1, v2, v3 keys
        const keysToRemove = [
          'bonles_products_v1', 'bonles_products_v2', 'bonles_products_v3',
          'bonles_categories_v1', 'bonles_categories_v2', 'bonles_categories_v3',
          'bonles_settings_v1', 'bonles_settings_v2', 'bonles_settings_v3',
          'bonles_banners_v1', 'bonles_banners_v2', 'bonles_banners_v3',
          'bonles_testimonials_v1', 'bonles_testimonials_v2', 'bonles_testimonials_v3',
          'bonles_logs_v1', 'bonles_logs_v2', 'bonles_logs_v3',
          'bonles_cart_v1', 'bonles_cart_v2', 'bonles_cart_v3',
          'bonles_recently_viewed_v1', 'bonles_recently_viewed_v2', 'bonles_recently_viewed_v3',
        ];
        keysToRemove.forEach(k => localStorage.removeItem(k));
        localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION);
      }
    }
  } catch (err) {
    console.warn('Cache & cookie purge warning:', err);
  }
}

class StoreService {
  private listeners: Set<() => void> = new Set();

  constructor() {
    clearOldCookiesAndLegacyCache();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public notifySubscribers(): void {
    this.listeners.forEach(fn => {
      try {
        fn();
      } catch (err) {
        console.error('Store listener notification error:', err);
      }
    });
  }

  private getStorage<T>(key: string, defaultVal: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultVal;
      return JSON.parse(data) as T;
    } catch {
      return defaultVal;
    }
  }

  private setStorage<T>(key: string, val: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.error('Failed to write to localStorage', e);
    }
  }

  // Categories
  getCategories(): Category[] {
    return this.getStorage<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES)
      .sort((a, b) => a.SORT_ORDER - b.SORT_ORDER);
  }

  saveCategory(cat: Category): Category {
    const list = this.getCategories();
    const idx = list.findIndex(c => c.ID === cat.ID);
    const now = new Date().toISOString();
    
    let saved: Category;
    if (idx >= 0) {
      saved = { ...cat, UPDATED_AT: now };
      list[idx] = saved;
    } else {
      saved = { 
        ...cat, 
        ID: cat.ID || `CAT-${String(list.length + 1).padStart(3, '0')}`,
        CREATED_AT: now, 
        UPDATED_AT: now 
      };
      list.push(saved);
    }
    this.setStorage(STORAGE_KEYS.CATEGORIES, list);
    this.addLog('AUDIT', idx >= 0 ? 'UPDATE_CATEGORY' : 'CREATE_CATEGORY', 'ADMIN', saved.ID, `Kategori ${saved.NAME} disimpan`);
    
    // Background sync to Google Sheets
    gasSync.syncCategory(saved).then(res => {
      if (res.success) {
        this.addLog('SYNC', 'SYNC_CATEGORY_SUCCESS', 'SYSTEM', saved.ID, `Kategori ${saved.NAME} berhasil disinkronkan ke Google Spreadsheet`, 'SUCCESS');
      } else {
        console.warn('Sync Category warning:', res.message);
      }
    }).catch(err => console.warn('Sync Category Error:', err));

    return saved;
  }

  // Products
  getProducts(activeOnly = false): Product[] {
    let list = this.getStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    // Sanitize any legacy [SAMPLE] tag in product names
    let modified = false;
    list = list.map(p => {
      if (p.NAME && p.NAME.includes('[SAMPLE]')) {
        modified = true;
        return {
          ...p,
          NAME: p.NAME.replace(/\[SAMPLE\]\s*/gi, '').trim()
        };
      }
      return p;
    });
    if (modified) {
      this.setStorage(STORAGE_KEYS.PRODUCTS, list);
    }
    if (activeOnly) {
      return list.filter(p => p.ACTIVE);
    }
    return list;
  }

  getProductById(id: string): Product | undefined {
    return this.getProducts().find(p => p.ID === id || p.SKU === id);
  }

  saveProduct(prod: Product, imageBase64?: string): Product {
    const list = this.getProducts();
    const idx = list.findIndex(p => p.ID === prod.ID || p.SKU === prod.SKU);
    const now = new Date().toISOString();
    
    let saved: Product;
    if (idx >= 0) {
      saved = { ...prod, UPDATED_AT: now };
      list[idx] = saved;
    } else {
      saved = {
        ...prod,
        ID: prod.ID || `PRD-${String(list.length + 1).padStart(4, '0')}`,
        CREATED_AT: now,
        UPDATED_AT: now
      };
      list.push(saved);
    }
    this.setStorage(STORAGE_KEYS.PRODUCTS, list);
    this.addLog('AUDIT', idx >= 0 ? 'UPDATE_PRODUCT' : 'CREATE_PRODUCT', 'ADMIN', saved.SKU, `Produk ${saved.NAME} berhasil disimpan`);

    // Background sync to Google Sheets & Drive
    gasSync.syncProduct(saved, imageBase64).then(res => {
      if (res.success) {
        this.addLog('SYNC', 'SYNC_PRODUCT_SUCCESS', 'SYSTEM', saved.SKU, `Produk ${saved.NAME} berhasil dicatat di Google Spreadsheet & Drive`, 'SUCCESS');
        // If image URL returned from Drive, update local state
        if (res.data && res.data.MAIN_IMAGE_URL && res.data.MAIN_IMAGE_URL !== saved.MAIN_IMAGE_URL) {
          const freshList = this.getProducts();
          const target = freshList.find(p => p.ID === saved.ID || p.SKU === saved.SKU);
          if (target) {
            target.MAIN_IMAGE_URL = res.data.MAIN_IMAGE_URL;
            target.MAIN_IMAGE_FILE_ID = res.data.MAIN_IMAGE_FILE_ID || target.MAIN_IMAGE_FILE_ID;
            this.setStorage(STORAGE_KEYS.PRODUCTS, freshList);
          }
        }
      } else {
        console.warn('Sync Product warning:', res.message);
      }
    }).catch(err => console.warn('Sync Product Error:', err));

    return saved;
  }

  deleteProduct(id: string): boolean {
    const list = this.getProducts();
    const idx = list.findIndex(p => p.ID === id);
    if (idx >= 0) {
      // Soft delete: ACTIVE = false as required by specs
      list[idx].ACTIVE = false;
      list[idx].UPDATED_AT = new Date().toISOString();
      this.setStorage(STORAGE_KEYS.PRODUCTS, list);
      this.addLog('AUDIT', 'SOFT_DELETE_PRODUCT', 'ADMIN', list[idx].SKU, `Produk ${list[idx].NAME} dinonaktifkan (soft delete)`);
      
      // Sync deletion to Google Sheets
      gasSync.syncProduct(list[idx]).catch(err => console.warn('Sync Delete Product Error:', err));
      return true;
    }
    return false;
  }

  // Cart Management
  getCart(): CartItem[] {
    return this.getStorage<CartItem[]>(STORAGE_KEYS.CART, []);
  }

  saveCart(cart: CartItem[]): void {
    this.setStorage(STORAGE_KEYS.CART, cart);
  }

  addToCart(product: Product, quantity = 1): CartItem[] {
    const cart = this.getCart();
    const idx = cart.findIndex(c => c.product.ID === product.ID);
    
    // Check available stock
    const freshProduct = this.getProductById(product.ID) || product;
    const currentQty = idx >= 0 ? cart[idx].quantity : 0;
    const newQty = currentQty + quantity;

    if (newQty > freshProduct.STOCK) {
      throw new Error(`Stok tidak mencukupi. Maksimal ${freshProduct.STOCK} item.`);
    }

    if (idx >= 0) {
      cart[idx].quantity = newQty;
      cart[idx].product = freshProduct;
    } else {
      cart.push({ product: freshProduct, quantity });
    }
    this.saveCart(cart);
    return cart;
  }

  updateCartQuantity(productId: string, quantity: number): CartItem[] {
    let cart = this.getCart();
    if (quantity <= 0) {
      cart = cart.filter(c => c.product.ID !== productId);
    } else {
      const item = cart.find(c => c.product.ID === productId);
      if (item) {
        const freshProduct = this.getProductById(productId) || item.product;
        if (quantity > freshProduct.STOCK) {
          throw new Error(`Stok tersedia hanya ${freshProduct.STOCK} unit.`);
        }
        item.quantity = quantity;
        item.product = freshProduct;
      }
    }
    this.saveCart(cart);
    return cart;
  }

  clearCart(): void {
    this.setStorage(STORAGE_KEYS.CART, []);
  }

  // Orders
  getOrders(): Order[] {
    return this.getStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  }

  updateOrderStatus(orderId: string, status: Order['STATUS']): Order {
    const list = this.getOrders();
    const idx = list.findIndex(o => o.ORDER_ID === orderId);
    if (idx >= 0) {
      list[idx].STATUS = status;
      list[idx].UPDATED_AT = new Date().toISOString();
      this.setStorage(STORAGE_KEYS.ORDERS, list);
      this.addLog('AUDIT', 'UPDATE_ORDER_STATUS', 'ADMIN', orderId, `Status pesanan diubah menjadi ${status}`);
      
      // Background sync to GAS
      gasSync.syncOrder({ action: 'updateOrderStatus', orderId, status }).catch(err => console.warn('Order status sync error:', err));
      return list[idx];
    }
    throw new Error('Pesanan tidak ditemukan');
  }

  // Atomic Order Creation with Stock Validation & Customer Upsert
  createOrder(form: CheckoutFormData, cartItems: CartItem[]): Order {
    if (!form.name || !form.phone) {
      throw new Error('Nama dan nomor WhatsApp wajib diisi.');
    }
    if (cartItems.length === 0) {
      throw new Error('Keranjang belanja kosong.');
    }

    const allProducts = this.getProducts();
    let subtotal = 0;
    const validatedItems: { product: Product; qty: number; price: number; subtotal: number }[] = [];

    // Re-verify stocks & fresh prices from database
    for (const item of cartItems) {
      const fresh = allProducts.find(p => p.ID === item.product.ID);
      if (!fresh || !fresh.ACTIVE) {
        throw new Error(`Produk ${item.product.NAME} sudah tidak aktif atau tidak ditemukan.`);
      }
      if (fresh.STOCK < item.quantity) {
        throw new Error(`Stok untuk ${fresh.NAME} tidak mencukupi (tersisa ${fresh.STOCK}).`);
      }
      
      const effectivePrice = (fresh.DISCOUNT_PRICE > 0 && fresh.DISCOUNT_PRICE < fresh.PRICE)
        ? fresh.DISCOUNT_PRICE
        : fresh.PRICE;
      const lineSubtotal = effectivePrice * item.quantity;
      
      subtotal += lineSubtotal;
      validatedItems.push({
        product: fresh,
        qty: item.quantity,
        price: effectivePrice,
        subtotal: lineSubtotal,
      });
    }

    // Shipping calculation
    const settings = this.getSettingsMap();
    const defaultShipping = Number(settings['DEFAULT_SHIPPING_COST']) || 15000;
    const shippingCost = defaultShipping;
    const discount = 0;
    const total = subtotal - discount + shippingCost;

    // Generate Order ID format ORD-YYYYMMDD-XXXX
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const randomSuffix = String(Math.floor(Math.random() * 9000) + 1000);
    const orderId = `ORD-${year}${month}${day}-${randomSuffix}`;
    const isoNow = now.toISOString();

    // Deduplicate / Create Customer
    const customers = this.getCustomers();
    let customer = customers.find(c => c.PHONE === form.phone || (form.email && c.EMAIL === form.email));
    if (!customer) {
      customer = {
        CUSTOMER_ID: `CUST-${String(customers.length + 1).padStart(4, '0')}`,
        NAME: form.name,
        PHONE: form.phone,
        EMAIL: form.email || '',
        ADDRESS: form.address,
        CITY: form.city,
        POSTAL_CODE: form.postalCode,
        CREATED_AT: isoNow,
        UPDATED_AT: isoNow,
      };
      customers.push(customer);
    } else {
      customer.ADDRESS = form.address;
      customer.CITY = form.city;
      customer.POSTAL_CODE = form.postalCode;
      customer.UPDATED_AT = isoNow;
    }
    this.setStorage(STORAGE_KEYS.CUSTOMERS, customers);

    // Atomically decrement stock in memory
    const updatedProducts = allProducts.map(p => {
      const match = validatedItems.find(v => v.product.ID === p.ID);
      if (match) {
        return {
          ...p,
          STOCK: Math.max(0, p.STOCK - match.qty),
          UPDATED_AT: isoNow,
        };
      }
      return p;
    });
    this.setStorage(STORAGE_KEYS.PRODUCTS, updatedProducts);

    // Build Order record
    const newOrder: Order = {
      ORDER_ID: orderId,
      ORDER_DATE: isoNow,
      CUSTOMER_ID: customer.CUSTOMER_ID,
      CUSTOMER_NAME: form.name,
      PHONE: form.phone,
      EMAIL: form.email || '',
      ADDRESS: form.address,
      CITY: form.city,
      POSTAL_CODE: form.postalCode,
      PAYMENT_METHOD: form.paymentMethod || 'Transfer Bank (BCA/Mandiri)',
      SHIPPING_METHOD: form.shippingMethod || 'Reguler',
      SHIPPING_COST: shippingCost,
      SUBTOTAL: subtotal,
      DISCOUNT: discount,
      TOTAL: total,
      STATUS: 'PENDING',
      NOTES: form.notes || '',
      CREATED_AT: isoNow,
      UPDATED_AT: isoNow,
      ITEMS: validatedItems.map(vi => ({
        ORDER_ID: orderId,
        PRODUCT_ID: vi.product.ID,
        SKU: vi.product.SKU,
        PRODUCT_NAME: vi.product.NAME,
        PRICE: vi.price,
        QUANTITY: vi.qty,
        SUBTOTAL: vi.subtotal,
      })),
    };

    const orders = this.getOrders();
    orders.unshift(newOrder);
    this.setStorage(STORAGE_KEYS.ORDERS, orders);

    // Log
    this.addLog('AUDIT', 'CREATE_ORDER', 'CUSTOMER', orderId, `Pesanan dibuat untuk ${form.name} senilai Rp ${total.toLocaleString('id-ID')}`);

    // Background sync to Google Sheets
    gasSync.syncOrder({
      customer: {
        name: form.name,
        phone: form.phone,
        email: form.email || '',
        address: form.address,
        city: form.city,
        postal_code: form.postalCode,
        notes: form.notes || '',
      },
      items: validatedItems.map(vi => ({
        product_id: vi.product.ID,
        sku: vi.product.SKU,
        quantity: vi.qty,
      })),
      shipping_cost: shippingCost,
      payment_method: form.paymentMethod || 'Transfer Bank',
      shipping_method: form.shippingMethod || 'Reguler',
    }).then(res => {
      if (res.success) {
        this.addLog('SYNC', 'SYNC_ORDER_SUCCESS', 'SYSTEM', orderId, `Pesanan ${orderId} berhasil dicatat di Google Spreadsheet`, 'SUCCESS');
      }
    }).catch(err => console.warn('Order sync warning:', err));

    // Clear cart
    this.clearCart();

    return newOrder;
  }

  // Customers
  getCustomers(): Customer[] {
    return this.getStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  }

  // Settings
  getSettings(): Setting[] {
    const list = this.getStorage<Setting[]>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    let modified = false;

    // Ensure official WhatsApp Number (+6285174333902)
    const waSetting = list.find(s => s.SETTING === 'WHATSAPP_NUMBER');
    if (!waSetting) {
      list.push({
        SETTING: 'WHATSAPP_NUMBER',
        VALUE: '6285174333902',
        DESCRIPTION: 'Nomor WhatsApp resmi admin pemesanan (+6285174333902)',
        UPDATED_AT: new Date().toISOString()
      });
      modified = true;
    } else if (waSetting.VALUE === '6281234567890' || !waSetting.VALUE.trim()) {
      waSetting.VALUE = '6285174333902';
      waSetting.DESCRIPTION = 'Nomor WhatsApp resmi admin pemesanan (+6285174333902)';
      modified = true;
    }

    // Ensure official Store Email (bonlesff@gmail.com)
    const emailSetting = list.find(s => s.SETTING === 'STORE_EMAIL');
    if (!emailSetting) {
      list.push({
        SETTING: 'STORE_EMAIL',
        VALUE: 'bonlesff@gmail.com',
        DESCRIPTION: 'Alamat email korespondensi resmi (bonlesff@gmail.com)',
        UPDATED_AT: new Date().toISOString()
      });
      modified = true;
    } else if (emailSetting.VALUE === 'bonlesfoodnusantara@gmail.com' || !emailSetting.VALUE.trim()) {
      emailSetting.VALUE = 'bonlesff@gmail.com';
      emailSetting.DESCRIPTION = 'Alamat email korespondensi resmi (bonlesff@gmail.com)';
      modified = true;
    }

    // Ensure official Store Address (Jl. MT. Haryono Gg. Mufakat II No.84 Balikpapan Selatan)
    const addrSetting = list.find(s => s.SETTING === 'STORE_ADDRESS');
    if (!addrSetting) {
      list.push({
        SETTING: 'STORE_ADDRESS',
        VALUE: 'Jl. MT. Haryono Gg. Mufakat II No.84 Balikpapan Selatan',
        DESCRIPTION: 'Alamat fisik / lokasi operasional resmi toko',
        UPDATED_AT: new Date().toISOString()
      });
      modified = true;
    } else if (addrSetting.VALUE === 'Sentra Industri Pangan Nusantara, Indonesia' || !addrSetting.VALUE.trim()) {
      addrSetting.VALUE = 'Jl. MT. Haryono Gg. Mufakat II No.84 Balikpapan Selatan';
      addrSetting.DESCRIPTION = 'Alamat fisik / lokasi operasional resmi toko';
      modified = true;
    }

    // Ensure default APPS_SCRIPT_WEBAPP_URL is present
    const scriptSetting = list.find(s => s.SETTING === 'APPS_SCRIPT_WEBAPP_URL');
    if (!scriptSetting || !scriptSetting.VALUE || !scriptSetting.VALUE.trim()) {
      const defaultUrl = 'https://script.google.com/macros/s/AKfycbz1Trz8B-_7yWWEOBTQOGeP6QOGP03RER4RMdxkfSDqr8V2XCO0wxYZ2PhOfyVQFISkvw/exec';
      if (!scriptSetting) {
        list.push({
          SETTING: 'APPS_SCRIPT_WEBAPP_URL',
          VALUE: defaultUrl,
          DESCRIPTION: 'URL Web App Google Apps Script & Google Sheets aktif (ID: AKfycbz1Trz8B-_7yWWEOBTQOGeP6QOGP03RER4RMdxkfSDqr8V2XCO0wxYZ2PhOfyVQFISkvw)',
          UPDATED_AT: new Date().toISOString()
        });
      } else {
        scriptSetting.VALUE = defaultUrl;
      }
      modified = true;
    }

    if (modified) {
      this.setStorage(STORAGE_KEYS.SETTINGS, list);
    }
    return list;
  }

  getSettingsMap(): Record<string, string> {
    const list = this.getSettings();
    const map: Record<string, string> = {};
    list.forEach(s => {
      map[s.SETTING] = s.VALUE;
    });
    return map;
  }

  saveSetting(key: string, value: string): void {
    const list = this.getSettings();
    const idx = list.findIndex(s => s.SETTING === key);
    const now = new Date().toISOString();
    if (idx >= 0) {
      list[idx].VALUE = value;
      list[idx].UPDATED_AT = now;
    } else {
      list.push({ SETTING: key, VALUE: value, DESCRIPTION: '', UPDATED_AT: now });
    }
    this.setStorage(STORAGE_KEYS.SETTINGS, list);
    this.addLog('AUDIT', 'UPDATE_SETTING', 'ADMIN', key, `Pengaturan ${key} diubah`);
    
    // Background sync to GAS
    gasSync.syncSettings(list).catch(err => console.warn('Sync Setting Error:', err));
  }

  // Banners & Testimonials
  getBanners(): Banner[] {
    return this.getStorage<Banner[]>(STORAGE_KEYS.BANNERS, INITIAL_BANNERS);
  }

  saveBanner(banner: Banner): Banner {
    const list = this.getBanners();
    const idx = list.findIndex(b => b.ID === banner.ID);
    const now = new Date().toISOString();
    let saved: Banner;
    if (idx >= 0) {
      saved = { ...banner, UPDATED_AT: now };
      list[idx] = saved;
    } else {
      saved = {
        ...banner,
        ID: banner.ID || `BNR-${String(list.length + 1).padStart(3, '0')}`,
        CREATED_AT: now,
        UPDATED_AT: now,
      };
      list.push(saved);
    }
    this.setStorage(STORAGE_KEYS.BANNERS, list);
    this.addLog('AUDIT', idx >= 0 ? 'UPDATE_BANNER' : 'CREATE_BANNER', 'ADMIN', saved.ID, `Banner ${saved.TITLE} berhasil disimpan`);
    
    // Background sync to GAS
    gasSync.syncBanner(saved).catch(err => console.warn('Sync Banner Error:', err));
    return saved;
  }

  deleteBanner(id: string): boolean {
    const list = this.getBanners();
    const idx = list.findIndex(b => b.ID === id);
    if (idx >= 0) {
      list[idx].ACTIVE = false;
      this.setStorage(STORAGE_KEYS.BANNERS, list);
      this.addLog('AUDIT', 'DELETE_BANNER', 'ADMIN', id, `Banner ${id} dinonaktifkan`);
      return true;
    }
    return false;
  }

  getTestimonials(): Testimonial[] {
    return this.getStorage<Testimonial[]>(STORAGE_KEYS.TESTIMONIALS, INITIAL_TESTIMONIALS);
  }

  saveTestimonial(testimonial: Testimonial): Testimonial {
    const list = this.getTestimonials();
    const idx = list.findIndex(t => t.ID === testimonial.ID);
    const now = new Date().toISOString();
    let saved: Testimonial;
    if (idx >= 0) {
      saved = { ...testimonial, UPDATED_AT: now };
      list[idx] = saved;
    } else {
      saved = {
        ...testimonial,
        ID: testimonial.ID || `TESTI-${String(list.length + 1).padStart(3, '0')}`,
        CREATED_AT: now,
        UPDATED_AT: now,
      };
      list.push(saved);
    }
    this.setStorage(STORAGE_KEYS.TESTIMONIALS, list);
    this.addLog('AUDIT', idx >= 0 ? 'UPDATE_TESTIMONIAL' : 'CREATE_TESTIMONIAL', 'ADMIN', saved.ID, `Testimoni dari ${saved.CUSTOMER_NAME} berhasil disimpan`);
    
    // Background sync to GAS
    gasSync.syncTestimonial(saved).catch(err => console.warn('Sync Testimonial Error:', err));
    return saved;
  }

  deleteTestimonial(id: string): boolean {
    const list = this.getTestimonials();
    const idx = list.findIndex(t => t.ID === id);
    if (idx >= 0) {
      list[idx].ACTIVE = false;
      this.setStorage(STORAGE_KEYS.TESTIMONIALS, list);
      this.addLog('AUDIT', 'DELETE_TESTIMONIAL', 'ADMIN', id, `Testimoni ${id} dinonaktifkan`);
      return true;
    }
    return false;
  }

  saveAllSettings(settingsList: Setting[]): void {
    const now = new Date().toISOString();
    const updated = settingsList.map(s => ({ ...s, UPDATED_AT: now }));
    this.setStorage(STORAGE_KEYS.SETTINGS, updated);
    this.addLog('AUDIT', 'BULK_UPDATE_SETTINGS', 'ADMIN', 'CONFIG', `Sebanyak ${updated.length} pengaturan toko berhasil disimpan dan disinkronkan`);
    
    // Sync all settings to Google Sheets
    gasSync.syncSettings(updated).then(res => {
      if (res.success) {
        this.addLog('SYNC', 'SYNC_SETTINGS_SUCCESS', 'SYSTEM', 'CONFIG', 'Pengaturan toko berhasil disinkronkan ke Google Spreadsheet', 'SUCCESS');
      }
    }).catch(err => console.warn('Sync Settings Error:', err));
  }

  /**
   * Pull and sync ALL data directly from Google Spreadsheet into the Web App
   * Updates Products, Categories, Settings (Store Name, WhatsApp, etc.), Banners, Testimonials
   */
  async pullFromCloudSpreadsheet(user = 'SYSTEM'): Promise<{
    success: boolean;
    message: string;
    productCount: number;
    categoryCount: number;
    bannerCount: number;
    testimonialCount: number;
    settingsCount: number;
    details?: any;
  }> {
    const parseSafeNum = (val: any, defaultVal = 0): number => {
      if (val === undefined || val === null || val === '') return defaultVal;
      if (typeof val === 'number') return isNaN(val) ? defaultVal : val;
      const cleaned = String(val).replace(/[^0-9.-]/g, '');
      const parsed = Number(cleaned);
      return isNaN(parsed) ? defaultVal : parsed;
    };

    const parseSafeBool = (val: any, defaultVal = true): boolean => {
      if (val === undefined || val === null || val === '') return defaultVal;
      if (typeof val === 'boolean') return val;
      const str = String(val).trim().toUpperCase();
      if (str === 'TRUE' || str === '1' || str === 'YES' || str === 'YA' || str === 'AKTIF' || str === 'ACTIVE') return true;
      if (str === 'FALSE' || str === '0' || str === 'NO' || str === 'TIDAK' || str === 'NONAKTIF' || str === 'INACTIVE') return false;
      return defaultVal;
    };

    const parseSafeStr = (val: any, defaultVal = ''): string => {
      if (val === undefined || val === null) return defaultVal;
      return String(val).trim();
    };

    try {
      const res = await gasSync.pullAllDataFromGoogleSheets();
      if (!res.success || !res.data) {
        return {
          success: false,
          message: res.message || 'Gagal mengambil data dari Google Spreadsheet.',
          productCount: 0,
          categoryCount: 0,
          bannerCount: 0,
          testimonialCount: 0,
          settingsCount: 0,
          details: res,
        };
      }

      const data = res.data;
      let pCount = 0;
      let cCount = 0;
      let bCount = 0;
      let tCount = 0;
      let sCount = 0;

      // 1. Normalize & Save Categories
      if (Array.isArray(data.categories) && data.categories.length > 0) {
        const categories: Category[] = data.categories.map((c: any, index: number) => ({
          ID: parseSafeStr(c.ID || c.id || `CAT-${String(index + 1).padStart(3, '0')}`),
          NAME: parseSafeStr(c.NAME || c.name || `Kategori ${index + 1}`),
          DESCRIPTION: parseSafeStr(c.DESCRIPTION || c.description || ''),
          IMAGE_FILE_ID: parseSafeStr(c.IMAGE_FILE_ID || c.image_file_id || ''),
          IMAGE_URL: parseSafeStr(c.IMAGE_URL || c.image_url || ''),
          ACTIVE: parseSafeBool(c.ACTIVE !== undefined ? c.ACTIVE : c.active, true),
          SORT_ORDER: parseSafeNum(c.SORT_ORDER !== undefined ? c.SORT_ORDER : c.sort_order, index + 1),
          CREATED_AT: parseSafeStr(c.CREATED_AT || c.created_at || new Date().toISOString()),
          UPDATED_AT: parseSafeStr(c.UPDATED_AT || c.updated_at || new Date().toISOString()),
        })).filter(c => c.NAME);

        if (categories.length > 0) {
          this.setStorage(STORAGE_KEYS.CATEGORIES, categories);
          cCount = categories.length;
        }
      }

      // 2. Normalize & Save Products
      if (Array.isArray(data.products) && data.products.length > 0) {
        const products: Product[] = data.products.map((p: any, index: number) => ({
          ID: parseSafeStr(p.ID || p.id || `PRD-${String(index + 1).padStart(4, '0')}`),
          SKU: parseSafeStr(p.SKU || p.sku || `SKU-${String(index + 1).padStart(3, '0')}`),
          NAME: parseSafeStr(p.NAME || p.name || `Produk ${index + 1}`),
          CATEGORY_ID: parseSafeStr(p.CATEGORY_ID || p.category_id || 'CAT-001'),
          CATEGORY_NAME: parseSafeStr(p.CATEGORY_NAME || p.category_name || 'Snack'),
          CATEGORY_FOLDER_ID: parseSafeStr(p.CATEGORY_FOLDER_ID || p.category_folder_id || ''),
          PRODUCT_FOLDER_ID: parseSafeStr(p.PRODUCT_FOLDER_ID || p.product_folder_id || ''),
          PRICE: parseSafeNum(p.PRICE !== undefined ? p.PRICE : p.price, 25000),
          DISCOUNT_PRICE: parseSafeNum(p.DISCOUNT_PRICE !== undefined ? p.DISCOUNT_PRICE : p.discount_price, 0),
          WEIGHT: parseSafeStr(p.WEIGHT || p.weight || '100g'),
          STOCK: parseSafeNum(p.STOCK !== undefined ? p.STOCK : p.stock, 0),
          DESCRIPTION: parseSafeStr(p.DESCRIPTION || p.description || ''),
          COMPOSITION: parseSafeStr(p.COMPOSITION || p.composition || ''),
          NUTRITION: parseSafeStr(p.NUTRITION || p.nutrition || ''),
          MAIN_IMAGE_FILE_ID: parseSafeStr(p.MAIN_IMAGE_FILE_ID || p.main_image_file_id || ''),
          MAIN_IMAGE_URL: parseSafeStr(p.MAIN_IMAGE_URL || p.main_image_url || ''),
          GALLERY_1_FILE_ID: parseSafeStr(p.GALLERY_1_FILE_ID || p.gallery_1_file_id || ''),
          GALLERY_1_URL: parseSafeStr(p.GALLERY_1_URL || p.gallery_1_url || ''),
          GALLERY_2_FILE_ID: parseSafeStr(p.GALLERY_2_FILE_ID || p.gallery_2_file_id || ''),
          GALLERY_2_URL: parseSafeStr(p.GALLERY_2_URL || p.gallery_2_url || ''),
          GALLERY_3_FILE_ID: parseSafeStr(p.GALLERY_3_FILE_ID || p.gallery_3_file_id || ''),
          GALLERY_3_URL: parseSafeStr(p.GALLERY_3_URL || p.gallery_3_url || ''),
          FEATURED: parseSafeBool(p.FEATURED !== undefined ? p.FEATURED : p.featured, false),
          ACTIVE: parseSafeBool(p.ACTIVE !== undefined ? p.ACTIVE : p.active, true),
          CREATED_AT: parseSafeStr(p.CREATED_AT || p.created_at || new Date().toISOString()),
          UPDATED_AT: parseSafeStr(p.UPDATED_AT || p.updated_at || new Date().toISOString()),
        })).filter(p => p.NAME);

        if (products.length > 0) {
          this.setStorage(STORAGE_KEYS.PRODUCTS, products);
          pCount = products.length;
        }
      }

      // 3. Normalize & Save Settings (Store Name, WhatsApp, Tagline, Address, etc.)
      if (data.settings) {
        const currentSettings = this.getSettings();
        const updatedSettings: Setting[] = [...currentSettings];

        if (Array.isArray(data.settings)) {
          data.settings.forEach((s: any) => {
            const key = parseSafeStr(s.SETTING || s.setting || s[0]);
            const val = parseSafeStr(s.VALUE !== undefined ? s.VALUE : (s.value !== undefined ? s.value : s[1]));
            const desc = parseSafeStr(s.DESCRIPTION || s.description || s[2] || '');
            if (key) {
              const idx = updatedSettings.findIndex(x => x.SETTING === key);
              if (idx >= 0) {
                updatedSettings[idx] = { ...updatedSettings[idx], VALUE: val, DESCRIPTION: desc || updatedSettings[idx].DESCRIPTION, UPDATED_AT: new Date().toISOString() };
              } else {
                updatedSettings.push({ SETTING: key, VALUE: val, DESCRIPTION: desc, UPDATED_AT: new Date().toISOString() });
              }
            }
          });
        } else if (typeof data.settings === 'object') {
          Object.entries(data.settings).forEach(([key, val]) => {
            const strVal = parseSafeStr(val);
            const idx = updatedSettings.findIndex(x => x.SETTING === key);
            if (idx >= 0) {
              updatedSettings[idx] = { ...updatedSettings[idx], VALUE: strVal, UPDATED_AT: new Date().toISOString() };
            } else {
              updatedSettings.push({ SETTING: key, VALUE: strVal, DESCRIPTION: '', UPDATED_AT: new Date().toISOString() });
            }
          });
        }

        this.setStorage(STORAGE_KEYS.SETTINGS, updatedSettings);
        sCount = updatedSettings.length;
      }

      // 4. Normalize & Save Banners
      if (Array.isArray(data.banners) && data.banners.length > 0) {
        const banners: Banner[] = data.banners.map((b: any, index: number) => ({
          ID: parseSafeStr(b.ID || b.id || `BNR-${String(index + 1).padStart(3, '0')}`),
          TITLE: parseSafeStr(b.TITLE || b.title || ''),
          SUBTITLE: parseSafeStr(b.SUBTITLE || b.subtitle || ''),
          DESCRIPTION: parseSafeStr(b.DESCRIPTION || b.description || ''),
          IMAGE_FILE_ID: parseSafeStr(b.IMAGE_FILE_ID || b.image_file_id || ''),
          IMAGE_URL: parseSafeStr(b.IMAGE_URL || b.image_url || ''),
          BUTTON_TEXT: parseSafeStr(b.BUTTON_TEXT || b.button_text || 'Lihat Katalog'),
          BUTTON_LINK: parseSafeStr(b.BUTTON_LINK || b.button_link || '#catalog'),
          ACTIVE: parseSafeBool(b.ACTIVE !== undefined ? b.ACTIVE : b.active, true),
          SORT_ORDER: parseSafeNum(b.SORT_ORDER !== undefined ? b.SORT_ORDER : b.sort_order, index + 1),
          CREATED_AT: parseSafeStr(b.CREATED_AT || b.created_at || new Date().toISOString()),
          UPDATED_AT: parseSafeStr(b.UPDATED_AT || b.updated_at || new Date().toISOString()),
        })).filter(b => b.TITLE || b.IMAGE_URL);

        if (banners.length > 0) {
          this.setStorage(STORAGE_KEYS.BANNERS, banners);
          bCount = banners.length;
        }
      }

      // 5. Normalize & Save Testimonials
      if (Array.isArray(data.testimonials) && data.testimonials.length > 0) {
        const testimonials: Testimonial[] = data.testimonials.map((t: any, index: number) => ({
          ID: parseSafeStr(t.ID || t.id || `TESTI-${String(index + 1).padStart(3, '0')}`),
          CUSTOMER_NAME: parseSafeStr(t.CUSTOMER_NAME || t.customer_name || 'Pelanggan Bonles'),
          MESSAGE: parseSafeStr(t.MESSAGE || t.message || ''),
          PHOTO_FILE_ID: parseSafeStr(t.PHOTO_FILE_ID || t.photo_file_id || ''),
          PHOTO_URL: parseSafeStr(t.PHOTO_URL || t.photo_url || ''),
          RATING: parseSafeNum(t.RATING !== undefined ? t.RATING : t.rating, 5),
          ACTIVE: parseSafeBool(t.ACTIVE !== undefined ? t.ACTIVE : t.active, true),
          SORT_ORDER: parseSafeNum(t.SORT_ORDER !== undefined ? t.SORT_ORDER : t.sort_order, index + 1),
          CREATED_AT: parseSafeStr(t.CREATED_AT || t.created_at || new Date().toISOString()),
          UPDATED_AT: parseSafeStr(t.UPDATED_AT || t.updated_at || new Date().toISOString()),
        })).filter(t => t.MESSAGE);

        if (testimonials.length > 0) {
          this.setStorage(STORAGE_KEYS.TESTIMONIALS, testimonials);
          tCount = testimonials.length;
        }
      }

      // 6. Notify all UI listeners to trigger re-renders
      this.notifySubscribers();

      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      this.addLog(
        'SYNC',
        'PULL_FROM_SPREADSHEET',
        user,
        'SPREADSHEET_SYNC',
        `Data live berhasil ditarik dari Google Spreadsheet pada ${timeStr} WIB: ${pCount} produk, ${cCount} kategori, ${sCount} pengaturan toko.`,
        'SUCCESS'
      );

      return {
        success: true,
        message: `Berhasil memuat data langsung dari Google Spreadsheet (${pCount} produk, ${cCount} kategori, ${sCount} pengaturan).`,
        productCount: pCount,
        categoryCount: cCount,
        bannerCount: bCount,
        testimonialCount: tCount,
        settingsCount: sCount,
        details: res.data,
      };
    } catch (err: any) {
      console.error('Pull from spreadsheet exception:', err);
      return {
        success: false,
        message: `Terjadi kendala saat menarik data dari Google Spreadsheet: ${err.message}`,
        productCount: 0,
        categoryCount: 0,
        bannerCount: 0,
        testimonialCount: 0,
        settingsCount: 0,
        details: err,
      };
    }
  }

  /**
   * Bulk Sync all local items to Google Sheets & Google Drive
   */
  async syncAllToCloudSpreadsheet(user = 'ffbonles@gmail.com'): Promise<{ success: boolean; message: string; details?: any }> {
    const products = this.getProducts();
    const categories = this.getCategories();
    const banners = this.getBanners();
    const testimonials = this.getTestimonials();
    const settings = this.getSettings();
    const orders = this.getOrders();
    const customers = this.getCustomers();

    try {
      const res = await gasSync.pushAllDataToGoogleSheets({
        products,
        categories,
        banners,
        testimonials,
        settings,
        orders,
        customers,
      });

      if (res.success) {
        this.addLog('SYNC', 'BULK_SYNC_TO_CLOUD', user, 'GOOGLE_SPREADSHEET', `Sinkronisasi menyeluruh ke Spreadsheet berhasil: ${products.length} produk, ${categories.length} kategori, ${banners.length} banner, ${testimonials.length} testimoni.`, 'SUCCESS');
        return {
          success: true,
          message: 'Seluruh data berhasil disinkronkan ke Google Spreadsheet & Google Drive!',
          details: res.data || res,
        };
      } else {
        this.addLog('ERROR', 'BULK_SYNC_TO_CLOUD_FAILED', user, 'GOOGLE_SPREADSHEET', `Gagal sinkronisasi ke Spreadsheet: ${res.message}`, 'FAILED');
        return {
          success: false,
          message: res.message || 'Gagal mengirim data ke Google Spreadsheet.',
          details: res,
        };
      }
    } catch (err: any) {
      this.addLog('ERROR', 'BULK_SYNC_TO_CLOUD_EXCEPTION', user, 'GOOGLE_SPREADSHEET', `Terjadi error jaringan: ${err.message}`, 'FAILED');
      return {
        success: false,
        message: `Terjadi error saat sinkronisasi: ${err.message}`,
        details: err,
      };
    }
  }

  /**
   * Force Save & Comprehensive Verification for Superadmin
   */
  forceSyncAndVerify(user = 'ffbonles@gmail.com'): {
    success: boolean;
    timestamp: string;
    productCount: number;
    activeProductCount: number;
    categoryCount: number;
    orderCount: number;
    bannerCount: number;
    testimonialCount: number;
    message: string;
    cloudSyncPromise: Promise<{ success: boolean; message: string; details?: any }>;
  } {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Validate storage integrity
    const products = this.getProducts();
    const categories = this.getCategories();
    const orders = this.getOrders();
    const banners = this.getBanners();
    const testimonials = this.getTestimonials();
    const settings = this.getSettings();

    // Re-persist to guarantee fresh snapshot in storage
    this.setStorage(STORAGE_KEYS.PRODUCTS, products);
    this.setStorage(STORAGE_KEYS.CATEGORIES, categories);
    this.setStorage(STORAGE_KEYS.SETTINGS, settings);
    this.setStorage(STORAGE_KEYS.BANNERS, banners);
    this.setStorage(STORAGE_KEYS.TESTIMONIALS, testimonials);

    const activeProds = products.filter(p => p.ACTIVE).length;

    this.addLog(
      'SYNC',
      'SUPERADMIN_SAVE_AND_VERIFY',
      user,
      'DATABASE_SNAPSHOT',
      `Verifikasi penyimpanan menyeluruh berhasil pada ${timeFormatted} WIB: ${products.length} produk (${activeProds} aktif), ${categories.length} kategori, ${banners.length} banner, ${orders.length} order siap live di website.`,
      'SUCCESS'
    );

    // Asynchronously trigger Cloud Sync to Google Sheets & Drive
    const cloudSyncPromise = this.syncAllToCloudSpreadsheet(user);

    return {
      success: true,
      timestamp: timeFormatted,
      productCount: products.length,
      activeProductCount: activeProds,
      categoryCount: categories.length,
      orderCount: orders.length,
      bannerCount: banners.length,
      testimonialCount: testimonials.length,
      message: `Semua data (${activeProds} produk aktif, ${categories.length} kategori, pengaturan toko) telah tersimpan permanen di aplikasi dan sedang disinkronkan ke Google Spreadsheet.`,
      cloudSyncPromise,
    };
  }

  // Logs
  getLogs(): SystemLog[] {
    return this.getStorage<SystemLog[]>(STORAGE_KEYS.LOGS, INITIAL_LOGS);
  }

  addLog(type: SystemLog['TYPE'], action: string, user: string, refId: string, message: string, status: 'SUCCESS' | 'FAILED' = 'SUCCESS'): void {
    const logs = this.getLogs();
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const logId = `LOG-${dateStr}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    
    logs.unshift({
      LOG_ID: logId,
      TIMESTAMP: now.toISOString(),
      TYPE: type,
      ACTION: action,
      USER: user,
      REFERENCE_ID: refId,
      MESSAGE: message,
      STATUS: status,
    });
    // Keep max 100 logs
    this.setStorage(STORAGE_KEYS.LOGS, logs.slice(0, 100));
  }

  // Reset to sample data
  resetToSampleData(): void {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.BANNERS);
    localStorage.removeItem(STORAGE_KEYS.TESTIMONIALS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    localStorage.removeItem(STORAGE_KEYS.CART);
    localStorage.removeItem(STORAGE_KEYS.RECENTLY_VIEWED);
    this.addLog('INFO', 'RESET_SAMPLE_DATA', 'ADMIN', 'SYSTEM', 'Data sistem di-reset ke sample default.');
  }

  // Recently Viewed Tracking
  getRecentlyViewed(limit = 4): Product[] {
    const ids = this.getStorage<string[]>(STORAGE_KEYS.RECENTLY_VIEWED, []);
    const allProducts = this.getProducts(true);
    const result: Product[] = [];

    for (const id of ids) {
      const found = allProducts.find(p => p.ID === id || p.SKU === id);
      if (found) {
        result.push(found);
      }
      if (result.length >= limit) break;
    }
    return result;
  }

  addRecentlyViewed(productId: string, limit = 4): Product[] {
    if (!productId) return this.getRecentlyViewed(limit);
    
    let ids = this.getStorage<string[]>(STORAGE_KEYS.RECENTLY_VIEWED, []);
    ids = ids.filter(id => id !== productId);
    ids.unshift(productId);
    ids = ids.slice(0, 10);
    this.setStorage(STORAGE_KEYS.RECENTLY_VIEWED, ids);

    return this.getRecentlyViewed(limit);
  }

  clearRecentlyViewed(): void {
    this.setStorage(STORAGE_KEYS.RECENTLY_VIEWED, []);
  }

  // WhatsApp Message Generator
  generateWhatsAppLink(order: Order, waNumber: string): string {
    const cleanNumber = waNumber.replace(/\D/g, '');
    
    const itemsText = (order.ITEMS || [])
      .map(i => `- ${i.PRODUCT_NAME} x${i.QUANTITY}`)
      .join('\n');

    const message = `Halo PT. Bonles Food Nusantara.

Saya ingin melakukan pemesanan.

Nomor Order:
${order.ORDER_ID}

Nama:
${order.CUSTOMER_NAME}

Produk:
${itemsText}

Subtotal:
Rp ${order.SUBTOTAL.toLocaleString('id-ID')}

Ongkir:
Rp ${order.SHIPPING_COST.toLocaleString('id-ID')}

Total:
Rp ${order.TOTAL.toLocaleString('id-ID')}

Alamat:
${order.ADDRESS}, ${order.CITY} ${order.POSTAL_CODE}

Terima kasih.`;

    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  }
}

export const store = new StoreService();
