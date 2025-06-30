const webhookUrl = '/.netlify/functions/get-data';

document.addEventListener('DOMContentLoaded', () => {
    Telegram.WebApp.ready();
    document.getElementById('refresh-button').addEventListener('click', loadData);
    loadData(); // Запускаем загрузку при первом открытии
});

function loadData() {
    const statusElement = document.getElementById('ai-recommendation');
    statusElement.innerText = 'Загружаю данные...';
    document.querySelector('.metrics').style.opacity = '0.5';
    document.querySelector('.chart-container').style.opacity = '0.5';

    fetch(webhookUrl)
        .then(response => response.json()) // Ожидаем JSON
        .then(data => {
            updateDashboard(data);
            renderChart(data.history);
            statusElement.innerText = 'Анализ и рекомендации отправлены в наш чат в Telegram.';
            document.querySelector('.metrics').style.opacity = '1';
            document.querySelector('.chart-container').style.opacity = '1';
        })
        .catch(error => {
            console.error('Ошибка при загрузке данных с Make:', error);
            statusElement.innerText = 'Не удалось загрузить данные с сервера.';
        });
}

function updateDashboard(data) {
    const latestEntry = data.latest;
    if (latestEntry) {
        document.getElementById('report-date').innerText = new Date().toLocaleDateString('ru-RU');
        document.getElementById('spend-value').innerText = parseFloat(latestEntry.spend).toFixed(2);
        document.getElementById('clicks-value').innerText = latestEntry.clicks;
        document.getElementById('ctr-value').innerText = parseFloat(latestEntry.ctr).toFixed(2);
        document.getElementById('cpc-value').innerText = parseFloat(latestEntry.cpc).toFixed(2);
    }
}

function renderChart(historyData) {
    if (!historyData || historyData.length === 0) return;
    const labels = historyData.map(row => new Date(row['Дата отчета']).toLocaleDateString('ru-RU'));
    const spendData = historyData.map(row => parseFloat(row['Потрачено']));
    const ctx = document.getElementById('spend-chart').getContext('2d');
    
    if(window.mySpendChart) {
        window.mySpendChart.destroy();
    }
    
    window.mySpendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Потрачено ($)',
                data: spendData,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                tension: 0.1
            }]
        },
        options: { scales: { y: { beginAtZero: false } } }
    });
}