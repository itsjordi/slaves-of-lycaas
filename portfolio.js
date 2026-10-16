/* Shared behaviour for portfolio.html and the case-*.html pages.
   Theme toggle, scroll reveal and drag-to-pan strips. No dependencies. */
(function(){
  'use strict';
  var root = document.documentElement;

  /* ---- theme: system by default, explicit choice stored under "theme" ---- */
  var mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  function stored(){ try{ return localStorage.getItem('theme'); }catch(e){ return null; } }
  function apply(t){ root.setAttribute('data-theme', t); }
  function sync(){ var s = stored(); apply(s === 'dark' || s === 'light' ? s : (mq && mq.matches ? 'dark' : 'light')); }
  sync();
  if (mq){ var h = function(){ if (!stored()) sync(); }; if (mq.addEventListener) mq.addEventListener('change', h); else if (mq.addListener) mq.addListener(h); }
  document.querySelectorAll('.themebtn').forEach(function(b){
    b.addEventListener('click', function(){
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(next);
      try{ localStorage.setItem('theme', next); }catch(e){}
    });
  });

  /* ---- scroll reveal: one shape, staggered per sibling ---- */
  document.body.classList.remove('nojs');
  var els = document.querySelectorAll('.rv');
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still || !('IntersectionObserver' in window)){
    els.forEach(function(e){ e.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function(list){
      var i = 0;
      list.forEach(function(en){
        if (en.isIntersecting){
          en.target.style.transitionDelay = (i * 0.06) + 's';
          en.target.classList.add('in');
          io.unobserve(en.target);
          i++;
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
    els.forEach(function(e){ io.observe(e); });
  }

  /* ---- page progress, drawn in the top bar ---- */
  var prog = document.querySelector('.progress');
  if (prog){
    var tick = false;
    var upd = function(){
      tick = false;
      var h = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0) + ')';
    };
    window.addEventListener('scroll', function(){ if (!tick){ tick = true; requestAnimationFrame(upd); } }, { passive: true });
    window.addEventListener('resize', upd);
    upd();
  }

  /* ---- strips: drag with the mouse to look around (touch scrolls natively) ---- */
  document.querySelectorAll('.strip').forEach(function(s){
    var down = false, x0 = 0, l0 = 0, moved = 0;
    s.addEventListener('pointerdown', function(e){
      if (e.pointerType !== 'mouse') return;
      down = true; moved = 0; x0 = e.clientX; l0 = s.scrollLeft; s.classList.add('drag');
    });
    window.addEventListener('pointermove', function(e){
      if (!down) return;
      var dx = e.clientX - x0; moved = Math.max(moved, Math.abs(dx));
      s.scrollLeft = l0 - dx;
    });
    window.addEventListener('pointerup', function(){ if (down){ down = false; s.classList.remove('drag'); } });
    s.addEventListener('dragstart', function(e){ e.preventDefault(); });
  });
})();
