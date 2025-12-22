/* Pre-cache selectors = huge win */
const $ = document.querySelector.bind(document);
const $$ = sel => Array.from(document.querySelectorAll(sel));


/* ============================================================
   SOCIAL BUTTON HOVER
============================================================ */
(() => {
  const links = $$('.social-buttons a');
  if (!links.length) return;

  let raf = null;
  let current = null;

  const update = e => {
    if (!current) return;

    const a = current;
    const r = a.getBoundingClientRect();

    /* Avoid forced reflow I/O mismatch */
    const x = e.clientX - r.left;
    const p = Math.max(0, Math.min(100, (x / r.width) * 100));

    a.style.background =
      `linear-gradient(to bottom right,#cab062 0%,#543a23 ${p}%,#a5833f 100%)`;
    a.style.transform = `perspective(90vw) rotateY(${p / 5 - 10}deg)`;
  };

  const schedule = e => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => update(e));
  };

  links.forEach(a => {
    a.addEventListener('pointermove', e => {
      current = a;
      schedule(e);
    });

    a.addEventListener('pointerleave', () => {
      current = null;
      a.style.background = '';
      a.style.transform = '';
    });
  });
})();

/* ============================================================
   WEBGL BACKGROUND
============================================================ */
(() => {
  const canvas = $('#bgCanvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl2', { antialias: false });
  if (!gl) return;

  const frag = `#version 300 es
precision highp float;
uniform float t;
uniform vec2 r;
in vec2 u;
out vec4 o;
float n(vec2 p){return fract(sin(dot(p,vec2(1.,300.)))*43758.5453123);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);float a=n(i),b=n(i+vec2(1,0)),c=n(i+vec2(0,1)),d=n(i+1.);vec2 v=f*f*(3.-2.*f);return mix(a,b,v.x)+(c-a)*v.y*(1.-v.x)+(d-b)*v.x*v.y;}
float fbm(vec2 p){float v=0.,a=.4;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.;a*=.4;}return v;}
void main(){vec2 p=u;p.x*=r.x/r.y;float g=mix(p.y*.6+.1,p.y*1.2+.9,fbm(p));vec2 q=(vec2(p.x,p.y-t*.2)*7.);float ns=fbm(q),ins=fbm(vec2(fbm(q+ns+t)*.9-.5,ns));vec3 c=mix(vec3(.95,.7,.3),vec3(.6,.4,.1),ins+.5);o=vec4(c+vec3(ins-g),1.);}
`;

  const vert = `#version 300 es
precision mediump float;
const vec2 pos[6] = vec2[6](vec2(-1,-1),vec2(1,-1),vec2(-1,1),vec2(-1,1),vec2(1,-1),vec2(1,1));
out vec2 u;
void main(){u=pos[gl_VertexID];gl_Position=vec4(pos[gl_VertexID],0.,1.);}
`;

  const compile = (type, src) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    return sh;
  };

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const uniT = gl.getUniformLocation(prog, 't');
  const uniR = gl.getUniformLocation(prog, 'r');

  const resize = () => {
    const w = innerWidth;
    const h = innerHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  };

  window.addEventListener('resize', resize, { passive: true });
  resize();

  const start = performance.now();

  const frame = t => {
    gl.uniform1f(uniT, (t - start) / 1000);
    gl.uniform2f(uniR, innerWidth, innerHeight);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(frame);
  };

  requestAnimationFrame(frame);
})();

/* ============================================================
   MEDIA PLAYER
============================================================ */
(() => {
  const audio = $('#uplink-audio');
  const playBtn = $('.mp-play');
  const nextBtn = $('.mp-next');
  const prevBtn = $('.mp-prev');
  const titleEl = $('.media-title');
  const subtitleEl = $('.media-subtitle');
  const progressBar = $('.media-progress-bar');

  if (!audio || !playBtn || !nextBtn || !prevBtn) return;

  const playlist = [
    { title: "Larry's gotta'n itch", subtitle: "Official Track", src: "/home/computer/Music/AI raw material/ primera parte future.mp3" },
    { title: "Drove so much my crack got'rased", subtitle: "Official Track", src: "/home/computer/Music/AI raw material/segunda parte future.mp3" },
    { title: "Respect the Hustle", subtitle: "Official Track", src: "/home/computer/Music/AI raw material/Respect the Hustle [music].mp3" },
    { title: "Punka'tunka'my lickla bonga!", subtitle: "Official Track", src: "/home/computer/Music/AI raw material/mix_Respect the Hustle (1).wav" }
  ];

  let idx = 0;
  let playing = false;

  function setText(el, txt){ if (el) el.textContent = txt || ''; }
  function loadTrack(i){
    if (i < 0 || i >= playlist.length) return;
    idx = i;
    audio.src = playlist[i].src;
    audio.load();
    setText(titleEl, playlist[i].title || 'Unknown');
    setText(subtitleEl, playlist[i].subtitle || '');
    // update aria progress
    if (progressBar) progressBar.style.width = '0%';
  }

  function togglePlay(){
    if (!audio.src) loadTrack(idx);
    if (playing) {
      audio.pause();
    } else {
      audio.play().catch(()=>{ });
    }
  }

  playBtn.addEventListener('click', () => {
    togglePlay();
  });

  audio.addEventListener('play', () => {
    playing = true;
    playBtn.textContent = '▌▌';
    playBtn.setAttribute('aria-pressed','true');
  });

  audio.addEventListener('pause', () => {
    playing = false;
    playBtn.textContent = '▶';
    playBtn.setAttribute('aria-pressed','false');
  });

  nextBtn.addEventListener('click', () => {
    idx = (idx + 1) % playlist.length;
    loadTrack(idx);
    if (playing) audio.play().catch(()=>{});
  });

  prevBtn.addEventListener('click', () => {
    idx = (idx - 1 + playlist.length) % playlist.length;
    loadTrack(idx);
    if (playing) audio.play().catch(()=>{});
  });

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration || !progressBar) return;
    const p = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = p + '%';
    progressBar.setAttribute('aria-valuenow', Math.floor(p));
  });

  audio.addEventListener('ended', () => {
    // auto advance
    idx = (idx + 1) % playlist.length;
    loadTrack(idx);
    audio.play().catch(()=>{});
  });

  if (playlist.length) loadTrack(0);
})();


/* ============================================================
   STORE EXPAND / COLLAPSE
============================================================ */
(() => {
  const grid = document.getElementById('storeGrid');
  const btn = document.getElementById('expandBtn');
  if (!grid || !btn) return;

  function setCollapsed(collapsed){
    if (collapsed) {
      grid.classList.add('teaser');
      btn.textContent = 'See all products →';
      btn.setAttribute('aria-expanded','false');
    } else {
      grid.classList.remove('teaser');
      btn.textContent = 'Show less ↑';
      btn.setAttribute('aria-expanded','true');
    }
  }

  // initial state: grid has class 'teaser' by default in markup
  setCollapsed(grid.classList.contains('teaser'));

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    setCollapsed(!grid.classList.contains('teaser'));
  });

  // clicking a product expands the grid (useful for mobile)
  grid.addEventListener('click', (e) => {
    if (e.target.closest('.expand-btn')) return;
    if (e.target.closest('.store-item') && grid.classList.contains('teaser')) {
      setCollapsed(false);
    }
  });
})();
// Mobile menu control - toggle with hamburger, close button, or overlay click
const hamburger = document.getElementById('mobileHamburger');
const menu = document.getElementById('mobileMenu');
const overlay = document.getElementById('menuOverlay');
const closeBtn = menu.querySelector('.close-btn');

function toggleMenu() {
  hamburger.classList.toggle('active');
  menu.classList.toggle('active');
  overlay.classList.toggle('active');
}

// Open/close with hamburger
hamburger.addEventListener('click', toggleMenu);

// Close with X button
closeBtn.addEventListener('click', toggleMenu);

// Close with tap outside
overlay.addEventListener('click', toggleMenu);

/* ============================================================
   SUBSCRIBE MODAL LOGIC
============================================================ */
(() => {
  const openBtn = document.getElementById('openSubscribe');
  const overlay = document.getElementById('subscribeOverlay');
  const closeBtn = overlay?.querySelector('.subscribe-close');
  const form = document.getElementById('newsletterForm');
  const msg = form?.querySelector('.form-message');

  if (!openBtn || !overlay) return;

  const open = () => {
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
  };

  const close = () => {
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
  };

  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  // Fake submit for now (replace later with provider/backend)
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    msg.textContent = '✓ Thanks for subscribing!';
    form.reset();
  });
})();
