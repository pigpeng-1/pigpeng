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


// 第一步：立即注入基础隐藏样式（在DOM渲染前执行，避免元素闪现）
(function injectBaseStyle() {
  const style = document.createElement('style');
  style.id = 'animate-base-style';
  style.textContent = `
    /* 提前隐藏需要动画的元素，避免初始闪现 */
    .animate-element {
      opacity: 0 !important;
      transform: translateY(30px) !important;
      transition: none !important; /* 初始状态关闭过渡，避免闪变 */
      will-change: opacity, transform;
    }
    /* 排除不需要动画的元素（提前生效） */
    script, style, link, meta, title, .navbar {
      opacity: 1 !important;
      transform: none !important;
      transition: none !important;
    }
  `;
  // 插入到head最前面，确保优先级最高
  document.head.insertBefore(style, document.head.firstChild);
})();

// 第二步：DOM解析完成后立即执行动画逻辑（无需等资源加载）
document.addEventListener('DOMContentLoaded', function() {
  // 动态注入动画过渡样式（此时DOM已解析，过渡生效）
  const transitionStyle = document.createElement('style');
  transitionStyle.textContent = `
    /* 动画过渡效果（DOM加载后才生效） */
    .animate-element {
      transition: opacity 0.8s ease-out, transform 0.8s ease-out !important;
    }
    /* 显示状态 */
    .animate-element.show {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
    /* 新增：强制导航栏无动画（兜底保障） */
    .navbar {
      transition: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
  `;
  document.head.appendChild(transitionStyle);

<<<<<<< HEAD
  // 精准选择需要动画的元素（排除.navbar和基础标签，避免递归性能损耗）
  function getAnimateElements() {
    // 选择body下所有非排除类/标签的元素
    const allElements = document.body.querySelectorAll('*:not(script):not(style):not(link):not(meta):not(title):not(.navbar)');
    // 过滤掉空文本节点/注释节点，只保留元素节点
    return Array.from(allElements).filter(el => el.nodeType === 1);
=======
  // 递归获取body下所有需要动画的元素（适配嵌套结构）
  function getAnimateElements(el) {
    let elements = [];
    Array.from(el.children).forEach(child => {
      const tag = child.tagName.toLowerCase();
      // 关键改动1：排除导航栏元素（通过类名.navbar判断）
      if (child.classList.contains('navbar')) {
        return; // 跳过导航栏，不加入动画元素列表
      }
      // 排除不需要动画的标签
      if (!['script', 'style', 'link', 'meta', 'title'].includes(tag)) {
        elements.push(child);
        // 递归获取子元素（解决嵌套问题）
        elements = elements.concat(getAnimateElements(child));
      }
    });
    return elements;
>>>>>>> ed24185b7a804e2b91f798cf0befb5f1e9b4ada9
  }

  const animateElements = getAnimateElements();

  // 逐步添加动画类并触发显示（无闪现）
  animateElements.forEach((el, index) => {
    // 先添加基础隐藏类（确保初始状态隐藏）
    el.classList.add('animate-element');
    // 延迟触发显示（间隔可根据需求调整）
    setTimeout(() => {
      el.classList.add('show');
<<<<<<< HEAD
    }, index * 50); // 缩短间隔，动画更丝滑（50ms比100ms更连贯）
=======
    }, index * 100); // 缩短间隔，动画更流畅
>>>>>>> ed24185b7a804e2b91f798cf0befb5f1e9b4ada9
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

// 图片点击效果
// 点击放大功能（保留）
    const modal = document.getElementById('imgModal');
    const modalImg = document.getElementById('modalImg');
    const closeBtn = document.getElementById('closeBtn');
    const photoCards = document.querySelectorAll('.photo-card');

    photoCards.forEach(card => {
      card.addEventListener('click', () => {
        const imgSrc = card.getAttribute('data-img');
        modal.style.display = 'flex';
        modalImg.src = imgSrc;
        modalImg.alt = card.querySelector('.photo-title').textContent;
      });
    });

    // 关闭逻辑（点击×/遮罩/ESC）
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', (e) => e.target === modal && (modal.style.display = 'none'));
    document.addEventListener('keydown', (e) => e.key === 'Escape' && (modal.style.display = 'none'));
