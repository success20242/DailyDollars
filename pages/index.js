// pages/index.js
import Head from "next/head";
import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    skills: "",
    budget: "",
    time: "",
    target: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResponse("");

    try {
      const res = await fetch("/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setResponse(data.message || "Plan generated successfully.");
      } else {
        setError(data.error || "An error occurred.");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Poverty Bye Bye - Planner</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container">
        <h1>💼 Income Plan Generator</h1>
        <form onSubmit={handleSubmit}>
          <label>
            Your Skills:
            <input type="text" name="skills" value={formData.skills} onChange={handleChange} required />
          </label>
          <label>
            Budget (USD):
            <input type="text" name="budget" value={formData.budget} onChange={handleChange} required />
          </label>
          <label>
            Time Available (per day):
            <input type="text" name="time" value={formData.time} onChange={handleChange} required />
          </label>
          <label>
            Daily Income Target (USD):
            <input type="text" name="target" value={formData.target} onChange={handleChange} required />
          </label>
          <label>
            Email Address:
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Generating..." : "Generate Plan"}
          </button>
        </form>
        {response && <div className="success">{response}</div>}
        {error && <div className="error">{error}</div>}
      </div>
    </>
  );
}
