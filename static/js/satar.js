/* @ds-bundle: {"format":4,"namespace":"SATAR","components":[{"name":"icon"},{"name":"hydrate"},{"name":"gallery"},{"name":"dialog"},{"name":"confirm"},{"name":"toast"},{"name":"menu"},{"name":"drawer"},{"name":"copy"},{"name":"password"},{"name":"counter"},{"name":"dismiss"},{"name":"reveal"},{"name":"parallax"},{"name":"theme"}]} */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Icons: 24px grid, 1.75 stroke, original set ---------------- */
  var P = {
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
    ban: '<circle cx="12" cy="12" r="9"/><path d="M5.7 5.7l12.6 12.6"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 20.5c1.4-3.6 4.4-5.5 8-5.5s6.6 1.9 8 5.5"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.3 3.6-5.2 6.5-5.2s5.5 1.9 6.5 5.2"/><path d="M15.5 4.6a3.5 3.5 0 0 1 0 6.8"/><path d="M18 15c2 .7 3.2 2.4 3.6 5"/>',
    shield: '<path d="M12 3l7.5 3v5.6c0 4.6-3.1 8-7.5 9.4-4.4-1.4-7.5-4.8-7.5-9.4V6z"/>',
    "shield-check": '<path d="M12 3l7.5 3v5.6c0 4.6-3.1 8-7.5 9.4-4.4-1.4-7.5-4.8-7.5-9.4V6z"/><path d="M8.8 12.2l2.2 2.2 4.4-4.6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20.5 20.5l-4.6-4.6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    "arrow-right": '<path d="M5 12h14M13 6l6 6-6 6"/>',
    "arrow-left": '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    "arrow-up-right": '<path d="M7 17L17 7M8 7h9v9"/>',
    "chevron-down": '<path d="M6 9l6 6 6-6"/>',
    "chevron-left": '<path d="M15 6l-6 6 6 6"/>',
    "chevron-right": '<path d="M9 6l6 6-6 6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
    eye: '<path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z"/><circle cx="12" cy="12" r="3"/>',
    "eye-off": '<path d="M3 3l18 18"/><path d="M10.6 5.1c.5-.1.9-.1 1.4-.1 6 0 9.5 7 9.5 7a16 16 0 0 1-3 3.8M6.6 6.6C3.9 8.4 2.5 12 2.5 12s3.5 7 9.5 7c1.8 0 3.4-.6 4.8-1.4"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.1"/>',
    "alert-triangle": '<path d="M10.3 4.1L2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 4.1a2 2 0 0 0-3.4 0z"/><path d="M12 9.5v4M12 16.8v.1"/>',
    "alert-circle": '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5M12 16v.1"/>',
    "check-circle": '<circle cx="12" cy="12" r="9"/><path d="M8.3 12.3l2.5 2.5 4.9-5.1"/>',
    "x-circle": '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
    "log-out": '<path d="M9.5 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3.5"/><path d="M16 16.5l4.5-4.5L16 7.5M20.5 12H10"/>',
    "log-in": '<path d="M14.5 4H18a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3.5"/><path d="M10 16.5l4.5-4.5L10 7.5M14.5 12H4"/>',
    printer: '<path d="M7 9V3.5h10V9"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v6.5H7z"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    building: '<path d="M4.5 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16"/><path d="M15.5 9h2a2 2 0 0 1 2 2v10M3 21h18M8.5 7.5h3M8.5 11.5h3M8.5 15.5h3"/>',
    register: '<path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="4.5" cy="6.5" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="17.5" r="1"/>',
    file: '<path d="M14 3H6.5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8.5z"/><path d="M14 3v5.5h5.5M8.5 13h7M8.5 16.5h5"/>',
    home: '<path d="M3.5 11L12 4l8.5 7v8.5a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z"/>',
    inbox: '<path d="M3.5 13.5L6.2 5h11.6l2.7 8.5v5a1.5 1.5 0 0 1-1.5 1.5h-14a1.5 1.5 0 0 1-1.5-1.5z"/><path d="M3.5 13.5H8l1.5 2.5h5l1.5-2.5h4.5"/>',
    hourglass: '<path d="M6.5 3h11M6.5 21h11M7.5 3c0 5 9 6 9 9s-9 4-9 9M16.5 3c0 5-9 6-9 9s9 4 9 9"/>',
    chart: '<path d="M4 20V11M10 20V5M16 20v-6.5M21.5 20h-19"/>',
    history: '<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.5"/><path d="M3.5 3.5v5h5M12 7.5V12l3.2 2"/>',
    tag: '<path d="M3.5 12.3V4.5a1 1 0 0 1 1-1h7.8l8.6 8.6a1.5 1.5 0 0 1 0 2.1l-6.7 6.7a1.5 1.5 0 0 1-2.1 0z"/><circle cx="8" cy="8" r="1.4"/>',
    link: '<path d="M10 14a4.2 4.2 0 0 0 6 0l3-3a4.2 4.2 0 0 0-6-6l-1 1"/><path d="M14 10a4.2 4.2 0 0 0-6 0l-3 3a4.2 4.2 0 0 0 6 6l1-1"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/>',
    lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    key: '<circle cx="8" cy="15" r="4.5"/><path d="M11.2 11.8L20 3M16.5 6.5l2.5 2.5M14 9l2 2"/>',
    filter: '<path d="M4 5h16l-6.2 7.6V19l-3.6 1.8v-8.2z"/>',
    edit: '<path d="M4 20h4.2L19.5 8.7a2.1 2.1 0 0 0 0-3L18.3 4.5a2.1 2.1 0 0 0-3 0L4 15.8z"/><path d="M13.8 6l4.2 4.2"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M5.5 7l1 12.5a2 2 0 0 0 2 1.5h7a2 2 0 0 0 2-1.5l1-12.5M9 7V4.5h6V7"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20.5 4v5h-5"/>',
    download: '<path d="M12 4v11M7 10.5l5 5 5-5M4.5 20h15"/>',
    upload: '<path d="M12 16V5M7 9.5l5-5 5 5M4.5 20h15"/>',
    image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="M20.5 15.5l-4.8-4.8-9.7 8.8"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>',
    layers: '<path d="M12 3.5l9 4.8-9 4.8-9-4.8z"/><path d="M3 12.5l9 4.8 9-4.8"/><path d="M3 16.5l9 4.8 9-4.8"/>',
    gauge: '<path d="M3.5 17a8.5 8.5 0 1 1 17 0"/><path d="M12 17l4-5.5"/><circle cx="12" cy="17" r="1.3"/>',
    sparkle: '<path d="M12 3c.6 4.6 3.4 7.4 8 8-4.6.6-7.4 3.4-8 8-.6-4.6-3.4-7.4-8-8 4.6-.6 7.4-3.4 8-8z"/>',
    grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
    more: '<circle cx="5.5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18.5" cy="12" r="1.2"/>',
    external: '<path d="M14 4.5h5.5V10M19.5 4.5L11 13"/><path d="M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>',
    eyeWatch: '<circle cx="8" cy="12" r="4.5"/><circle cx="16" cy="12" r="4.5"/><circle cx="8" cy="12" r="1.5"/><circle cx="16" cy="12" r="1.5"/>',
    database: '<ellipse cx="12" cy="6" rx="7.5" ry="3"/><path d="M4.5 6v12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3"/>',
    leak: '<path d="M12 3.5s6 6.4 6 10.5a6 6 0 0 1-12 0c0-4.1 6-10.5 6-10.5z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5"/>',
    workflow: '<rect x="3" y="4" width="6.5" height="5" rx="1.5"/><rect x="14.5" y="4" width="6.5" height="5" rx="1.5"/><rect x="8.75" y="15" width="6.5" height="5" rx="1.5"/><path d="M6.2 9v2.5a1.5 1.5 0 0 0 1.5 1.5h8.6a1.5 1.5 0 0 0 1.5-1.5V9M12 13v2"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
    power: '<path d="M12 3v8"/><path d="M6.3 6.8a8 8 0 1 0 11.4 0"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'
  };

  function icon(name, cls, label) {
    var body = P[name] || P.info;
    var a = label ? ' role="img" aria-label="' + label + '"' : ' aria-hidden="true"';
    return '<svg class="s-ic' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24"' + a + ">" + body + "</svg>";
  }

  /* Badges: SATAR.badge("approved") → HTML string with icon + label */
  var BADGE = {
    pending: ["pending", "clock", "Pending"],
    approved: ["approved", "check", "Approved"],
    rejected: ["rejected", "x", "Rejected"],
    banned: ["banned", "ban", "Banned"],
    "pending-manager": ["pm", "user", "Pending Manager"],
    "pending-reviewer": ["pr", "shield", "Pending Reviewer"],
    low: ["low", null, "Low", 1],
    medium: ["medium", null, "Medium", 2],
    high: ["high", null, "High", 3],
    public: ["public", null, "Public", 1, "pips"],
    internal: ["internal", null, "Internal", 2, "pips"],
    confidential: ["confidential", null, "Confidential", 3, "pips"],
    restricted: ["restricted", null, "Restricted", 4, "pips"],
    active: ["active", "dot", "Active"],
    inactive: ["inactive", "hollow", "Inactive"]
  };
  function badge(kind, text) {
    var b = BADGE[String(kind).toLowerCase().replace(/\s+/g, "-")];
    if (!b) return '<span class="s-badge s-badge--neutral">' + (text || kind) + "</span>";
    var glyph;
    if (b[1] === "dot") glyph = '<span class="s-dot" aria-hidden="true"></span>';
    else if (b[1] === "hollow") glyph = '<span class="s-dot s-dot--hollow" aria-hidden="true"></span>';
    else if (b[4] === "pips") glyph = '<span class="s-pips" data-level="' + b[3] + '" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';
    else if (b[3]) glyph = '<span class="s-bars3" data-level="' + b[3] + '" aria-hidden="true"><i></i><i></i><i></i></span>';
    else glyph = icon(b[1], "s-ic--xs");
    return '<span class="s-badge s-badge--' + b[0] + '">' + glyph + (text || b[2]) + "</span>";
  }

  /* Replace <i data-icon="name"> and <i data-badge="kind"> placeholders */
  function hydrate(root) {
    root = root || document;
    root.querySelectorAll("[data-icon]").forEach(function (el) {
      var t = document.createElement("span");
      t.innerHTML = icon(el.getAttribute("data-icon"), el.getAttribute("data-size") ? "s-ic--" + el.getAttribute("data-size") : "", el.getAttribute("aria-label"));
      var svg = t.firstChild;
      if (el.className) svg.setAttribute("class", svg.getAttribute("class") + " " + el.className);
      el.replaceWith(svg);
    });
    root.querySelectorAll("[data-badge]").forEach(function (el) {
      var t = document.createElement("span");
      t.innerHTML = badge(el.getAttribute("data-badge"), el.textContent.trim() || null);
      el.replaceWith(t.firstChild);
    });
    root.querySelectorAll("[data-password]").forEach(password);
    root.querySelectorAll("[data-counter]").forEach(counter);
    root.querySelectorAll("[data-copy]").forEach(copy);
    root.querySelectorAll("[data-dismiss]").forEach(dismiss);
    root.querySelectorAll("[data-menu]").forEach(menu);
    root.querySelectorAll("[data-gallery]").forEach(function (el) { if (!el._gallery) gallery(el); });
    root.querySelectorAll(".s-chart__bar[data-value]").forEach(function (b) {
      requestAnimationFrame(function () { requestAnimationFrame(function () { b.style.width = b.getAttribute("data-value"); }); });
    });
  }

  /* ---------------- Dialog (native <dialog>) ---------------- */
  function dialog(el) {
    if (typeof el === "string") el = document.querySelector(el);
    var opener = null;
    var api = {
      el: el,
      open: function () { opener = document.activeElement; if (!el.open) el.showModal(); var f = el.querySelector("[autofocus], input, select, textarea, button:not([data-close])"); if (f) f.focus(); return api; },
      close: function (value) {
        if (!el.open) return api;
        if (reduce) { el.close(value); return api; }
        el.classList.add("is-closing");
        setTimeout(function () { el.classList.remove("is-closing"); el.close(value); if (opener && opener.focus) opener.focus(); }, 150);
        return api;
      }
    };
    if (!el._wired) {
      el._wired = true;
      el.addEventListener("cancel", function (e) { e.preventDefault(); api.close("cancel"); });
      el.addEventListener("click", function (e) {
        if (e.target === el) api.close("cancel");
        var c = e.target.closest("[data-close]"); if (c) api.close(c.getAttribute("data-close") || "cancel");
      });
    }
    return api;
  }

  /* SATAR.confirm({title, body, confirm:"Ban tool", danger:true}) → Promise<boolean> */
  function confirm(opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      var d = document.createElement("dialog");
      d.className = "s-dialog s-dialog--confirm";
      d.setAttribute("aria-labelledby", "s-confirm-title");
      d.innerHTML = '<div class="s-dialog__head"><div class="s-stack" style="--_gap:12px">' + (opts.danger !== false ? '<div class="s-dialog__alert">' + icon("alert-triangle", "s-ic--md") + "</div>" : "") +
        '<h2 class="s-dialog__title" id="s-confirm-title">' + (opts.title || "Are you sure?") + "</h2></div></div>" +
        '<div class="s-dialog__body"><p>' + (opts.body || "") + "</p></div>" +
        '<div class="s-dialog__foot"><button class="s-btn s-btn--secondary" data-close="cancel">' + (opts.cancel || "Cancel") + '</button><button class="s-btn ' + (opts.danger !== false ? "s-btn--danger" : "s-btn--primary") + '" data-close="ok">' + (opts.confirm || "Confirm") + "</button></div>";
      document.body.appendChild(d);
      var api = dialog(d);
      d.addEventListener("close", function () { resolve(d.returnValue === "ok"); d.remove(); });
      api.open();
      d.querySelector('[data-close="cancel"]').focus();
    });
  }

  /* ---------------- Toast ---------------- */
  function toast(msg, kind) {
    var region = document.querySelector(".s-toasts");
    if (!region) { region = document.createElement("div"); region.className = "s-toasts"; region.setAttribute("role", "status"); region.setAttribute("aria-live", "polite"); document.body.appendChild(region); }
    var t = document.createElement("div");
    t.className = "s-toast" + (kind === "error" ? " s-toast--error" : "");
    t.innerHTML = icon(kind === "error" ? "alert-circle" : "check-circle", "s-ic--md") + '<span style="flex:1">' + msg + '</span><button class="s-btn s-btn--ghost s-btn--sm s-btn--icon" aria-label="Dismiss">' + icon("x") + "</button>";
    region.appendChild(t);
    var gone = function () { t.classList.add("is-leaving"); setTimeout(function () { t.remove(); }, 170); };
    t.querySelector("button").onclick = gone;
    setTimeout(gone, 4200);
    return t;
  }

  /* ---------------- Menu (button[data-menu] controls #id) ---------------- */
  function menu(btn) {
    if (btn._menu) return; btn._menu = true;
    var m = document.getElementById(btn.getAttribute("aria-controls"));
    if (!m) return;
    var items = function () { return Array.prototype.slice.call(m.querySelectorAll(".s-menu__item")); };
    function close(focusBtn) { m.hidden = true; btn.setAttribute("aria-expanded", "false"); document.removeEventListener("pointerdown", outside); if (focusBtn) btn.focus(); }
    function outside(e) { if (!m.contains(e.target) && !btn.contains(e.target)) close(); }
    function open() { m.hidden = false; btn.setAttribute("aria-expanded", "true"); document.addEventListener("pointerdown", outside); var i = items(); if (i[0]) i[0].focus(); }
    btn.addEventListener("click", function () { m.hidden ? open() : close(); });
    m.addEventListener("keydown", function (e) {
      var i = items(), k = i.indexOf(document.activeElement);
      if (e.key === "Escape") { e.preventDefault(); close(true); }
      else if (e.key === "ArrowDown") { e.preventDefault(); i[(k + 1) % i.length].focus(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); i[(k - 1 + i.length) % i.length].focus(); }
      else if (e.key === "Tab") close();
    });
    m.addEventListener("click", function (e) { if (e.target.closest(".s-menu__item")) close(); });
  }

  /* ---------------- Drawer (phone navigation) ---------------- */
  function drawer(el, scrim) {
    if (typeof el === "string") el = document.querySelector(el);
    scrim = scrim || document.querySelector(".s-drawer__scrim");
    var last = null;
    function onKey(e) {
      if (e.key === "Escape") api.close();
      if (e.key === "Tab") { var f = el.querySelectorAll("a, button"); if (!f.length) return; var a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
    }
    var api = {
      open: function () { last = document.activeElement; el.classList.add("is-open"); scrim && scrim.classList.add("is-open"); el.removeAttribute("inert"); document.addEventListener("keydown", onKey); setTimeout(function () { var f = el.querySelector("a, button"); f && f.focus(); }, 60); },
      close: function () { el.classList.remove("is-open"); scrim && scrim.classList.remove("is-open"); el.setAttribute("inert", ""); document.removeEventListener("keydown", onKey); last && last.focus && last.focus(); }
    };
    el.setAttribute("inert", "");
    if (scrim) scrim.onclick = api.close;
    el.querySelectorAll("[data-close], a").forEach(function (x) { x.addEventListener("click", function () { api.close(); }); });
    return api;
  }

  /* ---------------- Copy button: [data-copy="#targetId" | "text"] ---------------- */
  function copy(btn) {
    if (btn._copy) return; btn._copy = true;
    var label = btn.innerHTML;
    btn.addEventListener("click", function () {
      var src = btn.getAttribute("data-copy");
      var el = src && src.charAt(0) === "#" ? document.querySelector(src) : null;
      var text = el ? (el.value || el.textContent) : src;
      var done = function () {
        btn.setAttribute("data-copied", "true");
        btn.innerHTML = icon("check") + "Copied";
        var live = btn.parentNode.querySelector(".s-sr[aria-live]"); if (live) live.textContent = "Link copied";
        setTimeout(function () { btn.removeAttribute("data-copied"); btn.innerHTML = label; }, 2200);
      };
      var fail = function () {
        if (el && window.getSelection) { var r = document.createRange(); r.selectNodeContents(el); var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r); }
        btn.innerHTML = icon("copy") + "Press Ctrl+C";
        setTimeout(function () { btn.innerHTML = label; }, 2600);
      };
      try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text.trim()).then(done, fail); else fail(); } catch (e) { fail(); }
    });
  }

  /* ---------------- Password show/hide: wrapper [data-password] ---------------- */
  function password(wrap) {
    if (wrap._pw) return; wrap._pw = true;
    var input = wrap.querySelector("input"), btn = wrap.querySelector(".s-input-btn");
    if (!input || !btn) return;
    btn.innerHTML = icon("eye"); btn.setAttribute("aria-label", "Show password"); btn.setAttribute("aria-pressed", "false");
    btn.addEventListener("click", function () {
      var show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.innerHTML = icon(show ? "eye-off" : "eye");
      btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
      btn.setAttribute("aria-pressed", String(show));
    });
  }

  /* ---------------- Character counter: field [data-counter] with maxlength ---------------- */
  function counter(field) {
    if (field._ctr) return; field._ctr = true;
    var input = field.querySelector("input, textarea"), out = field.querySelector(".s-count");
    if (!input || !out) return;
    var max = parseInt(input.getAttribute("data-max") || input.getAttribute("maxlength"), 10);
    var upd = function () { var n = input.value.length; out.textContent = n + " / " + max; out.classList.toggle("is-over", n > max); };
    input.addEventListener("input", upd); upd();
  }

  /* ---------------- Dismissible banners ---------------- */
  function dismiss(btn) {
    if (btn._dis) return; btn._dis = true;
    btn.addEventListener("click", function () { var b = btn.closest(".s-banner"); if (!b) return; b.classList.add("is-leaving"); setTimeout(function () { b.remove(); }, 170); });
  }

  /* ---------------- Theme ---------------- */
  function theme(next) {
    var root = document.documentElement;
    if (next) { root.setAttribute("data-theme", next); try { localStorage.setItem("satar-theme", next); } catch (e) {} }
    return root.getAttribute("data-theme") || "night";
  }

  /* ---------------- Reveal on scroll ---------------- */
  function reveal(root) {
    var els = (root || document).querySelectorAll(".s-reveal:not(.is-in)");
    if (reduce || !("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------------- Parallax: [data-speed] layers, eased ---------------- */
  function parallax(opts) {
    opts = opts || {};
    var layers = Array.prototype.slice.call(document.querySelectorAll(opts.selector || "[data-speed]"));
    if (reduce || !layers.length) return { destroy: function () {} };
    var cur = window.scrollY, target = cur, raf = 0, ease = opts.ease || 0.12;
    var vh = window.innerHeight;
    function frame() {
      target = window.scrollY;
      cur += (target - cur) * ease;
      if (Math.abs(target - cur) < 0.1) cur = target;
      for (var i = 0; i < layers.length; i++) {
        var l = layers[i], s = parseFloat(l.getAttribute("data-speed")) || 0;
        if (l._origin == null) { var root = l.closest("[data-parallax-root], section"); l._origin = root ? root.getBoundingClientRect().top + window.scrollY : 0; }
        var y = (cur - l._origin) * s;
        if (l._origin > 0 && Math.abs(cur - l._origin) > vh * 2.5) continue;
        var sc = l.getAttribute("data-scale") ? 1 + Math.max(0, cur - l._origin) / vh * parseFloat(l.getAttribute("data-scale")) : 1;
        var x = l.getAttribute("data-drift") ? cur * parseFloat(l.getAttribute("data-drift")) : 0;
        l.style.transform = "translate3d(" + x.toFixed(2) + "px," + y.toFixed(2) + "px,0) scale(" + sc.toFixed(4) + ")";
        if (l.hasAttribute("data-fade")) { var f = parseFloat(l.getAttribute("data-fade")); l.style.opacity = Math.max(0, 1 - Math.max(0, cur - l._origin) / (vh * f)).toFixed(3); }
      }
      if (opts.onFrame) opts.onFrame(cur);
      raf = requestAnimationFrame(frame);
    }
    window.addEventListener("resize", function () { vh = window.innerHeight; layers.forEach(function (l) { l._origin = null; }); });
    raf = requestAnimationFrame(frame);
    return { destroy: function () { cancelAnimationFrame(raf); } };
  }

  /* ---------------- Curved scroll gallery ----------------
     Markup: <div class="s-gallery" data-gallery data-upload>
               <img src="…" alt="…" data-caption="…"> …</div>
     JS:     var g = SATAR.gallery(el, {images:[{src, alt, caption}], upload:true});
             g.add({src, alt, caption}); g.go(index); g.next(); g.prev(); g.remove(index);
  */
  function gallery(el, opts) {
    opts = opts || {};
    var imgs = Array.prototype.slice.call(el.querySelectorAll(":scope > img")).map(function (i) { return { src: i.getAttribute("src"), alt: i.getAttribute("alt") || "", caption: i.getAttribute("data-caption") || "" }; });
    var items = (opts.images || []).concat(imgs);
    var upload = opts.upload != null ? opts.upload : el.hasAttribute("data-upload");
    var label = el.getAttribute("aria-label") || opts.label || "Image gallery";
    el.innerHTML = "";
    el.setAttribute("role", "region"); el.setAttribute("aria-roledescription", "carousel"); el.setAttribute("aria-label", label);
    var vp = document.createElement("div"); vp.className = "s-gallery__viewport"; vp.tabIndex = 0; vp.setAttribute("aria-label", label + ": use arrow keys or scroll");
    var rail = document.createElement("div"); rail.className = "s-gallery__rail";
    var stage = document.createElement("div"); stage.className = "s-gallery__stage";
    var spacer = document.createElement("div"); spacer.className = "s-gallery__spacer";
    rail.appendChild(stage); rail.appendChild(spacer); vp.appendChild(rail); el.appendChild(vp);
    var drop = document.createElement("div"); drop.className = "s-gallery__drop"; drop.textContent = "Drop images to add them"; el.appendChild(drop);
    var ctr = document.createElement("div"); ctr.className = "s-gallery__controls";
    ctr.innerHTML = '<button class="s-btn s-btn--glass s-btn--icon" type="button" data-g="prev" aria-label="Previous image">' + icon("chevron-left") + '</button>' +
      '<span class="s-gallery__count" aria-live="polite"></span><span class="s-gallery__bar" aria-hidden="true"><i></i></span>' +
      '<button class="s-btn s-btn--glass s-btn--icon" type="button" data-g="next" aria-label="Next image">' + icon("chevron-right") + "</button>" +
      (upload ? '<button class="s-btn s-btn--glass" type="button" data-g="add">' + icon("image") + 'Add images</button><input class="s-gallery__file" type="file" accept="image/*" multiple aria-label="Choose images to add">' : "");
    el.appendChild(ctr);
    var count = ctr.querySelector(".s-gallery__count"), bar = ctr.querySelector(".s-gallery__bar i");
    var cards = [], spacing = 0, pos = 0, smooth = 0, raf = 0, lastIdx = -1;

    function build() {
      stage.innerHTML = ""; cards = [];
      items.forEach(function (it, i) {
        var b = document.createElement("button"); b.type = "button"; b.className = "s-gallery__card";
        b.setAttribute("aria-label", (it.caption || it.alt || "Image") + ", " + (i + 1) + " of " + items.length);
        b.innerHTML = '<img alt="" draggable="false" loading="lazy" decoding="async">' + (it.caption ? "<figcaption></figcaption>" : "");
        b.querySelector("img").src = it.src;
        if (it.caption) b.querySelector("figcaption").textContent = it.caption;
        b.addEventListener("click", function () { if (moved) return; if (Math.round(pos) === i && opts.onOpen !== false) open(i); else go(i); });
        stage.appendChild(b); cards.push(b);
      });
      measure();
    }
    function measure() {
      stage.style.setProperty("--_vw", vp.clientWidth + "px");
      var cw = cards[0] ? cards[0].offsetWidth : 260;
      spacing = cw * 0.78;
      spacer.style.width = Math.max(0, (items.length - 1) * spacing) + "px";
      pos = vp.scrollLeft / (spacing || 1); smooth = pos; render();
    }
    function render() {
      var w = vp.clientWidth, cw = cards[0] ? cards[0].offsetWidth : 260;
      var R = cw * 3.4, n = cards.length, ring = n >= 5, half = n / 2;
      for (var i = 0; i < n; i++) {
        var off = i - smooth;
        /* ring: the tail wraps round so the last cards sit to the left of the first (scrolling itself stays 1 to n) */
        if (ring) off = ((off + half) % n + n) % n - half;
        var a = Math.abs(off);
        var ang = Math.max(-1.3, Math.min(1.3, off * 0.32));  /* radians on the curve */
        var x = Math.sin(ang) * R;
        var z = (1 - Math.cos(ang)) * R * 0.5 - Math.min(a, 1) * 30;
        var ry = -ang * 57.3 * 0.9;
        var s = 1 - Math.min(a, 1) * 0.04;
        var c = cards[i];
        c.style.transform = "translate3d(" + x.toFixed(1) + "px,0," + z.toFixed(1) + "px) rotateY(" + ry.toFixed(2) + "deg) scale(" + s.toFixed(3) + ")";
        c.style.zIndex = String(1000 - Math.round(a * 10));
        c.style.opacity = ring ? String(Math.max(0, Math.min(1, (half - 0.2 - a) / 0.7))) : (a > 4.6 ? "0" : "1");
        c.style.visibility = c.style.opacity === "0" ? "hidden" : "visible";
        c.style.filter = "brightness(" + (1 - Math.min(a, 3) * 0.12).toFixed(2) + ")";
        c.style.setProperty("--_shade", Math.min(1, 0.35 + a * 0.3).toFixed(2));
        c.style.setProperty("--_cap", a < 0.5 ? "1" : "0");
        c.classList.toggle("is-center", a < 0.5);
        c.tabIndex = a < 0.5 ? 0 : -1;
      }
      var idx = Math.round(smooth);
      if (idx !== lastIdx && items.length) { lastIdx = idx; count.textContent = String(idx + 1).padStart(2, "0") + " / " + String(items.length).padStart(2, "0"); }
      if (bar) bar.style.width = (items.length > 1 ? (smooth / (items.length - 1)) * 100 : 100).toFixed(1) + "%";
    }
    function loop() {
      smooth += (pos - smooth) * (reduce ? 1 : 0.16);
      if (Math.abs(pos - smooth) < 0.001) smooth = pos;
      render();
      raf = Math.abs(pos - smooth) > 0.0005 ? requestAnimationFrame(loop) : 0;
    }
    function kick() { if (!raf) raf = requestAnimationFrame(loop); }
    vp.addEventListener("scroll", function () { pos = vp.scrollLeft / (spacing || 1); kick(); }, { passive: true });
    function go(i) { i = Math.max(0, Math.min(items.length - 1, i)); vp.scrollTo({ left: i * spacing, behavior: reduce ? "auto" : "smooth" }); }
    function next() { go(Math.round(pos) + 1); }
    function prev() { go(Math.round(pos) - 1); }
    /* wheel: vertical wheel moves the gallery until an end is reached */
    vp.addEventListener("wheel", function (e) {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      var max = vp.scrollWidth - vp.clientWidth;
      if ((e.deltaY > 0 && vp.scrollLeft >= max - 1) || (e.deltaY < 0 && vp.scrollLeft <= 0)) return;
      e.preventDefault(); vp.scrollLeft += e.deltaY;
      clearTimeout(vp._snap); vp._snap = setTimeout(function () { go(Math.round(pos)); }, 140);
    }, { passive: false });
    /* mouse drag */
    var down = false, sx = 0, sl = 0, moved = false;
    vp.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse" || e.button !== 0) return; down = true; moved = false; sx = e.clientX; sl = vp.scrollLeft; });
    window.addEventListener("pointermove", function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) { moved = true; vp.classList.add("is-dragging"); } vp.scrollLeft = sl - dx * 1.4; });
    window.addEventListener("pointerup", function () { if (!down) return; down = false; vp.classList.remove("is-dragging"); if (moved) go(Math.round(pos)); setTimeout(function () { moved = false; }, 0); });
    /* touch: snap after momentum */
    var tEnd = 0; vp.addEventListener("touchend", function () { clearTimeout(tEnd); tEnd = setTimeout(function () { go(Math.round(pos)); }, 260); }, { passive: true });
    vp.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      else if (e.key === "Home") { e.preventDefault(); go(0); }
      else if (e.key === "End") { e.preventDefault(); go(items.length - 1); }
    });
    ctr.addEventListener("click", function (e) {
      var b = e.target.closest("[data-g]"); if (!b) return;
      var g = b.getAttribute("data-g");
      if (g === "next") next(); else if (g === "prev") prev(); else if (g === "add") ctr.querySelector("input").click();
    });
    function addFiles(files) {
      var first = items.length;
      Array.prototype.forEach.call(files, function (f) { if (/^image\//.test(f.type)) items.push({ src: URL.createObjectURL(f), alt: f.name, caption: f.name.replace(/\.[^.]+$/, "") }); });
      build(); requestAnimationFrame(function () { go(first); });
    }
    if (upload) {
      ctr.querySelector("input").addEventListener("change", function (e) { addFiles(e.target.files); e.target.value = ""; });
      el.addEventListener("dragover", function (e) { if (e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types, "Files") > -1) { e.preventDefault(); el.classList.add("is-dropping"); } });
      el.addEventListener("dragleave", function (e) { if (!el.contains(e.relatedTarget)) el.classList.remove("is-dropping"); });
      el.addEventListener("drop", function (e) { e.preventDefault(); el.classList.remove("is-dropping"); addFiles(e.dataTransfer.files); });
      el.addEventListener("paste", function (e) { var f = []; Array.prototype.forEach.call((e.clipboardData || {}).files || [], function (x) { f.push(x); }); if (f.length) addFiles(f); });
    }
    var lb = null;
    function open(i) {
      if (!lb) {
        lb = document.createElement("dialog"); lb.className = "s-lightbox"; lb.setAttribute("aria-label", "Image preview");
        lb.innerHTML = '<button class="s-btn s-btn--glass s-btn--icon s-lightbox__close" data-close="x" aria-label="Close preview">' + icon("x") + '</button><img alt="">';
        document.body.appendChild(lb);
      }
      lb.querySelector("img").src = items[i].src; lb.querySelector("img").alt = items[i].alt || items[i].caption || "";
      dialog(lb).open(); lb.querySelector("button").focus();
    }
    window.addEventListener("resize", measure);
    build();
    var api = {
      add: function (it) { items.push(typeof it === "string" ? { src: it, alt: "" } : it); build(); return api; },
      remove: function (i) { items.splice(i, 1); build(); return api; },
      go: go, next: next, prev: prev, items: items
    };
    el._gallery = api;
    return api;
  }

  window.SATAR = {
    icon: icon, icons: Object.keys(P), badge: badge, hydrate: hydrate, gallery: gallery,
    dialog: dialog, confirm: confirm, toast: toast, menu: menu, drawer: drawer, copy: copy,
    password: password, counter: counter, dismiss: dismiss, reveal: reveal, parallax: parallax, theme: theme
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { hydrate(); reveal(); });
  else { hydrate(); reveal(); }
})();
