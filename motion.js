/* =============================================================
   MOTION — makes the building feel fluid:
   smooth inertial scroll, parallax depth, velocity-driven springs
   (swinging badges, fluttering notes), elevator shaft car,
   pointer ring, magnetic buttons, tilting letterboard.
   Everything is off under prefers-reduced-motion.
   ============================================================= */
(function () {
  "use strict";
  const reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;
  const fine = window.matchMedia && matchMedia("(pointer: fine)").matches;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ---------- Smooth inertial scroll ---------- */
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
    window.lenis = lenis;
  }

  /* ---------- Parallax depth (uses the `translate` property so it composes with existing transforms) ---------- */
  const PARALLAX = [
    [".letterboard-wrap", 0.14], [".directory", -0.08], [".floor-sign", 0.1], [".paper", 0.05],
    [".stickies", -0.05], [".rail", 0.06], [".plaque", 0.06], [".site-board", 0.12], [".hall-lead", 0.1],
    [".mb-wall", 0.05], [".billboard", 0.1], [".orb", 0.35], [".stars", 0.18], [".chest-top", -0.04],
  ];
  const layers = [];
  PARALLAX.forEach(([sel, speed]) => $$(sel).forEach((el) => layers.push({ el, speed, y: 0 })));

  /* ---------- Velocity springs ---------- */
  const badges = $$(".badge-hang").map((el) => ({ el, a: 0, v: 0 }));
  const stickies = $$(".sticky").map((el, i) => ({ el, a: 0, sign: i % 2 ? 1 : -1, k: 0.6 + (i % 3) * 0.25 }));
  const tickets = $$(".ticket").map((el, i) => ({ el, x: 0, sign: i % 2 ? 1 : -1 }));
  const awnings = $$(".awning");
  const lanterns = $$(".room-plate");

  /* ---------- Elevator shaft with a car ---------- */
  const shaft = document.createElement("div");
  shaft.className = "shaft";
  shaft.setAttribute("aria-hidden", "true");
  shaft.innerHTML = `<div class="shaft-track"></div><div class="shaft-car"><i></i></div>`;
  document.body.appendChild(shaft);
  const car = $(".shaft-car", shaft);
  const floors = $$("main .floor");
  function buildTicks() {
    $$(".shaft-tick", shaft).forEach((t) => t.remove());
    const max = document.documentElement.scrollHeight - innerHeight;
    floors.forEach((f) => {
      const t = document.createElement("span");
      t.className = "shaft-tick";
      t.textContent = f.dataset.floor;
      const inv = 1 - clamp(f.offsetTop / max, 0, 1);
      t.style.top = `calc(${inv * 100}% - ${inv * 26}px + 13px)`;
      shaft.appendChild(t);
    });
  }
  let carP = 0;

  /* ---------- Pointer ring + magnetic buttons + letterboard tilt ---------- */
  const mouse = { x: innerWidth / 2, y: innerHeight / 2, nx: 0, ny: 0 };
  let ring = null;
  const ringPos = { x: mouse.x, y: mouse.y, s: 1 };
  let hovering = false, pressing = false;
  if (fine) {
    ring = document.createElement("div");
    ring.className = "cursor-ring";
    document.body.appendChild(ring);
    addEventListener("pointermove", (e) => {
      mouse.x = e.clientX; mouse.y = e.clientY;
      mouse.nx = e.clientX / innerWidth - 0.5; mouse.ny = e.clientY / innerHeight - 0.5;
      hovering = !!e.target.closest("a, button, [role='button'], .doorway, .mbox, input, textarea, select, .sticky");
      ring.classList.add("on");
    }, { passive: true });
    document.addEventListener("pointerleave", () => ring.classList.remove("on"));
    addEventListener("pointerdown", () => (pressing = true));
    addEventListener("pointerup", () => (pressing = false));
  }
  const magnets = fine ? $$(".el-btn, .call-btn, .post-btn, .hall-btn, .breaker-sw, .nameplate, .light-switch").map((el) => ({ el, x: 0, y: 0 })) : [];
  const board = $(".letterboard-wrap");
  const tilt = { x: 0, y: 0 };

  /* ---------- One frame loop for everything ---------- */
  let lastY = scrollY, vel = 0;
  function frame(time) {
    requestAnimationFrame(frame);
    if (lenis) lenis.raf(time);
    try { effects(); } catch (e) { /* never let a visual effect break scrolling */ }
  }
  function effects() {
    const y = lenis ? lenis.animatedScroll : scrollY;
    const raw = lenis ? lenis.velocity : y - lastY;
    lastY = y;
    vel = lerp(vel, clamp(raw, -80, 80), 0.15);
    const vh = innerHeight, mid = vh / 2;

    // parallax
    for (const l of layers) {
      const r = l.el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      const target = clamp((r.top + r.height / 2 - mid) * l.speed, -90, 90);
      l.y = lerp(l.y, target, 0.2);
      l.el.style.translate = `0 ${l.y.toFixed(1)}px`;
    }
    // badges swing on their lanyards (damped spring pushed by scroll velocity)
    for (const b of badges) {
      b.v += -0.045 * b.a - 0.09 * b.v + vel * 0.018;
      b.a = clamp(b.a + b.v, -16, 16);
      b.el.style.rotate = `${b.a.toFixed(2)}deg`;
    }
    for (const s of stickies) {
      s.a = lerp(s.a, clamp(vel * 0.12 * s.sign * s.k, -7, 7), 0.12);
      s.el.style.rotate = `${s.a.toFixed(2)}deg`;
    }
    for (const t of tickets) {
      t.x = lerp(t.x, clamp(vel * 0.5 * t.sign, -24, 24), 0.1);
      t.el.style.translate = `${t.x.toFixed(1)}px 0`;
    }
    const flap = 1 + clamp(Math.abs(vel) * 0.012, 0, 0.45);
    for (const a of awnings) a.style.scale = `1 ${flap.toFixed(3)}`;
    for (const p of lanterns) p.style.rotate = `${clamp(vel * 0.06, -5, 5).toFixed(2)}deg`;

    // shaft car rides with the page
    const max = document.documentElement.scrollHeight - vh;
    carP = lerp(carP, max > 0 ? y / max : 0, 0.18);
    car.style.top = `calc(${(1 - carP) * 100}% - ${(1 - carP) * 26}px)`;
    shaft.classList.toggle("moving", Math.abs(vel) > 0.6);

    // pointer ring
    if (ring) {
      ringPos.x = lerp(ringPos.x, mouse.x, 0.2);
      ringPos.y = lerp(ringPos.y, mouse.y, 0.2);
      ringPos.s = lerp(ringPos.s, pressing ? 0.7 : hovering ? 1.9 : 1, 0.18);
      ring.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px) translate(-50%, -50%) scale(${ringPos.s.toFixed(3)})`;
      ring.classList.toggle("hover", hovering);
    }
    // magnetic buttons
    for (const m of magnets) {
      const r = m.el.getBoundingClientRect();
      const dx = mouse.x - (r.left + r.width / 2), dy = mouse.y - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy), reach = Math.max(r.width, r.height) * 1.1;
      const pull = d < reach ? (1 - d / reach) * 0.35 : 0;
      m.x = lerp(m.x, dx * pull, 0.2); m.y = lerp(m.y, dy * pull, 0.2);
      m.el.style.translate = `${m.x.toFixed(1)}px ${m.y.toFixed(1)}px`;
    }
    // letterboard leans toward the pointer
    if (board && fine) {
      tilt.x = lerp(tilt.x, -mouse.ny * 8, 0.08);
      tilt.y = lerp(tilt.y, mouse.nx * 10, 0.08);
      board.style.transform = `perspective(1200px) rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg)`;
    }
  }

  // Elevator panel sits in the shaft's way on the right; keep magnets and ticks fresh on layout changes
  let tickTimer = 0;
  const queueTicks = () => { clearTimeout(tickTimer); tickTimer = setTimeout(buildTicks, 150); };
  addEventListener("load", buildTicks);
  new ResizeObserver(queueTicks).observe(document.body);
  buildTicks();
  requestAnimationFrame(frame);
})();
