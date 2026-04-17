// api/weather.js
export default async function handler(req, res) {
    // Разрешаем только GET-запросы
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { lat, lon } = req.query;
    if (!lat || !lon) {
        return res.status(400).json({ error: 'lat and lon are required' });
    }

    // Читаем ключ из переменных окружения Vercel
    const apiKey = process.env.WEATHERAPI_KEY;
    if (!apiKey) {
        console.error('WEATHERAPI_KEY not set');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    // Формируем запрос к WeatherAPI.com
    // q=lat,lon — формат для поиска по координатам
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}&lang=ru`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.error('WeatherAPI error:', data);
            return res.status(response.status).json({ error: data.error?.message || 'Weather API error' });
        }

        // Приводим данные к единому формату, который использует ваш фронтенд
        res.status(200).json({
            temp: data.current.temp_c,
            humidity: data.current.humidity,
            wind_speed: data.current.wind_kph,
            description: data.current.condition.text,
            icon: data.current.condition.icon, // Готовый URL иконки!
        });
    } catch (error) {
        console.error('Weather fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch weather' });
    }
}
