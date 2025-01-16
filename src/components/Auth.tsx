import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "./ui/alert";
import { AuthError } from "@supabase/supabase-js";

export const Auth = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === "SIGNED_IN") {
        console.log("User signed in successfully");
        // Get the session to verify authentication
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error("Session error:", sessionError);
          setError(sessionError.message);
          return;
        }
        if (sessionData.session) {
          console.log("Valid session obtained:", sessionData.session.user);
          navigate("/");
        }
      }
      
      if (event === "SIGNED_OUT") {
        console.log("User signed out");
        setError(null);
      }

      if (event === "USER_UPDATED") {
        console.log("User profile updated");
      }

      // Handle authentication errors
      if (event === "INITIAL_SESSION") {
        const currentError = (session as any)?.error;
        if (currentError) {
          console.error("Authentication error:", currentError);
          setError(currentError.message);
        }
      }
    });

    // Test the authentication state on component mount
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Auth check error:", error);
        setError(error.message);
      } else if (session) {
        console.log("User is already authenticated:", session.user);
      }
    };

    checkAuth();

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Get the current hostname to determine the environment
  const isDevelopment = window.location.hostname === 'localhost' || 
                       window.location.hostname.includes('lovableproject.com');
  
  // Set the redirect URL based on the environment
  const redirectUrl = isDevelopment 
    ? `${window.location.origin}/auth/callback`
    : window.location.hostname === 'www.ecocupon.cl' 
      ? 'https://www.ecocupon.cl/auth/callback'
      : 'https://eco-capture-and-claim.vercel.app/auth/callback';

  console.log("Current redirect URL:", redirectUrl);
  console.log("Current hostname:", window.location.hostname);
  console.log("Current environment:", isDevelopment ? "Development" : "Production");

  const handleAuthError = (error: AuthError) => {
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
            style: {
              button: { background: '#10B981', color: 'white' },
              anchor: { color: '#059669' },
            },
          }}
          providers={["google"]}
          redirectTo={redirectUrl}
          view="sign_in"
          showLinks={false}
        />
      </div>
    </div>
  );
};