import React, { useState, useRef } from 'react';
import { Toaster } from './components/ui/toaster';
import NewLandingPage from './components/NewLandingPage';
import { OnboardingFlow } from './components/onboarding';
import { ClientDashboard } from './components/dashboard';
import AdminPortal from './components/admin/AdminPortal';
import { AuthModal } from './components/auth/AuthModal';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useUserSync } from './hooks/useUserSync';
import { ProjectService } from './services/supabase/projects';
import type { OnboardingData } from './components/onboarding';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useToast } from './hooks/use-toast';
import { NewPasswordForm } from './components/auth/NewPasswordForm';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}

function AppContent() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useUserSync();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionRef = useRef<string | null>(null);

  // Effect to handle automatic redirection after page load if user is signed in
  React.useEffect(() => {
    // If the URL contains Supabase recovery tokens, ensure the user lands on
    // the dedicated reset page so the reset flow runs before any auto-redirect.
    const hash = window.location.hash || '';
    const hashParams = new URLSearchParams(hash.substring(1));
    const searchParams = new URLSearchParams(window.location.search || '');
    const hasRecoveryInHash = hashParams.get('access_token') && hashParams.get('refresh_token');
    const hasRecoveryInQuery = searchParams.get('type') === 'recovery' || searchParams.get('access_token') || searchParams.get('refresh_token');

    if ((hasRecoveryInHash || hasRecoveryInQuery) && window.location.pathname !== '/auth/reset-password') {
      // Keep existing query/hash when navigating so NewPasswordForm can read tokens
      navigate(`/auth/reset-password${window.location.search}${window.location.hash}`, { replace: true });
      return; // Skip rest of this effect for now
    }

    const isResetFlow = (() => {
      try {
        if (sessionStorage.getItem('authFlow') === 'reset') return true;
      } catch (e) { }

      const pathname = window.location.pathname || '';
      // If the user landed on the dedicated reset page, do not auto-redirect
      if (pathname === '/auth/reset-password') return true;

      // Check hash tokens (e.g., access_token in URL fragment)
      const h = window.location.hash || '';
      const hp = new URLSearchParams(h.substring(1));
      if (hp.get('access_token') && hp.get('refresh_token')) return true;

      // Also check query string for Supabase recovery params (type=recovery or tokens)
      const sp = new URLSearchParams(window.location.search || '');
      if (sp.get('type') === 'recovery') return true;
      if (sp.get('access_token') || sp.get('refresh_token')) return true;

      return false;
    })();

    // Also avoid auto-redirect when on any auth-related path
    if (!loading && user && window.location.pathname === '/' && !isResetFlow && !window.location.pathname.startsWith('/auth')) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleStartProject = () => {
    // This function might need to be passed down to ClientDashboard if it's still used
    // For now, it's kept as a placeholder
  };

  const handleOnboardingComplete = async (data: OnboardingData) => {
    const coreData = {
      userId: user?.id,
      websiteType: data.websitePurpose?.type,
      email: data.contactInfo?.email,
      name: data.contactInfo?.name
    };
    const submissionId = JSON.stringify(coreData);

    if (isSubmitting) {
      console.log('⚠️ Submission already in progress, ignoring duplicate call');
      return;
    }

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
        toast({ title: 'Error', description: 'Please sign in to complete your order.', variant: 'destructive' });
        return;
      }

      const savedProject = await ProjectService.createFromOnboardingData(data, user.id);
      console.log('✅ Project created successfully:', savedProject);

      console.log('🎉 Order submission completed successfully!');
    } catch (error: any) {
      console.error('❌ Failed to create project:', error);
      console.error('Error details:', error);
      toast({ title: 'Error', description: 'There was an error saving your project. Please try again or contact support.', variant: 'destructive' });
      submissionRef.current = null;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render loading state if auth is still loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="text-center">
          <p className="text-secondary-600 mt-4">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={
          <NewLandingPage
            onStartProject={handleStartProject}
            onSignInClick={() => setIsAuthModalOpen(true)}
          />
        } />

        {/* Direct route for password reset - no AuthModal needed here */}
        <Route path="/auth/reset-password" element={<NewPasswordForm />} />

        {/* Protected routes for authenticated users */}
        <Route
          path="/dashboard/*" // Use /* to match nested routes if any
          element={user ? <ClientDashboard onStartProject={handleStartProject} /> : <Navigate to="/" />}
        />
        <Route
          path="/onboarding" // Onboarding is also protected
          element={user ? <OnboardingFlow onComplete={handleOnboardingComplete} onCancel={() => { }} /> : <Navigate to="/" />}
        />

        {/* Admin routes: AdminPortal keeps a stable container to avoid UI blinking */}
        <Route path="/system-management-portal/*" element={<AdminPortal />} />
        {/* Removed /admin-login for security: admin login is only available at /system-management-portal */}

        {/* Fallback for unknown routes - redirect to landing or appropriate default */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* AuthModal is now only for initial sign-in/sign-up from landing page */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
        }}
      />
    </>
  );
}

export default App
