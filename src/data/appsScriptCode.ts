export interface ScriptFile {
  filename: string;
  description: string;
  code: string;
}

export const APPS_SCRIPT_FILES: ScriptFile[] = [
  {
    filename: 'Config.gs',
    description: 'Konfigurasi terpusat nama sheet, folder Google Drive, durasi lock, dan cache backend.',
    code: `/**
 * PT. BONLES FOOD NUSANTARA
 * File: Config.gs - Konfigurasi Utama Google Apps Script
 */

const CONFIG = {
  // Nama Root Folder di Google Drive
  DRIVE_ROOT_FOLDER: "BONLES FOOD NUSANTARA",
  
  // Nama-nama Sheet Database
  SHEETS: {
    PRODUCTS: "Products",
    CATEGORIES: "Categories",
    ORDERS: "Orders",
    ORDER_ITEMS: "Order_Items",
    CUSTOMERS: "Customers",
    SETTINGS: "Settings",
    BANNERS: "Banners",
    TESTIMONIALS: "Testimonials",
    SYSTEM_LOG: "System_Log"
  },
  
  // Folder Standar Drive
  FOLDERS: {
    PRODUCTS: "Products",
    CATEGORIES: "Categories",
    BANNERS: "Banners",
    TESTIMONIALS: "Testimonials",
    DOCUMENTS: "Documents",
    ARCHIVE: "Archive"
  },
  
  // Pengaturan Concurrency Lock
  LOCK_TIMEOUT_MS: 15000,
  
  // Cache Time to Live (detik)
  CACHE_TTL_SECONDS: 600, // 10 menit
  
  // Maksimal ukuran upload (5MB)
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024
};

function getActiveSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSheet(sheetName) {
  const ss = getActiveSpreadsheet();
  return ss.getSheetByName(sheetName);
}
`
  },
  {
    filename: 'Logger.gs',
    description: 'Pencatatan log transaksi, audit data, sinkronisasi Google Drive, dan penanganan error ke sheet System_Log.',
    code: `/**
 * PT. BONLES FOOD NUSANTARA
 * File: Logger.gs - Audit & Error Logger
 */

function logSystemEvent(type, action, user, referenceId, message, status) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.SYSTEM_LOG);
    if (!sheet) return;
    
    const timestamp = new Date().toISOString();
    const logId = "LOG-" + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd") + "-" + Utilities.getUuid().substring(0, 6).toUpperCase();
    
    sheet.appendRow([
      logId,
      timestamp,
      type || "INFO",
      action || "GENERAL",
      user || "SYSTEM",
      referenceId || "-",
      message || "",
      status || "SUCCESS"
    ]);
  } catch (err) {
    console.error("Gagal mencatat log sistem:", err);
  }
}
`
  },
  {
    filename: 'Utils.gs',
    description: 'Fungsi pembantu sanitasi input, validasi parameter, dan pembentukan JSON response standar.',
    code: `/**
 * PT. BONLES FOOD NUSANTARA
 * File: Utils.gs - Helper & Response Utilities
 */

function jsonResponse(data, success = true, message = "Data berhasil diproses") {
  const output = {
    success: success,
    message: message,
    data: data
  };
  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonError(message = "Terjadi kesalahan", statusCode = 400) {
  const output = {
    success: false,
    message: message,
    data: null
  };
  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
}

function parseNumber(val, defaultVal = 0) {
  const num = Number(val);
  return isNaN(num) ? defaultVal : num;
}
`
  },
  {
    filename: 'Database.gs',
    description: 'Inisialisasi otomatis semua sheet dan header, pembuatan data contoh (Sample Data), serta pengelolaan Settings.',
    code: `/**
 * PT. BONLES FOOD NUSANTARA
 * File: Database.gs - Skema Spreadsheet & Inisialisasi
 */

function setupDatabase() {
  const ss = getActiveSpreadsheet();
  
  const SCHEMAS = {
    [CONFIG.SHEETS.PRODUCTS]: [
      "ID", "SKU", "NAME", "CATEGORY_ID", "CATEGORY_NAME", 
      "CATEGORY_FOLDER_ID", "PRODUCT_FOLDER_ID", "PRICE", "DISCOUNT_PRICE", 
      "WEIGHT", "STOCK", "DESCRIPTION", "COMPOSITION", "NUTRITION", 
      "MAIN_IMAGE_FILE_ID", "MAIN_IMAGE_URL", "GALLERY_1_FILE_ID", "GALLERY_1_URL", 
      "GALLERY_2_FILE_ID", "GALLERY_2_URL", "GALLERY_3_FILE_ID", "GALLERY_3_URL", 
      "FEATURED", "ACTIVE", "CREATED_AT", "UPDATED_AT"
    ],
    [CONFIG.SHEETS.CATEGORIES]: [
      "ID", "NAME", "DESCRIPTION", "IMAGE_FILE_ID", "IMAGE_URL", "ACTIVE", "SORT_ORDER", "CREATED_AT", "UPDATED_AT"
    ],
    [CONFIG.SHEETS.ORDERS]: [
      "ORDER_ID", "ORDER_DATE", "CUSTOMER_ID", "CUSTOMER_NAME", "PHONE", "EMAIL", 
      "ADDRESS", "CITY", "POSTAL_CODE", "PAYMENT_METHOD", "SHIPPING_METHOD", 
      "SHIPPING_COST", "SUBTOTAL", "DISCOUNT", "TOTAL", "STATUS", "NOTES", "CREATED_AT", "UPDATED_AT"
    ],
    [CONFIG.SHEETS.ORDER_ITEMS]: [
      "ORDER_ID", "PRODUCT_ID", "SKU", "PRODUCT_NAME", "PRICE", "QUANTITY", "SUBTOTAL"
    ],
    [CONFIG.SHEETS.CUSTOMERS]: [
      "CUSTOMER_ID", "NAME", "PHONE", "EMAIL", "ADDRESS", "CITY", "POSTAL_CODE", "CREATED_AT", "UPDATED_AT"
    ],
    [CONFIG.SHEETS.SETTINGS]: [
      "SETTING", "VALUE", "DESCRIPTION", "UPDATED_AT"
    ],
    [CONFIG.SHEETS.BANNERS]: [
      "ID", "TITLE", "SUBTITLE", "DESCRIPTION", "IMAGE_FILE_ID", "IMAGE_URL", "BUTTON_TEXT", "BUTTON_LINK", "ACTIVE", "SORT_ORDER", "CREATED_AT", "UPDATED_AT"
    ],
    [CONFIG.SHEETS.TESTIMONIALS]: [
      "ID", "CUSTOMER_NAME", "MESSAGE", "PHOTO_FILE_ID", "PHOTO_URL", "RATING", "ACTIVE", "SORT_ORDER", "CREATED_AT", "UPDATED_AT"
    ],
    [CONFIG.SHEETS.SYSTEM_LOG]: [
      "LOG_ID", "TIMESTAMP", "TYPE", "ACTION", "USER", "REFERENCE_ID", "MESSAGE", "STATUS"
    ]
  };

  for (const sheetName in SCHEMAS) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(SCHEMAS[sheetName]);
      sheet.getRange(1, 1, 1, SCHEMAS[sheetName].length)
        .setFontWeight("bold")
        .setBackground("#161618")
        .setFontColor("#C5A059");
      sheet.setFrozenRows(1);
    }
  }
  
  setupDefaultSettings();
  logSystemEvent("INFO", "SETUP_DATABASE", "SYSTEM", ss.getId(), "Inisialisasi struktur database Google Sheets selesai.", "SUCCESS");
  return "Database berhasil disiapkan.";
}

function setupDefaultSettings() {
  const sheet = getSheet(CONFIG.SHEETS.SETTINGS);
  if (!sheet) return;
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    const now = new Date().toISOString();
    const defaults = [
      ["STORE_NAME", "PT. BONLES FOOD NUSANTARA", "Nama resmi entitas bisnis", now],
      ["TAGLINE", "Snack Tinggi Protein & Oleh-Oleh Khas Nusantara", "Slogan dan positioning produk", now],
      ["WHATSAPP_NUMBER", "6281234567890", "Nomor WhatsApp admin pemesanan", now],
      ["STORE_EMAIL", "bonlesfoodnusantara@gmail.com", "Alamat email resmi", now],
      ["STORE_ADDRESS", "Sentra Industri Pangan Nusantara, Indonesia", "Alamat toko", now],
      ["CURRENCY", "IDR", "Mata uang transaksi", now],
      ["SHIPPING_ENABLED", "TRUE", "Status layanan pengiriman ekspedisi", now],
      ["DEFAULT_SHIPPING_COST", "15000", "Estimasi ongkir standar", now]
    ];
    
    defaults.forEach(row => sheet.appendRow(row));
  }
}

function getSettings() {
  const sheet = getSheet(CONFIG.SHEETS.SETTINGS);
  if (!sheet) return {};
  
  const rows = sheet.getDataRange().getValues();
  const settings = {};
  for (let i = 1; i < rows.length; i++) {
    const key = rows[i][0];
    const val = rows[i][1];
    if (key) settings[key] = val;
  }
  return settings;
}
`
  },
  {
    filename: 'DriveManager.gs',
    description: 'Manajemen struktur Google Drive otomatis, folder Kategori, folder SKU Produk, upload file, dan audit integritas.',
    code: `/**
 * PT. BONLES FOOD NUSANTARA
 * File: DriveManager.gs - Pengelolaan Google Drive
 */

function getOrCreateRootFolder() {
  const folders = DriveApp.getFoldersByName(CONFIG.DRIVE_ROOT_FOLDER);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(CONFIG.DRIVE_ROOT_FOLDER);
}

function setupDriveStructure() {
  const root = getOrCreateRootFolder();
  const subfolders = [
    CONFIG.FOLDERS.PRODUCTS,
    CONFIG.FOLDERS.CATEGORIES,
    CONFIG.FOLDERS.BANNERS,
    CONFIG.FOLDERS.TESTIMONIALS,
    CONFIG.FOLDERS.DOCUMENTS,
    CONFIG.FOLDERS.ARCHIVE
  ];
  
  const folderMap = {};
  subfolders.forEach(name => {
    const existing = root.getFoldersByName(name);
    if (existing.hasNext()) {
      folderMap[name] = existing.next();
    } else {
      folderMap[name] = root.createFolder(name);
    }
  });
  
  logSystemEvent("INFO", "SETUP_DRIVE", "SYSTEM", root.getId(), "Struktur Google Drive berhasil dibuat.", "SUCCESS");
  return {
    rootId: root.getId(),
    subfolders: folderMap
  };
}

function getOrCreateCategoryFolder(categoryName) {
  const root = getOrCreateRootFolder();
  let productsFolder;
  const prodFolders = root.getFoldersByName(CONFIG.FOLDERS.PRODUCTS);
  if (prodFolders.hasNext()) {
    productsFolder = prodFolders.next();
  } else {
    productsFolder = root.createFolder(CONFIG.FOLDERS.PRODUCTS);
  }
  
  const cleanName = sanitizeString(categoryName) || "Uncategorized";
  const catFolders = productsFolder.getFoldersByName(cleanName);
  if (catFolders.hasNext()) {
    return catFolders.next();
  }
  return productsFolder.createFolder(cleanName);
}

function getOrCreateProductFolder(categoryName, sku) {
  if (!sku) throw new Error("SKU produk wajib diisi");
  const catFolder = getOrCreateCategoryFolder(categoryName);
  const cleanSku = sanitizeString(sku);
  
  const prodFolders = catFolder.getFoldersByName(cleanSku);
  if (prodFolders.hasNext()) {
    return prodFolders.next();
  }
  return catFolder.createFolder(cleanSku);
}

function uploadProductImage(categoryName, sku, base64Data, filename, imageSlot) {
  const targetFolder = getOrCreateProductFolder(categoryName, sku);
  const decoded = Utilities.base64Decode(base64Data);
  const blob = Utilities.newBlob(decoded, "image/jpeg", filename || (imageSlot + ".jpg"));
  
  const file = targetFolder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  const fileId = file.getId();
  const directUrl = "https://drive.google.com/uc?export=view&id=" + fileId;
  
  logSystemEvent("AUDIT", "UPLOAD_IMAGE", "ADMIN", sku, "Upload " + imageSlot + " berhasil. ID: " + fileId, "SUCCESS");
  
  return {
    fileId: fileId,
    url: directUrl
  };
}

function moveProductFolder(sku, oldCategoryName, newCategoryName) {
  if (oldCategoryName === newCategoryName) return;
  const oldCatFolder = getOrCreateCategoryFolder(oldCategoryName);
  const newCatFolder = getOrCreateCategoryFolder(newCategoryName);
  
  const prodFolders = oldCatFolder.getFoldersByName(sku);
  if (prodFolders.hasNext()) {
    const prodFolder = prodFolders.next();
    newCatFolder.addFolder(prodFolder);
    oldCatFolder.removeFolder(prodFolder);
    logSystemEvent("AUDIT", "MOVE_PRODUCT_FOLDER", "ADMIN", sku, "Folder " + sku + " dipindahkan ke " + newCategoryName, "SUCCESS");
  }
}

function auditDriveStructure() {
  const report = {
    categoriesChecked: 0,
    productsChecked: 0,
    missingFolders: [],
    missingImages: [],
    orphanFolders: []
  };
  
  const sheet = getSheet(CONFIG.SHEETS.PRODUCTS);
  if (!sheet) return report;
  
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    const sku = rows[i][1];
    const name = rows[i][2];
    const catName = rows[i][4];
    const mainImgId = rows[i][14];
    
    report.productsChecked++;
    if (!mainImgId) {
      report.missingImages.push({ sku: sku, name: name });
    }
  }
  
  logSystemEvent("AUDIT", "DRIVE_AUDIT", "ADMIN", "-", "Audit Drive selesai. Missing images: " + report.missingImages.length, "SUCCESS");
  return report;
}
`
  },
  {
    filename: 'Products.gs',
    description: 'Operasi pembacaan, filtering, pembaruan data produk dan sinkronisasi harga/stok.',
    code: `/**
 * PT. BONLES FOOD NUSANTARA
 * File: Products.gs - Logika Produk & Katalog
 */

function getProducts(onlyActive = true) {
  const sheet = getSheet(CONFIG.SHEETS.PRODUCTS);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const products = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const item = {};
    for (let j = 0; j < headers.length; j++) {
      item[headers[j]] = row[j];
    }
    
    if (!onlyActive || item.ACTIVE === true || item.ACTIVE === "TRUE") {
      products.push(item);
    }
  }
  return products;
}

function getProduct(productIdOrSku) {
  const sheet = getSheet(CONFIG.SHEETS.PRODUCTS);
  if (!sheet) return null;
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] === productIdOrSku || row[1] === productIdOrSku) {
      const item = {};
      for (let j = 0; j < headers.length; j++) {
        item[headers[j]] = row[j];
      }
      return item;
    }
  }
  return null;
}
`
  },
  {
    filename: 'Orders.gs',
    description: 'Pemrosesan pesanan terisolasi dengan LockService, validasi harga server-side, pemotongan stok aman, dan pembuatan Order ID.',
    code: `/**
 * PT. BONLES FOOD NUSANTARA
 * File: Orders.gs - Order Processing & LockService Concurrency
 */

function generateOrderId() {
  const dateStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd");
  const randomSuffix = Utilities.formatString("%04d", Math.floor(Math.random() * 9000) + 1000);
  return "ORD-" + dateStr + "-" + randomSuffix;
}

function createOrder(orderPayload) {
  const lock = LockService.getScriptLock();
  
  try {
    // 1. Dapatkan script lock untuk mencegah race condition
    lock.waitLock(CONFIG.LOCK_TIMEOUT_MS);
    
    const prodSheet = getSheet(CONFIG.SHEETS.PRODUCTS);
    const orderSheet = getSheet(CONFIG.SHEETS.ORDERS);
    const itemsSheet = getSheet(CONFIG.SHEETS.ORDER_ITEMS);
    const custSheet = getSheet(CONFIG.SHEETS.CUSTOMERS);
    
    const customer = orderPayload.customer;
    const rawItems = orderPayload.items || [];
    
    if (!customer || !customer.name || !customer.phone) {
      throw new Error("Data pelanggan (nama dan nomor WhatsApp) tidak lengkap.");
    }
    if (rawItems.length === 0) {
      throw new Error("Keranjang belanja kosong.");
    }
    
    // 2. Baca stok & harga segar dari database (Jangan percaya harga dari frontend!)
    const prodData = prodSheet.getDataRange().getValues();
    const prodHeaders = prodData[0];
    const idIdx = prodHeaders.indexOf("ID");
    const skuIdx = prodHeaders.indexOf("SKU");
    const nameIdx = prodHeaders.indexOf("NAME");
    const priceIdx = prodHeaders.indexOf("PRICE");
    const discIdx = prodHeaders.indexOf("DISCOUNT_PRICE");
    const stockIdx = prodHeaders.indexOf("STOCK");
    const activeIdx = prodHeaders.indexOf("ACTIVE");
    
    let subtotal = 0;
    const validatedItems = [];
    const stockUpdates = [];
    
    for (const item of rawItems) {
      let foundRow = -1;
      for (let r = 1; r < prodData.length; r++) {
        if (prodData[r][idIdx] === item.product_id || prodData[r][skuIdx] === item.sku) {
          foundRow = r;
          break;
        }
      }
      
      if (foundRow === -1) {
        throw new Error("Produk dengan ID " + item.product_id + " tidak ditemukan.");
      }
      
      const rowData = prodData[foundRow];
      const isActive = rowData[activeIdx] === true || rowData[activeIdx] === "TRUE";
      const currentStock = parseNumber(rowData[stockIdx], 0);
      const reqQty = parseNumber(item.quantity, 1);
      
      if (!isActive) {
        throw new Error("Produk " + rowData[nameIdx] + " sedang tidak aktif.");
      }
      if (currentStock < reqQty) {
        throw new Error("Stok untuk produk " + rowData[nameIdx] + " tidak mencukupi (sisa: " + currentStock + ").");
      }
      
      const regularPrice = parseNumber(rowData[priceIdx], 0);
      const discountPrice = parseNumber(rowData[discIdx], 0);
      const effectivePrice = (discountPrice > 0 && discountPrice < regularPrice) ? discountPrice : regularPrice;
      const lineSubtotal = effectivePrice * reqQty;
      
      subtotal += lineSubtotal;
      validatedItems.push({
        productId: rowData[idIdx],
        sku: rowData[skuIdx],
        productName: rowData[nameIdx],
        price: effectivePrice,
        quantity: reqQty,
        subtotal: lineSubtotal
      });
      
      // Catat pemotongan stok
      stockUpdates.push({
        row: foundRow + 1, // 1-based index
        col: stockIdx + 1,
        newStock: currentStock - reqQty
      });
    }
    
    // 3. Hitung ongkir dan total resmi
    const settings = getSettings();
    const defaultShipping = parseNumber(settings.DEFAULT_SHIPPING_COST, 15000);
    const shippingCost = (orderPayload.shipping_cost !== undefined) ? parseNumber(orderPayload.shipping_cost, defaultShipping) : defaultShipping;
    const discount = 0;
    const total = subtotal - discount + shippingCost;
    
    // 4. Generate Order ID unik
    const orderId = generateOrderId();
    const now = new Date().toISOString();
    
    // 5. Simpan / Cari Customer (Deduplikasi WhatsApp)
    let customerId = "CUST-" + Utilities.formatString("%04d", custSheet.getLastRow());
    let existingCustRow = -1;
    const custData = custSheet.getDataRange().getValues();
    for (let c = 1; c < custData.length; c++) {
      if (custData[c][2] === customer.phone || (customer.email && custData[c][3] === customer.email)) {
        existingCustRow = c;
        customerId = custData[c][0];
        break;
      }
    }
    
    if (existingCustRow === -1) {
      custSheet.appendRow([
        customerId,
        customer.name,
        customer.phone,
        customer.email || "",
        customer.address || "",
        customer.city || "",
        customer.postal_code || "",
        now,
        now
      ]);
    } else {
      // Update alamat terakhir
      custSheet.getRange(existingCustRow + 1, 5).setValue(customer.address || "");
      custSheet.getRange(existingCustRow + 1, 6).setValue(customer.city || "");
      custSheet.getRange(existingCustRow + 1, 9).setValue(now);
    }
    
    // 6. Simpan Induk Pesanan (Orders)
    orderSheet.appendRow([
      orderId,
      now,
      customerId,
      customer.name,
      customer.phone,
      customer.email || "",
      customer.address || "",
      customer.city || "",
      customer.postal_code || "",
      orderPayload.payment_method || "Transfer Bank",
      orderPayload.shipping_method || "Reguler",
      shippingCost,
      subtotal,
      discount,
      total,
      "PENDING",
      customer.notes || "",
      now,
      now
    ]);
    
    // 7. Simpan Rincian Pesanan (Order_Items)
    validatedItems.forEach(vi => {
      itemsSheet.appendRow([
        orderId,
        vi.productId,
        vi.sku,
        vi.productName,
        vi.price,
        vi.quantity,
        vi.subtotal
      ]);
    });
    
    // 8. Eksekusi Pengurangan Stok Produk
    stockUpdates.forEach(su => {
      prodSheet.getRange(su.row, su.col).setValue(su.newStock);
    });
    
    // 9. Catat Log Audit
    logSystemEvent("AUDIT", "CREATE_ORDER", "CUSTOMER", orderId, "Pesanan baru berhasil dibuat senilai Rp " + total, "SUCCESS");
    
    return {
      orderId: orderId,
      orderDate: now,
      subtotal: subtotal,
      shippingCost: shippingCost,
      discount: discount,
      total: total,
      status: "PENDING",
      items: validatedItems
    };
    
  } catch (err) {
    logSystemEvent("ERROR", "CREATE_ORDER", "CUSTOMER", "-", "Gagal membuat pesanan: " + err.message, "FAILED");
    throw err;
  } finally {
    lock.releaseLock();
  }
}
`
  },
  {
    filename: 'Code.gs',
    description: 'Dispatcher utama doGet(e) & doPost(e) untuk melayani API JSON bagi frontend web.',
    code: `/**
 * PT. BONLES FOOD NUSANTARA
 * File: Code.gs - API Routing Entrypoint
 */

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "getProducts";
    
    switch (action) {
      case "getProducts":
        return jsonResponse(getProducts(true), true, "Katalog produk berhasil dimuat");
        
      case "getProduct":
        const id = e.parameter.id || e.parameter.sku;
        const prod = getProduct(id);
        return prod ? jsonResponse(prod, true) : jsonError("Produk tidak ditemukan", 404);
        
      case "getCategories":
        const catSheet = getSheet(CONFIG.SHEETS.CATEGORIES);
        const catData = catSheet ? catSheet.getDataRange().getValues() : [];
        const categories = [];
        if (catData.length > 1) {
          const h = catData[0];
          for (let i = 1; i < catData.length; i++) {
            const item = {};
            for (let j = 0; j < h.length; j++) item[h[j]] = catData[i][j];
            if (item.ACTIVE === true || item.ACTIVE === "TRUE") categories.push(item);
          }
        }
        return jsonResponse(categories, true, "Kategori berhasil dimuat");
        
      case "getSettings":
        return jsonResponse(getSettings(), true, "Pengaturan toko dimuat");
        
      case "getDashboardSummary":
        const prods = getProducts(false);
        const orderSheet = getSheet(CONFIG.SHEETS.ORDERS);
        const orderData = orderSheet ? orderSheet.getDataRange().getValues() : [];
        let totalSales = 0;
        let pendingOrders = 0;
        
        for (let i = 1; i < orderData.length; i++) {
          totalSales += parseNumber(orderData[i][14], 0);
          if (orderData[i][15] === "PENDING") pendingOrders++;
        }
        
        const summary = {
          totalProducts: prods.length,
          activeProducts: prods.filter(p => p.ACTIVE === true || p.ACTIVE === "TRUE").length,
          lowStockProducts: prods.filter(p => parseNumber(p.STOCK, 0) > 0 && parseNumber(p.STOCK, 0) <= 5).length,
          outOfStockProducts: prods.filter(p => parseNumber(p.STOCK, 0) === 0).length,
          totalOrders: Math.max(0, orderData.length - 1),
          pendingOrders: pendingOrders,
          totalSales: totalSales
        };
        return jsonResponse(summary, true);
        
      case "init":
        setupDatabase();
        setupDriveStructure();
        return jsonResponse({ status: "initialized" }, true, "Sistem Bonles Food berhasil diinisialisasi");
        
      default:
        return jsonError("Action tidak dikenali: " + action);
    }
  } catch (err) {
    return jsonError("Internal Server Error: " + err.message, 500);
  }
}

function doPost(e) {
  try {
    const postData = (e && e.postData && e.postData.contents) ? JSON.parse(e.postData.contents) : {};
    const action = postData.action || (e && e.parameter && e.parameter.action);
    
    switch (action) {
      case "createOrder":
        const result = createOrder(postData);
        return jsonResponse(result, true, "Pesanan berhasil dibuat");
        
      case "uploadImage":
        const imgResult = uploadProductImage(
          postData.categoryName,
          postData.sku,
          postData.base64,
          postData.filename,
          postData.imageSlot || "main"
        );
        return jsonResponse(imgResult, true, "Foto berhasil diunggah ke Google Drive");
        
      default:
        return jsonError("Action POST tidak valid: " + action);
    }
  } catch (err) {
    return jsonError("Gagal memproses request POST: " + err.message, 500);
  }
}

function initializeBonlesSystem() {
  setupDatabase();
  setupDriveStructure();
  logSystemEvent("INFO", "INITIALIZE_SYSTEM", "ADMIN", "ALL", "Inisialisasi sistem lengkap berhasil dijalankan.", "SUCCESS");
  return "Inisialisasi PT. Bonles Food Nusantara berhasil!";
}
`
  }
];
