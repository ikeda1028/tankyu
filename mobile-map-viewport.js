(() => {
  const root = document.documentElement;
  const viewport = window.visualViewport;
  const bar = document.querySelector('.topbar');
  let frame;
  function update() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      // Preserve native pinch zoom instead of resizing the UI while magnified.
      if (viewport && Math.abs(viewport.scale - 1) > .01) return;
      root.style.setProperty('--map-visible-height', `${viewport?.height || window.innerHeight}px`);
      root.style.setProperty('--map-visible-top', `${viewport?.offsetTop || 0}px`);
      if (bar) root.style.setProperty('--map-toolbar-height', `${bar.getBoundingClientRect().height}px`);
    });
  }
  window.addEventListener('resize', update);
  window.addEventListener('pageshow', update);
  viewport?.addEventListener('resize', update);
  viewport?.addEventListener('scroll', update);
  if (bar) new ResizeObserver(update).observe(bar);
  update();
})();
