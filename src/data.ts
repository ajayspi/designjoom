// Single source of truth for profile content.
// Rule: no Rosh Elevators content in any section. Card copy matches verified sources only.

export const P = {
  blue: "#3b82f6",
  violet: "#7c3aed",
  cyan: "#06b6d4",
  green: "#10b981",
  amber: "#f59e0b",
  pink: "#ec4899",
  teal: "#14b8a6",
  orange: "#f97316",
  slate: "#64748b",
};

export const ROLES = [
  "AI Growth Leader",
  "Digital Transformation Lead",
  "AI Strategy & Growth Innovation Leader",
  "AI Workflow Architect",
  "Growth Marketing Expert",
];

export const CRAWL_ITEMS = [
  "AI GROWTH LEADER", "·", "DIGITAL TRANSFORMATION", "·", "UX STRATEGY", "·",
  "14+ YEARS", "·", "GOOGLE", "·", "180%+ ORGANIC GROWTH", "·", "AI PRODUCT DEVELOPMENT", "·",
  "DUBAI · ABU DHABI · UAE", "·", "60,900+ VIDEO VIEWS", "·", "PROMPT ENGINEERING", "·",
  "DESIGN SYSTEMS", "·", "LLM WORKFLOWS", "·",
];

export const GROWTH_DATA = [
  { year: "2013", growth: 8, users: 120 },
  { year: "2015", growth: 24, users: 340 },
  { year: "2017", growth: 45, users: 620 },
  { year: "2018", growth: 72, users: 890 },
  { year: "2019", growth: 105, users: 1200 },
  { year: "2020", growth: 138, users: 1680 },
  { year: "2021", growth: 162, users: 2100 },
  { year: "2022", growth: 180, users: 2534 },
];

export const PROJECT_IMPACT = [
  { name: "IR4U", views: 60.9, users: 2.5, clicks: 0.43 },
  { name: "Vigilare", views: 33.2, users: 14, clicks: 0 },
  { name: "Pro Studio X", views: 12, users: 0.8, clicks: 0 },
  { name: "Recytronics", views: 8, users: 1.2, clicks: 0 },
  { name: "eRevival", views: 5, users: 0.6, clicks: 0 },
  { name: "Prec. Jewels", views: 9, users: 1.1, clicks: 0 },
];

export const SKILLS_RADAR = [
  { skill: "AI & Automation", value: 92 },
  { skill: "Growth / SEO", value: 90 },
  { skill: "UX Strategy", value: 86 },
  { skill: "Product", value: 82 },
  { skill: "Analytics", value: 88 },
  { skill: "Leadership", value: 84 },
];

export const FUNNEL_DATA = [
  { stage: "Impressions", value: 51700, color: P.blue },
  { stage: "Page Views", value: 4300, color: P.cyan },
  { stage: "Active Users", value: 2513, color: P.violet },
  { stage: "Conversions", value: 433, color: P.green },
];

export interface Experience {
  role: string;
  company: string;
  period: string;
  location: string;
  bullets: string[];
  color: string;
}

export const EXPERIENCE: Experience[] = [
  {
    role: "Growth Leader / AI Growth & Digital Strategy Lead",
    company: "DIGIT AI",
    period: "Dec 2025 – Present",
    location: "Hyderabad, India",
    bullets: [
      "Lead growth strategy across AI, SEO, social media, content, UX, performance marketing and automation.",
      "Manage a 6-member multidisciplinary team covering graphic design, content creation and social media.",
      "Dr. Gopichand: +99% website traffic, +93% new users, 1,500+ users during reported period.",
      "Dr. Khalilullah: 1,400+ users; 1,100+ new users; 1,900+ service/information page views.",
    ],
    color: P.blue,
  },
  {
    role: "Lead UX & Brand Consultant",
    company: "Vigilare Bio Pharma",
    period: "Enterprise Digital Transformation",
    location: "Hyderabad, India",
    bullets: [
      "Architected UX/UI for internal MICC (Medical Information Care Center) tools.",
      "Led corporate identity and design-system initiatives.",
      "14K LinkedIn followers and 33,248 impressions across 48 posts.",
    ],
    color: P.violet,
  },
  {
    role: "Growth Hacker",
    company: "Logos GmbH — Berlin, Germany",
    period: "May 2017 – May 2022",
    location: "Remote",
    bullets: [
      "Led UX strategy for Mojoreads.com over a five-year product-growth engagement.",
      "Developed SEO/SEM initiatives contributing to 180%+ organic traffic growth.",
      "Designed Engineering-as-Marketing tools that delivered customer value.",
    ],
    color: P.cyan,
  },
  {
    role: "Digital Marketing Strategist",
    company: "Vedic IT Solutions Pvt. Ltd.",
    period: "Nov 2012 – April 2017",
    location: "India",
    bullets: [
      "Led website development, SEO and digital strategy.",
      "Delivered digital strategies for 20+ clients.",
      "Combined UX, content architecture and SEO to improve digital visibility.",
    ],
    color: P.green,
  },
];

export interface Project {
  name: string;
  subtitle: string;
  description: string;
  metrics: string[];
  tags: string[];
  color: string;
  link: string;
  /** screenshot slug -> src/imports/projects/<slug>.webp (resolved in Projects.astro) */
  image: string;
  /** what the thumbnail actually shows — used for the alt text, kept honest */
  imageAlt: string;
}

export const PROJECTS: Project[] = [
  {
    name: "IR4U",
    subtitle: "Healthcare Digital Growth & AI Transformation",
    description: "Led full digital transformation of a healthcare/interventional-radiology ecosystem across UX, SEO, analytics, social acquisition and AI-generated content.",
    // Card counts NEW users; the funnel section counts ACTIVE users (2,513) — different metrics, both true.
    metrics: ["60,900+ Video Views", "2,534 New Users", "4,300+ Page Views", "433 WhatsApp Clicks"],
    tags: ["AI Content", "SEO", "UX", "WhatsApp", "GA4"],
    color: P.blue,
    link: "https://ir4ubyram.com",
    image: "ir4u",
    imageAlt: "IR4U — interventional radiology homepage hero",
  },
  {
    name: "Pro Studio X",
    subtitle: "AI Content & Video Automation Platform",
    description: "Founder & Product Designer of an AI content engine turning creative briefs into full video production pipelines. Brief → Niche → Script → Storyboard → Video → Export.",
    metrics: ["Multi-step AI wizard", "Script generation", "Storyboard automation", "Video pipeline"],
    tags: ["AI Product", "LLM Workflows", "Automation", "UX Architecture"],
    color: P.violet,
    link: "https://github.com/ajayspi/ProstudioX-v1",
    image: "pro-studio-x",
    imageAlt: "Pro Studio X app — faceless finance Shorts generation form",
  },
  {
    name: "Vigilare",
    subtitle: "Enterprise Digital Transformation & Brand",
    description: "End-to-end UX, brand and digital transformation for a global biopharma and regulatory services organization. Architected MICC internal tools and design system.",
    metrics: ["14K LinkedIn followers", "33,248 impressions", "48 posts", "Design system"],
    tags: ["UX Strategy", "Brand", "Healthcare", "Design Systems"],
    color: P.cyan,
    link: "https://www.vigilarebp.com",
    image: "vigilare",
    imageAlt: "Vigilare Bio Pharma — regulatory affairs homepage",
  },
  {
    name: "Recytronics",
    subtitle: "UX/UI Transformation & B2B Digital Experience",
    description: "Complete UX redesign for electronics recycling platform across 16+ pages covering six waste categories, stakeholder research, card sorting and EPR architecture.",
    metrics: ["16+ pages redesigned", "6 user interviews", "EPR architecture", "8 weeks"],
    tags: ["UX Research", "B2B", "Information Architecture", "Wireframing"],
    color: P.green,
    link: "https://www.recytronics.com",
    image: "recytronics",
    imageAlt: "Recytronics — electronics recycling homepage",
  },
  {
    name: "eRevival",
    subtitle: "International B2B Digital Strategy — USA",
    description: "Digital analysis and strategy for a specialized electronics recycling and IT asset disposition business serving government, healthcare, banking and education sectors.",
    metrics: ["Regional SEO", "B2B positioning", "Multi-sector", "East Coast USA"],
    tags: ["B2B", "Digital Strategy", "SEO", "USA Market"],
    color: P.amber,
    link: "https://erevival.com",
    image: "erevival",
    imageAlt: "eRevival — electronics and computer recycling homepage",
  },
  {
    name: "The Precious Jewels",
    subtitle: "Luxury Jewelry / E-commerce — USA",
    description: "Website design and social media marketing for a luxury jewelry e-commerce brand in the US market. Crafted a premium digital presence aligned with high-end buyer expectations.",
    metrics: ["E-commerce", "Luxury brand", "Social media", "USA market"],
    tags: ["Website Design", "Social Media Marketing", "E-commerce", "Luxury"],
    color: P.pink,
    link: "https://thepreciousjewels.com/",
    image: "precious-jewels",
    imageAlt: "The Precious Jewels — luxury jewelry storefront",
  },
  {
    name: "Aura Makeover",
    subtitle: "Home Makeovers in 48 Hours — Hyderabad",
    description: "Website and local growth for a premium home-makeover service: luxury wallpapers, fluted louvers and smart blinds installed in 48 hours with zero civil work. Serving Kokapet, Tellapur & Financial District.",
    metrics: ["48-hour install", "Zero civil work", "Wallpapers · Louvers · Blinds", "Hyderabad"],
    tags: ["Web Design", "Local SEO", "Home Services", "Lead Gen"],
    color: P.teal,
    link: "https://aura-makeover.vercel.app",
    image: "aura-makeover",
    imageAlt: "Aura Makeover — home makeover services homepage",
  },
  {
    name: "Talenttrek",
    subtitle: "Talent Platform — Website (Next.js)",
    description: "Design and build of a talent-platform website on Next.js App Router with blog, industry pages and a contact API.",
    metrics: ["Next.js App Router", "Blog + Industries", "Contact API", "TypeScript"],
    tags: ["Next.js", "TypeScript", "Web Development"],
    color: P.orange,
    link: "https://talenttrek-mocha.vercel.app",
    image: "talenttrek",
    imageAlt: "Talent Trek — AI voice, chat and agent solutions homepage",
  },
  {
    name: "Clipped AI Studio",
    subtitle: "Open-Source AI Video Engine",
    description: "Open-source AI video engine (TypeScript) — an active build turning scripts into produced video with an automated pipeline.",
    metrics: ["Open-source", "TypeScript", "Video pipeline", "Active build"],
    tags: ["AI Video", "Open Source", "Automation"],
    color: P.slate,
    link: "https://github.com/ajayspi/clipped-ai-studio",
    image: "clipped-ai-studio",
    imageAlt: "Clipped AI Studio — neon scissors and film artwork from the repo",
  },
];

export const SKILLS_AI = ["Generative AI", "LLM Workflows", "Prompt Engineering", "AI Content", "AI Video", "Workflow Automation", "AI Product Development", "AI Personas", "AI-assisted Production"];
export const SKILLS_GROWTH = ["Growth Strategy", "SEO / SEM", "Performance Marketing", "CRO", "Lead Generation", "Go-to-Market", "Content Strategy", "Marketing Automation"];
export const SKILLS_UX = ["UX Strategy", "User Research", "Information Architecture", "Wireframing & Prototyping", "Design Systems", "Usability Testing", "Product Strategy"];
export const SKILLS_TOOLS = ["GA4", "Google Search Console", "Looker Studio", "Hotjar", "Mixpanel", "Microsoft Clarity", "Google Ads", "Figma", "FigJam", "Semrush", "Ahrefs", "WordPress", "Elementor", "HTML/CSS"];
