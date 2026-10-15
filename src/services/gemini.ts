/**
 * SafeTrip Client AI Service
 * Connects to the server-side Gemini AI proxy route.
 * Keeps keys off the client and provides instant fallback.
 */

export interface AIResponse {
  reply: string;
  source: 'gemini-2.5-flash' | 'safety-rule-engine' | 'fallback';
}

export async function askGuardianAI(question: string, context?: string): Promise<AIResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

    const res = await fetch('/api/ai/guidance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question, context }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      reply: data.reply || 'Stay alert, stay on well-trafficked main paths, and remember you can call 112 at any moment.',
      source: data.source || 'fallback',
    };
  } catch {
    // Client-side instant graceful fallback without failing
    return {
      reply: `• SafeTrip Advisory: Always keep Trip Guardian active when traveling after dark.\n• Share your live tracking link with a trusted contact before starting out.\n• If you feel uncomfortable or unsafe at any moment, tap the red SOS button or dial 112 immediately.`,
      source: 'fallback',
    };
  }
}
