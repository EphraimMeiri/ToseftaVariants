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

  // ../midrash-viewer-core/src/index.js
  var index_exports = {};
  __export(index_exports, {
    DEFAULT_LABELS: () => DEFAULT_LABELS,
    ZOOM_DEFAULTS: () => ZOOM_DEFAULTS,
    bbox: () => bbox_exports,
    createManuscriptPanel: () => createManuscriptPanel,
    createZoomController: () => createZoomController,
    nearestEntry: () => nearestEntry
  });

  // ../midrash-viewer-core/src/bbox.js
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

  // ../midrash-viewer-core/src/zoom.js
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

  // ../midrash-viewer-core/src/manuscript-panel.js
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

  // ../midrash-viewer-core/src/resolve.js
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
  return __toCommonJS(index_exports);
})();
//# sourceMappingURL=midrash-viewer-core.js.map
