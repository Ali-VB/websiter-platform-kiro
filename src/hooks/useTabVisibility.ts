import { useState, useEffect } from 'react';

export function useTabVisibility() {
  const [isVisible, setIsVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
      
      if (!document.hidden) {
        console.log('🔄 Tab became visible - refreshing connections');
        // Trigger reconnection logic
        window.dispatchEvent(new CustomEvent('tab-visible'));
      } else {
        console.log('👁️ Tab hidden - pausing operations');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return isVisible;
}