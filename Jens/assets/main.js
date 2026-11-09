/* JenS algemeen schrijnwerken – interactie en animatie */
(() => {
  const d = document, root = d.documentElement, body = d.body;
  root.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* jaartal */
  d.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  /* header + voortgangsbalk + naar-boven */
  const hdr = d.querySelector('.hdr'), bar = d.querySelector('.progress'), top = d.querySelector('.to-top');
  const onScroll = () => {
    const y = scrollY, h = root.scrollHeight - innerHeight;
    hdr.classList.toggle('solid', y > 40);
    if (bar) bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    if (top) top.classList.toggle('show', y > 700);
  };
  let ticking = false;
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { onScroll(); ticking = false; }); } }, { passive: true }); onScroll();
  top && top.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  /* mobiel menu */
  const burger = d.querySelector('.burger');
  burger && burger.addEventListener('click', () => {
    const open = body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', open);
    d.querySelector('.mnav').setAttribute('aria-hidden', !open);
    d.querySelectorAll('.mnav a.m').forEach((a, i) => a.style.transitionDelay = open ? `${.25 + i * .05}s` : '0s');
  });
  addEventListener('keydown', e => { if (e.key === 'Escape' && body.classList.contains('menu-open')) burger.click(); });

  /* paginaovergang als terugval voor browsers zonder view transitions */
  if (!('onpagereveal' in window) && !reduce) {
    d.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname || !/\.html$|\/$/.test(url.pathname)) return;
      e.preventDefault();
      body.classList.add('leaving');
      setTimeout(() => location.href = a.href, 520);
    });
    addEventListener('pageshow', () => body.classList.remove('leaving'));
  }

  /* onthullen bij scrollen */
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { threshold: .14, rootMargin: '0px 0px -40px 0px' });
  d.querySelectorAll('.rv,.rv-l,.rv-img').forEach(el => io.observe(el));

  /* tellers */
  const cio = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target, end = +el.dataset.count, dur = 1600, t0 = performance.now();
    const tick = t => { const p = Math.min((t - t0) / dur, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + (el.dataset.suffix || ''); if (p < 1) requestAnimationFrame(tick); };
    reduce ? el.textContent = end + (el.dataset.suffix || '') : requestAnimationFrame(tick);
    cio.unobserve(el);
  }), { threshold: .6 });
  d.querySelectorAll('[data-count]').forEach(el => cio.observe(el));

  /* lijnlengte voor tekenanimatie */
  d.querySelectorAll('.draw').forEach(p => { try { p.style.setProperty('--len', Math.ceil(p.getTotalLength()) + 1); } catch (_) {} });

  /* lichte parallax op het heldenbeeld */
  const par = d.querySelector('[data-parallax]');
  if (par && !reduce) addEventListener('scroll', () => { par.style.transform = `translateY(${scrollY * .12}px)`; }, { passive: true });

  /* diensten: actieve subnavigatie */
  const sub = d.querySelectorAll('.subnav a, .faq-side a');
  if (sub.length) {
    const map = new Map([...sub].map(a => [a.getAttribute('href').slice(1), a]));
    const sio = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) { sub.forEach(a => a.classList.remove('on')); const a = map.get(en.target.id); if (a) { a.classList.add('on'); const box = a.parentElement; if (box.scrollWidth > box.clientWidth) box.scrollTo({ left: a.offsetLeft - (box.clientWidth - a.offsetWidth) / 2, behavior: 'smooth' }); } }
    }), { rootMargin: '-40% 0px -55% 0px' });
    map.forEach((_, id) => { const s = d.getElementById(id); s && sio.observe(s); });
  }

  /* realisaties: filter + lightbox */
  const filters = d.querySelectorAll('.filters button');
  filters.forEach(b => b.addEventListener('click', () => {
    filters.forEach(x => x.setAttribute('aria-pressed', x === b));
    const f = b.dataset.f;
    d.querySelectorAll('.gallery .item').forEach(it => {
      const show = f === 'alle' || it.dataset.cat === f;
      it.classList.toggle('hide', !show);
      if (show) { it.classList.remove('pop'); void it.offsetWidth; it.classList.add('pop'); }
    });
  }));
  const lb = d.querySelector('.lb');
  if (lb) {
    let last;
    const close = () => { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); body.style.overflow = ''; last && last.focus(); };
    d.querySelectorAll('.proj[data-title]').forEach(p => p.addEventListener('click', () => {
      last = p;
      const imgs = (p.dataset.imgs || '').split(',').filter(Boolean), art = lb.querySelector('.lb-art'), th = lb.querySelector('.lb-thumbs');
      const show = k => { art.innerHTML = `<img src="assets/foto/${imgs[k]}.jpg" alt="${p.dataset.title} – foto ${k + 1}">`; th.querySelectorAll('button').forEach((b, n) => b.setAttribute('aria-current', n === k)); };
      th.innerHTML = imgs.length > 1 ? imgs.map((n, k) => `<button type="button" aria-label="Foto ${k + 1}"><img src="assets/foto/${n}.jpg" alt=""></button>`).join('') : '';
      th.querySelectorAll('button').forEach((b, k) => b.addEventListener('click', () => show(k)));
      show(0);
      lb.querySelector('small').textContent = p.dataset.cat + (imgs.length > 1 ? ` · ${imgs.length} foto's` : '');
      lb.querySelector('h3').textContent = p.dataset.title;
      lb.querySelector('p').textContent = p.dataset.text;
      lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); body.style.overflow = 'hidden';
      lb.querySelector('.lb-close').focus();
    }));
    lb.addEventListener('click', e => { if (e.target === lb || e.target.closest('.lb-close')) close(); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && lb.classList.contains('open')) close(); });
  }

  /* werkwijze: tijdlijn vult mee bij scrollen */
  const tl = d.querySelector('.timeline');
  if (tl) {
    const fill = tl.querySelector('.rail i'), steps = tl.querySelectorAll('.step');
    const upd = () => {
      const r = tl.getBoundingClientRect(), mid = innerHeight * .55;
      const p = Math.max(0, Math.min(1, (mid - r.top) / r.height));
      fill.style.height = (p * 100) + '%';
      steps.forEach(s => s.classList.toggle('lit', s.getBoundingClientRect().top < mid));
    };
    addEventListener('scroll', upd, { passive: true }); upd();
  }

  /* FAQ-accordeon */
  d.querySelectorAll('.qa button').forEach(b => b.addEventListener('click', () => {
    const qa = b.parentElement, open = !qa.classList.contains('open');
    qa.classList.toggle('open', open); b.setAttribute('aria-expanded', open);
  }));

  /* contactformulier: opent de mail van de bezoeker (geen server nodig) */
  const form = d.querySelector('#offerte');
  if (form) {
    const pre = new URLSearchParams(location.search).get('type');
    if (pre) { const r = form.querySelector(`input[name=type][value="${pre}"]`); if (r) r.checked = true; }
    form.addEventListener('submit', e => {
      e.preventDefault();
      const msg = form.querySelector('.form-msg'), v = n => (form.elements[n] && form.elements[n].value || '').trim();
      if (!form.checkValidity()) { msg.className = 'form-msg err'; msg.textContent = 'Vul de verplichte velden in en vink het akkoord aan.'; form.reportValidity(); return; }
      const type = (form.querySelector('input[name=type]:checked') || {}).value || 'Algemeen';
      const lines = [`Soort werk: ${type}`, `Naam: ${v('naam')}`, `E-mail: ${v('email')}`, `Telefoon: ${v('tel')}`, `Gemeente: ${v('gemeente')}`, `Gewenste timing: ${v('timing')}`, '', v('bericht')];
      location.href = `mailto:${form.dataset.to}?subject=${encodeURIComponent('Offerteaanvraag – ' + type)}&body=${encodeURIComponent(lines.join('\n'))}`;
      msg.className = 'form-msg ok'; msg.textContent = 'Bedankt! Uw mailprogramma opent met de aanvraag. Verstuur die mail om ze bij Jens te laten aankomen.';
    });
  }
})();
