import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// Функция для получения погоды (опционально, требуется OPENWEATHER_API_KEY)
async function fetchWeather(region) {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) return null;

    const coords = {
        'Чүй': { lat: 42.8746, lon: 74.5698 },
        'Бишкек': { lat: 42.8746, lon: 74.5698 },
        'Ысык-Көл': { lat: 42.1833, lon: 77.4500 },
        'Ош': { lat: 40.5143, lon: 72.8163 },
        'Жалал-Абад': { lat: 40.9333, lon: 73.0000 },
        'Нарын': { lat: 41.4333, lon: 76.0000 },
        'Талас': { lat: 42.5200, lon: 72.2400 },
        'Баткен': { lat: 40.0500, lon: 70.8333 }
    };
    const target = Object.keys(coords).find(key => region.includes(key));
    if (!target) return null;
    const { lat, lon } = coords[target];
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ru`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.main) {
            return {
                temp: data.main.temp,
                humidity: data.main.humidity,
                description: data.weather[0].description,
                wind_speed: data.wind.speed
            };
        }
        return null;
    } catch (error) {
        console.error('Weather fetch error:', error);
        return null;
    }
}

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { message, conversationHistory = [], region = null } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });

        // Получаем погоду
        let weatherInfo = null;
        if (region) weatherInfo = await fetchWeather(region);
        let enrichedMessage = message;
        if (weatherInfo) {
            enrichedMessage = `${region} аймагындагы аба ырайы: температура ${weatherInfo.temp}°C, нымдуулук ${weatherInfo.humidity}%, шамал ${weatherInfo.wind_speed} м/с, ${weatherInfo.description}. Колдонуучунун суроосу: ${message}. Ушул аба ырайынын шартына ылайык айыл чарба кеңешин бер.`;
        }

        // Системный промпт (инструкция на кыргызском)
        const systemPrompt = `Сен — Kyrgyz AgroAI, Кыргызстандын айыл чарба тармагындагы кесипкөй жардамчы. Сенин милдетин — агрономия, өсүмдүк өстүрүү, мал чарбачылык, сугаруу, өсүмдүктөрдү коргоо, жер семирткичтерди колдонуу, ошондой эле аба ырайы жана анын түшүмгө тийгизген таасири жөнүндө пайдалуу кеңештерди берүү. **Сен ар дайым кыргыз тилинде жооп беришиң керек.** Колдонуучу орусча сураса да, сен кыргызча жооп бер. Жообуң достук, так жана кыска болсун. Эгер колдонуучу баа, жеңилдиктер же жеке маалыматтар тууралуу сураса — аны сайттын администраторына багытта. Эгер суроо айыл чарбага тиешеси жок болсо, тартиптүү түрдө баш тарт жана айыл чарба темасында суроо берүүнү сунушта. Кыргызстандын айыл чарба аймактары (облустар, айылдар), климат, өсүмдүктөр жөнүндө билимиңди колдон. Так билбесең, "мен билбейм" деп айт.`;

        // Формируем историю для Gemini: начинаем с системного промпта (user + model)
        let history = [
            { role: 'user', parts: [{ text: systemPrompt + '\n\nТүшүндүңбү? Жогорудагы нускаманы аткарасыңбы?' }] },
            { role: 'model', parts: [{ text: 'Түшүндүм. Мен Kyrgyz AgroAI жардамчысы катары кыргыз тилинде гана жооп берем жана айыл чарба боюнча кеңеш берем.' }] }
        ];

        // Добавляем предыдущие сообщения из диалога (если они есть)
        for (const msg of conversationHistory) {
            history.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            });
        }

        // Инициализируем модель и чат
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const chat = model.startChat({ history });
        const result = await chat.sendMessage(enrichedMessage);
        const reply = result.response.text();

        return res.status(200).json({ reply });
    } catch (error) {
        console.error('❌ API error:', error);
        return res.status(500).json({ error: 'Failed to generate response', details: error.message });
    }
}
