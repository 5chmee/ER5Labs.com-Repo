// Pull-cord lamp. Sets data-theme explicitly both ways, so the choice wins over
// the system setting, and remembers it (public/theme.js applies it on the next
// visit before the page paints).

const root = document.documentElement;
const lamp = document.querySelector('.lamp');
const btn = document.getElementById('lamp-toggle');

if (lamp && btn) {
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  const isDark = () => (root.getAttribute('data-theme') || (systemDark.matches ? 'dark' : 'light')) === 'dark';
  const sync = () => btn.setAttribute('aria-pressed', String(isDark()));

  sync();
  systemDark.addEventListener('change', sync);

  btn.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try {
      localStorage.setItem('er5-theme', next);
    } catch {
      // Storage blocked: the choice lasts for this page only.
    }
    sync();
    lamp.classList.add('is-pulling');
    setTimeout(() => lamp.classList.remove('is-pulling'), 430);
  });
}
