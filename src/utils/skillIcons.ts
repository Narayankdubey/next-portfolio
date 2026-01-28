// React Icons - Technology Brand Logos
import {
  SiReact,
  SiNextdotjs,
  SiMui,
  SiAntdesign,
  SiRedux,
  SiJavascript,
  SiHtml5,
  SiCss3,
  SiNodedotjs,
  SiExpress,
  SiNestjs,
  SiPostgresql,
  SiMongodb,
  SiGit,
  SiGithub,
  SiJira,
  SiDocker,
  SiJenkins,
  SiGraphql,
  SiRedis,
} from "react-icons/si";

// Lucide Icons for generic items
import { Server, TestTube, Users, BookOpen, Code2 } from "lucide-react";
import { IconType } from "react-icons";
import { LucideIcon } from "lucide-react";

export type SkillIconType = IconType | LucideIcon;

export interface SkillIconMapping {
  [key: string]: SkillIconType;
}

// Comprehensive icon mapping for all skills using actual brand logos
export const skillIcons: SkillIconMapping = {
  // Frontend - Using brand icons from Simple Icons
  React: SiReact,
  "Next.js": SiNextdotjs,
  "React Native": SiReact, // React Native uses React logo
  "Material UI": SiMui,
  "Ant Design": SiAntdesign,
  Redux: SiRedux,
  JavaScript: SiJavascript,
  HTML5: SiHtml5,
  CSS3: SiCss3,

  // Backend - Using brand icons
  "Node.js": SiNodedotjs,
  Express: SiExpress,
  NestJS: SiNestjs,
  PostgreSQL: SiPostgresql,
  MongoDB: SiMongodb,
  Redis: SiRedis,

  // Tools - Using brand icons
  Git: SiGit,
  GitHub: SiGithub,
  Jira: SiJira,
  Docker: SiDocker,
  Jenkins: SiJenkins,
  GraphQL: SiGraphql,

  // Other - Generic icons
  "RESTful APIs": Server,
  "Unit Testing": TestTube,
  Agile: Users,
  "React Testing Library": BookOpen,
};

export const skillColors: { [key: string]: string } = {
  // Frontend - Brand colors
  React: "from-[#61DAFB] to-[#21A1C4]", // React cyan
  "Next.js": "from-gray-800 to-black", // Next.js black
  "React Native": "from-[#61DAFB] to-[#21A1C4]", // React cyan
  "Material UI": "from-[#007FFF] to-[#0059B2]", // MUI blue
  "Ant Design": "from-[#1890FF] to-[#096DD9]", // Ant Design blue
  Redux: "from-[#764ABC] to-[#593D88]", // Redux purple
  JavaScript: "from-[#F7DF1E] to-[#F0DB4F]", // JS yellow
  HTML5: "from-[#E34F26] to-[#C73B1A]", // HTML orange-red
  CSS3: "from-[#1572B6] to-[#0E5A8A]", // CSS blue

  // Backend - Brand colors
  "Node.js": "from-[#339933] to-[#26752B]", // Node green
  Express: "from-gray-600 to-gray-800", // Express gray
  NestJS: "from-[#E0234E] to-[#B71D3E]", // Nest red
  PostgreSQL: "from-[#4169E1] to-[#2F4F8F]", // Postgres blue
  MongoDB: "from-[#47A248] to-[#3A8239]", // Mongo green
  Redis: "from-[#DC382D] to-[#A32A22]", // Redis red

  // Tools - Brand colors
  Git: "from-[#F05032] to-[#C73B1A]", // Git orange
  GitHub: "from-gray-700 to-black", // GitHub dark
  Jira: "from-[#0052CC] to-[#003D99]", // Jira blue
  Docker: "from-[#2496ED] to-[#1D7FCE]", // Docker blue
  Jenkins: "from-[#D24939] to-[#B13A2E]", // Jenkins red
  GraphQL: "from-[#E10098] to-[#B8007A]", // GraphQL pink

  // Other - Custom colors
  "RESTful APIs": "from-indigo-400 to-purple-500",
  "Unit Testing": "from-emerald-400 to-teal-500",
  Agile: "from-blue-400 to-purple-500",
  "React Testing Library": "from-red-400 to-pink-500",
};

// Brand hex colors for icons
export const skillBrandColors: { [key: string]: string } = {
  React: "#61DAFB",
  "Next.js": "#ffffff", // White for dark mode compatibility (or black for light)
  "React Native": "#61DAFB",
  "Material UI": "#007FFF",
  "Ant Design": "#1890FF",
  Redux: "#764ABC",
  JavaScript: "#F7DF1E",
  HTML5: "#E34F26",
  CSS3: "#1572B6",
  "Node.js": "#339933",
  Express: "#ffffff",
  NestJS: "#E0234E",
  PostgreSQL: "#4169E1",
  MongoDB: "#47A248",
  Redis: "#DC382D",
  Git: "#F05032",
  GitHub: "#ffffff",
  Jira: "#0052CC",
  Docker: "#2496ED",
  Jenkins: "#D24939",
  GraphQL: "#E10098",
  "RESTful APIs": "#818cf8",
  "Unit Testing": "#34d399",
  Agile: "#60a5fa",
  "React Testing Library": "#f87171",
};

// Helper function to get icon for a skill
export function getSkillIcon(skillName: string): SkillIconType {
  return skillIcons[skillName] || Code2; // Default to Code2 if not found
}

// Helper function to get color for a skill
export function getSkillColor(skillName: string): string {
  return skillColors[skillName] || "from-gray-400 to-gray-600"; // Default color
}

// Helper function to get brand color for icon
export function getSkillBrandColor(skillName: string): string {
  return skillBrandColors[skillName] || "#9ca3af"; // Default gray-400
}
