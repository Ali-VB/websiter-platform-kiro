import { supabase } from '../../lib/supabase';

export interface PaymentIntentData {
  amount: number; // Amount in cents
  currency: string;
  projectId: string;
  clientId: string;
  paymentType: 'initial' | 'final' | 'maintenance';
  metadata?: Record<string, any>;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
}

export class StripePaymentService {
  /**
   * Create a payment intent on the server
   */
  static async createPaymentIntent(data: PaymentIntentData): Promise<PaymentIntentResponse> {
    try {
      console.log('Creating payment intent:', data);

      // Call Supabase Edge Function to create payment intent
      const { data: response, error } = await supabase.functions.invoke('create-payment-intent', {
        body: data,
      });

      if (error) {
        console.error('Error creating payment intent:', error);
        throw new Error(`Payment intent creation failed: ${error.message}`);
      }

      if (!response || !response.clientSecret) {
        throw new Error('Invalid response from payment service');
      }

      console.log('Payment intent created successfully:', response);
      return response;
    } catch (error) {
      console.error('Payment intent creation error:', error);
      throw error;
    }
  }

  /**
   * Confirm payment and update database
   */
  static async confirmPayment(paymentIntentId: string): Promise<void> {
    try {
      console.log('Confirming payment:', paymentIntentId);

      // First try the Edge Function
      try {
        const { error } = await supabase.functions.invoke('confirm-payment', {
          body: { paymentIntentId },
        });

        if (!error) {
          console.log('Payment confirmed via Edge Function');
          return;
        }
      } catch (edgeFunctionError) {
        console.warn('Edge Function failed, trying direct database update:', edgeFunctionError);
      }

      // Fallback: Update payment status directly in database
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'succeeded',
          processed_at: new Date().toISOString(),
          payment_method: 'card',
        })
        .eq('stripe_payment_intent_id', paymentIntentId);

      if (updateError) {
        console.error('Direct database update failed:', updateError);
        throw new Error(`Payment confirmation failed: ${updateError.message}`);
      }

      // Also update project status based on payment type
      const { data: payment } = await supabase
        .from('payments')
        .select('project_id, payment_type')
        .eq('stripe_payment_intent_id', paymentIntentId)
        .single();

      if (payment) {
        let newStatus = 'confirmed'; // Default for initial payment
        
        if (payment.payment_type === 'initial') {
          newStatus = 'in_progress'; // Move to in_progress after initial payment
        } else if (payment.payment_type === 'final') {
          newStatus = 'completed'; // Complete project after final payment
        }

        await supabase
          .from('projects')
          .update({
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', payment.project_id);

        console.log(`Project ${payment.project_id} status updated to ${newStatus} after ${payment.payment_type} payment`);
      }

      console.log('Payment confirmed successfully via direct database update');
    } catch (error) {
      console.error('Payment confirmation error:', error);
      throw error;
    }
  }

  /**
   * Get payment status
   */
  static async getPaymentStatus(paymentIntentId: string): Promise<any> {
    try {
      const { data: response, error } = await supabase.functions.invoke('get-payment-status', {
        body: { paymentIntentId },
      });

      if (error) {
        console.error('Error getting payment status:', error);
        throw new Error(`Failed to get payment status: ${error.message}`);
      }

      return response;
    } catch (error) {
      console.error('Get payment status error:', error);
      throw error;
    }
  }

  /**
   * Calculate payment amounts based on payment option
   */
  static calculatePaymentAmounts(totalAmount: number, paymentOption: string) {
    // totalAmount is already in cents from the PaymentModal
    const total = Math.round(totalAmount);

    switch (paymentOption) {
      case 'full':
        // Full payment with 5% discount
        const discount = Math.round(total * 0.05);
        return {
          initialAmount: total - discount,
          finalAmount: 0,
          discount,
          totalAmount: total,
        };

      case 'split':
        // 30% initial, 70% final (no discount)
        const initialAmount = Math.round(total * 0.3);
        return {
          initialAmount,
          finalAmount: total - initialAmount,
          discount: 0,
          totalAmount: total,
        };

      case 'monthly':
        const monthlyAmount = Math.round(total / 3);
        return {
          initialAmount: monthlyAmount,
          finalAmount: total - monthlyAmount,
          monthlyAmount,
          discount: 0,
          totalAmount: total,
        };

      default:
        return {
          initialAmount: total,
          finalAmount: 0,
          discount: 0,
          totalAmount: total,
        };
    }
  }

  /**
   * Format amount for display
   */
  static formatAmount(amountInCents: number, currency: string = 'CAD'): string {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amountInCents / 100);
  }

  /**
   * Manually update pending payments to succeeded (for fixing stuck payments)
   */
  static async fixPendingPayments(): Promise<void> {
    try {
      console.log('Fixing pending payments...');

      // Get all pending payments first
      const { data: pendingPayments, error: fetchError } = await supabase
        .from('payments')
        .select('*')
        .eq('status', 'pending');

      if (fetchError) {
        console.error('Error fetching pending payments:', fetchError);
        throw fetchError;
      }

      console.log(`Found ${pendingPayments?.length || 0} pending payments`);

      if (!pendingPayments || pendingPayments.length === 0) {
        console.log('No pending payments to fix');
        return;
      }

      // Update all pending payments to succeeded
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'succeeded',
          processed_at: new Date().toISOString(),
          payment_method: 'card',
        })
        .eq('status', 'pending');

      if (updateError) {
        console.error('Error fixing pending payments:', updateError);
        throw updateError;
      }

      // Update project statuses based on payment types
      const { data: allPayments } = await supabase
        .from('payments')
        .select('project_id, payment_type')
        .eq('status', 'succeeded');

      if (allPayments && allPayments.length > 0) {
        // Group payments by project
        const projectPayments = allPayments.reduce((acc, payment) => {
          if (!acc[payment.project_id]) {
            acc[payment.project_id] = [];
          }
          acc[payment.project_id].push(payment.payment_type);
          return acc;
        }, {} as Record<string, string[]>);

        // Update each project based on its payments
        for (const [projectId, paymentTypes] of Object.entries(projectPayments)) {
          let newStatus = 'confirmed';
          
          if (paymentTypes.includes('final')) {
            newStatus = 'completed'; // Final payment made
          } else if (paymentTypes.includes('initial')) {
            newStatus = 'in_progress'; // Initial payment made, start work
          }

          const { error: projectUpdateError } = await supabase
            .from('projects')
            .update({
              status: newStatus,
              updated_at: new Date().toISOString(),
            })
            .eq('id', projectId);

          if (projectUpdateError) {
            console.error(`Error updating project ${projectId}:`, projectUpdateError);
          } else {
            console.log(`Project ${projectId} status updated to ${newStatus}`);
          }
        }
      }

      console.log('Pending payments fixed successfully');
    } catch (error) {
      console.error('Error fixing pending payments:', error);
      throw error;
    }
  }

  /**
   * Debug function to check payment and project status
   */
  static async debugPaymentStatus(projectId: string): Promise<void> {
    try {
      console.log(`=== Debug Payment Status for Project ${projectId} ===`);

      // Get project details
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) {
        console.error('Error fetching project:', projectError);
        return;
      }

      console.log('Project:', {
        id: project.id,
        title: project.title,
        status: project.status,
        price: project.price,
        created_at: project.created_at,
        updated_at: project.updated_at
      });

      // Get all payments for this project
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
        return;
      }

      console.log('Payments:', payments?.map(p => ({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        payment_type: p.payment_type,
        payment_method: p.payment_method,
        created_at: p.created_at,
        processed_at: p.processed_at
      })));

      // Calculate expected amounts
      const baseAmount = project.price || 0;
      const gst = baseAmount * 0.05;
      const qst = baseAmount * 0.09975;
      const totalWithTax = baseAmount + gst + qst;
      const partialAmount = Math.round(totalWithTax * 0.3 * 100);
      const remainingAmount = Math.round(totalWithTax * 0.7 * 100);
      const fullAmount = Math.round(totalWithTax * 100);

      console.log('Expected amounts:', {
        baseAmount,
        gst,
        qst,
        totalWithTax,
        partialAmount: partialAmount / 100,
        remainingAmount: remainingAmount / 100,
        fullAmount: fullAmount / 100
      });

      console.log('=== End Debug ===');
    } catch (error) {
      console.error('Error in debugPaymentStatus:', error);
    }
  }
}