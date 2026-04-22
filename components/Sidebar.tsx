import Link from 'next/link';

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
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
            <input type="checkbox" id="sidebar-toggle" className="hidden peer" />

            {/* Mobile Toggle Button (Always visible on mobile) */}
            <label
                htmlFor="sidebar-toggle"
                className="fixed top-4 left-4 z-50 p-2.5 bg-white border border-gray-200 rounded-xl shadow-lg lg:hidden cursor-pointer active:scale-95 transition-all"
            >
                <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </label>

            {/* Backdrop for mobile */}
            <label
                htmlFor="sidebar-toggle"
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden hidden peer-checked:block transition-all duration-300"
            />

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 -translate-x-full lg:translate-x-0 peer-checked:translate-x-0 bg-white border-r border-gray-100 flex flex-col ${isCollapsed ? 'w-20' : 'w-64'}`}>
                {/* Logo Section */}
                <div className={`flex items-center px-6 py-8 border-b border-gray-50 mb-4 h-24 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    {!isCollapsed && (
                        <span className="self-center text-xl font-black text-gray-900 tracking-tighter uppercase whitespace-nowrap">
                            Ani & Ayu
                        </span>
                    )}
                    {isCollapsed && (
                        <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-black text-xs">
                            AA
                        </div>
                    )}
                </div>

                {/* Navigation Links */}
                <div className="flex-1 px-3 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    <ul className="space-y-2 font-medium">
                        {navItems.map((item) => (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center p-3 text-gray-500 rounded-2xl hover:bg-gray-50 hover:text-blue-600 transition-all group relative ${isCollapsed ? 'justify-center' : 'gap-3'}`}
                                    title={isCollapsed ? item.name : ''}
                                >
                                    <div className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${isCollapsed ? '' : ''}`}>
                                        {item.icon}
                                    </div>
                                    {!isCollapsed && (
                                        <span className="font-bold whitespace-nowrap overflow-hidden transition-all duration-300 opacity-100 w-auto">
                                            {item.name}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Desktop Toggle Button (Minimized/Maximize) */}
                <div className="p-4 border-t border-gray-50">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`flex items-center p-3 w-full text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-2xl transition-all ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                        title={isCollapsed ? 'Expand Menu' : 'Minimize Menu'}
                    >
                        {!isCollapsed && <span className="font-bold text-sm uppercase tracking-widest">Minimize</span>}
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
                    background: #e2e8f0;
                    border-radius: 10px;
                }
            `}</style>
        </>
    );
}
