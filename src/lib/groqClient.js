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

    return `You are an AI assistant built to represent the creator of this portfolio website. 
Your goal is to answer questions concisely, professionally, and enthusiastically based on the following data:

Profile: ${settings.hero_headline || 'Software Engineer'}
Bio: ${settings.short_bio || ''}
Skills: ${skills}
Experience: ${experience}
Projects: ${projects}

Rules:
1. Keep answers brief (1-3 sentences max). This is a chat widget.
2. If asked something not in your context, say you aren't sure but the visitor can reach out via the contact form.
3. Be friendly and conversational.
4. Speak in the first person ("I built this", "My experience").`;

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
