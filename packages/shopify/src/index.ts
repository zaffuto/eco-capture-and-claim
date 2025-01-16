export { AppBridgeProvider, getShopifySessionToken } from './providers/AppBridgeProvider';
export { PolarisProvider } from './providers/PolarisProvider';
export { useShopifyAuth } from './hooks/useShopifyAuth';
export { RecyclingProductList } from './components/RecyclingProductList';

// Re-export common types
export type { AppConfig } from '@shopify/app-bridge';

export * from './services/discount.service';
