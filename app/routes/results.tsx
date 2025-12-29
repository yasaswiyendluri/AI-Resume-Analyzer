import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
  return [{ title: "Analysis Result | AI Resume Analyzer" }];
};

export default function Results() {
  const result = {
    score: 72,
    strengths: [
      "Strong technical skills section",
      "Relevant project experience",
      "Clear and readable formatting",
    ],
    improvements: [
      "Add measurable achievements (numbers, impact)",
      "Improve professional summary",
      "Tailor resume keywords to job description",
    ],
  };

  return (
    <main
      style={{
        padding: "48px 24px",
        maxWidth: "900px",
        margin: "0 auto",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Page Title */}
      <h1 style={{ fontSize: "28px", fontWeight: 600 }}>
        Resume Analysis Report
      </h1>
      <p style={{ color: "#555", marginTop: "6px" }}>
        AI-powered evaluation based on your resume and job description
      </p>

      {/* Score Card */}
      <div
        style={{
          marginTop: "32px",
          padding: "32px",
          borderRadius: "14px",
          background: "linear-gradient(135deg, #2563eb, #1e40af)",
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 500 }}>
            Match Score
          </h2>
          <p style={{ marginTop: "6px", fontSize: "14px", opacity: 0.9 }}>
            How well your resume fits the role
          </p>
        </div>

        <div style={{ fontSize: "48px", fontWeight: 700 }}>
          {result.score}%
        </div>
      </div>

      {/* Strengths */}
      <section
        style={{
          marginTop: "40px",
          padding: "28px",
          borderRadius: "12px",
          backgroundColor: "#f0fdf4",
          border: "1px solid #bbf7d0",
        }}
      >
        <h3
          style={{
            fontSize: "20px",
            fontWeight: 600,
            color: "#065f46",
            marginBottom: "16px",
          }}
        >
          ✅ Key Strengths
        </h3>

        <ul style={{ paddingLeft: "20px", lineHeight: 1.8 }}>
          {result.strengths.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </section>

      {/* Improvements */}
      <section
        style={{
          marginTop: "28px",
          padding: "28px",
          borderRadius: "12px",
          backgroundColor: "#fef2f2",
          border: "1px solid #fecaca",
        }}
      >
        <h3
          style={{
            fontSize: "20px",
            fontWeight: 600,
            color: "#991b1b",
            marginBottom: "16px",
          }}
        >
          ⚠️ Areas to Improve
        </h3>

        <ul style={{ paddingLeft: "20px", lineHeight: 1.8 }}>
          {result.improvements.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <div style={{ marginTop: "40px", textAlign: "center" }}>
        <a
          href="/upload"
          style={{
            display: "inline-block",
            padding: "12px 20px",
            borderRadius: "8px",
            backgroundColor: "#2563eb",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          Analyze Another Resume
        </a>
      </div>
    </main>
  );
}
