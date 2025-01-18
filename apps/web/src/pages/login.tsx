import { LoginButton } from '@eco/ui';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Iniciar sesión en EcoCupon
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Accede a tu cuenta para gestionar tus cupones ecológicos
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="flex justify-center">
            <LoginButton />
          </div>
        </div>
      </div>
    </div>
  );
}
