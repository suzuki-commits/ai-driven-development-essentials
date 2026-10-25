(() => {
  'use strict';

  const toast = document.querySelector('.toast');
  let toastTimer;

  const announce = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2200);
  };

  const fallbackCopy = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    if (!copied) throw new Error('copy command failed');
  };

  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const target = document.getElementById(button.dataset.copy);
      if (!target) return;
      const text = target.textContent;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          fallbackCopy(text);
        }
        button.querySelector('span').textContent = 'コピー済み';
        announce('コピーしました');
        window.setTimeout(() => { button.querySelector('span').textContent = 'コピー'; }, 1800);
      } catch (error) {
        announce('コピーできません。範囲を選択してコピーしてください');
      }
    });
  });

  const fitTargets = document.querySelectorAll('h1, h2, .hero__lead > span, .hero__lead > strong, .template-layout h3');
  let fitFrame = 0;

  const fitSingleLine = () => {
    fitTargets.forEach((element) => {
      element.classList.add('fit-line');
      element.dataset.fitLine = '';
      element.style.removeProperty('font-size');
      const base = parseFloat(getComputedStyle(element).fontSize);
      const minimum = element.matches('h1') ? 32 : element.matches('h2') ? 22 : element.matches('.template-layout h3') ? 18 : 18;
      const available = element.clientWidth;
      const needed = element.scrollWidth;
      if (available > 0 && needed > available) {
        element.style.fontSize = `${Math.max(minimum, base * available / needed * 0.985)}px`;
      }
    });
  };

  const scheduleFit = () => {
    window.cancelAnimationFrame(fitFrame);
    fitFrame = window.requestAnimationFrame(fitSingleLine);
  };

  scheduleFit();
  if (document.fonts?.ready) document.fonts.ready.then(scheduleFit);
  if ('ResizeObserver' in window) {
    let observedWidth = 0;
    const resizeObserver = new ResizeObserver((entries) => {
      const nextWidth = Math.round(entries[0]?.contentRect.width ?? 0);
      if (nextWidth === observedWidth) return;
      observedWidth = nextWidth;
      scheduleFit();
    });
    resizeObserver.observe(document.documentElement);
  } else {
    window.addEventListener('resize', scheduleFit, { passive: true });
  }
})();
