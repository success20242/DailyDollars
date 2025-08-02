import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import NodeCache from "node-cache";
import fetch from "node-fetch";
import { z } from "zod";
import fs from "fs";
import path from "path";
import pdf from "html-pdf";

// === Setup ===
dotenv.config();
const app = express();
app.use(bodyParser.json());
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// === Env Vars ===
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const EMAILJS_USER_ID = process.env.EMAILJS_USER_ID;
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;

if (!OPENAI_API_KEY) console.warn("❗ OPENAI_API_KEY missing");

// === Input Validation ===
const PlanRequestSchema = z.object({
  skills: z.string().min(1),
  budget: z.string().min(1),
  time: z.string().min(1),
  target: z.string().min(1),
  email: z.string().email()
});

// === POST /generate ===
app.post("/generate", async (req, res) => {
  try {
    const parsed = PlanRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input", issues: parsed.error.issues });
    }

    const { skills, budget, time, target, email } = parsed.data;
    const cacheKey = JSON.stringify({ skills, budget, time, target });

    // Cache check
    let plan = cache.get(cacheKey);
    if (!plan) {
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
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            { role: "system", content: "You are a practical online income strategist." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7
        })
      });

      const data = await response.json();
      plan = data.choices?.[0]?.message?.content?.trim();
      if (!plan) throw new Error("OpenAI returned empty response");
      cache.set(cacheKey, plan);
    }

    // Generate PDF from HTML template
    const html = fs.readFileSync(path.join("templates", "plan-template.html"), "utf-8");
    const filledHtml = html.replace("{{plan}}", plan.replace(/\n/g, "<br>"));
    const outputPath = path.join("generated", `plan-${Date.now()}.pdf`);

    const pdfResult = await new Promise((resolve, reject) => {
      pdf.create(filledHtml).toFile(outputPath, (err, res) => {
        if (err) reject(err);
        else resolve(res.filename);
      });
    });

    // Send Email via EmailJS API
    await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_USER_ID,
        template_params: {
          to_email: email,
          message: `Here is your personalized income plan:\n\n${plan}`
        }
      })
    });

    return res.json({ success: true, message: "Plan sent to your email", pdf: outputPath });

  } catch (err) {
    console.error("❌ Error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// === Start Server ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server at http://localhost:${PORT}`));
