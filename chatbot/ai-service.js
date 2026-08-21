/**
 * ai-service.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Multi-provider AI service for the Portfolio Chatbot.
 *
 * HOW TO SWITCH PROVIDERS
 * ────────────────────────
 * Change AI_CONFIG.provider to one of:
 *   "gemini"   →  Google Gemini  (direct API — key in AI_CONFIG.geminiApiKey)
 *   "ollama"   →  Local Ollama   (no API key needed)
 *   "openai"   →  OpenAI GPT     (requires backend proxy)
 *   "claude"   →  Anthropic      (requires backend proxy)
 *   "groq"     →  Groq Cloud     (requires backend proxy)
 *
 * ⚠️  SECURITY WARNING
 * ─────────────────────
 * The Gemini API key below is visible in browser DevTools.
 * ✅ Safe for: personal portfolio, demos, local development.
 * ❌ Not safe for: production apps with paid high-traffic usage.
 * Tip: Restrict your key in Google AI Studio to only allowed HTTP referrers
 *      (your portfolio domain) so it cannot be abused elsewhere.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const AI_CONFIG = {
  provider: "gemini",                         // ← Active provider

  // ── Google Gemini (Direct REST API) ────────────────────────────────────────
  geminiApiKey:  "AQ.Ab8RN6ITyYFp8oX41PSIy1NYCDGxnLrMcyKRH743Jq-3g86BZQ",  // ← your key
  geminiModel:   "gemini-2.5-flash",          // Latest model available on this key
  geminiBaseUrl: "https://generativelanguage.googleapis.com/v1beta/models",

  // ── Ollama (Local) ─────────────────────────────────────────────────────────
  ollamaModel:   "llama3.2",
  ollamaBaseUrl: "http://localhost:11434",

  // ── Cloud Backend Proxy URLs (for OpenAI / Claude / Groq) ──────────────────
  openaiProxyUrl: "/api/chat/openai",
  claudeProxyUrl: "/api/chat/claude",
  groqProxyUrl:   "/api/chat/groq",
};

// ─── SYSTEM PROMPT ───────────────────────────────────────────────────────────

function buildSystemPrompt() {
  const d = portfolioData; // from portfolio-data.js

  const skillsText = [
    `Frontend: ${d.skills.frontend.join(", ")}`,
    `Backend: ${d.skills.backend.join(", ")}`,
    `Databases: ${d.skills.database.join(", ")}`,
    `Languages: ${d.skills.programmingLanguages.join(", ")}`,
    `Tools: ${d.skills.tools.join(", ")}`,
  ].join("\n");

  const projectsText = d.projects
    .map(
      (p) =>
        `• ${p.name}: ${p.description} | Tech: ${p.technologies.join(", ")} | Demo: ${p.demo} | GitHub: ${p.github}`
    )
    .join("\n");

  const educationText = d.education
    .map((e) => `• ${e.degree} at ${e.institution} — CGPA: ${e.cgpa} (${e.status})`)
    .join("\n");

  return `You are the AI assistant for ${d.name}'s personal developer portfolio.

Your role is to help visitors learn about ${d.name} in a friendly, professional, and concise way.

━━━━━━━━━━━━━━━━━━━━━━━
PORTFOLIO INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━

NAME: ${d.name}
ROLE: ${d.role}

ABOUT:
${d.about}

SKILLS:
${skillsText}

PROJECTS:
${projectsText}

EDUCATION:
${educationText}

CONTACT:
• Email: ${d.contact.email}
• Phone: ${d.contact.phone}
• GitHub: ${d.contact.github}
• LinkedIn: ${d.contact.linkedin}

AVAILABILITY: ${d.availability}

━━━━━━━━━━━━━━━━━━━━━━━
INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━

1. ONLY use the portfolio information above to answer questions.
2. NEVER invent skills, projects, companies, certifications, or experience that are not listed.
3. If information is not available, say: "I don't have that information in the portfolio."
4. Be friendly, concise, and professional.
5. You represent ${d.name}, so always speak positively and helpfully.
6. Keep responses short and easy to read — use bullet points when listing multiple items.
7. When mentioning projects, include the demo or GitHub link if relevant.`;
}

// ─── MAIN DISPATCHER ─────────────────────────────────────────────────────────

/**
 * Send a conversation to the configured AI provider.
 * @param {Array<{role: string, content: string}>} messages  - Full conversation history
 * @returns {Promise<string>}  - AI reply text
 */
async function sendMessageToAI(messages) {
  switch (AI_CONFIG.provider) {
    case "gemini":
      return await askGemini(messages);

    case "ollama":
      return await askOllama(messages);

    case "openai":
      return await askOpenAI(messages);

    case "claude":
      return await askClaude(messages);

    case "groq":
      return await askGroq(messages);

    default:
      throw new Error(`Unknown AI provider: "${AI_CONFIG.provider}"`);
  }
}

// ─── GEMINI (Direct REST API) ─────────────────────────────────────────────────
//
// Key differences from OpenAI / Ollama format:
//   • System prompt  → separate "system_instruction" field, NOT inside contents[]
//   • Assistant role → "model"  (NOT "assistant")
//   • Message text   → parts: [{ text: "..." }]  (NOT content: "...")
//   • Endpoint       → /models/{model}:generateContent?key={apiKey}
// ─────────────────────────────────────────────────────────────────────────────

async function askGemini(messages) {
  if (
    !AI_CONFIG.geminiApiKey ||
    AI_CONFIG.geminiApiKey === "YOUR_GEMINI_API_KEY_HERE"
  ) {
    throw new Error(
      "Gemini API key not set. Open chatbot/ai-service.js and paste your key into AI_CONFIG.geminiApiKey."
    );
  }

  // Convert conversation history → Gemini format
  // "user"      → "user"   (unchanged)
  // "assistant" → "model"  (Gemini's name for the AI turn)
  const geminiContents = messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const requestBody = {
    // System instruction is a top-level field in Gemini, not inside contents[]
    system_instruction: {
      parts: [{ text: buildSystemPrompt() }],
    },
    contents: geminiContents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 512,
    },
  };

  const url = `${AI_CONFIG.geminiBaseUrl}/${AI_CONFIG.geminiModel}:generateContent?key=${AI_CONFIG.geminiApiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    // Try to extract Gemini's error message for better debugging
    const errorData = await response.json().catch(() => ({}));
    const errorMsg = errorData?.error?.message || `HTTP ${response.status}`;
    throw new Error(`Gemini API error: ${errorMsg}`);
  }

  const data = await response.json();

  // Response path: candidates[0].content.parts[0].text
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (text) return text.trim();

  // Handle content filtered by Gemini's safety system
  const finishReason = data?.candidates?.[0]?.finishReason;
  if (finishReason === "SAFETY") {
    return "I'm not able to respond to that. Please ask me something about the portfolio.";
  }

  throw new Error("Unexpected response format from Gemini API.");
}

// ─── OLLAMA (Local) ───────────────────────────────────────────────────────────

async function askOllama(messages) {
  const systemMessage = { role: "system", content: buildSystemPrompt() };
  const fullMessages = [systemMessage, ...messages];

  const response = await fetch(`${AI_CONFIG.ollamaBaseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: AI_CONFIG.ollamaModel,
      messages: fullMessages,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`Ollama error ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  // Ollama returns { message: { role, content } }
  if (data.message && data.message.content) {
    return data.message.content.trim();
  }

  throw new Error("Unexpected Ollama response format.");
}

// ─── OPENAI (Backend Proxy) ───────────────────────────────────────────────────

async function askOpenAI(messages) {
  const systemMessage = { role: "system", content: buildSystemPrompt() };
  const fullMessages = [systemMessage, ...messages];

  const response = await fetch(AI_CONFIG.openaiProxyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: fullMessages }),
  });

  if (!response.ok) throw new Error(`OpenAI proxy error: ${response.status}`);

  const data = await response.json();
  return data.reply || data.choices?.[0]?.message?.content || "No response.";
}

// ─── CLAUDE (Backend Proxy) ───────────────────────────────────────────────────

async function askClaude(messages) {
  const systemMessage = { role: "system", content: buildSystemPrompt() };
  const fullMessages = [systemMessage, ...messages];

  const response = await fetch(AI_CONFIG.claudeProxyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: fullMessages }),
  });

  if (!response.ok) throw new Error(`Claude proxy error: ${response.status}`);

  const data = await response.json();
  return data.reply || "No response.";
}

// ─── GROQ (Backend Proxy) ─────────────────────────────────────────────────────

async function askGroq(messages) {
  const systemMessage = { role: "system", content: buildSystemPrompt() };
  const fullMessages = [systemMessage, ...messages];

  const response = await fetch(AI_CONFIG.groqProxyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: fullMessages }),
  });

  if (!response.ok) throw new Error(`Groq proxy error: ${response.status}`);

  const data = await response.json();
  return data.reply || "No response.";
}
