import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
  return [{ title: "Analysis Result | AI Resume Analyzer" }];
};

export default function Results() {
  const result = {
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
  };

  return (
    <main
      style={{
        padding: "56px 24px",
        maxWidth: "900px",
        margin: "0 auto",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Page Header */}
      <header>
        <h1 style={{ fontSize: "30px", fontWeight: 600 }}>
          Resume Analysis
        </h1>
        <p style={{ marginTop: "8px", color: "#555", maxWidth: "600px" }}>
          Our AI analyzed your resume against the job description and
          identified strengths, gaps, and improvement areas.
        </p>
      </header>

      {/* Match Score */}
      <section
        style={{
          marginTop: "40px",
          padding: "32px",
          borderRadius: "16px",
          background: "linear-gradient(135deg, #2563eb, #1e3a8a)",
          color: "#fff",
        }}
      >
        <p style={{ fontSize: "14px", opacity: 0.9 }}>
          Resume Match Score
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "12px",
            marginTop: "12px",
          }}
        >
          <span style={{ fontSize: "52px", fontWeight: 700 }}>
            {result.score}%
          </span>
          <span style={{ fontSize: "16px", opacity: 0.9 }}>
            match with the role
          </span>
        </div>

        <p
          style={{
            marginTop: "16px",
            maxWidth: "520px",
            fontSize: "14px",
            lineHeight: 1.6,
            opacity: 0.95,
          }}
        >
          Your resume shows strong alignment with the role. Improving
          impact metrics and keyword optimization could further increase
          your chances.
        </p>
      </section>

      {/* Strengths */}
      <section
        style={{
          marginTop: "48px",
          padding: "28px",
          borderRadius: "14px",
          backgroundColor: "#f0fdf4",
          border: "1px solid #bbf7d0",
        }}
      >
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 600,
            color: "#065f46",
            marginBottom: "12px",
          }}
        >
          What’s working well
        </h2>

        <p style={{ color: "#065f46", marginBottom: "16px" }}>
          These areas strengthen your profile for this role:
        </p>

        <ul style={{ paddingLeft: "20px", lineHeight: 1.8 }}>
          {result.strengths.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </section>

      {/* Improvements */}
      <section
        style={{
          marginTop: "32px",
          padding: "28px",
          borderRadius: "14px",
          backgroundColor: "#fef2f2",
          border: "1px solid #fecaca",
        }}
      >
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 600,
            color: "#991b1b",
            marginBottom: "12px",
          }}
        >
          Suggested improvements
        </h2>

        <p style={{ color: "#991b1b", marginBottom: "16px" }}>
          Addressing these can significantly improve your match score:
        </p>

        <ul style={{ paddingLeft: "20px", lineHeight: 1.8 }}>
          {result.improvements.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </section>

      {/* Next Action */}
      <section
        style={{
          marginTop: "48px",
          textAlign: "center",
        }}
      >
        <p style={{ marginBottom: "16px", color: "#555" }}>
          Want to refine another resume or role?
        </p>

        <a
          href="/upload"
          style={{
            display: "inline-block",
            padding: "12px 24px",
            borderRadius: "10px",
            backgroundColor: "#2563eb",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          Analyze Another Resume
        </a>
      </section>
    </main>
  );
}
