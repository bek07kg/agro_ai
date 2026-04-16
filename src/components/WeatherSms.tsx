import React, { useEffect } from 'react';

interface Props {
    message: string;
    type?: 'hot' | 'rain' | 'cold' | 'info';
    onClose: () => void;
}

const WeatherSms: React.FC<Props> = ({ message, type = 'info', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 8000);
        return () => clearTimeout(timer);
    }, [onClose]);

    let iconClass = 'fas fa-cloud-sun';
    if (type === 'rain') iconClass = 'fas fa-cloud-rain';
    if (type === 'hot') iconClass = 'fas fa-sun';
    if (type === 'cold') iconClass = 'fas fa-snowflake';

    return (
        <div className="fixed bottom-5 right-5 z-50 animate-slide-up">
            <div className="bg-gray-800 rounded-2xl shadow-lg flex items-center gap-3 p-3 pr-2 border-l-4 border-green-500 min-w-[280px] max-w-sm">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                    <i className={`${iconClass} text-green-400 text-lg`}></i>
                </div>
                <div className="flex-1">
                    <h4 className="text-xs font-bold text-green-400">
                        <i className="fas fa-sms mr-1"></i> Аба ырайы эскертүүсү
                    </h4>
                    <p className="text-xs text-gray-300">{message}</p>
                    <span className="text-[10px] text-gray-500">азыр</span>
                </div>
                <button onClick={onClose} className="text-gray-500 hover:text-red-400 transition">
                    <i className="fas fa-times"></i>
                </button>
            </div>
        </div>
    );
};

export default WeatherSms;
