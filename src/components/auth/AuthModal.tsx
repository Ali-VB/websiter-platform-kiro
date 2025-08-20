import React, { useState } from 'react';
import { Modal } from '../common';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { PasswordResetForm } from './PasswordResetForm';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialView?: 'login' | 'signup';
    onSuccess?: () => void;
}

type AuthView = 'login' | 'signup' | 'reset';

export const AuthModal: React.FC<AuthModalProps> = ({
    isOpen,
    onClose,
    initialView = 'login',
    onSuccess,
}) => {
    const [currentView, setCurrentView] = useState<AuthView>(initialView);

    const handleSuccess = () => {
        onSuccess?.();
        onClose();
    };

    const switchView = (view: AuthView) => {
        setCurrentView(view);
    };

    const renderCurrentView = () => {
        switch (currentView) {
            case 'login':
                return (
                    <LoginForm
                        onSuccess={handleSuccess}
                        onSwitchToSignUp={() => switchView('signup')}
                        onSwitchToReset={() => switchView('reset')}
                    />
                );
            case 'signup':
                return (
                    <SignUpForm
                        onSuccess={handleSuccess}
                        onSwitchToLogin={() => switchView('login')}
                    />
                );
            case 'reset':
                return (
                    <PasswordResetForm
                        onSuccess={() => switchView('login')}
                        onBack={() => switchView('login')}
                    />
                );
            default:
                return null;
        }
    };

    const getTitle = () => {
        switch (currentView) {
            case 'login':
                return 'Sign In';
            case 'signup':
                return 'Sign Up';
            case 'reset':
                return 'Reset Password';
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{getTitle()}</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div>
                {renderCurrentView()}
            </div>
        </Modal>
    );
};