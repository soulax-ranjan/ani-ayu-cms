import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
    isMobileOpen?: boolean;
    setIsMobileOpen?: (value: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }: SidebarProps) {
    const pathname = usePathname();

    const navItems = [
        {
            name: 'Categories',
            href: '/admin/categories',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
            )
        },
        {
            name: 'Orders',
            href: '/admin/orders',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                </svg>
            )
        },
        {
            name: 'Products',
            href: '/admin/products',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            )
        },
        {
            name: 'Banners',
            href: '/admin/banners',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
            )
        },
    ];

    return (
        <>
            {/* Backdrop for mobile */}
            {isMobileOpen && (
                <div
                    onClick={() => setIsMobileOpen?.(false)}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 z-50 h-screen transition-all duration-300 ${isMobileOpen ? 'translate-x-0 visible opacity-100' : '-translate-x-full invisible opacity-0 lg:translate-x-0 lg:visible lg:opacity-100'} bg-white border-r border-gray-100 flex flex-col ${isCollapsed ? 'w-20' : 'w-[280px]'} lg:rounded-none ${isMobileOpen ? 'rounded-r-2xl shadow-md4' : ''}`}>
                {/* Logo Section */}
                <div className={`flex items-center px-6 py-6 h-20 lg:h-40 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    {!isCollapsed && (
                        <img src="/assets/logo/main-logo.png" alt="Ani & Ayu" className="h-14 lg:h-28 w-auto object-contain" />
                    )}
                    {isCollapsed && (
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs overflow-hidden">
                            <img src="/assets/logo/main-logo.png" alt="AA" className="h-full w-full object-cover scale-150" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerText = 'AA'; }} />
                        </div>
                    )}
                </div>

                {/* Navigation Links */}
                <div className="flex-1 px-4 overflow-y-auto overflow-x-hidden custom-scrollbar pt-2">
                    <ul className="space-y-1 font-medium">
                        {navItems.map((item) => {
                            const isActive = pathname?.startsWith(item.href);
                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        onClick={() => setIsMobileOpen?.(false)}
                                        className={`flex items-center p-3 rounded-full transition-all group relative ${isCollapsed ? 'justify-center' : 'gap-4'} ${isActive ? 'bg-primary-100 text-primary-800' : 'text-gray-600 hover:bg-surface-variant/50 hover:text-gray-900'}`}
                                        title={isCollapsed ? item.name : ''}
                                    >
                                        <div className={`shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                            {item.icon}
                                        </div>
                                        {!isCollapsed && (
                                            <span className={`font-semibold whitespace-nowrap transition-all duration-300 ${isActive ? 'text-primary-900' : ''}`}>
                                                {item.name}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Desktop Toggle Button (Minimized/Maximize) */}
                <div className="p-4 border-t border-gray-50 hidden lg:block">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`flex items-center p-3 w-full text-gray-500 hover:text-gray-900 hover:bg-surface-variant/50 rounded-full transition-all ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                        title={isCollapsed ? 'Expand Menu' : 'Minimize Menu'}
                    >
                        {!isCollapsed && <span className="font-semibold text-sm">Minimize</span>}
                        <div className="transition-all duration-300">
                            {isCollapsed ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M7 6l6 6-6 6" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 6l6 6-6 6" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M17 6L11 12l6 6" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M11 6L5 12l6 6" />
                                </svg>
                            )}
                        </div>
                    </button>
                </div>
            </aside>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 0px;
                }
                .custom-scrollbar:hover::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
            `}</style>
        </>
    );
}
