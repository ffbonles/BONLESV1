import { Product, Category, Order, Customer, Setting, Banner, Testimonial, SystemLog } from '../types';

export interface GasApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp?: string;
}

export interface SyncStatus {
  connected: boolean;
  lastSyncTime: string | null;
  lastError: string | null;
  isSyncing: boolean;
  webAppUrl: string;
  sheetId?: string;
  driveFolderId?: string;
}

class GasSyncService {
  private defaultDeploymentId = 'AKfycbz1Trz8B-_7yWWEOBTQOGeP6QOGP03RER4RMdxkfSDqr8V2XCO0wxYZ2PhOfyVQFISkvw';
  
  public getWebAppUrl(): string {
    try {
      const storedSettings = localStorage.getItem('bonles_settings_v3');
      if (storedSettings) {
        const settings: Setting[] = JSON.parse(storedSettings);
        const scriptSetting = settings.find(s => s.SETTING === 'APPS_SCRIPT_WEBAPP_URL');
        if (scriptSetting && scriptSetting.VALUE && scriptSetting.VALUE.trim()) {
          const val = scriptSetting.VALUE.trim();
          if (val.startsWith('http')) return val;
          // If only deployment ID is provided
          return `https://script.google.com/macros/s/${val}/exec`;
        }
      }
    } catch (e) {
      console.warn('Error reading APPS_SCRIPT_WEBAPP_URL from settings', e);
    }
    // Fallback to user provided deployment ID
    return `https://script.google.com/macros/s/${this.defaultDeploymentId}/exec`;
  }

  public setWebAppUrl(urlOrId: string): void {
    const clean = urlOrId.trim();
    const fullUrl = clean.startsWith('http') ? clean : `https://script.google.com/macros/s/${clean}/exec`;
    try {
      const storedSettings = localStorage.getItem('bonles_settings_v3');
      let settings: Setting[] = storedSettings ? JSON.parse(storedSettings) : [];
      const idx = settings.findIndex(s => s.SETTING === 'APPS_SCRIPT_WEBAPP_URL');
      if (idx >= 0) {
        settings[idx].VALUE = fullUrl;
      } else {
        settings.push({
          SETTING: 'APPS_SCRIPT_WEBAPP_URL',
          VALUE: fullUrl,
          DESCRIPTION: 'URL Web App Google Apps Script hasil deploy',
          UPDATED_AT: new Date().toISOString()
        });
      }
      localStorage.setItem('bonles_settings_v3', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save APPS_SCRIPT_WEBAPP_URL', e);
    }
  }

  /**
   * Helper to send POST request to Google Apps Script
   * Uses text/plain payload to bypass CORS preflight issues
   */
  private async postToGas<T>(payload: any): Promise<GasApiResponse<T>> {
    const url = this.getWebAppUrl();
    if (!url) {
      return {
        success: false,
        message: 'URL Google Apps Script Web App belum dikonfigurasi.',
      };
    }

    try {
      // Send as text/plain or standard body to avoid OPTIONS preflight failure in GAS
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const resText = await response.text();
      try {
        const jsonRes = JSON.parse(resText);
        return jsonRes;
      } catch {
        // If response is HTML or plain text (e.g. redirected or authorized)
        return {
          success: true,
          message: 'Data berhasil dikirim ke Google Apps Script.',
          data: resText as any,
        };
      }
    } catch (err: any) {
      console.error('GAS Request Error:', err);
      return {
        success: false,
        message: err.message || 'Gagal terhubung ke Google Apps Script Web App.',
        error: err.toString(),
      };
    }
  }

  /**
   * Helper to send GET request to Google Apps Script
   */
  private async getFromGas<T>(action: string, params: Record<string, string> = {}): Promise<GasApiResponse<T>> {
    const baseUrl = this.getWebAppUrl();
    if (!baseUrl) {
      return {
        success: false,
        message: 'URL Google Apps Script Web App belum dikonfigurasi.',
      };
    }

    const queryParams = new URLSearchParams({ action, ...params }).toString();
    const fullUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${queryParams}`;

    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const resJson = await response.json();
      return resJson;
    } catch (err: any) {
      console.error('GAS GET Request Error:', err);
      return {
        success: false,
        message: err.message || 'Gagal mengambil data dari Google Apps Script Web App.',
        error: err.toString(),
      };
    }
  }

  /**
   * Test Connection with Google Apps Script Web App
   */
  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    const url = this.getWebAppUrl();
    if (!url) {
      return {
        success: false,
        message: 'URL Web App kosong. Masukkan Deployment ID atau URL Web App terlebih dahulu.',
      };
    }

    try {
      const res = await this.getFromGas('getDashboardSummary');
      if (res && (res.success || res.data)) {
        return {
          success: true,
          message: 'Koneksi ke Google Apps Script & Spreadsheet BERHASIL aktif dan terhubung!',
          details: res.data || res,
        };
      } else {
        // Try fallback post ping
        const postRes = await this.postToGas({ action: 'ping' });
        if (postRes.success) {
          return {
            success: true,
            message: 'Koneksi ke Google Apps Script Web App BERHASIL (via POST)!',
            details: postRes,
          };
        }
        return {
          success: false,
          message: res.message || 'Google Apps Script merespons tetapi mengembalikan status gagal.',
          details: res,
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: `Gagal menghubungi Google Apps Script: ${err.message}. Pastikan deployment diset 'Who has access: Anyone'.`,
        details: err.toString(),
      };
    }
  }

  /**
   * Initialize Spreadsheet & Google Drive Folders
   */
  async initializeSpreadsheet(): Promise<GasApiResponse> {
    return this.postToGas({ action: 'init' });
  }

  /**
   * Push ALL local data (Products, Categories, Banners, Testimonials, Settings, Orders, Customers)
   * to Google Spreadsheet & Google Drive in one comprehensive batch!
   */
  async pushAllDataToGoogleSheets(data: {
    products: Product[];
    categories: Category[];
    banners: Banner[];
    testimonials: Testimonial[];
    settings: Setting[];
    orders: Order[];
    customers: Customer[];
  }): Promise<GasApiResponse> {
    return this.postToGas({
      action: 'syncAllData',
      payload: data,
    });
  }

  /**
   * Pull ALL data from Google Sheets into local memory
   */
  async pullAllDataFromGoogleSheets(): Promise<GasApiResponse<{
    products: Product[];
    categories: Category[];
    banners: Banner[];
    testimonials: Testimonial[];
    settings: Record<string, string>;
    orders: Order[];
    customers: Customer[];
  }>> {
    return this.getFromGas('syncAll');
  }

  /**
   * Save single Product to Google Sheets & Google Drive
   */
  async syncProduct(product: Product, base64Image?: string): Promise<GasApiResponse> {
    return this.postToGas({
      action: 'saveProduct',
      product: product,
      imageBase64: base64Image,
    });
  }

  /**
   * Save single Category to Google Sheets & Google Drive
   */
  async syncCategory(category: Category): Promise<GasApiResponse> {
    return this.postToGas({
      action: 'saveCategory',
      category: category,
    });
  }

  /**
   * Save single Banner to Google Sheets
   */
  async syncBanner(banner: Banner): Promise<GasApiResponse> {
    return this.postToGas({
      action: 'saveBanner',
      banner: banner,
    });
  }

  /**
   * Save single Testimonial to Google Sheets
   */
  async syncTestimonial(testimonial: Testimonial): Promise<GasApiResponse> {
    return this.postToGas({
      action: 'saveTestimonial',
      testimonial: testimonial,
    });
  }

  /**
   * Save Settings to Google Sheets
   */
  async syncSettings(settings: Setting[]): Promise<GasApiResponse> {
    return this.postToGas({
      action: 'saveSettings',
      settings: settings,
    });
  }

  /**
   * Upload an image to Google Drive
   */
  async uploadImageToDrive(params: {
    categoryName: string;
    sku: string;
    base64: string;
    filename?: string;
    imageSlot?: string;
  }): Promise<GasApiResponse<{ fileId: string; url: string }>> {
    return this.postToGas({
      action: 'uploadImage',
      ...params,
    });
  }

  /**
   * Record new Order to Google Sheets
   */
  async syncOrder(orderPayload: any): Promise<GasApiResponse> {
    return this.postToGas({
      action: 'createOrder',
      ...orderPayload,
    });
  }
}

export const gasSync = new GasSyncService();
