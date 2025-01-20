import { useEffect } from 'react';
import { useRouter } from 'next/router';

export function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Temporary disabled auth state change listener
    return () => {};
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Sistema en Mantenimiento</h1>
        <p>La autenticación está temporalmente deshabilitada.</p>
      </div>
    </div>
  );
}
