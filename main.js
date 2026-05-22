/* beautiful. — Interaktion & Bewegung
   1) treibende rote Sprenkel im Hintergrund (Canvas)
   2) Scroll-Reveal für Elemente mit .reveal
   3) sanfter 3D-Tilt der Karte bei Mausbewegung
   Alles respektiert prefers-reduced-motion. */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Jahr im Footer
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── 1) Sprenkel-Hintergrund ───────────────────────── */
  (function speckles() {
    var canvas = document.getElementById('speckles');
    if (!canvas || reduceMotion) return;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var dots = [];
    var w, h;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var target = Math.round((w * h) / 9000); // Dichte abhängig von der Fläche
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
      };
    }

    function tick() {
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
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(229, 54, 44, ' + d.a + ')';
        ctx.fill();
      }
      requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(tick);
  })();

  /* ── 2) Scroll-Reveal ──────────────────────────────── */
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

  /* ── 3) Karten-Tilt ────────────────────────────────── */
  (function tilt() {
    if (reduceMotion) return;
    var el = document.querySelector('[data-tilt]');
    if (!el) return;
    var img = el.querySelector('img');
    if (!img) return;
    var max = 8; // Grad

    el.addEventListener('mousemove', function (e) {
      var rect = el.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width - 0.5;
      var py = (e.clientY - rect.top) / rect.height - 0.5;
      img.style.transform =
        'rotateY(' + (px * max) + 'deg) rotateX(' + (-py * max) + 'deg) scale(1.02)';
    });

    el.addEventListener('mouseleave', function () {
      img.style.transform = '';
    });
  })();
})();
