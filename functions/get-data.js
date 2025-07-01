exports.handler = async function(event, context) {
    const MAKE_WEBHOOK_URL = 'http://localhost:5678/webhook/a5cc6752-9c0c-43e8-ace4-0fe719d815df';

    try {
        const response = await fetch(MAKE_WEBHOOK_URL, { method: 'POST' });

        if (!response.ok) {
            console.error(`Make.com webhook call failed with status: ${response.status}`);
            return { statusCode: response.status, body: response.statusText };
        }

        const data = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error('Error fetching from Make.com webhook:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal error while fetching data.' })
        };
    }
};