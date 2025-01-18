import { supabase } from '@eco/database';

export function LoginButton() {
  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://ecocupon-2025.vercel.app/auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Error al iniciar sesión:', error.message);
      }
    } catch (error) {
      console.error('Error inesperado:', error);
    }
  };

  return (
    <button
      onClick={handleLogin}
      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
    >
      Iniciar sesión con Google
    </button>
  );
}
