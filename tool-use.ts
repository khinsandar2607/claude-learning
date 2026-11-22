// Two hardcoded lookups. In a real app, these would call a weather service.
const getWeather = (city) => `${city} today: 34F, snow flurries`;
const getForecast = (city) => `${city}, next three days: 38F, 45F, and 52F, sunny`;

const messages = [
  {
    role: "user",
    content:
      "I'm packing for a three-day trip to Denver. What's the weather today and over the next few days?",
  },
];

function runTool(name, input) {
  switch (name) {
    case "get_weather":
      return getWeather(input.city);
    case "get_forecast":
      return getForecast(input.city);
  }
}

while (true) {
  const response = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1024,
    messages,
    tools,
  });

  if (response.stop_reason !== "tool_use") {
    // Claude is done — this is the final answer
    for (const block of response.content) {
      if (block.type === "text") console.log(block.text);
    }
    break;
  }

  messages.push({ role: "assistant", content: response.content });

  const toolResults = response.content
    .filter((block) => block.type === "tool_use")
    .map((block) => ({
      type: "tool_result",
      tool_use_id: block.id,
      content: runTool(block.name, block.input),
    }));

  messages.push({ role: "user", content: toolResults });
}