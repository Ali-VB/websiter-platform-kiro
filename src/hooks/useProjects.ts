import { useState, useEffect } from 'react';
import { ProjectService } from '../services/supabase/projects';
import { useAuth } from './useAuth';
import type { Database } from '../types/database';

type ProjectRow = Database['public']['Tables']['projects']['Row'];
// TaskRow type removed - using simple approach without tasks

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await ProjectService.getClientProjects(user.id);
        setProjects(data);
      } catch (err: any) {
        console.error('Error fetching projects:', err);
        setError(err.message || 'Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();

    // Subscribe to real-time updates
    const subscription = ProjectService.subscribeToClientProjects(
      user.id,
      (payload) => {
        console.log('Project update:', payload);
        
        if (payload.eventType === 'INSERT') {
          setProjects(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setProjects(prev => 
            prev.map(project => project.id === payload.new.id ? payload.new : project)
          );
        } else if (payload.eventType === 'DELETE') {
          setProjects(prev => 
            prev.filter(project => project.id !== payload.old.id)
          );
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return {
    projects,
    loading,
    error,
  };
}

// Hook for a specific project
export function useProject(projectId: string | null) {
  const [project, setProject] = useState<ProjectRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setProject(null);
      setLoading(false);
      return;
    }

    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await ProjectService.getProject(projectId);
        setProject(data);
      } catch (err: any) {
        console.error('Error fetching project:', err);
        setError(err.message || 'Failed to fetch project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  return {
    project,
    loading,
    error,
  };
}

// useProjectTasks hook removed - using simple approach without tasks

// Hook for admin to get all projects
export function useAllProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔍 useAllProjects - User check:', { user: user?.email, role: user?.role });
    
    if (!user || user.role !== 'admin') {
      console.log('❌ User is not admin, clearing projects');
      setProjects([]);
      setLoading(false);
      return;
    }

    const fetchAllProjects = async () => {
      try {
        console.log('📊 Fetching all projects for admin dashboard...');
        setLoading(true);
        setError(null);
        
        const data = await ProjectService.getAllProjects();
        console.log('✅ Projects fetched:', data.length, 'projects');
        console.log('📋 Raw projects data:', data);
        setProjects(data);
      } catch (err: any) {
        console.error('❌ Error fetching all projects:', err);
        setError(err.message || 'Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };

    fetchAllProjects();

    // Subscribe to real-time updates
    const subscription = ProjectService.subscribeToAllProjects(
      (payload) => {
        console.log('All projects update:', payload);
        
        if (payload.eventType === 'INSERT') {
          setProjects(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setProjects(prev => 
            prev.map(project => project.id === payload.new.id ? payload.new : project)
          );
        } else if (payload.eventType === 'DELETE') {
          setProjects(prev => 
            prev.filter(project => project.id !== payload.old.id)
          );
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return {
    projects,
    loading,
    error,
  };
}