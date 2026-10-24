
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
    year.textContent = String(new Date().getFullYear());
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

    toggle.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

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
    if (event.key === "Escape") {
      closeMenu();
    }
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

  window.addEventListener(
    "resize",
    () => {
      if (window.innerWidth > 750) {
        closeMenu();
      }
    },
    { passive: true }
  );

  // SCROLL PROGRESS

  const progress = $(".scroll-progress");
  let scrolling = false;

  function updateProgress() {
    const total =
      document.documentElement.scrollHeight -
      window.innerHeight;

    if (progress) {
      const percentage =
        total > 0
          ? Math.min(
              100,
              (window.scrollY / total) * 100
            )
          : 0;

      progress.style.width = `${percentage}%`;
    }

    scrolling = false;
  }

  function requestProgress() {
    if (!scrolling) {
      scrolling = true;
      requestAnimationFrame(updateProgress);
    }
  }

  window.addEventListener(
    "scroll",
    requestProgress,
    { passive: true }
  );

  window.addEventListener(
    "resize",
    requestProgress,
    { passive: true }
  );

  updateProgress();

  // ACTIVE NAVIGATION

  if ("IntersectionObserver" in window) {
    const links = $$('#site-nav a[href^="#"]');

    const navigationObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          links.forEach(link => {
            const active =
              link.getAttribute("href") ===
              `#${entry.target.id}`;

            link.classList.toggle("active", active);

            if (active) {
              link.setAttribute(
                "aria-current",
                "location"
              );
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0
      }
    );

    $$("main section[id]").forEach(section => {
      navigationObserver.observe(section);
    });
  }

  // SECTION REVEAL ANIMATION

  if (
    !reducedMotion.matches &&
    "IntersectionObserver" in window &&
    window.innerWidth > 900
  ) {
    const revealElements = $$(".reveal");

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.06,
        rootMargin: "0px 0px -20px 0px"
      }
    );

    revealElements.forEach(element => {
      revealObserver.observe(element);
    });

    document.documentElement.classList.add("js-motion");
  }

  // MAGNETIC BUTTON EFFECT

  if (
    finePointer.matches &&
    !reducedMotion.matches
  ) {
    $$(".magnetic").forEach(element => {
      element.addEventListener("pointermove", event => {
        const rect =
          element.getBoundingClientRect();

        const x =
          (event.clientX -
            rect.left -
            rect.width / 2) * 0.12;

        const y =
          (event.clientY -
            rect.top -
            rect.height / 2) * 0.12;

        element.style.translate =
          `${x}px ${y}px`;
      });

      element.addEventListener("pointerleave", () => {
        element.style.translate = "";
      });
    });

    // PORTRAIT PARALLAX

    const portrait = $("[data-parallax]");
    const hero = portrait?.closest(".hero");

    hero?.addEventListener("pointermove", event => {
      if (!portrait || window.innerWidth <= 750) {
        return;
      }

      const rect = hero.getBoundingClientRect();

      const x =
        ((event.clientX - rect.left) /
          rect.width - 0.5) * 10;

      const y =
        ((event.clientY - rect.top) /
          rect.height - 0.5) * 8;

      portrait.style.translate =
        `${x}px ${y}px`;
    });

    hero?.addEventListener("pointerleave", () => {
      if (portrait) {
        portrait.style.translate = "";
      }
    });

    // CURSOR GLOW

    const glow = $(".cursor-glow");

    if (glow) {
      let frameRequested = false;

      window.addEventListener(
        "pointermove",
        event => {
          const x = event.clientX;
          const y = event.clientY;

          if (frameRequested) return;

          frameRequested = true;

          requestAnimationFrame(() => {
            glow.style.left = `${x}px`;
            glow.style.top = `${y}px`;
            frameRequested = false;
          });
        },
        { passive: true }
      );
    }
  }

  // HANDLE MISSING IMAGE ASSETS

  $$(".hero-portrait, .rift-stage img, .racos-banner")
    .forEach(image => {
      image.addEventListener("error", () => {
        console.warn(
          "Portfolio image not found:",
          image.getAttribute("src")
        );
      });

      if (
        image.complete &&
        image.naturalWidth === 0
      ) {
        console.warn(
          "Portfolio image not found:",
          image.getAttribute("src")
        );
      }
    });
})();
