var MidrashViewerCore = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.js
  var index_exports = {};
  __export(index_exports, {
    COMMENTARY_LABELS: () => COMMENTARY_LABELS,
    DEFAULT_LABELS: () => DEFAULT_LABELS,
    DOCK_LABELS: () => DOCK_LABELS,
    ZOOM_DEFAULTS: () => ZOOM_DEFAULTS,
    address: () => address_exports,
    bbox: () => bbox_exports,
    createCommentaryPanel: () => createCommentaryPanel,
    createDock: () => createDock,
    createLayerRegistry: () => createLayerRegistry,
    createManuscriptPanel: () => createManuscriptPanel,
    createSelection: () => createSelection,
    createZoomController: () => createZoomController,
    nearestEntry: () => nearestEntry
  });

  // src/bbox.js
  var bbox_exports = {};
  __export(bbox_exports, {
    fromXYWH: () => fromXYWH,
    fromXYXY: () => fromXYXY,
    toPercentStyle: () => toPercentStyle
  });
  function fromXYXY(b) {
    if (!b || b.length < 4) return null;
    const [x0, y0, x1, y1] = b;
    return [x0, y0, x1 - x0, y1 - y0];
  }
  function fromXYWH(b) {
    if (!b || b.length < 4) return null;
    return [b[0], b[1], b[2], b[3]];
  }
  function toPercentStyle(bbox, page) {
    if (!bbox || !page || !page.width || !page.height) return null;
    return {
      left: bbox[0] / page.width * 100 + "%",
      top: bbox[1] / page.height * 100 + "%",
      width: bbox[2] / page.width * 100 + "%",
      height: bbox[3] / page.height * 100 + "%"
    };
  }

  // src/zoom.js
  var ZOOM_DEFAULTS = {
    min: 0.4,
    max: 6,
    focus: 3,
    // zoom applied when a word is focused
    step: 1.25,
    // per button press
    wheelStep: 1.08
  };
  function createZoomController(viewport, opts = {}) {
    const cfg = { ...ZOOM_DEFAULTS, ...opts };
    let zoom = 1;
    let wrapEl = null, boxEl = null;
    function clamp(z) {
      return Math.min(cfg.max, Math.max(cfg.min, z));
    }
    function applyZoomWidth() {
      if (!wrapEl) return;
      wrapEl.style.width = zoom * 100 + "%";
    }
    function physicalLeftToScrollLeft(physicalX) {
      if (!isRtl()) return physicalX;
      return physicalX - (viewport.scrollWidth - viewport.clientWidth);
    }
    function isRtl() {
      return getComputedStyle(viewport).direction === "rtl";
    }
    function centerOnBox(behavior = "smooth") {
      if (!wrapEl || !boxEl) return;
      applyZoomWidth();
      const boxCenterX = boxEl.offsetLeft + boxEl.offsetWidth / 2;
      const targetLeft = physicalLeftToScrollLeft(boxCenterX - viewport.clientWidth / 2);
      const targetTop = boxEl.offsetTop + boxEl.offsetHeight / 2 - viewport.clientHeight / 2;
      viewport.scrollTo({ left: targetLeft, top: targetTop, behavior });
    }
    function setZoomAtPoint(newZoom, clientX, clientY) {
      if (!wrapEl) return;
      newZoom = clamp(newZoom);
      const rect = viewport.getBoundingClientRect();
      const cx = clientX - rect.left, cy = clientY - rect.top;
      const oldScrollWidth = viewport.scrollWidth;
      const physX = isRtl() ? oldScrollWidth - viewport.clientWidth + viewport.scrollLeft + cx : viewport.scrollLeft + cx;
      const fracX = physX / oldScrollWidth;
      const fracY = (viewport.scrollTop + cy) / viewport.scrollHeight;
      zoom = newZoom;
      applyZoomWidth();
      viewport.scrollLeft = physicalLeftToScrollLeft(fracX * viewport.scrollWidth - cx);
      viewport.scrollTop = fracY * viewport.scrollHeight - cy;
    }
    function stepZoom(factor) {
      if (!wrapEl) return;
      zoom = clamp(zoom * factor);
      if (boxEl) centerOnBox();
      else applyZoomWidth();
    }
    function reset() {
      zoom = 1;
      if (boxEl) centerOnBox();
      else if (wrapEl) {
        applyZoomWidth();
        viewport.scrollTo({ left: 0, top: 0, behavior: "smooth" });
      }
    }
    function onWheel(e) {
      if (!e.ctrlKey || !wrapEl) return;
      e.preventDefault();
      setZoomAtPoint(zoom * (e.deltaY < 0 ? cfg.wheelStep : 1 / cfg.wheelStep), e.clientX, e.clientY);
    }
    let dragging = false, lastX = 0, lastY = 0;
    function onMouseDown(e) {
      if (!wrapEl || e.button !== 0) return;
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      viewport.classList.add("mvc-dragging");
      e.preventDefault();
    }
    function onMouseMove(e) {
      if (!dragging) return;
      viewport.scrollLeft -= e.clientX - lastX;
      viewport.scrollTop -= e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
    }
    function onMouseUp() {
      dragging = false;
      viewport.classList.remove("mvc-dragging");
    }
    viewport.addEventListener("wheel", onWheel, { passive: false });
    viewport.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return {
      // Called by the panel after each re-render, with the new elements
      // (box may be null when the word has no recognised box).
      attach(wrap, box) {
        wrapEl = wrap;
        boxEl = box;
      },
      detach() {
        wrapEl = null;
        boxEl = null;
      },
      focus() {
        zoom = cfg.focus;
        centerOnBox();
      },
      get zoom() {
        return zoom;
      },
      centerOnBox,
      setZoomAtPoint,
      zoomIn: () => stepZoom(cfg.step),
      zoomOut: () => stepZoom(1 / cfg.step),
      reset,
      // Fullscreen toggles the Fullscreen API directly on the viewport rather
      // than moving the image into a separate overlay -- the element stays
      // put in the DOM, so the zoom/pan/drag listeners already bound to it
      // keep working unchanged while it's promoted to fill the screen.
      toggleFullscreen() {
        if (document.fullscreenElement === viewport) document.exitFullscreen();
        else viewport.requestFullscreen();
      },
      isFullscreen() {
        return document.fullscreenElement === viewport;
      },
      destroy() {
        viewport.removeEventListener("wheel", onWheel);
        viewport.removeEventListener("mousedown", onMouseDown);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      }
    };
  }

  // src/manuscript-panel.js
  var DEFAULT_LABELS = {
    noSelection: "לחצו על מילה בטקסט כדי להציג את כתב היד",
    noData: (w) => `אין נתוני כתב יד עבור ${w}`,
    noChapter: (w) => `אין עדיין נתוני כתב יד לקטע זה ב${w}`,
    notFound: (w) => `המילה לא זוהתה ב${w} במיקום זה`,
    noImage: "אין תצלום כתב יד למילה זו.",
    approxNote: "המילה המדויקת לא זוהתה בכתב היד — מוצגת המילה המזוהה הקרובה ביותר",
    folio: (f) => "דף " + f,
    thisWitness: "עד זה",
    zoomIn: "הגדל",
    zoomOut: "הקטן",
    reset: "איפוס תצוגה",
    fullscreen: "תצוגת מסך מלא",
    exitFullscreen: "צא ממסך מלא"
  };
  function createManuscriptPanel(options) {
    const {
      root,
      adapter,
      showFolioLabel = false,
      showFullscreen = true,
      zoom: zoomOpts,
      onWitnessChange = null
    } = options;
    if (!root) throw new Error("createManuscriptPanel: `root` is required");
    if (!adapter || typeof adapter.resolve !== "function") {
      throw new Error("createManuscriptPanel: `adapter.resolve` is required");
    }
    const labels = { ...DEFAULT_LABELS, ...options.labels || {} };
    root.classList.add("mvc-ms");
    root.innerHTML = "";
    const bar = el("div", "mvc-ms-bar");
    const tabs = el("div", "mvc-ms-tabs");
    const controls = el("div", "mvc-ms-controls");
    const folioLabel = el("span", "mvc-ms-folio");
    bar.append(tabs, folioLabel, controls);
    const viewport = el("div", "mvc-ms-viewport");
    const note = el("div", "mvc-ms-note");
    note.hidden = true;
    root.append(bar, viewport, note);
    const zoomCtl = createZoomController(viewport, zoomOpts);
    const btnOut = button("−", labels.zoomOut, () => zoomCtl.zoomOut());
    const btnReset = button("⟲", labels.reset, () => zoomCtl.reset());
    const btnIn = button("+", labels.zoomIn, () => zoomCtl.zoomIn());
    controls.append(btnOut, btnReset, btnIn);
    let btnFull = null;
    if (showFullscreen && viewport.requestFullscreen) {
      btnFull = button("⛶", labels.fullscreen, () => zoomCtl.toggleFullscreen());
      controls.append(btnFull);
    }
    function onFullscreenChange() {
      if (!btnFull) return;
      const isFs = zoomCtl.isFullscreen();
      btnFull.title = isFs ? labels.exitFullscreen : labels.fullscreen;
      btnFull.classList.toggle("active", isFs);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    let address = null;
    let activeWitnessId = null;
    let currentImg = null;
    let imgLoadHandler = null;
    function setControlsEnabled(on) {
      [btnOut, btnReset, btnIn, btnFull].forEach((b) => {
        if (b) b.disabled = !on;
      });
    }
    function placeholder(text) {
      viewport.innerHTML = "";
      viewport.append(Object.assign(el("div", "mvc-ms-placeholder"), { textContent: text }));
      zoomCtl.detach();
      setControlsEnabled(false);
      folioLabel.textContent = "";
      note.hidden = true;
    }
    function renderTabs(witnesses) {
      tabs.innerHTML = "";
      if (witnesses.length < 2) {
        tabs.hidden = true;
        return;
      }
      tabs.hidden = false;
      witnesses.forEach((w) => {
        const btn = el("button", "mvc-ms-tab" + (w.id === activeWitnessId ? " active" : ""));
        btn.type = "button";
        btn.textContent = w.label || w.id;
        btn.addEventListener("click", () => {
          if (w.id === activeWitnessId) return;
          activeWitnessId = w.id;
          if (onWitnessChange) onWitnessChange(w.id);
          render();
        });
        tabs.appendChild(btn);
      });
    }
    function render() {
      if (currentImg && imgLoadHandler) currentImg.removeEventListener("load", imgLoadHandler);
      currentImg = null;
      imgLoadHandler = null;
      if (address == null) {
        renderTabs([]);
        placeholder(labels.noSelection);
        return;
      }
      const witnesses = adapter.listWitnesses ? adapter.listWitnesses(address) || [] : [];
      if (witnesses.length && !witnesses.some((w) => w.id === activeWitnessId)) {
        activeWitnessId = witnesses[0].id;
      }
      renderTabs(witnesses);
      if (adapter.listWitnesses && !witnesses.length) {
        placeholder(labels.noImage);
        return;
      }
      const res = adapter.resolve(activeWitnessId, address) || { status: "no-data" };
      const witnessLabel = res.witnessLabel || (witnesses.find((w) => w.id === activeWitnessId) || {}).label || labels.thisWitness;
      if (res.status === "no-data") return placeholder(labels.noData(witnessLabel));
      if (res.status === "no-chapter") return placeholder(labels.noChapter(witnessLabel));
      if (res.status === "not-found" || !res.page || !res.page.url) {
        return placeholder(labels.notFound(witnessLabel));
      }
      viewport.innerHTML = "";
      setControlsEnabled(true);
      const wantFolio = typeof showFolioLabel === "function" ? showFolioLabel() : showFolioLabel;
      folioLabel.textContent = wantFolio && res.folio != null ? labels.folio(res.folio) : "";
      const wrap = el("div", "mvc-ms-wrap");
      const img = el("img", "mvc-ms-img");
      img.src = res.page.url;
      img.alt = witnessLabel + (res.folio != null ? `, ${res.folio}` : "");
      img.draggable = false;
      wrap.appendChild(img);
      let box = null;
      const pos = toPercentStyle(res.bbox, res.page);
      if (pos) {
        box = el("div", "mvc-ms-box" + (res.status === "approx" ? " mvc-ms-box-approx" : ""));
        Object.assign(box.style, pos);
        wrap.appendChild(box);
      }
      viewport.appendChild(wrap);
      note.hidden = res.status !== "approx";
      note.textContent = res.status === "approx" ? labels.approxNote : "";
      zoomCtl.attach(wrap, box);
      const focus = () => requestAnimationFrame(() => {
        if (box) zoomCtl.focus();
        else zoomCtl.reset();
      });
      if (img.complete) {
        focus();
      } else {
        currentImg = img;
        imgLoadHandler = () => focus();
        img.addEventListener("load", imgLoadHandler, { once: true });
      }
    }
    render();
    return {
      // Show the word at `addr`. Pass null to return to the empty state.
      // `opts.witnessId` picks the witness in the same pass, so a click that
      // implies both ("this word, in that witness") is one render, not two.
      select(addr, opts) {
        address = addr;
        if (opts && opts.witnessId) activeWitnessId = opts.witnessId;
        render();
      },
      // Force a particular witness tab (e.g. the reader clicked that
      // witness's row in the synopsis, not just any word).
      selectWitness(id) {
        activeWitnessId = id;
        render();
      },
      get witnessId() {
        return activeWitnessId;
      },
      get address() {
        return address;
      },
      refresh: render,
      destroy() {
        document.removeEventListener("fullscreenchange", onFullscreenChange);
        zoomCtl.destroy();
        root.innerHTML = "";
        root.classList.remove("mvc-ms");
      }
    };
  }
  function el(tag, className) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }
  function button(text, title, onClick) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "mvc-ms-btn";
    b.textContent = text;
    b.title = title;
    b.addEventListener("click", onClick);
    return b;
  }

  // src/resolve.js
  function nearestEntry(wordsByIdx, baseIdx, { maxDistance = Infinity } = {}) {
    if (!wordsByIdx) return null;
    const keys = Object.keys(wordsByIdx);
    if (!keys.length) return null;
    const exact = wordsByIdx[String(baseIdx)];
    if (exact) return { status: "exact", entry: exact, distance: 0 };
    let nearestKey = null, nearestDist = Infinity;
    for (const k of keys) {
      const dist = Math.abs(Number(k) - baseIdx);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestKey = k;
      }
    }
    if (nearestKey == null || nearestDist > maxDistance) return null;
    return { status: "approx", entry: wordsByIdx[nearestKey], distance: nearestDist };
  }

  // src/address.js
  var address_exports = {};
  __export(address_exports, {
    CHAPTER: () => CHAPTER,
    HALAKHAH: () => HALAKHAH,
    WORD: () => WORD,
    addressKey: () => addressKey,
    anchorMatches: () => anchorMatches,
    coarsen: () => coarsen,
    compareAnchors: () => compareAnchors,
    makeAddress: () => makeAddress,
    sameAddress: () => sameAddress,
    scopeOf: () => scopeOf
  });
  var WORD = "word";
  var HALAKHAH = "halakhah";
  var CHAPTER = "chapter";
  function makeAddress(work, chapter, halakhah, baseIdx = null) {
    return {
      work: work == null ? null : String(work),
      chapter: toInt(chapter),
      halakhah: toInt(halakhah),
      baseIdx: baseIdx == null ? null : toInt(baseIdx)
    };
  }
  function scopeOf(addr) {
    if (!addr) return null;
    if (addr.baseIdx != null) return WORD;
    if (addr.halakhah != null) return HALAKHAH;
    if (addr.chapter != null) return CHAPTER;
    return null;
  }
  function addressKey(addr) {
    if (!addr) return "";
    return [addr.work, addr.chapter, addr.halakhah, addr.baseIdx].join("|");
  }
  function sameAddress(a, b) {
    if (!a || !b) return a === b;
    return addressKey(a) === addressKey(b);
  }
  function coarsen(addr) {
    if (!addr) return null;
    return { ...addr, baseIdx: null };
  }
  function anchorMatches(anchor, addr) {
    if (!anchor || !addr) return false;
    if (anchor.work != null && addr.work != null && anchor.work !== addr.work) return false;
    if (anchor.chapter !== addr.chapter) return false;
    const anchorScope = scopeOf(anchor);
    if (anchorScope === CHAPTER) return true;
    if (anchor.halakhah !== addr.halakhah) return false;
    if (anchorScope === HALAKHAH) return true;
    if (addr.baseIdx == null) return true;
    if (anchor.endIdx != null) {
      return addr.baseIdx >= anchor.baseIdx && addr.baseIdx <= anchor.endIdx;
    }
    return anchor.baseIdx === addr.baseIdx;
  }
  function compareAnchors(a, b) {
    var _a, _b, _c, _d, _e, _f;
    if (a.chapter !== b.chapter) return a.chapter - b.chapter;
    if (a.halakhah !== b.halakhah) return ((_a = a.halakhah) != null ? _a : -1) - ((_b = b.halakhah) != null ? _b : -1);
    const ai = a.baseIdx, bi = b.baseIdx;
    if (ai == null && bi == null) return ((_c = a.order) != null ? _c : 0) - ((_d = b.order) != null ? _d : 0);
    if (ai == null) return -1;
    if (bi == null) return 1;
    if (ai !== bi) return ai - bi;
    return ((_e = a.order) != null ? _e : 0) - ((_f = b.order) != null ? _f : 0);
  }
  function toInt(v) {
    if (v == null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : null;
  }

  // src/selection.js
  function createSelection(initial = null) {
    let current = initial;
    let currentMeta = {};
    const subscribers = /* @__PURE__ */ new Set();
    function emit() {
      [...subscribers].forEach((fn) => {
        try {
          fn(current, currentMeta);
        } catch (err) {
          console.error("[mvc] selection subscriber failed", err);
        }
      });
    }
    return {
      get() {
        return current;
      },
      get meta() {
        return currentMeta;
      },
      // `force` re-emits even when the address is unchanged, for the case
      // where only the meta moved (same word, different witness).
      set(addr, meta = {}, { force = false } = {}) {
        const metaChanged = JSON.stringify(meta) !== JSON.stringify(currentMeta);
        if (!force && !metaChanged && sameAddress(addr, current)) return;
        current = addr;
        currentMeta = meta;
        emit();
      },
      clear(meta = {}) {
        if (current == null) return;
        current = null;
        currentMeta = meta;
        emit();
      },
      subscribe(fn) {
        subscribers.add(fn);
        return () => subscribers.delete(fn);
      }
    };
  }

  // src/dock.js
  var DOCK_LABELS = {
    close: "סגור",
    empty: "לא נבחרה תצוגה"
  };
  function createDock(options) {
    const {
      root,
      onVisibilityChange = null,
      onActiveChange = null,
      // Host-supplied controls that belong to the DOCK rather than to any one
      // layer, so they persist across tab switches (the commentary dock's pin
      // toggle: which layer is showing doesn't change whether the dock
      // follows the reader's scroll position).
      headerControls = null
    } = options;
    if (!root) throw new Error("createDock: `root` is required");
    const labels = { ...DOCK_LABELS, ...options.labels || {} };
    root.classList.add("mvc-dock");
    root.innerHTML = "";
    const header = el2("div", "mvc-dock-header");
    const tabs = el2("div", "mvc-dock-tabs");
    const titleEl = el2("span", "mvc-dock-title");
    const extras = el2("div", "mvc-dock-extras");
    const fixedExtras = el2("div", "mvc-dock-fixed-extras");
    if (headerControls) {
      (Array.isArray(headerControls) ? headerControls : [headerControls]).forEach((n) => fixedExtras.appendChild(n));
    }
    const closeBtn = el2("button", "mvc-dock-close");
    closeBtn.type = "button";
    closeBtn.textContent = "✕";
    closeBtn.title = labels.close;
    closeBtn.addEventListener("click", () => hide());
    header.append(tabs, titleEl, extras, fixedExtras, closeBtn);
    const body = el2("div", "mvc-dock-body");
    root.append(header, body);
    const hosted = /* @__PURE__ */ new Map();
    let order = [];
    let activeId = null;
    let lastAddr = null;
    let lastMeta = {};
    let lastCtx = void 0;
    function renderTabs() {
      tabs.innerHTML = "";
      const multi = order.length > 1;
      tabs.hidden = !multi;
      titleEl.hidden = multi;
      if (!multi) {
        const only = order.length ? hosted.get(order[0]) : null;
        titleEl.textContent = only ? only.layer.label || only.layer.id : labels.empty;
        return;
      }
      order.forEach((id) => {
        const entry = hosted.get(id);
        const btn = el2("button", "mvc-dock-tab" + (id === activeId ? " active" : ""));
        btn.type = "button";
        btn.textContent = entry.layer.label || id;
        if (entry.layer.title) btn.title = entry.layer.title;
        btn.setAttribute("aria-pressed", String(id === activeId));
        btn.addEventListener("click", () => activate(id));
        tabs.appendChild(btn);
      });
    }
    function pushSelection(entry) {
      if (!entry || !entry.instance || typeof entry.instance.select !== "function") return;
      try {
        entry.instance.select(lastAddr, lastMeta);
        entry.stale = false;
      } catch (err) {
        console.error(`[mvc] dock layer "${entry.layer.id}" failed to select`, err);
      }
    }
    function activate(id) {
      if (!hosted.has(id)) return;
      activeId = id;
      hosted.forEach((entry2, key) => {
        entry2.container.hidden = key !== id;
      });
      const entry = hosted.get(id);
      renderExtras(entry);
      if (entry.stale) pushSelection(entry);
      renderTabs();
      if (onActiveChange) onActiveChange(id);
    }
    function renderExtras(entry) {
      extras.innerHTML = "";
      const nodes = entry && entry.instance && entry.instance.headerControls;
      if (!nodes) return;
      (Array.isArray(nodes) ? nodes : [nodes]).forEach((n) => extras.appendChild(n));
    }
    function show() {
      if (!root.hidden) return;
      root.hidden = false;
      if (onVisibilityChange) onVisibilityChange(true);
      const entry = hosted.get(activeId);
      if (entry && entry.stale) pushSelection(entry);
    }
    function hide() {
      if (root.hidden) return;
      root.hidden = true;
      if (onVisibilityChange) onVisibilityChange(false);
    }
    return {
      get root() {
        return root;
      },
      get activeId() {
        return activeId;
      },
      get layerIds() {
        return [...order];
      },
      get visible() {
        return !root.hidden;
      },
      // Reconcile the dock to exactly this list of layers, in this order.
      // Layers already hosted keep their mounted instance and scroll state --
      // toggling an unrelated layer must not blow away the panel the reader
      // is reading.
      setLayers(layers, ctx) {
        const ctxChanged = ctx !== lastCtx;
        lastCtx = ctx;
        if (ctxChanged) {
          lastAddr = null;
          lastMeta = {};
        }
        const wanted = new Set(layers.map((l) => l.id));
        [...hosted.keys()].forEach((id) => {
          if (wanted.has(id)) return;
          const entry = hosted.get(id);
          if (entry.instance && typeof entry.instance.destroy === "function") {
            try {
              entry.instance.destroy();
            } catch (err) {
              console.error(`[mvc] dock layer "${id}" failed to destroy`, err);
            }
          }
          entry.container.remove();
          hosted.delete(id);
        });
        layers.forEach((layer) => {
          if (hosted.has(layer.id)) {
            const entry = hosted.get(layer.id);
            entry.layer = layer;
            if (ctxChanged) {
              entry.stale = true;
              if (entry.instance && typeof entry.instance.setContext === "function") {
                try {
                  entry.instance.setContext(ctx);
                } catch (err) {
                  console.error(`[mvc] dock layer "${layer.id}" failed setContext`, err);
                }
              }
            }
            return;
          }
          const container = el2("div", "mvc-dock-pane");
          container.dataset.layerId = layer.id;
          container.hidden = true;
          body.appendChild(container);
          let instance = null;
          try {
            instance = layer.mount(container, ctx) || null;
          } catch (err) {
            console.error(`[mvc] dock layer "${layer.id}" failed to mount`, err);
            container.textContent = "";
          }
          hosted.set(layer.id, { layer, container, instance, stale: true });
        });
        order = layers.map((l) => l.id);
        order.forEach((id) => body.appendChild(hosted.get(id).container));
        if (!order.length) {
          activeId = null;
          renderTabs();
          renderExtras(null);
          hide();
          return;
        }
        activate(order.includes(activeId) ? activeId : order[0]);
      },
      // Route a selection into the dock. `meta.targetLayer` lets the click
      // that caused it also choose which tab answers -- clicking a
      // commentary marker in the body should raise the commentary, not
      // whatever tab happened to be open.
      select(addr, meta = {}) {
        lastAddr = addr;
        lastMeta = meta;
        hosted.forEach((entry) => {
          entry.stale = true;
        });
        if (meta.targetLayer && hosted.has(meta.targetLayer)) {
          activate(meta.targetLayer);
          show();
          return;
        }
        if (root.hidden) return;
        pushSelection(hosted.get(activeId));
      },
      activate,
      show,
      hide,
      toggle(on) {
        (on == null ? root.hidden : on) ? show() : hide();
      },
      refresh() {
        const entry = hosted.get(activeId);
        if (entry && entry.instance && typeof entry.instance.refresh === "function") {
          entry.instance.refresh();
        }
      },
      instance(id) {
        const entry = hosted.get(id);
        return entry ? entry.instance : null;
      },
      destroy() {
        hosted.forEach((entry) => {
          if (entry.instance && typeof entry.instance.destroy === "function") {
            try {
              entry.instance.destroy();
            } catch (err) {
            }
          }
        });
        hosted.clear();
        order = [];
        activeId = null;
        root.innerHTML = "";
        root.classList.remove("mvc-dock");
      }
    };
  }
  function el2(tag, className) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  // src/layers.js
  function createLayerRegistry(options = {}) {
    const {
      docks = {},
      storageKey = null,
      profiles = {},
      selection = createSelection()
    } = options;
    const layers = /* @__PURE__ */ new Map();
    const changeSubscribers = /* @__PURE__ */ new Set();
    let ctx = null;
    let activeProfile = null;
    let restored = null;
    const intent = /* @__PURE__ */ new Map();
    function intentFor(layer) {
      if (intent.has(layer.id)) return intent.get(layer.id);
      const profileList = activeProfile ? profiles[activeProfile] : null;
      const source = profileList || restored && restored.enabled || null;
      const on = source ? source.includes(layer.id) : !!layer.defaultOn;
      intent.set(layer.id, on);
      return on;
    }
    function load() {
      if (!storageKey) return null;
      try {
        const raw = localStorage.getItem(storageKey);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    }
    function persist() {
      if (!storageKey) return;
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          profile: activeProfile,
          // Intent, not the currently-enabled set: a layer switched on
          // but masked by the current tractate's missing data should
          // still be on when the reader opens a tractate that has it.
          enabled: [...intent.entries()].filter(([, on]) => on).map(([id]) => id)
        }));
      } catch {
      }
    }
    restored = load();
    if (restored && restored.profile) activeProfile = restored.profile;
    function isAvailable(layer) {
      if (typeof layer.available !== "function") return true;
      try {
        return !!layer.available(ctx);
      } catch (err) {
        console.error(`[mvc] layer "${layer.id}" available() threw`, err);
        return false;
      }
    }
    function availableLayers() {
      return [...layers.values()].filter(isAvailable);
    }
    function enabledLayers() {
      return availableLayers().filter(intentFor);
    }
    function syncDocks() {
      Object.entries(docks).forEach(([name, dock]) => {
        const mine = enabledLayers().filter((l) => l.placement === name);
        dock.setLayers(mine, ctx);
        dock.toggle(mine.length > 0);
      });
    }
    function emitChange(reason) {
      [...changeSubscribers].forEach((fn) => {
        try {
          fn({ reason, registry: api });
        } catch (err) {
          console.error("[mvc] layer-change subscriber failed", err);
        }
      });
    }
    selection.subscribe((addr, meta) => {
      Object.values(docks).forEach((dock) => dock.select(addr, meta));
    });
    const api = {
      selection,
      register(layer) {
        if (!layer || !layer.id) throw new Error("registerLayer: `id` is required");
        if (layers.has(layer.id)) throw new Error(`registerLayer: duplicate id "${layer.id}"`);
        const isDock = layer.placement && layer.placement !== "inline";
        if (isDock && typeof layer.mount !== "function") {
          throw new Error(`registerLayer: dock layer "${layer.id}" needs mount()`);
        }
        if (!isDock && typeof layer.decorate !== "function") {
          throw new Error(`registerLayer: inline layer "${layer.id}" needs decorate()`);
        }
        layers.set(layer.id, layer);
        return api;
      },
      // Called when a new work loads. Re-runs availability and re-seats the
      // docks. Intent is untouched: what the reader asked for doesn't change
      // because the tractate did.
      setContext(nextCtx) {
        ctx = nextCtx;
        syncDocks();
        emitChange("context");
        return api;
      },
      get context() {
        return ctx;
      },
      get(id) {
        return layers.get(id) || null;
      },
      all() {
        return [...layers.values()];
      },
      available() {
        return availableLayers();
      },
      enabled() {
        return enabledLayers();
      },
      isEnabled(id) {
        const layer = layers.get(id);
        return !!layer && isAvailable(layer) && intentFor(layer);
      },
      // Inline layers, for the body renderer to apply after it builds the
      // text. Returned in registration order so the visual stacking of
      // markers is predictable rather than dependent on toggle history.
      inline() {
        return enabledLayers().filter((l) => l.placement === "inline");
      },
      setEnabled(id, on) {
        const layer = layers.get(id);
        if (!layer || !isAvailable(layer)) return api;
        if (intentFor(layer) === !!on) return api;
        intent.set(id, !!on);
        activeProfile = null;
        persist();
        syncDocks();
        emitChange(layer.placement === "inline" ? "inline-toggle" : "dock-toggle");
        return api;
      },
      toggle(id) {
        return api.setEnabled(id, !api.isEnabled(id));
      },
      // Presets. The public variants site and the private full edition are
      // the same code with different profiles -- 'variant-lab' foregrounds
      // the classification apparatus, 'reading' foregrounds commentary.
      applyProfile(name) {
        if (!profiles[name]) throw new Error(`applyProfile: unknown profile "${name}"`);
        activeProfile = name;
        restored = null;
        intent.clear();
        persist();
        syncDocks();
        emitChange("profile");
        return api;
      },
      get profile() {
        return activeProfile;
      },
      profileNames() {
        return Object.keys(profiles);
      },
      onChange(fn) {
        changeSubscribers.add(fn);
        return () => changeSubscribers.delete(fn);
      },
      dock(name) {
        return docks[name] || null;
      }
    };
    return api;
  }

  // src/commentary-panel.js
  var COMMENTARY_LABELS = {
    noSelection: "לחצו על מילה בטקסט כדי להציג את הפירוש",
    noNotes: "אין פירוש לקטע זה",
    // Shown on a note we could not place to a word. It describes OUR
    // uncertainty, not the note: the commentator was usually remarking on some
    // particular phrase, we just couldn't find which. The earlier wording ("on
    // the passage as a whole") asserted an editorial fact instead, and
    // contradicted itself on any note that displays a lemma -- most of them.
    unplaced: "מקום מדויק בקטע לא זוהה",
    line: (ref) => `שורה ${ref}`
  };
  function createCommentaryPanel(options) {
    const {
      root,
      adapter
    } = options;
    if (!root) throw new Error("createCommentaryPanel: `root` is required");
    if (!adapter || typeof adapter.entriesFor !== "function") {
      throw new Error("createCommentaryPanel: `adapter.entriesFor` is required");
    }
    const labels = { ...COMMENTARY_LABELS, ...options.labels || {} };
    root.classList.add("mvc-comm");
    root.innerHTML = "";
    const heading = el3("div", "mvc-comm-heading");
    const list = el3("div", "mvc-comm-list");
    const credit = el3("div", "mvc-comm-credit");
    credit.hidden = true;
    root.append(heading, credit, list);
    let address = null;
    let renderedKey = null;
    function placeholder(text) {
      list.innerHTML = "";
      list.append(Object.assign(el3("div", "mvc-comm-empty"), { textContent: text }));
    }
    function render() {
      if (address == null) {
        renderedKey = null;
        heading.textContent = "";
        placeholder(labels.noSelection);
        return;
      }
      const entries = adapter.entriesFor(address) || [];
      heading.textContent = adapter.headingFor ? adapter.headingFor(address) || "" : "";
      if (!entries.length) {
        renderedKey = null;
        placeholder(labels.noNotes);
        return;
      }
      const key = entries.map((en) => en.id).join("|");
      if (key !== renderedKey) {
        renderedKey = key;
        list.innerHTML = "";
        entries.forEach((entry) => list.appendChild(buildNote(entry, labels)));
      }
      highlightActive(entries);
    }
    function highlightActive(entries) {
      list.querySelectorAll(".mvc-comm-note.active").forEach((n) => n.classList.remove("active"));
      if (scopeOf(address) !== WORD) return;
      const active = entries.filter((entry) => entry.baseIdx != null && anchorMatches(entry, address));
      const targets = active.length ? active : nearest(entries, address.baseIdx);
      let first = null;
      targets.forEach((entry) => {
        const node = list.querySelector(`[data-entry-id="${cssEscape(entry.id)}"]`);
        if (!node) return;
        node.classList.add("active");
        if (!first) first = node;
      });
      if (first) first.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    render();
    return {
      // Edition credit: a string, or null to hide it. Set on context change,
      // since it belongs to the work being shown, not to the selection.
      setCredit(text) {
        credit.textContent = text || "";
        credit.hidden = !text;
      },
      select(addr) {
        address = addr;
        render();
      },
      // A new work invalidates the rendered set even if the address happens to
      // look the same.
      setContext() {
        address = null;
        renderedKey = null;
        render();
      },
      refresh() {
        renderedKey = null;
        render();
      },
      get address() {
        return address;
      },
      destroy() {
        root.innerHTML = "";
        root.classList.remove("mvc-comm");
      }
    };
  }
  function nearest(entries, baseIdx) {
    let best = null;
    let bestDist = Infinity;
    entries.forEach((entry) => {
      if (entry.baseIdx == null) return;
      const dist = Math.abs(entry.baseIdx - baseIdx);
      if (dist < bestDist) {
        bestDist = dist;
        best = entry;
      }
    });
    return best ? [best] : [];
  }
  function buildNote(entry, labels) {
    const node = el3("div", "mvc-comm-note");
    node.dataset.entryId = entry.id;
    if (entry.baseIdx == null) node.classList.add("mvc-comm-note-passage");
    const metaText = entry.metaLabel || (entry.baseIdx == null ? labels.unplaced : entry.lineRef ? labels.line(entry.lineRef) : null);
    if (metaText) {
      const meta = el3("span", "mvc-comm-meta");
      meta.textContent = metaText;
      node.appendChild(meta);
    }
    const body = el3("div", "mvc-comm-body");
    body.innerHTML = entry.html || "";
    node.appendChild(body);
    return node;
  }
  function cssEscape(s) {
    return String(s).replace(/["\\]/g, "\\$&");
  }
  function el3(tag, className) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }
  return __toCommonJS(index_exports);
})();
//# sourceMappingURL=midrash-viewer-core.js.map
