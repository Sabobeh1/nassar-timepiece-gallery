import { supabase } from "@/integrations/supabase/client";
import { AuthError } from "@supabase/supabase-js";

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export class AuthService {
  static async signIn(email: string, password: string): Promise<User> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No user returned from sign in");

      return {
        id: authData.user.id,
        email: authData.user.email!,
        created_at: authData.user.created_at,
      };
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  }

  static async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      if (!user) return null;

      return {
        id: user.id,
        email: user.email!,
        created_at: user.created_at,
      };
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  }
} 