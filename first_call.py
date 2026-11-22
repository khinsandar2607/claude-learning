"""Your first Claude API call.

Reads ANTHROPIC_API_KEY from .env, sends one message, prints the reply.
"""

import anthropic
from dotenv import load_dotenv

load_dotenv(".env")  # puts ANTHROPIC_API_KEY into the environment

client = anthropic.Anthropic()  # picks up ANTHROPIC_API_KEY automatically

try:
    response = client.messages.create(
        model="claude-opus-5-5",
        max_tokens=16000,
        messages=[{"role": "user", "content": "Hello, Claude! Introduce yourself in one sentence."}],
    )
except anthropic.AuthenticationError:
    raise SystemExit("Invalid or missing API key - check ANTHROPIC_API_KEY in .env.")
except anthropic.RateLimitError:
    raise SystemExit("Rate limited - wait a moment and try again.")
except anthropic.APIStatusError as e:
    raise SystemExit(f"API error {e.status_code}: {e.message}")
except anthropic.APIConnectionError:
    raise SystemExit("Could not reach the API - check your internet connection.")

if response.stop_reason == "refusal":
    print("Claude declined this request.")
else:
    for block in response.content:
        if block.type == "text":
            print(block.text)

print(f"\n[tokens: {response.usage.input_tokens} in / {response.usage.output_tokens} out]")
