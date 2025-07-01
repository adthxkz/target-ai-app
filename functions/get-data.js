// Переименовали переменную для ясности
const N8N_WEBHOOK_URL = 'https://4e2b-79-142-52-91.ngrok-free.app/webhook/aa605d00-b426-4c4a-8c0a-4b83dd6dde45';

exports.handler = async function(event, context) {
    try {
        // Отправляем POST-запрос в n8n, чтобы запустить сценарий
        const response = await fetch(N8N_WEBHOOK_URL, { method: 'POST' });

        if (!response.ok) {
            // Если n8n вернул ошибку, логируем ее
            console.error(`n8n webhook call failed with status: ${response.status}`);
            return { statusCode: response.status, body: response.statusText };
        }

        // Получаем JSON-ответ от n8n
        const data = await response.json();

        // Отправляем данные обратно в веб-приложение
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error('Error fetching from n8n webhook:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal error while fetching data.' })
        };
    }
};