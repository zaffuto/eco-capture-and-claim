import { Suspense } from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { RecyclingRecord, Certificate } from '@eco/shared';
import { Card, Text, BlockStack, Layout, Page, Thumbnail, Button } from '@shopify/polaris';

async function getData() {
  try {
    const supabase = createServerComponentClient({ cookies });
    
    const { data: records } = await supabase
      .from('recycling_records')
      .select(`
        *,
        certificates (*)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    return records || [];
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}

function Loading() {
  return (
    <Card>
      <BlockStack gap="3">
        <Text as="h2" variant="headingLg">Loading...</Text>
      </BlockStack>
    </Card>
  );
}

const mockProducts = [
  {
    id: 1,
    title: "Eco-Friendly Water Bottle",
    description: "Made from 100% recycled materials, this water bottle helps reduce plastic waste.",
    price: "$24.99",
    image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-2_large.png",
    recycledMaterials: "Recycled Plastic: 500g",
  },
  {
    id: 2,
    title: "Sustainable Backpack",
    description: "Created using recycled polyester from plastic bottles. Durable and eco-conscious.",
    price: "$79.99",
    image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-5_large.png",
    recycledMaterials: "Recycled Polyester: 750g",
  }
];

async function DashboardContent() {
  const records = await getData();

  return (
    <Page title="Eco Products">
      <Layout>
        {mockProducts.map((product) => (
          <Layout.Section oneHalf key={product.id}>
            <Card>
              <BlockStack gap="3">
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <Thumbnail
                    source={product.image}
                    alt={product.title}
                    size="large"
                  />
                </div>
                <BlockStack gap="2">
                  <Text as="h2" variant="headingLg">{product.title}</Text>
                  <Text as="p" variant="bodyMd">{product.description}</Text>
                  <Text as="p" variant="headingMd">{product.price}</Text>
                  <Text as="p" variant="bodySm" color="success">
                    {product.recycledMaterials}
                  </Text>
                  <div style={{ padding: '1rem 0' }}>
                    <Button primary fullWidth>View Details</Button>
                  </div>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        ))}
      </Layout>

      <BlockStack gap="3">
        <div style={{ marginTop: '2rem' }}>
          <Text as="h2" variant="headingLg">Recent Recycling Records</Text>
        </div>
        {records.map((record: RecyclingRecord & { certificates: Certificate[] }) => (
          <Card key={record.id}>
            <BlockStack gap="2">
              <Text as="h3" variant="headingMd">{record.material_type}</Text>
              <Text as="p">{record.weight} kg</Text>
              <Text as="p">Certificates: {record.certificates?.length || 0}</Text>
            </BlockStack>
          </Card>
        ))}
      </BlockStack>
    </Page>
  );
}

export default function DashboardPage() {
  return (
    <div className="p-4">
      <Suspense fallback={<Loading />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
