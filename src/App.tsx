import React, { useState, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import { LandingPage } from './components/LandingPage';
import { OnboardingFlow } from './components/onboarding';
import { ClientDashboard } from './components/dashboard';
import { AdminDashboard } from './components/admin';
import { AdminLogin } from './components/admin/AdminLogin';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useUserSync } from './hooks/useUserSync';
import { ProjectService } from './services/supabase/projects';
import type { OnboardingData } from './components/onboarding';

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  );
}

function AppContent() {
  const [currentView, setCurrentView] = useState<'landing' | 'onboarding' | 'dashboard' | 'admin' | 'admin-login'>('landing');
  // useWebsiteRequests removed - using simple approach
  const { user } = useAuth();

  // Enable automatic user synchronization
  useUserSync();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionRef = useRef<string | null>(null); // Track last submission to prevent duplicates

  // Check if this is an auth callback
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isAuthCallback = urlParams.has('code') || window.location.hash.includes('access_token');

    if (isAuthCallback) {
      // This is an auth callback, let the auth system handle it
      console.log('Auth callback detected');
    }
  }, []);

  const handleStartProject = () => {
    setCurrentView('onboarding');
  };

  const handleOnboardingComplete = async (data: OnboardingData) => {
    // Create a unique submission ID based on user and core data (not timestamp)
    const coreData = {
      userId: user?.id,
      websiteType: data.websitePurpose?.type,
      email: data.contactInfo?.email,
      name: data.contactInfo?.name
    };
    const submissionId = JSON.stringify(coreData);

    // Prevent duplicate submissions
    if (isSubmitting) {
      console.log('⚠️ Submission already in progress, ignoring duplicate call');
      return;
    }

    // Check if we just processed this exact same submission
    if (submissionRef.current === submissionId) {
      console.log('⚠️ Duplicate submission detected (same data), ignoring call');
      return;
    }

    submissionRef.current = submissionId;
    setIsSubmitting(true);

    try {
      console.log('🚀 Starting order submission process...');
      console.log('📋 Order data:', data);
      console.log('👤 Current user:', user);

      if (!user) {
        console.error('❌ No user found during order submission');
        alert('Please sign in to complete your order.');
        return;
      }

      // Create project directly from onboarding data
      console.log('💾 Creating project from onboarding data...');
      const savedProject = await ProjectService.createFromOnboardingData(data, user.id);
      console.log('✅ Project created successfully:', savedProject);

      console.log('🎉 Order submission completed successfully!');
      // The success page will be shown by the onboarding flow
      // No need to change view here
    } catch (error) {
      console.error('❌ Failed to create project:', error);
      console.error('Error details:', error);
      // Show error message to user
      alert('There was an error saving your project. Please try again or contact support.');
      // Reset submission ref on error to allow retry
      submissionRef.current = null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOnboardingCancel = () => {
    setCurrentView('landing');
  };

  // Check URL for dashboard routes
  React.useEffect(() => {
    const path = window.location.pathname;
    if (path === '/system-management-portal') {
      if (user?.role === 'admin') {
        setCurrentView('admin');
      } else {
        // Show admin login for secure URL, regardless of user state
        setCurrentView('admin-login');
      }
    } else if (path === '/dashboard' && user) {
      setCurrentView('dashboard');
    }
  }, [user]);

  const handleAdminLoginSuccess = () => {
    setCurrentView('admin');
  };

  if (currentView === 'admin-login') {
    return <AdminLogin onLoginSuccess={handleAdminLoginSuccess} />;
  }

  if (currentView === 'admin') {
    return <AdminDashboard />;
  }

  if (currentView === 'dashboard') {
    return <ClientDashboard />;
  }

  if (currentView === 'onboarding') {
    return (
      <OnboardingFlow
        onComplete={handleOnboardingComplete}
        onCancel={handleOnboardingCancel}
      />
    );
  }

  return <LandingPage onStartProject={handleStartProject} />;
}

export default App
