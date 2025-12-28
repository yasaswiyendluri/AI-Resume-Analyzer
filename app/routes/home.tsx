import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "AI Resume Analyzer" },
    { name: "description", content: "Analyze resumes using AI" },
  ];
};

export default function Home() {
  return (
    <main style={{ padding: "40px", textAlign: "center" }}>
      <h1>AI Resume Analyzer</h1>
      <p>Smart feedback for your dream job.</p>
    </main>
  );
}
