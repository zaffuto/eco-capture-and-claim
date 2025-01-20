// Temporarily disabled ImageCapture
import { Card, Text, BlockStack } from '@shopify/polaris';

interface ImageCaptureProps {
  onCapture?: (image: string) => void;
}

export function ImageCapture({ onCapture }: ImageCaptureProps) {
  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingLg">
          Captura de Imagen Deshabilitada
        </Text>
        <Text as="p" variant="bodyMd">
          El sistema de captura de imágenes está temporalmente en mantenimiento.
        </Text>
      </BlockStack>
    </Card>
  );
}