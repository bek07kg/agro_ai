import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { regionsData, regionsList, weatherData } from '../data/regionsData';
import WeatherSms from '../components/WeatherSms';

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
    const [sms, setSms] = useState<{ message: string; type: 'hot' | 'rain' | 'cold' | 'info' } | null>(null);

    const updateGeoPanel = (regionId: string) => {
        const region = regionsData[regionId];
        const weather = weatherData[regionId];
        if (!region || !weather) return;

        setSelectedRegionId(regionId);
        const smsType = weather.temp > 28 ? 'hot' : weather.condition.includes('жаан') ? 'rain' : 'info';
        setSms({ message: weather.sms, type: smsType });
    };

    const handleRegionClick = (regionId: string) => {
        updateGeoPanel(regionId);
        navigate(`/region/${regionId}`);
    };

    const handleGeolocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    let msg = `📍 Сиздин жериңиз: ${lat.toFixed(2)}°, ${lng.toFixed(2)}°\n`;
                    if (lat > 42.5 && lat < 43.2 && lng > 73.5 && lng < 75.5) {
                        msg += "Сиз Чүй облусунда жашайсыз. Бул аймакта жүгөрү жана кант кызылчасы жакшы өсөт.";
                        updateGeoPanel('chuy');
                    } else if (lat > 42.0 && lat < 42.8 && lng > 76.5 && lng < 78.5) {
                        msg += "Сиз Ысык-Көл облусунда жашайсыз. Картошка жана алма өстүрүүгө ыңгайлуу.";
                        updateGeoPanel('issyk');
                    } else if (lat > 40.0 && lat < 41.5 && lng > 72.0 && lng < 73.5) {
                        msg += "Сиз Ош облусунда жашайсыз. Пахта жана күрүч негизги эгиндер.";
                        updateGeoPanel('osh');
                    } else {
                        msg += "Сиз Кыргызстанда жашайсыз. Облусту тандаңыз.";
                    }
                    alert(msg);
                },
                () => alert("Геолокацияга уруксат бериңиз")
            );
        } else {
            alert("Браузер геолокацияны колдобойт");
        }
    };

    const currentRegion = selectedRegionId ? regionsData[selectedRegionId] : null;
    const currentWeather = selectedRegionId ? weatherData[selectedRegionId] : null;

    return (
        <div>
            {/* Hero секция — чёрный градиент, зелёные акценты */}
            <section className="bg-gradient-to-r from-black via-gray-900 to-black text-white py-16 px-4 relative overflow-hidden">
                <div className="container mx-auto flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="flex-1">
                        <div className="inline-block bg-green-500/20 backdrop-blur rounded-full px-4 py-1 text-sm mb-4 text-green-300">
                            <i className="fas fa-map-marked-alt mr-2"></i> Геоданиялык платформа
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                            Кыргызстандын <span className="text-green-400">акылдуу</span><br />айыл чарба картасы
                        </h1>
                        <p className="my-4 text-gray-300"><i className="fas fa-check-circle text-green-400 mr-2"></i> 7 облус | 40+ район | 800+ айыл чарба аймагы</p>
                        <div className="flex gap-4 flex-wrap">
                            <button onClick={() => document.getElementById('mapSection')?.scrollIntoView({ behavior: 'smooth' })} className="bg-green-500 text-black px-6 py-2 rounded-full font-bold hover:bg-green-400 transition shadow">
                                <i className="fas fa-map mr-2"></i> Картаны изилдөө
                            </button>
                            <button onClick={handleGeolocation} className="border-2 border-green-400 text-green-400 px-6 py-2 rounded-full font-bold hover:bg-green-400 hover:text-black transition">
                                <i className="fas fa-location-dot mr-2"></i> Менин жерим
                            </button>
                        </div>
                    </div>
                    <div className="flex-1">
                        <img src="https://images.pexels.com/photos/1437492/kyrgyzstan-mountains-nature-landscape-1437492.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Кыргызстан тоолору" className="rounded-2xl shadow-2xl w-full h-64 object-cover" />
                    </div>
                </div>
            </section>

            {/* Карта + геопанель — тёмная тема */}
            <section id="mapSection" className="py-12 bg-gray-900">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-green-400 mb-8"><i className="fas fa-map mr-2"></i> Кыргызстандын интерактивдүү картасы</h2>
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* SVG Карта — адаптирована под тёмный фон */}
                        <div className="flex-1 bg-gray-800 rounded-2xl shadow p-4">
                            <svg viewBox="0 0 650 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                                <defs>
                                    <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: '#2e7d32' }} />
                                        <stop offset="100%" style={{ stopColor: '#66bb6a' }} />
                                    </linearGradient>
                                </defs>
                                <rect width="650" height="480" fill="#1f2937" rx="12" />
                                <path d="M0,420 L90,300 L170,340 L260,250 L370,310 L470,260 L550,320 L650,280 L650,480 L0,480 Z" fill="#374151" opacity="0.6" />
                                <g>
                                    <polygon data-region="chuy" points="110,65 225,58 275,105 230,140 135,135 85,100" fill="url(#greenGrad)" stroke="#0f3d0f" strokeWidth="2" className="cursor-pointer transition hover:opacity-80" onClick={() => handleRegionClick('chuy')} />
                                    <text x="165" y="100" fill="white" fontSize="12" fontWeight="bold">Чүй</text>
                                    <polygon data-region="issyk" points="280,55 405,48 470,100 390,135 305,122 255,92" fill="url(#greenGrad)" stroke="#0f3d0f" strokeWidth="2" className="cursor-pointer transition hover:opacity-80" onClick={() => handleRegionClick('issyk')} />
                                    <text x="340" y="88" fill="white" fontSize="11" fontWeight="bold">Ысык-Көл</text>
                                    <polygon data-region="naryn" points="410,105 520,100 570,165 495,190 400,165" fill="url(#greenGrad)" stroke="#0f3d0f" strokeWidth="2" className="cursor-pointer transition hover:opacity-80" onClick={() => handleRegionClick('naryn')} />
                                    <text x="465" y="140" fill="white" fontSize="10" fontWeight="bold">Нарын</text>
                                    <polygon data-region="talas" points="55,165 145,158 185,205 110,235 40,195" fill="url(#greenGrad)" stroke="#0f3d0f" strokeWidth="2" className="cursor-pointer transition hover:opacity-80" onClick={() => handleRegionClick('talas')} />
                                    <text x="95" y="195" fill="white" fontSize="10" fontWeight="bold">Талас</text>
                                    <polygon data-region="osh" points="165,230 275,220 310,285 235,315 135,275" fill="url(#greenGrad)" stroke="#0f3d0f" strokeWidth="2" className="cursor-pointer transition hover:opacity-80" onClick={() => handleRegionClick('osh')} />
                                    <text x="215" y="265" fill="white" fontSize="11" fontWeight="bold">Ош</text>
                                    <polygon data-region="jalal" points="310,240 415,235 455,305 380,325 295,295" fill="url(#greenGrad)" stroke="#0f3d0f" strokeWidth="2" className="cursor-pointer transition hover:opacity-80" onClick={() => handleRegionClick('jalal')} />
                                    <text x="355" y="278" fill="white" fontSize="10" fontWeight="bold">Жалал-Абад</text>
                                    <polygon data-region="batken" points="120,320 225,315 260,385 170,415 80,370" fill="url(#greenGrad)" stroke="#0f3d0f" strokeWidth="2" className="cursor-pointer transition hover:opacity-80" onClick={() => handleRegionClick('batken')} />
                                    <text x="160" y="365" fill="white" fontSize="10" fontWeight="bold">Баткен</text>
                                </g>
                                <circle cx="350" cy="225" r="12" fill="#ffd966" stroke="#fff" strokeWidth="2" />
                                <text x="345" y="229" fill="#1f2937" fontSize="9" fontWeight="bold">AI</text>
                            </svg>
                        </div>

                        {/* Геопанель — тёмный фон */}
                        <div className="lg:w-96 bg-gray-800 rounded-2xl shadow p-6 text-gray-200">
                            <h3 className="text-xl font-bold text-green-400 mb-4"><i className="fas fa-globe mr-2"></i> Геоданиялык маалымат</h3>
                            {currentRegion ? (
                                <>
                                    <div className="flex items-center gap-3 py-2 border-b border-gray-700"><i className="fas fa-map-pin text-green-400 w-6"></i><strong>Аймак:</strong> {currentRegion.name}</div>
                                    <div className="flex items-center gap-3 py-2 border-b border-gray-700"><i className="fas fa-temperature-high text-green-400 w-6"></i><strong>Аба ырайы:</strong> {currentWeather?.temp}°C, {currentWeather?.condition}</div>
                                    <div className="flex items-center gap-3 py-2 border-b border-gray-700"><i className="fas fa-tint text-green-400 w-6"></i><strong>Нымдуулук:</strong> {currentWeather?.humidity}%</div>
                                    <div className="flex items-center gap-3 py-2 border-b border-gray-700"><i className="fas fa-mountain text-green-400 w-6"></i><strong>Топурак:</strong> {currentRegion.soil}</div>
                                    <div className="flex items-center gap-3 py-2 border-b border-gray-700"><i className="fas fa-apple-alt text-green-400 w-6"></i><strong>Эгиндер:</strong> {currentRegion.crops}</div>
                                    <div className="bg-gray-700 p-3 rounded-xl mt-3 flex items-center gap-2 text-green-300"><i className="fas fa-robot text-green-400"></i> 🤖 AI сунуш: {currentRegion.aiTip}</div>
                                </>
                            ) : (
                                <p className="text-gray-400">Картадан облусту басыңыз</p>
                            )}
                            <div className="mt-6">
                                <h4 className="font-bold text-green-400 mb-2"><i className="fas fa-list mr-1"></i> Облустар</h4>
                                <div className="flex flex-wrap gap-2">
                                    {regionsList.map(reg => (
                                        <button key={reg.id} onClick={() => handleRegionClick(reg.id)} className="bg-gray-700 hover:bg-green-600 text-gray-200 hover:text-white text-sm px-3 py-1 rounded-full transition">
                                            <i className={`${reg.icon} mr-1`}></i> {reg.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {sms && <WeatherSms message={sms.message} type={sms.type} onClose={() => setSms(null)} />}
        </div>
    );
};

export default HomePage;
