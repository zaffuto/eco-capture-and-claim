'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, Page, Layout, Button, Text, BlockStack, Banner } from '@shopify/polaris';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useSearchParams } from 'next/navigation';

export default function SignIn() {
  const supabase = createClientComponentClient();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="500">
              <Text as="h1" variant="headingLg">
                Sign in to Eco Capture
              </Text>
              {error && (
                <Banner status="critical">
                  <p>{decodeURIComponent(error)}</p>
                </Banner>
              )}
              <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                <Auth
                  supabaseClient={supabase}
                  appearance={{ theme: ThemeSupa }}
                  theme="light"
                  providers={['google']}
                  redirectTo={`${window.location.origin}/auth/callback`}
                />
              </div>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
