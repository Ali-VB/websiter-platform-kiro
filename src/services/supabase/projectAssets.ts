import { supabase } from '../../lib/supabase';
import { AdminNotificationService } from './adminNotifications';

export interface ProjectAsset {
    id: string;
    project_id: string;
    client_id: string;
    name: string;
    size: number;
    type: string;
    category: string;
    file_path: string;
    created_at: string;
    updated_at: string;
}

export class SupabaseProjectAssetsService {
    // Upload asset to Supabase Storage and save metadata to database
    static async uploadAsset(
        file: File, 
        category: string, 
        projectId: string, 
        clientId: string
    ): Promise<ProjectAsset> {
        try {
            // Generate unique file name
            const fileExt = file.name.split('.').pop();
            const fileName = `${projectId}/${category}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            
            // Upload file to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('project-assets')
                .upload(fileName, file);

            if (uploadError) {
                throw new Error(`Upload failed: ${uploadError.message}`);
            }

            // Save metadata to database
            const assetData = {
                project_id: projectId,
                client_id: clientId,
                name: file.name,
                size: file.size,
                type: file.type,
                category: category,
                file_path: uploadData.path,
            };

            const { data, error } = await supabase
                .from('project_assets')
                .insert([assetData])
                .select()
                .single();

            if (error) {
                // If database insert fails, clean up the uploaded file
                await supabase.storage
                    .from('project-assets')
                    .remove([fileName]);
                throw new Error(`Database error: ${error.message}`);
            }

            // Notify admins of asset upload (don't await to avoid blocking)
            this.notifyAssetUploaded(data, projectId).catch(error => 
                console.error('Failed to send admin notification:', error)
            );

            return data;
        } catch (error) {
            console.error('Asset upload error:', error);
            throw error;
        }
    }

    // Helper method to notify admins of asset upload
    private static async notifyAssetUploaded(asset: ProjectAsset, projectId: string) {
        try {
            // Get project and client info
            const { data: project } = await supabase
                .from('projects')
                .select(`
                    title,
                    users!projects_client_id_fkey (
                        name,
                        email
                    )
                `)
                .eq('id', projectId)
                .single();

            if (project && project.users) {
                await AdminNotificationService.notifyAssetsUploaded({
                    projectId,
                    clientName: project.users.name || 'Unknown Client',
                    clientEmail: project.users.email || 'Unknown Email',
                    fileCount: 1, // Single file upload
                    projectTitle: project.title
                });
            }
        } catch (error) {
            console.error('Failed to get project info for notification:', error);
        }
    }

    // Get all assets
    static async getAllAssets(): Promise<ProjectAsset[]> {
        const { data, error } = await supabase
            .from('project_assets')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching assets:', error);
            return [];
        }

        return data || [];
    }

    // Get assets for a specific project
    static async getProjectAssets(projectId: string): Promise<ProjectAsset[]> {
        const { data, error } = await supabase
            .from('project_assets')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching project assets:', error);
            return [];
        }

        return data || [];
    }

    // Get assets by category
    static async getCategoryAssets(projectId: string, category: string): Promise<ProjectAsset[]> {
        const { data, error } = await supabase
            .from('project_assets')
            .select('*')
            .eq('project_id', projectId)
            .eq('category', category)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching category assets:', error);
            return [];
        }

        return data || [];
    }

    // Get public URL for an asset
    static getAssetUrl(filePath: string): string {
        const { data } = supabase.storage
            .from('project-assets')
            .getPublicUrl(filePath);

        return data.publicUrl;
    }

    // Delete an asset
    static async deleteAsset(assetId: string): Promise<boolean> {
        try {
            // First get the asset to get the file path
            const { data: asset, error: fetchError } = await supabase
                .from('project_assets')
                .select('file_path')
                .eq('id', assetId)
                .single();

            if (fetchError || !asset) {
                throw new Error('Asset not found');
            }

            // Delete from storage
            const { error: storageError } = await supabase.storage
                .from('project-assets')
                .remove([asset.file_path]);

            if (storageError) {
                console.error('Storage deletion error:', storageError);
            }

            // Delete from database
            const { error: dbError } = await supabase
                .from('project_assets')
                .delete()
                .eq('id', assetId);

            if (dbError) {
                throw new Error(`Database deletion error: ${dbError.message}`);
            }

            return true;
        } catch (error) {
            console.error('Asset deletion error:', error);
            return false;
        }
    }

    // Download asset
    static async downloadAsset(filePath: string): Promise<Blob | null> {
        try {
            const { data, error } = await supabase.storage
                .from('project-assets')
                .download(filePath);

            if (error) {
                console.error('Download error:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Asset download error:', error);
            return null;
        }
    }

    // Admin-only: Delete multiple assets
    static async deleteMultipleAssets(assetIds: string[]): Promise<{ success: number; failed: number }> {
        let success = 0;
        let failed = 0;

        for (const assetId of assetIds) {
            const result = await this.deleteAsset(assetId);
            if (result) {
                success++;
            } else {
                failed++;
            }
        }

        return { success, failed };
    }

    // Admin-only: Delete all assets for a project
    static async deleteProjectAssets(projectId: string): Promise<boolean> {
        try {
            // Get all assets for the project
            const assets = await this.getProjectAssets(projectId);
            
            if (assets.length === 0) {
                return true;
            }

            // Delete all files from storage
            const filePaths = assets.map(asset => asset.file_path);
            const { error: storageError } = await supabase.storage
                .from('project-assets')
                .remove(filePaths);

            if (storageError) {
                console.error('Storage deletion error:', storageError);
            }

            // Delete all records from database
            const { error: dbError } = await supabase
                .from('project_assets')
                .delete()
                .eq('project_id', projectId);

            if (dbError) {
                throw new Error(`Database deletion error: ${dbError.message}`);
            }

            return true;
        } catch (error) {
            console.error('Project assets deletion error:', error);
            return false;
        }
    }

    // Admin-only: Delete all assets (DANGEROUS - use with caution)
    static async deleteAllAssets(): Promise<{ success: boolean; deletedCount: number; error?: string }> {
        try {
            // Get all assets first
            const allAssets = await this.getAllAssets();
            
            if (allAssets.length === 0) {
                return { success: true, deletedCount: 0 };
            }

            // Delete all files from storage
            const filePaths = allAssets.map(asset => asset.file_path);
            const { error: storageError } = await supabase.storage
                .from('project-assets')
                .remove(filePaths);

            if (storageError) {
                console.error('Storage deletion error:', storageError);
            }

            // Delete all records from database
            const { error: dbError } = await supabase
                .from('project_assets')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

            if (dbError) {
                throw new Error(`Database deletion error: ${dbError.message}`);
            }

            return { success: true, deletedCount: allAssets.length };
        } catch (error) {
            console.error('All assets deletion error:', error);
            return { 
                success: false, 
                deletedCount: 0, 
                error: error instanceof Error ? error.message : 'Unknown error' 
            };
        }
    }

    // Admin-only: Get storage statistics
    static async getStorageStats(): Promise<{
        totalAssets: number;
        totalSize: number;
        byCategory: Record<string, { count: number; size: number }>;
        byProject: Record<string, { count: number; size: number }>;
        oldestAsset: string | null;
        newestAsset: string | null;
    }> {
        try {
            const allAssets = await this.getAllAssets();
            
            const stats = {
                totalAssets: allAssets.length,
                totalSize: allAssets.reduce((sum, asset) => sum + asset.size, 0),
                byCategory: {} as Record<string, { count: number; size: number }>,
                byProject: {} as Record<string, { count: number; size: number }>,
                oldestAsset: null as string | null,
                newestAsset: null as string | null,
            };

            // Calculate category stats
            allAssets.forEach(asset => {
                if (!stats.byCategory[asset.category]) {
                    stats.byCategory[asset.category] = { count: 0, size: 0 };
                }
                stats.byCategory[asset.category].count++;
                stats.byCategory[asset.category].size += asset.size;
            });

            // Calculate project stats
            allAssets.forEach(asset => {
                if (!stats.byProject[asset.project_id]) {
                    stats.byProject[asset.project_id] = { count: 0, size: 0 };
                }
                stats.byProject[asset.project_id].count++;
                stats.byProject[asset.project_id].size += asset.size;
            });

            // Find oldest and newest assets
            if (allAssets.length > 0) {
                const sorted = allAssets.sort((a, b) => 
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );
                stats.oldestAsset = sorted[0].created_at;
                stats.newestAsset = sorted[sorted.length - 1].created_at;
            }

            return stats;
        } catch (error) {
            console.error('Storage stats error:', error);
            return {
                totalAssets: 0,
                totalSize: 0,
                byCategory: {},
                byProject: {},
                oldestAsset: null,
                newestAsset: null,
            };
        }
    }

    // Admin-only: Delete assets older than specified days
    static async deleteOldAssets(daysOld: number): Promise<{ success: boolean; deletedCount: number; error?: string }> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            // Get assets older than cutoff date
            const { data: oldAssets, error } = await supabase
                .from('project_assets')
                .select('*')
                .lt('created_at', cutoffDate.toISOString());

            if (error) {
                throw new Error(`Database query error: ${error.message}`);
            }

            if (!oldAssets || oldAssets.length === 0) {
                return { success: true, deletedCount: 0 };
            }

            // Delete files from storage
            const filePaths = oldAssets.map(asset => asset.file_path);
            const { error: storageError } = await supabase.storage
                .from('project-assets')
                .remove(filePaths);

            if (storageError) {
                console.error('Storage deletion error:', storageError);
            }

            // Delete records from database
            const { error: dbError } = await supabase
                .from('project_assets')
                .delete()
                .lt('created_at', cutoffDate.toISOString());

            if (dbError) {
                throw new Error(`Database deletion error: ${dbError.message}`);
            }

            return { success: true, deletedCount: oldAssets.length };
        } catch (error) {
            console.error('Old assets deletion error:', error);
            return { 
                success: false, 
                deletedCount: 0, 
                error: error instanceof Error ? error.message : 'Unknown error' 
            };
        }
    }
}