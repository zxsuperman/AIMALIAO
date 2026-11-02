'use strict';
/* ============================================================
 * game.js —— 游戏主逻辑
 * 状态机: title → pre → playing → (flag → clear) → … → win
 *         playing → dying → (pre | gameover)
 * ============================================================ */

const W = 320, H = 240, TILE = 16;
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const Sprites = buildSprites();

/* ---------- 常量 ---------- */
const GRAV_HOLD = 0.36, GRAV = 0.62, MAXFALL = 7;
const WALK_MAX = 1.5, RUN_MAX = 2.5, WALK_ACC = 0.09, RUN_ACC = 0.12, SKID = 0.28;
const CHAIN = [100, 200, 400, 800, 1000, 2000, 4000, 8000];
const SOLID = '#BX?MU[]{}';

/* ---------- 输入 ---------- */
const keys = { left: false, right: false, jump: false, run: false };
let jumpEdge = false, enterEdge = false, pauseEdge = false;
let navEdge = { up: false, down: false, left: false, right: false };

const KEYMAP = {
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'jump', KeyW: 'jump', Space: 'jump', KeyZ: 'jump', KeyK: 'jump',
  ShiftLeft: 'run', ShiftRight: 'run', KeyX: 'run', KeyJ: 'run'
};
const PREVENT = new Set([...Object.keys(KEYMAP), 'Enter', 'KeyP', 'Escape', 'ArrowDown']);

window.addEventListener('keydown', e => {
  if (PREVENT.has(e.code)) e.preventDefault();
  ChipAudio.unlock();
  if (KEYMAP[e.code]) {
    const v = KEYMAP[e.code];
    if (!keys[v]) { if (v === 'jump') jumpEdge = true; }
    keys[v] = true;
  }
  if (e.repeat) return;
  if (e.code === 'Enter') enterEdge = true;
  if (e.code === 'KeyP' || e.code === 'Escape') pauseEdge = true;
  if (e.code === 'KeyM') {
    ChipAudio.toggleMute();
    if (!ChipAudio.muted) ChipAudio.sfx.coin();
  }
  if (e.code === 'ArrowUp' || e.code === 'KeyW') navEdge.up = true;
  if (e.code === 'ArrowDown' || e.code === 'KeyS') navEdge.down = true;
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') navEdge.left = true;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') navEdge.right = true;
});
window.addEventListener('keyup', e => {
  if (KEYMAP[e.code]) keys[KEYMAP[e.code]] = false;
});

/* 触屏 */
function bindHold(id, down, up) {
  const el = document.getElementById(id);
  if (!el) return;
  const on = e => { e.preventDefault(); ChipAudio.unlock(); el.classList.add('on'); down(); };
  const off = e => { e.preventDefault(); el.classList.remove('on'); up(); };
  el.addEventListener('pointerdown', on);
  el.addEventListener('pointerup', off);
  el.addEventListener('pointercancel', off);
  el.addEventListener('pointerleave', off);
  el.addEventListener('contextmenu', e => e.preventDefault());
}
bindHold('t-left', () => { keys.left = true; navEdge.left = true; }, () => keys.left = false);
bindHold('t-right', () => { keys.right = true; navEdge.right = true; }, () => keys.right = false);
bindHold('t-jump', () => { keys.jump = true; jumpEdge = true; navEdge.up = true; }, () => keys.jump = false);
bindHold('t-run', () => { keys.run = true; navEdge.down = true; }, () => keys.run = false);
bindHold('t-pause', () => { pauseEdge = true; }, () => {});
canvas.addEventListener('pointerdown', () => {
  ChipAudio.unlock();
  if (Game.paused) pauseEdge = true;
  else if (Game.state !== 'playing') enterEdge = true;
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && Game.state === 'playing' && !Game.paused) pauseEdge = true;
});

/* ---------- 工具 ---------- */
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
function tileAt(tx, ty) {
  const L = Game.level;
  if (!L) return ' ';
  if (tx < 0 || tx >= L.width) return '#';
  if (ty < 0 || ty >= 15) return ' ';
  return L.grid[ty][tx];
}
const isSolid = ch => SOLID.includes(ch);
function overlap(a, b, s) {
  s = s || 0;
  return a.x + s < b.x + b.w && a.x + a.w - s > b.x && a.y + s < b.y + b.h && a.y + a.h - s > b.y;
}

/* ---------- 全局游戏状态 ---------- */
const Game = {
  state: 'title', frame: 0,
  score: 0, coins: 0, lives: 3, worldIdx: 0,
  hiscore: parseInt(localStorage.getItem('pq_hi') || '0', 10) || 0,
  level: null, player: null, entities: [],
  camX: 0, timeLeft: 300, timeAcc: 0, hurry: false,
  paused: false, freeze: 0, chain: 0,
  bumpAnims: new Map(), popups: [], debris: [], coinPops: [], fw: [],
  titleSel: 0, titleLevel: 0,
  preT: 0, deathT: 0, flagT: 0, clearT: 0, winT: 0, overT: 0,
  flagY: 52, poleX: 0, flagX: -1
};

function saveHi() {
  if (Game.score > Game.hiscore) {
    Game.hiscore = Game.score;
    localStorage.setItem('pq_hi', String(Game.hiscore));
  }
}

/* ---------- 关卡加载 ---------- */
function newPlayer(x, y) {
  return {
    x, y, w: 12, h: 14, vx: 0, vy: 0,
    big: false, facing: 1, onGround: false,
    invuln: 0, growT: 0, shrinkT: 0, walkAnim: 0, skid: false
  };
}
function setBig(p, big) {
  if (big === p.big) return;
  if (big) { p.y -= 12; p.h = 26; } else { p.y += 12; p.h = 14; }
  p.big = big;
}
function loadLevel(idx) {
  const lv = buildLevel(idx);
  Game.level = lv;
  Game.entities = lv.spawns.map(makeEnemy);
  Game.player = newPlayer(lv.spawnX * 16 + 2, 13 * 16 - 14);
  Game.camX = 0; Game.timeLeft = lv.time; Game.timeAcc = 0;
  Game.hurry = false; Game.chain = 0; Game.freeze = 0; Game.paused = false;
  Game.bumpAnims = new Map(); Game.popups = []; Game.debris = []; Game.coinPops = [];
  Game.flagX = -1;
  for (let x = 0; x < lv.width; x++) if (lv.grid[3][x] === 'F') { Game.flagX = x; break; }
  Game.flagY = 3 * 16 + 6;
}

/* ---------- 实体 ---------- */
function makeEnemy(s) {
  if (s.type === 'turtle')
    return { kind: 'turtle', x: s.x * 16 + 2, y: (s.y + 1) * 16 - 14, w: 12, h: 14, vx: -0.4, vy: 0, active: false, state: 'walk', t: 0, wake: 0, bounce: true };
  return { kind: 'walker', x: s.x * 16 + 2, y: (s.y + 1) * 16 - 12, w: 12, h: 12, vx: -0.45, vy: 0, active: false, state: 'walk', t: 0, bounce: true };
}
function spawnMush(tx, ty) {
  Game.entities.push({
    kind: 'mush', x: tx * 16 + 2, y: ty * 16 + 2, w: 12, h: 12,
    vx: 0, vy: 0, state: 'rise', riseT: 0, y0: ty * 16 + 2, y1: ty * 16 - 12,
    active: true, bounce: true
  });
}
function flipKill(e, pts) {
  if (e.state === 'flip' || e.state === 'squash') return;
  e.state = 'flip'; e.vy = -4; e.vx = (Math.random() < 0.5 ? -1 : 1) * 1.2;
  addScore(pts, e.x + e.w / 2, e.y);
  ChipAudio.sfx.kick();
}
function toShell(e) {
  e.state = 'shell'; e.wake = 380;
  e.y += e.h - 8; e.h = 8; e.vx = 0;
}
function unShell(e) {
  e.state = 'walk'; e.y -= 14 - 8; e.h = 14; e.vx = -0.4; e.wake = 0;
}

/* ---------- 得分 / 金币 ---------- */
function addScore(n, x, y) {
  Game.score += n;
  if (x !== undefined) Game.popups.push({ x, y, t: 0, text: String(n) });
}
function addCoin() {
  Game.coins++; Game.score += 100;
  ChipAudio.sfx.coin();
  if (Game.coins >= 100) {
    Game.coins -= 100; Game.lives++;
    ChipAudio.sfx.oneUp();
    Game.popups.push({ x: Game.player.x + 4, y: Game.player.y - 12, t: 0, text: '1UP' });
  }
}
function chainScore(x, y) {
  const i = Math.min(Game.chain, CHAIN.length - 1);
  const pts = Game.chain >= CHAIN.length + 2 ? 0 : CHAIN[i];
  Game.chain++;
  if (pts === 0) { Game.lives++; ChipAudio.sfx.oneUp(); Game.popups.push({ x, y, t: 0, text: '1UP' }); }
  else addScore(pts, x, y);
}

/* ---------- 碰撞 ---------- */
function moveX(e) {
  e.x += e.vx;
  const top = Math.floor(e.y / 16), bot = Math.floor((e.y + e.h - 0.01) / 16);
  if (e.vx > 0) {
    const tx = Math.floor((e.x + e.w - 0.01) / 16);
    for (let ty = top; ty <= bot; ty++)
      if (isSolid(tileAt(tx, ty))) { e.x = tx * 16 - e.w; e.vx = e.bounce ? -e.vx : 0; e.hitWall = true; break; }
  } else if (e.vx < 0) {
    const tx = Math.floor(e.x / 16);
    for (let ty = top; ty <= bot; ty++)
      if (isSolid(tileAt(tx, ty))) { e.x = (tx + 1) * 16; e.vx = e.bounce ? -e.vx : 0; e.hitWall = true; break; }
  }
}
function moveY(e, isPlayer) {
  e.y += e.vy;
  const L = Math.floor(e.x / 16), R = Math.floor((e.x + e.w - 0.01) / 16);
  e.onGround = false;
  if (e.vy > 0) {
    const ty = Math.floor((e.y + e.h - 0.01) / 16);
    for (let tx = L; tx <= R; tx++)
      if (isSolid(tileAt(tx, ty))) { e.y = ty * 16 - e.h; e.vy = 0; e.onGround = true; break; }
  } else if (e.vy < 0) {
    const ty = Math.floor(e.y / 16);
    let hit = -1;
    for (let tx = L; tx <= R; tx++) {
      if (isSolid(tileAt(tx, ty))) {
        if (hit < 0) hit = tx;
        else {
          const c = e.x + e.w / 2;
          if (Math.abs(tx * 16 + 8 - c) < Math.abs(hit * 16 + 8 - c)) hit = tx;
        }
      }
    }
    if (hit >= 0) { e.y = (ty + 1) * 16; e.vy = 0; if (isPlayer) bumpBlock(hit, ty); }
  }
}

/* ---------- 顶砖 ---------- */
function bumpBlock(tx, ty) {
  const g = Game.level.grid, ch = g[ty][tx], key = tx + ',' + ty;
  if (ch === '?' || ch === 'M') {
    g[ty][tx] = 'U';
    Game.bumpAnims.set(key, 0);
    if (ch === '?') {
      Game.coinPops.push({ x: tx * 16 + 2, y: ty * 16 - 12, y0: ty * 16 - 12, vy: -4.2, t: 0 });
      addCoin();
    } else {
      spawnMush(tx, ty);
      ChipAudio.sfx.sprout();
    }
    if (ty > 0 && g[ty - 1][tx] === 'C') { g[ty - 1][tx] = ' '; addCoin(); }
  } else if (ch === 'B') {
    if (Game.player.big) {
      g[ty][tx] = ' ';
      ChipAudio.sfx.brk();
      addScore(50, tx * 16 + 8, ty * 16);
      spawnDebris(tx, ty);
      Game.bumpAnims.delete(key);
    } else {
      Game.bumpAnims.set(key, 0);
      ChipAudio.sfx.bump();
    }
  } else {
    ChipAudio.sfx.bump();
    return;
  }
  // 顶飞站在砖上的敌人
  for (const e of Game.entities) {
    if (e.kind === 'mush' || e.state === 'flip' || e.state === 'squash') continue;
    if (Math.abs((e.y + e.h) - ty * 16) < 4 && e.x + e.w > tx * 16 && e.x < tx * 16 + 16)
      flipKill(e, 100);
  }
}
function spawnDebris(tx, ty) {
  for (const [dx, dy, vx, vy] of [[2, 2, -1.4, -4], [9, 2, 1.4, -4], [2, 9, -1.0, -2.5], [9, 9, 1.0, -2.5]])
    Game.debris.push({ x: tx * 16 + dx, y: ty * 16 + dy, vx, vy, t: 0 });
}

/* ---------- 玩家 ---------- */
function hurtPlayer() {
  const p = Game.player;
  if (p.invuln > 0 || Game.freeze > 0) return;
  if (p.big) {
    setBig(p, false);
    p.shrinkT = 45; Game.freeze = 45; p.invuln = 140;
    ChipAudio.sfx.shrink();
  } else startDeath(false);
}
function growPlayer() {
  const p = Game.player;
  if (!p.big) { setBig(p, true); p.growT = 45; Game.freeze = 45; }
  ChipAudio.sfx.power();
}
function startDeath(pit) {
  Game.state = 'dying';
  Game.deathT = pit ? 60 : 0;
  Game.player.vx = 0; Game.player.vy = 0;
  ChipAudio.stopMusic();
  ChipAudio.sfx.death();
}
function afterDeath() {
  Game.lives--;
  saveHi();
  if (Game.lives < 0) {
    Game.state = 'gameover'; Game.overT = 0;
    ChipAudio.sfx.over();
  } else {
    loadLevel(Game.worldIdx);
    Game.state = 'pre'; Game.preT = 0;
  }
}

function updatePlayer() {
  const p = Game.player;
  const acc = keys.run ? RUN_ACC : WALK_ACC;
  const maxs = keys.run ? RUN_MAX : WALK_MAX;
  if (keys.left && !keys.right) {
    p.skid = p.vx > 0.3;
    p.vx -= p.skid ? SKID : acc;
    p.facing = -1;
  } else if (keys.right && !keys.left) {
    p.skid = p.vx < -0.3;
    p.vx += p.skid ? SKID : acc;
    p.facing = 1;
  } else {
    p.skid = false;
    if (p.onGround) {
      if (Math.abs(p.vx) < 0.12) p.vx = 0;
      else p.vx -= Math.sign(p.vx) * 0.1;
    }
  }
  if (Math.abs(p.vx) > maxs) p.vx -= Math.sign(p.vx) * 0.06;

  if (jumpEdge && p.onGround) {
    p.vy = -7.2 - Math.min(Math.abs(p.vx), 2.5) * 0.22;
    p.onGround = false;
    ChipAudio.sfx.jump(p.big);
  }
  p.vy += (keys.jump && p.vy < 0) ? GRAV_HOLD : GRAV;
  if (p.vy > MAXFALL) p.vy = MAXFALL;

  moveX(p);
  moveY(p, true);
  if (p.invuln > 0) p.invuln--;
  if (p.onGround) Game.chain = 0;
  p.walkAnim += Math.abs(p.vx);

  // 掉坑
  if (p.y > 15 * 16 + 30) { startDeath(true); return; }

  // 与地块交互（金币 / 旗杆）
  const tx0 = Math.floor(p.x / 16), tx1 = Math.floor((p.x + p.w - 0.01) / 16);
  const ty0 = Math.floor(p.y / 16), ty1 = Math.floor((p.y + p.h - 0.01) / 16);
  for (let ty = ty0; ty <= ty1; ty++)
    for (let tx = tx0; tx <= tx1; tx++) {
      const ch = tileAt(tx, ty);
      if (ch === 'C') { Game.level.grid[ty][tx] = ' '; addCoin(); }
      else if (ch === 'F' || ch === '|') { beginFlag(tx); return; }
    }
}

/* ---------- 旗杆过关 ---------- */
function beginFlag(tx) {
  const p = Game.player;
  Game.state = 'flag';
  Game.flagT = 0;
  Game.poleX = tx;
  p.vx = 0; p.vy = 0;
  p.x = tx * 16 - 5;
  p.skid = false;
  const rowsAbove = Math.max(0, 12 - Math.floor((p.y + p.h) / 16));
  addScore(100 + rowsAbove * 100, tx * 16 + 8, p.y - 8);
  ChipAudio.stopMusic();
  ChipAudio.sfx.flag();
}
function updateFlag() {
  const p = Game.player;
  Game.flagT++;
  if (Game.flagY < 10 * 16) Game.flagY += 2.4;
  const targetY = 12 * 16 - p.h;
  const landed = p.y >= targetY - 0.5;
  const clothDown = Game.flagY >= 10 * 16 - 0.5;
  // 滑到杆底且旗降下后才走向城堡（180 帧兜底）
  if (!(landed && clothDown) && Game.flagT < 180) {
    if (!landed) p.y = Math.min(targetY, p.y + 2.4);
  } else {
    // 走向城堡
    p.vy += 0.5;
    p.y += p.vy;
    const gy = 13 * 16 - p.h;
    if (p.y >= gy) { p.y = gy; p.vy = 0; }
    p.x += 1.4;
    p.walkAnim += 1.4;
    if (p.x > (Game.level.castles[0] || Game.level.width - 4) * 16 + 24) {
      Game.state = 'clear'; Game.clearT = 0;
      addScore(Game.timeLeft * 10);
      ChipAudio.sfx.clear();
    }
  }
  Game.camX = clamp(p.x + p.w / 2 - 140, 0, Game.level.width * 16 - W);
}

/* ---------- 实体更新 ---------- */
function updateEntities() {
  const p = Game.player;
  for (let i = Game.entities.length - 1; i >= 0; i--) {
    const e = Game.entities[i];

    if (e.kind === 'mush') { updateMush(e, i); continue; }

    if (e.state === 'squash') { if (--e.t <= 0) Game.entities.splice(i, 1); continue; }
    if (e.state === 'flip') {
      e.vy += 0.4; e.x += e.vx; e.y += e.vy;
      if (e.y > 270) Game.entities.splice(i, 1);
      continue;
    }
    if (!e.active) {
      if (e.x < Game.camX + W + 32) e.active = true;
      else continue;
    }

    if (e.state === 'walk' || e.state === 'shellMove') {
      e.vy += GRAV; if (e.vy > MAXFALL) e.vy = MAXFALL;
      moveX(e); moveY(e);
    } else if (e.state === 'shell') {
      e.vy += GRAV; if (e.vy > MAXFALL) e.vy = MAXFALL;
      moveY(e);
      if (--e.wake <= 0) {
        if (!overlap(p, e, -2)) unShell(e); else e.wake = 60;
      }
    }
    if (e.y > 270) { Game.entities.splice(i, 1); continue; }

    // 移动龟壳击杀其他敌人
    if (e.state === 'shellMove') {
      for (const o of Game.entities) {
        if (o === e || o.kind === 'mush') continue;
        if (o.state === 'walk' || o.state === 'shell' || o.state === 'shellMove') {
          if (overlap(e, o, 1)) { flipKill(o, 200); ChipAudio.sfx.stomp(); }
        }
      }
    }
  }

  // 敌人互相转向
  const live = Game.entities.filter(e => (e.kind === 'walker' || e.kind === 'turtle') && e.state === 'walk' && e.active);
  for (let a = 0; a < live.length; a++)
    for (let b = a + 1; b < live.length; b++) {
      const A = live[a], B = live[b];
      if (!overlap(A, B, 0)) continue;
      const toB = B.x >= A.x ? 1 : -1; // B 在右：A 向左弹、B 向右弹
      A.vx = -toB * Math.abs(A.vx || 0.4);
      B.vx = toB * Math.abs(B.vx || 0.4);
    }

  // 玩家 vs 实体（倒序遍历，允许安全删除）
  for (let i = Game.entities.length - 1; i >= 0; i--) {
    const e = Game.entities[i];
    if (e.state === 'flip' || e.state === 'squash') continue;
    if (e.kind === 'mush' && e.state === 'rise') continue;
    if (!overlap(p, e, 1)) continue;

    if (e.kind === 'mush') {
      Game.entities.splice(i, 1);
      addScore(1000, e.x + 6, e.y - 6);
      growPlayer();
      continue;
    }
    const stomp = p.vy > 0.5 && (p.y + p.h - e.y) < 10;
    if (stomp) {
      if (e.kind === 'walker') {
        e.state = 'squash'; e.t = 26;
        ChipAudio.sfx.stomp();
      } else { // turtle
        if (e.state === 'walk') { toShell(e); ChipAudio.sfx.stomp(); }
        else if (e.state === 'shellMove') { e.state = 'shell'; e.vx = 0; e.wake = 380; ChipAudio.sfx.stomp(); }
        else { /* shell 静止被踩: 无事 */ }
      }
      p.y = e.y - p.h;
      p.vy = keys.jump ? -7.2 : -4.5;
      chainScore(e.x + e.w / 2, e.y - 10);
    } else if (e.state === 'shell') {
      e.state = 'shellMove';
      e.vx = (p.x + p.w / 2 < e.x + e.w / 2) ? 2.2 : -2.2;
      ChipAudio.sfx.kick();
      p.x = e.vx > 0 ? e.x - p.w - 1 : e.x + e.w + 1;
    } else if (e.state === 'shellMove' || e.state === 'walk') {
      hurtPlayer();
    }
  }
}
function updateMush(e, i) {
  if (e.state === 'rise') {
    e.riseT++;
    e.y = e.y0 + (e.y1 - e.y0) * Math.min(1, e.riseT / 30);
    if (e.riseT >= 30) { e.state = 'walk'; e.vx = 0.6; }
    return;
  }
  e.vy += GRAV; if (e.vy > MAXFALL) e.vy = MAXFALL;
  moveX(e); moveY(e);
  if (e.y > 270) Game.entities.splice(i, 1);
}

/* ---------- 特效 ---------- */
function updateFx() {
  for (let i = Game.coinPops.length - 1; i >= 0; i--) {
    const c = Game.coinPops[i];
    c.t++; c.vy += 0.3; c.y += c.vy;
    if (c.vy > 0 && c.y >= c.y0) Game.coinPops.splice(i, 1);
  }
  for (let i = Game.debris.length - 1; i >= 0; i--) {
    const d = Game.debris[i];
    d.t++; d.vy += 0.3; d.x += d.vx; d.y += d.vy;
    if (d.y > 270) Game.debris.splice(i, 1);
  }
  for (let i = Game.popups.length - 1; i >= 0; i--) {
    const s = Game.popups[i];
    s.t++; s.y -= 0.5;
    if (s.t > 45) Game.popups.splice(i, 1);
  }
  for (const [k, v] of Game.bumpAnims) {
    if (v + 1 > 12) Game.bumpAnims.delete(k);
    else Game.bumpAnims.set(k, v + 1);
  }
}

/* ---------- 主循环状态机 ---------- */
function newGame(levelIdx) {
  Game.score = 0; Game.coins = 0; Game.lives = 3;
  Game.worldIdx = levelIdx;
  loadLevel(levelIdx);
  Game.state = 'pre'; Game.preT = 0;
}
function toTitle() {
  Game.state = 'title';
  ChipAudio.stopMusic();
}

function step() {
  Game.frame++;
  switch (Game.state) {
    case 'title': stepTitle(); break;
    case 'pre':
      Game.preT++;
      if (Game.preT >= 100 || enterEdge) {
        Game.state = 'playing';
        ChipAudio.playMusic(Game.level.theme);
      }
      break;
    case 'playing': stepPlaying(); break;
    case 'dying': stepDying(); break;
    case 'flag': updateFlag(); updateFx(); break;
    case 'clear':
      Game.clearT++;
      if (Game.clearT >= 170) {
        Game.worldIdx++;
        saveHi();
        if (Game.worldIdx >= LEVELS.length) {
          Game.state = 'win'; Game.winT = 0; Game.fw = [];
          ChipAudio.sfx.win();
        } else {
          loadLevel(Game.worldIdx);
          Game.state = 'pre'; Game.preT = 0;
        }
      }
      break;
    case 'gameover':
      Game.overT++;
      if (enterEdge && Game.overT > 40) toTitle();
      break;
    case 'win': stepWin(); break;
  }
  jumpEdge = false; enterEdge = false; pauseEdge = false;
  navEdge = { up: false, down: false, left: false, right: false };
}

function stepTitle() {
  if (navEdge.up || navEdge.down) {
    Game.titleSel = 1 - Game.titleSel;
    ChipAudio.sfx.pause();
  }
  if (Game.titleSel === 1 && navEdge.left) {
    Game.titleLevel = (Game.titleLevel + LEVELS.length - 1) % LEVELS.length;
    ChipAudio.sfx.pause();
  }
  if (Game.titleSel === 1 && navEdge.right) {
    Game.titleLevel = (Game.titleLevel + 1) % LEVELS.length;
    ChipAudio.sfx.pause();
  }
  if (enterEdge) {
    newGame(Game.titleSel === 1 ? Game.titleLevel : 0);
    ChipAudio.sfx.coin();
  }
}

function stepPlaying() {
  if (pauseEdge) {
    Game.paused = !Game.paused;
    ChipAudio.sfx.pause();
    ChipAudio.setPaused(Game.paused);
    return;
  }
  if (Game.paused) return;
  if (Game.freeze > 0) {
    Game.freeze--;
    const p = Game.player;
    if (p.growT > 0) p.growT--;
    if (p.shrinkT > 0) p.shrinkT--;
    return;
  }
  // 计时
  Game.timeAcc++;
  if (Game.timeAcc >= 24) {
    Game.timeAcc = 0;
    Game.timeLeft--;
    if (Game.timeLeft === 60 && !Game.hurry) { Game.hurry = true; ChipAudio.sfx.hurry(); }
    if (Game.timeLeft <= 0) { Game.timeLeft = 0; startDeath(false); return; }
  }
  updatePlayer();
  if (Game.state !== 'playing') return;
  updateEntities();
  if (Game.state !== 'playing') return;
  updateFx();
  const p = Game.player;
  Game.camX = clamp(p.x + p.w / 2 - 140, 0, Game.level.width * 16 - W);
}

function stepDying() {
  Game.deathT++;
  const p = Game.player;
  if (Game.deathT === 22) p.vy = -7.5;
  if (Game.deathT > 22) { p.vy += 0.4; p.y += p.vy; }
  if (Game.deathT > 150) afterDeath();
}

function stepWin() {
  Game.winT++;
  if (Game.winT % 24 === 0 && Game.winT < 400) {
    const cx = 30 + Math.random() * (W - 60), cy = 26 + Math.random() * 100;
    const cols = ['#ff5050', '#f8c020', '#ffffff', '#58d858', '#70b8f0'];
    const col = cols[(Math.random() * cols.length) | 0];
    for (let i = 0; i < 14; i++) {
      const a = Math.PI * 2 * i / 14 + Math.random() * 0.4;
      Game.fw.push({ x: cx, y: cy, vx: Math.cos(a) * 1.5, vy: Math.sin(a) * 1.5 - 0.4, t: 0, col });
    }
    ChipAudio.sfx.kick();
  }
  for (let i = Game.fw.length - 1; i >= 0; i--) {
    const f = Game.fw[i];
    f.t++; f.vy += 0.035; f.x += f.vx; f.y += f.vy;
    if (f.t > 60) Game.fw.splice(i, 1);
  }
  if (enterEdge && Game.winT > 90) toTitle();
}

/* ============================================================
 * 渲染
 * ============================================================ */
function drawTile(ch, sx, sy, tx, ty) {
  const T = Sprites.tiles[Game.level.theme];
  let off = 0;
  const key = tx + ',' + ty;
  if (Game.bumpAnims.has(key)) {
    const t = Game.bumpAnims.get(key);
    off = -Math.round(Math.sin(t / 12 * Math.PI) * 5);
  }
  sy += off;
  switch (ch) {
    case '#': ctx.drawImage(T.ground, sx, sy); break;
    case 'B': ctx.drawImage(T.brick, sx, sy); break;
    case 'X': ctx.drawImage(T.block, sx, sy); break;
    case '?': case 'M': ctx.drawImage(T.question, sx, sy); break;
    case 'U': ctx.drawImage(T.used, sx, sy); break;
    case '[': ctx.drawImage(T.pipeTL, sx, sy); break;
    case ']': ctx.drawImage(T.pipeTR, sx, sy); break;
    case '{': ctx.drawImage(T.pipeBL, sx, sy); break;
    case '}': ctx.drawImage(T.pipeBR, sx, sy); break;
    case 'C': ctx.drawImage(T.coin[(Game.frame >> 3) % 4], sx, sy); break;
    case '|':
      ctx.fillStyle = '#8ad878'; ctx.fillRect(sx + 7, sy, 2, 16);
      ctx.fillStyle = '#2c7c2c'; ctx.fillRect(sx + 8, sy, 1, 16);
      break;
    case 'F':
      ctx.fillStyle = '#8ad878'; ctx.fillRect(sx + 7, sy + 6, 2, 10);
      ctx.fillStyle = '#f8c020'; ctx.fillRect(sx + 4, sy, 8, 7);
      ctx.fillStyle = '#fff'; ctx.fillRect(sx + 6, sy + 1, 3, 2);
      break;
  }
}

function drawEnemy(e) {
  const sx = Math.round(e.x - Game.camX - 2);
  const S = Sprites;
  if (e.kind === 'mush') {
    ctx.drawImage(S.mush, sx, Math.round(e.y + e.h - S.mush.height));
    return;
  }
  const flip = e.state === 'flip';
  if (flip) { ctx.save(); ctx.translate(sx + 8, Math.round(e.y + e.h)); ctx.scale(1, -1); ctx.translate(-sx - 8, -Math.round(e.y + e.h)); }
  if (e.kind === 'walker') {
    if (e.state === 'squash') {
      const spr = S.walker[0];
      ctx.drawImage(spr, 0, 0, 16, 12, sx, Math.round(e.y + e.h - 6), 16, 6);
    } else {
      const spr = S.walker[(Game.frame >> 4) & 1];
      ctx.drawImage(spr, sx, Math.round(e.y + e.h - spr.height));
    }
  } else { // turtle
    if (e.state === 'walk') {
      const spr = S.turtle[(Game.frame >> 4) & 1];
      ctx.drawImage(spr, sx, Math.round(e.y + e.h - spr.height));
    } else {
      ctx.drawImage(S.shell, sx, Math.round(e.y + e.h - S.shell.height));
    }
  }
  if (flip) ctx.restore();
}

function drawPlayer() {
  const p = Game.player;
  if (p.invuln > 0 && (Game.frame >> 2) & 1 && Game.state === 'playing') return;
  let spr;
  const set = p.big ? Sprites.big : Sprites.small;
  if (Game.state === 'dying') spr = Sprites.small.die;
  else if (p.growT > 0) spr = (p.growT >> 2) & 1 ? Sprites.big.idle : Sprites.small.idle;
  else if (p.shrinkT > 0) spr = (p.shrinkT >> 2) & 1 ? Sprites.small.idle : Sprites.big.idle;
  else if (!p.onGround) spr = set.jump;
  else if (Math.abs(p.vx) > 0.3 || (Game.state === 'flag' && Game.flagT >= 26)) {
    spr = Math.floor(p.walkAnim / 6) % 2 ? set.walk1 : set.walk2;
  } else spr = set.idle;

  const dx = Math.round(p.x - Game.camX - (spr.width - p.w) / 2);
  const dy = Math.round(p.y + p.h - spr.height);
  if (p.facing < 0) {
    ctx.save(); ctx.translate(dx + spr.width, dy); ctx.scale(-1, 1);
    ctx.drawImage(spr, 0, 0); ctx.restore();
  } else ctx.drawImage(spr, dx, dy);
}

function drawWorld() {
  const lv = Game.level, th = THEMES[lv.theme];
  ctx.fillStyle = th.bg;
  ctx.fillRect(0, 0, W, H);
  const cam = Game.camX;

  // 星空
  if (th.deco === 'stars') {
    ctx.fillStyle = '#e8e8ff';
    for (let i = 0; i < 60; i++) {
      const wx = (i * 173 + 40) % (lv.width * 16);
      const sx = wx - cam * 0.4;
      const sx2 = ((sx % (W + 80)) + W + 80) % (W + 80) - 40;
      if (sx2 >= 0 && sx2 < W) {
        ctx.globalAlpha = 0.4 + 0.6 * ((i + (Game.frame >> 4)) % 2);
        ctx.fillRect(Math.round(sx2), (i * 53) % 130 + 6, 1, 1);
      }
    }
    ctx.globalAlpha = 1;
  }
  // 云 / 山 / 灌木
  if (th.deco === 'clouds' || th.deco === 'stars') {
    for (let i = Math.floor((cam - 100) / 300); i < (cam + W + 100) / 300; i++) {
      const wx = i * 300 + (i * 97) % 120;
      drawCloud(ctx, Math.round(wx - cam + Game.frame * 0.06), 22 + (i * 53) % 3 * 22);
    }
  }
  if (th.deco === 'clouds' || th.deco === 'stars') {
    for (let i = Math.floor((cam - 120) / 420); i < (cam + W + 120) / 420; i++) {
      drawHill(ctx, Math.round(i * 420 + 60 - cam), 13 * 16, i % 2 === 0, th);
    }
    for (let i = Math.floor((cam - 120) / 336); i < (cam + W + 120) / 336; i++) {
      drawBush(ctx, Math.round(i * 336 + 200 - cam), 13 * 16, th);
    }
  }
  // 城堡
  for (const cx of lv.castles) drawCastle(ctx, cx * 16 - cam, 13 * 16, th);

  // 正在升起的蘑菇（画在砖后面）
  for (const e of Game.entities)
    if (e.kind === 'mush' && e.state === 'rise') drawEnemy(e);

  // 图块
  const tx0 = Math.floor(cam / 16), tx1 = tx0 + 21;
  for (let ty = 0; ty < 15; ty++)
    for (let tx = tx0; tx <= tx1; tx++) {
      if (tx < 0 || tx >= lv.width) continue;
      const ch = lv.grid[ty][tx];
      if (ch !== ' ') drawTile(ch, tx * 16 - cam, ty * 16, tx, ty);
    }

  // 旗布
  if (Game.flagX >= 0) ctx.drawImage(Sprites.flagCloth, Game.flagX * 16 - 10, Game.flagY);

  // 实体
  for (const e of Game.entities) {
    if (!e.active && e.kind !== 'mush') continue;
    if (e.kind === 'mush' && e.state === 'rise') continue;
    if (e.x - cam < -24 || e.x - cam > W + 24) continue;
    drawEnemy(e);
  }

  drawPlayer();

  // 金币弹出
  for (const c of Game.coinPops)
    ctx.drawImage(Sprites.tiles[lv.theme].coin[(c.t >> 2) % 4], Math.round(c.x - cam), Math.round(c.y));
  // 碎砖
  const tb = Sprites.tiles[lv.theme].brick;
  for (const d of Game.debris) {
    ctx.drawImage(tb, Math.round(d.x - cam) % 8, Math.round(d.y) % 8, 6, 6, Math.round(d.x - cam), Math.round(d.y), 6, 6);
  }
  // 得分浮字
  for (const s of Game.popups)
    drawTextC(ctx, s.text, Math.round(s.x - cam), Math.round(s.y), { color: '#ffffff', scale: 1 });
}

function drawHUD() {
  const pad = (n, l) => String(n).padStart(l, '0');
  drawText(ctx, 'SCORE', 8, 4, { color: '#fff' });
  drawText(ctx, pad(Game.score, 6), 8, 13, { color: '#fff' });
  // 金币图标
  const T = Sprites.tiles[Game.level.theme];
  ctx.drawImage(T.coin[(Game.frame >> 3) % 4], 96, 3, 8, 12);
  drawText(ctx, '×' + pad(Game.coins, 2), 106, 13, { color: '#ffd85c' });
  drawText(ctx, 'WORLD', 160, 4, { color: '#fff' });
  drawText(ctx, Game.level.name, 166, 13, { color: '#fff' });
  drawText(ctx, 'TIME', 226, 4, { color: Game.hurry ? '#ff5050' : '#fff' });
  drawText(ctx, pad(Game.timeLeft, 3), 226, 13, { color: Game.hurry ? '#ff5050' : '#fff' });
  drawText(ctx, 'LIVES', 272, 4, { color: '#fff' });
  drawText(ctx, '×' + Game.lives, 284, 13, { color: '#fff' });
}

function renderPre() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  drawTextC(ctx, 'WORLD ' + Game.level.name, W / 2, 84, { color: '#fff', scale: 2 });
  ctx.drawImage(Sprites.small.idle, W / 2 - 26, 112);
  drawText(ctx, '× ' + Game.lives, W / 2 - 4, 118, { color: '#fff' });
  if (Game.worldIdx === 0 && Game.score === 0)
    drawCN(ctx, '方向键移动 · Z/空格 跳跃 · X/Shift 加速跑', W / 2, 160, { size: 10, color: '#9ab0d8', align: 'center' });
}

function renderTitle() {
  const th = THEMES.over;
  ctx.fillStyle = th.bg;
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 5; i++)
    drawCloud(ctx, (i * 90 + 30 - Game.frame * 0.12 % 450 + 450) % 450 - 40, 26 + (i % 3) * 26);
  drawHill(ctx, -20, 13 * 16, true, th);
  drawHill(ctx, 230, 13 * 16, false, th);
  drawBush(ctx, 120, 13 * 16, th);
  const T = Sprites.tiles.over;
  for (let tx = 0; tx < 20; tx++) {
    ctx.drawImage(T.ground, tx * 16, 13 * 16);
    ctx.drawImage(T.ground, tx * 16, 14 * 16);
  }
  // 标题面板
  ctx.fillStyle = '#000';
  ctx.fillRect(28, 24, 264, 76);
  ctx.fillStyle = '#9c2a00';
  ctx.fillRect(30, 26, 260, 72);
  ctx.fillStyle = '#c8501c';
  ctx.fillRect(30, 26, 260, 2); ctx.fillRect(30, 26, 2, 72);
  ctx.fillStyle = '#5e1600';
  ctx.fillRect(30, 96, 260, 2); ctx.fillRect(288, 26, 2, 72);
  drawTextC(ctx, 'PIXEL QUEST', W / 2, 38, { color: '#f8c020', scale: 3 });
  drawCN(ctx, '像 素 大 冒 险 · 8-BIT 平台跳跃', W / 2, 74, { size: 11, color: '#ffd8a0', align: 'center' });

  // 菜单
  const sel = Game.titleSel;
  drawText(ctx, (sel === 0 ? '>' : ' ') + ' START GAME', 96, 122, { color: sel === 0 ? '#fff' : '#a0b8e0' });
  drawText(ctx, (sel === 1 ? '>' : ' ') + ' LEVEL SELECT', 96, 136, { color: sel === 1 ? '#fff' : '#a0b8e0' });
  if (sel === 1) {
    const nm = LEVELS[Game.titleLevel].name;
    drawText(ctx, '<', 210, 136, { color: '#f8c020' });
    drawText(ctx, nm, 222, 136, { color: '#f8c020' });
    drawText(ctx, '>', 246, 136, { color: '#f8c020' });
  }
  drawTextC(ctx, 'HI SCORE ' + String(Game.hiscore).padStart(6, '0'), W / 2, 160, { color: '#a0b8e0' });
  if ((Game.frame >> 5) & 1)
    drawTextC(ctx, 'PRESS ENTER / TAP TO START', W / 2, 178, { color: '#fff' });
  drawTextC(ctx, 'ARROWS MOVE  Z/SPACE JUMP', W / 2, 198, { color: '#8aa0c8' });
  drawTextC(ctx, 'X/SHIFT RUN  P PAUSE  M SOUND', W / 2, 208, { color: '#8aa0c8' });
  // 装饰角色
  ctx.drawImage(Sprites.small.idle, 40, 13 * 16 - 14);
  const wx = (Game.frame * 0.4) % (W + 80) - 40;
  ctx.drawImage(Sprites.walker[(Game.frame >> 4) & 1], W - 40 - wx, 13 * 16 - 12);
  ctx.drawImage(Sprites.walker[(Game.frame >> 4) & 1], W - 60 - (wx * 0.6 | 0), 13 * 16 - 12);
}

function renderWorldAndHud() {
  drawWorld();
  drawHUD();
  if (Game.state === 'clear') {
    ctx.fillStyle = 'rgba(0,0,0,.45)';
    ctx.fillRect(0, 0, W, H);
    drawTextC(ctx, 'LEVEL CLEAR!', W / 2, 92, { color: '#f8c020', scale: 2 });
    drawTextC(ctx, 'TIME BONUS ' + Game.timeLeft * 10, W / 2, 120, { color: '#fff' });
  }
  if (Game.paused) {
    ctx.fillStyle = 'rgba(0,0,0,.55)';
    ctx.fillRect(0, 0, W, H);
    drawTextC(ctx, 'PAUSE', W / 2, 100, { color: '#fff', scale: 2 });
    drawTextC(ctx, 'P:RESUME  M:SOUND', W / 2, 126, { color: '#a0b8e0' });
  }
}

function renderOver() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  drawTextC(ctx, 'GAME OVER', W / 2, 84, { color: '#ff5050', scale: 2 });
  drawTextC(ctx, 'SCORE ' + String(Game.score).padStart(6, '0'), W / 2, 120, { color: '#fff' });
  drawTextC(ctx, 'HI ' + String(Game.hiscore).padStart(6, '0'), W / 2, 134, { color: '#a0b8e0' });
  if ((Game.frame >> 5) & 1)
    drawTextC(ctx, 'PRESS ENTER', W / 2, 170, { color: '#fff' });
}

function renderWin() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  for (const f of Game.fw) {
    ctx.globalAlpha = Math.max(0, 1 - f.t / 60);
    ctx.fillStyle = f.col;
    ctx.fillRect(Math.round(f.x), Math.round(f.y), 2, 2);
  }
  ctx.globalAlpha = 1;
  drawTextC(ctx, 'CONGRATULATIONS!', W / 2, 56, { color: '#f8c020', scale: 2 });
  drawCN(ctx, '感谢游玩！全部关卡通关！', W / 2, 96, { size: 12, color: '#fff', align: 'center' });
  drawTextC(ctx, 'SCORE ' + String(Game.score).padStart(6, '0'), W / 2, 122, { color: '#fff' });
  drawTextC(ctx, 'HI SCORE ' + String(Game.hiscore).padStart(6, '0'), W / 2, 136, { color: '#a0b8e0' });
  if ((Game.frame >> 5) & 1)
    drawTextC(ctx, 'PRESS ENTER', W / 2, 180, { color: '#fff' });
}

function render() {
  switch (Game.state) {
    case 'title': renderTitle(); break;
    case 'pre': renderPre(); break;
    case 'playing': case 'flag': case 'clear': case 'dying':
      renderWorldAndHud(); break;
    case 'gameover': renderOver(); break;
    case 'win': renderWin(); break;
  }
}

/* ---------- 自适应缩放 ---------- */
function resize() {
  const vw = window.innerWidth, vh = window.innerHeight;
  let s = Math.min(vw / W, vh / H);
  if (s >= 1) s = Math.floor(s);
  canvas.style.width = (W * s) + 'px';
  canvas.style.height = (H * s) + 'px';
}
window.addEventListener('resize', resize);
resize();

/* ---------- 调试钩子：#play=N&demo 自动进入关卡并自动跑跳（测试/演示用） ---------- */
(function debugHook() {
  const m = location.hash.match(/play=(\d+)/);
  if (!m) return;
  newGame(parseInt(m[1], 10) % LEVELS.length);
  Game.preT = 99;
  if (location.hash.includes('demo')) {
    keys.right = true; keys.run = true;
    Game.autoJump = setInterval(() => { jumpEdge = true; }, 640);
  }
})();

/* ---------- 启动 ---------- */
let last = 0, acc = 0;
function loop(ts) {
  requestAnimationFrame(loop);
  const dt = Math.min(50, ts - last);
  last = ts;
  acc += dt;
  let n = 0;
  while (acc >= 16.6667 && n < 4) { acc -= 16.6667; n++; step(); }
  if (n === 4) acc = 0;
  render();
}
requestAnimationFrame(loop);
