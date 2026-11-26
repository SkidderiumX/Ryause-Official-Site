/* Lucian UX/UI Prompt #247 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#247 */
(function () {
  "use strict";

  var LEN = 92; // seconds of the tour

  function init(root) {
    if (root.dataset.tour247Ready === "true") return;
    root.dataset.tour247Ready = "true";

    var sc = root.querySelector(".u247-sc");
    var v = root.querySelector(".u247-v");
    var bar = root.querySelector(".u247-tr i");
    var tm = root.querySelector(".u247-tm");
    var sl = root.querySelector(".u247-sl");
    var hint = root.querySelector(".u247-hint");
    if (!sc || !v || !bar || !tm || !sl || !hint) return;

    var rm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var play = false;
    var t = 0;
    var raf = 0;
    var last = 0;

    function onScroll() {
      var p = Math.max(0, Math.min(1, sc.scrollTop / 260));
      v.style.setProperty("--p", p.toFixed(3));
      hint.style.opacity = p > 0.05 ? 0 : 1;
      setPlay(p > 0.92);
    }

    function setPlay(on) {
      if (on === play) return;
      play = on;
      root.classList.toggle("is-play", on);
      sl.textContent = on ? "Playing" : "Paused";
      if (on && !raf && !rm) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }

    function frame(now) {
      raf = 0;
      if (!play || !root.isConnected) return;
      t = (t + Math.min(0.05, (now - last) / 1000)) % LEN;
      last = now;
      bar.style.width = ((t / LEN) * 100).toFixed(2) + "%";
      tm.textContent = Math.floor(t / 60) + ":" + ("0" + Math.floor(t % 60)).slice(-2);
      raf = requestAnimationFrame(frame);
    }

    sc.addEventListener("scroll", onScroll, { passive: true });
    sl.textContent = "Paused";
    onScroll();
  }

  function initAll() {
    document.querySelectorAll(".u247").forEach(init);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }
})();
