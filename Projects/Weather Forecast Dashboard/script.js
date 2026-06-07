const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const cityInput = document.getElementById("cityInput");
const weatherContent = document.getElementById("weatherContent");
const forecastContainer = document.getElementById("forecastContainer");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();

  if (!city) {
    alert("Please enter a city name.");
    return;
  }

  getCoordinates(city);
});

cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

locationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      getWeather(
        position.coords.latitude,
        position.coords.longitude,
        "📍 Your Location"
      );
    },
    () => {
      alert("Unable to get your location.");
    }
  );
});

async function getCoordinates(city) {
  weatherContent.innerHTML = "<p>Loading weather data...</p>";
  forecastContainer.innerHTML = "";

  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
    );

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      weatherContent.innerHTML = "<p>City not found.</p>";
      return;
    }

    const location = data.results[0];

    const cityLabel = `${location.name}, ${location.country}`;

    getWeather(
      location.latitude,
      location.longitude,
      cityLabel
    );
  } catch (error) {
    console.error(error);
    weatherContent.innerHTML = "<p>Error fetching location data.</p>";
  }
}

async function getWeather(lat, lon, cityName) {
  weatherContent.innerHTML = "<p>Loading weather data...</p>";
  forecastContainer.innerHTML = "";

  try {
    const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
    );

    const data = await response.json();

    displayWeather(cityName, data);
  } catch (error) {
    console.error(error);
    weatherContent.innerHTML = "<p>Error fetching weather data.</p>";
  }
}
function getWeatherDescription(code) {
  const descriptions = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing Rime Fog",
    51: "Light Drizzle",
    53: "Moderate Drizzle",
    55: "Dense Drizzle",
    61: "Slight Rain",
    63: "Moderate Rain",
    65: "Heavy Rain",
    71: "Slight Snow",
    73: "Moderate Snow",
    75: "Heavy Snow",
    95: "Thunderstorm"
  };

  return descriptions[code] || "Unknown";
}

function displayWeather(cityName, data) {
  const temp = data.current.temperature_2m;
  const condition = getWeatherDescription(data.current.weather_code);

  let emoji = "☀️";

  if (temp < 15) {
    emoji = "❄️";
  } else if (temp < 25) {
    emoji = "⛅";
  }

  weatherContent.innerHTML = `
    <h3>${emoji} ${cityName}</h3>
    <p><strong>Temperature:</strong> ${temp}°C</p>
    <p><strong>Condition:</strong> ${condition}</p>
    <p><strong>Wind Speed:</strong> ${data.current.wind_speed_10m} km/h</p>
  `;

  forecastContainer.innerHTML = "";

  for (let i = 0; i < 5; i++) {
    const date = new Date(data.daily.time[i]);

    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short"
    });

    const card = document.createElement("div");
    card.className = "forecast-card";

    card.innerHTML = `
      <h3>${formattedDate}</h3>
      <p>Max: ${data.daily.temperature_2m_max[i]}°C</p>
      <p>Min: ${data.daily.temperature_2m_min[i]}°C</p>
    `;

    forecastContainer.appendChild(card);
  }
}