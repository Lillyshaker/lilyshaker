(function () {
  document.documentElement.classList.add('js');

  // Mobile menu overlay
  var overlay = document.getElementById('menu');
  var openBtn = document.querySelector('.menu-btn');
  var closeBtn = overlay && overlay.querySelector('.close');
  function setMenu(open) {
    if (!overlay) return;
    overlay.classList.toggle('open', open);
    overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (openBtn) openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open && closeBtn) closeBtn.focus();
  }
  if (openBtn) openBtn.addEventListener('click', function () { setMenu(true); });
  if (closeBtn) closeBtn.addEventListener('click', function () { setMenu(false); });
  if (overlay) overlay.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { setMenu(false); closeLightbox(); }
  });

  // Reveal on scroll
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // Sliders and carousels
  document.querySelectorAll('[data-slider]').forEach(function (sl) {
    var track = sl.querySelector('.slider-track');
    var slides = track.children;
    var prev = sl.querySelector('.prev'), next = sl.querySelector('.next');
    var dots = sl.querySelectorAll('.dot');
    function step() { return slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth; }
    function index() { return Math.round(track.scrollLeft / Math.max(1, step())); }
    function update() {
      var i = index();
      var max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
      dots.forEach(function (d, k) { d.classList.toggle('active', k === i); });
      if (!sl.classList.contains('carousel') && slides[i]) {
        var h = slides[i].offsetHeight;
        if (h) track.style.height = h + 'px';
      }
    }
    Array.prototype.forEach.call(track.querySelectorAll('img'), function (im) {
      if (!im.complete) im.addEventListener('load', update);
    });
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    dots.forEach(function (d, k) { d.addEventListener('click', function () { track.scrollTo({ left: k * step(), behavior: 'smooth' }); }); });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  // Long phone screenshots scroll inside their frame on hover
  function setScroll(img) {
    var frame = img.closest('.phone-frame');
    if (!frame) return;
    var extra = img.offsetHeight - frame.clientHeight;
    if (extra > 8) { img.classList.add('scrolls'); img.style.setProperty('--scroll', (-extra) + 'px'); }
  }
  document.querySelectorAll('.phone-frame img').forEach(function (img) {
    if (img.complete) setScroll(img); else img.addEventListener('load', function () { setScroll(img); });
  });

  // Lightbox
  var lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-label', 'Image preview');
  lb.innerHTML = '<img alt="">';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector('img');
  var lastFocus = null;
  function closeLightbox() { if (!lb.classList.contains('open')) return; lb.classList.remove('open'); if (lastFocus) lastFocus.focus(); }
  function openLightbox(img) { lastFocus = img; lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt || ''; lb.classList.add('open'); }
  document.addEventListener('keydown', function (e) {
    var img = e.target.closest && e.target.closest('img.zoom');
    if (img && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openLightbox(img); }
  });
  lb.addEventListener('click', closeLightbox);
  document.addEventListener('click', function (e) {
    var img = e.target.closest('.zoom');
    if (!img || img.closest('.tilted')) return;
    openLightbox(img);
  });

  // Scroll to top: shown once the hero has left the screen (no window scroll listener)
  var top = document.querySelector('.to-top');
  var hero = document.querySelector('.home-hero, .cs-hero, .about, .contact, .nf');
  if (top) {
    top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    if (hero && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { top.classList.toggle('show', !en[0].isIntersecting); }).observe(hero);
    }
  }

  // Contact form: inline validation, then opens the visitor's email app with the message filled in
  var form = document.getElementById('contact-form');
  if (form) {
    function setError(field, msg) {
      var el = document.getElementById(field.id + '-error');
      field.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (el) el.textContent = msg || '';
    }
    form.email.addEventListener('blur', function () {
      if (form.email.value.trim()) setError(form.email, form.email.validity.valid ? '' : 'Enter an email address like name@example.com.');
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = form.email.value.trim(), name = form.name.value.trim(), msg = form.message.value.trim();
      var note = form.querySelector('.form-note');
      var ok = true;
      if (!email) { setError(form.email, 'Add your email so Lily can reply.'); ok = false; }
      else if (!form.email.validity.valid) { setError(form.email, 'Enter an email address like name@example.com.'); ok = false; }
      else setError(form.email, '');
      if (!msg) { setError(form.message, 'Write a short message.'); ok = false; } else setError(form.message, '');
      if (!ok) { note.textContent = ''; (form.querySelector('[aria-invalid="true"]') || form.email).focus(); return; }
      var subject = encodeURIComponent('Portfolio inquiry' + (name ? ' from ' + name : ''));
      var body = encodeURIComponent(msg + '\n\n' + (name ? name + '\n' : '') + email);
      window.location.href = 'mailto:lillyshaker99@gmail.com?subject=' + subject + '&body=' + body;
      note.textContent = 'Your email app should open with the message ready to send. If it does not, write to lillyshaker99@gmail.com.';
    });
  }
})();
