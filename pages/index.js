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
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [pdfLink, setPdfLink] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    setPdfLink("");

    try {
      const res = await fetch("/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg("Plan sent to your email!");
        setPdfLink(data.pdf); // path to PDF on server
      } else {
        setErrorMsg(data.error || "Something went wrong");
      }
    } catch (err) {
      setErrorMsg("Network error");
    }
    setLoading(false);
  };

  return (
    <>
      <main className="container">
        <h1>💼 Personalized Income Plan Generator</h1>
        <form onSubmit={handleSubmit} className="form">
          <label>
            Skills (comma separated):
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Budget:
            <input
              type="text"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Available Time Per Day:
            <input
              type="text"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Daily Income Target:
            <input
              type="text"
              name="target"
              value={formData.target}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Generating..." : "Generate Plan"}
          </button>
        </form>

        {successMsg && (
          <div className="success">
            {successMsg}
            {pdfLink && (
              <p>
                📄{" "}
                <a href={pdfLink} target="_blank" rel="noopener noreferrer">
                  Download PDF
                </a>
              </p>
            )}
          </div>
        )}

        {errorMsg && <div className="error">{errorMsg}</div>}
      </main>

      <style jsx>{`
        .container {
          max-width: 480px;
          margin: 3rem auto;
          padding: 0 1rem;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
            sans-serif;
          color: #222;
        }
        h1 {
          text-align: center;
          margin-bottom: 2rem;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        label {
          display: flex;
          flex-direction: column;
          font-weight: 600;
          font-size: 0.9rem;
          color: #444;
        }
        input {
          margin-top: 0.4rem;
          padding: 0.5rem 0.75rem;
          font-size: 1rem;
          border: 1px solid #bbb;
          border-radius: 4px;
          transition: border-color 0.3s ease;
        }
        input:focus {
          border-color: #0070f3;
          outline: none;
        }
        button {
          margin-top: 1rem;
          padding: 0.75rem;
          background: #0070f3;
          color: white;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.25s ease;
        }
        button:disabled {
          background: #aaa;
          cursor: not-allowed;
        }
        .success {
          margin-top: 2rem;
          padding: 1rem;
          background-color: #daf5d8;
          border: 1px solid #7bc36a;
          color: #2e572e;
          border-radius: 5px;
          font-weight: 600;
        }
        .error {
          margin-top: 2rem;
          padding: 1rem;
          background-color: #f9d6d5;
          border: 1px solid #d66865;
          color: #8b2a27;
          border-radius: 5px;
          font-weight: 600;
        }
        a {
          color: #0070f3;
          text-decoration: underline;
        }
      `}</style>
    </>
  );
}
