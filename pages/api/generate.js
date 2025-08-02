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

  const parsed = PlanRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", issues: parsed.error.issues });
  }

  const { skills, budget, time, target } = parsed.data;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a helpful online income strategist." },
          { role: "user", content: `
            Create a clear, actionable 3-step plan to earn money online based on the following details:
            - Skills: ${skills}
            - Budget: ${budget}
            - Available time per day: ${time}
            - Daily income target: $${target}
            Provide practical, ethical advice with relevant tools or platforms.
          ` },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      return res.status(502).json({ error: "OpenAI API failure" });
    }

    const data = await response.json();
    const plan = data.choices?.[0]?.message?.content?.trim();

    if (!plan) {
      return res.status(500).json({ error: "No plan generated" });
    }

    return res.status(200).json({ plan });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
