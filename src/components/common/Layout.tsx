import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface LayoutProps {
    children: React.ReactNode;
    className?: string;
    showNavbar?: boolean;
    showFooter?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({
    children,
    className = '',
    showNavbar = true,
    showFooter = true,
}) => {
    return (
        <div className={`min-h-screen flex flex-col ${className}`}>
            {showNavbar && <Navbar />}

            <main className={`flex-1 ${showNavbar ? 'pt-16 md:pt-20' : ''}`}>
                {children}
            </main>

            {showFooter && <Footer />}
        </div>
    );
};