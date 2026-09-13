// Applies a saved light or dark choice before the page paints, so a returning
// visitor never sees a flash of the other theme. Loaded synchronously from
// <head> as a file rather than inline, so the CSP needs no exception for it.
(function () {
  try {
    var theme = localStorage.getItem('er5-theme');
    if (theme === 'dark' || theme === 'light') document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    // Storage blocked: the page follows the system setting.
  }
})();
