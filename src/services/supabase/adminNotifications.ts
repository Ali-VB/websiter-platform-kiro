import { NotificationService } from './notificationService';
import { UserSyncService } from './userSync';

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
      
      await NotificationService.createGlobalNotification({
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
      
      await NotificationService.createGlobalNotification({
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
      
      await NotificationService.createGlobalNotification({
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
      
      await NotificationService.createGlobalNotification({
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
      
      await NotificationService.createGlobalNotification({
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