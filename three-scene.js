/* =============================================================
   3D scenes (Three.js r128, global THREE)
   Scenes.create(canvas, type, { onStatus, interactive })
     type: "hero" | "mountains" | "hash" | "chunks" | "motor"
   returns { start, stop, dispose, setTheme }
   ============================================================= */
(function () {
  "use strict";
  if (!window.THREE) { window.Scenes = null; return; }
  const T = THREE;
  const reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SPEED = reduced ? 0.25 : 1;

  function css(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#888";
  }
  function theme() {
    return {
      dark: document.documentElement.getAttribute("data-theme") === "dark",
      accent: css("--accent"), accent2: css("--accent-2"), text: css("--text"),
      muted: css("--muted"), line: css("--line"), surface: css("--surface"), danger: css("--danger"),
    };
  }
  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const rand = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

  /* ---------- Base: renderer, sizing, loop, theming, disposal ---------- */
  function base(canvas, fov) {
    const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(fov || 40, 1, 0.1, 200);
    const painted = []; // { obj, prop, role } — recolored on theme change
    const ctx = { renderer, scene, camera, t: 0, update: null, running: false, raf: 0 };

    ctx.paint = function (obj, role, prop) {
      painted.push({ obj, role, prop: prop || "color" });
      const th = theme();
      obj[prop || "color"].set(typeof role === "function" ? role(th) : th[role]);
      return obj;
    };
    ctx.setTheme = function () {
      const th = theme();
      painted.forEach((p) => p.obj[p.prop].set(typeof p.role === "function" ? p.role(th) : th[p.role]));
      if (ctx.onTheme) ctx.onTheme(th);
    };
    function resize() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // keep the subject framed in tall/narrow viewports
      camera.zoom = ctx.noFit ? 1 : Math.min(1, camera.aspect / 1.4);
      camera.updateProjectionMatrix();
      if (ctx.onResize) ctx.onResize(w, h);
      if (!ctx.running) renderer.render(scene, camera);
    }
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    let last = 0;
    function frame(now) {
      if (!ctx.running) return;
      const dt = Math.min(0.05, (now - (last || now)) / 1000) * SPEED;
      last = now;
      ctx.t += dt;
      if (ctx.update) ctx.update(ctx.t, dt);
      renderer.render(scene, camera);
      ctx.raf = requestAnimationFrame(frame);
    }
    ctx.start = function () { if (ctx.running) return; ctx.running = true; last = 0; ctx.raf = requestAnimationFrame(frame); };
    ctx.stop = function () { ctx.running = false; cancelAnimationFrame(ctx.raf); };
    ctx.dispose = function () {
      ctx.stop(); ro.disconnect();
      if (ctx.onDispose) ctx.onDispose();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
      });
      renderer.dispose();
      renderer.forceContextLoss();
    };
    ctx.lights = function () {
      const hemi = new T.HemisphereLight(0xffffff, 0x444466, 0.85);
      const dir = new T.DirectionalLight(0xffffff, 0.85);
      dir.position.set(5, 9, 4);
      scene.add(hemi, dir);
      ctx.onTheme = ((prev) => (th) => { hemi.intensity = th.dark ? 0.75 : 0.95; prev && prev(th); })(ctx.onTheme);
    };
    ctx.render = () => renderer.render(scene, camera);
    return ctx;
  }

  /* ---------- Hero: interactive particle wave ---------- */
  function hero(canvas) {
    const c = base(canvas, 50);
    const COLS = window.innerWidth < 700 ? 70 : 120, ROWS = 56, GAP = 0.36;
    const n = COLS * ROWS;
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = ((i % COLS) - COLS / 2) * GAP;
      pos[i * 3 + 2] = (Math.floor(i / COLS) - ROWS / 2) * GAP;
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.BufferAttribute(pos, 3));
    geo.setAttribute("color", new T.BufferAttribute(col, 3));
    const mat = new T.PointsMaterial({ size: 0.075, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false });
    const pts = new T.Points(geo, mat);
    c.scene.add(pts);

    const ico = new T.Mesh(new T.IcosahedronGeometry(3.2, 1), new T.MeshBasicMaterial({ wireframe: true, transparent: true, opacity: 0.18 }));
    ico.position.set(0, 4.5, -8);
    c.paint(ico.material, "accent");
    c.scene.add(ico);

    function recolor(th) {
      const a = new T.Color(th.accent), b = new T.Color(th.accent2), tmp = new T.Color();
      for (let i = 0; i < n; i++) {
        tmp.copy(a).lerp(b, (i % COLS) / COLS);
        col.set([tmp.r, tmp.g, tmp.b], i * 3);
      }
      geo.attributes.color.needsUpdate = true;
      mat.opacity = th.dark ? 0.9 : 0.75;
    }
    c.onTheme = recolor;
    recolor(theme());

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const ray = new T.Raycaster(), plane = new T.Plane(new T.Vector3(0, 1, 0), 0), hit = new T.Vector3(0, 0, 0), mv = new T.Vector2();
    let hasHit = false;
    function onMove(e) {
      const r = canvas.getBoundingClientRect();
      mouse.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.ty = -(((e.clientY - r.top) / r.height) * 2 - 1);
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    c.onDispose = () => window.removeEventListener("pointermove", onMove);

    c.camera.position.set(0, 4, 13);
    c.update = (t) => {
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      c.camera.position.x = mouse.x * 2.2;
      c.camera.position.y = 4 + mouse.y * 1.2;
      c.camera.lookAt(0, 0, 0);
      mv.set(mouse.x, mouse.y);
      ray.setFromCamera(mv, c.camera);
      hasHit = !!ray.ray.intersectPlane(plane, hit);
      for (let i = 0; i < n; i++) {
        const x = pos[i * 3], z = pos[i * 3 + 2];
        let y = Math.sin(x * 0.32 + t * 0.9) * 0.55 + Math.cos(z * 0.42 + t * 0.7) * 0.5;
        if (hasHit) {
          const dx = x - hit.x, dz = z - hit.z, d2 = dx * dx + dz * dz;
          y += Math.exp(-d2 / 5) * 1.6 * Math.cos(Math.sqrt(d2) * 1.4 - t * 4);
        }
        pos[i * 3 + 1] = y;
      }
      geo.attributes.position.needsUpdate = true;
      ico.rotation.x = t * 0.08; ico.rotation.y = t * 0.12;
    };
    if (reduced) { c.update(0, 0); }
    return c;
  }

  /* ---------- Trekblazer: low-poly terrain + live trek route ---------- */
  function mountains(canvas, opts) {
    const c = base(canvas, 38);
    c.lights();
    const h = (x, z) =>
      2.3 * Math.exp(-((x - 0.6) ** 2 + (z + 0.4) ** 2) / 4.5) +
      1.3 * Math.exp(-((x + 2.6) ** 2 + (z - 1.6) ** 2) / 3) +
      0.35 * Math.sin(x * 1.3 + z * 0.7) + 0.25 * Math.cos(z * 1.7 - x * 0.4);

    const geo = new T.PlaneGeometry(11, 11, 44, 44);
    geo.rotateX(-Math.PI / 2);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) p.setY(i, h(p.getX(i), p.getZ(i)));
    geo.computeVertexNormals();
    // height-based vertex colours: valley (teal) → slopes (accent) → snow (white)
    const vcol = new Float32Array(p.count * 3);
    geo.setAttribute("color", new T.BufferAttribute(vcol, 3));
    function colorTerrain(th) {
      const lo = new T.Color(th.accent2).multiplyScalar(th.dark ? 0.55 : 0.8), mid = new T.Color(th.accent), hi = new T.Color("#ffffff"), tmp = new T.Color();
      for (let i = 0; i < p.count; i++) {
        const y = p.getY(i);
        if (y < 0.9) tmp.copy(lo).lerp(mid, smooth(-0.6, 0.9, y));
        else tmp.copy(mid).lerp(hi, smooth(1.4, 2.2, y));
        vcol.set([tmp.r, tmp.g, tmp.b], i * 3);
      }
      geo.attributes.color.needsUpdate = true;
    }
    colorTerrain(theme());
    c.onTheme = colorTerrain;
    const land = new T.Mesh(geo, new T.MeshStandardMaterial({ flatShading: true, roughness: 0.9, metalness: 0, vertexColors: true }));
    const wire = new T.Mesh(geo, new T.MeshBasicMaterial({ wireframe: true, transparent: true, opacity: 0.1, color: 0x000000 }));
    const world = new T.Group();
    world.add(land, wire);

    // trek route
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const s = i / 24, x = -4.6 + 9.2 * s, z = 2.2 * Math.sin(s * Math.PI * 1.6) - 0.6;
      pts.push(new T.Vector3(x, h(x, z) + 0.08, z));
    }
    const curve = new T.CatmullRomCurve3(pts);
    const route = new T.Mesh(new T.TubeGeometry(curve, 220, 0.05, 6), c.paint(new T.MeshBasicMaterial(), "accent2"));
    world.add(route);

    // camps (booking stops)
    const camps = [0.18, 0.5, 0.82].map((s) => {
      const q = curve.getPointAt(s);
      const g = new T.Group();
      const pole = new T.Mesh(new T.CylinderGeometry(0.025, 0.025, 0.7, 6), c.paint(new T.MeshBasicMaterial(), "text"));
      pole.position.y = 0.35;
      const flag = new T.Mesh(new T.ConeGeometry(0.16, 0.34, 3), c.paint(new T.MeshStandardMaterial({ flatShading: true }), "accent2"));
      flag.rotation.z = -Math.PI / 2; flag.position.set(0.16, 0.58, 0);
      g.add(pole, flag); g.position.copy(q);
      world.add(g);
      return g;
    });
    const hiker = new T.Mesh(new T.SphereGeometry(0.14, 16, 12), c.paint(new T.MeshBasicMaterial(), "text"));
    const halo = new T.Mesh(new T.RingGeometry(0.2, 0.28, 32), new T.MeshBasicMaterial({ transparent: true, opacity: 0.7, side: T.DoubleSide }));
    c.paint(halo.material, "accent2");
    halo.rotation.x = -Math.PI / 2;
    world.add(hiker, halo);
    c.scene.add(world);

    let lastStage = -1;
    c.update = (t) => {
      const s = (t * 0.07) % 1;
      const q = curve.getPointAt(s);
      hiker.position.copy(q).y += 0.14;
      halo.position.copy(q).y += 0.02;
      halo.scale.setScalar(1 + 0.4 * Math.sin(t * 5));
      camps.forEach((g, i) => { g.rotation.y = Math.sin(t * 2 + i) * 0.2; });
      const a = t * 0.12 + 0.6;
      c.camera.position.set(Math.sin(a) * 13, 8.5, Math.cos(a) * 13);
      c.camera.lookAt(0, 0.3, 0);
      const stage = s < 0.18 ? 0 : s < 0.5 ? 1 : s < 0.82 ? 2 : 3;
      if (opts.onStatus && stage !== lastStage) {
        lastStage = stage;
        opts.onStatus(["trek · leaving base", "trek · reached camp 1", "trek · reached camp 2", "trek · reached summit camp"][stage]);
      }
    };
    c.update(0.01, 0);
    return c;
  }

  /* ---------- RootMinus7: input stream → hash function → scattered digest ---------- */
  function hash(canvas, opts) {
    const c = base(canvas, 40);
    c.lights();
    const N = 900;
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.BufferAttribute(pos, 3));
    geo.setAttribute("color", new T.BufferAttribute(col, 3));
    const mat = new T.PointsMaterial({ size: 0.09, vertexColors: true, transparent: true, depthWrite: false });
    c.scene.add(new T.Points(geo, mat));

    const knot = new T.Mesh(new T.TorusKnotGeometry(1.05, 0.28, 140, 14, 2, 3), new T.MeshBasicMaterial({ wireframe: true, transparent: true, opacity: 0.55 }));
    c.paint(knot.material, "accent");
    const core = new T.Mesh(new T.IcosahedronGeometry(0.5, 0), c.paint(new T.MeshStandardMaterial({ flatShading: true, emissiveIntensity: 0.4 }), "accent2"));
    c.paint(core.material, "accent2", "emissive");
    c.scene.add(knot, core);

    // digest "bits" — a grid of small cubes flickering on the right
    const bits = new T.InstancedMesh(new T.BoxGeometry(0.16, 0.16, 0.16), new T.MeshStandardMaterial({ flatShading: true }), 64);
    c.paint(bits.material, "accent2");
    const m4 = new T.Matrix4();
    c.scene.add(bits);

    const A = new T.Color(), B = new T.Color(), tmp = new T.Color();
    c.onTheme = (th) => { A.set(th.muted); B.set(th.accent2); mat.opacity = th.dark ? 0.95 : 0.85; };
    c.onTheme(theme());

    c.camera.position.set(0, 1.4, 11);
    let lastDigest = 0;
    c.update = (t) => {
      for (let i = 0; i < N; i++) {
        const s = (rand(i) + t * 0.09) % 1;
        const x = -7 + 14 * s;
        const lane = (i % 12) - 5.5;
        const oy = lane * 0.11, oz = 0;
        const sy = (rand(i + 7.3) - 0.5) * 5.2, sz = (rand(i + 2.1) - 0.5) * 4;
        const f = smooth(-0.6, 2.5, x);
        // swirl as it passes the function
        const swirl = Math.exp(-x * x / 1.2) * 1.2;
        const ang = t * 3 + i;
        pos[i * 3] = x;
        pos[i * 3 + 1] = oy + (sy - oy) * f + Math.sin(ang) * swirl;
        pos[i * 3 + 2] = oz + (sz - oz) * f + Math.cos(ang) * swirl;
        tmp.copy(A).lerp(B, f);
        col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;
      knot.rotation.x = t * 0.6; knot.rotation.y = t * 0.9;
      core.rotation.y = -t * 1.4;
      core.scale.setScalar(1 + 0.15 * Math.sin(t * 6));
      const tick = Math.floor(t * 6);
      for (let k = 0; k < 64; k++) {
        const on = rand(k * 13 + tick) > 0.5;
        m4.makeScale(on ? 1 : 0.35, on ? 1 : 0.35, on ? 1 : 0.35);
        m4.setPosition(4.6 + (k % 8) * 0.22 - 0.77, 2.6 - Math.floor(k / 8) * 0.22 - 0.4, -0.5);
        bits.setMatrixAt(k, m4);
      }
      bits.instanceMatrix.needsUpdate = true;
      bits.position.y = -1.1;
      if (opts.onStatus && tick !== lastDigest && tick % 3 === 0) {
        lastDigest = tick;
        let hex = "";
        for (let k = 0; k < 16; k++) hex += "0123456789abcdef"[Math.floor(rand(tick * 31 + k) * 16)];
        opts.onStatus("H(x) → " + hex + "…");
      }
    };
    c.update(0.01, 0);
    return c;
  }

  /* ---------- Infinite World: 3 active chunks recycled in a circle ---------- */
  function chunks(canvas, opts) {
    const c = base(canvas, 40);
    c.lights();
    const W = 4;
    const LAYOUT = [
      [[-1.2, 1.0, 1.2], [0.6, 1.8, 1.0], [1.6, 0.9, 0.7]],
      [[-1.4, 1.5, 0.9], [0.0, 0.8, 1.4], [1.3, 2.0, 0.9]],
      [[-1.0, 0.7, 1.6], [0.8, 1.4, 0.8], [1.5, 2.3, 0.6]],
      [[-1.5, 2.1, 0.8], [-0.2, 1.2, 1.0], [1.2, 0.8, 1.2]],
      [[-0.9, 1.3, 1.0], [0.5, 2.2, 0.9], [1.6, 1.4, 0.6]],
      [[-1.3, 0.9, 1.1], [0.2, 1.7, 1.3], [1.5, 1.0, 0.7]],
    ];
    const hueShift = (th, k) => { const col = new T.Color(th.accent); const hsl = {}; col.getHSL(hsl); col.setHSL((hsl.h + k * 0.07) % 1, hsl.s * 0.85, th.dark ? 0.6 : 0.55); return col; };

    const slots = [0, 1, 2].map((k) => {
      const g = new T.Group();
      const ground = new T.Mesh(new T.BoxGeometry(W * 0.96, 0.5, 1.8), new T.MeshStandardMaterial({ flatShading: true, roughness: 0.8 }));
      ground.position.y = -0.25;
      g.add(ground);
      const plats = [0, 1, 2].map(() => {
        const m = new T.Mesh(new T.BoxGeometry(1, 0.2, 1.2), new T.MeshStandardMaterial({ flatShading: true }));
        g.add(m); return m;
      });
      const coins = [0, 1, 2].map(() => {
        const m = new T.Mesh(new T.CylinderGeometry(0.16, 0.16, 0.05, 20), new T.MeshStandardMaterial({ color: 0xf5c542, metalness: 0.5, roughness: 0.3, emissive: 0x6b4d00, emissiveIntensity: 0.4 }));
        m.rotation.x = Math.PI / 2; g.add(m); return m;
      });
      g.userData = { ground, plats, coins, chunk: k };
      c.scene.add(g);
      return g;
    });
    function configure(g) {
      const th = theme(), L = LAYOUT[g.userData.chunk];
      g.userData.ground.material.color.copy(hueShift(th, g.userData.chunk));
      L.forEach(([x, y, w], i) => {
        const p = g.userData.plats[i];
        p.position.set(x, y, 0); p.scale.x = w;
        p.material.color.copy(hueShift(th, g.userData.chunk)).offsetHSL(0, 0, 0.12);
        g.userData.coins[i].position.set(x, y + 0.45, 0);
      });
    }
    slots.forEach((g, k) => { g.position.x = (k - 1) * W; configure(g); });
    c.onTheme = () => slots.forEach(configure);

    const player = new T.Mesh(new T.BoxGeometry(0.4, 0.4, 0.4), c.paint(new T.MeshStandardMaterial({ flatShading: true }), "accent2"));
    const enemy = new T.Mesh(new T.ConeGeometry(0.25, 0.5, 4), c.paint(new T.MeshStandardMaterial({ flatShading: true }), "danger"));
    c.scene.add(player, enemy);

    c.camera.position.set(0, 3.4, 12);
    c.camera.lookAt(0, 0.9, 0);
    let lastKey = "";
    c.update = (t, dt) => {
      const v = 1.4 * (dt || 0);
      slots.forEach((g) => {
        g.position.x -= v;
        if (g.position.x < -1.5 * W) {
          g.position.x += 3 * W;
          g.userData.chunk = (g.userData.chunk + 3) % 6;
          configure(g);
        }
        const e = Math.max(0, Math.abs(g.position.x) - W);
        g.position.y = -e * e * 0.9;
        g.userData.coins.forEach((m, i) => { m.rotation.z = t * 3 + i; });
      });
      const jump = Math.abs(Math.sin(t * 2.4));
      player.position.set(-0.6, 0.2 + jump * 1.9, 0);
      player.rotation.z = -jump * 0.6;
      enemy.position.set(-2.4 + Math.sin(t * 1.3) * 0.3, 0.25 + Math.abs(Math.sin(t * 4)) * 0.15, 0);
      enemy.rotation.y = t * 3;
      if (opts.onStatus) {
        const ids = slots.slice().sort((a, b) => a.position.x - b.position.x).map((g) => g.userData.chunk + 1);
        const key = ids.join(",");
        if (key !== lastKey) { lastKey = key; opts.onStatus("active chunks [" + ids.join(" · ") + "] of 6"); }
      }
    };
    c.update(0.01, 0);
    return c;
  }

  /* ---------- Motor automation: IR beam → relay → timed restart ---------- */
  function motor(canvas, opts) {
    const c = base(canvas, 38);
    c.lights();
    const GREEN = 0x22c55e, RED = 0xef4444;
    const BEAM_X = 1.6, WAIT = 3.2; // the 10 s wait is compressed to WAIT seconds of animation

    const plate = new T.Mesh(new T.BoxGeometry(9, 0.2, 4.4), c.paint(new T.MeshStandardMaterial({ roughness: 1 }), (th) => (th.dark ? "#1d2030" : "#dfe0ea")));
    plate.position.y = -0.1;
    c.scene.add(plate);

    // conveyor
    const belt = new T.Mesh(new T.BoxGeometry(6.6, 0.12, 1.3), c.paint(new T.MeshStandardMaterial({ roughness: 0.9 }), (th) => (th.dark ? "#2a2e42" : "#b9bccc")));
    belt.position.set(1, 0.62, 0);
    c.scene.add(belt);
    const rollers = [];
    for (let i = 0; i < 8; i++) {
      const r = new T.Mesh(new T.CylinderGeometry(0.16, 0.16, 1.4, 14), c.paint(new T.MeshStandardMaterial({ metalness: 0.6, roughness: 0.4 }), "muted"));
      r.rotation.x = Math.PI / 2; r.position.set(-2 + i * 0.86, 0.42, 0);
      rollers.push(r); c.scene.add(r);
    }
    // stripes on belt so motion is visible
    const stripes = new T.Group();
    for (let i = 0; i < 14; i++) {
      const s = new T.Mesh(new T.BoxGeometry(0.06, 0.02, 1.25), c.paint(new T.MeshBasicMaterial(), "muted"));
      s.position.set(-2.2 + i * 0.5, 0.69, 0); stripes.add(s);
    }
    c.scene.add(stripes);

    // motor + fan on the left end
    const body = new T.Mesh(new T.CylinderGeometry(0.55, 0.55, 1.3, 24), c.paint(new T.MeshStandardMaterial({ metalness: 0.4, roughness: 0.5 }), "accent"));
    body.rotation.z = Math.PI / 2; body.position.set(-3.2, 0.75, -1.2);
    const fan = new T.Group();
    for (let i = 0; i < 3; i++) {
      const b = new T.Mesh(new T.BoxGeometry(0.06, 1.0, 0.22), c.paint(new T.MeshStandardMaterial({ flatShading: true }), "accent2"));
      b.position.y = 0.42; const arm = new T.Group(); arm.add(b); arm.rotation.x = (i * Math.PI * 2) / 3; fan.add(arm);
    }
    fan.position.set(-2.45, 0.75, -1.2);
    c.scene.add(body, fan);

    // relay + LED
    const relay = new T.Mesh(new T.BoxGeometry(0.8, 0.4, 0.6), c.paint(new T.MeshStandardMaterial(), (th) => (th.dark ? "#3b82f6" : "#2563eb")));
    relay.position.set(-3.2, 0.2, 1.3);
    const led = new T.Mesh(new T.SphereGeometry(0.1, 12, 10), new T.MeshBasicMaterial({ color: GREEN }));
    led.position.set(-3.2, 0.48, 1.3);
    c.scene.add(relay, led);

    // IR sensor posts + beam
    const postMat = c.paint(new T.MeshStandardMaterial(), "text");
    [-1, 1].forEach((sgn) => {
      const post = new T.Mesh(new T.BoxGeometry(0.22, 1.2, 0.22), postMat);
      post.position.set(BEAM_X, 0.6, sgn * 1.05); c.scene.add(post);
    });
    const beam = new T.Mesh(new T.CylinderGeometry(0.03, 0.03, 2.1, 8), new T.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.35 }));
    beam.rotation.x = Math.PI / 2; beam.position.set(BEAM_X, 0.95, 0);
    c.scene.add(beam);

    // object on conveyor
    const box = new T.Mesh(new T.BoxGeometry(0.6, 0.6, 0.6), c.paint(new T.MeshStandardMaterial({ flatShading: true }), (th) => (th.dark ? "#f5c542" : "#e0a800")));
    c.scene.add(box);

    let state = "on", speed = 1, waitLeft = 0, objX = 4.4, triggered = false, lastMsg = "";
    function status(msg) { if (opts.onStatus && msg !== lastMsg) { lastMsg = msg; opts.onStatus(msg); } }

    c.camera.position.set(1.8, 5.6, 9.6);
    c.camera.lookAt(0.5, 0.3, 0);
    c.update = (t, dt) => {
      dt = dt || 0;
      const target = state === "on" ? 1 : 0;
      speed += (target - speed) * Math.min(1, dt * (state === "on" ? 2.5 : 6));
      fan.rotation.x += speed * dt * 14;
      rollers.forEach((r) => (r.rotation.y += speed * dt * 6));
      stripes.children.forEach((s) => { s.position.x -= speed * dt * 1.2; if (s.position.x < -2.2) s.position.x += 7; });

      objX -= speed * dt * 1.2;
      if (objX < -2.4) { objX = 4.4; triggered = false; }
      box.position.set(objX, 0.98 - Math.max(0, -2.0 - objX) * 1.5, 0);

      const inBeam = Math.abs(objX - BEAM_X) < 0.32;
      if (state === "on" && inBeam && !triggered) { state = "off"; waitLeft = WAIT; triggered = true; }
      if (state === "off") {
        waitLeft -= dt;
        const shown = Math.max(1, Math.ceil((waitLeft / WAIT) * 10));
        status("IR: object detected → relay OFF · restart in " + shown + "s");
        if (waitLeft <= 0) state = "on";
      } else {
        status(inBeam ? "relay ON · motor restarted" : "relay ON · motor running · IR clear");
      }
      led.material.color.setHex(state === "on" ? GREEN : RED);
      beam.material.opacity = inBeam ? 0.95 : 0.3 + 0.1 * Math.sin(t * 8);
      beam.scale.set(inBeam ? 2 : 1, 1, inBeam ? 2 : 1);
    };
    c.update(0.01, 0);
    return c;
  }

  const builders = { hero, mountains, hash, chunks, motor };
  window.Scenes = {
    create(canvas, type, opts) {
      const b = builders[type];
      if (!b) return null;
      try { return b(canvas, opts || {}); } catch (e) { console.warn("Scene failed:", type, e); return null; }
    },
    reduced,
  };
})();
