import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { regionsData, regionsList, weatherData } from '../data/regionsData';
import kgData from '../data/kg.json'; // Твой файл с границами
import WeatherSms from '../components/WeatherSms';
import GeoPanel from '../components/GeoPanel';

// Фикс для иконок маркера
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

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
    const [sms, setSms] = useState<{ message: string; type: 'hot' | 'rain' | 'cold' | 'info' } | null>(null);
    const [, setShowMap] = useState(false);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

    // ТВОЯ ЛОГИКА (БЕЗ ИЗМЕНЕНИЙ)
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
                    const coords: [number, number] = [lat, lng];
                    setUserLocation(coords);
                    setShowMap(true);

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
                () => { alert("Геолокацияга уруксат бериңиз"); }
            );
        }
    };

    // Маппинг для связи JSON с твоими ID
    const getRegionId = (name: string): string => {
        const map: any = { 'Chui': 'chuy', 'Osh': 'osh', 'Batken': 'batken', 'Issyk-Kul': 'issyk', 'Naryn': 'naryn', 'Jalal-Abad': 'jalal', 'Talas': 'talas' };
        return map[name] || name.toLowerCase();
    };

    const currentRegion = selectedRegionId ? regionsData[selectedRegionId] : null;
    const currentWeather = selectedRegionId ? weatherData[selectedRegionId] : null;
    const defaultZoom = window.innerWidth < 768 ? 6 : 7;

    return (
        <div className="bg-black min-h-screen text-white">
            {/* Hero секция - ОСТАВИЛ КАК БЫЛО */}
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

            {/* Секция с SVG-картой (заменил path на GeoJSON для точности, но логику сохранил) */}
            <section id="mapSection" className="py-12 bg-gray-900">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-green-400 mb-8">Интерактивдүү карта</h2>
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-[2] bg-gray-800 rounded-2xl shadow-2xl p-4 border border-gray-700 h-[600px]">
                            {/* Теперь здесь настоящая ровная карта, которая не двигается */}
                            <MapContainer
                                center={[41.2, 74.7]} zoom={7}
                                style={{ height: '100%', width: '100%', background: 'transparent' }}
                                dragging={false} zoomControl={false} scrollWheelZoom={false} doubleClickZoom={false} touchZoom={false}
                            >
                                <GeoJSON
                                    data={kgData as any}
                                    style={(feature) => ({
                                        fillColor: selectedRegionId === getRegionId(feature?.properties.name) ? '#4ade80' : '#166534',
                                        weight: 2, color: '#064e3b', fillOpacity: 0.7
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
                            currentWeather={currentWeather}
                            onRegionSelect={handleRegionClick}
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
