import { describe, expect, it } from "vitest";
import { analyzeResume, extractJobKeywords, stem } from "./analyzeResume";
import { parseAiJson } from "./aiReview";

const JD = `We are hiring a Frontend Engineer to build web applications with React and TypeScript.
You will write unit tests with Jest, work with REST APIs and GraphQL, and deploy on AWS using Docker.
Experience with Next.js and Tailwind CSS is a plus. Strong communication and collaboration skills.
You will build accessible, performant user interfaces and collaborate on design systems.`;

const STRONG_RESUME = `Jane Doe
jane.doe@example.com | +1 (555) 123-4567 | linkedin.com/in/janedoe | github.com/janedoe

SUMMARY
Frontend engineer with 5 years building fast, accessible web apps.

EXPERIENCE
Senior Frontend Engineer, Acme Corp — 2021 - Present
• Built a React and TypeScript design system used by 40 engineers across 6 teams
• Reduced page load time by 45% by migrating to Next.js with server components
• Led migration of 120 REST API endpoints to GraphQL, cutting payload size by 30%
• Shipped Docker-based preview deployments on AWS, saving 10 hours per week of QA time
• Improved accessibility to WCAG AA, increasing Lighthouse score from 62 to 98
Frontend Engineer, Beta Inc — 2019 - 2021
• Developed 25+ user interfaces with Tailwind CSS and React for 200k monthly users
• Wrote Jest unit tests raising coverage from 40% to 85%

PROJECTS
• Created an open-source React hooks library with 2,000 GitHub stars

EDUCATION
B.S. Computer Science, State University

SKILLS
React, TypeScript, JavaScript, Next.js, GraphQL, Jest, Docker, AWS, Tailwind CSS, Communication, Collaboration`;

const WEAK_RESUME = `John Smith
EXPERIENCE
Worked on various websites. I was responsible for fixing bugs.
I am a hard worker and team player.
EDUCATION
Some College`;

describe("stem", () => {
  it("collapses common suffixes", () => {
    expect(stem("deployed")).toBe(stem("deploy"));
    expect(stem("applications")).toBe(stem("application"));
  });
});

describe("extractJobKeywords", () => {
  it("finds known skills with canonical labels", () => {
    const labels = extractJobKeywords(JD).map((k) => k.label);
    for (const s of ["React", "TypeScript", "Jest", "GraphQL", "AWS", "Docker", "Next.js", "Tailwind CSS"]) {
      expect(labels).toContain(s);
    }
  });

  it("does not treat generic job-post words as keywords", () => {
    const labels = extractJobKeywords(JD).map((k) => k.label.toLowerCase());
    for (const noise of ["experience", "strong", "skills", "will", "plus"]) {
      expect(labels).not.toContain(noise);
    }
  });
});

describe("analyzeResume", () => {
  it("scores a tailored resume highly", () => {
    const r = analyzeResume(STRONG_RESUME, JD);
    expect(r.score).toBeGreaterThanOrEqual(75);
    expect(r.contact).toEqual({ email: true, phone: true, linkedin: true, portfolio: true });
    expect(r.sections.filter((s) => s.found).map((s) => s.id)).toEqual(
      expect.arrayContaining(["summary", "experience", "education", "skills", "projects"])
    );
    expect(r.stats.quantifiedBullets).toBeGreaterThanOrEqual(6);
    expect(r.missingKeywords.filter((k) => k.kind === "hard")).toEqual([]);
  });

  it("scores a weak resume low and explains why", () => {
    const r = analyzeResume(WEAK_RESUME, JD);
    expect(r.score).toBeLessThan(40);
    expect(r.stats.weakPhrases).toEqual(expect.arrayContaining(["responsible for", "worked on", "team player"]));
    expect(r.improvements.some((i) => i.priority === "high")).toBe(true);
    expect(r.missingKeywords.map((k) => k.label)).toContain("React");
  });

  it("uses whole-word matching (Java is not JavaScript)", () => {
    const r = analyzeResume("Skills: JavaScript, React", "Looking for a Java developer with Java and Spring Boot.");
    expect(r.missingKeywords.map((k) => k.label)).toContain("Java");
  });

  it("matches skill aliases (k8s → Kubernetes, Postgres → PostgreSQL)", () => {
    const r = analyzeResume("Ran services on k8s backed by Postgres.", "Kubernetes and PostgreSQL required.");
    expect(r.matchedKeywords.map((k) => k.label)).toEqual(expect.arrayContaining(["Kubernetes", "PostgreSQL"]));
  });

  it("does not mistake a date range for a phone number", () => {
    const r = analyzeResume("Engineer at Foo 2019 - 2023", "React");
    expect(r.contact.phone).toBe(false);
  });

  it("keeps all scores within 0–100", () => {
    const r = analyzeResume("", "");
    expect(r.score).toBeGreaterThanOrEqual(0);
    for (const c of r.categories) {
      expect(c.score).toBeGreaterThanOrEqual(0);
      expect(c.score).toBeLessThanOrEqual(100);
    }
  });
});

describe("parseAiJson", () => {
  it("parses fenced JSON and clamps values", () => {
    const out = parseAiJson('Here you go:\n```json\n{"score": 120, "summary": "ok", "strengths": ["a", 3], "gaps": [], "bulletRewrites": [{"original": "x", "improved": "y"}, {"bad": 1}], "tailoredSummary": "t"}\n```');
    expect(out.score).toBe(100);
    expect(out.strengths).toEqual(["a"]);
    expect(out.bulletRewrites).toEqual([{ original: "x", improved: "y" }]);
  });

  it("throws on non-JSON responses", () => {
    expect(() => parseAiJson("Sorry, I can't help")).toThrow();
  });
});
