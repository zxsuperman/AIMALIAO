'use strict';
/* ============================================================
 * sprites.js —— 原创像素素材 / 位图字体 / 主题图块
 * 所有美术均为本作原创（字符画 -> 离屏画布）
 * ============================================================ */

const PAL = {
  k: '#000000', w: '#ffffff',
  r: '#d83018',            // 红（帽/衣）
  s: '#fcc39d',            // 皮肤
  n: '#a05018', N: '#6e3410', // 棕（头发/鞋/栗子怪）
  o: '#c46a1c', O: '#5e2800', // 砖橙
  y: '#f8c020', Y: '#a06808', // 黄
  b: '#3050e8', B: '#1c2f8c', // 蓝（背带裤）
  g: '#28a428', G: '#6cd85c', E: '#0c6c14', // 绿
  d: '#c0c0c0', D: '#787878', e: '#3a3a3a', // 灰
  u: '#70b8f0', U: '#2858c0'  // 蓝（地下砖）
};

/* 字符画 -> 离屏画布（'.' 与 ' ' 为透明） */
function makeSprite(rows) {
  const h = rows.length, w = Math.max(...rows.map(r => r.length));
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d');
  for (let ry = 0; ry < h; ry++) {
    const row = rows[ry];
    for (let i = 0; i < row.length; i++) {
      const col = PAL[row[i]];
      if (col) { x.fillStyle = col; x.fillRect(i, ry, 1, 1); }
    }
  }
  return c;
}

/* ---------------- 主角（原创形象：红帽水管工风小人） ---------------- */
const HERO_SMALL = {
  idle: [
    ".....rrrrrr.....",
    "....rrrrrrrrr...",
    "....nnnsssks....",
    "...nssssskkkk...",
    "....ssssssss....",
    "....rrrrrrrr....",
    "...rrrrrrrrrr...",
    "...rbbbbbbbbr...",
    "..ssbbbbbbbbss..",
    "....bbbbbbbb....",
    ".....bb..bb.....",
    "....bbb..bbb....",
    "...NNNN..NNNN...",
    "..NNNNN..NNNNN.."
  ],
  walk1: [
    ".....rrrrrr.....",
    "....rrrrrrrrr...",
    "....nnnsssks....",
    "...nssssskkkk...",
    "....ssssssss....",
    "....rrrrrrrr....",
    "...rrrrrrrrrrs..",
    "...rbbbbbbbbbs..",
    "..ssbbbbbbbb....",
    "....bbbbbbbb....",
    ".....bbbbb......",
    "....bbbbbb......",
    "...NNNNNN.......",
    "..NNNNNNN......."
  ],
  walk2: [
    ".....rrrrrr.....",
    "....rrrrrrrrr...",
    "....nnnsssks....",
    "...nssssskkkk...",
    "....ssssssss....",
    "...srrrrrrrr....",
    "..ssrrrrrrrr....",
    "...rbbbbbbbbr...",
    "....bbbbbbbbss..",
    "....bbbbbbbb....",
    "...bbb....bbb...",
    "..bbb......bbb..",
    ".NNNN......NNNN.",
    "NNNN........NNNN"
  ],
  jump: [
    ".....rrrrrr..ss.",
    "....rrrrrrrr.ss.",
    "....nnnsssks.rr.",
    "...nssssskkkkrr.",
    "....ssssssssrr..",
    "...srrrrrrrrr...",
    "..ssrrrrrrrr....",
    "...rbbbbbbbb....",
    "....bbbbbbbb....",
    "....bbbbbbbb....",
    ".....bbbbbb.....",
    "....bbb..bbb....",
    "...NNNN..NNNN...",
    "................"
  ],
  die: [
    "....rrrrrrrr....",
    "...rrrrrrrrrr...",
    "...sskssskss....",
    "...sskssskss....",
    "....sskkkkss....",
    "..s.rrrrrrrr.s..",
    ".ss.rrrrrrrr.ss.",
    ".ss.bbbbbbbb.ss.",
    "....bbbbbbbb....",
    "....bbbbbbbb....",
    "...bbb....bbb...",
    "..NNN......NNN..",
    ".NNNN......NNNN.",
    "................"
  ]
};

const HERO_BIG = {
  idle: [
    ".....rrrrrrr....",
    "....rrrrrrrrr...",
    "...rrrrrrrrrrr..",
    "....nnnssskks...",
    "...nnssssskkks..",
    "....sssssssss...",
    "....sssssss.....",
    "....rrrrrrrr....",
    "...rrrrrrrrrr...",
    "...rrrrrrrrrr...",
    "...rrbbbbbbrr...",
    "..rrbbbbbbbbrr..",
    "..rrbbbbbbbbrr..",
    "..ssbbbbbbbbss..",
    "..ssbbbbbbbbss..",
    "...bbbbbbbbbb...",
    "...bbbbbbbbbb...",
    "...bbbbbbbbbb...",
    "...bbbbbbbbbb...",
    "....bbbbbbbb....",
    "....bbb..bbb....",
    "....bbb..bbb....",
    "....bbb..bbb....",
    "...bbbb..bbbb...",
    "...NNNN..NNNN...",
    "..NNNNN..NNNNN..",
    "..NNNNN..NNNNN.."
  ],
  walk1: [
    ".....rrrrrrr....",
    "....rrrrrrrrr...",
    "...rrrrrrrrrrr..",
    "....nnnssskks...",
    "...nnssssskkks..",
    "....sssssssss...",
    "....sssssss.....",
    "....rrrrrrrr....",
    "...rrrrrrrrrrs..",
    "...rrrrrrrrrrss.",
    "...rrbbbbbbrss..",
    "..rrbbbbbbrb....",
    "..rrbbbbbbbb....",
    "..ssbbbbbbbb....",
    "..ssbbbbbbbb....",
    "...bbbbbbbbbb...",
    "...bbbbbbbbbb...",
    "...bbbbbbbbbb...",
    "...bbbbbbbbbb...",
    "....bbbbbbbb....",
    "....bbbbbb......",
    "....bbbbbb......",
    "....bbbbbb......",
    "...bbbbbbb......",
    "...NNNNNNN......",
    "..NNNNNNNN......",
    "..NNNNNNNN......"
  ],
  walk2: [
    ".....rrrrrrr....",
    "....rrrrrrrrr...",
    "...rrrrrrrrrrr..",
    "....nnnssskks...",
    "...nnssssskkks..",
    "....sssssssss...",
    "....sssssss.....",
    "...srrrrrrrr....",
    "..ssrrrrrrrr....",
    "..srrrrrrrrrr...",
    "...rrbbbbbbr....",
    "...rbbbbbbrbss..",
    "...rbbbbbbrbss..",
    "....bbbbbbbbss..",
    "....bbbbbbbb....",
    "...bbbbbbbbbb...",
    "...bbbbbbbbbb...",
    "...bbbbbbbbbb...",
    "...bbbbbbbbbb...",
    "....bbbbbbbb....",
    "...bbb....bbb...",
    "...bbb....bbb...",
    "..bbb......bbb..",
    "..bbb......bbb..",
    ".NNNN......NNNN.",
    "NNNNN......NNNNN",
    "NNNN........NNNN"
  ],
  jump: [
    ".....rrrrrrr..ss",
    "....rrrrrrrrr.ss",
    "...rrrrrrrrrr.rs",
    "....nnnssskks.rr",
    "...nnssssskkksrr",
    "....sssssssssrr.",
    "....sssssss.rr..",
    "...rrrrrrrrrr...",
    "..rrrrrrrrrr....",
    "..srrrrrrrrr....",
    "..ssbbbbbbr.....",
    "...bbbbbbbbr....",
    "...bbbbbbbbr....",
    "...bbbbbbbb.....",
    "...bbbbbbbb.....",
    "...bbbbbbbbbb...",
    "...bbbbbbbbbb...",
    "...bbbbbbbbbb...",
    "...bbbbbbbbbb...",
    "....bbbbbbbb....",
    "....bbbbbbbb....",
    "....bbb..bbb....",
    "...NNNN..NNNN...",
    "...NNNN..NNNN...",
    "..NNNNN..NNNNN..",
    "................",
    "................"
  ]
};

/* ---------------- 敌人 / 道具 ---------------- */
const SPR = {};

SPR.walker = [ // 栗子小怪（两帧走路）
  [
    "....nnnnnnnn....",
    "..nnnnnnnnnnnn..",
    ".nnnnnnnnnnnnnn.",
    ".nnwwknnnnkwwnn.",
    "nnnwwknnnnkwwnnn",
    "nnnnnnnnnnnnnnnn",
    "nnnnnnnnnnnnnnnn",
    ".nnnnnnnnnnnnnn.",
    "..nnnnnnnnnnnn..",
    "..NnnnnnnnnnnN..",
    "..kkk......kkk..",
    ".kkkkk....kkkkk."
  ],
  [
    "....nnnnnnnn....",
    "..nnnnnnnnnnnn..",
    ".nnnnnnnnnnnnnn.",
    ".nnwwknnnnkwwnn.",
    "nnnwwknnnnkwwnnn",
    "nnnnnnnnnnnnnnnn",
    "nnnnnnnnnnnnnnnn",
    ".nnnnnnnnnnnnnn.",
    "..nnnnnnnnnnnn..",
    "..NnnnnnnnnnnN..",
    ".kkk........kkk.",
    "kkkkk......kkkkk"
  ]
];

SPR.turtle = [ // 小乌龟（两帧走路）
  [
    ".........ssss...",
    "........ssksss..",
    "........ssssss..",
    ".........ssss...",
    "...gggggg.ss....",
    "..gGGGGgggss....",
    ".gGGggggggg.....",
    ".gGggggggggg....",
    ".ggggggggggg....",
    "..gggggggggg....",
    "..wwwwwwwww.....",
    "...wwwwwww......",
    "..yyy...yyy.....",
    "..yy.....yy....."
  ],
  [
    ".........ssss...",
    "........ssksss..",
    "........ssssss..",
    ".........ssss...",
    "...gggggg.ss....",
    "..gGGGGgggss....",
    ".gGGggggggg.....",
    ".gGggggggggg....",
    ".ggggggggggg....",
    "..gggggggggg....",
    "..wwwwwwwww.....",
    "...wwwwwww......",
    "...yyy...yyy....",
    "....yy.....yy..."
  ]
];

SPR.shell = [ // 龟壳
  "....gggggggg....",
  "..gggggggggggg..",
  ".gggGGgggGGggg..",
  ".gggGGgggGGggg..",
  ".ggggggggggggg..",
  "..ggggggggggg...",
  ".wwwwwwwwwwwww..",
  "..wwwwwwwwwww..."
];

SPR.mush = [ // 蘑菇（变大道具）
  ".....rrrrrr.....",
  "...rrrwwwwrrr...",
  "..rrrrwwwwrrrr..",
  ".rrwwrrrrrrwwrr.",
  ".rwwwrrrrrrwwwr.",
  "rrrrrrrrrrrrrrrr",
  "rrrrrrrrrrrrrrrr",
  ".rrrrrrrrrrrrrr.",
  "..wwwwwwwwwwww..",
  "..wwkwwwwwkww...",
  "..wwwwwwwwwwww..",
  "...wwwwwwwwww..."
];

SPR.flagCloth = [ // 旗帜
  ".......gggg",
  "....ggggggg",
  ".ggggwwgggg",
  ".ggggwwgggg",
  "....ggggggg",
  ".......gggg"
];

/* ---------------- 5x7 位图字体（HUD/菜单） ---------------- */
const FONT = {
  ' ': [0,0,0,0,0,0,0],
  '0': [0x0E,0x11,0x13,0x15,0x19,0x11,0x0E],
  '1': [0x04,0x0C,0x04,0x04,0x04,0x04,0x0E],
  '2': [0x0E,0x11,0x01,0x06,0x08,0x10,0x1F],
  '3': [0x1F,0x02,0x04,0x02,0x01,0x11,0x0E],
  '4': [0x02,0x06,0x0A,0x12,0x1F,0x02,0x02],
  '5': [0x1F,0x10,0x1E,0x01,0x01,0x11,0x0E],
  '6': [0x06,0x08,0x10,0x1E,0x11,0x11,0x0E],
  '7': [0x1F,0x01,0x02,0x04,0x08,0x08,0x08],
  '8': [0x0E,0x11,0x11,0x0E,0x11,0x11,0x0E],
  '9': [0x0E,0x11,0x11,0x0F,0x01,0x02,0x0C],
  'A': [0x0E,0x11,0x11,0x1F,0x11,0x11,0x11],
  'B': [0x1E,0x11,0x11,0x1E,0x11,0x11,0x1E],
  'C': [0x0E,0x11,0x10,0x10,0x10,0x11,0x0E],
  'D': [0x1C,0x12,0x11,0x11,0x11,0x12,0x1C],
  'E': [0x1F,0x10,0x10,0x1E,0x10,0x10,0x1F],
  'F': [0x1F,0x10,0x10,0x1E,0x10,0x10,0x10],
  'G': [0x0E,0x11,0x10,0x17,0x11,0x11,0x0F],
  'H': [0x11,0x11,0x11,0x1F,0x11,0x11,0x11],
  'I': [0x0E,0x04,0x04,0x04,0x04,0x04,0x0E],
  'J': [0x07,0x02,0x02,0x02,0x02,0x12,0x0C],
  'K': [0x11,0x12,0x14,0x18,0x14,0x12,0x11],
  'L': [0x10,0x10,0x10,0x10,0x10,0x10,0x1F],
  'M': [0x11,0x1B,0x15,0x15,0x11,0x11,0x11],
  'N': [0x11,0x19,0x15,0x13,0x11,0x11,0x11],
  'O': [0x0E,0x11,0x11,0x11,0x11,0x11,0x0E],
  'P': [0x1E,0x11,0x11,0x1E,0x10,0x10,0x10],
  'Q': [0x0E,0x11,0x11,0x11,0x15,0x12,0x0D],
  'R': [0x1E,0x11,0x11,0x1E,0x14,0x12,0x11],
  'S': [0x0F,0x10,0x10,0x0E,0x01,0x01,0x1E],
  'T': [0x1F,0x04,0x04,0x04,0x04,0x04,0x04],
  'U': [0x11,0x11,0x11,0x11,0x11,0x11,0x0E],
  'V': [0x11,0x11,0x11,0x11,0x11,0x0A,0x04],
  'W': [0x11,0x11,0x11,0x15,0x15,0x15,0x0A],
  'X': [0x11,0x11,0x0A,0x04,0x0A,0x11,0x11],
  'Y': [0x11,0x11,0x11,0x0A,0x04,0x04,0x04],
  'Z': [0x1F,0x01,0x02,0x04,0x08,0x10,0x1F],
  '.': [0,0,0,0,0,0x0C,0x0C],
  ',': [0,0,0,0,0x0C,0x04,0x08],
  ':': [0,0x0C,0x0C,0,0x0C,0x0C,0],
  '!': [0x04,0x04,0x04,0x04,0x04,0,0x04],
  '?': [0x0E,0x11,0x01,0x06,0x04,0,0x04],
  '-': [0,0,0,0x1F,0,0,0],
  '+': [0,0x04,0x04,0x1F,0x04,0x04,0],
  'X2': [0,0x11,0x0A,0x04,0x0A,0x11,0], // ×
  '<': [0x02,0x04,0x08,0x10,0x08,0x04,0x02],
  '>': [0x08,0x04,0x02,0x01,0x02,0x04,0x08],
  '/': [0x01,0x01,0x02,0x04,0x08,0x10,0x10],
  "'": [0x06,0x04,0x08,0,0,0,0],
  '_': [0,0,0,0,0,0,0x1F]
};
FONT['×'] = FONT['X2'];

function drawText(ctx, str, x, y, opt) {
  opt = opt || {};
  const color = opt.color || '#ffffff';
  const scale = opt.scale || 1;
  str = String(str).toUpperCase();
  const glyphW = 6 * scale;
  if (opt.shadow !== false) drawTextRaw(ctx, str, x + scale, y + scale, opt.shadow || '#000000', scale);
  drawTextRaw(ctx, str, x, y, color, scale);
}
function drawTextRaw(ctx, str, x, y, color, scale) {
  ctx.fillStyle = color;
  for (let i = 0; i < str.length; i++) {
    const g = FONT[str[i]];
    if (g) {
      for (let ry = 0; ry < 7; ry++) {
        const bits = g[ry];
        for (let cx = 0; cx < 5; cx++) {
          if (bits >> (4 - cx) & 1) ctx.fillRect(x + cx * scale, y + ry * scale, scale, scale);
        }
      }
    }
    x += 6 * scale;
  }
}
function textW(str, scale) { return String(str).length * 6 * (scale || 1) - (scale || 1); }
function drawTextC(ctx, str, cx, y, opt) {
  opt = opt || {};
  drawText(ctx, str, Math.round(cx - textW(str, opt.scale || 1) / 2), y, opt);
}
/* 中文等非位图字体文本（菜单副标题用） */
function drawCN(ctx, str, x, y, opt) {
  opt = opt || {};
  ctx.save();
  ctx.font = (opt.size || 10) + 'px "Microsoft YaHei", "PingFang SC", sans-serif';
  ctx.textBaseline = 'top';
  ctx.textAlign = opt.align || 'left';
  if (opt.shadow !== false) {
    ctx.fillStyle = opt.shadow || 'rgba(0,0,0,.6)';
    ctx.fillText(str, x + 1, y + 1);
  }
  ctx.fillStyle = opt.color || '#ffffff';
  ctx.fillText(str, x, y);
  ctx.restore();
}

/* ---------------- 主题配色 ---------------- */
const THEMES = {
  over: {
    bg: '#5c94fc', deco: 'clouds', groundStyle: 'grass',
    gMain: '#b05a18', gLite: '#38b038', gLite2: '#1d8a1d', gDark: '#6e3208',
    bMain: '#c46a1c', bDark: '#5e2800', bLite: '#e89448',
    xMain: '#c88030', xDark: '#5e2800', xLite: '#f0a860',
    pipeM: '#20a020', pipeL: '#80d878', pipeD: '#0c5c0c',
    hill: '#2c9c2c', hillDark: '#156e15',
    castleMain: '#c46a1c', castleDark: '#5e2800'
  },
  cave: {
    bg: '#000000', deco: 'none', groundStyle: 'brick',
    gMain: '#2858c0', gLite: '#78a8f0', gLite2: '#4878d0', gDark: '#0a1c50',
    bMain: '#2858c0', bDark: '#0a1c50', bLite: '#6890e8',
    xMain: '#3058a0', xDark: '#101c48', xLite: '#6888c8',
    pipeM: '#20a020', pipeL: '#80d878', pipeD: '#0c5c0c',
    castleMain: '#7090c8', castleDark: '#1c2c58'
  },
  night: {
    bg: '#101838', deco: 'stars', groundStyle: 'grass',
    gMain: '#7a3c10', gLite: '#1e7c2e', gLite2: '#0f5a1c', gDark: '#401c04',
    bMain: '#8a4a18', bDark: '#3a1a04', bLite: '#b06a30',
    xMain: '#7a5a38', xDark: '#2c1c08', xLite: '#a88050',
    pipeM: '#187818', pipeL: '#58a858', pipeD: '#0a400a',
    hill: '#17601f', hillDark: '#0c3c10',
    castleMain: '#8a4a18', castleDark: '#3a1a04'
  },
  castle: {
    bg: '#000000', deco: 'none', groundStyle: 'brick',
    gMain: '#989898', gLite: '#d0d0d0', gLite2: '#b0b0b0', gDark: '#404040',
    bMain: '#a8a8a8', bDark: '#484848', bLite: '#d0d0d0',
    xMain: '#909090', xDark: '#3c3c3c', xLite: '#c8c8c8',
    pipeM: '#20a020', pipeL: '#80d878', pipeD: '#0c5c0c',
    castleMain: '#a8a8a8', castleDark: '#484848'
  }
};

/* ---------------- 程序化图块（每主题一份） ---------------- */
function makeTiles(t) {
  function cv() {
    const c = document.createElement('canvas'); c.width = 16; c.height = 16;
    return [c, c.getContext('2d')];
  }
  const T = {};

  // 地面
  {
    const [c, x] = cv();
    if (t.groundStyle === 'grass') {
      x.fillStyle = t.gMain; x.fillRect(0, 0, 16, 16);
      x.fillStyle = t.gLite; x.fillRect(0, 0, 16, 3);
      x.fillStyle = t.gLite2; x.fillRect(0, 3, 16, 1);
      x.fillRect(2, 1, 2, 1); x.fillRect(7, 0, 2, 2); x.fillRect(12, 1, 2, 1);
      x.fillStyle = t.gDark;
      x.fillRect(0, 15, 16, 1); x.fillRect(15, 3, 1, 12);
      x.fillRect(3, 7, 2, 1); x.fillRect(9, 10, 2, 1); x.fillRect(5, 12, 2, 1); x.fillRect(11, 6, 2, 1);
    } else { // 砖块地面（地下/城堡）
      x.fillStyle = t.gMain; x.fillRect(0, 0, 16, 16);
      x.fillStyle = t.gLite; x.fillRect(0, 0, 16, 1);
      x.fillStyle = t.gDark;
      x.fillRect(0, 7, 16, 1); x.fillRect(0, 15, 16, 1);
      x.fillRect(7, 0, 1, 7); x.fillRect(3, 8, 1, 7); x.fillRect(11, 8, 1, 7);
      x.fillRect(0, 0, 1, 7); x.fillRect(15, 0, 1, 7);
    }
    T.ground = c;
  }
  // 砖块
  {
    const [c, x] = cv();
    x.fillStyle = t.bMain; x.fillRect(0, 0, 16, 16);
    x.fillStyle = t.bLite; x.fillRect(0, 0, 16, 1);
    x.fillStyle = t.bDark;
    x.fillRect(0, 7, 16, 1); x.fillRect(0, 15, 16, 1);
    x.fillRect(7, 1, 1, 6); x.fillRect(3, 8, 1, 7); x.fillRect(11, 8, 1, 7);
    x.fillRect(0, 1, 1, 6); x.fillRect(15, 1, 1, 6);
    T.brick = c;
  }
  // 硬块 X
  {
    const [c, x] = cv();
    x.fillStyle = t.xMain; x.fillRect(0, 0, 16, 16);
    x.fillStyle = t.xLite; x.fillRect(0, 0, 16, 1); x.fillRect(0, 0, 1, 16);
    x.fillStyle = t.xDark; x.fillRect(0, 14, 16, 2); x.fillRect(14, 0, 2, 16);
    x.fillRect(2, 2, 2, 2); x.fillRect(12, 2, 2, 2); x.fillRect(2, 12, 2, 2); x.fillRect(12, 12, 2, 2);
    T.block = c;
  }
  // 问号块（金币）
  {
    const [c, x] = cv();
    x.fillStyle = PAL.y; x.fillRect(0, 0, 16, 16);
    x.fillStyle = '#ffe080'; x.fillRect(1, 1, 14, 1); x.fillRect(1, 1, 1, 14);
    x.fillStyle = PAL.Y; x.fillRect(1, 14, 14, 1); x.fillRect(14, 1, 1, 14);
    x.fillStyle = PAL.k; x.fillRect(0, 0, 16, 1); x.fillRect(0, 15, 16, 1);
    x.fillRect(0, 0, 1, 16); x.fillRect(15, 0, 1, 16);
    x.fillRect(2, 2, 1, 1); x.fillRect(13, 2, 1, 1); x.fillRect(2, 13, 1, 1); x.fillRect(13, 13, 1, 1);
    const Q = ['.www.', 'w...w', '....w', '...w.', '..w..', '.....', '..w..'];
    for (let ry = 0; ry < 7; ry++) for (let cx = 0; cx < 5; cx++)
      if (Q[ry][cx] === 'w') { x.fillStyle = PAL.Y; x.fillRect(6 + cx, 5 + ry, 1, 1); x.fillStyle = PAL.w; x.fillRect(5 + cx, 4 + ry, 1, 1); }
    T.question = c;
  }
  // 已用块
  {
    const [c, x] = cv();
    x.fillStyle = '#a35f1f'; x.fillRect(0, 0, 16, 16);
    x.fillStyle = '#c87c30'; x.fillRect(1, 1, 14, 1); x.fillRect(1, 1, 1, 14);
    x.fillStyle = '#5e3008'; x.fillRect(1, 14, 14, 1); x.fillRect(14, 1, 1, 14);
    x.fillStyle = PAL.k; x.fillRect(0, 0, 16, 1); x.fillRect(0, 15, 16, 1);
    x.fillRect(0, 0, 1, 16); x.fillRect(15, 0, 1, 16);
    x.fillRect(3, 3, 1, 1); x.fillRect(12, 3, 1, 1); x.fillRect(3, 12, 1, 1); x.fillRect(12, 12, 1, 1);
    T.used = c;
  }
  // 水管 4 块
  function pipeTile(top, left) {
    const [c, x] = cv();
    x.fillStyle = t.pipeM; x.fillRect(0, 0, 16, 16);
    x.fillStyle = t.pipeL; x.fillRect(left ? 2 : 4, 0, 3, 16);
    x.fillStyle = t.pipeD; x.fillRect(left ? 0 : 14, 0, 2, 16);
    if (top) {
      x.fillStyle = t.pipeL; x.fillRect(0, 0, 16, 1);
      x.fillStyle = PAL.k; x.fillRect(0, 7, 16, 1);
      x.fillRect(left ? 0 : 14, 0, 1, 7);
    } else {
      x.fillStyle = PAL.k; x.fillRect(left ? 1 : 0, 0, 1, 16);
    }
    return c;
  }
  T.pipeTL = pipeTile(true, true); T.pipeTR = pipeTile(true, false);
  T.pipeBL = pipeTile(false, true); T.pipeBR = pipeTile(false, false);

  // 金币旋转 4 帧（程序化椭圆）
  T.coin = [8, 5, 2, 5].map((w, f) => {
    const [c, x] = cv();
    const cx0 = 8, rowsH = 12;
    for (let ry = 0; ry < rowsH; ry++) {
      const base = [4, 6, 7, 8, 8, 8, 8, 8, 8, 8, 7, 6][ry];
      const ww = Math.max(2, Math.round(base * w / 8) & ~1);
      x.fillStyle = f === 2 ? PAL.Y : PAL.y;
      x.fillRect(cx0 - ww / 2, 2 + ry, ww, 1);
      if (ww >= 5 && f !== 2) {
        x.fillStyle = PAL.Y;
        x.fillRect(cx0 - 1, 2 + ry, 2, 1);
      }
    }
    if (f === 0) { x.fillStyle = '#ffe080'; x.fillRect(cx0 - 2, 4, 1, 8); }
    return c;
  });

  return T;
}

/* ---------------- 背景装饰（程序化） ---------------- */
function drawCloud(ctx, x, y) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 6, y, 20, 6);
  ctx.fillRect(x, y + 4, 34, 8);
  ctx.fillRect(x + 10, y - 4, 14, 6);
  ctx.fillStyle = '#d8e8ff';
  ctx.fillRect(x, y + 10, 34, 2);
}
function drawBush(ctx, x, y, t) {
  ctx.fillStyle = t.hill;
  ctx.fillRect(x + 4, y - 6, 40, 6);
  ctx.fillRect(x + 12, y - 12, 24, 8);
  ctx.fillRect(x - 4, y - 2, 56, 2);
  ctx.fillStyle = t.hillDark;
  ctx.fillRect(x - 4, y, 56, 2);
}
function drawHill(ctx, x, y, big, t) {
  const h = big ? 40 : 24, w = big ? 80 : 48;
  ctx.fillStyle = t.hill;
  for (let i = 0; i < h; i++) {
    const ww = Math.round(w * (i + 1) / h);
    ctx.fillRect(x + (w - ww) / 2, y - i - 1, ww, 1);
  }
  ctx.fillStyle = t.hillDark;
  ctx.fillRect(x + w / 2 - 2, y - h + 4, 2, 2);
  ctx.fillRect(x + w / 2 - 8, y - h + 12, 2, 2);
  ctx.fillRect(x + w / 2 + 6, y - h + 14, 2, 2);
  ctx.fillRect(x + w / 2 - 14, y - 8, 2, 2);
  ctx.fillRect(x + w / 2 + 12, y - 6, 2, 2);
}
/* 城堡（终点装饰，5x5 图块大小） */
function drawCastle(ctx, x, groundY, t) {
  const cM = t.castleMain, cD = t.castleDark;
  const W = 80, baseH = 32;
  const by = groundY - baseH;      // 主体顶
  ctx.fillStyle = cM;
  ctx.fillRect(x, by, W, baseH);
  // 主体砖缝
  ctx.fillStyle = cD;
  for (let yy = by; yy < groundY; yy += 4) ctx.fillRect(x, yy, W, 1);
  for (let xx = x; xx < x + W; xx += 8) ctx.fillRect(xx, by, 1, baseH);
  // 城垛
  for (let i = 0; i < 5; i++) { ctx.fillStyle = cM; ctx.fillRect(x + i * 16, by - 6, 8, 6); }
  // 中央塔
  const tw = 48, tx = x + (W - tw) / 2, ty = by - 26;
  ctx.fillStyle = cM; ctx.fillRect(tx, ty, tw, 26);
  ctx.fillStyle = cD;
  for (let yy = ty; yy < by; yy += 4) ctx.fillRect(tx, yy, tw, 1);
  for (let i = 0; i < 3; i++) { ctx.fillStyle = cM; ctx.fillRect(tx + i * 16, ty - 6, 8, 6); }
  // 门与窗
  ctx.fillStyle = '#000';
  ctx.fillRect(x + W / 2 - 8, groundY - 22, 16, 22);
  ctx.fillRect(x + W / 2 - 6, groundY - 26, 12, 6);
  ctx.fillRect(tx + 6, ty + 6, 8, 8);
  ctx.fillRect(tx + tw - 14, ty + 6, 8, 8);
}

/* ---------------- 精灵实例化 ---------------- */
function buildSprites() {
  const S = { small: {}, big: {} };
  for (const k of ['idle', 'walk1', 'walk2', 'jump', 'die'])
    S.small[k] = makeSprite(HERO_SMALL[k]);
  for (const k of ['idle', 'walk1', 'walk2', 'jump'])
    S.big[k] = makeSprite(HERO_BIG[k]);
  S.walker = SPR.walker.map(makeSprite);
  S.turtle = SPR.turtle.map(makeSprite);
  S.shell = makeSprite(SPR.shell);
  S.mush = makeSprite(SPR.mush);
  S.flagCloth = makeSprite(SPR.flagCloth);
  S.tiles = {
    over: makeTiles(THEMES.over),
    cave: makeTiles(THEMES.cave),
    night: makeTiles(THEMES.night),
    castle: makeTiles(THEMES.castle)
  };
  return S;
}
