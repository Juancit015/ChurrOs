(function () {
  const defaultTheme = "light";

  function applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  const setThemeMode = () => {
    if ((defaultTheme && defaultTheme.endsWith(":only")) || (!localStorage.theme && defaultTheme !== "system")) {
      applyTheme(defaultTheme.replace(":only", ""));
    } else if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      applyTheme("dark");
    } else {
      applyTheme("light");
    }
  };

  setThemeMode();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.add("theme-transition");
    });
  });

  function attachEvent(selector, event, fn) {
    const matches = typeof selector === "string" ? document.querySelectorAll(selector) : selector;
    if (matches && matches.length) {
      matches.forEach((elem) => {
        elem.addEventListener(event, (e) => fn(e, elem), false);
      });
    }
  }

  function initUI() {
    attachEvent("[data-aw-toggle-menu]", "click", (_, elem) => {
      elem.classList.toggle("expanded");
      document.body.classList.toggle("overflow-hidden");
      document.getElementById("header")?.classList.toggle("h-screen");
      document.getElementById("gradient")?.classList.toggle("hidden");
      document.querySelector("#header nav")?.classList.toggle("hidden");
    });

    attachEvent("[data-aw-toggle-color-scheme]", "click", () => {
      if (defaultTheme.endsWith(":only")) return;
      document.documentElement.classList.toggle("dark");
      localStorage.theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    });

    let ticking = false;
    let lastKnownScrollPosition = window.scrollY;

    function applyHeaderStylesOnScroll() {
      const header = document.getElementById("header");
      if (!header) return;
      if (lastKnownScrollPosition > 60 && !header.classList.contains("scroll")) {
        header.classList.add("scroll");
      } else if (lastKnownScrollPosition <= 60 && header.classList.contains("scroll")) {
        header.classList.remove("scroll");
      }
      ticking = false;
    }

    applyHeaderStylesOnScroll();

    if (!window.churrosScrollListenerAttached) {
      attachEvent([document], "scroll", () => {
        lastKnownScrollPosition = window.scrollY;
        if (!ticking) {
          window.requestAnimationFrame(() => {
            applyHeaderStylesOnScroll();
          });
          ticking = true;
        }
      });
      window.churrosScrollListenerAttached = true;
    }

    const aosElements = document.querySelectorAll(".aos, .aos-fade");
    if (aosElements.length) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("animated");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 },
      );
      aosElements.forEach((el) => observer.observe(el));
    }

    const menuBtn = document.querySelector("[data-aw-toggle-menu]");
    if (menuBtn) {
      menuBtn.classList.remove("expanded");
    }
    document.body.classList.remove("overflow-hidden");
    document.getElementById("header")?.classList.remove("h-screen");
    document.querySelector("#header nav")?.classList.add("hidden");
  }

  document.addEventListener("astro:page-load", initUI);
  document.addEventListener("astro:after-swap", setThemeMode);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initUI);
  } else {
    initUI();
  }
})();
