import { supabase } from '../lib/supabase';

export async function checkAndCleanupDuplicateProjects() {
  try {
    console.log('🔍 Checking for duplicate projects...');
    
    // Get all projects grouped by request_id
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, request_id, created_at, title')
      .order('request_id, created_at');

    if (error) {
      console.error('Error fetching projects:', error);
      return;
    }

    // Group projects by request_id
    const projectsByRequest = projects.reduce((acc: any, project) => {
      if (!acc[project.request_id]) {
        acc[project.request_id] = [];
      }
      acc[project.request_id].push(project);
      return acc;
    }, {});

    // Find duplicates
    const duplicates = Object.entries(projectsByRequest).filter(
      ([_, projects]) => (projects as any[]).length > 1
    );

    if (duplicates.length === 0) {
      console.log('✅ No duplicate projects found');
      return;
    }

    console.log(`⚠️ Found ${duplicates.length} requests with duplicate projects:`);
    
    for (const [requestId, projectList] of duplicates) {
      const projects = projectList as any[];
      console.log(`Request ${requestId}: ${projects.length} projects`);
      projects.forEach((p: any, index: number) => {
        console.log(`  ${index + 1}. ${p.id} - ${p.title} (${p.created_at})`);
      });

      // Keep the first project (oldest) and delete the rest
      const [keepProject, ...deleteProjects] = projects.sort(
        (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      console.log(`  Keeping: ${keepProject.id} - ${keepProject.title}`);
      
      for (const deleteProject of deleteProjects) {
        console.log(`  Deleting: ${deleteProject.id} - ${deleteProject.title}`);
        
        const { error: deleteError } = await supabase
          .from('projects')
          .delete()
          .eq('id', deleteProject.id);

        if (deleteError) {
          console.error(`  ❌ Failed to delete project ${deleteProject.id}:`, deleteError);
        } else {
          console.log(`  ✅ Deleted project ${deleteProject.id}`);
        }
      }
    }

    console.log('🎉 Duplicate cleanup completed!');
  } catch (error) {
    console.error('❌ Error during duplicate cleanup:', error);
  }
}

export async function addUniqueConstraint() {
  try {
    console.log('🔧 Adding unique constraint to prevent future duplicates...');
    
    // This would need to be run as a database migration
    // For now, we'll just log the SQL that needs to be run
    const sql = `
      ALTER TABLE projects 
      ADD CONSTRAINT unique_project_per_request 
      UNIQUE (request_id);
    `;
    
    console.log('Run this SQL in your Supabase SQL editor:');
    console.log(sql);
  } catch (error) {
    console.error('❌ Error adding unique constraint:', error);
  }
}