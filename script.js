/**
 * CYBER FPS ARENA - CORE GAME SCRIPT
 * High-performance Canvas Target FPS & Web Audio Synth Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. サウンドエンジン (Web Audio API)
  // ==========================================
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.muted = localStorage.getItem('fps_sound_muted') === 'true';
    }

    init() {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    setMuted(muted) {
      this.muted = muted;
      localStorage.setItem('fps_sound_muted', muted ? 'true' : 'false');
    }

    // 銃撃音 (ノイズ + 低音オシレータの急降下)
    playGunshot() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // 1. ノイズ生成（破裂音）
      const bufferSize = this.ctx.sampleRate * 0.12;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1400, now);
      noiseFilter.Q.setValueAtTime(1.5, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.7, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      whiteNoise.start(now);

      // 2. 低音キック（衝撃音）
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.18);

      oscGain.gain.setValueAtTime(0.8, now);
      oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    }

    // 命中音 (金属的ヒット)
    playHit() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.08);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    }

    // クリティカル / ヘッドショット音 (高音キーン)
    playHeadshot() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1600, now);
      osc.frequency.setValueAtTime(2400, now + 0.04);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.22);

      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.23);
    }

    // 弾切れ空撃ち音 (カチッ)
    playDryFire() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(400, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    }

    // リロード音 (カチャッ ... ガシャン)
    playReload() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // 1段階目（抜き取り）
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(250, now);
      osc1.frequency.exponentialRampToValueAtTime(600, now + 0.08);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.11);

      // 2段階目（装填）
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(450, now + 0.35);
      osc2.frequency.setValueAtTime(900, now + 0.42);
      gain2.gain.setValueAtTime(0.5, now + 0.35);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.35);
      osc2.stop(now + 0.52);
    }

    // 開始合図音
    playStart() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      [0, 0.1, 0.2].forEach((delay, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const freq = idx === 2 ? 880 : 587;
        osc.frequency.setValueAtTime(freq, now + delay);
        gain.gain.setValueAtTime(0.3, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.09);
      });
    }

    // 終了ファンファーレ
    playGameOver() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [440, 554, 659, 880];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        const time = now + idx * 0.12;
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.28);
      });
    }
  }

  const soundEngine = new SoundEngine();

  // ==========================================
  // 2. ゲーム本体 & Canvas
  // ==========================================
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');

  // DOM要素
  const hudScore = document.getElementById('hud-score');
  const hudTimer = document.getElementById('hud-timer');
  const timerBarFill = document.getElementById('timer-bar-fill');
  const hudCombo = document.getElementById('hud-combo');
  const hudAcc = document.getElementById('hud-acc');
  const hudAmmo = document.getElementById('hud-ammo');
  const ammoPipsContainer = document.getElementById('ammo-pips');
  const ammoHudBox = document.getElementById('ammo-hud-box');
  const hudAlert = document.getElementById('hud-center-alert');

  const startOverlay = document.getElementById('start-overlay');
  const pauseOverlay = document.getElementById('pause-overlay');
  const resultOverlay = document.getElementById('result-overlay');

  const btnStart = document.getElementById('btn-start-game');
  const btnResume = document.getElementById('btn-resume-game');
  const btnRestart = document.getElementById('btn-restart-game');
  const btnRetry = document.getElementById('btn-retry-game');
  const btnShare = document.getElementById('btn-share-score');

  const soundToggleBtn = document.getElementById('sound-toggle');
  const fullscreenToggleBtn = document.getElementById('fullscreen-toggle');
  const screenExpandBtn = document.getElementById('screen-expand-btn');
  const themeToggleBtn = document.getElementById('theme-toggle');

  const quickReloadBtn = document.getElementById('quick-reload-btn');
  const quickPauseBtn = document.getElementById('quick-pause-btn');
  const fpsDisplay = document.getElementById('fps-display');

  // 戦績要素
  const bestScoreDisplay = document.getElementById('best-score-display');
  const bestAccDisplay = document.getElementById('best-acc-display');
  const bestComboDisplay = document.getElementById('best-combo-display');
  const totalGamesDisplay = document.getElementById('total-games-display');
  const btnClearRecords = document.getElementById('btn-clear-records');

  // ゲーム状態
  const STATE = {
    MENU: 0,
    PLAYING: 1,
    PAUSED: 2,
    GAMEOVER: 3
  };
  let gameState = STATE.MENU;

  const MAX_AMMO = 30;
  let ammo = MAX_AMMO;
  let isReloading = false;

  let score = 0;
  let combo = 0;
  let maxCombo = 0;
  let shotsFired = 0;
  let shotsHit = 0;
  let kills = 0;

  let difficulty = 'normal'; // 'normal' | 'hard'
  let totalTime = 60;
  let remainingTime = 60;
  let lastTime = 0;
  let timerInterval = null;

  // FPS計測
  let frameCount = 0;
  let lastFpsUpdate = 0;

  // 照準 (Crosshair)
  const crosshair = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20,
    hitMarkerTime: 0,
    isHoveringTarget: false
  };

  // 画面揺れ (Recoil Shake)
  let screenShake = 0;

  // マズルフラッシュ
  let muzzleFlash = 0;

  // ターゲット配列
  let targets = [];
  let nextTargetSpawn = 0;

  // パーティクル配列
  let particles = [];

  // フローティングテキスト配列
  let floatingTexts = [];

  // 弾道トレーサー
  let tracers = [];

  // 弾薬ピップスの初期描画
  function initAmmoPips() {
    ammoPipsContainer.innerHTML = '';
    for (let i = 0; i < MAX_AMMO; i++) {
      const pip = document.createElement('div');
      pip.className = 'ammo-pip';
      pip.id = `pip-${i}`;
      ammoPipsContainer.appendChild(pip);
    }
  }
  initAmmoPips();

  function updateAmmoUI() {
    hudAmmo.textContent = ammo;
    for (let i = 0; i < MAX_AMMO; i++) {
      const pip = document.getElementById(`pip-${i}`);
      if (pip) {
        if (i < ammo) {
          pip.classList.remove('empty');
        } else {
          pip.classList.add('empty');
        }
      }
    }
    if (ammo === 0) {
      hudAmmo.style.color = '#ff0055';
      showAlert('RELOAD REQUIRED [R]');
    } else {
      hudAmmo.style.color = '';
      if (!isReloading) hideAlert();
    }
  }

  function showAlert(msg) {
    hudAlert.textContent = msg;
    hudAlert.classList.add('visible');
  }

  function hideAlert() {
    hudAlert.classList.remove('visible');
  }

  // ==========================================
  // 3. ターゲット (Target) クラス
  // ==========================================
  class Target {
    constructor(diff) {
      this.type = this.pickType();
      this.radius = this.type.radius * (diff === 'hard' ? 0.8 : 1.0);
      
      const margin = 100;
      this.x = margin + Math.random() * (canvas.width - margin * 2);
      this.y = margin + Math.random() * (canvas.height - margin * 2 - 80);

      const speedMult = (diff === 'hard' ? 1.4 : 1.0) * this.type.speed;
      const angle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(angle) * speedMult;
      this.vy = Math.sin(angle) * speedMult;

      this.lifeTime = this.type.duration;
      this.maxLifeTime = this.type.duration;
      this.alpha = 0;
      this.scale = 0.2;
      this.destroyed = false;
      this.ringRotation = Math.random() * Math.PI;
    }

    pickType() {
      const rand = Math.random();
      if (rand < 0.60) {
        return {
          name: 'NORMAL',
          color: '#00f0ff',
          glow: 'rgba(0, 240, 255, 0.8)',
          radius: 38,
          points: 100,
          speed: 1.8,
          duration: 3.5
        };
      } else if (rand < 0.85) {
        return {
          name: 'FAST',
          color: '#ffd700',
          glow: 'rgba(255, 215, 0, 0.8)',
          radius: 26,
          points: 200,
          speed: 3.4,
          duration: 2.8
        };
      } else {
        return {
          name: 'BONUS',
          color: '#ff0055',
          glow: 'rgba(255, 0, 85, 0.8)',
          radius: 20,
          points: 350,
          speed: 4.8,
          duration: 2.2
        };
      }
    }

    update(dt) {
      this.x += this.vx;
      this.y += this.vy;

      // 画面端バウンド
      const margin = 60;
      if (this.x - this.radius < margin) {
        this.x = margin + this.radius;
        this.vx *= -1;
      } else if (this.x + this.radius > canvas.width - margin) {
        this.x = canvas.width - margin - this.radius;
        this.vx *= -1;
      }
      if (this.y - this.radius < margin) {
        this.y = margin + this.radius;
        this.vy *= -1;
      } else if (this.y + this.radius > canvas.height - margin - 50) {
        this.y = canvas.height - margin - 50 - this.radius;
        this.vy *= -1;
      }

      this.ringRotation += 0.03;
      this.lifeTime -= dt;

      // フェードイン & アニメーション
      if (this.scale < 1.0) {
        this.scale += dt * 4;
        if (this.scale > 1) this.scale = 1;
      }
      this.alpha = Math.min(1, (this.lifeTime / this.maxLifeTime) * 1.5);
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.scale(this.scale, this.scale);
      ctx.globalAlpha = Math.max(0, this.alpha);

      const r = this.radius;

      // 外周グロー
      ctx.shadowColor = this.type.glow;
      ctx.shadowBlur = 15;

      // 外枠リング
      ctx.strokeStyle = this.type.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();

      // 回転するターゲット爪装飾
      ctx.save();
      ctx.rotate(this.ringRotation);
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(r - 4, -4);
        ctx.lineTo(r + 6, 0);
        ctx.lineTo(r - 4, 4);
        ctx.stroke();
      }
      ctx.restore();

      // 内側リング
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // ブルズアイ / ヘッドショットコア（中心部）
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.fill();

      // 残り時間プログレスアーク
      const progress = this.lifeTime / this.maxLifeTime;
      ctx.beginPath();
      ctx.arc(0, 0, r + 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
      ctx.strokeStyle = this.type.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
    }
  }

  // ==========================================
  // 4. パーティクル & エフェクト
  // ==========================================
  class Particle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.size = 2 + Math.random() * 4;
      this.alpha = 1;
      this.decay = 0.015 + Math.random() * 0.03;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.94;
      this.vy *= 0.94;
      this.alpha -= this.decay;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 8;
      ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
      ctx.restore();
    }
  }

  class FloatingText {
    constructor(text, x, y, color, isBig = false) {
      this.text = text;
      this.x = x;
      this.y = y;
      this.color = color;
      this.alpha = 1;
      this.vy = -1.8;
      this.isBig = isBig;
    }

    update() {
      this.y += this.vy;
      this.alpha -= 0.02;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.font = this.isBig ? 'bold 24px Orbitron' : 'bold 16px Orbitron';
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 10;
      ctx.textAlign = 'center';
      ctx.fillText(this.text, this.x, this.y);
      ctx.restore();
    }
  }

  // 弾道トレーサー
  class Tracer {
    constructor(startX, startY, endX, endY) {
      this.startX = startX;
      this.startY = startY;
      this.endX = endX;
      this.endY = endY;
      this.alpha = 0.8;
    }

    update() {
      this.alpha -= 0.12;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.strokeStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(this.startX, this.startY);
      ctx.lineTo(this.endX, this.endY);
      ctx.stroke();
      ctx.restore();
    }
  }

  // ==========================================
  // 5. ゲーム制御ロジック
  // ==========================================
  function startGame() {
    difficulty = document.querySelector('input[name="difficulty"]:checked').value;
    totalTime = difficulty === 'hard' ? 45 : 60;
    remainingTime = totalTime;

    score = 0;
    combo = 0;
    maxCombo = 0;
    shotsFired = 0;
    shotsHit = 0;
    kills = 0;
    ammo = MAX_AMMO;
    isReloading = false;

    targets = [];
    particles = [];
    floatingTexts = [];
    tracers = [];
    nextTargetSpawn = 0;

    updateScoreUI();
    updateAmmoUI();
    hideAlert();

    startOverlay.classList.remove('active');
    pauseOverlay.classList.remove('active');
    resultOverlay.classList.remove('active');

    soundEngine.playStart();
    gameState = STATE.PLAYING;

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(gameTimerTick, 1000);
  }

  function gameTimerTick() {
    if (gameState !== STATE.PLAYING) return;

    remainingTime--;
    hudTimer.textContent = remainingTime;
    const progress = (remainingTime / totalTime) * 100;
    timerBarFill.style.width = `${progress}%`;

    if (remainingTime <= 10) {
      hudTimer.style.color = '#ff0055';
    } else {
      hudTimer.style.color = '';
    }

    if (remainingTime <= 0) {
      endGame();
    }
  }

  function endGame() {
    gameState = STATE.GAMEOVER;
    clearInterval(timerInterval);
    soundEngine.playGameOver();

    // 戦績計算
    const acc = shotsFired > 0 ? ((shotsHit / shotsFired) * 100).toFixed(1) : '0.0';
    
    // ランク判定
    let rank = 'C';
    if (score >= 3500 || (score >= 2500 && parseFloat(acc) >= 80)) {
      rank = 'S';
    } else if (score >= 2200) {
      rank = 'A';
    } else if (score >= 1200) {
      rank = 'B';
    }

    // UI更新
    document.getElementById('result-rank').textContent = rank;
    document.getElementById('res-score').textContent = score;
    document.getElementById('res-kills').textContent = kills;
    document.getElementById('res-acc').textContent = `${acc}%`;
    document.getElementById('res-combo').textContent = `x${maxCombo}`;

    // ハイスコア判定 & 保存
    const prevBestScore = parseInt(localStorage.getItem('fps_best_score') || '0', 10);
    const newRecordAlert = document.getElementById('new-record-alert');
    if (score > prevBestScore) {
      localStorage.setItem('fps_best_score', score);
      newRecordAlert.classList.remove('hidden');
    } else {
      newRecordAlert.classList.add('hidden');
    }

    const prevBestAcc = parseFloat(localStorage.getItem('fps_best_acc') || '0.0');
    if (parseFloat(acc) > prevBestAcc) {
      localStorage.setItem('fps_best_acc', acc);
    }

    const prevMaxCombo = parseInt(localStorage.getItem('fps_max_combo') || '0', 10);
    if (maxCombo > prevMaxCombo) {
      localStorage.setItem('fps_max_combo', maxCombo);
    }

    const totalGames = parseInt(localStorage.getItem('fps_total_games') || '0', 10) + 1;
    localStorage.setItem('fps_total_games', totalGames);

    loadRecords();
    resultOverlay.classList.add('active');
  }

  function pauseGame() {
    if (gameState === STATE.PLAYING) {
      gameState = STATE.PAUSED;
      pauseOverlay.classList.add('active');
    } else if (gameState === STATE.PAUSED) {
      resumeGame();
    }
  }

  function resumeGame() {
    if (gameState === STATE.PAUSED) {
      gameState = STATE.PLAYING;
      pauseOverlay.classList.remove('active');
    }
  }

  function reloadWeapon() {
    if (isReloading || ammo === MAX_AMMO || gameState !== STATE.PLAYING) return;

    isReloading = true;
    soundEngine.playReload();
    showAlert('RELOADING...');

    setTimeout(() => {
      ammo = MAX_AMMO;
      isReloading = false;
      updateAmmoUI();
      hideAlert();
    }, 900);
  }

  // 射撃トリガー
  function shoot(targetX, targetY) {
    if (gameState !== STATE.PLAYING) return;

    if (isReloading) return;

    if (ammo <= 0) {
      soundEngine.playDryFire();
      showAlert('RELOAD REQUIRED [R]');
      return;
    }

    // 弾薬消費
    ammo--;
    shotsFired++;
    updateAmmoUI();
    soundEngine.playGunshot();

    // リコイル & マズルフラッシュ
    screenShake = 6;
    muzzleFlash = 1.0;
    crosshair.hitMarkerTime = 0;

    // 弾道トレーサー追加（画面下端中央から発射）
    tracers.push(new Tracer(canvas.width / 2 + 100, canvas.height, targetX, targetY));

    // ヒット判定
    let hitSomething = false;
    for (let i = targets.length - 1; i >= 0; i--) {
      const t = targets[i];
      const dist = Math.hypot(targetX - t.x, targetY - t.y);

      if (dist <= t.radius) {
        // ヒット！
        hitSomething = true;
        shotsHit++;
        kills++;
        combo++;
        if (combo > maxCombo) maxCombo = combo;

        crosshair.hitMarkerTime = 0.25;

        // コア（ブルズアイ / ヘッドショット判定）
        const isHeadshot = dist <= t.radius * 0.35;
        let points = t.type.points;

        if (isHeadshot) {
          points *= 2;
          soundEngine.playHeadshot();
          floatingTexts.push(new FloatingText('CRITICAL! +' + points, t.x, t.y - 20, '#ff0055', true));
        } else {
          soundEngine.playHit();
          floatingTexts.push(new FloatingText('+' + points, t.x, t.y - 15, '#00f0ff'));
        }

        // コンボボーナス加算
        const comboBonus = (combo - 1) * 20;
        score += points + comboBonus;

        if (combo > 1 && combo % 5 === 0) {
          floatingTexts.push(new FloatingText(`COMBO x${combo}!`, t.x, t.y - 45, '#ffd700', true));
        }

        // パーティクル発生
        for (let p = 0; p < 18; p++) {
          particles.push(new Particle(t.x, t.y, isHeadshot ? '#ff0055' : t.type.color));
        }

        // ターゲット消去
        targets.splice(i, 1);
        break; // 1発で撃破できるのは1ターゲット
      }
    }

    if (!hitSomething) {
      // 外れたらコンボリセット
      if (combo > 0) {
        floatingTexts.push(new FloatingText('COMBO LOST', targetX, targetY - 20, '#888888'));
        combo = 0;
      }
    }

    updateScoreUI();
  }

  function updateScoreUI() {
    hudScore.textContent = score.toString().padStart(5, '0');
    hudCombo.textContent = `x${combo}`;
    if (combo >= 5) {
      hudCombo.style.color = '#ffd700';
    } else {
      hudCombo.style.color = '';
    }

    const acc = shotsFired > 0 ? ((shotsHit / shotsFired) * 100).toFixed(1) : '100.0';
    hudAcc.textContent = `${acc}%`;
  }

  // ==========================================
  // 6. メインレンダリングループ
  // ==========================================
  function render(time) {
    const dt = (time - lastTime) / 1000 || 0.016;
    lastTime = time;

    // FPS算出
    frameCount++;
    if (time - lastFpsUpdate >= 1000) {
      fpsDisplay.textContent = `FPS: ${frameCount}`;
      frameCount = 0;
      lastFpsUpdate = time;
    }

    // 画面クリア
    ctx.save();
    
    // リコイルシェイク
    if (screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * screenShake * 2;
      const shakeY = (Math.random() - 0.5) * screenShake * 2;
      ctx.translate(shakeX, shakeY);
      screenShake = Math.max(0, screenShake - dt * 25);
    }

    // 背景描画（近未来シューティングレンジ）
    drawBackground(ctx);

    // ターゲット更新 & 描画
    if (gameState === STATE.PLAYING) {
      nextTargetSpawn -= dt;
      const maxTargets = difficulty === 'hard' ? 5 : 4;
      const spawnInterval = difficulty === 'hard' ? 0.7 : 1.0;

      if (nextTargetSpawn <= 0 && targets.length < maxTargets) {
        targets.push(new Target(difficulty));
        nextTargetSpawn = spawnInterval;
      }
    }

    for (let i = targets.length - 1; i >= 0; i--) {
      const t = targets[i];
      if (gameState === STATE.PLAYING) {
        t.update(dt);
      }
      t.draw(ctx);

      // 寿命切れで消滅
      if (t.lifeTime <= 0) {
        // 見逃しペナルティでコンボリセット
        if (combo > 0) combo = 0;
        updateScoreUI();
        targets.splice(i, 1);
      }
    }

    // 弾道トレーサー
    for (let i = tracers.length - 1; i >= 0; i--) {
      const tr = tracers[i];
      tr.update();
      tr.draw(ctx);
      if (tr.alpha <= 0) tracers.splice(i, 1);
    }

    // パーティクル
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw(ctx);
      if (p.alpha <= 0) particles.splice(i, 1);
    }

    // フローティングテキスト
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.update();
      ft.draw(ctx);
      if (ft.alpha <= 0) floatingTexts.splice(i, 1);
    }

    // マズルフラッシュ描画
    if (muzzleFlash > 0) {
      ctx.save();
      ctx.globalAlpha = muzzleFlash;
      ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 発射炎
      const gunX = canvas.width / 2 + 100;
      const gunY = canvas.height - 20;
      const grad = ctx.createRadialGradient(gunX, gunY, 5, gunX, gunY, 140);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#00f0ff');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(gunX, gunY, 140, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      muzzleFlash = Math.max(0, muzzleFlash - dt * 8);
    }

    // 照準（クロスヘア）描画
    drawCrosshair(ctx, dt);

    ctx.restore();

    requestAnimationFrame(render);
  }

  // サイバーグリッド背景の描画
  function drawBackground(ctx) {
    // ディープブラックグラデーション
    const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, '#060914');
    bgGrad.addColorStop(0.65, '#0b1126');
    bgGrad.addColorStop(1, '#05070e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 地平線グリッド（パースペクティブ）
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
    ctx.lineWidth = 1;

    const horizonY = canvas.height * 0.65;
    const vanishX = canvas.width / 2;

    // 水平線
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(canvas.width, horizonY);
    ctx.stroke();

    // パース放射線
    for (let x = -canvas.width; x <= canvas.width * 2; x += 120) {
      ctx.beginPath();
      ctx.moveTo(vanishX, horizonY);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // 奥行き水平グリッド
    for (let y = horizonY; y <= canvas.height; y += (canvas.height - y) * 0.28 + 14) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // 遠景サイバーターゲット円（背景のハイテク飾り）
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, horizonY - 40, 180, 0, Math.PI * 2);
    ctx.arc(canvas.width / 2, horizonY - 40, 260, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  // 照準（クロスヘア）の描画
  function drawCrosshair(ctx, dt) {
    const x = crosshair.x;
    const y = crosshair.y;

    ctx.save();
    ctx.translate(x, y);

    // ヒットマーカー（ヒット時にX字を表示）
    if (crosshair.hitMarkerTime > 0) {
      crosshair.hitMarkerTime -= dt;
      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 10;
      const hs = 12;
      ctx.beginPath();
      ctx.moveTo(-hs, -hs); ctx.lineTo(-4, -4);
      ctx.moveTo(hs, -hs);  ctx.lineTo(4, -4);
      ctx.moveTo(-hs, hs);  ctx.lineTo(-4, 4);
      ctx.moveTo(hs, hs);   ctx.lineTo(4, 4);
      ctx.stroke();
    }

    // ターゲットホバー時の色変化
    let chColor = '#00f0ff';
    for (const t of targets) {
      if (Math.hypot(x - t.x, y - t.y) <= t.radius) {
        chColor = '#ff0055';
        break;
      }
    }

    ctx.strokeStyle = chColor;
    ctx.fillStyle = chColor;
    ctx.shadowColor = chColor;
    ctx.shadowBlur = 8;
    ctx.lineWidth = 1.8;

    // 中央ドット
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 十字レティクル（隙間あり）
    const gap = 8;
    const len = 18;

    ctx.beginPath();
    ctx.moveTo(0, -gap); ctx.lineTo(0, -(gap + len));
    ctx.moveTo(0, gap);  ctx.lineTo(0, gap + len);
    ctx.moveTo(-gap, 0); ctx.lineTo(-(gap + len), 0);
    ctx.moveTo(gap, 0);  ctx.lineTo(gap + len, 0);
    ctx.stroke();

    // 外枠サークル
    ctx.beginPath();
    ctx.arc(0, 0, gap + len + 3, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  // ==========================================
  // 7. マウス & タッチイベント
  // ==========================================
  function updateCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    crosshair.x = (clientX - rect.left) * scaleX;
    crosshair.y = (clientY - rect.top) * scaleY;
  }

  canvas.addEventListener('mousemove', (e) => {
    updateCoords(e);
  });

  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) { // 左クリック
      updateCoords(e);
      shoot(crosshair.x, crosshair.y);
    }
  });

  // タッチ操作（スマホ対応）
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    updateCoords(e);
    shoot(crosshair.x, crosshair.y);
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    updateCoords(e);
  }, { passive: false });

  // コンテキストメニュー無効化
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  // ==========================================
  // 8. キーボードショートカット & コントロール
  // ==========================================
  window.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
      reloadWeapon();
    } else if (e.key === 'p' || e.key === 'P') {
      pauseGame();
    } else if (e.key === 'Escape') {
      if (isFullscreenActive()) {
        exitFullscreen();
      } else {
        pauseGame();
      }
    } else if (e.key === 'f' || e.key === 'F') {
      toggleFullscreen();
    }
  });

  // UIボタンイベント
  btnStart.addEventListener('click', startGame);
  btnResume.addEventListener('click', resumeGame);
  btnRestart.addEventListener('click', startGame);
  btnRetry.addEventListener('click', startGame);

  quickReloadBtn.addEventListener('click', reloadWeapon);
  quickPauseBtn.addEventListener('click', pauseGame);
  ammoHudBox.addEventListener('click', reloadWeapon);

  // 難易度ラジオボタン切り替え演出
  document.querySelectorAll('.diff-btn').forEach(label => {
    label.addEventListener('click', () => {
      document.querySelectorAll('.diff-btn').forEach(l => l.classList.remove('active'));
      label.classList.add('active');
    });
  });

  // 結果シェア（クリップボードコピー）
  btnShare.addEventListener('click', () => {
    const text = `🎯 CYBER TARGET FPS 戦績\nランク: ${document.getElementById('result-rank').textContent} | スコア: ${score}点 | 命中精度: ${document.getElementById('res-acc').textContent} | 最大コンボ: x${maxCombo}\nhttps://fps262626.github.io/game-web-FPS/`;
    navigator.clipboard.writeText(text).then(() => {
      btnShare.textContent = 'コピー完了！';
      setTimeout(() => {
        btnShare.textContent = '結果をコピー';
      }, 2000);
    });
  });

  // サウンド切り替え
  function updateSoundIcon() {
    soundToggleBtn.textContent = soundEngine.muted ? '🔇' : '🔊';
  }
  soundToggleBtn.addEventListener('click', () => {
    soundEngine.setMuted(!soundEngine.muted);
    updateSoundIcon();
  });
  updateSoundIcon();

  // ==========================================
  // 全画面 & 大画面拡大モード (Fullscreen / Maximized)
  // ==========================================
  let isMaximized = false;

  function isFullscreenActive() {
    const card = document.getElementById('game-viewport-card');
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      isMaximized ||
      (card && card.classList.contains('is-maximized'))
    );
  }

  function updateExpandButtons(active) {
    if (screenExpandBtn) {
      const expandText = screenExpandBtn.querySelector('.expand-text');
      const expandIcon = screenExpandBtn.querySelector('.expand-icon');
      if (active) {
        if (expandText) expandText.textContent = '元に戻す';
        if (expandIcon) expandIcon.textContent = '🗗';
        screenExpandBtn.classList.add('active');
        screenExpandBtn.setAttribute('title', '元の画面サイズに戻す (ESC)');
      } else {
        if (expandText) expandText.textContent = '画面拡大';
        if (expandIcon) expandIcon.textContent = '⛶';
        screenExpandBtn.classList.remove('active');
        screenExpandBtn.setAttribute('title', '画面を拡大 / 全画面表示');
      }
    }

    if (fullscreenToggleBtn) {
      fullscreenToggleBtn.textContent = active ? '🗗' : '⛶';
      fullscreenToggleBtn.setAttribute('title', active ? '元のサイズに戻す' : '全画面表示 (F)');
    }
  }

  function enterFullscreen() {
    const card = document.getElementById('game-viewport-card');
    if (!card) return;

    // スマホ(iOS Safari等)やネイティブAPI拒否時のフォールバック
    const applyCssMaximize = () => {
      card.classList.add('is-maximized');
      document.body.classList.add('game-is-maximized');
      isMaximized = true;
      updateExpandButtons(true);
    };

    const req = card.requestFullscreen || card.webkitRequestFullscreen || card.mozRequestFullScreen || card.msRequestFullscreen;
    if (req) {
      try {
        const promise = req.call(card);
        if (promise && promise.then) {
          promise.then(() => {
            updateExpandButtons(true);
          }).catch(() => {
            // ネイティブ全画面失敗時にCSS拡大へ
            applyCssMaximize();
          });
        } else {
          updateExpandButtons(true);
        }
      } catch (err) {
        applyCssMaximize();
      }
    } else {
      applyCssMaximize();
    }
  }

  function exitFullscreen() {
    const card = document.getElementById('game-viewport-card');

    if (document.fullscreenElement || document.webkitFullscreenElement) {
      const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
      if (exit) {
        try {
          exit.call(document);
        } catch (e) {
          // ignore
        }
      }
    }

    if (card) {
      card.classList.remove('is-maximized');
    }
    document.body.classList.remove('game-is-maximized');
    isMaximized = false;
    updateExpandButtons(false);
  }

  function toggleFullscreen() {
    if (isFullscreenActive()) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }

  if (screenExpandBtn) {
    screenExpandBtn.addEventListener('click', toggleFullscreen);
  }
  if (fullscreenToggleBtn) {
    fullscreenToggleBtn.addEventListener('click', toggleFullscreen);
  }

  // ネイティブ全画面イベント監視
  ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(evtName => {
    document.addEventListener(evtName, () => {
      const isNativeFull = !!(document.fullscreenElement || document.webkitFullscreenElement);
      if (!isNativeFull && !isMaximized) {
        updateExpandButtons(false);
      } else if (isNativeFull) {
        updateExpandButtons(true);
      }
    });
  });

  // カラーテーマ切り替え (Cyber / Tactical)
  const savedTheme = localStorage.getItem('fps_theme') || 'cyber';
  document.documentElement.setAttribute('data-theme', savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const nextTheme = currentTheme === 'cyber' ? 'tactical' : 'cyber';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('fps_theme', nextTheme);
  });

  // ==========================================
  // 9. 戦績データ読み込み & リセット
  // ==========================================
  function loadRecords() {
    const bestScore = localStorage.getItem('fps_best_score') || '0';
    const bestAcc = localStorage.getItem('fps_best_acc') || '0.0';
    const maxCombo = localStorage.getItem('fps_max_combo') || '0';
    const totalGames = localStorage.getItem('fps_total_games') || '0';

    bestScoreDisplay.textContent = parseInt(bestScore, 10).toLocaleString();
    bestAccDisplay.textContent = `${bestAcc}%`;
    bestComboDisplay.textContent = `x${maxCombo}`;
    totalGamesDisplay.textContent = totalGames;
  }
  loadRecords();

  btnClearRecords.addEventListener('click', () => {
    if (confirm('保存されたハイスコアと戦績をリセットしますか？')) {
      localStorage.removeItem('fps_best_score');
      localStorage.removeItem('fps_best_acc');
      localStorage.removeItem('fps_max_combo');
      localStorage.removeItem('fps_total_games');
      loadRecords();
    }
  });

  // 初期フレーム開始
  requestAnimationFrame(render);
});
