import Anthropic from "@anthropic-ai/sdk";
import { betaTool } from "@anthropic-ai/sdk/helpers/beta/json-schema";

const client = new Anthropic();

// Open-Meteo is free and needs no API key.
// Docs: https://open-meteo.com/en/docs
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

// Open-Meteo returns WMO weather codes. These are the groups we report.
function describeWeatherCode(code: number): string {
  if (code === 0) return "clear sky";
  if (code <= 3) return "partly cloudy";
  if (code <= 48) return "foggy";
  if (code <= 67) return "rainy";
  if (code <= 77) return "snowy";
  if (code <= 82) return "rain showers";
  if (code <= 86) return "snow showers";
  return "thunderstorms";
}

// Look up a city name to get its latitude and longitude.
async function findCity(city: string) {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(city)}&count=1`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Geocoding failed: HTTP ${response.status}`);

  const data = (await response.json()) as {
    results?: { name: string; country: string; latitude: number; longitude: number }[];
  };
  return data.results?.[0];
}

// Get the current temperature and conditions for a city.
async function getWeather(city: string): Promise<string> {
  const place = await findCity(city);
  if (!place) return JSON.stringify({ error: `City not found: ${city}` });

  const url =
    `${FORECAST_URL}?latitude=${place.latitude}&longitude=${place.longitude}` +
    `&current=temperature_2m,weather_code&temperature_unit=fahrenheit`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Forecast failed: HTTP ${response.status}`);

  const data = (await response.json()) as {
    current: { temperature_2m: number; weather_code: number };
  };

  return JSON.stringify({
    city: place.name,
    country: place.country,
    temperature_f: data.current.temperature_2m,
    condition: describeWeatherCode(data.current.weather_code),
  });
}

// Get a daily forecast (high, low, and conditions) for a city, up to 7 days.
async function getForecast(city: string, days: number): Promise<string> {
  const place = await findCity(city);
  if (!place) return JSON.stringify({ error: `City not found: ${city}` });

  const url =
    `${FORECAST_URL}?latitude=${place.latitude}&longitude=${place.longitude}` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
    `&temperature_unit=fahrenheit&timezone=auto&forecast_days=${days}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Forecast failed: HTTP ${response.status}`);

  const data = (await response.json()) as {
    daily: {
      time: string[];
      weather_code: number[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
    };
  };

  const daily = data.daily.time.map((date, i) => ({
    date,
    high_f: data.daily.temperature_2m_max[i],
    low_f: data.daily.temperature_2m_min[i],
    condition: describeWeatherCode(data.daily.weather_code[i]),
  }));

  return JSON.stringify({ city: place.name, country: place.country, daily });
}

// The tool definition: a name, a description, a JSON schema for the input,
// and the function the tool runner calls when Claude asks for it.
const weatherTool = betaTool({
  name: "get_weather",
  description: "Get the current temperature (Fahrenheit) and weather conditions for a city.",
  inputSchema: {
    type: "object",
    properties: {
      city: { type: "string", description: "The city to check, such as Austin" },
    },
    required: ["city"],
  },
  run: ({ city }) => getWeather(city),
});

const forecastTool = betaTool({
  name: "get_forecast",
  description: "Get the daily forecast (high, low, and conditions) for a city, up to 7 days.",
  inputSchema: {
    type: "object",
    properties: {
      city: { type: "string", description: "The city to check, such as Austin" },
      days: { type: "integer", description: "Number of days to forecast, from 1 to 7", minimum: 1, maximum: 7 },
    },
    required: ["city"],
  },
  run: ({ city, days }) => getForecast(city, days ?? 3),
});

// The tool runner handles the request, tool call, and result loop for us.
async function run(question: string): Promise<void> {
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: question }];

  const finalMessage = await client.beta.messages.toolRunner({
    model: "claude-opus-5-5",
    max_tokens: 2048,
    tools: [weatherTool, forecastTool],
    messages,
  });

  for (const block of finalMessage.content) {
    if (block.type === "text") console.log(block.text);
  }
}

await run("What's the temperature and weather conditions in Austin today?");
await run("What's the forecast for Austin for the next 3 days?");
