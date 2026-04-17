import { GoogleGenerativeAI } from '@google/generative-ai';

// Инициализация клиента Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

export default async function handler(req, res) {
    // CORS для разработки (можно оставить)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, conversationHistory = [] } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Выберите модель: gemini-1.5-flash (быстрая) или gemini-2.0-flash
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Преобразуем историю в формат Gemini
        const history = conversationHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        // Запускаем чат с историей
        const chat = model.startChat({ history });

        // Отправляем новое сообщение и получаем ответ
        const result = await chat.sendMessage(message);
        const reply = result.response.text();

        return res.status(200).json({ reply });

    } catch (error) {
        console.error('❌ Gemini API error:', error);
        return res.status(500).json({
            error: 'Failed to generate response',
            details: error.message
        });
    }
}
