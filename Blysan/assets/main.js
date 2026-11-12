/* Electro Blysan – gedrag voor alle pagina's. Elk onderdeel draait enkel als het op de pagina staat.
   Openingsuren en werkgebied komen uit assets/settings.js. */
(() => {
  const S = window.EB_SETTINGS || {};
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ----- Thema (licht/donker) ----- */
  const root = document.documentElement;
  try { const t = localStorage.getItem('eb-theme'); if (t) root.dataset.theme = t; } catch (_) {}
  const tt = $('#themeToggle');
  if (tt) tt.addEventListener('click', () => {
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('eb-theme', root.dataset.theme); } catch (_) {}
  });
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  /* ----- Navigatie ----- */
  const nav = $('#nav'), top = $('#top');
  const onScroll = () => {
    nav.classList.toggle('scrolled', scrollY > 30);
    nav.classList.toggle('on-hero', !!top && scrollY < top.offsetHeight - 80);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const menuBtn = $('#menuBtn'), links = $('#links');
  const closeMenu = () => { links.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); };
  menuBtn.addEventListener('click', () => {
    links.style.top = (nav.getBoundingClientRect().bottom + 6) + 'px';
    const o = links.classList.toggle('open'); menuBtn.setAttribute('aria-expanded', o);
  });
  $$('a', links).forEach(a => a.addEventListener('click', closeMenu));
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* ----- Vaste offerteknop op gsm ----- */
  const sticky = $('#stickyCta');
  if (sticky) {
    const foot = $('footer.site');
    const onSticky = () => {
      const footVisible = foot.getBoundingClientRect().top < innerHeight;
      sticky.classList.toggle('show', scrollY > 420 && !footVisible);
    };
    addEventListener('scroll', onSticky, { passive: true }); onSticky();
  }

  /* ----- Lamp in de openingssectie ----- */
  const lampBox = $('#lampBox');
  if (lampBox) {
    const hero = $('.hero');
    const lampOn = () => {
      if (lampBox.classList.contains('on')) return;
      lampBox.classList.add('on'); hero.classList.add('lit');
      if (!reduce) { lampBox.classList.remove('flicker'); void lampBox.offsetWidth; lampBox.classList.add('flicker'); }
    };
    if (root.classList.contains('intro')) {
      // Intro (± 2 s): donker -> stroomlijnen tekenen zich -> lamp flikkert aan (1 s) -> pagina verschijnt (1,7 s). Klik of toets slaat over.
      const timers = [setTimeout(lampOn, 1000), setTimeout(() => endIntro(), 1700)];
      const endIntro = () => { timers.forEach(clearTimeout); lampOn(); root.classList.remove('intro'); onScroll(); };
      ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(ev => addEventListener(ev, endIntro, { once: true, passive: true }));
    } else {
      setTimeout(lampOn, reduce ? 0 : 500);
    }
  }

  /* ----- Zekeringkast ----- */
  const brk = $('#breakers');
  if (brk) {
    const kringen = [
      ['K1', 'Ground-floor lighting', 'Ceiling lights and spots in the living room, kitchen and hall.'],
      ['K2', 'Living-room sockets', 'Up to 8 single or multiple sockets per circuit (Belgian rules).'],
      ['K3', 'Kitchen', 'Separate circuits for oven, hob and dishwasher.'],
      ['K4', 'Laundry', 'Washing machine and dryer each on their own circuit.'],
      ['K5', 'EV charger', 'A dedicated circuit with matching protection.'],
      ['K6', 'Outdoor', 'Garden lighting and outdoor sockets, waterproof.']
    ];
    const bTxt = $('#boardTxt'), bOut = $('#boardOut'), bCount = $('#boardCount');
    kringen.forEach(([k, n, d]) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'breaker'; b.setAttribute('aria-pressed', 'false');
      b.setAttribute('aria-label', `${k}: ${n}`); b.innerHTML = `<i class="lever"></i><span>${k}</span>`;
      b.addEventListener('click', () => {
        const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', on);
        const n2 = $$('.breaker[aria-pressed="true"]', brk).length;
        bCount.textContent = `${n2} / 6 on`; bOut.classList.toggle('live', n2 > 0);
        bTxt.innerHTML = on ? `<b>${k} · ${n}</b> – ${d}` : `${k} switched off.`;
      });
      brk.appendChild(b);
    });
  }

  /* ----- Elementen schuiven in beeld ----- */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .12, rootMargin: '0px 0px -40px 0px' }) : null;
  $$('.reveal').forEach(el => (reduce || !io) ? el.classList.add('in') : io.observe(el));

  /* ----- Werkwijze: stroomdraad vult zich bij het scrollen ----- */
  const stepsEl = $('#steps');
  if (stepsEl) {
    const wire = $('#wireFill'), steps = $$('.step', stepsEl);
    const onWire = () => {
      const r = stepsEl.getBoundingClientRect(), vh = innerHeight;
      let p = Math.min(1, Math.max(0, (vh * .75 - r.top) / (r.height + vh * .2)));
      if (reduce) p = r.top < vh ? 1 : 0;
      wire.style.setProperty('--p', p.toFixed(3));
      steps.forEach((s, i) => s.classList.toggle('live', p >= (i / steps.length) + .05));
    };
    addEventListener('scroll', onWire, { passive: true }); addEventListener('resize', onWire); onWire();
  }

  /* ----- Realisaties: filter ----- */
  const chips = $$('.chip[data-f]');
  chips.forEach(c => c.addEventListener('click', () => {
    chips.forEach(x => x.setAttribute('aria-pressed', x === c));
    const f = c.dataset.f;
    $$('#gallery .shot').forEach(s => s.classList.toggle('hide', f !== 'all' && s.dataset.cat !== f));
  }));

  /* ----- Werkgebied ----- */
  const towns = S.towns || [];
  const tl = $('#townList');
  if (tl) towns.forEach(t => { const li = document.createElement('li'); li.textContent = t.name; if (t.kind) li.className = 'k'; tl.appendChild(li); });
  const tg = $('#towns-g');
  if (tg && towns.length) {
    const NS = 'http://www.w3.org/2000/svg', lg = $('#links-g'), info = $('#townInfo');
    const home = towns.find(t => t.kind === 'home') || towns[0];
    const lines = [];
    towns.forEach((t, i) => {
      if (t !== home) {
        const l = document.createElementNS(NS, 'line'); l.setAttribute('class', 'link');
        l.setAttribute('x1', home.x); l.setAttribute('y1', home.y); l.setAttribute('x2', t.x); l.setAttribute('y2', t.y);
        lg.appendChild(l); lines[i] = l;
      }
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'town ' + (t.kind || '')); g.setAttribute('tabindex', 0); g.setAttribute('role', 'button'); g.setAttribute('aria-label', t.name);
      const right = t.x < 400;
      g.innerHTML = (t.kind === 'home' ? `<circle class="pulse-ring" cx="${t.x}" cy="${t.y}" r="10"/>` : '') +
        `<circle cx="${t.x}" cy="${t.y}" r="${t.kind === 'home' ? 10 : 7}"/>` +
        `<text x="${right ? t.x + 14 : t.x - 14}" y="${t.y + 4}" text-anchor="${right ? 'start' : 'end'}">${esc(t.name)}</text>`;
      const pick = () => {
        $$('.town', tg).forEach(x => x.classList.remove('sel')); g.classList.add('sel');
        lines.forEach((l, j) => l && l.classList.toggle('hot', j === i));
        info.innerHTML = `<b>${esc(t.name)}</b><p>${esc(t.note || '')}</p>`;
      };
      g.addEventListener('click', pick); g.addEventListener('mouseenter', pick);
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
      tg.appendChild(g);
    });
    info.innerHTML = `<b>${esc(home.name)}</b><p>${esc(home.note || '')}</p>`;
  }

  /* ----- Antwoordtermijn ----- */
  $$('[data-reply]').forEach(el => {
    if (S.replyWorkingDays) el.textContent = `${S.replyWorkingDays} working day${S.replyWorkingDays > 1 ? 's' : ''}`;
  });

  /* ----- Offerte-aanvraag in 4 stappen ----- */
  const form = $('#wizard');
  if (form) {
    const sel = $('#gem');
    towns.forEach(t => sel.insertAdjacentHTML('beforeend', `<option>${esc(t.name)}</option>`));
    sel.insertAdjacentHTML('beforeend', '<option>Other</option>');
    const pre = new URLSearchParams(location.search).get('service');
    if (pre) $$(`input[name="werk"][data-key="${pre}"]`, form).forEach(i => i.checked = true);

    const stepsW = $$('.wz-step', form), bars = $$('.meter i', form);
    const back = $('#wzBack'), next = $('#wzNext'), err = $('#wzErr'), navW = $('#wzNav'), status = $('#wzStatus');
    let cur = 0;
    const val = n => { const f = form.elements[n]; return f && f.value ? f.value : ''; };
    const checked = n => $$(`input[name="${n}"]:checked`, form).map(i => i.value);
    const mailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    const show = i => {
      cur = i; stepsW.forEach((s, j) => s.classList.toggle('active', j === i));
      bars.forEach((b, j) => b.classList.toggle('done', j < i || i === 4));
      back.style.visibility = i > 0 && i < 4 ? 'visible' : 'hidden';
      next.textContent = i === 3 ? 'Send request' : 'Next';
      navW.style.display = i === 4 ? 'none' : 'flex'; err.textContent = '';
      status.textContent = i < 4 ? `Step ${i + 1} of 4` : 'Request completed';
      if (i === 3) {
        const rows = [['Work', checked('werk').join(', ')], ['Property', checked('pand')[0]], ['Town', val('gemeente')], ['Installation', val('ouderdom')], ['Timing', checked('timing')[0]]];
        $('#summary').innerHTML = rows.map(([k, v]) => `<li><span>${k}</span><b>${esc(v || '–')}</b></li>`).join('');
      }
    };
    const validate = () => {
      if (cur === 0 && !checked('werk').length) return 'Choose at least one type of work.';
      if (cur === 1 && !checked('pand').length) return 'Choose the type of property.';
      if (cur === 2 && !checked('timing').length) return 'Let us know when the work should be done.';
      if (cur === 3) {
        const n = form.elements.naam, m = form.elements.mail;
        n.classList.toggle('bad', !n.value.trim()); m.classList.toggle('bad', !mailOk(m.value));
        if (!n.value.trim()) return 'Please enter your name.';
        if (!mailOk(m.value)) return 'Please enter a valid email address.';
      }
      return '';
    };
    next.addEventListener('click', () => {
      const e = validate(); if (e) { err.textContent = e; return; }
      if (cur === 3) $('#doneName').textContent = form.elements.naam.value.trim().split(' ')[0];
      show(cur + 1);
    });
    back.addEventListener('click', () => show(Math.max(0, cur - 1)));
    form.addEventListener('submit', e => { e.preventDefault(); next.click(); });
    $('#wzReset').addEventListener('click', () => { form.reset(); $$('.bad', form).forEach(x => x.classList.remove('bad')); show(0); });
  }

  /* ----- Openingsuren met live melding (Belgische tijd) ----- */
  const statusEl = $('#status');
  const weekEl = $('#week');
  if (statusEl || weekEl) {
    const keys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const toMin = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
    const uren = keys.map(k => ((S.hours || {})[k] || []).map(([a, b]) => [toMin(a), toMin(b)]));
    const fmt = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
    const now = () => {
      const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Brussels', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
        .formatToParts(new Date()).map(x => [x.type, x.value]));
      return { wd: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), min: +p.hour * 60 + +p.minute, txt: `${p.hour}:${p.minute}` };
    };
    const renderWeek = wd => {
      if (!weekEl) return;
      weekEl.innerHTML = [1, 2, 3, 4, 5, 6, 0].map(d =>
        `<li class="${d === wd ? 'today' : ''}"><span>${names[d]}${d === wd ? ' · today' : ''}</span><span>${uren[d].length ? uren[d].map(([a, b]) => fmt(a) + '–' + fmt(b)).join(' · ') : 'closed'}</span></li>`
      ).join('') + `<li class="wk-note">${S.hoursAreExample ? 'Example hours · ' : ''}${esc(S.hoursNote || '')}</li>`;
    };
    const nextOpen = (wd, min) => {
      for (let k = 0; k < 8; k++) {
        const d = (wd + k) % 7;
        for (const [a] of uren[d]) if (k > 0 || a > min) return { d, a, k };
      }
      return null;
    };
    let lastWd = -1;
    const tick = () => {
      const { wd, min, txt } = now();
      if (wd !== lastWd) { renderWeek(wd); lastWd = wd; }
      if (!statusEl) return;
      const c = $('#clockTxt'); if (c) c.textContent = txt;
      const slot = uren[wd].find(([a, b]) => min >= a && min < b);
      const card = $('#statusCard');
      if (slot) {
        statusEl.className = 'status open'; $('#statusTxt').textContent = 'Open now';
        $('#statusHead').textContent = `Open until ${fmt(slot[1])}`;
        const left = slot[1] - min;
        $('#statusSub').textContent = left <= 30 ? `${left} minutes left – feel free to give us a call.` : `Feel free to call or drop by${S.hoursAreExample ? ' (example hours)' : ''}.`;
        card.style.setProperty('--st', 'rgba(47,210,122,.25)');
      } else {
        statusEl.className = 'status closed'; $('#statusTxt').textContent = 'Closed now';
        const n = nextOpen(wd, min);
        $('#statusHead').textContent = n ? `Open again ${n.k === 0 ? 'today' : n.k === 1 ? 'tomorrow' : 'on ' + names[n.d]} at ${fmt(n.a)}` : 'Opening hours to be announced';
        $('#statusSub').textContent = 'In the meantime, feel free to leave a quote request.';
        card.style.setProperty('--st', 'rgba(255,107,107,.2)');
      }
    };
    tick(); setInterval(tick, 20000);
  }

  /* ----- Reviews ----- */
  const track = $('#rvTrack');
  if (track) {
    const by = dir => { const c = $('.rv', track); const w = c ? c.getBoundingClientRect().width + 18 : 300; track.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' }); };
    $('#rvPrev').addEventListener('click', () => by(-1)); $('#rvNext').addEventListener('click', () => by(1));
  }
})();
