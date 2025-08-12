import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 300 : -300,
            opacity: 0,
        }),
    };

    const [direction, setDirection] = useState(0);

    const switchView = (view: AuthView) => {
        const viewOrder: AuthView[] = ['login', 'signup', 'reset'];
        const currentIndex = viewOrder.indexOf(currentView);
        const newIndex = viewOrder.indexOf(view);
        setDirection(newIndex > currentIndex ? 1 : -1);
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

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <div className="relative overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={currentView}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 },
                        }}
                    >
                        {renderCurrentView()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </Modal>
    );
};