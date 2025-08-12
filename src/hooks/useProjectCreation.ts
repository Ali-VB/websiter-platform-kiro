import { useState } from 'react';
import { ProjectService } from '../services/supabase/projects';
import { useAuth } from './useAuth';

export function useProjectCreation() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new project from onboarding data
  const createProject = async (onboardingData: any) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setLoading(true);
      setError(null);
      
      const newProject = await ProjectService.createFromOnboardingData(
        onboardingData,
        user.id
      );
      
      console.log('✅ Project created from onboarding:', newProject);
      return newProject;
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err.message || 'Failed to create project');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createProject,
    loading,
    error,
  };
}