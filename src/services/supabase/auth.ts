import { supabase } from '../../lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'admin';
  onboardingCompleted: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export class AuthService {
  // Sign up with email and password
  static async signUp({ email, password, name }: SignUpData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) throw error;

      // For email confirmation flow, user might not be immediately available
      if (data.user && !data.user.email_confirmed_at) {
        // User needs to confirm email first
        return { user: data.user, session: data.session };
      }

      // Create user profile in our users table (only if user is confirmed)
      if (data.user && data.user.email_confirmed_at) {
        await this.createUserProfile(data.user, name);
      }

      return { user: data.user, session: data.session };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  // Helper method to create user profile
  static async createUserProfile(user: any, name: string) {
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email!,
        name,
        role: 'client',
        onboarding_completed: false,
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      
      // Check if it's a duplicate key error (user already exists)
      if (profileError.code === '23505') {
        console.log('User profile already exists, continuing...');
        return;
      }
      
      throw new Error('Failed to create user profile. Please try again.');
    }
  }

  // Sign in with email and password (CLIENT ONLY)
  static async signIn({ email, password }: SignInData) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // After successful sign in, check if user is admin
      if (data.user && data.user.email_confirmed_at) {
        // Check if this user is an admin
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single();

        // Block admin users from regular sign-in
        if (profile?.role === 'admin') {
          // Sign out the admin user immediately
          await supabase.auth.signOut();
          throw new Error('Admin accounts cannot sign in through the regular login. Please use the system management portal.');
        }

        // For regular users, ensure profile exists
        const fullProfile = await this.getCurrentUserProfile();
        if (!fullProfile) {
          console.log('Creating missing profile for existing user');
          const userName = data.user.user_metadata?.name || 
                         data.user.user_metadata?.full_name || 
                         data.user.email?.split('@')[0] || 
                         'User';
          
          try {
            await this.createUserProfile(data.user, userName);
          } catch (profileError) {
            console.error('Failed to create profile for existing user:', profileError);
          }
        }
      }

      return { user: data.user, session: data.session };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  // Admin sign in (ADMIN ONLY - for secure portal)
  static async adminSignIn({ email, password }: SignInData) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // After successful sign in, verify user is admin
      if (data.user && data.user.email_confirmed_at) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single();

        // Only allow admin users
        if (profile?.role !== 'admin') {
          // Sign out non-admin user immediately
          await supabase.auth.signOut();
          throw new Error('Access denied. Admin credentials required.');
        }
      }

      return { user: data.user, session: data.session };
    } catch (error) {
      console.error('Admin sign in error:', error);
      throw error;
    }
  }

  // Sign in with Google (CLIENT ONLY)
  static async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      
      // Note: We'll check for admin role in the auth state change listener
      // since OAuth redirects don't allow us to check immediately
      
      return data;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }

  // Sign out
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // Reset password
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  // Update password
  static async updatePassword(password: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  }

  // Get current user profile
  static async getCurrentUserProfile(): Promise<AuthUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No authenticated user found');
        return null;
      }

      console.log('Getting profile for user:', user.id, user.email);

      // If user hasn't confirmed email yet, return null
      if (!user.email_confirmed_at) {
        console.log('User email not confirmed yet');
        return null;
      }

      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.log('Profile fetch error:', error);
        
        // If profile doesn't exist, try to create it
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating...');
          try {
            const userName = user.user_metadata?.name || 
                           user.user_metadata?.full_name || 
                           user.email?.split('@')[0] || 
                           'User';
            
            await this.createUserProfile(user, userName);
            
            // Try to fetch again
            const { data: newProfile, error: newError } = await supabase
              .from('users')
              .select('*')
              .eq('id', user.id)
              .single();
            
            if (newError) {
              console.error('Failed to fetch newly created profile:', newError);
              return null;
            }
            
            console.log('Successfully created and fetched profile:', newProfile);
            
            return {
              id: newProfile.id,
              email: newProfile.email,
              name: newProfile.name,
              role: newProfile.role,
              onboardingCompleted: newProfile.onboarding_completed,
            };
          } catch (createError) {
            console.error('Failed to create missing profile:', createError);
            return null;
          }
        }
        return null;
      }

      console.log('Profile found:', profile);

      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        onboardingCompleted: profile.onboarding_completed,
      };
    } catch (error) {
      console.error('Get user profile error:', error);
      return null;
    }
  }

  // Update user profile
  static async updateUserProfile(updates: Partial<AuthUser>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('users')
        .update({
          name: updates.name,
          onboarding_completed: updates.onboardingCompleted,
        })
        .eq('id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Update user profile error:', error);
      throw error;
    }
  }

  // Get current session
  static async getSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });
  }
}