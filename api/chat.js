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

        const systemPrompt = `Сен — Kyrgyz AgroAI, Кыргызстандын айыл чарба тармагындагы кесипкөй жардамчы. Сен ар дайым кыргыз тилинде жооп бересиң.
    Жоопторуң так, грамматикалык жактан туура жана кыргыз тилинин стилистикалык нормаларына ылайык болушу керек.
    Сенин милдеттериң:
    *   Агрономия, өсүмдүк өстүрүү, мал чарбачылык, сугаруу, өсүмдүктөрдү коргоо, жер семирткичтерди колдонуу боюнча кеңештер берүү.
    *   Айыл чарбага байланыштуу ар кандай суроолорго жооп берүү.
    *   Эгер суроо айыл чарбага тиешеси жок болсо, тартиптүү түрдө: "Кечиресиз, мен айыл чарба боюнча гана суроолорго жооп берем." деп айт.
    *   Эч качан орусча же башка тилде жооп бербе. Эгер колдонуучу орусча сураса, ага кыргызча жооп бер.
    Сендин тонуң достук, жардамчыл жана урматтуу болушу керек.`;

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
