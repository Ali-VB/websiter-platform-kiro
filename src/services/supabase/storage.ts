import { supabase } from '../../lib/supabase';

export interface FileUploadResult {
  url: string;
  path: string;
  name: string;
  size: number;
  type: string;
}

export class StorageService {
  // Upload file to Supabase Storage
  static async uploadFile(
    file: File,
    bucket: string = 'ticket-attachments',
    folder: string = 'uploads'
  ): Promise<FileUploadResult> {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}_${randomString}.${fileExtension}`;
      const filePath = `${folder}/${fileName}`;

      console.log('📤 Uploading file:', file.name, 'to', filePath);

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ File upload error:', error);
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      console.log('✅ File uploaded successfully:', urlData.publicUrl);

      return {
        url: urlData.publicUrl,
        path: filePath,
        name: file.name,
        size: file.size,
        type: file.type
      };
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      throw error;
    }
  }

  // Upload multiple files
  static async uploadFiles(
    files: File[],
    bucket: string = 'ticket-attachments',
    folder: string = 'uploads'
  ): Promise<FileUploadResult[]> {
    try {
      const uploadPromises = files.map(file => 
        this.uploadFile(file, bucket, folder)
      );

      const results = await Promise.all(uploadPromises);
      console.log('✅ All files uploaded successfully:', results.length);
      
      return results;
    } catch (error) {
      console.error('❌ Error uploading files:', error);
      throw error;
    }
  }

  // Delete file from storage
  static async deleteFile(
    filePath: string,
    bucket: string = 'ticket-attachments'
  ): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        console.error('❌ File deletion error:', error);
        throw error;
      }

      console.log('✅ File deleted successfully:', filePath);
    } catch (error) {
      console.error('❌ Error deleting file:', error);
      throw error;
    }
  }

  // Get file download URL
  static async getDownloadUrl(
    filePath: string,
    bucket: string = 'ticket-attachments'
  ): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) {
        console.error('❌ Error getting download URL:', error);
        throw error;
      }

      return data.signedUrl;
    } catch (error) {
      console.error('❌ Error getting download URL:', error);
      throw error;
    }
  }

  // Validate file before upload
  static validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File "${file.name}" is too large. Maximum size is 10MB.`
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File "${file.name}" is not a supported format.`
      };
    }

    return { valid: true };
  }

  // Validate multiple files
  static validateFiles(files: File[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (files.length > 5) {
      errors.push('Maximum 5 files allowed per ticket.');
    }

    files.forEach(file => {
      const validation = this.validateFile(file);
      if (!validation.valid && validation.error) {
        errors.push(validation.error);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
}