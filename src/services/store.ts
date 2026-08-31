import { 
  Product, Category, Order, Customer, Setting, Banner, Testimonial, SystemLog, CartItem, CheckoutFormData 
} from '../types';
import { 
  INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_SETTINGS, 
  INITIAL_BANNERS, INITIAL_TESTIMONIALS, INITIAL_CUSTOMERS, INITIAL_ORDERS, INITIAL_LOGS 
} from '../data/initialData';

const STORAGE_KEYS = {
  PRODUCTS: 'bonles_products_v3',
  CATEGORIES: 'bonles_categories_v3',
  ORDERS: 'bonles_orders_v3',
  CUSTOMERS: 'bonles_customers_v3',
  SETTINGS: 'bonles_settings_v3',
  BANNERS: 'bonles_banners_v3',
  TESTIMONIALS: 'bonles_testimonials_v3',
  LOGS: 'bonles_logs_v3',
  CART: 'bonles_cart_v3',
  RECENTLY_VIEWED: 'bonles_recently_viewed_v3',
};

class StoreService {
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
    
    if (idx >= 0) {
      list[idx] = { ...cat, UPDATED_AT: now };
    } else {
      list.push({ 
        ...cat, 
        ID: cat.ID || `CAT-${String(list.length + 1).padStart(3, '0')}`,
        CREATED_AT: now, 
        UPDATED_AT: now 
      });
    }
    this.setStorage(STORAGE_KEYS.CATEGORIES, list);
    this.addLog('AUDIT', idx >= 0 ? 'UPDATE_CATEGORY' : 'CREATE_CATEGORY', 'ADMIN', cat.ID, `Kategori ${cat.NAME} disimpan`);
    return cat;
  }

  // Products
  getProducts(activeOnly = false): Product[] {
    const list = this.getStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    if (activeOnly) {
      return list.filter(p => p.ACTIVE);
    }
    return list;
  }

  getProductById(id: string): Product | undefined {
    return this.getProducts().find(p => p.ID === id || p.SKU === id);
  }

  saveProduct(prod: Product): Product {
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
        ORDER_COUNT: 1,
        TOTAL_SPENT: total,
      };
      customers.push(customer);
    } else {
      customer.ADDRESS = form.address;
      customer.CITY = form.city;
      customer.POSTAL_CODE = form.postalCode;
      customer.ORDER_COUNT = (customer.ORDER_COUNT || 0) + 1;
      customer.TOTAL_SPENT = (customer.TOTAL_SPENT || 0) + total;
      customer.UPDATED_AT = isoNow;
    }
    this.setStorage(STORAGE_KEYS.CUSTOMERS, customers);

    // Deduct stock from database
    validatedItems.forEach(vi => {
      const pIdx = allProducts.findIndex(p => p.ID === vi.product.ID);
      if (pIdx >= 0) {
        allProducts[pIdx].STOCK -= vi.qty;
        allProducts[pIdx].UPDATED_AT = isoNow;
      }
    });
    this.setStorage(STORAGE_KEYS.PRODUCTS, allProducts);

    // Save Order
    const newOrder: Order = {
      ORDER_ID: orderId,
      ORDER_DATE: isoNow,
      CUSTOMER_ID: customer.CUSTOMER_ID,
      CUSTOMER_NAME: form.name,
      PHONE: form.phone,
      EMAIL: form.email,
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
    return this.getStorage<Setting[]>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
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
  }

  // Banners & Testimonials
  getBanners(): Banner[] {
    return this.getStorage<Banner[]>(STORAGE_KEYS.BANNERS, INITIAL_BANNERS);
  }

  getTestimonials(): Testimonial[] {
    return this.getStorage<Testimonial[]>(STORAGE_KEYS.TESTIMONIALS, INITIAL_TESTIMONIALS);
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

  // Recently Viewed Tracking (Last 4 products clicked)
  getRecentlyViewed(limit = 4): Product[] {
    const ids = this.getStorage<string[]>(STORAGE_KEYS.RECENTLY_VIEWED, []);
    const allProducts = this.getProducts(true); // active products
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
    // Remove if already present so it gets shifted to the front
    ids = ids.filter(id => id !== productId);
    // Prepend to front
    ids.unshift(productId);
    // Keep max 10 ids stored
    ids = ids.slice(0, 10);
    this.setStorage(STORAGE_KEYS.RECENTLY_VIEWED, ids);

    return this.getRecentlyViewed(limit);
  }

  clearRecentlyViewed(): void {
    this.setStorage(STORAGE_KEYS.RECENTLY_VIEWED, []);
  }

  // WhatsApp Message Generator matching exact prompt template
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
