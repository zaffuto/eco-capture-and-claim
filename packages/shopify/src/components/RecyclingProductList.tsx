import React from 'react';
import {
  Card,
  ResourceList,
  ResourceItem,
  TextStyle,
  Badge,
  Button,
  Stack,
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
    const statusMap = {
      active: { label: 'Activo', status: 'success' },
      used: { label: 'Usado', status: 'warning' },
      expired: { label: 'Expirado', status: 'critical' },
    };

    return (
      <ResourceItem id={id}>
        <Stack>
          <Stack.Item fill>
            <h3>
              <TextStyle variation="strong">{title}</TextStyle>
            </h3>
            <div>Certificado: {certificateId}</div>
            <div>Fecha de reciclaje: {new Date(recyclingDate).toLocaleDateString()}</div>
          </Stack.Item>
          <Stack.Item>
            <Badge status={statusMap[status].status as any}>
              {statusMap[status].label}
            </Badge>
          </Stack.Item>
          <Stack.Item>
            <Button primary>Ver detalles</Button>
          </Stack.Item>
        </Stack>
      </ResourceItem>
    );
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <Card title="Productos Reciclados">
      <ResourceList
        items={products}
        renderItem={renderItem}
        emptyState={
          <div>
            <p>No hay productos reciclados para mostrar</p>
          </div>
        }
      />
    </Card>
  );
}
