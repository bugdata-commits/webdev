(() => {
  const closeNavigation = (button, nav) => {
    if (!button || !nav) return;
    nav.classList.remove('open', 'bd-open');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Open navigation');
  };

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const button = document.querySelector('.menu-btn[aria-expanded="true"], .bd-menu[aria-expanded="true"]');
    if (!button) return;
    const navId = button.getAttribute('aria-controls') || (button.id === 'bdMenu' ? 'bdLinks' : 'navLinks');
    const nav = document.getElementById(navId);
    closeNavigation(button, nav);
    button.focus();
  });

  const video = document.querySelector('.hero-video');
  if (video) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const saveData = Boolean(navigator.connection && navigator.connection.saveData);
    video.removeAttribute('autoplay');
    video.preload = 'none';

    if (!reducedMotion.matches && !saveData) {
      video.preload = 'auto';
      const start = () => video.play().catch(() => {});
      if (document.visibilityState === 'visible') start();
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && !reducedMotion.matches) start();
        else video.pause();
      });
      reducedMotion.addEventListener?.('change', () => {
        if (reducedMotion.matches) video.pause();
        else if (document.visibilityState === 'visible') start();
      });
    } else {
      video.pause();
    }
  }
})();
