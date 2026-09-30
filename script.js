document.addEventListener('DOMContentLoaded', () => {
  // --- テーマ切り替え（ダークモード / ライトモード） ---
  const themeToggleBtn = document.getElementById('theme-toggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('theme');

  // 初期テーマの設定
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', initialTheme);
  updateThemeIcon(initialTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });

  function updateThemeIcon(theme) {
    themeToggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  // --- クリックカウンター ---
  const counterBtn = document.getElementById('counter-btn');
  const countDisplay = document.getElementById('click-count');
  let count = 0;

  counterBtn.addEventListener('click', () => {
    count++;
    countDisplay.textContent = count;
    
    // ちょっとしたアニメーション効果
    counterBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      counterBtn.style.transform = '';
    }, 100);
  });
});
