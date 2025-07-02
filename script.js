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
    const tabsNav = document.getElementById('tabs-nav');
    const tabsContent = document.getElementById('tabs-content');
    tabsNav.innerHTML = '<p>Загружаю данные...</p>';
    tabsContent.innerHTML = '';


    fetch(webhookUrl)
        .then(response => response.json())
        .then(data => {
            // Убеждаемся, что data - это массив
            const dataArray = Array.isArray(data) ? data : [data];
            updateDashboard(dataArray);
        })
        .catch(error => {
            console.error('Ошибка при загрузке данных:', error);
            tabsNav.innerHTML = '<p>Не удалось загрузить данные с сервера.</p>';
        });
}

function updateDashboard(dataArray) {
    const tabsNav = document.getElementById('tabs-nav');
    const tabsContent = document.getElementById('tabs-content');
    
    // Очищаем контейнеры
    tabsNav.innerHTML = '';
    tabsContent.innerHTML = '';

    if (dataArray.length === 0 || !dataArray[0]) {
        tabsNav.innerHTML = '<p>Нет данных за выбранный период.</p>';
        return;
    }
    
    // Сортируем данные по названию кампании, чтобы вкладки были в одном порядке
    dataArray.sort((a, b) => a.campaignName.localeCompare(b.campaignName));
    
    // Устанавливаем общую дату отчета по последней записи
    const lastReportDate = new Date(dataArray[dataArray.length - 1].reportDate);
    document.getElementById('report-date').innerText = lastReportDate.toLocaleDateString('ru-RU');

    // Создаем вкладки и их содержимое
    dataArray.forEach((campaignData, index) => {
        // Создаем кнопку-вкладку
        const tabButton = document.createElement('button');
        tabButton.className = 'tab-button';
        tabButton.dataset.tabId = `tab-${index}`;
        tabButton.innerText = campaignData.campaignName || `Кампания ${index + 1}`;
        tabsNav.appendChild(tabButton);

        // Создаем панель с контентом для вкладки
        const tabContent = document.createElement('div');
        tabContent.className = 'tab-content';
        tabContent.id = `tab-${index}`;
        tabContent.innerHTML = `
            <section class="metrics">
                <div class="card"><h2>Потрачено</h2><p><span>${parseFloat(campaignData.spend || 0).toFixed(2)}</span> $</p></div>
                <div class="card"><h2>Клики</h2><p>${campaignData.clicks || 0}</p></div>
                <div class="card"><h2>CTR</h2><p><span>${parseFloat(campaignData.ctr || 0).toFixed(2)}</span> %</p></div>
                <div class="card"><h2>CPC</h2><p><span>${parseFloat(campaignData.cpc || 0).toFixed(2)}</span> $</p></div>
            </section>
            <section class="ai-analysis">
                <h2>🤖 Рекомендация от AI</h2>
                <p>${campaignData.aiAnalysis || "Нет данных."}</p>
            </section>
        `;
        tabsContent.appendChild(tabContent);

        // Добавляем обработчик клика на кнопку
        tabButton.addEventListener('click', () => {
            // Убираем класс 'active' у всех кнопок и панелей
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

            // Добавляем класс 'active' нужной кнопке и панели
            tabButton.classList.add('active');
            tabContent.classList.add('active');
        });
    });

    // Делаем первую вкладку активной по умолчанию
    if (tabsNav.children.length > 0) {
        tabsNav.children[0].click();
    }
    
    // График пока не трогаем, чтобы не усложнять. Его можно добавить позже.
}