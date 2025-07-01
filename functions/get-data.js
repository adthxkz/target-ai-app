// Финальный код для /functions/get-data.js

// 👇 Убедитесь, что сюда вставлена ваша рабочая (Production) ссылка из n8n
const N8N_PRODUCTION_WEBHOOK_URL = 'https://4423-79-142-52-91.ngrok-free.app/webhook/aa605d00-b426-4c4a-8c0a-4b83dd6dde45';

exports.handler = async function(event, context) {
    try {
        // Отправляем POST-запрос в n8n, чтобы запустить сценарий
        const response = await fetch(N8N_PRODUCTION_WEBHOOK_URL, {
            method: 'POST'
        });

        if (!response.ok) {
            console.error(`Ошибка от n8n: ${response.status}`);
            return { statusCode: response.status, body: `Ошибка на стороне сервера n8n: ${response.statusText}` };
        }

        // Получаем JSON-ответ от n8n
        const data = await response.json();

        // Отправляем данные обратно в веб-приложение
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error('Критическая ошибка функции get-data:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Внутренняя ошибка сервера при запросе данных.' })
        };
    }
};