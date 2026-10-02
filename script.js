const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelectorAll('a[href="#inicio"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    if (location.hash !== "#inicio") history.pushState(null, "", "#inicio");
  });
});
const carousel = document.querySelector("[data-carousel]");

if (carousel) {
  const viewport = carousel.querySelector(".carousel-viewport");
  const slides = [...carousel.querySelectorAll(".slide")];
  const tabs = [...carousel.querySelectorAll("[data-goto]")];
  const title = carousel.querySelector(".carousel-title");
  const caption = carousel.querySelector(".carousel-caption");
  const prev = carousel.querySelector('[data-dir="-1"]');
  const next = carousel.querySelector('[data-dir="1"]');
  let active = 0;
  let frame = 0;

  const setActive = (index) => {
    active = index;
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
    tabs.forEach((tab, i) => tab.setAttribute("aria-selected", i === index ? "true" : "false"));
    const slideKey = slides[index].dataset.slide;
    title.textContent = window.HourFlowI18n.t(`slide.${slideKey}.title`);
    caption.textContent = window.HourFlowI18n.t(`slide.${slideKey}.caption`);
    prev.disabled = index === 0;
    next.disabled = index === slides.length - 1;
  };

  const distanceFromCenter = (slide) => {
    const view = viewport.getBoundingClientRect();
    const box = slide.getBoundingClientRect();
    return box.left + box.width / 2 - (view.left + view.width / 2);
  };

  const nearest = () => {
    let best = 0;
    let bestDistance = Infinity;
    slides.forEach((slide, index) => {
      const distance = Math.abs(distanceFromCenter(slide));
      if (distance < bestDistance) {
        bestDistance = distance;
        best = index;
      }
    });
    return best;
  };

  const goToSlide = (index) => {
    const nextIndex = Math.max(0, Math.min(slides.length - 1, index));
    const delta = distanceFromCenter(slides[nextIndex]);
    viewport.scrollTo({
      left: viewport.scrollLeft + delta,
      behavior: reduceMotion ? "auto" : "smooth",
    });
    setActive(nextIndex);
  };

  viewport.addEventListener(
    "scroll",
    () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setActive(nearest()));
    },
    { passive: true }
  );

  carousel.addEventListener("click", (event) => {
    const arrow = event.target.closest("[data-dir]");
    if (arrow && carousel.contains(arrow)) {
      goToSlide(active + Number(arrow.dataset.dir));
      return;
    }
    const tab = event.target.closest("[data-goto]");
    if (tab && carousel.contains(tab)) goToSlide(Number(tab.dataset.goto));
  });

  viewport.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToSlide(active + 1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToSlide(active - 1);
    }
  });

  setActive(0);
  window.addEventListener("hourflow:languagechange", () => setActive(active));
}
