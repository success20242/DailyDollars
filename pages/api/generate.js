import { z } from "zod";

// Define validation schema
const PlanRequestSchema = z.object({
  skills: z.string().min(1),
  budget: z.string().min(1),
  time: z.string().min(1),
  target: z.string().min(1),
  email: z.string().email()
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Validate input
  const parsed = PlanRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", issues: parsed.error.issues });
  }

  const { skills, budget, time, target, email } = parsed.data;

  // For now, send a simple plan response to test the flow
  const plan = `Based on your skills (${skills}), budget (${budget}), and available time (${time}), we recommend daily tasks to meet your $${target} goal. An email will be sent to ${email} shortly.`;

  res.status(200).json({ plan });
}
