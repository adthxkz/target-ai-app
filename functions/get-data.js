/*
 * Файл: /functions/get-data.js
 * Этот код будет выполняться на серверах Netlify,
 * он получает запрос от вашего приложения и перенаправляет его в n8n.
 */

// 👇 ВАША ГЛАВНАЯ ССЫЛКА. Вставьте сюда Production URL из вашего n8n.
const N8N_PRODUCTION_WEBHOOK_URL = 'СЮhttp://localhost:5678/webhook/aa605d00-b426-4c4a-8c0a-4b83dd6dde45';

exports.handler = async function(event, context) {
    try {
        // Отправляем запрос в n8n, чтобы запустить сценарий
        const response = await fetch(N8N_PRODUCTION_WEBHOOK_URL, { 
            method: 'POST', 
            body: JSON.stringify({}) // Отправляем пустой JSON, как требует Webhook
        });

        if (!response.ok) {
            console.error(`Ошибка от n8n: ${response.status}`);
            return { statusCode: response.status, body: `Ошибка на стороне сервера n8n: ${response.statusText}` };
        }

        // Получаем данные от n8n
        const data = await response.json();

        // Отправляем данные в ваше приложение в Telegram
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error('Критическая ошибка функции-посредника:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Внутренняя ошибка сервера при запросе данных.' })
        };
    }
};