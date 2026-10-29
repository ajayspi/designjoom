// Single source of truth for identity, metadata and answer-shaped content.
// Consumed by Base.astro (head + JSON-LD), the section components, robots.txt, llms.txt
// and scripts/verify.mjs. One canonical string for the name and descriptor, verbatim
// everywhere, so the entity the site declares cannot drift between title, h1 and schema.
//
// Honesty rule: every metric here is traceable to a bullet in EXPERIENCE (src/data.ts).
// Nothing is estimated, rounded up, or invented. No "Rosh" content.

export const IDENTITY = {
  name: "A V Ajay Kiran",
  alternateNames: ["Ajay Kiran", "Av. Ajay Kiran"],
  descriptor: "AI Growth & Digital Transformation Leader",
  jobTitle: "Growth Leader — AI Growth & Digital Strategy Lead",
  employer: "DIGIT AI",
  location: { city: "Hyderabad", region: "Telangana", country: "India" },
  email: "ajayspi@gmail.com",
  phone: "+91 98853 69345",
  sameAs: [
    "https://www.linkedin.com/in/aigrowthandautomationleader/",
    "https://github.com/ajayspi",
    "https://behance.net/Designjoom",
  ],
  // Stable public path (not a hashed build asset) so schema consumers can cache it.
  image: "https://www.designjoom.com/ajay-kiran.png",
} as const;

export const META = {
  title: "A V Ajay Kiran — AI Growth & Digital Transformation Leader",
  description:
    "A V Ajay Kiran — AI Growth & Digital Transformation Leader with 14+ years delivering 180%+ organic traffic growth and 60,900+ video views.",
  canonical: "https://www.designjoom.com/",
  ogImage: "https://www.designjoom.com/og-image.jpg",
  themeColor: "#050810",
} as const;

// Answer-shaped copy. Every string must survive being lifted out of the page with no context.
export const ANSWER_INTRO =
  "A V Ajay Kiran is an AI Growth and Digital Transformation Leader based in Hyderabad, India, with 14+ years of experience spanning AI product development, SEO and performance marketing, UX strategy and workflow automation for clients across India, the US and Australia.";

export const COPY = {
  // Verbatim from the current site — moved, not rewritten.
  aboutParagraph:
    "Combining business strategy, UX, technology and measurable growth — with hands-on experience building AI-powered products and automation workflows. Experienced in leading multidisciplinary teams and developing digital ecosystems across international markets.",
  positioning:
    "AI + Growth + UX + Digital Transformation — building digital experiences, growth systems and AI-powered workflows that connect business strategy with measurable customer outcomes.",
} as const;

export const QUICK_FACTS = [
  { label: "Current role", value: "Growth Leader — AI Growth & Digital Strategy Lead at DIGIT AI" },
  { label: "Experience", value: "14+ years across AI, growth, UX and automation" },
  { label: "Based in", value: "Hyderabad, India · works across India" },
  { label: "Focus", value: "AI growth · digital transformation · UX strategy" },
  { label: "Clients served", value: "20+ across India, the US and Australia" },
  { label: "Certified", value: "HFI CXA · Generative AI Mastermind · Google Digital Garage" },
];

// The results ledger. Each metric is quoted from a verified bullet in EXPERIENCE;
// `client` names the engagement, `period` the span it covers. Units are in the metric text.
export const RESULTS = [
  { metric: "+99% website traffic", client: "Dr. Gopichand — healthcare digital ecosystem", period: "Dec 2025 – Present" },
  { metric: "+93% new users", client: "Dr. Gopichand — healthcare digital ecosystem", period: "Dec 2025 – Present" },
  { metric: "1,400+ users", client: "Dr. Khalilullah", period: "Dec 2025 – Present" },
  { metric: "180%+ organic traffic growth", client: "Logos GmbH — Mojoreads.com", period: "May 2017 – May 2022" },
  { metric: "60,900+ video views", client: "IR4U — cross-platform", period: "Cumulative to date" },
  { metric: "33,248 impressions across 48 posts", client: "Vigilare Bio Pharma — LinkedIn", period: "Cumulative to date" },
  { metric: "2,534 new users", client: "IR4U — digital ecosystem", period: "Cumulative to date" },
];

export const FAQ = [
  {
    q: "Who is A V Ajay Kiran?",
    a: "A V Ajay Kiran is an AI Growth and Digital Transformation Leader based in Hyderabad, India, also working across the UAE. He has 14+ years of experience combining AI product development, SEO and performance marketing, UX strategy and workflow automation. He is also known as Ajay Kiran and works under the Designjoom brand.",
  },
  {
    q: "What does A V Ajay Kiran do?",
    a: "He leads growth strategy across AI, SEO, social media, content, UX, performance marketing and automation, and manages a multidisciplinary team of six covering graphic design, content creation and social media. His work spans digital transformation programmes, AI-powered product builds and UX strategy for enterprise tools.",
  },
  {
    q: "How many years of experience does he have?",
    a: "He has 14+ years of professional experience, beginning with digital marketing strategy at Vedic IT Solutions in 2012. He has since worked as a growth hacker at Logos GmbH in Berlin, a lead UX and brand consultant at Vigilare Bio Pharma, and currently leads AI growth and digital strategy at DIGIT AI.",
  },
  {
    q: "What results has he delivered?",
    a: "Verified results include 180%+ organic traffic growth at Logos GmbH over a five-year engagement, +99% website traffic and +93% new users for a healthcare client, 60,900+ video views and 2,534 new users on the IR4U digital ecosystem, and 33,248 impressions across 48 LinkedIn posts for Vigilare Bio Pharma.",
  },
  {
    q: "Where is he based and does he work remotely?",
    a: "He is based in Hyderabad, India and works with clients across India, Germany, the US and Australia. His roles at Logos GmbH in Berlin and with Vigilare Bio Pharma have been remote and enterprise-facing, so he is comfortable working across time zones and distributed teams.",
  },
  {
    q: "What AI and growth tools does he use?",
    a: "His toolkit spans generative AI, LLM workflows, prompt engineering, AI content and video production, and workflow automation. For growth he uses GA4, Google Search Console, Looker Studio, Hotjar, Mixpanel, Microsoft Clarity, Google Ads, Semrush and Ahrefs, plus Figma, FigJam, WordPress and Elementor.",
  },
  {
    q: "Is he available for roles and projects?",
    a: "Yes. He is available for AI growth, digital transformation and UX strategy roles, and for consulting engagements spanning AI workflow architecture, growth strategy and UX transformation. He can be reached by email at ajayspi@gmail.com or by phone on +91 98853 69345.",
  },
  {
    q: "How do I contact A V Ajay Kiran?",
    a: "The fastest route is email at ajayspi@gmail.com, or the contact form on this page, which delivers messages directly to his inbox. He is also on LinkedIn as aigrowthandautomationleader and on GitHub as ajayspi. For urgent matters, phone is +91 98853 69345.",
  },
];
