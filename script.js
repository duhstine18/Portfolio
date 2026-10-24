
"use strict";

/* =========================================
   PORTRAIT SCROLL ANIMATION
========================================= */

const TOTAL_FRAMES = 240;

const canvas = document.getElementById(
  "portrait-sequence"
);

const ctx = canvas.getContext("2d", {
  alpha: false
});

const hero = document.querySelector(".hero-scroll");

const frames = new Array(TOTAL_FRAMES);

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

let desiredFrame = 0;
let renderedFrame = -1;
let rafPending = false;

let viewWidth = 0;
let viewHeight = 0;

/* FRAME PATH */

function framePath(index) {
  const number = String(index + 1).padStart(3, "0");

  return `frames/ezgif-frame-${number}.jpg`;
}

/* LOAD FRAMES */

function loadFrame(index) {

  if (index < 0 || index >= TOTAL_FRAMES) {
    return;
  }

  if (frames[index]) {
    return;
  }

  const img = new Image();

  frames[index] = img;
  img.decoding = "async";

  img.onload = () => {

    if (
      index === desiredFrame ||
      renderedFrame < 0
    ) {
      requestDraw();
    }

  };

  img.onerror = () => {
    frames[index] = null;
  };

  img.src = framePath(index);
}

/* DRAW FRAME */

function drawFrame() {

  rafPending = false;

  if (!viewWidth || !viewHeight) {
    return;
  }

  let index = desiredFrame;

  if (
    !frames[index]?.complete ||
    !frames[index]?.naturalWidth
  ) {

    let bestDistance = Infinity;

    for (let i = 0; i < TOTAL_FRAMES; i++) {

      if (
        frames[i]?.complete &&
        frames[i]?.naturalWidth
      ) {

        const distance = Math.abs(
          i - desiredFrame
        );

        if (distance < bestDistance) {

          index = i;
          bestDistance = distance;

        }
      }
    }

    if (bestDistance === Infinity) {
      return;
    }
  }

  if (index === renderedFrame) {
    return;
  }

  const img = frames[index];

  const ratio = Math.max(
    viewWidth / img.naturalWidth,
    viewHeight / img.naturalHeight
  );

  const width = img.naturalWidth * ratio;
  const height = img.naturalHeight * ratio;

  const shift =
    viewWidth > 850
      ? Math.min(viewWidth * .12, 185)
      : viewWidth * .12;

  const x = (viewWidth - width) / 2 + shift;
  const y = (viewHeight - height) / 2;

  ctx.fillStyle = "#060606";
  ctx.fillRect(0, 0, viewWidth, viewHeight);

  ctx.drawImage(
    img,
    x,
    y,
    width,
    height
  );

  renderedFrame = index;
}

/* DRAW REQUEST */

function requestDraw() {

  if (rafPending) {
    return;
  }

  rafPending = true;

  requestAnimationFrame(drawFrame);
}

/* RESIZE CANVAS */

function resizeCanvas() {

  viewWidth = canvas.clientWidth;
  viewHeight = canvas.clientHeight;

  const dpr = Math.min(
    window.devicePixelRatio || 1,
    2
  );

  canvas.width = Math.round(viewWidth * dpr);
  canvas.height = Math.round(viewHeight * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  renderedFrame = -1;

  requestDraw();
}

/* UPDATE SCROLL ANIMATION */

function updateSequence() {

  if (reducedMotion) {
    return;
  }

  const distance =
    hero.offsetHeight - window.innerHeight;

  const progress = Math.min(
    1,
    Math.max(
      0,
      -hero.getBoundingClientRect().top /
        Math.max(distance, 1)
    )
  );

  const nextFrame = Math.round(
    progress * (TOTAL_FRAMES - 1)
  );

  if (nextFrame === desiredFrame) {
    return;
  }

  desiredFrame = nextFrame;

  loadFrame(nextFrame);

  for (let offset = 1; offset <= 5; offset++) {
    loadFrame(nextFrame + offset);
    loadFrame(nextFrame - offset);
  }

  requestDraw();
}

/* INITIAL FRAMES */

loadFrame(0);

for (let i = 1; i < 12; i++) {
  loadFrame(i);
}

/* EVENT LISTENERS */

window.addEventListener(
  "scroll",
  updateSequence,
  { passive: true }
);

window.addEventListener(
  "resize",
  () => {
    resizeCanvas();
    updateSequence();
  },
  { passive: true }
);

resizeCanvas();
updateSequence();

/* PRELOAD REMAINING FRAMES */

let preloadAt = 12;

function preloadBatch() {

  const stop = Math.min(
    TOTAL_FRAMES,
    preloadAt + 12
  );

  while (preloadAt < stop) {
    loadFrame(preloadAt++);
  }

  if (preloadAt < TOTAL_FRAMES) {

    if ("requestIdleCallback" in window) {

      requestIdleCallback(preloadBatch, {
        timeout: 250
      });

    } else {

      setTimeout(preloadBatch, 90);

    }
  }
}

if (!reducedMotion) {

  if ("requestIdleCallback" in window) {

    requestIdleCallback(preloadBatch, {
      timeout: 350
    });

  } else {

    setTimeout(preloadBatch, 150);

  }
}

/* =========================================
   SECTION REVEAL ANIMATIONS
========================================= */

const revealItems = document.querySelectorAll(
  ".reveal"
);

if (
  reducedMotion ||
  !("IntersectionObserver" in window)
) {

  revealItems.forEach((element) => {
    element.classList.add("visible");
  });

} else {

  const observer = new IntersectionObserver(
    (entries) => {

      entries.forEach((entry) => {

        if (entry.isIntersecting) {

          entry.target.classList.add("visible");

          observer.unobserve(entry.target);

        }
      });

    },
    {
      threshold: .12,
      rootMargin: "0px 0px -35px 0px"
    }
  );

  revealItems.forEach((element) => {
    observer.observe(element);
  });
}

/* =========================================
   PROJECT IMAGE LOADING
========================================= */

document.querySelectorAll(
  ".work-art img"
).forEach((img) => {

  const showImage = () => {

    if (img.naturalWidth > 0) {

      img.parentElement.classList.add(
        "has-image"
      );

    }
  };

  if (img.complete) {

    showImage();

  } else {

    img.addEventListener(
      "load",
      showImage,
      { once: true }
    );

    img.addEventListener(
      "error",
      () => {
        img.remove();
      },
      { once: true }
    );
  }
});

/* =========================================
   MOBILE MENU
========================================= */

const menu = document.querySelector(
  ".menu-toggle"
);

const nav = document.querySelector(".nav");

menu.addEventListener("click", () => {

  const open = nav.classList.toggle("open");

  menu.setAttribute(
    "aria-expanded",
    String(open)
  );

});

nav.querySelectorAll("a").forEach((link) => {

  link.addEventListener("click", () => {

    nav.classList.remove("open");

    menu.setAttribute(
      "aria-expanded",
      "false"
    );

  });

});

/* =========================================
   COPYRIGHT
========================================= */

document.getElementById("year").textContent =
  new Date().getFullYear();
