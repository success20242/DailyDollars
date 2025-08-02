import { z } from "zod";
import { LRUCache } from "lru-cache";

const PlanRequestSchema = z.object({
  skills: z.string().min(1, "Skills is required"),
  budget: z.string().min(1, "Budget is required"),
  time: z.string().min(1, "Time is required"),
  target: z.string().min(1, "Target is required"),
  email: z.string().email("Invalid email format"),
});

// In-memory cache for storing generated plans
const cache = new Map();

const rateLimitWindowMs = 60 * 1000; // 1 minute
const maxRequestsPerWindow = 5;

// Correctly instantiate LRUCache
const rateLimiter = new LRUCache({
  max: 5000,      // max entries in cache
  ttl: rateLimitWindowMs,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Get client IP for rate limiting
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  if (!ip) {
    return res.status(400).json({ error: "Unable to identify client IP" });
  }

  // Rate limiting logic
  const currentCount = rateLimiter.get(ip) ?? 0;
  if (currentCount >= maxRequestsPerWindow) {
    return res.status(429).json({ error: "Too many requests, please try again later." });
  }
  rateLimiter.set(ip, currentCount + 1);

  // Validate input
  const parsed = PlanRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", issues: parsed.error.format() });
  }

  // Check cache first
  const cacheKey = JSON.stringify(parsed.data);
  if (cache.has(cacheKey)) {
    return res.status(200).json({ plan: cache.get(cacheKey) });
  }

  const { skills, budget, time, target } = parsed.data;

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "OpenAI API key not configured" });
  }

  try {
    const prompt = `
You are a helpful AI that generates personalized, legal, ethical, and sustainable online income plans.

Skills: ${skills}
Budget: ${budget}
Available Time Per Day: ${time}
Daily Income Target: ${target}

Generate a clear, actionable 3-step plan with recommended tools or websites.
`.trim();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a practical online income strategist." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      console.error("OpenAI API error:", errorDetails);
      return res.status(response.status).json({ error: "OpenAI API error", details: errorDetails });
    }

    const data = await response.json();
    const plan = data.choices?.[0]?.message?.content?.trim();

    if (!plan) {
      return res.status(500).json({ error: "Empty response from OpenAI" });
    }

    // Cache the plan
    cache.set(cacheKey, plan);

    return res.status(200).json({ plan });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
