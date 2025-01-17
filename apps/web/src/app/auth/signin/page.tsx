'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, Page, Layout, Button, Text, BlockStack } from '@shopify/polaris';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

export default function SignIn() {
  const supabase = createClientComponentClient();

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="extraLoose">
              <Text as="h1" variant="headingLg">
                Sign in to Eco Capture
              </Text>
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
