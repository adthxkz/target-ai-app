exports.handler = async function(event, context) {
    const MAKE_WEBHOOK_URL = 'https://4e2b-79-142-52-91.ngrok-free.app/webhook/aa605d00-b426-4c4a-8c0a-4b83dd6dde45';

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