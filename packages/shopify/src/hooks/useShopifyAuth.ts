import { useAppBridge } from '@shopify/app-bridge-react';
import { Redirect } from '@shopify/app-bridge/actions';
import { getSessionToken } from '@shopify/app-bridge-utils';
import { useEffect, useState } from 'react';

export function useShopifyAuth() {
  const app = useAppBridge();
  const redirect = Redirect.create(app);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSessionToken = async () => {
      try {
        setIsLoading(true);
        const token = await getSessionToken(app);
        setSessionToken(token);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to get session token'));
        // Redirect to auth if session is invalid
        redirect.dispatch(Redirect.Action.APP, '/auth');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionToken();
  }, [app, redirect]);

  return {
    sessionToken,
    isLoading,
    error,
    refresh: () => {
      setIsLoading(true);
      setError(null);
      getSessionToken(app)
        .then(setSessionToken)
        .catch(setError)
        .finally(() => setIsLoading(false));
    },
  };
}
