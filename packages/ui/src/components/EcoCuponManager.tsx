'use client';

import { Card, Text, BlockStack } from '@shopify/polaris';

export const EcoCuponManager = () => {
  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingLg">
          Gestor de Cupones Deshabilitado
        </Text>
        <Text as="p" variant="bodyMd">
          El sistema de gestión de cupones está temporalmente en mantenimiento.
        </Text>
      </BlockStack>
    </Card>
  );
};
