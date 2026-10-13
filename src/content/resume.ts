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
    "Senior Software Engineer with 5+ years of experience building production web applications and data/media pipelines, promoted from Junior Engineer to Senior Engineer through consistent technical growth. Specializes in React/Node, Python, AWS, and Terraform-managed infrastructure, with recent focus on ground-up architecture and technical leadership. Outside client work, I founded Descant LLC and built Descant, a marketplace connecting Twin Cities church music directors with freelance musicians.",
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
  /** Optional external link for the company, e.g. a business Neil runs. */
  url?: string;
  period: string;
  /** Climbing-grade flavor text shown on the route timeline. */
  grade: string;
  highlights: string[];
  clients?: { name: string; detail: string; project?: string }[];
};

// Ordered newest first, matching the resume.
export const roles: Role[] = [
  {
    title: "Founder & Engineer",
    company: "Descant LLC",
    url: "https://joindescant.com/info",
    period: "09/2026 – Present",
    grade: "My project",
    highlights: [
      "Founded Descant LLC and built Descant, a marketplace connecting Twin Cities church music directors with freelance musicians for services, holidays, weddings and concerts.",
      "Own it end to end: product, design, and engineering, from the React app and Supabase back end to Mapbox maps and Resend email. Live in a free pilot.",
    ],
    clients: [
      {
        name: "Descant",
        detail: "Problem, architecture, and how a gig gets filled, from post to booked ensemble.",
        project: "descant",
      },
    ],
  },
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
  /** Public link to the live product, shown as a button on the card. */
  url?: string;
  problem: string;
  architecture: string[];
  stack: string[];
  result: string;
};

// Reason: no public usage figures yet, so results describe what shipped rather than invent numbers.
export const projects: Project[] = [
  {
    id: "descant",
    name: "Descant",
    client: "Founder · Descant LLC",
    period: "2026 – Present",
    url: "https://joindescant.com/info",
    problem:
      "Twin Cities church music directors hire freelance musicians for services, weddings and concerts. Descant takes a gig from posted chairs to a booked ensemble with their parts.",
    architecture: [
      "Founded the company and built it end to end: product, design and engineering.",
      "React on Supabase (database, emailed sign-in links, file storage), hosted on Cloudflare.",
      "Mapbox shows gigs by distance; Resend sends bookings, alerts and reference requests.",
    ],
    stack: ["React", "Supabase", "PostgreSQL", "Mapbox", "Resend", "Cloudflare", "Sentry"],
    result: "Live at joindescant.com in a free pilot across the Twin Cities, run as my own company.",
  },
  {
    id: "umich",
    name: "FERPA-compliant classroom video AI",
    client: "University of Michigan",
    period: "2021 – Present",
    problem:
      "Researchers wanted AI feedback for teachers from classroom video, but the footage shows students, so it must stay FERPA-compliant from upload on.",
    architecture: [
      "Uploads land in S3; faces are blurred first on Paperspace GPUs, cheaper than AWS GPUs.",
      "Only de-identified video moves on to transcription and AI analysis on cost-sized ECS tasks.",
    ],
    stack: ["Python", "AWS S3", "AWS ECS", "Paperspace"],
    result: "Active since my 2021 prototypes: teachers get automatic feedback while student identities stay protected.",
  },
  {
    id: "dominus",
    name: "MGAM – Dominus Baseball",
    client: "MGAM",
    problem:
      "Fantasy baseball where owners run whole franchises and their teams play a full simulated game every day, built from players' real play-by-play.",
    architecture: [
      "A simulation engine plays each plate appearance from the batter's or pitcher's real events, adjusted with linear weights for defense and baserunning, and seeded so any game replays exactly.",
      "A nightly Step Functions pipeline imports real stats, fans each game out to its own Lambda worker through SQS, and releases scores on a schedule.",
      "A serverless Express API over PostgreSQL with TimescaleDB, a React front end, and Socket.IO league chat on Fargate.",
    ],
    stack: ["Node.js", "React", "PostgreSQL", "TimescaleDB", "AWS Lambda", "Step Functions", "Socket.IO", "Terraform"],
    result:
      "Architected from the ground up: five repos and about 144,000 lines, with every environment in Terraform. One of the three production apps I own.",
  },
  {
    id: "whiteflag",
    name: "WhiteFlag: C# sign-in, Xamarin to SuperTokens",
    client: "WhiteFlag",
    problem:
      "WhiteFlag's C# mobile app and ASP.NET API needed sign-in that would last through a move from Xamarin to .NET MAUI and, in 2026, the shutdown of Rownd, their sign-in provider.",
    architecture: [
      "Implemented the original Rownd sign-in in C#, then ported it from Xamarin to .NET MAUI.",
      "When Rownd shut down, stayed on .NET 9 rather than take a beta wrapper that needed .NET 10: a Node auth server on supertokens-node, codes by text via Twilio, on ECS Fargate.",
      "The API verifies SuperTokens tokens and the app gets native sign-in screens; users keep their Rownd IDs, so no data changes.",
    ],
    stack: ["C#", ".NET MAUI", "Xamarin", "ASP.NET", "Node.js", "SuperTokens", "Twilio", "AWS Fargate", "Claude Code"],
    result:
      "I've owned WhiteFlag's sign-in from Xamarin to MAUI to SuperTokens. The final move reached production about a week after the go decision, with Claude Code doing the hands-on work under my direction.",
  },
  {
    id: "jhrea",
    name: "JHREA agent insights",
    client: "JHREA",
    problem:
      "High-end real estate agents wanted buyer metrics on their listings in a social-style platform, plus something to hand clients.",
    architecture: [
      "Bash and Python cron jobs on EC2 digest real estate data for a large React app.",
      "Python and Plotly generate a downloadable one-sheet for each property.",
    ],
    stack: ["React", "Python", "Plotly", "Bash", "AWS EC2"],
    result: "Buyer metrics for agents, with one-click property one-sheets they can share.",
  },
];

export const skillGroups = [
  { name: "Languages", items: ["TypeScript", "JavaScript", "Python", "C#", "Bash"] },
  { name: "Front end", items: ["React", "Next.js", "React Native", ".NET MAUI", "Xamarin", "PWAs", "Three.js", "Mapbox"] },
  { name: "Back end", items: ["Node.js", "ASP.NET", "Supabase", "Serverless APIs", "Real-time messaging", "Resend", "Pandas", "Plotly"] },
  { name: "Databases", items: ["PostgreSQL", "TimescaleDB", "DynamoDB", "MongoDB"] },
  {
    name: "AWS",
    items: ["Lambda", "ECS", "EC2", "S3", "CloudFront", "SQS", "Step Functions", "VPC"],
  },
  { name: "Infrastructure", items: ["Terraform (multi-environment)", "Docker", "Cloudflare", "Linux", "GitHub Actions", "Git"] },
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
