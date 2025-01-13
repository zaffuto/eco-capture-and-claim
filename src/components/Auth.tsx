import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthError } from "@supabase/supabase-js";
import { Alert, AlertDescription } from "./ui/alert";

export const Auth = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === "SIGNED_IN") {
        console.log("User signed in successfully");
        navigate("/");
      }
      
      if (event === "SIGNED_OUT") {
        console.log("User signed out");
        setError(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleError = (error: AuthError) => {
    console.error("Auth error:", error);
    setError(error.message);
  };

  return (
    <div className="max-w-md w-full mx-auto space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <SupabaseAuth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#10B981',
                  brandAccent: '#059669',
                },
              },
            },
          }}
          providers={["google"]}
          redirectTo={`${window.location.origin}/auth/callback`}
          onError={handleError}
        />
      </div>
    </div>
  );
};