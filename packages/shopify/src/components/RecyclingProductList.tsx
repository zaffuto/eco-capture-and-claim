import React from 'react';
import {
  Card,
  ResourceList,
  ResourceItem,
  Text,
  Badge,
  Button,
  Box,
  InlineStack,
} from '@shopify/polaris';
import { useShopifyAuth } from '../hooks/useShopifyAuth';

interface RecyclingProduct {
  id: string;
  title: string;
  certificateId: string;
  status: 'active' | 'used' | 'expired';
  recyclingDate: string;
}

export function RecyclingProductList() {
  const { sessionToken, isLoading } = useShopifyAuth();
  const [products, setProducts] = React.useState<RecyclingProduct[]>([]);

  React.useEffect(() => {
    // Aquí irá la lógica para cargar los productos desde la API de Shopify
    if (sessionToken) {
      // Ejemplo de carga de productos
      // fetchProducts(sessionToken).then(setProducts);
    }
  }, [sessionToken]);

  const renderItem = (item: RecyclingProduct) => {
    const { id, title, certificateId, status, recyclingDate } = item;
    const statusMap: Record<RecyclingProduct['status'], { label: string; tone: 'success' | 'warning' | 'critical' }> = {
      active: { label: 'Activo', tone: 'success' },
      used: { label: 'Usado', tone: 'warning' },
      expired: { label: 'Expirado', tone: 'critical' },
    };

    return (
      <ResourceItem id={id} onClick={() => {}}>
        <Box>
          <Box>
            <Text variant="headingMd" as="h3">
              {title}
            </Text>
            <div>Certificado: {certificateId}</div>
            <div>Fecha de reciclaje: {new Date(recyclingDate).toLocaleDateString()}</div>
          </Box>
          <InlineStack align="end">
            <Badge tone={statusMap[status].tone}>
              {statusMap[status].label}
            </Badge>
            <Button variant="primary" onClick={() => {}}>
              Ver detalles
            </Button>
          </InlineStack>
        </Box>
      </ResourceItem>
    );
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <Card>
      <ResourceList
        items={products}
        renderItem={renderItem}
        emptyState={<div>No hay productos de reciclaje</div>}
      />
    </Card>
  );
}
