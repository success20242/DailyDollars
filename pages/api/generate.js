import { z } from "zod";

const PlanRequestSchema = z.object({
  skills: z.string().min(1),
  budget: z.string().min(1),
  time: z.string().min(1),
  target: z.string().min(1),
  email: z.string().email(),
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Validate request body
  const parsed = PlanRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", issues: parsed.error.issues });
  }

  const { skills, budget, time, target } = parsed.data;

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "OpenAI API key not configured" });
  }

  try {
    const prompt = `
You are a helpful AI that generates personalized plans to help users earn money online.

Skills: ${skills}
Budget: ${budget}
Available Time Per Day: ${time}
Daily Income Target: ${target}

Generate a clear, actionable 3-step plan using legal, ethical, sustainable methods. Mention tools/websites.
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
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      console.error("OpenAI API error:", errorDetails);
      return res.status(response.status).json({ error: "OpenAI API error" });
    }

    const data = await response.json();
    const plan = data.choices?.[0]?.message?.content?.trim();

    if (!plan) {
      return res.status(500).json({ error: "Empty response from OpenAI" });
    }

    return res.status(200).json({ plan });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
