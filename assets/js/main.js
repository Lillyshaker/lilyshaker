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
  function closeLightbox() { lb.classList.remove('open'); }
  lb.addEventListener('click', closeLightbox);
  document.addEventListener('click', function (e) {
    var img = e.target.closest('.zoom');
    if (!img || img.closest('.tilted')) return;
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt || '';
    lb.classList.add('open');
  });

  // Scroll to top
  var top = document.querySelector('.to-top');
  if (top) {
    window.addEventListener('scroll', function () { top.classList.toggle('show', window.scrollY > 900); }, { passive: true });
    top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  // Contact form: opens the visitor's email app with the message filled in
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = form.email.value.trim(), name = form.name.value.trim(), msg = form.message.value.trim();
      var note = form.querySelector('.form-note');
      if (!email || !msg) { note.textContent = 'Please add your email and a message.'; return; }
      var subject = encodeURIComponent('Portfolio inquiry' + (name ? ' from ' + name : ''));
      var body = encodeURIComponent(msg + '\n\n' + (name ? name + '\n' : '') + email);
      window.location.href = 'mailto:lillyshaker99@gmail.com?subject=' + subject + '&body=' + body;
      note.textContent = 'Your email app should open with the message ready to send.';
    });
  }
})();
