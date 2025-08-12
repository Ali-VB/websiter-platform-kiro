interface ProjectConfirmationEmailData {
  clientEmail: string;
  clientName: string;
  projectTitle: string;
  projectId: string;
  quoteAmount: number;
  estimatedCompletion: Date;
}

export class EmailService {
  /**
   * Send project confirmation email to client
   * Note: This is a simplified implementation. In production, you'd use a service like:
   * - SendGrid, Mailgun, AWS SES, or similar
   * - Or integrate with your existing email infrastructure
   */
  static async sendProjectConfirmationEmail(data: ProjectConfirmationEmailData) {
    try {
      // For now, we'll log the email content and show a toast
      // In production, replace this with actual email sending
      
      const emailContent = this.generateConfirmationEmailContent(data);
      
      console.log('📧 Sending project confirmation email:', {
        to: data.clientEmail,
        subject: `🎉 Your ${data.projectTitle} has been approved!`,
        content: emailContent
      });

      // TODO: Replace with actual email service integration
      // Example with fetch to your email API:
      /*
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: data.clientEmail,
          subject: `🎉 Your ${data.projectTitle} has been approved!`,
          html: emailContent
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }
      */

      // For now, simulate successful email sending
      return { success: true, messageId: `mock-${Date.now()}` };
      
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      throw error;
    }
  }

  /**
   * Generate HTML email content for project confirmation
   */
  private static generateConfirmationEmailContent(data: ProjectConfirmationEmailData): string {
    const dashboardUrl = `${window.location.origin}/dashboard`;
    const formattedAmount = new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(data.quoteAmount);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Project Approved - Websiter</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 12px; margin-bottom: 20px; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px 0; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Great News!</h1>
            <h2>Your project has been approved!</h2>
          </div>
          
          <div class="content">
            <p>Hi ${data.clientName},</p>
            
            <p>Fantastic news! We've reviewed your project request and we're excited to get started on your <strong>${data.projectTitle}</strong>.</p>
            
            <div class="details">
              <h3>📋 Project Details</h3>
              <ul>
                <li><strong>Project:</strong> ${data.projectTitle}</li>
                <li><strong>Project ID:</strong> #${data.projectId}</li>
                <li><strong>Total Amount:</strong> ${formattedAmount}</li>
                <li><strong>Estimated Completion:</strong> ${data.estimatedCompletion.toLocaleDateString()}</li>
              </ul>
            </div>
            
            <h3>🚀 What happens next?</h3>
            <ol>
              <li><strong>Project Manager Assignment:</strong> You'll be assigned a dedicated project manager within 24 hours</li>
              <li><strong>Initial Payment:</strong> Complete your initial payment to begin development</li>
              <li><strong>Design Phase:</strong> We'll start with wireframes and design concepts</li>
              <li><strong>Regular Updates:</strong> You'll receive weekly progress updates</li>
            </ol>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${dashboardUrl}" class="button">View Your Dashboard</a>
            </div>
            
            <p>You can track your project progress, view updates, and communicate with your project manager through your client dashboard.</p>
            
            <p>If you have any questions, don't hesitate to reach out to us!</p>
            
            <p>Best regards,<br>
            <strong>The Websiter Team</strong></p>
          </div>
          
          <div class="footer">
            <p>This email was sent regarding your project #${data.projectId}</p>
            <p>© ${new Date().getFullYear()} Websiter. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send generic notification email
   */
  static async sendNotificationEmail(
    to: string,
    subject: string,
    _content: string
  ) {
    try {
      console.log('📧 Sending notification email:', { to, subject });
      
      // TODO: Replace with actual email service
      return { success: true, messageId: `mock-${Date.now()}` };
      
    } catch (error) {
      console.error('Error sending notification email:', error);
      throw error;
    }
  }
}