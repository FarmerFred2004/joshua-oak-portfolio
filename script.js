const yearEl=document.getElementById('year');
if(yearEl) yearEl.textContent=new Date().getFullYear();

// Final Lighting — informal stacked photo deck
(() => {
  document.querySelectorAll('[data-lighting-deck]').forEach(deck => {
    const cards = [...deck.querySelectorAll('.lighting-card')];
    const current = deck.querySelector('[data-deck-current]');
    let index = 0;
    const render = () => {
      cards.forEach((card, i) => {
        card.classList.remove('is-active','is-under-one','is-under-two');
        const delta = (i - index + cards.length) % cards.length;
        if (delta === 0) card.classList.add('is-active');
        else if (delta === 1) card.classList.add('is-under-one');
        else if (delta === 2) card.classList.add('is-under-two');
      });
      if (current) current.textContent = index + 1;
    };
    deck.querySelector('[data-deck-prev]')?.addEventListener('click', () => { index = (index - 1 + cards.length) % cards.length; render(); });
    deck.querySelector('[data-deck-next]')?.addEventListener('click', () => { index = (index + 1) % cards.length; render(); });
    render();
  });
})();


// Site-wide Back to Top button
(() => {
  let button = document.getElementById('backToTop');
  if (!button) {
    button = document.createElement('button');
    button.className = 'back-to-top';
    button.id = 'backToTop';
    button.type = 'button';
    button.setAttribute('aria-label', 'Back to top');
    button.innerHTML = '↑ <span>Back to Top</span>';
    document.body.appendChild(button);
  }
  const update = () => button.classList.toggle('is-visible', window.scrollY > 500);
  window.addEventListener('scroll', update, {passive:true});
  update();
  if (!button.dataset.topBound) {
    button.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
    button.dataset.topBound='true';
  }
})();

// V91 — project jump navigation: stable one-pass smooth scroll.
// CFT images now include intrinsic width/height so lazy loading cannot move the target mid-scroll.
(() => {
  const bindNav = (nav, page) => {
    if (!nav) return;
    nav.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', event => {
        const selector = link.getAttribute('href');
        const section = page.querySelector(selector);
        if (!section) return;
        event.preventDefault();
        const title = section.querySelector('.phase-title, h2') || section;
        const header = document.querySelector('.header');
        const headerHeight = header ? header.getBoundingClientRect().height : 0;
        const breathingRoom = window.innerWidth <= 760 ? 10 : 16;
        const top = Math.max(0, window.scrollY + title.getBoundingClientRect().top - headerHeight - breathingRoom);
        history.replaceState(null, '', selector);
        window.scrollTo({top, behavior:'smooth'});
      });
    });
  };
  document.querySelectorAll('.cleared-page, .spaceman-page').forEach(page => bindNav(page.querySelector('.process-jump-nav'), page));
})();

// V45: large play button over featured video posters.
document.querySelectorAll('.video-with-play-overlay').forEach((wrap) => {
  const video = wrap.querySelector('video');
  const overlay = wrap.querySelector('.video-play-overlay');
  if (!video || !overlay) return;
  overlay.addEventListener('click', () => video.play());
  video.addEventListener('play', () => wrap.classList.add('is-playing'));
  video.addEventListener('ended', () => wrap.classList.remove('is-playing'));
});

// V87: Houdini section jump navigation + reliable first-click process reveal.
(() => {
  const page = document.querySelector('.houdini-page');
  if (!page) return;

  page.querySelectorAll('.houdini-jump-nav a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const section = page.querySelector(link.getAttribute('href'));
      if (!section) return;
      event.preventDefault();
      const title = section.querySelector('h2') || section;
      const header = document.querySelector('.header');
      const headerHeight = header ? header.getBoundingClientRect().height : 0;
      const breathingRoom = 8;
      const top = Math.max(0, window.scrollY + title.getBoundingClientRect().top - headerHeight - breathingRoom);
      window.scrollTo({top, behavior:'smooth'});
      history.replaceState(null, '', link.getAttribute('href'));
    });
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  page.querySelectorAll('.houdini-details-toggle').forEach(toggle => {
    const details = document.getElementById(toggle.getAttribute('aria-controls'));
    if (!details) return;
    const label = toggle.querySelector('span:last-child');
    let timer = null;

    const labelFor = open => {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (label) label.textContent = open ? 'Hide Process' : 'View Process';
    };

    const resetInline = () => {
      details.style.height='';
      details.style.opacity='';
      details.style.clipPath='';
      details.style.overflow='';
      details.style.transition='';
    };

    const openPanel = () => {
      clearTimeout(timer);
      labelFor(true);
      details.hidden = false;
      resetInline();
      if (reducedMotion) return;

      details.style.overflow='hidden';
      details.style.height='0px';
      details.style.opacity='0';
      details.style.clipPath='inset(0 0 100% 0)';
      details.style.transition='height 440ms cubic-bezier(.22,.72,.2,1), opacity 300ms ease, clip-path 440ms cubic-bezier(.22,.72,.2,1)';

      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (toggle.getAttribute('aria-expanded') !== 'true') return;
        details.style.height=details.scrollHeight+'px';
        details.style.opacity='1';
        details.style.clipPath='inset(0 0 0 0)';
      }));

      timer=setTimeout(() => {
        if (toggle.getAttribute('aria-expanded') === 'true') resetInline();
      }, 470);
    };

    const closePanel = () => {
      clearTimeout(timer);
      labelFor(false);
      if (reducedMotion) { details.hidden=true; resetInline(); return; }
      const h=details.getBoundingClientRect().height || details.scrollHeight;
      details.style.overflow='hidden';
      details.style.height=h+'px';
      details.style.opacity='1';
      details.style.clipPath='inset(0 0 0 0)';
      details.style.transition='height 390ms cubic-bezier(.22,.72,.2,1), opacity 260ms ease, clip-path 390ms cubic-bezier(.22,.72,.2,1)';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        details.style.height='0px';
        details.style.opacity='0';
        details.style.clipPath='inset(0 0 100% 0)';
      }));
      timer=setTimeout(() => {
        if (toggle.getAttribute('aria-expanded') === 'false') {
          details.hidden=true;
          resetInline();
        }
      }, 410);
    };

    labelFor(false);
    details.hidden=true;
    toggle.addEventListener('click', () => {
      toggle.getAttribute('aria-expanded') === 'true' ? closePanel() : openPanel();
    });
  });
})();

// V97.4 Homepage hero — keep the matching poster visible while the video seeks,
// explicitly resume playback, then reveal only after playback has started and a frame is decoded.
(() => {
  const heroVideo = document.querySelector('.hero video');
  if (!heroVideo) return;

  const chosen = window.__joshuaOakHeroStart || {time: 0, poster: 'assets/hero-posters/hero-000.jpg'};
  heroVideo.poster = chosen.poster;

  let revealed = false;
  const revealVideo = () => {
    if (revealed) return;
    revealed = true;
    heroVideo.classList.remove('hero-video-pending');
  };

  const revealAfterDecodedFrame = () => {
    if ('requestVideoFrameCallback' in heroVideo) {
      heroVideo.requestVideoFrameCallback(() => revealVideo());
    } else {
      requestAnimationFrame(() => requestAnimationFrame(revealVideo));
    }
  };

  const playThenReveal = () => {
    heroVideo.addEventListener('playing', revealAfterDecodedFrame, {once:true});
    try {
      const playPromise = heroVideo.play();
      if (playPromise?.catch) playPromise.catch(() => {});
    } catch (e) {}
  };

  const prepareChosenStart = () => {
    if (chosen.time <= 0.05) {
      playThenReveal();
      return;
    }

    heroVideo.addEventListener('seeked', playThenReveal, {once:true});
    try { heroVideo.currentTime = chosen.time; } catch (e) {}
  };

  if (heroVideo.readyState >= 1) prepareChosenStart();
  else heroVideo.addEventListener('loadedmetadata', prepareChosenStart, {once:true});
})();

// V97 — warm full-size lightbox assets shortly before a likely click/tap.
// This changes no lightbox behavior; it only gives the browser a head start on the image request.
(() => {
  const warmed = new Set();
  const warm = el => {
    const src = el?.dataset?.lightbox;
    if (!src || warmed.has(src)) return;
    warmed.add(src);
    const preload = new Image();
    preload.decoding = 'async';
    preload.src = src;
  };
  document.querySelectorAll('[data-lightbox]').forEach(el => {
    el.addEventListener('pointerenter', () => warm(el), {passive:true});
    el.addEventListener('pointerdown', () => warm(el), {passive:true});
  });
})();

// V86 — mobile hamburger navigation for every page.
(() => {
  document.querySelectorAll('.header').forEach(header => {
    const nav = header.querySelector(':scope > nav');
    if (!nav || header.querySelector('.mobile-nav-toggle')) return;

    const button = document.createElement('button');
    button.className = 'mobile-nav-toggle';
    button.type = 'button';
    button.setAttribute('aria-label', 'Open menu');
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = '<span></span>';
    header.insertBefore(button, nav);

    const workDrop = nav.querySelector('.navdrop');
    const workLink = workDrop?.querySelector(':scope > a');

    const closeMenu = () => {
      nav.classList.remove('is-open');
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'Open menu');
      document.body.classList.remove('mobile-menu-open');
      workDrop?.classList.remove('mobile-work-open');
    };

    const openMenu = () => {
      nav.classList.add('is-open');
      button.setAttribute('aria-expanded', 'true');
      button.setAttribute('aria-label', 'Close menu');
      document.body.classList.add('mobile-menu-open');
    };

    button.addEventListener('click', () => nav.classList.contains('is-open') ? closeMenu() : openMenu());


    document.addEventListener('pointerdown', event => {
      if (window.innerWidth > 760 || !nav.classList.contains('is-open')) return;
      if (nav.contains(event.target) || button.contains(event.target)) return;
      closeMenu();
    });

    workLink?.addEventListener('click', event => {
      if (window.innerWidth > 760) return;
      event.preventDefault();
      workDrop.classList.toggle('mobile-work-open');
    });

    nav.querySelectorAll('.dropdown a, :scope > a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 760) closeMenu();
      });
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) closeMenu();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 760) closeMenu();
    }, {passive:true});
  });
})();


// V87 — keep the floating Back to Top button above the footer instead of covering Back to Work.
(() => {
  const button=document.getElementById('backToTop');
  const footer=document.querySelector('footer');
  if(!button || !footer) return;
  const update=()=>{
    const r=footer.getBoundingClientRect();
    button.classList.toggle('is-near-footer', r.top < window.innerHeight - 12);
  };
  window.addEventListener('scroll',update,{passive:true});
  window.addEventListener('resize',update,{passive:true});
  update();
})();

// Global image-lightbox close behavior: any click closes, except direct video interaction.
(() => {
  document.addEventListener('click', event => {
    const lightbox = event.target.closest('.image-lightbox');
    if (!lightbox || lightbox.hidden) return;
    if (event.target.closest('video')) return;
    const closeButton = lightbox.querySelector('.lightbox-close');
    if (closeButton && event.target !== closeButton) closeButton.click();
  });
})();


// V88 — direct-manipulation swipe for arrow-driven galleries.
// The active image follows the finger, fades as it leaves, and the next image slides in underneath it.
(() => {
  const bindSwipe = (surface, itemSelector, activeSelector, prev, next) => {
    if (!surface || !prev || !next || surface.dataset.swipeBound) return;
    const items = [...surface.querySelectorAll(itemSelector)];
    if (items.length < 2) return;
    surface.dataset.swipeBound = 'true';
    surface.style.touchAction = 'pan-y pinch-zoom';

    let pointerId = null, startX = 0, startY = 0, active = null, target = null;
    let targetWasHidden = false, direction = 0, dragging = false, suppressClick = false;

    const clearInline = el => {
      if (!el) return;
      el.classList.remove('swipe-dragging','swipe-preview');
      el.style.removeProperty('translate');
      el.style.removeProperty('opacity');
      el.style.removeProperty('transition');
      el.style.removeProperty('z-index');
    };
    const findActive = () => surface.querySelector(activeSelector) || items.find(el => !el.hidden) || items[0];
    const chooseTarget = dir => {
      const current = findActive();
      const index = items.indexOf(current);
      const targetIndex = (index + dir + items.length) % items.length;
      return items[targetIndex];
    };
    const restoreTarget = () => {
      if (!target) return;
      clearInline(target);
      if (targetWasHidden && !target.matches(activeSelector)) target.hidden = true;
      target = null;
    };

    surface.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      pointerId = e.pointerId; startX = e.clientX; startY = e.clientY;
      active = findActive(); target = null; direction = 0; dragging = false;
    });

    surface.addEventListener('pointermove', e => {
      if (pointerId !== e.pointerId || !active) return;
      const dx = e.clientX - startX, dy = e.clientY - startY;
      if (!dragging) {
        if (Math.abs(dx) < 8) return;
        if (Math.abs(dy) > Math.abs(dx) * 1.05) { pointerId = null; active = null; return; }
        dragging = true; suppressClick = true;
        try { surface.setPointerCapture(pointerId); } catch(_) {}
      }
      e.preventDefault();
      const newDirection = dx < 0 ? 1 : -1;
      if (newDirection !== direction) {
        restoreTarget();
        direction = newDirection;
        target = chooseTarget(direction);
        targetWasHidden = !!target.hidden;
        if (targetWasHidden) target.hidden = false;
        target.classList.add('swipe-preview');
      }
      const width = Math.max(1, surface.getBoundingClientRect().width);
      const progress = Math.min(1, Math.abs(dx) / width);
      active.classList.add('swipe-dragging'); target.classList.add('swipe-dragging');
      active.style.translate = `${dx}px 0`;
      active.style.opacity = String(Math.max(.16, 1 - progress * .92));
      target.style.translate = `${dx + direction * width}px 0`;
      target.style.opacity = String(Math.min(1, .16 + progress * .9));
    }, {passive:false});

    const finish = e => {
      if (pointerId !== e.pointerId || !active) return;
      const dx = e.clientX - startX;
      const width = Math.max(1, surface.getBoundingClientRect().width);
      const commit = dragging && Math.abs(dx) > Math.min(90, width * .22);
      try { surface.releasePointerCapture(pointerId); } catch(_) {}
      pointerId = null;

      if (!dragging || !target) { active = null; restoreTarget(); return; }
      // Keep the synthetic post-drag click from opening the lightbox, then re-enable taps.
      setTimeout(() => { suppressClick = false; }, 80);
      active.classList.remove('swipe-dragging'); target.classList.remove('swipe-dragging');
      active.style.transition = 'translate 220ms cubic-bezier(.22,.72,.2,1), opacity 200ms ease';
      target.style.transition = 'translate 220ms cubic-bezier(.22,.72,.2,1), opacity 200ms ease';

      if (commit) {
        active.style.translate = `${-direction * width}px 0`;
        active.style.opacity = '0';
        target.style.translate = '0px 0';
        target.style.opacity = '1';
        setTimeout(() => {
          (direction > 0 ? next : prev).click();
          clearInline(active); clearInline(target);
          // The gallery's own render function now owns hidden/active state.
          active = null; target = null; dragging = false;
        }, 225);
      } else {
        active.style.translate = '0px 0'; active.style.opacity = '1';
        target.style.translate = `${direction * width}px 0`; target.style.opacity = '0';
        setTimeout(() => { clearInline(active); restoreTarget(); active = null; dragging = false; }, 225);
      }
    };
    surface.addEventListener('pointerup', finish);
    surface.addEventListener('pointercancel', finish);
    surface.addEventListener('click', e => {
      if (!suppressClick) return;
      suppressClick = false;
      e.preventDefault(); e.stopImmediatePropagation();
    }, true);
  };

  bindSwipe(document.querySelector('.moodboard-stage'), '.moodboard-slide', '.moodboard-slide.is-active', document.querySelector('.moodboard-prev'), document.querySelector('.moodboard-next'));
  bindSwipe(document.querySelector('.lighting-deck-stage'), '.lighting-card', '.lighting-card.is-active', document.querySelector('[data-deck-prev]'), document.querySelector('[data-deck-next]'));
  bindSwipe(document.querySelector('.ship-slide-stage'), '.ship-slide', '.ship-slide.is-active', document.querySelector('.ship-prev'), document.querySelector('.ship-next'));
})();

