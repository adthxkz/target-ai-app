const webhookUrl = '/.netlify/functions/get-data';
let spendChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    Telegram.WebApp.ready();
    document.getElementById('refresh-button').addEventListener('click', loadData);
    loadData();
});

function loadData() {
    const tabsNav = document.getElementById('tabs-nav');
    tabsNav.innerHTML = '<p>Загружаю данные...</p>';
    document.getElementById('tabs-content').innerHTML = '';

    fetch(webhookUrl)
        .then(response => response.json())
        .then(data => updateDashboard(Array.isArray(data) ? data : [data]))
        .catch(error => {
            console.error('Ошибка при загрузке данных:', error);
            tabsNav.innerHTML = '<p>Не удалось загрузить данные с сервера.</p>';
        });
}

function updateDashboard(dataArray) {
    if (dataArray.length === 0 || !dataArray[0]) {
        document.getElementById('tabs-nav').innerHTML = '<p>Нет данных за выбранный период.</p>';
        return;
    }

    // Группируем все записи по названию кампании
    const campaigns = dataArray.reduce((acc, item) => {
        const campaignName = item.campaignName || 'Без названия';
        if (!acc[campaignName]) {
            acc[campaignName] = [];
        }
        acc[campaignName].push(item);
        return acc;
    }, {});

    const tabsNav = document.getElementById('tabs-nav');
    const tabsContent = document.getElementById('tabs-content');
    tabsNav.innerHTML = '';
    tabsContent.innerHTML = '';
    
    // Сортируем названия кампаний для стабильного порядка вкладок
    const campaignNames = Object.keys(campaigns).sort();
    
    // Устанавливаем общую дату отчета по самой последней записи из всех данных
    const absoluteLatestEntry = dataArray.sort((a,b) => new Date(b.dateStart) - new Date(a.dateStart))[0];
    document.getElementById('report-date').innerText = new Date(absoluteLatestEntry.reportDate).toLocaleDateString('ru-RU');

    // Создаем вкладки и их содержимое
    campaignNames.forEach((campaignName, index) => {
        const campaignData = campaigns[campaignName];
        campaignData.sort((a, b) => new Date(b.dateStart) - new Date(a.dateStart));
        const latestEntry = campaignData[0]; // Самая свежая запись для этой кампании

        // Создаем кнопку-вкладку
        const tabButton = document.createElement('button');
        tabButton.className = 'tab-button';
        tabButton.dataset.tabId = `tab-${index}`;
        tabButton.innerText = campaignName;
        tabsNav.appendChild(tabButton);

        // Создаем панель с контентом для вкладки
        const tabContent = document.createElement('div');
        tabContent.className = 'tab-content';
        tabContent.id = `tab-${index}`;
        tabContent.innerHTML = `
            <section class="metrics">
                <div class="card"><h2>Потрачено</h2><p><span>${parseFloat(latestEntry.spend || 0).toFixed(2)}</span> $</p></div>
                <div class="card"><h2>Клики</h2><p>${latestEntry.clicks || 0}</p></div>
                <div class="card"><h2>CTR</h2><p><span>${parseFloat(latestEntry.ctr || 0).toFixed(2)}</span> %</p></div>
                <div class="card"><h2>CPC</h2><p><span>${parseFloat(latestEntry.cpc || 0).toFixed(2)}</span> $</p></div>
            </section>
            <section class="ai-analysis">
                <h2>🤖 Рекомендация от AI</h2>
                <p>${latestEntry.aiAnalysis || "Нет данных."}</p>
            </section>
            <section class="chart-container">
                <h2>Динамика расходов (7 дней)</h2>
                <canvas id="chart-${index}"></canvas>
            </section>
        `;
        tabsContent.appendChild(tabContent);

        // Рисуем график для этой конкретной кампании
        renderChart(`chart-${index}`, campaignData);

        tabButton.addEventListener('click', () => {
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            tabButton.classList.add('active');
            tabContent.classList.add('active');
        });
    });

    if (tabsNav.children.length > 0) {
        tabsNav.children[0].click();
    }
}

function renderChart(canvasId, historyData) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    historyData.sort((a, b) => new Date(a.dateStart) - new Date(b.dateStart));
    
    const labels = historyData.map(item => new Date(item.dateStart).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }));
    const dataPoints = historyData.map(item => parseFloat(item.spend || 0));

    new Chart(ctx, {
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
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
}