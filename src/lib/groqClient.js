import Groq from "groq-sdk";
import { supabase } from "./supabaseClient";

/**
 * Get effective Groq client instance using environment key or dynamic Admin Vault key
 */
function getGroqClient(apiKeyOverride) {
  const localVaultKey = typeof window !== 'undefined' ? localStorage.getItem('pcms_groq_api_key') : '';
  const effectiveKey = apiKeyOverride || localVaultKey || import.meta.env.VITE_GROQ_API_KEY;
  
  if (!effectiveKey) return null;

  return new Groq({
    apiKey: effectiveKey,
    dangerouslyAllowBrowser: true,
  });
}

/**
 * Fetch portfolio context to build a dynamic system prompt
 */
async function buildSystemPrompt() {
  try {
    const [settingsRes, skillsRes, expRes, projRes] = await Promise.all([
      supabase.from('site_settings').select('hero_headline, short_bio, chatbot_system_prompt, groq_api_key').single(),
      supabase.from('skills').select('name, proficiency_level'),
      supabase.from('experience').select('role, company, start_date, end_date'),
      supabase.from('projects').select('title, description, tags')
    ]);

    const settings = settingsRes.data || {};
    const localPrompt = typeof window !== 'undefined' ? localStorage.getItem('pcms_chatbot_system_prompt') : '';
    const customPrompt = settings.chatbot_system_prompt || localPrompt;

    const skills = (skillsRes.data || []).map(s => s.name).join(', ');
    const experience = (expRes.data || []).map(e => `${e.role} at ${e.company}`).join('; ');
    const projects = (projRes.data || []).map(p => p.title).join(', ');

    const baseDirectives = customPrompt
      ? `${customPrompt}\n\nStrict Guidelines:\n- Speak concisely and professionally.\n- Format response nicely using Markdown (bolding, lists, inline code).\n- Keep answers crisp (3-4 sentences max unless asked for detail).\n- Never hallucinate unverified facts.`
      : `You are Atom AI, the intelligent portfolio assistant for Sujith Thota, a Senior Data Scientist & Full-Stack Developer.
Your core directive is to act as the ultimate, hyper-intelligent representative of the creator, answering recruiter or visitor questions with supreme confidence, conciseness, and precision.

Strict Directives:
1. EXTREME PROFESSIONALISM: Speak confidently in the first person ("I built", "My expertise"). Never sound like a generic AI.
2. VISUAL FORMATTING: You must use Markdown heavily to make your answers beautiful. Use **bolding** for keywords, bullet points for lists, and \`inline code\` for tech stacks.
3. CONCISENESS: Visitors have short attention spans. Keep answers under 3-4 sentences unless explicitly asked for detail.
4. HONESTY: If asked a question completely unrelated to the provided context, gracefully admit you don't have that information loaded and suggest they use the Contact form.
5. NO HALLUCINATIONS: Do not invent skills or experiences that are not listed in the context.`;

    return {
      prompt: `${baseDirectives}

Context regarding the creator:
Profile: ${settings.hero_headline || 'Senior Data Scientist & Full-Stack Developer'}
Bio: ${settings.short_bio || ''}
Skills: ${skills}
Experience: ${experience}
Projects: ${projects}`,
      apiKey: settings.groq_api_key
    };

  } catch (error) {
    console.error("Error building context:", error);
    return {
      prompt: "You are a helpful portfolio AI assistant. Answer briefly.",
      apiKey: null
    };
  }
}

/**
 * Generate chat response from Groq
 */
export async function generateChatResponse(messages) {
  try {
    const { prompt: systemPrompt, apiKey } = await buildSystemPrompt();
    const client = getGroqClient(apiKey);

    if (!client) {
      return "Groq AI API key is not configured. Please add your key in Admin Settings → Webhooks & Vault or set VITE_GROQ_API_KEY.";
    }
    
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    ];

    const completion = await client.chat.completions.create({
      messages: apiMessages,
      model: "llama-3.1-8b-instant", // Fast, highly capable model ideal for chat
      temperature: 0.5,
      max_tokens: 180,
    });

    return completion.choices[0]?.message?.content || "I'm having trouble connecting right now.";
  } catch (error) {
    console.error("Groq generation error:", error);
    return "Sorry, I am offline at the moment. Please try again later!";
  }
}
