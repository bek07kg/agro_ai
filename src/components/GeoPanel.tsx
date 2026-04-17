import React from 'react';
import { regionsList as defaultRegionsList } from '../data/regionsData';

interface GeoPanelProps {
    currentRegion: any;
    currentWeather?: any;
    aiAdvice?: string | null;
    isWeatherLoading?: boolean;
    isAIAdviceLoading?: boolean;
    onRegionSelect: (regionId: string) => void;
    regionsList?: { id: string; name: string; icon: string }[];
}

const GeoPanel: React.FC<GeoPanelProps> = ({
    currentRegion,
    currentWeather,
    aiAdvice,
    isWeatherLoading = false,
    isAIAdviceLoading = false,
    onRegionSelect,
    regionsList = defaultRegionsList
}) => {
    return (
        <div className="lg:w-96 bg-gray-800 rounded-2xl shadow p-6 text-gray-200">
            <h3 className="text-xl font-bold text-green-400 mb-4">
                <i className="fas fa-globe mr-2"></i> Геоданиялык маалымат
            </h3>
            {currentRegion ? (
                <>
                    <div className="flex items-center gap-3 py-2 border-b border-gray-700">
                        <i className="fas fa-map-pin text-green-400 w-6"></i><strong>Аймак:</strong> {currentRegion.name}
                    </div>

                    {/* Погода с иконкой и индикатором загрузки */}
                    <div className="flex items-center gap-3 py-2 border-b border-gray-700">
                        <i className="fas fa-temperature-high text-green-400 w-6"></i><strong>Аба ырайы:</strong>
                        {isWeatherLoading ? (
                            <div className="flex items-center gap-2">
                                <i className="fas fa-spinner fa-spin text-green-400"></i> <span className="text-gray-400">Күтө туруңуз...</span>
                            </div>
                        ) : currentWeather ? (
                            <div className="flex items-center gap-2">
                                {currentWeather.icon && <img src={`https:${currentWeather.icon}`} alt="weather icon" className="w-6 h-6" />}
                                <span>{currentWeather.temp}°C, {currentWeather.description}</span>
                            </div>
                        ) : (
                            <span className="text-gray-400">Маалымат жок</span>
                        )}
                    </div>

                    <div className="flex items-center gap-3 py-2 border-b border-gray-700">
                        <i className="fas fa-tint text-green-400 w-6"></i><strong>Нымдуулук:</strong>
                        {isWeatherLoading ? <span className="text-gray-400">...</span> : currentWeather ? `${currentWeather.humidity}%` : '--'}
                    </div>

                    <div className="flex items-center gap-3 py-2 border-b border-gray-700">
                        <i className="fas fa-wind text-green-400 w-6"></i><strong>Шамал:</strong>
                        {isWeatherLoading ? <span className="text-gray-400">...</span> : currentWeather ? `${currentWeather.wind_speed} км/с` : '--'}
                    </div>

                    <div className="flex items-center gap-3 py-2 border-b border-gray-700">
                        <i className="fas fa-mountain text-green-400 w-6"></i><strong>Топурак:</strong> {currentRegion.soil}
                    </div>
                    <div className="flex items-center gap-3 py-2 border-b border-gray-700">
                        <i className="fas fa-apple-alt text-green-400 w-6"></i><strong>Эгиндер:</strong> {currentRegion.crops}
                    </div>

                    {/* AI-совет с индикатором загрузки */}
                    <div className="bg-gray-700 p-3 rounded-xl mt-3 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-green-300">
                            <i className="fas fa-robot text-green-400"></i> 🤖 AI кеңеш:
                        </div>
                        {isAIAdviceLoading ? (
                            <div className="flex items-center gap-2 text-gray-300">
                                <i className="fas fa-spinner fa-spin text-green-400"></i> <span>Кеңеш алынууда...</span>
                            </div>
                        ) : aiAdvice ? (
                            <span className="text-gray-200">{aiAdvice}</span>
                        ) : (
                            <span className="text-gray-400">Кеңеш алына элек</span>
                        )}
                    </div>
                </>
            ) : (
                <p className="text-gray-400">Картадан облусту басыңыз</p>
            )}
            <div className="mt-6">
                <h4 className="font-bold text-green-400 mb-2"><i className="fas fa-list mr-1"></i> Облустар</h4>
                <div className="flex flex-wrap gap-2">
                    {regionsList.map(reg => (
                        <button
                            key={reg.id}
                            onClick={() => onRegionSelect(reg.id)}
                            className="bg-gray-700 hover:bg-green-600 text-gray-200 hover:text-white text-sm px-3 py-1 rounded-full transition"
                        >
                            <i className={`${reg.icon} mr-1`}></i> {reg.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GeoPanel;
