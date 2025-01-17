import { Suspense } from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { RecyclingRecord, Certificate } from '@eco/shared';
import { Card, Text, BlockStack } from '@shopify/polaris';

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
      <BlockStack gap="4">
        <Text as="h2" variant="headingLg">Loading...</Text>
      </BlockStack>
    </Card>
  );
}

async function DashboardContent() {
  const records = await getData();

  return (
    <BlockStack gap="4">
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
  );
}

export default function DashboardPage() {
  return (
    <div className="p-4">
      <BlockStack gap="4">
        <Text as="h1" variant="headingXl">Dashboard</Text>
        <Suspense fallback={<Loading />}>
          <DashboardContent />
        </Suspense>
      </BlockStack>
    </div>
  );
}
