import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// Prices in US dollars per million tokens (standard API rates).
// Check the current pricing page if these change.
const PRICES: Record<string, { input: number; output: number }> = {
  "claude-opus-5-5": { input: 4, output: 20 },
  "claude-sonnet-5-5": { input: 2, output: 10 },
  "claude-haiku-5-5": { input: 0.1, output: 0.5 },
};

// Print the token counts for one call and an estimated cost.
function printUsage(model: string, usage: Anthropic.Usage): void {
  const price = PRICES[model];
  const cost = price
    ? (usage.input_tokens * price.input + usage.output_tokens * price.output) / 1_000_000
    : undefined;

  console.log(
    `[${model}] ${usage.input_tokens} input + ${usage.output_tokens} output tokens` +
      (cost === undefined ? "" : ` ≈ $${cost.toFixed(6)}`),
  );
}

async function ask(model: string, question: string): Promise<void> {
  const message = await client.messages.create({
    model,
    max_tokens: 512,
    messages: [{ role: "user", content: question }],
  });

  for (const block of message.content) {
    if (block.type === "text") console.log(block.text);
  }
  printUsage(model, message.usage);
  console.log();
}

// Ask the same question to each model so you can compare the cost.
const question = "In one sentence, what is a weather front?";
await ask("claude-haiku-5-5", question);
await ask("claude-sonnet-5-5", question);
await ask("claude-opus-5-5", question);
