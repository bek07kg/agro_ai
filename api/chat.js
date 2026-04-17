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

        const systemPrompt = `Сен — Kyrgyz AgroAI, Кыргызстандын айыл чарба тармагындагы кесипкөй жардамчы. Сенин милдетин — агрономия, өсүмдүк өстүрүү, мал чарбачылык, сугаруу, өсүмдүктөрдү коргоо, жер семирткичтерди колдонуу, ошондой эле аба ырайы жана анын түшүмгө тийгизген таасири жөнүндө пайдалуу кеңештерди берүү. **Сен ар дайым кыргыз тилинде жооп беришиң керек.** Колдонуучу орусча сураса да, сен кыргызча жооп бер. Жообуң достук, так жана кыска болсун. Эгер колдонуучу баа, жеңилдиктер же жеке маалыматтар тууралуу сураса — аны сайттын администраторына багытта. Эгер суроо айыл чарбага тиешеси жок болсо, тартиптүү түрдө баш тарт жана айыл чарба темасында суроо берүүнү сунушта. Кыргызстандын айыл чарба аймактары (облустар, айылдар), климат, өсүмдүктөр жөнүндө билимиңди колдон. Так билбесең, "мен билбейм" деп айт.`;

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
