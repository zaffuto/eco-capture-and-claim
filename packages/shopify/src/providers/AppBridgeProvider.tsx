import React, { useMemo } from 'react';
import { Provider } from '@shopify/app-bridge-react';
import type { ClientApplication } from '@shopify/app-bridge';
import { getSessionToken } from "@shopify/app-bridge-utils";

interface AppBridgeProviderProps {
  children: React.ReactNode;
  host: string;
  apiKey: string;
}

export function AppBridgeProvider({ children, host, apiKey }: AppBridgeProviderProps) {
  const config = useMemo(
    () => ({
      host: host,
      apiKey: apiKey,
      forceRedirect: true,
    }),
    [host, apiKey]
  );

  return <Provider config={config}>{children}</Provider>;
}

// Utility function to get session token
export async function getShopifySessionToken(app: ClientApplication): Promise<string> {
  try {
    const token = await getSessionToken(app);
    return token;
  } catch (error) {
    console.error('Error getting session token:', error);
    throw error;
  }
}
