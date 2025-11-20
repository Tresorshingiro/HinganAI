import { supabase } from '@/lib/supabase';

// Test Supabase connection
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase.auth.getSession();
    console.log('Current session:', data, error);
    
    // Test if we can reach the API
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    console.log('Database test:', testData, testError);
    
    return { success: !testError, error: testError };
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return { success: false, error };
  }
};

// Simple auth test
export const testAuth = async (email: string, password: string) => {
  try {
    console.log('Testing direct auth with Supabase...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    console.log('Direct auth result:', { data, error });
    
    return { data, error };
  } catch (error) {
    console.error('Direct auth test failed:', error);
    return { data: null, error };
  }
};