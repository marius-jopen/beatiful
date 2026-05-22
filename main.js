/* beautiful. — Interaktion & Bewegung
   1) Sprenkel-Hintergrund (Canvas) mit sanfter Maus-Parallax
   2) Hero wird buchstabenweise aufgebaut
   3) Scroll-Reveal für Elemente mit .reveal
   4) 3D-Tilt + cursor-folgender Glanz auf der Karte
   5) eigener Cursor (Ring + Punkt), nur auf Maus-Geräten
   6) magnetische Elemente ([data-magnetic])
   Alles respektiert prefers-reduced-motion. */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Jahr im Footer
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── 2) Hero buchstabenweise ───────────────────────── */
  (function splitText() {
    var el = document.querySelector('[data-split]');
    if (!el) return;
    var text = el.textContent;
    el.textContent = '';
    for (var i = 0; i < text.length; i++) {
      var span = document.createElement('span');
      span.className = 'char';
      span.textContent = text[i];
      span.setAttribute('aria-hidden', 'true');
      span.style.animationDelay = (0.15 + i * 0.06) + 's';
      el.appendChild(span);
    }
  })();

  /* ── 1) Sprenkel-Hintergrund + Parallax ────────────── */
  (function speckles() {
    var canvas = document.getElementById('speckles');
    if (!canvas || reduceMotion) return;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var dots = [];
    var w, h;
    var mx = 0, my = 0;       // Ziel-Parallax
    var px = 0, py = 0;       // geglättete Parallax

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var target = Math.round((w * h) / 9000);
      dots = [];
      for (var i = 0; i < target; i++) dots.push(makeDot());
    }

    function makeDot() {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        a: Math.random() * 0.5 + 0.2,
        depth: Math.random() * 0.8 + 0.2, // für Parallax-Tiefe
      };
    }

    if (finePointer) {
      window.addEventListener('mousemove', function (e) {
        mx = (e.clientX / window.innerWidth - 0.5) * 40;
        my = (e.clientY / window.innerHeight - 0.5) * 40;
      });
    }

    function tick() {
      px += (mx - px) * 0.05;
      py += (my - py) * 0.05;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < -5) d.x = w + 5;
        if (d.x > w + 5) d.x = -5;
        if (d.y < -5) d.y = h + 5;
        if (d.y > h + 5) d.y = -5;
        ctx.beginPath();
        ctx.arc(d.x + px * d.depth, d.y + py * d.depth, d.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(229, 54, 44, ' + d.a + ')';
        ctx.fill();
      }
      requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(tick);
  })();

  /* ── 3) Scroll-Reveal ──────────────────────────────── */
  (function reveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ── 4) Karten-Tilt + Glanz ────────────────────────── */
  (function tilt() {
    if (reduceMotion) return;
    var el = document.querySelector('[data-tilt]');
    if (!el) return;
    var img = el.querySelector('img');
    var glare = el.querySelector('.glare');
    if (!img) return;
    var max = 9; // Grad

    el.addEventListener('mousemove', function (e) {
      var rect = el.getBoundingClientRect();
      var rx = (e.clientX - rect.left) / rect.width;
      var ry = (e.clientY - rect.top) / rect.height;
      img.style.transform =
        'rotateY(' + ((rx - 0.5) * max) + 'deg) rotateX(' + (-(ry - 0.5) * max) + 'deg) scale(1.03)';
      if (glare) {
        glare.style.setProperty('--gx', (rx * 100) + '%');
        glare.style.setProperty('--gy', (ry * 100) + '%');
      }
    });

    el.addEventListener('mouseleave', function () {
      img.style.transform = '';
    });
  })();

  /* ── 5) Eigener Cursor ─────────────────────────────── */
  (function cursor() {
    if (reduceMotion || !finePointer) return;
    var ring = document.querySelector('.cursor');
    var dot = document.querySelector('.cursor-dot');
    if (!ring || !dot) return;
    document.body.classList.add('has-cursor');

    var tx = 0, ty = 0, rx = 0, ry = 0;

    window.addEventListener('mousemove', function (e) {
      tx = e.clientX;
      ty = e.clientY;
      dot.style.transform = 'translate(' + tx + 'px,' + ty + 'px)';
    });

    function loop() {
      rx += (tx - rx) * 0.18;
      ry += (ty - ry) * 0.18;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      requestAnimationFrame(loop);
    }
    loop();

    // Ring vergrößern über klickbaren Elementen
    var hoverSel = 'a, button, [data-magnetic], .product-image, .marquee';
    document.querySelectorAll(hoverSel).forEach(function (el) {
      el.addEventListener('mouseenter', function () { ring.classList.add('is-hover'); });
      el.addEventListener('mouseleave', function () { ring.classList.remove('is-hover'); });
    });
  })();

  /* ── 6) Magnetische Elemente ───────────────────────── */
  (function magnetic() {
    if (reduceMotion || !finePointer) return;
    var els = document.querySelectorAll('[data-magnetic]');
    var strength = 0.35;

    els.forEach(function (el) {
      el.style.transition = 'transform 0.2s ease';
      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var x = e.clientX - (rect.left + rect.width / 2);
        var y = e.clientY - (rect.top + rect.height / 2);
        el.style.transform = 'translate(' + x * strength + 'px,' + y * strength + 'px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = '';
      });
    });
  })();
})();
