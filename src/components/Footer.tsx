import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="bg-gradient-to-r from-black via-gray-900 to-black text-white mt-12 py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <i className="fas fa-map-marked-alt text-green-400 text-2xl"></i>
                        <div>
                            <h3 className="font-bold bg-gradient-to-r from-green-300 to-green-500 bg-clip-text text-transparent">
                                Kyrgyz AgroAI
                            </h3>
                            <p className="text-xs text-green-300">акылдуу айыл чарба платформасы</p>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <Link to="/" className="text-gray-300 hover:text-green-300 transition">Башкы</Link>
                        <Link to="/ai" className="text-gray-300 hover:text-green-300 transition">AI кеңешчи</Link>
                    </div>
                </div>
                <div className="text-center text-xs text-green-300/70 pt-6 mt-6 border-t border-green-800">
                    © 2026 Kyrgyz AgroAI. Бардык укуктар корголгон.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
