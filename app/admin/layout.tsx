'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isAuthChecking, setIsAuthChecking] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/login');
        } else {
            setIsAuthChecking(false);
        }
    }, [router]);

    if (isAuthChecking) {
        return (
            <div className="min-h-screen bg-[#f4f5fa] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-[#f4f5fa] min-h-screen">
            {/* Mobile Header Bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white shadow-md1 z-30 flex items-center px-4 justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-full active:bg-gray-200 transition-colors"
                        aria-label="Open menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <img src="/assets/logo/main-logo.png" alt="Ani & Ayu" className="h-8 w-auto object-contain" />
                </div>
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                    AA
                </div>
            </div>

            <Sidebar 
                isCollapsed={isCollapsed} 
                setIsCollapsed={setIsCollapsed} 
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
            />
            
            <main className={`p-4 pt-20 lg:pt-8 sm:p-8 transition-all duration-300 w-full ${isCollapsed ? 'lg:pl-24' : 'lg:pl-72'}`}>
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
