import { Groq } from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { message, conversationHistory = [] } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });

        const systemPrompt = `Сен — Kyrgyz AgroAI, жардамчы ассистент. Сен ар дайым кыргыз тилинде жооп бересиң. Колдонуучу ар кандай суроолорду бере алат: илим, технология, маданият, спорт, же жөн гана күндөлүк жагдайлар. Сен ага толук, так жана пайдалуу жооп берүүгө аракет кыл. Эгер суроо айыл чарбага тиешелүү болсо, анда Кыргызстандын шартына ылайык кеңештерди бер. Эгерде суроо татаал болсо, жөнөкөй тил менен түшүндүр. Эч кандай суроодон баш тартпа, бирок так билбесең, чынчылдык менен "мен бул суроого жооп бере албайм" деп айт. Кыска жана так жооп берүүгө аракет кыл.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            })),
            { role: 'user', content: message }
        ];

        const completion = await groq.chat.completions.create({
            messages,
            model: 'llama-3.1-8b-instant',
            temperature: 0.7,
            max_tokens: 1024,
        });

        const reply = completion.choices[0]?.message?.content || "Кечиресиз, жооп бере албадым.";
        return res.status(200).json({ reply });
    } catch (error) {
        console.error('❌ API error:', error);
        return res.status(500).json({ error: 'Failed to generate response', details: error.message });
    }
}
