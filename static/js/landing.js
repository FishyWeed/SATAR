/* SATAR landing: parallax forest, light rays, motes, scroll-linked reveals */
(function () {
  "use strict";
  var S = window.SATAR;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var vh = window.innerHeight;
  window.addEventListener("resize", function () { vh = window.innerHeight; sizeMotes(); });

  /* reading progress line */
  var pl = document.createElement("div"); pl.className = "progress-line"; pl.setAttribute("aria-hidden", "true"); document.body.appendChild(pl);

  var header = document.querySelector(".s-pubheader");
  var win = document.getElementById("window"), frame = win && win.querySelector(".window__frame"), glint = win && win.querySelector(".window__glint");
  var flow = document.getElementById("flow"), steps = flow ? flow.querySelectorAll(".flow-step") : [];
  var final = document.querySelector(".final");
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function onFrame(y) {
    var max = document.documentElement.scrollHeight - vh;
    pl.style.setProperty("--sp", (y / Math.max(1, max)).toFixed(4));
    header.classList.toggle("is-scrolled", y > 24);
    if (frame) {
      var r = win.getBoundingClientRect();
      var p = clamp((vh - r.top) / (vh * 0.85), 0, 1);
      frame.style.setProperty("--tilt", ((1 - p) * 24).toFixed(2) + "deg");
      frame.style.setProperty("--zoom", (0.9 + p * 0.1).toFixed(4));
      glint.style.setProperty("--glint", (120 - p * 140).toFixed(1) + "%");
    }
    if (flow) {
      var fr = flow.getBoundingClientRect();
      var fp = clamp((vh * 0.7 - fr.top) / (fr.height * 0.75), 0, 1);
      flow.style.setProperty("--fp", fp.toFixed(4));
      for (var i = 0; i < steps.length; i++) steps[i].classList.toggle("is-lit", fp >= i / (steps.length - 1 || 1) - 0.02 || (i === 0 && fp > 0.01));
    }
    if (final) {
      var qr = final.getBoundingClientRect();
      final.style.setProperty("--p", clamp((vh - qr.top) / (vh * 1.1), 0, 1).toFixed(4));
    }
  }

  if (reduce) {
    window.addEventListener("scroll", function () { onFrame(window.scrollY); }, { passive: true });
    onFrame(window.scrollY);
    if (flow) { flow.style.setProperty("--fp", 1); steps.forEach(function (s) { s.classList.add("is-lit"); }); }
  } else {
    S.parallax({ ease: 0.1, onFrame: onFrame });
  }

  /* lantern: soft light follows the pointer over the hero */
  var hero = document.querySelector(".hero"), lantern = document.querySelector(".lantern");
  if (hero && lantern && !reduce) hero.addEventListener("pointermove", function (e) {
    var r = hero.getBoundingClientRect();
    lantern.style.setProperty("--mx", (e.clientX - r.left) + "px");
    lantern.style.setProperty("--my", (e.clientY - r.top) + "px");
  });

  /* feature cards: border light follows the pointer */
  document.querySelectorAll(".problem-card").forEach(function (c) {
    c.addEventListener("pointermove", function (e) { var r = c.getBoundingClientRect(); c.style.setProperty("--mx", (e.clientX - r.left) + "px"); c.style.setProperty("--my", (e.clientY - r.top) + "px"); });
  });
  document.querySelectorAll(".s-glowcard").forEach(function (c) {
    c.addEventListener("pointermove", function (e) { var r = c.getBoundingClientRect(); c.style.setProperty("--mx", (e.clientX - r.left) + "px"); c.style.setProperty("--my", (e.clientY - r.top) + "px"); });
    c.addEventListener("pointerleave", function () { c.style.setProperty("--mx", "-300px"); c.style.setProperty("--my", "-300px"); });
  });

  /* motes: dust drifting in the light rays */
  var cv = document.querySelector(".motes"), ctx = cv && cv.getContext("2d"), motes = [], running = true, dpr = Math.min(window.devicePixelRatio || 1, 2);
  function sizeMotes() {
    if (!cv) return;
    var w = cv.clientWidth, h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr;
    var n = Math.round(Math.min(110, w * h / 14000));
    motes = [];
    for (var i = 0; i < n; i++) motes.push(newMote(w, h, true));
  }
  function newMote(w, h, any) {
    // denser near the centre beam
    var cx = w / 2 + (Math.random() - 0.5) * w * (Math.random() < 0.6 ? 0.45 : 1);
    return { x: cx, y: any ? Math.random() * h : h + 10, r: Math.random() * 1.6 + 0.4, vy: -(Math.random() * 0.25 + 0.06), vx: (Math.random() - 0.5) * 0.12, a: Math.random() * 0.6 + 0.2, t: Math.random() * 6.28, warm: Math.random() < 0.35 };
  }
  function drawMotes() {
    if (!running) return;
    var w = cv.clientWidth, h = cv.clientHeight;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < motes.length; i++) {
      var m = motes[i];
      m.t += 0.012; m.x += m.vx + Math.sin(m.t) * 0.15; m.y += m.vy;
      if (m.y < -10 || m.x < -10 || m.x > w + 10) motes[i] = m = newMote(w, h, false);
      var beam = 1 - Math.min(1, Math.abs(m.x - w / 2) / (w * 0.35));
      var alpha = m.a * (0.35 + beam * 0.65) * (0.6 + 0.4 * Math.sin(m.t * 2));
      ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 6.283);
      ctx.fillStyle = m.warm ? "rgba(242,198,111," + alpha.toFixed(3) + ")" : "rgba(247,236,198," + alpha.toFixed(3) + ")";
      ctx.shadowColor = "rgba(247,236,198,.8)"; ctx.shadowBlur = m.r * 4;
      ctx.fill();
    }
    requestAnimationFrame(drawMotes);
  }
  if (cv && !reduce) {
    sizeMotes(); requestAnimationFrame(drawMotes);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { var was = running; running = e[0].isIntersecting; if (running && !was) requestAnimationFrame(drawMotes); }).observe(hero);
  }
})();
