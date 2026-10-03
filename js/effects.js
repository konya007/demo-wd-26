/**
 * effects.js — chuyển động của trang. Chạy lại sau mỗi lần render (sự kiện 'wl:rendered').
 *
 * Thuộc tính trong HTML do các thành phần sinh ra:
 *   data-reveal          hiện dần khi cuộn tới (data-reveal="clip": mở như rèm)
 *   data-tilt            thẻ nghiêng 3D theo con trỏ, có vệt sáng
 *   data-tilt-stage      khung ảnh lớn nghiêng 3D, các lớp bên trong có độ sâu khác nhau
 *   data-parallax="0.3"  trôi chậm hơn/nhanh hơn tốc độ cuộn
 *   data-rail            dãy thẻ trượt ngang khi cuộn dọc (cần GSAP ScrollTrigger)
 *   data-expand          khối CTA nở từ thẻ bo góc ra toàn màn hình
 *   data-steps           đường nối các bước chạy dài theo nhịp cuộn
 *   data-timeline        đường nối dọc của dòng thời gian (con: [data-line-y]) dài theo nhịp cuộn
 *
 * GSAP + ScrollTrigger (CDN) lo các hiệu ứng gắn với thanh cuộn. Không tải được GSAP
 * thì trang vẫn đầy đủ nội dung, chỉ bớt chuyển động. Tôn trọng prefers-reduced-motion.
 */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const hasGsap = () => window.gsap && window.ScrollTrigger;

let io = null;

/** Hiện dần: thêm class khi phần tử vào khung nhìn. Không cần GSAP. */
function reveal(root) {
  const els = root.querySelectorAll('[data-reveal]:not(.is-in)');
  if (reduce || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('is-in')); return; }
  io = io || new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  els.forEach((e) => io.observe(e));
}

/** Thẻ nghiêng 3D theo vị trí con trỏ + vệt sáng chạy theo. */
function tilt(root) {
  if (reduce || !finePointer) return;
  root.querySelectorAll('[data-tilt]').forEach((card) => {
    if (card._tilt) return;
    card._tilt = true;
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--rx', `${(-y * 10).toFixed(2)}deg`);
      card.style.setProperty('--ry', `${(x * 12).toFixed(2)}deg`);
      card.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`);
      card.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(1)}%`);
      card.classList.add('is-tilting');
    });
    card.addEventListener('pointerleave', () => {
      card.classList.remove('is-tilting');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });

  // Sân khấu lớn: nghiêng nhẹ hơn, các lớp con (ảnh, thẻ số liệu, quầng sáng) lệch nhau tạo chiều sâu
  root.querySelectorAll('[data-tilt-stage]').forEach((stage) => {
    if (stage._tilt) return;
    stage._tilt = true;
    stage.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      stage.style.setProperty('--rx', `${(-y * 8).toFixed(2)}deg`);
      stage.style.setProperty('--ry', `${(x * 10).toFixed(2)}deg`);
      stage.style.setProperty('--px', x.toFixed(3));
      stage.style.setProperty('--py', y.toFixed(3));
    });
    stage.addEventListener('pointerleave', () => {
      ['--rx', '--ry'].forEach((p) => stage.style.setProperty(p, '0deg'));
      ['--px', '--py'].forEach((p) => stage.style.setProperty(p, '0'));
    });
  });
}

/** Các hiệu ứng gắn với thanh cuộn (GSAP ScrollTrigger). */
function scrollFx(root) {
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.getAll().forEach((t) => t.kill());

  // Ảnh trôi lệch tốc độ cuộn
  root.querySelectorAll('[data-parallax]').forEach((el) => {
    const k = parseFloat(el.dataset.parallax) || 0.2;
    gsap.fromTo(el, { yPercent: -k * 50 }, {
      yPercent: k * 50, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  // Hero: ảnh lùi ra xa khi cuộn qua
  const stage = root.querySelector('.hero__stage');
  if (stage) {
    gsap.to(stage, {
      scale: 0.86, yPercent: 8, opacity: 0.4, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
  }
  const copy = root.querySelector('.hero--full .hero__copy');
  if (copy) {
    gsap.to(copy, { yPercent: -18, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  // Dãy sản phẩm: ghim khối, kéo dãy thẻ sang ngang theo nhịp cuộn dọc
  const mm = gsap.matchMedia();
  mm.add('(min-width: 960px)', () => {
    root.querySelectorAll('[data-rail]').forEach((rail) => {
      const track = rail.querySelector('[data-rail-track]');
      const dist = () => Math.max(0, track.scrollWidth - rail.querySelector('.rail__viewport').clientWidth);
      if (dist() < 40) return;
      gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: rail, start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true },
      });
    });
  });

  // Đường nối các bước quy trình dài dần
  root.querySelectorAll('[data-steps] [data-line]').forEach((line) => {
    gsap.fromTo(line, { scaleX: 0 }, {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: line.closest('[data-steps]'), start: 'top 75%', end: 'bottom 55%', scrub: true },
    });
  });

  // Dòng thời gian landing: đường nối dọc dài dần theo nhịp cuộn
  root.querySelectorAll('[data-timeline] [data-line-y]').forEach((line) => {
    gsap.fromTo(line, { scaleY: 0 }, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: line.closest('[data-timeline]'), start: 'top 70%', end: 'bottom 60%', scrub: true },
    });
  });

  // CTA cuối trang: nở từ thẻ bo góc ra tràn màn hình
  root.querySelectorAll('[data-expand]').forEach((band) => {
    gsap.fromTo(band, { clipPath: 'inset(0% 5% 0% 5% round 40px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
      scrollTrigger: { trigger: band, start: 'top 95%', end: 'top 35%', scrub: true },
    });
    gsap.fromTo(band.querySelector('h2'), { yPercent: 30, opacity: 0.2 }, {
      yPercent: 0, opacity: 1, ease: 'none',
      scrollTrigger: { trigger: band, start: 'top 85%', end: 'top 35%', scrub: true },
    });
  });

  ScrollTrigger.refresh();
}

export function runEffects(root = document) {
  reveal(root);
  tilt(root);
  if (!reduce && hasGsap()) {
    // chờ ảnh trong viewport có kích thước để tính đúng vị trí ghim
    requestAnimationFrame(() => scrollFx(root));
    window.addEventListener('load', () => window.ScrollTrigger.refresh(), { once: true });
  }
}
