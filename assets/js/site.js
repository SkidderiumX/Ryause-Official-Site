/* Ryause Official Site — progressive enhancement, no dependencies. */
(function () {
  "use strict";

  var PROFILES_REPO = "SkidderiumX/Ryause-Official-Profiles";
  var BRANCH = "main";
  var RAW_BASE = "https://raw.githubusercontent.com/" + PROFILES_REPO + "/" + BRANCH + "/";
  var CDN_BASE = "https://cdn.jsdelivr.net/gh/" + PROFILES_REPO + "@" + BRANCH + "/";

  var grid = document.getElementById("profile-grid");
  var meta = document.getElementById("profiles-meta");
  var refresh = document.getElementById("profiles-refresh");
  var toast = document.getElementById("toast");
  var toastTimer = 0;
  var loading = false;

  /* ----------------------------------------------------------------------
     Helpers
     ---------------------------------------------------------------------- */

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("show");
    }, 1800);
  }

  function formatDate(value) {
    if (!value) return "";
    var parts = String(value).split("-");
    if (parts.length !== 3) return value;
    var date = new Date(Date.UTC(+parts[0], +parts[1] - 1, +parts[2]));
    if (isNaN(date.getTime())) return value;
    try {
      return date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      });
    } catch (e) {
      return value;
    }
  }

  function shortHash(value) {
    var hash = String(value || "").trim();
    if (!hash) return "";
    return hash.slice(0, 7) + "…" + hash.slice(-4);
  }

  function skeletons() {
    if (!grid) return;
    grid.setAttribute("aria-busy", "true");
    grid.innerHTML =
      '<article class="card profile skeleton"></article>' +
      '<article class="card profile skeleton"></article>' +
      '<article class="card profile skeleton"></article>';
  }

  /* ----------------------------------------------------------------------
     Profiles
     ---------------------------------------------------------------------- */

  function request(url) {
    return fetch(url, { cache: "no-store", mode: "cors" }).then(function (response) {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    });
  }

  function fetchIndex() {
    return request(RAW_BASE + "index.json?t=" + Date.now()).catch(function () {
      // jsDelivr mirrors the repository and works when raw is blocked.
      return request(CDN_BASE + "index.json");
    });
  }

  function profileCard(profile) {
    var file = String(profile.file || "").trim();
    var title = String(profile.title || file || "Profile");
    var author = String(profile.author || "").trim();
    var description = String(profile.description || "").trim();
    var mc = String(profile.mc || "").trim();
    var hash = String(profile.sha1 || "").trim();
    var href = RAW_BASE + "profiles/" + encodeURIComponent(file) + ".json";

    return (
      '<article class="card profile">' +
      '<div class="profile-top">' +
      "<div>" +
      "<h3>" + escapeHtml(title) + "</h3>" +
      (author ? '<p class="profile-author">by ' + escapeHtml(author) + "</p>" : "") +
      "</div>" +
      (mc ? '<span class="pill pill-blue">' + escapeHtml(mc) + "</span>" : "") +
      "</div>" +
      '<p class="profile-desc">' + escapeHtml(description) + "</p>" +
      '<div class="profile-foot">' +
      '<span class="hash" title="' + escapeHtml(hash) + '"><strong>SHA-1</strong> ' + escapeHtml(shortHash(hash)) + "</span>" +
      '<a class="btn btn-secondary btn-sm" href="' + escapeHtml(href) + '" target="_blank" rel="noopener">' +
      "Download" +
      '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v8m0 0 3-3M8 10 5 7M3 13h10"/></svg>' +
      "</a>" +
      "</div>" +
      "</article>"
    );
  }

  function renderProfiles(index) {
    if (!grid) return;

    var profiles = Array.isArray(index && index.profiles) ? index.profiles : [];
    var valid = profiles.filter(function (profile) {
      return profile && String(profile.file || "").trim();
    });

    if (!valid.length) {
      throw new Error("The index does not list any profiles.");
    }

    grid.innerHTML = valid.map(profileCard).join("");
    grid.setAttribute("aria-busy", "false");

    if (meta) {
      var bits = [valid.length + (valid.length === 1 ? " profile" : " profiles")];
      if (index.updated) bits.push("updated " + formatDate(index.updated));
      bits.push("SHA-1 verified on install");

      meta.innerHTML =
        escapeHtml(bits.join(" · ")) +
        ' · <a href="https://github.com/' + PROFILES_REPO + '" target="_blank" rel="noopener">' +
        escapeHtml(PROFILES_REPO) +
        "</a>";
    }
  }

  function renderError(reason) {
    if (!grid) return;
    grid.setAttribute("aria-busy", "false");
    grid.innerHTML =
      '<div class="profile-error">' +
      "<strong>Could not load the official index.</strong>" +
      escapeHtml(reason || "Network error") +
      ". Check your connection and try again, or open the repository directly." +
      "</div>";

    if (meta) {
      meta.innerHTML =
        'The in-game browser retries on its own. You can also point the client at the repository with ' +
        "<code>profiles online repo " + escapeHtml(PROFILES_REPO) + "</code>.";
    }
  }

  var lastLoaded = 0;

  function loadProfiles(force) {
    if (!grid || loading) return;
    loading = true;

    if (refresh) {
      refresh.disabled = true;
      refresh.classList.add("is-loading");
    }

    if (force) {
      skeletons();
      if (meta) meta.textContent = "Refreshing the official index…";
    }

    fetchIndex()
      .then(renderProfiles)
      .catch(function (error) {
        renderError(error && error.message ? error.message : String(error));
      })
      .finally(function () {
        loading = false;
        lastLoaded = Date.now();
        if (refresh) {
          refresh.disabled = false;
          refresh.classList.remove("is-loading");
        }
      });
  }

  if (grid) {
    loadProfiles(false);

    if (refresh) {
      refresh.addEventListener("click", function () {
        loadProfiles(true);
      });
    }

    // Pick up repository changes when the visitor comes back to the tab.
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden && Date.now() - lastLoaded > 60000) {
        loadProfiles(false);
      }
    });
  }

  /* ----------------------------------------------------------------------
     Copy commands
     ---------------------------------------------------------------------- */

  function legacyCopy(text) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (e) {
      ok = false;
    }
    document.body.removeChild(area);
    return ok;
  }

  document.querySelectorAll("[data-copy]").forEach(function (button) {
    button.addEventListener("click", function () {
      var text = button.getAttribute("data-copy") || "";

      function done(ok) {
        showToast(ok ? "Copied: " + text : "Copy failed — select the command manually");
      }

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(
          function () {
            done(true);
          },
          function () {
            done(legacyCopy(text));
          }
        );
      } else {
        done(legacyCopy(text));
      }
    });
  });

  /* ----------------------------------------------------------------------
     Header, mobile navigation, scroll spy
     ---------------------------------------------------------------------- */

  var header = document.querySelector(".site-header");
  var toggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("nav");

  function closeNav() {
    if (!nav || !toggle) return;
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      if (open) {
        closeNav();
      } else {
        nav.classList.add("open");
        toggle.setAttribute("aria-expanded", "true");
        document.body.classList.add("nav-open");
      }
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    window.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 820) closeNav();
    });
  }

  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav a"));
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute("href");
      return id && id.charAt(0) === "#" ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);

    if (!sections.length) return;
    var offset = window.scrollY + 140;
    var current = null;

    sections.forEach(function (section) {
      if (section.offsetTop <= offset) current = section.id;
    });

    navLinks.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("href") === "#" + current);
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ----------------------------------------------------------------------
     Reveal on scroll
     ---------------------------------------------------------------------- */

  var revealTargets = document.querySelectorAll(
    ".feature, .command-card, .steps li, .requirements, .faq details, .stats"
  );

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduceMotion && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );

    revealTargets.forEach(function (element, index) {
      element.setAttribute("data-reveal", "");
      element.style.transitionDelay = Math.min(index % 6, 5) * 45 + "ms";
      observer.observe(element);
    });
  }

  /* ----------------------------------------------------------------------
     Footer year
     ---------------------------------------------------------------------- */

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
