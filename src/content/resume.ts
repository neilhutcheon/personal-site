// Professional content is sourced verbatim (or lightly condensed) from Neil's resume.
// Keep this file factual: do not add roles, employers, or claims that are not on the resume.

export const profile = {
  name: "Neil Hutcheon",
  firstName: "Neil",
  title: "Senior Software Engineer",
  location: "Minneapolis, MN",
  email: "neil.hutcheon@gmail.com",
  summary:
    "Senior Software Engineer with 5+ years of experience building production web applications and data/media pipelines, promoted from Junior Engineer to Senior Engineer through consistent technical growth. Specializes in React/Node, Python, AWS, and Terraform-managed infrastructure, with recent focus on ground-up architecture and technical leadership.",
} as const;

export const stats = [
  { value: "5+", label: "years shipping production software" },
  { value: "3", label: "production apps under my architecture" },
  { value: "3", label: "engineers mentored" },
  { value: "4", label: "roles, junior to senior, one company" },
] as const;

export type Role = {
  title: string;
  company: string;
  period: string;
  /** Climbing-grade flavor text shown on the route timeline. */
  grade: string;
  highlights: string[];
  clients?: { name: string; detail: string }[];
};

// Ordered newest first, matching the resume.
export const roles: Role[] = [
  {
    title: "Senior Software Engineer",
    company: "Curve10 LLC",
    period: "Early 2025 – Present",
    grade: "Crux",
    highlights: [
      "Mentor 3 engineers and own technical architecture across 3 production applications.",
      "Architected MGAM – Dominus Baseball from the ground up: a fantasy baseball platform simulating gameplay from real-world performance statistics for a near-real-life management experience.",
      "Leveraged agentic AI coding practices to build multiple in-house features that previously required paid SaaS subscriptions, reducing third-party dependency costs.",
      "Manage infrastructure-as-code using Terraform across all owned projects.",
    ],
  },
  {
    title: "Software Engineer",
    company: "Curve10 LLC",
    period: "2023 – Early 2025",
    grade: "Pumpy middle",
    highlights: [
      "Designed and shipped Progressive Web Applications and data/media pipelines for clients.",
      "Operated within agile methodologies to deliver work on schedule.",
      "Integrated and troubleshot SaaS tooling to resolve complex technical issues, ensuring seamless feature integration.",
    ],
    clients: [
      {
        name: "JHREA",
        detail:
          "A large-scale, social-media-style platform for high-end real estate agents, delivering buyer metrics and insights.",
      },
      {
        name: "University of Michigan",
        detail:
          "Architected a data pipeline for AI-driven analysis of classroom video, automatically generating teacher feedback while maintaining full FERPA compliance.",
      },
    ],
  },
  {
    title: "Junior Software Engineer (Full-Time)",
    company: "Curve10 LLC",
    period: "Late 2021 – 2023",
    grade: "Warm-up jugs",
    highlights: [
      "Worked under both a front-end and a back-end/architect engineer, learning to structure full-stack applications efficiently.",
      "Built foundational AWS skills later expanded into infrastructure ownership at the senior level.",
    ],
  },
  {
    title: "Junior Software Engineer (Part-Time)",
    company: "Curve10 LLC",
    period: "06/2021 – Late 2021",
    grade: "Start hold",
    highlights: [
      "Built early prototypes for the University of Michigan project, which remains an active client engagement today.",
    ],
  },
];

export const skills = [
  { name: "JavaScript", detail: "React, Node" },
  { name: "Python", detail: "Pandas, Plotly" },
  { name: "AWS" },
  { name: "Terraform" },
  { name: "Linux" },
  { name: "Git" },
  { name: "Docker" },
] as const;

export const focusAreas = [
  {
    title: "Production web apps",
    body: "React/Node applications and Progressive Web Apps built for real users at scale.",
  },
  {
    title: "Data & media pipelines",
    body: "Python pipelines, including AI-driven classroom video analysis with FERPA compliance.",
  },
  {
    title: "Infrastructure as code",
    body: "AWS environments managed end to end with Terraform across every project I own.",
  },
  {
    title: "Architecture & leadership",
    body: "Ground-up system design and mentoring a team of three engineers.",
  },
] as const;
