
"use strict";

/* ==========================================
   JUSTINE KIM LARGO PORTFOLIO
   RESPONSIVE JAVASCRIPT
========================================== */

/* ==========================================
   PORTRAIT SCROLL ANIMATION
========================================== */

const TOTAL_FRAMES = 240;

const canvas = document.getElementById(
  "portrait-sequence"
);

const hero = document.querySelector(
  ".hero-scroll"
);

const ctx = canvas
  ? canvas.getContext("2d", { alpha: false })
  : null;

const frames = new Array(TOTAL_FRAMES);

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

let desiredFrame = 0;
let displayedFrame = -1;
let animationRequested = false;

let canvasWidth = 0;
let canvasHeight = 0;

/* ==========================================
   FRAME FILE PATH
========================================== */

function framePath(index) {
  const number = String(index + 1).padStart(3, "0");

  return `frames/ezgif-frame-${number}.jpg`;
}

/* ==========================================
   LOAD ANIMATION FRAME
========================================== */

function loadFrame(index) {
  if (index < 0 || index >= TOTAL_FRAMES) {
    return;
  }

  if (frames[index]) {
    return;
  }

  const image = new Image();

  frames[index] = image;
  image.decoding = "async";

  image.onload = () => {
    requestDraw();
  };

  image.onerror = () => {
    // Mark this frame unavailable to avoid
    // repeatedly requesting a missing file.
    frames[index] = false;
  };

  image.src = framePath(index);
}

/* ==========================================
   FIND NEAREST AVAILABLE FRAME
========================================== */

function getAvailableFrame(index) {
  const requested = frames[index];

  if (
    requested instanceof Image &&
    requested.complete &&
    requested.naturalWidth > 0
  ) {
    return index;
  }

  for (let distance = 1; distance < TOTAL_FRAMES; distance++) {
    const before = index - distance;
    const after = index + distance;

    if (before >= 0) {
      const image = frames[before];

      if (
        image instanceof Image &&
        image.complete &&
        image.naturalWidth > 0
      ) {
        return before;
      }
    }

    if (after < TOTAL_FRAMES) {
      const image = frames[after];

      if (
        image instanceof Image &&
        image.complete &&
        image.naturalWidth > 0
      ) {
        return after;
      }
    }
  }

  return -1;
}

/* ==========================================
   DRAW PORTRAIT — RESPONSIVE
========================================== */

function drawFrame() {
  animationRequested = false;

  if (!ctx || !canvasWidth || !canvasHeight) {
    return;
  }

  const index = getAvailableFrame(desiredFrame);

  if (index === -1) {
    return;
  }

  if (index === displayedFrame) {
    return;
  }

  const image = frames[index];

  const mobile = canvasWidth <= 600;

  let drawWidth;
  let drawHeight;
  let x;
  let y;

  if (mobile) {

    /*
      MOBILE:
      Avoid using "cover", because that
      makes a 16:9 frame extremely zoomed
      on a tall phone screen.

      Instead, position a larger portrait
      across the upper portion, leaving
      room for text below.
    */

    drawWidth = Math.max(
      canvasWidth * 1.35,
      canvasHeight * 0.92
    );

    drawHeight =
      drawWidth *
      (image.naturalHeight / image.naturalWidth);

    x = (canvasWidth - drawWidth) / 2;
    y = canvasHeight * 0.075;

  } else {

    /*
      DESKTOP:
      Cover the canvas and shift the image
      slightly to the right to leave space
      for the large heading.
    */

    const scale = Math.max(
      canvasWidth / image.naturalWidth,
      canvasHeight / image.naturalHeight
    );

    drawWidth = image.naturalWidth * scale;
    drawHeight = image.naturalHeight * scale;

    const shift = Math.min(
      canvasWidth * 0.12,
      185
    );

    x = (canvasWidth - drawWidth) / 2 + shift;
    y = (canvasHeight - drawHeight) / 2;
  }

  /* BLACK BACKGROUND */

  ctx.fillStyle = "#060606";
  ctx.fillRect(
    0,
    0,
    canvasWidth,
    canvasHeight
  );

  /* DRAW THE PORTRAIT */

  ctx.drawImage(
    image,
    x,
    y,
    drawWidth,
    drawHeight
  );

  displayedFrame = index;
}

/* ==========================================
   REQUEST CANVAS DRAW
========================================== */

function requestDraw() {
  if (!ctx || animationRequested) {
    return;
  }

  animationRequested = true;

  requestAnimationFrame(drawFrame);
}

/* ==========================================
   RESIZE CANVAS
========================================== */

function resizeCanvas() {
  if (!canvas || !ctx) {
    return;
  }

  canvasWidth = canvas.clientWidth;
  canvasHeight = canvas.clientHeight;

  if (!canvasWidth || !canvasHeight) {
    return;
  }

  const pixelRatio = Math.min(
    window.devicePixelRatio || 1,
    2
  );

  canvas.width = Math.round(
    canvasWidth * pixelRatio
  );

  canvas.height = Math.round(
    canvasHeight * pixelRatio
  );

  ctx.setTransform(
    pixelRatio,
    0,
    0,
    pixelRatio,
    0,
    0
  );

  displayedFrame = -1;

  requestDraw();
}

/* ==========================================
   UPDATE ANIMATION ON SCROLL
========================================== */

function updateSequence() {
  if (!hero || reducedMotion) {
    return;
  }

  const scrollDistance = Math.max(
    1,
    hero.offsetHeight - window.innerHeight
  );

  const progress = Math.min(
    1,
    Math.max(
      0,
      -hero.getBoundingClientRect().top /
      scrollDistance
    )
  );

  const nextFrame = Math.round(
    progress * (TOTAL_FRAMES - 1)
  );

  if (nextFrame === desiredFrame) {
    return;
  }

  desiredFrame = nextFrame;

  /* LOAD REQUESTED FRAME */

  loadFrame(desiredFrame);

  /* PRELOAD NEARBY FRAMES */

  for (let offset = 1; offset <= 6; offset++) {
    loadFrame(desiredFrame - offset);
    loadFrame(desiredFrame + offset);
  }

  requestDraw();
}

/* ==========================================
   INITIALIZE ANIMATION
========================================== */

if (canvas && hero && ctx) {

  /* Load the initial frame immediately */

  loadFrame(0);

  /* Load nearby starting frames */

  for (let i = 1; i < 12; i++) {
    loadFrame(i);
  }

  resizeCanvas();
  updateSequence();

  /* One scheduled update per animation frame */

  let scrollScheduled = false;

  window.addEventListener(
    "scroll",
    () => {
      if (scrollScheduled) return;

      scrollScheduled = true;

      requestAnimationFrame(() => {
        scrollScheduled = false;
        updateSequence();
      });
    },
    { passive: true }
  );

  let resizeScheduled = false;

  window.addEventListener(
    "resize",
    () => {
      if (resizeScheduled) return;

      resizeScheduled = true;

      requestAnimationFrame(() => {
        resizeScheduled = false;
        resizeCanvas();
        updateSequence();
      });
    },
    { passive: true }
  );

  /* ======================================
     PRELOAD FRAMES IN BATCHES
  ====================================== */

  if (!reducedMotion) {

    let nextPreloadFrame = 12;

    function preloadBatch() {
      const end = Math.min(
        TOTAL_FRAMES,
        nextPreloadFrame + 10
      );

      while (nextPreloadFrame < end) {
        loadFrame(nextPreloadFrame);
        nextPreloadFrame++;
      }

      if (nextPreloadFrame < TOTAL_FRAMES) {
        schedulePreload();
      }
    }

    function schedulePreload() {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(
          preloadBatch,
          { timeout: 500 }
        );
      } else {
        setTimeout(preloadBatch, 100);
      }
    }

    schedulePreload();
  }
}

/* ==========================================
   SCROLL REVEAL ANIMATIONS
========================================== */

const revealElements = document.querySelectorAll(
  ".reveal"
);

if (
  reducedMotion ||
  !("IntersectionObserver" in window)
) {

  revealElements.forEach((element) => {
    element.classList.add("visible");
  });

} else {

  const revealObserver = new IntersectionObserver(
    (entries) => {

      entries.forEach((entry) => {

        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }

      });

    },
    {
      threshold: 0.08,
      rootMargin: "0px 0px -20px 0px"
    }
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
}

/* ==========================================
   MOBILE MENU
========================================== */

const menuToggle = document.querySelector(
  ".menu-toggle"
);

const navigation = document.querySelector(
  ".nav"
);

if (menuToggle && navigation) {

  menuToggle.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle(
      "open"
    );

    menuToggle.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation" : "Open navigation"
    );
  });

  /* Close menu after selecting a link */

  navigation.querySelectorAll("a").forEach(
    (link) => {

      link.addEventListener("click", () => {
        navigation.classList.remove("open");

        menuToggle.setAttribute(
          "aria-expanded",
          "false"
        );

        menuToggle.setAttribute(
          "aria-label",
          "Open navigation"
        );
      });

    }
  );

  /* Close the menu when pressing Escape */

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape") {
        navigation.classList.remove("open");

        menuToggle.setAttribute(
          "aria-expanded",
          "false"
        );
      }
    }
  );
}

/* ==========================================
   PROJECT IMAGE FALLBACK
========================================== */

document.querySelectorAll(
  ".work-art img"
).forEach((image) => {

  image.addEventListener(
    "error",
    () => {
      image.style.display = "none";
    },
    { once: true }
  );

});

/* ==========================================
   COPYRIGHT YEAR
========================================== */

const yearElement = document.getElementById(
  "year"
);

if (yearElement) {
  yearElement.textContent =
    new Date().getFullYear();
}
