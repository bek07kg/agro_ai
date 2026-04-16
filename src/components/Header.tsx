import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { path: '/', label: 'Башкы', icon: 'fas fa-home' },
        { path: '/ai', label: 'AI кеңешчи', icon: 'fas fa-robot' }
    ];

    return (
        <header className="bg-gradient-to-r from-black via-gray-900 to-black sticky top-0 z-20 shadow-lg">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center flex-wrap">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow">
                        <i className="fas fa-map-marked-alt text-white text-xl"></i>
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold bg-gradient-to-r from-green-300 to-green-500 bg-clip-text text-transparent">
                            Kyrgyz AgroAI
                        </h1>
                        <span className="text-[10px] text-green-300">аналитикалык платформа</span>
                    </div>
                </div>

                {/* Desktop nav */}
                <nav className="hidden md:flex gap-4">
                    {navItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`px-4 py-2 rounded-full transition font-semibold flex items-center gap-2 ${location.pathname === item.path
                                    ? 'bg-green-500/20 text-green-300'
                                    : 'text-gray-300 hover:bg-white/10 hover:text-green-300'
                                }`}
                        >
                            <i className={item.icon}></i> {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    <div className="bg-green-500 text-black px-3 py-1 rounded-full text-xs font-bold hidden sm:flex items-center gap-1 shadow">
                        <i className="fas fa-microchip"></i> AI 24/7
                    </div>
                    <button className="md:hidden text-green-300 text-xl" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-black/90 backdrop-blur-sm px-4 py-3 flex flex-col gap-2 border-t border-green-800">
                    {navItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`py-2 px-3 rounded-lg transition ${location.pathname === item.path
                                    ? 'bg-green-600 text-white'
                                    : 'text-green-200 hover:bg-green-800/30'
                                }`}
                        >
                            <i className={`${item.icon} mr-2`}></i> {item.label}
                        </Link>
                    ))}
                </div>
            )}
        </header>
    );
};

export default Header;
