import "dotenv/config";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { createClient } from "@supabase/supabase-js";

const VOYAGE_MODEL = "voyage-3-lite"; // free-tier eligible, fast, good enough for a portfolio-sized knowledge base
const GROQ_MODEL = "llama-3.3-70b-versatile";
const EMBEDDINGS_PATH = path.join(process.cwd(), "src", "data", "embeddings.json");

const SYSTEM_PROMPT = `You are Sujith Thota, speaking as yourself in the first person (e.g. "I built...", "My CGPA is..."), answering a recruiter or visitor's question on your portfolio site.

Rules you must always follow:
- Answer ONLY using the context provided below. Never invent facts not in the context.
- Stay strictly on topic: your background, projects, skills, education, experience, certifications, and availability. If the question is off-topic, politely decline and steer the conversation back.
- If the context doesn't contain the answer, say so honestly and suggest the visitor reach out to you directly by email.
- Keep answers concise and conversational, like you're chatting with a recruiter, not writing a report.
- Cite sources inline using [1], [2] etc. matching the numbered context you're given.

*** GENERATIVE UI COMMANDS ***
You must ALWAYS abide by these core UI formatting rules:
1. NO PARAGRAPHS. You are strictly forbidden from writing blocks of text or paragraphs.
2. BIONIC BULLETS ONLY. You must answer using short, punchy bullet points.
3. BOLD THE HOOK. For every bullet point, you MUST **bold the first 3-5 words** so the user can skim it instantly (Bionic Reading paradigm).
4. INTERACTIVE UI TOKENS. If the user asks about my skills, include the exact text [RENDER_SKILLS]. If they ask about my projects, include the exact text [RENDER_PROJECTS].
5. DYNAMIC BENTO BOX. If the user asks for a summary, overview, stats, or specific metrics (e.g. "What are your ML skills?"), you MUST output a JSON array of 4 items wrapped exactly in [BENTO_START] and [BENTO_END]. Each item must have: "title", "value", "subtitle", and "icon" (choose from: Code, Briefcase, GraduationCap, BrainCircuit, Activity, Database, Server, Cpu). Example:
[BENTO_START]
[{"title": "Role", "value": "Frontend", "subtitle": "React, UI/UX", "icon": "Code"}, ...]
[BENTO_END]
6. SCREEN DIRECTOR (NAVIGATE). If the user asks to SEE, VISIT, GO TO, SHOW, FIND, or asks about ANY specific item in my portfolio, you MUST output a [NAVIGATE:sectionId:keyword] token. The keyword must be the most precise text that appears visually on that element (e.g. the card title, skill name, project name, institution name, etc).

   Valid sectionIds and their sub-elements (use the MOST specific keyword possible):

   HOME page:
   - "show home / go home" → [NAVIGATE:home:home]
   - "show quick actions" → [NAVIGATE:home:quick actions]
   - "show the available badge" → [NAVIGATE:home:Available]
   - "show hero section" → [NAVIGATE:home:hero]

   ABOUT page:
   - "show about / tell me about Sujith" → [NAVIGATE:about:about]
   - "show career timeline / journey" → [NAVIGATE:about:timeline]
   - "show hobbies" → [NAVIGATE:about:hobbies]
   - "show stats" → [NAVIGATE:about:stats]
   - "show bio" → [NAVIGATE:about:bio]
   - "show contact links / Gmail / LinkedIn / GitHub" → [NAVIGATE:about:contact]
   - "show achievements" → [NAVIGATE:about:achievements]

   SKILLS page:
   - "show skills" → [NAVIGATE:skills:skills]
   - "show Python skills" → [NAVIGATE:skills:Python]
   - "show React skills" → [NAVIGATE:skills:React]
   - "show ML skills / machine learning" → [NAVIGATE:skills:Machine Learning]
   - "show NLP skills" → [NAVIGATE:skills:NLP]
   - "show SQL / database skills" → [NAVIGATE:skills:SQL]
   - "show cloud / AWS skills" → [NAVIGATE:skills:Cloud]
   - "show data science skills" → [NAVIGATE:skills:Data Science]

   PROJECTS page:
   - "show projects" → [NAVIGATE:projects:projects]
   - "show Financial Sentiment project" → [NAVIGATE:projects:Financial Sentiment]
   - "show SMS Finance project" → [NAVIGATE:projects:SMS Finance]
   - "show retail project" → [NAVIGATE:projects:Retail]
   - "show ML project" → [NAVIGATE:projects:Machine Learning]

   EDUCATION page:
   - "show education" → [NAVIGATE:education:education]
   - "show VIT education / VIT Vellore" → [NAVIGATE:education:VIT]
   - "show CGPA / GPA" → [NAVIGATE:education:CGPA]
   - "show school / 12th / 10th" → [NAVIGATE:education:school]
   - "show certifications from education" → [NAVIGATE:certifications:certifications]

   CERTIFICATIONS page:
   - "show certifications" → [NAVIGATE:certifications:certifications]
   - "show AWS certification" → [NAVIGATE:certifications:AWS]
   - "show Python certification" → [NAVIGATE:certifications:Python]
   - "show Google certification" → [NAVIGATE:certifications:Google]

   EXPERIENCE page:
   - "show experience / work history" → [NAVIGATE:experience:experience]

   CONTACT page:
   - "show contact / how to reach Sujith" → [NAVIGATE:contact:contact]
   - "show email" → [NAVIGATE:contact:email]
   - "show phone / number" → [NAVIGATE:contact:phone]
   - "show contact form" → [NAVIGATE:contact:form]

   RESUME (special):
   - "show / download / open resume / CV" → [NAVIGATE:resume:download]
   - ALWAYS use [NAVIGATE:resume:download] when the user wants to see or download the resume/CV. This will automatically open the resume viewer.

   Rules:
   - ALWAYS choose the single most specific keyword that identifies the exact element visually on screen.
   - If the user just wants a section, use the section name as keyword.
   - NEVER omit [NAVIGATE] when the user says show/go/take me/where/visit/find/open/download.
7. Never hallucinate tools or output unparsed raw JSON outside of the Bento block.`;

// =============================================================================
// STEP 4: YOUR KNOWLEDGE BASE — Sujith's portfolio content
// =============================================================================
const KNOWLEDGE = [
  {
    source: "bio",
    section: "about",
    chunks: [
      "I'm Thota Sujith Reddy, commonly known as Sujith. I'm a final-year B.Tech Computer Science and Engineering (Data Science) student at VIT University (Vellore Institute of Technology), Vellore with an 8.7 CGPA. I'm originally from Andhra Pradesh, India. I specialize in applied machine learning, neural networks, and fintech.",
      "I focus on bridging the gap between backend data science architectures and responsive frontend user interfaces, building applications that are both highly intelligent and beautiful. I'm also preparing for CAT 2026, aiming for an MBA to complement my engineering skills with business leadership and strategic management."
    ],
  },
  {
    source: "project:sms-finance",
    section: "projects",
    chunks: [
      "My flagship project is SMS Finance Analyzer, a privacy-first RAG pipeline using Gemini 2.5 Flash and ChromaDB to analyze financial SMS patterns. It features a 200+ term custom financial knowledge base and multi-factor fraud detection with automatic PII (Personally Identifiable Information) masking.",
      "The project is built as a Streamlit and FastAPI web app, processing over 600+ requests per hour with sub-2s latency. It leverages vector databases to detect patterns and extract transaction details directly from SMS notifications without compromising privacy."
    ],
  },
  {
    source: "code:sms-finance",
    section: "code",
    chunks: [
      "Here is a semantic code snippet showing how I implemented the PII masking in my SMS Finance project:\n\n```python\nimport re\n\ndef mask_pii(text):\n    # Mask account numbers (last 4 digits visible)\n    text = re.sub(r'\\b\\d{6,12}(\\d{4})\\b', r'XXXX-XXXX-\\1', text)\n    # Mask phone numbers\n    text = re.sub(r'\\b\\+?\\d{10,12}\\b', r'[REDACTED PHONE]', text)\n    # Mask email addresses\n    text = re.sub(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+', r'[REDACTED EMAIL]', text)\n    return text\n```"
    ],
  },
  {
    source: "project:finbert",
    section: "projects",
    chunks: [
      "My academic project is Financial Sentiment Analysis, where I custom fine-tuned a pre-trained FinBERT model on 26,961 Indian financial news articles and headlines, reaching a high sentiment classification test accuracy of 87.52%. It was trained on an NVIDIA Tesla T4 GPU.",
      "This project served as the predecessor to NewsTrader AI. I implemented a Market Mood Index, GNews API news ingestion, portfolio management features, and a signal generator (BUY/SELL/NEUTRAL). It was created in collaboration with Vaka Venkata Rahul Reddy and Vemulapati Bhanu Prakash Reddy under faculty advisor Kanagaraj R at VIT's School of CSE, resulting in a 75+ page VIT academic report, research paper, and poster presentation."
    ],
  },
  {
    source: "code:finbert",
    section: "code",
    chunks: [
      "Here is a semantic code snippet showing how I set up the FinBERT fine-tuning arguments in PyTorch/HuggingFace:\n\n```python\nfrom transformers import TrainingArguments, Trainer\n\ntraining_args = TrainingArguments(\n    output_dir='./results',\n    num_train_epochs=3,\n    per_device_train_batch_size=16,\n    per_device_eval_batch_size=64,\n    warmup_steps=500,\n    weight_decay=0.01,\n    logging_dir='./logs',\n    logging_steps=10,\n    evaluation_strategy=\"epoch\"\n)\n\ntrainer = Trainer(\n    model=model,\n    args=training_args,\n    train_dataset=train_dataset,\n    eval_dataset=eval_dataset\n)\ntrainer.train()\n```"
    ],
  },
  {
    source: "project:spend-prediction",
    section: "projects",
    chunks: [
      "I built the Online Retail Spend Prediction project, which is an end-to-end ML pipeline trained on a massive UCI online retail dataset of 397k+ transactions to predict a customer's 30-day future spend, achieving an outstanding R2 score of 0.883.",
      "The pipeline uses robust RFM (Recency, Frequency, Monetary) temporal feature engineering and dual predictive paths benchmarked using XGBoost, LightGBM, and Random Forest algorithms."
    ],
  },
  {
    source: "skills",
    section: "skills",
    chunks: [
      "I have advanced experience in Python (92% proficiency, 3 years, 14 projects) and intermediate experience in Java (70%). For machine learning, deep learning, and data science, I work with TensorFlow, Scikit-learn, Pandas (95%), NumPy, Matplotlib, Seaborn, XGBoost, LightGBM, and Random Forest.",
      "In the AI space, I build applications using Gemini API, Voyage AI, Groq SDK, RAG pipelines, and vector databases like ChromaDB, and I'm currently learning LangChain and autonomous AI agents. For web development, I use React, FastAPI, Streamlit, HTML, CSS, JavaScript/TypeScript, Supabase, Postgres, MySQL, and Vercel deployment. My tools include Git, GitHub, and GitHub Actions."
    ],
  },
  {
    source: "education",
    section: "education",
    chunks: [
      "I am pursuing my Bachelor of Technology (B.Tech) in Computer Science and Engineering with a specialization in Data Science at VIT University (Vellore Institute of Technology), Vellore, expecting to graduate in 2026. My current CGPA is 8.7 / 10. Highlights of my coursework include DSA, Database Systems, Machine Learning, Neural Networks, and Big Data.",
      "For my intermediate education (11th & 12th grade), I attended Narayana Junior College in Vijayawada, scoring 92.7% (927/1000) under the PCM stream (Physics, Chemistry, Mathematics) from 2019 to 2022. I completed my secondary education (10th grade) at Viswabharathi High School in Gudivada, achieving a perfect 10/10 GPA (100%) from 2015 to 2019."
    ],
  },
  {
    source: "certifications",
    section: "certifications",
    chunks: [
      "I hold the Google TensorFlow Developer Certificate (issued in 2023), validating my proficiency in building and training deep learning models using TensorFlow for computer vision, NLP, and time series forecasting.",
      "I also hold the Oracle Generative AI Certificate (issued in 2024), validating my expertise in generative AI architectures, large language models (LLMs), and implementing enterprise-grade AI solutions using Oracle Cloud Infrastructure."
    ],
  },
  {
    source: "contact",
    section: "contact",
    chunks: [
      "You can contact me by email at sujithreddy1546@gmail.com, or through the LinkedIn (linkedin.com/in/sujith-thota) and GitHub (github.com/sujith-thota) links on this site. I typically reply within 2-4 hours during my active hours, which are from 9:30 AM to 11:30 PM IST.",
      "I'm actively seeking exciting software engineering and applied ML opportunities. I'm open to full-time roles, internships, and collaborations in Data Science, Machine Learning, and Software Engineering. I am not open to spam or unrelated outreach."
    ],
  },
  {
    source: "stats_hobbies",
    section: "about",
    chunks: [
      "I have over 3.5+ years of coding experience, shipped 10+ projects, solved 200+ DSA problems, and have a CGPA of 8.7.",
      "Beyond technical development, my hobbies and interests include Chess (which helps build my strategic thinking), reading, fitness & sports, and traveling."
    ],
  }
];

// =============================================================================
// VOYAGE EMBEDDING HELPERS
// =============================================================================
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function embedTexts(texts, inputType, retries = 3, initialDelay = 2000) {
  let currentDelay = initialDelay;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch("https://api.voyageai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
        },
        body: JSON.stringify({ input: texts, model: VOYAGE_MODEL, input_type: inputType }),
      });
      
      if (res.status === 429 && attempt < retries) {
        console.warn(`Voyage rate limited (429). Retrying attempt ${attempt}/${retries} in ${currentDelay}ms...`);
        await delay(currentDelay);
        currentDelay *= 2; // exponential backoff
        continue;
      }
      
      if (!res.ok) throw new Error(`Voyage embedding failed: ${res.status} ${await res.text()}`);
      
      const data = await res.json();
      return data.data.map((d) => d.embedding);
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(`Embedding attempt ${attempt} failed: ${err.message}. Retrying in ${currentDelay}ms...`);
      await delay(currentDelay);
      currentDelay *= 2;
    }
  }
}

async function embedQuery(text) {
  const [embedding] = await embedTexts([text], "query");
  return embedding;
}

// =============================================================================
// INGESTION — embeds KNOWLEDGE and writes src/data/embeddings.json
// =============================================================================
async function runIngestion() {
  console.log("Starting ingestion...\n");
  const allChunks = [];
  let nextId = 1;

  // Flatten all chunks into a single array
  const flatChunks = [];
  for (const group of KNOWLEDGE) {
    group.chunks.forEach((content) => {
      flatChunks.push({ source: group.source, section: group.section, content });
    });
  }

  console.log(`Embedding all ${flatChunks.length} chunk(s) in a single batch request...`);
  const textsToEmbed = flatChunks.map(c => c.content);
  const embeddings = await embedTexts(textsToEmbed, "document");

  flatChunks.forEach((item, i) => {
    allChunks.push({
      id: nextId++,
      source: item.source,
      section: item.section,
      content: item.content,
      embedding: embeddings[i]
    });
  });

  await mkdir(path.dirname(EMBEDDINGS_PATH), { recursive: true });
  await writeFile(
    EMBEDDINGS_PATH,
    JSON.stringify({ model: VOYAGE_MODEL, generatedAt: new Date().toISOString(), chunks: allChunks }, null, 2)
  );

  console.log(`\n✓ Wrote ${allChunks.length} chunks to ${EMBEDDINGS_PATH}`);
  console.log("Commit this file to your repo. Re-run this script any time KNOWLEDGE changes.");
}

// =============================================================================
// RETRIEVAL — hybrid cosine-similarity + keyword search, no database
// =============================================================================
let cachedChunks = null;

async function loadChunks() {
  if (cachedChunks) return cachedChunks;
  const raw = await readFile(EMBEDDINGS_PATH, "utf-8");
  cachedChunks = JSON.parse(raw).chunks;
  return cachedChunks;
}

function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function keywordScore(query, content) {
  const queryTerms = query.toLowerCase().match(/[a-z0-9.]+/g) || [];
  const contentLower = content.toLowerCase();
  let hits = 0;
  for (const term of queryTerms) {
    if (term.length > 2 && contentLower.includes(term)) hits++;
  }
  return hits;
}

function rrfMerge(vectorRanked, keywordRanked, k = 50) {
  const scores = new Map();
  vectorRanked.forEach((item, rank) => scores.set(item.id, (scores.get(item.id) || 0) + 1 / (k + rank + 1)));
  keywordRanked.forEach((item, rank) => scores.set(item.id, (scores.get(item.id) || 0) + 1 / (k + rank + 1)));
  return scores;
}

async function retrieve(queryEmbedding, queryText, topN = 5) {
  const chunks = await loadChunks();

  const vectorRanked = chunks
    .map((c) => ({ id: c.id, sim: cosineSimilarity(queryEmbedding, c.embedding) }))
    .sort((a, b) => b.sim - a.sim)
    .slice(0, 20);

  const keywordRanked = chunks
    .map((c) => ({ id: c.id, score: keywordScore(queryText, c.content) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  const fusedScores = rrfMerge(vectorRanked, keywordRanked);
  const byId = new Map(chunks.map((c) => [c.id, c]));

  return [...fusedScores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([id]) => byId.get(id));
}

// =============================================================================
// QUERY REWRITING — turns follow-ups ("what about his GPA?") into
// standalone questions using chat history, before embedding. Cheap Groq call.
// =============================================================================
async function rewriteQuery(history, latestMessage) {
  if (!history || history.length === 0) return latestMessage;

  const historyText = history.slice(-4).map((m) => `${m.role}: ${m.content}`).join("\n");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0,
      max_tokens: 60,
      messages: [
        {
          role: "system",
          content:
            "Rewrite the user's latest message as a standalone question that makes sense without the prior conversation. If it's already standalone, return it unchanged. Reply with ONLY the rewritten question, nothing else.",
        },
        { role: "user", content: `Conversation so far:\n${historyText}\n\nLatest message: "${latestMessage}"` },
      ],
    }),
  });

  if (!res.ok) return latestMessage; // fail open — use the original message
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || latestMessage;
}

// =============================================================================
// PROMPT BUILDING
// =============================================================================
function buildUserPrompt(retrievedChunks, question) {
  if (retrievedChunks.length === 0) {
    return `No relevant context was found for: "${question}". Follow your instructions: say you don't have that information and suggest reaching out by email.`;
  }
  const context = retrievedChunks.map((c, i) => `[${i + 1}] (source: ${c.source}) ${c.content}`).join("\n\n");
  return `Context:\n${context}\n\nQuestion: ${question}`;
}

// =============================================================================
// RATE LIMITING & SECURITY (Durable Upstash Redis + Stateful In-Memory Fallback)
// =============================================================================
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS = 15;

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record) {
    rateLimitMap.set(ip, { count: 1, firstRequest: now });
    return true;
  }
  if (now - record.firstRequest > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, firstRequest: now });
    return true;
  }
  if (record.count >= MAX_REQUESTS) return false;
  record.count += 1;
  return true;
}

// Clean up map to prevent memory leaks in warm lambdas
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now - record.firstRequest > RATE_LIMIT_WINDOW) rateLimitMap.delete(ip);
  }
}, RATE_LIMIT_WINDOW).unref?.();

// Setup durable Vercel-ready rate limiting
let ratelimit = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "60 s"), // 10 requests per minute
    });
  } catch (err) {
    console.warn("Could not construct Upstash Redis rate-limiter, using memory fallback:", err);
  }
}

// =============================================================================
// VERCEL SERVERLESS HANDLER — POST /api/chat
// =============================================================================
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Security 1: Rate Limiting (Upstash Redis or Stateful In-Memory Fallback)
  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (ratelimit) {
    const { success } = await ratelimit.limit(clientIp);
    if (!success) {
      return res.status(429).json({ error: "Too many requests. Please wait a minute." });
    }
  } else {
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({ error: "Too many requests. Please wait a few minutes." });
    }
  }

  // Security 2: Session Leasing Check (Note: client-side session tokens are bypassable by custom scripts)
  const sessionToken = req.headers['x-portfolio-session'];
  if (!sessionToken || sessionToken.length < 16) {
    return res.status(403).json({ error: "Invalid or missing session token. Unauthorized." });
  }

  // Phase 4: AI Telemetry Initialization
  let supabaseAdmin = null;
  if (process.env.VITE_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  }

    try {
    const { message, image, history = [], contextPath = 'homepage' } = req.body;
    if (!message && !image) {
      return res.status(400).json({ error: "Missing 'message' or 'image' in request body" });
    }

    // Security 3: Input Length Cap to prevent prompt-injection / token inflation cost abuse
    if (message && message.length > 2000) {
      return res.status(400).json({ error: "Message too long. Keep it under 2000 characters." });
    }

    let groqPayload;
    let chunks = [];

    // Open stream early for Multi-Agent Orchestration feedback
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const sendStep = (node, status, text, ms = 0) => {
      res.write(`data: ${JSON.stringify({ type: "step", step: { node, status, text, ms, timestamp: Date.now() } })}\n\n`);
    };
    const setAgentName = (name) => {
      res.write(`data: ${JSON.stringify({ type: "agent", name })}\n\n`);
    }

    const DYNAMIC_SYSTEM_PROMPT = SYSTEM_PROMPT + `

*** CURRENT USER CONTEXT ***
The user is currently viewing the '${contextPath}' section of your portfolio. If appropriate, tailor your response to be contextually aware of what they are looking at (e.g. 'I see you are looking at my Experience section...').

*** ADAPTIVE PERSONALITY PROTOCOL ***
Analyze the tone and style of the user's message before responding:
1. If they sound like a formal recruiter or manager, respond with high professional polish, concise bullet points, and focus on business impact/metrics.
2. If they sound like a peer developer or are speaking casually (e.g., "yo", "how did u build this"), instantly shift to a friendly, enthusiastic, highly-technical "developer-to-developer" tone. Use emojis and discuss architecture passionately.
3. If they are brief/terse, be brief and direct in return. Mirror their energy.`;

    if (image) {
      setAgentName("Vision Agent (Llama 3.2)");
      let t0 = Date.now();
      sendStep('vision', 'active', "Analyzing multimodal input...");
      
      // Vision Route: Use Groq Vision model
      groqPayload = {
        model: "llama-3.2-11b-vision-preview",
        temperature: 0.4,
        stream: true,
        messages: [
          { role: "system", content: DYNAMIC_SYSTEM_PROMPT },
          { 
            role: "user", 
            content: [
              { type: "text", text: message || "What's in this image?" },
              { type: "image_url", image_url: { url: image } }
            ]
          }
        ],
      };
      sendStep('parse', 'done', "Parsed payload", Date.now() - t0);

      // Log User Message to Supabase
      if (supabaseAdmin) {
        // Ensure session exists
        await supabaseAdmin.from('chat_sessions').upsert({ id: sessionToken }).select();
        // Insert user prompt
        await supabaseAdmin.from('chat_messages').insert({
          session_id: sessionToken,
          role: 'user',
          content: message
        });
      }

      sendStep('vision', 'done', "Processed base64 vision payload", Date.now() - t0);
    } else {
      setAgentName("RAG Router (Llama 3.3)");
      
      let t0 = Date.now();
      sendStep('router', 'active', "Rewriting query with historical context...");
      const standaloneQuestion = await rewriteQuery(history, message);

      // Log User Message to Supabase
      if (supabaseAdmin) {
        // Ensure session exists
        await supabaseAdmin.from('chat_sessions').upsert({ id: sessionToken }).select();
        // Insert user prompt
        await supabaseAdmin.from('chat_messages').insert({
          session_id: sessionToken,
          role: 'user',
          content: message
        });
      }

      let routerMs = Date.now() - t0;
      if (standaloneQuestion !== message) {
        sendStep('router', 'done', `Context extracted (${standaloneQuestion})`, routerMs);
      } else {
        sendStep('router', 'done', "No historical context needed", routerMs);
      }

      t0 = Date.now();
      sendStep('rag', 'active', "Querying Voyage AI Vector Database...");
      const queryEmbedding = await embedQuery(standaloneQuestion);
      chunks = await retrieve(queryEmbedding, standaloneQuestion, 5);
      let ragMs = Date.now() - t0;
      
      if (chunks.length > 0) {
        sendStep('rag', 'done', `Retrieved ${chunks.length} high-fidelity semantic chunks`, ragMs);
      } else {
        sendStep('rag', 'done', `No exact semantic match found in DB`, ragMs);
      }

      const userPrompt = buildUserPrompt(chunks, standaloneQuestion);

      groqPayload = {
        model: GROQ_MODEL,
        temperature: 0.4,
        stream: true,
        messages: [
          { role: "system", content: DYNAMIC_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      };
    }

    let genT0 = Date.now();
    sendStep('gen', 'active', "Streaming generation via Groq Llama 3...");

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify(groqPayload),
    });

    if (!groqRes.ok || !groqRes.body) {
      res.write(`data: ${JSON.stringify({ type: "error", error: "Groq request failed" })}\n\n`);
      return res.end();
    }
    
    // We can emit the done event for 'gen' with latency tracking its TTFB (time to first byte)
    sendStep('gen', 'done', "Connection established (TTFB)", Date.now() - genT0);

    // Send sources first so the frontend can render citation chips immediately
    res.write(
      `data: ${JSON.stringify({ type: "sources", sources: chunks.map((c) => ({ source: c.source, section: c.section })) })}\n\n`
    );

    const reader = groqRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullAiResponse = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const payload = line.slice(6);
        if (payload === "[DONE]") continue;
        try {
          const json = JSON.parse(payload);
          const token = json.choices?.[0]?.delta?.content;
          if (token) {
            fullAiResponse += token;
            res.write(`data: ${JSON.stringify({ type: "token", token })}\n\n`);
          }
        } catch {
          // ignore malformed keep-alive chunks
        }
      }
    }

    // Log AI Response to Supabase
    if (supabaseAdmin && fullAiResponse.trim()) {
      await supabaseAdmin.from('chat_messages').insert({
        session_id: sessionToken,
        role: 'assistant',
        content: fullAiResponse
      });
    }

    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
  } catch (err) {
    console.error("Chat pipeline error:", err);
    res.status(500).json({ error: "Something went wrong generating a response." });
  }
}

// =============================================================================
// MODE SWITCH — `node api/chat.js` ingests instead of handling requests
// =============================================================================
const isRunDirectly = process.argv[1] === fileURLToPath(import.meta.url);
if (isRunDirectly) {
  runIngestion();
}
