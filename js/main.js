/**
 * main.js
 * hamburger / theme toggle / swatch copy / download toast
 */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* hamburger menu */
  var menuBtn = document.getElementById("menuToggle");
  var menuList = document.getElementById("navMenu");

  if (menuBtn && menuList) {
    menuBtn.addEventListener("click", function () {
      var open = menuBtn.getAttribute("aria-expanded") === "true";
      toggle(!open);
    });
    menuList.addEventListener("click", function (e) {
      if (e.target.tagName === "A" && menuList.classList.contains("open")) toggle(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menuList.classList.contains("open")) { toggle(false); menuBtn.focus(); }
    });
    matchMedia("(min-width: 48rem)").addEventListener("change", function (e) {
      if (e.matches) toggle(false);
    });
  }

  function toggle(open) {
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
    menuList.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open);
  }

  /* scroll reveal */
  var reveals = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = Number(el.getAttribute("data-delay")) || 0;
          if (delay) el.style.transitionDelay = delay + "ms";
          el.classList.add("in");
          io.unobserve(el);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -5% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* theme toggle */
  var themeBtn = document.getElementById("themeToggle");

  if (themeBtn) {
    var saved = null;
    try { saved = localStorage.getItem("wm-theme"); } catch (_) {}
    if (saved === "light" || saved === "dark") {
      document.documentElement.setAttribute("data-theme", saved);
    }
    themeBtn.addEventListener("click", function () {
      var dark = document.documentElement.getAttribute("data-theme") === "dark" ||
        (!document.documentElement.hasAttribute("data-theme") &&
          matchMedia("(prefers-color-scheme: dark)").matches);
      var next = dark ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("wm-theme", next); } catch (_) {}
    });
  }

  /* swatch copy */
  var swatches = document.querySelectorAll(".swatch");
  var copyStatus = document.getElementById("copyStatus");
  var copiedTimer = null;

  function copyHex(swatch) {
    var hex = swatch.getAttribute("data-color").toUpperCase();
    function done() {
      swatch.classList.add("copied");
      if (copyStatus) { copyStatus.textContent = "已复制 " + hex; copyStatus.setAttribute("aria-hidden", "false"); }
      clearTimeout(copiedTimer);
      copiedTimer = setTimeout(function () {
        swatch.classList.remove("copied");
        if (copyStatus) copyStatus.setAttribute("aria-hidden", "true");
      }, 1600);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(hex).then(done, done);
    } else {
      var ta = document.createElement("textarea");
      ta.value = hex; ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (_) {}
      document.body.removeChild(ta); done();
    }
  }

  swatches.forEach(function (sw) {
    sw.addEventListener("click", function () { copyHex(sw); });
    sw.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); copyHex(sw); }
    });
  });

  /* download toast */
  var toast = document.getElementById("toast");
  var toastTimer = null;
  var toastShownAt = 0;
  var TOAST_MIN = 1500;
  var TOAST_MAX = 5000;

  function hideToast() {
    if (!toast) return;
    var elapsed = Date.now() - toastShownAt;
    if (elapsed < TOAST_MIN) {
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () {
        toast.classList.remove("show");
      }, TOAST_MIN - elapsed);
    } else {
      clearTimeout(toastTimer);
      toast.classList.remove("show");
    }
  }

  document.querySelectorAll("[data-download]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (!toast) return;
      clearTimeout(toastTimer);
      toastShownAt = Date.now();
      toast.classList.add("show");
      toastTimer = setTimeout(hideToast, TOAST_MAX);
    });
  });

  if (toast) {
    toast.addEventListener("click", hideToast);
  }

})();
