/**
 * chatbot.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Portfolio AI Chatbot — UI Controller
 * Handles: open/close, message rendering, quick chips, keyboard nav, loading,
 *          error display, conversation history, and AI calls via ai-service.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

(function () {
  "use strict";

  // ─── STATE ────────────────────────────────────────────────────────────────

  let isOpen = false;
  let isThinking = false;
  let conversationHistory = []; // { role: "user"|"assistant", content: string }[]
  let firstOpen = true;
  let loadingEl = null;

  // ─── QUICK CHIPS ─────────────────────────────────────────────────────────

  const QUICK_CHIPS = [
    { label: "💻 My Skills",   message: "What are your skills?" },
    { label: "🚀 My Projects", message: "Tell me about your projects." },
    { label: "⚙️ Tech Stack",  message: "What technologies do you use?" },
    { label: "🎓 Education",   message: "What is your education?" },
    { label: "📞 Contact",     message: "How can I contact you?" },
  ];

  // ─── WELCOME MESSAGE ──────────────────────────────────────────────────────

  const WELCOME_TEXT =
    "Hi 👋\n\nI'm Portfolio AI — your guide to learning about Pavalan.\n\n" +
    "I can help you explore:\n" +
    "• Skills & Technologies\n" +
    "• Projects\n" +
    "• Education\n" +
    "• Contact information\n\n" +
    "What would you like to know?";

  // ─── INJECT HTML ──────────────────────────────────────────────────────────

  function injectHTML() {
    const html = `
      <!-- ── Chatbot Toggle Button ── -->
      <button
        class="chatbot-toggle-btn"
        id="chatbot-toggle-btn"
        aria-label="Open Portfolio AI Chatbot"
        aria-expanded="false"
        aria-controls="chatbot-window"
        title="Chat with Portfolio AI"
      >
        <i class="fa-solid fa-robot" aria-hidden="true"></i>
      </button>

      <!-- ── Chatbot Window ── -->
      <div
        class="chatbot-window"
        id="chatbot-window"
        role="dialog"
        aria-modal="true"
        aria-label="Portfolio AI Chatbot"
      >
        <!-- Header -->
        <div class="chatbot-header">
          <i class="fa-solid fa-robot chatbot-header-icon" aria-hidden="true"></i>
          <div class="chatbot-header-info">
            <span class="chatbot-header-title">Portfolio AI</span>
            <span class="chatbot-header-status">
              <span class="chatbot-status-dot" aria-hidden="true"></span>
              Online
            </span>
          </div>
          <button
            class="chatbot-close-btn"
            id="chatbot-close-btn"
            aria-label="Close chatbot"
            title="Close"
          >
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>

        <!-- Messages -->
        <div
          class="chatbot-messages"
          id="chatbot-messages"
          role="log"
          aria-live="polite"
          aria-atomic="false"
          aria-label="Chat messages"
        ></div>

        <!-- Quick Chips -->
        <div class="chatbot-chips" id="chatbot-chips" aria-label="Quick questions"></div>

        <!-- Input Area -->
        <div class="chatbot-input-area">
          <textarea
            class="chatbot-input"
            id="chatbot-input"
            placeholder="Ask me something..."
            rows="1"
            aria-label="Type your message"
            aria-multiline="true"
          ></textarea>
          <button
            class="chatbot-send-btn"
            id="chatbot-send-btn"
            aria-label="Send message"
            title="Send"
            disabled
          >
            <i class="fa-solid fa-paper-plane" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", html);
  }

  // ─── DOM REFS ─────────────────────────────────────────────────────────────

  let toggleBtn, chatWindow, closeBtn, messagesEl, chipsEl, inputEl, sendBtn;

  function grabRefs() {
    toggleBtn  = document.getElementById("chatbot-toggle-btn");
    chatWindow = document.getElementById("chatbot-window");
    closeBtn   = document.getElementById("chatbot-close-btn");
    messagesEl = document.getElementById("chatbot-messages");
    chipsEl    = document.getElementById("chatbot-chips");
    inputEl    = document.getElementById("chatbot-input");
    sendBtn    = document.getElementById("chatbot-send-btn");
  }

  // ─── OPEN / CLOSE ─────────────────────────────────────────────────────────

  function openChat() {
    isOpen = true;
    chatWindow.classList.add("chatbot-open");
    toggleBtn.setAttribute("aria-expanded", "true");
    toggleBtn.setAttribute("aria-label", "Close Portfolio AI Chatbot");

    if (firstOpen) {
      firstOpen = false;
      renderWelcome();
    }

    // Focus the input
    setTimeout(() => inputEl.focus(), 310);
  }

  function closeChat() {
    isOpen = false;
    chatWindow.classList.remove("chatbot-open");
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.setAttribute("aria-label", "Open Portfolio AI Chatbot");
    toggleBtn.focus();
  }

  // ─── WELCOME ──────────────────────────────────────────────────────────────

  function renderWelcome() {
    appendMessage("ai", WELCOME_TEXT);
    renderChips();
  }

  // ─── QUICK CHIPS ─────────────────────────────────────────────────────────

  function renderChips() {
    chipsEl.innerHTML = "";
    QUICK_CHIPS.forEach(({ label, message }) => {
      const btn = document.createElement("button");
      btn.className = "chatbot-chip";
      btn.textContent = label;
      btn.setAttribute("aria-label", `Quick question: ${label}`);
      btn.addEventListener("click", () => {
        hideChips();
        handleUserSend(message);
      });
      chipsEl.appendChild(btn);
    });
  }

  function hideChips() {
    chipsEl.innerHTML = "";
  }

  // ─── MESSAGE RENDERING ────────────────────────────────────────────────────

  function getTimestamp() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function appendMessage(role, text) {
    const wrapper = document.createElement("div");
    wrapper.className = `chatbot-message ${role}`;

    const bubble = document.createElement("div");
    bubble.className = "chatbot-bubble";
    bubble.textContent = text;

    const ts = document.createElement("div");
    ts.className = "chatbot-timestamp";
    ts.textContent = getTimestamp();

    wrapper.appendChild(bubble);
    wrapper.appendChild(ts);
    messagesEl.appendChild(wrapper);
    scrollToBottom();

    return wrapper;
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // ─── LOADING INDICATOR ────────────────────────────────────────────────────

  function showLoading() {
    loadingEl = document.createElement("div");
    loadingEl.className = "chatbot-loading";
    loadingEl.setAttribute("aria-label", "AI is thinking");
    loadingEl.innerHTML = "<span></span><span></span><span></span>";
    messagesEl.appendChild(loadingEl);
    scrollToBottom();
  }

  function hideLoading() {
    if (loadingEl) {
      loadingEl.remove();
      loadingEl = null;
    }
  }

  // ─── SEND LOGIC ───────────────────────────────────────────────────────────

  async function handleUserSend(text) {
    const trimmed = (text || inputEl.value).trim();
    if (!trimmed || isThinking) return;

    // Clear input
    inputEl.value = "";
    inputEl.style.height = "auto";
    sendBtn.disabled = true;

    // Render user message
    appendMessage("user", trimmed);

    // Add to history
    conversationHistory.push({ role: "user", content: trimmed });

    // Show loading
    isThinking = true;
    showLoading();

    try {
      const reply = await sendMessageToAI(conversationHistory);

      hideLoading();
      appendMessage("ai", reply);

      // Add AI reply to history
      conversationHistory.push({ role: "assistant", content: reply });
    } catch (err) {
      hideLoading();

      const isConnectionError =
        err.message.includes("Failed to fetch") ||
        err.message.includes("NetworkError") ||
        err.message.includes("net::ERR") ||
        err.message.includes("ECONNREFUSED");

      const friendlyMsg = isConnectionError
        ? "I'm currently unable to connect to my AI service.\n\nPlease make sure Ollama is running:\n  ollama run llama3.2\n\nThen try again."
        : "Sorry, I couldn't process that request right now.\nPlease try again.";

      appendMessage("ai", friendlyMsg);

      // Don't add error to history so user can retry
      conversationHistory.pop();
    } finally {
      isThinking = false;
      // Re-enable send if there's text
      sendBtn.disabled = inputEl.value.trim() === "";
    }
  }

  // ─── AUTO-RESIZE TEXTAREA ────────────────────────────────────────────────

  function autoResize() {
    inputEl.style.height = "auto";
    inputEl.style.height = Math.min(inputEl.scrollHeight, 90) + "px";
  }

  // ─── EVENT LISTENERS ─────────────────────────────────────────────────────

  function attachEvents() {
    // Toggle button
    toggleBtn.addEventListener("click", () => {
      isOpen ? closeChat() : openChat();
    });

    // Close button
    closeBtn.addEventListener("click", closeChat);

    // Input — enable/disable send, auto-resize
    inputEl.addEventListener("input", () => {
      sendBtn.disabled = inputEl.value.trim() === "";
      autoResize();
    });

    // Enter to send (Shift+Enter = new line)
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled) handleUserSend();
      }
    });

    // Send button
    sendBtn.addEventListener("click", () => handleUserSend());

    // Escape to close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen) closeChat();
    });

    // Trap focus inside chatbot when open (Tab cycling)
    chatWindow.addEventListener("keydown", (e) => {
      if (e.key !== "Tab") return;
      const focusable = chatWindow.querySelectorAll(
        'button:not([disabled]), textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  // ─── INIT ─────────────────────────────────────────────────────────────────

  function init() {
    injectHTML();
    grabRefs();
    attachEvents();
  }

  // Run after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();