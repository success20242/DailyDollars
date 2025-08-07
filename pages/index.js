import React, { useState } from 'react';
import Head from 'next/head';
import emailjs from 'emailjs-com';
import generatePDF from '../utils/generatePDF';

export default function Home() {
  const [form, setForm] = useState({
    skills: '',
    budget: '',
    time: '',
    target: '',
    email: '',
  });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setSent(false);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setResult(data.plan);
    } catch (err) {
      setError('Failed to generate. Try again.');
      console.error('Generate error:', err);
    }
    setLoading(false);
  };

  const handleSendEmail = async () => {
    setError('');
    setSent(false);
    try {
      console.log("Sending email with message:", result);
      const response = await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        { ...form, message: result },
        process.env.NEXT_PUBLIC_EMAILJS_USER_ID
      );
      console.log("EmailJS response:", response);
      setSent(true);
    } catch (err) {
      console.error("Email send error:", err);
      setError('Failed to send email.');
    }
  };

  return (
    <>
      <Head>
        <title>DailyDollars - Smart Income Strategy Generator</title>
        <meta name="description" content="DailyDollars helps you generate a personalized income strategy based on your skills, time, and goals." />
        <meta name="google-site-verification" content="G68a3mRZtGTDKcAOHvC2YFHpGavV38TRiQCNQgH2rE0" />
        <meta name="keywords" content="income planner, budget, daily income, side hustle, make money, productivity tool" />
        <meta name="author" content="DailyDollars Team" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />

        {/* Open Graph Meta */}
        <meta property="og:title" content="DailyDollars - Smart Income Strategy Generator" />
        <meta property="og:description" content="Plan your daily income strategy with AI based on your skillset, time, and goals." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://daily-dollars.vercel.app/" />
        <meta property="og:image" content="https://i.imgur.com/0NqbqpD.png" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DailyDollars" />
        <meta name="twitter:description" content="Generate your income strategy daily with AI." />
        <meta name="twitter:image" content="https://i.imgur.com/0NqbqpD.png" />

        {/* JSON-LD Schema */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "DailyDollars",
            "url": "https://daily-dollars.vercel.app/",
            "description": "Generate a daily income plan tailored to your skills and budget.",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "All",
            "browserRequirements": "Requires JavaScript",
            "logo": "https://i.imgur.com/0NqbqpD.png"
          }
        ` }} />
      </Head>

      <main className="container">
        <h1>💼 DailyDollars</h1>
        <p className="tagline">Plan your income strategy and reach your goals.</p>

        <div className="form-grid">
          <input name="skills" placeholder="Your Skills" value={form.skills} onChange={handleChange} />
          <input name="budget" placeholder="Budget (e.g., low)" value={form.budget} onChange={handleChange} />
          <input name="time" placeholder="Time/Day (e.g., 2 hours)" value={form.time} onChange={handleChange} />
          <input name="target" placeholder="Daily Target ($)" value={form.target} onChange={handleChange} />
          <input name="email" placeholder="Your Email" value={form.email} onChange={handleChange} />
        </div>

        <button onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Plan'}
        </button>

        {error && <p className="error">{error}</p>}

        {result && (
          <div className="result">
            <h2>📄 Your Plan Preview</h2>
            <pre>{result}</pre>
            <div className="actions">
              <button onClick={() => generatePDF(result)}>📥 Download PDF</button>
              <button onClick={handleSendEmail}>📧 Send to Email</button>
            </div>
            {sent && <p className="success">✅ Email sent successfully!</p>}
          </div>
        )}

        {/* Footer with Privacy Policy and Terms */}
        <footer style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>
          <p>
            <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> |{" "}
            <a href="/terms-of-service" target="_blank" rel="noopener noreferrer">Terms of Service</a>
          </p>
          <p style={{ marginTop: '0.5rem' }}>© 2025 DailyDollars. All rights reserved.</p>
        </footer>
      </main>
    </>
  );
}
