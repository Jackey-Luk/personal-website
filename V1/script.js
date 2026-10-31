(function () {
  "use strict";

  var STORAGE_KEY = "theme";
  var root = document.documentElement;
  var darkScheme = window.matchMedia("(prefers-color-scheme: dark)");

  function readStoredTheme() {
    try {
      var theme = window.localStorage.getItem(STORAGE_KEY);
      return theme === "light" || theme === "dark" ? theme : null;
    } catch (error) {
      return null;
    }
  }

  function storeTheme(theme) {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      // Without storage the choice still applies until the page is closed.
    }
  }

  function currentTheme() {
    return root.getAttribute("data-theme") || (darkScheme.matches ? "dark" : "light");
  }

  function updateToggle(toggle) {
    var nextTheme = currentTheme() === "dark" ? "light" : "dark";
    toggle.textContent = nextTheme === "dark" ? "Dark theme" : "Light theme";
    toggle.setAttribute("aria-label", "Switch to " + nextTheme + " theme");
  }

  function setUpThemeToggle() {
    var toggle = document.getElementById("theme-toggle");

    toggle.addEventListener("click", function () {
      var theme = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", theme);
      storeTheme(theme);
      updateToggle(toggle);
    });

    darkScheme.addEventListener("change", function () {
      updateToggle(toggle);
    });

    updateToggle(toggle);
    toggle.hidden = false;
  }

  // The header can wrap on narrow screens, so section links use its real height.
  function setUpHeaderOffset() {
    var header = document.querySelector(".site-header");

    function syncHeight() {
      root.style.setProperty("--header-height", header.offsetHeight + "px");
    }

    window.addEventListener("resize", syncHeight);
    syncHeight();
  }

  // This file loads in the head, so a remembered theme applies before first paint.
  var storedTheme = readStoredTheme();
  if (storedTheme) {
    root.setAttribute("data-theme", storedTheme);
  }

  document.addEventListener("DOMContentLoaded", function () {
    setUpThemeToggle();
    setUpHeaderOffset();
  });
})();
