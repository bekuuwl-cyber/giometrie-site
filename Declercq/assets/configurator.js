/* Configurator Metaal Declercq: stalen deuren en trapleuningen in 3D.
   Alle prijzen en grenzen komen uit prijzen.js (window.DECLERCQ). */
(function () {
  'use strict';
  var C = window.DECLERCQ;
  var root = document.querySelector('[data-configurator]');
  if (!root || !C) return;

  /* ------------------------------------------------------------ hulpjes */
  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return list[0]; }
  function euro(n, dec) {
    return '€ ' + Number(n).toLocaleString('nl-BE', { minimumFractionDigits: dec ? 2 : 0, maximumFractionDigits: dec ? 2 : 0 });
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function mm(n) { return Number(n).toLocaleString('nl-BE') + ' mm'; }

  var D = C.deur, L = C.leuning;
  var param = new URLSearchParams(location.search);
  var st = {
    product: param.get('p') === 'leuning' || param.get('p') === 'deur' ? param.get('p') : (root.getAttribute('data-product') || 'deur'),
    zone: C.levering.zones[0].id,
    deur: {
      type: D.types[0].id, dubbel: false, breedte: D.standaard.breedte, hoogte: D.standaard.hoogte,
      richting: 'links', kleur: C.kleuren[0].id, glas: D.glas[0].id,
      vakH: D.vakken.standaardHoogte, vakB: D.vakken.standaardBreedte, greep: D.grepen[0].id
    },
    leuning: {
      model: L.modellen[0].id, lengte: L.standaard.lengte, kleur: C.kleuren[0].id, lak: L.lak[0].id,
      bevestiging: 'muursteun', richting: 'rechts', extras: ['montageset']
    }
  };

  /* ------------------------------------------------------------ prijs */
  function grenzenDeur() { return st.deur.dubbel ? D.grenzen.dubbel : D.grenzen.enkel; }
  function bevestigingen() {
    var soort = byId(L.modellen, st.leuning.model).soort;
    return L.bevestiging.filter(function (b) { return b.voor === soort; });
  }
  function aantalSteunen() {
    var b = byId(L.bevestiging, st.leuning.bevestiging);
    return Math.ceil(st.leuning.lengte / b.afstand) + 1;
  }
  function leverPrijs(pakket) { return byId(C.levering.zones, st.zone)[pakket]; }
  function pakketSoort() {
    if (st.product === 'deur') return 'deur';
    return st.leuning.lengte > C.levering.langVanaf ? 'lang' : 'kort';
  }

  function bereken() {
    var r = [], fout = [];
    if (st.product === 'deur') {
      var s = st.deur, t = byId(D.types, s.type), g = grenzenDeur();
      var B = s.breedte, H = s.hoogte, opp = B * H / 1e6, n = s.dubbel ? 2 : 1;
      if (!(B >= g.breedteMin && B <= g.breedteMax)) fout.push('breedte ' + mm(B) + ' (mogelijk: ' + g.breedteMin + ' tot ' + g.breedteMax + ' mm)');
      if (!(H >= g.hoogteMin && H <= g.hoogteMax)) fout.push('hoogte ' + mm(H) + ' (mogelijk: ' + g.hoogteMin + ' tot ' + g.hoogteMax + ' mm)');
      r.push([t.naam + (s.dubbel ? ', dubbel' : '') + ', ' + B + ' × ' + H + ' mm', t.basis + opp * t.perM2]);
      if (s.dubbel) r.push(['Tweede vleugel (hang- en sluitwerk)', D.dubbelToeslag]);
      var gl = byId(D.glas, s.glas);
      if (gl.perM2) r.push([gl.naam, opp * gl.perM2]);
      var roedeM = n * ((s.vakH - 1) * (B / n) + (s.vakB - 1) * H) / 1000;
      if (roedeM > 0) r.push(['Verdeling ' + s.vakB + ' × ' + s.vakH + ' vakken', roedeM * D.roedePerMeter]);
      var k = byId(C.kleuren, s.kleur);
      if (k.toeslag) r.push(['Kleur ' + k.naam, k.toeslag]);
      var gr = byId(D.grepen, s.greep);
      if (gr.prijs) r.push([gr.naam + (n > 1 && s.type === 'schuif' ? ' (2 stuks)' : ''), gr.prijs * (s.type === 'schuif' ? n : 1)]);
    } else {
      var l = st.leuning, m = byId(L.modellen, l.model), lk = byId(L.lak, l.lak), Lm = l.lengte / 1000;
      if (!(l.lengte >= L.grenzen.lengteMin && l.lengte <= L.grenzen.lengteMax)) fout.push('lengte ' + mm(l.lengte) + ' (mogelijk: ' + L.grenzen.lengteMin + ' tot ' + L.grenzen.lengteMax + ' mm)');
      r.push([m.naam + ', ' + l.lengte + ' mm', m.basis + Lm * m.perMeter]);
      if (lk.factor !== 1) r.push([lk.naam, (m.basis + Lm * m.perMeter) * (lk.factor - 1)]);
      var kl = byId(C.kleuren, l.kleur);
      if (kl.toeslag) r.push(['Kleur ' + kl.naam, kl.toeslag]);
      var b = byId(L.bevestiging, l.bevestiging), ns = aantalSteunen();
      r.push([b.naam + ' (' + ns + ' stuks)', ns * b.perStuk]);
      l.extras.forEach(function (id) { var e = byId(L.extras, id); r.push([e.naam, e.prijs]); });
    }
    r = r.map(function (x) { return [x[0], Math.round(x[1])]; });
    var product = r.reduce(function (a, x) { return a + x[1]; }, 0);
    var lever = leverPrijs(pakketSoort());
    return { regels: r, product: product, levering: lever, totaal: product + lever, fout: fout };
  }

  /* ------------------------------------------------------------ opbouw scherm */
  root.innerHTML =
    '<div class="cfg-grid">' +
      '<div class="cfg-view">' +
        '<div class="cfg-canvas" tabindex="0" aria-label="3D-voorbeeld. Sleep om te draaien, gebruik de pijltjestoetsen of knijp om te zoomen."></div>' +
        '<div class="cfg-maat" aria-hidden="true"></div>' +
        '<div class="cfg-tools"><span class="cfg-hint">Sleep om rond te draaien</span><button type="button" class="cfg-reset">Vooraanzicht</button></div>' +
      '</div>' +
      '<div class="cfg-panel">' +
        '<div class="cfg-switch" role="radiogroup" aria-label="Product">' +
          '<label><input type="radio" name="product" value="deur"><span>Stalen deur</span></label>' +
          '<label><input type="radio" name="product" value="leuning"><span>Trapleuning</span></label>' +
        '</div>' +
        '<form class="cfg-opties" novalidate onsubmit="return false"></form>' +
        '<div class="cfg-prijs" id="cfg-prijs">' +
          '<p class="cfg-vb">Voorbeeldprijzen. Uw eigen prijzen komen hier.</p>' +
          '<dl class="cfg-regels"></dl>' +
          '<label class="cfg-zone"><span>Levering naar</span><select name="zone">' +
            C.levering.zones.map(function (z) { return '<option value="' + z.id + '">' + esc(z.naam) + '</option>'; }).join('') +
          '</select></label>' +
          '<div class="cfg-totaal"><span>Totaal incl. btw en levering</span><strong data-totaal></strong></div>' +
          '<div class="cfg-offerte" hidden></div>' +
          '<button type="button" class="btn btn-staal cfg-bestel" data-bestel>Bestellen</button>' +
          '<p class="cfg-klein">Geleverd als pakket, zonder plaatsing. Levertermijn ongeveer ' + esc(C.levering.levertermijn) + '. Meet eerst na met de <a href="meetgids.html">meetgids</a>.</p>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="cfg-bar" aria-hidden="true"><div><small>Totaal incl. levering</small><strong data-totaal></strong></div><button type="button" class="btn btn-staal" data-bestel tabindex="-1">Bestellen</button></div>';

  var opties = $('.cfg-opties', root);

  function tegel(name, it, gekozen, extra, type) {
    var dis = it.disabled ? ' disabled' : '';
    return '<label class="tegel' + (it.disabled ? ' uit' : '') + '"><input type="' + (type || 'radio') + '" name="' + name + '" value="' + it.id + '"' +
      (gekozen ? ' checked' : '') + dis + '><span class="t-naam">' + esc(it.naam) + '</span>' + (extra ? '<small>' + extra + '</small>' : '') + '</label>';
  }
  function groep(nr, titel, inner, cls, hulp) {
    return '<fieldset class="groep ' + (cls || '') + '"><legend><span class="nr">' + nr + '</span>' + titel + '</legend>' +
      (hulp ? '<p class="hulp">' + hulp + '</p>' : '') + inner + '</fieldset>';
  }
  function plus(n) { return n ? '+ ' + euro(n) : 'inbegrepen'; }
  function kleuren(gekozen) {
    return '<div class="kleuren">' + C.kleuren.map(function (k) {
      return '<label class="kleur"><input type="radio" name="kleur" value="' + k.id + '"' + (k.id === gekozen ? ' checked' : '') + '>' +
        '<span class="staal" style="background:' + k.hex + '"></span><span class="t-naam">' + esc(k.naam) + '</span><small>' + esc(k.ral) + (k.toeslag ? ' · + ' + euro(k.toeslag) : '') + '</small></label>';
    }).join('') + '</div>';
  }
  function maat(id, label, waarde, min, max) {
    var buiten = !(waarde >= min && waarde <= max);
    return '<div class="maat' + (buiten ? ' buiten' : '') + '"><label for="m-' + id + '">' + label + '</label>' +
      '<div class="maat-rij"><input type="range" id="r-' + id + '" data-maat="' + id + '" min="' + min + '" max="' + max + '" step="10" value="' + Math.min(max, Math.max(min, waarde)) + '" aria-label="' + label + ' (schuifbalk)">' +
      '<span class="num"><input type="number" id="m-' + id + '" data-maat="' + id + '" inputmode="numeric" step="1" value="' + waarde + '"><span>mm</span></span></div>' +
      '<p class="grens">Van ' + min.toLocaleString('nl-BE') + ' tot ' + max.toLocaleString('nl-BE') + ' mm.' + (buiten ? ' <strong>Buiten de grenzen: u kunt een offerte aanvragen.</strong>' : '') + '</p></div>';
  }
  function getallen(name, van, tot, gekozen) {
    var h = '<div class="tegels getal">';
    for (var i = van; i <= tot; i++) h += tegel(name, { id: String(i), naam: String(i) }, i === gekozen);
    return h + '</div>';
  }

  function tekenOpties() {
    var actief = document.activeElement && root.contains(document.activeElement) ? document.activeElement : null;
    var focusSel = actief ? (actief.id ? '#' + actief.id : (actief.name ? '[name="' + actief.name + '"][value="' + actief.value + '"]' : null)) : null;
    var h = '';
    if (st.product === 'deur') {
      var s = st.deur, t = byId(D.types, s.type), g = grenzenDeur();
      h += groep(1, 'Type deur', '<div class="tegels">' + D.types.map(function (x) { return tegel('type', x, x.id === s.type, esc(x.uitleg)); }).join('') + '</div>');
      h += groep(2, 'Enkel of dubbel', '<div class="tegels twee">' +
        tegel('dubbel', { id: 'enkel', naam: 'Enkele deur' }, !s.dubbel, 'Eén vleugel') +
        tegel('dubbel', { id: 'dubbel', naam: 'Dubbele deur', disabled: !t.dubbel }, s.dubbel, t.dubbel ? 'Twee vleugels, + ' + euro(D.dubbelToeslag) : 'Niet mogelijk bij een ' + t.naam.toLowerCase()) + '</div>');
      h += groep(3, 'Maten van de opening', maat('breedte', 'Breedte', s.breedte, g.breedteMin, g.breedteMax) + maat('hoogte', 'Hoogte', s.hoogte, g.hoogteMin, g.hoogteMax),
        'maten', 'Hoe u juist meet, leest u in de <a href="meetgids.html#deur">meetgids</a>.');
      var rl = s.type === 'schuif' ? ['Schuift open naar links', 'Schuift open naar rechts'] : (s.dubbel ? ['Loopdeur links', 'Loopdeur rechts'] : ['Scharnieren links', 'Scharnieren rechts']);
      if (s.type === 'taats' && !s.dubbel) rl = ['As links', 'As rechts'];
      h += groep(4, s.type === 'schuif' ? 'Schuifrichting' : 'Draairichting', '<div class="tegels twee">' +
        D.draairichting.map(function (x, i) { return tegel('richting', { id: x.id, naam: rl[i] }, x.id === s.richting); }).join('') + '</div>',
        '', 'Gezien vanaf de kant waar de deur opendraait. Twijfelt u, kijk dan in de <a href="meetgids.html#richting">meetgids</a>.');
      h += groep(5, 'Kleur', kleuren(s.kleur));
      h += groep(6, 'Glas', '<div class="tegels">' + D.glas.map(function (x) { return tegel('glas', x, x.id === s.glas, x.perM2 ? '+ ' + euro(x.perM2) + ' per m²' : 'inbegrepen'); }).join('') + '</div>');
      h += groep(7, 'Verdeling', '<p class="sub">Vakken in de hoogte</p>' + getallen('vakH', D.vakken.hoogteMin, D.vakken.hoogteMax, s.vakH) +
        '<p class="sub">Vakken in de breedte' + (s.dubbel ? ' (per vleugel)' : '') + '</p>' + getallen('vakB', D.vakken.breedteMin, D.vakken.breedteMax, s.vakB));
      h += groep(8, 'Greep', '<div class="tegels">' + D.grepen.map(function (x) {
        var nv = x.nietVoor && x.nietVoor.indexOf(s.type) > -1;
        return tegel('greep', { id: x.id, naam: x.naam, disabled: nv }, x.id === s.greep, nv ? 'Niet bij deze deur' : plus(x.prijs));
      }).join('') + '</div>');
    } else {
      var l = st.leuning, m = byId(L.modellen, l.model);
      h += groep(1, 'Model', '<div class="tegels">' + L.modellen.map(function (x) { return tegel('model', x, x.id === l.model, esc(x.uitleg)); }).join('') + '</div>');
      h += groep(2, 'Lengte langs de trap', maat('lengte', 'Lengte', l.lengte, L.grenzen.lengteMin, L.grenzen.lengteMax), 'maten',
        'Gemeten schuin langs de trap, van de eerste tot de laatste trede. Zie de <a href="meetgids.html#leuning">meetgids</a>.');
      h += groep(3, 'Links- of rechtsopgaand', '<div class="tegels twee">' + L.richting.map(function (x) { return tegel('lrichting', x, x.id === l.richting, esc(x.uitleg)); }).join('') + '</div>');
      h += groep(4, 'Kleur', kleuren(l.kleur));
      h += groep(5, 'Soort lak', '<div class="tegels">' + L.lak.map(function (x) { return tegel('lak', x, x.id === l.lak, x.factor === 1 ? 'inbegrepen' : '+ ' + Math.round((x.factor - 1) * 100) + ' %'); }).join('') + '</div>');
      h += groep(6, 'Bevestiging', '<div class="tegels twee">' + bevestigingen().map(function (x) { return tegel('bevestiging', x, x.id === l.bevestiging, euro(x.perStuk) + ' per stuk, om de ' + x.afstand / 10 + ' cm'); }).join('') + '</div>');
      h += groep(7, "Extra's", '<div class="tegels">' + L.extras.map(function (x) { return tegel('extra', x, l.extras.indexOf(x.id) > -1, '+ ' + euro(x.prijs), 'checkbox'); }).join('') + '</div>');
    }
    opties.innerHTML = h;
    $$('input[name="product"]', root).forEach(function (i) { i.checked = i.value === st.product; });
    if (focusSel) { var f = $(focusSel, root); if (f) f.focus({ preventScroll: true }); }
  }

  function tekenPrijs() {
    var p = bereken();
    $('.cfg-regels', root).innerHTML = p.regels.map(function (r) { return '<div><dt>' + esc(r[0]) + '</dt><dd>' + euro(r[1]) + '</dd></div>'; }).join('') +
      '<div class="lev"><dt>Levering (' + esc(byId(C.levering.zones, st.zone).naam) + ')</dt><dd>' + (p.levering ? euro(p.levering) : 'gratis') + '</dd></div>';
    $$('[data-totaal]', root).forEach(function (el) { el.textContent = p.fout.length ? 'Op offerte' : euro(p.totaal); });
    var off = $('.cfg-offerte', root);
    off.hidden = !p.fout.length;
    if (p.fout.length) off.innerHTML = '<strong>Deze maat valt buiten de webshop.</strong> ' + esc(p.fout.join(' en ')) + '. Olivier maakt ze graag, maar dan via een offerte op maat.';
    $$('[data-bestel]', root).forEach(function (b) { b.textContent = p.fout.length ? 'Offerte aanvragen' : 'Bestellen'; });
    $('select[name="zone"]', root).value = st.zone;
    var mt = $('.cfg-maat', root);
    if (st.product === 'deur') mt.textContent = st.deur.breedte + ' × ' + st.deur.hoogte + ' mm';
    else mt.textContent = 'Lengte ' + st.leuning.lengte + ' mm · ' + byId(L.richting, st.leuning.richting).naam.toLowerCase();
    root.setAttribute('data-actief', st.product);
    return p;
  }

  function alles(herteken) {
    if (herteken !== false) tekenOpties();
    tekenPrijs();
    bouw3D();
  }

  /* ------------------------------------------------------------ invoer */
  root.addEventListener('change', function (e) {
    var el = e.target, n = el.name, v = el.value;
    if (n === 'product') { st.product = v; alles(); nieuwBeeld(); return; }
    if (n === 'zone') { st.zone = v; tekenPrijs(); return; }
    if (el.getAttribute('data-maat')) { zetMaat(el); alles(); return; }
    var s = st.deur, l = st.leuning;
    if (st.product === 'deur') {
      if (n === 'type') {
        s.type = v;
        var t = byId(D.types, v);
        if (!t.dubbel && s.dubbel) { s.dubbel = false; if (s.breedte > D.grenzen.enkel.breedteMax) s.breedte = D.standaard.breedte; }
        var gr = byId(D.grepen, s.greep);
        if (gr.nietVoor && gr.nietVoor.indexOf(v) > -1) s.greep = D.grepen[0].id;
      }
      if (n === 'dubbel') {
        s.dubbel = v === 'dubbel';
        var g = grenzenDeur();
        if (s.breedte < g.breedteMin || s.breedte > g.breedteMax) s.breedte = s.dubbel ? 1600 : D.standaard.breedte;
        nieuwBeeld();
      }
      if (n === 'richting') s.richting = v;
      if (n === 'kleur') s.kleur = v;
      if (n === 'glas') s.glas = v;
      if (n === 'vakH') s.vakH = +v;
      if (n === 'vakB') s.vakB = +v;
      if (n === 'greep') s.greep = v;
    } else {
      if (n === 'model') {
        l.model = v;
        var b = bevestigingen();
        if (!b.some(function (x) { return x.id === l.bevestiging; })) l.bevestiging = b[0].id;
      }
      if (n === 'lrichting') { l.richting = v; nieuwBeeld(); }
      if (n === 'kleur') l.kleur = v;
      if (n === 'lak') l.lak = v;
      if (n === 'bevestiging') l.bevestiging = v;
      if (n === 'extra') {
        l.extras = $$('input[name="extra"]:checked', root).map(function (i) { return i.value; });
      }
    }
    alles();
  });

  function zetMaat(el) {
    var id = el.getAttribute('data-maat'), v = Math.round(+el.value);
    if (!isFinite(v) || v <= 0) return false;
    if (id === 'lengte') st.leuning.lengte = v; else st.deur[id] = v;
    return true;
  }
  /* tijdens het slepen van een schuifbalk: enkel getal, prijs en 3D bijwerken (geen hertekening) */
  root.addEventListener('input', function (e) {
    var el = e.target, id = el.getAttribute('data-maat');
    if (!id) return;
    if (!zetMaat(el)) return;
    var ander = el.type === 'range' ? $('#m-' + id, root) : $('#r-' + id, root);
    if (ander) ander.value = el.value;
    var blok = el.closest('.maat'), mn = +$('#r-' + id, root).min, mx = +$('#r-' + id, root).max, v = +el.value;
    blok.classList.toggle('buiten', !(v >= mn && v <= mx));
    tekenPrijs();
    bouw3DLater();
  });
  root.addEventListener('click', function (e) {
    if (e.target.closest('[data-bestel]')) openBestel();
    if (e.target.closest('.cfg-reset')) { nieuwBeeld(); }
  });

  /* ------------------------------------------------------------ 3D */
  var V = { ok: false };
  var wacht = false;
  function bouw3DLater() { if (wacht) return; wacht = true; requestAnimationFrame(function () { wacht = false; bouw3D(); }); }

  function init3D() {
    var box = $('.cfg-canvas', root);
    if (!window.THREE) { geen3D(box); return; }
    var T = window.THREE, r;
    try { r = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); } catch (err) { geen3D(box); return; }
    if (!r.getContext()) { geen3D(box); return; }
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    r.shadowMap.enabled = true;
    r.shadowMap.type = T.PCFSoftShadowMap;
    box.appendChild(r.domElement);
    var scene = new T.Scene();
    var cam = new T.PerspectiveCamera(32, 1, 0.05, 60);
    scene.add(new T.HemisphereLight(0xffffff, 0x8f8b82, 0.62));
    var zon = new T.DirectionalLight(0xfffaf2, 0.62);
    zon.position.set(2.6, 5.5, 4.2);
    zon.castShadow = true;
    zon.shadow.mapSize.set(1024, 1024);
    zon.shadow.bias = -0.0008;
    zon.shadow.normalBias = 0.01;
    var sc = zon.shadow.camera; sc.left = -5; sc.right = 5; sc.top = 5; sc.bottom = -5; sc.near = 0.5; sc.far = 20;
    scene.add(zon); scene.add(zon.target);
    var vul = new T.DirectionalLight(0xffffff, 0.28); vul.position.set(-3, 2.5, -2.5); scene.add(vul);
    var vloer = new T.Mesh(new T.PlaneGeometry(40, 40), new T.MeshStandardMaterial({ color: 0xc9c6bf, roughness: 1 }));
    vloer.rotation.x = -Math.PI / 2; vloer.receiveShadow = true; scene.add(vloer);
    V = { ok: true, T: T, r: r, scene: scene, cam: cam, zon: zon, box: box, groep: null,
          orb: { theta: 0.42, phi: 0.16, zoom: 1, dist: 5, target: new T.Vector3() }, mats: {} };
    new ResizeObserver(maatCanvas).observe(box);
    maatCanvas();
    bediening(box);
  }
  function geen3D(box) {
    box.classList.add('geen3d');
    box.innerHTML = '<p>Het 3D-voorbeeld werkt niet op dit toestel. Uw keuzes en de prijs werken wel gewoon.</p>';
  }
  function maatCanvas() {
    if (!V.ok) return;
    var w = V.box.clientWidth, h = V.box.clientHeight;
    if (!w || !h) return;
    V.r.setSize(w, h, false);
    V.cam.aspect = w / h; V.cam.updateProjectionMatrix();
    render();
  }
  var rafNodig = false;
  function render() {
    if (!V.ok || rafNodig) return;
    rafNodig = true;
    requestAnimationFrame(function () { rafNodig = false; zetCamera(); V.r.render(V.scene, V.cam); });
  }
  function zetCamera() {
    var o = V.orb, d = o.dist * o.zoom * (V.cam.aspect < 0.9 ? 1.25 : 1);
    V.cam.position.set(o.target.x + d * Math.sin(o.theta) * Math.cos(o.phi), o.target.y + d * Math.sin(o.phi), o.target.z + d * Math.cos(o.theta) * Math.cos(o.phi));
    V.cam.lookAt(o.target);
  }
  function nieuwBeeld() {
    if (!V.ok) return;
    V.orb.theta = st.product === 'deur' ? 0.42 : (st.leuning.richting === 'links' ? -0.38 : 0.38);
    V.orb.phi = st.product === 'deur' ? 0.14 : 0.2;
    V.orb.zoom = 1;
    render();
  }
  function bediening(el) {
    var p = {}, o = V.orb, pinch = 0;
    el.style.touchAction = 'none';
    el.addEventListener('pointerdown', function (e) { p[e.pointerId] = { x: e.clientX, y: e.clientY }; el.setPointerCapture(e.pointerId); el.classList.add('sleept'); });
    el.addEventListener('pointermove', function (e) {
      if (!p[e.pointerId]) return;
      var ids = Object.keys(p);
      if (ids.length === 1) {
        o.theta -= (e.clientX - p[e.pointerId].x) * 0.0065;
        o.phi = Math.max(-0.02, Math.min(1.2, o.phi + (e.clientY - p[e.pointerId].y) * 0.005));
      }
      p[e.pointerId] = { x: e.clientX, y: e.clientY };
      if (ids.length === 2) {
        var a = p[ids[0]], b = p[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch) o.zoom = Math.max(0.55, Math.min(1.8, o.zoom * pinch / d));
        pinch = d;
      }
      render();
    });
    function los(e) { delete p[e.pointerId]; pinch = 0; if (!Object.keys(p).length) el.classList.remove('sleept'); }
    el.addEventListener('pointerup', los); el.addEventListener('pointercancel', los);
    el.addEventListener('wheel', function (e) { e.preventDefault(); o.zoom = Math.max(0.55, Math.min(1.8, o.zoom * (e.deltaY > 0 ? 1.08 : 0.93))); render(); }, { passive: false });
    el.addEventListener('keydown', function (e) {
      var k = e.key;
      if (k === 'ArrowLeft') o.theta += 0.12; else if (k === 'ArrowRight') o.theta -= 0.12;
      else if (k === 'ArrowUp') o.phi = Math.min(1.2, o.phi + 0.08); else if (k === 'ArrowDown') o.phi = Math.max(-0.02, o.phi - 0.08);
      else if (k === '+' || k === '=') o.zoom = Math.max(0.55, o.zoom * 0.9); else if (k === '-') o.zoom = Math.min(1.8, o.zoom * 1.1);
      else return;
      e.preventDefault(); render();
    });
  }

  /* materialen */
  function staalMat(hex, ruw) {
    var key = 's' + hex + ruw;
    if (!V.mats[key]) V.mats[key] = new V.T.MeshStandardMaterial({ color: new V.T.Color(hex), roughness: ruw, metalness: 0.25 });
    return V.mats[key];
  }
  function vlakMat(hex, ruw) {
    var key = 'v' + hex + ruw;
    if (!V.mats[key]) V.mats[key] = new V.T.MeshStandardMaterial({ color: new V.T.Color(hex), roughness: ruw == null ? 0.95 : ruw, metalness: 0 });
    return V.mats[key];
  }
  var ribbelTex = null;
  function glasMat(g) {
    var key = 'g' + g.id;
    if (V.mats[key]) return V.mats[key];
    var m = new V.T.MeshStandardMaterial({ color: new V.T.Color(g.kleur), transparent: true, opacity: g.dekking, roughness: g.ruw, metalness: 0.1, depthWrite: false, side: V.T.DoubleSide });
    if (g.ribbel) {
      if (!ribbelTex) {
        var c = document.createElement('canvas'); c.width = 64; c.height = 4;
        var x = c.getContext('2d'), gr = x.createLinearGradient(0, 0, 64, 0);
        gr.addColorStop(0, '#9fb0b0'); gr.addColorStop(0.45, '#ffffff'); gr.addColorStop(0.8, '#c9d4d4'); gr.addColorStop(1, '#9fb0b0');
        x.fillStyle = gr; x.fillRect(0, 0, 64, 4);
        ribbelTex = new V.T.CanvasTexture(c); ribbelTex.wrapS = ribbelTex.wrapT = V.T.RepeatWrapping;
      }
      m.map = ribbelTex;
    }
    V.mats[key] = m;
    return m;
  }
  function blok(g, mat, w, h, d, x, y, z, schaduw) {
    var m = new V.T.Mesh(new V.T.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    if (schaduw !== false) { m.castShadow = true; m.receiveShadow = true; }
    g.add(m); return m;
  }
  function buis(g, mat, r, len, x, y, z, rx, rz) {
    var m = new V.T.Mesh(new V.T.CylinderGeometry(r, r, len, 20), mat);
    m.position.set(x, y, z); m.rotation.x = rx || 0; m.rotation.z = rz || 0;
    m.castShadow = true; m.receiveShadow = true; g.add(m); return m;
  }
  function bol(g, mat, r, x, y, z) {
    var m = new V.T.Mesh(new V.T.SphereGeometry(r, 16, 12), mat); m.position.set(x, y, z); m.castShadow = true; g.add(m); return m;
  }
  function leeg(obj) {
    obj.traverse(function (o) { if (o.geometry) o.geometry.dispose(); });
  }

  /* één deurvleugel: scharnierkant op x = 0, vrije kant op x = w, onderkant op y = 0 */
  function vleugel(w, h, s, metGreep, scharnieren) {
    var T = V.T, g = new T.Group(), k = byId(C.kleuren, s.kleur), staal = staalMat(k.hex, 0.62), gl = byId(D.glas, s.glas);
    var p = 0.045, d = 0.042, r = 0.024;
    blok(g, staal, p, h, d, p / 2, h / 2, 0);
    blok(g, staal, p, h, d, w - p / 2, h / 2, 0);
    blok(g, staal, w - 2 * p, p, d, w / 2, p / 2, 0);
    blok(g, staal, w - 2 * p, p, d, w / 2, h - p / 2, 0);
    var iw = w - 2 * p, ih = h - 2 * p, i;
    for (i = 1; i < s.vakH; i++) blok(g, staal, iw, r, d * 0.8, w / 2, p + ih * i / s.vakH, 0);
    for (i = 1; i < s.vakB; i++) blok(g, staal, r, ih, d * 0.8, p + iw * i / s.vakB, h / 2, 0);
    if (gl.plaat) blok(g, staalMat(k.hex, 0.7), iw, ih, 0.004, w / 2, h / 2, 0);
    else {
      var gm = glasMat(gl);
      if (gm.map) gm.map.repeat.set(iw / 0.018, 1);
      var ruit = blok(g, gm, iw, ih, 0.008, w / 2, h / 2, 0, false);
      ruit.renderOrder = 2;
    }
    if (scharnieren) {
      var sch = h > 2.2 ? [0.22, h / 2, h - 0.25] : [0.22, h - 0.25];
      sch.forEach(function (y) { buis(g, staalMat('#202224', 0.5), 0.011, 0.11, -0.004, y, d / 2 + 0.004); });
    }
    if (metGreep) greep(g, s.greep, w, h, d, staalMat(k.id === '9010' ? '#1d1e20' : '#141516', 0.4));
    return g;
  }
  function greep(g, id, w, h, d, mat) {
    var T = V.T, x = w - 0.075, y = Math.min(1.05, h / 2), zz = [d / 2, -d / 2];
    if (id === 'staaf40' || id === 'staaf100') {
      var len = id === 'staaf40' ? 0.4 : 1.0;
      zz.forEach(function (z) {
        var sgn = z > 0 ? 1 : -1;
        buis(g, mat, 0.014, len, x, y, z + sgn * 0.055);
        [y - len / 2 + 0.06, y + len / 2 - 0.06].forEach(function (yy) { buis(g, mat, 0.008, 0.055, x, yy, z + sgn * 0.0275, Math.PI / 2); });
      });
    } else if (id === 'klink') {
      zz.forEach(function (z) {
        var sgn = z > 0 ? 1 : -1;
        buis(g, mat, 0.027, 0.012, x, y, z + sgn * 0.006, Math.PI / 2);
        buis(g, mat, 0.009, 0.05, x, y, z + sgn * 0.03, Math.PI / 2);
        blok(g, mat, 0.13, 0.018, 0.02, x - 0.06, y, z + sgn * 0.058);
      });
    } else if (id === 'kom') {
      zz.forEach(function (z) { var sgn = z > 0 ? 1 : -1; blok(g, mat, 0.035, 0.16, 0.004, x, y, z + sgn * 0.001, false); });
    }
  }

  function bouwDeur() {
    var T = V.T, s = st.deur, g = new T.Group();
    var W = Math.max(0.4, Math.min(3.2, s.breedte / 1000)), H = Math.max(1.5, Math.min(3.2, s.hoogte / 1000));
    var t = byId(D.types, s.type), k = byId(C.kleuren, s.kleur), staal = staalMat(k.hex, 0.62);
    var dub = s.dubbel && t.dubbel, n = dub ? 2 : 1, links = s.richting === 'links';
    var wand = vlakMat('#e4e2dd', 0.95), wd = 0.14, zij = 0.75, top = 0.42;
    blok(g, wand, zij, H + top, wd, -W / 2 - zij / 2, (H + top) / 2, 0);
    blok(g, wand, zij, H + top, wd, W / 2 + zij / 2, (H + top) / 2, 0);
    blok(g, wand, W, top, wd, 0, H + top / 2, 0);
    if (s.type === 'draai') {
      var fr = 0.05;
      blok(g, staal, fr, H, 0.07, -W / 2 + fr / 2, H / 2, 0);
      blok(g, staal, fr, H, 0.07, W / 2 - fr / 2, H / 2, 0);
      blok(g, staal, W, fr, 0.07, 0, H - fr / 2, 0);
      var lw = (W - 2 * fr) / n - 0.004, lh = H - fr - 0.01;
      for (var i = 0; i < n; i++) {
        var scharnierLinks = dub ? i === 0 : links;
        var actief = dub ? (links ? i === 0 : i === 1) : true;
        var piv = new T.Group();
        piv.position.set(scharnierLinks ? -W / 2 + fr : W / 2 - fr, 0.006, 0);
        piv.add(vleugel(lw, lh, s, actief, true));
        if (!scharnierLinks) piv.scale.x = -1;
        var hoek = actief ? 0.42 : 0;
        piv.rotation.y = scharnierLinks ? -hoek : hoek;
        g.add(piv);
      }
    } else if (s.type === 'taats') {
      var tw = W - 0.012, th = H - 0.012, as = tw * 0.22;
      var pv = new T.Group();
      pv.position.set(links ? -W / 2 + 0.006 + as : W / 2 - 0.006 - as, 0.006, 0);
      var v = vleugel(tw, th, s, true, false);
      v.position.x = -as;
      pv.add(v);
      if (!links) pv.scale.x = -1;
      pv.rotation.y = links ? -0.6 : 0.6;
      g.add(pv);
      buis(g, staalMat('#202224', 0.5), 0.01, 0.03, pv.position.x, H - 0.006, 0);
    } else {
      var z = wd / 2 + 0.04, sw = W / n + 0.04, sh = H + 0.03;
      var rail = blok(g, staalMat('#26282a', 0.45), dub ? 2 * W + 0.1 : 2 * W + 0.12, 0.05, 0.035, 0, H + 0.085, z);
      if (!dub) rail.position.x = links ? -W / 2 : W / 2;
      for (var j = 0; j < n; j++) {
        var naarLinks = dub ? j === 0 : links;
        var verschuif = (dub ? 0.32 : 0.42) * sw;
        var sg = new T.Group();
        var basisX = dub ? (j === 0 ? -W / 2 - 0.02 : 0) : -W / 2 - 0.02;
        var vv = vleugel(sw, sh, s, true, false);
        if (naarLinks) { sg.position.set(basisX - verschuif, 0.012, z); sg.add(vv); }
        else { sg.position.set(basisX + sw + verschuif, 0.012, z); sg.scale.x = -1; sg.add(vv); }
        [0.15, sw - 0.15].forEach(function (xx) { blok(sg, staalMat('#26282a', 0.45), 0.03, 0.07, 0.012, xx, sh + 0.035, 0.02); });
        g.add(sg);
      }
    }
    V.orb.target.set(0, H / 2, 0);
    V.orb.dist = (Math.max(H, W * 1.2) / 2 + 0.55) / Math.tan(V.cam.fov * Math.PI / 360);
    return g;
  }

  function bouwLeuning() {
    var T = V.T, l = st.leuning, g = new T.Group(), m = byId(L.modellen, l.model), lk = byId(L.lak, l.lak), k = byId(C.kleuren, l.kleur);
    var staal = staalMat(k.hex, lk.glans);
    var Lm = Math.max(0.6, Math.min(7, l.lengte / 1000)), ri = 0.18, go = 0.25, a = Math.atan(ri / go), ta = Math.tan(a);
    var run = Lm * Math.cos(a), n = Math.ceil(run / go) + 2, breed = 0.95, hh = 0.9;
    var trap = vlakMat('#bdb9b1', 0.9), wand = vlakMat('#e4e2dd', 0.95);
    for (var i = 0; i < n; i++) blok(g, trap, go + 0.002, (i + 1) * ri, breed, i * go + go / 2, (i + 1) * ri / 2, breed / 2);
    blok(g, wand, n * go + 1.4, n * ri + 1.4, 0.12, (n * go) / 2 - 0.3, (n * ri + 1.4) / 2, -0.06);
    function neus(x) { return ri + x * ta; }
    function trede(x) { return ri * (Math.floor(Math.max(0, x) / go) + 1); }
    var x0 = 0, x1 = run, ns = aantalSteunen(), muur = m.soort === 'muur';
    var verdekt = l.bevestiging === 'verdekt', zijkant = l.bevestiging === 'zijkant';
    var zR = muur ? (verdekt ? 0.06 : 0.08) : (zijkant ? breed + 0.05 : breed - 0.045);
    var mid = function (x) { return neus(x) + hh; };
    var lijn = new T.Group(); g.add(lijn);
    var cx = (x0 + x1) / 2, cy = mid(cx);
    if (m.id === 'rond') buis(lijn, staal, 0.021, Lm, cx, cy, zR, 0, a - Math.PI / 2);
    else { var hl = blok(lijn, staal, Lm, m.id === 'plat' ? 0.012 : 0.022, 0.05, cx, cy, zR); hl.rotation.z = a; }
    var pos = [];
    for (var s2 = 0; s2 < ns; s2++) pos.push(x0 + 0.1 * Math.cos(a) + (x1 - x0 - 0.2 * Math.cos(a)) * s2 / (ns - 1));
    if (muur) {
      pos.forEach(function (x) {
        var y = mid(x);
        if (verdekt) { blok(g, staal, 0.03, 0.045, zR, x, y - 0.035, zR / 2); }
        else {
          buis(g, staal, 0.032, 0.008, x, y - 0.075, 0.004, Math.PI / 2);
          buis(g, staal, 0.008, zR, x, y - 0.075, zR / 2, Math.PI / 2);
          buis(g, staal, 0.008, 0.06, x, y - 0.045, zR);
        }
      });
    } else {
      var topY = function (x) { return mid(x) - 0.012; };
      pos.forEach(function (x) {
        var yb = zijkant ? trede(x) - 0.22 : trede(x), yt = topY(x);
        blok(g, staal, 0.04, yt - yb, 0.04, x, (yt + yb) / 2, zR);
        if (zijkant) blok(g, staal, 0.08, 0.16, 0.008, x, trede(x) - 0.1, breed + 0.004);
        else blok(g, staal, 0.09, 0.008, 0.09, x, yb + 0.004, zR);
      });
      var p0 = pos[0], p1 = pos[pos.length - 1];
      if (m.id === 'spijlen') {
        var ol = Math.hypot(p1 - p0, (p1 - p0) * ta), oc = (p0 + p1) / 2;
        var onder = blok(g, staal, ol, 0.02, 0.03, oc, neus(oc) + 0.12, zR); onder.rotation.z = a;
        for (var x = p0 + 0.11; x < p1 - 0.05; x += 0.11) {
          var yb2 = neus(x) + 0.12, yt2 = topY(x) - 0.01;
          blok(g, staal, 0.014, yt2 - yb2, 0.014, x, (yb2 + yt2) / 2, zR);
        }
      } else {
        var sl = Math.hypot(p1 - p0, (p1 - p0) * ta), scx = (p0 + p1) / 2;
        for (var q = 0; q < 5; q++) buis(g, staal, 0.007, sl, scx, neus(scx) + 0.16 + q * 0.13, zR, 0, a - Math.PI / 2);
      }
    }
    var ex = l.extras;
    var bx = x1 + 0.0, by = mid(x1);
    if (ex.indexOf('overloop') > -1) {
      if (m.id === 'rond') buis(lijn, staal, 0.021, 0.5, bx + 0.25, by, zR, 0, Math.PI / 2);
      else blok(lijn, staal, 0.5, m.id === 'plat' ? 0.012 : 0.022, 0.05, bx + 0.25, by, zR);
      bx += 0.5;
    }
    if (ex.indexOf('eindkappen') > -1) {
      [[x0, mid(x0)], [bx, by]].forEach(function (pt) {
        if (muur) { buis(g, staal, 0.019, zR, pt[0], pt[1], zR / 2, Math.PI / 2); bol(g, staal, 0.021, pt[0], pt[1], zR); }
        else bol(g, staal, 0.026, pt[0], pt[1], zR);
      });
    }
    if (l.richting === 'links') g.scale.x = -1;
    var cxx = (l.richting === 'links' ? -1 : 1) * run / 2;
    V.orb.target.set(cxx, (ri + run * ta) / 2 + 0.4, breed / 2);
    V.orb.dist = (Math.hypot(run, run * ta + 1) / 2 + 0.9) / Math.tan(V.cam.fov * Math.PI / 360);
    return g;
  }

  function bouw3D() {
    if (!V.ok) return;
    if (V.groep) { V.scene.remove(V.groep); leeg(V.groep); }
    V.groep = st.product === 'deur' ? bouwDeur() : bouwLeuning();
    V.scene.add(V.groep);
    V.zon.target.position.copy(V.orb.target);
    V.zon.position.set(V.orb.target.x + 2.6, 5.5, V.orb.target.z + 4.2);
    render();
  }

  /* ------------------------------------------------------------ bestellen (nagebootst) */
  var dlg = document.createElement('dialog');
  dlg.className = 'bestel';
  dlg.setAttribute('aria-label', 'Bestellen');
  document.body.appendChild(dlg);
  var bestelling = null;
  dlg.addEventListener('click', function (e) {
    if (e.target === dlg || e.target.closest('[data-sluit]')) dlg.close();
    var stap = e.target.closest('[data-stap]');
    if (stap) toonStap(stap.getAttribute('data-stap'));
    if (e.target.closest('[data-print]')) { document.body.classList.add('print-werkbon'); window.print(); setTimeout(function () { document.body.classList.remove('print-werkbon'); }, 500); }
  });
  dlg.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target;
    if (!controleer(f)) return;
    bestelling.klant = {};
    $$('input,textarea,select', f).forEach(function (i) { if (i.name) bestelling.klant[i.name] = i.type === 'checkbox' ? i.checked : i.value.trim(); });
    if (f.id === 'f-offerte') toonStap('offerte-klaar'); else toonStap('betalen');
  });

  function controleer(f) {
    var ok = true;
    $$('[required]', f).forEach(function (i) {
      var leeg = i.type === 'checkbox' ? !i.checked : !i.value.trim();
      var fout = leeg || (i.type === 'email' && !/^\S+@\S+\.\S+$/.test(i.value));
      i.closest('.veld, .vinkje').classList.toggle('fout', fout);
      if (fout && ok) { i.focus(); ok = false; }
    });
    return ok;
  }

  function specs() {
    var r = [];
    if (st.product === 'deur') {
      var s = st.deur, t = byId(D.types, s.type), k = byId(C.kleuren, s.kleur);
      r.push(['Product', 'Stalen ' + t.naam.toLowerCase()], ['Uitvoering', s.dubbel ? 'Dubbel (2 vleugels)' : 'Enkel'],
        ['Breedte opening', mm(s.breedte)], ['Hoogte opening', mm(s.hoogte)]);
      var rt = s.type === 'schuif' ? 'Schuift open naar ' + s.richting : (s.dubbel ? 'Loopdeur ' + s.richting : (s.type === 'taats' ? 'As ' : 'Scharnieren ') + s.richting);
      r.push(['Richting', rt], ['Kleur', k.naam + ' (' + k.ral + ')'], ['Glas', byId(D.glas, s.glas).naam],
        ['Verdeling', s.vakB + ' × ' + s.vakH + ' vakken' + (s.dubbel ? ' per vleugel' : '')], ['Greep', byId(D.grepen, s.greep).naam]);
    } else {
      var l = st.leuning, kl = byId(C.kleuren, l.kleur);
      r.push(['Product', byId(L.modellen, l.model).naam], ['Lengte langs de trap', mm(l.lengte)], ['Richting', byId(L.richting, l.richting).naam],
        ['Kleur', kl.naam + ' (' + kl.ral + ')'], ['Lak', byId(L.lak, l.lak).naam], ['Bevestiging', byId(L.bevestiging, l.bevestiging).naam + ', ' + aantalSteunen() + ' stuks'],
        ["Extra's", l.extras.length ? l.extras.map(function (id) { return byId(L.extras, id).naam; }).join(', ') : 'geen']);
    }
    return r;
  }
  function tabel(rijen) { return '<table class="spec">' + rijen.map(function (r) { return '<tr><th>' + esc(r[0]) + '</th><td>' + esc(r[1]) + '</td></tr>'; }).join('') + '</table>'; }

  function openBestel() {
    var p = bereken();
    bestelling = { prijs: p, specs: specs(), product: st.product, nr: 'MD-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + String(Math.floor(1000 + Math.random() * 9000)), zone: byId(C.levering.zones, st.zone).naam };
    toonStap(p.fout.length ? 'offerte' : 'overzicht');
    if (!dlg.open) dlg.showModal();
  }

  function kop(titel, stappen, actief) {
    return '<div class="b-kop"><div><p class="b-stappen">' + stappen.map(function (s, i) { return '<span' + (i === actief ? ' class="nu"' : '') + '>' + (i + 1) + '. ' + s + '</span>'; }).join('') + '</p><h2>' + titel + '</h2></div>' +
      '<button type="button" class="b-sluit" data-sluit aria-label="Sluiten">Sluiten</button></div>';
  }
  var STAPPEN = ['Overzicht', 'Betalen', 'Bevestiging'];
  function velden(offerte) {
    return '<div class="velden">' +
      '<div class="veld"><label for="b-naam">Naam *</label><input id="b-naam" name="naam" required autocomplete="name"></div>' +
      '<div class="veld"><label for="b-mail">E-mail *</label><input id="b-mail" name="email" type="email" required autocomplete="email"></div>' +
      '<div class="veld"><label for="b-tel">Telefoon *</label><input id="b-tel" name="tel" type="tel" required autocomplete="tel"></div>' +
      (offerte ? '<div class="veld"><label for="b-gem">Gemeente</label><input id="b-gem" name="gemeente" autocomplete="address-level2"></div>' :
      '<div class="veld"><label for="b-straat">Straat en nummer *</label><input id="b-straat" name="straat" required autocomplete="street-address"></div>' +
      '<div class="veld kort"><label for="b-pc">Postcode *</label><input id="b-pc" name="postcode" required inputmode="numeric" autocomplete="postal-code"></div>' +
      '<div class="veld"><label for="b-gem">Gemeente *</label><input id="b-gem" name="gemeente" required autocomplete="address-level2"></div>') +
      '<div class="veld vol"><label for="b-opm">' + (offerte ? 'Wat wilt u laten maken? *' : 'Opmerking voor Olivier') + '</label><textarea id="b-opm" name="opmerking" rows="3"' + (offerte ? ' required' : '') + '></textarea></div>' +
      '</div>';
  }

  function toonStap(stap) {
    var b = bestelling, p = b.prijs, h = '';
    var prijsRegels = '<dl class="cfg-regels">' + p.regels.map(function (r) { return '<div><dt>' + esc(r[0]) + '</dt><dd>' + euro(r[1]) + '</dd></div>'; }).join('') +
      '<div class="lev"><dt>Levering (' + esc(b.zone) + ')</dt><dd>' + (p.levering ? euro(p.levering) : 'gratis') + '</dd></div>' +
      '<div class="tot"><dt>Totaal incl. ' + C.btw + ' % btw</dt><dd>' + euro(p.totaal, true) + '</dd></div></dl>';
    if (stap === 'overzicht') {
      h = kop('Uw bestelling nakijken', STAPPEN, 0) + '<div class="b-inhoud"><div class="b-twee"><div><h3>Uw keuzes</h3>' + tabel(b.specs) +
        '<button type="button" class="link-knop" data-sluit>Iets aanpassen</button></div><div><h3>Prijs</h3>' + prijsRegels +
        '<p class="cfg-vb">Voorbeeldprijzen. Uw eigen prijzen komen hier.</p></div></div>' +
        '<form id="f-bestel" novalidate><h3>Uw gegevens en leveradres</h3>' + velden(false) +
        '<div class="vinkje"><input type="checkbox" id="b-maten" name="maten_nagekeken" required><label for="b-maten">Ik heb mijn maten nagekeken volgens de <a href="meetgids.html" target="_blank">meetgids</a>. Ik weet dat maatwerk niet teruggestuurd kan worden.</label></div>' +
        '<div class="vinkje"><input type="checkbox" id="b-vw" name="voorwaarden" required><label for="b-vw">Ik ga akkoord met de <a href="verkoopvoorwaarden.html" target="_blank">verkoopvoorwaarden</a> en de <a href="privacy.html" target="_blank">privacyverklaring</a>.</label></div>' +
        '<div class="b-acties"><button type="submit" class="btn btn-staal">Verder naar betalen, ' + euro(p.totaal) + '</button></div></form></div>';
    } else if (stap === 'betalen') {
      h = kop('Betalen', STAPPEN, 1) + '<div class="b-inhoud"><div class="mollie">' +
        '<p class="nagebootst">Nagebootst: in de echte webshop opent hier de beveiligde betaalpagina van Mollie. In dit concept wordt niets betaald of verstuurd.</p>' +
        '<div class="m-kop"><span>Metaal Declercq</span><strong>' + euro(p.totaal, true) + '</strong><small>Bestelling ' + b.nr + '</small></div>' +
        '<fieldset class="m-keuze"><legend>Kies hoe u betaalt</legend>' +
        ['Bancontact', 'Kredietkaart', 'Overschrijving'].map(function (x, i) { return '<label><input type="radio" name="betaal" value="' + x + '"' + (i === 0 ? ' checked' : '') + '><span>' + x + '</span></label>'; }).join('') +
        '</fieldset><button type="button" class="btn btn-staal m-betaal">Betaal ' + euro(p.totaal, true) + '</button>' +
        '<button type="button" class="link-knop" data-stap="overzicht">Terug naar het overzicht</button></div></div>';
    } else if (stap === 'klaar') {
      var k = b.klant;
      h = kop('Bedankt, uw bestelling is betaald', STAPPEN, 2) + '<div class="b-inhoud">' +
        '<p class="nagebootst">Voorbeeld: er is niets betaald en niets verstuurd. Hieronder ziet u wat de koper en Olivier automatisch zouden krijgen.</p>' +
        '<div class="b-twee"><div><h3>Bevestiging naar de koper</h3><div class="mail"><p><strong>Aan:</strong> ' + esc(k.email) + '<br><strong>Onderwerp:</strong> Uw bestelling ' + b.nr + ' bij Metaal Declercq</p>' +
        '<p>Beste ' + esc(k.naam.split(' ')[0]) + ',</p><p>Bedankt voor uw bestelling. We hebben uw betaling van ' + euro(p.totaal, true) + ' goed ontvangen. Olivier kijkt uw maten nog eens na voor hij begint. Klopt er iets niet, dan belt hij u eerst.</p>' +
        '<p>Uw pakket wordt geleverd binnen ongeveer ' + esc(C.levering.levertermijn) + '. U krijgt een bericht van de transporteur met de leverdag.</p><p>Met vriendelijke groeten,<br>Olivier Declercq<br>Metaal Declercq</p></div></div>' +
        '<div><h3>Werkbon voor Olivier</h3>' + werkbon() + '<button type="button" class="btn btn-lijn" data-print>Werkbon afdrukken</button></div></div>' +
        '<div class="b-acties"><button type="button" class="btn btn-staal" data-sluit>Sluiten</button></div></div>';
    } else if (stap === 'offerte') {
      h = kop('Offerte aanvragen', ['Uw vraag', 'Verstuurd'], 0) + '<div class="b-inhoud">' +
        '<div class="cfg-offerte"><strong>Deze maat valt buiten de grenzen van de webshop.</strong> ' + esc(p.fout.join(' en ')) + '. Olivier bekijkt uw vraag en stuurt u een prijs op maat.</div>' +
        '<h3>Uw keuzes</h3>' + tabel(b.specs) +
        '<form id="f-offerte" novalidate><h3>Uw gegevens</h3>' + velden(true) +
        '<div class="vinkje"><input type="checkbox" id="b-priv" name="privacy" required><label for="b-priv">Ik ga akkoord met de <a href="privacy.html" target="_blank">privacyverklaring</a>.</label></div>' +
        '<div class="b-acties"><button type="submit" class="btn btn-staal">Offerte aanvragen</button></div></form></div>';
    } else if (stap === 'offerte-klaar') {
      h = kop('Uw aanvraag is goed aangekomen', ['Uw vraag', 'Verstuurd'], 1) + '<div class="b-inhoud">' +
        '<p class="nagebootst">Voorbeeld: in dit concept wordt niets verstuurd.</p>' +
        '<p>Bedankt, ' + esc(b.klant.naam.split(' ')[0]) + '. Olivier bekijkt uw maten en stuurt u een offerte. Hij neemt contact op via ' + esc(b.klant.email) + ' of ' + esc(b.klant.tel) + '.</p>' +
        '<div class="b-acties"><button type="button" class="btn btn-staal" data-sluit>Sluiten</button></div></div>';
    }
    dlg.innerHTML = '<div class="b-doos" data-stap-nu="' + stap + '">' + h + '</div>';
    dlg.scrollTop = 0;
    var doos = $('.b-doos', dlg); if (doos) doos.scrollTop = 0;
    var mb = $('.m-betaal', dlg);
    if (mb) mb.addEventListener('click', function () {
      bestelling.betaalwijze = $('input[name="betaal"]:checked', dlg).value;
      mb.disabled = true; mb.textContent = 'Betaling verwerken…';
      setTimeout(function () { toonStap('klaar'); }, 900);
    });
    var eerste = $('input, button.b-sluit', dlg); if (eerste && stap !== 'overzicht' && stap !== 'offerte') eerste.focus();
  }

  function werkbon() {
    var b = bestelling, k = b.klant, nu = new Date();
    var extra = [];
    if (b.product === 'deur') {
      var s = st.deur, n = s.dubbel ? 2 : 1, prof = 45, roede = 24;
      var vw = Math.round(s.breedte / n), iw = (vw - 2 * prof - (s.vakB - 1) * roede) / s.vakB, ih = (s.hoogte - 2 * prof - (s.vakH - 1) * roede) / s.vakH;
      extra.push(['Vleugelbreedte', mm(vw) + (n > 1 ? ' (2 vleugels)' : '')], ['Vakken totaal', String(n * s.vakB * s.vakH)],
        ['Glas per vak (richtmaat)', Math.round(iw) + ' × ' + Math.round(ih) + ' mm']);
    } else {
      var l = st.leuning, ns = aantalSteunen();
      extra.push([byId(L.modellen, l.model).soort === 'muur' ? 'Steunen' : 'Posten', ns + ' stuks, h.o.h. ± ' + mm(Math.round((l.lengte - 200) / (ns - 1)))]);
    }
    var checks = ['Maten nagekeken', 'Gezaagd', 'Gelast en geslepen', 'Gelakt in ' + b.specs.filter(function (r) { return r[0] === 'Kleur'; })[0][1], 'Gecontroleerd', 'Verpakt en gelabeld', 'Meegegeven aan transporteur'];
    return '<div class="werkbon">' +
      '<div class="wb-kop"><div><strong>METAAL DECLERCQ</strong><span>Werkbon</span></div><div><strong>' + b.nr + '</strong><span>' + nu.toLocaleDateString('nl-BE') + '</span></div></div>' +
      '<p class="wb-status">Betaald via Mollie, ' + esc(b.betaalwijze || 'Bancontact') + ': ' + euro(b.prijs.totaal, true) + '</p>' +
      '<h4>Klant en levering</h4><p>' + esc(k.naam) + '<br>' + esc(k.straat || '') + '<br>' + esc(k.postcode || '') + ' ' + esc(k.gemeente || '') + '<br>' + esc(k.tel) + ' · ' + esc(k.email) + '<br>Levering: ' + esc(b.zone) + ', pakket zonder plaatsing</p>' +
      '<h4>Product</h4>' + tabel(b.specs.concat(extra)) +
      (k.opmerking ? '<h4>Opmerking klant</h4><p>' + esc(k.opmerking) + '</p>' : '') +
      '<p class="wb-ok">Koper bevestigde: maten nagekeken volgens de meetgids (' + nu.toLocaleString('nl-BE', { dateStyle: 'short', timeStyle: 'short' }) + ').</p>' +
      '<h4>Productie</h4><ul class="wb-check">' + checks.map(function (c) { return '<li><span class="vak"></span>' + esc(c) + '</li>'; }).join('') + '</ul></div>';
  }

  /* ------------------------------------------------------------ gsm-balk met totaal */
  var bar = $('.cfg-bar', root), prijsBox = $('#cfg-prijs', root);
  if ('IntersectionObserver' in window) {
    var inBeeld = false, prijsZicht = false;
    var upd = function () { var t = inBeeld && !prijsZicht; bar.classList.toggle('aan', t); bar.setAttribute('aria-hidden', t ? 'false' : 'true'); $('button', bar).tabIndex = t ? 0 : -1; };
    new IntersectionObserver(function (e) { inBeeld = e[0].isIntersecting; upd(); }, { rootMargin: '-30% 0px -10% 0px' }).observe(opties);
    new IntersectionObserver(function (e) { prijsZicht = e[0].isIntersecting; upd(); }).observe(prijsBox);
  }

  /* ------------------------------------------------------------ start */
  init3D();
  alles();
  nieuwBeeld();
  window.__cfg = { st: st, bereken: bereken, V: function () { return V; } };
})();
