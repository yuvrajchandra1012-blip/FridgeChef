# Workflow: FridgeChef Recipe Chatbot

## Objective
Let users get high-protein, high-fiber recipes from their available ingredients via a browser-based chatbot. Zero server cost to the developer — users supply their own AI API key.

## Inputs
- User-provided ingredient list (free text in the chat UI)
- User-provided API key (OpenAI or Groq) stored in browser localStorage

## Outputs
- 1–3 recipes per request with step-by-step instructions
- Macro breakdown per serving: Calories, Protein, Fiber, Carbs, Fat
- Conversational follow-ups work automatically (e.g. "make it vegan", "higher protein")

## Tools Used
None from `tools/` — this workflow runs entirely in the browser via vanilla JS.

## Key Architecture Decisions

**BYOK (Bring Your Own Key)**
Users paste their own OpenAI or Groq API key into a modal on first visit. The key is stored in `localStorage` and sent as a Bearer token directly from the browser to the provider's API. No key ever touches a server. This makes the app free to host and run indefinitely.

**Static site on GitHub Pages**
A single `web/index.html` file with no build step or dependencies. GitHub Pages serves it for free. Updates deploy automatically on every `git push` to `main`.

**Same code path for both providers**
OpenAI (`api.openai.com`) and Groq (`api.groq.com`) both use the `/v1/chat/completions` endpoint with identical request/response shape. One `callAPI()` function handles both; switching providers is just changing the base URL and model name.

**Full conversation history**
Every user + assistant turn is appended to a `messages[]` array in memory and sent with every request. This is what makes follow-up messages work — the model sees the full context without any extra code.

## API Endpoints

| Provider | Endpoint | Default Model |
|----------|----------|---------------|
| Groq | `https://api.groq.com/openai/v1/chat/completions` | `llama-3.3-70b-versatile` |
| OpenAI | `https://api.openai.com/v1/chat/completions` | `gpt-4o-mini` |

## Edge Cases & Error Handling

| Condition | Handling |
|-----------|----------|
| No API key on send | Opens the API key modal |
| 401 invalid key | Error bubble: "Your API key was rejected. Tap ⚙ to update it." |
| 429 rate limit | Error bubble: "You've hit the rate limit. Wait a moment and try again." |
| Network failure | Error bubble: "Couldn't reach the API. Check your internet connection." |
| 500 server error | Error bubble: "The AI provider returned an error. Try again in a moment." |
| Empty message | Blocked client-side before fetch |

Failed messages are removed from `state.messages` so the conversation stays consistent.

## Deployment (GitHub Pages)

```bash
git init
git add web/ workflows/
git commit -m "Initial FridgeChef app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/fridgechef.git
git push -u origin main
```

In the GitHub repo: **Settings → Pages → Branch: `main`, Folder: `/web` → Save.**

Live URL: `https://YOUR_USERNAME.github.io/fridgechef/`

## How to Extend

- **Add a provider** (Mistral, Together AI): add an entry to the `PROVIDERS` object — they all use the same endpoint format
- **Save a recipe**: add a clipboard copy button to assistant message bubbles
- **Calorie goal input**: add a number field that gets appended to the system prompt ("User's daily calorie target: Xkcal")
- **Dark/light toggle**: swap the CSS variable values on `document.documentElement`
- **Local model via Ollama**: point the base URL at `http://localhost:11434/v1/chat/completions` — same API shape
