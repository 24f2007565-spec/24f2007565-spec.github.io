/* =============================================================
   STREET ENTRANCE — the Portale-style opening, rebuilt for the building.
   M1 preloader + intro · M2 the door's light · M3 through the portal
   (camera move, door turns to face you, rim lights, floods white,
   grows past the screen, then settles into the lobby below).
   ============================================================= */
(function () {
  "use strict";
  const D = window.PORTFOLIO, E = D.entrance;
  const $ = (s, el) => (el || document).querySelector(s);
  const reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const html = document.documentElement;
  const section = $("#entrance");
  if (!section || !window.gsap || !window.ScrollTrigger) {
    // Without GSAP, just show the scene and copy statically.
    if (section) section.querySelectorAll(".ent-media,.ent-over").forEach((el) => (el.style.transform = "none"));
    document.body.classList.remove("outside");
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  gsap.ticker.lagSmoothing(0); // keep the intro on wall-clock time, and in step with the smooth scroll

  /* ---------- motion constants ---------- */
  const SCROLL_SCREENS = 1.5;   // how much scrolling the transition takes
  const DOLLY = 0.18;           // camera move toward the door
  const VB_W = 1600, VB_H = 1000;
  const DOOR = [[735, 440], [872, 458], [872, 882], [735, 898]]; // glass door corners in scene units (TL, TR, BR, BL)
  const PLANE_W = 400, PLANE_H = 1000;
  const ASPECT = PLANE_W / PLANE_H;

  /* ---------- geometry (quad.ts from the spec) ---------- */
  const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
  const inOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const lerpQuad = (a, b, t) => a.map((p, i) => ({ x: p.x + (b[i].x - p.x) * t, y: p.y + (b[i].y - p.y) * t }));
  const scaleQuad = (q, c, s) => q.map((p) => ({ x: c.x + (p.x - c.x) * s, y: c.y + (p.y - c.y) * s }));
  const rectQuad = (cx, cy, w, h) => [
    { x: cx - w / 2, y: cy - h / 2 }, { x: cx + w / 2, y: cy - h / 2 },
    { x: cx + w / 2, y: cy + h / 2 }, { x: cx - w / 2, y: cy + h / 2 },
  ];
  function quadToMatrix3d(w, h, q) {
    const [p0, p1, p2, p3] = q;
    const dx1 = p1.x - p2.x, dy1 = p1.y - p2.y, dx2 = p3.x - p2.x, dy2 = p3.y - p2.y;
    const sx = p0.x - p1.x + p2.x - p3.x, sy = p0.y - p1.y + p2.y - p3.y;
    const det = dx1 * dy2 - dx2 * dy1;
    const g = (sx * dy2 - dx2 * sy) / det, k = (dx1 * sy - sx * dy1) / det;
    const a = p1.x - p0.x + g * p1.x, b = p3.x - p0.x + k * p3.x;
    const d = p1.y - p0.y + g * p1.y, e = p3.y - p0.y + k * p3.y;
    const m = [a / w, d / w, 0, g / w, b / h, e / h, 0, k / h, 0, 0, 1, 0, p0.x, p0.y, 0, 1];
    return `matrix3d(${m.map((v) => +v.toFixed(8)).join(",")})`;
  }

  /* ---------- the scene: the building's front at dusk / night ---------- */
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  function buildScene() {
    let s = `<defs>
      <linearGradient id="eSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" style="stop-color:var(--sky-1)"/><stop offset=".62" style="stop-color:var(--sky-2)"/><stop offset="1" style="stop-color:var(--sky-3)"/>
      </linearGradient>
      <linearGradient id="eGlass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#cfe6ff" stop-opacity=".38"/><stop offset=".55" stop-color="#9fc2e6" stop-opacity=".16"/><stop offset="1" stop-color="#ffffff" stop-opacity=".3"/>
      </linearGradient>
      <radialGradient id="eInterior" cx=".5" cy=".35" r=".75">
        <stop offset="0" style="stop-color:var(--interior-1)"/><stop offset="1" style="stop-color:var(--interior-2)"/>
      </radialGradient>
      <radialGradient id="eGlow"><stop offset="0" stop-color="#ffd58a" stop-opacity=".75"/><stop offset="1" stop-color="#ffd58a" stop-opacity="0"/></radialGradient>
      <linearGradient id="eBrass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c9a463"/><stop offset=".45" stop-color="#f0d9a2"/><stop offset="1" stop-color="#b08a4f"/></linearGradient>
    </defs>
    <rect width="${VB_W}" height="${VB_H}" fill="url(#eSky)"/>`;
    // stars
    for (let i = 0; i < 70; i++) s += `<circle cx="${(rnd() * VB_W).toFixed(0)}" cy="${(rnd() * 380).toFixed(0)}" r="${(0.8 + rnd() * 1.4).toFixed(1)}" fill="#fff" style="opacity:calc(var(--lamp) * ${(0.3 + rnd() * 0.6).toFixed(2)})"/>`;
    // distant skyline
    for (let x = -20; x < VB_W + 20;) {
      const w = 50 + Math.floor(rnd() * 80), h = 140 + Math.floor(rnd() * 260), y = 960 - h;
      s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:var(--far)"/>`;
      for (let wy = y + 14; wy < 900; wy += 22) for (let wx = x + 8; wx < x + w - 10; wx += 15) if (rnd() > 0.72) s += `<rect class="fw" x="${wx}" y="${wy}" width="6" height="9"/>`;
      x += w + 3;
    }
    // the building
    s += `<rect x="415" y="58" width="770" height="24" style="fill:var(--facade-2)"/>
      <rect x="430" y="80" width="740" height="880" style="fill:var(--facade)"/>`;
    for (let k = 0; k <= 10; k++) s += `<rect x="${430 + k * 73}" y="82" width="7" height="300" style="fill:var(--pier)"/>`;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 10; c++) {
      s += `<rect class="w${rnd() > 0.5 ? " on" : ""}" x="${447 + c * 73}" y="${104 + r * 66}" width="44" height="40" rx="2"/>`;
    }
    for (let r = 0; r < 6; r++) for (let c = 0; c < 10; c++) {
      const x = 447 + c * 73;
      if (x > 590 && x < 980) continue;
      s += `<rect class="w${rnd() > 0.55 ? " on" : ""}" x="${x}" y="${432 + r * 74}" width="44" height="48" rx="2"/>`;
    }
    // name sign + canopy
    s += `<rect x="640" y="334" width="320" height="38" rx="3" fill="url(#eBrass)"/>
      <text x="800" y="360" text-anchor="middle" font-family="Oswald, Arial Narrow, sans-serif" font-weight="600" font-size="19" letter-spacing="6" fill="#3e2c12">${D.name.toUpperCase()}</text>
      <polygon points="590,388 1010,388 1032,410 568,410" style="fill:var(--canopy)"/>
      <rect x="600" y="410" width="400" height="3" fill="#ffd9a0" style="opacity:calc(.3 + var(--lamp) * .6)"/>`;
    // doorway: recess, warm interior, side panel, the glass door, light spill
    const dp = DOOR.map((p) => p.join(",")).join(" ");
    s += `<rect x="650" y="412" width="300" height="490" style="fill:var(--recess)"/>
      <rect x="660" y="424" width="280" height="476" fill="url(#eInterior)" style="opacity:calc(.35 + var(--lamp) * .55)"/>
      <rect x="884" y="432" width="56" height="468" fill="url(#eGlass)" stroke="rgba(0,0,0,.35)" stroke-width="3"/>
      <polygon points="${dp}" fill="url(#eGlass)" stroke="rgba(255,255,255,.4)" stroke-width="3"/>
      <polygon points="735,898 872,882 990,958 600,972" fill="#ffcf86" style="opacity:calc(var(--lamp) * .28)"/>
      <rect x="600" y="902" width="400" height="26" style="fill:var(--step)"/>
      <rect x="560" y="928" width="480" height="32" style="fill:var(--step);filter:brightness(.88)"/>
      <rect x="0" y="958" width="${VB_W}" height="42" style="fill:var(--street)"/>`;
    // street lamps
    [520, 1080].forEach((x) => {
      s += `<circle cx="${x}" cy="708" r="130" fill="url(#eGlow)" style="opacity:var(--lamp)"/>
        <rect x="${x - 4}" y="700" width="8" height="258" fill="#1b1b1f"/>
        <rect x="${x - 18}" y="690" width="36" height="14" rx="4" fill="#1b1b1f"/>
        <circle cx="${x}" cy="710" r="7" fill="#ffe3a8" style="opacity:calc(.35 + var(--lamp) * .65)"/>`;
    });
    $("#entSvg").innerHTML = s;
  }

  /* ---------- copy ---------- */
  function words(text) {
    return text.split(" ").map((w) => `<span class="wd" data-word>${w.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</span>`).join(" ");
  }
  function renderCopy() {
    $("#entBadge").textContent = E.badge;
    const h1 = $("#entH1");
    h1.setAttribute("aria-label", E.headline.join(" "));
    h1.innerHTML = E.headline.map((l) => `<span class="ln" aria-hidden="true">${words(l)}</span>`).join("");
    $("#entLead").textContent = E.lead;
    $("#entEnter").textContent = E.primary;
    const labs = $("#entLabs");
    labs.textContent = E.secondary;
    labs.dataset.go = "projects"; // app.js's elevator handles [data-go]
    $("#entDoorName").innerHTML = E.doorText.map((t) => `<b>${t}</b>`).join("");
    $(".ent-pre-word").textContent = D.name.toUpperCase();
  }

  /* ---------- per-frame portal ---------- */
  const state = { scale: reduced ? 1 : 0, face: reduced ? 1 : 0, flash: 0, p: 0 };
  const media = $("#entMedia"), over = $("#entOver"), scene = $("#entScene");
  const light = $("#entLight"), portal = $("#entPortal"), copy = $("#entCopy"), fade = $("#entFade");
  const rim = $(".rim", portal), fill = $(".fill", portal);
  let dirty = true, last = "";
  new ResizeObserver(() => (dirty = true)).observe(media);

  function unit(W, H) {
    return W >= 1024 ? Math.min(W / 1440, H / 760) : Math.min(W / 415, H / 760);
  }
  function render() {
    const key = `${state.scale.toFixed(4)}|${state.face.toFixed(3)}|${state.flash.toFixed(3)}|${state.p.toFixed(4)}`;
    if (!dirty && key === last) return;
    dirty = false; last = key;
    const W = media.clientWidth, H = media.clientHeight;
    if (!W || !H) return;
    const p = state.p;
    media.style.transform = over.style.transform = `scale(${state.scale})`;

    // where the door sits on screen (the SVG is "slice"-fitted)
    const s = Math.max(W / VB_W, H / VB_H), ox = (W - VB_W * s) / 2, oy = (H - VB_H * s) / 2;
    const base = DOOR.map(([x, y]) => ({ x: ox + x * s, y: oy + y * s }));
    const c = { x: base.reduce((a, q) => a + q.x, 0) / 4, y: base.reduce((a, q) => a + q.y, 0) / 4 };

    if (reduced) {
      scene.style.transform = "";
      light.style.transform = portal.style.transform = quadToMatrix3d(PLANE_W, PLANE_H, base);
      light.style.opacity = 1;
      rim.style.opacity = fill.style.opacity = 0;
      fade.style.opacity = seg(p, 0.3, 0.6);
    } else {
      const d = 1 + DOLLY * inOut(seg(p, 0, 0.7));
      scene.style.transformOrigin = `${c.x}px ${c.y}px`;
      scene.style.transform = `scale(${d})`;
      const inScene = scaleQuad(base, c, d);
      const h = ((inScene[3].y - inScene[0].y + inScene[2].y - inScene[1].y) / 2) * 1.06;
      const turned = lerpQuad(inScene, rectQuad(c.x, c.y, h * ASPECT, h), inOut(seg(p, 0, 0.45)));
      const coverH = Math.max(H, W / ASPECT) * 1.2;
      const cover = rectQuad(W / 2, H / 2, coverH * ASPECT, coverH);
      const quad = lerpQuad(turned, cover, Math.pow(seg(p, 0.5, 0.82), 3));
      light.style.transform = portal.style.transform = quadToMatrix3d(PLANE_W, PLANE_H, quad);
      light.style.opacity = state.face * (1 - seg(p, 0.15, 0.4));
      const gone = 1 - seg(p, 0.97, 0.99); // once the fade covers it, switch the light off (no hairline at the seam)
      rim.style.opacity = Math.max(state.flash, seg(p, 0.1, 0.4)) * gone;
      fill.style.opacity = seg(p, 0.35, 0.62) * gone;
      fade.style.opacity = seg(p, 0.84, 0.98); // white light settles into the lobby's wall colour
      copy.style.transform = `translateY(${(-120 * seg(p, 0.2, 0.8) * unit(W, H)).toFixed(2)}px)`;
      media.style.visibility = p > 0.9 ? "hidden" : "";
    }
    document.body.classList.toggle("outside", p < 0.9);
  }
  (function loop() { render(); requestAnimationFrame(loop); })();
  document.addEventListener("click", (e) => { if (e.target.closest("#themeToggle")) dirty = true; });

  /* ---------- M3 · scroll-pinned transition ---------- */
  const proxy = { p: 0 };
  let st = null;
  function setupScroll() {
    const tween = gsap.to(proxy, {
      p: 1, ease: "none",
      onUpdate: () => (state.p = proxy.p),
      scrollTrigger: {
        trigger: section, start: "top top", end: () => "+=" + innerHeight * SCROLL_SCREENS,
        pin: true, scrub: reduced ? true : 0.6, invalidateOnRefresh: true,
      },
    });
    st = tween.scrollTrigger;
    if (window.lenis) window.lenis.on("scroll", ScrollTrigger.update);
  }
  $("#entEnter").addEventListener("click", () => {
    if (!st) return;
    const y = st.end + 2;
    if (window.lenis) window.lenis.scrollTo(y, { duration: 2.4, easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) });
    else window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });
  });

  /* ---------- M1 · loading + intro ---------- */
  function lock() {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    html.setAttribute("data-locked", "");
    if (window.lenis) { window.lenis.scrollTo(0, { immediate: true, force: true }); window.lenis.stop(); }
  }
  function unlock() {
    html.removeAttribute("data-locked");
    if (window.lenis) window.lenis.start();
    ScrollTrigger.refresh();
  }

  const countEl = $("#entCount");
  const cnt = { v: 0 };
  const showCount = () => (countEl.textContent = String(Math.round(cnt.v)).padStart(2, "0"));
  const follow = gsap.quickTo(cnt, "v", { duration: 0.4, ease: "power1.out", onUpdate: showCount });
  let shown = 0;
  function track(promises) {
    let done = 0;
    const total = promises.length;
    return Promise.all(promises.map((pr) => Promise.resolve(pr).catch((e) => console.warn(e)).then(() => {
      done++;
      shown = Math.max(shown, (done / total) * 90);
      follow(shown);
    })));
  }
  const fonts = document.fonts
    ? ['600 1em "Oswald"', '400 1em "Space Grotesk"', '600 1em "Space Grotesk"', '500 1em "JetBrains Mono"', '700 1em "Caveat"'].map((f) => document.fonts.load(f))
    : [];
  const loaded = document.readyState === "complete" ? Promise.resolve() : new Promise((r) => addEventListener("load", r, { once: true }));

  function blurIn(tl, target, at, from) {
    tl.fromTo(target, { opacity: 0, filter: `blur(${from || 10}px)` },
      { opacity: 1, filter: "blur(0px)", duration: 0.6, ease: "power2.out", clearProps: "filter" }, at);
  }
  function intro() {
    gsap.killTweensOf(cnt);
    const wordsEls = section.querySelectorAll(".ent-h1 [data-word]");
    if (reduced) {
      const tl = gsap.timeline({ onComplete: unlock });
      tl.to("[data-pre]", { opacity: 0, duration: 0.2 }, 0)
        .fromTo([media, over, "[data-intro]"], { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power1.out" }, 0);
      return;
    }
    const tl = gsap.timeline();
    tl.to(cnt, { v: 100, duration: 0.5, ease: "power1.out", onUpdate: showCount }, 0)
      .to(".ent-pre-count", { opacity: 0, duration: 0.15, ease: "power1.in" }, 0.5)
      .to(state, { scale: 1, duration: 0.85, ease: "power2.out" }, 0.6)
      .to(".ent-pre-word", { opacity: 0, duration: 0.4, ease: "power1.out" }, 0.7)
      .to(state, { keyframes: { face: [0, 0.8, 0.15, 1, 0.55, 1] }, duration: 0.45, ease: "none" }, 1.05)
      .to(state, { keyframes: { flash: [0, 1, 0] }, duration: 0.7, ease: "power1.out" }, 1.05);
    blurIn(tl, "[data-intro='badge']", 1.1);
    tl.set("[data-intro='h1']", { opacity: 1 }, 1.25)
      .fromTo(wordsEls, { opacity: 0, filter: "blur(12px)", yPercent: 25 },
        { opacity: 1, filter: "blur(0px)", yPercent: 0, duration: 0.7, ease: "power2.out", stagger: 0.09, clearProps: "filter,transform" }, 1.25);
    blurIn(tl, "[data-intro='btns']", 1.55);
    blurIn(tl, "[data-intro='lead']", 1.85);
    tl.call(unlock, null, 2.3);
  }

  buildScene();
  renderCopy();
  lock();
  setupScroll();
  track([...fonts, loaded]).then(intro);
})();
