"use strict";

document.addEventListener("DOMContentLoaded", function () {
  var EMAIL = "saazinmail@gmail.com";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* -- Scroll: progress bar, nav state -- */
  var progressBar = document.getElementById("scrollProgress");
  var siteNav     = document.getElementById("siteNav");

  function onScroll() {
    var scrolled   = window.scrollY;
    var pageHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar) progressBar.style.transform = "scaleX(" + (pageHeight > 0 ? scrolled / pageHeight : 0) + ")";
    if (siteNav)     siteNav.classList.toggle("scrolled", scrolled > 20);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* -- In-page links scroll without adding #section to the address -- */
  function goToSection(id) {
    var target = document.getElementById(id);
    if (!target) return false;
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    return true;
  }

  document.addEventListener("click", function (e) {
    var link = e.target.closest && e.target.closest('a[href^="#"]');
    if (!link || link.getAttribute("href").length < 2) return;
    if (goToSection(link.getAttribute("href").slice(1))) e.preventDefault();
  });

  function consumeHash() {          // a /#section address: scroll there, then clean the address
    if (location.hash.length < 2) return;
    var id = decodeURIComponent(location.hash.slice(1));
    history.replaceState(null, "", location.pathname + location.search);
    goToSection(id);
  }
  window.addEventListener("hashchange", consumeHash);
  if (document.readyState === "complete") consumeHash();
  else window.addEventListener("load", consumeHash);

  /* -- Active nav highlight -- */
  var navLinks = document.querySelectorAll(".nav-links a:not(.nav-cta)");
  if ("IntersectionObserver" in window && navLinks.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });

    document.querySelectorAll("main section[id]").forEach(function (s) { sectionObserver.observe(s); });
  }

  /* -- Mobile nav -- */
  var hamburger = document.getElementById("navHamburger");
  var mobileNav = document.getElementById("navMobile");

  function setMobileNav(open) {
    hamburger.classList.toggle("open", open);
    mobileNav.hidden = !open;
    hamburger.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("nav-open", open);
  }

  if (hamburger && mobileNav) {
    hamburger.addEventListener("click", function () { setMobileNav(mobileNav.hidden); });
    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { setMobileNav(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !mobileNav.hidden) { setMobileNav(false); hamburger.focus(); }
    });
  }

  /* -- Project rail arrows -- */
  var rail = document.getElementById("projectsRail");
  function railStep(dir) {
    var card = rail.querySelector(".project-card");
    if (!card) return;
    rail.scrollBy({ left: dir * (card.offsetWidth + 32), behavior: reduceMotion ? "auto" : "smooth" });
  }
  if (rail) {
    document.getElementById("railPrev").addEventListener("click", function () { railStep(-1); });
    document.getElementById("railNext").addEventListener("click", function () { railStep(1); });
  }

  /* -- Hero: scattered data that sorts itself into a branching timeline tree --
     Raw dots drift, then pull together around a central device, the Loom. Branches grow up from it
     and a smaller root system grows down, so one point holds the whole tree.
     "Shuffle the multiverse" scatters everything and regrows the tree as a different universe:
     new shape, new colour, new label. Hover a dot to find small nods to the Marvel films and shows.
     Reduced motion shows one finished tree. */
  var canvas = document.getElementById("dataCanvas");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var w = 0, h = 0, dots = [], running = false, raf = 0;
    var mix = 0, mixTarget = 0, fitTimer = 0;
    var pointer = { x: -999, y: -999 };
    var tipEl = document.getElementById("heroTip"), tipDot = null, lastTip = "";
    var labelEl = document.getElementById("universeLabel");
    var MUTED = [128, 160, 140], MUTED_RGB = "rgb(128,160,140)", GOLD = [226, 177, 60], HOT = [53, 201, 123];
    var loomScale = function () { return innerWidth < 680 ? 0.42 : 0.55; };
    var node = { x: 0, y: 0 }, loomDot = { depth: 0, loom: true };

    /* each universe regrows the tree with its own shape and colour */
    var UNIVERSES = [
      { name: "Earth-199999", hot: [53, 201, 123],  spread: [0.30, 0.60], three: 0.22, ratio: [0.72, 0.82], rootX: 0.70, lean: 0.06,  depth: 0 },
      { name: "Earth-838",    hot: [255, 140, 48],  spread: [0.40, 0.85], three: 0.30, ratio: [0.66, 0.78], rootX: 0.64, lean: 0.22,  depth: 0 },
      { name: "Earth-616",    hot: [236, 70, 70],   spread: [0.25, 0.50], three: 0.15, ratio: [0.76, 0.86], rootX: 0.74, lean: 0.10,  depth: -1 },
      { name: "Earth-1610",   hot: [70, 150, 255],  spread: [0.50, 0.95], three: 0.35, ratio: [0.62, 0.74], rootX: 0.68, lean: -0.18, depth: 0 },
      { name: "Earth-65",     hot: [240, 110, 200], spread: [0.35, 0.70], three: 0.25, ratio: [0.70, 0.80], rootX: 0.72, lean: 0.00,  depth: 0 },
      { name: "Earth-8096",   hot: [120, 220, 240], spread: [0.20, 0.45], three: 0.10, ratio: [0.78, 0.88], rootX: 0.66, lean: -0.08, depth: -1 }
    ];
    var uIndex = 0;

    /* small nods to the films and shows, shown when you hover a dot on the finished tree */
    var TIPS_LOOM = ["The Temporal Loom", "Loki holds it all together", "Glorious burden", "I am Loki, and I am burdened with glorious purpose", "The scepter gem, repurposed", "Pruning is not an option", "Time keeps slipping", "Variants not welcome", "Gold, green and a very long tree", "Kneel? Maybe later", "Does this count as a Sacred Timeline?", "TVA approved, loosely"];
    var TIPS_TRUNK = ["The Sacred Timeline", "One timeline. Keep it alive.", "Home universe", "Do not prune"];
    var TIPS_GOLD = ["Variant detected", "Nexus event", "Glorious purpose", "Another Kang, another branch", "Incursion in 3, 2, 1", "A new variant joins the TVA"];
    var TIPS_BRANCH = [
      "Branch pruned? Not today.", "Time is slipping", "For all time. Always.",
      "Avengers, assemble", "I can do this all day", "I am Iron Man", "I am Groot", "Wakanda forever",
      "Whatever it takes", "Dormammu, I've come to bargain", "Hail Hydra", "Snap!",
      "Shawarma after this", "Vibranium trace detected", "Mjolnir: worthy", "Tesseract nearby",
      "Spider-sense tingling", "With great power...", "No way home", "Quantum realm entry",
      "Pym particles detected", "Darkhold page missing", "Kamar-Taj is open", "Sanctum ring sparks",
      "Agatha all along", "Good luck, Kamala", "Ronin was here", "The shield was passed on",
      "Fourth wall: broken", "Moon Knight says hi", "What if...?", "Skrull or not?",
      "Coulson lives", "Peggy Carter approved", "Ten Rings, no relation", "Eternals are watching",
      "Guardians of the Galaxy checking in", "Ant-Man is very small here", "Thanos was right? No.",
      "Earth-616 says hi", "Earth-838 was here", "Another universe, same you", "Multiverse of Madness"
    ];
    function tipFor(d) {
      var list = d.loom ? TIPS_LOOM : d.depth <= 1 ? TIPS_TRUNK : d.gold ? TIPS_GOLD : TIPS_BRANCH, t, tries = 0;
      do { t = list[(Math.random() * list.length) | 0]; } while (t === lastTip && tries++ < 5);
      lastTip = t;
      return t;
    }

    function rand(a, b) { return a + Math.random() * (b - a); }

    function growTree() {
      var u = UNIVERSES[uIndex], small = w < 680;
      var segs = [], maxDepth = (small ? 6 : 7) + u.depth;
      var rootX = w * (small ? Math.min(0.62, u.rootX) : u.rootX), rootY = h * (small ? 0.62 : 0.6);
      node.x = rootX; node.y = rootY;
      function branch(x, y, ang, len, depth) {
        var ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
        if (ex < -20 || ex > w + 20 || ey < -20 || ey > h + 20) return;
        segs.push({ x: x, y: y, ex: ex, ey: ey, ang: ang, len: len, depth: depth });
        if (depth >= maxDepth) return;
        var kids = Math.random() < u.three ? 3 : 2;
        for (var k = 0; k < kids; k++) {
          var spreadA = kids === 3 ? (k - 1) * 0.55 : (k === 0 ? -1 : 1) * rand(u.spread[0], u.spread[1]);
          branch(ex, ey, ang + spreadA + rand(-0.1, 0.1), len * rand(u.ratio[0], u.ratio[1]), depth + 1);
        }
      }
      /* branches pour into the Loom from above and spread out below it, so the tree meets the device
         from both directions instead of running through it as one straight line */
      var hh = h * (small ? 0.085 : 0.108), fan = 0.4 + (u.spread[1] - 0.6) * 0.25;
      [-fan, 0, fan].forEach(function (off, i) {
        var up = -Math.PI / 2 + u.lean + off + rand(-0.05, 0.05);
        branch(rootX + Math.cos(up) * 26 * loomScale(), rootY + Math.sin(up) * 26 * loomScale(), up, hh * (i === 1 ? 1.15 : 1), i === 1 ? 0 : 2);
        var down = Math.PI / 2 - u.lean * 0.6 + off + rand(-0.05, 0.05);
        branch(rootX + Math.cos(down) * 26 * loomScale(), rootY + Math.sin(down) * 26 * loomScale(), down, hh * (i === 1 ? 0.75 : 0.65), 2);
      });

      var total = 0;
      segs.forEach(function (s) { total += s.len; });
      var budget = small ? 600 : 1400;
      var step = Math.max(6, total / budget);
      var targets = [];
      segs.forEach(function (s) {
        var n = Math.max(1, Math.round(s.len / step));
        var thick = s.depth === 0 ? 3 : s.depth === 1 ? 2 : 1;
        var nx = -Math.sin(s.ang), ny = Math.cos(s.ang);
        for (var i = 0; i < n; i++) {
          var t = i / n, px = s.x + (s.ex - s.x) * t, py = s.y + (s.ey - s.y) * t;
          for (var q = 0; q < thick; q++) {
            var off = (q - (thick - 1) / 2) * 5 + rand(-1.2, 1.2);
            targets.push({ x: px + nx * off, y: py + ny * off, depth: s.depth, tip: s.depth === maxDepth && i === n - 1 });
          }
        }
      });
      return targets;
    }

    function sample() {
      HOT = UNIVERSES[uIndex].hot;
      if (labelEl) labelEl.textContent = "Now viewing: " + UNIVERSES[uIndex].name;
      var targets = growTree();
      var loose = w < 680 ? 50 : 110;
      var n = targets.length + loose;
      for (var i = 0; i < n; i++) {
        var d = dots[i] || (dots[i] = {
          x: Math.random() * w, y: Math.random() * h,
          vx: rand(-0.35, 0.35), vy: rand(-0.35, 0.35), ph: Math.random() * 6.28, ox: 0, oy: 0
        });
        var t = targets[i];
        if (t) {
          d.free = false; d.hx = t.x; d.hy = t.y; d.depth = t.depth;
          d.hot = t.depth <= 2; d.gold = !!t.tip && Math.random() < 0.55;
          d.r = t.depth <= 2 ? 2.2 : (w < 680 ? 1.5 : 1.9);
        } else {
          d.free = true; d.hx = d.x; d.hy = d.y; d.depth = 0; d.hot = false; d.gold = false; d.r = 1.5;
        }
      }
      dots.length = n;
    }

    function build() {
      var rect = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sample();
    }

    function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

    function frame(now) {
      mix += (mixTarget - mix) * 0.035;
      if (Math.abs(mixTarget - mix) < 0.001) mix = mixTarget;
      var e = ease(mix), reach = 110;
      ctx.clearRect(0, 0, w, h);
      var hit = null, hitDist = 16, hitX = 0, hitY = 0;

      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > w) d.vx *= -1;
        if (d.y < 0 || d.y > h) d.vy *= -1;

        var tx = d.hx, ty = d.hy;
        if (!d.free) {  /* sway grows toward the branch tips */
          var amp = 0.3 + d.depth * 0.55;
          tx += Math.sin(now / 1700 + d.depth * 0.5 + d.ph * 0.15) * amp;
          ty += Math.cos(now / 2100 + d.ph * 0.2) * amp * 0.5;
        }
        var fe = d.free ? 0 : e;
        var x = d.x + (tx - d.x) * fe, y = d.y + (ty - d.y) * fe;

        var dx = x - pointer.x, dy = y - pointer.y, dist = Math.sqrt(dx * dx + dy * dy);
        if (!d.free && e > 0.9 && dist < hitDist) { hit = d; hitDist = dist; hitX = x; hitY = y; }
        if (dist < reach && dist > 0) {
          var push = (1 - dist / reach) * 22;
          d.ox += (dx / dist * push - d.ox) * 0.2; d.oy += (dy / dist * push - d.oy) * 0.2;
        } else { d.ox *= 0.88; d.oy *= 0.88; }

        var k = (d.hot || d.gold) ? e : 0, to = d.gold ? GOLD : HOT;
        ctx.fillStyle = k === 0 ? MUTED_RGB : "rgb(" + Math.round(MUTED[0] + (to[0] - MUTED[0]) * k) + "," +
                                 Math.round(MUTED[1] + (to[1] - MUTED[1]) * k) + "," +
                                 Math.round(MUTED[2] + (to[2] - MUTED[2]) * k) + ")";
        var shimmer = (d.hot || d.gold) && !d.free ? 0.15 * Math.sin(now / 400 + d.ph) : 0;
        ctx.globalAlpha = Math.max(0.1, Math.min(1, 0.32 + 0.5 * ((d.hot || d.gold) ? 1 : e) + shimmer));
        ctx.beginPath();
        ctx.arc(x + d.ox, y + d.oy, d.r, 0, 6.2832);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      /* the Loom: a glowing core inside a hexagonal frame, two counter-turning rings,
         orbiting sparks and an hourglass, drawn at S times its base size */
      var ee = Math.min(1, e * 1.6);
      if (ee > 0.02) {
        var S = loomScale(), gold = "rgb(226,177,60)", g;
        ctx.save();
        ctx.translate(node.x, node.y);
        ctx.scale(S, S);
        ctx.globalAlpha = ee;
        g = ctx.createRadialGradient(0, 0, 4, 0, 0, 60);
        g.addColorStop(0, "rgba(226,177,60,0.30)"); g.addColorStop(0.5, "rgba(53,201,123,0.10)"); g.addColorStop(1, "rgba(53,201,123,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 60, 0, 6.2832); ctx.fill();

        ctx.strokeStyle = gold; ctx.lineJoin = "round";
        ctx.lineWidth = 1.2 / S * 1.6; ctx.globalAlpha = ee * 0.9;
        ctx.setLineDash([2, 5]);
        ctx.save(); ctx.rotate(now / 9000);
        ctx.beginPath(); ctx.arc(0, 0, 40, 0, 6.2832); ctx.stroke();
        ctx.restore();
        ctx.setLineDash([10, 6]);
        ctx.save(); ctx.rotate(-now / 6000);
        ctx.beginPath(); ctx.arc(0, 0, 33, 0, 6.2832); ctx.stroke();
        ctx.restore();
        ctx.setLineDash([]);

        /* hexagon frame with a bracket at every corner */
        ctx.globalAlpha = ee; ctx.lineWidth = 1.8 / S * 1.6;
        ctx.fillStyle = "#07120c";
        ctx.beginPath();
        for (var k = 0; k < 6; k++) { var ak = k * 1.0472 - 1.5708; ctx.lineTo(Math.cos(ak) * 25, Math.sin(ak) * 25); }
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = gold;
        for (k = 0; k < 6; k++) { ak = k * 1.0472 - 1.5708; ctx.beginPath(); ctx.arc(Math.cos(ak) * 25, Math.sin(ak) * 25, 1.8, 0, 6.2832); ctx.fill(); }

        /* sparks orbiting the frame */
        for (k = 0; k < 3; k++) {
          ak = now / 2400 + k * 2.0944;
          ctx.fillStyle = k ? "rgb(91,227,154)" : gold;
          ctx.beginPath(); ctx.arc(Math.cos(ak) * 40, Math.sin(ak) * 40, 2.2, 0, 6.2832); ctx.fill();
        }

        /* Loki hint: a green gem held in gold prongs, like the tip of his scepter */
        var pulse = 0.75 + 0.25 * Math.sin(now / 700);
        ctx.strokeStyle = "rgba(226,177,60,0.55)"; ctx.lineWidth = 1 / S * 1.6;
        ctx.beginPath(); ctx.arc(0, 0, 16 + 1.2 * Math.sin(now / 800), 0, 6.2832); ctx.stroke();
        g = ctx.createRadialGradient(0, 0, 1, 0, 0, 16);
        g.addColorStop(0, "rgba(91,227,154," + (0.55 * pulse) + ")"); g.addColorStop(1, "rgba(91,227,154,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 16, 0, 6.2832); ctx.fill();
        ctx.strokeStyle = gold; ctx.lineWidth = 2 / S * 1.6; ctx.lineCap = "round";
        [-1, 1].forEach(function (sd) {
          ctx.beginPath(); ctx.moveTo(sd * 3, 13); ctx.quadraticCurveTo(sd * 13, 8, sd * 11, -10); ctx.stroke();
        });
        ctx.fillStyle = "rgb(91,227,154)"; ctx.strokeStyle = gold; ctx.lineWidth = 1.4 / S * 1.6;
        ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(6.5, 0); ctx.lineTo(0, 10); ctx.lineTo(-6.5, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "rgba(239,232,210,0.8)";
        ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(2.2, -1); ctx.lineTo(0, 1); ctx.lineTo(-2.2, -1); ctx.closePath(); ctx.fill();
        ctx.restore(); ctx.globalAlpha = 1;
        if (e > 0.9 && Math.hypot(pointer.x - node.x, pointer.y - node.y) < Math.max(26, 30 * loomScale())) { hit = loomDot; hitX = node.x; hitY = node.y; }
      }

      if (tipEl) {
        if (hit) {
          if (tipDot !== hit) { tipDot = hit; tipEl.textContent = tipFor(hit); }
          tipEl.style.transform = "translate(" + Math.round(hitX + 14) + "px," + Math.round(hitY - 34) + "px)";
          tipEl.classList.add("show");
        } else { tipDot = null; tipEl.classList.remove("show"); }
      }
      if (running) raf = requestAnimationFrame(frame);
    }

    function fitSoon(delay) { clearTimeout(fitTimer); fitTimer = setTimeout(function () { mixTarget = 1; }, delay); }
    function start() { if (!running) { running = true; raf = requestAnimationFrame(frame); } }
    function stop()  { running = false; cancelAnimationFrame(raf); }

    build();
    if (reduceMotion) {
      mix = mixTarget = 1; frame(0);
      window.addEventListener("resize", function () { build(); mix = mixTarget = 1; frame(0); });
    } else {
      fitSoon(1400);
      new IntersectionObserver(function (entries) { entries[0].isIntersecting ? start() : stop(); }).observe(canvas);

      var resizeTimer;
      window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () { var m = mixTarget; build(); mix = mixTarget = m; }, 200);
      });

      var heroEl = canvas.parentElement;
      heroEl.addEventListener("pointermove", function (e) {
        var rect = canvas.getBoundingClientRect();
        pointer.x = e.clientX - rect.left; pointer.y = e.clientY - rect.top;
      });
      heroEl.addEventListener("pointerleave", function () { pointer.x = pointer.y = -999; });

      var shuffle = document.getElementById("reshuffle");
      if (shuffle) shuffle.addEventListener("click", function () {
        mixTarget = 0;
        dots.forEach(function (d) { d.vx = rand(-1.5, 1.5); d.vy = rand(-1.5, 1.5); });
        var next; do { next = (Math.random() * UNIVERSES.length) | 0; } while (next === uIndex);
        uIndex = next;  /* a different universe: new shape, colour and label */
        sample();
        fitSoon(1600);
      });
    }
  }

  /* -- Contact form: posts to the home-server endpoint, falls back to a mailto link on failure -- */
  var contactForm = document.getElementById("contactForm");
  var ENDPOINT = "https://contact.saazneupane.com.np/send";
  if (contactForm) {
    var status = document.getElementById("formStatus");
    var sendBtn = document.getElementById("sendBtn");

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = contactForm.elements;
      var payload = { name: f.name.value, email: f.email.value, subject: f.subject.value, message: f.body.value, website: f.website.value };
      if (!f.email.value || !f.subject.value.trim() || !f.body.value.trim() || !f.email.checkValidity()) {
        status.textContent = "Please fill in a valid email, subject and message.";
        return;
      }
      sendBtn.disabled = true;
      status.textContent = "Sending...";
      fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error(res.d.error || "failed");
          status.textContent = "Sent. Thanks, I'll reply soon.";
          contactForm.reset();
        })
        .catch(function (err) {
          status.textContent = (err.message && err.message !== "Failed to fetch" ? err.message : "Could not send right now.") + " You can email " + EMAIL + " directly.";
        })
        .then(function () { sendBtn.disabled = false; });
    });
  }

  /* -- Scroll reveal -- */
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); revealIO.unobserve(en.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll(".sys-row, .edu-list > li, .refs-grid figure, .skill-row").forEach(function (el) {
      el.classList.add("reveal"); revealIO.observe(el);
    });
  }

  /* -- Copy email -- */
  var copyBtn = document.getElementById("copyEmailBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var icon = copyBtn.querySelector("i");
      var flash = function (cls) {
        if (icon) icon.className = cls;
        setTimeout(function () { if (icon) icon.className = "fa-regular fa-copy"; }, 2000);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(EMAIL).then(
        function () { flash("fa-solid fa-check"); },
        function () { flash("fa-solid fa-xmark"); window.prompt("Copy this email address:", EMAIL); }
      );
    });
  }
});
