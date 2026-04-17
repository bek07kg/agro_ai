import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { regionsData, regionsList } from '../data/regionsData';
import kgData from '../data/kg.json';
import WeatherSms from '../components/WeatherSms';
import GeoPanel from '../components/GeoPanel';
import axios from 'axios';

// Кэш для погоды (простой объект, живёт в памяти страницы)
const weatherCache: Record<string, any> = {};

// Фикс иконок Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function ChangeMapView({ center }: { center: [number, number] }) {
    const map = useMap();
    map.setView(center, 12);
    return null;
}

function MapResizeHandler() {
    const map = useMap();
    React.useEffect(() => {
        const handleResize = () => { setTimeout(() => map.invalidateSize(), 100); };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, [map]);
    return null;
}

// Функция получения погоды через WeatherAPI.com (с кэшем)
async function fetchWeather(lat: number, lon: number) {
    const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
    if (weatherCache[cacheKey] && Date.now() - weatherCache[cacheKey].timestamp < 5 * 60 * 1000) {
        console.log('Возвращаем погоду из кэша');
        return weatherCache[cacheKey].data;
    }
    const url = `/api/weather?lat=${lat}&lon=${lon}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (response.ok && data.temp !== undefined) {
            weatherCache[cacheKey] = { data, timestamp: Date.now() };
            return data;
        } else {
            console.error('Weather API error:', data);
            return null;
        }
    } catch (error) {
        console.error('Погоданы алууда ката:', error);
        return null;
    }
}

// Функция получения AI-совета (через ваш /api/chat)
async function getAIAdvice(regionName: string, weather: any) {
    const prompt = `${regionName} аймагында аба ырайы: температура ${weather.temp}°C, нымдуулук ${weather.humidity}%, шамал ${weather.wind_speed} м/с, ${weather.description}. Айыл чарба иштери үчүн кеңеш бер.`;
    try {
        const response = await axios.post('/api/chat', {
            message: prompt,
            conversationHistory: []
        });
        return response.data.reply;
    } catch (error) {
        console.error('AI кеңеш алууда ката:', error);
        return "Кеңешти алуу мүмкүн болбой калды.";
    }
}

// Маппинг названий регионов из GeoJSON к ID
const getRegionId = (name: string): string => {
    const map: Record<string, string> = {
        'Chui': 'chuy',
        'Osh': 'osh',
        'Batken': 'batken',
        'Issyk-Kul': 'issyk',
        'Naryn': 'naryn',
        'Jalal-Abad': 'jalal',
        'Talas': 'talas'
    };
    return map[name] || name.toLowerCase();
};

// Координаты центров регионов
const regionCoords: Record<string, { lat: number; lon: number }> = {
    chuy: { lat: 42.8746, lon: 74.5698 },
    issyk: { lat: 42.1833, lon: 77.45 },
    naryn: { lat: 41.4333, lon: 76.0 },
    talas: { lat: 42.52, lon: 72.24 },
    osh: { lat: 40.5143, lon: 72.8163 },
    jalal: { lat: 40.9333, lon: 73.0 },
    batken: { lat: 40.05, lon: 70.8333 }
};

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
    const [sms, setSms] = useState<{ message: string; type: 'hot' | 'rain' | 'cold' | 'info' } | null>(null);
    const [, setShowMap] = useState(false);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [currentWeatherData, setCurrentWeatherData] = useState<any>(null);
    const [currentAIAdvice, setCurrentAIAdvice] = useState<string | null>(null);
    const [isWeatherLoading, setIsWeatherLoading] = useState(false);
    const [isAIAdviceLoading, setIsAIAdviceLoading] = useState(false);

    const handleRegionClick = async (regionId: string) => {
        const region = regionsData[regionId];
        if (!region) return;

        const coords = regionCoords[regionId];
        if (!coords) {
            setSms({ message: `Кечиресиз, ${region.name} үчүн координаттар табылган жок.`, type: 'info' });
            return;
        }

        setSelectedRegionId(regionId);
        setCurrentWeatherData(null);
        setCurrentAIAdvice(null);
        setIsWeatherLoading(true);
        setIsAIAdviceLoading(true);

        // 1. Запрашиваем погоду (с кэшем)
        const weather = await fetchWeather(coords.lat, coords.lon);
        setIsWeatherLoading(false);
        if (!weather) {
            setSms({ message: `Кечиресиз, ${region.name} үчүн аба ырайын алуу мүмкүн болбой калды.`, type: 'info' });
            setIsAIAdviceLoading(false);
            return;
        }

        setCurrentWeatherData(weather);
        // Показываем SMS с погодой (без AI-совета) сразу
        const smsType = weather.temp > 28 ? 'hot' : weather.temp < 5 ? 'cold' : 'info';
        const smsText = `🌾 ${region.name}\n${weather.temp}°C, ${weather.description}`;
        setSms({ message: smsText, type: smsType });

        // 2. Асинхронно получаем AI-совет (не блокируем интерфейс)
        const advice = await getAIAdvice(region.name, weather);
        setIsAIAdviceLoading(false);
        setCurrentAIAdvice(advice);
        // Обновляем SMS, добавляя AI-совет
        const smsTextWithAdvice = `🌾 ${region.name}\n${weather.temp}°C, ${weather.description}\n🤖 AI кеңеши: ${advice}`;
        setSms({ message: smsTextWithAdvice, type: smsType });
    };

    const handleGeolocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    setUserLocation([lat, lng]);
                    setShowMap(true);

                    let detectedRegionId = null;
                    if (lat > 42.5 && lat < 43.2 && lng > 73.5 && lng < 75.5) detectedRegionId = 'chuy';
                    else if (lat > 42.0 && lat < 42.8 && lng > 76.5 && lng < 78.5) detectedRegionId = 'issyk';
                    else if (lat > 40.0 && lat < 41.5 && lng > 72.0 && lng < 73.5) detectedRegionId = 'osh';

                    if (detectedRegionId) {
                        await handleRegionClick(detectedRegionId);
                    } else {
                        alert("Сиз Кыргызстанда жашайсыз. Облусту картадан тандаңыз.");
                    }
                },
                () => alert("Геолокацияга уруксат бериңиз")
            );
        }
    };

    const currentRegion = selectedRegionId ? regionsData[selectedRegionId] : null;
    const defaultZoom = window.innerWidth < 768 ? 6 : 7;

    return (
        <div className="bg-black min-h-screen text-white">
            {/* Hero секция (без изменений) */}
            <section className="bg-gradient-to-r from-black via-gray-900 to-black py-16 px-4 relative">
                <div className="container mx-auto flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1">
                        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                            Кыргызстандын <span className="text-green-400">акылдуу</span><br />айыл чарба картасы
                        </h1>
                        <div className="flex gap-4 flex-wrap">
                            <button
                                onClick={() => document.getElementById('mapSection')?.scrollIntoView({ behavior: 'smooth' })}
                                className="bg-green-500 text-black px-6 py-2 rounded-full font-bold hover:bg-green-400 transition shadow"
                            >
                                <i className="fas fa-map-marked-alt mr-2"></i> Картаны изилдөө
                            </button>
                            <button
                                onClick={handleGeolocation}
                                className="border-2 border-green-400 text-green-400 px-6 py-2 rounded-full font-bold hover:bg-green-400 hover:text-black transition"
                            >
                                <i className="fas fa-location-dot mr-2"></i> Менин жерим
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 min-h-[256px]">
                        <div className="w-full h-64 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
                            <MapContainer center={userLocation || [41.20, 74.76]} zoom={userLocation ? 12 : defaultZoom} style={{ height: '100%', width: '100%' }}>
                                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                                {userLocation && <Marker position={userLocation} />}
                                {userLocation && <ChangeMapView center={userLocation} />}
                                <MapResizeHandler />
                            </MapContainer>
                        </div>
                    </div>
                </div>
            </section>

            {/* Секция с картой регионов */}
            <section id="mapSection" className="py-12 bg-gray-900">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-green-400 mb-8">Интерактивдүү карта</h2>
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-[2] bg-gray-800 rounded-2xl shadow-2xl p-4 border border-gray-700 h-[600px]">
                            <MapContainer
                                center={[41.2, 74.7]}
                                zoom={7}
                                style={{ height: '100%', width: '100%', background: 'transparent' }}
                                dragging={false}
                                zoomControl={false}
                                scrollWheelZoom={false}
                                doubleClickZoom={false}
                                touchZoom={false}
                            >
                                <GeoJSON
                                    data={kgData as any}
                                    style={(feature) => ({
                                        fillColor: selectedRegionId === getRegionId(feature?.properties.name) ? '#4ade80' : '#166534',
                                        weight: 2,
                                        color: '#064e3b',
                                        fillOpacity: 0.7
                                    })}
                                    onEachFeature={(feature, layer) => {
                                        layer.on({
                                            mouseover: (e) => e.target.setStyle({ fillOpacity: 0.9, color: '#fff' }),
                                            mouseout: (e) => e.target.setStyle({ fillOpacity: 0.7, color: '#064e3b' }),
                                            click: () => handleRegionClick(getRegionId(feature.properties.name))
                                        });
                                        layer.bindTooltip(feature.properties.name, { sticky: true });
                                    }}
                                />
                            </MapContainer>
                        </div>

                        <GeoPanel
                            currentRegion={currentRegion}
                            currentWeather={currentWeatherData}
                            aiAdvice={currentAIAdvice}
                            isWeatherLoading={isWeatherLoading}
                            isAIAdviceLoading={isAIAdviceLoading}
                            onRegionSelect={(regionId) => {
                                navigate(`/region/${regionId}`);
                            }}
                            regionsList={regionsList}
                        />
                    </div>
                </div>
            </section>

            {sms && <WeatherSms message={sms.message} type={sms.type} onClose={() => setSms(null)} />}
        </div>
    );
};

export default HomePage;
