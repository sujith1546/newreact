import knowledge from '../data/knowledge.json';

// Flatten the entire knowledge base into searchable text chunks
export function buildKnowledgeChunks() {
  const chunks = [];

  // Personal info
  chunks.push({
    id: 'personal',
    text: `My name is ${knowledge.personal.name}, also known as Sujith. ${knowledge.personal.bio} My email is ${knowledge.personal.email}. My phone is ${knowledge.personal.phone}. I am based in ${knowledge.personal.location}. ${knowledge.personal.availability}. ${knowledge.personal.workingHours}. ${knowledge.personal.responseTime}.`
  });

  // Education
  knowledge.education.forEach((edu, i) => {
    chunks.push({
      id: `education_${i}`,
      text: `Education: I studied ${edu.degree} in ${edu.field || ''} at ${edu.institution}, ${edu.location} from ${edu.period}. ${edu.cgpa ? `My CGPA is ${edu.cgpa}.` : ''} ${edu.score ? `My score was ${edu.score}.` : ''} ${edu.highlights ? `Key highlights: ${edu.highlights.join(', ')}.` : ''}`
    });
  });

  // Projects
  knowledge.projects.forEach((proj, i) => {
    chunks.push({
      id: `project_${i}`,
      text: `Project: ${proj.title} - ${proj.description} Technologies used: ${proj.tags.join(', ')}. This is a ${proj.type} project.`
    });
  });

  // Skills
  chunks.push({
    id: 'skills_languages',
    text: `Programming languages I know: ${knowledge.skills.languages.join(', ')}.`
  });
  chunks.push({
    id: 'skills_ml',
    text: `Machine Learning and Data Science skills: ${knowledge.skills.ml_data_science.join(', ')}.`
  });
  chunks.push({
    id: 'skills_ai',
    text: `AI and LLM skills: ${knowledge.skills.ai_llm.join(', ')}.`
  });
  chunks.push({
    id: 'skills_web',
    text: `Web development skills: ${knowledge.skills.web.join(', ')}.`
  });
  chunks.push({
    id: 'skills_tools',
    text: `Tools and DevOps: ${knowledge.skills.tools.join(', ')}.`
  });
  chunks.push({
    id: 'skills_learning',
    text: `I am currently learning: ${knowledge.skills.learning.join(', ')}.`
  });

  // Stats
  chunks.push({
    id: 'stats',
    text: `Quick stats: I have ${knowledge.stats.yearsOfCoding} years of coding experience, shipped ${knowledge.stats.projectsShipped} projects, solved ${knowledge.stats.dsaSolved} DSA problems, and have a CGPA of ${knowledge.stats.cgpa}.`
  });

  // Contact & availability
  chunks.push({
    id: 'contact',
    text: `How to reach me: Email at ${knowledge.personal.email}. LinkedIn at ${knowledge.personal.linkedin}. GitHub at ${knowledge.personal.github}. I prefer ${knowledge.contact.preferredContact}. I am open to: ${knowledge.contact.openTo.join(', ')}.`
  });

  // Hobbies
  chunks.push({
    id: 'hobbies',
    text: `Beyond work, my hobbies and interests include: ${knowledge.hobbies.join(', ')}.`
  });

  // FAQs
  knowledge.faq.forEach((item, i) => {
    chunks.push({
      id: `faq_${i}`,
      text: `Q: ${item.q} A: ${item.a}`
    });
  });

  return chunks;
}
