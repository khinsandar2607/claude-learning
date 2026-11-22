import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const agent = await client.beta.agents.create({
  name: "Line Counter",
  model: "claude-opus-5",
  system: "You are a helpful agent that completes small file tasks.",
  tools: [
    { type: "agent_toolset_20260401", default_config: { enabled: true } },
  ],
});

const environment = await client.beta.environments.create({
  name: "line-counter-env",
  config: {
    type: "cloud",
    networking: { type: "limited" },
  },
});

const session = await client.beta.sessions.create({
  agent: agent.id,
  environment_id: environment.id,
  title: "Count lines demo",
});

// Open the event stream first so no events are missed, then send the kickoff.
const stream = await client.beta.sessions.events.stream(session.id);

await client.beta.sessions.events.send(session.id, {
  events: [
    {
      type: "user.message",
      content: [
        {
          type: "text",
          text: "Create a file in the temp directory, count its lines, and report back.",
        },
      ],
    },
  ],
});

// Print Claude's text as it streams, show tool calls, and stop when the agent is done.
for await (const event of stream) {
  if (event.type === "agent.message") {
    for (const block of event.content) {
      if (block.type === "text") console.log(block.text);
    }
  } else if (event.type === "agent.tool_use") {
    console.log(`\n[tool] ${event.name}`);
  } else if (event.type === "session.status_idle") {
    console.log("\n--- Agent done ---");
    break;
  }
}
