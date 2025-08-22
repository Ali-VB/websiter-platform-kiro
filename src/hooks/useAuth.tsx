import { useState, useEffect, useContext, createContext } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { AuthService, type AuthUser } from '../services/supabase/auth';
import { supabase } from '../lib/supabase'; // Import supabase

interface AuthContextType {
    // The user may be either our custom AuthUser (from users table) or the
    // raw Supabase User while the profile is being resolved.
    user: AuthUser | User | null;
    loading: boolean;
    signUp: (data: { email: string; password: string; name: string }) => Promise<void>;
    signIn: (data: { email: string; password: string }) => Promise<void>;
    adminSignIn: (data: { email: string; password: string }) => Promise<void>;


    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updatePassword: (oldPassword: string, newPassword: string) => Promise<void>;
    updateProfile: (updates: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    // Accept either our custom AuthUser (from users table) or the raw Supabase User
    // while the profile is being resolved.
    const [user, setUser] = useState<AuthUser | User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        const getInitialSession = async () => {
            try {
                // Directly get the user from Supabase auth
                const { data: { user: authUser } } = await supabase.auth.getUser();
                if (authUser) {
                    // Try to get a richer profile first. Only set the `user` state after
                    // profile resolution to avoid rendering UI based on incomplete user data.
                    const profile = await AuthService.getCurrentUserProfile();
                    if (profile) {
                        setUser(profile);
                    } else {
                        // Fallback to raw auth user while profile creation/confirmation finishes
                        setUser(authUser);
                    }
                }
            } catch (error) {
                console.error('Error getting initial session:', error);
            } finally {
                setLoading(false);
            }
        };

        getInitialSession();

        // Listen for auth changes
        const { data: { subscription } } = AuthService.onAuthStateChange(async (event, session) => {
            const authUser = session?.user || null; // Get authUser from session

            console.log('Auth state changed:', authUser ? 'User signed in' : 'User signed out', 'Event:', event);

            if (!authUser) {
                setUser(null);
                setLoading(false);
                return;
            }

            console.log('Auth user details:', {
                id: authUser.id,
                email: authUser.email,
                confirmed: authUser.email_confirmed_at,
                metadata: authUser.user_metadata
            });

            // Try to fetch/create a full profile first. Only after profile resolution
            // do we set the `user` state to avoid flicker between unauthenticated and
            // authenticated UI (especially for admin routes).
            let profile = await AuthService.getCurrentUserProfile();
            console.log('Current profile:', profile);

            // Special handling for admin portal
            if (window.location.pathname === '/system-management-portal') {
                if (profile?.role !== 'admin') {
                    console.log('Non-admin user on admin portal, signing out');
                    await AuthService.signOut();
                    setUser(null);
                    setLoading(false);
                    return;
                }
            } else {
                if (profile?.role === 'admin') {
                    console.log('Admin user detected on regular site, signing out');
                    await AuthService.signOut();
                    alert('Admin accounts cannot sign in through the regular login. Please use the system management portal.');
                    setUser(null);
                    setLoading(false);
                    return;
                }
            }

            // If profile is missing but auth user is confirmed, try creating a profile
            if (!profile && authUser.email_confirmed_at) {
                console.log('Creating missing profile for confirmed user');
                try {
                    const userName = authUser.user_metadata?.name ||
                        authUser.user_metadata?.full_name ||
                        authUser.email?.split('@')[0] ||
                        'User';

                    await AuthService.createUserProfile(authUser, userName);
                    profile = await AuthService.getCurrentUserProfile(); // Re-fetch after creation
                    console.log('Profile created:', profile);
                } catch (error) {
                    console.error('Failed to create profile after confirmation:', error);
                }
            }

            // Final update of user state with the most complete profile
            if (profile) {
                setUser(profile);
            } else {
                // Fallback to authUser if profile couldn't be obtained
                setUser(authUser);
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
            await AuthService.adminSignIn(data);
            // The onAuthStateChange listener will handle setting the user and profile
            // No need to manually set user here, which can cause race conditions
        } catch (error) {
            console.error('Admin sign in error:', error);
            setLoading(false); // Ensure loading is stopped on error
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

    const updatePassword = async (oldPassword: string, newPassword: string) => {
        await AuthService.updatePassword(oldPassword, newPassword);
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