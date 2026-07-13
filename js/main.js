// 页脚版权年份：2022-当前年
document.addEventListener('DOMContentLoaded', function() {
  var year = new Date().getFullYear();
  document.querySelectorAll('.copyright-year-end').forEach(function(el) {
    el.textContent = String(year);
  });
});

// 导航栏滚动效果（滚动时改变样式，可选）
window.addEventListener('scroll', function() {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) { // 滚动超过 50px 时
    navbar.style.backgroundColor = 'rgba(17, 17, 17, 0)'; // 背景色变透明
  } else {
    navbar.style.backgroundColor = 'rgba(17, 17, 17, 0)'; // 恢复原样
  }
});

// 平滑滚动（点击导航链接时，平滑跳转到对应区域）
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault(); // 阻止默认跳转
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      // 计算目标位置（避开导航栏高度）
      const navbarHeight = document.querySelector('.navbar').offsetHeight;
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
      // 平滑滚动
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});



// 页面区块：入场缓动 + 滚动进入视口时再显现（覆盖首页/文章列表/项目/内页等常见容器）
document.addEventListener('DOMContentLoaded', function() {
  const REVEAL_SELECTOR = [
    '.frame-2',
    '.frame-6',
    '.hero',
    '.hero-about',
    '.projects-list',
    '.index-article-list',
    '.section-title-container',
    '.project-container',
    '.project-container-3col',
    '.tab-container',
    '.blog-content',
    '.interest-cards-module',
    '.article1-cards-module',
    '.photo-gallery',
    '.work-img',
    '.figma-img',
    '.zuji-img',
    '.black-card',
    '.footer',
  ].join(', ');

  const nodeList = document.querySelectorAll(REVEAL_SELECTOR);
  if (nodeList.length === 0) return;

  const seen = new Set();
  const animateElements = [];
  nodeList.forEach((el) => {
    if (seen.has(el)) return;
    if (el.classList.contains('has-split-intro')) return;
    seen.add(el);
    animateElements.push(el);
  });

  const preferReduced =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (preferReduced) {
    animateElements.forEach((el) => {
      el.classList.add('animate-element', 'show');
    });
    return;
  }

  const reveal = (el) => {
    el.classList.add('show');
  };

  if (typeof IntersectionObserver !== 'undefined') {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { root: null, rootMargin: '0px 0px -6% 0px', threshold: 0.02 }
    );

    animateElements.forEach((el) => {
      el.classList.add('animate-element');
      io.observe(el);
    });

    // 少数环境下首屏元素可能未立刻触发 IO，补一次可见即显
    requestAnimationFrame(() => {
      animateElements.forEach((el) => {
        if (el.classList.contains('show')) return;
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) {
          reveal(el);
          io.unobserve(el);
        }
      });
    });
  } else {
    animateElements.forEach((el) => {
      el.classList.add('animate-element', 'show');
    });
  }
});




// 获取所有Tab选项和内容
const tabItems = document.querySelectorAll('.tab-item');
const contentItems = document.querySelectorAll('.content-item');
const ARTICLE_TAB_STORAGE_KEY = 'pigpeng_article_list_tab';

function applyArticleTab(tabId) {
  if (!tabId || !document.getElementById(tabId)) return;
  tabItems.forEach(tab => {
    tab.classList.toggle('active', tab.getAttribute('data-tab') === tabId);
  });
  contentItems.forEach(content => {
    content.classList.toggle('active', content.id === tabId);
  });
}

function restoreArticleTab() {
  if (!tabItems.length) return;
  const saved = sessionStorage.getItem(ARTICLE_TAB_STORAGE_KEY);
  if (!saved || !document.getElementById(saved)) return;
  applyArticleTab(saved);
}

// 给每个Tab绑定点击事件
tabItems.forEach(item => {
  item.addEventListener('click', () => {
    const tabId = item.getAttribute('data-tab');
    sessionStorage.setItem(ARTICLE_TAB_STORAGE_KEY, tabId);
    applyArticleTab(tabId);
  });
});

restoreArticleTab();





// 摄影页面：分批加载（Load More）— 固定列容器 + 预加载，避免 CSS columns 重排闪动
function initPhotographyProgressiveLoad() {
  const gallery = document.querySelector('.photo-gallery');
  const loadMoreBtn = document.getElementById('photoLoadMore');
  const loadingSkeleton = document.getElementById('photoLoadingSkeleton');
  if (!gallery || !loadMoreBtn || !loadingSkeleton) return;

  const pageSize = 12;
  const allCards = Array.from(gallery.querySelectorAll('.photo-card'));
  let renderedCount = 0;
  let isRendering = false;
  let hasMore = true;
  let columns = [];

  allCards.forEach(card => {
    const img = card.querySelector('.photo-img');
    if (img) {
      const src = img.getAttribute('src');
      if (src) {
        img.setAttribute('data-src', src);
        img.removeAttribute('src');
      }
      img.removeAttribute('loading');
      img.setAttribute('decoding', 'async');
    }
  });

  function getColumnCount() {
    if (window.matchMedia('(max-width: 768px)').matches) return 1;
    if (window.matchMedia('(max-width: 992px)').matches) return 2;
    return 3;
  }

  function ensureColumns() {
    const count = getColumnCount();
    if (columns.length === count) return;
    columns = [];
    gallery.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const col = document.createElement('div');
      col.className = 'photo-column';
      gallery.appendChild(col);
      columns.push(col);
    }
  }

  function shortestColumn() {
    return columns.reduce((shortest, col) =>
      col.offsetHeight < shortest.offsetHeight ? col : shortest
    );
  }

  function setLoading(loading) {
    loadMoreBtn.disabled = loading;
    loadMoreBtn.textContent = loading ? 'Loading...' : '查看更多';
    loadingSkeleton.classList.toggle('active', loading);
  }

  function hydrateCard(card) {
    const img = card.querySelector('.photo-img');
    if (!img) return;
    const realSrc = img.getAttribute('data-src');
    if (!realSrc || img.getAttribute('src')) return;
    img.loading = 'eager';
    img.setAttribute('src', realSrc);
  }

  function prefetchSrc(src) {
    return new Promise((resolve) => {
      const loader = new Image();
      const done = () => resolve();
      loader.onload = done;
      loader.onerror = done;
      loader.src = src;
      if (loader.complete) done();
    });
  }

  async function renderNextBatch(isInitial) {
    if (isRendering || !hasMore) return hasMore;
    isRendering = true;
    if (!isInitial) setLoading(true);
    if (isInitial) gallery.style.visibility = 'hidden';
    try {
      ensureColumns();
      const next = allCards.slice(renderedCount, renderedCount + pageSize);
      if (!isInitial && next.length) {
        await Promise.all(
          next.map((card) => {
            const src = card.querySelector('.photo-img')?.getAttribute('data-src');
            return src ? prefetchSrc(src) : Promise.resolve();
          })
        );
      }
      for (const card of next) {
        hydrateCard(card);
        shortestColumn().appendChild(card);
      }
      renderedCount += next.length;
      hasMore = renderedCount < allCards.length;
      return next.length > 0;
    } finally {
      if (isInitial) gallery.style.visibility = 'visible';
      if (!isInitial) setLoading(false);
      isRendering = false;
    }
  }

  gallery.style.visibility = 'hidden';
  gallery.innerHTML = '';
  ensureColumns();

  renderNextBatch(true).then(() => {
    if (!hasMore) {
      loadMoreBtn.disabled = true;
      loadMoreBtn.textContent = 'No more photos';
    }
  });

  loadMoreBtn.addEventListener('click', async () => {
    const more = await renderNextBatch(false);
    if (!more || !hasMore) {
      loadMoreBtn.disabled = true;
      loadMoreBtn.textContent = 'No more photos';
    }
  });
}

initPhotographyProgressiveLoad();

function initChromaGrid() {
  const grids = document.querySelectorAll('[data-chroma-grid]');
  if (!grids.length) return;

  const prefersReduced =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  grids.forEach((grid) => {
    const fade = grid.querySelector('.chroma-fade');
    const cards = grid.querySelectorAll('.chroma-card');
    const pos = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let animating = false;

    const setSpotlight = (x, y) => {
      grid.style.setProperty('--x', `${x}px`);
      grid.style.setProperty('--y', `${y}px`);
    };

    const initSpotlight = () => {
      const rect = grid.getBoundingClientRect();
      pos.x = target.x = rect.width / 2;
      pos.y = target.y = rect.height / 2;
      setSpotlight(pos.x, pos.y);
    };

    initSpotlight();

    const tick = () => {
      pos.x += (target.x - pos.x) * 0.12;
      pos.y += (target.y - pos.y) * 0.12;
      setSpotlight(pos.x, pos.y);
      if (Math.abs(pos.x - target.x) > 0.5 || Math.abs(pos.y - target.y) > 0.5) {
        requestAnimationFrame(tick);
      } else {
        animating = false;
      }
    };

    const moveTo = (x, y) => {
      target.x = x;
      target.y = y;
      if (!animating) {
        animating = true;
        requestAnimationFrame(tick);
      }
    };

    grid.addEventListener('pointermove', (e) => {
      const rect = grid.getBoundingClientRect();
      moveTo(e.clientX - rect.left, e.clientY - rect.top);
      if (fade) fade.style.opacity = '0';
    });

    grid.addEventListener('pointerleave', () => {
      if (fade) fade.style.opacity = '1';
    });

    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      });
    });

    window.addEventListener('resize', initSpotlight);
  });
}

document.addEventListener('DOMContentLoaded', initChromaGrid);

function splitTextToSpans(el, type) {
  const text = el.textContent;
  el.textContent = '';
  el.classList.add('split-parent');
  const targets = [];

  if (type === 'words') {
    text.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      const span = document.createElement('span');
      span.className = part.trim() ? 'split-word' : 'split-space';
      if (part.trim()) span.style.display = 'inline-block';
      span.textContent = part;
      el.appendChild(span);
      if (part.trim()) targets.push(span);
    });
    return targets;
  }

  Array.from(text).forEach((char) => {
    const span = document.createElement('span');
    span.className = 'split-char';
    span.style.display = 'inline-block';
    span.textContent = char === ' ' ? '\u00A0' : char;
    el.appendChild(span);
    targets.push(span);
  });
  return targets;
}

function loadGsap() {
  const src = 'https://cdn.jsdelivr.net/npm/gsap@3.12.7/dist/gsap.min.js';
  if (window.gsap) return Promise.resolve(window.gsap);

  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.gsap));
      if (window.gsap) resolve(window.gsap);
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(window.gsap);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function animateSplitSection(intro, gsap) {
  const textEls = intro.querySelectorAll('[data-split-text]');
  const fadeEl = intro.querySelector('[data-split-fade]');
  if (!textEls.length) {
    intro.classList.remove('split-pending');
    return;
  }

  intro.classList.remove('split-pending');
  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' }
  });

  textEls.forEach((el, index) => {
    const type = el.dataset.splitType || 'chars';
    const stagger = (parseFloat(el.dataset.splitDelay || '25') || 25) / 1000;
    const duration = parseFloat(el.dataset.splitDuration || '0.6') || 0.6;
    const targets = splitTextToSpans(el, type);
    gsap.set(targets, { opacity: 0, y: 40 });

    tl.to(
      targets,
      {
        opacity: 1,
        y: 0,
        duration,
        stagger
      },
      index > 0 ? '-=0.35' : 0
    );
  });

  if (fadeEl) {
    gsap.set(fadeEl.children, { opacity: 0, y: 40 });
    tl.to(
      fadeEl.children,
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.05
      },
      '-=0.3'
    );
  }
}

async function initSplitTextSections() {
  const sections = document.querySelectorAll('.has-split-intro');
  if (!sections.length) return;

  const preferReduced =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (preferReduced) {
    sections.forEach((section) => section.classList.remove('split-pending'));
    return;
  }

  let gsap;
  try {
    gsap = await loadGsap();
  } catch (_) {
    sections.forEach((section) => section.classList.remove('split-pending'));
    return;
  }

  const run = () => {
    sections.forEach((section) => animateSplitSection(section, gsap));
  };

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(run);
  } else {
    run();
  }
}

document.addEventListener('DOMContentLoaded', initSplitTextSections);

function ensureImgModal() {
  if (document.getElementById('imgModal')) return;

  var modal = document.createElement('div');
  modal.className = 'img-modal';
  modal.id = 'imgModal';
  modal.innerHTML =
    '<span class="img-modal-close" id="closeBtn" aria-label="关闭">&times;</span>' +
    '<div class="img-modal-container">' +
      '<div class="img-modal-left">' +
        '<img class="img-modal-content" id="modalImg" alt="" decoding="async">' +
      '</div>' +
      '<div class="img-modal-right">' +
        '<div class="photo-info-location" id="photoLocation"></div>' +
        '<h2 class="photo-info-title" id="photoTitle"></h2>' +
        '<div class="photo-info-camera" id="photoCamera"></div>' +
        '<p class="photo-info-desc" id="photoDesc"></p>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);
}

function shouldSkipZoomableImage(img) {
  var src = (img.getAttribute('src') || '').trim();
  if (!src) return true;
  if (img.classList.contains('logo-img')) return true;
  if (img.closest('.navbar') || img.closest('.logo') || img.closest('#imgModal')) return true;
  return false;
}

function markProjectImagesZoomable() {
  document.querySelectorAll('.blog-content img, .frame-1 img').forEach(function(img) {
    if (shouldSkipZoomableImage(img)) return;
    img.classList.add('is-zoomable');
  });
}

function initImageLightbox() {
  ensureImgModal();
  markProjectImagesZoomable();

  var modal = document.getElementById('imgModal');
  var modalImg = document.getElementById('modalImg');
  var closeBtn = document.getElementById('closeBtn');
  var photoLocation = document.getElementById('photoLocation');
  var photoTitle = document.getElementById('photoTitle');
  var photoCamera = document.getElementById('photoCamera');
  var photoDesc = document.getElementById('photoDesc');

  if (!modal || !modalImg || !closeBtn || modal.dataset.lightboxReady === 'true') return;
  modal.dataset.lightboxReady = 'true';

  function closeImgModal() {
    modal.style.display = 'none';
    modal.classList.remove('img-modal--image-only');
    document.body.style.overflow = '';
    var modalRight = modal.querySelector('.img-modal-right');
    if (modalRight) modalRight.style.display = '';
  }

  function openImageOnly(src, alt) {
    modal.classList.add('img-modal--image-only');
    var modalRight = modal.querySelector('.img-modal-right');
    if (modalRight) modalRight.style.display = 'none';
    modalImg.src = src;
    modalImg.alt = alt || '';
    if (photoLocation) photoLocation.textContent = '';
    if (photoTitle) photoTitle.textContent = '';
    if (photoCamera) photoCamera.textContent = '';
    if (photoDesc) photoDesc.textContent = '';
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  document.addEventListener('click', function(e) {
    var card = e.target.closest('.photo-card');
    if (card) {
      var imgSrc = card.getAttribute('data-img') || (card.querySelector('.photo-img') && card.querySelector('.photo-img').getAttribute('src')) || '';
      var location = card.getAttribute('data-location') || '';
      var title = card.getAttribute('data-title') || (card.querySelector('.photo-title') && card.querySelector('.photo-title').textContent) || '';
      var camera = card.getAttribute('data-camera') || '';
      var desc = card.getAttribute('data-desc') || '';

      modal.classList.remove('img-modal--image-only');
      var modalRight = modal.querySelector('.img-modal-right');
      if (modalRight) modalRight.style.display = '';

      modalImg.src = imgSrc;
      modalImg.alt = title;
      if (photoLocation) photoLocation.textContent = location;
      if (photoTitle) photoTitle.textContent = title;
      if (photoCamera) photoCamera.textContent = camera;
      if (photoDesc) photoDesc.textContent = desc;
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      return;
    }

    var zoomImg = e.target.closest('img.is-zoomable');
    if (!zoomImg) return;

    var src = zoomImg.currentSrc || zoomImg.getAttribute('src');
    if (!src) return;

    e.preventDefault();
    openImageOnly(src, zoomImg.getAttribute('alt') || '');
  });

  closeBtn.addEventListener('click', closeImgModal);
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeImgModal();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.style.display === 'flex') closeImgModal();
  });
}

document.addEventListener('DOMContentLoaded', initImageLightbox);
  
  


  
    // 点击文章的逻辑：优先读取 data-url 进行跳转，未配置则提示标题
function openArticle(item) {
  // 从 data-url 读取跳转地址
  const url = item.getAttribute('data-url');

  if (url) {
    const activeTab = document.querySelector('.tab-item.active')?.getAttribute('data-tab');
    if (activeTab) {
      sessionStorage.setItem(ARTICLE_TAB_STORAGE_KEY, activeTab);
    }
    window.location.href = url;
    return;
  }

  // 没配置 data-url 时，保留原来的提示，方便调试
  const title = item.querySelector('h3')?.textContent || '';
  alert(`你点击了文章：${title}`);
}






// 页面滚动位置记忆 - 适配浏览器后退/前进
document.addEventListener('DOMContentLoaded', function() {
  // 1. 页面加载时，恢复之前的滚动位置
  const scrollPos = sessionStorage.getItem('scrollPosition_' + window.location.pathname);
  if (scrollPos) {
    // 延迟执行，确保页面内容加载完成后再滚动
    setTimeout(() => {
      window.scrollTo(0, parseInt(scrollPos));
    }, 100);
    // 恢复后清除缓存（避免重复滚动）
    sessionStorage.removeItem('scrollPosition_' + window.location.pathname);
  }

  // 2. 页面离开前（跳转/关闭），记录当前滚动位置
  window.addEventListener('beforeunload', function() {
    sessionStorage.setItem(
      'scrollPosition_' + window.location.pathname,
      window.scrollY.toString()
    );
  });

  // 3. 兼容浏览器后退/前进（pageshow事件包含缓存页面）
  window.addEventListener('pageshow', function(e) {
    if (e.persisted) { // 页面从缓存加载（后退场景）
      const scrollPos = sessionStorage.getItem('scrollPosition_' + window.location.pathname);
      if (scrollPos) {
        setTimeout(() => {
          window.scrollTo(0, parseInt(scrollPos));
        }, 100);
      }
    }
  });
});

// 适配异步内容的滚动恢复（示例：等所有图片加载完成）
window.addEventListener('load', function() { // load事件：所有资源加载完成
  const scrollPos = sessionStorage.getItem('scrollPosition_' + window.location.pathname);
  if (scrollPos) {
    window.scrollTo(0, parseInt(scrollPos));
    sessionStorage.removeItem('scrollPosition_' + window.location.pathname);
  }
});