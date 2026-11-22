/* =============================================================
   THE BUILDING — renders data.js into floors and runs the props:
   elevator, doors, shutters, drawers, badges, mailroom, skyline.
   ============================================================= */
(function () {
  "use strict";
  const D = window.PORTFOLIO;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const EASE = "cubic-bezier(.2,.8,.2,1)";
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const live = new Set();

  const TITLES = {
    lobby: "Lobby", about: "About me", education: "Education", skills: "Technical skills", projects: "Featured projects",
    interests: "Areas of interest", approach: "How I build", learning: "Current learning", beyond: "Beyond the code",
    contact: "Let's connect", roof: "Final thought",
  };
  const floors = $$("main .floor").map((el, i) => ({ el, id: el.id, num: el.dataset.floor, label: el.dataset.label, title: TITLES[el.id], i }));
  const byId = Object.fromEntries(floors.map((f) => [f.id, f]));
  const pad = (n) => (/^\d$/.test(n) ? "0" + n : n);

  const ICONS = {
    code: '<path d="M8 6l-6 6 6 6M16 6l6 6-6 6M14 4l-4 16"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
    db: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 6-7"/>',
    game: '<rect x="2" y="7" width="20" height="11" rx="4"/><path d="M7 11v3M5.5 12.5h3M15 12h.01M18 13.5h.01"/>',
    tool: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-.5-.5-2.5z"/>',
    cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    github: '<path d="M9 19c-4 1.5-4-2-6-2.5M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
    linkedin: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/>',
  };
  const svg = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[k] || ""}</svg>`;
  const chips = (arr) => arr.map((x) => `<span class="chip">${esc(x)}</span>`).join("");

  /* =================== RENDER =================== */
  function renderSigns() {
    floors.forEach((f) => {
      const s = $("[data-sign]", f.el);
      if (!s) return;
      s.innerHTML = `<span class="fs-num">${pad(f.num)}</span><span class="fs-text"><b>${esc(f.title)}</b><small>Floor ${f.num} · ${esc(f.label)}</small></span>`;
    });
  }

  // ---- Lobby letterboard ----
  function pegs(text, opts) {
    opts = opts || {};
    let k = 0;
    return text.split(" ").map((word) => `<span class="w">${[...word].map((ch) => {
      const r = (rnd() * 6 - 3).toFixed(1), y = (rnd() * 3 - 1.5).toFixed(1);
      const delay = opts.stagger ? `animation-delay:${(opts.base || 0) + k++ * opts.stagger}ms;` : "";
      return `<span class="ch${opts.stagger ? " in" : ""}" style="--r:${r}deg;--y:${y}px;${delay}">${esc(ch)}</span>`;
    }).join("")}</span>`).join("");
  }
  function renderLobby() {
    const [first, ...rest] = D.name.split(" ");
    $("#lbIntro").innerHTML = pegs("Now showing on every floor", { stagger: 18, base: 900 });
    $("#lbName1").innerHTML = pegs(first.toUpperCase(), { stagger: 70, base: 1100 });
    $("#lbName2").innerHTML = pegs(rest.join(" ").toUpperCase(), { stagger: 60, base: 1500 });
    $("#lbTag").innerHTML = pegs(D.heroLine, { stagger: 6, base: 2100 });
    $("#letterboard").setAttribute("aria-label", `Letter board: ${D.name}. ${D.roles.join(", ")}. ${D.heroLine}`);
    $("#lbText").textContent = D.intro.join(" ");

    $("#directory").innerHTML = floors.filter((f) => f.id !== "lobby").map((f) => `
      <li><button data-go="${f.id}"><span class="dir-num">${f.num}</span><span class="dir-name">${esc(f.title)}</span><span class="dir-dept">${esc(f.label)}</span></button></li>`).join("");
  }
  function typeRole() {
    const el = $("#lbRole");
    el.style.columnGap = "0";
    if (reduced) { el.innerHTML = pegs(D.roles.join(" · ")); return; }
    let r = 0;
    (async function loop() {
      await wait(2600);
      for (;;) {
        const word = D.roles[r].toUpperCase();
        for (const ch of word) {
          const s = document.createElement("span");
          s.className = "ch in";
          s.style.cssText = `--r:${(rnd() * 6 - 3).toFixed(1)}deg;--y:${(rnd() * 3 - 1.5).toFixed(1)}px`;
          s.textContent = ch === " " ? " " : ch;
          el.appendChild(s);
          await wait(75);
        }
        await wait(1900);
        while (el.lastChild) { el.lastChild.remove(); await wait(28); }
        r = (r + 1) % D.roles.length;
        await wait(300);
      }
    })();
  }

  // ---- 1 · Corkboard ----
  function renderAbout() {
    const A = D.about, colors = ["#ffe873", "#ffb3c7", "#a8e6ff", "#b9f5a6"];
    $("#corkboard").innerHTML = `
      <p class="board-title">pinned at reception →</p>
      <div class="paper"><span class="pin"></span>
        <p class="lead">${esc(A.lead)}</p>
        ${D.intro.map((p) => `<p>${esc(p)}</p>`).join("")}
      </div>
      <div class="paper p2"><span class="pin green"></span>
        ${A.body.map((p) => `<p>${esc(p)}</p>`).join("")}
      </div>
      <div class="stickies">
        <div class="sticky" style="--c:#fffdf7;--r:-2deg"><span class="pin blue"></span>Areas I've explored ↓</div>
        ${A.explored.map((x, i) => `<div class="sticky" style="--c:${colors[i % 4]};--r:${(rnd() * 7 - 3.5).toFixed(1)}deg">${esc(x)}</div>`).join("")}
      </div>
      <div class="dymo" aria-label="My philosophy">${A.philosophy.map((w) => `<span style="--r:${(rnd() * 4 - 2).toFixed(1)}deg">${esc(w)}</span>`).join("")}</div>`;
  }

  // ---- 2 · Badges ----
  function renderBadges() {
    const colors = ["#1f4f9c", "#8a1c2b", "#0f6e57"];
    $("#badges").insertAdjacentHTML("beforeend", D.education.map((e, i) => `
      <div class="badge-hang" style="--c:${colors[i % 3]}">
        <span class="lanyard"></span><span class="lanyard r"></span>
        <button class="badge" aria-pressed="false" aria-label="${esc(e.school)} badge — click to flip">
          <span class="badge-face front">
            <span class="badge-slot"></span>
            <span class="badge-band">${esc(e.school)}</span>
            <span class="badge-body">
              <span class="avatar">${esc(D.initials)}</span>
              <span><span class="badge-name">${esc(D.name)}</span><span class="badge-role" style="display:block">${esc(e.degree)}</span></span>
            </span>
            <span class="badge-meta">
              <span>STATUS: <b>STUDENT</b></span>
              <span>EXPECTED: <b>${esc(e.when.replace(/^Expected\s*/i, ""))}</b></span>
              <span>ACCESS: <b>ALL FLOORS</b></span>
            </span>
            <span class="barcode"></span>
          </span>
          <span class="badge-face back">
            <h4>${esc(e.label)}</h4>
            <ul>${e.items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
            <span class="flip-hint">↺ click to flip back</span>
          </span>
        </button>
      </div>`).join(""));
    $("#eduNote").textContent = D.educationNote;
    $$(".badge").forEach((b) => b.addEventListener("click", () => {
      const f = b.classList.toggle("flipped");
      b.setAttribute("aria-pressed", String(f));
    }));
  }

  // ---- 3 · Tool chest ----
  function renderTools() {
    $("#toolchest").innerHTML = `
      <div class="chest-top"><span class="brand">${esc(D.initials)} · TOOL CO.</span></div>
      <div class="chest-body">
        ${D.skills.map((s, i) => `
          <div class="drawer${i === 0 ? " open" : ""}">
            <button class="drawer-front" aria-expanded="${i === 0}" aria-controls="tray-${i}">
              <span class="drawer-icon">${svg(s.icon)}</span>
              <span class="label-card">${esc(s.group)} <small>· ${s.items.length} tools</small></span>
              <span class="handle"></span>
            </button>
            <div class="tray" id="tray-${i}"><div><div class="foam">${s.items.map((x) => `<span class="tool">${esc(x)}</span>`).join("")}</div></div></div>
          </div>`).join("")}
      </div>
      <div class="casters"><span></span><span></span></div>`;
    // one drawer open at a time, so the chest always fits on screen
    $$(".drawer-front").forEach((b) => b.addEventListener("click", () => {
      const d = b.parentElement, open = !d.classList.contains("open");
      $$(".drawer").forEach((o) => { o.classList.remove("open"); $(".drawer-front", o).setAttribute("aria-expanded", "false"); });
      d.classList.toggle("open", open);
      b.setAttribute("aria-expanded", String(open));
    }));
  }

  // ---- 4 · Lab doors ----
  const DOOR_COLORS = [["#2f6b4f", "#1b4433"], ["#3b3f8f", "#23265c"], ["#7a3b8f", "#4a2158"], ["#2f5d7c", "#1c3a50"]];
  const roomNo = (i) => 401 + i;
  function renderDoors() {
    const fl = (k) => D.projectFilters.find((f) => f.key === k).label;
    $("#filters").innerHTML = D.projectFilters.map((f, i) => {
      const n = f.key === "all" ? D.projects.length : D.projects.filter((p) => p.filter === f.key).length;
      return `<button class="breaker-sw" data-filter="${f.key}" aria-pressed="${i === 0}" aria-label="Power ${esc(f.label)} wing">
        <span class="slot"><span class="lever"></span></span><span class="tag">${esc(f.label)} <i>${n}</i></span></button>`;
    }).join("");
    $("#doorsGrid").innerHTML = D.projects.map((p, i) => {
      const [c1, c2] = DOOR_COLORS[i % DOOR_COLORS.length];
      return `
      <article class="room" data-index="${i}" data-filter="${p.filter}">
        <div class="room-plate"><span class="lamp"></span>LAB ${roomNo(i)}</div>
        <div class="doorway" tabindex="0" role="button" aria-label="Enter lab ${roomNo(i)}: ${esc(p.title)}">
          <div class="room-inside">Come in →</div>
          <div class="door-leaf" style="--door-1:${c1};--door-2:${c2}">
            <div class="vision"><canvas aria-hidden="true"></canvas></div>
            <div class="door-name"><b>${esc(p.title)}</b><small>${esc(p.subtitle)}</small></div>
            <span class="door-handle"></span><span class="kick"></span>
          </div>
          <span class="knock">knock knock</span>
          <div class="shutter"><span>CLOSED</span></div>
        </div>
        <div class="doormat">${esc(fl(p.filter))} wing</div>
        <p class="room-sum">${esc(p.summary)}</p>
      </article>`;
    }).join("");
  }

  // ---- 5 · Shops ----
  function renderShops() {
    const colors = ["#ff4fa3", "#3be3a6", "#ffb547", "#57a8ff", "#b57bff", "#ff7a45"];
    const tags = ["AI / ML", "DATA", "SOFTWARE", "ALGO", "GAMES", "HARDWARE"];
    $("#shops").innerHTML = D.interests.map((x, i) => `
      <div class="shop" style="--sc:${colors[i % 6]}">
        <div class="fascia"><span>${esc(x.title)}</span></div>
        <div class="awning"></div>
        <button class="shopwindow" aria-label="${esc(x.title)} — toggle shutter">
          <span class="wares"><span class="shop-no">UNIT 5.0${i + 1}</span><p>${esc(x.text)}</p><span class="open-sign">OPEN</span></span>
          <span class="roller" style="transition-delay:var(--sd,0s)"><span class="graffiti">${tags[i] || ""}</span></span>
        </button>
      </div>`).join("");
  }

  // ---- 6 · Plaque ----
  function renderPlaque() {
    $("#plaque").innerHTML = `
      <span class="screw s1"></span><span class="screw s2" style="--sr:80deg"></span><span class="screw s3" style="--sr:-20deg"></span><span class="screw s4" style="--sr:120deg"></span>
      <h3>Operating instructions</h3>
      <p class="model">MODEL ${esc(D.initials)}-01 · COMPUTER SCIENCE &amp; DATA SCIENCE</p>
      <ol>${D.approach.map((a) => `<li><div><b>${esc(a.title)}</b><span>${esc(a.text)}</span></div></li>`).join("")}</ol>
      <div class="cap"><span>CAPACITY: UNLIMITED CURIOSITY</span><span>MAINTAINED BY: ${esc(D.name.toUpperCase())}</span></div>
      <div class="stamp-ok" aria-hidden="true">INSPECTED<br />✓<br />BY TESTING</div>`;
  }

  // ---- 7 · Site ----
  function renderSite() {
    $("#site").innerHTML = `
      <div class="site-board">
        <h3>Under construction</h3>
        <dl>
          <dt>Project</dt><dd>Stronger engineering fundamentals</dd>
          <dt>Contractor</dt><dd>${esc(D.name)}</dd>
          <dt>Method</dt><dd>Build practical projects while learning</dd>
          <dt>Status</dt><dd>Work in progress — always</dd>
        </dl>
        <div class="posts"><span></span><span></span></div>
      </div>
      <div>
        <p class="wip">Currently building</p>
        <div class="cone-list">${D.learning.map((x) => `<span class="tag-cone" style="--r:${(rnd() * 5 - 2.5).toFixed(1)}deg">${esc(x)}</span>`).join("")}</div>
        <p class="note">${esc(D.learningNote)}</p>
      </div>`;
  }

  // ---- 8 · Hall ----
  function renderHall() {
    const colors = ["#f6d58a", "#a8e6ff", "#ffb3c7", "#b9f5a6", "#e2c9ff"];
    $("#hall").innerHTML = `
      <div><p class="hall-lead">${esc(D.beyond.lead)}</p><p class="hall-close">${esc(D.beyond.close)}</p></div>
      <div class="tickets">${D.beyond.items.map((x, i) => `
        <div class="ticket" style="--tc:${colors[i % 5]};--r:${(rnd() * 3 - 1.5).toFixed(1)}deg">
          <div class="main"><small>ADMIT ONE · COMMUNITY HALL</small><b>${esc(x)}</b></div>
          <div class="stub">No.<span>0${i + 1}</span></div>
        </div>`).join("")}</div>`;
  }

  // ---- 9 · Mailroom ----
  function renderMail() {
    const C = D.contact;
    const row = (key, label, href, shown) => href
      ? `<a class="link-row" href="${esc(href)}" ${key === "mail" ? "" : 'target="_blank" rel="noopener"'}>${svg(key)}<span><span class="lbl">${label}</span>${esc(shown)}</span></a>`
      : `<div class="link-row pending">${svg(key)}<span><span class="lbl">${label}</span>Nameplate coming soon</span></div>`;
    $("#mailboxes").innerHTML = `
      <p class="mb-intro">${esc(D.connect.text)}</p>
      <div class="mb-wall" aria-label="Mailboxes open for">
        ${D.connect.who.map((w) => `<div class="mbox" tabindex="0"><div class="inside"><i></i></div><div class="mdoor"><span class="who">${esc(w)}</span><span class="keyhole"></span></div></div>`).join("")}
      </div>
      <div class="links">
        ${row("mail", "Email", C.email && "mailto:" + C.email, C.email)}
        ${row("github", "GitHub", C.github, C.github.replace(/^https?:\/\/(www\.)?/, ""))}
        ${row("linkedin", "LinkedIn", C.linkedin, C.linkedin.replace(/^https?:\/\/(www\.)?/, ""))}
      </div>`;
  }

  // ---- R · Roof ----
  function renderRoof() {
    const parts = D.finalThought.quote.split(/(?<=\.)\s+/);
    $("#billboard").innerHTML = `
      <div class="bulbs" aria-hidden="true">${Array.from({ length: 18 }, (_, i) => `<i style="--dl:${(i % 3) * 0.3}s"></i>`).join("")}</div>
      <p class="q">${esc(parts[0])}${parts[1] ? ` <em>${esc(parts.slice(1).join(" "))}</em>` : ""}</p>
      <p>${esc(D.finalThought.text)}</p>`;
    $("#footerName").textContent = `© ${new Date().getFullYear()} ${D.name}`;
    $("#stars").innerHTML = Array.from({ length: 110 }, () =>
      `<i style="left:${(rnd() * 100).toFixed(2)}%;top:${(rnd() * 100).toFixed(2)}%;--t:${(2 + rnd() * 4).toFixed(1)}s;--dl:${(rnd() * 4).toFixed(1)}s;opacity:${(0.4 + rnd() * 0.6).toFixed(2)}"></i>`).join("");

    // skyline
    const W = 1600, H = 300;
    let x = 0, out = "";
    while (x < W) {
      const w = 60 + Math.floor(rnd() * 90), h = 90 + Math.floor(rnd() * 190);
      out += `<rect class="bld" x="${x}" y="${H - h}" width="${w}" height="${h}"/>`;
      if (rnd() > 0.7) out += `<rect class="bld" x="${x + w / 2 - 2}" y="${H - h - 30}" width="4" height="30"/>`;
      for (let wy = H - h + 14; wy < H - 16; wy += 18) {
        for (let wx = x + 10; wx < x + w - 14; wx += 16) {
          out += `<rect class="win${rnd() > 0.62 ? " on" : ""}" x="${wx}" y="${wy}" width="8" height="10"/>`;
        }
      }
      x += w + 4 + Math.floor(rnd() * 10);
    }
    const sky = $("#skyline");
    sky.setAttribute("viewBox", `0 0 ${W} ${H}`);
    sky.innerHTML = out;
    if (!reduced) {
      const wins = $$(".win", sky);
      setInterval(() => { for (let k = 0; k < 4; k++) wins[Math.floor(Math.random() * wins.length)].classList.toggle("on"); }, 700);
    }
  }

  /* =================== ELEVATOR =================== */
  const doors = $("#liftDoors"), elev = $("#elevator");
  let current = floors[0], traveling = false;

  function renderPanel() {
    const order = ["R", "9", "8", "7", "6", "5", "4", "3", "2", "1", "G"];
    const btns = order.map((n) => floors.find((f) => f.num === n)).filter(Boolean).map((f) =>
      `<button class="el-btn" data-go="${f.id}" aria-label="Floor ${f.num}: ${esc(f.title)}">${f.num}<span class="tip">${esc(f.title)}</span></button>`);
    btns.push(`<button class="el-btn bell" id="bellBtn" aria-label="Alarm bell">🔔<span class="tip">Alarm</span></button>`);
    $("#elButtons").innerHTML = btns.join("");
  }

  function rollTo(el, text, dir) {
    if (el.textContent === text) return;
    el.textContent = text;
    if (reduced) return;
    const from = dir < 0 ? -100 : 100;
    el.animate([{ transform: `translateY(${from}%)`, opacity: 0, filter: "blur(2px)" }, { transform: "none", opacity: 1, filter: "none" }],
      { duration: 420, easing: "cubic-bezier(.2,1.4,.4,1)" });
  }
  function setDisplay(f, dir) {
    rollTo($("#elNum"), f.num, dir || 1);
    $("#elLabel").textContent = f.title;
    if (dir) $("#elArrow").classList.toggle("down", dir < 0);
    $$(".el-btn[data-go]").forEach((b) => b.classList.toggle("lit", b.dataset.go === f.id));
  }

  async function travel(id) {
    const target = byId[id];
    if (!target || traveling) return;
    elev.classList.add("collapsed");
    $("#elDisplay").setAttribute("aria-expanded", "false");
    if (target === current && Math.abs(target.el.getBoundingClientRect().top) < 40) return;
    const dir = target.i >= current.i ? 1 : -1;
    if (reduced) { scrollToFloor(target); return; }
    traveling = true;
    $("#lrArrow").classList.toggle("down", dir < 0);
    $("#lrNum").textContent = current.num;
    $("#lrLabel").textContent = "Doors closing";
    doors.classList.add("closed");
    await wait(800);
    const steps = Math.abs(target.i - current.i);
    const per = Math.max(60, Math.min(160, 900 / Math.max(1, steps)));
    $("#lrLabel").textContent = dir > 0 ? "Going up" : "Going down";
    for (let k = 1; k <= steps; k++) {
      const f = floors[current.i + k * dir];
      rollTo($("#lrNum"), f.num, dir);
      await wait(per);
    }
    scrollToFloor(target);
    $("#lrLabel").textContent = "Ding! " + target.title;
    await wait(380);
    doors.classList.remove("closed");
    await wait(800);
    traveling = false;
  }
  function scrollToFloor(f) {
    if (window.lenis) window.lenis.scrollTo(f.el.offsetTop, { immediate: true, force: true });
    else {
      const html = document.documentElement;
      html.style.scrollBehavior = "auto";
      window.scrollTo(0, f.el.offsetTop);
      html.style.scrollBehavior = "";
    }
    current = f;
    setDisplay(f);
  }

  function initElevator() {
    renderPanel();
    document.addEventListener("click", (e) => {
      const go = e.target.closest("[data-go]");
      if (go) { e.preventDefault(); travel(go.dataset.go); return; }
      const link = e.target.closest("[data-floor-link]");
      if (link) { e.preventDefault(); travel(link.dataset.floorLink); }
    });
    $("#callBtn").addEventListener("click", () => travel("about"));
    $("#elDisplay").addEventListener("click", () => {
      if (window.innerWidth >= 900) return;
      const open = elev.classList.toggle("collapsed") === false;
      $("#elDisplay").setAttribute("aria-expanded", String(open));
    });
    $("#bellBtn").addEventListener("click", () => {
      document.body.classList.remove("bell"); void document.body.offsetWidth; document.body.classList.add("bell");
      toast("🔔 Alarm received! Help is on the way — or leave a note in the Floor 9 mailroom.");
      setTimeout(() => document.body.classList.remove("bell"), 600);
    });

    // which floor are we on?
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting || traveling) return;
      const f = byId[e.target.id];
      const dir = f.i - current.i;
      current = f;
      setDisplay(f, dir);
    }), { rootMargin: "-45% 0px -50% 0px" });
    floors.forEach((f) => io.observe(f.el));
    setDisplay(current, 1);

    // intro: doors open on arrival
    const start = floors.find((f) => f.el.getBoundingClientRect().bottom > innerHeight / 2) || floors[0];
    $("#lrNum").textContent = start.num;
    $("#lrLabel").textContent = start.title;
    if (reduced) doors.classList.remove("closed");
    else setTimeout(() => doors.classList.remove("closed"), 900);
  }

  let toastTimer = 0;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 3600);
  }

  /* =================== LIGHT SWITCH =================== */
  function setTheme(t, save) {
    document.documentElement.setAttribute("data-theme", t);
    $("#themeToggle").setAttribute("aria-pressed", String(t === "dark"));
    $("#lsLabel").textContent = t === "dark" ? "LIGHTS OFF" : "LIGHTS ON";
    if (save) { try { localStorage.setItem("theme", t); } catch (e) {} }
    requestAnimationFrame(() => live.forEach((s) => s.setTheme()));
  }
  function initTheme() {
    setTheme(document.documentElement.getAttribute("data-theme") || "light", false);
    $("#themeToggle").addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      if (next === "light" && !reduced) { document.body.classList.remove("flicker"); void document.body.offsetWidth; document.body.classList.add("flicker"); }
      setTheme(next, true);
    });
    if (window.matchMedia) matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      let saved = null; try { saved = localStorage.getItem("theme"); } catch (err) {}
      if (!saved) setTheme(e.matches ? "dark" : "light", false);
    });
  }

  /* =================== 3D SCENES =================== */
  const roomScenes = new Map();
  let modalOpen = false;
  const visibleScenes = new Set();
  function makeScene(canvas, type, opts) {
    if (!window.Scenes) return null;
    const s = Scenes.create(canvas, type, opts);
    if (s) live.add(s);
    return s;
  }
  function killScene(s) { if (s) { live.delete(s); visibleScenes.delete(s); s.dispose(); } }
  function initScenes() {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      const s = roomScenes.get(e.target);
      if (!s) return;
      if (e.isIntersecting) { visibleScenes.add(s); if (!modalOpen) s.start(); }
      else { visibleScenes.delete(s); s.stop(); }
    }), { rootMargin: "100px" });
    $$(".room").forEach((room) => {
      const s = makeScene($("canvas", room), D.projects[+room.dataset.index].scene);
      if (s) { roomScenes.set(room, s); io.observe(room); }
    });
  }

  /* =================== DOORS, BREAKERS, SHUTTERS =================== */
  function initRooms() {
    $$(".room").forEach((room) => {
      const dw = $(".doorway", room);
      const enter = () => { if (!room.classList.contains("off")) knockAndEnter(room); };
      dw.addEventListener("click", enter);
      dw.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); enter(); } });
    });
    $("#filters").addEventListener("click", (e) => {
      const sw = e.target.closest(".breaker-sw");
      if (!sw) return;
      $$(".breaker-sw").forEach((b) => b.setAttribute("aria-pressed", String(b === sw)));
      const key = sw.dataset.filter;
      $$(".room").forEach((room, i) => {
        const off = key !== "all" && room.dataset.filter !== key;
        $(".shutter", room).style.transitionDelay = (i * 0.08) + "s";
        room.classList.toggle("off", off);
        const dw = $(".doorway", room);
        dw.tabIndex = off ? -1 : 0;
        dw.setAttribute("aria-disabled", String(off));
      });
    });
    // shopfront shutters roll up when the arcade comes into view
    const sio = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const shops = $$(".shop", e.target);
      shops.forEach((s, i) => { s.style.setProperty("--sd", (i * 0.15) + "s"); s.classList.add("up"); });
      setTimeout(() => shops.forEach((s) => s.style.setProperty("--sd", "0s")), 2000);
      sio.unobserve(e.target);
    }), { threshold: 0.25 });
    sio.observe($("#shops"));
    $$(".shopwindow").forEach((b) => b.addEventListener("click", () => b.parentElement.classList.toggle("up")));
  }

  /* =================== LAB ROOM MODAL =================== */
  const modal = $("#modal"), mCard = $("#modalCard");
  let cur = -1, modalScene = null, srcRoom = null, lastFocus = null;

  async function knockAndEnter(room) {
    if (modalOpen) return;
    if (!reduced) {
      room.classList.add("knocking");
      await wait(450);
      room.classList.remove("knocking");
      room.classList.add("opening");
      await wait(420);
    }
    openModal(+room.dataset.index, room);
  }

  function fillModal(i) {
    const p = D.projects[i], n = D.projects.length;
    killScene(modalScene);
    const vis = $("#modalVisual");
    vis.innerHTML = `<canvas aria-hidden="true"></canvas><span class="lab-sign">LAB ${roomNo(i)}</span><span class="status" style="display:none"></span><p class="caption">${esc(p.sceneCaption || "")}</p>`;
    const st = $(".status", vis);
    modalScene = makeScene($("canvas", vis), p.scene, { onStatus: (s) => { st.style.display = ""; st.textContent = "▸ " + s; } });
    if (modalScene) modalScene.start();
    const wing = D.projectFilters.find((f) => f.key === p.filter).label;
    $("#modalBody").innerHTML = `
      <p class="kicker">LAB ${roomNo(i)} · PROJECT ${p.num} · SPEC SHEET</p>
      <h2 id="modalTitle">${esc(p.title)}</h2>
      <p class="sub">${esc(p.subtitle)}</p>
      <div class="meta"><span>CATEGORY</span><b>${esc(p.category)}</b><span>LANGUAGE</span><b>${esc(p.language)}</b><span>WING</span><b>${esc(wing)}</b></div>
      <p>${esc(p.summary)}</p>
      <h4>Technology</h4><div class="chips">${chips(p.tech)}</div>
      ${p.sections.map((s) => `<h4>${esc(s.title)}</h4>${s.ordered ? `<ol>${s.items.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>` : `<ul>${s.items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`}`).join("")}
      <p class="focus">Project focus: ${esc(p.focus)}</p>
      ${p.note ? `<p class="pnote">Note: ${esc(p.note)}</p>` : ""}`;
    $("#modalBody").scrollTop = 0;
    $("#modalCount").textContent = `${i + 1} / ${n}`;
    $("#prevLabel").textContent = "Lab " + roomNo((i - 1 + n) % n);
    $("#nextLabel").textContent = "Lab " + roomNo((i + 1) % n);
    cur = i;
  }
  function fromRect(el) {
    const a = el.getBoundingClientRect(), b = mCard.getBoundingClientRect();
    const dx = a.left + a.width / 2 - (b.left + b.width / 2), dy = a.top + a.height / 2 - (b.top + b.height / 2);
    return `translate(${dx}px, ${dy}px) scale(${a.width / b.width}, ${a.height / b.height}) translateZ(-200px)`;
  }
  function openModal(i, room) {
    modalOpen = true; srcRoom = room; lastFocus = document.activeElement;
    visibleScenes.forEach((s) => s.stop());
    if (window.lenis) window.lenis.stop();
    modal.hidden = false;
    document.body.classList.add("modal-open");
    fillModal(i);
    const dw = $(".doorway", room);
    $(".modal-backdrop").animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400 });
    mCard.animate([{ transform: fromRect(dw), opacity: 0 }, { opacity: 1, offset: 0.3 }, { transform: "none", opacity: 1 }], { duration: reduced ? 1 : 700, easing: EASE });
    $(".close-btn").focus({ preventScroll: true });
  }
  async function closeModal() {
    if (!modalOpen) return;
    const room = $(`.room[data-index="${cur}"]`);
    const target = room && !room.classList.contains("off") ? room : srcRoom;
    $(".modal-backdrop").animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, fill: "forwards" });
    await mCard.animate([{ transform: "none", opacity: 1 }, { opacity: 1, offset: 0.7 }, { transform: fromRect($(".doorway", target)), opacity: 0 }],
      { duration: reduced ? 1 : 560, easing: "cubic-bezier(.6,0,.4,1)", fill: "forwards" }).finished;
    modal.hidden = true;
    mCard.getAnimations().forEach((a) => a.cancel());
    $(".modal-backdrop").getAnimations().forEach((a) => a.cancel());
    document.body.classList.remove("modal-open");
    killScene(modalScene); modalScene = null;
    modalOpen = false;
    if (window.lenis) window.lenis.start();
    $$(".room.opening").forEach((r) => r.classList.remove("opening")); // doors swing shut behind you
    visibleScenes.forEach((s) => s.start());
    ($(".doorway", target) || lastFocus).focus({ preventScroll: true });
  }
  let rotating = false, queued = 0;
  async function step(dir) {
    if (rotating) { queued = dir; return; }
    rotating = true;
    const n = D.projects.length, next = (cur + dir + n) % n;
    if (!reduced) await mCard.animate([{ transform: "none", opacity: 1 }, { transform: `translateX(${-dir * 40}%) translateZ(-260px) rotateY(${dir * 70}deg)`, opacity: 0 }],
      { duration: 380, easing: "ease-in", fill: "forwards" }).finished;
    fillModal(next);
    mCard.getAnimations().forEach((a) => a.cancel());
    if (!reduced) await mCard.animate([{ transform: `translateX(${dir * 40}%) translateZ(-260px) rotateY(${-dir * 70}deg)`, opacity: 0 }, { transform: "none", opacity: 1 }],
      { duration: 520, easing: EASE }).finished;
    rotating = false;
    if (queued && modalOpen) { const d = queued; queued = 0; step(d); }
  }
  function initModal() {
    modal.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeModal(); });
    $("#prevProject").addEventListener("click", () => step(-1));
    $("#nextProject").addEventListener("click", () => step(1));
    document.addEventListener("keydown", (e) => {
      if (!modalOpen) return;
      if (e.key === "Escape") closeModal();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "Tab") {
        const f = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', mCard).filter((x) => x.offsetParent);
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    let sx = null;
    mCard.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
    mCard.addEventListener("touchend", (e) => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 70) step(dx < 0 ? 1 : -1);
    });
  }

  /* =================== MAILROOM FORM =================== */
  function initForm() {
    const form = $("#contactForm"), status = $("#formStatus");
    const rules = {
      name: (v) => (v.trim().length >= 2 ? "" : "Who's it from? Add your name."),
      email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "That return address doesn't look right."),
      message: (v) => (v.trim().length >= 10 ? "" : "A few more words, please (10+ characters)."),
    };
    function check(input) {
      const rule = rules[input.name];
      if (!rule) return true;
      const msg = rule(input.value), field = input.closest(".field");
      field.classList.toggle("invalid", !!msg);
      $(".err", field).textContent = msg;
      input.setAttribute("aria-invalid", String(!!msg));
      return !msg;
    }
    $$("input, textarea", form).forEach((el) => {
      el.addEventListener("blur", () => el.value && check(el));
      el.addEventListener("input", () => el.closest(".field").classList.contains("invalid") && check(el));
    });
    let sending = false;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (sending) return;
      status.textContent = "";
      const bad = $$("input, textarea", form).filter((el) => !check(el));
      if (bad.length) {
        bad[0].focus();
        form.classList.remove("shake"); void form.offsetWidth; form.classList.add("shake");
        return;
      }
      sending = true;
      const data = Object.fromEntries(new FormData(form));
      // To deliver real messages, POST `data` to a service such as Formspree or EmailJS here.
      if (!reduced) {
        const slot = $(".mail-slot").getBoundingClientRect(), r = form.getBoundingClientRect();
        const dy = slot.top + slot.height / 2 - (r.top + r.height / 2);
        await form.animate([
          { transform: "none" },
          { transform: "rotateX(60deg) scale(.7)", offset: 0.35 },
          { transform: `translateY(${dy}px) rotateX(80deg) scale(.25, .08)`, opacity: 1, offset: 0.85 },
          { transform: `translateY(${dy + 10}px) rotateX(85deg) scale(.2, .02)`, opacity: 0 },
        ], { duration: 1100, easing: "cubic-bezier(.5,0,.3,1)", fill: "forwards" }).finished;
      }
      if (D.contact.email) {
        location.href = `mailto:${D.contact.email}?subject=${encodeURIComponent(data.topic + " — from your portfolio")}&body=${encodeURIComponent(`${data.message}\n\n— ${data.name} (${data.email})`)}`;
        status.textContent = "✉ Posted! Opening your email app to send it…";
      } else {
        status.textContent = `✉ Posted, ${data.name.trim().split(" ")[0]}! (This mailbox isn't wired to email yet.)`;
      }
      form.reset();
      await wait(1400);
      form.getAnimations().forEach((a) => a.cancel());
      form.animate([{ transform: "translateY(-40px)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 500, easing: EASE });
      sending = false;
    });
  }

  /* =================== REVEAL =================== */
  function initReveal() {
    const rio = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); rio.unobserve(e.target); }
    }), { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    $$(".reveal").forEach((el) => rio.observe(el));
  }

  renderSigns(); renderLobby(); renderAbout(); renderBadges(); renderTools(); renderDoors();
  renderShops(); renderPlaque(); renderSite(); renderHall(); renderMail(); renderRoof();
  initTheme(); initElevator(); initRooms(); initModal(); initForm(); initReveal(); initScenes(); typeRole();
})();
