import { NotificationService } from './notificationService';
import { UserSyncService } from './userSync';
import { supabase } from '../../lib/supabase';

/**
 * Service for automatically creating admin notifications for important client actions
 */
export class AdminNotificationService {
  
  /**
   * Get all admin user IDs
   */
  private static async getAdminUserIds(): Promise<string[]> {
    try {
      const { customUsers } = await UserSyncService.getAdminUserList();
      return customUsers.filter(u => u.role === 'admin').map(u => u.id);
    } catch (error) {
      console.error('Failed to get admin users:', error);
      return [];
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

      // Create individual notifications for each admin
      const notifications = adminUserIds.map(adminId => ({
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        recipient_id: adminId,
        is_global: false,
        is_read: false
      }));

      const { data, error } = await supabase
        .from('notifications')
        .insert(notifications)
        .select();

      if (error) {
        if (error.code === '42501') {
          console.log('⚠️ RLS policy blocking notification creation. Please run the SQL fix in Supabase.');
          console.log('📋 SQL needed: CREATE POLICY "Allow creating notifications for admin users" ON notifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND ((recipient_id IS NOT NULL AND EXISTS (SELECT 1 FROM users WHERE users.id = recipient_id AND users.role = \'admin\')) OR (is_global = true AND recipient_id IS NULL)));');
          return; // Skip error to prevent breaking the main functionality
        }
        console.error('❌ Failed to create admin notifications:', error);
        throw error;
      }

      console.log(`✅ Created ${data?.length || 0} admin notifications`);
      return data;
    } catch (error) {
      console.error('❌ Failed to create admin-only notifications:', error);
      throw error;
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