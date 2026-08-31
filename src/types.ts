export interface Product {
  ID: string;
  SKU: string;
  NAME: string;
  CATEGORY_ID: string;
  CATEGORY_NAME: string;
  CATEGORY_FOLDER_ID: string;
  PRODUCT_FOLDER_ID: string;
  PRICE: number;
  DISCOUNT_PRICE: number;
  WEIGHT: string;
  STOCK: number;
  DESCRIPTION: string;
  COMPOSITION: string;
  NUTRITION: string;
  MAIN_IMAGE_FILE_ID: string;
  MAIN_IMAGE_URL: string;
  GALLERY_1_FILE_ID: string;
  GALLERY_1_URL: string;
  GALLERY_2_FILE_ID: string;
  GALLERY_2_URL: string;
  GALLERY_3_FILE_ID: string;
  GALLERY_3_URL: string;
  FEATURED: boolean;
  ACTIVE: boolean;
  CREATED_AT: string;
  UPDATED_AT: string;
}

export interface Category {
  ID: string;
  NAME: string;
  DESCRIPTION: string;
  IMAGE_FILE_ID: string;
  IMAGE_URL: string;
  ACTIVE: boolean;
  SORT_ORDER: number;
  CREATED_AT: string;
  UPDATED_AT: string;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';

export interface Order {
  ORDER_ID: string;
  ORDER_DATE: string;
  CUSTOMER_ID: string;
  CUSTOMER_NAME: string;
  PHONE: string;
  EMAIL: string;
  ADDRESS: string;
  CITY: string;
  POSTAL_CODE: string;
  PAYMENT_METHOD: string;
  SHIPPING_METHOD: string;
  SHIPPING_COST: number;
  SUBTOTAL: number;
  DISCOUNT: number;
  TOTAL: number;
  STATUS: OrderStatus;
  NOTES: string;
  CREATED_AT: string;
  UPDATED_AT: string;
  ITEMS?: OrderItem[];
}

export interface OrderItem {
  ORDER_ID: string;
  PRODUCT_ID: string;
  SKU: string;
  PRODUCT_NAME: string;
  PRICE: number;
  QUANTITY: number;
  SUBTOTAL: number;
}

export interface Customer {
  CUSTOMER_ID: string;
  NAME: string;
  PHONE: string;
  EMAIL: string;
  ADDRESS: string;
  CITY: string;
  POSTAL_CODE: string;
  CREATED_AT: string;
  UPDATED_AT: string;
  ORDER_COUNT?: number;
  TOTAL_SPENT?: number;
}

export interface Setting {
  SETTING: string;
  VALUE: string;
  DESCRIPTION: string;
  UPDATED_AT: string;
}

export interface Banner {
  ID: string;
  TITLE: string;
  SUBTITLE: string;
  DESCRIPTION: string;
  IMAGE_FILE_ID: string;
  IMAGE_URL: string;
  BUTTON_TEXT: string;
  BUTTON_LINK: string;
  ACTIVE: boolean;
  SORT_ORDER: number;
  CREATED_AT: string;
  UPDATED_AT: string;
}

export interface Testimonial {
  ID: string;
  CUSTOMER_NAME: string;
  MESSAGE: string;
  PHOTO_FILE_ID: string;
  PHOTO_URL: string;
  RATING: number;
  ACTIVE: boolean;
  SORT_ORDER: number;
  CREATED_AT: string;
  UPDATED_AT: string;
}

export interface SystemLog {
  LOG_ID: string;
  TIMESTAMP: string;
  TYPE: 'INFO' | 'WARNING' | 'ERROR' | 'AUDIT' | 'SYNC';
  ACTION: string;
  USER: string;
  REFERENCE_ID: string;
  MESSAGE: string;
  STATUS: 'SUCCESS' | 'FAILED';
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CheckoutFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  shippingMethod: string;
  paymentMethod: string;
  notes: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}
