document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const navContainer = document.querySelector(".nav-container");
  const dateDisplay = document.querySelector("#date");

  menuToggle.addEventListener("click", () => {
    navContainer.classList.toggle("active");
  });

  const scrollingFunction = () => {
    const scrollReveal = ScrollReveal({
      origin: "top",
      distance: "60px",
      duration: 2000,
      delay: 200,
      reset: true,
    });

    scrollReveal.reveal(".image-section", {
      origin: "right",
    });
    scrollReveal.reveal(".about-section", {
      origin: "bottom",
    });
    scrollReveal.reveal(".work-experience", {
      interval: 100,
    });
    scrollReveal.reveal(".project-section", {
      interval: 200,
    });
    scrollReveal.reveal(".about-section-container", {
      origin: "bottom",
      interval: 200,
    });
    scrollReveal.reveal(".contact-details", {
      origin: "left",
    });
    scrollReveal.reveal(".form-section", {
      origin: "right",
    });
  };

  const autoTypeFunction = () => {
    const type = new Typed("#auto-type", {
      strings: ["Content Writer", "Python Developer", "MERN Stack Developer"],
      typeSpeed: 150,
      backSpeed: 150,
      loop: true,
    });
  };

  const animateProgressBars = () => {
    const progressBars = document.querySelectorAll(".progress-line span");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const parent = entry.target.parentElement;

            const targetWidth = parent.getAttribute("data-percent");
            entry.target.style.width = targetWidth;

            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
      },
    );

    progressBars.forEach((bar) => observer.observe(bar));
  };

  const dateFunction = () => {
    const date = new Date();
    const yearDisplay = date.getFullYear();
    dateDisplay.textContent = yearDisplay;
  };

  const validationForm = () => {
    const form = document.querySelector(".form-section form");
    const username = document.querySelector("#username");
    const email = document.querySelector("#email");
    const feedback = document.querySelector("#feedback");
    const formValidation = document.querySelector("#form-message");

    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      let isValid = true;

      if (username.value.trim() === "") {
        setError(username, "Username is required");
        isValid = false;
      } else {
        setSuccess(username);
      }

      if (email.value.trim() === "") {
        setError(email, "Email is required");
        isValid = false;
      } else if (!isEmail(email.value.trim())) {
        setError(email, "Please enter a valid email");
        isValid = false;
      } else {
        setSuccess(email);
      }

      if (feedback.value.trim() === "") {
        setError(feedback, "Feedback cannot be empty");
        isValid = false;
      } else {
        setSuccess(feedback);
      }

      if (!isValid) {
        return;
      }

      const submitBtn = form.querySelector('input[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.value = "SENDING...";
      }

      formValidation.style.color = "#fff";
      formValidation.textContent = "⏳ Sending feedback...";

      const nameVal = username.value.trim();
      const emailVal = email.value.trim();
      const feedbackVal = feedback.value.trim();

      sendContactEmail(nameVal, emailVal, feedbackVal)
        .then(() => {
          formValidation.style.color = "#2ecc71";
          formValidation.textContent = "✔ Feedback sent successfully to Gmail!";
          form.reset();
          [username, email, feedback].forEach((input) => {
            input.classList.remove("success");
            input.classList.remove("error");
          });
        })
        .catch((err) => {
          console.error("Mail send error:", err);
          formValidation.style.color = "#ff4d4d";
          if (err && err.message && err.message.toLowerCase().includes("activation")) {
            formValidation.style.color = "#874cd4";
            formValidation.textContent = "📩 One-time setup: Please check your Gmail and click 'Activate Form'!";
          } else {
            formValidation.textContent = "❌ Could not send. Please try again later.";
          }
        })
        .finally(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.value = "SUBMIT";
          }
        });
    });

    function setError(input, message) {
      const parent = input.parentElement;

      input.classList.add("error");
      input.classList.remove("success");

      let errorDisplay = parent.querySelector(".error-message");

      if (!errorDisplay) {
        errorDisplay = document.createElement("span");
        errorDisplay.className = "error-message";
        parent.appendChild(errorDisplay);
      }

      errorDisplay.textContent = message;
    }

    function setSuccess(input) {
      const parent = input.parentElement;

      input.classList.add("success");
      input.classList.remove("error");

      const errorDisplay = parent.querySelector(".error-message");

      if (errorDisplay) {
        errorDisplay.remove();
      }
    }

    function isEmail(email) {
      const reExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return reExp.test(email);
    }
  };

  dateFunction();
  scrollingFunction();
  autoTypeFunction();
  animateProgressBars();
  validationForm();
});
