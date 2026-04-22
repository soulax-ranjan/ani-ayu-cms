'use client';

import { useState } from 'react';
import Sidebar from '../../components/Sidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <main className={`flex-1 p-4 pt-20 sm:p-8 sm:pt-8 transition-all duration-300 w-full overflow-hidden ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                <div className="max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
