import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// Stream a reply: print each piece of text as Claude writes it, then
// wait for the complete message to get the token usage.
async function streamAnswer(question: string): Promise<void> {
  const stream = client.messages.stream({
    model: "claude-opus-5-5",
    max_tokens: 2048,
    messages: [{ role: "user", content: question }],
  });

  // "text" fires for every new piece of text. Write it without a newline
  // so the words appear one after another.
  stream.on("text", (textDelta) => {
    process.stdout.write(textDelta);
  });

  const finalMessage = await stream.finalMessage();
  console.log(
    `\n\n[tokens: ${finalMessage.usage.input_tokens} in / ${finalMessage.usage.output_tokens} out]`,
  );
}

await streamAnswer(
  "In three short paragraphs, explain how a weather forecast is made and why it gets less accurate further into the future.",
);
