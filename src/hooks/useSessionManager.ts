
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

const SESSION_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useSessionManager() {
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const manageSession = async () => {
      console.log('Checking session...');
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error refreshing session:', error);
        return;
      }

      if (!data.session) {
        console.log('No active session.');
        // Here you might want to trigger a sign-out
      } else {
        console.log('Session refreshed successfully.');
      }
    };

    const handleTabVisible = () => {
      console.log('Tab is visible, checking session immediately.');
      manageSession();
    };

    // Run on mount
    manageSession();

    // Then run on an interval
    intervalId = setInterval(manageSession, SESSION_REFRESH_INTERVAL);

    // Listen for tab visibility changes, dispatched from useTabVisibility.ts
    window.addEventListener('tab-visible', handleTabVisible);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('tab-visible', handleTabVisible);
    };
  }, []);
}
