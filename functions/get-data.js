exports.handler = async function(event, context) {
    const MAKE_WEBHOOK_URL = 'https://hook.eu2.make.com/ajdfn066bhobcgx81g2tssl7rwkq9duw';

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