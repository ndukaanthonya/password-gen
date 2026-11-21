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
    const visibilityIcon = document.getElementById('visibility-icon');
    const copyBtn = document.getElementById('copy-btn');
    const copyIcon = document.getElementById('copy-icon');
    const copyLabel = document.getElementById('copy-label');
    const strengthBar = document.getElementById('strength-bar');
    const strengthLabel = document.getElementById('strength-label');
    const entropyBadge = document.getElementById('entropy-badge');
    const lengthSlider = document.getElementById('length-slider');
    const lengthValue = document.getElementById('length-value');
    const lengthMinus = document.getElementById('length-minus');
    const lengthPlus = document.getElementById('length-plus');
    const generateBtn = document.getElementById('generate-btn');
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
        strengthLabel.textContent = 'Weak [Tier 1]';
      } else if (entropy < 80) {
        strengthBar.style.width = '66%';
        strengthBar.style.backgroundColor = '#eab308';
        strengthLabel.textContent = 'Medium [Tier 2]';
      } else {
        strengthBar.style.width = '100%';
        strengthBar.style.backgroundColor = '#22c55e';
        strengthLabel.textContent = 'Strong [Tier 3]';
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
        if (state[key]) {
          track.classList.remove('bg-zinc-200', 'justify-start');
          track.classList.add('bg-black', 'dark:bg-white', 'justify-end');
        } else {
          track.classList.remove('bg-black', 'dark:bg-white', 'justify-end');
          track.classList.add('bg-zinc-200', 'dark:bg-zinc-800', 'justify-start');
        }
        generatePassword();
      });
    });
  
    toggleVisibilityBtn.addEventListener('click', () => {
      state.visible = !state.visible;
      visibilityIcon.textContent = state.visible ? 'visibility' : 'visibility_off';
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
      copyIcon.textContent = 'check';
      copyLabel.classList.remove('hidden');
      clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
        copyIcon.textContent = 'content_copy';
        copyLabel.classList.add('hidden');
      }, 2000);
    });
  
    generateBtn.addEventListener('click', generatePassword);
  
    const themeToggleBtn = document.querySelector('button[aria-label="Toggle Light/Dark Mode"]');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        const icon = themeToggleBtn.querySelector('.material-symbols-outlined');
        if (icon) {
          icon.textContent = isDark ? 'light_mode' : 'dark_mode';
        }
      });
    }
  
    generatePassword();
  })();