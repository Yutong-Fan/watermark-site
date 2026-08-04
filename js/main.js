/* 交互：滚动显现、色卡复制。无装饰动效 */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 滚动显现 */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var delay = Number(el.getAttribute("data-delay")) || 0;
            if (delay) el.style.transitionDelay = delay + "ms";
            el.classList.add("in");
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in");
    });
  }

  /* 深浅色切换，记忆选择，默认跟随系统 */
  var themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    var savedTheme = null;
    try {
      savedTheme = localStorage.getItem("wm-theme");
    } catch (e) {
      /* 隐私模式忽略 */
    }
    if (savedTheme === "light" || savedTheme === "dark") {
      document.documentElement.setAttribute("data-theme", savedTheme);
    }

    function isDarkNow() {
      return (
        document.documentElement.getAttribute("data-theme") === "dark" ||
        (!document.documentElement.hasAttribute("data-theme") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    }

    themeToggle.addEventListener("click", function () {
      var next = isDarkNow() ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem("wm-theme", next);
      } catch (e) {
        /* 隐私模式忽略 */
      }
    });
  }

  /* 色卡复制 */
  var swatches = document.querySelectorAll(".swatch");
  var status = document.getElementById("copyStatus");
  if (swatches.length) {
    var copiedTimer = null;

    function copy(swatch) {
      var hex = swatch.getAttribute("data-color").toUpperCase();
      var done = function () {
        swatch.classList.add("copied");
        if (status) {
          status.textContent = "已复制 " + hex;
          status.setAttribute("aria-hidden", "false");
        }
        clearTimeout(copiedTimer);
        copiedTimer = setTimeout(function () {
          swatch.classList.remove("copied");
          if (status) status.setAttribute("aria-hidden", "true");
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(hex).then(done, done);
      } else {
        var ta = document.createElement("textarea");
        ta.value = hex;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand("copy");
        } catch (e) {
          /* 忽略复制失败 */
        }
        document.body.removeChild(ta);
        done();
      }
    }

    swatches.forEach(function (sw) {
      sw.addEventListener("click", function () {
        copy(sw);
      });
      sw.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          copy(sw);
        }
      });
    });
  }
})();
