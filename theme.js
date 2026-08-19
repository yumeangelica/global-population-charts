(() => {
  'use strict';

  /** @typedef {'light' | 'dark'} Theme */

  const STORAGE_KEY = 'yumeangelica-color-theme';
  const root = document.documentElement;
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');

  /** @returns {Theme | null} */
  const readStoredTheme = () => {
    try {
      const value = window.localStorage.getItem(STORAGE_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch {
      return null;
    }
  };

  /** @param {Theme} theme */
  const storeTheme = (theme) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // The selected theme still works for this page when storage is unavailable.
    }
  };

  /** @type {Theme | null} */
  let storedTheme = readStoredTheme();
  /** @type {Theme} */
  let activeTheme = storedTheme ?? (systemTheme.matches ? 'dark' : 'light');

  const syncBrowserThemeColor = () => {
    const themeColor = /** @type {HTMLMetaElement | null} */ (document.querySelector('meta[name="theme-color"]'));
    if (!themeColor || !document.body) return;
    themeColor.content = window.getComputedStyle(document.body).backgroundColor;
  };

  /** @param {Theme} theme */
  const applyTheme = (theme) => {
    activeTheme = theme;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    syncBrowserThemeColor();

    const toggle = /** @type {HTMLButtonElement | null} */ (document.querySelector('[data-theme-toggle]'));
    if (toggle) toggle.setAttribute('aria-checked', String(theme === 'dark'));

    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  };

  const setupToggle = () => {
    const toggle = /** @type {HTMLButtonElement | null} */ (document.querySelector('[data-theme-toggle]'));
    if (!toggle) return;

    applyTheme(activeTheme);
    toggle.addEventListener('click', () => {
      storedTheme = activeTheme === 'dark' ? 'light' : 'dark';
      storeTheme(storedTheme);
      applyTheme(storedTheme);
    });
  };

  applyTheme(activeTheme);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupToggle, { once: true });
  } else {
    setupToggle();
  }

  systemTheme.addEventListener('change', (event) => {
    if (storedTheme !== null) return;
    applyTheme(event.matches ? 'dark' : 'light');
  });
})();
