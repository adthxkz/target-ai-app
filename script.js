// Ссылка на нашу функцию-посредника на Netlify
const webhookUrl = 'https://4e2b-79-142-52-91.ngrok-free.app/webhook/a5cc6752-9c0c-43e8-ace4-0fe719d815df';

document.addEventListener('DOMContentLoaded', () => {
    Telegram.WebApp.ready();
    document.getElementById('refresh-button').addEventListener('click', loadData);
    loadData(); // Запускаем загрузку при первом открытии
});

function loadData() {
    const statusElement = document.getElementById('ai-recommendation');
    statusElement.innerText = 'Загружаю свежие данные и анализ...';
    document.querySelector('.metrics').style.opacity = '0.5';

    fetch(webhookUrl)
        .then(response => response.json())
        .then(data => {
            updateDashboard(data);
            document.querySelector('.metrics').style.opacity = '1';
        })
        .catch(error => {
            console.error('Ошибка при загрузке данных:', error);
            statusElement.innerText = 'Не удалось загрузить данные с сервера.';
        });
}

function updateDashboard(data) {
    const latestEntry = data.latest;
    if (latestEntry) {
        // Заполняем карточки
        document.getElementById('spend-value').innerText = parseFloat(latestEntry.spend).toFixed(2);
        document.getElementById('clicks-value').innerText = latestEntry.clicks;
        document.getElementById('ctr-value').innerText = parseFloat(latestEntry.ctr).toFixed(2);
        document.getElementById('cpc-value').innerText = parseFloat(latestEntry.cpc).toFixed(2);
        
        // Заполняем блок с анализом от AI
        document.getElementById('ai-recommendation').innerText = data.ai_analysis;
    }
}

// Функцию renderChart можно пока закомментировать или удалить, мы вернем ее позже
/* function renderChart(historyData) { ... } */