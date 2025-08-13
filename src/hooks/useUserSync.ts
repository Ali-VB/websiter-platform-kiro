import { useEffect, useRef } from 'react';
import { UserSyncService } from '../services/supabase/userSync';
import { supabase } from '../lib/supabase';

/**
 * Hook for automatic user synchronization
 * Listens for auth state changes and ensures users are synced
 */
export const useUserSync = () => {
  const syncInProgress = useRef(false);

  useEffect(() => {
    const performSync = async () => {
      if (syncInProgress.current) return;
      
      syncInProgress.current = true;
      try {
        const result = await UserSyncService.syncAuthUsersToCustomTable();
        if (result.synced > 0) {
          console.log(`🔄 Background sync: ${result.synced} users synced`);
        }
      } catch (error) {
        console.error('❌ Background sync failed:', error);
      } finally {
        syncInProgress.current = false;
      }
    };

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // When someone signs in, trigger a sync to ensure they're in our custom table
          console.log('🔄 User signed in, triggering sync...');
          await performSync();
        }
      }
    );

    // Initial sync
    performSync();

    return () => {
      subscription.unsubscribe();
    };
  }, []);
};