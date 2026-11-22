import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const models = [
  "claude-haiku-5-5",
  "claude-sonnet-5-5",
  "claude-opus-5-5",
];

const prompt = "Hello";

for (const model of models) {
  const response = await client.messages.create({
    model,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  console.log("\nModel:", model);
  console.log("Usage:", response.usage);

  for (const block of response.content) {
    if (block.type === "text") {
      console.log("Response:", block.text);
    }
  }
}