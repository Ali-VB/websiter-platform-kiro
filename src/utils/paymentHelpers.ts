import { supabase } from '../lib/supabase';

export const updateProjectStatusBasedOnPayments = async (projectId: string) => {
  try {
    console.log('Updating project status for:', projectId);
    
    // Get all payments for this project
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('payment_type, status')
      .eq('project_id', projectId)
      .eq('status', 'succeeded');

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
      return;
    }

    console.log('Payments found:', payments);

    // Determine new status based on payments
    let newStatus = 'confirmed'; // Default
    
    const hasInitialPayment = payments?.some(p => p.payment_type === 'initial');
    const hasFinalPayment = payments?.some(p => p.payment_type === 'final');

    if (hasFinalPayment) {
      newStatus = 'completed';
    } else if (hasInitialPayment) {
      newStatus = 'in_progress';
    }

    console.log('Updating project status to:', newStatus);

    // Update project status
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    if (updateError) {
      console.error('Error updating project status:', updateError);
      throw updateError;
    }

    console.log('Project status updated successfully to:', newStatus);
    return newStatus;
  } catch (error) {
    console.error('Error in updateProjectStatusBasedOnPayments:', error);
    throw error;
  }
};

export const refreshProjectData = async (projectId: string) => {
  try {
    // Update status based on payments
    await updateProjectStatusBasedOnPayments(projectId);
    
    // Get updated project data
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('Error fetching updated project:', error);
      throw error;
    }

    return project;
  } catch (error) {
    console.error('Error refreshing project data:', error);
    throw error;
  }
};