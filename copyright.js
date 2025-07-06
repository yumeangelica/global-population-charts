/**
 * Display copyright information in the footer
 * Automatically updates the copyright year to the current year
 * Uses optional chaining for safe DOM manipulation
 */
const showCopyRight = () => {
  const year = new Date().getFullYear();
  const copyRightElement = document.getElementById('copyRight');

  // Safe DOM manipulation with proper null check
  if (copyRightElement) {
    copyRightElement.textContent = `© 2021 – ${year} yumeangelica.github.io. All Rights Reserved.`;
  }
};