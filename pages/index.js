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
    }
    setLoading(false);
  };

  const handleSendEmail = async () => {
    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        { ...form, message: result },
        process.env.NEXT_PUBLIC_EMAILJS_USER_ID
      );
      setSent(true);
    } catch (err) {
      setError('Failed to send email.');
    }
  };

  return (
    <>
      <Head>
        <title>DailyDollars</title>
        <link rel="icon" href="/favicon.ico" />
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
      </main>
    </>
  );
}
