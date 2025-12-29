import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
  return [{ title: "Analysis Result | AI Resume Analyzer" }];
};

export default function Result() {
  // Mock AI response
  const result = {
    score: 72,
    strengths: [
      "Strong technical skills section",
      "Relevant project experience",
      "Clear formatting",
    ],
    improvements: [
      "Add measurable achievements",
      "Improve summary section",
      "Tailor resume more to the job description",
    ],
  };

  return (
    <main style={{ padding: "40px", maxWidth: "700px", margin: "0 auto" }}>
      <h1>Resume Analysis Result</h1>

      <h2 style={{ marginTop: "20px" }}>
        Match Score: {result.score}%
      </h2>

      <section style={{ marginTop: "20px" }}>
        <h3>Strengths</h3>
        <ul>
          {result.strengths.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: "20px" }}>
        <h3>Improvements</h3>
        <ul>
          {result.improvements.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
