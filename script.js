// Вставьте вашу ссылку на ОПУБЛИКОВАННЫЙ CSV-файл таблицы
const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRmT61yV7Eeiy6avn7CXmgVJ1LWUQT5UlW1MEzzRv2mnkBALbU04y_GigrTjo-b0iEQ1g7QSjzPob01/pub?gid=0&single=true&output=csv';

document.addEventListener('DOMContentLoaded', () => {
    Telegram.WebApp.ready();
    // Привязываем функцию загрузки к кнопке обновления
    const refreshButton = document.getElementById('refresh-button');
    if(refreshButton) {
        refreshButton.addEventListener('click', loadData);
    }
    loadData(); // Запускаем загрузку при первом открытии
});

function loadData() {
    const statusElement = document.getElementById('ai-recommendation');
    statusElement.innerText = 'Загружаю последние данные...';

    fetch(sheetUrl)
        .then(response => response.text())
        .then(text => {
            const data = parseCSV(text);
            updateDashboard(data);
            renderChart(data);
        })
        .catch(error => {
            console.error('Ошибка при загрузке данных из таблицы:', error);
            statusElement.innerText = 'Не удалось загрузить данные.';
        });
}

function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
            const values = line.split(',');
            const row = {};
            for (let j = 0; j < headers.length; j++) {
                row[headers[j]] = values[j] ? values[j].trim() : "";
            }
            rows.push(row);
        }
    }
    return rows;
}

function updateDashboard(data) {
    const latestEntry = data[data.length - 1];
    if (latestEntry) {
        document.getElementById('report-date').innerText = new Date(latestEntry['Дата отчета']).toLocaleDateString('ru-RU');
        document.getElementById('spend-value').innerText = parseFloat(latestEntry['Потрачено']).toFixed(2);
        document.getElementById('clicks-value').innerText = latestEntry['Клики'];
        document.getElementById('ctr-value').innerText = parseFloat(latestEntry['CTR']).toFixed(2);
        document.getElementById('cpc-value').innerText = parseFloat(latestEntry['CPC']).toFixed(2);
        document.getElementById('ai-recommendation').innerText = latestEntry['AI Анализ'] || "Анализ для этого дня еще не готов.";
    }
}

function renderChart(data) {
    if (!data || data.length === 0) return;
    const chartData = data.slice(-7);
    const labels = chartData.map(row => new Date(row['Дата отчета']).toLocaleDateString('ru-RU'));
    const spendData = chartData.map(row => parseFloat(row['Потрачено']));
    const ctx = document.getElementById('spend-chart').getContext('2d');
    
    if(window.mySpendChart) window.mySpendChart.destroy();
    
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