const canvas = document.getElementById("starfield");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  2000,
);
const starCount = 1800;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(starCount * 3);
const colors = new Float32Array(starCount * 3);
const phases = new Float32Array(starCount);
const speeds = new Float32Array(starCount);

const createGlowTexture = () => {
  const glowCanvas = document.createElement("canvas");
  glowCanvas.width = 64;
  glowCanvas.height = 64;
  const ctx = glowCanvas.getContext("2d");
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,0.95)");
  gradient.addColorStop(0.35, "rgba(180,240,255,0.65)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  return glowCanvas;
};
const starTexture = new THREE.CanvasTexture(createGlowTexture());
starTexture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());

for (let i = 0; i < starCount; i++) {
  const i3 = i * 3;
  const radius = 500 * Math.pow(Math.random(), 0.35) + 50;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);

  positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
  positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
  positions[i3 + 2] = radius * Math.cos(phi);

  colors[i3] = 0.8;
  colors[i3 + 1] = 0.9;
  colors[i3 + 2] = 1;

  phases[i] = Math.random() * Math.PI * 2;
  speeds[i] = 0.5 + Math.random();
}

geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
const colorAttribute = new THREE.BufferAttribute(colors, 3);
geometry.setAttribute("color", colorAttribute);

const material = new THREE.PointsMaterial({
  size: 3.5,
  map: starTexture,
  sizeAttenuation: true,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexColors: true,
});

const stars = new THREE.Points(geometry, material);
scene.add(stars);

const resizeRenderer = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};

resizeRenderer();
window.addEventListener("resize", resizeRenderer);

camera.position.z = 400;

let pointerX = 0;
let pointerY = 0;

window.addEventListener("pointermove", (event) => {
  const x = (event.clientX / window.innerWidth) * 2 - 1;
  const y = (event.clientY / window.innerHeight) * 2 - 1;
  pointerX = x * 30;
  pointerY = y * 20;
});

const clock = new THREE.Clock();
const floats = Array.from(document.querySelectorAll(".cube"));
const floatMeta = floats.map((_, index) => ({
  depth: 6 + index * 4,
  amplitude: 4 + Math.random() * 10,
  phase: Math.random() * Math.PI * 2,
  speed: 0.2 + Math.random() * 0.6,
}));

const bodyEl = document.body;
const projectTriggers = document.querySelectorAll('[data-action="projects"]');
const projectsClose = document.querySelector(".projects-close");
const scrollButtons = document.querySelectorAll("[data-scroll]");
const carousels = document.querySelectorAll("[data-carousel]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navOverlay = document.querySelector("[data-nav-overlay]");
const imageModal = document.querySelector("[data-image-modal]");
const modalImage = imageModal?.querySelector("[data-image-modal-img]");
const modalCaption = imageModal?.querySelector("[data-image-modal-caption]");
const modalCurrent = imageModal?.querySelector("[data-image-modal-current]");
const modalTotal = imageModal?.querySelector("[data-image-modal-total]");
const modalPrev = imageModal?.querySelector("[data-image-modal-prev]");
const modalNext = imageModal?.querySelector("[data-image-modal-next]");
const modalCloseTriggers = imageModal?.querySelectorAll(
  "[data-image-modal-close]",
);

const modalState = {
  items: [],
  index: 0,
  origin: null,
};

const updateModalSlide = () => {
  if (!modalState.items.length) return;
  const slide = modalState.items[modalState.index];
  if (modalImage && slide?.src) {
    modalImage.src = slide.src;
    modalImage.alt = slide.alt ?? "";
  }
  if (modalCaption) {
    modalCaption.textContent = slide?.caption ?? "";
  }
  if (modalCurrent) {
    modalCurrent.textContent = String(modalState.index + 1);
  }
  if (modalTotal) {
    modalTotal.textContent = String(modalState.items.length);
  }
};

const closeImageModal = () => {
  if (!imageModal || !imageModal.classList.contains("is-open")) return;
  imageModal.classList.remove("is-open");
  imageModal.setAttribute("aria-hidden", "true");
  bodyEl.classList.remove("modal-open");
  modalState.items = [];
  const origin = modalState.origin;
  modalState.origin = null;
  origin?.focus?.();
};

const openImageModal = (items, startIndex = 0, origin = null) => {
  if (!imageModal || !items.length) return;
  modalState.items = items;
  modalState.index = Math.min(Math.max(startIndex, 0), items.length - 1);
  modalState.origin = origin;
  updateModalSlide();
  imageModal.classList.add("is-open");
  imageModal.setAttribute("aria-hidden", "false");
  bodyEl.classList.add("modal-open");
  modalCloseTriggers?.[0]?.focus();
};

const stepModal = (delta) => {
  if (!modalState.items.length) return;
  const total = modalState.items.length;
  modalState.index = (modalState.index + delta + total) % total;
  updateModalSlide();
};

modalPrev?.addEventListener("click", () => stepModal(-1));
modalNext?.addEventListener("click", () => stepModal(1));
modalCloseTriggers?.forEach((trigger) =>
  trigger.addEventListener("click", closeImageModal),
);

imageModal?.addEventListener("click", (event) => {
  if (event.target === imageModal) {
    closeImageModal();
  }
});

const closeMobileNav = () => {
  if (!bodyEl.classList.contains("nav-open")) return;
  bodyEl.classList.remove("nav-open");
  navToggle?.setAttribute("aria-expanded", "false");
};

const toggleMobileNav = () => {
  if (!navToggle) return;
  const open = bodyEl.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(open));
};

navToggle?.addEventListener("click", toggleMobileNav);
navOverlay?.addEventListener("click", closeMobileNav);
window.addEventListener("resize", () => {
  if (window.innerWidth > 720) {
    closeMobileNav();
  }
});

const setProjectsMode = (enabled) => {
  if (enabled) {
    bodyEl.classList.add("projects-mode");
  } else {
    bodyEl.classList.remove("projects-mode");
  }
};

projectTriggers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    if (trigger.tagName === "A") {
      event.preventDefault();
    }
    closeMobileNav();
    setProjectsMode(true);
  });
});
projectsClose?.addEventListener("click", () => setProjectsMode(false));

scrollButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const selector = btn.getAttribute("data-scroll");
    if (!selector) return;
    closeMobileNav();
    setProjectsMode(false);
    const target = document.querySelector(selector);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (imageModal?.classList.contains("is-open")) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeImageModal();
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      stepModal(-1);
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      stepModal(1);
      return;
    }
  }

  if (event.key === "Escape") {
    setProjectsMode(false);
    closeMobileNav();
  }
});

carousels.forEach((carousel) => {
  const track = carousel.querySelector("[data-carousel-track]");
  if (!track) return;
  const slides = Array.from(track.children);
  if (!slides.length) return;

  let index = 0;
  const prevBtn = carousel.querySelector("[data-carousel-prev]");
  const nextBtn = carousel.querySelector("[data-carousel-next]");
  const currentEl = carousel.querySelector("[data-carousel-current]");
  const totalEl = carousel.querySelector("[data-carousel-total]");
  if (totalEl) totalEl.textContent = String(slides.length);

  const setActiveSlide = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    track.style.setProperty("--carousel-index", index);
    carousel.dataset.carouselIndex = String(index);
    slides.forEach((slide, slideIdx) => {
      slide.classList.toggle("is-active", slideIdx === index);
    });
    if (currentEl) currentEl.textContent = String(index + 1);
  };

  prevBtn?.addEventListener("click", () => setActiveSlide(index - 1));
  nextBtn?.addEventListener("click", () => setActiveSlide(index + 1));

  let pointerDown = false;
  let startX = 0;

  const handlePointerDown = (event) => {
    pointerDown = true;
    startX = event.clientX;
    track.setPointerCapture?.(event.pointerId);
  };

  const handlePointerUp = (event) => {
    if (!pointerDown) return;
    const delta = event.clientX - startX;
    if (Math.abs(delta) > 30) {
      setActiveSlide(index + (delta < 0 ? 1 : -1));
    }
    pointerDown = false;
    track.releasePointerCapture?.(event.pointerId);
  };

  track.addEventListener("pointerdown", handlePointerDown);
  track.addEventListener("pointerup", handlePointerUp);
  track.addEventListener("pointerleave", () => {
    pointerDown = false;
  });
  track.addEventListener("pointercancel", () => {
    pointerDown = false;
  });

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setActiveSlide(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setActiveSlide(index + 1);
    }
  });

  const buildSlideData = () =>
    slides
      .map((slide) => {
        const img = slide.querySelector("img");
        const caption = slide.querySelector("figcaption");
        return {
          src: img?.dataset.fullSrc || img?.currentSrc || img?.src || "",
          alt: img?.alt || caption?.textContent || "Project image",
          caption: caption?.textContent?.trim() || "",
        };
      })
      .filter((slide) => Boolean(slide.src));

  const launchModal = () => {
    const items = buildSlideData();
    if (!items.length) return;
    openImageModal(items, index, carousel);
  };

  carousel.addEventListener("click", (event) => {
    const controlClicked = event.target.closest(
      ".carousel-nav, .carousel-status",
    );
    if (controlClicked) return;
    launchModal();
  });

  carousel.addEventListener("keydown", (event) => {
    if (event.target.closest("button")) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      launchModal();
    }
  });

  setActiveSlide(0);
});

function animate() {
  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();
  const projectsMode = bodyEl.classList.contains("projects-mode");

  stars.rotation.y = elapsed * (projectsMode ? 0.018 : 0.01);
  stars.rotation.x = Math.sin(elapsed * 0.1) * 0.02;

  const cols = colorAttribute.array;
  for (let i = 0; i < starCount; i++) {
    const phase = phases[i];
    const speed = speeds[i];
    const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(elapsed * speed + phase));
    const i3 = i * 3;
    cols[i3] = 0.6 + twinkle * 0.4;
    cols[i3 + 1] = 0.7 + twinkle * 0.3;
    cols[i3 + 2] = 0.9 + twinkle * 0.2;
  }
  colorAttribute.needsUpdate = true;

  const targetZ = projectsMode ? 330 : 400;
  const baseX = projectsMode ? -180 : 0;
  const baseY = projectsMode ? 60 : 0;
  const pointerInfluence = projectsMode ? 0.25 : 1;
  const targetX = baseX + pointerX * pointerInfluence;
  const targetY = baseY + pointerY * pointerInfluence;

  camera.position.z += (targetZ - camera.position.z) * 0.02;
  camera.position.x += (targetX - camera.position.x) * 0.02;
  camera.position.y += (targetY - camera.position.y) * 0.02;
  camera.lookAt(scene.position);

  floats.forEach((panel, idx) => {
    const meta = floatMeta[idx];
    const bob = Math.sin(elapsed * meta.speed + meta.phase) * meta.amplitude;
    const tiltX = bob * 0.02;
    const tiltY = Math.cos(elapsed * meta.speed + meta.phase) * 0.5;
    panel.style.setProperty("--tiltX", `${tiltX.toFixed(2)}deg`);
    panel.style.setProperty("--tiltY", `${tiltY.toFixed(2)}deg`);
    panel.style.setProperty("--floatY", `${bob.toFixed(2)}px`);
    panel.style.setProperty("--depth", `${meta.depth}px`);
  });

  renderer.render(scene, camera);
}

animate();
