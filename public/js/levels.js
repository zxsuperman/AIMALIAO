'use strict';
/* ============================================================
 * levels.js —— 关卡系统
 * 通过构建器 API 用数据描述关卡；4 个关卡，主题各异。
 * 图例：# 地面  B 砖  ? 问号(金币)  M 问号(蘑菇)  X 硬块
 *       [ ] { } 水管   C 金币   F/| 旗杆   S 出生点
 * ============================================================ */

function LevelBuilder(width) {
  const g = Array.from({ length: 15 }, () => Array(width).fill(' '));
  const spawns = [], castles = [];
  const api = {
    g, spawns, castles, w: width, _spawn: 3,
    set(x, y, c) { if (x >= 0 && x < width && y >= 0 && y < 15) g[y][x] = c; },
    row(y, x0, x1, c) { for (let x = x0; x <= x1; x++) this.set(x, y, c); },
    fill(x0, y0, x1, y1, c) { for (let y = y0; y <= y1; y++) this.row(y, x0, x1, c); },
    ground(x0, x1) { this.fill(x0, 13, x1, 14, '#'); },
    ceiling() { this.row(0, 0, width - 1, '#'); },
    brick(x, y) { this.set(x, y, 'B'); },
    bricks(x0, x1, y) { this.row(y, x0, x1, 'B'); },
    q(x, y) { this.set(x, y, '?'); },
    qm(x, y) { this.set(x, y, 'M'); },
    coin(x, y) { this.set(x, y, 'C'); },
    coins(x0, x1, y) { this.row(y, x0, x1, 'C'); },
    block(x, y) { this.set(x, y, 'X'); },
    blocks(x0, x1, y) { this.row(y, x0, x1, 'X'); },
    pipe(x, h) {
      const top = 13 - h;
      this.set(x, top, '['); this.set(x + 1, top, ']');
      for (let y = top + 1; y <= 12; y++) { this.set(x, y, '{'); this.set(x + 1, y, '}'); }
    },
    stairsUp(x, h) { for (let i = 0; i < h; i++) for (let y = 12 - i; y <= 12; y++) this.set(x + i, y, 'X'); },
    stairsDown(x, h) { for (let i = 0; i < h; i++) for (let y = 12 - (h - 1 - i); y <= 12; y++) this.set(x + i, y, 'X'); },
    enemy(x, y, type) { spawns.push({ x, y: y == null ? 12 : y, type: type || 'walker' }); },
    walker(x, y) { this.enemy(x, y, 'walker'); },
    turtle(x, y) { this.enemy(x, y, 'turtle'); },
    castle(x) { castles.push(x); },
    flag(x) { this.set(x, 3, 'F'); for (let y = 4; y <= 11; y++) this.set(x, y, '|'); this.set(x, 12, 'X'); },
    spawn(x) { this._spawn = x; }
  };
  return api;
}

const LEVELS = [
  /* ============ 1-1 草地起步 ============ */
  {
    name: '1-1', theme: 'over', time: 300, width: 184,
    build(b) {
      b.spawn(3);
      b.ground(0, 68); b.ground(71, 85); b.ground(89, 152); b.ground(155, 183);
      b.q(16, 9);
      b.brick(20, 9); b.qm(21, 9); b.brick(22, 9); b.q(23, 9); b.brick(24, 9);
      b.q(22, 5);
      b.walker(26);
      b.pipe(30, 2); b.pipe(40, 3); b.pipe(50, 4); b.pipe(60, 4);
      b.coins(34, 36, 8);
      b.walker(44); b.walker(46); b.turtle(55);
      b.brick(74, 9); b.qm(75, 9); b.brick(76, 9);
      b.coins(74, 76, 5);
      b.brick(92, 9); b.q(93, 9); b.brick(94, 9);
      b.walker(96); b.walker(98);
      b.turtle(103);
      b.q(104, 9);
      b.coins(110, 113, 9);
      b.walker(112); b.walker(114);
      b.pipe(118, 2); b.turtle(122);
      b.stairsUp(128, 4); b.stairsDown(134, 4);
      b.stairsUp(160, 4);
      b.flag(170);
      b.castle(175);
    }
  },
  /* ============ 1-2 地下洞窟 ============ */
  {
    name: '1-2', theme: 'cave', time: 300, width: 176,
    build(b) {
      b.spawn(2);
      b.ceiling();
      for (const sx of [18, 34, 66, 90, 112, 130]) { b.set(sx, 1, '#'); b.set(sx, 2, '#'); }
      b.ground(0, 59); b.ground(63, 99); b.ground(104, 139); b.ground(142, 175);
      b.coins(4, 8, 9);
      b.brick(10, 9); b.q(11, 9); b.brick(12, 9);
      b.walker(14); b.walker(16);
      b.fill(22, 10, 22, 12, 'X'); b.coins(20, 21, 7);
      b.fill(25, 10, 25, 12, 'X'); b.fill(26, 8, 26, 12, 'X');
      b.walker(30);
      b.bricks(34, 40, 10); b.coins(34, 40, 9); b.qm(37, 10);
      b.turtle(38);
      b.walker(66); b.walker(68);
      b.q(74, 9); b.qm(75, 9);
      b.turtle(80);
      b.bricks(84, 90, 8); b.coins(85, 89, 12); b.walker(87);
      b.fill(101, 10, 102, 10, 'X');
      b.walker(108); b.walker(110); b.walker(112);
      b.bricks(114, 120, 10); b.coins(114, 120, 9); b.q(117, 10);
      b.turtle(118);
      b.walker(144);
      b.stairsUp(146, 4);
      b.flag(154);
      b.castle(160);
    }
  },
  /* ============ 1-3 星空跳台 ============ */
  {
    name: '1-3', theme: 'night', time: 250, width: 168,
    build(b) {
      b.spawn(2);
      b.ground(0, 19); b.ground(148, 167);
      b.fill(22, 11, 25, 11, 'X');
      b.fill(29, 9, 32, 9, 'X');
      b.fill(36, 7, 38, 7, 'X');
      b.fill(42, 9, 45, 9, 'X'); b.turtle(43, 8);
      b.fill(49, 11, 52, 11, 'X');
      b.fill(56, 10, 57, 10, 'X');
      b.coins(58, 60, 7);
      b.fill(61, 8, 64, 8, 'X'); b.turtle(62, 7);
      b.fill(68, 10, 70, 10, 'X');
      b.fill(74, 12, 77, 12, 'X'); b.walker(75, 11);
      b.coins(78, 80, 9);
      b.fill(81, 9, 84, 9, 'X');
      b.fill(89, 11, 92, 11, 'X');
      b.coins(93, 95, 7);
      b.fill(96, 8, 99, 8, 'X');
      b.fill(104, 10, 107, 10, 'X'); b.walker(105, 9);
      b.fill(112, 12, 115, 12, 'X');
      b.fill(119, 9, 122, 9, 'X'); b.turtle(120, 8);
      b.fill(127, 11, 130, 11, 'X');
      b.fill(135, 10, 138, 10, 'X');
      b.coins(139, 141, 10);
      b.fill(142, 11, 145, 11, 'X');
      b.walker(152); b.walker(154);
      b.flag(157);
      b.castle(162);
    }
  },
  /* ============ 1-4 灰色城堡（最终关） ============ */
  {
    name: '1-4', theme: 'castle', time: 300, width: 178,
    build(b) {
      b.spawn(2);
      b.ceiling();
      b.ground(0, 39); b.ground(43, 79); b.ground(84, 119); b.ground(123, 177);
      b.stairsUp(6, 3); b.stairsDown(10, 3);
      b.walker(16); b.walker(18);
      b.bricks(22, 24, 9); b.qm(23, 9);
      b.turtle(26);
      b.stairsUp(28, 2); b.fill(30, 10, 30, 12, 'X'); b.stairsDown(31, 2);
      b.turtle(46); b.walker(48); b.walker(50);
      b.bricks(54, 58, 10); b.coins(54, 58, 9); b.q(56, 10);
      b.turtle(60);
      b.stairsUp(64, 4); b.stairsDown(69, 4);
      b.walker(74);
      b.fill(81, 10, 82, 10, 'X');
      b.walker(86); b.turtle(88);
      b.fill(92, 9, 98, 9, 'X'); b.turtle(95);
      b.stairsUp(126, 3); b.stairsDown(130, 3);
      b.walker(136); b.walker(138); b.turtle(140);
      b.bricks(144, 148, 10); b.coins(144, 148, 9); b.q(146, 10);
      b.stairsUp(156, 8);
      b.flag(168);
      b.castle(172);
    }
  }
];

/* 解析关卡 -> 运行时数据 */
function buildLevel(idx) {
  const def = LEVELS[idx];
  const b = LevelBuilder(def.width);
  def.build(b);
  return {
    name: def.name, theme: def.theme, time: def.time,
    grid: b.g, width: def.width, spawnX: b._spawn,
    spawns: b.spawns, castles: b.castles
  };
}
