// Simple localStorage-based asset storage for now
// In production, this would use Supabase Storage

export interface ProjectAsset {
    id: string;
    projectId: string;
    name: string;
    size: number;
    type: string;
    category: string;
    uploadedAt: string;
    data: string; // base64 encoded file data
}

const STORAGE_KEY = 'project_assets';

export class ProjectAssetsService {
    static async uploadAsset(file: File, category: string, projectId: string): Promise<ProjectAsset> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = () => {
                const asset: ProjectAsset = {
                    id: Date.now() + Math.random().toString(),
                    projectId,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    category,
                    uploadedAt: new Date().toISOString(),
                    data: reader.result as string
                };

                // Save to localStorage
                const existingAssets = this.getAssets();
                const updatedAssets = [...existingAssets, asset];
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAssets));
                
                resolve(asset);
            };

            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });
    }

    static getAssets(): ProjectAsset[] {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    static getProjectAssets(projectId: string): ProjectAsset[] {
        return this.getAssets().filter(asset => asset.projectId === projectId);
    }

    static deleteAsset(assetId: string): void {
        const assets = this.getAssets();
        const filtered = assets.filter(asset => asset.id !== assetId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }

    static getCategoryAssets(projectId: string, category: string): ProjectAsset[] {
        return this.getProjectAssets(projectId).filter(asset => asset.category === category);
    }
}