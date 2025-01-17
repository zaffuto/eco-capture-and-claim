import { Suspense } from 'react';
import { EcoCuponManager } from '@eco/ui';
import { Text, BlockStack } from '@shopify/polaris';

function Loading() {
  return (
    <BlockStack gap="4">
      <Text as="h2" variant="headingLg">Loading...</Text>
    </BlockStack>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <BlockStack gap="4">
        <Text as="h1" variant="headingXl">Gestión de Cupones</Text>
        <Suspense fallback={<Loading />}>
          <EcoCuponManager />
        </Suspense>
      </BlockStack>
    </main>
  );
}
