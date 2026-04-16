import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { regionsData } from '../data/regionsData';

const RegionDetailPage: React.FC = () => {
    const { regionId } = useParams<{ regionId: string }>();
    const navigate = useNavigate();
    const region = regionId ? regionsData[regionId] : null;

    if (!region) {
        return <div className="container mx-auto p-8 text-center text-gray-300">Облус табылган жок</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/')}
                    className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-full text-sm font-semibold transition"
                >
                    <i className="fas fa-arrow-left mr-1"></i> Башкы бетке
                </button>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-green-500 bg-clip-text text-transparent">
                    <i className="fas fa-map-marker-alt mr-2 text-green-400"></i> {region.name}
                </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-800 p-3 rounded-xl flex items-center gap-2 text-gray-200"><i className="fas fa-location-dot text-green-400"></i> Борбору: {region.center}</div>
                <div className="bg-gray-800 p-3 rounded-xl flex items-center gap-2 text-gray-200"><i className="fas fa-chart-simple text-green-400"></i> Аянты: {region.area}</div>
                <div className="bg-gray-800 p-3 rounded-xl flex items-center gap-2 text-gray-200"><i className="fas fa-users text-green-400"></i> Калкы: {region.population}</div>
                <div className="bg-gray-800 p-3 rounded-xl flex items-center gap-2 text-gray-200"><i className="fas fa-mountain text-green-400"></i> Топурак: {region.soil}</div>
                <div className="bg-gray-800 p-3 rounded-xl flex items-center gap-2 text-gray-200"><i className="fas fa-apple-alt text-green-400"></i> Эгиндер: {region.crops}</div>
            </div>

            <div className="bg-gray-800 p-4 rounded-xl border-l-4 border-green-500 mb-8 text-gray-200">
                <i className="fas fa-robot text-green-400 mr-2"></i> 🤖 AI сунуш: {region.aiTip}
            </div>

            <h2 className="text-2xl font-bold text-green-400 mb-4"><i className="fas fa-city mr-2"></i> Райондор</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {region.districts.map((district, idx) => (
                    <div
                        key={idx}
                        onClick={() => navigate(`/district/${region.id}/${idx}`)}
                        className="bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition cursor-pointer border border-gray-700 p-4 hover:border-green-500"
                    >
                        <h3 className="text-lg font-bold text-green-400 flex items-center gap-2"><i className="fas fa-building"></i> {district.name}</h3>
                        <p className="text-sm text-gray-300 mt-1"><i className="fas fa-location-dot w-5 text-green-300"></i> Борбору: {district.center}</p>
                        <p className="text-sm text-gray-300"><i className="fas fa-mountain w-5 text-green-300"></i> Топурак: {district.soil}</p>
                        <p className="text-sm text-gray-300"><i className="fas fa-apple-alt w-5 text-green-300"></i> Эгиндер: {district.crops}</p>
                        <p className="text-xs text-gray-400 mt-2"><i className="fas fa-tree"></i> Айылдар: {district.villages.length} калктуу пункт</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RegionDetailPage;
