const EMAILJS_CONFIG = {
  publicKey:  "YOUR_PUBLIC_KEY",   // EmailJS Public Key (Optional)
  serviceId:  "YOUR_SERVICE_ID",   // EmailJS Service ID (Optional)
  templateId: "YOUR_TEMPLATE_ID",  // EmailJS Template ID (Optional)
  targetEmail: "pavalanganesan2368@gmail.com"
};

// Initialize EmailJS if key is provided
(function initEmailJS() {
  if (typeof emailjs !== "undefined" && EMAILJS_CONFIG.publicKey !== "YOUR_PUBLIC_KEY") {
    emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
  }
})();

/**
 * Send contact form data to your Gmail
 * @param {string} name     - Visitor's name (from Username field)
 * @param {string} email    - Visitor's email address
 * @param {string} message  - Feedback / message content
 * @returns {Promise<any>}
 */
async function sendContactEmail(name, email, message) {
  // If EmailJS is configured, send via EmailJS
  if (
    typeof emailjs !== "undefined" &&
    EMAILJS_CONFIG.publicKey !== "YOUR_PUBLIC_KEY" &&
    EMAILJS_CONFIG.serviceId !== "YOUR_SERVICE_ID" &&
    EMAILJS_CONFIG.templateId !== "YOUR_TEMPLATE_ID"
  ) {
    return emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, {
      from_name:  name,
      from_email: email,
      message:    message,
      to_name:    "Pavalan Ganesan",
      reply_to:   email
    });
  }

  // Direct zero-config submission to Gmail
  const response = await fetch(`https://formsubmit.co/ajax/${EMAILJS_CONFIG.targetEmail}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      name: name,
      email: email,
      feedback: message,
      _subject: `New Portfolio Feedback from ${name}`,
      _template: "text"
    })
  });

  const data = await response.json();
  if (!response.ok || data.success === "false") {
    throw new Error(data.message || "Failed to send message.");
  }

  return data;
}
