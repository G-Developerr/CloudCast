document.getElementById('cloudcast-header').addEventListener('click', function() {
    resetView(); // Καλεί την υπάρχουσα συνάρτηση resetView
});
async function getMoonData() {
    try {
        const moonPhaseTranslations = {
            "New Moon": "Νέα Σελήνη",
            "Waxing Crescent": "Αύξων Μηνίσκος",
            "First Quarter": "Πρώτο Τέταρτο",
            "Waxing Gibbous": "Αύξων Αμφίκυρτος",
            "Full Moon": "Πανσέληνος",
            "Waning Gibbous": "Φθίνων Αμφίκυρτος",
            "Last Quarter": "Τελευταίο Τέταρτο",
            "Waning Crescent": "Φθίνων Μηνίσκος",
            "Dark Moon": "Σκοτεινό Φεγγάρι"
        };

        const currentDate = new Date();
        const timestamp = Math.floor(currentDate.getTime() / 1000);
        const url = `https://api.farmsense.net/v1/moonphases/?d=${timestamp}`;

        const response = await fetch(url);
        const data = await response.json();
        console.log(data);

        if (data.length > 0 && data[0].Phase) {
            const moonPhase = data[0].Phase;
            const isWaxing = data[0].IsWaxing ? "Αύξουσα 🌒" : "Φθίνουσα 🌘";
            const translatedMoonPhase = moonPhaseTranslations[moonPhase] || moonPhase;

            document.getElementById('moon-info').innerHTML = `
                <p>🌙 Κατάσταση Σελήνης: <strong>${translatedMoonPhase}</strong></p>
                <p>🔄 Κατάσταση: <strong>${isWaxing}</strong></p>
            `;
        } else {
            document.getElementById('moon-info').innerHTML = `<p>Δεν υπάρχουν δεδομένα για τη Σελήνη.</p>`;
        }
    } catch (error) {
        console.error("Σφάλμα στην ανάκτηση των δεδομένων της Σελήνης", error);
        document.getElementById('moon-info').innerHTML = `<p style="color:red;">❌ Σφάλμα φόρτωσης δεδομένων</p>`;
    }
}

function checkScreenSize() {
    if (window.innerWidth < 768) {
        // Κώδικας για μικρές οθόνες
    } else {
        // Κώδικας για μεγαλύτερες οθόνες
    }
}

window.addEventListener('resize', checkScreenSize);
checkScreenSize();
window.onload = getMoonData;



document.addEventListener("DOMContentLoaded", function () {
    var apiKey = "d6c93a86758b280e0726298bfa6c7023";

    var map = L.map('rain-map').setView([37.98, 23.72], 6); // Αθήνα
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    var radarLayer = L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKey}`, {
        opacity: 0.6
    });

    radarLayer.addTo(map);
});



function checkScroll() {
    const footer = document.getElementById("footer");
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        footer.style.bottom = "0";
    } else {
        footer.style.bottom = "-500px";
    }
}

window.addEventListener("scroll", checkScroll);



const apiKey = 'da7d9d9e59e8dc46de9ddb2e585dbab8';

let map;
let temperatureChart = null;

async function getWeather() {
    const city = document.getElementById('city').value.trim();
    if (!city) return;

    document.getElementById('welcome-message').style.display = "none";
    document.getElementById('welcome-text').style.display = "none";

    document.getElementById('loading').style.display = "block";
    document.body.classList.remove("search-active");

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&lang=el&appid=${apiKey}`);
        const data = await response.json();

        document.getElementById('loading').style.display = "none";

        if (data.cod !== "200") {
            document.getElementById('forecast').innerHTML = `<p style="color:red;">❌ Η πόλη δεν βρέθηκε.</p>`;
            return;
        }

        const forecastContainer = document.getElementById('forecast');
        forecastContainer.innerHTML = "";

        const weatherContainer = document.getElementById('weatherContainer');
        weatherContainer.classList.add("fullscreen");
        document.body.classList.add("fullscreen-background");

        // Εμφάνιση των τρεχουσών συνθηκών
        const currentWeather = data.list[0];
        const currentWeatherInfo = `
            <p>🌡️ Θερμοκρασία: <strong>${currentWeather.main.temp}°C</strong></p>
            <p>🌤️ Καιρός: <strong>${currentWeather.weather[0].description}</strong></p>
            <p>💧 Υγρασία: <strong>${currentWeather.main.humidity}%</strong></p>
            <p>💨 Άνεμος: <strong>${currentWeather.wind.speed} m/s</strong></p>
        `;
        document.getElementById('current-weather-info').innerHTML = currentWeatherInfo;

        // Εμφάνιση της ατμοσφαιρικής πίεσης
        const pressure = currentWeather.main.pressure;
        document.getElementById('pressure-info').innerHTML = `
            <p>📊 Ατμοσφαιρική Πίεση: <strong>${pressure} hPa</strong></p>
        `;

        // Εμφάνιση του χάρτη καιρού
        const latitude = data.city.coord.lat;
        const longitude = data.city.coord.lon;

        if (map) {
            map.remove();
        }

        map = L.map('weather-map').setView([latitude, longitude], 10);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        L.marker([latitude, longitude]).addTo(map)
            .bindPopup(`<b>${data.city.name}</b><br>${currentWeather.weather[0].description}`)
            .openPopup();

        const dailyForecasts = {};

        data.list.forEach(entry => {
            const [date, time] = entry.dt_txt.split(' ');
            if (!dailyForecasts[date]) {
                dailyForecasts[date] = [];
            }
            dailyForecasts[date].push(entry);
        });

        Object.keys(dailyForecasts).forEach(date => {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('day-forecast');
            dayDiv.innerHTML = `<strong>${new Date(date).toLocaleDateString('el-GR', { weekday: 'long' })} - ${date}</strong>`;
            
            dailyForecasts[date].forEach(entry => {
                const hourDiv = document.createElement('div');
                hourDiv.classList.add('hourly-forecast');
                hourDiv.innerHTML = `
                    <div>
                        <strong>${new Date(date).toLocaleDateString('el-GR', { weekday: 'long' })}</strong><br>
                        <strong>${entry.dt_txt.split(' ')[1]}</strong>
                    </div>
                    <div>
                        <img src="http://openweathermap.org/img/wn/${entry.weather[0].icon}.png" alt="Weather icon">
                        <div>${entry.weather[0].description}</div>
                    </div>
                    <p><strong>Θερμοκρασία:</strong> ${entry.main.temp}°C</p>
                    <p><strong>Πραγματική Αίσθηση :</strong> ${entry.main.feels_like}°C</p>
                    <div>💧 Υγρασία: ${entry.main.humidity}%</div>
                `;
                dayDiv.appendChild(hourDiv);
            });

            forecastContainer.appendChild(dayDiv);
        });

        // Δημιουργία γραφήματος θερμοκρασίας
        const labels = data.list.map(entry => entry.dt_txt);
        const temperatures = data.list.map(entry => entry.main.temp);

        const ctx = document.getElementById('temperatureChart').getContext('2d');
        if (temperatureChart) {
            temperatureChart.destroy();
        }
        temperatureChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Θερμοκρασία (°C)',
                    data: temperatures,
                    borderColor: '#1c3d5a',
                    backgroundColor: 'rgba(28, 61, 90, 0.1)',
                    borderWidth: 2,
                    pointRadius: 4,
                    pointBackgroundColor: '#1c3d5a',
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Χρόνος'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Θερμοκρασία (°C)'
                        }
                    }
                }
            }
        });

        // Εμφάνιση του container των announcements μόνο μετά την επιτυχή αναζήτηση
        document.body.classList.add("search-active");

        // Αφαίρεση της κλάσης centered όταν γίνεται αναζήτηση
        document.getElementById('forecast-container').classList.remove('centered');

    } catch (error) {
        document.getElementById('loading').style.display = "none";
        console.error("Σφάλμα στην ανάκτηση δεδομένων καιρού", error);
        document.getElementById('forecast').innerHTML = `<p style="color:red;">❌ Σφάλμα στην ανάκτηση δεδομένων καιρού.</p>`;
    }
}

function resetView() {
    const weatherContainer = document.getElementById('weatherContainer');
    weatherContainer.classList.remove("fullscreen");
    document.body.classList.remove("fullscreen-background");
    document.body.classList.remove("search-active");

    document.getElementById('forecast').innerHTML = "";
    document.getElementById('welcome-message').style.display = "block";
    document.getElementById('welcome-text').style.display = "block";
    document.getElementById('city').value = "";

    // Επαναφορά της κλάσης centered όταν επιστρέφουμε στην αρχική κατάσταση
    document.getElementById('forecast-container').classList.add('centered');
}

document.getElementById('city').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        getWeather();
    }
});