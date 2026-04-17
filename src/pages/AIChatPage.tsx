import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface Message {
    text: string;
    isUser: boolean;
}

const AIChatPage: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { text: "Саламатсызбы! Мен Kyrgyz AgroAI кеңешчиси. Топурак, эгиндер, сугат же түшүм жөнүндө сурасаңыз болот.", isUser: false }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState('Чүй');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const regions = ['Чүй', 'Ысык-Көл', 'Ош', 'Жалал-Абад', 'Нарын', 'Талас', 'Баткен', 'Бишкек'];

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { text: userMsg, isUser: true }]);
        setInput('');
        setIsLoading(true);
        setMessages(prev => [...prev, { text: '...', isUser: false }]);

        try {
            // Отправляем запрос с регионом и историей
            const historyForAPI = messages
                .filter(m => m.text !== '...')
                .map(m => ({
                    role: m.isUser ? 'user' : 'model',
                    content: m.text
                }));

            const response = await axios.post('/api/chat', {
                message: userMsg,
                conversationHistory: historyForAPI,
                region: selectedRegion   // передаём выбранный регион
            });
            const aiReply = response.data.reply;

            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { text: aiReply, isUser: false };
                return newMessages;
            });
        } catch (error) {
            console.error("Ошибка при запросе к API:", error);
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { text: "Извините, произошла ошибка. Попробуйте позже.", isUser: false };
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-green-500 bg-clip-text text-transparent">
                    <i className="fas fa-robot mr-2 text-green-400"></i> AI кеңешчи
                </h1>
                <p className="text-gray-400">Айыл чарба боюнча суроолоруңузга жооп берейин</p>
            </div>

            {/* Выпадающий список регионов для получения погодных рекомендаций */}
            <div className="flex justify-center mb-4">
                <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="bg-gray-700 text-white px-4 py-2 rounded-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                    {regions.map(region => (
                        <option key={region} value={region}>{region} облусу / шаары</option>
                    ))}
                </select>
            </div>

            <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                <div className="h-96 overflow-y-auto p-4 bg-gray-900 flex flex-col gap-3">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] px-4 py-2 rounded-2xl ${msg.isUser
                                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white rounded-br-none'
                                : 'bg-gray-700 text-gray-200 rounded-bl-none'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <div className="border-t border-gray-700 p-3 flex gap-2 bg-gray-800">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && sendMessage()}
                        placeholder="Сурооңузду жазыңыз..."
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-full px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                        disabled={isLoading}
                    />
                    <button
                        onClick={sendMessage}
                        className={`bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-500 transition ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isLoading}
                    >
                        <i className="fas fa-paper-plane mr-1"></i> Жөнөтүү
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIChatPage;
