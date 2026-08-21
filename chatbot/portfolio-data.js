/**
 * portfolioData.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Central data store for the AI chatbot.
 * All information is sourced from the existing portfolio HTML.
 * Update this file whenever you add new projects / skills / certifications.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const portfolioData = {
  name: "Pavalan Ganesan",

  role: "Computer Science Student & Full-Stack Developer",

  about:
    "I am Pavalan G, a BE Computer Science and Engineering student under Anna University. " +
    "I have a strong interest in backend development and full-stack web technology. " +
    "I enjoy solving problems, building real-time applications, and continuously learning. " +
    "My goal is to become a skilled software developer and work on impactful real-world projects.",

  taglines: ["Content Writer", "Python Developer", "MERN Stack Developer"],

  skills: {
    frontend: ["HTML5 (95%)", "CSS3 (87%)", "JavaScript (75%)", "React JS", "TailwindCSS"],
    backend: ["Node.js (50%)", "Express.js (45%)"],
    database: ["MySQL (35%)", "MongoDB (30%)"],
    programmingLanguages: ["JavaScript", "Python (40%)"],
    tools: ["Git", "GitHub (55%)", "VS Code (75%)"],
  },

  projects: [
    {
      name: "Fi-Pi Tracker",
      description:
        "A personal finance tracking application that tracks daily life financial expenses based on user income.",
      technologies: [
        "React JS",
        "MongoDB",
        "Express JS",
        "Node JS",
        "TailwindCSS",
        "Clerk User Authentication",
      ],
      demo: "https://fi-pi-tracker-system.onrender.com/",
      github: "https://github.com/Pavalanganesan2368/Fi-Pi-Tracker-System.git",
    },
    {
      name: "Blog-Day Application",
      description:
        "A blogging platform where users can post their daily life activities for the world to see.",
      technologies: ["React JS", "MongoDB", "Express JS", "Node JS", "TailwindCSS"],
      demo: "https://mern-blog-day-application.onrender.com/",
      github: "https://github.com/Pavalanganesan2368/MERN-Blog-Day-Application.git",
    },
    {
      name: "Technotes Application",
      description:
        "A role-based task management system where the owner can assign roles and tasks to users.",
      technologies: [
        "React JS",
        "MongoDB",
        "Express JS",
        "Node JS",
        "TailwindCSS",
        "RTK Query",
      ],
      demo: "https://mern-technotes-application.onrender.com/",
      github: "https://github.com/Pavalanganesan2368/MERN_TechNotes_Application.git",
    },
  ],

  education: [
    {
      degree: "BE – Computer Science and Engineering",
      institution: "GCES (Anna University)",
      cgpa: "7.78",
      status: "Currently pursuing",
    },
  ],

  certifications: [],

  experience: [],

  contact: {
    email: "pavalanganesan2368@gmail.com",
    phone: "+91 96291 52781",
    github: "https://github.com/pavalanganesan2368",
    linkedin: "https://linkedin.com/in/pavalanganesan",
  },

  availability: "Open to internship and entry-level developer opportunities.",
};
