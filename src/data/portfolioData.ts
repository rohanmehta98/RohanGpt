export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  link?: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  duration: string;
  description: string[];
}

export const portfolioData = {
  name: "Rohan",
  title: "Frontend Developer",
  summary:
    "I am a passionate Frontend Developer specializing in creating immersive, highly interactive web applications. I focus on building scalable user interfaces using modern tools like React, Next.js, and TypeScript.",
  skills: [
    "JavaScript/TypeScript",
    "React.js",
    "Next.js",
    "Tailwind CSS",
    "Framer Motion",
    "Node.js",
    "Git/GitHub",
    "Responsive Design",
  ],
  experience: [
    {
      id: "exp-1",
      company: "Modern Web Solutions",
      role: "Frontend Developer",
      duration: "Jan 2024 - Present",
      description: [
        "Architecting and developing premium Next.js applications.",
        "Implementing pixel-perfect UI designs with high-performance animations.",
        "Collaborating with designers and backend engineers to deliver complete features.",
      ],
    },
    {
      id: "exp-2",
      company: "Creative Agency X",
      role: "Junior Web Developer",
      duration: "Jun 2022 - Dec 2023",
      description: [
        "Built dynamic CMS-driven websites for a variety of clients.",
        "Optimized frontend bundle sizes, significantly improving core web vitals.",
        "Maintained and updated legacy React codebases.",
      ],
    },
  ] as Experience[],
  projects: [
    {
      id: "proj-1",
      title: "Bonn Modern Web Application",
      description: "A premium frontend for a cosmetic brand featuring full interactivity, shopping cart state management, and parallax scrolling.",
      techStack: ["Next.js", "React", "Tailwind CSS"],
    },
    {
      id: "proj-2",
      title: "Personal AI Portfolio",
      description: "A unique ChatGPT-styled portfolio allowing recruiters to interactively query my resume and work experience.",
      techStack: ["Next.js", "TypeScript", "Framer Motion"],
    },
  ] as Project[],
  links: {
    github: "https://github.com/rohanmehta98",
    linkedin: "https://linkedin.com/in/unknown",
    email: "mailto:rohan@example.com",
    resumeUrl: "/summary",
  },
};
