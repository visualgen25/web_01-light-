// Elements
  const btn = document.querySelector('.menu-toggle');
  const nav = document.getElementById('mobileNav');
  const overlay = document.getElementById('mobileOverlay');

  // Show the button on small screens (matches your @media breakpoint)
  function updateButtonVisibility(){
    if (window.matchMedia('(max-width:560px)').matches){
      btn.style.display = 'flex';
    } else {
      btn.style.display = 'none';
      // ensure menu closed on larger screens
      nav.classList.remove('open');
      overlay.classList.remove('visible');
      nav.setAttribute('aria-hidden','true');
      overlay.setAttribute('aria-hidden','true');
      btn.setAttribute('aria-expanded','false');
      document.body.style.overflow = '';
    }
  }
  updateButtonVisibility();
  window.addEventListener('resize', updateButtonVisibility);

  function openMenu(){
    nav.classList.add('open');
    overlay.classList.add('visible');
    nav.setAttribute('aria-hidden','false');
    overlay.setAttribute('aria-hidden','false');
    btn.setAttribute('aria-expanded','true');
    document.body.style.overflow='hidden';
  }
  function closeMenu(){
    nav.classList.remove('open');
    overlay.classList.remove('visible');
    nav.setAttribute('aria-hidden','true');
    overlay.setAttribute('aria-hidden','true');
    btn.setAttribute('aria-expanded','false');
    document.body.style.overflow='';
  }

  btn.addEventListener('click',()=>nav.classList.contains('open')?closeMenu():openMenu());
  overlay.addEventListener('click',closeMenu);
  document.addEventListener('keydown',(e)=>{ if(e.key==='Escape') closeMenu(); });

  // ensure ARIA initial state
  nav.setAttribute('aria-hidden','true');
  overlay.setAttribute('aria-hidden','true');
  btn.setAttribute('aria-expanded','false');

    // small helper: mobile menu toggle (kept minimal)
    (function(){
      // no-op: nav is hidden on narrow screens via CSS. You can expand this if you want a burger menu.
    })();