import Groq from "groq-sdk";
import { supabase } from "./supabaseClient";

// Groq client initialization
// Danger: Using API key in frontend is only safe if you restrict the key via quotas/origins,
// but for a personal portfolio, it's often an acceptable tradeoff for zero-backend architecture.
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true, 
});

/**
 * Fetch portfolio context to build a dynamic system prompt
 */
async function buildSystemPrompt() {
  try {
    const [settingsRes, skillsRes, expRes, projRes] = await Promise.all([
      supabase.from('site_settings').select('hero_headline, short_bio').single(),
      supabase.from('skills').select('name, proficiency_level'),
      supabase.from('experience').select('role, company, start_date, end_date'),
      supabase.from('projects').select('title, description, tags')
    ]);

    const settings = settingsRes.data || {};
    const skills = (skillsRes.data || []).map(s => s.name).join(', ');
    const experience = (expRes.data || []).map(e => `${e.role} at ${e.company}`).join('; ');
    const projects = (projRes.data || []).map(p => p.title).join(', ');

    return `You are a state-of-the-art AI Assistant integrated directly into the creator's portfolio. 
Your core directive is to act as the ultimate, hyper-intelligent representative of the creator, answering recruiter or visitor questions with supreme confidence, conciseness, and precision.

Context regarding the creator:
Profile: ${settings.hero_headline || 'Software Engineer'}
Bio: ${settings.short_bio || ''}
Skills: ${skills}
Experience: ${experience}
Projects: ${projects}

Strict Directives:
1. EXTREME PROFESSIONALISM: Speak confidently in the first person ("I built", "My expertise"). Never sound like a generic AI.
2. VISUAL FORMATTING: You must use Markdown heavily to make your answers beautiful. Use **bolding** for keywords, bullet points for lists, and \`inline code\` for tech stacks.
3. CONCISENESS: Visitors have short attention spans. Keep answers under 3-4 sentences unless explicitly asked for detail.
4. HONESTY: If asked a question completely unrelated to the provided context, gracefully admit you don't have that information loaded and suggest they use the Contact form.
5. NO HALLUCINATIONS: Do not invent skills or experiences that are not listed in the context.`;

  } catch (error) {
    console.error("Error building context:", error);
    return "You are a helpful portfolio AI assistant. Answer briefly.";
  }
}

/**
 * Generate chat response from Groq
 */
export async function generateChatResponse(messages) {
  try {
    const systemPrompt = await buildSystemPrompt();
    
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    ];

    const completion = await groq.chat.completions.create({
      messages: apiMessages,
      model: "llama-3.1-8b-instant", // Fast, highly capable model ideal for chat
      temperature: 0.5,
      max_tokens: 150,
    });

    return completion.choices[0]?.message?.content || "I'm having trouble connecting right now.";
  } catch (error) {
    console.error("Groq generation error:", error);
    return "Sorry, I am offline at the moment. Please try again later!";
  }
}
