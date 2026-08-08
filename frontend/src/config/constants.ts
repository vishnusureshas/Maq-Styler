export const APP_NAME = 'ShopCart';
export const PAGE_SIZE = 10;
export const FREE_SHIPPING_THRESHOLD = 100;
export const SHIPPING_FLAT_RATE = 10;

export const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  refunded: { label: 'Refunded', color: 'bg-gray-200 text-gray-700' },
};