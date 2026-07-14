import { prisma } from "@/src/infra/prisma/prisma.client";
import { hash } from "@/src/services/token.service";

type SeedUser = {
  name: string;
  email: string;
  password: string;
  role: "learner" | "instructor" | "admin";
  avatar: string;
  headline: string;
  major: string;
  plan: string;
};

type SeedSection = {
  title: string;
  description: string;
  lessons: {
    title: string;
    type: "video" | "article" | "quiz" | "coding";
    summary: string;
    videoUrl?: string;
    blocks: {
      type: "markdown" | "code" | "callout" | "image";
      title: string;
      content: string;
    }[];
  }[];
};

type SeedCourse = {
  title: string;
  slug: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  language: string;
  summary: string;
  description: string;
  estimatedHours: number;
  isFree: boolean;
  priceCents?: number;
  thumbnailUrl: string;
  heroImageUrl: string;
  accentGradient: string;
  sections: SeedSection[];
};

// ═══════════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════════

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function batchInsert<T>(
  items: T[],
  size: number,
  inserter: (batch: T[]) => Promise<unknown>,
): Promise<void> {
  for (let i = 0; i < items.length; i += size) {
    await inserter(items.slice(i, i + size));
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Data Pools
// ═══════════════════════════════════════════════════════════════════════════════

const FIRST_NAMES = [
  "James", "Oliver", "Liam", "Noah", "Ethan", "Lucas", "Mason", "Logan",
  "Alexander", "Sebastian", "Benjamin", "Daniel", "Matthew", "Jackson",
  "David", "Joseph", "Carter", "Owen", "Wyatt", "John", "Luke", "Gabriel",
  "Isaac", "Jayden", "Grayson", "Anthony", "Leo", "Asher", "Christopher",
  "Joshua", "Andrew", "Theodore", "Caleb", "Ryan", "Adrian", "Nathan",
  "Hunter", "Eli", "Aaron", "Connor", "Emma", "Olivia", "Ava", "Sophia",
  "Isabella", "Mia", "Charlotte", "Amelia", "Harper", "Evelyn", "Abigail",
  "Emily", "Ella", "Elizabeth", "Camila", "Luna", "Sofia", "Aria",
  "Scarlett", "Penelope", "Layla", "Chloe", "Victoria", "Madison",
  "Eleanor", "Grace", "Nora", "Riley", "Zoey", "Hannah", "Hazel",
  "Lily", "Ellie", "Violet", "Stella", "Aurora", "Nova", "Savannah",
  "Brooklyn", "Leah", "Iris", "Willow", "Emilia", "Ivy", "Genevieve",
  "Alice", "Kinsley", "Adriana", "Allison", "Elena", "Anna", "Aaliyah",
  "Caroline", "Natalie", "Audrey", "Maya", "Claire", "Skylar", "Paisley",
  "Ariana", "Annabelle", "Naomi", "Bella", "Jasmine", "Sienna", "Piper",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
  "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
  "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark",
  "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King",
  "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green",
  "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
  "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz",
  "Parker", "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris",
  "Morales", "Murphy", "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan",
  "Cooper", "Peterson", "Bailey", "Reed", "Kelly", "Howard", "Ramos",
  "Kim", "Cox", "Ward", "Richardson", "Watson", "Brooks", "Chavez",
  "Wood", "James", "Bennett", "Gray", "Mendoza", "Ruiz", "Hughes",
  "Price", "Alvarez", "Castillo", "Sanders", "Patel", "Myers", "Long",
];

const AVATARS = [
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1599566150163-29194dcabd9c?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=80",
];

const THUMBNAILS = [
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1516321310764-8d3c9cf4df59?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1432888622747-4eb9a8f1c2f4?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1537432376149-e84978e18c6b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
];

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1432888622747-4eb9a8f1c2f4?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
];

const GRADIENTS = [
  "from-[#00C9A7] to-[#4D96FF]",
  "from-[#6C5CE7] to-[#8E44AD]",
  "from-[#4D96FF] to-[#6C5CE7]",
  "from-[#8E44AD] to-[#E192FF]",
  "from-[#FF6B6B] to-[#FFE66D]",
  "from-[#4ECDC4] to-[#556270]",
  "from-[#FC5C7D] to-[#6A82FB]",
  "from-[#11998e] to-[#38ef7d]",
  "from-[#EE0979] to-[#FF6A00]",
  "from-[#7F00FF] to-[#E100FF]",
];

const INSTRUCTOR_HEADLINES = [
  "Senior Engineer at TechCorp",
  "Staff Developer & Open Source Contributor",
  "Former Lead at FAANG Company",
  "Principal Architect at CloudScale",
  "VP of Engineering at StartupX",
  "Product Design Lead at DesignCo",
  "Data Science Manager at AnalyticsPro",
  "Marketing Director at GrowthLabs",
  "CTO & Technical Co-Founder",
  "DevOps Lead at InfrastructureCo",
  "Full-Stack Engineer & Educator",
  "UX Research Lead at UserFirst",
  "Machine Learning Engineer at AI Labs",
  "Backend Architect at ScaleUp",
  "Frontend Lead at WebStudio",
  "Security Engineer at CyberShield",
  "Mobile Lead at AppFactory",
  "Platform Engineer at CloudNative",
  "Growth Engineer at ViralApp",
  "Systems Programmer at CoreOS",
];

const INSTRUCTOR_MAJORS = [
  "Computer Science", "Software Engineering", "Data Science",
  "Design", "Marketing", "Business", "Information Technology",
  "Mathematics", "Physics", "Information Systems",
];

const CATEGORIES: Record<string, string[]> = {
  Design: [
    "Typography Fundamentals", "Color Theory & Application", "UI Design Patterns",
    "UX Research Methods", "Design Systems at Scale", "Interaction Design",
    "Motion Design Principles", "Accessible Design", "Information Architecture",
    "Visual Branding", "Responsive Design", "Icon Design Systems",
  ],
  Development: [
    "JavaScript Essentials", "Python for Web Development", "React Advanced Patterns",
    "Node.js Backend Architecture", "Database Design & Optimization", "RESTful API Design",
    "DevOps & CI/CD Pipelines", "TypeScript Advanced Types", "CSS Architecture",
    "Testing Strategies", "GraphQL Fundamentals", "Microservices Architecture",
  ],
  Marketing: [
    "SEO Fundamentals", "Content Marketing Strategy", "Social Media Marketing",
    "Email Marketing Automation", "Paid Advertising Mastery", "Analytics & Data Tracking",
    "Brand Strategy & Positioning", "Influencer Marketing", "Growth Hacking",
    "Marketing Automation", "Conversion Optimization", "Video Marketing",
  ],
  Business: [
    "Product Management", "Startup Strategy & Fundraising", "Financial Modeling",
    "Team Leadership", "Agile Project Management", "Business Analytics",
    "Negotiation Skills", "Operations Management", "Strategic Planning",
    "Risk Management", "Corporate Governance", "Supply Chain Management",
  ],
  "Data Science": [
    "Machine Learning Fundamentals", "Data Visualization", "Statistical Analysis",
    "Deep Learning with PyTorch", "Natural Language Processing", "Big Data Technologies",
    "Data Engineering Pipelines", "Time Series Analysis", "Computer Vision",
    "Reinforcement Learning", "Feature Engineering", "MLOps & Deployment",
  ],
};

const SECTION_PREFIXES = [
  "Introduction to", "Core Concepts of", "Advanced", "Practical",
  "Mastering", "Deep Dive into", "Essential", "Applied",
  "Foundations of", "Workshop on",
];

const LESSON_SUFFIXES = [
  "Fundamentals", "in Practice", "Best Approaches", "Case Studies",
  "Hands-On Workshop", "Key Principles", "Real-World Examples",
  "Advanced Techniques", "Common Pitfalls", "Expert Tips",
  "Step by Step", "Quick Start Guide",
];

const REVIEW_TEMPLATES = [
  (cat: string) => `Excellent course! The ${cat.toLowerCase()} content was well-structured and the exercises were practical. I learned a lot that I can immediately apply to my work.`,
  (cat: string) => `Great introduction to ${cat.toLowerCase()}. The instructor explains complex concepts clearly. Would recommend to anyone starting out.`,
  (cat: string) => `Very comprehensive coverage of ${cat.toLowerCase()}. The hands-on projects were particularly valuable. A few sections could use more depth but overall fantastic.`,
  (cat: string) => `Solid course with good pacing. The ${cat.toLowerCase()} material is up-to-date and relevant. The community support was also a huge plus.`,
  (cat: string) => `Good course overall. The ${cat.toLowerCase()} fundamentals are covered well. I would have liked more advanced topics but the basics are solid.`,
  (cat: string) => `This course exceeded my expectations. The ${cat.toLowerCase()} exercises forced me to actually practice rather than just watch. Highly recommended.`,
  (cat: string) => `Well-organized and thorough. The ${cat.toLowerCase()} content builds progressively. Minor formatting issues but the knowledge is top-notch.`,
  (cat: string) => `A must-take for anyone serious about ${cat.toLowerCase()}. The instructor clearly knows the subject deeply and communicates it effectively.`,
];

const NOTE_CONTENTS = [
  "Remember to review this section before the exam.",
  "Key formula: need to memorize this approach.",
  "Apply this pattern in my current project.",
  "Great explanation - revisit before the quiz.",
  "This connects to the previous module nicely.",
  "Bookmark for reference in future work.",
  "Need more practice with these exercises.",
  "Summarize this into flashcards later.",
  "Useful for the upcoming assignment.",
  "Ask about this in the next Q&A session.",
];

const courses: SeedCourse[] = [
  {
    title: "UI/UX Fundamentals",
    slug: "ui-ux-fundamentals",
    category: "Design",
    level: "intermediate",
    language: "English / subtitles",
    summary: "Master the principles of Gestalt theory and how they apply to modern digital interfaces.",
    description: "A curated foundation course covering tonal depth, interface hierarchy, editorial typography, and practical product decision making. Learn to create spatial hierarchy using background shifts instead of borders, harness Swiss-style type contrasts, and design specialized insight systems for critique and feedback loops.",
    estimatedHours: 6,
    isFree: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    heroImageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    accentGradient: "from-[#00C9A7] to-[#4D96FF]",
    sections: [
      {
        title: "Introduction to Curatorial UX",
        description: "Foundational concepts and platform orientation",
        lessons: [
          {
            title: "Introduction to the Platform",
            type: "video",
            summary: "Get oriented with the learning environment and interface.",
            videoUrl: "https://cdn.learnsphere.app/videos/uiux-intro.mp4",
            blocks: [
              { type: "markdown", title: "Welcome", content: "# Welcome to UI/UX Fundamentals\n\nThis course will transform how you think about digital interfaces. By the end, you will be able to design with intentional hierarchy, tonal depth, and editorial precision." },
              { type: "callout", title: "Key Insight", content: "Great design is invisible. The best interfaces guide users without them noticing the guide." },
              { type: "image", title: "Platform Overview", content: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80" },
            ],
          },
          {
            title: "Course Overview & Learning Outcomes",
            type: "video",
            summary: "Understand the full curriculum and what you will achieve.",
            videoUrl: "https://cdn.learnsphere.app/videos/uiux-overview.mp4",
            blocks: [
              { type: "markdown", title: "What You Will Learn", content: "# Learning Outcomes\n\n1. Apply Gestalt principles to layout design\n2. Create effective visual hierarchies\n3. Design with tonal depth and restraint\n4. Build accessible and inclusive interfaces" },
              { type: "callout", title: "Time Investment", content: "Expect to spend 4-6 hours per week on this module, including hands-on exercises." },
            ],
          },
          {
            title: "Setting up your Workspace",
            type: "article",
            summary: "Configure your design tools and environment.",
            blocks: [
              { type: "markdown", title: "Tools", content: "# Setting Up Your Workspace\n\n## Recommended Tools\n\n- **Figma** for interface design\n- **VS Code** for any code work\n- **Chrome DevTools** for browser inspection\n\n## Design System Starter\n\nWe will provide a Figma community file with pre-built components that match the LearnSphere design language." },
              { type: "code", title: "Terminal Setup", content: "```bash\n# Install design token CLI\nnpm install -g design-tokens-cli\n\n# Clone the design system\ngit clone https://github.com/learnsphere/design-system.git\n```" },
            ],
          },
        ],
      },
      {
        title: "Core Strategy",
        description: "Strategic foundations for design decision-making",
        lessons: [
          {
            title: "Understanding Market Needs",
            type: "video",
            summary: "Learn how to research and identify user needs.",
            videoUrl: "https://cdn.learnsphere.app/videos/uiux-market.mp4",
            blocks: [
              { type: "markdown", title: "Market Research", content: "# Understanding Market Needs\n\nDesign decisions should always be grounded in user research. This lesson covers:\n\n- User interviews and synthesis\n- Competitive analysis frameworks\n- Opportunity mapping" },
            ],
          },
          {
            title: "Gestalt Principles in Practice",
            type: "video",
            summary: "Apply Gestalt theory to real-world interface problems.",
            videoUrl: "https://cdn.learnsphere.app/videos/uiux-gestalt.mp4",
            blocks: [
              { type: "markdown", title: "Gestalt Principles", content: "# Gestalt Principles\n\n## Proximity\nElements close together are perceived as related.\n\n## Similarity\nElements that look similar are perceived as grouped.\n\n## Closure\nThe mind fills in missing information to create a complete picture.\n\n## Figure-Ground\nThe eye distinguishes objects from their background." },
              { type: "callout", title: "Pro Tip", content: "Use proximity before borders. It creates cleaner, more maintainable layouts." },
            ],
          },
          {
            title: "Quiz: Design Principles",
            type: "quiz",
            summary: "Test your understanding of core design principles.",
            blocks: [
              { type: "markdown", title: "Knowledge Check", content: "# Quiz: Design Principles\n\nThis quiz will assess your understanding of:\n\n- Gestalt principles\n- Visual hierarchy\n- Tonal depth\n- Accessibility fundamentals" },
            ],
          },
          {
            title: "Coding Exercise: CSS Layout",
            type: "coding",
            summary: "Practice building layouts with CSS Grid and Flexbox.",
            blocks: [
              { type: "markdown", title: "Exercise", content: "# CSS Layout Challenge\n\nRecreate the provided wireframe using CSS Grid and Flexbox. Focus on hierarchy and spacing rather than colors." },
              { type: "code", title: "Starter Code", content: "```css\n.container {\n  display: grid;\n  /* your code here */\n}\n```" },
            ],
          },
        ],
      },
      {
        title: "Visual Design Mastery",
        description: "Advanced visual design techniques",
        lessons: [
          {
            title: "Tonal Depth Theory",
            type: "video",
            summary: "Create spatial hierarchy using background shifts.",
            videoUrl: "https://cdn.learnsphere.app/videos/uiux-tonal.mp4",
            blocks: [
              { type: "markdown", title: "Tonal Depth", content: "# Tonal Depth Theory\n\nTonal depth replaces borders with subtle background variations. This creates cleaner interfaces with clearer hierarchy.\n\n## Key Concepts\n\n- Surface levels (low, medium, high)\n- Elevation through color\n- Maintaining contrast ratios" },
            ],
          },
          {
            title: "Editorial Typography",
            type: "video",
            summary: "Harness type contrasts for better communication.",
            videoUrl: "https://cdn.learnsphere.app/videos/uiux-typography.mp4",
            blocks: [
              { type: "markdown", title: "Typography Systems", content: "# Editorial Typography\n\n## Type Scale\nUse a modular scale (1.25 or 1.333) for consistent sizing.\n\n## Line Height\n- Body text: 1.5-1.8\n- Headings: 1.1-1.3\n\n## Measure\nAim for 45-75 characters per line for optimal readability." },
            ],
          },
        ],
      },
      {
        title: "Portfolio & Critique",
        description: "Final project and peer review",
        lessons: [
          {
            title: "Building Your Portfolio Piece",
            type: "article",
            summary: "Create a showcase project from your learnings.",
            blocks: [
              { type: "markdown", title: "Final Project", content: "# Portfolio Project\n\nDesign a landing page for a fictional SaaS product that demonstrates:\n\n1. Tonal hierarchy without borders\n2. Editorial typography\n3. Accessible color choices\n4. Responsive layout" },
            ],
          },
          {
            title: "Peer Review Workshop",
            type: "video",
            summary: "Give and receive constructive design feedback.",
            videoUrl: "https://cdn.learnsphere.app/videos/uiux-critique.mp4",
            blocks: [
              { type: "markdown", title: "Critique Framework", content: "# Giving Good Critique\n\n1. Start with what works\n2. Ask questions before making statements\n3. Focus on goals, not preferences\n4. Suggest alternatives, not ultimatums" },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "Intro to Python",
    slug: "intro-to-python",
    category: "Development",
    level: "beginner",
    language: "English",
    summary: "Build confidence with Python syntax, control flow, data structures, and simple automation.",
    description: "An applied path for first-time developers with interactive exercises and guided mini projects. Learn variables, functions, loops, and data structures through real-world examples. By the end, you will have built a portfolio of Python scripts.",
    estimatedHours: 4,
    isFree: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
    heroImageUrl: "https://images.unsplash.com/photo-1516321310764-8d3c9cf4df59?auto=format&fit=crop&w=1200&q=80",
    accentGradient: "from-[#00C9A7] to-[#4D96FF]",
    sections: [
      {
        title: "Python Basics",
        description: "Getting started with Python programming",
        lessons: [
          {
            title: "Variables and Data Types",
            type: "video",
            summary: "Learn the fundamental building blocks of Python.",
            videoUrl: "https://cdn.learnsphere.app/videos/py-variables.mp4",
            blocks: [
              { type: "markdown", title: "Variables", content: "# Variables and Data Types\n\n## Basic Types\n\n```python\n# Numbers\nage = 25\nprice = 19.99\n\n# Strings\nname = \"Alice\"\ngreeting = 'Hello'\n\n# Booleans\nis_active = True\nis_complete = False\n\n# None\nresult = None\n```\n\n## Type Checking\nUse `type()` to check any variable's type." },
            ],
          },
          {
            title: "Control Flow Foundations",
            type: "video",
            summary: "Master conditionals and loops.",
            videoUrl: "https://cdn.learnsphere.app/videos/py-control.mp4",
            blocks: [
              { type: "markdown", title: "Control Flow", content: "# Control Flow\n\n## Conditionals\n```python\nif score >= 90:\n    grade = \"A\"\nelif score >= 80:\n    grade = \"B\"\nelse:\n    grade = \"C\"\n```\n\n## Loops\n```python\nfor i in range(5):\n    print(f\"Iteration {i}\")\n\nwhile count > 0:\n    process(count)\n    count -= 1\n```" },
              { type: "callout", title: "Common Pitfall", content: "Remember that Python uses indentation (4 spaces) to define blocks, not curly braces." },
            ],
          },
          {
            title: "Functions and Scope",
            type: "video",
            summary: "Write reusable code with functions.",
            videoUrl: "https://cdn.learnsphere.app/videos/py-functions.mp4",
            blocks: [
              { type: "markdown", title: "Functions", content: "# Functions\n\n```python\ndef greet(name: str, formal: bool = False) -> str:\n    if formal:\n        return f\"Good day, {name}\"\n    return f\"Hey {name}!\"\n\n# Default arguments\n# Type hints\n# Return values\n```" },
            ],
          },
          {
            title: "Quiz: Python Fundamentals",
            type: "quiz",
            summary: "Test your Python basics knowledge.",
            blocks: [
              { type: "markdown", title: "Quiz", content: "# Python Fundamentals Quiz\n\nTopics covered: variables, control flow, functions" },
            ],
          },
          {
            title: "Coding Exercise: FizzBuzz",
            type: "coding",
            summary: "Implement the classic FizzBuzz challenge.",
            blocks: [
              { type: "code", title: "Challenge", content: "```python\ndef fizzbuzz(n: int) -> list[str]:\n    \"\"\"Return FizzBuzz results from 1 to n.\"\"\"\n    # Your code here\n    pass\n```" },
            ],
          },
        ],
      },
      {
        title: "Data Structures",
        description: "Working with collections of data",
        lessons: [
          {
            title: "Lists and Tuples",
            type: "video",
            summary: "Master ordered collections in Python.",
            videoUrl: "https://cdn.learnsphere.app/videos/py-lists.mp4",
            blocks: [
              { type: "markdown", title: "Lists", content: "# Lists and Tuples\n\n## Lists (mutable)\n```python\nfruits = [\"apple\", \"banana\", \"cherry\"]\nfruits.append(\"date\")\nfruits.sort()\n```\n\n## Tuples (immutable)\n```python\ncoords = (10, 20)\nx, y = coords  # unpacking\n```" },
            ],
          },
          {
            title: "Dictionaries and Sets",
            type: "video",
            summary: "Work with key-value pairs and unique collections.",
            videoUrl: "https://cdn.learnsphere.app/videos/py-dicts.mp4",
            blocks: [
              { type: "markdown", title: "Dictionaries", content: "# Dictionaries\n\n```python\nuser = {\n    \"name\": \"Alice\",\n    \"email\": \"alice@example.com\",\n    \"roles\": [\"admin\", \"editor\"]\n}\n\n# Dictionary comprehensions\nsquares = {x: x**2 for x in range(10)}\n```" },
            ],
          },
        ],
      },
      {
        title: "File I/O and Automation",
        description: "Reading, writing, and automating tasks",
        lessons: [
          {
            title: "Working with Files",
            type: "article",
            summary: "Read and write files in Python.",
            blocks: [
              { type: "markdown", title: "File Operations", content: "# File I/O\n\n```python\n# Reading\nwith open(\"data.txt\", \"r\") as f:\n    content = f.read()\n\n# Writing\nwith open(\"output.txt\", \"w\") as f:\n    f.write(\"Hello, World!\\n\")\n\n# CSV files\nimport csv\nwith open(\"data.csv\", \"r\") as f:\n    reader = csv.DictReader(f)\n    for row in reader:\n        print(row[\"name\"])\n```" },
            ],
          },
          {
            title: "Mini Project: Log Analyzer",
            type: "coding",
            summary: "Build a log file analyzer script.",
            blocks: [
              { type: "code", title: "Project", content: "```python\n\"\"\"Build a log analyzer that counts error types.\"\"\"\nfrom collections import Counter\nfrom pathlib import Path\n\ndef analyze_logs(log_path: str) -> dict:\n    # Your implementation\n    pass\n```" },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "Growth Marketing Systems",
    slug: "growth-marketing-systems",
    category: "Marketing",
    level: "advanced",
    language: "English",
    summary: "Design measurable funnels, experimentation systems, and lifecycle campaigns.",
    description: "A systems-focused path for operators who want to build durable marketing engines. Covers funnel architecture, A/B testing methodology, lifecycle automation, and analytics-driven decision making.",
    estimatedHours: 8,
    isFree: false,
    priceCents: 4999,
    thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    heroImageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    accentGradient: "from-[#6C5CE7] to-[#8E44AD]",
    sections: [
      {
        title: "Funnel Architecture",
        description: "Designing high-converting marketing funnels",
        lessons: [
          {
            title: "The Modern Marketing Funnel",
            type: "video",
            summary: "Understanding how funnels work in the digital age.",
            videoUrl: "https://cdn.learnsphere.app/videos/mkt-funnel.mp4",
            blocks: [
              { type: "markdown", title: "Funnel Framework", content: "# The Modern Funnel\n\n## Awareness → Consideration → Conversion → Retention → Advocacy\n\nEach stage requires different strategies and metrics.\n\n## Key Metrics\n- CAC (Customer Acquisition Cost)\n- LTV (Lifetime Value)\n- Conversion Rate\n- Churn Rate" },
            ],
          },
          {
            title: "Conversion Rate Optimization",
            type: "video",
            summary: "Systematic approaches to improving conversion rates.",
            videoUrl: "https://cdn.learnsphere.app/videos/mkt-cro.mp4",
            blocks: [
              { type: "markdown", title: "CRO Framework", content: "# Conversion Rate Optimization\n\n## The CRO Process\n1. Research & data collection\n2. Hypothesis formation\n3. Experiment design\n4. A/B testing\n5. Analysis & iteration\n\n## Tools\n- Google Optimize\n- VWO\n- Optimizely" },
            ],
          },
        ],
      },
      {
        title: "Experimentation Systems",
        description: "Building robust testing frameworks",
        lessons: [
          {
            title: "A/B Testing Methodology",
            type: "video",
            summary: "Statistical foundations for reliable experiments.",
            videoUrl: "https://cdn.learnsphere.app/videos/mkt-abtesting.mp4",
            blocks: [
              { type: "markdown", title: "A/B Testing", content: "# A/B Testing Methodology\n\n## Statistical Significance\n- Minimum sample size calculations\n- Confidence intervals\n- Avoiding common pitfalls (peeking, multiple comparisons)\n\n## Implementation\n```python\nimport scipy.stats as stats\n\ndef calculate_significance(control, variant):\n    # Chi-squared test\n    _, p_value = stats.chisquare([control, variant])\n    return p_value < 0.05\n```" },
              { type: "callout", title: "Warning", content: "Never stop an experiment early based on preliminary results. Let it run to full statistical power." },
            ],
          },
        ],
      },
      {
        title: "Lifecycle Marketing",
        description: "Automated campaigns for the customer journey",
        lessons: [
          {
            title: "Email Automation Sequences",
            type: "article",
            summary: "Design triggered email flows.",
            blocks: [
              { type: "markdown", title: "Email Flows", content: "# Lifecycle Email Flows\n\n## Welcome Series\nDay 0: Welcome & expectations\nDay 1: Value delivery\nDay 3: Social proof\nDay 7: Offer\n\n## Abandoned Cart\n1h: Gentle reminder\n24h: Social proof + urgency\n72h: Last chance + incentive" },
            ],
          },
          {
            title: "Retention & Advocacy",
            type: "video",
            summary: "Keep customers engaged and turning them into advocates.",
            videoUrl: "https://cdn.learnsphere.app/videos/mkt-retention.mp4",
            blocks: [
              { type: "markdown", title: "Retention Strategies", content: "# Retention & Advocacy\n\n## Strategies\n1. Onboarding mastery\n2. Milestone celebrations\n3. Community building\n4. Feedback loops\n5. Referral programs\n\n## Metrics\n- NPS (Net Promoter Score)\n- CSAT (Customer Satisfaction)\n- Monthly Active Users" },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "Product Strategy Basics",
    slug: "product-strategy-basics",
    category: "Business",
    level: "intermediate",
    language: "English",
    summary: "Map market needs, shape product bets, and communicate a coherent roadmap.",
    description: "A practical strategy path with case studies and prioritization workshops. Learn to identify market opportunities, validate product assumptions, and communicate strategy to stakeholders.",
    estimatedHours: 5,
    isFree: false,
    priceCents: 2999,
    thumbnailUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    heroImageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    accentGradient: "from-[#00C9A7] to-[#4D96FF]",
    sections: [
      {
        title: "Strategic Foundations",
        description: "Core concepts of product strategy",
        lessons: [
          {
            title: "What is Product Strategy?",
            type: "video",
            summary: "Defining strategy and why it matters.",
            videoUrl: "https://cdn.learnsphere.app/videos/strat-intro.mp4",
            blocks: [
              { type: "markdown", title: "Product Strategy", content: "# Product Strategy\n\nStrategy is a set of coherent actions that position your product for sustainable advantage.\n\n## Components\n1. Vision - Where we are going\n2. Focus - What we choose NOT to do\n3. Positioning - How we win\n4. Capabilities - What we need to build" },
            ],
          },
          {
            title: "Market Analysis",
            type: "video",
            summary: "Understand your market and competition.",
            videoUrl: "https://cdn.learnsphere.app/videos/strat-market.mp4",
            blocks: [
              { type: "markdown", title: "Market Analysis", content: "# Market Analysis\n\n## Frameworks\n- **Porter's Five Forces**: Industry analysis\n- **SWOT**: Strengths, Weaknesses, Opportunities, Threats\n- **PESTLE**: Political, Economic, Social, Technological, Legal, Environmental" },
            ],
          },
        ],
      },
      {
        title: "Discovery & Validation",
        description: "Find problems worth solving",
        lessons: [
          {
            title: "User Research Methods",
            type: "article",
            summary: "Qualitative and quantitative research approaches.",
            blocks: [
              { type: "markdown", title: "User Research", content: "# User Research\n\n## Methods\n- **Interviews**: Deep 1-on-1 conversations\n- **Surveys**: Broad quantitative data\n- **Analytics**: Behavioral data at scale\n- **Usability Testing**: Observing real usage\n\n## Synthesis\nUse affinity mapping to identify patterns across research data." },
            ],
          },
          {
            title: "Prioritization Frameworks",
            type: "video",
            summary: "Decide what to build and when.",
            videoUrl: "https://cdn.learnsphere.app/videos/strat-prioritize.mp4",
            blocks: [
              { type: "markdown", title: "Prioritization", content: "# Prioritization\n\n## RICE Framework\n- **Reach**: How many users?\n- **Impact**: How much impact per user?\n- **Confidence**: How sure are we?\n- **Effort**: How much work?\n\nScore = (Reach × Impact × Confidence) / Effort" },
              { type: "callout", title: "Decision Rule", content: "If two opportunities have similar RICE scores, prioritize the one with more learning potential." },
            ],
          },
        ],
      },
      {
        title: "Execution & Communication",
        description: "Bringing strategy to life",
        lessons: [
          {
            title: "Roadmapping",
            type: "video",
            summary: "Create and communicate product roadmaps.",
            videoUrl: "https://cdn.learnsphere.app/videos/strat-roadmap.mp4",
            blocks: [
              { type: "markdown", title: "Roadmaps", content: "# Product Roadmaps\n\n## Types\n- **Outcome-based**: Focus on goals, not features\n- **Theme-based**: Group related initiatives\n- **Time-based**: Quarterly or monthly views\n\n## Best Practices\n- Communicate trade-offs\n- Update regularly\n- Share context, not just dates" },
            ],
          },
          {
            title: "Stakeholder Communication",
            type: "article",
            summary: "Keep everyone aligned and informed.",
            blocks: [
              { type: "markdown", title: "Communication", content: "# Stakeholder Communication\n\n## Rhythm\n- Weekly: Team standup updates\n- Monthly: Cross-functional reviews\n- Quarterly: Executive presentations\n\n## Templates\nUse frameworks like GIST (Goals, Ideas, Step-projects, Tasks) to communicate strategy clearly." },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "React & TypeScript Deep Dive",
    slug: "react-typescript-deep-dive",
    category: "Development",
    level: "advanced",
    language: "English",
    summary: "Master modern React with TypeScript through patterns, performance, and architecture.",
    description: "An advanced course covering React 19 features, TypeScript generics, custom hooks, state management patterns, and production-ready application architecture.",
    estimatedHours: 10,
    isFree: false,
    priceCents: 7999,
    thumbnailUrl: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?auto=format&fit=crop&w=1200&q=80",
    heroImageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    accentGradient: "from-[#4D96FF] to-[#6C5CE7]",
    sections: [
      {
        title: "TypeScript Foundations for React",
        description: "Advanced TypeScript patterns for React developers",
        lessons: [
          {
            title: "Generics and Utility Types",
            type: "video",
            summary: "Harness the full power of TypeScript generics.",
            videoUrl: "https://cdn.learnsphere.app/videos/ts-generics.mp4",
            blocks: [
              { type: "markdown", title: "Generics", content: "# Generics in React\n\n```typescript\ninterface ApiResponse<T> {\n  data: T;\n  status: number;\n  message: string;\n}\n\n// Generic hooks\nfunction useApi<T>(url: string) {\n  const [data, setData] = useState<T | null>(null);\n  // ...\n}\n```" },
            ],
          },
          {
            title: "Type-Safe Props and Events",
            type: "article",
            summary: "Build type-safe component interfaces.",
            blocks: [
              { type: "markdown", title: "Type-Safe Components", content: "# Type-Safe Props\n\n```typescript\ntype ButtonProps = {\n  variant: \"primary\" | \"secondary\";\n  size: \"sm\" | \"md\" | \"lg\";\n  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;\n  children: React.ReactNode;\n} & ComponentPropsWithoutRef<\"button\">;\n```\n\n## Event Typing\nAlways type event handlers explicitly for better intellisense." },
            ],
          },
        ],
      },
      {
        title: "React 19 Features",
        description: "New features and patterns in React 19",
        lessons: [
          {
            title: "Actions and useActionState",
            type: "video",
            summary: "Manage form state with React 19 Actions.",
            videoUrl: "https://cdn.learnsphere.app/videos/react-actions.mp4",
            blocks: [
              { type: "markdown", title: "React Actions", content: "# React 19 Actions\n\n```typescript\nconst [state, formAction, isPending] = useActionState(\n  async (prevState: State, formData: FormData) => {\n    const result = await submit(formData);\n    return { success: true, result };\n  },\n  { success: false }\n);\n```" },
            ],
          },
          {
            title: "Server Components and Streaming",
            type: "video",
            summary: "Leverage React Server Components for better performance.",
            videoUrl: "https://cdn.learnsphere.app/videos/react-rsc.mp4",
            blocks: [
              { type: "markdown", title: "RSC", content: "# React Server Components\n\nServer Components allow rendering on the server, reducing client bundle size.\n\n## When to use Server vs Client\n\n**Server Components**: Data fetching, static content, SEO-critical content\n\n**Client Components**: Interactivity, browser APIs, state management" },
            ],
          },
        ],
      },
      {
        title: "State Management Patterns",
        description: "Modern approaches to state in React",
        lessons: [
          {
            title: "Zustand and Context",
            type: "video",
            summary: "Lightweight state management without Redux.",
            videoUrl: "https://cdn.learnsphere.app/videos/react-state.mp4",
            blocks: [
              { type: "markdown", title: "State Management", content: "# Zustand\n\n```typescript\nimport { create } from \"zustand\";\n\ninterface Store {\n  count: number;\n  increment: () => void;\n  reset: () => void;\n}\n\nconst useStore = create<Store>((set) => ({\n  count: 0,\n  increment: () => set((state) => ({ count: state.count + 1 })),\n  reset: () => set({ count: 0 }),\n}));\n```" },
            ],
          },
          {
            title: "Coding Exercise: Custom Hook Library",
            type: "coding",
            summary: "Build a library of reusable custom hooks.",
            blocks: [
              { type: "code", title: "Challenge", content: "```typescript\n// Build hooks: useDebounce, useLocalStorage, useMediaQuery\n// All must be properly typed with generics\n\nfunction useDebounce<T>(value: T, delay: number): T {\n  // Your implementation\n}\n```" },
            ],
          },
        ],
      },
      {
        title: "Performance Optimization",
        description: "Make your React apps fast",
        lessons: [
          {
            title: "Memoization and Re-renders",
            type: "video",
            summary: "Understanding when and how to optimize.",
            videoUrl: "https://cdn.learnsphere.app/videos/react-perf.mp4",
            blocks: [
              { type: "markdown", title: "Performance", content: "# Performance Optimization\n\n## Tools\n- React DevTools Profiler\n- Chrome Lighthouse\n- Bundle analysis\n\n## Techniques\n- `React.memo` for expensive renders\n- `useMemo` and `useCallback`\n- Virtual scrolling for long lists\n- Code splitting with `React.lazy`" },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "Data Science with Python",
    slug: "data-science-python",
    category: "Development",
    level: "intermediate",
    language: "English",
    summary: "Analyze data, create visualizations, and build machine learning models with Python.",
    description: "A hands-on introduction to data science using pandas, matplotlib, scikit-learn, and Jupyter notebooks. Work with real datasets and build predictive models from scratch.",
    estimatedHours: 8,
    isFree: false,
    priceCents: 5999,
    thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    heroImageUrl: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1200&q=80",
    accentGradient: "from-[#8E44AD] to-[#E192FF]",
    sections: [
      {
        title: "Data Wrangling",
        description: "Cleaning and preparing data for analysis",
        lessons: [
          {
            title: "Pandas Fundamentals",
            type: "video",
            summary: "Data manipulation with pandas DataFrames.",
            videoUrl: "https://cdn.learnsphere.app/videos/ds-pandas.mp4",
            blocks: [
              { type: "markdown", title: "Pandas", content: "# Pandas Fundamentals\n\n```python\nimport pandas as pd\n\ndf = pd.read_csv(\"data.csv\")\ndf.head()\ndf.describe()\ndf.info()\n\n# Filtering\nfiltered = df[df[\"age\"] > 30]\n\n# Grouping\ndf.groupby(\"category\").mean()\n```" },
            ],
          },
          {
            title: "Data Cleaning Techniques",
            type: "video",
            summary: "Handle missing data, outliers, and inconsistencies.",
            videoUrl: "https://cdn.learnsphere.app/videos/ds-cleaning.mp4",
            blocks: [
              { type: "markdown", title: "Cleaning", content: "# Data Cleaning\n\n```python\n# Handle missing values\ndf.dropna()\ndf.fillna(df.mean())\n\n# Remove outliers\nq1 = df[\"value\"].quantile(0.25)\nq3 = df[\"value\"].quantile(0.75)\niqr = q3 - q1\nclean = df[(df[\"value\"] >= q1 - 1.5*iqr) & (df[\"value\"] <= q3 + 1.5*iqr)]\n```" },
            ],
          },
        ],
      },
      {
        title: "Visualization",
        description: "Creating compelling data visualizations",
        lessons: [
          {
            title: "Matplotlib & Seaborn",
            type: "video",
            summary: "Static and statistical plots in Python.",
            videoUrl: "https://cdn.learnsphere.app/videos/ds-viz.mp4",
            blocks: [
              { type: "markdown", title: "Visualization", content: "# Data Visualization\n\n```python\nimport matplotlib.pyplot as plt\nimport seaborn as sns\n\nfig, axes = plt.subplots(2, 2, figsize=(12, 8))\nsns.scatterplot(data=df, x=\"feature1\", y=\"feature2\", hue=\"target\", ax=axes[0, 0])\nsns.boxplot(data=df, x=\"category\", y=\"value\", ax=axes[0, 1])\nsns.heatmap(df.corr(), annot=True, ax=axes[1, 0])\nplt.tight_layout()\n```" },
            ],
          },
          {
            title: "Interactive Dashboards with Plotly",
            type: "article",
            summary: "Create interactive web-based visualizations.",
            blocks: [
              { type: "markdown", title: "Plotly", content: "# Interactive Dashboards\n\nPlotly Express makes it easy to create interactive plots that support zoom, hover, and filtering.\n\n```python\nimport plotly.express as px\n\nfig = px.scatter(df, x=\"gdp\", y=\"life_exp\", size=\"population\", color=\"continent\", hover_name=\"country\")\nfig.show()\n```" },
            ],
          },
        ],
      },
      {
        title: "Machine Learning",
        description: "Building predictive models",
        lessons: [
          {
            title: "Supervised Learning",
            type: "video",
            summary: "Regression and classification with scikit-learn.",
            videoUrl: "https://cdn.learnsphere.app/videos/ds-ml.mp4",
            blocks: [
              { type: "markdown", title: "Machine Learning", content: "# Supervised Learning\n\n```python\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.metrics import classification_report\n\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)\nmodel = RandomForestClassifier(n_estimators=100)\nmodel.fit(X_train, y_train)\n\ny_pred = model.predict(X_test)\nprint(classification_report(y_test, y_pred))\n```" },
            ],
          },
        ],
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Course Generation
// ═══════════════════════════════════════════════════════════════════════════════

function generateCourse(category: string, topic: string, index: number): SeedCourse {
  const levels: ("beginner" | "intermediate" | "advanced")[] = ["beginner", "intermediate", "advanced"];
  const level = pick(levels);
  const isFree = Math.random() > 0.65;
  const hours = randInt(3, 14);
  const sectionCount = randInt(3, 5);

  const sections: SeedSection[] = [];
  for (let s = 0; s < sectionCount; s++) {
    const prefix = pick(SECTION_PREFIXES);
    const sectionTitle = `${prefix} ${topic}`;
    const lessonCount = randInt(3, 5);
    const lessons: SeedSection["lessons"] = [];

    for (let l = 0; l < lessonCount; l++) {
      const roll = Math.random();
      const lessonType: "video" | "article" | "quiz" | "coding" =
        roll < 0.55 ? "video" : roll < 0.80 ? "article" : roll < 0.93 ? "quiz" : "coding";
      const suffix = pick(LESSON_SUFFIXES);
      const lessonTitle = l === 0 && s === 0 ? `${topic}: ${suffix}` : `${prefix} ${suffix}`;

      const blocks: SeedSection["lessons"][number]["blocks"] = [
        {
          type: "markdown",
          title: "Overview",
          content: `# ${lessonTitle}\n\nThis lesson covers key aspects of ${topic.toLowerCase()} within the context of ${sectionTitle.toLowerCase()}. You will learn practical techniques and best practices that you can apply immediately.\n\n## Learning Objectives\n\n- Understand the core principles of ${topic.toLowerCase()}\n- Identify common patterns and best practices\n- Apply techniques through hands-on exercises`,
        },
      ];

      if (Math.random() > 0.4) {
        blocks.push({
          type: "callout",
          title: "Key Takeaway",
          content: `Mastering ${lessonTitle.toLowerCase()} is essential for practical ${topic.toLowerCase()} skills. Focus on the core principles and apply them in your exercises.`,
        });
      }

      if (lessonType === "coding") {
        blocks.push({
          type: "code",
          title: "Starter Code",
          content: "```typescript\n// Your implementation here\nfunction solution(input: unknown): unknown {\n  // TODO: implement\n  return null;\n}\n```",
        });
      }

      if (lessonType === "video" && Math.random() > 0.5) {
        blocks.push({ type: "image", title: "Visual Reference", content: pick(HERO_IMAGES) });
      }

      lessons.push({
        title: lessonTitle,
        type: lessonType,
        summary: `Learn about ${topic.toLowerCase()} - ${lessonTitle.toLowerCase()} with practical examples.`,
        videoUrl: lessonType === "video" ? `https://cdn.learnsphere.app/videos/${slugify(topic)}-${s}-${l}.mp4` : undefined,
        blocks,
      });
    }

    sections.push({
      title: sectionTitle,
      description: `Covering essential aspects of ${topic.toLowerCase()} in the context of ${sectionTitle.toLowerCase()}.`,
      lessons,
    });
  }

  const slugBase = slugify(topic);
  const titlePrefix = pick(["Complete", "Mastering", "The Ultimate", "Practical", "Comprehensive"]);

  return {
    title: `${titlePrefix} ${topic}`,
    slug: `${slugBase}-${index}`,
    category,
    level,
    language: pick(["English", "English", "English / subtitles"]),
    summary: `Master ${topic.toLowerCase()} with hands-on projects, real-world case studies, and expert instruction.`,
    description: `A comprehensive course on ${topic.toLowerCase()} covering ${level} concepts through practical application. Build real projects and gain the skills needed to excel in ${topic.toLowerCase()}.`,
    estimatedHours: hours,
    isFree,
    priceCents: isFree ? undefined : randInt(1999, 9999),
    thumbnailUrl: pick(THUMBNAILS),
    heroImageUrl: pick(HERO_IMAGES),
    accentGradient: pick(GRADIENTS),
    sections,
  };
}

function generateAllCourses(count: number): SeedCourse[] {
  const allTopics: { category: string; topic: string }[] = [];
  for (const [cat, topics] of Object.entries(CATEGORIES)) {
    for (const topic of topics) {
      allTopics.push({ category: cat, topic });
    }
  }
  const shuffled = shuffle(allTopics);
  const result: SeedCourse[] = [];
  for (let i = 0; i < count; i++) {
    const pick_ = shuffled[i % shuffled.length];
    result.push(generateCourse(pick_.category, pick_.topic, i));
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════════════════════

const LEARNER_COUNT = 200;
const INSTRUCTOR_COUNT = 40;
const ADMIN_COUNT = 10;
const GENERATED_COURSE_COUNT = 94;
const TARGET_ENROLLMENTS = 2000;

async function main() {
  console.log("Cleaning existing data...");
  await prisma.assessment_answer.deleteMany();
  await prisma.assessment_attempt.deleteMany();
  await prisma.coding_submission.deleteMany();
  await prisma.lesson_note.deleteMany();
  await prisma.lesson_progress.deleteMany();
  await prisma.course_review.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.assessment_question.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.coding_exercise.deleteMany();
  await prisma.content_block.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.section.deleteMany();
  await prisma.course_instructor.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user_profile.deleteMany();
  await prisma.user.deleteMany();

  // ─── Users ──────────────────────────────────────────────────────────────
  console.log(`Creating ${LEARNER_COUNT + INSTRUCTOR_COUNT + ADMIN_COUNT} users...`);
  const commonPassword = await hash("Password123!");
  const usedEmails = new Set<string>();

  function makeEmail(first: string, last: string): string {
    let base = `${first.toLowerCase()}.${last.toLowerCase()}`;
    let email = `${base}@learnsphere.app`;
    let suffix = 1;
    while (usedEmails.has(email)) {
      email = `${base}${suffix}@learnsphere.app`;
      suffix++;
    }
    usedEmails.add(email);
    return email;
  }

  const namePairs = shuffle(
    FIRST_NAMES.slice(0, 100).flatMap((f) => LAST_NAMES.slice(0, 60).map((l) => ({ first: f, last: l }))),
  );

  const learnerSeeds = namePairs.slice(0, LEARNER_COUNT).map(({ first, last }) => ({
    name: `${first} ${last}`,
    email: makeEmail(first, last),
    role: "learner" as const,
    avatar: pick(AVATARS),
    headline: pick(["Aspiring Developer", "Self-taught Programmer", "Career Switcher", "CS Student", "Lifelong Learner", "Bootcamp Graduate", "Junior Developer", "Freelancer"]),
    major: pick(["Computer Science", "Data Science", "Design", "Marketing", "Business", "Information Technology", "Electrical Engineering", "Mathematics"]),
    plan: pick(["Free Plan", "Premium Student", "Pro Plan", "Premium Student"]),
  }));

  const instructorSeeds = namePairs.slice(LEARNER_COUNT, LEARNER_COUNT + INSTRUCTOR_COUNT).map(({ first, last }) => ({
    name: `${first} ${last}`,
    email: makeEmail(first, last),
    role: "instructor" as const,
    avatar: pick(AVATARS),
    headline: pick(INSTRUCTOR_HEADLINES),
    major: pick(INSTRUCTOR_MAJORS),
    plan: "Instructor",
  }));

  const adminSeeds = namePairs.slice(LEARNER_COUNT + INSTRUCTOR_COUNT, LEARNER_COUNT + INSTRUCTOR_COUNT + ADMIN_COUNT).map(({ first, last }) => ({
    name: `${first} ${last}`,
    email: makeEmail(first, last),
    role: "admin" as const,
    avatar: pick(AVATARS),
    headline: pick(["Platform Administrator", "System Admin", "DevOps Admin", "Content Manager", "Support Admin"]),
    major: pick(["System Administration", "Information Technology", "Computer Science"]),
    plan: "Admin",
  }));

  const allUserSeeds = [...learnerSeeds, ...instructorSeeds, ...adminSeeds];

  await batchInsert(allUserSeeds, 500, async (batch) => {
    await prisma.user.createMany({
      data: batch.map((u) => ({ name: u.name, email: u.email, password: commonPassword, role: u.role })),
    });
  });

  const dbUsers = await prisma.user.findMany({ select: { id: true, email: true, role: true } });
  const userByEmail = Object.fromEntries(dbUsers.map((u) => [u.email, u.id]));
  const learnerIds = dbUsers.filter((u) => u.role === "learner").map((u) => u.id);
  const instructorUsers = dbUsers.filter((u) => u.role === "instructor");

  await batchInsert(
    allUserSeeds.map((u) => ({ user_id: userByEmail[u.email], avatar_url: u.avatar, headline: u.headline, major: u.major, plan: u.plan })),
    500,
    async (batch) => { await prisma.user_profile.createMany({ data: batch }); },
  );

  console.log(`  Users: ${dbUsers.length} (learners: ${learnerIds.length}, instructors: ${instructorUsers.length})`);

  // ─── Courses, Sections, Lessons, Blocks, Assessments ────────────────────
  const generatedCourses = generateAllCourses(GENERATED_COURSE_COUNT);
  const allCourses = [...courses, ...generatedCourses];
  console.log(`Creating ${allCourses.length} courses...`);

  const contentBlockRows: {
    lesson_id: string; block_type: "markdown" | "code" | "callout" | "image"; title: string; position: number;
    markdown_content: string | null; code_content: string | null; asset_url: string | null; code_language: string | null;
  }[] = [];
  const questionRows: {
    assessment_id: string; prompt: string; explanation: string; question_type: "multiple_choice" | "true_false" | "short_answer" | "coding" | "multi_select";
    position: number; points: number; options_json: string[]; correct_answer_json: string[];
  }[] = [];
  const codingExerciseRows: {
    lesson_id: string; title: string; slug: string; instructions: string;
    language: string; difficulty: string; position: number;
    starter_code: string; solution_code: string; test_cases_json: object[];
  }[] = [];

  // Track lessons per course for enrollment progress generation
  const courseLessonMap: Record<string, string[]> = {};

  for (const [idx, course] of allCourses.entries()) {
    const instructorId = instructorUsers[idx % instructorUsers.length].id;

    const createdCourse = await prisma.course.create({
      data: {
        slug: course.slug, title: course.title, summary: course.summary, description: course.description,
        category: course.category, level: course.level, status: "published", language: course.language,
        thumbnail_url: course.thumbnailUrl, hero_image_url: course.heroImageUrl, accent_gradient: course.accentGradient,
        estimated_hours: course.estimatedHours, estimated_minutes: course.estimatedHours * 60,
        is_featured: idx < 6, is_free: course.isFree, price_cents: course.priceCents,
        created_by_id: instructorId, published_at: new Date(Date.now() - idx * 2 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.course_instructor.create({
      data: {
        course_id: createdCourse.id, instructor_id: instructorId,
        title: allUserSeeds.find((u) => u.email === instructorUsers[idx % instructorUsers.length].email)?.headline ?? "Instructor",
        is_primary: true,
      },
    });

    const lessonIdsForCourse: string[] = [];

    for (const [sIdx, section] of course.sections.entries()) {
      const createdSection = await prisma.section.create({
        data: {
          course_id: createdCourse.id, title: section.title, slug: slugify(section.title),
          description: section.description, position: sIdx + 1,
          estimated_minutes: section.lessons.reduce((sum) => sum + 10 + Math.round(Math.random() * 15), 0),
        },
      });

      for (const [lIdx, lesson] of section.lessons.entries()) {
        const createdLesson = await prisma.lesson.create({
          data: {
            section_id: createdSection.id, slug: slugify(lesson.title), title: lesson.title,
            summary: lesson.summary, lesson_type: lesson.type, status: "published", position: lIdx + 1,
            estimated_minutes: 8 + lIdx * 4 + Math.round(Math.random() * 5),
            is_preview: lIdx === 0 && sIdx === 0, video_url: lesson.videoUrl ?? null,
            transcript: lesson.type === "video" ? `Full transcript for: ${lesson.title}.` : null,
          },
        });

        lessonIdsForCourse.push(createdLesson.id);

        for (const [bIdx, block] of lesson.blocks.entries()) {
          contentBlockRows.push({
            lesson_id: createdLesson.id, block_type: block.type, title: block.title, position: bIdx + 1,
            markdown_content: block.type === "markdown" || block.type === "callout" ? block.content : null,
            code_content: block.type === "code" ? block.content : null,
            asset_url: block.type === "image" ? block.content : null,
            code_language: block.type === "code" ? "typescript" : null as string | null,
          });
        }

        const createdAssessment = await prisma.assessment.create({
          data: {
            course_id: createdCourse.id, section_id: createdSection.id, lesson_id: createdLesson.id,
            title: `${lesson.title} Checkpoint`, description: `Assessment for: ${lesson.title}`,
            assessment_type: lesson.type === "quiz" ? "quiz" : "practice", position: lIdx + 1,
            passing_score: 70, max_attempts: 3, is_published: true,
          },
        });

        questionRows.push({
          assessment_id: createdAssessment.id,
          prompt: `What is the key takeaway from "${lesson.title}"?`,
          explanation: "Review the lesson content if you need a refresher.",
          question_type: "multiple_choice", position: 1, points: 1,
          options_json: ["Apply the concepts in practice", "Skip the material", "Just watch the video"],
          correct_answer_json: ["Apply the concepts in practice"],
        });
        questionRows.push({
          assessment_id: createdAssessment.id,
          prompt: "True or False: Consistent practice leads to better learning outcomes.",
          explanation: "Research shows spaced repetition and practice are key to retention.",
          question_type: "true_false", position: 2, points: 1,
          options_json: ["True", "False"], correct_answer_json: ["True"],
        });
        questionRows.push({
          assessment_id: createdAssessment.id,
          prompt: `Describe how you would apply "${lesson.title}" in a real project.`,
          explanation: "Think about practical applications and real-world scenarios.",
          question_type: "short_answer", position: 3, points: 2,
          options_json: [], correct_answer_json: [],
        });

        if (lesson.type === "coding") {
          codingExerciseRows.push({
            lesson_id: createdLesson.id, title: `${lesson.title} Practice`,
            slug: slugify(`${lesson.title} Practice`),
            instructions: `Complete the coding exercise for "${lesson.title}". Write clean, well-documented code.`,
            language: "typescript", difficulty: "beginner", position: 1,
            starter_code: "// Write your solution here\nfunction solution(input: unknown): unknown {\n  // TODO: implement\n  return null;\n}\n",
            solution_code: "function solution(input: unknown): unknown {\n  return input;\n}\n",
            test_cases_json: [{ input: ["test"], expected: "test" }] as Record<string, unknown>[],
          });
        }
      }
    }

    courseLessonMap[createdCourse.id] = lessonIdsForCourse;

    if (idx % 20 === 0) console.log(`  Course ${idx + 1}/${allCourses.length} done...`);
  }

  console.log(`  Inserting ${contentBlockRows.length} content blocks...`);
  await batchInsert(contentBlockRows, 500, async (batch) => { await prisma.content_block.createMany({ data: batch }); });

  console.log(`  Inserting ${questionRows.length} assessment questions...`);
  await batchInsert(questionRows, 500, async (batch) => { await prisma.assessment_question.createMany({ data: batch }); });

  console.log(`  Inserting ${codingExerciseRows.length} coding exercises...`);
  if (codingExerciseRows.length > 0) {
    await batchInsert(codingExerciseRows, 500, async (batch) => { await prisma.coding_exercise.createMany({ data: batch }); });
  }

  // ─── Enrollments ────────────────────────────────────────────────────────
  console.log(`Creating ${TARGET_ENROLLMENTS} enrollments...`);
  const enrollmentSet = new Set<string>();
  const enrollmentRows: {
    course_id: string; user_id: string; status: "active" | "completed" | "paused" | "dropped"; progress_percent: number;
    started_at: Date; last_accessed_at: Date; completed_at: Date | null;
  }[] = [];

  const courseIds = courseLessonMap ? Object.keys(courseLessonMap) : [];
  while (enrollmentRows.length < TARGET_ENROLLMENTS && enrollmentSet.size < learnerIds.length * courseIds.length) {
    const learnerId = pick(learnerIds);
    const courseId = pick(courseIds);
    const key = `${learnerId}-${courseId}`;
    if (enrollmentSet.has(key)) continue;
    enrollmentSet.add(key);

    const progressPercent = Math.min(100, Math.max(0, Math.round(20 + Math.random() * 80)));
    enrollmentRows.push({
      course_id: courseId, user_id: learnerId,
      status: progressPercent >= 100 ? "completed" : "active",
      progress_percent: progressPercent,
      started_at: new Date(Date.now() - progressPercent * 24 * 60 * 60 * 1000),
      last_accessed_at: new Date(Date.now() - Math.round(Math.random() * 7) * 24 * 60 * 60 * 1000),
      completed_at: progressPercent >= 100 ? new Date() : null,
    });
  }

  await batchInsert(enrollmentRows, 500, async (batch) => { await prisma.enrollment.createMany({ data: batch }); });
  console.log(`  Enrollments: ${enrollmentRows.length}`);

  // ─── Lesson Progress ────────────────────────────────────────────────────
  console.log("Creating lesson progress...");
  const progressRows: {
    lesson_id: string; user_id: string; status: "not_started" | "in_progress" | "completed"; progress_percent: number;
    watch_position_seconds: number; started_at: Date | null; last_viewed_at: Date | null; completed_at: Date | null;
  }[] = [];

  for (const enr of enrollmentRows) {
    const lessonIds = courseLessonMap[enr.course_id] ?? [];
    for (const lessonId of lessonIds) {
      if (Math.random() < 0.3) continue; // 30% of lessons have no progress record
      const roll = Math.random();
      const status = roll > 0.6 ? "completed" : roll > 0.25 ? "in_progress" : "not_started";
      progressRows.push({
        lesson_id: lessonId, user_id: enr.user_id, status,
        progress_percent: status === "completed" ? 100 : status === "in_progress" ? 30 + Math.round(Math.random() * 50) : 0,
        watch_position_seconds: status === "in_progress" ? Math.round(Math.random() * 300) : 0,
        started_at: status !== "not_started" ? new Date(Date.now() - Math.round(Math.random() * 14) * 24 * 60 * 60 * 1000) : null,
        last_viewed_at: status !== "not_started" ? new Date(Date.now() - Math.round(Math.random() * 3) * 24 * 60 * 60 * 1000) : null,
        completed_at: status === "completed" ? new Date() : null,
      });
    }
  }

  await batchInsert(progressRows, 500, async (batch) => { await prisma.lesson_progress.createMany({ data: batch }); });
  console.log(`  Lesson progress: ${progressRows.length}`);

  // ─── Course Reviews ─────────────────────────────────────────────────────
  console.log("Creating course reviews...");
  const reviewSet = new Set<string>();
  const reviewRows: { course_id: string; user_id: string; rating: number; review: string }[] = [];

  for (const enr of enrollmentRows) {
    if (Math.random() > 0.45) continue; // ~45% of enrollments get a review
    const key = `${enr.course_id}-${enr.user_id}`;
    if (reviewSet.has(key)) continue;
    reviewSet.add(key);
    const cat = allCourses.find((c) => { const cid = courseIds.indexOf(enr.course_id); return cid >= 0; })?.category ?? "course";
    reviewRows.push({
      course_id: enr.course_id, user_id: enr.user_id,
      rating: 3 + Math.round(Math.random() * 2),
      review: pick(REVIEW_TEMPLATES)(cat),
    });
  }

  await batchInsert(reviewRows, 500, async (batch) => { await prisma.course_review.createMany({ data: batch }); });
  console.log(`  Reviews: ${reviewRows.length}`);

  // ─── Certificates ───────────────────────────────────────────────────────
  console.log("Creating certificates...");
  const certRows: {
    course_id: string; user_id: string; status: "issued" | "revoked" | "expired"; serial_number: string;
    certificate_url: string; issued_at: Date;
  }[] = [];

  for (const enr of enrollmentRows) {
    if (enr.progress_percent < 80 || Math.random() > 0.25) continue;
    const serial = `NH-CERT-${enr.course_id.slice(0, 8).toUpperCase()}-${enr.user_id.slice(0, 8).toUpperCase()}`;
    certRows.push({
      course_id: enr.course_id, user_id: enr.user_id, status: "issued",
      serial_number: serial, certificate_url: `https://certificates.learnsphere.app/${serial}`,
      issued_at: new Date(),
    });
  }

  if (certRows.length > 0) {
    await batchInsert(certRows, 500, async (batch) => { await prisma.certificate.createMany({ data: batch }); });
  }
  console.log(`  Certificates: ${certRows.length}`);

  // ─── Assessment Attempts & Answers ──────────────────────────────────────
  console.log("Creating assessment attempts...");
  const assessmentIds: string[] = [];
  const assessments = await prisma.assessment.findMany({ select: { id: true, course_id: true } });
  for (const a of assessments) assessmentIds.push(a.id);

  const attemptRows: {
    assessment_id: string; user_id: string; status: "in_progress" | "submitted" | "graded" | "abandoned"; score: number; max_score: number;
    started_at: Date; submitted_at: Date; graded_at: Date; feedback: string;
  }[] = [];

  for (const enr of enrollmentRows) {
    const courseAssessments = assessments.filter((a) => a.course_id === enr.course_id);
    const numAttempts = Math.min(courseAssessments.length, randInt(1, 4));
    const sampledAssessments = shuffle(courseAssessments).slice(0, numAttempts);
    for (const ass of sampledAssessments) {
      const maxScore = 3;
      const score = randInt(0, maxScore);
      const started = new Date(Date.now() - randInt(1, 30) * 24 * 60 * 60 * 1000);
      const submitted = new Date(started.getTime() + randInt(5, 60) * 60 * 1000);
      attemptRows.push({
        assessment_id: ass.id, user_id: enr.user_id, status: "graded",
        score, max_score: maxScore, started_at: started, submitted_at: submitted,
        graded_at: submitted, feedback: score >= maxScore * 0.7 ? "Good work!" : "Review the material and try again.",
      });
    }
  }

  await batchInsert(attemptRows, 500, async (batch) => { await prisma.assessment_attempt.createMany({ data: batch }); });
  console.log(`  Assessment attempts: ${attemptRows.length}`);

  console.log("Creating assessment answers...");
  const attempts = await prisma.assessment_attempt.findMany({ select: { id: true, assessment_id: true } });
  const questions = await prisma.assessment_question.findMany({ select: { id: true, assessment_id: true } });
  const questionsByAssessment: Record<string, typeof questions> = {};
  for (const q of questions) {
    (questionsByAssessment[q.assessment_id] ??= []).push(q);
  }

  const answerRows: {
    attempt_id: string; question_id: string; answer_json: string[];
    is_correct: boolean; points_awarded: number; feedback: string;
  }[] = [];

  for (const attempt of attempts) {
    const qs = questionsByAssessment[attempt.assessment_id] ?? [];
    for (const q of qs) {
      const isCorrect = Math.random() > 0.35;
      answerRows.push({
        attempt_id: attempt.id, question_id: q.id,
        answer_json: isCorrect ? ["Correct answer"] : ["Wrong answer"],
        is_correct: isCorrect, points_awarded: isCorrect ? 1 : 0,
        feedback: isCorrect ? "Correct!" : "Review the material.",
      });
    }
  }

  await batchInsert(answerRows, 500, async (batch) => { await prisma.assessment_answer.createMany({ data: batch }); });
  console.log(`  Assessment answers: ${answerRows.length}`);

  // ─── Coding Submissions ─────────────────────────────────────────────────
  console.log("Creating coding submissions...");
  const exercises = await prisma.coding_exercise.findMany({ select: { id: true, lesson_id: true } });
  const submissionRows: {
    exercise_id: string; user_id: string; status: "draft" | "submitted" | "passed" | "failed" | "needs_review"; source_code: string;
    language: string; score: number; execution_time_ms: number; submitted_at: Date;
  }[] = [];

  for (const enr of enrollmentRows) {
    const lessonIds = courseLessonMap[enr.course_id] ?? [];
    const enrolledExercises = exercises.filter((e) => e.lesson_id && lessonIds.includes(e.lesson_id));
    const numSubmissions = randInt(0, Math.min(3, enrolledExercises.length));
    for (const ex of shuffle(enrolledExercises).slice(0, numSubmissions)) {
      const passed = Math.random() > 0.4;
      submissionRows.push({
        exercise_id: ex.id, user_id: enr.user_id,
        status: passed ? "passed" : "failed",
        source_code: "// Student solution\nfunction solution(input: unknown): unknown {\n  return input;\n}\n",
        language: "typescript", score: passed ? randInt(80, 100) : randInt(0, 60),
        execution_time_ms: randInt(10, 500),
        submitted_at: new Date(Date.now() - randInt(1, 30) * 24 * 60 * 60 * 1000),
      });
    }
  }

  if (submissionRows.length > 0) {
    await batchInsert(submissionRows, 500, async (batch) => { await prisma.coding_submission.createMany({ data: batch }); });
  }
  console.log(`  Coding submissions: ${submissionRows.length}`);

  // ─── Lesson Notes ───────────────────────────────────────────────────────
  console.log("Creating lesson notes...");
  const noteRows: {
    user_id: string; course_id: string; lesson_id: string; title: string;
    content: string; visibility: "private" | "shared";
  }[] = [];

  for (const enr of enrollmentRows) {
    const lessonIds = courseLessonMap[enr.course_id] ?? [];
    const numNotes = randInt(0, Math.min(3, lessonIds.length));
    for (const lid of shuffle(lessonIds).slice(0, numNotes)) {
      noteRows.push({
        user_id: enr.user_id, course_id: enr.course_id, lesson_id: lid,
        title: `Note on lesson`, content: pick(NOTE_CONTENTS),
        visibility: Math.random() > 0.8 ? "shared" : "private",
      });
    }
  }

  if (noteRows.length > 0) {
    await batchInsert(noteRows, 500, async (batch) => { await prisma.lesson_note.createMany({ data: batch }); });
  }
  console.log(`  Lesson notes: ${noteRows.length}`);

  // ─── Summary ────────────────────────────────────────────────────────────
  console.log("\nSeeding complete!");
  console.log(`  Users: ${dbUsers.length}`);
  console.log(`  Courses: ${allCourses.length}`);
  console.log(`  Content blocks: ${contentBlockRows.length}`);
  console.log(`  Assessment questions: ${questionRows.length}`);
  console.log(`  Enrollments: ${enrollmentRows.length}`);
  console.log(`  Lesson progress: ${progressRows.length}`);
  console.log(`  Reviews: ${reviewRows.length}`);
  console.log(`  Certificates: ${certRows.length}`);
  console.log(`  Assessment attempts: ${attemptRows.length}`);
  console.log(`  Assessment answers: ${answerRows.length}`);
  console.log(`  Coding submissions: ${submissionRows.length}`);
  console.log(`  Lesson notes: ${noteRows.length}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
