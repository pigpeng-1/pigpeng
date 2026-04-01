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



// 使用 DOMContentLoaded 而不是 load，更早执行，减少闪烁
document.addEventListener('DOMContentLoaded', function() {
  // 仅对关键区块做入场动画，避免递归扫描整个 DOM 带来的性能开销
  const animateElements = Array.from(document.querySelectorAll(
    '.frame-6, .section-title-container, .project-container, .project-container-3col, .index-article-list, .interest-cards-module, .article1-cards-module, .footer'
  ));
  if (animateElements.length === 0) return;

  // 首屏内容直接显示，避免“页面要等加载完才出现”的体感
  const firstScreenThreshold = window.innerHeight * 1.1;
  const aboveFold = [];
  const belowFold = [];

  animateElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < firstScreenThreshold) {
      aboveFold.push(el);
    } else {
      belowFold.push(el);
    }
  });

  aboveFold.forEach(el => {
    el.classList.add('show');
  });

  // 仅对首屏外元素添加淡入动画
  belowFold.forEach(el => el.classList.add('animate-element'));
  requestAnimationFrame(() => {
    belowFold.forEach((el, index) => {
      setTimeout(() => el.classList.add('show'), index * 50);
    });
  });
});




// 获取所有Tab选项和内容
const tabItems = document.querySelectorAll('.tab-item');
const contentItems = document.querySelectorAll('.content-item');

// 给每个Tab绑定点击事件
tabItems.forEach(item => {
  item.addEventListener('click', () => {
    // 1. 移除所有Tab的active类
    tabItems.forEach(tab => tab.classList.remove('active'));
    // 2. 给当前点击的Tab添加active类
    item.classList.add('active');

    // 3. 获取当前Tab对应的content ID
    const tabId = item.getAttribute('data-tab');
    // 4. 移除所有content的active类
    contentItems.forEach(content => content.classList.remove('active'));
    // 5. 给对应content添加active类
    document.getElementById(tabId).classList.add('active');
  });
});





// 摄影页面：分批加载（Load More）
function initPhotographyProgressiveLoad() {
  const gallery = document.querySelector('.photo-gallery');
  const loadMoreBtn = document.getElementById('photoLoadMore');
  const loadingSkeleton = document.getElementById('photoLoadingSkeleton');
  if (!gallery || !loadMoreBtn || !loadingSkeleton) return;
  gallery.style.visibility = 'hidden';

  const pageSize = 12;
  const allCards = Array.from(gallery.querySelectorAll('.photo-card'));
  let renderedCount = 0;
  let isRendering = false;
  let hasMore = true;

  allCards.forEach(card => {
    const img = card.querySelector('.photo-img');
    if (img) {
      const src = img.getAttribute('src');
      if (src) {
        img.setAttribute('data-src', src);
        img.removeAttribute('src');
      }
      img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
    }
  });

  function setLoading(loading) {
    loadMoreBtn.disabled = loading;
    loadMoreBtn.textContent = loading ? 'Loading...' : 'Load More';
    loadingSkeleton.classList.toggle('active', loading);
  }

  function hydrateCard(card) {
    const img = card.querySelector('.photo-img');
    if (img && !img.getAttribute('src')) {
      const realSrc = img.getAttribute('data-src');
      if (realSrc) {
        img.setAttribute('src', realSrc);
      }
    }
  }

  async function renderNextBatch() {
    if (isRendering || !hasMore) return hasMore;
    isRendering = true;
    setLoading(true);
    try {
      const next = allCards.slice(renderedCount, renderedCount + pageSize);
      const fragment = document.createDocumentFragment();
      for (const card of next) {
        hydrateCard(card);
        fragment.appendChild(card);
      }
      gallery.appendChild(fragment);
      renderedCount += next.length;
      hasMore = renderedCount < allCards.length;
      return next.length > 0;
    } finally {
      setLoading(false);
      isRendering = false;
    }
  }

  gallery.innerHTML = '';
  renderNextBatch().then(() => {
    if (!hasMore) {
      loadMoreBtn.disabled = true;
      loadMoreBtn.textContent = 'No more photos';
    }
  });

  loadMoreBtn.addEventListener('click', async () => {
    const more = await renderNextBatch();
    if (!more || !hasMore) {
      loadMoreBtn.disabled = true;
      loadMoreBtn.textContent = 'No more photos';
    }
  });

  gallery.style.visibility = 'visible';
}

initPhotographyProgressiveLoad();

// 图片点击效果（事件委托，支持动态渲染的卡片）
const modal = document.getElementById('imgModal');
const modalImg = document.getElementById('modalImg');
const closeBtn = document.getElementById('closeBtn');
const photoLocation = document.getElementById('photoLocation');
const photoTitle = document.getElementById('photoTitle');
const photoCamera = document.getElementById('photoCamera');
const photoDesc = document.getElementById('photoDesc');

if (modal && modalImg && closeBtn) {
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.photo-card');
    if (!card) return;

    const imgSrc = card.getAttribute('data-img') || card.querySelector('.photo-img')?.getAttribute('src') || '';
    const location = card.getAttribute('data-location') || '';
    const title = card.getAttribute('data-title') || card.querySelector('.photo-title')?.textContent || '';
    const camera = card.getAttribute('data-camera') || '';
    const desc = card.getAttribute('data-desc') || '';

    modalImg.src = imgSrc;
    modalImg.alt = title;
    photoLocation.textContent = location;
    photoTitle.textContent = title;
    photoCamera.textContent = camera;
    photoDesc.textContent = desc;
    modal.style.display = 'flex';
  });

  closeBtn.addEventListener('click', () => modal.style.display = 'none');
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });
  document.addEventListener('keydown', (e) => e.key === 'Escape' && (modal.style.display = 'none'));
}
  
  


  
    // 点击文章的逻辑：优先读取 data-url 进行跳转，未配置则提示标题
function openArticle(item) {
  // 从 data-url 读取跳转地址
  const url = item.getAttribute('data-url');

  if (url) {
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