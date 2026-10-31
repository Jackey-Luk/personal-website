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

  // Marks the navigation link for the section in view. The links lead to places
  // within one page, so the value is "location" rather than "page".
  function setUpSectionHighlight() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".nav-list a"));
    var sections = links.map(function (link) {
      return document.querySelector(link.getAttribute("href"));
    });
    var header = document.querySelector(".site-header");
    var updatePending = false;

    function currentIndex() {
      var readingLine = header.offsetHeight + window.innerHeight * 0.25;
      var reachedEnd = window.scrollY > 0 &&
        window.innerHeight + window.scrollY >= root.scrollHeight - 1;
      var index = 0;

      // The last section is short and may never reach the reading line.
      if (reachedEnd) {
        return sections.length - 1;
      }

      sections.forEach(function (section, position) {
        if (section.getBoundingClientRect().top <= readingLine) {
          index = position;
        }
      });

      return index;
    }

    function update() {
      var active = currentIndex();
      updatePending = false;

      links.forEach(function (link, position) {
        if (position === active) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    function requestUpdate() {
      if (!updatePending) {
        updatePending = true;
        window.requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    // Opening a panel changes the page length. The toggle event does not bubble,
    // so it is caught on the way down.
    document.addEventListener("toggle", requestUpdate, true);
    update();
  }

  // This file loads in the head, so a remembered theme applies before first paint.
  var storedTheme = readStoredTheme();
  if (storedTheme) {
    root.setAttribute("data-theme", storedTheme);
  }

  document.addEventListener("DOMContentLoaded", function () {
    setUpThemeToggle();
    setUpHeaderOffset();
    setUpSectionHighlight();
  });
})();
