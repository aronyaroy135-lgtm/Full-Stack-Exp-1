(function () {
  "use strict";

  var P = window.PLATFORMS;
  var V = window.Validator;

  var state = {
    selected: ["x", "linkedin"],
    shared: "",
    overrides: {},      // platformId -> text that differs from shared
    media: [],          // [{ name, kind }]
    active: "shared",   // "shared" or platformId
  };

  var $ = function (id) { return document.getElementById(id); };
  var els = {
    toggles: $("platform-toggles"), tabs: $("tabs"), editor: $("editor"),
    note: $("override-note"), file: $("file"), reset: $("reset-override"),
    media: $("media-list"), cards: $("cards"), empty: $("empty-state"),
    publish: $("publish"), status: $("publish-status"),
  };

  function postFor(id) {
    var text = Object.prototype.hasOwnProperty.call(state.overrides, id)
      ? state.overrides[id] : state.shared;
    return { text: text, media: state.media };
  }

  function el(tag, props, children) {
    var n = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      if (k === "text") n.textContent = props[k];
      else if (k === "class") n.className = props[k];
      else n.setAttribute(k, props[k]);
    });
    (children || []).forEach(function (c) { n.appendChild(c); });
    return n;
  }

  /* ---------- rendering ---------- */

  function renderToggles() {
    els.toggles.textContent = "";
    Object.keys(P).forEach(function (id) {
      var on = state.selected.indexOf(id) !== -1;
      var b = el("button", { class: "chip", type: "button", "aria-pressed": String(on) }, [
        el("span", { class: "dot" }), el("span", { text: P[id].name }),
      ]);
      b.style.setProperty("--c", P[id].color);
      b.addEventListener("click", function () { toggle(id); });
      els.toggles.appendChild(b);
    });
  }

  function renderTabs() {
    els.tabs.textContent = "";
    var items = [{ id: "shared", name: "Shared text" }].concat(
      state.selected.map(function (id) { return { id: id, name: P[id].name }; })
    );
    items.forEach(function (it) {
      var b = el("button", {
        class: "tab", type: "button", role: "tab",
        "aria-selected": String(state.active === it.id),
      }, [el("span", { text: it.name })]);
      if (it.id !== "shared" && Object.prototype.hasOwnProperty.call(state.overrides, it.id)) {
        b.appendChild(el("span", { class: "badge", title: "Custom text for this platform" }));
      }
      b.addEventListener("click", function () { state.active = it.id; syncEditor(); renderTabs(); });
      els.tabs.appendChild(b);
    });
  }

  function syncEditor() {
    var isShared = state.active === "shared";
    els.editor.value = isShared ? state.shared : postFor(state.active).text;
    var hasOverride = !isShared && Object.prototype.hasOwnProperty.call(state.overrides, state.active);
    els.reset.hidden = !hasOverride;
    els.note.textContent = isShared
      ? "This text goes to every platform without custom text."
      : hasOverride
        ? "Custom text for " + P[state.active].name + " (overrides shared text)."
        : "Editing here creates custom text for " + P[state.active].name + " only.";
  }

  function renderMedia() {
    els.media.textContent = "";
    state.media.forEach(function (m, i) {
      var rm = el("button", { type: "button", "aria-label": "Remove " + m.name, text: "Remove" });
      rm.addEventListener("click", function () { state.media.splice(i, 1); render(); });
      els.media.appendChild(el("li", {}, [el("span", { text: m.kind + ": " + m.name }), rm]));
    });
  }

  function renderCards() {
    els.cards.textContent = "";
    els.empty.hidden = state.selected.length > 0;
    var allOk = state.selected.length > 0;

    state.selected.forEach(function (id) {
      var p = P[id];
      var post = postFor(id);
      var r = V.validate(post, p);
      if (!r.ok) allOk = false;

      var pct = Math.min(100, Math.round((r.stats.chars / p.maxChars) * 100));
      var meterClass = "meter" + (r.stats.chars > p.maxChars ? " over"
        : r.stats.chars >= p.maxChars * p.warnAt ? " warn" : "");
      var meter = el("div", { class: meterClass, role: "progressbar", "aria-valuemin": "0",
        "aria-valuemax": String(p.maxChars), "aria-valuenow": String(r.stats.chars),
        "aria-label": p.name + " character usage" }, [el("i")]);
      meter.firstChild.style.width = pct + "%";

      var msgs = el("ul", { class: "msgs" });
      r.errors.forEach(function (m) { msgs.appendChild(el("li", { class: "e", text: m })); });
      r.warnings.forEach(function (m) { msgs.appendChild(el("li", { class: "w", text: m })); });

      var card = el("article", { class: "card" }, [
        el("header", {}, [
          el("h3", { text: p.name }),
          el("span", { class: "status " + (r.ok ? "ok" : "bad"), text: r.ok ? "Ready" : r.errors.length + " issue(s)" }),
        ]),
        meter,
        el("div", { class: "stats" }, [
          el("span", { text: r.stats.chars + "/" + p.maxChars + " chars" }),
          el("span", { text: r.stats.hashtags + "/" + p.maxHashtags + " hashtags" }),
          el("span", { text: r.stats.media + "/" + p.maxMedia + " media" }),
        ]),
        msgs,
        el("div", { class: "preview", text: post.text || "(empty)" }),
      ]);
      card.style.setProperty("--c", p.color);
      els.cards.appendChild(card);
    });

    els.publish.disabled = !allOk;
  }

  function render() {
    renderToggles(); renderTabs(); syncEditor(); renderMedia(); renderCards();
  }

  /* ---------- actions ---------- */

  function toggle(id) {
    var i = state.selected.indexOf(id);
    if (i === -1) state.selected.push(id);
    else {
      state.selected.splice(i, 1);
      delete state.overrides[id];
      if (state.active === id) state.active = "shared";
    }
    els.status.textContent = "";
    render();
  }

  els.editor.addEventListener("input", function () {
    if (state.active === "shared") state.shared = els.editor.value;
    else state.overrides[state.active] = els.editor.value;
    els.status.textContent = "";
    // Cheap re-render of only what changes while typing.
    renderTabs();
    els.reset.hidden = state.active === "shared";
    renderCards();
  });

  els.reset.addEventListener("click", function () {
    delete state.overrides[state.active];
    render();
  });

  els.file.addEventListener("change", function () {
    Array.prototype.forEach.call(els.file.files, function (f) {
      var kind = f.type.indexOf("video/") === 0 ? "video" : "image";
      state.media.push({ name: f.name, kind: kind });
    });
    els.file.value = "";
    els.status.textContent = "";
    render();
  });

  els.publish.addEventListener("click", function () {
    // Re-validate at the moment of publishing; never trust the button state alone.
    var results = V.validateAll(
      state.selected.reduce(function (a, id) { a[id] = postFor(id); return a; }, {}),
      P, state.selected
    );
    var bad = state.selected.filter(function (id) { return !results[id].ok; });
    if (bad.length) {
      els.status.textContent = "Blocked: fix " + bad.map(function (id) { return P[id].name; }).join(", ") + ".";
      return;
    }
    // Demo only: a real app would call each platform's API here.
    els.status.textContent = "Simulated publish to " +
      state.selected.map(function (id) { return P[id].name; }).join(", ") + ".";
  });

  render();
})();
