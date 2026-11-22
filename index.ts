import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const msg = await client.messages.create({
  model: "claude-sonnet-5",
  max_tokens: 2048,
  messages: [{
    role: "user",
    content: "Hello, Claude",
  }],
});

console.log(msg.content);
