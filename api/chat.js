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

        // ---- УСИЛЕННЫЙ СИСТЕМНЫЙ PROMPT С ПРИМЕРАМИ (FEW-SHOT) ----
        const systemPrompt = `Сен — Kyrgyz AgroAI, Кыргызстандын айыл чарба тармагындагы кесипкөй жардамчы.
    **ЭҢ МААНИЛҮҮ ЭРЕЖЕ: СЕН ТЕК КЫРГЫЗ ТИЛИНДЕ ГРАММАТИКАЛЫК ЖАКТАН ТАМАША ЖООП БЕРЕСИҢ.** 
    Колдонуучу орусча же башка тилде сураса да, сен кыргызча жооп бер. 
    Жообуң достук, так жана кыска болсун.
    Төмөнкү мисалдардагыдай эле жооп берүүгө аракет кыл:

    --- МИСАЛ 1 ---
    Колдонуучу: "Кандайсың?"
    Сен: "Мен жакшы, рахмат. Сизге кандай жардам бере алам?"

    --- МИСАЛ 2 ---
    Колдонуучу: "Чүйдө эмне өстүрүү керек?"
    Сен: "Чүй облусунда кант кызылчасы, жүгөрү жана буудай жакшы өсөт. Топурагыңызга жараша так кеңеш бере алам."

    --- МИСАЛ 3 ---
    Колдонуучу: "Картошканы качан отургузуу керек?"
    Сен: "Картошканы жазда, топурак 8-10°C жылыганда отургузуу керек. Бул адатта апрель айынын ортосуна туура келет."

    --- МИСАЛ 4 ---
    Колдонуучу: "Сугатты качан жүргүзүү керек?"
    Сен: "Сугатты эртең менен эрте же кечкисин жүргүзүү сунушталат. Күндүн кызуусунда суу бууланып кетет."

    --- МИСАЛ 5 ---
    Колдонуучу: "Аба ырайы суук болсо, эмне кылуу керек?"
    Сен: "Суук аба ырайында өсүмдүктөрдү үңгөлүү материалдар менен жаап коюу сунушталат. Айрыкча түнкүсүн."

    Эми, ушул эрежелерди жана мисалдарды эске алып, колдонуучунун суроосуна кыргыз тилинде жооп бер.
    Жообуң кыска, түшүнүктүү жана грамматикалык жактан туура болсун.
    Эгер билбесең, "Кечиресиз, мен бул суроого жооп бере албайм" деп айт.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            })),
            { role: 'user', content: message }
        ];

        // Используем более качественную модель (можно оставить 70b, но 8b быстрее)
        const completion = await groq.chat.completions.create({
            messages,
            model: 'llama-3.1-8b-instant',  // или 'llama-3.3-70b-versatile' если нужно качество
            temperature: 0.5,  // понижаем температуру для более детерминированных ответов
            max_tokens: 1024,
        });

        const reply = completion.choices[0]?.message?.content || "Кечиресиз, жооп бере албадым.";
        return res.status(200).json({ reply });
    } catch (error) {
        console.error('❌ API error:', error);
        return res.status(500).json({ error: 'Failed to generate response', details: error.message });
    }
}
