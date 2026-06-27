"use strict";

/* -- Dark mode: runs before DOM paint to avoid flash -- */
(function () {
  var saved       = localStorage.getItem("theme");
  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.setAttribute("data-theme", saved || (prefersDark ? "dark" : "light"));
})();

/* -- Preloader -- */
window.addEventListener("load", function () {
  var pre = document.getElementById("preloder");
  if (!pre) return;
  pre.style.opacity    = "0";
  pre.style.transition = "opacity 0.4s ease";
  setTimeout(function () { pre.style.display = "none"; }, 400);
});

document.addEventListener("DOMContentLoaded", function () {
  var html = document.documentElement;

  /* -- Theme toggle -- */
  var themeBtn  = document.getElementById("themeToggle");
  var themeIcon = themeBtn && themeBtn.querySelector("i");

  function applyTheme(theme) {
    html.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    if (themeIcon) themeIcon.className = theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
  }

  applyTheme(html.getAttribute("data-theme") || "light");
  if (themeBtn) themeBtn.addEventListener("click", function () {
    applyTheme(html.getAttribute("data-theme") === "dark" ? "light" : "dark");
  });

  /* -- Scroll: progress bar, nav shadow, back-to-top -- */
  var progressBar = document.getElementById("scrollProgress");
  var siteNav     = document.querySelector(".site-nav");
  var backToTop   = document.getElementById("backToTop");

  window.addEventListener("scroll", function () {
    var scrolled   = window.scrollY;
    var pageHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar) progressBar.style.width = (pageHeight > 0 ? (100 * scrolled / pageHeight) : 0) + "%";
    if (siteNav)     siteNav.classList.toggle("scrolled", scrolled > 20);
    if (backToTop)   backToTop.classList.toggle("visible", scrolled > 400);
  }, { passive: true });

  if (backToTop) backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* -- Active nav highlight -- */
  var navLinks = document.querySelectorAll(".nav-links a");
  if ("IntersectionObserver" in window && navLinks.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });

    document.querySelectorAll("section[id]").forEach(function (s) { sectionObserver.observe(s); });
  }

  /* -- Mobile nav -- */
  var hamburger = document.getElementById("navHamburger");
  var mobileNav = document.getElementById("navMobile");

  function closeMobileNav() {
    hamburger.classList.remove("open");
    mobileNav.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    mobileNav.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (hamburger && mobileNav) {
    hamburger.addEventListener("click", function () {
      var isOpen = hamburger.classList.toggle("open");
      mobileNav.classList.toggle("open", isOpen);
      hamburger.setAttribute("aria-expanded", String(isOpen));
      mobileNav.setAttribute("aria-hidden", String(!isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    });
    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMobileNav);
    });
  }

  /* -- Project card background images -- */
  document.querySelectorAll(".set-bg").forEach(function (el) {
    if (el.dataset.setbg) el.style.backgroundImage = "url(" + el.dataset.setbg + ")";
  });

  /* -- Owl Carousel (references) -- */
  if ($.fn.owlCarousel) {
    $(".refrence-slider").owlCarousel({
      loop: true,
      nav: false,
      dots: true,
      items: 1,
      autoplay: true,
      autoplayTimeout: 5000,
      autoplayHoverPause: true,
    });
  }

  /* -- Contact form -- */
  var contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var subject = encodeURIComponent(document.getElementById("subject").value.trim());
      var body    = encodeURIComponent(document.getElementById("body").value.trim());
      window.open("mailto:saazinmail@gmail.com?subject=" + subject + "&body=" + body);
    });
  }

  /* -- Copy email -- */
  var copyBtn = document.getElementById("copyEmailBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var icon = copyBtn.querySelector("i");

      function onCopied() {
        if (icon) icon.className = "fa-solid fa-check";
        copyBtn.classList.add("copied");
        setTimeout(function () {
          if (icon) icon.className = "fa-regular fa-copy";
          copyBtn.classList.remove("copied");
        }, 2000);
      }

      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = "saazinmail@gmail.com";
        ta.style.cssText = "position:fixed;opacity:0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); onCopied(); } catch (_) {}
        document.body.removeChild(ta);
      }

      if (navigator.clipboard) {
        navigator.clipboard.writeText("saazinmail@gmail.com").then(onCopied).catch(fallback);
      } else {
        fallback();
      }
    });
  }

  /* -- Page fade-in -- */
  document.body.style.opacity    = "0";
  document.body.style.transition = "opacity 0.5s ease";
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { document.body.style.opacity = "1"; });
  });
});
