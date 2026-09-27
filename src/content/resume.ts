// Professional content is sourced verbatim (or lightly condensed) from Neil's resume, plus project,
// stack, and availability details Neil has confirmed directly.
// Keep this file factual: do not add roles, employers, figures, or claims Neil hasn't confirmed.

export const profile = {
  name: "Neil Hutcheon",
  firstName: "Neil",
  title: "Senior Software Engineer",
  location: "Minneapolis, MN",
  email: "neil.hutcheon@gmail.com",
  availability: "Open to senior full-stack or platform roles, remote or hybrid in Minneapolis.",
  resume: "/neil-hutcheon-resume.pdf",
  github: "https://github.com/neilhutcheon",
  linkedin: "https://www.linkedin.com/in/neil-hutcheon-1a4a36182/",
  summary:
    "Senior Software Engineer with 5+ years of experience building production web applications and data/media pipelines, promoted from Junior Engineer to Senior Engineer through consistent technical growth. Specializes in React/Node, Python, AWS, and Terraform-managed infrastructure, with recent focus on ground-up architecture and technical leadership.",
} as const;

export const stats = [
  { value: "5+", label: "years shipping production software" },
  { value: "3", label: "production apps under my architecture" },
  { value: "3", label: "engineers mentored" },
  { value: "4", label: "roles, junior to senior, one company" },
] as const;

export const company = {
  name: "Curve10 LLC",
  blurb:
    "a software consultancy building for major research universities and for private and public companies",
} as const;

/** Canonical URL; social preview images need it to build absolute links. */
export const siteUrl = "https://neilhutcheon.dev";

/** Source of this site; the hobby toys link here as front-end work samples. */
export const siteRepo = "https://github.com/neilhutcheon/personal-site";

export type Role = {
  title: string;
  company: string;
  period: string;
  /** Climbing-grade flavor text shown on the route timeline. */
  grade: string;
  highlights: string[];
  clients?: { name: string; detail: string; project?: string }[];
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
        project: "jhrea",
      },
      {
        name: "University of Michigan",
        detail:
          "Architected a data pipeline for AI-driven analysis of classroom video, automatically generating teacher feedback while maintaining full FERPA compliance.",
        project: "umich",
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

export type Project = {
  /** Anchor id, e.g. #umich. */
  id: string;
  name: string;
  client: string;
  period?: string;
  problem: string;
  architecture: string[];
  stack: string[];
  result: string;
};

// Reason: no public usage figures yet, so results describe what shipped rather than invent numbers.
export const projects: Project[] = [
  {
    id: "umich",
    name: "FERPA-compliant classroom video AI",
    client: "University of Michigan",
    period: "2021 – Present",
    problem:
      "Researchers needed AI feedback for teachers from recorded classroom video, but the footage shows students, so it has to stay FERPA-compliant from the moment it lands.",
    architecture: [
      "Uploads land in S3 and trigger the pipeline.",
      "Faces are blurred first, on Paperspace GPUs, which cost less than equivalent AWS GPU instances.",
      "Only de-identified video moves on to transcription and AI analysis, which run as ECS tasks sized for cost efficiency.",
      "The analysis produces automated feedback for each teacher.",
    ],
    stack: ["Python", "AWS S3", "AWS ECS", "Paperspace"],
    result:
      "An active engagement since my first prototypes in 2021: teachers get automatic feedback on their classroom practice while student identities stay protected.",
  },
  {
    id: "dominus",
    name: "MGAM – Dominus Baseball",
    client: "MGAM",
    problem:
      "Fantasy baseball usually stops at picking players. Dominus simulates games from real-world performance data, so managers make decisions that play out like they would on a real club.",
    architecture: [
      "I architected it from the ground up and built all of the infrastructure.",
      "A serverless API sits in front of TimescaleDB, which stores the time-series player performance data the simulation runs on.",
      "A React front end on Node.js services.",
      "A feature-rich, real-time instant messaging system, built from scratch rather than bought.",
    ],
    stack: ["React", "Node.js", "TimescaleDB", "Serverless API", "Terraform"],
    result:
      "A ground-up platform I architected, one of the three production applications I own as senior engineer.",
  },
  {
    id: "jhrea",
    name: "JHREA agent insights",
    client: "JHREA",
    problem:
      "High-end real estate agents wanted buyer metrics and insights on their listings inside a social-media-style platform, plus something they could hand to clients.",
    architecture: [
      "Scheduled cron jobs on EC2, written in Bash and Python, pull in and digest real estate data.",
      "The digests feed a large React application.",
      "Python and Plotly generate downloadable one-sheets so agents get a digest for each of their properties.",
    ],
    stack: ["React", "Python", "Plotly", "Bash", "AWS EC2"],
    result:
      "A large-scale platform delivering buyer metrics to agents, with one-click property one-sheets they can share.",
  },
];

export const skillGroups = [
  { name: "Languages", items: ["TypeScript", "JavaScript", "Python", "Bash"] },
  { name: "Front end", items: ["React", "Next.js", "React Native", ".NET MAUI", "PWAs", "Three.js"] },
  { name: "Back end", items: ["Node.js", "Serverless APIs", "Real-time messaging", "Pandas", "Plotly"] },
  { name: "Databases", items: ["PostgreSQL", "TimescaleDB", "DynamoDB", "MongoDB"] },
  {
    name: "AWS",
    items: ["Lambda", "ECS", "EC2", "S3", "CloudFront", "SQS", "Step Functions", "VPC"],
  },
  { name: "Infrastructure", items: ["Terraform (multi-environment)", "Docker", "Linux", "GitHub Actions", "Git"] },
  { name: "Testing", items: ["Jest", "Playwright", "Vitest"] },
  { name: "AI tooling", items: ["Claude Code", "Cursor", "Google Antigravity", "AI video pipelines"] },
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
