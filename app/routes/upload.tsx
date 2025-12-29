import type { MetaFunction } from "react-router";
import { useState } from "react";
import { useNavigate } from "react-router";



export const meta: MetaFunction = () => {
  return [{ title: "Upload Resume | AI Resume Analyzer" }];
};

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDesc, setJobDesc] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);


  function handleAnalyze() {
  if (!file) {
    setError("Please upload your resume (PDF).");
    return;
  }

  if (!jobDesc.trim()) {
    setError("Please paste the job description.");
    return;
  }

  setError("");
  setLoading(true);

  // Simulate AI processing delay
  setTimeout(() => {
    setLoading(false);
    navigate("/results");
  }, 2000);
}


  return (
    <main style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Upload Resume</h1>

      <div style={{ marginTop: "20px" }}>
        <label>
          Resume (PDF only)
          <br />
          <input
            type="file"
            accept=".pdf"
            disabled={loading}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
/>

        </label>

        {file && (
          <p style={{ marginTop: "8px" }}>
            Selected file: <strong>{file.name}</strong>
          </p>
        )}
      </div>

      <div style={{ marginTop: "20px" }}>
        <label>
          Job Description
          <br />
          <textarea
            rows={6}
            style={{ width: "100%", marginTop: "8px" }}
            placeholder="Paste the job description here..."
            value={jobDesc}
            disabled={loading}
            onChange={(e) => setJobDesc(e.target.value)}
          />
        </label>
      </div>

      {error && (
        <p style={{ color: "red", marginTop: "16px" }}>
          {error}
        </p>
      )}

<button
  style={{ marginTop: "20px", padding: "10px 16px" }}
  onClick={handleAnalyze}
  disabled={loading}
>
  {loading ? "Analyzing..." : "Analyze Resume"}
</button>
      


    </main>
  );
}
