// Ссылка на бэкенд (Netlify-функция или прямой URL n8n)
const webhookUrl = '/.netlify/functions/get-data'; 

// Глобальная переменная для хранения экземпляра графика
let spendChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    Telegram.WebApp.ready();
    document.getElementById('refresh-button').addEventListener('click', loadData);
    loadData(); // Запускаем загрузку при первом открытии
});

function loadData() {
    const statusElement = document.getElementById('ai-recommendation');
    statusElement.innerText = 'Загружаю свежие данные и анализ...';
    document.querySelector('.metrics').style.opacity = '0.5';
    document.querySelector('.chart-container').style.opacity = '0.5';

    fetch(webhookUrl)
        .then(response => response.json())
        .then(data => {
            // data - это теперь массив объектов, по одному на каждый день
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
    // Сортируем данные по дате на случай, если они пришли вразнобой
    data.sort((a, b) => new Date(a.dateStart) - new Date(b.dateStart));

    // Для верхних карточек берем данные из самой последней записи
    const latestEntry = data[data.length - 1]; 
    
    if (latestEntry) {
        // Заполняем карточки
        document.getElementById('spend-value').innerText = parseFloat(latestEntry.spend || 0).toFixed(2);
        document.getElementById('clicks-value').innerText = latestEntry.clicks || 0;
        document.getElementById('ctr-value').innerText = parseFloat(latestEntry.ctr || 0).toFixed(2);
        document.getElementById('cpc-value').innerText = parseFloat(latestEntry.cpc || 0).toFixed(2);
        
        // Заполняем блок с анализом от AI
        document.getElementById('ai-recommendation').innerText = latestEntry.aiAnalysis || "Нет данных.";
        
        // Устанавливаем дату отчета
        const reportDate = new Date(latestEntry.reportDate);
        document.getElementById('report-date').innerText = reportDate.toLocaleDateString('ru-RU');
    }
    
    // А весь массив данных за 7 дней передаем в функцию отрисовки графика
    renderChart(data); 
}


function renderChart(historyData) {
    // Если график уже существует, уничтожаем его, чтобы перерисовать
    if (spendChartInstance) {
        spendChartInstance.destroy();
    }

    const ctx = document.getElementById('spend-chart').getContext('2d');
    
    // Готовим данные для графика
    const labels = historyData.map(item => new Date(item.dateStart).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }));
    const dataPoints = historyData.map(item => parseFloat(item.spend || 0));

    spendChartInstance = new Chart(ctx, {
        type: 'line', // Тип графика - линия
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
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}