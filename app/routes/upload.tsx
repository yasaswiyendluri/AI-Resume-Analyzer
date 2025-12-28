import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "Upload Resume | AI Resume Analyzer" },
  ];
};

export default function Upload() {
  return (
    <main style={{ padding: "40px", textAlign: "center" }}>
      <h1>Upload Resume</h1>
      <p>This page will handle resume uploads.</p>
    </main>
  );
}
