'use client';

import { AppProvider } from '@shopify/polaris';
import es from '@shopify/polaris/locales/es.json';
import { AuthProvider } from '@eco/shared';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider i18n={es}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </AppProvider>
  );
}
