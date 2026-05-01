const SYSTEM_PROMPT = `You are FridgeChef, a nutrition-focused cooking assistant. Your sole purpose is to help users make high-protein, high-fiber meals from ingredients they already have.

RULES:
1. When a user lists ingredients, respond with 1–3 recipes. Do not suggest recipes requiring major unlisted ingredients (pantry staples like salt, oil, spices are fine).
2. Every recipe MUST include a macro breakdown in this exact format on its own line:
   Macros per serving: Calories: X kcal | Protein: Xg | Fiber: Xg | Carbs: Xg | Fat: Xg
3. Prioritize recipes where protein ≥ 25g per serving AND fiber ≥ 5g per serving. If the user's ingredients can't hit these targets, pick the closest options and briefly note why.
4. Format each recipe exactly like this:

**Recipe Name** (X servings)
*Why it fits your goals:* one sentence.
**Ingredients:**
- amount + ingredient
**Instructions:**
1. Step one.
2. Step two.
Macros per serving: Calories: X kcal | Protein: Xg | Fiber: Xg | Carbs: Xg | Fat: Xg

5. For follow-up requests ("make it vegetarian", "simpler", "higher protein"), modify the last suggestion in the same format.
6. Keep tone friendly, direct, and fitness-focused. No fluff.
7. If the user sends a message that isn't about ingredients or recipes, respond: "I'm best at turning your ingredients into high-protein meals — what do you have in the fridge?"`;

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? null; // e.g. https://fridgechef.vercel.app
const MAX_MESSAGE_LENGTH = 2000; // characters per message

export default async function handler(req, res) {
  // CORS — restrict to your deployed domain in production
  const origin = req.headers.origin;
  if (ALLOWED_ORIGIN && origin !== ALLOWED_ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  } else if (!ALLOWED_ORIGIN) {
    // Dev mode: allow all origins
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body ?? {};

  // Validate messages array
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  // Validate each message: must have role + string content within length limit
  for (const msg of messages) {
    if (!msg || typeof msg.content !== 'string' || !['user', 'assistant'].includes(msg.role)) {
      return res.status(400).json({ error: 'Invalid message format' });
    }
    if (msg.content.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ error: `Message exceeds ${MAX_MESSAGE_LENGTH} character limit` });
    }
  }

  // Trim history to last 20 turns to cap token usage
  const trimmed = messages.slice(-20);

  const payload = {
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...trimmed
    ],
    temperature: 0.7,
    max_tokens: 1200
  };

  let groqRes;
  try {
    groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    return res.status(502).json({ error: 'Failed to reach Groq API' });
  }

  const data = await groqRes.json();

  if (!groqRes.ok) {
    // Return a sanitized error — don't leak Groq internals
    const safeStatus = [400, 429, 500, 503].includes(groqRes.status) ? groqRes.status : 500;
    return res.status(safeStatus).json({ error: 'AI provider error', status: safeStatus });
  }

  return res.status(200).json(data);
}
