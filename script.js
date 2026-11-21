(function () {
  const CHARSETS = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*'
  };

  const state = {
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    visible: true,
    password: ''
  };

  const passwordDisplay = document.getElementById('password-display');
  const toggleVisibilityBtn = document.getElementById('toggle-visibility-btn');
  const copyBtn = document.getElementById('copy-btn');
  const strengthBar = document.getElementById('strength-bar');
  const strengthLabel = document.getElementById('strength-label');
  const entropyBadge = document.getElementById('entropy-badge');
  const lengthSlider = document.getElementById('length-slider');
  const lengthValue = document.getElementById('length-value');
  const lengthMinus = document.getElementById('length-minus');
  const lengthPlus = document.getElementById('length-plus');
  const generateBtn = document.getElementById('generate-btn');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const optionToggles = document.querySelectorAll('.option-toggle');

  function getSecureRandomInt(max) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
  }

  function generatePassword() {
    let pool = '';
    const activeSets = [];
    Object.keys(CHARSETS).forEach((key) => {
      if (state[key]) {
        pool += CHARSETS[key];
        activeSets.push(CHARSETS[key]);
      }
    });

    if (!pool) return;

    const chars = [];
    activeSets.forEach((set) => {
      if (chars.length < state.length) {
        chars.push(set[getSecureRandomInt(set.length)]);
      }
    });

    while (chars.length < state.length) {
      chars.push(pool[getSecureRandomInt(pool.length)]);
    }

    for (let i = chars.length - 1; i > 0; i--) {
      const j = getSecureRandomInt(i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    state.password = chars.join('');
    renderPassword();
    updateStrength(pool.length);
  }

  function renderPassword() {
    passwordDisplay.dataset.password = state.password;
    passwordDisplay.textContent = state.visible
      ? state.password
      : '•'.repeat(state.password.length);
  }

  function updateStrength(poolSize) {
    const entropy = Math.round(state.length * Math.log2(poolSize || 1));
    entropyBadge.textContent = `${entropy}-bit`;

    if (entropy < 50) {
      strengthBar.style.width = '33%';
      strengthBar.style.backgroundColor = '#ef4444';
      strengthLabel.textContent = 'Weak';
    } else if (entropy < 80) {
      strengthBar.style.width = '66%';
      strengthBar.style.backgroundColor = '#eab308';
      strengthLabel.textContent = 'Medium';
    } else {
      strengthBar.style.width = '100%';
      strengthBar.style.backgroundColor = '#22c55e';
      strengthLabel.textContent = 'Strong';
    }
  }

  function updateLength(newLength) {
    const clamped = Math.max(8, Math.min(64, Number(newLength)));
    state.length = clamped;
    lengthSlider.value = clamped;
    lengthValue.textContent = clamped;
    generatePassword();
  }

  lengthSlider.addEventListener('input', (e) => updateLength(e.target.value));
  lengthMinus.addEventListener('click', () => updateLength(state.length - 1));
  lengthPlus.addEventListener('click', () => updateLength(state.length + 1));

  optionToggles.forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.option;
      const activeCount = Object.keys(CHARSETS).filter((k) => state[k]).length;
      if (state[key] && activeCount <= 1) return;

      state[key] = !state[key];
      btn.setAttribute('aria-checked', String(state[key]));

      const track = btn.querySelector('.toggle-track');
      const thumb = btn.querySelector('.toggle-thumb');

      if (state[key]) {
        track.classList.remove('bg-zinc-200', 'dark:bg-zinc-800', 'justify-start');
        track.classList.add('bg-black', 'dark:bg-white', 'justify-end');
        thumb.classList.remove('bg-black', 'dark:bg-white');
        thumb.classList.add('bg-white', 'dark:bg-black');
      } else {
        track.classList.remove('bg-black', 'dark:bg-white', 'justify-end');
        track.classList.add('bg-zinc-200', 'dark:bg-zinc-800', 'justify-start');
        thumb.classList.remove('bg-white', 'dark:bg-black');
        thumb.classList.add('bg-black', 'dark:bg-white');
      }

      generatePassword();
    });
  });

  toggleVisibilityBtn.addEventListener('click', () => {
    state.visible = !state.visible;
    toggleVisibilityBtn.textContent = state.visible ? 'Hide' : 'Show';
    renderPassword();
  });

  let copyTimeout;
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(state.password);
    } catch (_) {
      const ta = document.createElement('textarea');
      ta.value = state.password;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    copyBtn.textContent = 'Copied';
    clearTimeout(copyTimeout);
    copyTimeout = setTimeout(() => {
      copyBtn.textContent = 'Copy';
    }, 2000);
  });

  generateBtn.addEventListener('click', generatePassword);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      themeToggleBtn.textContent = isDark ? 'Light' : 'Dark';
    });
  }

  generatePassword();
})();