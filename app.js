/* Sanaré Mobile UI demo (no backend) */
const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => [...el.querySelectorAll(sel)];

const state = {
  user: null,
  screen: "login",
  prev: [],
  highlights: [],
  news: [],
  newsFilter: "Todos",
  sedes: [],
  points: { balance: 18450, goal: 25000, events: [] },
  commissions: { month: 42300, patients: 17, weeks: [9800, 11200, 8600, 12700] },
  health: {
    connected: false,
    sim: false,
    last: null,
    readings: { bp: "118/76", glucose: 98, spo2: 98, hr: 72, temp: 36.7 },
  },
  theme: localStorage.getItem("sanare_theme") || "dark",
};

function formatMoney(n){
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
}
function formatInt(n){ return n.toLocaleString("es-MX"); }
function nowTime(){
  const d = new Date();
  return d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}
function daysAgo(n){
  const d = new Date(Date.now() - n*24*60*60*1000);
  return d.toLocaleDateString("es-MX", { weekday: "short", day: "2-digit", month: "short" });
}

function toast(msg){
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._tm);
  toast._tm = setTimeout(()=>t.classList.remove("show"), 1900);
}

function sheet(title, html){
  $("#sheetTitle").textContent = title;
  $("#sheetBody").innerHTML = html;
  $("#sheet").classList.add("show");
  $("#sheet").setAttribute("aria-hidden", "false");
}
function closeSheet(){
  $("#sheet").classList.remove("show");
  $("#sheet").setAttribute("aria-hidden", "true");
}

function setTheme(mode){
  state.theme = mode;
  localStorage.setItem("sanare_theme", mode);
  if(mode === "light"){
    document.documentElement.classList.add("light");
  } else {
    document.documentElement.classList.remove("light");
  }
}

function setScreen(name, push=true){
  const current = state.screen;
  if(push && current && current !== name) state.prev.push(current);
  state.screen = name;

  $$(".screen").forEach(s => s.classList.toggle("screen--active", s.dataset.screen === name));

  // Bottomnav only for logged-in screens
  const nav = $("#bottomnav");
  nav.style.display = (name === "login") ? "none" : "flex";

  // Tab highlight
  $$(".tab").forEach(t => t.classList.toggle("tab--active", t.dataset.nav === name));

  // Update screen-specific UI
  if(name === "home") renderHome();
  if(name === "news") renderNewsAll();
  if(name === "sedes") renderSedes();
  if(name === "rewards") renderRewards();
  if(name === "commissions") renderCommissions();
  if(name === "profile") renderProfile();
  if(name === "health") renderHealth();
}

function back(){
  const prev = state.prev.pop() || "home";
  setScreen(prev, false);
}

function initData(){
    state.highlights = [
    { tag: "Sanaré", title: "Centro oncológico", desc: "Atención humana, infusión y seguimiento clínico en un solo lugar.", cta: "Ver detalle", img: "assets/car_logo.png" },
    { tag: "Experiencia", title: "Espacios de bienestar", desc: "Ambientes cómodos y privados para acompañamiento y recuperación.", cta: "Ver fotos", img: "assets/car_room.png" },
    { tag: "Comunidad", title: "Café & acompañamiento", desc: "Detalles que hacen la experiencia más cálida para pacientes y médicos.", cta: "Conocer más", img: "assets/car_mugs.png" },
    { tag: "Beneficios", title: "Puntos Sanaré", desc: "Acumula puntos por referencias y seguimiento de pacientes.", cta: "Ver puntos", img: "assets/car_points.png" },
    { tag: "Comisiones", title: "Comisiones claras", desc: "Resumen por mes, pacientes y rendimiento con métricas simples.", cta: "Ver comisiones", img: "assets/car_commissions.png" },
  ];


  state.news = [
    { category: "Oncología", title: "Guía rápida: manejo de efectos adversos", desc: "Resumen práctico para consulta en clínica.", when: "hoy", img: "assets/news_onco.svg", detail: "Incluye recomendaciones generales y banderas rojas para referir a urgencias." },
    { category: "Infusión", title: "Checklist de seguridad en sala de infusión", desc: "Protocolos para elevar seguridad y experiencia del paciente.", when: "ayer", img: "assets/news_infusion.svg", detail: "Repaso de verificación de identidad, acceso venoso y monitoreo." },
    { category: "Sanaré", title: "Nuevas sedes en expansión", desc: "Conoce la cobertura y horarios disponibles.", when: "hace 3 días", img: "assets/news_sedes.svg", detail: "Información de sedes y contacto directo para coordinación." },
    { category: "Educación", title: "Sesión clínica mensual (CME)", desc: "Actualizaciones y casos clínicos con especialistas.", when: "hace 1 semana", img: "assets/news_edu.svg", detail: "Registro abierto. Se otorgan puntos por asistencia." },
  ];

  state.sedes = [
    { name: "Roma Sur", address: "Tuxpan 10, Col. Roma Sur, Cuauhtémoc, CDMX", hours: "L-V 8:00–19:00", status: "Abierto", phone: "+52 55 4017 2431" },
    { name: "Polanco", address: "Ejemplo 123, Miguel Hidalgo, CDMX", hours: "L-S 9:00–18:00", status: "Abierto", phone: "+52 55 0000 0000" },
    { name: "Satélite", address: "Ejemplo 88, Naucalpan, Edomex", hours: "L-V 8:30–18:30", status: "Cupo limitado", phone: "+52 55 0000 0000" },
    { name: "Querétaro", address: "Ejemplo 50, Centro, Qro", hours: "L-V 9:00–17:00", status: "Próximamente", phone: "+52 55 0000 0000" },
  ];

  state.points.events = [
    { title: "Referencia registrada", desc: "Paciente con seguimiento agendado.", pts: +500, day: 0 },
    { title: "Capacitación completada", desc: "Sesión clínica mensual (CME).", pts: +300, day: 2 },
    { title: "Seguimiento de ciclo", desc: "Control y reporte de síntomas.", pts: +200, day: 5 },
    { title: "Referencia registrada", desc: "Paciente canalizado a sala de infusión.", pts: +500, day: 9 },
  ];
}

function renderCarousel(){
  const track = $("#carouselTrack");
  const dots = $("#carouselDots");
  track.innerHTML = "";
  dots.innerHTML = "";

  state.highlights.forEach((h, i)=>{
    const slide = document.createElement("div");
    slide.className = "slide";
    slide.innerHTML = `
      <div class="slide-illus"><img src="${h.img}" alt="" /></div>
      <div class="slide-meta">
        <div class="slide-kicker"><span class="dot"></span> ${h.tag}</div>
        <div class="slide-title">${h.title}</div>
        <p class="slide-desc">${h.desc}</p>
        <button class="slide-cta" data-highlight="${i}">${h.cta} <span class="chev" style="opacity:.9;border-color:#2a0f09"></span></button>
      </div>
    `;
    track.appendChild(slide);

    const b = document.createElement("button");
    b.setAttribute("aria-label", `Ir a destacado ${i+1}`);
    b.addEventListener("click", ()=>setCarousel(i));
    dots.appendChild(b);
  });

  // click detail
  track.addEventListener("click", (e)=>{
    const btn = e.target.closest("[data-highlight]");
    if(!btn) return;
    const h = state.highlights[Number(btn.dataset.highlight)];
    sheet(h.title, `<p>${h.desc}</p><p style="margin-top:10px;"><b>Sugerencia:</b> conecta esta sección a tu API de noticias/sedes.</p>`);
  });

  initCarouselGestures();
  setCarousel(0);
}

let carouselIndex = 0;
let carouselTimer = null;
function setCarousel(i){
  const track = $("#carouselTrack");
  const dots = $$("#carouselDots button");
  carouselIndex = (i + state.highlights.length) % state.highlights.length;
  track.style.transform = `translateX(${-carouselIndex*100}%)`;
  dots.forEach((d, idx)=>d.classList.toggle("active", idx===carouselIndex));

  clearInterval(carouselTimer);
  carouselTimer = setInterval(()=>setCarousel(carouselIndex+1), 5200);
}

function initCarouselGestures(){
  const el = $("#carousel");
  let startX = 0, dx = 0, dragging=false;

  const onDown = (x)=>{ startX=x; dx=0; dragging=true; clearInterval(carouselTimer); };
  const onMove = (x)=>{
    if(!dragging) return;
    dx = x - startX;
  };
  const onUp = ()=>{
    if(!dragging) return;
    dragging=false;
    if(Math.abs(dx) > 40){
      setCarousel(carouselIndex + (dx<0 ? 1 : -1));
    } else {
      setCarousel(carouselIndex);
    }
  };

  el.addEventListener("touchstart", e=>onDown(e.touches[0].clientX), {passive:true});
  el.addEventListener("touchmove", e=>onMove(e.touches[0].clientX), {passive:true});
  el.addEventListener("touchend", onUp);

  // mouse
  el.addEventListener("mousedown", e=>onDown(e.clientX));
  window.addEventListener("mousemove", e=>onMove(e.clientX));
  window.addEventListener("mouseup", onUp);
}

function renderNewsFeed(targetEl, limit=null){
  const el = typeof targetEl === "string" ? $(targetEl) : targetEl;
  el.innerHTML = "";

  const list = state.news
    .filter(n => state.newsFilter === "Todos" ? true : n.category === state.newsFilter)
    .slice(0, limit ?? state.news.length);

  list.forEach((n)=>{
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <button class="cardbtn">
        <div class="card-inner">
          <div class="card-illus"><img src="${n.img}" alt="" /></div>
          <div class="card-text">
            <div class="card-title">${n.title}</div>
            <p class="card-sub">${n.desc}</p>
          </div>
        </div>
        <div class="card-meta">
          <div class="meta-pill">${n.category}</div>
          <div class="meta-time">${n.when}</div>
        </div>
      </button>
    `;
    card.querySelector("button").addEventListener("click", ()=>{
      sheet(n.title, `<p><b>${n.category}</b> • ${n.when}</p><p style="margin-top:10px;">${n.detail}</p>`);
    });
    el.appendChild(card);
  });

  if(list.length === 0){
    el.innerHTML = `<div class="card"><div class="card-inner"><div class="card-title">Sin resultados</div><p class="card-sub">Cambia el filtro para ver otras noticias.</p></div></div>`;
  }
}

function renderHome(){
  $("#helloName").textContent = state.user?.name || "Usuario";
  $("#avatarImg").src = state.user?.avatar || "assets/avatar_doctor.svg";
  renderCarousel();
  renderNewsFeed("#newsFeed", 3);
}

function renderNewsAll(){
  const cats = ["Todos", ...new Set(state.news.map(n=>n.category))];
  const chips = $("#newsChips");
  chips.innerHTML = "";
  cats.forEach(c=>{
    const b = document.createElement("button");
    b.className = "chip" + (c===state.newsFilter ? " active":"");
    b.textContent = c;
    b.addEventListener("click", ()=>{
      state.newsFilter = c;
      renderNewsAll();
    });
    chips.appendChild(b);
  });
  renderNewsFeed("#newsAll");
}

function renderSedes(){
  const list = $("#sedesList");
  list.innerHTML = "";
  state.sedes.forEach(s=>{
    const item = document.createElement("div");
    item.className = "item";
    item.innerHTML = `
      <div class="item-ic"><img src="assets/ic_pin.svg" alt="" /></div>
      <div>
        <div class="item-title">${s.name}</div>
        <p class="item-sub">${s.address}<br><span style="opacity:.9">${s.hours}</span></p>
      </div>
      <div class="item-actions">
        <div class="pill">${s.status}</div>
        <button class="pill" style="border-color:rgba(247,162,139,0.28);background:rgba(247,162,139,0.10)">Contactar</button>
      </div>
    `;
    item.querySelectorAll(".pill")[1].addEventListener("click", ()=>{
      sheet(`Sede ${s.name}`, `
        <p><b>Dirección:</b> ${s.address}</p>
        <p><b>Horario:</b> ${s.hours}</p>
        <p><b>Tel:</b> ${s.phone}</p>
        <p style="margin-top:10px;color:rgba(255,255,255,0.72)">Aquí puedes conectar WhatsApp / llamada / mapa real.</p>
      `);
    });
    list.appendChild(item);
  });
}

function setRing(balance, goal){
  const pct = Math.max(0, Math.min(1, balance/goal));
  const r = 46;
  const c = 2*Math.PI*r;
  const dash = pct*c;
  $("#ringFg").style.strokeDasharray = `${dash} ${c-dash}`;
  $("#ringLabel").textContent = `${Math.round(pct*100)}%`;
}

function renderRewards(){
  $("#pointsBalance").textContent = formatInt(state.points.balance);
  setRing(state.points.balance, state.points.goal);

  const tl = $("#pointsTimeline");
  tl.innerHTML = "";
  state.points.events.forEach(ev=>{
    const el = document.createElement("div");
    el.className = "event";
    const pts = ev.pts > 0 ? `+${formatInt(ev.pts)}` : `${formatInt(ev.pts)}`;
    el.innerHTML = `
      <div class="event-dot"></div>
      <div style="flex:1">
        <div class="event-title">${ev.title} <span style="float:right; font-weight:1000">${pts}</span></div>
        <p class="event-sub">${ev.desc}</p>
        <div class="event-meta">${daysAgo(ev.day)}</div>
      </div>
    `;
    tl.appendChild(el);
  });
}

function drawBars(canvas, values){
  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0,0,w,h);

  // background grid
  ctx.globalAlpha = 0.7;
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1;
  for(let y=20;y<h;y+=40){
    ctx.beginPath(); ctx.moveTo(12,y); ctx.lineTo(w-12,y); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const max = Math.max(...values) * 1.15;
  const pad = 18;
  const bw = (w - pad*2) / values.length - 10;
  values.forEach((v,i)=>{
    const x = pad + i*(bw+10);
    const bh = Math.max(6, (v/max) * (h-42));
    const y = h - 18 - bh;

    // bar
    ctx.fillStyle = "rgba(255,255,255,0.86)";
    roundRect(ctx, x, y, bw, bh, 10);
    ctx.fill();

    // cap highlight (brand tint)
    ctx.fillStyle = "rgba(247,162,139,0.55)";
    roundRect(ctx, x, y, bw, Math.min(22, bh), 10);
    ctx.fill();

    // label
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.font = "700 11px Poppins, Arial";
    ctx.textAlign = "center";
    ctx.fillText(`S${i+1}`, x + bw/2, h - 6);
  });
}

function roundRect(ctx, x, y, w, h, r){
  const rr = Math.min(r, w/2, h/2);
  ctx.beginPath();
  ctx.moveTo(x+rr, y);
  ctx.arcTo(x+w, y, x+w, y+h, rr);
  ctx.arcTo(x+w, y+h, x, y+h, rr);
  ctx.arcTo(x, y+h, x, y, rr);
  ctx.arcTo(x, y, x+w, y, rr);
  ctx.closePath();
}

function renderCommissions(){
  $("#commMonth").textContent = formatMoney(state.commissions.month);
  $("#commPatients").textContent = String(state.commissions.patients);

  // draw chart
  const canvas = $("#barChart");
  drawBars(canvas, state.commissions.weeks);

  // leaderboard
  const names = [
    "Dra. Mariana López", "Dr. Luis Hernández", "Dra. Sofía Ríos",
    "Dr. Ricardo Vela", "Dra. Paulina Gómez", "Dr. Andrés Silva"
  ];
  const rows = names.map(n=>({
    name:n,
    sub:"Puntos acumulados",
    val: 8000 + Math.floor(Math.random()*9000),
  })).sort((a,b)=>b.val-a.val).slice(0,5);

  const lb = $("#leaderboard");
  lb.innerHTML = "";
  rows.forEach((r, i)=>{
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `
      <div class="rank">${i+1}</div>
      <div class="row-main">
        <div class="row-name">${r.name}</div>
        <div class="row-sub">${r.sub}</div>
      </div>
      <div class="row-val">${formatInt(r.val)}</div>
    `;
    row.addEventListener("click", ()=>{
      sheet(r.name, `<p><b>${formatInt(r.val)}</b> puntos</p><p style="margin-top:10px;">Aquí puedes mostrar detalle por sede, por mes y por tipo de actividad.</p>`);
    });
    lb.appendChild(row);
  });
}

function renderProfile(){
  $("#profileName").textContent = state.user?.fullName || state.user?.name || "Usuario";
  $("#profileRole").textContent = state.user?.role || "Perfil";
  $("#profileEmail").textContent = state.user?.email || "usuario@sanare.com";
  $("#profileAvatar").src = state.user?.avatar || "assets/avatar_doctor.svg";
  $("#profileId").textContent = state.user?.id || "SN-000-0000";
  $("#profilePhone").textContent = state.user?.phone || "+52 55 0000 0000";
  $("#profileStatus").textContent = "Activo";
}

function loginAs(type){
  if(type === "doctor"){
    state.user = {
      type: "doctor",
      name: "Dra. Mariana",
      fullName: "Dra. Mariana López",
      role: "Médico referente",
      email: "mariana@sanare.com",
      phone: "+52 55 0000 0000",
      id: "SN-204-9921",
      avatar: "assets/avatar_doctor.svg",
    };
    $("#notifBadge").textContent = "3";
  } else {
    state.user = {
      type: "kam",
      name: "KAM Andrea",
      fullName: "Andrea • KAM Sanaré",
      role: "Key Account Manager",
      email: "andrea@sanare.com",
      phone: "+52 55 0000 0000",
      id: "SN-KAM-1402",
      avatar: "assets/avatar_kam.svg",
    };
    $("#notifBadge").textContent = "1";
  }
  localStorage.setItem("sanare_user", JSON.stringify(state.user));
  toast("Sesión iniciada");
  setScreen("home");
}

function logout(){
  localStorage.removeItem("sanare_user");
  state.user = null;
  state.prev = [];
  toast("Sesión cerrada");
  setScreen("login", false);
}

// Wire UI
function wire(){
  // time
  setInterval(()=>$("#sbTime").textContent = nowTime(), 1000);
  $("#sbTime").textContent = nowTime();

  // bottom tabs
  $$("#bottomnav .tab").forEach(t=>{
    t.addEventListener("click", ()=>setScreen(t.dataset.nav));
  });

  // quick nav
  $$(".quick").forEach(q=>{
    q.addEventListener("click", ()=>setScreen(q.dataset.nav));
  });

  // open profile
  $("#openProfile").addEventListener("click", ()=>setScreen("profile"));
  $("#openInbox").addEventListener("click", ()=>sheet("Notificaciones", "<p>• Recordatorio: sesión clínica mensual<br>• Nuevo protocolo de seguridad<br>• Actualización de sede Roma Sur</p>"));

  // back buttons
  $$("[data-back]").forEach(b=>b.addEventListener("click", back));

  // sheet close
  $$("[data-close]").forEach(b=>b.addEventListener("click", closeSheet));
  $("#sheet").addEventListener("click", (e)=>{
    if(e.target.classList.contains("sheet-backdrop")) closeSheet();
  });

  // login
  $("#demoDoctorBtn").addEventListener("click", ()=>loginAs("doctor"));
  $("#demoKAMBtn").addEventListener("click", ()=>loginAs("kam"));
  $("#loginBtn").addEventListener("click", ()=>{
    // simple validation
    const email = $("#loginEmail").value.trim();
    const pass = $("#loginPass").value.trim();
    if(!email || !pass){
      toast("Completa correo y contraseña");
      return;
    }
    loginAs("doctor");
  });

  // home shuffle
  $("#shuffleHighlights").addEventListener("click", ()=>{
    state.highlights = [...state.highlights].sort(()=>Math.random()-0.5);
    renderCarousel();
    toast("Destacados actualizados");
  });

  // news filter icon
  $("#filterNews").addEventListener("click", ()=>{
    sheet("Filtrar noticias", "<p>Usa los chips para filtrar por categoría.</p>");
  });

  // sedes
  $("#openMap").addEventListener("click", ()=>sheet("Mapa", "<p>Mapa demo. Conecta aquí Google Maps / Mapbox y geolocalización.</p>"));
  $("#sortSedes").addEventListener("click", ()=>{
    state.sedes = [...state.sedes].sort((a,b)=>a.name.localeCompare(b.name));
    renderSedes();
    toast("Ordenado por nombre");
  });

  // rewards
  $("#redeemBtn").addEventListener("click", ()=>sheet("Canjear", "<p>Catálogo demo: cursos, sesiones y beneficios.</p>"));
  $("#toggleRules").addEventListener("click", ()=>sheet("Reglas de puntos", "<p><b>Ejemplo:</b><br>• Referencia validada: +500<br>• Seguimiento de ciclo: +200<br>• Capacitación: +300</p>"));
  $("#refreshPoints").addEventListener("click", ()=>{
    // add a random event
    const options = [
      { title:"Referencia registrada", desc:"Paciente canalizado y agendado.", pts:+500 },
      { title:"Seguimiento de ciclo", desc:"Reporte y control de síntomas.", pts:+200 },
      { title:"Capacitación completada", desc:"Sesión clínica registrada.", pts:+300 },
    ];
    const pick = options[Math.floor(Math.random()*options.length)];
    state.points.events.unshift({ ...pick, day: Math.floor(Math.random()*2) });
    state.points.balance += pick.pts;
    renderRewards();
    toast("Actividad actualizada");
  });

  // commissions
  $("#exportComms").addEventListener("click", ()=>sheet("Exportar", "<p>Conecta aquí exportación PDF/Excel del resumen mensual.</p>"));
  $("#toggleChart").addEventListener("click", (e)=>{
    const btn = e.currentTarget;
    if(btn.textContent === "Semanal"){
      btn.textContent = "Mensual";
      state.commissions.weeks = [18000, 24300, 21000, 28600];
    } else {
      btn.textContent = "Semanal";
      state.commissions.weeks = [9800, 11200, 8600, 12700];
    }
    renderCommissions();
  });
  $("#shuffleTop").addEventListener("click", ()=>{
    renderCommissions();
    toast("Ranking actualizado");
  });

  // profile
  $("#logoutBtn").addEventListener("click", logout);
  $("#copyId").addEventListener("click", ()=>{
    navigator.clipboard?.writeText($("#profileId").textContent).catch(()=>{});
    toast("ID copiado");
  });
  $("#toggleTheme").addEventListener("click", ()=>{
    setTheme(state.theme === "dark" ? "light" : "dark");
    toast(state.theme === "dark" ? "Tema oscuro" : "Tema claro");
  });
}


let _healthTimer = null;

function fmtTime(d){
  return d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

function bump(val, min, max, step){
  const dir = (Math.random() - 0.5) * 2;
  let v = val + dir*step;
  v = Math.max(min, Math.min(max, v));
  return v;
}

function renderHealth(){
  const g = $("#healthGrid");
  const last = $("#healthLast");
  const btn = $("#healthConnectBtn");
  const simBtn = $("#healthSimBtn");

  // Update header button label
  btn.textContent = state.health.connected ? "Desconectar" : "Conectar";
  btn.classList.toggle("pill--on", state.health.connected);

  // Render cards
  const r = state.health.readings;
  const connected = state.health.connected;
  const dotCls = connected ? "dot dot--on" : "dot";

  const cards = [
    { key:"bp", label:"Presión arterial", value:r.bp, sub:"mmHg · automático" },
    { key:"glucose", label:"Glucosa", value:`${r.glucose}`, sub:"mg/dL · capilar" },
    { key:"spo2", label:"SpO₂", value:`${r.spo2}%`, sub:"oxigenación" },
    { key:"hr", label:"Frecuencia", value:`${r.hr}`, sub:"lpm · pulso" },
    { key:"temp", label:"Temperatura", value:`${r.temp.toFixed(1)}°`, sub:"°C · estimada" },
  ];

  g.innerHTML = cards.map(c=>`
    <div class="health-card" data-health="${c.key}">
      <div style="display:flex; align-items:center; justify-content:space-between;">
        <div class="${dotCls}" title="${connected ? "Conectado" : "Sin conexión"}"></div>
        <button class="link" data-manual="${c.key}">Editar</button>
      </div>
      <div class="health-kpi" style="margin-top:10px;">${c.value}</div>
      <div class="health-label">${c.label}</div>
      <div class="health-sub">${c.sub}</div>
    </div>
  `).join("");

  // Last update
  if(state.health.last){
    last.textContent = `Última actualización: ${fmtTime(state.health.last)}`;
  } else {
    last.textContent = connected ? "Conectado" : "Sin conexión";
  }

  // Bind actions
  btn.onclick = () => toggleHealthConnection();
  simBtn.onclick = () => {
    state.health.sim = !state.health.sim;
    toast(state.health.sim ? "Simulación activada" : "Simulación detenida");
    if(state.health.sim) {
      state.health.connected = true;
      startHealthStream();
    } else {
      stopHealthStream();
      state.health.connected = false;
      state.health.last = null;
      renderHealth();
    }
  };

  $("#healthHowBtn").onclick = () => {
    sheet("Integración pulsera (idea)", `
      <p style="margin:0 0 10px 0;color:rgba(255,255,255,0.82);line-height:1.45;">
        Para tiempo real hay dos caminos comunes:
      </p>
      <ul style="margin:0;padding-left:18px;color:rgba(255,255,255,0.82);line-height:1.55;">
        <li><b>Bluetooth (BLE)</b>: la app se empareja con la pulsera y lee características (GATT). En web se puede con <b>Web Bluetooth</b> (Chrome/Android), o en app nativa (Flutter/React Native).</li>
        <li><b>API del fabricante</b>: la pulsera envía a la nube del proveedor y tú consumes por API/Webhook (ideal para iOS y segundo plano).</li>
      </ul>
      <p style="margin:10px 0 0 0;color:rgba(255,255,255,0.62);font-size:12px;line-height:1.45;">
        Nota: Esta pantalla es demo UI. La conexión real depende del modelo de pulsera y permisos.
      </p>
    `);
  };

  $$("[data-manual]").forEach(b=>{
    b.onclick = (e)=>{
      const key = e.currentTarget.getAttribute("data-manual");
      openManualEntry(key);
    };
  });
}

function openManualEntry(key){
  const labels = { bp:"Presión arterial", glucose:"Glucosa", spo2:"SpO₂", hr:"Frecuencia", temp:"Temperatura" };
  const unit = { bp:"mmHg (ej. 120/80)", glucose:"mg/dL", spo2:"%", hr:"lpm", temp:"°C" };
  const current = state.health.readings[key];

  sheet(`Editar · ${labels[key]}`, `
    <label class="field">
      <div class="field-label">Valor (${unit[key]})</div>
      <input class="input" id="manualVal" value="${current}" />
    </label>
    <button class="btn btn--primary" id="saveManual">Guardar</button>
  `);

  $("#saveManual").onclick = ()=>{
    const v = $("#manualVal").value.trim();
    if(!v) return;
    if(key === "glucose" || key === "spo2" || key === "hr"){
      state.health.readings[key] = parseInt(v,10) || state.health.readings[key];
    } else if(key === "temp"){
      state.health.readings[key] = parseFloat(v) || state.health.readings[key];
    } else {
      state.health.readings[key] = v;
    }
    state.health.last = new Date();
    toast("Actualizado");
    closeSheet();
    renderHealth();
  };
}

function toggleHealthConnection(){
  state.health.connected = !state.health.connected;
  if(state.health.connected){
    startHealthStream();
    toast("Conectado (demo)");
  } else {
    stopHealthStream();
    state.health.last = null;
    toast("Desconectado");
  }
  renderHealth();
}

function startHealthStream(){
  stopHealthStream();
  _healthTimer = setInterval(()=>{
    // small random walk
    let hr = bump(state.health.readings.hr, 55, 120, 3);
    let spo2 = bump(state.health.readings.spo2, 92, 100, 1.2);
    let glucose = bump(state.health.readings.glucose, 70, 160, 4);
    let temp = bump(state.health.readings.temp, 35.8, 38.2, 0.08);

    // BP as systolic/diastolic
    const parts = (""+state.health.readings.bp).split("/");
    let sys = parseInt(parts[0]||"118",10);
    let dia = parseInt(parts[1]||"76",10);
    sys = Math.round(bump(sys, 95, 155, 2.2));
    dia = Math.round(bump(dia, 60, 100, 1.6));

    state.health.readings = { ...state.health.readings, hr: Math.round(hr), spo2: Math.round(spo2), glucose: Math.round(glucose), temp: temp, bp: `${sys}/${dia}` };
    state.health.last = new Date();

    // Update only if on health screen
    if(state.screen === "health") renderHealth();
  }, 1800);
}

function stopHealthStream(){
  if(_healthTimer){ clearInterval(_healthTimer); _healthTimer = null; }
}

function boot(){
  initData();
  setTheme(state.theme);

  const saved = localStorage.getItem("sanare_user");
  if(saved){
    try { state.user = JSON.parse(saved); } catch {}
  }

  wire();

  if(state.user){
    setScreen("home", false);
  } else {
    setScreen("login", false);
  }
}

boot();
