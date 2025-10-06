// script.js - VERSÃO FINAL 
document.addEventListener('DOMContentLoaded', () => {
    const forecastForm = document.getElementById('forecastForm');
    const cityInput = document.getElementById('cityInput');
    const dateInput = document.getElementById('dateInput');
    const eventTypeSelect = document.getElementById('eventTypeSelect');
    const reportButtonInitial = document.getElementById('reportButtonInitial');
    const weatherModal = document.getElementById('weatherModal');
    const closeButtonWeatherModal = weatherModal.querySelector('.close-button');
    const modalBody = document.getElementById('modalBody');
    const userReportModal = document.getElementById('userReportModal');
    const closeButtonUserReportModal = userReportModal.querySelector('.close-report-modal');
    const userReportMapContainer = document.getElementById('userReportMap');
    const conditionSelector = userReportModal.querySelector('.weather-condition-selector');
    const submitReportButton = userReportModal.querySelector('.user-report-submit-button');

    let mainWeatherMap = null, mainMarker = null, userReportMap = null, userReportMapMarker = null;
    let selectedReportCondition = null, userReportMarkers = [];

    forecastForm.addEventListener('submit', handlePrediction);
    closeButtonWeatherModal.addEventListener('click', closeModal);
    weatherModal.addEventListener('click', (event) => { if (event.target === weatherModal) closeModal(); });
    reportButtonInitial.addEventListener('click', openUserReportModal);
    closeButtonUserReportModal.addEventListener('click', closeUserReportModal);
    userReportModal.addEventListener('click', (event) => { if (event.target === userReportModal) closeUserReportModal(); });
    conditionSelector.addEventListener('click', selectReportCondition);
    submitReportButton.addEventListener('click', submitUserReport);

    function openModal() { weatherModal.classList.add('show'); }
    function closeModal() { weatherModal.classList.remove('show'); }

    function openUserReportModal() {
        userReportModal.classList.add('show');
        initializeUserReportMap();
        conditionSelector.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
        selectedReportCondition = null;
        if (userReportMapMarker) userReportMap.removeLayer(userReportMapMarker);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => {
                    const { latitude, longitude } = pos.coords;
                    userReportMap.setView([latitude, longitude], 12);
                    updateUserReportMapMarker(latitude, longitude);
                },
                () => userReportMap.setView([-14.235, -51.925], 4)
            );
        }
        setTimeout(() => userReportMap.invalidateSize(), 100);
    }
    function closeUserReportModal() { userReportModal.classList.remove('show'); }

    function initializeMainWeatherMap() {
        if (mainWeatherMap) return;
        mainWeatherMap = L.map('map').setView([-14.235, -51.925], 4);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(mainWeatherMap);
    }
    function initializeUserReportMap() {
        if (userReportMap) return;
        userReportMap = L.map(userReportMapContainer).setView([-14.235, -51.925], 4);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(userReportMap);
        userReportMap.on('click', e => updateUserReportMapMarker(e.latlng.lat, e.latlng.lng));
    }
    function updateUserReportMapMarker(lat, lon) {
        if (userReportMapMarker) userReportMap.removeLayer(userReportMapMarker);
        userReportMapMarker = L.marker([lat, lon]).addTo(userReportMap);
    }
    function updateMainMapMarker(lat, lon, iconEmoji) {
        if(mainMarker) mainWeatherMap.removeLayer(mainMarker);
        const weatherIcon = L.divIcon({ html: iconEmoji, className: 'weather-map-icon', iconSize: [60, 60] });
        mainWeatherMap.setView([lat, lon], 11);
        mainMarker = L.marker([lat, lon], { icon: weatherIcon }).addTo(mainWeatherMap);
    }

    function selectReportCondition(event) {
        const target = event.target.closest('button');
        if (target && target.dataset.condition) {
            conditionSelector.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
            target.classList.add('selected');
            selectedReportCondition = target.dataset.condition;
        }
    }
    async function submitUserReport() {
        if (!selectedReportCondition || !userReportMapMarker) {
            alert('Por favor, selecione a condição e a localização no mapa.'); return;
        }
        try {
            const lat = userReportMapMarker.getLatLng().lat;
            const lon = userReportMapMarker.getLatLng().lng;
            const response = await fetch('http://127.0.0.1:5000/api/report_weather', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ condition: selectedReportCondition, lat, lon })
            });
            if (!response.ok) throw new Error('Falha ao enviar o report.');
            alert('Seu report foi enviado com sucesso! Obrigado.');
            closeUserReportModal();
            if (mainWeatherMap) displayUserReportsOnMainMap();
        } catch (error) {
            alert('Erro ao enviar seu report: ' + error.message);
        }
    }
    async function displayUserReportsOnMainMap() {
        userReportMarkers.forEach(marker => mainWeatherMap.removeLayer(marker));
        userReportMarkers = [];
        try {
            const response = await fetch('http://127.0.0.1:5000/api/get_reports');
            if (!response.ok) return;
            const reports = await response.json();
            const reportIconMap = { 'Sol': '☀️', 'Nublado': '☁️', 'Chuva': '🌧️', 'Vento': '💨', 'Frio': '🥶' };
            reports.forEach(report => {
                const icon = L.divIcon({ html: `<div class="user-report-icon">${reportIconMap[report.condition] || '❓'}</div>`, className: '', iconSize: [40, 40] });
                const reportMarker = L.marker([report.lat, report.lon], { icon: icon }).addTo(mainWeatherMap).bindPopup(`<b>${report.condition}</b>`);
                userReportMarkers.push(reportMarker);
            });
        } catch (error) {
            console.error("Erro ao carregar reports de usuários:", error);
        }
    }
    
    async function handlePrediction(event) {
        event.preventDefault();
        const cityName = cityInput.value.trim();
        const selectedDate = dateInput.value;
        const selectedPeriod = document.querySelector('input[name="periodo"]:checked').value;
        const selectedEvent = eventTypeSelect.value; 

        if (!cityName || !selectedDate) {
            alert('Por favor, preencha a cidade e a data.'); return;
        }
        
        openModal();
        modalBody.innerHTML = '<h2>Analisando...</h2><p>Buscando coordenadas e dados históricos...</p>';
        initializeMainWeatherMap();
        
        try {
            const coords = await geocodeCity(cityName);
            const [year, month, day] = selectedDate.split('-');
            const weatherResponse = await fetch(`http://127.0.0.1:5000/api/historical_weather?day=${day}&month=${month}`);
            if (!weatherResponse.ok) {
                const errorData = await weatherResponse.json();
                throw new Error(errorData.error || 'Não foi possível buscar os dados históricos.');
            }
            const weatherData = await weatherResponse.json();
            const { mostCommonCondition, icon } = determineWeatherIcon(weatherData);
            
            updateMainMapMarker(coords.lat, coords.lon, icon);
            displayAveragedData(weatherData, day, month, cityName, selectedPeriod, mostCommonCondition, selectedEvent);
            displayUserReportsOnMainMap();
            
            setTimeout(() => { if (mainWeatherMap) mainWeatherMap.invalidateSize(); }, 100);
        } catch (error) {
            modalBody.innerHTML = `<h2 style="color: red;">Erro</h2><p>${error.message}</p>`;
            console.error("Erro na predição:", error);
        }
    }
    
    async function geocodeCity(cityName) {
        const url = `https://nominatim.openstreetmap.org/search?city=${cityName}&country=brazil&format=json&limit=1`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data && data.length > 0) {
                return { lat: data[0].lat, lon: data[0].lon };
            } else {
                throw new Error(`Cidade "${cityName}" não encontrada.`);
            }
        } catch (error) {
            console.error("Geocoding error:", error);
            throw new Error('Falha no serviço de geolocalização.');
        }
    }

    function determineWeatherIcon(data) {
        if (data.length === 0) return { mostCommonCondition: 'Indefinido', icon: '❓' };
        const counts = { 'Chuva': 0, 'Nublado': 0, 'Sol': 0, 'Frio': 0, 'Nevoeiro': 0, 'Vento': 0 };
        let totalTemp = 0;
        data.forEach(record => {
            const summary = record.Summary.toLowerCase();
            totalTemp += record['Temperature (C)'];
            if (summary.includes('rain') || summary.includes('drizzle') || record['Precip Type'] === 'rain') { counts.Chuva += 1; }
            else if (summary.includes('overcast')) { counts.Nublado += 1; }
            else if (summary.includes('mostly cloudy')) { counts.Nublado += 0.8; }
            else if (summary.includes('foggy')) { counts.Nevoeiro += 1; }
            else if (summary.includes('windy')) { counts.Vento += 0.5; }
            else if (summary.includes('partly cloudy')) { counts.Sol += 0.6; counts.Nublado += 0.2; }
            else if (summary.includes('clear')) { counts.Sol += 1; }
        });
        const avgTemp = totalTemp / data.length;
        if (avgTemp < 12) { counts.Frio += data.length * 0.4; }
        let mostCommonCondition = 'Sol';
        let maxCount = -1;
        for (const condition in counts) {
            if (counts[condition] > maxCount) {
                maxCount = counts[condition];
                mostCommonCondition = condition;
            }
        }
        const iconMap = { 'Chuva': '🌧️', 'Nublado': '☁️', 'Sol': '☀️', 'Frio': '🥶', 'Vento': '💨', 'Nevoeiro': '🌫️' };
        return { mostCommonCondition, icon: iconMap[mostCommonCondition] || '☀️' };
    }

    function displayAveragedData(data, day, month, cityName, period, mostCommonCondition, eventImageFile) {
        if (data.length === 0) { modalBody.innerHTML = `<h2>Sem Dados</h2><p>Nenhum dado histórico para ${day}/${month}.</p>`; return; }
        const totalYears = data.length;
        const avgTemp = data.reduce((sum, r) => sum + r['Temperature (C)'], 0) / totalYears;
        const avgHumidity = data.reduce((sum, r) => sum + r['Humidity'], 0) / totalYears;
        const avgWindSpeed = data.reduce((sum, r) => sum + r['Wind Speed (km/h)'], 0) / totalYears;
        const rainDays = data.filter(r => r['Precip Type'] === 'rain').length;
        const rainChance = (rainDays / totalYears) * 100;
        const periodTextMap = { 'Manhã': 'das 06:00 às 12:00', 'Tarde': 'das 12:00 às 18:00', 'Noite': 'das 18:00 às 23:59' };
        
        const tipsDatabase = {
            'Sol': ['Dia excelente para atividades ao ar livre! Use protetor solar.', 'Lembre-se de se hidratar bem.', 'Óculos de sol são recomendados.'],
            'Chuva': ['Planeje atividades em locais cobertos.', 'Se precisar sair, use um guarda-chuva e calçados impermeáveis.', 'Cuidado com pistas escorregadias ao dirigir.'],
            'Nublado': ['O tempo pode mudar rapidamente. Leve um agasalho leve.', 'A radiação UV ainda está presente.', 'Boa iluminação para fotografias, sem sombras duras.'],
            'Frio': ['Agasalhe-se bem com múltiplas camadas de roupa.', 'Bebidas quentes como chá ou chocolate quente são uma ótima pedida.', 'Proteja as extremidades: use luvas, gorro e meias grossas.'],
            'Vento': ['Evite áreas muito abertas ou com árvores antigas.', 'Se estiver na praia, cuidado com a areia e objetos voando.', 'Um casaco corta-vento pode fazer toda a diferença.'],
            'Nevoeiro': ['Redobre a atenção no trânsito, a visibilidade é reduzida.', 'Use faróis de neblina se estiver dirigindo.', 'Caminhadas em locais desconhecidos podem ser perigosas.']
        };
        let tips = tipsDatabase[mostCommonCondition] || [];
        if (avgTemp > 30 && !tips.some(t => t.includes('hidratar'))) tips.push('A temperatura média é alta, não se esqueça de se hidratar!');
        if (avgWindSpeed > 25 && mostCommonCondition !== 'Vento') tips.push('Há chance de ventos fortes, proteja objetos leves.');
        const tipsHTML = tips.map(tip => `<li>${tip}</li>`).join('');

        const imageSectionHTML = eventImageFile !== 'outros' ? `
            <div class="event-image-container">
                <h3>Imagem para seu Evento</h3>
                <img id="eventImage" src="assets/${eventImageFile}" alt="Imagem do Evento">
                <a id="downloadImageButton" href="assets/${eventImageFile}" download="prisma_evento.png">Baixar Imagem</a>
            </div>
        ` : '';

        const contentHTML = `
            <div class="scrollable-content">
                <div class="modal-header">
                    <h2>${cityName}</h2>
                    <p class="period-subtitle">Probabilidade para ${day}/${month} (${period} - ${periodTextMap[period]})</p>
                </div>
                <div class="main-info">
                    <div class="temperature">${avgTemp.toFixed(1)}°C</div>
                    <div class="primary-condition">${mostCommonCondition}</div>
                </div>
                <div class="details-grid">
                    <div class="detail-item">
                        <span class="icon">💧</span>
                        <div class="text">
                            <span class="label">Chance de Chuva</span>
                            <p class="value">${rainChance.toFixed(0)}%</p>
                        </div>
                    </div>
                    <div class="detail-item">
                        <span class="icon">💨</span>
                        <div class="text">
                            <span class="label">Vento Médio</span>
                            <p class="value">${avgWindSpeed.toFixed(1)} km/h</p>
                        </div>
                    </div>
                    <div class="detail-item">
                        <span class="icon">💧</span>
                        <div class="text">
                            <span class="label">Umidade Média</span>
                            <p class="value">${(avgHumidity * 100).toFixed(0)}%</p>
                        </div>
                    </div>
                </div>
                <div class="tips-container">
                    <h3>Dicas e Precauções</h3>
                    <ul>${tipsHTML}</ul>
                </div>
                ${imageSectionHTML}
            </div>`;
        modalBody.innerHTML = contentHTML;
    }
});