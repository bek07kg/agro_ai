import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import kgData from '../data/kg.json'; // Путь к твоему файлу

const MapSection = ({ currentRegion, handleRegionClick }: any) => {

    // Сопоставляем ISO-коды из файла с твоими ID областей
    const regionMapping: Record<string, string> = {
        "KG-C": "chuy",
        "KG-N": "naryn",
        "KG-B": "batken",
        "KG-Y": "issyk", // Иссык-Куль
        "KG-O": "osh",
        "KG-J": "jalal", // Жалал-Абад
        "KG-T": "talas"
    };

    const style = (feature: any) => {
        // В файле ID области обычно лежит в feature.properties.ISO_3166_2 или feature.id
        const isoCode = feature.id || feature.properties?.ISO_3166_2;
        const regionId = regionMapping[isoCode];
        const isActive = currentRegion === regionId;

        return {
            fillColor: isActive ? '#4ade80' : '#166534', // Светло-зеленый если выбрано
            weight: 1.5,
            opacity: 1,
            color: '#064e3b',
            fillOpacity: isActive ? 0.8 : 0.5,
        };
    };

    const onEachFeature = (feature: any, layer: any) => {
        layer.on({
            mouseover: (e: any) => e.target.setStyle({ fillOpacity: 0.9, weight: 2 }),
            mouseout: (e: any) => e.target.setStyle(style(feature)),
            click: () => {
                const isoCode = feature.id || feature.properties?.ISO_3166_2;
                const regionId = regionMapping[isoCode];
                if (regionId) handleRegionClick(regionId);
            }
        });
    };

    return (
        <div className="w-full h-[500px] rounded-3xl overflow-hidden border border-gray-700 shadow-2xl">
            <MapContainer
                center={[41.2, 74.7]}
                zoom={7}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                <GeoJSON data={kgData as any} style={style} onEachFeature={onEachFeature} />
            </MapContainer>
        </div>
    );
};

export default MapSection;
