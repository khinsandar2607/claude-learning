**English** | [日本語](README.ja.md)

# Claude API Learning Project

Scripts from the Claude Platform 101 course, in TypeScript and Python. Each file is a small, separate example.

## Setup

### 1. Add your API key

Create a file named `.env` in this folder with your key from [console.anthropic.com](https://console.anthropic.com/settings/keys):

```
ANTHROPIC_API_KEY=sk-ant-...
```

`.env` is listed in `.gitignore`, so it's never committed. Don't paste the key into code or share it.

### 2. Install the TypeScript dependencies

Requires Node.js 18 or newer.

```bash
npm install
```

### 3. Install the Python dependencies (optional)

Only needed for the `.py` files.

```bash
python3.13 -m venv .venv
source .venv/bin/activate
pip install anthropic python-dotenv
```

## Running the scripts

TypeScript files use Node's built-in `--env-file` flag to load `.env`:

```bash
node --env-file=.env <file>.ts
```

| File | What it does |
|---|---|
| `index.ts` | Your first API call: sends one message and prints the reply. |
| `models.ts` | Sends the same message to Haiku, Sonnet, and Opus and prints each usage report. |
| `review.ts` | Asks Claude to review a piece of code. |
| `tool-use.ts` | Tool-use loop with hardcoded Denver weather. Work in progress: `client` and `tools` aren't defined yet, so it doesn't run. |
| `weather.ts` | Live weather: asks about current conditions and a 3-day forecast for Austin, using Open-Meteo. |
| `structured-weather.ts` | Returns a weather report in a fixed shape, checked with Zod. |
| `streaming.ts` | Prints the answer as it arrives, word by word. |
| `cost-display.ts` | Shows token counts and estimated cost for each model. |
| `managed-agent.ts` | Creates a Managed Agent and session. This is beta and costs money per session. |

Python files run with:

```bash
python agent-loops.py   # tool-use loop, with an example weather tool
python first_call.py    # first API call in Python
```

Activate `.venv` before running Python files.

## Notes

- `weather.ts` uses [Open-Meteo](https://open-meteo.com/), which is free and needs no key.
- `managed-agent.ts` creates a new agent and environment every time it runs. They stay in your account until you delete them.
