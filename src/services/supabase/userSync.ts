import { supabase } from '../../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';

// Create admin client for user management operations
const getAdminClient = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  
  if (serviceRoleKey && supabaseUrl) {
    return createClient(supabaseUrl, serviceRoleKey);
  }
  return supabase;
};

export interface CustomUser {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'admin';
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export class UserSyncService {
  /**
   * Sync Auth users to custom users table
   * This ensures all Auth users have corresponding records in our users table
   */
  static async syncAuthUsersToCustomTable(): Promise<{ synced: number; errors: string[] }> {
    const adminClient = getAdminClient();
    const errors: string[] = [];
    let synced = 0;

    try {
      // Get all Auth users
      const { data: authData, error: authError } = await adminClient.auth.admin.listUsers();
      if (authError) throw authError;

      const authUsers = authData.users || [];
      console.log(`📊 Found ${authUsers.length} Auth users to sync`);

      // Get existing custom users
      const { data: existingUsers, error: customError } = await supabase
        .from('users')
        .select('id');
      
      if (customError) throw customError;

      const existingUserIds = new Set(existingUsers?.map(u => u.id) || []);

      // Sync missing users
      for (const authUser of authUsers) {
        if (!existingUserIds.has(authUser.id)) {
          try {
            const userData = {
              id: authUser.id,
              email: authUser.email || '',
              name: authUser.user_metadata?.name || 
                    authUser.user_metadata?.full_name || 
                    authUser.email?.split('@')[0] || 
                    'User',
              role: (authUser.user_metadata?.role as 'client' | 'admin') || 'client',
              onboarding_completed: authUser.user_metadata?.onboarding_completed || false,
              created_at: authUser.created_at,
              updated_at: new Date().toISOString()
            };

            const { error: insertError } = await supabase
              .from('users')
              .insert([userData]);

            if (insertError) {
              errors.push(`Failed to sync user ${authUser.email}: ${insertError.message}`);
            } else {
              synced++;
              console.log(`✅ Synced user: ${authUser.email}`);
            }
          } catch (userError) {
            errors.push(`Error processing user ${authUser.email}: ${userError}`);
          }
        }
      }

      console.log(`🎯 Sync complete: ${synced} users synced, ${errors.length} errors`);
      return { synced, errors };

    } catch (error) {
      console.error('❌ User sync failed:', error);
      throw error;
    }
  }

  /**
   * Get all users from custom table (standardized approach)
   */
  static async getAllUsers(): Promise<CustomUser[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Failed to get users from custom table:', error);
      throw error;
    }
  }

  /**
   * Get user by ID from custom table
   */
  static async getUserById(userId: string): Promise<CustomUser | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
      return data;
    } catch (error) {
      console.error(`❌ Failed to get user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Update user in custom table
   */
  static async updateUser(userId: string, updates: Partial<CustomUser>): Promise<CustomUser> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`❌ Failed to update user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Create user in custom table (called during signup)
   */
  static async createCustomUser(authUser: User, additionalData: Partial<CustomUser> = {}): Promise<CustomUser> {
    try {
      const userData = {
        id: authUser.id,
        email: authUser.email || '',
        name: additionalData.name || 
              authUser.user_metadata?.name || 
              authUser.user_metadata?.full_name || 
              authUser.email?.split('@')[0] || 
              'User',
        role: additionalData.role || (authUser.user_metadata?.role as 'client' | 'admin') || 'client',
        onboarding_completed: additionalData.onboarding_completed || false,
        created_at: authUser.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) throw error;
      console.log(`✅ Created custom user record: ${userData.email}`);
      return data;
    } catch (error) {
      console.error('❌ Failed to create custom user:', error);
      throw error;
    }
  }

  /**
   * Admin method: Get users with admin client (for admin operations)
   */
  static async getAdminUserList(): Promise<{ customUsers: CustomUser[]; authUsers: any[] }> {
    const adminClient = getAdminClient();

    try {
      const [customResult, authResult] = await Promise.all([
        supabase.from('users').select('*').order('created_at', { ascending: false }),
        adminClient.auth.admin.listUsers()
      ]);

      if (customResult.error) throw customResult.error;
      if (authResult.error) throw authResult.error;

      return {
        customUsers: customResult.data || [],
        authUsers: authResult.data.users || []
      };
    } catch (error) {
      console.error('❌ Failed to get admin user list:', error);
      throw error;
    }
  }
}