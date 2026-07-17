// src/components/skillIcons.jsx
// Central icon lookup, keyed by skill id. Keeping this separate means
// swapping an icon later is a one-line change, not a hunt through JSX.

import {
  SiPython,
  SiReact,
  SiJavascript,
  SiHtml5,
  SiCss,
  SiTailwindcss,
  SiGit,
  SiGithub,
  SiFigma,
  SiTypescript,
  SiNextdotjs,
  SiDocker,
  SiGraphql,
  SiTensorflow,
  SiScikitlearn,
  SiNumpy,
  SiPandas,
  SiLangchain,
} from "react-icons/si";
import { FaJava, FaAws } from "react-icons/fa";
import {
  TbDatabase,
  TbUsers,
  TbBulb,
  TbMessageCircle,
  TbRefresh,
  TbRocket,
  TbCloud,
  TbCode,
  TbBrain,
  TbChartLine,
} from "react-icons/tb";

export const skillIconMap = {
  java: FaJava,
  python: SiPython,
  react: SiReact,
  javascript: SiJavascript,
  html5: SiHtml5,
  css3: SiCss,
  tailwind: SiTailwindcss,
  sql: TbDatabase,
  git: SiGit,
  github: SiGithub,
  figma: SiFigma,
  "problem-solving": TbBulb,
  "team-collaboration": TbUsers,
  communication: TbMessageCircle,
  adaptability: TbRefresh,
  typescript: SiTypescript,
  nextjs: SiNextdotjs,
  aws: FaAws,
  docker: SiDocker,
  graphql: SiGraphql,
  tensorflow: SiTensorflow,
  scikitlearn: SiScikitlearn,
  numpy: SiNumpy,
  pandas: SiPandas,
  matplotlib: TbChartLine,
  langchain: SiLangchain,
};

// Fallback so an unmapped skill never renders a blank icon slot.
export const fallbackIcon = TbCode;

export function getSkillIcon(skillId) {
  return skillIconMap[skillId] || fallbackIcon;
}

export const categoryIconMap = {
  languages: TbCode,
  web: TbCode,
  database: TbDatabase,
  ml: TbBrain,
  soft: TbUsers,
  exploring: TbRocket,
};
