import type { MetaFunction } from "react-router";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";


export const meta: MetaFunction = () => {
  return [{ title: "Upload Resume | AI Resume Analyzer" }];
};

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDesc, setJobDesc] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

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
    setProgress(0);
  }

  // Fake AI progress simulation
  useEffect(() => {
  if (!loading) return;

  const interval = setInterval(() => {
    setProgress((prev) => {
      if (prev >= 100) {
        clearInterval(interval);
        navigate("/results", {
  state: {
    fileName: file?.name,
    jobDescription: jobDesc,
    analysis: {
      score: 72,
      strengths: [
        "Strong technical skills section",
        "Relevant project experience aligned with role",
        "Clear and readable resume structure",
      ],
      improvements: [
        "Add measurable achievements (numbers, impact)",
        "Strengthen the professional summary",
        "Tailor keywords more closely to the job description",
      ],
    },
  },
});

        return 100;
      }
      return prev + 2; // slower progress
    });
  }, 150); // ~7.5 seconds total

  return () => clearInterval(interval);
}, [loading, navigate, file, jobDesc]);


  return (
    <main style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Upload Resume</h1>

      {!loading && (
        <>
          <div style={{ marginTop: "20px" }}>
            <label>
              Resume (PDF only)
              <br />
              <input
                type="file"
                accept=".pdf"
                onChange={(e) =>
                  setFile(e.target.files?.[0] || null)
                }
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

        </>
      )}

      {/* Loading State */}
      {loading && (
  <div
    style={{
      marginTop: "60px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}
  >
    {/* New Heading */}
    <h2 style={{ marginBottom: "32px" }}>
      Analyzing Your Resume
    </h2>

    {/* Circular Loader */}
    <div
      style={{
        position: "relative",
        width: "160px",
        height: "160px",
      }}
    >
      <div
        style={{
          width: "160px",
          height: "160px",
          borderRadius: "50%",
          border: "12px solid #e5e7eb",
          borderTop: "12px solid #2563eb",
          animation: "spin 1s linear infinite",
        }}
      />

      {/* Percentage in center */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "28px",
          fontWeight: "bold",
          color: "#2563eb",
        }}
      >
        {progress}%
      </div>
    </div>

    {/* Status Text */}
    <p style={{ marginTop: "28px", fontSize: "16px" }}>
      {progress < 40 && "Parsing resume…"}
      {progress >= 40 && progress < 70 &&
        "Matching skills with job description…"}
      {progress >= 70 && "Generating insights…"}
    </p>

    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
    </style>
  </div>
)}


    </main>
  );
}
