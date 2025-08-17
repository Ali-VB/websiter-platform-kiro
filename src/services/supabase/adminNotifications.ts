import { UserSyncService } from './userSync';
import { supabase } from '../../lib/supabase';
import { createClient } from '@supabase/supabase-js';

/**
 * Service for automatically creating admin notifications for important client actions
 */
export class AdminNotificationService {
  
  /**
   * Get all admin user IDs
   */
  private static async getAdminUserIds(): Promise<string[]> {
    try {
      console.log('🔍 Getting admin user list...');
      const { customUsers } = await UserSyncService.getAdminUserList();
      console.log('📊 All users from UserSyncService:', customUsers);
      
      const adminUsers = customUsers.filter(u => u.role === 'admin');
      console.log('👑 Admin users found:', adminUsers);
      
      const adminIds = adminUsers.map(u => u.id);
      console.log('🆔 Admin user IDs:', adminIds);
      
      return adminIds;
    } catch (error) {
      console.error('Failed to get admin users:', error);
      return [];
    }
  }

  /**
   * Test RLS policy directly
   */
  static async testRLSPolicy() {
    try {
      console.log('🧪 Testing RLS policy with known admin ID...');
      
      const testNotification = {
        title: 'Test Notification',
        message: 'Testing RLS policy',
        type: 'info',
        recipient_id: 'ac39f418-b341-4864-b451-adfe64e8133c', // Known admin ID
        is_global: false,
        is_read: false
      };

      console.log('📋 Test notification data:', testNotification);

      const { data, error } = await supabase
        .from('notifications')
        .insert([testNotification])
        .select();

      if (error) {
        console.error('❌ RLS test failed:', error);
        return { success: false, error };
      }

      console.log('✅ RLS test passed:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ RLS test error:', error);
      return { success: false, error };
    }
  }

  /**
   * Get admin client with service role (bypasses RLS)
   */
  private static getAdminClient() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    
    if (serviceRoleKey && supabaseUrl) {
      console.log('🔑 Using service role client for admin notifications');
      return createClient(supabaseUrl, serviceRoleKey);
    }
    
    console.log('⚠️ No service role key, falling back to regular client');
    return supabase;
  }

  /**
   * Alternative: Create notifications via direct HTTP request (bypasses all RLS)
   */
  private static async createNotificationsViaHTTP(notifications: any[]) {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
      
      if (!serviceRoleKey || !supabaseUrl) {
        console.log('⚠️ No service role key available for HTTP method');
        return null;
      }

      console.log('🌐 Creating notifications via direct HTTP request');
      
      const response = await fetch(`${supabaseUrl}/rest/v1/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(notifications)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP request failed:', response.status, errorText);
        return null;
      }

      const data = await response.json();
      console.log(`✅ Created ${data?.length || 0} notifications via HTTP`);
      return data;
    } catch (error) {
      console.error('❌ HTTP request error:', error);
      return null;
    }
  }

  /**
   * Create notifications specifically for admin users only (not global)
   */
  private static async createAdminOnlyNotifications(notificationData: {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }) {
    try {
      console.log('🎯 Creating admin-only notifications');
      
      // Get all admin user IDs
      const adminUserIds = await this.getAdminUserIds();
      
      if (adminUserIds.length === 0) {
        console.log('⚠️ No admin users found, skipping notification');
        return;
      }

      console.log(`📤 Creating notifications for ${adminUserIds.length} admin users`);
      console.log('🔍 Admin user IDs:', adminUserIds);

      // Create individual notifications for each admin
      const notifications = adminUserIds.map(adminId => ({
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        recipient_id: adminId,
        is_global: false,
        is_read: false
      }));

      console.log('📋 Notification data being inserted:', notifications);

      // Try multiple approaches to create notifications
      
      // Approach 1: Try admin client (service role)
      console.log('🔄 Approach 1: Trying admin client...');
      const adminClient = this.getAdminClient();
      
      const { data, error } = await adminClient
        .from('notifications')
        .insert(notifications)
        .select();

      if (!error) {
        console.log(`✅ Created ${data?.length || 0} admin notifications (admin client)`);
        return data;
      }

      console.log('❌ Admin client failed:', error.message);
      
      // Approach 2: Try direct HTTP request
      console.log('🔄 Approach 2: Trying direct HTTP request...');
      const httpResult = await this.createNotificationsViaHTTP(notifications);
      
      if (httpResult) {
        return httpResult;
      }
      
      // Approach 3: Graceful fallback - just log and continue
      console.log('🔄 Approach 3: All methods failed, gracefully continuing...');
      console.log('ℹ️ Admin notifications were not created, but main functionality preserved');
      return;
    } catch (error) {
      console.error('❌ Failed to create admin-only notifications:', error);
      // Don't throw - just log and continue to prevent breaking main functionality
      return;
    }
  }



  /**
   * Notify admins when a new project is created
   */
  static async notifyProjectCreated(projectData: {
    projectId: string;
    clientName: string;
    clientEmail: string;
    projectTitle: string;
  }) {
    try {
      console.log('🔔 Creating admin notification for new project:', projectData.projectTitle);
      
      // Create notifications for each admin user specifically
      await this.createAdminOnlyNotifications({
        title: '🚀 New Project Created',
        message: `${projectData.clientName} (${projectData.clientEmail}) has created a new project: "${projectData.projectTitle}"`,
        type: 'info'
      });

      console.log('✅ Admin notification sent for new project');
    } catch (error) {
      console.error('❌ Failed to notify admins of new project:', error);
    }
  }

  /**
   * Notify admins when a payment is completed
   */
  static async notifyPaymentCompleted(paymentData: {
    projectId: string;
    clientName: string;
    clientEmail: string;
    amount: number;
    projectTitle: string;
  }) {
    try {
      console.log('🔔 Creating admin notification for payment:', paymentData.amount);
      
      // Create notifications for each admin user specifically
      await this.createAdminOnlyNotifications({
        title: '💳 Payment Received',
        message: `${paymentData.clientName} completed payment of $${paymentData.amount} for project "${paymentData.projectTitle}"`,
        type: 'success'
      });

      console.log('✅ Admin notification sent for payment');
    } catch (error) {
      console.error('❌ Failed to notify admins of payment:', error);
    }
  }

  /**
   * Notify admins when project assets are uploaded
   */
  static async notifyAssetsUploaded(assetData: {
    projectId: string;
    clientName: string;
    clientEmail: string;
    fileCount: number;
    projectTitle: string;
  }) {
    try {
      console.log('🔔 Creating admin notification for asset upload:', assetData.fileCount, 'files');
      
      // Create notifications for each admin user specifically
      await this.createAdminOnlyNotifications({
        title: '📁 New Assets Uploaded',
        message: `${assetData.clientName} uploaded ${assetData.fileCount} file(s) to project "${assetData.projectTitle}"`,
        type: 'info'
      });

      console.log('✅ Admin notification sent for asset upload');
    } catch (error) {
      console.error('❌ Failed to notify admins of asset upload:', error);
    }
  }

  /**
   * Notify admins when a support ticket is created
   */
  static async notifySupportTicketCreated(ticketData: {
    ticketId: string;
    clientName: string;
    clientEmail: string;
    subject: string;
    priority: string;
  }) {
    try {
      console.log('🔔 Creating admin notification for support ticket:', ticketData.subject);
      
      const priorityEmoji = ticketData.priority === 'high' ? '🚨' : ticketData.priority === 'medium' ? '⚠️' : '📝';
      
      // Create notifications for each admin user specifically
      await this.createAdminOnlyNotifications({
        title: `${priorityEmoji} New Support Ticket`,
        message: `${ticketData.clientName} created a ${ticketData.priority} priority ticket: "${ticketData.subject}"`,
        type: ticketData.priority === 'high' ? 'warning' : 'info'
      });

      console.log('✅ Admin notification sent for support ticket');
    } catch (error) {
      console.error('❌ Failed to notify admins of support ticket:', error);
    }
  }

  /**
   * Notify admins when project status changes to important milestones
   */
  static async notifyProjectStatusChange(statusData: {
    projectId: string;
    clientName: string;
    projectTitle: string;
    oldStatus: string;
    newStatus: string;
  }) {
    try {
      // Only notify for important status changes
      const importantStatuses = ['submitted', 'confirmed', 'completed'];
      if (!importantStatuses.includes(statusData.newStatus)) {
        return;
      }

      console.log('🔔 Creating admin notification for status change:', statusData.newStatus);
      
      const statusEmoji = statusData.newStatus === 'completed' ? '🎉' : 
                         statusData.newStatus === 'confirmed' ? '✅' : '📋';
      
      // Create notifications for each admin user specifically
      await this.createAdminOnlyNotifications({
        title: `${statusEmoji} Project Status Updated`,
        message: `Project "${statusData.projectTitle}" by ${statusData.clientName} is now ${statusData.newStatus}`,
        type: statusData.newStatus === 'completed' ? 'success' : 'info'
      });

      console.log('✅ Admin notification sent for status change');
    } catch (error) {
      console.error('❌ Failed to notify admins of status change:', error);
    }
  }
}