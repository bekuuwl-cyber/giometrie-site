/* Metaal Declercq – algemene scripts (menu, vragen, filters, formulier, tabellen uit prijzen.js) */
(function () {
  'use strict';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var C = window.DECLERCQ;

  /* hoogte van de kop (voor het gsm-menu en de vaste 3D-weergave) */
  var hdr = $('.hdr');
  function hoogte() { if (hdr) document.documentElement.style.setProperty('--hdr-h', hdr.getBoundingClientRect().bottom + 'px'); }
  hoogte(); addEventListener('resize', hoogte); addEventListener('scroll', hoogte, { passive: true });

  /* gsm-menu */
  var burger = $('.burger'), mnav = $('#mnav');
  if (burger && mnav) {
    burger.addEventListener('click', function () {
      var open = !mnav.classList.contains('open');
      mnav.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open);
      burger.textContent = open ? 'Sluiten' : 'Menu';
      mnav.setAttribute('aria-hidden', !open);
      document.body.style.overflow = open ? 'hidden' : '';
      hoogte();
    });
  }

  /* veelgestelde vragen */
  $$('.qa button').forEach(function (b) {
    b.addEventListener('click', function () {
      var qa = b.parentNode, open = !qa.classList.contains('open');
      qa.classList.toggle('open', open);
      b.setAttribute('aria-expanded', open);
    });
  });

  /* realisaties filteren */
  $$('.filters button').forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-f');
      $$('.filters button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      $$('.galerij figure').forEach(function (fig) { fig.hidden = f !== 'alle' && fig.getAttribute('data-cat') !== f; });
    });
  });

  /* contactformulier (nagebootst: er wordt niets verstuurd) */
  var form = $('#contactformulier');
  if (form) {
    var q = new URLSearchParams(location.search).get('onderwerp');
    if (q && form.onderwerp) form.onderwerp.value = q;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      $$('[required]', form).forEach(function (i) {
        var fout = i.type === 'checkbox' ? !i.checked : !i.value.trim() || (i.type === 'email' && !/^\S+@\S+\.\S+$/.test(i.value));
        i.closest('.veld, .vinkje').classList.toggle('fout', fout);
        if (fout && ok) { i.focus(); ok = false; }
      });
      var m = $('.melding', form);
      if (!ok) { m.textContent = 'Vul de verplichte velden in.'; return; }
      m.textContent = 'Bedankt, uw bericht is goed aangekomen. Olivier antwoordt zo snel mogelijk. (Voorbeeld: in dit concept wordt niets verstuurd.)';
      form.reset();
    });
  }

  /* tabellen en teksten uit prijzen.js */
  function euro(n) { return n ? '€ ' + Number(n).toLocaleString('nl-BE') : 'gratis'; }
  if (C) {
    $$('[data-levertermijn]').forEach(function (el) { el.textContent = C.levering.levertermijn; });
    var lt = $('[data-levertabel]');
    if (lt) {
      lt.innerHTML = '<table class="tabel"><thead><tr><th>Levering naar</th><th class="r">Deur</th><th class="r">Leuning tot ' + C.levering.langVanaf / 1000 + ' m</th><th class="r">Leuning langer</th></tr></thead><tbody>' +
        C.levering.zones.map(function (z) { return '<tr><td>' + z.naam + '</td><td class="r">' + euro(z.deur) + '</td><td class="r">' + euro(z.kort) + '</td><td class="r">' + euro(z.lang) + '</td></tr>'; }).join('') +
        '</tbody></table>';
    }
    var gd = $('[data-grenzen="deur"]');
    if (gd) {
      var e = C.deur.grenzen.enkel, d = C.deur.grenzen.dubbel;
      gd.innerHTML = '<table class="tabel"><thead><tr><th></th><th class="r">Breedte</th><th class="r">Hoogte</th></tr></thead><tbody>' +
        '<tr><td>Enkele deur</td><td class="r">' + e.breedteMin + ' tot ' + e.breedteMax + ' mm</td><td class="r">' + e.hoogteMin + ' tot ' + e.hoogteMax + ' mm</td></tr>' +
        '<tr><td>Dubbele deur</td><td class="r">' + d.breedteMin + ' tot ' + d.breedteMax + ' mm</td><td class="r">' + d.hoogteMin + ' tot ' + d.hoogteMax + ' mm</td></tr></tbody></table>';
    }
    var gl = $('[data-grenzen="leuning"]');
    if (gl) gl.textContent = C.leuning.grenzen.lengteMin + ' tot ' + C.leuning.grenzen.lengteMax + ' mm';
  }
  $$('[data-jaar]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
