import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "Login | AI Resume Analyzer" },
  ];
};

export default function Auth() {
  return (
    <main style={{ padding: "40px", textAlign: "center" }}>
      <h1>Authentication</h1>
      <p>This page will handle login.</p>
    </main>
  );
}
