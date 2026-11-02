'use strict';
/* ============================================================
 * audio.js —— Web Audio 芯片音频
 * 音效 + 原创芯片音乐循环（不含任何现成游戏乐曲）
 * ============================================================ */

const ChipAudio = {
  ctx: null, master: null,
  muted: localStorage.getItem('pq_muted') === '1',
  unlocked: false,
  seq: null,          // 当前乐曲
  step: 0, nextT: 0, timer: null, paused: false,

  unlock() {
    if (!this.unlocked) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.muted ? 0 : 0.5;
        this.master.connect(this.ctx.destination);
      } catch (e) { return; }
      this.unlocked = true;
      // 若在解锁前就请求过播放（如 #play 调试直入关卡），补启动
      if (this.seq && this.seq.name) { const n = this.seq.name; this.seq = null; this.playMusic(n); }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('pq_muted', this.muted ? '1' : '0');
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.5;
  },

  midi(n) { // 'C5' -> Hz
    const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    let name = n[0], acc = 0, i = 1;
    if (n[1] === '#') { acc = 1; i = 2; }
    const oct = parseInt(n.slice(i), 10);
    const m = 12 * (oct + 1) + SEMI[name] + acc;
    return 440 * Math.pow(2, (m - 69) / 12);
  },

  tone(freq, dur, type, vol, when, slideTo) {
    if (!this.unlocked || this.muted || !freq) return;
    const t0 = when || this.ctx.currentTime;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g); g.connect(this.master);
    o.start(t0); o.stop(t0 + dur + 0.02);
  },

  noise(dur, vol, when) {
    if (!this.unlocked || this.muted) return;
    const t0 = when || this.ctx.currentTime;
    const len = Math.max(1, (dur * this.ctx.sampleRate) | 0);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    src.connect(g); g.connect(this.master);
    src.start(t0);
  },

  arp(notes, step, dur, type, vol) {
    if (!this.unlocked || this.muted) return;
    const t0 = this.ctx.currentTime;
    notes.forEach((n, i) => this.tone(this.midi(n), dur, type, vol, t0 + i * step));
  },

  /* ---------- 音效（全部原创合成） ---------- */
  sfx: {
    jump(big) { ChipAudio.tone(big ? 160 : 220, 0.16, 'square', 0.10, 0, big ? 520 : 700); },
    coin() { ChipAudio.arp(['B5'], 0, 0.07, 'square', 0.09); ChipAudio.tone(ChipAudio.midi('E6'), 0.28, 'square', 0.09, ChipAudio.unlocked ? ChipAudio.ctx.currentTime + 0.07 : 0); },
    stomp() { ChipAudio.tone(320, 0.1, 'square', 0.12, 0, 90); ChipAudio.noise(0.08, 0.08); },
    kick() { ChipAudio.tone(480, 0.09, 'square', 0.11, 0, 120); },
    bump() { ChipAudio.tone(110, 0.08, 'triangle', 0.14, 0, 70); },
    brk() { ChipAudio.noise(0.22, 0.14); ChipAudio.tone(180, 0.15, 'square', 0.08, 0, 60); },
    sprout() { ChipAudio.arp(['C5', 'E5', 'G5', 'C6'], 0.045, 0.08, 'triangle', 0.10); },
    power() { ChipAudio.arp(['C5', 'E5', 'G5', 'C6', 'E6', 'G6', 'C7'], 0.055, 0.09, 'square', 0.08); },
    oneUp() { ChipAudio.arp(['E5', 'G5', 'E6', 'C6', 'D6', 'G6'], 0.09, 0.12, 'square', 0.08); },
    shrink() { ChipAudio.tone(600, 0.35, 'square', 0.09, 0, 150); },
    death() { ChipAudio.arp(['C5', 'G4', 'E4', 'C4', 'G3'], 0.16, 0.2, 'triangle', 0.13); },
    flag() { ChipAudio.arp(['C4', 'E4', 'G4', 'C5', 'E5', 'G5', 'C6'], 0.08, 0.14, 'square', 0.08); },
    clear() { ChipAudio.arp(['G4', 'C5', 'E5', 'G5', 'E5', 'G5', 'C6'], 0.11, 0.18, 'square', 0.08); },
    over() { ChipAudio.arp(['C5', 'A4', 'F4', 'C4'], 0.22, 0.3, 'triangle', 0.12); },
    pause() { ChipAudio.arp(['E6', 'C6', 'E6', 'C6'], 0.07, 0.06, 'square', 0.07); },
    hurry() { ChipAudio.arp(['C6', 'C6', 'C6'], 0.12, 0.1, 'square', 0.08); },
    win() { ChipAudio.arp(['C5', 'E5', 'G5', 'C6', 'G5', 'C6', 'E6', 'G6'], 0.1, 0.2, 'square', 0.08); }
  },

  /* ---------- 原创背景乐曲（32 步八分音符循环） ---------- */
  tracks: {
    over: {
      tempo: 0.135,
      lead: ['E5','G5','A5','G5','E5','C5','D5','E5','G5',0,'E5',0,'C5',0,0,0,
             'D5','F5','G5','F5','D5','B4','C5','D5','E5','C5',0,'G4','C5',0,0,0],
      bass: ['C3',0,'G3',0,'A2',0,'E3',0,'F2',0,'C3',0,'G2',0,'B2',0,
             'C3',0,'G3',0,'A2',0,'E3',0,'F2',0,'G2',0,'C3',0,0,0],
      hat:  [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]
    },
    cave: {
      tempo: 0.16,
      lead: ['A4',0,'C5',0,'E5',0,'C5',0,'B4',0,0,'A4','G4',0,0,0,
             'A4',0,'C5',0,'E5',0,'G5',0,'F5','E5','D5','C5','B4',0,0,0],
      bass: ['A2',0,0,0,'E2',0,0,0,'F2',0,0,0,'E2',0,0,0,
             'A2',0,0,0,'E2',0,0,0,'F2',0,'G2',0,'E2',0,0,0],
      hat:  [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]
    },
    night: {
      tempo: 0.19,
      lead: ['D5',0,'F5',0,'A5',0,'G5','F5','E5',0,'G5',0,'C5',0,0,0,
             'D5',0,'F5',0,'B5',0,'A5','G5','A5',0,'F5','D5','D5',0,0,0],
      bass: ['D3',0,0,'A2',0,0,'D3',0,'C3',0,0,'G2',0,0,'C3',0,
             'B2',0,0,'F2',0,0,'B2',0,'A2',0,0,'E2',0,0,'A2',0],
      hat:  [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]
    },
    castle: {
      tempo: 0.12,
      lead: ['C4','C#4','D4',0,'D#4','E4',0,0,'F4','E4','D#4','D4','C#4',0,0,0,
             'C4','C#4','D4',0,'D#4','E4',0,0,'G4','F4','E4','D#4','D4',0,0,0],
      bass: ['C2',0,'C2',0,'C2',0,'C2',0,'D#2',0,'D#2',0,'D#2',0,'D#2',0,
             'C2',0,'C2',0,'C2',0,'C2',0,'G2',0,'G2',0,'B1',0,0,0],
      hat:  [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]
    }
  },

  playMusic(name) {
    if (!this.unlocked) { this.seq = this.tracks[name] ? { name } : null; return; }
    this.seq = this.tracks[name];
    this.step = 0;
    this.nextT = this.ctx.currentTime + 0.06;
    this.paused = false;
    if (!this.timer) this.timer = setInterval(() => this._pump(), 30);
  },

  stopMusic() { this.seq = null; },

  setPaused(p) {
    this.paused = p;
    if (p === false && this.ctx && this.seq) this.nextT = this.ctx.currentTime + 0.06;
  },

  _pump() {
    if (!this.ctx || !this.seq) return;
    if (this.paused) { this.nextT = this.ctx.currentTime + 0.06; return; }
    const tr = this.seq, tempo = Game.hurry ? tr.tempo * 0.78 : tr.tempo;
    while (this.nextT < this.ctx.currentTime + 0.14) {
      const i = this.step % tr.lead.length;
      const L = tr.lead[i], B = tr.bass[i];
      if (L) this.tone(this.midi(L), tempo * 0.92, 'square', 0.038, this.nextT);
      if (B) this.tone(this.midi(B), tempo * 0.95, 'triangle', 0.065, this.nextT);
      if (tr.hat[i]) this.noise(0.02, 0.014, this.nextT);
      this.nextT += tempo;
      this.step++;
    }
  }
};
