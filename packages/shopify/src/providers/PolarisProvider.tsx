import React from 'react';
import { AppProvider } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import translations from '@shopify/polaris/locales/es.json';

interface PolarisProviderProps {
  children: React.ReactNode;
}

export function PolarisProvider({ children }: PolarisProviderProps) {
  return (
    <AppProvider i18n={translations}>
      {children}
    </AppProvider>
  );
}
