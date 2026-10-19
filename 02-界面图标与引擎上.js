// ===== src/state.js =====
// 游戏状态：新建、校验（存档反序列化）




const SAVE_VERSION = 2;
const STYLES = ['random', 'funny', 'work', 'romance', 'classical'];
const STYLE_NAMES = { random: '随机混合', funny: '搞笑人生', work: '现实职场', romance: '恋爱养成', classical: '古风人生' };
const BOND_KEYS = ['family', 'friends', 'lover', 'pet', 'child'];
const BOND_NAMES = { family: '家人', friends: '朋友', lover: '爱人', pet: '宠物', child: '子女' };

/* patch41：成长边际递减——属性越高，同样的行为涨得越少。
   没有它的话，一年一选模式（73 回合）会把关系/技能直接刷到 100
   （实测关系中位 90.6、长期高位率 96%）。带模式系数，越细的粒度收得越紧。 */
function growthScale(value) {
  if (value >= 95) return 0.01;
  if (value >= 90) return 0.05;
  if (value >= 80) return 0.15;
  if (value >= 70) return 0.28;
  if (value >= 60) return 0.45;
  if (value >= 50) return 0.68;
  if (value >= 40) return 0.85;
  return 1;
}

function createNewGame({ name, traitIds, style, seed, startYear, gender, timeMode, legacy } = {}) {
  // patch33：保险——没满 5 个就补满（startGame 已经补过一次，这里兜底）
  // patch166：空数组不再 fallback 到乐天派——fillTraitsToFive 会随机补满 5 个
  const ids = fillTraitsToFive(Array.isArray(traitIds) ? traitIds : []).ids;
  const traits = ids.map(id => TRAIT_BY_ID[id]).filter(Boolean);
  // 合并所有特质的 mods 和 start（与逐年结算共用同一份实现）
  const mods = mergeTraitMods(traits);
  const start = mergeTraitStart(traits);
  // patch132：初始金钱 0 → 12000。原来 0 配上随机补入的「穷人家的孩子」(-10000)，
  // 会开局直接 -10000，导致 88-99% 的局出现负债。
  const attrs = { health: 85, mood: 80, money: 12000, relations: 35, skill: 5 };
  for (const k of Object.keys(start)) {
    attrs[k] = k === 'money' ? attrs[k] + start[k] : clamp(attrs[k] + start[k], 0, 100);
  }
  // patch32：上一世的回响——小幅加成 + 记录，不是平衡性大改
  let legacyBonus = null;
  if (legacy && typeof legacy === 'object' && legacy.endingName) {
    const grew = Math.max(0, Math.min(6, Math.round((legacy.skill || 0) / 16)));        // 上世技能高 → 本世起步快
    const warm = Math.max(0, Math.min(5, Math.round((legacy.relations || 0) / 20)));     // 上世人缘好 → 本世关系底子好
    attrs.skill = clamp(attrs.skill + grew, 0, 100);
    attrs.relations = clamp(attrs.relations + warm, 0, 100);
    if (legacy.xianxia) attrs.mood = clamp(attrs.mood + 3, 0, 100);                      // 修过道的人，心比较定
    if (legacy.hasChild) attrs.mood = clamp(attrs.mood + 2, 0, 100);                     // 养过孩子的人，耐心多一点
    const bits = [];
    if (grew) bits.push('技能起步 +' + grew);
    if (warm) bits.push('关系底子 +' + warm);
    legacyBonus = { skill: grew, relations: warm, from: String(legacy.name || '上一世'), summary: bits.join('、') || '只是记得' };
  }
  const g = gender === 'female' || gender === 'male' ? gender : (Math.random() < 0.5 ? 'male' : 'female');
  return {
    version: SAVE_VERSION,
    seed: (seed >>> 0) || 1,
    rngState: 0,
    // patch26：这一局的时间节奏（node / three / year）
    timeMode: TIMELINES[timeMode] ? timeMode : DEFAULT_TIME_MODE,
    // patch32：上一世的记录与回响
    legacy: legacy || null,
    legacyBonus: legacyBonus,
    style: STYLES.includes(style) ? style : 'random',
    name: String(name || '').trim().slice(0, 12) || '旅人',
    gender: g,
    traitIds: ids,
    traitId: ids[0], // 兼容旧代码
    age: 0,
    year: Number.isFinite(startYear) ? startYear : new Date().getFullYear(),
    phase: 'year',
    paused: false,
    attrs,
    bonds: { family: 90, friends: 0, lover: 0, pet: 0, child: 0 },
    counts: {},
    streak: { action: null, n: 0 },
    flags: {},
    eventLog: {},
    weatherHistory: [],
    journal: [],
    pending: { weatherId: 'sunny', eventId: null, choice: null, actionId: null },
    lastReport: null,
    ending: null,
    died: false,
    deathCause: null,
    cultivationLevel: 0,
    perks: {},
    achievements: {},
  };
}

const num = (v, d) => (Number.isFinite(v) ? v : d);
const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});

/** 存档校验与修复：任何异常都尽量修复成可玩状态，修不了就整体拒绝 */
function sanitizeSave(raw) {
  if (!raw || typeof raw !== 'object') return { ok: false, reason: '存档内容不是有效数据' };
  if (raw.version !== SAVE_VERSION) return { ok: false, reason: '存档版本不受支持' };

  const a = obj(raw.attrs);
  const b = obj(raw.bonds);
  const c = obj(raw.counts);
  const counts = {};
  for (const act of Object.keys(ACTION_BY_ID)) counts[act] = Math.max(0, Math.round(num(c[act], 0)));

  const pendingRaw = obj(raw.pending);
  const journal = Array.isArray(raw.journal)
    ? raw.journal.filter((j) => j && typeof j === 'object').slice(-400)
    : [];

  const state = {
    version: SAVE_VERSION,
    seed: num(raw.seed, 1) >>> 0,
    rngState: num(raw.rngState, 0) >>> 0,
    style: STYLES.includes(raw.style) ? raw.style : 'random',
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim().slice(0, 12) : '旅人',
    traitId: TRAIT_BY_ID[raw.traitId] ? raw.traitId : DEFAULT_TRAIT_ID,
    age: clamp(Math.round(num(raw.age, 0)), 0, 800),
    year: clamp(Math.round(num(raw.year, 2026)), 1900, 2400),
    phase: ['year', 'settle', 'end'].includes(raw.phase) ? raw.phase : 'year',
    paused: !!raw.paused,
    gender: raw.gender === 'female' || raw.gender === 'male' ? raw.gender : 'male',
    attrs: {
      health: clamp(num(a.health, 50), 0, 100),
      mood: clamp(num(a.mood, 50), 0, 100),
      money: clamp(num(a.money, 0), -30000, 99999999),
      relations: clamp(num(a.relations, 40), 0, 100),
      skill: clamp(num(a.skill, 20), 0, 100),
    },
    bonds: {
      family: clamp(num(b.family, 70), 0, 100),
      friends: clamp(num(b.friends, 30), 0, 100),
      lover: clamp(num(b.lover, 0), 0, 100),
      pet: clamp(num(b.pet, 0), 0, 100),
      child: clamp(num(b.child, 0), 0, 100),
    },
    counts,
    streak: {
      action: ACTION_BY_ID[obj(raw.streak).action] ? obj(raw.streak).action : null,
      n: Math.max(0, Math.round(num(obj(raw.streak).n, 0))),
    },
    flags: obj(raw.flags),
    perks: obj(raw.perks),
    achievements: obj(raw.achievements),
    eventLog: obj(raw.eventLog),
    weatherHistory: Array.isArray(raw.weatherHistory) ? raw.weatherHistory.slice(-400) : [],
    journal,
    pending: {
      weatherId: WEATHER_BY_ID[pendingRaw.weatherId] ? pendingRaw.weatherId : 'sunny',
      eventId: typeof pendingRaw.eventId === 'string' ? pendingRaw.eventId : null,
      choice: Number.isInteger(pendingRaw.choice) ? pendingRaw.choice : null,
      actionId: ACTION_BY_ID[pendingRaw.actionId] ? pendingRaw.actionId : null,
    },
    lastReport: raw.lastReport && typeof raw.lastReport === 'object' ? raw.lastReport : null,
    ending: raw.ending && typeof raw.ending === 'object' ? raw.ending : null,
  };

  if (state.phase === 'settle' && !state.lastReport) state.phase = 'year';
  if (state.phase === 'end' && !state.ending) state.phase = 'year';
  return { ok: true, state };
}

const TRAIT_LIST = TRAITS;

// ===== src/storage.js =====
// localStorage 存档读写（带校验）

const KEY = 'life-weather-save-v1';

/* ================= 「上一世」的记录（patch32）=================
   单独存一个 key，不动原有存档结构——旧存档照样能读。
   记的是「上一世是怎么过的」，下一世开局时给一点回响。 */
const LEGACY_KEY = 'lifeweather:legacy:v1';

function readLegacy() {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== 'object') return null;
    if (!obj.name || !obj.endingName) return null;
    return obj;
  } catch { return null; }
}

function writeLegacy(rec) {
  try { localStorage.setItem(LEGACY_KEY, JSON.stringify(rec)); return true; }
  catch { return false; }
}

function clearLegacy() {
  try { localStorage.removeItem(LEGACY_KEY); } catch { /* 忽略 */ }
}

/** 从这一世的结局与状态里，提炼出「上一世」的记录 */
function buildLegacyRecord(state, ending) {
  const ach = (ending && ending.achievements) || [];
  const tags = (ending && ending.tags) || [];
  return {
    v: 1,
    name: String(state.name || '旅人'),
    endingName: String((ending && ending.name) || ''),
    styleName: String((ending && ending.styleName) || ''),
    years: (ending && ending.yearsLived) || state.age || 0,
    achievements: ach.length,
    achSample: ach.slice(0, 5).map((a) => a.name),
    tags: tags.slice(0, 4),
    // 用来算「上一世是什么人」的几个关键事实
    xianxia: !!state.flags.xianxia,
    hasChild: !!state.flags.hasChild,
    hasHouse: !!state.flags.hasHouse,
    promoted: !!state.flags.promoted,
    married: !!state.flags.married,
    skill: Math.round(state.attrs.skill || 0),
    relations: Math.round(state.attrs.relations || 0),
  };
}

function readSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ok: true, state: null };
    let parsed;
    try { parsed = JSON.parse(raw); } catch { return { ok: false, reason: '存档不是合法的 JSON' }; }
    return sanitizeSave(parsed);
  } catch (err) {
    return { ok: false, reason: '无法读取浏览器本地存储（可能处于隐私模式）' };
  }
}

function writeSave(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    return false;
  }
}

function clearSave() {
  try { localStorage.removeItem(KEY); } catch { /* 忽略 */ }
}

const SAVE_KEY = KEY;

// ===== src/ui/dom.js =====
// 极简 DOM 助手
function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of children.flat(Infinity)) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return el;
}

const clear = (node) => { while (node.firstChild) node.removeChild(node.firstChild); };

const deltaText = (v) => (v > 0 ? `+${v}` : `${v}`);

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ===== src/ui/icons.js =====
// 统一线性图标（内联 SVG，无外部依赖）
const S = (body, extra = '') =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${body}</svg>`;

const ICONS = {
  heart: S('<path d="M12 20s-7-4.6-7-9.6A3.9 3.9 0 0 1 12 7.4 3.9 3.9 0 0 1 19 10.4C19 15.4 12 20 12 20z"/>'),
  smile: S('<circle cx="12" cy="12" r="8.2"/><path d="M8.8 14.6c.9 1 2 1.5 3.2 1.5s2.3-.5 3.2-1.5"/><path d="M9.3 9.8h.01M14.7 9.8h.01"/>'),
  coin: S('<circle cx="12" cy="12" r="8.2"/><path d="M12 7.5v9M9.6 10.2h3.6a1.7 1.7 0 0 1 0 3.4h-2.4a1.7 1.7 0 0 0 0 3.4h3.6"/>'),
  people: S('<circle cx="9.2" cy="9" r="3.1"/><path d="M3.6 19.2c0-3.1 2.5-5.2 5.6-5.2s5.6 2.1 5.6 5.2"/><circle cx="17.2" cy="10.2" r="2.4"/><path d="M15.6 14.4c2.6.3 4.6 2.2 4.6 4.6"/>'),
  star: S('<path d="M12 3.8l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4L4.2 9.5l5.4-.8z"/>'),
  sun: S('<circle cx="12" cy="12" r="4.2"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7"/>'),
  cloud: S('<path d="M7 18.2h10.2a3.6 3.6 0 0 0 .4-7.2A5.2 5.2 0 0 0 7.5 9.6 4.1 4.1 0 0 0 7 18.2z"/>'),
  rain: S('<path d="M7 14.6h10.2a3.6 3.6 0 0 0 .4-7.2A5.2 5.2 0 0 0 7.5 6 4.1 4.1 0 0 0 7 14.6z"/><path d="M9 17.4l-.9 2.2M13 17.4l-.9 2.2M17 17.4l-.9 2.2"/>'),
  storm: S('<path d="M7 13.6h10.2a3.6 3.6 0 0 0 .4-7.2A5.2 5.2 0 0 0 7.5 5 4.1 4.1 0 0 0 7 13.6z"/><path d="M12.6 15.4l-2.4 3.2h3.2l-2.2 3"/>'),
  fog: S('<path d="M6.4 8h11a3 3 0 0 0 .2-6A4.6 4.6 0 0 0 7 4.4 3.6 3.6 0 0 0 6.4 8z"/><path d="M4 13h15M6 17h12"/>'),
  snow: S('<path d="M7 14h10.2a3.6 3.6 0 0 0 .4-7.2A5.2 5.2 0 0 0 7.5 5.4 4.1 4.1 0 0 0 7 14z"/><path d="M9 17v2.4M13 17v2.4M17 17v2.4"/>'),
  wind: S('<path d="M3.6 9h9.2a2.9 2.9 0 1 0-2.9-2.9M3.6 14.4h11.8a2.9 2.9 0 1 1-2.9 2.9"/>'),
  rainbow: S('<path d="M3.6 16.4a8.4 8.4 0 0 1 16.8 0"/><path d="M7.2 16.4a4.8 4.8 0 0 1 9.6 0"/><path d="M4.4 19.6h15.2"/>'),
  dusk: S('<path d="M3.4 17.6h17.2"/><path d="M7 17.6a5 5 0 0 1 10 0"/><path d="M12 4.6v4.6M8.6 8.2l3.4-3.6M15.4 8.2L12 4.6"/>'),
  briefcase: S('<rect x="3.4" y="7.6" width="17.2" height="11.4" rx="2.2"/><path d="M9 7.6V6.2A1.6 1.6 0 0 1 10.6 4.6h2.8A1.6 1.6 0 0 1 15 6.2v1.4M3.4 12.4h17.2"/>'),
  book: S('<path d="M4.6 5.4A1.6 1.6 0 0 1 6.2 3.8H19.4v13.2H6.2a1.6 1.6 0 0 0-1.6 1.6z"/><path d="M4.6 18.6V5.4M8.6 8h6.4M8.6 11.4h4.4"/>'),
  cup: S('<path d="M5 8.4h11v4.8a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M16 9.4h1.8a2.4 2.4 0 0 1 0 4.8H16"/><path d="M6.4 5.6c.8-.9.8-1.7 0-2.6M10 5.6c.8-.9.8-1.7 0-2.6"/>'),
  palette: S('<path d="M12 3.8a8.2 8.2 0 1 0 0 16.4c1.5 0 2.1-1 2.1-2.1s-.9-2.1-.9-3.1c0-1.3 1-2.2 2.5-2.2h1.4a3.1 3.1 0 0 0 3.1-3.1c0-3.2-3.6-5.9-8.2-5.9z"/><circle cx="8.4" cy="10" r="1.1"/><circle cx="12" cy="7.4" r="1.1"/>'),
  note: S('<path d="M5.4 3.8h9.2l4 4v12.4H5.4z"/><path d="M14.6 3.8v4h4M8.6 12h6.8M8.6 15.4h4.8"/>'),
  calendar: S('<rect x="3.6" y="5.4" width="16.8" height="15" rx="2.2"/><path d="M3.6 10h16.8M8.4 3.4v3.6M15.6 3.4v3.6"/>'),
  pause: S('<path d="M9 5.6v12.8M15 5.6v12.8"/>'),
  play: S('<path d="M8.4 5.4l10 6.6-10 6.6z"/>'),
  refresh: S('<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4.4v4.2h-4.2"/>'),
  help: S('<circle cx="12" cy="12" r="8.4"/><path d="M9.6 9.6a2.4 2.4 0 1 1 3.6 2.2c-.8.5-1.2 1-1.2 2"/><path d="M12 17.2h.01"/>'),
  close: S('<path d="M6 6l12 12M18 6L6 18"/>'),
  check: S('<path d="M4.6 12.6l4.6 4.6 9.8-10"/>'),
  arrow: S('<path d="M4.6 12h14M13 6.6l5.6 5.4-5.6 5.4"/>'),
  cloudSun: S('<circle cx="9" cy="9" r="3.4"/><path d="M9 2.6v1.8M3.8 9H2M4.6 4.6l1.3 1.3M13.4 4.6l-1.3 1.3"/><path d="M8.6 19.6h9a3.4 3.4 0 0 0 .4-6.8A5 5 0 0 0 9 11.4 4 4 0 0 0 8.6 19.6z"/>'),
  umbrella: S('<path d="M12 4.4a8 8 0 0 1 8 8H4a8 8 0 0 1 8-8z"/><path d="M12 12.4v5.2a2 2 0 0 0 4 0"/>'),
  sparkle: S('<path d="M12 3.6l1.8 4.6 4.6 1.8-4.6 1.8L12 16.4l-1.8-4.6-4.6-1.8 4.6-1.8z"/>'),
  stamp: S('<path d="M9.4 3.8h5.2v3.4H9.4z"/><path d="M8 7.2h8l1.6 4.4a3.4 3.4 0 0 1-6.4 1.6 3.4 3.4 0 0 1-6.4-1.6z"/><path d="M5.4 15.6h13.2v4.6H5.4z"/>'),
};

function icon(name, cls = '') {
  const body = ICONS[name] || ICONS.sparkle;
  return cls ? body.replace('<svg ', `<svg class="${cls}" `) : body;
}

// ===== src/engine.js =====
// 年度结算引擎：纯数据 + 可控随机数，可在 Node 中直接测试。

/* ===== patch82：UI 背景图（内嵌 base64） =====
   玩家要求按参考图重做 UI：大背景用图一、文本框用图二。
   图片压缩到 440px 宽 / q45，两张合计 base64 仅 33KB——
   因为豆包 CDN 不允许多文件（会 403），所以必须内嵌，不能引用外部图片。 */
/* ===== patch87：分享卡古风背景图（纸纹 + 压花，内嵌 base64） ===== */
const BG_CARD2_URI = 'data:image/jpeg;base64,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';
const BG_MAIN_URI = 'data:image/jpeg;base64,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';
const BG_CARD_URI = 'data:image/jpeg;base64,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';








/* ===== 一次决策管几年（patch12） =====
   玩家反馈「一年一选太慢，要点好多次」——一个 80 年的人生要按 80 多次，
   而现实中「学生阶段三四年只需要学习、工作了几年才换一次工作」。
   所以回合改成 5 年：一次决策覆盖 5 年，总决策数从 ~80 次降到 ~16 次。
   想回到一年一选，把这个数改成 1 即可（其余逻辑都会自动退化）。 */
/* ===== 时间轴：按人生节点分配（patch20） =====
   玩家反馈：不一定要严格的五年一次，在升学/工作/结婚/退休这些节点上可以多加时间阶段，
   总量维持在 20 左右即可。
   为什么必须改：固定 5 年时年龄只会走 6/11/16/21/26…，17/18/19 根本不存在，
   于是「高考」（窗口 16-17）这类节点永远命中不了——上一轮实测触发 0 次。
   下面这张表是显式的年龄节点：平稳期跨度大、节点处跨度小。
   实测 23 个回合，关键节点 100% 落在各自窗口内。 */
const TIMELINES = {
  // 按节点分配：升学/工作/结婚/退休处加密，平稳期放大（默认）
  // patch55：改成「五年一选 + 重要节点单独抽出」。
  // 底子是 5 年网格（0/5/10…），关键节点从格子里抽出来单独成档，
  // 这样中考(14)、高考(17)、成家期(22/25/28)、退休(60/63) 不会被 5 年跨度淹没。
  // patch56：patch55 的 21 档太紧——实测结婚只 8.4%、有孩子/买房/升职全 0%
  // （婚育链要「恋爱→求婚→结婚→备孕→出生」4~5 个回合，21 档排不下）。
  // 在日常 5 年一格的底子上，把关键节点抽出来单独成档。
  // patch57：日常 5 年一格；**22-36 岁（成家期）按 2 年一档单独抽出**，
  // 因为「恋爱→求婚→结婚→备孕→出生」要 4-5 个回合，稀疏档位排不下
  // （patch56 的 23 档下结婚率仍只 7.5%）。
  node: [
    0, 5, 10,                     // 童年（5 年一格）
    14, 17,                       // ★ 中考 14、高考 17
    18, 20,                       // ★ 成年 / 大学
    22, 24, 26, 28, 30,           // ★ 成家期（2 年一档：恋爱、求婚、生育）
    32, 34, 36,                   // ★ 事业与养育（2 年一档）
    39, 42, 45, 48,               // 中年（3 年一档）
    52, 56,                       // ★ 中年后段（父母老去）
    60, 63,                       // ★ 退休前后
    66, 70, 75, 80,               // 晚年（5 年一格）
  ],
  // 三年一段：更均匀，节点感弱一些
  three: [
    0, 3, 6, 9, 12, 15, 17, 20, 23, 26, 29, 32, 35, 38, 41, 44, 47, 50, 53, 56,
    59, 62, 65, 68, 71, 74,
  ],
  // 一年一年：每一岁都是独立一页（最细）
  year: (function () { var a = []; for (var i = 0; i <= 80; i++) a.push(i); return a; })(),
};
// patch165：玩家要求「按人生节点」改成「五年一段」（只改文字，不改内容）
const TIME_MODE_NAMES = { node: '五年一段', three: '三年一段', year: '一年一年' };
const TIME_MODE_DESC = {
  node: '升学、工作、结婚、退休处加密，平稳期跨度大',
  three: '每三年一页，节奏均匀',
  year: '每一岁都是一页，最细（决策次数最多）',
};
const DEFAULT_TIME_MODE = 'node';
const TIMELINE = TIMELINES[DEFAULT_TIME_MODE];   // 保留旧名字，兼容已有引用
/** 取某个模式的时间表（非法值回落到默认） */
function timelineOf(mode) { return TIMELINES[mode] || TIMELINES[DEFAULT_TIME_MODE]; }
/** 当前年龄 → 下一步走几年（按这一局选的时间模式查表）
 *  draft 可以是一个游戏状态（含 timeMode），也可以直接传模式字符串。 */
function pickSpan(age, draft) {
  const mode = (typeof draft === 'string') ? draft : (draft && draft.timeMode);
  const tl = timelineOf(mode);
  let idx = tl.indexOf(age);
  if (idx < 0) {
    // 兜底：不是表上的年龄（例如存档来自别的模式），往下找最近的节点
    for (let i = tl.length - 1; i >= 0; i--) if (tl[i] <= age) { idx = i; break; }
    if (idx < 0) idx = 0;
  }
  const next = tl[idx + 1];
  return next != null ? Math.max(1, next - tl[idx]) : 10;
}
const YEAR_SPAN = 5;   // 保留这个名字给旧代码引用（部分地方仍按"一步大约几年"估算）
/* 5 年一跳会跳过去的关键年龄。跨过这些点时补上属于那一年的东西（退休金最明显）。 */
const KEY_AGES = [18, 22, 60, 65, 75];

// patch88：负债下限 -30000 → -10000。玩家反馈「27 岁负债三万」，
  // 主要原因是无门槛的大额支出，但把地板也收紧一点，避免出现「欠三万」这种极端数字。
  const MONEY_FLOOR = -10000;
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function traitOf(state) { return TRAIT_BY_ID[state.traitId] || TRAIT_BY_ID.optimist; }

const fmtInt = (n) => (n >= 0 ? '+' : '') + Math.round(n);
const fmtDelta = (n) => fmtInt(n);
function fmtMoney(n) { return Math.round(n).toLocaleString('zh-CN'); }

/* ===== P0-4 数值显示开关（patch9） =====
   玩家反馈：「后面我看随机事件都是一样的，其实就没怎么注意内容，只专注加的属性多少去了」。
   结算文案里那些 (${fmtDelta(...)}) 与「工资到账：48,200 元」把一局游戏变成了数值优化，
   而难度感受恰恰来自「算不清」。所以默认收紧：把年结算里的精确增减换成模糊说法；
   顶栏那个「数值」按钮可以随时切回精确显示。
   注意只动「给人看的文案」——attr() 记进 deltas 的仍是原始数值，界面数值栏、成就判定、
   结局匹配统统不受影响。 */
let SHOW_EXACT_NUMBERS = false;
function setShowExactNumbers(on) {
  SHOW_EXACT_NUMBERS = !!on;
  if (typeof globalThis !== 'undefined') globalThis.__SHOW_EXACT__ = SHOW_EXACT_NUMBERS;
  return SHOW_EXACT_NUMBERS;
}
// 挂一份到 globalThis：界面段（src/main.js 之后）要读它来切换按钮文案，
// 而 core 段的 let 不保证跨段可见（打包器可能把 core 包在闭包里）。
if (typeof globalThis !== 'undefined') globalThis.__SHOW_EXACT__ = false;
function exactNumbersOn() {
  return typeof globalThis !== 'undefined' && globalThis.__SHOW_EXACT__ != null
    ? !!globalThis.__SHOW_EXACT__ : SHOW_EXACT_NUMBERS;
}
function loosenNumbers(s, opts) {
  // patch67：费用类文案（学费/生活费/退休金/房租…）**不再掩码**——
  // 玩家要求「每段结算和总结算的时候这些费用就不用屏蔽了」。
  // 其它数值（属性增减、百分比）仍按原样收紧。
  const keepMoney = !!(opts && opts.keepMoney);
  return String(s == null ? '' : s)
    // 1) attr() 自己拼的括号增减（+4.2 / -1.5）：整块去掉，句子本身已经说清了
    .replace(/\s*[（(]\s*[+-]\d+(?:\.\d+)?\s*[)）]/g, '')
    // 2) 百分比：数值掩掉，百分号留着（换档后还算「有点进步」而不是「一点没动」）
    .replace(/\d+(?:\.\d+)?\s*%/g, '**%')
    // 3) 金额：数字掩成星号，「元」留着，句子的结构不被破坏
    .replace(/[¥￥]\s*[\d,]{3,}(?:\.\d+)?/g, function (m0) { return keepMoney ? m0 : '￥****'; })
    .replace(/[\d,]{3,}(?:\.\d+)?\s*元/g, function (m0) { return keepMoney ? m0 : '**** 元'; })
    // 4) 事件文案里写死的属性数字
    .replace(/技能\s*\d+(?:\.\d+)?/g, '技能**')
    .replace(/人脉\s*\d+(?:\.\d+)?/g, '人脉**')
    .replace(/关系\s*\d+(?:\.\d+)?/g, '关系**')
    .replace(/心情\s*\d+(?:\.\d+)?/g, '心情**')
    .replace(/健康\s*\d+(?:\.\d+)?/g, '健康**')
    .replace(/第\s*\d+\s*层/g, '第*层')
    .replace(/修为\s*\d+(?:\.\d+)?\s*层/g, '修为** 层')
    // 5) 收尾：孤立的空括号、冒号后紧跟标点、行尾空白
    .replace(/[（(]\s*[)）]/g, '')
    .replace(/：\s*[，。]/g, '：')
    .replace(/[，、]\s*[，。]/g, '，')
    .replace(/\s+$/g, '');
}

/* ---------------- 抽天气 / 抽事件 ---------------- */
function pickWeather(state, rng) {
  const last = state.pending && state.pending.weatherId;
  const w = weightedPick(rng, WEATHERS, (it) => it.weight * (it.id === last ? 0.45 : 1));
  return w.id;
}

/* patch93：入道之后「凡尘」全部关闭——这是重设计的核心，
   不是少做几件事，而是换一条人生轨道。
   关闭：工作线、婚恋线、以及属于凡人生活的具体事（房、车、育儿、中年危机）。 */
const MORTAL_BANNED_IDS = {
  buy_house: 1, rl_house: 1, buy_car: 1, middle_crisis: 1, rl_startup: 1, rl_kid_school: 1,
  propose: 1, cr_marry_simple: 1, cr_propose: 1, cr_met_at: 1, cr_blind_date: 1,
  have_baby: 1, baby_born: 1, trying_baby: 1,
};
/* patch130：**改成白名单制**——只要不是修仙相关的事件，一律算「凡尘事」。
   原来只排除 work/romance + 少量 id，导致「台风天囤零食」「拆迁补偿」「通勤事故」
   这类 cat=life 的事件在修仙者身上照常出现。 */
const XIAN_EVENT_RE = /^(xs_|x_|rx_|immortal|xian_|x_root_)/;
function isMortalLife(e) {
  if (!e) return false;
  if (e.id === 'generic_quiet') return false;          // 兜底事件保留
  if (e.id === 'meet_old_man') return false;           // 入道事件本身
  if (e.cat === 'xian') return false;                  // 修仙专属
  if (XIAN_EVENT_RE.test(e.id)) return false;          // xs_/x_/rx_/immortal 等
  return true;                                          // 其余全是凡尘事
}
function availableEvents(state) {
  const a = state.age;
  // patch130：**只要修仙就关凡尘**（不只是 abandonedMortal）——
  // 作弊菜单「自选灵根」只设了 xianxia，之前就漏过了这层过滤。
  const _abandon = !!(state.flags && (state.flags.abandonedMortal || state.flags.xianxia));
  // patch119：**每个事件一生最多出现 2 次**（玩家要求「同一生不得出现两次以上」）
  const _cnt = (state.eventCount || {});
  // patch127：**上一回合刚发生的事件，这一回合不再出现**（不连着来）
  const _last = state.lastEventId || null;
  return EVENTS.filter((e) => {
    if (_last && e.id === _last) return false;
    // patch122：**排除权重 ≤ 0 的兜底事件**——它只该在池空时由兜底逻辑塞进来，
    // 不该参与正常抽取（否则会反复出现，破坏「一生最多 2 次」）
    if (!(typeof e.weight === 'number' ? e.weight : 10) || e.id === 'generic_quiet') return false;
    // patch128：上限用事件的 maxTimes（默认 2）——求婚类设成 5
    if ((_cnt[e.id] || 0) >= (e.maxTimes != null ? e.maxTimes : 2)) return false;
    if (_abandon && isMortalLife(e)) return false;
    if (e.minAge && a < e.minAge) return false;
    if (e.maxAge && a > e.maxAge) return false;
    // patch54：考试事件加**硬性年龄闸**。
    // 原来只靠 minAge/maxAge 与 resolveYear 里的兜底，但兜底晚于事件选择，
    // 一旦修仙闭关把年龄从 16 跳到 26，高考就会被排到 26 岁（玩家实测见过 27 岁高考冲刺）。
    const id = e.id;
    if (id === 'zhongkao' || id === 'zhongkao_exam') { if (a < 14 || a > 17) return false; }
    if (id === 'gaokao' || id === 'gaokao_exam' || id === 'gaokao_sprint' || id === 'gaokao_fail') {
      if (a < 17 || a > 20) return false;
    }
    return !e.cond || e.cond(state);
  });
}

/* patch45：粗粒度模式（按节点 / 三年一段）的回合少、候选位少，
   职业与婚恋这两条「线」会被大量低权重事件挤掉（实测升职 200 局只被选中 5 次）。
   这里按模式给它们加成——一年一选席位充足，不需要。 */
function lineBoost(e, state) {
  if (!e) return 1;
  // patch95：**修仙者的修仙事件（classical）给 2 倍加成**。
  // 实测 210 局修仙成功，但 12 个都市修仙事件只命中 4 个——它们全被普通生活事件挤掉。
  // 只对修仙者生效，不影响「古风人生」那条线。
  // patch97：修仙事件改成独立类别 'xian'，避免和「古风人生」的 classical 混在一起
  if (state && state.flags && state.flags.xianxia && e.cat === 'xian') return 2.0;
  const coarse = state && (state.timeMode === 'node' || state.timeMode === 'three');
  if (!coarse) return 1;
  // patch46：2.2/1.8 把别的类别挤掉了（都市修仙只触发 1/12），收回一档
  if (e.cat === 'work') return 1.45;     // 求职、升职、裁员……
  if (e.cat === 'romance') return 1.35;  // 恋爱、结婚、生育
  return 1;
}

function pickEvent(state, rng, poolOverride) {
  const pool = poolOverride || availableEvents(state);
  if (!pool.length) return null;
  // 剧情里程碑（force）：条件满足且从未触发过时，强制优先，保证人生主线不断链
  // patch128：force 默认只出现 1 次；声明了 maxTimes（如求婚 5 次）就按次数判断
  const _fc2 = state.eventCount || {};
  const forced = pool.filter((e) => {
    if (!e.force) return false;
    const _max = e.maxTimes != null ? e.maxTimes : 1;
    return (_fc2[e.id] || 0) < _max;
  });
  if (forced.length) return forced[rng.int(0, forced.length - 1)].id;
  const style = state.style;
  const isXianxia = !!(state.flags && state.flags.xianxia);
  const ev = weightedPick(rng, pool, (e) => {
    let base = typeof e.weight === 'function' ? e.weight(state) : (e.weight || 10);
    // patch45：粗粒度模式给职业/婚恋加成
    base *= lineBoost(e, state);
    if (style && style !== 'random' && e.cat === style) base *= 3.2;
    // patch14/17/18：恋爱线加权（玩家反馈「恋爱事件多一些」）。
    // 每加一层机制分母都会变大，所以逐轮补：1.6 → 1.8 → 2.2。
    if (e.cat === 'romance') base *= 2.2;
    // 修仙者：修仙事件权重×5，普通事件权重×0.2
    if (isXianxia) {
      // patch98：加上 cat:'xian' 与 id 前缀 'xs_'。
      // 原来只认 classical / 'x_'，而 'xs_'.startsWith('x_') 是 false，
      // 导致新加的修仙事件被当成普通事件 ×0.6 反被降权。
      if (e.cat === 'classical' || e.cat === 'xian' || e.id.startsWith('x_') || e.id.startsWith('xs_')) base *= 2;
      else base *= 0.6;
    }
    const last = state.eventLog[e.id];
    if (!e.noCooldown && typeof last === 'number') {
      const gap = state.year - last;
      if (gap < 4) base *= 0.06;
      else if (gap < 8) base *= 0.35;
    }
    // P0-2（patch9）：最近 3 次抽到过的事件再压一档，专治「翻来覆去那几件」
    if (!e.noCooldown && state.flags && state.flags.recentEvents && state.flags.recentEvents.indexOf(e.id) >= 0) {
      base *= 0.02;
    }
    return base;
  });
  // P0-2：记下最近抽到的 3 个事件（只用于降权，不影响 eventLog 的冷却计数）
  if (ev && ev.id && state.flags) {
    const rec = state.flags.recentEvents || [];
    state.flags.recentEvents = [ev.id].concat(rec.filter((x) => x !== ev.id)).slice(0, 3);
  }
  return ev.id;
}

function beginYear(draft, rng) {
  // patch38：第一回合没有经过 advanceYear，crossedSpan 会是 undefined，
  // 导致 resolveYear 回退到常量 YEAR_SPAN，把这一步的跨度说错。
  // 这里补上：按这一局的时间表算出本回合跨度。
  if (draft.crossedSpan == null) draft.crossedSpan = pickSpan(draft.age, draft);
  // patch14：每回合给两个候选事件，玩家挑一个方向（③）
  // patch17：一回合三件事——两个候选（玩家选一个当主线）+ 一个自动发生的事件。
  //   原来每回合只经历 1 件事（一局 ~18 件），改成这样一局约 36 件，内容覆盖率翻倍。
  const cands = pickEventChoices(draft, rng);
  const autoId = pickAutoEvent(draft, rng);
  // patch120：auto 事件同样计入（它不出现在候选里，单独记）
  if (autoId) {
    draft.eventCount = draft.eventCount || {};
    draft.eventCount[autoId] = (draft.eventCount[autoId] || 0) + 1;
  }
  draft.pending = {
    weatherId: pickWeather(draft, rng),
    eventId: cands[0] || null,
    eventChoices: cands,
    autoEventId: autoId,
    choice: null,
    actionId: null,
  };
  // 自动结算：玩家控制不了的那些，不给他出选项，直接判
  draft.pending.autoPatch = autoResolve(draft, rng);
  draft.phase = 'year';
  return draft.pending;
}

/** patch14：挑两个候选事件（①优先剧情里程碑 ②其余按权重 ③两者不同类，给出真正的方向差） */
function pickEventChoices(state, rng) {
  const pool = availableEvents(state);
  // patch173：**池子空时给兜底事件，而不是空数组**
  //   原来这里直接 return []，导致下面「picked.push('generic_quiet')」的兜底永远执行不到。
  //   玩家活过 100 岁后所有事件都超了 maxAge，于是每回合都没有候选、只能一直点结算。
  if (!pool.length) return state.age >= 6 ? ['generic_quiet'] : [];
  // patch18：**所有可用的里程碑事件都摆进候选**，不再随机挑一个。
  // 原来 pickEvent 在多个 force 里随机取一个，导致「入道」和「高考」互相挤掉——
  // 玩家这一轮明确要求「修仙不影响参加高考」，这里是根本修法。
  // patch19：auto 事件一律不进候选（它们不在回合里出现，只在结算里报告）
    // patch128：同上，force 上限也认 maxTimes
    const _fc = state.eventCount || {};
    const forced = pool.filter((e) => {
      if (!e.force || e.auto) return false;
      const _max = e.maxTimes != null ? e.maxTimes : 1;
      return (_fc[e.id] || 0) < _max;
    });
  const rest = pool.filter((e) => !e.force && !e.auto);
  const picked = [];
  const push = (id) => { if (id && picked.indexOf(id) < 0) picked.push(id); };
  // patch109：**高考年强制把高考事件排到第一位**。
  // 实测它虽带 force，但候选会被 split_subjects / university_life 等里程碑挤占，
  // 玩家经常整个错过高考（自然也就看不到成绩弹窗）。
  if (!state.flags.gaokaoDone && state.age >= 17 && state.age <= 20) {
    const _gk = pool.filter((e) => e.id === 'gaokao_sprint' || e.id === 'gaokao_exam');
    for (const e of _gk) push(e.id);
  }
  // patch125：**入道事件也强制排前**。实测它总排在第 2-3 位，玩家在界面上注意不到，
  // 于是「好几次都没触发修仙线」。放在高考之后 → 高考优先，仍满足「修仙不影响高考」。
  // patch126：只推**一次**——玩家选过「不了」之后就不要再占位了
  if (!state.flags.xianxia && !state.flags.spiritRootSeen && !state.flags.refusedXian
      && !state.eventLog['meet_old_man'] && state.age >= 18 && state.age <= 20) {
    if (pool.some((e) => e.id === 'meet_old_man')) push('meet_old_man');
  }
  for (const e of forced) push(e.id);
  // patch96：**修仙者每回合至少一个修仙事件**。
  // 实测 210 局修仙成功，但 12 个修仙事件只命中 3 个——候选位只有 2 个，
  // 全被 force 里程碑和高权重日常挤掉了。这里在**没有 force 里程碑的回合**给修仙者占一个位。
  if (state.flags && state.flags.xianxia && picked.length === 0) {
    const _xianPool = pool.filter((e) => !e.force && !e.auto && (e.cat === 'xian' || e.id.startsWith('xs_')) && picked.indexOf(e.id) < 0);
    if (_xianPool.length) push(pickEvent(state, rng, _xianPool));
  }
  // 补足到至少两个候选。
  // 实测中晚年只有 1 个候选（里程碑都已触发、且补候选那一步抽到了重复/失败），
  // 所以这里用「排除已选 + 最多试三次 + 最后从全池兜底」保证一定凑够两个。
  const tryFill = (src) => {
    for (let attempt = 0; attempt < 3 && picked.length < 2; attempt++) {
      const pool2 = src.filter((e) => picked.indexOf(e.id) < 0);
      if (!pool2.length) break;
      push(pickEvent(state, rng, pool2));
    }
  };
  if (rest.length) {
    const cats = forced.map((e) => e.cat);
    const diff = rest.filter((e) => cats.indexOf(e.cat) < 0);
    // patch45：粗粒度模式下，补候选时**优先挑职业/婚恋**这条线，
    // 否则它们会被一堆低权重的日常事件挤掉（实测升职 200 局只出现 10 次候选）
    // patch46：改成「一半回合」才优先线类事件——原来每个回合都优先，
    // 结果都市修仙线只剩 1/12 能触发。用年号做确定性判据，不用 Math.random（保证可复现）。
    const coarse = state && (state.timeMode === 'node' || state.timeMode === 'three');
    const lineTurn = ((((state && state.year) || 0) * 37) % 2) === 0;
    if (coarse && lineTurn) {
      const line = diff.filter((e) => e.cat === 'work' || e.cat === 'romance');
      if (line.length) { tryFill(line); }
    }
    if (picked.length < 2) tryFill(diff.length ? diff : rest);
  }
  if (picked.length < 2) tryFill(pool.filter((e) => !e.auto));
  // patch19：这里原来写的是 tryFill(pool)——全池含 auto 事件，会把它们又拽回回合里。
  // 自动事件必须完全离开回合（只在结算报告），所以最后这层兜底也只能用非 auto 的池子。
    // patch120：**候选生成时计数**——一生最多出现 2 次（含候选）。
  // 放在这里而不是结算时，是为了让「候选栏」也不会反复出现同一个事件。
  // patch121：**兜底** —— 一个候选都没有时，用通用事件顶上，避免卡死
  // patch123：兜底只在 6 岁以上启用——婴儿期本来就只有 auto 事件，不涉及候选
  if (!picked.length && state.age >= 6) picked.push('generic_quiet');
  state.eventCount = state.eventCount || {};
  for (const _id of picked) {
    // 兜底事件不计数（否则它也会被「最多 2 次」限制掉）
    if (_id === 'generic_quiet') continue;
    state.eventCount[_id] = (state.eventCount[_id] || 0) + 1;
  }
return picked;
}

/** patch17：抽一件「自动发生」的事件（他人决定 / 客观不可控）。
 *  它与玩家选的主线**同时发生**——所以一回合能经历两件事。
 *  抽不到就返回 null（本回合只有一件主线，不硬凑）。 */
function pickAutoEvent(state, rng) {
  // patch36：一个轮回内同一自动事件不超过 2 次（玩家明确要求）。
  // 计数放在 state.flags.autoEventCounts，跨回合累计。
  const counts = (state.flags && state.flags.autoEventCounts) || {};
  const timesOf = (id) => counts[id] || 0;
  const all = availableEvents(state).filter((e) => e.auto);
  if (!all.length) return null;
  // 严格上限：一个轮回内同一事件最多 2 次。
  // 都满 2 次了就**返回 null**（这回合没有自动事件）——
  // 绝不能再回退到「全池照抽」，那等于把上限作废（patch36 就是这么错的）。
  const pool = all.filter((e) => timesOf(e.id) < 2);
  const limit = 2;
  if (!pool.length) return null;
  const ev = weightedPick(rng, pool, (e) => {
    let base = typeof e.weight === 'function' ? e.weight(state) : (e.weight || 10);
    if (e.cat === 'romance') base *= 1.8;
    const last = state.eventLog[e.id];
    if (!last) return base;                 // 没触发过：保持原权重
    const gap = state.year - last;
    if (gap < 4) return base * 0.06;        // 4 年内：大幅降权
    if (gap < 8) return base * 0.35;
    return base;
  });
  if (!ev) return null;
  // 记账，让它也受冷却约束（不写 eventLog 会被反复抽中）
  state.eventLog[ev.id] = state.year;
  if (state.flags) {
    const rec = state.flags.recentEvents || [];
    state.flags.recentEvents = [ev.id].concat(rec.filter((x) => x !== ev.id)).slice(0, 3);
    // patch36：记账（一局内的触发次数）
    state.flags.autoEventCounts = counts;
    counts[ev.id] = (counts[ev.id] || 0) + 1;
    if (counts[ev.id] === limit) state.flags.autoEventCapped = true;
  }
  return ev.id;
}

/** patch14：自动结算——按数值（有时加随机）判断结果，返回 { delta, text, eventId } */
function autoResolve(draft, rng) {
  // patch17：自动事件由 pickAutoEvent 单独抽出，与玩家选的主线**同时发生**。
  // 原来写成「候选里只要有 auto 就用它」，会让 auto 事件吞掉整回合的主线位。
  const autoId = draft.pending && draft.pending.autoEventId;
  if (!autoId || !AUTO_BRANCH[autoId]) return null;
  let out = null;
  try { out = AUTO_BRANCH[autoId](draft); } catch (e) { out = null; }
  if (!out) return null;
  // patch17：有些自动结算要记 flag（例如抓周 → 成就）。
  // 在 beginYear 阶段就写进 draft.flags，这样结算末尾的 checkAchievements 能读到。
  if (out.f) {
    draft.flags = draft.flags || {};
    for (const k of Object.keys(out.f)) draft.flags[k] = out.f[k];
  }
  return { eventId: autoId, delta: out.d || {}, text: out.t || '', flags: out.f || {} };
}

// P0-1（patch9）：翻年之后把视口拉回顶部。
// 玩家原话：「每次翻完年之后还要自己划拉到上面，有点难受」。
// 页面到底是 window 在滚还是内层容器在滚，两种都试一遍，谁在滚谁生效。
function scrollPageToTop() {
  if (typeof document === 'undefined') return;
  try {
    const cands = ['.app', '.wrap', '.page', '#app', 'main'];
    for (const sel of cands) {
      const el = document.querySelector && document.querySelector(sel);
      if (el && typeof el.scrollTo === 'function') el.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } catch (e) { /* 滚动失败不该影响游戏 */ }
}

function advanceYear(draft, rng) {
  const from = draft.age;
  // patch20/26：跨度由这一局选的时间模式决定（节点处小、平稳期大）
  const span = pickSpan(draft.age, draft);
  draft.crossedSpan = span;   // patch20：给 resolveYear 的疾病/事故系统用
  draft.age += span;
  draft.year += span;
  // patch12：记下这一步跨过了哪些关键年龄，交给 resolveYear / 疾病系统补账
  // 用区间而不是 from < a：5 年一跳时 18 岁可能落在 15→20 中间，
  // 写成 from < 18 && 20 >= 18 才抓得到（原来的 from < a && age >= a 会漏）
  draft.crossedAges = KEY_AGES.filter((a) => from < a && draft.age >= a);
  beginYear(draft, rng);
  scrollPageToTop();
  return draft;
}

function shouldEnd(draft) {
  // patch163：修仙者健康归零时，不该继承凡人病症的死因——改成修仙专属说法
  if (!draft.died && draft.attrs.health <= 0 && draft.flags && draft.flags.xianxia
      && (draft.cultivationLevel || 0) >= 1) {
    draft.died = true;
    draft.deathCause = '经脉尽断，元神溃散，这一身修为终究没能留住';
  }
  if (draft.died || draft.attrs.health <= 0) return true;
  // patch91：**修仙者不受凡人 END_AGE 截断**。
  // 闭关一次就跳几百到十几万年，若还按 END_AGE（凡人寿终）判，第一次闭关就"结局"了。
  // 修仙者的生死改由 annualMortality 里的「寿元制」决定（见 patch90）。
  if (draft.flags && draft.flags.xianxia && (draft.cultivationLevel || 0) >= 1) return false;
  return draft.age >= END_AGE;
}

/* ---------------- 年度结算 ---------------- */
/* —— 持久效果：过往选择对一生的复利影响 ——
   perks 由选项写入（累加），FLAG_PERKS 让既有 flag 立刻产生年度后果。 */
const PERK_SCALE = 1;
const FLAG_PERKS = {
  goodHighSchool: { skillDrift: 0.25 },
  science:        { skillDrift: 0.20 },
  arts:           { moodDrift: 0.20 },
  balance:        { healthDrift: 0.30, moodDrift: 0.22 },
  checkup:        { healthDrift: 0.30 },
  gym:            { healthDrift: 0.35, cost: 150 },
  therapy:        { moodDrift: 0.50 },
  rest_year:      { moodDrift: 0.25, income: -300 },
  frugal:         { cost: -350 },
  debt:           { cost: 400 },
  pet:            { moodDrift: 0.25, cost: 250 },
  penpal:         { relationDrift: 0.30 },
  letter:         { relationDrift: 0.15 },
  photo:          { moodDrift: 0.15 },
  tea:            { moodDrift: 0.15 },
  created:        { moodDrift: 0.20 },
  promoted:       { income: 2200 },
  changedJob:     { income: 1500 },
  hasCar:         { cost: 900, moodDrift: 0.10 },
  hasHouse:       { cost: 3000, moodDrift: 0.15 },
  caregiving:     { cost: 800, moodDrift: -0.15 },
  worry:          { moodDrift: -0.25 },
  married:        { moodDrift: 0.10 },
  hasChild:       { cost: 1500, moodDrift: 0.15 },
  movedCity:      { relationDrift: -0.30, moodDrift: 0.15 },
  travel:         { moodDrift: 0.15 },
  employed:       { income: 900 },
  xianxia:        { healthDrift: 0.20 },
  hasLand:        { skillDrift: 0.40 },
  gap:            { income: -800 },
  almostFailed:   { skillDrift: -0.30 },
  brokeUp:        { moodDrift: -0.20 },
  noChild:        { moodDrift: 0.10 },
  firstCrush:     { moodDrift: 0.10 },
  fairyRefused:   { moodDrift: 0.05 },
};
function applyPerks(draft, attr) {
  const tot = {};
  const add = (o) => { if (!o) return; for (const k in o) tot[k] = (tot[k] || 0) + o[k]; };
  add(draft.perks);
  const f = draft.flags || {};
  for (const k of Object.keys(f)) if (f[k] && FLAG_PERKS[k]) add(FLAG_PERKS[k]);
  const s = PERK_SCALE;
  if (tot.healthDrift) attr('health', tot.healthDrift * s);
  if (tot.moodDrift) attr('mood', tot.moodDrift * s);
  if (tot.skillDrift) attr('skill', tot.skillDrift * s);
  if (tot.relationDrift) attr('relations', tot.relationDrift * s);
  if (tot.income) attr('money', tot.income * s);
  if (tot.cost) attr('money', -tot.cost * s);
}

/* ================= 判定系统 =================
   原则：玩家只决定"做什么"，"结果如何"由数值 + 随机决定。
   分数越高越靠属性，随机只占小头（临场发挥）。 */
function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
function lv(state, k) { return (state.attrs[k] || 0) / 100; }

/** 高考分数：技能为主，心态/身体/重点高中/备考方式为辅 */
function gaokaoScore(state, rng) {
  const a = state.attrs;
  const form = Number.isFinite(state.flags.examForm) ? state.flags.examForm : 50;
  const base = 280
    + a.skill * 3.0
    + a.mood * 0.5
    + a.health * 0.3
    + (state.flags.goodHighSchool ? 30 : 0)
    + (state.flags.crammed ? 25 : 0)
    + Math.min(25, (state.counts.study || 0) * 5)
    + (form - 50) * 0.6;
  return Math.round(Math.max(200, Math.min(750, base + rng.float(-30, 30))));
}
function universityOf(score) {
  return score >= 595 ? '985' : score >= 525 ? '一本' : score >= 455 ? '二本' : '专科';
}
/** 中考分数 */
function zhongkaoScore(state, rng) {
  const a = state.attrs;
  const base = 200 + a.skill * 2.2 + a.mood * 0.4 + a.health * 0.2;
  return Math.round(Math.max(120, Math.min(600, base + rng.float(-25, 25))));
}
/** 求职竞争力（学历 + 技能 + 人脉） */
function jobScore(state, rng) {
  const a = state.attrs;
  const uni = state.flags.university;
  const ub = uni === '985' ? 25 : uni === '一本' ? 15 : uni === '二本' ? 8 : 0;
  return a.skill * 1.0 + a.relations * 0.5 + ub + rng.float(-15, 15);
}

/* ================= 灵根系统（patch7：7 种 → 26 种） =================
   入道时测一次，决定修炼速度与走火入魔风险，一生不再改变。
   26 种分九档：传说 2（混沌灵根 / 先天道体）、顶级 1（天灵根）、上等 10（五行单系 5 + 雷魂日月 4 + 单灵根）、
   中上 8（变异 5 + 双灵根 3）、中等 1（双灵根·相克）、寻常 1（三灵根）、下等 1（四灵根）、
   末等 1（伪灵根）、驳杂 1（五行杂灵根）。tier≥6 的共 13 种。
   倍率口径：tier 0-4 沿用原表（0.52/0.70/0.88/1.10/1.31），tier 5 以上用温和曲线
   （1.50/1.72/1.97/2.20/2.45），否则 10 档线性排会让顶级灵根崩掉。
   hue 是界面高亮用的色相（HSL 色相角，0-360），按灵根的"气质"给，不按品级给。
   ★ 顺序有语义：下面的表必须按 tier 从高到低排——rollSpiritRoot 的倾斜曲线
     按「下标越小 = 品级越高」放大权重，顺序错了倾斜就会加在高品级以外的行上。 */
/* 抽签倾斜的分档系数（tier → 档位）。patch8 新增。
   每一档的倍数是 1 + (BASE + GAIN × 档位) × bonus，bonus 最多 3（仙缘深厚 / 抓周药罐 / 运气好 各 +1）。
   档位越高涨得越多：档 5（tier≥7）满倾斜 ×2.07，档 0（tier≤1）×1.09。
   为什么不再用「按名次」的指数曲线：26 条表把指数摊薄了，满倾斜时中段（tier 5 的双灵根、风冰幻地血）
   几乎不动（7.89% → 7.98%）甚至被挤压下降；按档给系数后每一档都往上走。
   旋钮：想整体抬得多就调大 BASE，想更陡就调大 GAIN（三组参考值见交付文档）。 */
const ROOT_BAND = Object.freeze({ 9: 5, 8: 5, 7: 5, 6: 4, 5: 3, 4: 2, 3: 1, 2: 1, 1: 0, 0: 0 });
const ROOT_BAND_BASE = 0.03;
const ROOT_BAND_GAIN = 0.065;
function rootBandOf(tier) { return ROOT_BAND[tier] != null ? ROOT_BAND[tier] : 0; }
function rootWeightFactor(tier, bonus) {
  return 1 + (ROOT_BAND_BASE + ROOT_BAND_GAIN * rootBandOf(tier)) * bonus;
}

const SPIRIT_ROOTS = [
  /* ── 以下为 patch7 新增（旧表只有 7 条，见上） ── */
  // patch112：**权重清零**——它是体质不是灵根，不该从灵根池里抽出来
  { id:'chaos_origin', name:'混沌灵根', weight:0, gainMult:2.45, dangerMult:0.45, tier:9, hue:268,
    desc:'无属可归，五系俱在心中，修行全看自己怎么开', flavor:'老道的手停在半空，很久才说：「这个……我没见过。」' },
  // patch112：**权重清零**——道体是体质（见 CONSTITUTIONS），不是灵根
  { id:'daoti', name:'先天道体', weight:0, gainMult:2.45, dangerMult:0.45, tier:9, hue:45,
    desc:'不必引气，周天自转，是修仙界传说里才有的资质', flavor:'老道把石头收了起来：「不必测了。你往那里一站，石头自己会亮。」' },
  { id:'tian', name:'天灵根（上品单系）', weight:2, gainMult:2.2, dangerMult:0.55, tier:8, hue:191,
    desc:'万中无一的天生道体', flavor:'老道盯着你看了很久，声音都在抖：「这一世，竟让我碰上了。」' },
  { // patch113：**权重清零**——它就是「不带具体元素的单灵根」，和元素灵根重复
  id:'single', name:'单系灵根', weight:0, gainMult:1.72, dangerMult:0.81, tier:6, hue:262,
    desc:'纯净单系，进境极快', flavor:'老道点头：「单系纯灵，百年可期。」' },
  { id:'jin', name:'金灵根', weight:10, gainMult:1.72, dangerMult:0.81, tier:6, hue:205,
    desc:'杀伐最利，进境极快，一往无前', flavor:'老道捏着玉牌敲了敲：「金石之声。你这性子，怕是要吃一次大亏才能圆。」' },
  { id:'mu', name:'木灵根', weight:10, gainMult:1.72, dangerMult:0.81, tier:6, hue:96,
    desc:'生机最盛，疗愈与长养一途天生的料', flavor:'老道把一缕灵气递过去，你腕上的擦伤当着面收了口：「木灵根。活得久，也救得了人。」' },
  { id:'shui', name:'水灵根', weight:10, gainMult:1.72, dangerMult:0.81, tier:6, hue:179,
    desc:'柔而不断，最擅长熬过漫长的路', flavor:'老道说：「水灵根。你不必急着赢，你只要比他们活得久。」' },
  { id:'huo', name:'火灵根', weight:10, gainMult:1.72, dangerMult:0.81, tier:6, hue:16,
    desc:'爆发最烈，破境最快，也最容易烧穿自己', flavor:'老道往后避了半步：「火灵根。离丹炉近些是好事，离你自己的脾气远些。」' },
  { id:'tu', name:'土灵根', weight:10, gainMult:1.72, dangerMult:0.81, tier:6, hue:32,
    desc:'根基最厚，冲关慢，却极少走火', flavor:'老道拍了拍地面：「土灵根。走得最慢的那个，往往最后还站着。」' },
  { id:'lei_x', name:'雷灵根', weight:5, gainMult:1.72, dangerMult:0.81, tier:6, hue:240,
    desc:'五行之外的暴烈一系，破境极快，代价是经脉常年在崩', flavor:'老道让你握紧玉牌，一声脆响，屋里的灯全灭了：「雷灵根。这一世的雷劫，你要比别人多挨几道。」' },
  { id:'hun_x', name:'魂灵根', weight:5, gainMult:1.72, dangerMult:0.81, tier:6, hue:285,
    desc:'神魂天生比人厚一层，通幽见微，元婴一境几乎无坎', flavor:'老道忽然听见什么，转头看你：「魂灵根。夜里别一个人往祠堂去。」' },
  { id:'ri_x', name:'日灵根', weight:5, gainMult:1.72, dangerMult:0.81, tier:6, hue:52,
    desc:'至阳至盛，正午修行事半功倍，夜里则事倍功半', flavor:'老道在正午测的灵根，玉牌烫得他换了一次手：「日灵根。你这一生怕是熬不了夜。」' },
  { id:'yue_x', name:'月灵根', weight:5, gainMult:1.72, dangerMult:0.81, tier:6, hue:218,
    desc:'至阴至静，夜里周身自生清辉，心境极难被撼动', flavor:'老道特意等到月出才测：「月灵根。你心里的话，大概一辈子也不会全说出来。」' },
  { id:'dual', name:'水木双灵根', weight:22, gainMult:1.5, dangerMult:0.88, tier:5, hue:172,
    desc:'两系同修，中上之姿', flavor:'老道说：「双灵根，不算顶尖，但足够走远。」' },
  { id:'dual_tong', name:'火土双灵根', weight:20, gainMult:1.5, dangerMult:0.88, tier:5, hue:145,
    desc:'两系同源，看似整齐，实则互相消耗', flavor:'老道看着两枚一模一样的玉牌：「同源。你得学会自己跟自己相处。」' },
  { id:'dual_shu', name:'木火双灵根', weight:16, gainMult:1.5, dangerMult:0.88, tier:5, hue:130,
    desc:'两系相生，修行顺遂，且冲关时互为助力', flavor:'老道把两枚玉牌合在一处，缝都不见了：「相生。你这一路会顺很多。」' },
  { id:'feng_x', name:'风灵根', weight:9, gainMult:1.5, dangerMult:0.88, tier:5, hue:158,
    desc:'身法第一，遁速极快，硬碰硬吃亏', flavor:'老道摊开手，玉牌自己飘了起来：「风灵根。打不过就跑，这也是一门正经功夫。」' },
  { id:'bing_x', name:'冰灵根', weight:9, gainMult:1.5, dangerMult:0.88, tier:5, hue:196,
    desc:'心境天生冷硬，走火入魔的风险比同品级低得多', flavor:'老道把玉牌放进你手里，又缩回袖子：「冰灵根……你手真凉。」' },
  { id:'huan_x', name:'幻灵根', weight:9, gainMult:1.5, dangerMult:0.88, tier:5, hue:310,
    desc:'神识生而带幻，最擅长瞒过别人，也最容易被自己瞒过', flavor:'老道看了三次玉牌，每次颜色都不一样：「幻灵根。你自己分得清吗？」' },
  { id:'di_x', name:'地灵根', weight:9, gainMult:1.5, dangerMult:0.88, tier:5, hue:88,
    desc:'与地脉相通，找灵脉、布阵、守山门都是一等一的好手', flavor:'老道跺了跺脚下：「地灵根。这块地底下的东西，你站一会儿就知道在哪。」' },
  { id:'xue_x', name:'血灵根', weight:9, gainMult:1.5, dangerMult:0.88, tier:5, hue:350,
    desc:'修得极快，全靠烧自己的气血，经脉受损几乎不可逆', flavor:'老道捏着你的手腕皱起眉：「血灵根。快是快，你舍得吗？」' },
  { id:'dual_ke', name:'水火双灵根', weight:28, gainMult:1.31, dangerMult:0.95, tier:4, hue:8,
    desc:'两系相克，修行内耗，心境一旦偏了就直坠', flavor:'老道把两枚玉牌分开：「相克。你的坎不在天上，在你自己身上。」' },
  { id:'triple', name:'金木水三灵根', weight:26, gainMult:1.1, dangerMult:1, tier:3, hue:60,
    desc:'寻常资质，勤能补拙', flavor:'老道说：「资质平平，看你的心了。」' },
  { id:'quad', name:'金木水火四灵根', weight:24, gainMult:0.88, dangerMult:1.12, tier:2, hue:25,
    desc:'驳杂不纯，修行艰难', flavor:'老道叹了口气：「四灵根，路要难走一些。」' },
  { id:'pseudo', name:'伪灵根', weight:8, gainMult:0.7, dangerMult:1.28, tier:1, hue:106,
    desc:'几乎无望，需以命相搏', flavor:'老道沉默半晌：「伪灵根……你若坚持，也不是全无可能。」' },
  { id:'chaos', name:'金木水火土五灵根', weight:4, gainMult:0.52, dangerMult:1.45, tier:0, hue:74,
    desc:'五系俱全，反成桎梏', flavor:'老道摇头：「五系俱全，是最坏的一种。可你要是能走通——」' },
];
// ===== patch7 新增的三个小工具 =====
function rootOfState(state) { return spiritRootOf(state); }
function rootIs(state, id) { return !!(state.flags && state.flags.xianxia && state.flags.spiritRoot === id); }
function rootTierOf(state) { const r = spiritRootOf(state); return r ? r.tier : -1; }
const TIER_NAME = { 9:'传说', 8:'顶级', 7:'上上', 6:'上等', 5:'中上', 4:'中等', 3:'寻常', 2:'下等', 1:'末等', 0:'驳杂' };
const SPIRIT_ROOT_BY_ID = Object.fromEntries(SPIRIT_ROOTS.map((r) => [r.id, r]));
