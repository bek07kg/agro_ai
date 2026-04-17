import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';

interface Message {
    text: string;
    isUser: boolean;
}

const AIChatPage: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { text: "Саламатсызбы! Мен Kyrgyz AgroAI кеңешчиси. Топурак, эгиндер, сугат же түшүм жөнүндө сурасаңыз болот.", isUser: false }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const topRef = useRef<HTMLDivElement>(null);

    // 1. МГНОВЕННЫЙ СБРОС СКРОЛЛА ПРИ ОТКРЫТИИ
    // useLayoutEffect срабатывает ДО отрисовки, что убирает прыжки
    useLayoutEffect(() => {
        window.scrollTo(0, 0);
        if (topRef.current) {
            topRef.current.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
    }, []);

    // 2. ПЛАВНЫЙ СКРОЛЛ К НОВЫМ СООБЩЕНИЯМ
    useEffect(() => {
        // Прокручиваем вниз, только если в чате больше одного сообщения
        if (messages.length > 1) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const getAIResponse = (question: string): string => {
        const q = question.toLowerCase();
        if (q.includes('топурак')) return "Кыргызстанда 3 топурак түрү бар: Чүйдө кара топурак, Ошто бозомук күрөң, Ысык-Көлдө кумдак. Ар бир аймакта өзүнүн топурак түрүнө ылайык эгиндер өстүрүлөт.";
        if (q.includes('эгин')) return "Чүйдө кант кызылчасы жана жүгөрү, Ошто пахта жана күрүч, Ысык-Көлдө картошка жана алма, Таласта буудай, Баткенде өрүк жана шабдалы жакшы өсөт.";
        if (q.includes('сугат')) return "Сугатты эртең менен эрте же кечкисин жүргүзүү сунушталат. Тамчылатып сугаруу системасын колдонсоңуз, сууну 40% үнөмдөйсүз жана түшүмдүүлүк 25% жогорулайт.";
        if (q.includes('түшүм')) return "Быйылкы түшүм болжолу: Чүйдө жүгөрүдөн +12%, Ошто пахтадан +8%, Ысык-Көлдө картошкадан +10% өсүш күтүлөт. Аба ырайы ыңгайлуу.";
        return "Мен сизге айыл чарба боюнча кеңеш бере алам. Топурак, эгиндер, сугат же түшүм жөнүндө сураңыз! Мисалы: 'Чүйдө кандай эгин өстүрүү керек?' 🌾";
    };

    const sendMessage = () => {
        if (!input.trim()) return;
        const userMsg = input.trim();
        setMessages(prev => [...prev, { text: userMsg, isUser: true }]);
        setInput('');

        // Имитация задержки ответа бота
        setTimeout(() => {
            const reply = getAIResponse(userMsg);
            setMessages(prev => [...prev, { text: reply, isUser: false }]);
        }, 300);
    };

    return (
        <div ref={topRef} className="container mx-auto px-4 py-8 max-w-4xl min-h-screen">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-green-500 bg-clip-text text-transparent">
                    <i className="fas fa-robot mr-2 text-green-400"></i> AI кеңешчи
                </h1>
                <p className="text-gray-400">Айыл чарба боюнча суроолоруңузга жооп берейин</p>
            </div>

            <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-700">
                {/* Окно сообщений */}
                <div className="h-[500px] overflow-y-auto p-4 bg-gray-900 flex flex-col gap-3">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                        >
                            <div className={`max-w-[80%] px-4 py-2 rounded-2xl shadow-sm ${msg.isUser
                                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white rounded-br-none'
                                    : 'bg-gray-700 text-gray-200 rounded-bl-none'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {/* Якорь для скролла */}
                    <div ref={messagesEndRef} />
                </div>

                {/* Поле ввода */}
                <div className="border-t border-gray-700 p-4 flex gap-2 bg-gray-800">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && sendMessage()}
                        placeholder="Сурооңузду жазыңыз..."
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-full px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    />
                    <button
                        onClick={sendMessage}
                        className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-500 transition-colors flex items-center gap-2 active:scale-95"
                    >
                        <i className="fas fa-paper-plane text-sm"></i>
                        <span className="hidden md:inline">Жөнөтүү</span>
                    </button>
                </div>
            </div>

            {/* Дополнительная информация или подсказки под чатом */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Топурак', 'Эгин', 'Сугат', 'Түшүм'].map((hint) => (
                    <button
                        key={hint}
                        onClick={() => setInput(hint)}
                        className="text-xs bg-gray-800 border border-gray-700 text-gray-400 py-2 px-3 rounded-xl hover:border-green-500 hover:text-green-400 transition"
                    >
                        #{hint}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AIChatPage;
