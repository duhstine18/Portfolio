
(() => {
  "use strict";

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const finePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  );

  // CURRENT YEAR

  const year = $("#year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // MOBILE NAVIGATION

  const toggle = $(".menu-toggle");
  const nav = $("#site-nav");

  function closeMenu() {
    if (!toggle || !nav) return;

    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");

    nav.classList.remove("is-open");
  }

  toggle?.addEventListener("click", () => {
    const isOpen =
      toggle.getAttribute("aria-expanded") !== "true";

    toggle.setAttribute("aria-expanded", String(isOpen));

    toggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation" : "Open navigation"
    );

    nav?.classList.toggle("is-open", isOpen);

    if (isOpen) {
      nav?.querySelector("a")?.focus();
    }
  });

  $$("#site-nav a").forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });

  document.addEventListener("pointerdown", event => {
    if (!nav || !toggle) return;

    if (
      !nav.contains(event.target) &&
      !toggle.contains(event.target)
    ) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 750) closeMenu();
  });

  // SCROLL PROGRESS

  const progress = $(".scroll-progress");
  let ticking = false;

  function updateProgress() {
    const max =
      document.documentElement.scrollHeight -
      window.innerHeight;

    if (progress) {
      const percent =
        max > 0
          ? Math.min(100, (window.scrollY / max) * 100)
          : 0;

      progress.style.width = `${percent}%`;
    }

    ticking = false;
  }

  function requestProgress() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateProgress);
    }
  }

  window.addEventListener("scroll", requestProgress, {
    passive: true
  });

  window.addEventListener("resize", requestProgress, {
    passive: true
  });

  updateProgress();

  // ACTIVE NAVIGATION

  if ("IntersectionObserver" in window) {
    const links = $$('#site-nav a[href^="#"]');

    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        links.forEach(link => {
          const active =
            link.getAttribute("href") ===
            `#${entry.target.id}`;

          link.classList.toggle("active", active);

          if (active) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    }, {
      rootMargin: "-20% 0px -60% 0px"
    });

    $$("main section[id]").forEach(section => {
      spy.observe(section);
    });
  }

  // REVEAL ANIMATIONS

  if (
    !reducedMotion.matches &&
    "IntersectionObserver" in window &&
    window.innerWidth > 900
  ) {
    const observer = new IntersectionObserver(
      (entries, instance) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          instance.unobserve(entry.target);
        });
      },
      {
        threshold: 0.06,
        rootMargin: "0px 0px -20px 0px"
      }
    );

    $$(".reveal").forEach(element => {
      observer.observe(element);
    });

    document.documentElement.classList.add("js-motion");
  }

  // MAGNETIC BUTTONS

  if (finePointer.matches && !reducedMotion.matches) {
    $$(".magnetic").forEach(element => {
      element.addEventListener("pointermove", event => {
        const rect = element.getBoundingClientRect();

        const x =
          (event.clientX - rect.left - rect.width / 2) * 0.12;

        const y =
          (event.clientY - rect.top - rect.height / 2) * 0.12;

        element.style.translate = `${x}px ${y}px`;
      });

      element.addEventListener("pointerleave", () => {
        element.style.translate = "";
      });
    });

    // HERO PORTRAIT MOVEMENT

    const portrait = $("[data-parallax]");
    const hero = portrait?.closest(".hero");

    hero?.addEventListener("pointermove", event => {
      if (!portrait || window.innerWidth <= 750) return;

      const rect = hero.getBoundingClientRect();

      const x =
        ((event.clientX - rect.left) / rect.width - 0.5) * 10;

      const y =
        ((event.clientY - rect.top) / rect.height - 0.5) * 8;

      portrait.style.translate = `${x}px ${y}px`;
    });

    hero?.addEventListener("pointerleave", () => {
      if (portrait) portrait.style.translate = "";
    });

    // CURSOR GLOW

    const glow = $(".cursor-glow");

    if (glow) {
      let scheduled = false;
      let x = 0;
      let y = 0;

      window.addEventListener("pointermove", event => {
        x = event.clientX;
        y = event.clientY;

        if (scheduled) return;

        scheduled = true;

        requestAnimationFrame(() => {
          glow.style.left = `${x}px`;
          glow.style.top = `${y}px`;
          scheduled = false;
        });
      }, { passive: true });
    }
  }

  // INTERACTIVE EMAIL BUTTONS

  const email = "justinelargo8@gmail.com";
  const copyButton = $("#copyEmail");
  const copyText = $("#copyEmailText");
  const copyIcon = $("#copyEmailIcon");
  const toast = $("#emailToast");

  let toastTimer;
  let resetTimer;

  function showToast(message) {
    if (!toast) return;

    clearTimeout(toastTimer);

    toast.textContent = message;
    toast.classList.add("show");

    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3200);
  }

  async function copyEmail() {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(email);
      } else {
        const temporary = document.createElement("textarea");
        temporary.value = email;
        temporary.setAttribute("readonly", "");
        temporary.style.position = "fixed";
        temporary.style.opacity = "0";
        document.body.appendChild(temporary);
        temporary.select();

        const copied = document.execCommand("copy");
        temporary.remove();

        if (!copied) {
          throw new Error("Clipboard unavailable");
        }
      }

      if (copyText) copyText.textContent = "EMAIL COPIED!";
      if (copyIcon) copyIcon.textContent = "✓";

      copyButton?.classList.add("copied");

      showToast("Email address copied to clipboard!");

      clearTimeout(resetTimer);

      resetTimer = setTimeout(() => {
        if (copyText) {
          copyText.textContent = "COPY EMAIL ADDRESS";
        }

        if (copyIcon) copyIcon.textContent = "⧉";

        copyButton?.classList.remove("copied");
      }, 3000);

    } catch (error) {
      showToast("Copy failed. Select the email address below instead.");
    }
  }

  copyButton?.addEventListener("click", copyEmail);

  // MAILTO: DO NOT BLOCK THE LINK

  const sendEmail = $("#sendEmail");

  sendEmail?.addEventListener("click", () => {
    showToast(
      "Opening your email app. If nothing opens, use Copy Email Address."
    );
  });

  // IMAGE LOADING WARNINGS

  $$(
    ".hero-portrait, .rift-stage img, .racos-banner"
  ).forEach(image => {
    const reportMissing = () => {
      console.warn(
        "Missing portfolio image:",
        image.getAttribute("src")
      );
    };

    image.addEventListener("error", reportMissing);

    if (image.complete && image.naturalWidth === 0) {
      reportMissing();
    }
  });
})();
