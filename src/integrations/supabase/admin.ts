import { supabase } from './client';
import { AuthError } from '@supabase/supabase-js';

export const checkAdminStatus = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .rpc('is_admin', { user_id: userId });

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return data;
  } catch (error) {
    console.error('Exception checking admin status:', error);
    return false;
  }
};

export const adminSignIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('No user returned from sign in');

    // Verify admin status after successful login
    const isAdmin = await checkAdminStatus(data.user.id);
    if (!isAdmin) {
      await supabase.auth.signOut();
      throw new Error('User is not an admin');
    }

    return data;
  } catch (error) {
    console.error('Admin sign in error:', error);
    throw error;
  }
}; 