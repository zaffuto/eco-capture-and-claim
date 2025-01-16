import Constants from 'expo-constants';

const ENV = {
  SUPABASE_URL: Constants.expoConfig?.extra?.supabaseUrl || 'https://bvpneuiyavayfthqjlye.supabase.co',
  SUPABASE_ANON_KEY: Constants.expoConfig?.extra?.supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cG5ldWl5YXZheWZ0aHFqbHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4OTQwNzMsImV4cCI6MjA1MDQ3MDA3M30.zrQZc6-l_pWUJJ7TohhPOmo7zPnKOgCCmuyMorI2WI4',
  API_URL: Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api',
};

export default ENV;
