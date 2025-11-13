import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tipnlvbklvgjtvxmzfor.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpcG5sdmJrbHZnanR2eG16Zm9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NzMyNjksImV4cCI6MjA3ODI0OTI2OX0.CNQeo4zQa23ZLXRVtjO5AD-1oUl9dtcDCy-zUpPdiQw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});