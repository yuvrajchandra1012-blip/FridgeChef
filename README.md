# 🥗 FridgeChef

**Turn whatever's in your fridge into high-protein, high-fiber meals — instantly.**

FridgeChef is an AI-powered recipe chatbot built for students and fitness enthusiasts. Type in the ingredients you have, and it generates practical, macro-tracked recipes optimised for protein and fiber. No sign-up, no subscriptions, no fluff.

🔗 **Live app:** [fridgechef-silk.vercel.app](https://fridgechef-silk.vercel.app)

---

## Features

- **Ingredient-first recipes** — paste whatever you have, get 1–3 recipes built around it
- **Macro breakdown** — every recipe includes calories, protein, fiber, carbs, and fat per serving
- **Conversational** — follow up with "make it vegan", "higher protein", or "simpler version"
- **No account needed** — open the link and start cooking
- **Free to use** — powered by Groq's Llama 3.3 70B

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML/CSS/JS (single file, no build step) |
| Backend | Vercel Serverless Function (Node.js) |
| AI | Groq API — Llama 3.3 70B |
| Hosting | Vercel (free tier) |

---

## Deploy Your Own Instance

Want to run your own copy? It's free and takes about 5 minutes.

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/fridgechef.git
cd fridgechef
```

### 2. Get a free Groq API key
Sign up at [console.groq.com](https://console.groq.com) → API Keys → Create key. No credit card needed.

### 3. Install and deploy with Vercel
```bash
npm install -g vercel
vercel
vercel env add GROQ_API_KEY        # paste your Groq key, select Production
vercel env add ALLOWED_ORIGIN      # paste your Vercel URL, e.g. https://fridgechef-xyz.vercel.app
vercel --prod
```

That's it — your instance is live.

---

## Project Structure

```
api/
  chat.js           # Serverless function — holds your API key, calls Groq
public/
  index.html        # Complete frontend (HTML + CSS + JS)
workflows/
  recipe_chatbot.md # Architecture and design decisions
vercel.json         # Vercel config
```

---

## How It Works

1. User types ingredients into the chat
2. The frontend sends the conversation history to `/api/chat`
3. The serverless function injects a fitness-focused system prompt and calls Groq
4. Groq's Llama 3.3 70B generates recipes with macro breakdowns
5. The response is rendered back in the chat

Your API key never touches the frontend — it lives only in Vercel's encrypted environment variables.

---

## Roadmap

- [ ] Make it more refined 
- [ ] Would love your suggestions :)
---

## Built By

**Yuvraj** — student, fitness enthusiast, builder.

If this helped you eat better, give it a ⭐
