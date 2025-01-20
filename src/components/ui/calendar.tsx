// Temporarily disabled calendar component
import { Card, Text, BlockStack } from '@shopify/polaris';

export function Calendar() {
  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingLg">
          Calendario Deshabilitado
        </Text>
        <Text as="p" variant="bodyMd">
          El calendario está temporalmente en mantenimiento.
        </Text>
      </BlockStack>
    </Card>
  );
}
