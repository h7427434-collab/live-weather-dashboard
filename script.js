const cityInput = document.getElementById("cityInput");
const cityName = document.getElementById("cityName");
const currentInfo = document.getElementById("currentInfo");
const forecast = document.getElementById("forecast");
const error = document.getElementById("error");

async function getWeather() {
    const city = cityInput.value.trim();

    if (!city) {
        error.textContent = "Please enter a city name.";
        return;
    }

    error.textContent = "";
    currentInfo.innerHTML = "Loading...";
    forecast.innerHTML = "";

    try {
        // Find the city's coordinates
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        if (!geoResponse.ok) {
            throw new Error("Unable to search for the city.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Please try another city.");
        }

        const location = geoData.results[0];
        const latitude = location.latitude;
        const longitude = location.longitude;

        // Get current weather and 5-day forecast
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`
        );

        if (!weatherResponse.ok) {
            throw new Error("Unable to fetch weather data.");
        }

        const data = await weatherResponse.json();

        cityName.textContent = `${location.name}, ${location.country}`;

        currentInfo.innerHTML = `
            <p>🌡️ Temperature: ${data.current.temperature_2m} °C</p>
            <p>🌤️ Weather: ${getWeatherDescription(data.current.weather_code)}</p>
            <p>💨 Wind: ${data.current.wind_speed_10m} km/h</p>
        `;

        displayForecast(data.daily);

    } catch (err) {
        cityName.textContent = "Weather Dashboard";
        currentInfo.innerHTML = "";
        forecast.innerHTML = "";
        error.textContent = err.message;
    }
}

function displayForecast(daily) {
    forecast.innerHTML = "";

    for (let i = 0; i < daily.time.length; i++) {
        const day = document.createElement("div");
        day.className = "day";

        day.innerHTML = `
            <h3>${formatDate(daily.time[i])}</h3>
            <p>${getWeatherDescription(daily.weather_code[i])}</p>
            <p>⬆️ ${daily.temperature_2m_max[i]} °C</p>
            <p>⬇️ ${daily.temperature_2m_min[i]} °C</p>
        `;

        forecast.appendChild(day);
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);

    return date.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short"
    });
}

function getWeatherDescription(code) {
    const weatherCodes = {
        0: "☀️ Clear sky",
        1: "🌤️ Mainly clear",
        2: "⛅ Partly cloudy",
        3: "☁️ Overcast",
        45: "🌫️ Fog",
        48: "🌫️ Depositing rime fog",
        51: "🌦️ Light drizzle",
        53: "🌦️ Moderate drizzle",
        55: "🌧️ Dense drizzle",
        61: "🌦️ Light rain",
        63: "🌧️ Moderate rain",
        65: "🌧️ Heavy rain",
        71: "🌨️ Light snow",
        73: "🌨️ Moderate snow",
        75: "❄️ Heavy snow",
        80: "🌦️ Light rain showers",
        81: "🌧️ Moderate rain showers",
        82: "⛈️ Heavy rain showers",
        95: "⛈️ Thunderstorm"
    };

    return weatherCodes[code] || "🌤️ Unknown weather";
}

cityInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        getWeather();
    }
});
