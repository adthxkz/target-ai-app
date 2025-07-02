// Ссылка на бэкенд
const webhookUrl = '/.netlify/functions/get-data';

// Глобальная переменная для хранения экземпляра графика
let spendChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    Telegram.WebApp.ready();
    document.getElementById('refresh-button').addEventListener('click', loadData);
    loadData();
});

function loadData() {
    const statusElement = document.getElementById('ai-recommendation');
    statusElement.innerText = 'Загружаю свежие данные и анализ...';
    document.querySelector('.metrics').style.opacity = '0.5';
    document.querySelector('.chart-container').style.opacity = '0.5';

    fetch(webhookUrl)
        .then(response => response.json())
        .then(data => {
            updateDashboard(data);
            document.querySelector('.metrics').style.opacity = '1';
            document.querySelector('.chart-container').style.opacity = '1';
        })
        .catch(error => {
            console.error('Ошибка при загрузке данных:', error);
            statusElement.innerText = 'Не удалось загрузить данные с сервера.';
        });
}

function updateDashboard(data) {
    // НОВОЕ ИЗМЕНЕНИЕ: Проверяем, является ли data массивом. Если нет, делаем из него массив.
    const dataArray = Array.isArray(data) ? data : [data];

    // Проверяем, есть ли вообще данные
    if (dataArray.length === 0 || !dataArray[0]) {
        document.getElementById('ai-recommendation').innerText = "Нет данных за вчерашний день.";
        // Можно также скрыть/очистить другие поля
        return; 
    }

    // Сортируем данные по дате
    dataArray.sort((a, b) => new Date(a.dateStart) - new Date(b.dateStart));

    // Для верхних карточек берем данные из самой последней записи
    const latestEntry = dataArray[dataArray.length - 1]; 
    
    if (latestEntry) {
        // Заполняем карточки
        document.getElementById('spend-value').innerText = parseFloat(latestEntry.spend || 0).toFixed(2);
        document.getElementById('clicks-value').innerText = latestEntry.clicks || 0;
        document.getElementById('ctr-value').innerText = parseFloat(latestEntry.ctr || 0).toFixed(2);
        document.getElementById('cpc-value').innerText = parseFloat(latestEntry.cpc || 0).toFixed(2);
        
        document.getElementById('ai-recommendation').innerText = latestEntry.aiAnalysis || "Нет данных.";
        
        const reportDate = new Date(latestEntry.reportDate);
        document.getElementById('report-date').innerText = reportDate.toLocaleDateString('ru-RU');
    }
    
    // Весь массив данных передаем в функцию отрисовки графика
    renderChart(dataArray); 
}


function renderChart(historyData) {
    if (spendChartInstance) {
        spendChartInstance.destroy();
    }
    const ctx = document.getElementById('spend-chart').getContext('2d');
    
    const labels = historyData.map(item => new Date(item.dateStart).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }));
    const dataPoints = historyData.map(item => parseFloat(item.spend || 0));

    spendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Потрачено ($)',
                data: dataPoints,
                fill: true,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}