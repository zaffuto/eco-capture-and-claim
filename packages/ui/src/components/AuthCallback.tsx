import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@eco/database';

export function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await router.push('/dashboard');
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Autenticando...</h1>
        <p>Por favor espere mientras lo redirigimos.</p>
      </div>
    </div>
  );
}
