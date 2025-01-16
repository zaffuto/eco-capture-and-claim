interface Config {
  SHOPIFY_API_KEY: string;
  SHOPIFY_API_SECRET: string;
  SHOPIFY_ACCESS_TOKEN: string;
  SHOPIFY_SHOP_NAME: string;
}

export const config: Config = {
  SHOPIFY_API_KEY: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY || '',
  SHOPIFY_API_SECRET: process.env.SHOPIFY_API_SECRET || '',
  SHOPIFY_ACCESS_TOKEN: process.env.SHOPIFY_ACCESS_TOKEN || '',
  SHOPIFY_SHOP_NAME: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_NAME || '',
};
