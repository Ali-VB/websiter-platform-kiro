import { supabase } from '../../lib/supabase';
import { UserSyncService } from './userSync';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  recipient_id: string | null; // null for global notifications
  is_global: boolean;
  is_read: boolean;
  created_at: string;
}

export interface NotificationCreateData {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  recipient_id?: string | null;
  is_global?: boolean;
}

export class NotificationService {
  /**
   * Test user fetching using the working method from UserSyncService
   */
  static async testUserFetching(): Promise<{ success: boolean; userCount: number; error?: string }> {
    try {
      console.log('🧪 Testing user fetching...');
      
      // Use the exact same method as StandaloneDatabaseOverview
      const { customUsers } = await UserSyncService.getAdminUserList();
      const clientUsers = customUsers.filter(u => u.role === 'client');
      
      console.log(`✅ User fetching test successful: ${clientUsers.length} client users found`);
      return { 
        success: true, 
        userCount: clientUsers.length 
      };
    } catch (error) {
      console.error('❌ User fetching test failed:', error);
      return { 
        success: false, 
        userCount: 0, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get notifications for current user with pagination
   */
  static async getUserNotifications(page: number = 1, limit: number = 10): Promise<{
    notifications: Notification[];
    totalCount: number;
    hasMore: boolean;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const offset = (page - 1) * limit;

      // Get notifications for user (personal + global)
      const { data, error, count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .or(`recipient_id.eq.${user.id},is_global.eq.true`)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        notifications: data || [],
        totalCount: count || 0,
        hasMore: (count || 0) > offset + limit
      };
    } catch (error) {
      console.error('❌ Failed to get user notifications:', error);
      throw error;
    }
  }

  /**
   * Create global notification (admin only)
   */
  static async createGlobalNotification(notificationData: NotificationCreateData): Promise<Notification> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          ...notificationData,
          recipient_id: null,
          is_global: true,
          is_read: false
        }])
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Global notification created');
      return data;
    } catch (error) {
      console.error('❌ Failed to create global notification:', error);
      throw error;
    }
  }

  /**
   * Create user-specific notification (admin only)
   */
  static async createUserNotification(notificationData: NotificationCreateData): Promise<Notification> {
    try {
      if (!notificationData.recipient_id) {
        throw new Error('recipient_id is required for user-specific notifications');
      }

      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          ...notificationData,
          is_global: false,
          is_read: false
        }])
        .select()
        .single();

      if (error) throw error;
      console.log(`✅ User notification created for ${notificationData.recipient_id}`);
      return data;
    } catch (error) {
      console.error('❌ Failed to create user notification:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      console.log(`✅ Notification ${notificationId} marked as read`);
    } catch (error) {
      console.error('❌ Failed to mark notification as read:', error);
      throw error;
    }
  }

  /**
   * Get all client users for admin notification creation
   */
  static async getClientUsers() {
    try {
      // Use the exact same method as database overview
      const { customUsers } = await UserSyncService.getAdminUserList();
      return customUsers.filter(u => u.role === 'client');
    } catch (error) {
      console.error('❌ Failed to get client users:', error);
      throw error;
    }
  }
}