import { useState, useEffect, useContext, createContext } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { AuthService, type AuthUser } from '../services/supabase/auth';

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    signUp: (data: { email: string; password: string; name: string }) => Promise<void>;
    signIn: (data: { email: string; password: string }) => Promise<void>;
    adminSignIn: (data: { email: string; password: string }) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updatePassword: (password: string) => Promise<void>;
    updateProfile: (updates: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        const getInitialSession = async () => {
            try {
                const profile = await AuthService.getCurrentUserProfile();
                setUser(profile);
            } catch (error) {
                console.error('Error getting initial session:', error);
            } finally {
                setLoading(false);
            }
        };

        getInitialSession();

        // Listen for auth changes
        const { data: { subscription } } = AuthService.onAuthStateChange(async (authUser: User | null) => {
            console.log('Auth state changed:', authUser ? 'User signed in' : 'User signed out');

            if (authUser) {
                console.log('Auth user details:', {
                    id: authUser.id,
                    email: authUser.email,
                    confirmed: authUser.email_confirmed_at,
                    metadata: authUser.user_metadata
                });

                // Get or create user profile
                let profile = await AuthService.getCurrentUserProfile();
                console.log('Current profile:', profile);

                // Special handling for admin portal
                if (window.location.pathname === '/system-management-portal') {
                    // On admin portal, only allow admin users
                    if (profile?.role !== 'admin') {
                        console.log('Non-admin user on admin portal, signing out');
                        await AuthService.signOut();
                        setUser(null);
                        setLoading(false);
                        return;
                    }
                } else {
                    // On regular site, block admin users
                    if (profile?.role === 'admin') {
                        console.log('Admin user detected on regular site, signing out');
                        await AuthService.signOut();
                        alert('Admin accounts cannot sign in through the regular login. Please use the system management portal.');
                        setUser(null);
                        setLoading(false);
                        return;
                    }
                }

                // If no profile exists and user is confirmed, try to create one
                if (!profile && authUser.email_confirmed_at) {
                    console.log('Creating missing profile for confirmed user');
                    try {
                        const userName = authUser.user_metadata?.name ||
                            authUser.user_metadata?.full_name ||
                            authUser.email?.split('@')[0] ||
                            'User';

                        await AuthService.createUserProfile(authUser, userName);
                        profile = await AuthService.getCurrentUserProfile();
                        console.log('Profile created:', profile);
                    } catch (error) {
                        console.error('Failed to create profile after confirmation:', error);
                    }
                }

                setUser(profile);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signUp = async (data: { email: string; password: string; name: string }) => {
        setLoading(true);
        try {
            await AuthService.signUp(data);
            // User will be set via the auth state change listener
        } catch (error) {
            setLoading(false);
            throw error;
        }
    };

    const signIn = async (data: { email: string; password: string }) => {
        setLoading(true);
        try {
            await AuthService.signIn(data);
            // User will be set via the auth state change listener
        } catch (error) {
            setLoading(false);
            throw error;
        }
    };

    const adminSignIn = async (data: { email: string; password: string }) => {
        setLoading(true);
        try {
            console.log('Attempting admin sign in...');
            const result = await AuthService.adminSignIn(data);
            console.log('Admin sign in successful:', result);

            // Get the admin profile immediately
            const profile = await AuthService.getCurrentUserProfile();
            console.log('Admin profile loaded:', profile);

            if (profile && profile.role === 'admin') {
                setUser(profile);
                setLoading(false);
            } else {
                setLoading(false);
                throw new Error('Admin profile not found or invalid role');
            }
        } catch (error) {
            console.error('Admin sign in error:', error);
            setLoading(false);
            throw error;
        }
    };

    const signInWithGoogle = async () => {
        setLoading(true);
        try {
            await AuthService.signInWithGoogle();
            // User will be set via the auth state change listener
        } catch (error) {
            setLoading(false);
            throw error;
        }
    };

    const signOut = async () => {
        setLoading(true);
        try {
            await AuthService.signOut();
            setUser(null);
        } catch (error) {
            console.error('Sign out error:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (email: string) => {
        await AuthService.resetPassword(email);
    };

    const updatePassword = async (password: string) => {
        await AuthService.updatePassword(password);
    };

    const updateProfile = async (updates: Partial<AuthUser>) => {
        await AuthService.updateUserProfile(updates);
        // Refresh user profile
        const profile = await AuthService.getCurrentUserProfile();
        setUser(profile);
    };

    const value: AuthContextType = {
        user,
        loading,
        signUp,
        signIn,
        adminSignIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}