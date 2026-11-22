import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

const client = new Anthropic();

// The shape we want back from Claude. Zod checks the reply against it.
const WeatherReport = z.object({
  city: z.string(),
  temperature_f: z.number(),
  condition: z.string(),
  bring_umbrella: z.boolean(),
});

// Fetch the current weather for Austin (coordinates fixed to keep this short).
async function getRawAustinWeather(): Promise<string> {
  const url =
    "https://api.open-meteo.com/v1/forecast?latitude=30.26715&longitude=-97.74306" +
    "&current=temperature_2m,weather_code&temperature_unit=fahrenheit";
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Forecast failed: HTTP ${response.status}`);
  return JSON.stringify(await response.json());
}

const raw = await getRawAustinWeather();

// messages.parse asks Claude to reply in the schema and checks the result with Zod.
const message = await client.messages.parse({
  model: "claude-opus-5-5",
  max_tokens: 1024,
  messages: [
    {
      role: "user",
      content:
        "Turn this Open-Meteo data for Austin into a weather report. " +
        "The current weather code is a WMO code. Use a short plain-English " +
        "condition, such as 'sunny' or 'light rain'. Set bring_umbrella to true " +
        "only for rain, drizzle, showers, or storms.\n\n" +
        raw,
    },
  ],
  output_config: { format: zodOutputFormat(WeatherReport) },
});

const report = message.parsed_output;
if (!report) throw new Error("Claude's reply did not match the schema.");

console.log(report);
console.log(`Umbrella: ${report.bring_umbrella ? "yes" : "no"}`);
