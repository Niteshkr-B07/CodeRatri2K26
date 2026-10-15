import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// In-memory rate limiting: max 15 requests per minute per IP
const requestCounts = new Map<string, { count: number; resetTime: number }>();
function rateLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = requestCounts.get(ip) || { count: 0, resetTime: now + 60000 };

  if (now > entry.resetTime) {
    entry.count = 1;
    entry.resetTime = now + 60000;
  } else {
    entry.count++;
  }
  requestCounts.set(ip, entry);

  if (entry.count > 25) {
    res.status(429).json({
      error: 'Rate limit exceeded. Please wait a minute before requesting more safety advice.',
    });
    return;
  }
  next();
}

const GUARDIAN_SYSTEM_INSTRUCTION = `You are "Guardian AI", a calm, supportive, and non-alarmist travel safety guide embedded in the SafeTrip mobile app.
Your mission is to help travelers, students, late-shift workers, and commuters navigate unfamiliar routes with practical, situational awareness tips.

CORE PRINCIPLES:
1. NEVER promise 100% safety or predict crime occurrences.
2. NEVER mention or accuse specific individuals, businesses, or ethnic communities.
3. Keep advice actionable, calm, and grounded (e.g. "Stay along well-trafficked main roads", "Share live journey link with a roommate or family member", "Avoid wearing noise-canceling headphones when walking late").
4. If an active emergency is described, IMMEDIATELY tell the user to dial 112 and tap the red SOS button. Do not engage in lengthy chit-chat during crises.
5. Answer concisely in 2 to 4 bullet points. Always maintain a calm, empowering tone.`;

app.post('/api/ai/guidance', rateLimiter, async (req: express.Request, res: express.Response) => {
  try {
    const { question, context } = req.body;
    if (!question || typeof question !== 'string') {
      res.status(400).json({ error: 'Question is required' });
      return;
    }

    if (question.length > 800) {
      res.status(400).json({ error: 'Question exceeds maximum character length' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      // Return smart structured fallback when API key is not yet set
      const fallbackAdvice = generateRuleBasedSafetyAdvice(question);
      res.json({ reply: fallbackAdvice, source: 'safety-rule-engine' });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });

    let userPrompt = question.trim();
    if (context && typeof context === 'string') {
      userPrompt = `User Context: ${context.slice(0, 200)}\n\nQuestion: ${userPrompt}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: GUARDIAN_SYSTEM_INSTRUCTION,
        temperature: 0.3,
        maxOutputTokens: 500,
      },
    });

    const reply = response.text || generateRuleBasedSafetyAdvice(question);
    res.json({ reply, source: 'gemini-2.5-flash' });
  } catch (error) {
    console.error('Gemini API Error:', error);
    // Graceful fallback message on failure (as specified in non-negotiable rules)
    const fallbackAdvice = generateRuleBasedSafetyAdvice(req.body?.question || '');
    res.json({ reply: fallbackAdvice, source: 'fallback' });
  }
});

function generateRuleBasedSafetyAdvice(question: string): string {
  const q = question.toLowerCase();

  if (q.includes('follow') || q.includes('danger') || q.includes('help') || q.includes('attack') || q.includes('threat')) {
    return `🚨 IMMEDIATE ACTION REQUIRED:\n• Tap the red SOS button right now or dial 112.\n• Move immediately into the nearest open store, hotel lobby, or populated area.\n• Alert your trusted contacts using the 1-tap SOS SMS in SafeTrip.`;
  }

  if (q.includes('late') || q.includes('night') || q.includes('walk')) {
    return `• Keep Trip Guardian active with a 10-15 minute check-in interval so your contacts receive your heartbeat.\n• Stay on well-lit primary avenues even if a dark alleyway is 2 minutes faster.\n• Keep one ear open — avoid noise-canceling headphones to stay alert to vehicles and foot traffic.\n• Have your phone in hand with the red SOS trigger accessible.`;
  }

  if (q.includes('cab') || q.includes('auto') || q.includes('taxi') || q.includes('uber')) {
    return `• Match the vehicle registration number and driver photo with your booking app before boarding.\n• Share your live trip link with a trusted contact as soon as you enter.\n• Sit in the rear passenger seat opposite the driver for maximum visibility and exit access.\n• Confirm child locks are disengaged and doors can open from inside.`;
  }

  if (q.includes('score') || q.includes('explain') || q.includes('rating')) {
    return `• Route safety scores are advisory indicators (0-100) reflecting verified community reports, lighting, and proximity to 24/7 assistance.\n• A lower score does not predict crime; it signals that caution (such as picking a main road or sharing your trip) is advised.\n• Scores never substitute for personal vigilance or trusting your intuition.`;
  }

  return `• Always share your live trip tracking link with a trusted contact before embarking on unfamiliar routes.\n• Verify battery levels before leaving; SafeTrip automatically attaches your battery level to emergency dispatches.\n• Stay on actively trafficked corridors and trust your instincts if any situation feels uncomfortable.\n• For any urgent threat, dial 112 immediately.`;
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'SafeTrip Backend Proxy' });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SafeTrip Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
