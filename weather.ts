import Anthropic from "@anthropic-ai/sdk";
import { betaTool } from "@anthropic-ai/sdk/helpers/beta/json-schema";

const client = new Anthropic();

// Fake weather data for practice. A real app would call a weather API here.
function getWeather(city: string): string {
  return JSON.stringify({ city, temperature_f: 95, condition: "sunny" });
}

// The tool definition: a name, a description, a JSON schema for the input,
// and the function the tool runner calls when Claude asks for it.
const weatherTool = betaTool({
  name: "get_weather",
  description: "Get the current weather for a city.",
  inputSchema: {
    type: "object",
    properties: {
      city: { type: "string", description: "The city to check" },
    },
    required: ["city"],
  },
  run: ({ city }) => getWeather(city),
});

// The tool runner handles the request, tool call, and result loop for us.
async function run(question: string): Promise<void> {
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: question }];

  const finalMessage = await client.beta.messages.toolRunner({
    model: "claude-opus-5-5",
    max_tokens: 2048,
    tools: [weatherTool],
    messages,
  });

  for (const block of finalMessage.content) {
    if (block.type === "text") console.log(block.text);
  }
}

await run("What's the temperature and weather conditions in Austin today?");
