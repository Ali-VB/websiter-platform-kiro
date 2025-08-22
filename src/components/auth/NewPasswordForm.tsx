import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button, Input } from '../common';
import { useAuth } from '../../hooks/useAuth';
import { fadeInUp } from '../../utils/motion';
import { useToast } from '../../hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface NewPasswordFormProps {
    onSuccess?: () => void;
    onBack?: () => void;
}

export const NewPasswordForm: React.FC<NewPasswordFormProps> = ({
    onSuccess,
    onBack,
}) => {
    const { toast } = useToast();
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [tokenValid, setTokenValid] = useState(false);

    useEffect(() => {
        const checkAndSetSession = async () => {
            try {
                // Support tokens either in the URL fragment (hash) or query string
                const hash = window.location.hash || '';
                const hashParams = new URLSearchParams(hash.substring(1));
                const searchParams = new URLSearchParams(window.location.search || '');
                const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
                const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');

                if (accessToken && refreshToken) {
                    // Mark that we're handling a password reset flow so app-level
                    // auto-redirects can be suppressed until this completes.
                    try {
                        sessionStorage.setItem('authFlow', 'reset');
                    } catch (e) { }

                    // Explicitly set session if tokens are found
                    const { error: setSessionError } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    });
                    if (setSessionError) throw setSessionError;

                    // Clean up URL hash after processing
                    try {
                        window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
                    } catch (e) { }
                }

                // Now check if a session is active (either from setSession or auto-detection)
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    setTokenValid(true);
                } else {
                    toast({ title: 'Error', description: 'Invalid or expired password reset link.', variant: 'destructive' });
                    try { sessionStorage.removeItem('authFlow'); } catch (e) { }
                    navigate('/auth');
                }
            } catch (error: any) {
                console.error('Error checking/setting session:', error);
                toast({ title: 'Error', description: `An error occurred while validating the link: ${error.message}`, variant: 'destructive' });
                try { sessionStorage.removeItem('authFlow'); } catch (e) { }
                navigate('/auth');
            }
        };
        checkAndSetSession();
    }, [navigate, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (newPassword !== confirmPassword) {
            toast({ title: 'Error', description: 'New passwords do not match.', variant: 'destructive' });
            setLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            toast({ title: 'Error', description: 'Password must be at least 6 characters.', variant: 'destructive' });
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });

            if (error) throw error;

            toast({ title: 'Success', description: 'Your password has been updated successfully. Please sign in with your new password.', variant: 'success' });
            navigate('/auth');
        } catch (err: any) {
            console.error('Failed to set new password:', err);
            toast({ title: 'Error', description: `Failed to set new password: ${err.message}`, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    if (!tokenValid) {
        return (
            <motion.div
                className="w-full max-w-md mx-auto text-center"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
            >
                <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                    Validating Link...
                </h2>
                <p className="text-secondary-600">Please wait while we verify your reset link.</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="w-full max-w-md mx-auto"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
        >
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-secondary-900 mb-2">
                    Set New Password
                </h2>
                <p className="text-secondary-600">
                    Enter and confirm your new password.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-secondary-700 mb-2">
                        New Password
                    </label>
                    <Input
                        id="new-password"
                        name="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter your new password"
                        required
                        disabled={loading}
                    />
                </div>

                <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-secondary-700 mb-2">
                        Confirm New Password
                    </label>
                    <Input
                        id="confirm-password"
                        name="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your new password"
                        required
                        disabled={loading}
                    />
                </div>

                <Button
                    type="submit"
                    fullWidth
                    loading={loading}
                    className="text-base py-4"
                >
                    Set New Password
                </Button>
            </form>
        </motion.div>
    );
};