import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database';

type Tables = Database['public']['Tables'];
type ProjectInsert = Tables['projects']['Insert'];
type ProjectRow = Tables['projects']['Row'];
// Task types removed - using simple approach without tasks

export interface CreateProjectData {
  requestId: string;
  clientId: string;
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

// CreateTaskData interface removed - using simple approach without tasks

export class ProjectService {
  // Test database connection and table structure
  static async testDatabaseConnection(projectId: string): Promise<void> {
    try {
      console.log('🔍 Testing database connection for project:', projectId);
      
      // First, try to read the project
      const { data: project, error: readError } = await supabase
        .from('projects')
        .select('id, title, estimated_hours, admin_todos, admin_notes')
        .eq('id', projectId)
        .single();

      if (readError) {
        console.error('❌ Error reading project:', readError);
        throw readError;
      }

      console.log('✅ Project read successfully:', project);
      
      // Try a simple update to test write permissions
      const { error: updateError } = await supabase
        .from('projects')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', projectId);

      if (updateError) {
        console.error('❌ Error updating project:', updateError);
        throw updateError;
      }

      console.log('✅ Database connection test successful');
    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      throw error;
    }
  }

  // Update project time estimation
  static async updateTimeEstimation(
    projectId: string,
    timeData: {
      estimatedHours: number;
      estimatedDays: number;
      hoursNeeded: number;
      targetCompletionDate?: string;
    }
  ): Promise<void> {
    try {
      console.log('⏰ Updating time estimation for project:', projectId);
      
      const { error } = await supabase
        .from('projects')
        .update({
          estimated_hours: timeData.estimatedHours,
          estimated_days: timeData.estimatedDays,
          hours_needed: timeData.hoursNeeded,
          target_completion_date: timeData.targetCompletionDate || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (error) {
        console.error('❌ Error updating time estimation:', error);
        throw error;
      }

      console.log('✅ Time estimation updated successfully');
    } catch (error) {
      console.error('❌ Failed to update time estimation:', error);
      throw error;
    }
  }

  // Update project todo list
  static async updateTodoList(
    projectId: string,
    todoItems: Array<{ id: string; text: string; completed: boolean }>
  ): Promise<void> {
    try {
      console.log('📝 Updating todo list for project:', projectId);
      
      const { error } = await supabase
        .from('projects')
        .update({
          admin_todos: todoItems,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (error) {
        console.error('❌ Error updating todo list:', error);
        throw error;
      }

      console.log('✅ Todo list updated successfully');
    } catch (error) {
      console.error('❌ Failed to update todo list:', error);
      throw error;
    }
  }

  // Update project admin notes
  static async updateAdminNotes(
    projectId: string,
    notes: string
  ): Promise<void> {
    try {
      console.log('📄 Updating admin notes for project:', projectId);
      
      const { error } = await supabase
        .from('projects')
        .update({
          admin_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (error) {
        console.error('❌ Error updating admin notes:', error);
        throw error;
      }

      console.log('✅ Admin notes updated successfully');
    } catch (error) {
      console.error('❌ Failed to update admin notes:', error);
      throw error;
    }
  }
  // Create a new project directly from onboarding data (simple approach)
  static async createFromOnboardingData(
    onboardingData: any,
    clientId: string
  ): Promise<ProjectRow> {
    try {
      console.log('🏗️ Creating project directly from onboarding data...');
      console.log('📋 Onboarding data received:', onboardingData);
      console.log('👤 Client ID:', clientId);

      // Validate required data
      if (!clientId) {
        throw new Error('Client ID is required');
      }

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(clientId)) {
        console.error('❌ Invalid UUID format for client_id:', clientId);
        throw new Error(`Invalid client ID format: ${clientId}`);
      }

      // Extract data from onboarding flow structure
      const contactInfo = onboardingData.contactInfo || {};
      const websitePurpose = onboardingData.websitePurpose || {};
      const websiteType = websitePurpose.type || 'business';
      
      // Generate project title and description
      const websiteTypeLabels: Record<string, string> = {
        'company_portfolio': 'Business Website',
        'personal_resume': 'Personal Portfolio', 
        'ecommerce': 'E-commerce Store',
        'landing_page': 'Landing Page',
        'blog_magazine': 'Blog & Magazine',
        'contact_mini_site': 'Contact Website',
        'business': 'Business Website',
        'portfolio': 'Portfolio Website',
        'blog': 'Blog Website'
      };

      const projectTitle = websiteTypeLabels[websiteType] || 'Website Project';
      const clientName = contactInfo?.name || contactInfo?.company || 'Client';
      const projectDescription = `${projectTitle} for ${clientName} - Created from onboarding flow`;

      // Simple approach: Create project directly without website request
      const projectData = {
        request_id: null, // No website request needed for simple approach
        client_id: clientId,
        title: projectTitle,
        description: projectDescription,
        status: 'new' as const,
        priority: 'medium' as const,
        price: onboardingData.totalPrice || 0,
        website_type: websiteType,
        contact_info: contactInfo,
        website_purpose: websitePurpose,
        additional_features: onboardingData.additionalFeatures || [],
        website_inspiration: onboardingData.websiteInspiration || [],
        design_preferences: onboardingData.designPreferences || {},
        payment_option: onboardingData.paymentOption || 'full',
        onboarding_data: onboardingData // Store the complete onboarding data
      };

      console.log('📋 Project data to create:', projectData);

      const { data: project, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      console.log('✅ Project created successfully:', project);
      return project;
    } catch (error) {
      console.error('❌ Error creating project from onboarding:', error);
      console.error('Error details:', error);
      throw error;
    }
  }

  // Create a new project from a website request
  static async createProject(data: CreateProjectData): Promise<ProjectRow> {
    try {
      // First check if project already exists for this request
      const { data: existingProject } = await supabase
        .from('projects')
        .select('*')
        .eq('request_id', data.requestId)
        .single();

      if (existingProject) {
        console.log('Project already exists for request:', data.requestId);
        return existingProject;
      }

      const projectData: ProjectInsert = {
        request_id: data.requestId,
        client_id: data.clientId,
        title: data.title,
        description: data.description,
        status: 'new',
        priority: data.priority || 'medium',
        due_date: data.dueDate || null,
      };

      const { data: project, error } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (error) {
        // Handle unique constraint violation gracefully
        if (error.code === '23505' && error.message.includes('unique_project_per_request')) {
          console.log('Project already exists (caught by unique constraint), fetching existing project...');
          const { data: existingProject } = await supabase
            .from('projects')
            .select('*')
            .eq('request_id', data.requestId)
            .single();
          
          if (existingProject) {
            return existingProject;
          }
        }
        throw error;
      }

      console.log('Project created successfully:', project);
      return project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  // Get projects for a specific client
  static async getClientProjects(clientId: string): Promise<ProjectRow[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          users!projects_client_id_fkey(id, name, email)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching client projects:', error);
      throw error;
    }
  }

  // Get a specific project with full details
  static async getProject(projectId: string): Promise<ProjectRow | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          users!projects_client_id_fkey(*)
        `)
        .eq('id', projectId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  // Update project status
  static async updateStatus(
    projectId: string,
    status: 'new' | 'in_design' | 'review' | 'final_delivery' | 'completed'
  ): Promise<ProjectRow> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({ status })
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating project status:', error);
      throw error;
    }
  }

  // Get all projects (admin) - SIMPLIFIED
  static async getAllProjects(): Promise<ProjectRow[]> {
    try {
      console.log('🔍 ProjectService.getAllProjects - Querying database...');
      
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          users!projects_client_id_fkey(id, name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Database error in getAllProjects:', error);
        throw error;
      }
      
      console.log('✅ getAllProjects query result:', data?.length || 0, 'projects found');
      console.log('📋 Raw projects data:', data);
      
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching all projects:', error);
      throw error;
    }
  }

  // Subscribe to real-time project updates for client
  static subscribeToClientProjects(
    clientId: string,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel(`client_projects:${clientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `client_id=eq.${clientId}`,
        },
        callback
      )
      .subscribe();
  }

  // Subscribe to all projects (admin)
  static subscribeToAllProjects(callback: (payload: any) => void) {
    return supabase
      .channel('all_projects')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        callback
      )
      .subscribe();
  }
}

// TaskService removed - using simple approach without tasks
// Helper function for admin dashboard
export const updateProjectStatus = async (
  projectId: string, 
  status: 'new' | 'submitted' | 'waiting_for_confirmation' | 'confirmed' | 'in_progress' | 'in_design' | 'review' | 'final_delivery' | 'completed'
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('projects')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating project status:', error);
    throw error;
  }
};

// COMPLETE: Transform database row with ALL onboarding data for admin dashboard
export const transformProjectForAdmin = (row: any): any => {
  return {
    id: row.id,
    requestId: row.request_id || null,
    clientId: row.client_id,
    clientName: row.users?.name || row.contact_info?.name || 'Unknown Client',
    clientEmail: row.users?.email || row.contact_info?.email || 'No email',
    adminId: row.admin_id || '',
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    price: row.price || 0,
    websiteType: row.website_type || 'business',
    contactInfo: row.contact_info || {},
    websitePurpose: row.website_purpose || {},
    features: row.additional_features || [],
    websiteInspiration: row.website_inspiration || [],
    designPreferences: row.design_preferences || {},
    paymentOption: row.payment_option || 'full',
    onboardingData: row.onboarding_data || {},
    // tasks and milestones removed - using simple approach
    payments: [],
    messageCount: 0,
    // taskCount removed - using simple approach
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    dueDate: row.due_date ? new Date(row.due_date) : undefined,
    urgencyLevel: row.priority === 'high' ? 'urgent' : 'normal',
    isQuote: row.status === 'new', // New projects need confirmation
    users: row.users,
    // New project management fields
    estimatedHours: row.estimated_hours || 0,
    estimatedDays: row.estimated_days || 0,
    hoursNeeded: row.hours_needed || 0,
    targetCompletionDate: row.target_completion_date || null,
    adminTodos: row.admin_todos || [],
    adminNotes: row.admin_notes || ''
  };
};