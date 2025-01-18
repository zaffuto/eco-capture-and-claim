import { useEffect, useState } from 'react';
import { Card, Layout, Page, Text } from '@shopify/polaris';
import { useShopifyAuth } from '../hooks/useShopifyAuth';

interface RecyclingProduct {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function RecyclingProductList() {
  const { sessionToken, isLoading } = useShopifyAuth();
  const [products, setProducts] = useState<RecyclingProduct[]>([]);

  useEffect(() => {
    // TODO: Implement product fetching when we have a valid session
    if (sessionToken) {
      setProducts([]);
    }
  }, [sessionToken]);

  if (isLoading) {
    return (
      <Page>
        <Layout>
          <Layout.Section>
            <Card>
              <Text variant="bodyMd" as="p">
                Loading...
              </Text>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  if (!products.length) {
    return (
      <Page>
        <Layout>
          <Layout.Section>
            <Card>
              <Text variant="bodyMd" as="p">
                No recycling products found.
              </Text>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page>
      <Layout>
        <Layout.Section>
          {products.map((product) => (
            <Card key={product.id}>
              <Text variant="headingMd" as="h2">
                {product.title}
              </Text>
              <Text variant="bodyMd" as="p">
                {product.description}
              </Text>
              <Text variant="bodyMd" as="p">
                Status: {product.status}
              </Text>
            </Card>
          ))}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
