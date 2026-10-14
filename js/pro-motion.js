/* ==========================================================================
   VALOIS & CO. - PRO MOTION LAYER (vanilla JS, no dependencies)
   Loaded after app.js. Everything is additive and fails safe.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var raf = window.requestAnimationFrame.bind(window);

  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function safeStore(get, key, val) {
    try { return get ? sessionStorage.getItem(key) : sessionStorage.setItem(key, val); } catch (e) { return null; }
  }

  /* ------------------------------------------------------------------
     1. PRELOADER + PAGE TRANSITIONS
     ------------------------------------------------------------------ */
  var preloader = null;

  function buildPreloader(quick) {
    var el = document.createElement('div');
    el.id = 'pm-preloader';
    if (quick) el.className = 'pm-quick';
    var letters = 'VALOIS & CO.'.split('').map(function (c, i) {
      return '<span style="animation-delay:' + (0.7 + i * 0.045).toFixed(2) + 's">' + (c === ' ' ? '&nbsp;' : c) + '</span>';
    }).join('');
    el.innerHTML =
      '<div class="pm-pre-panel top"></div><div class="pm-pre-panel bottom"></div>' +
      '<div class="pm-pre-core">' +
        '<div class="pm-pre-crest"><svg viewBox="0 0 84 84" aria-hidden="true"><rect x="1" y="1" width="82" height="82" rx="4"/></svg><b>V</b></div>' +
        '<div class="pm-pre-name" aria-hidden="true">' + letters + '</div>' +
        '<div class="pm-pre-bar"><i></i></div>' +
      '</div>';
    return el;
  }

  function runPreloader() {
    var seen = safeStore(true, 'pm-seen');
    var quick = !!seen;
    safeStore(false, 'pm-seen', '1');
    preloader = buildPreloader(quick);
    document.body.appendChild(preloader);
    root.classList.add('pm-locked');
    root.classList.remove('pm-preload'); // the real preloader now covers the page

    var hold = quick ? 650 : 2000;
    setTimeout(function () {
      preloader.classList.add('pm-opening');
      setTimeout(function () {
        root.classList.add('pm-loaded');
        root.classList.remove('pm-locked');
        document.dispatchEvent(new CustomEvent('pm:loaded'));
      }, 450);
      setTimeout(function () {
        preloader.classList.add('pm-done');
        if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
        preloader = null;
      }, 1100);
    }, hold);
  }

  function initPageTransitions() {
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#' || /^(mailto:|tel:|javascript:)/i.test(href)) return;
      var url;
      try { url = new URL(a.href, location.href); } catch (err) { return; }
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      if (a.hasAttribute('onclick') && /closeSavedDrawer/.test(a.getAttribute('onclick'))) { /* still navigates */ }
      e.preventDefault();
      var el = buildPreloader(true);
      el.classList.add('pm-closing-init');
      document.body.appendChild(el);
      void el.offsetWidth;
      el.classList.remove('pm-closing-init');
      el.classList.add('pm-closing');
      safeStore(false, 'pm-seen', '1');
      setTimeout(function () { location.href = url.href; }, 650);
    });
    // Back/forward cache: make sure a stale curtain never sticks
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) {
        qsa('#pm-preloader').forEach(function (n) { n.parentNode.removeChild(n); });
        root.classList.remove('pm-locked', 'pm-preload');
        root.classList.add('pm-loaded');
      }
    });
  }

  /* ------------------------------------------------------------------
     2. SPLIT TEXT
     ------------------------------------------------------------------ */
  function splitHeading(el, goldSelector) {
    if (!el || el.classList.contains('pm-split')) return;
    var label = el.textContent.replace(/\s+/g, ' ').trim();
    var counter = { i: 0 };

    function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var parts = child.nodeValue.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('pm-w');
            var wi = document.createElement('pm-wi');
            wi.textContent = p;
            wi.style.setProperty('--i', counter.i++);
            w.appendChild(wi);
            frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          walk(child);
        }
      });
    }
    walk(el);
    el.setAttribute('aria-label', label);
    qsa('pm-w', el).forEach(function (w) { w.setAttribute('aria-hidden', 'true'); });
    el.classList.add('pm-split');
    if (goldSelector) qsa(goldSelector, el).forEach(function (n) { n.classList.add('pm-gold'); });
  }

  /* ------------------------------------------------------------------
     3. OBSERVERS: headings, section heads, extra reveal targets
     ------------------------------------------------------------------ */
  function initObservers() {
    var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var t = en.target;
        t.classList.add('pm-in');
        if (t.classList.contains('pm-rise')) t.classList.add('revealed');
        if (t.classList.contains('card-media')) t.classList.add('pm-media-in');
        io.unobserve(t);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }) : null;

    function watch(el) {
      if (!el) return;
      if (io) io.observe(el); else { el.classList.add('pm-in', 'revealed'); }
    }

    // Section headings: split title, fade sub, ornament
    qsa('.section-head').forEach(function (head) {
      var cs = getComputedStyle(head);
      if (cs.textAlign !== 'center') head.classList.add('pm-left');
      var title = qs('.section-title', head);
      if (title) splitHeading(title);
      var sub = qs('.section-subtitle', head);
      if (sub) { sub.classList.add('pm-sub'); watch(sub); }
      if (title) watch(title);
      watch(head);
    });

    // Standalone headings (press, vip banner, etc.)
    qsa('.press-mentions-heading h2, section > .container > h2').forEach(function (h) {
      if (h.closest('.section-head') || h.classList.contains('pm-split')) return;
      splitHeading(h);
      watch(h);
    });

    // Hero headings: wait for the curtain
    var heroTitle = qs('.hero-title');
    var subTitle = qs('.subpage-hero-title');
    var heroH = heroTitle || subTitle;
    if (heroH) {
      splitHeading(heroH, heroTitle ? '.hero-title span' : null);
      heroH.style.setProperty('--pm-base', '120ms');
      var go = function () { heroH.classList.add('pm-in'); };
      if (root.classList.contains('pm-loaded') || !root.classList.contains('pm-ready')) go();
      else document.addEventListener('pm:loaded', go, { once: true });
    }
    var subSub = qs('.subpage-hero-subtitle');
    if (subSub) {
      subSub.classList.add('pm-sub');
      var go2 = function () { subSub.classList.add('pm-in'); };
      if (root.classList.contains('pm-loaded') || !root.classList.contains('pm-ready')) go2();
      else document.addEventListener('pm:loaded', go2, { once: true });
    }

    // Extra elements that should rise in (footer, banner, press, calculator pieces)
    var extra = '.footer-top-grid > *, .footer-bottom-bar, .press-mentions-list, ' +
      'section[style*="gold-border"] .container > *, .newsletter-form';
    qsa(extra).forEach(function (el, i) {
      if (el.classList.contains('reveal-init') || el.closest('.hero-stats-ribbon')) return;
      el.classList.add('pm-rise');
      el.style.transition = 'opacity 0.9s var(--pm-ease), transform 0.9s var(--pm-ease)';
      el.style.transitionDelay = ((i % 4) * 90) + 'ms';
      watch(el);
    });

    // Stagger siblings that the base reveal already handles
    qsa('.values-grid, .testimonials-grid, .agents-grid, .featured-grid, .advisors-grid, .prox-grid, .about-stats-grid')
      .forEach(function (grid) {
        qsa(':scope > .reveal-init', grid).forEach(function (child, i) {
          if (!child.style.transitionDelay) child.style.transitionDelay = (i % 4) * 110 + 'ms';
        });
      });

    // Hover must never inherit a leftover reveal delay
    document.addEventListener('transitionend', function (e) {
      var t = e.target;
      if (e.propertyName === 'opacity' && t.style && t.style.transitionDelay &&
          (t.classList.contains('revealed') || t.classList.contains('pm-rise'))) {
        t.style.transitionDelay = '';
      }
    }, true);

    // Dynamically rendered cards (featured / property grids): settle their images too
    var mo = new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        m.addedNodes.forEach(function (n) {
          if (n.nodeType !== 1) return;
          qsa('.card-media', n).forEach(function (cm) { if (!cm.closest('.revealed')) watch(cm); });
        });
      });
    });
    ['featured-properties-container', 'properties-grid-container', 'property-results'].forEach(function (id) {
      var c = document.getElementById(id); if (c) mo.observe(c, { childList: true });
    });
  }

  /* ------------------------------------------------------------------
     4. HERO: PARALLAX, GOLD DUST, SCROLL CUE
     ------------------------------------------------------------------ */
  function initHero() {
    var hero = qs('#hero-section') || qs('.subpage-hero');
    if (!hero) return;
    var isHome = hero.id === 'hero-section';

    // Gold dust canvas
    var canvas = document.createElement('canvas');
    canvas.className = 'pm-dust';
    canvas.setAttribute('aria-hidden', 'true');
    var content = qs('.hero-content', hero) || qs('.container', hero);
    hero.insertBefore(canvas, content);
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), parts = [], visible = true, running = false;

    function resize() {
      W = hero.clientWidth; H = hero.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = clamp(Math.round(W / 26), 18, 56);
      parts = [];
      for (var i = 0; i < n; i++) parts.push(spawn(true));
    }
    function spawn(anywhere) {
      return {
        x: Math.random() * W,
        y: anywhere ? Math.random() * H : H + 10,
        r: 0.5 + Math.random() * 1.7,
        vy: 0.12 + Math.random() * 0.4,
        vx: (Math.random() - 0.5) * 0.18,
        a: 0.2 + Math.random() * 0.6,
        t: Math.random() * Math.PI * 2,
        s: 0.012 + Math.random() * 0.02
      };
    }
    var mx = 0, my = 0, tx = 0, ty = 0;
    function draw() {
      if (!visible || document.hidden) { running = false; return; }
      ctx.clearRect(0, 0, W, H);
      mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.y -= p.vy; p.x += p.vx + Math.sin(p.t) * 0.12; p.t += p.s;
        if (p.y < -10 || p.x < -10 || p.x > W + 10) { parts[i] = spawn(false); continue; }
        var tw = 0.55 + 0.45 * Math.sin(p.t * 3);
        var px = p.x + mx * p.r * 6, py = p.y + my * p.r * 6;
        var g = ctx.createRadialGradient(px, py, 0, px, py, p.r * 4);
        g.addColorStop(0, 'rgba(249,226,157,' + (p.a * tw).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(212,175,55,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(px, py, p.r * 4, 0, 6.2832); ctx.fill();
      }
      raf(draw);
    }
    function start() { if (!running) { running = true; raf(draw); } }
    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) start(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) start(); }, { threshold: 0 }).observe(hero);
    }
    if (finePointer) {
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        tx = (e.clientX - r.left) / r.width - 0.5;
        ty = (e.clientY - r.top) / r.height - 0.5;
      });
    }
    start();

    // Scroll-linked parallax + content fade
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      raf(function () {
        var y = window.pageYOffset;
        var h = hero.offsetHeight || 1;
        hero.classList.toggle('pm-scrolled', y > 30);
        if (y <= h * 1.2) {
          hero.style.setProperty('--pm-py', (Math.min(y * 0.28, h * 0.1)).toFixed(1) + 'px');
          hero.style.setProperty('--pm-cy', (y * 0.08).toFixed(1) + 'px');
        }
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (isHome && !qs('.pm-scroll-cue')) {
      var cue = document.createElement('a');
      cue.className = 'pm-scroll-cue';
      cue.href = '#featured-section';
      cue.textContent = 'Scroll';
      cue.addEventListener('click', function (e) {
        var t = qs('#featured-section');
        if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
      });
      hero.appendChild(cue);
    }
  }

  /* ------------------------------------------------------------------
     5. HEADER AUTO-HIDE
     ------------------------------------------------------------------ */
  function initHeader() {
    var header = qs('#main-header');
    if (!header) return;
    var last = window.pageYOffset;
    window.addEventListener('scroll', function () {
      var y = window.pageYOffset;
      var menuOpen = qs('.nav-links.mobile-open');
      if (menuOpen || y < 320) header.classList.remove('pm-hidden');
      else if (y > last + 6) header.classList.add('pm-hidden');
      else if (y < last - 6) header.classList.remove('pm-hidden');
      last = y;
    }, { passive: true });
    header.addEventListener('focusin', function () { header.classList.remove('pm-hidden'); });
  }

  /* ------------------------------------------------------------------
     6. CUSTOM CURSOR
     ------------------------------------------------------------------ */
  function initCursor() {
    if (!finePointer) return;
    var dot = document.createElement('div'); dot.className = 'pm-cursor-dot';
    var ring = document.createElement('div'); ring.className = 'pm-cursor-ring';
    ring.innerHTML = '<span>View</span>';
    document.body.appendChild(ring); document.body.appendChild(dot);
    var x = -100, y = -100, rx = -100, ry = -100;

    document.addEventListener('mousemove', function (e) {
      x = e.clientX; y = e.clientY;
      root.classList.add('pm-cursor-on');
      var t = e.target;
      var card = t.closest && t.closest('.property-card, .featured-card');
      var inter = t.closest && t.closest('a, button, select, input, textarea, label, .map-city-pill, [role="button"]');
      root.classList.toggle('pm-cursor-view', !!card && !(inter && !card.contains(inter)));
      root.classList.toggle('pm-cursor-hover', !!inter && !card);
    }, { passive: true });
    document.addEventListener('mouseleave', function () { root.classList.remove('pm-cursor-on'); });
    document.addEventListener('mousedown', function () { root.classList.add('pm-cursor-down'); });
    document.addEventListener('mouseup', function () { root.classList.remove('pm-cursor-down'); });

    (function loop() {
      rx += (x - rx) * 0.16; ry += (y - ry) * 0.16;
      dot.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)';
      raf(loop);
    })();
  }

  /* ------------------------------------------------------------------
     7. MAGNETIC BUTTONS + RIPPLE
     ------------------------------------------------------------------ */
  var BTN = '.btn-luxury-gold, .btn-luxury-outline, .btn-hero-submit, .btn-vip-tour, .btn-submit-booking, .btn-vip-submit';
  function initButtons() {
    if (finePointer) {
      document.addEventListener('mousemove', function (e) {
        var b = e.target.closest && e.target.closest(BTN);
        if (!b) return;
        var r = b.getBoundingClientRect();
        b.style.setProperty('--pm-mx', ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + 'px');
        b.style.setProperty('--pm-my', ((e.clientY - r.top - r.height / 2) * 0.32).toFixed(1) + 'px');
      }, { passive: true });
      document.addEventListener('mouseout', function (e) {
        var b = e.target.closest && e.target.closest(BTN);
        if (b && !b.contains(e.relatedTarget)) { b.style.setProperty('--pm-mx', '0px'); b.style.setProperty('--pm-my', '0px'); }
      });
    }
    document.addEventListener('pointerdown', function (e) {
      var b = e.target.closest && e.target.closest(BTN);
      if (!b) return;
      var r = b.getBoundingClientRect();
      var size = Math.max(r.width, r.height) * 2;
      var s = document.createElement('span');
      s.className = 'pm-ripple';
      s.style.width = s.style.height = size + 'px';
      s.style.left = (e.clientX - r.left - size / 2) + 'px';
      s.style.top = (e.clientY - r.top - size / 2) + 'px';
      b.appendChild(s);
      setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 800);
    });
  }

  /* ------------------------------------------------------------------
     8. CARD SPOTLIGHT
     ------------------------------------------------------------------ */
  var CARD = '.property-card, .featured-card, .value-card, .testimonial-card, .agent-card, .prox-card';
  function initSpotlight() {
    if (!finePointer) return;
    document.addEventListener('mouseover', function (e) {
      var c = e.target.closest && e.target.closest(CARD);
      if (!c || c.querySelector(':scope > .pm-spot')) return;
      if (getComputedStyle(c).position === 'static') c.style.position = 'relative';
      c.classList.add('pm-spot-host');
      var s = document.createElement('span');
      s.className = 'pm-spot';
      s.setAttribute('aria-hidden', 'true');
      c.appendChild(s);
    });
    document.addEventListener('mousemove', function (e) {
      var c = e.target.closest && e.target.closest(CARD);
      if (!c) return;
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  /* ------------------------------------------------------------------
     9. PRESS MARQUEE
     ------------------------------------------------------------------ */
  function initMarquee() {
    var list = qs('.press-mentions-list');
    if (!list || list.classList.contains('pm-marquee-built')) return;
    var items = qsa('.press-mention-wordmark', list);
    if (!items.length) return;
    var track = document.createElement('div');
    track.className = 'pm-track';
    // four copies (two identical halves) => seamless -50% loop even on wide screens
    for (var k = 0; k < 4; k++) {
      items.forEach(function (it) {
        var c = it.cloneNode(true);
        if (k > 0) c.setAttribute('aria-hidden', 'true');
        track.appendChild(c);
      });
    }
    // make each half wide enough on big screens
    list.innerHTML = '';
    list.appendChild(track);
    list.classList.add('pm-marquee', 'pm-marquee-built');
    list.style.padding = '';
    list.style.border = '';
  }

  /* ------------------------------------------------------------------
     INIT
     ------------------------------------------------------------------ */
  function init() {
    try {
      if (!reduced) {
        initObservers();
        initHero();
        initHeader();
        initCursor();
        initButtons();
        initSpotlight();
        initMarquee();
        initPageTransitions();
        runPreloader();
      }
    } catch (err) {
      // Never let polish break the site
      root.classList.remove('pm-preload', 'pm-locked');
      root.classList.add('pm-loaded');
      if (window.console) console.warn('[pro-motion]', err);
    }
  }

  // Run after app.js's own jQuery ready handler so we see its reveal classes
  if (window.jQuery) window.jQuery(init);
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
