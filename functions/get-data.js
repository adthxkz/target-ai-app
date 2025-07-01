exports.handler = async function(event, context) {
    return {
        statusCode: 200,
        body: JSON.stringify({ status: "ok", message: "get-data function is working!" })
    };
};