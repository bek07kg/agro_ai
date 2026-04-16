import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { regionsData } from '../data/regionsData';

const DistrictDetailPage: React.FC = () => {
    const { regionId, districtIndex } = useParams<{ regionId: string; districtIndex: string }>();
    const navigate = useNavigate();
    const region = regionId ? regionsData[regionId] : null;
    const district = region && districtIndex ? region.districts[parseInt(districtIndex)] : null;

    if (!region || !district) {
        return <div className="container mx-auto p-8 text-center text-gray-400">Район табылган жок</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(`/region/${regionId}`)} className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-full text-sm font-semibold transition">
                    <i className="fas fa-arrow-left mr-1"></i> Облуска кайтуу
                </button>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-green-500 bg-clip-text text-transparent">
                    <i className="fas fa-building mr-2 text-green-400"></i> {district.name}
                </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-800 p-3 rounded-xl text-gray-200"><i className="fas fa-location-dot text-green-400 mr-2"></i> Борбору: {district.center}</div>
                <div className="bg-gray-800 p-3 rounded-xl text-gray-200"><i className="fas fa-mountain text-green-400 mr-2"></i> Топурак: {district.soil}</div>
                <div className="bg-gray-800 p-3 rounded-xl text-gray-200"><i className="fas fa-apple-alt text-green-400 mr-2"></i> Эгиндер: {district.crops}</div>
            </div>

            <div className="bg-gray-800 p-4 rounded-xl border-l-4 border-green-500 mb-8 text-gray-200">
                <i className="fas fa-robot text-green-400 mr-2"></i> 🤖 AI сунуш: {region.aiTip.substring(0, 100)}...
            </div>

            <h2 className="text-2xl font-bold text-green-400 mb-4"><i className="fas fa-tree mr-2"></i> Айылдар жана шаарлар</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {district.villages.map((village, idx) => {
                    let icon = village.type === 'шаар' ? 'fas fa-city' : (village.type === 'шаарча' ? 'fas fa-building' : 'fas fa-tree');
                    return (
                        <div key={idx} className="bg-gray-800 rounded-xl shadow p-4 border border-gray-700 hover:border-green-500 transition">
                            <h3 className="font-bold text-green-300"><i className={`${icon} mr-2`}></i> {village.name}</h3>
                            <p className="text-sm text-gray-300 mt-1"><i className="fas fa-mountain w-5"></i> Топурак: {village.soil}</p>
                            <p className="text-sm text-gray-300"><i className="fas fa-apple-alt w-5"></i> Эгиндер: {village.crops}</p>
                            {village.population && <p className="text-xs text-gray-400"><i className="fas fa-users"></i> Калкы: {village.population}</p>}
                            <div className="mt-2 text-xs bg-gray-700 p-2 rounded text-gray-300"><i className="fas fa-robot text-green-400 mr-1"></i> Сунуш: {region.aiTip.substring(0, 60)}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DistrictDetailPage;
