/* Theme bootstrap: apply the saved theme before the page paints. */
(function () {
  try {
    var theme = localStorage.getItem('valois_theme') || 'dark';
    var root = document.documentElement;
    root.classList.toggle('theme-light', theme === 'light');
    root.classList.toggle('theme-dark', theme !== 'light');
    if (theme === 'light') root.classList.add('theme-light-pending');
  } catch (e) {
    document.documentElement.classList.add('theme-dark');
  }
})();
