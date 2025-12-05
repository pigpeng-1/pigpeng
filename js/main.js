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


window.addEventListener('load', function() {
  // 动态注入动画样式（只给需要动画的元素加类，避免全局!important污染）
  const style = document.createElement('style');
  style.textContent = `
    /* 动画基础类 */
    .animate-element {
      transition: opacity 0.8s ease-out, transform 0.8s ease-out;
      will-change: opacity, transform;
      opacity: 0;
      transform: translateY(30px);
    }
    /* 显示状态 */
    .animate-element.show {
      opacity: 1;
      transform: translateY(0);
    }
    /* 排除不需要动画的标签 */
    script, style, link, meta, title {
      transition: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
    /* 新增：强制导航栏无动画（兜底保障） */
    .navbar {
      transition: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
  `;
  document.head.appendChild(style);

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
  }

  // 获取所有需要动画的元素
  const animateElements = getAnimateElements(document.body);

  // 逐步显示元素（避免一次性渲染）
  animateElements.forEach((el, index) => {
    el.classList.add('animate-element');
    setTimeout(() => {
      el.classList.add('show');
    }, index * 100); // 缩短间隔，动画更流畅
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
