// ===== src/data/attrs.js =====
// 五项状态的元信息与状态描述（供 UI 与引擎共用）
const ATTRS = [
  { key: 'health',   name: '健康', icon: 'heart',  color: '#d98a8a',
    desc: (v) => (v >= 80 ? '身体是认真的本钱' : v >= 60 ? '还算扛得住' : v >= 40 ? '开始有小毛病' : v >= 20 ? '身体在发出信号' : '需要认真照顾自己') },
  { key: 'mood',     name: '心情', icon: 'smile',  color: '#e0a63c',
    desc: (v) => (v >= 80 ? '整个人在发光' : v >= 60 ? '大部分时候还不错' : v >= 40 ? '有点闷，需要透气' : v >= 20 ? '很久没真正开心了' : '情绪需要被接住') },
  { key: 'money',    name: '金钱', icon: 'coin',   color: '#b08d57',
    desc: (v) => (v >= 500000 ? '钱给了你说不的底气' : v >= 100000 ? '小有积蓄，睡得着觉' : v >= 20000 ? '够花，但不敢停下来' : v >= 0 ? '每一笔都要算一算' : '账单正在追着你跑') },
  { key: 'relations',name: '关系', icon: 'people', color: '#7fa8c9',
    desc: (v) => (v >= 80 ? '被很多人稳稳地爱着' : v >= 60 ? '有几个能打电话的人' : v >= 40 ? '热闹是偶尔的' : v >= 20 ? '常常一个人吃饭' : '有点久没被人想起来了') },
  { key: 'skill',    name: '技能', icon: 'star',   color: '#8fae8b',
    desc: (v) => (v >= 80 ? '手里有活，心里不慌' : v >= 60 ? '能拿出手的本事' : v >= 40 ? '还在慢慢变好' : v >= 20 ? '刚摸到门道' : '几乎是一张白纸') },
];

const ATTR_BY_KEY = Object.fromEntries(ATTRS.map((a) => [a.key, a]));

function moneyText(n) {
  const v = Math.round(n);
  return v.toLocaleString('zh-CN');
}

/** 金钱条的进度比例：20 万视为满格（对数感），负数按 0 处理 */
function moneyRatio(v) {
  if (v <= 0) return 0;
  return Math.max(0.04, Math.min(1, Math.log10(v / 1000 + 1) / Math.log10(201)));
}

// ===== src/data/traits.js =====
// 起始特质库：mods 是倍率修正，start 是初始属性偏移
// 可用键：moodGain moodLoss skillGain relationGain relationDecay healthDecay healthGain
//        costRate workGain moneyGain learnCost createGain financeGain financeRisk specialChance familyGain
//        cultivateGain（patch6 新增：闭关修为增长倍率）

const TRAITS = [
  /* ===== patch116：重生废柴流 —— 开局就比人烂一截，但你记得路怎么走 ===== */
  { id: 'rebirth', name: '重生者',
    desc: '带着前世记忆回到起点。技能-18、关系-12、心情-5，但学什么都快',
    mods: { skillGain: 1.25, moneyGain: 1.15 },
    start: { skill: -18, relations: -12, mood: -5 } },
  /* —— 心情类 —— */
  { id: 'optimist',   name: '乐天派',   desc: '心情恢复+30%，心情损失-20%', mods: { moodGain: 1.3, moodLoss: 0.8 } },
  { id: 'carefree',   name: '心大',     desc: '心情损失-50%（天塌下来先睡一觉）', mods: { moodLoss: 0.5 } },
  { id: 'chill',      name: '佛系',     desc: '心情损失-20%，金钱获得-10%', mods: { moodLoss: 0.8, moneyGain: 0.9 } },

  /* —— 身体类 —— */
  { id: 'ironman',    name: '铁人',     desc: '健康衰减-40%，健康恢复+20%', mods: { healthDecay: 0.6, healthGain: 1.2 } },
  { id: 'longevity',  name: '长寿基因', desc: '健康衰减-35%', mods: { healthDecay: 0.65 } },
  { id: 'sickly',     name: '体弱多病', desc: '健康衰减+30%，健康初始-15', mods: { healthDecay: 1.3 }, start: { health: -15 } },
  { id: 'athlete',    name: '运动健将', desc: '健康+10，工作体力消耗-20%', mods: { healthDecay: 0.85 }, start: { health: 10 } },

  /* —— 脑子类 —— */
  { id: 'prodigy',    name: '天才少年', desc: '技能+22，技能成长+15%，工作+15%，闭关修为+10%，心情-8', mods: { skillGain: 1.15, workGain: 1.15, cultivateGain: 1.1 }, start: { skill: 22, mood: -8 } },
  { id: 'thinker',    name: '内向深思', desc: '技能成长+35%，关系建立-15%', mods: { skillGain: 1.35, relationGain: 0.85 } },
  { id: 'scholar',    name: '好学生',   desc: '学费-40%，技能成长+15%', mods: { learnCost: 0.6, skillGain: 1.15 } },
  { id: 'doer',       name: '行动力强', desc: '技能成长+25%，心情+10%', mods: { skillGain: 1.25, moodGain: 1.1 } },
  { id: 'craftsman',  name: '心灵手巧', desc: '创作收获+30%，技能成长+10%', mods: { createGain: 1.3, skillGain: 1.1 } },

  /* —— 社交类 —— */
  { id: 'social',     name: '社牛',     desc: '关系建立+50%，工作+10%', mods: { relationGain: 1.5, workGain: 1.1 } },
  { id: 'slowwarm',   name: '慢热型',   desc: '关系建立-25%，关系衰减-50%', mods: { relationGain: 0.75, relationDecay: 0.5 } },
  { id: 'nice',       name: '好好先生', desc: '关系+25%，工作-10%', mods: { workGain: 0.9, relationGain: 1.25 } },
  { id: 'networker',  name: '人脉广',   desc: '初始关系+15', mods: { relationGain: 1.2 }, start: { relations: 15 } },
  { id: 'family',     name: '顾家',     desc: '关系衰减-40%，家人好感+50%', mods: { relationDecay: 0.6, familyGain: 1.5 } },

  /* —— 钱类 —— */
  { id: 'thrifty',    name: '勤俭节约', desc: '生活费-25%，理财收益+20%', mods: { costRate: 0.75, financeGain: 1.2 } },
  { id: 'richkid',    name: '家里有矿', desc: '初始金钱+50000', start: { money: 50000 } },
  { id: 'poor',       name: '穷人家的孩子', desc: '初始金钱-8000，工作+20%', mods: { workGain: 1.2 }, start: { money: -8000 } },
  { id: 'spender',    name: '月光族',   desc: '生活费+30%，心情+15%', mods: { costRate: 1.3, moodGain: 1.15 } },

  /* —— 运气类 —— */
  { id: 'adventurer', name: '冒险家',   desc: '特殊事件概率+60%，理财风险+60%', mods: { specialChance: 1.6, financeRisk: 1.6 } },
  { id: 'curious',    name: '好奇心强', desc: '特殊事件概率+60%，技能+10%', mods: { specialChance: 1.6, skillGain: 1.1 } },
  { id: 'lucky',      name: '运气好',   desc: '特殊事件概率+30%，随机结果更偏正面', mods: { specialChance: 1.3 } },

  /* —— 工作/学习类 —— */
  { id: 'tryhard',    name: '卷王',     desc: '工作收益+30%，初始健康-6', mods: { workGain: 1.3 }, start: { health: -6 } },
  { id: 'nightowl',   name: '夜猫子',   desc: '创作收获+40%，健康衰减+20%', mods: { createGain: 1.4, healthDecay: 1.2 } },
  { id: 'earlybird',  name: '早起鸟',   desc: '工作收益+15%，健康衰减-15%', mods: { workGain: 1.15, healthDecay: 0.85 } },

  /* —— 修仙相关 —— */
  { id: 'immortal_fate', name: '仙缘深厚', desc: '遇到修仙事件概率翻倍，闭关修为+20%', mods: { specialChance: 1.5, cultivateGain: 1.2 } },
];

// 矛盾组：同组内不能同时选
const TRAIT_CONFLICTS = [
  ['social', 'slowwarm'],      // 社牛 vs 慢热
  ['richkid', 'poor'],         // 富家 vs 穷家
  ['optimist', 'carefree'],    // 都是心情类，二选一也行（其实不冲突，但避免叠加太多）
  ['nightowl', 'earlybird'],   // 夜猫子 vs 早起鸟
  ['prodigy', 'tryhard'],      // 天才 vs 卷王
  ['thrifty', 'spender'],      // 节约 vs 月光
];

const TRAIT_BY_ID = Object.fromEntries(TRAITS.map((t) => [t.id, t]));
const DEFAULT_TRAIT_ID = 'optimist';

/* patch33：把起始特质补满 5 个。
   玩家可能只挑了 1-4 个就点开始——这时从可选池里随机补，
   避开已选的、也避开与「已选 / 已补」矛盾的。
   返回 { ids, filled }：filled 是本次补进来的特质对象（供界面提示）。 */
function fillTraitsToFive(ids) {
  const out = (Array.isArray(ids) ? ids : []).filter((id) => TRAIT_BY_ID[id]);
  const filled = [];
  const conflictsWith = (id) => TRAIT_CONFLICTS.some((pair) => {
    const other = pair.includes(id) ? pair.find((x) => x !== id) : null;
    return other && out.includes(other);
  });
  while (out.length < 5) {
    const pool = TRAITS.filter((t) => !out.includes(t.id) && !conflictsWith(t.id));
    if (!pool.length) break;                       // 池子空了就停（正常情况下不会）
    const pickOne = pool[Math.floor(Math.random() * pool.length)];
    out.push(pickOne.id);
    filled.push(pickOne);
  }
  return { ids: out, filled: filled };
}

// ===== 特质合并（patch6） =====
// 界面允许一次选最多 5 个特质，所以逐年结算必须用「所有选中特质合并后的 mods」，
// 而不是只取第一个。合并规则与 createNewGame 保持一致：mods 逐键相乘，start 逐键相加。
function mergeTraitMods(traits) {
  const mods = {};
  for (const t of traits) {
    for (const [k, v] of Object.entries((t && t.mods) || {})) mods[k] = (mods[k] || 1) * v;
  }
  return mods;
}
function mergeTraitStart(traits) {
  const start = {};
  for (const t of traits) {
    for (const [k, v] of Object.entries((t && t.start) || {})) start[k] = (start[k] || 0) + v;
  }
  return start;
}
function traitsOfState(state) {
  const ids = Array.isArray(state.traitIds) && state.traitIds.length
    ? state.traitIds : [state.traitId].filter(Boolean);
  return ids.map((id) => TRAIT_BY_ID[id]).filter(Boolean);
}
function modsOfState(state) { return mergeTraitMods(traitsOfState(state)); }

// ===== src/data/weather.js =====
// 天气：除了气氛文案，还会轻微影响属性与部分行动的收益
const WEATHERS = [
  { id: 'sunny',   name: '晴',       icon: 'sun',     weight: 18, mood: 2,  desc: '阳光把整座城市晒得暖洋洋的，连影子都很配合。' },
  { id: 'cloudy',  name: '多云',     icon: 'cloud',   weight: 16, mood: -1,  desc: '云走得很快，像在赶着去赴一场约。' },
  { id: 'drizzle', name: '小雨',     icon: 'rain',    weight: 14, mood: -1,  desc: '细雨把街道洗成一面模糊的镜子，适合发呆。', wet: true },
  { id: 'storm',   name: '雷阵雨',   icon: 'storm',   weight: 8,  mood: -4, desc: '雷声滚过头顶，屋檐下的人同时加快了脚步。', wet: true },
  { id: 'fog',     name: '雾',       icon: 'fog',     weight: 8,  mood: -2, desc: '雾里看城市，像看一封没写完的信。', wet: true },
  { id: 'snow',    name: '小雪',     icon: 'snow',    weight: 6,  mood: 0, health: -1, desc: '雪花落在肩膀上，化了才被发现。', wet: true },
  { id: 'wind',    name: '大风',     icon: 'wind',    weight: 8,  mood: -1,  desc: '风把帽子吹跑，也把心事吹散了一些。' },
  { id: 'rainbow', name: '雨后彩虹', icon: 'rainbow', weight: 3,  mood: 3,  desc: '彩虹出现的那三分钟，整条街都在拍照。' },
  { id: 'dusk',    name: '晚霞',     icon: 'dusk',    weight: 6,  mood: 2,  desc: '晚霞烧起来的时候，最适合什么都不做。' },
];

const WEATHER_BY_ID = Object.fromEntries(WEATHERS.map((w) => [w.id, w]));

// ===== src/data/actions.js =====
// 六种年度行动（具体结算公式在 engine.js）
const ACTIONS = [
  {
    id: 'work', name: '专注工作', icon: 'briefcase', color: '#7fa8c9',
    tagline: '把钱和生活一起挣回来。',
    detail: '收入与技能、人脉和年资有关；连轴转会悄悄透支身体。',
  },
  {
    id: 'study', name: '进修学习', icon: 'book', color: '#8fae8b',
    tagline: '给自己续一年的费。',
    detail: '提升技能，要花学费和一点心情；年纪越大，学费越贵。',
  },
  {
    id: 'rest', name: '好好休息', icon: 'cup', color: '#f0a58a',
    tagline: '把这一年的觉睡够。',
    detail: '恢复健康与心情，但没有收入，生活费照付。',
  },
  {
    id: 'social', name: '经营关系', icon: 'people', color: '#d98a8a',
    tagline: '和人好好说话，是很重要的工作。',
    detail: '改善关系，可能遇见新的人；会有些开销。',
  },
  {
    id: 'create', name: '兴趣创作', icon: 'palette', color: '#9b8bb4',
    tagline: '做点没什么用但很喜欢的事。',
    detail: '提升心情与技能，有机会触发特别的经历。',
  },
  {
    id: 'finance', name: '打理钱财', icon: 'coin', color: '#b08d57',
    tagline: '让钱替你打一点工。',
    detail: '收益取决于眼光与本金，市场有风险；本金太少时无从下手。',
  },
];

const ACTION_BY_ID = Object.fromEntries(ACTIONS.map((a) => [a.id, a]));

// ===== src/data/stages.js =====
// 人生阶段：影响工作产出、健康衰退、生活成本、场景与文案
const STAGES = [
  {
    id: 'baby', name: '襁褓', min: 0, max: 3, scene: 'park',
    workFactor: 0, healthDecay: 0.15, cost: 0,
    blurb: '哭、吃、睡，世界是模糊的。',
  },
  {
    id: 'child', name: '上学路上', min: 4, max: 12, scene: 'city',
    workFactor: 0, healthDecay: 0.1, cost: 2000,
    blurb: '书包很重，放学的路很长。',
  },
  {
    id: 'teen', name: '少年时', min: 13, max: 17, scene: 'city',
    workFactor: 0.1, healthDecay: 0.15, cost: 4000,
    blurb: '觉得自己什么都懂，又什么都不懂。',
  },
  {
    id: 'explore', name: '探索与起步', min: 18, max: 25, scene: 'city',
    workFactor: 0.6, healthDecay: 0.35, cost: 9000,
    blurb: '世界刚刚打开，路还很多，钱包还很薄。',
  },
  {
    id: 'build', name: '建立与选择', min: 26, max: 40, scene: 'park',
    workFactor: 1.0, healthDecay: 0.6, cost: 15000,
    blurb: '把喜欢的事，做成能养活自己的事。',
  },
  {
    id: 'settle', name: '沉淀与转向', min: 41, max: 60, scene: 'mountain',
    workFactor: 1.15, healthDecay: 0.95, cost: 19000,
    blurb: '上半场的结果，开始慢慢显形。',
  },
  {
    id: 'lookback', name: '回望与享受', min: 61, max: 999, scene: 'seaside',
    workFactor: 0.3, healthDecay: 1.4, cost: 17000,
    blurb: '时间开始按天计算，于是每一格都珍贵。',
  },
];

// 普通线不设硬寿命上限；修仙线在 cultivation.js 里另算
const END_AGE = 999;

function stageOf(age) {
  for (const s of STAGES) if (age >= s.min && age <= s.max) return s;
  return STAGES[STAGES.length - 1];
}

// ===== src/data/events.js =====
// 年度事件池。每项：
//  cat: funny(搞笑) / work(职场) / romance(恋爱) / classical(古风) / life(生活) / health(身心)
//  weight: 基础权重；cond(draft) 可加条件；run(ctx) 返回 { deltas, lines, bonds, flags, special }
//  deltas 的键顺序与 lines 的顺序一一对应（lines[i] 解释 deltas 的第 i 项变化）。

const EVENTS = [

  /* ---------------- 中小学上学事件 ---------------- */
  {
    id: 'join_scouts', cat: 'life', weight: 15, minAge: 7, maxAge: 11,
    title: '加入少先队',
    text: '大队部里，高年级的哥哥姐姐给你戴上红领巾。你敬了个不太标准的队礼。',
    choices: [
      { text: '认真戴好红领巾', run: () => ({ deltas: { mood: 4, relations: 2 }, lines: ['你觉得红领巾特别鲜艳'] }) },
    ],
  },
  {
    id: 'first_100', cat: 'life', weight: 12, minAge: 7, maxAge: 12,
    title: '第一次考100分',
    text: '数学卷子发下来，那个鲜红的100让你愣了三秒。老师在全班念了你的名字。',
    choices: [
      { text: '回家告诉爸妈', run: () => ({ deltas: { mood: 6, relations: 3 }, lines: ['妈妈给你做了红烧肉'], bonds: { family: 5 } }) },
      { text: '偷偷藏起来', run: () => ({ deltas: { mood: 3 }, lines: ['你把卷子夹在课本里'] }) },
    ],
  },
  {
    id: 'teacher_praise', cat: 'life', weight: 10, minAge: 7, maxAge: 15,
    title: '被老师当众表扬',
    text: '语文课上，老师把你的作文当范文念了。你脸发烫，但心里偷偷高兴。',
    choices: [
      { text: '不好意思地低头', run: () => ({ deltas: { mood: 5, skill: 2 }, lines: ['那篇作文你写了三个晚上'] }) },
    ],
  },
  {
    id: 'desk_mate', cat: 'life', weight: 14, minAge: 7, maxAge: 15,
    title: '和同桌吵架',
    text: '他越过了"三八线"，你用胳膊肘顶回去。两个人一节课没说话。',
    choices: [
      { text: '主动和好', run: () => ({ deltas: { relations: 4, mood: 2 }, lines: ['你递了他一块橡皮', '下课又一起玩了'] }) },
      { text: '冷战到底', run: () => ({ deltas: { mood: -2, relations: -3 }, lines: ['你们冷战了一个星期'] }) },
    ],
  },
  {
    id: 'sports_day', cat: 'life', weight: 10, minAge: 7, maxAge: 16,
    title: '运动会',
    text: '操场上彩旗招展，你报了100米。站在起跑线上，腿有点抖。',
    choices: [
      { text: '站上起跑线', hint: '听枪声', run: ({ rng, draft }) => {
          const t = clamp01(lv(draft, 'health') * 0.80 + 0.10 + rng.float(-0.15, 0.15));
          if (t >= 0.62) return { deltas: { mood: 8, health: 3, relations: 4 }, lines: ['你冲过终点线时，全班都站起来了', '你得到了一张奖状'], flags: { sportsDayDone: true, sportsDayMedal: true }, special: { title: '拿了名次', text: '那张奖状你留了很多年。' } };
          if (t >= 0.38) return { deltas: { mood: 1, health: 3 }, lines: ['你跑了中游，没进决赛，但跑完了全程'], flags: { sportsDayDone: true } };
          return { deltas: { mood: -2, health: 2 }, lines: ['你跑了倒数', '同学给你递了水'], flags: { sportsDayDone: true } };
        } },
    ],
  },
  {
    id: 'spring_trip', cat: 'life', weight: 12, minAge: 7, maxAge: 14,
    title: '春游',
    text: '全班坐大巴去公园。你带了一书包零食，和同学分享了一路。',
    choices: [
      { text: '跟上队伍', run: () => ({ deltas: { mood: 8, relations: 5, money: -50 }, lines: ['你拍了好多照片', '那天的风都是甜的'] }) },
    ],
  },
  {
    id: 'final_exam', cat: 'life', weight: 15, minAge: 7, maxAge: 18,
    title: '期末考试',
    text: '最后一门考完，你把笔一扔。寒假来了！',
    choices: [
      { text: '交卷，等成绩', hint: '该来的总会来', run: ({ rng, draft }) => {
          const t = clamp01(lv(draft, 'skill') * 0.75 + lv(draft, 'mood') * 0.15 + 0.08 + rng.float(-0.14, 0.14));
          if (t >= 0.70) return { deltas: { skill: 5, mood: 5 }, lines: ['成绩出来那天你松了口气，排进了前几名'] };
          if (t >= 0.42) return { deltas: { skill: 3, mood: 1 }, lines: ['成绩中不溜，老师说你还有空间'] };
          return { deltas: { skill: 1, mood: -6 }, lines: ['成绩单上的排名让你不太想说话', '暑假要上补习班了'] };
        } },
    ],
  },
  {
    id: 'middle_school', cat: 'life', weight: 20, minAge: 11, maxAge: 14,
    title: '上初中了',
    text: '新学校、新同学、新课程。你发现初中和小学完全不一样。',
    choices: [
      { text: '适应得很好', run: () => ({ deltas: { relations: 5, skill: 3 }, lines: ['你很快交了新朋友'] }) },
      { text: '不太适应', run: () => ({ deltas: { mood: -4, relations: -2 }, lines: ['你怀念小学的老师'] }) },
    ],
  },
  {
    // patch51：原来 13-16，实测一年一选里 157 次都发生在 13 岁（现实中考 15 岁）。
    id: 'zhongkao', cat: 'work', weight: 25, minAge: 15, maxAge: 16, force: true,
    title: '中考',
    text: '三天考试，决定你上哪个高中。你妈比你还紧张。',
    choices: [
      { text: '走进考场', hint: '三天，定三年', run: ({ rng, draft }) => {
          const score = zhongkaoScore(draft, rng);
          draft.flags.zhongkaoScore = score;
          const lines = [`你的中考分数是 ${score} 分`];
          if (score >= 325) {
            draft.flags.goodHighSchool = true;
            return { deltas: { skill: 8, mood: 8 }, lines: lines.concat(['你的名字在红榜上', '爸妈请你吃了大餐']), flags: { zhongkaoScore: score, goodHighSchool: true }, special: { title: `中考 ${score} 分`, text: '你考上了重点高中。' } };
          }
          if (score >= 265) return { deltas: { skill: 3, mood: 0 }, lines: lines.concat(['你上了普通高中', '也还行，高中三年好好学']), flags: { zhongkaoScore: score }, special: { title: `中考 ${score} 分`, text: '普通高中，也还有机会。' } };
          return { deltas: { skill: 1, mood: -5 }, lines: lines.concat(['你去了中专', '学一门手艺，也不是坏路']), flags: { zhongkaoScore: score }, special: { title: `中考 ${score} 分`, text: '你走上了另一条路。' } };
        } },
    ],
  },
  {
    id: 'split_subjects', cat: 'life', weight: 15, minAge: 15, maxAge: 18, force: true,
    title: '文理分科',
    text: '班主任说："想清楚，这决定你以后学什么。"你盯着那张表看了很久。',
    choices: [
      { text: '选理科', run: () => ({ deltas: { skill: 4 }, lines: ['数理化的世界在等你'], flags: { science: true } }) },
      { text: '选文科', run: () => ({ deltas: { skill: 4, mood: 2 }, lines: ['你更喜欢背书'], flags: { arts: true } }) },
    ],
  },
  {
    // patch19：玩家要求「高考必须在 17-19 岁之间，不允许提前也不允许拖」。
    // 但五年一选的年龄序列是 6/11/16/21/26…——17/18/19 根本不在序列上，
    // 窗口若严格写 17-19 会永远命中不了（实测就是一次都没触发）。
    // 所以取 16-17：16 岁是五年一选序列上唯一的落点，17 岁兜底收口。
    // 代价是高考实际发生在 16 岁（比现实早一年）——这是五年一选的必然结果，见报告说明。
    // patch20：新时间轴上有 17 岁节点，所以高考可以严格落在 17 岁（玩家要求 17-19）
    // patch107：冲刺只在「一年一选」出现。
    // 粗粒度模式（五年一选/三年一段）17-18 岁只有 1 个回合，
    // 而「冲刺→考试」要 2 个回合——那样高考会直接不发生（回归实测 node/three 全挂）。
    id: 'gaokao_sprint', cat: 'work', weight: 20, minAge: 17, maxAge: 18, force: true,
    cond: (s) => s.timeMode === 'year' && !s.flags.gaokaoDone && !s.flags.crammed && !s.flags.examForm,
    title: '高考冲刺',
    text: '黑板上的倒计时从100变成了30。卷子堆得比人高，咖啡比水喝得多。',
    choices: [
      { text: '拼了', run: () => ({ deltas: { skill: 6, health: -5, mood: -3 }, lines: ['你每天学到凌晨一点', '教室的灯总是最后灭的'], flags: { crammed: true } }) },
      { text: '佛系备考', run: () => ({ deltas: { mood: 2, skill: 2 }, lines: ['你按自己的节奏来'] }) },
    ],
  },
  {
    id: 'desk_mate_crush', cat: 'romance', weight: 10, minAge: 13, maxAge: 18,
    title: '同桌',
    text: '老师把你和TA调成同桌。你们上课传纸条，下课一起去食堂。',
    choices: [
      { text: '纯友谊', run: () => ({ deltas: { relations: 8, mood: 4 }, lines: ['你们成了最好的朋友'] }) },
      { text: '有点心动', run: () => ({ deltas: { mood: 6, relations: 5 }, lines: ['你开始期待每天上学'], bonds: { lover: 10 } }) },
    ],
  },

  /* ---------------- 婴幼儿（0-3岁） ---------------- */
  {
    id: 'baby_first_word', cat: 'life', weight: 20, minAge: 1, maxAge: 4,
    title: '开口说话了',
    text: '你含混地叫出了一个音节。全家人围过来，让你再叫一次。',
    choices: [
      { text: '先叫妈妈', run: () => ({ deltas: { mood: 4, relations: 3 }, lines: ['妈妈录了一段视频，反复看了很多年'], bonds: { family: 8 } }) },
      { text: '先叫爸爸', run: () => ({ deltas: { mood: 4, relations: 2 }, lines: ['爸爸那天请了客'], bonds: { family: 6 } }) },
    ],
  },
  {
    id: 'baby_first_steps', cat: 'life', weight: 20, minAge: 1, maxAge: 4,
    title: '学会走路',
    text: '你扶着沙发挪了两步，松开手，摇摇晃晃地朝前走。',
    choices: [
      { text: '摔了又爬起来', run: () => ({ deltas: { health: 4, mood: 3 }, lines: ['膝盖磕青了一块，但你笑得很大声'] }) },
      { text: '被大人一把抱住', run: () => ({ deltas: { mood: 3, relations: 2 }, lines: ['你被举得很高，看见了一整个房间'], bonds: { family: 5 } }) },
    ],
  },
  {
    id: 'baby_sick_night', cat: 'health', weight: 14, minAge: 0, maxAge: 3,
    title: '半夜发烧',
    text: '凌晨两点，你烧到三十九度。大人抱着你在急诊室排队。',
    choices: [
      { text: '打了针退了烧', run: () => ({ deltas: { health: 3, mood: -2, money: -800 }, lines: ['回家时天已经蒙蒙亮了'] }) },
      { text: '物理降温扛过去', run: () => ({ deltas: { health: -3, mood: -2 }, lines: ['妈妈一夜没合眼，用温水给你擦身'] }) },
    ],
  },
  {
    id: 'baby_daycare', cat: 'life', weight: 12, minAge: 2, maxAge: 5,
    title: '第一次上托儿所',
    text: '教室门关上的一瞬间，你回头发现大人不见了。',
    choices: [
      { text: '哭了两天就习惯了', run: () => ({ deltas: { mood: -2, relations: 5 }, lines: ['第三天你主动和老师打了招呼'] }) },
      { text: '一直哭到月底', run: () => ({ deltas: { mood: -4, health: -1 }, lines: ['每天早上门口都有一场拉锯'] }) },
    ],
  },

  /* ---------------- 童年专属 ---------------- */
  {
    id: 'zhuazhou', cat: 'life', weight: 20, minAge: 1, maxAge: 2,
    title: '抓周',
    text: '一岁生日，桌上摆了书、笔、钱、木剑、印章、药罐。全家人围着你，等你伸手去抓。',
    choices: [
      { text: '抓住了书', hint: '书香门第', run: () => ({
          deltas: { skill: 8 },
          lines: ['你死死抓住那本书不放', '长辈们笑了：这孩子以后爱读书'],
          flags: { zhuazhou_book: true }, special: { title: '抓周抓到书', text: '那本书后来被你翻烂了。' } }) },
      { text: '抓住了钱', hint: '财运伏笔', run: () => ({
          deltas: { money: 500 },
          lines: ['你抓起铜钱就往嘴里塞', '全家笑翻了'],
          flags: { zhuazhou_money: true } }) },
      { text: '抓住了笔', hint: '创作者', run: () => ({
          deltas: { skill: 5, mood: 3 },
          lines: ['你攥着笔，在纸上乱画了一通', '妈妈说这是你最早的作品'],
          flags: { zhuazhou_pen: true } }) },
      { text: '抓住了木剑', hint: '好动', run: () => ({
          deltas: { health: 5 },
          lines: ['你抡着木剑追家里的猫', '体力是真的好'],
          flags: { zhuazhou_sword: true } }) },
      { text: '抓住了药罐/佛珠', hint: '修仙缘分', run: () => ({
          deltas: { mood: 3 },
          lines: ['你对着那个小药罐笑了很久', '奶奶说这孩子有仙缘'],
          flags: { zhuazhou_medicine: true, fairyChance: 3 } }) },
    ],
  },
  {
    id: 'first_day_school', cat: 'life', weight: 18, minAge: 6, maxAge: 9,
    title: '第一天上学',
    text: '妈妈把你送到教室门口，你攥着书包带不敢进去。老师蹲下来对你笑，旁边有个小朋友在哭。',
    choices: [
      { text: '大方走进去', hint: '不怕生', run: () => ({
          deltas: { relations: 8, mood: 3 },
          lines: ['你很快和同桌成了朋友'] }) },
      { text: '躲在妈妈身后', hint: '慢热', run: () => ({
          deltas: { relations: 2, mood: -2 },
          lines: ['整整一周你才和班里人说第一句话'] }) },
    ],
  },
  {
    id: 'bullied', cat: 'life', weight: 15, minAge: 8, maxAge: 14,
    title: '在学校被欺负了',
    text: '有人抢了你的文具，还把你推倒在操场上。你回家没敢告诉爸妈。',
    choices: [
      { text: '告诉老师和家长', hint: '寻求帮助', run: () => ({
          deltas: { relations: 5, mood: -3 },
          lines: ['老师处理了这件事，你学会了求助'] }) },
      { text: '忍下来，自己扛', hint: '早熟', run: () => ({
          deltas: { mood: -8, health: -2 },
          lines: ['你把这件事藏在心里很久', '那几年你变得很沉默'] }) },
      { text: '打回去', hint: '硬气', run: () => ({
          deltas: { mood: 2, health: -3, relations: -3 },
          lines: ['你和对方打了一架，都挂了彩', '之后没人再惹你了'] }) },
    ],
  },
  {
    id: 'puberty', cat: 'life', weight: 20, minAge: 13, maxAge: 16,
    title: '青春期来了',
    text: '你开始照镜子，开始在意自己穿什么，开始对爸妈的唠叨不耐烦。身体和心理都在悄悄变。',
    choices: [
      { text: '和爸妈好好沟通', hint: '成熟', run: () => ({
          deltas: { relations: 5, mood: 3 },
          lines: ['你们坐下来谈了一次，互相理解了一点'] }) },
      { text: '关上门，谁也不理', hint: '叛逆期', run: () => ({
          deltas: { mood: -2, relations: -5 },
          lines: ['你的房门关上了两年'] }) },
    ],
  },
  {
    id: 'first_crush', cat: 'romance', weight: 18, minAge: 13, maxAge: 18,
    title: '第一次心动',
    text: '操场上那个人笑起来的时候，你的心跳漏了一拍。你开始偷偷注意 TA。',
    choices: [
      { text: '写情书', hint: '勇敢', run: () => ({
          deltas: { mood: 8, relations: 3 },
          lines: ['TA 收到信笑了，你们成了笔友'], flags: { firstCrush: true } }) },
      { text: '藏在心里', hint: '暗恋', run: () => ({
          deltas: { mood: 2 },
          lines: ['那是你一个人的秘密，很多年后想起还会笑'] }) },
    ],
  },
  {
    id: 'parents_fight', cat: 'life', weight: 4, minAge: 0, maxAge: 17,
    title: '爸妈又吵架了',
    text: '夜里你被摔东西的声音吵醒。门缝里透出客厅的光，你捂住了耳朵。',
    choices: [
      { text: '装作没听见', hint: '自保', run: () => ({
          deltas: { mood: -5 },
          lines: ['你把被子蒙过头', '那几年你睡觉很轻'] }) },
      { text: '出去劝架', hint: '小大人', run: () => ({
          deltas: { relations: -3, mood: -3 }, bonds: { family: 5 },
          lines: ['他们停下来了，看着你，像两个做错事的孩子'] }) },
    ],
  },
  {
    // patch108：年龄窗 17-18 → 17-20。候选位会被别的 force 事件占掉，
    // 只给 2 个回合太容易整个错过高考。
    id: 'gaokao_exam', cat: 'work', weight: 25, minAge: 17, maxAge: 19, force: true,
    cond: (s) => !s.flags.gaokaoDone && !s.flags.examForm,
    title: '高考',
    text: '六月七号，你坐在考场里。三年的卷子、熬夜、模考，都在这两天里了。',
    choices: [
      { text: '走进考场', hint: '六月七号', run: ({ rng, draft }) => {
          // patch105：**出分合并进考试这一步**。
          // 原来「冲刺→考试→出分」三步走，但 17-18 岁只有 2 个回合，第三步永远轮不到，
          // 玩家就从来没看到过成绩弹窗。
          const form = clamp01(lv(draft, 'mood') * 0.6 + lv(draft, 'health') * 0.4 + rng.float(-0.18, 0.18));
          const formScore = Math.round(form * 100);
          const score = gaokaoScore(draft, rng);
          const uni = universityOf(score);
          const scoreMood = score >= 600 ? 10 : score >= 500 ? 4 : score >= 430 ? -3 : -10;
          const words = score >= 630 ? '你考出了高中三年最好的成绩'
            : score >= 530 ? '分数够上一个不错的学校'
            : score >= 450 ? '有学上就行' : '接下来的路要更努力了';
          const formLine = form >= 0.66 ? '你走进考场时意外地平静，笔尖很稳'
            : form >= 0.40 ? '手有点抖，但题都答完了'
            : '你在考场上脑子一片空白，有一道大题空着交了卷';
          return {
            deltas: { mood: scoreMood + (form >= 0.66 ? 4 : form < 0.4 ? -4 : 0), skill: 4, money: -2000 },
            lines: [formLine, `你的高考分数是 ${score} 分`, `录取层次：${uni}`, '志愿表填了又改，改了又填'],
            flags: { gaokaoDone: true, university: uni, gaokaoScore: score, examForm: formScore },
            special: { title: `高考 ${score} 分`, text: words },
          };
        } },
    ],
  },


  {
    id: 'summer_vacation', cat: 'life', weight: 20, minAge: 6, maxAge: 12,
    title: '暑假',
    text: '两个月的长假，是童年最长的礼物。你在楼下跑，蝉鸣很长，西瓜很甜。',
    choices: [
      { text: '疯玩一整个夏天', hint: '快乐童年', run: () => ({
          deltas: { mood: 10, health: 3, relations: 5 },
          lines: ['你晒黑了两个度，日记里写满了趣事'] }) },
      { text: '报了补习班', hint: '内卷童年', run: () => ({
          deltas: { skill: 6, mood: -5, health: -1 },
          lines: ['别的小朋友在玩的时候你在做题', '成绩确实好了一点'] }) },
    ],
  },
  {
    id: 'new_phone', cat: 'life', weight: 10, minAge: 10, maxAge: 17,
    title: '有了第一部手机',
    text: '爸妈把一部旧手机递给你。你第一次有了自己的小世界，躲在被子里玩到很晚。',
    choices: [
      { text: '合理使用', hint: '自控', run: () => ({
          deltas: { mood: 5, relations: 5 },
          lines: ['你加了同学的群，知道了很多以前不知道的事'] }) },
      { text: '沉迷', hint: '熬夜', run: () => ({
          deltas: { mood: -2, health: -5, skill: -3 },
          lines: ['你上课开始走神', '视力也下降了'] }) },
    ],
  },
  {
    id: 'grandparent', cat: 'life', weight: 15, minAge: 0, maxAge: 15,
    title: '爷爷奶奶/外公外婆带你',
    text: '爸妈上班的日子，你是被爷爷奶奶带大的。他们偷偷给你塞零花钱，告诉你爸妈。',
    choices: [
      { text: '和他们很亲', hint: '温暖', run: () => ({
          deltas: { mood: 6, relations: 3 },
          lines: ['奶奶做的菜是你记忆里最香的味道'], bonds: { family: 10 } }) },
      { text: '有点疏离', hint: '忙', run: () => ({
          deltas: { mood: 1 },
          lines: ['长大后你才慢慢懂得他们的爱'] }) },
    ],
  },
  {
    id: 'move_house', cat: 'life', weight: 8, minAge: 0, maxAge: 15,
    title: '搬家了',
    text: '爸妈工作调动，你要离开熟悉的学校和朋友了。',
    choices: [
      { text: '难过但接受', hint: '适应', run: () => ({
          deltas: { mood: -3, relations: -5 },
          lines: ['你和老朋友保持了通信', '新环境慢慢也熟了'] }) },
      { text: '闹脾气', hint: '抗拒', run: () => ({
          deltas: { mood: -6, relations: -8 },
          lines: ['你花了很久才交到新朋友'] }) },
    ],
  },

  /* ---------------- 性别专属 ---------------- */
  {
    id: 'male_first_shave', cat: 'life', weight: 10, minAge: 14, maxAge: 20,
    cond: (s) => s.gender === 'male',
    title: '第一次刮胡子',
    text: '镜子里的你上唇冒出了一层淡淡的青色。爸爸递来一把剃须刀，告诉你怎么用。',
    choices: [
      { text: '认真学', hint: '成为大人的仪式', run: () => ({
          deltas: { mood: 4, skill: 2 },
          lines: ['你第一次自己刮胡子，刮破了一点皮', '爸爸笑了：他当年也这样'] }) },
    ],
  },
  {
    id: 'female_first_period', cat: 'life', weight: 10, minAge: 11, maxAge: 16,
    cond: (s) => s.gender === 'female',
    title: '身体的变化',
    text: '妈妈把你叫到一边，给了你一个小袋子。你突然意识到，自己正在变成大人。',
    choices: [
      { text: '认真面对', hint: '成长', run: () => ({
          deltas: { mood: 2, relations: 3 },
          lines: ['妈妈教了你很多以前不知道的事', '你们的关系更近了一点'], bonds: { family: 5 } }) },
      { text: '有点害怕', hint: '迷茫', run: () => ({
          deltas: { mood: -3 },
          lines: ['那几天你不太说话', '后来慢慢就懂了'] }) },
    ],
  },
  {
    id: 'guys_night', cat: 'funny', weight: 4, minAge: 18, maxAge: 50,
    cond: (s) => s.gender === 'male',
    title: '兄弟聚会',
    text: '几个老哥们约了顿烧烤，聊到半夜。工作、感情、球赛，什么都聊。',
    choices: [
      { text: '喝到尽兴', hint: '兄弟时光', run: () => ({
          deltas: { mood: 8, relations: 6, health: -2, money: -400 },
          lines: ['你喝多了，说了很多平时不说的话', '第二天头疼了一天'], bonds: { friends: 8 } }) },
      { text: '点到为止', hint: '克制', run: () => ({
          deltas: { mood: 4, relations: 4, money: -200 },
          lines: ['你早早回家了，但心里很暖'] }) },
    ],
  },
  {
    id: 'girls_chat', cat: 'funny', weight: 8, minAge: 16, maxAge: 50,
    cond: (s) => s.gender === 'female',
    title: '闺蜜下午茶',
    text: '和最好的闺蜜坐下来，点了蛋糕和奶茶。从八卦聊到人生，一下午就过去了。',
    choices: [
      { text: '聊到关门', hint: '闺蜜时光', run: () => ({
          deltas: { mood: 10, relations: 8, money: -150 },
          lines: ['你们笑到肚子痛', '很多烦心事说出来就轻了'], bonds: { friends: 10 } }) },
      { text: '坐了一会儿就走', hint: '忙', run: () => ({
          deltas: { mood: 2, relations: 3, money: -80 },
          lines: ['你还惦记着没做完的事'] }) },
    ],
  },
  /* ---------------- 婚姻与生育 ---------------- */
  {
    // patch128：**求婚最多 5 次**（被拒了还能再求，但不连着来）
    id: 'propose', cat: 'romance', weight: 26, minAge: 20, maxAge: 45, force: true, maxTimes: 5,  // patch71：8→26
    // patch150/151：32 → 26 → 20。三年一段实测平均结婚年龄 59-60 岁（远超生育窗口）
    cond: (s) => s.bonds.lover >= 20 && !s.flags.married,   // patch71：42→32
    title: 'TA 求婚了',
    text: '一顿很普通的晚饭，TA 突然从口袋里掏出一个小盒子。你愣在原地。',
    choices: [
      { text: '答应', hint: '走进下一段人生', run: () => ({
          deltas: { mood: 10, relations: 5 },
          lines: ['戒指戴上的那一刻，你哭了', '两个人的日子开始了'],
          bonds: { lover: 10 }, flags: { married: true, tryingBaby: true },
          special: { title: '结婚了', text: '没有盛大的婚礼，但你们都觉得刚刚好。' } }) },
      { text: '再等等', hint: '还没准备好', run: () => ({
          deltas: { mood: -3, relations: -5 },
          lines: ['TA 没说什么，但你看到了失望', '你们都需要再想想'] }) },
      { text: '拒绝', hint: '还不想定下来', run: () => ({
          deltas: { mood: 2, relations: -15 },
          lines: ['TA 收拾东西走了', '你恢复了单身，偶尔也觉得空'], flags: { brokeUp: true } }) },
    ],
  },
  {
    // patch40：weight 10 → 34。它是 force 事件，但 20-45 岁之间「入道」也是 force，
    // 两者全程挤占候选位，生育线几乎抽不到（实测只有 2.5% 的局进候选）。
    // patch144：maxTimes 5 —— 选「再等等」之后还能再被问；否则一旦进过候选就作废
    // patch150：maxAge 45 → 52（粗粒度模式结婚偏晚，窗口要留足）
    id: 'have_baby', cat: 'life', weight: 60, minAge: 20, maxAge: 52, force: true, maxTimes: 5,   // patch71：34→60
    cond: (s) => s.flags.married && !s.flags.hasChild,
    title: '要不要个孩子？',
    text: '吃饭的时候，TA 突然说："要不要个宝宝？"你放下筷子，认真想了想。',
    choices: [
      { text: '要一个', hint: '新生命', run: () => ({
          deltas: { mood: 5, relations: 3 },
          lines: ['你们开始备孕', '家里多了一种期待'],
          flags: { tryingBaby: true } }) },
      { text: '再等等', hint: '二人世界还没过够', run: () => ({
          deltas: { mood: 2 }, lines: ['你们又多享受了几年二人世界'] }) },
      { text: '不要', hint: '丁克', run: () => ({
          deltas: { mood: -2, relations: -3 },
          lines: ['你们达成共识：两个人也很好'], flags: { noChild: true } }) },
    ],
  },
  {
    // patch144：maxTimes 5 —— 关键修复。
    // 它常常和 have_baby 同回合进候选，玩家若选了 have_baby，
    // 按「候选生成时计数」baby_born 的 1 次额度就被吃掉了，孩子永远生不出来。
    // patch150：maxAge 50 → 58（跟 have_baby 的窗口对齐）
    id: 'baby_born', cat: 'life', weight: 40, minAge: 20, maxAge: 58, force: true, maxTimes: 5,   // patch71：18→40
    cond: (s) => s.flags.tryingBaby && !s.flags.hasChild,
    title: '孩子出生了',
    text: '护士把那个皱巴巴的小团子抱到你面前。TA 那么小，那么暖，你突然就哭了。',
    choices: [
      { text: '好好爱 TA', hint: '父母心', run: () => ({
          deltas: { mood: 12, health: -5, money: -5000 },
          lines: ['你成了爸爸/妈妈', '熬夜喂奶的一年', '孩子的第一笔开销'],
          bonds: { child: 50 }, flags: { hasChild: true, tryingBaby: false },
          special: { title: '孩子出生了', text: '世界上多了一个你愿意用命去护的人。' } }) },
    ],
  },
  {
    id: 'child_teen', cat: 'life', weight: 12, minAge: 35, maxAge: 60,
    cond: (s) => s.flags.hasChild,
    title: '孩子到了叛逆期',
    text: '曾经那个黏你的小团子，现在关上门不和你说话。你说东，TA 偏往西。',
    choices: [
      { text: '耐心沟通', hint: '慢慢来', run: () => ({
          deltas: { relations: 3, mood: -2 },
          lines: ['你们终于坐下来谈了一次', '孩子长大了，你也得学着放手'] }) },
      { text: '硬管', hint: '冲突', run: () => ({
          deltas: { relations: -10, mood: -5 },
          lines: ['你们大吵了一架', '之后很久家里气氛都很僵'],
          bonds: { child: -15 } }) },
    ],
  },
  /* ---------------- 搞笑 ---------------- */
  {
    id: 'cat_neighbor', cat: 'funny', weight: 12, minAge: 18, maxAge: 55,
    title: '邻居的猫每天早上准时敲门',
    text: '一天早上你打开门，一只橘猫大摇大摆走进来，跳上沙发，像在视察自己的领地。它已经连续来了一个星期。',
    choices: [
      { text: '正式收养它', hint: '多一张嘴，也多一份陪伴', run: () => ({
          deltas: { mood: 9, money: -3000, relations: 2 },
          lines: ['猫成了你这一年的闹钟和暖宝宝', '猫粮、猫砂、第一次看病，花掉一小笔', '邻居们开始叫你“有猫的那个人”'],
          bonds: { pet: 100 }, flags: { pet: true }, special: { title: '收养了一只橘猫', text: '它占据沙发最中间的位置，理直气壮。' } }) },
      { text: '继续当普通邻居', hint: '保持距离的美感', run: () => ({
          deltas: { mood: 4 },
          lines: ['每天隔着门聊两句，你和猫都保持了体面'] }) },
      { text: '买个猫别墅送给它', hint: '钞能力式社交', run: () => ({
          deltas: { money: -1500, mood: 3, relations: 3 },
          lines: ['你给猫买了栋两层小楼', '邻居一家记住你了'] }) },
    ],
  },
  {
    id: 'lottery', cat: 'funny', weight: 10, minAge: 22, maxAge: 65,
    title: '年会抽奖，你中了一台空气净化器',
    text: '主持人念到你的名字时，你正在想晚上吃什么。奖品是一台空气净化器，很大，很难搬。',
    choices: [
      { text: '摆在家里认真用', hint: '呼吸都变贵了', run: () => ({
          deltas: { mood: 3, health: 2 },
          lines: ['今年打喷嚏的次数明显变少'] }) },
      { text: '挂到二手平台卖掉', hint: '落袋为安', run: () => ({
          deltas: { money: 700, mood: 2 },
          lines: ['成交那一刻，你体会到了流通的价值'] }) },
      { text: '寄给爸妈', hint: '他们的城市也需要干净空气', run: () => ({
          deltas: { money: -400, mood: 5, relations: 3 },
          lines: ['妈妈拍了段视频给你：净化器亮着灯，像个小月亮'], bonds: { family: 6 } }) },
    ],
  },
  {
    id: 'wifi_down', cat: 'funny', weight: 9, minAge: 18, maxAge: 70,
    title: '全楼断网三天',
    text: '运营商贴了张 A4 纸在楼道口：光缆被挖断了，预计三天。整栋楼的人集体回到原始社会。',
    choices: [
      { text: '出门散步，认识邻居', hint: '被迫社交', run: () => ({
          deltas: { relations: 7, mood: 3 },
          lines: ['你和三楼的大爷聊了半小时他的月季花'] }) },
      { text: '正好啃完那本买了很久的书', hint: '因祸得福', run: () => ({
          deltas: { skill: 5, mood: 1 },
          lines: ['断网的三天，你读完了半本书'] }) },
      { text: '昏天黑地睡个够', hint: '身体会记得', run: () => ({
          deltas: { health: 5, mood: 2 },
          lines: ['你把缺的觉一次性补齐了'] }) },
    ],
  },
  {
    id: 'bad_haircut', cat: 'funny', weight: 8, minAge: 18, maxAge: 60,
    title: '剪了一个失败的发型',
    text: '理发师说“稍微修一下”，结果是重新设计。镜子里的你，需要一点时间来接受。',
    choices: [
      { text: '买顶帽子戴过这一年', hint: '时间会解决它', run: () => ({
          deltas: { mood: -2, relations: -1 },
          lines: ['帽子成了你的新皮肤'] }) },
      { text: '干脆剃得更短', hint: '破罐破摔的勇气', run: () => ({
          deltas: { mood: 5, money: -60 },
          lines: ['“反正都这样了”——这是你今年说过最爽的一句话'] }) },
      { text: '发自拍自嘲', hint: '把尴尬变成段子', run: () => ({
          deltas: { relations: 7, mood: 4 },
          lines: ['评论区笑成一片，有人叫你“勇气区博主”'] }) },
    ],
  },
  {
    id: 'cooking', cat: 'funny', weight: 9, minAge: 18, maxAge: 70,
    title: '跟视频学做菜，锅差点烧穿',
    text: '视频里说“少许生抽”，你的少许是估计的；视频里说“小火慢煎”，你的火是中大火。厨房浓烟滚滚。',
    choices: [
      { text: '不服，继续练', hint: '厨艺是交学费交出来的', run: () => ({
          deltas: { skill: 4, mood: 3, money: -600 },
          lines: ['第八次尝试，终于做出了能吃的糖醋排骨'] }) },
      { text: '算了，点外卖', hint: '及时止损', run: () => ({
          deltas: { money: -900, mood: 3 },
          lines: ['外卖小哥今年记住了你的地址和口味'] }) },
      { text: '报一个周末烹饪班', hint: '系统学习', run: () => ({
          deltas: { money: -2600, skill: 6, mood: 3 },
          lines: ['班上同学比你小十岁，刀工比你好二十倍'] }) },
    ],
  },

  /* ---------------- 职场 ---------------- */
  {
    id: 'overtime', cat: 'work', weight: 13, minAge: 22, maxAge: 58, cond: (s) => s.flags.employed,
    title: '连续加班到深夜',
    text: '老板拍拍你的肩说“辛苦了”，然后布置了新的任务。你看着窗外的灯，一盏一盏少下去。',
    choices: [
      { text: '收下加班费，继续干', hint: '钱到位，人到位', run: () => ({
          deltas: { money: 9000, health: -6, mood: -4 },
          lines: ['这一年的账单是拿睡眠付的'] }) },
      { text: '申请调到更稳的岗位', hint: '退一步', run: () => ({
          deltas: { money: -2500, health: 4, mood: 4 },
          lines: ['新岗位钱少一点，但你能看见傍晚的天'] }) },
      { text: '学着在六点下班', hint: '边界是自己划的', run: () => ({
          deltas: { money: -3000, skill: 3, mood: 6 },
          lines: ['第一次六点走出公司，风是免费的'], flags: { balance: true } }) },
    ],
  },
  {
    // patch145/147：**去掉 force**（force 会导致「每回合都摆出来，直到你选它」→ 升职率 98%）。
    // 改成普通高权重事件：weight 30 远高于一般工作事件的 8~14，仍然常见，但不再强制。
    id: 'promotion', cat: 'work', weight: 30, minAge: 26, maxAge: 58,
    cond: (s) => s.flags.employed && s.attrs.skill >= 50 && (s.attrs.relations || 0) >= 40,
    title: '升职的机会摆在你面前',
    text: '老板把你叫进会议室，桌面推过来一份新的岗位说明：更重的责任，更厚的薪水，更少的下班。',
    choices: [
      { text: '接下来，全力以赴', hint: '上行电梯', run: () => ({
          deltas: { mood: -3, health: -4, skill: 7, money: 20000 },
          lines: ['新岗位很忙，但你确实学到了东西', '薪水涨了一截，头发掉了一撮'], flags: { promoted: true } }) },
      { text: '先问问自己适不适合', hint: '慢一点也来得及', run: () => ({
          deltas: { mood: 2, skill: 3 },
          lines: ['你把机会想了一整年，最后决定按自己的节奏来'] }) },
      { text: '委婉拒绝，守住生活', hint: '有些东西不想换', run: () => ({
          deltas: { mood: 5, relations: 3 },
          lines: ['你保住了下班后的时间，老板有点意外'], flags: { balance: true } }) },
    ],
  },
  {
    id: 'layoff', cat: 'work', weight: 8, minAge: 26, maxAge: 55, cond: (s) => s.flags.employed && (s.attrs.money < 60000 || s.attrs.health < 45),
    title: '裁员名单在悄悄流传',
    text: '同事群里一张截图，几个部门要合并。你盯着屏幕看了很久，把简历翻出来又关上。',
    choices: [
      { text: '主动谈一次赔偿', hint: '体面地告别', run: () => ({
          deltas: { money: 45000, mood: -7, skill: 2 },
          lines: ['谈判很累，但数字还算体面'], flags: { gap: true } }) },
      { text: '拼命表现留下来', hint: '卷到最后', run: () => ({
          deltas: { money: 7000, health: -6, mood: -3, skill: 4 },
          lines: ['你留下来了，代价是这一年没怎么笑过'] }) },
      { text: '干脆停下来一段时间', hint: '给自己放个假', run: () => ({
          deltas: { health: 7, mood: 6, money: -18000 },
          lines: ['你给自己放了半年的假，第一次在白天逛菜市场'], flags: { gap: true } }) },
    ],
  },
  {
    id: 'colleague_milk', cat: 'work', weight: 11, minAge: 22, maxAge: 60, cond: (s) => s.flags.employed,
    title: '同事请你喝奶茶，并吐槽了一小时',
    text: '全糖、去冰、加芋圆。你们从打印机聊到人生，从KPI聊到房租，最后一起叹了口气。',
    choices: [
      { text: '安静当树洞', hint: '倾听是美德', run: () => ({
          deltas: { relations: 4, mood: -2 },
          lines: ['你记住了一堆秘密，心情有点下沉'] }) },
      { text: '也吐槽回去', hint: '情绪对流', run: () => ({
          deltas: { mood: 6, relations: 3 },
          lines: ['吐槽完那杯奶茶，你们成了饭搭子'] }) },
      { text: '顺便教他一点真本事', hint: '教学相长', run: () => ({
          deltas: { skill: 4, relations: 6 },
          lines: ['教着教着，你发现自己比想象中厉害'] }) },
    ],
  },
  {
    id: 'freelance', cat: 'work', weight: 8, minAge: 25, maxAge: 52, cond: (s) => s.flags.employed && s.attrs.skill >= 40,
    title: '有人私下找你接个活',
    text: '一个老同学发来消息：有个项目，时间紧，报酬不错，问你接不接。',
    choices: [
      { text: '接，钱不骗人', hint: '辛苦一年', run: () => ({
          deltas: { money: 16000, health: -5, mood: -2, skill: 4 },
          lines: ['连续三个月没有周末，账户很诚实'] }) },
      { text: '拒绝，保住周末', hint: '生活也是资产', run: () => ({
          deltas: { mood: 5, relations: 4 },
          lines: ['你用周末晒了太阳、睡了懒觉、见了朋友'] }) },
      { text: '介绍给更合适的朋友', hint: '人情也是存款', run: () => ({
          deltas: { money: 2500, relations: 9 },
          lines: ['朋友做成了，请你吃了顿好的'] }) },
    ],
  },

  /* ---------------- 恋爱 ---------------- */
  {
    id: 'crush', cat: 'romance', weight: 11, minAge: 18, maxAge: 42, cond: (s) => s.bonds.lover < 60,
    title: '你心动了一次',
    text: '对方递给你一杯热咖啡，指尖碰到的时候，你的心跳漏了半拍。这一年好像突然有了背景音乐。',
    choices: [
      { text: '约对方吃顿饭', hint: '勇敢的人先享受世界', run: () => ({
          deltas: { money: -1500, mood: 9, relations: 3 },
          lines: ['那顿饭吃了三个小时，话比菜多'], bonds: { lover: 25 }, flags: { dating: true },
          special: { title: '开始了一段恋爱', text: '从一杯咖啡，到很多顿饭。' } }) },
      { text: '把心事写进日记', hint: '一个人的海啸', run: () => ({
          deltas: { mood: 4, skill: 1 },
          lines: ['日记本厚了几页，没人知道'] }) },
      { text: '转移注意力去健身', hint: '汗水不骗人', run: () => ({
          deltas: { health: 6, mood: 2 },
          lines: ['你练出了点线条，也忘了那个人'] }) },
    ],
  },
  {
    id: 'anniversary', cat: 'romance', weight: 10, minAge: 20, maxAge: 75, cond: (s) => s.bonds.lover >= 50,
    title: '纪念日到了',
    text: '日历上那个被圈出来的日子又亮了。你在商场里转了四十分钟，思考“实用”和“浪漫”的中间值。',
    choices: [
      { text: '认真准备一次', hint: '仪式感是感情的除锈剂', run: () => ({
          deltas: { money: -3500, mood: 7 },
          lines: ['对方眼睛亮了一下，你也看见了当年的自己'], bonds: { lover: 12 } }) },
      { text: '随口说句祝福', hint: '今年真的很累', run: () => ({
          deltas: { mood: -2 },
          lines: ['对方说“没事”，你们都知道有点事'], bonds: { lover: -8 } }) },
      { text: '一起做顿饭', hint: '烟火气的浪漫', run: () => ({
          deltas: { money: -500, mood: 6 },
          lines: ['厨房里两个人撞来撞去，菜有点咸'], bonds: { lover: 8 } }) },
    ],
  },
  {
    id: 'breakup', cat: 'romance', weight: 5, minAge: 20, maxAge: 58, cond: (s) => s.bonds.lover >= 35,
    title: '有些人走着走着就散了',
    text: '没有争吵，只是一个平常的傍晚，你们同时意识到：这段路走到这里了。',
    choices: [
      { text: '好好道别', hint: '认真结束也是认真爱过', run: () => ({
          deltas: { mood: -9, relations: 4 },
          lines: ['告别很轻，后劲很大'], bonds: { lover: -60 }, flags: { brokeUp: true },
          special: { title: '好好告别了一个人', text: '你把那扇门轻轻关上，没有回头。' } }) },
      { text: '再努力挽回一下', hint: '不甘心也是真心', run: () => ({
          deltas: { mood: -12, health: -5 },
          lines: ['你瘦了五斤，学会了一个人喝酒'], bonds: { lover: 5 } }) },
      { text: '出门走一趟', hint: '世界会接住你', run: () => ({
          deltas: { money: -8000, mood: 1, health: -1 },
          lines: ['你在一个陌生城市的早市吃了很好吃的早餐'], bonds: { lover: -45 }, flags: { travel: true } }) },
    ],
  },
  {
    id: 'blinddate', cat: 'romance', weight: 8, minAge: 24, maxAge: 48, cond: (s) => s.bonds.lover < 30,
    title: '被安排了一场相亲',
    text: '介绍人说“条件很好”，你到了才发现，双方家长都在隔壁桌用余光监督。',
    choices: [
      { text: '认真聊一聊', hint: '万一呢', run: () => ({
          deltas: { mood: 3, money: -300 },
          lines: ['聊到喜欢的电影，发现重合度意外地高'], bonds: { lover: 15 } }) },
      { text: '迅速找借口开溜', hint: '社交电量耗尽', run: () => ({
          deltas: { mood: 3, relations: -2 },
          lines: ['你溜进地铁站的那一刻，松了一口气'] }) },
      { text: '交个朋友也不错', hint: '缘分有很多形态', run: () => ({
          deltas: { relations: 8 },
          lines: ['你们成了会互相推荐好书的朋友'], bonds: { lover: 5 } }) },
    ],
  },

  /* ---------------- 古风 ---------------- */
  {
    id: 'old_book', cat: 'classical', weight: 9, minAge: 18, maxAge: 75,
    title: '旧书市淘到一本泛黄的书',
    text: '书页里夹着一片干透的银杏叶，扉页上一行小楷：“赠君一枝春，愿岁岁长安。”',
    choices: [
      { text: '把它收进书架最显眼处', hint: '有些东西是拿来珍藏的', run: () => ({
          deltas: { mood: 6, skill: 2 },
          lines: ['这一年你把它翻了四遍，每遍都有新发现'] , flags: { bookSaved: true } }) },
      { text: '按书里的地址试着寄回旧主人', hint: '物归原主', run: () => ({
          deltas: { mood: 7, relations: 2 },
          lines: ['一个月后你收到一封回信，字很漂亮'], bonds: { friends: 6 }, flags: { letter: true } }) },
      { text: '抄一句在笔记本首页', hint: '字句养人', run: () => ({
          deltas: { skill: 4, mood: 4 },
          lines: ['抄书的时候，心是静的'] }) },
    ],
  },
  {
    id: 'tea_house', cat: 'classical', weight: 8, minAge: 26, maxAge: 78,
    title: '雨夜，山间小馆的一壶茶',
    text: '你在檐下等雨停，老板递来一杯热茶，慢悠悠地说：“茶要趁热，话要趁早。”',
    choices: [
      { text: '坐下来，慢慢喝完', hint: '时间是可以浪费的', run: () => ({
          deltas: { mood: 7, health: 3, money: -800 },
          lines: ['那壶茶喝了两个小时，雨刚好停了'] }) },
      { text: '和老板聊聊', hint: '人间故事', run: () => ({
          deltas: { relations: 6, mood: 4, skill: 2 },
          lines: ['老板讲了他走南闯北的三十年'] }) },
      { text: '带一饼茶回家', hint: '把余温带走', run: () => ({
          deltas: { money: -1200, mood: 5 },
          lines: ['之后每个加班的深夜，你都泡一杯'], flags: { tea: true } }) },
    ],
  },
  {
    id: 'hand_letter', cat: 'classical', weight: 7, minAge: 40, maxAge: 78,
    title: '收到一封手写的信',
    text: '信封上没有寄件人地址，字迹陌生又熟悉。信里只有一句：“好久不见，别来无恙。”',
    choices: [
      { text: '提笔回信', hint: '见字如面', run: () => ({
          deltas: { mood: 7, skill: 2 },
          lines: ['你们通了整整一年的信'], bonds: { friends: 10 }, flags: { penpal: true },
          special: { title: '有了一个笔友', text: '一年十二封信，从未间断。' } }) },
      { text: '好好收起来', hint: '有些话不必回答', run: () => ({
          deltas: { mood: 4 },
          lines: ['你把它夹在常用的那本书里'] }) },
      { text: '去信里提到的城市走一趟', hint: '赴一场旧约', run: () => ({
          deltas: { money: -6500, mood: 5, health: -1 },
          lines: ['那棵树还在，树下的人已白头'], flags: { travel: true } }) },
    ],
  },
  {
    id: 'full_moon', cat: 'classical', weight: 9, minAge: 18, maxAge: 80,
    title: '今晚的月亮很圆',
    text: '农历十五，云散得干净。月亮挂在楼宇之间，大得不太真实。',
    choices: [
      { text: '打电话给家人', hint: '千里共婵娟', run: () => ({
          deltas: { mood: 5, money: -100 },
          lines: ['妈妈说“我们这也看得到”，你们沉默着笑'], bonds: { family: 10 } }) },
      { text: '一个人安静走走', hint: '月色是免费的', run: () => ({
          deltas: { mood: 4, health: 3 },
          lines: ['你走了五公里，脚步很轻'] }) },
      { text: '拍下来存进相册', hint: '留下证据', run: () => ({
          deltas: { skill: 2, mood: 3 },
          lines: ['年底翻相册，最满意的是这一张'], flags: { photo: true } }) },
    ],
  },

  /* ---------------- 生活 ---------------- */
  {
    id: 'family_call', cat: 'life', weight: 14, minAge: 18, maxAge: 80,
    title: '家里来电话，问你什么时候回家',
    text: '“随便聊聊。”妈妈说。你知道她就是想看看你。',
    choices: [
      { text: '请个假回去一趟', hint: '见一面少一面', run: () => ({
          deltas: { money: -3500, mood: 6 },
          lines: ['爸爸做了一桌子菜，全是小时候的味道'], bonds: { family: 12 } }) },
      { text: '寄点东西回去', hint: '心意先到', run: () => ({
          deltas: { money: -1600, mood: 3 },
          lines: ['妈妈拍了照片：围巾、茶叶、一盒胃药'], bonds: { family: 6 } }) },
      { text: '说“下周就回”', hint: '善意的谎言', run: () => ({
          deltas: { mood: -3 },
          lines: ['“下周”是这个月第四次出现'], bonds: { family: -4 } , flags: { distant: true } }) },
    ],
  },
  {
    id: 'parents_health', cat: 'life', weight: 9, minAge: 34, maxAge: 72,
    title: '父母的身体查出了点小问题',
    text: '电话那头的语气很轻松，说“不严重，定期复查就行”。你听出了那句没说出口的“别担心”。',
    choices: [
      { text: '陪他们去复查', hint: '陪床也是陪伴', run: () => ({
          deltas: { money: -9000, mood: -4, health: -2 },
          lines: ['医院走廊的椅子很硬，你坐了一整天'], bonds: { family: 15 }, flags: { caregiving: true } }) },
      { text: '安排更好的检查和照护', hint: '用钱换安心', run: () => ({
          deltas: { money: -16000, mood: -2 },
          lines: ['你给他们约了专家号，定了长期的体检'], bonds: { family: 9 } }) },
      { text: '嘴上说没事，心里记着', hint: '成年人的两难', run: () => ({
          deltas: { mood: -7 },
          lines: ['这一年你常在看病 App 的搜索记录里出现'], bonds: { family: 4 }, flags: { worry: true } }) },
    ],
  },
  {
    id: 'moving_city', cat: 'life', weight: 8, minAge: 18, maxAge: 48,
    title: '“要不要搬去另一个城市”的念头又冒出来',
    text: '深夜刷到那座城市的租房信息，江景、便宜、陌生的街道。你的手指在屏幕上停了很久。',
    choices: [
      { text: '搬，趁还搬得动', hint: '世界那么大', run: () => ({
          deltas: { money: -13000, mood: 9, relations: -12, skill: 3 },
          lines: ['你在新城市的第一个早晨迷了路，却很开心'], flags: { movedCity: true, travel: true },
          special: { title: '搬到了另一座城市', text: '陌生的街道，新鲜的早餐，重来一次的勇气。' } }) },
      { text: '留下，把这里过熟', hint: '熟悉也是财富', run: () => ({
          deltas: { mood: -2, relations: 5 },
          lines: ['菜市场阿姨开始给你留最新鲜的排骨'] }) },
      { text: '先短租住一个月试试', hint: '低成本试错', run: () => ({
          deltas: { money: -6000, mood: 4 },
          lines: ['一个月后你回来了，带回一冰箱特产'], flags: { travel: true } }) },
    ],
  },
  {
    id: 'neighbor_kid', cat: 'life', weight: 8, minAge: 28, maxAge: 72,
    title: '邻居家小孩来借一把螺丝刀',
    text: '小男孩抱着坏了的风车，仰头问你：“叔叔/阿姨，你会修东西吗？”',
    choices: [
      { text: '出门和他放一下午风筝', hint: '童年是互相的', run: () => ({
          deltas: { mood: 7, health: 4, relations: 4 },
          lines: ['你跑得比他还快，喘得比他还厉害'] }) },
      { text: '在家睡觉，让他自己玩', hint: '今天真的累了', run: () => ({
          deltas: { mood: 3, health: 3 },
          lines: ['你睡了一个没有梦的午觉'] }) },
      { text: '认真教他修东西', hint: '手艺的传承', run: () => ({
          deltas: { skill: 4, relations: 6, mood: 3 },
          lines: ['风车重新转起来的时候，他叫得比谁都响'] }) },
    ],
  },
  {
    id: 'street_performer', cat: 'life', weight: 7, minAge: 18, maxAge: 70,
    title: '地铁通道里，有人在拉小提琴',
    text: '琴盒敞开着，里面有几枚硬币。人来人往，他的曲子没有断。',
    choices: [
      { text: '坐下来听完一首', hint: '给彼此五分钟', run: () => ({
          deltas: { mood: 5 },
          lines: ['曲子结束的时候，通道里居然有掌声'] }) },
      { text: '放下一点钱，继续赶路', hint: '善意不需要仪式', run: () => ({
          deltas: { money: -50, mood: 3, relations: 1 },
          lines: ['他朝你点了点头，你回以一个点头'] }) },
      { text: '跟他聊几句，问问故事', hint: '人间观察', run: () => ({
          deltas: { mood: 4, relations: 3, skill: 2 },
          lines: ['他原来是音乐学院毕业的，现在这样也很快乐'] }) },
    ],
  },

  /* ---------------- 身心（低状态补救） ---------------- */
  {
    id: 'body_signal', cat: 'health', noCooldown: true, weight: (s) => 8 + Math.max(0, 50 - s.attrs.health) * 1.6, minAge: 20, maxAge: 80,
    cond: (s) => s.attrs.health < 50,
    title: '身体开始发出信号',
    text: '爬四楼要歇两次，换季就感冒，体检报告上出现了几个箭头。身体在用它的方式跟你说话。',
    choices: [
      { text: '认真去做一次体检', hint: '搞清楚状况', run: () => ({
          deltas: { money: -2200, health: 14, mood: -2 },
          lines: ['医生说“问题不大，但要规律作息”，你居然松了口气'], flags: { checkup: true } }) },
      { text: '早睡，先把觉补回来', hint: '最便宜的治疗', run: () => ({
          deltas: { health: 4, mood: -2 },
          lines: ['你把手机放在了客厅'] }) },
      { text: '办张卡，认真锻炼', hint: '长期主义', run: () => ({
          deltas: { money: -3200, health: 8, mood: 3 },
          lines: ['今年你在跑步机上看了三部剧'], flags: { gym: true } }) },
    ],
  },
  {
    id: 'credit_bill', cat: 'health', noCooldown: true, weight: (s) => 6 + Math.max(0, -s.attrs.money / 20000) * 6, minAge: 18, maxAge: 80,
    cond: (s) => s.attrs.money < -5000,
    title: '信用卡账单追了上来',
    text: '短信提示余额不足的那一刻，你正在超市结账。后面的队伍安静地往前挪了一格。',
    choices: [
      { text: '接些零工补贴开支', hint: '先把窟窿堵上', run: () => ({
          deltas: { money: 13000, health: -5, mood: -4 },
          lines: ['周末变成了工作日，账户终于回正'] }) },
      { text: '向家人开口', hint: '家是退路', run: () => ({
          deltas: { money: 16000, mood: -8 },
          lines: ['钱到账的同时，你心里某个地方塌了一块'], bonds: { family: -6 }, flags: { debt: true } }) },
      { text: '砍掉一切订阅和外卖', hint: '极限节流', run: () => ({
          deltas: { money: 5000, mood: -3 },
          lines: ['这个月你吃了很多面条，但账单真的变小了'], flags: { frugal: true } }) },
    ],
  },
  {
    id: 'low_spirit', cat: 'health', noCooldown: true, weight: (s) => 8 + Math.max(0, 42 - s.attrs.mood) * 1.6, minAge: 18, maxAge: 80,
    cond: (s) => s.attrs.mood < 42,
    title: '很长一段时间提不起劲',
    text: '不是难过，是没有力气。曾经喜欢的事情排在列表里，你划过去，没有点开。',
    choices: [
      { text: '请个长假，好好休息', hint: '停下来不是退步', run: () => ({
          deltas: { health: 8, mood: 10, money: -12000 },
          lines: ['你在阳台晒了一个月的太阳'], flags: { rest_year: true } }) },
      { text: '找朋友把话说开', hint: '说出来会轻一点', run: () => ({
          deltas: { relations: 8, mood: 7 },
          lines: ['朋友没有给建议，只是陪你走了很久'], bonds: { friends: 8 } }) },
      { text: '预约一次心理咨询', hint: '专业的事交给专业的人', run: () => ({
          deltas: { money: -2000, mood: 12 },
          lines: ['咨询师说“你已经做得很好了”，你哭了十分钟'], flags: { therapy: true },
          special: { title: '第一次走进心理咨询室', text: '原来“求助”本身就需要勇气。' } }) },
    ],
  },

  /* ---------------- 修仙线 ---------------- */
  /* patch103：immortal_encounter（旧都市修仙入口）已删除——
   它会和 meet_old_man 重复触发灵根测试，且 urbanCultivator 与「抛弃凡尘」矛盾。 */

  {
    id: 'x_lianqi', cat: 'classical', weight: 12, minAge: 15, maxAge: 200,
    cond: (s) => s.flags.xianxia && (s.cultivationLevel || 0) >= 1 && (s.cultivationLevel || 0) < 10,
    title: '气感初现',
    text: '打坐时，你忽然感到一股暖流在经脉里流动。老道说："这就是气感，你入了练气期了。"',
    choices: [
      { text: '继续打坐', run: () => ({ deltas: { skill: 5, mood: 3 }, lines: ['你感到前所未有的清明'] }) },
    ],
  },
  {
    id: 'x_zhuji', cat: 'classical', weight: 8, minAge: 20, maxAge: 250,
    cond: (s) => s.flags.xianxia && (s.cultivationLevel || 0) >= 10 && (s.cultivationLevel || 0) < 20,
    title: '筑基丹成',
    text: '老道给了你一颗丹药。服下后，你浑身发烫，三天三夜后醒来，只觉耳目一新。',
    choices: [
      { text: '稳固道基', run: () => ({ deltas: { health: 10, skill: 5 }, lines: ['你的道基稳了，凡人的病再也难侵'] }) },
    ],
  },
  {
    id: 'x_jindan', cat: 'classical', weight: 6, minAge: 30, maxAge: 300,
    cond: (s) => s.flags.xianxia && (s.cultivationLevel || 0) >= 20 && (s.cultivationLevel || 0) < 35,
    title: '金丹凝成',
    text: '丹田处那团气终于凝成了一颗金色的丹丸。老道跪了下来："恭喜道友，金丹大成！"',
    choices: [
      { text: '金丹不坏', run: () => ({ deltas: { health: 15, mood: 10 }, lines: ['你寿元大增，已近两百岁'] }) },
    ],
  },
  {
    id: 'x_alchemy', cat: 'classical', weight: 15, minAge: 15, maxAge: 300,
    cond: (s) => s.flags.xianxia,
    title: '炼丹',
    text: '老道教你辨认草药，开了个小丹炉。你守了三天三夜，开炉那一刻香气扑鼻。',
    choices: [
      { text: '守炉三日', hint: '开炉那一刻', run: ({ rng, draft }) => {
          const p = clamp01(0.30 + lv(draft, 'skill') * 0.40 + ((draft.cultivationLevel || 0) / 300));
          if (rng.chance(p)) return { deltas: { health: 8, skill: 5 }, lines: ['一颗通体圆润的丹药躺在炉底', '老道点头：你有炼丹的天赋'], flags: { alchemyOk: true } };
          return { deltas: { health: -8, mood: -3, money: -500 }, lines: ['丹炉"砰"地一声炸了', '你眉毛都烧没了'] };
        } },
    ],
  },
  {
    id: 'x_beast', cat: 'classical', weight: 12, minAge: 18, maxAge: 300,
    cond: (s) => s.flags.xianxia && (s.cultivationLevel || 0) >= 5,
    title: '山中遇妖',
    text: '闭关时山林里传来吼声。一只白毛巨狼拦住了你的去路，眼睛发着绿光。',
    choices: [
      { text: '拔剑相斗', hint: '凶险', run: () => ({
          deltas: { health: -10, skill: 5, mood: 5 },
          lines: ['你和巨狼斗了三百回合', '最后它受伤退走，你也挂了彩', '此战之后你修为大进'] }) },
      { text: '绕路走', hint: '稳妥', run: () => ({
          deltas: { mood: -2 },
          lines: ['你悄悄退走了', '后来听说那片山吞了好几个修士'] }) },
    ],
  },
  {
    id: 'x_duel', cat: 'classical', weight: 10, minAge: 20, maxAge: 300,
    cond: (s) => s.flags.xianxia && (s.cultivationLevel || 0) >= 8,
    title: '同道切磋',
    text: '另一个修士来访，说要和你比划比划。两人飞到山顶，云气在脚下翻涌。',
    choices: [
      { text: '应战', hint: '飞到山顶', run: ({ rng, draft }) => {
          const p = clamp01(0.25 + ((draft.cultivationLevel || 0) / 140) + lv(draft, 'skill') * 0.25);
          if (rng.chance(p)) return { deltas: { skill: 6, mood: 8, relations: 5 }, lines: ['你一招破了他的剑', '周围围观的修士都记住了你'], flags: { duelWin: true } };
          return { deltas: { skill: 4, mood: -4 }, lines: ['你输了半招', '回去后闭关多了三年'] };
        } },
    ],
  },
  {
    id: 'x_tribulation', cat: 'classical', weight: 5, minAge: 50, maxAge: 500,
    cond: (s) => s.flags.xianxia && (s.cultivationLevel || 0) >= 35,
    title: '天劫',
    text: '修炼到高处，天上忽然乌云密布，雷电交加。老道脸色大变："这是天劫！扛过去就一步登天，扛不过去……"',
    choices: [
      { text: '硬抗天劫', hint: '九死一生', run: () => ({
          deltas: { health: -20, skill: 15, mood: 15 },
          lines: ['你迎着第九道雷劫冲了上去', '金光散尽，你还活着', '方圆百里灵气都朝你涌来'] }) },
      { text: '布阵躲避', hint: '稳妥', run: () => ({
          deltas: { health: -5, skill: 3 },
          lines: ['你用了老道给的护身符', '天雷劈了三个时辰才散', '修为进得慢，但命保住了'] }) },
    ],
  },
  {
    id: 'x_land', cat: 'classical', weight: 8, minAge: 16, maxAge: 300,
    cond: (s) => s.flags.xianxia,
    title: '发现灵脉',
    text: '你在后山打坐时感到一股浓郁灵气从地下冒出。顺着找去，竟是一条小型灵脉！',
    choices: [
      { text: '在此结庐修炼', hint: '事半功倍', run: () => ({
          deltas: { skill: 8, health: 5 },
          lines: ['你在灵脉旁搭了个草庐', '这一年修炼速度快了三倍'],
          flags: { hasLand: true } }) },
    ],
  },
  {
    id: 'x_master_dies', cat: 'classical', weight: 3, minAge: 30, maxAge: 300,
    cond: (s) => s.flags.xianxia && (s.cultivationLevel || 0) >= 10,
    title: '老道羽化',
    text: '老道把你叫到跟前，递给你一本泛黄的书册："我道基已成，要走了。接下来的路，你自己走。"说完闭目而逝。',
    choices: [
      { text: '接过衣钵', hint: '继承道统', run: () => ({
          deltas: { skill: 10, mood: -5 },
          lines: ['你跪在老道坟前磕了三个头', '那本书册里记着他一生的心得', '从此你就是一个人修道了'] }) },
    ],
  },
  {
    id: 'x_temptation', cat: 'classical', weight: 8, minAge: 18, maxAge: 300,
    cond: (s) => s.flags.xianxia,
    title: '红尘炼心',
    text: '老道说你修为够了但心境不够，把你赶下山，让你在红尘里待一年。你又看到了那个熟悉的世界。',
    choices: [
      { text: '好好体验红尘', hint: '心境提升', run: () => ({
          deltas: { mood: 10, relations: 8, skill: 3 },
          lines: ['你吃了街边的面，看了场夕阳', '心境忽然通透了'] }) },
      { text: '心不在焉', hint: '只想回去修炼', run: () => ({
          deltas: { mood: 2, skill: -2 },
          lines: ['你满脑子都是修炼', '一年后老道摇头：尘缘未了'] }) },
    ],
  },

  /* ---------------- 高考与大学 ---------------- */
  {
    // patch105：出分已合并进 gaokao_exam，这个独立事件不再触发（保留代码以防回退）
    id: 'gaokao', cat: 'work', weight: 25, minAge: 17, maxAge: 18, force: true,
    cond: () => false,
    title: '高考出分',
    text: '查分网站卡了十分钟，数字跳出来那一刻你屏住了呼吸。',
    choices: [
      { text: '查分', hint: '数字跳出来那一刻', run: ({ rng, draft }) => {
          const score = gaokaoScore(draft, rng);
          const uni = universityOf(score);
          const mood = score >= 600 ? 10 : score >= 500 ? 4 : score >= 430 ? -3 : -10;
          const words = score >= 630 ? '你考出了高中三年最好的成绩' : score >= 530 ? '分数够上一个不错的学校' : score >= 450 ? '有学上就行' : '接下来的路要更努力了';
          return {
            deltas: { mood },
            lines: [`你的高考分数是 ${score} 分`, `录取层次：${uni}`, '志愿表填了又改，改了又填'],
            flags: { gaokaoDone: true, university: uni, gaokaoScore: score },
            special: { title: `高考 ${score} 分`, text: words },
          };
        } },
    ],
  },
  {
    id: 'university_life', cat: 'life', weight: 20, minAge: 18, maxAge: 22, force: true,
    cond: (s) => s.flags.gaokaoDone && !s.flags.graduated,
    title: '大学生活',
    text: '离开家住校，第一次自己安排所有时间。室友、食堂、图书馆、网吧，你的大学开场是哪一种？',
    choices: [
      { text: '认真学习，拿奖学金', hint: '学霸路线', run: () => ({
          deltas: { skill: 8, mood: -2, money: 2000 },
          lines: ['你的GPA很高', '奖学金到账了'] }) },
      { text: '社团和恋爱为主', hint: '体验派', run: () => ({
          deltas: { relations: 10, mood: 8, money: -500 },
          lines: ['你加了两个社团', '认识了很多有趣的人'] }) },
      { text: '翘课打游戏', hint: '放纵', run: () => ({
          deltas: { mood: 6, skill: -6, health: -2 },
          lines: ['你挂了两科', '补考费交了不少'], flags: { almostFailed: true } }) },
    ],
  },
  {
    id: 'grad_decision', cat: 'work', weight: 18, minAge: 21, maxAge: 26, force: true,
    cond: (s) => s.flags.gaokaoDone && !s.flags.graduated && !s.flags.pathDecided,
    title: '毕业去向',
    text: '大四了，宿舍里大家都在讨论以后。你要走哪条路？',
    choices: [
      { text: '直接找工作', hint: '进入职场', run: () => ({
          deltas: { mood: 0 },
          lines: ['你开始改简历', '秋招大战即将开始'],
          flags: { path: 'job', pathDecided: true } }) },
      { text: '考研', hint: '再读2.5年', run: () => ({
          deltas: { mood: -3, skill: 5 },
          lines: ['你搬进了自习室', '接下来的一年是孤独的'],
          flags: { path: 'grad', pathDecided: true, gradSchool: true } }) },
      { text: '考公', hint: '铁饭碗', run: () => ({
          deltas: { mood: -2 },
          lines: ['你买了一堆考公书', '千军万马过独木桥'],
          flags: { path: 'civil', pathDecided: true } }) },
      { text: '先玩一年再说', hint: 'gap', run: () => ({
          deltas: { mood: 8, money: -3000 },
          lines: ['你去了趟云南', '回来再说工作的事'],
          flags: { path: 'gap', pathDecided: true } }) },
    ],
  },
  {
    id: 'job_hunt', cat: 'work', weight: 20, minAge: 22, maxAge: 28, force: true,
    cond: (s) => s.flags.path === 'job' && !s.flags.employed && !s.flags.graduated,
    title: '秋招',
    text: '你投了二十份简历，收到五个面试。坐在面试官对面，你手心出汗。',
    choices: [
      { text: '投简历、跑面试', hint: '二十份简历，五个面试', run: ({ rng, draft }) => {
          const js = jobScore(draft, rng);
          draft.flags.jobScore = Math.round(js);
          if (js >= 115) return { deltas: { mood: 10, money: 5000 }, lines: ['面试官对你很满意', '起薪不错，在大城市勉强活得体面'], flags: { graduated: true, employed: true, jobType: 'bigtech' }, special: { title: '拿到大厂 offer', text: '第一份工作，虽然累但是新开始。' } };
          if (js >= 88) return { deltas: { mood: 6, money: 3000 }, lines: ['朝九晚五，食堂很好', '起薪一般，但很稳'], flags: { graduated: true, employed: true, jobType: 'soe' } };
          if (js >= 62) return { deltas: { mood: 3, money: 2000 }, lines: ['什么都得干，但是学得多'], flags: { graduated: true, employed: true, jobType: 'small' } };
          return { deltas: { mood: -8, money: -2000 }, lines: ['你投出去的简历大多没有回音', '先随便找个工作过渡'], flags: { graduated: true, employed: true, jobType: 'temp' }, special: { title: '没拿到满意的 offer', text: '先干着，再慢慢找。' } };
        } },
    ],
  },
  /* —— 考研线 —— */
  {
    id: 'grad_school', cat: 'work', weight: 18, minAge: 23, maxAge: 28, force: true,
    cond: (s) => s.flags.gradSchool && !s.flags.graduated,
    title: '研究生生活',
    text: '实验室、导师、论文、投稿。你的硕士生涯在组会和 deadline 之间穿梭。',
    choices: [
      { text: '在实验室熬下去', hint: '组会与 deadline 之间', run: ({ rng, draft }) => {
          const p = clamp01(0.40 + lv(draft, 'skill') * 0.45);
          if (rng.chance(p)) return { deltas: { skill: 15, mood: 5, money: 2000 }, lines: ['论文过了，答辩很顺利', '硕士学历到手，起薪高了一截'], flags: { graduated: true, employed: false, jobType: 'master', masterDegree: true } };
          return { deltas: { skill: 8, mood: -5, money: -1000 }, lines: ['论文大修了两次', '晚了半年才毕业'], flags: { graduated: true, employed: false, jobType: 'master', masterDegree: true } };
        } },
    ],
  },
  /* —— 考公线 —— */
  {
    id: 'civil_exam', cat: 'work', weight: 25, minAge: 22, maxAge: 28, force: true,
    cond: (s) => s.flags.path === 'civil' && !s.flags.employed,
    title: '考公结果',
    text: '笔试、面试、体检、政审……你等了三个月，结果终于出来了。',
    choices: [
      { text: '等结果', hint: '笔试、面试、体检、政审', run: ({ rng, draft }) => {
          const uni = draft.flags.university;
          const p = clamp01(0.06 + lv(draft, 'skill') * 0.28 + lv(draft, 'relations') * 0.14 + (uni === '985' ? 0.10 : uni === '一本' ? 0.06 : 0));
          if (rng.chance(p)) return { deltas: { mood: 8, money: 3000 }, lines: ['你考上了老家的公务员', '工资不高但稳定，朝九晚五'], flags: { graduated: true, employed: true, jobType: 'civil' }, special: { title: '上岸了', text: '千军万马过独木桥，你过去了。' } };
          return { deltas: { mood: -6, money: -2000 }, lines: ['差了 0.5 分', '你决定先找个工作'], flags: { graduated: true, employed: false } };
        } },
    ],
  },
  /* —— 试用期 —— */
  {
    id: 'probation', cat: 'work', weight: 20, minAge: 22, maxAge: 28, force: true,
    cond: (s) => s.flags.employed && !s.flags.probationDone,
    title: '试用期考核',
    text: '入职三个月了，领导找你谈话。你心跳加速，不知道结果如何。',
    choices: [
      { text: '等领导谈话', hint: '入职三个月了', run: ({ rng, draft }) => {
          const p = clamp01(0.42 + lv(draft, 'skill') * 0.35 + Math.min(0.18, (draft.counts.work || 0) * 0.05));
          if (rng.chance(p)) return { deltas: { mood: 5, money: 1000 }, lines: ['领导说你表现不错', '转正了，工资涨了一点'], flags: { probationDone: true } };
          return { deltas: { mood: -8, health: -3 }, lines: ['你加了三个月班', '终于保住了工作', '这份工作比想象中累'], flags: { probationDone: true } };
        } },
    ],
  },
  /* —— 跳槽 —— */
  {
    id: 'job_hop', cat: 'work', weight: 12, minAge: 25, maxAge: 45,
    cond: (s) => s.flags.employed && s.flags.probationDone && (s.counts.work || 0) >= 3,
    title: '有猎头找你',
    text: 'LinkedIn上有人给你发消息："有个机会想聊聊吗？"你现在的工作其实还行。',
    choices: [
      { text: '跳槽，涨薪30%', hint: '新机会', run: () => ({
          deltas: { mood: 5, money: 20000, skill: 3 },
          lines: ['新公司薪资涨了三成', '但要重新适应环境'],
          flags: { changedJob: true } }) },
      { text: '留在原公司', hint: '稳定', run: () => ({
          deltas: { mood: 1 },
          lines: ['你拒绝了猎头', '现在的工作虽然平淡但熟门熟路'] }) },
    ],
  },
  /* —— 被裁 —— */
  {
    id: 'laid_off', cat: 'work', weight: 8, minAge: 25, maxAge: 50,
    cond: (s) => s.flags.employed && s.flags.jobType === 'bigtech' && !s.flags.laidOffOnce,
    title: '部门优化',
    text: 'HR把你叫到会议室，桌上放着一个纸箱。"公司业务调整，你的岗位……"',
    choices: [
      { text: '拿赔偿走人', hint: 'N+1', run: () => ({
          deltas: { mood: -10, money: 30000, health: -3 },
          lines: ['你抱着纸箱走出写字楼', '赔偿倒是给得痛快', '接下来要重新找工作了'],
          flags: { employed: false, laidOffOnce: true } }) },
    ],
  },

  /* —— 通用求职兜底：考研/考公失败/gap/被裁 后重新就业 —— */
  {
    id: 'first_job', cat: 'work', weight: 80, noCooldown: true, minAge: 23, maxAge: 45,
    cond: (s) => s.flags.gaokaoDone && !s.flags.employed && s.age >= 23 && (!s.flags.gradSchool || s.flags.graduated),
    title: '重新找工作',
    text: '简历改到第七版，面试排满了两个星期。你需要一份稳定的收入。',
    choices: [
      { text: '进了大厂', hint: '高薪但累', run: () => ({ deltas: { mood: 6, money: 5000 }, lines: ['工资高，加班也多'], flags: { employed: true, jobType: 'bigtech' } }) },
      { text: '去了国企', hint: '稳定', run: () => ({ deltas: { mood: 4, money: 3000 }, lines: ['朝九晚五，食堂很好'], flags: { employed: true, jobType: 'soe' } }) },
      { text: '进了小公司', hint: '成长快', run: () => ({ deltas: { mood: 2, money: 2000 }, lines: ['什么都得干'], flags: { employed: true, jobType: 'small' } }) },
      { text: '先做份过渡工作', hint: '有收入再说', run: () => ({ deltas: { mood: -3, money: 1500 }, lines: ['先干着，再慢慢找'], flags: { employed: true, jobType: 'temp' } }) },
    ],
  },

  /* ================= 大规模扩充：生活细节 ================= */
  {
    id: 'buy_phone', cat: 'life', weight: 8, minAge: 18, maxAge: 50,
    title: '换手机',
    text: '旧手机卡得不行了，你在新品发布会上坐了两个小时，决定换。',
    choices: [
      { text: '买最新款', run: () => ({ deltas: { money: -8000, mood: 5 }, lines: ['新手机拍照真清楚', '吃了一个月土'] }) },
      { text: '买旧款降价机', run: () => ({ deltas: { money: -3000, mood: 2 }, lines: ['性价比高，不追潮流'] }) },
    ],
  },
  {
    // patch88：加金钱门槛（原来没门槛，钱不够也扣 12 万）
    // patch140：门槛提到扣款的 1.5 倍（120000 → 180000），买完还剩 6 万缓冲
    id: 'buy_car', cat: 'life', weight: 6, minAge: 22, maxAge: 60, cond: (s) => (s.attrs.money || 0) >= 180000,
    title: '买车',
    text: '每次下雨天打不到车你就想：还是有辆车吧。',
    choices: [
      { text: '买了', run: () => ({ deltas: { money: -120000, mood: 6 }, lines: ['有车了，周末可以周边游', '但停车费是真贵'], flags: { hasCar: true } }) },
      { text: '再等等', run: () => ({ deltas: { mood: 0 }, lines: ['公共交通也挺好'] }) },
    ],
  },
  {
    // patch88：加金钱门槛——原来没门槛，钱不够也扣 12 万首付，直接扣到 -30000 地板。
    id: 'buy_house', cat: 'life', weight: 14, minAge: 25, maxAge: 50, force: true,
    cond: (s) => (s.attrs.money || 0) >= 120000,
    title: '买房',
    text: '跑了三个月楼盘，你终于选了一套。签合同那天手都在抖。',
    choices: [
      // patch139：首付 12万 → 8万。门槛仍是 12 万，所以买完还剩 4 万缓冲。
      { text: '上车了', hint: '首付 8 万，剩下贷款慢慢还', run: () => ({ deltas: { money: -80000, mood: 8, health: -5 }, lines: ['首付交完，你成了房奴', '但终于有自己的家了', '房贷要还很多年'], flags: { hasHouse: true, mortgage: true } }) },
      { text: '再观望', run: () => ({ deltas: { mood: -2 }, lines: ['房价还在涨，你也在等'] }) },
    ],
  },
  {
    id: 'hospital', cat: 'health', weight: 8, minAge: 18, maxAge: 90,
    title: '去医院',
    text: '你不舒服了一个星期，终于去了医院。排队两小时，看病五分钟。',
    choices: [
      { text: '去看医生', hint: '排队两小时，看病五分钟', run: ({ rng, draft }) => {
          const t = clamp01(lv(draft, 'health') * 0.85 + 0.05 + rng.float(-0.12, 0.12));
          if (t >= 0.50) return { deltas: { money: -500, mood: 2 }, lines: ['医生说没事，多喝热水'] };
          return { deltas: { money: -2000, mood: -4, health: -2 }, lines: ['你有点担心', '约了下周复查'] };
        } },
    ],
  },
  {
    id: 'checkup', cat: 'health', weight: 14, minAge: 30, maxAge: 90,
    title: '年度体检',
    text: '单位组织体检。你看着报告上密密麻麻的箭头，有点慌。',
    choices: [
      { text: '做体检', hint: '单位组织的', run: ({ rng, draft }) => {
          const t = clamp01(lv(draft, 'health') * 0.85 + 0.05 + rng.float(-0.12, 0.12));
          if (t >= 0.55) return { deltas: { mood: 5, health: 2 }, lines: ['报告干干净净，医生说继续保持'], flags: { checkup: true } };
          return { deltas: { health: -5, mood: -3, money: -1000 }, lines: ['脂肪肝、血脂偏高', '医生让你少喝酒多运动'], flags: { checkup: true } };
        } },
    ],
  },
  {
    id: 'spring_festival', cat: 'life', weight: 15, minAge: 16, maxAge: 90,
    title: '过年',
    text: '春运、挤火车、一桌子菜、红包、春晚。这是一年里最隆重的日子。',
    choices: [
      { text: '回家过年', run: () => ({ deltas: { mood: 8, relations: 5, money: -1000 }, lines: ['家里很热闹', '你吃胖了三斤'], bonds: { family: 8 } }) },
      { text: '留在工作地', run: () => ({ deltas: { mood: -3, money: 500 }, lines: ['三倍工资是不错，但有点想家'] }) },
    ],
  },
  {
    id: 'spring_festival_kid', cat: 'life', weight: 15, minAge: 0, maxAge: 15,
    title: '过年收红包',
    text: '穿新衣服、磕头、拿红包、放鞭炮。你最盼的就是这几天。',
    choices: [
      { text: '把红包交给爸妈', run: () => ({ deltas: { mood: 3, relations: 2 }, lines: ['爸妈说帮你存起来'] }) },
      { text: '偷偷留一点买糖', run: () => ({ deltas: { mood: 5, money: 50 }, lines: ['你买了一把小鞭炮'] }) },
    ],
  },
  {
    id: 'class_reunion', cat: 'funny', weight: 6, minAge: 28, maxAge: 60,
    title: '同学会',
    text: '班长在群里发了通知。十年了，大家现在都怎么样了？',
    choices: [
      { text: '去了，混得还行', run: () => ({ deltas: { mood: 3, relations: 5 }, lines: ['你发现大家都差不多', '谁也没比谁强多少'] }) },
      { text: '没去', run: () => ({ deltas: { mood: -2 }, lines: ['你翻了翻大家的朋友圈', '算了'] }) },
    ],
  },
  {
    id: 'relative_push', cat: 'funny', weight: 8, minAge: 25, maxAge: 40,
    title: '亲戚催婚',
    text: '饭桌上，三姨开始了："有对象了吗？你看隔壁小王都二胎了。"',
    choices: [
      { text: '打哈哈过去', run: () => ({ deltas: { mood: -3 }, lines: ['你嗯嗯啊啊应付过去'] }) },
      { text: '直接回怼', run: () => ({ deltas: { mood: 3, relations: -3 }, lines: ['"我自己的事我有数"', '饭桌安静了一秒'] }) },
    ],
  },
  {
    id: 'friend_wedding', cat: 'life', weight: 8, minAge: 22, maxAge: 50, maxTimes: 5,
    title: '好朋友结婚',
    text: '你最好的朋友邀请你当伴郎/伴娘。婚礼上你哭了。',
    choices: [
      { text: '去当伴郎／伴娘', run: () => ({ deltas: { mood: 6, relations: 5, money: -500 }, lines: ['你看着TA走向另一半', '想起你们刚认识的时候'] }) },
    ],
  },
  {
    id: 'concert', cat: 'funny', weight: 6, minAge: 16, maxAge: 45,
    title: '看演唱会',
    text: '你高中时喜欢的乐队要开巡演了。你抢了票。',
    choices: [
      { text: '挤进人群', run: () => ({ deltas: { mood: 10, money: -800, health: -1 }, lines: ['你喊到嗓子哑', '青春又回来了'] }) },
    ],
  },
  {
    id: 'learn_guitar', cat: 'life', weight: 5, minAge: 15, maxAge: 50,
    title: '学乐器',
    text: '你买了把吉他，想在30岁前学会一首曲子。',
    choices: [
      { text: '坚持下来了', run: () => ({ deltas: { skill: 5, mood: 5, money: -2000 }, lines: ['你能弹唱一首歌了', '虽然还很生涩'] }) },
      { text: '吃灰了', run: () => ({ deltas: { mood: -2, money: -800 }, lines: ['吉他在角落落灰', '你太忙了'] }) },
    ],
  },
  {
    id: 'gym', cat: 'health', weight: 13, minAge: 20, maxAge: 60,
    title: '办了健身卡',
    text: '你看着肚子上的肉，一咬牙办了年卡。',
    choices: [
      { text: '真去了', run: () => ({ deltas: { health: 8, mood: 3, money: -2000 }, lines: ['你每周去三次', '三个月后马甲线初现'], flags: { gym: true } }) },
      { text: '只去了三次', run: () => ({ deltas: { money: -2000, mood: -2 }, lines: ['年卡平均每次300块', '你懂了'] }) },
    ],
  },
  {
    id: 'insomnia', cat: 'health', weight: 8, minAge: 25, maxAge: 90,
    title: '失眠',
    text: '凌晨三点你还睁着眼。天花板上的纹路你都数清楚了。',
    choices: [
      { text: '数羊到天亮', run: () => ({ deltas: { health: -3, mood: -5 }, lines: ['第二天你像个幽灵'] }) },
      { text: '起来看剧', run: () => ({ deltas: { mood: 2, health: -2 }, lines: ['你一口气看了三集', '虽然不健康但是爽'] }) },
    ],
  },
  {
    id: 'hair_loss', cat: 'health', weight: 6, minAge: 25, maxAge: 50,
    title: '脱发',
    text: '洗头时地漏又堵了。你看着手里的头发，陷入沉思。',
    choices: [
      { text: '买防脱洗发水', run: () => ({ deltas: { money: -300, mood: -2 }, lines: ['心理作用大于实际作用'] }) },
      { text: '剃短了', run: () => ({ deltas: { mood: 1, money: -50 }, lines: ['算了，短了也挺好'] }) },
    ],
  },
  {
    id: 'travel', cat: 'life', weight: 8, minAge: 18, maxAge: 70,
    title: '旅行',
    text: '你请了年假，去了一个一直想去的地方。',
    choices: [
      { text: '收拾行李出发', run: () => ({ deltas: { mood: 10, health: 3, money: -5000 }, lines: ['你拍了一千张照片', '回来像换了个人'], flags: { travel: true } }) },
    ],
  },
  {
    id: 'pet_dog', cat: 'life', weight: 7, minAge: 18, maxAge: 70,
    title: '养了只猫/狗',
    text: '你在路边看到一只流浪猫/狗，它跟着你回了家。',
    choices: [
      { text: '正式收养', run: () => ({ deltas: { mood: 8, money: -1000, relations: 2 }, lines: ['它现在占了你一半的床'], bonds: { pet: 80 }, flags: { pet: true } }) },
    ],
  },
  {
    id: 'colleague_dinner', cat: 'work', weight: 10, minAge: 22, maxAge: 60, cond: (s) => s.flags.employed,
    title: '部门聚餐',
    text: '领导说"今天大家放松"。结果敬酒敬到十点。',
    choices: [
      { text: '陪好领导', run: () => ({ deltas: { relations: 5, health: -3, money: -200 }, lines: ['你喝多了', '但领导记住你了'] }) },
      { text: '提前溜了', run: () => ({ deltas: { mood: 2, relations: -2 }, lines: ['你说家里有事', '耳根子清净'] }) },
    ],
  },
  {
    id: 'year_end_bonus', cat: 'work', weight: 8, minAge: 22, maxAge: 60, cond: (s) => s.flags.employed,
    title: '年终奖',
    text: '财务群里发了通知。你心跳加速地点开工资条。',
    choices: [
      { text: '发了三个月', run: () => ({ deltas: { money: 30000, mood: 8 }, lines: ['你终于敢看购物车了'] }) },
      { text: '发了半个月', run: () => ({ deltas: { money: 2000, mood: -5 }, lines: ['"明年会好的"——你对自己说'] }) },
    ],
  },
  {
    id: 'business_trip', cat: 'work', weight: 7, minAge: 24, maxAge: 55, cond: (s) => s.flags.employed,
    title: '出差',
    text: '周一早上去机场，周四晚上回来。你在酒店房间里思考人生。',
    choices: [
      { text: '顺便玩了玩', run: () => ({ deltas: { mood: 3, money: 1000, health: -2 }, lines: ['你在那个城市逛了半天'] }) },
      { text: '纯干活', run: () => ({ deltas: { money: 2000, health: -4, mood: -3 }, lines: ['你只看到了会议室和酒店'] }) },
    ],
  },
  {
    // patch88：加金钱门槛（原来没门槛，钱不够也扣 20 万）
    // patch140：门槛提到扣款的 1.5 倍（200000 → 300000），买完还剩 10 万缓冲
    id: 'middle_crisis', cat: 'life', weight: 5, minAge: 38, maxAge: 55, cond: (s) => (s.attrs.money || 0) >= 300000,
    title: '中年危机',
    text: '你看着镜子里的自己，突然觉得这不是你想要的生活。',
    choices: [
      { text: '买了辆跑车', run: () => ({ deltas: { mood: 8, money: -200000, relations: -5 }, lines: ['你老婆/老公跟你吵了一架'] , flags: { crisisBought: true } }) },
      { text: '接受了平凡', run: () => ({ deltas: { mood: 3 }, lines: ['你想通了，平凡也没什么不好'] }) },
    ],
  },
  {
    id: 'parents_old', cat: 'life', weight: 8, minAge: 35, maxAge: 65,
    title: '父母老了',
    text: '你回家发现爸爸头发白了一半，妈妈走路慢了很多。',
    choices: [
      { text: '多回家看看', run: () => ({ deltas: { mood: -3, relations: 5 }, lines: ['你开始每周打电话', '时间真的不等人'], bonds: { family: 15 } }) },
    ],
  },
  {
    id: 'kid_edu', cat: 'life', weight: 10, minAge: 30, maxAge: 55,
    cond: (s) => s.flags && s.flags.hasChild,
    title: '孩子教育',
    text: '孩子要上小学了，学区房、培训班、择校，你头都大了。',
    choices: [
      { text: '砸钱报班', run: () => ({ deltas: { money: -20000, mood: -3 }, lines: ['周末都在接送孩子上补习班'], bonds: { child: 15 } }) },
      { text: '快乐教育', run: () => ({ deltas: { mood: 2, money: -2000 }, lines: ['你不想让孩子太累'] }) },
    ],
  },
  {
    id: 'grandchild', cat: 'life', weight: 6, minAge: 55, maxAge: 85, cond: (s) => s.flags.hasChild,
    title: '抱孙子了',
    text: '孩子打电话说："爸/妈，你要当爷爷/奶奶了。"',
    choices: [
      { text: '含饴弄孙', run: () => ({ deltas: { mood: 10, health: -2, money: -5000 }, lines: ['你开始研究带娃攻略', '退休生活有了新内容'] }) },
    ],
  },
  {
    id: 'square_dance', cat: 'life', weight: 5, minAge: 60, maxAge: 90,
    title: '广场舞',
    text: '楼下的音响每天响。你一开始嫌吵，后来也加入了。',
    choices: [
      { text: '跟着节奏动起来', run: () => ({ deltas: { mood: 8, health: 3, relations: 8 }, lines: ['你认识了一帮老伙伴'], bonds: { friends: 10 } , flags: { dance: true } }) },
    ],
  },
  {
    id: 'old_friend_dies', cat: 'health', weight: 4, minAge: 65, maxAge: 95,
    title: '老伙计走了',
    text: '电话打来时你正在泡茶。你沉默了很久。',
    choices: [
      { text: '去送了最后一程', run: () => ({ deltas: { mood: -10, health: -3 }, lines: ['你又想起了你们年轻时的事', '活着的人要好好活'] }) },
    ],
  },
  {
    id: 'retirement', cat: 'life', weight: 20, minAge: 60, maxAge: 65, force: true, cond: (s) => s.flags.employed,
    title: '退休了',
    text: '最后一天上班，同事给你办了欢送会。走出写字楼，你忽然不知道该干嘛。',
    choices: [
      { text: '享受退休', run: () => ({ deltas: { mood: 5, health: 3 }, lines: ['你终于有时间做喜欢的事了'] , flags: { retired: true } }) },
      { text: '不适应', run: () => ({ deltas: { mood: -5 }, lines: ['你在家坐立不安', '第二天又去公司转了一圈'] , flags: { retired: true } }) },
    ],
  },
  {
    id: 'phone_scam', cat: 'funny', weight: 5, minAge: 40, maxAge: 90,
    title: '诈骗电话',
    text: '"您好，您的账户涉嫌洗钱，请配合调查……"',
    choices: [
      { text: '挂了', run: () => ({ deltas: { mood: -1 }, lines: ['你又不是傻子'] }) },
      { text: '聊了半天', run: () => ({ deltas: { mood: 2, money: -5000 }, lines: ['你差点信了', '好在银行拦住了'] }) },
    ],
  },
  {
    id: 'deliver_upset', cat: 'funny', weight: 8, minAge: 18, maxAge: 70,
    title: '外卖送错了',
    text: '你饿了半天，打开外卖发现送的不是你点的。',
    choices: [
      { text: '算了吃吧', run: () => ({ deltas: { mood: -2, money: -30 }, lines: ['意外地还挺好吃'] }) },
      { text: '投诉', run: () => ({ deltas: { mood: 1, money: 30 }, lines: ['商家退了钱'] }) },
    ],
  },
  {
    id: 'power_cut', cat: 'funny', weight: 7, minAge: 18, maxAge: 80,
    title: '停电了',
    text: '夏天晚上十点，突然黑屏。整个小区都在抱怨。',
    choices: [
      { text: '出去乘凉', run: () => ({ deltas: { mood: 2, relations: 3 }, lines: ['你在楼下和邻居聊了一晚上'] }) },
      { text: '睡觉', run: () => ({ deltas: { health: 1 }, lines: ['没网的一夜，睡得特别香'] }) },
    ],
  },
  {
    id: 'find_old_friend', cat: 'life', weight: 5, minAge: 30, maxAge: 70,
    title: '偶遇老朋友',
    text: '在街上你看到一个熟悉的背影。真的是二十年没见的他/她。',
    choices: [
      { text: '上前打招呼', run: () => ({ deltas: { mood: 8, relations: 8 }, lines: ['你们去了咖啡馆', '说了一下午的当年'] }) },
    ],
  },

  /* ====== 批量扩充：童年细节 ====== */
  { id: 'child_lost_gloves', cat: 'life', weight: 18, minAge: 6, maxAge: 12,
    title: '丢了手套', text: '放学路上，你发现新买的手套只剩一只。',
    choices: [
      { text: '回操场找', run: () => ({ deltas: { mood: -1, health: -1 }, lines: ['你沿着操场找了一圈，手指冻得发红'] }) },
      { text: '先回家', run: () => ({ deltas: { money: -30, mood: -2 }, lines: ['家里翻出一副旧手套凑合戴'] }) },
    ]},
  { id: 'child_class_plant', cat: 'life', weight: 14, minAge: 7, maxAge: 13,
    title: '窗台小苗', text: '班主任把一盆绿萝放到你桌上，班里轮流照看。',
    choices: [
      { text: '认真照料', run: () => ({ deltas: { mood: 3, skill: 1 }, lines: ['几周后新叶从盆沿探了出来'] }) },
      { text: '交给值日生', run: () => ({ deltas: { mood: -1, relations: -1 }, lines: ['后来大家都以为别人会浇水'] }) },
    ]},
  { id: 'child_allowance_choice', cat: 'life', weight: 20, minAge: 8, maxAge: 15,
    title: '攒下零花钱', text: '你攒了几周零花钱够买模型了，朋友却拉你去买点心。',
    choices: [
      { text: '继续存着', run: () => ({ deltas: { money: 80, mood: -1 }, lines: ['你把硬币塞回存钱罐'] }) },
      { text: '买点心分享', run: () => ({ deltas: { money: -35, mood: 4, relations: 2 }, lines: ['大家挤在路边吃完，手上沾了糖粉'] }) },
    ]},
  { id: 'child_quiet_birthday', cat: 'life', weight: 10, minAge: 5, maxAge: 14,
    title: '生日那天', text: '生日碰上周二，家里人都忙，餐桌上只有一碗面。',
    choices: [
      { text: '说失落', run: () => ({ deltas: { mood: 2, relations: -1 }, bonds: { family: 1 }, lines: ['家人答应周末补个小庆祝'] }) },
      { text: '装作没关系', run: () => ({ deltas: { mood: -3 }, lines: ['你把面汤喝完，早早回了房间'] }) },
    ]},
  { id: 'child_grandparent_errand', cat: 'life', weight: 13, minAge: 7, maxAge: 16,
    title: '陪外婆买菜', text: '周末外婆请你陪她去菜市场，说一袋米拎不动。',
    choices: [
      { text: '慢慢逛', run: () => ({ deltas: { mood: 3, health: 1 }, bonds: { family: 2 }, lines: ['回家时你手里多了一袋橘子和几段旧故事'] }) },
      { text: '帮她叫车', run: () => ({ deltas: { money: -25, mood: 1 }, bonds: { family: 1 }, lines: ['外婆一路念叨你下次别破费'] }) },
    ]},
  { id: 'child_lost_tooth', cat: 'funny', weight: 10, minAge: 4, maxAge: 10,
    title: '松动的牙', text: '吃苹果时一颗乳牙忽然松了，舌头总忍不住去顶。',
    choices: [
      { text: '等它自然掉', run: () => ({ deltas: { mood: 1, health: 1 }, lines: ['几天后牙齿自己掉在了杯子里'] }) },
      { text: '请家长处理', run: () => ({ deltas: { mood: -2, health: 1 }, bonds: { family: 1 }, lines: ['你闭着眼数到三，事情很快结束了'] }) },
    ]},
  { id: 'child_parent_late', cat: 'life', weight: 17, minAge: 6, maxAge: 15,
    title: '等晚归的人', text: '晚上九点饭菜凉了，家长还没下班。',
    choices: [
      { text: '自己热饭', run: () => ({ deltas: { skill: 1, mood: -1 }, lines: ['微波炉叮了一声，你给自己盛了碗饭'] }) },
      { text: '留着一起吃', run: () => ({ deltas: { mood: -2 }, bonds: { family: 2 }, lines: ['门开时饭菜不太热，但家人陪你吃完了'] }) },
    ]},
  { id: 'child_rain_walk', cat: 'funny', weight: 11, minAge: 7, maxAge: 16,
    title: '雨天绕路', text: '放学突然下雨，你和同学挤在校门口一把小伞下。',
    choices: [
      { text: '踩水走近路', run: () => ({ deltas: { mood: 3, health: -2 }, lines: ['水花溅到裤脚，你一路笑着躲水坑'] }) },
      { text: '绕路找屋檐', run: () => ({ deltas: { health: 1, mood: -1 }, lines: ['你们沿商铺屋檐走，雨停时才到家'] }) },
    ]},
  { id: 'child_read_aloud', cat: 'classical', weight: 9, minAge: 7, maxAge: 16,
    title: '课堂朗读', text: '语文课老师点你站起来读一段课文。',
    choices: [
      { text: '认真读完', run: () => ({ deltas: { skill: 3, mood: 1 }, lines: ['你读到最后一句时声音稳了许多'] }) },
      { text: '小声念过去', run: () => ({ deltas: { skill: -1, mood: 1 }, lines: ['老师提醒你抬头，你赶紧合上了书'] }) },
    ]},
  { id: 'child_stray_cat', cat: 'life', weight: 8, minAge: 8, maxAge: 17,
    title: '楼下的小猫', text: '楼道口出现一只脏兮兮的小猫，纸箱里垫着旧毛巾。',
    choices: [
      { text: '喂点水粮', run: () => ({ deltas: { money: -40, mood: 3 }, lines: ['小猫吃完后蜷进纸箱'] }) },
      { text: '联系救助站', run: () => ({ deltas: { skill: 2, mood: -1 }, lines: ['你记下了救助站电话'] }) },
    ]},
  { id: 'child_school_photo', cat: 'funny', weight: 9, minAge: 7, maxAge: 17,
    title: '毕业照前夕', text: '拍集体照前，你发现旁边同学领子翻出来了。',
    choices: [
      { text: '提醒他', run: () => ({ deltas: { relations: 2, mood: 1 }, lines: ['他赶紧翻好领子，拍照时朝你比了手势'] }) },
      { text: '先管自己', run: () => ({ deltas: { mood: 1 }, lines: ['你把衣角抻平，站回队伍里'] }) },
    ]},
  { id: 'child_borrowed_book', cat: 'life', weight: 14, minAge: 8, maxAge: 17,
    title: '借出的漫画', text: '你借给同学的漫画迟迟没还，书页还折了印。',
    choices: [
      { text: '把话说清楚', run: () => ({ deltas: { relations: -1, skill: 2 }, lines: ['你说明想先拿回旧书，他答应明天带来'] }) },
      { text: '继续借', run: () => ({ deltas: { mood: -2, relations: 1 }, lines: ['他笑着把新册子塞进书包'] }) },
    ]},
  { id: 'child_low_exam', cat: 'work', weight: 15, minAge: 9, maxAge: 17,
    title: '没考好', text: '试卷分数比预想低不少，红笔圈出的题都错在粗心。',
    choices: [
      { text: '先看错题', run: () => ({ deltas: { skill: 3, mood: -2 }, lines: ['你把三道错题抄进本子'] }) },
      { text: '先出去透气', run: () => ({ deltas: { mood: 2, skill: -1 }, lines: ['你们沿小卖部走了一圈，心情轻了些'] }) },
    ]},
  { id: 'child_summer_camp', cat: 'life', weight: 8, minAge: 9, maxAge: 17,
    title: '暑期夏令营', text: '学校发了夏令营通知，要在外住三晚。',
    choices: [
      { text: '报名参加', run: () => ({ deltas: { money: -900, skill: 3, mood: 3 }, lines: ['你第一次用望远镜看到了木星'] }) },
      { text: '留在家', run: () => ({ deltas: { money: 40, mood: -1 }, lines: ['你看看同学发来的营地照片'] }) },
    ]},
  { id: 'child_share_snacks', cat: 'life', weight: 14, minAge: 6, maxAge: 14,
    title: '课间零食', text: '你发现妈妈多放了一包饼干，后桌同学忘带午餐。',
    choices: [
      { text: '分他一半', run: () => ({ deltas: { mood: 2, health: -1 }, lines: ['你们把饼干掰成两半'] }) },
      { text: '留着自己吃', run: () => ({ deltas: { health: 1, relations: -1 }, lines: ['你低头吃完饼干'] }) },
    ]},
  { id: 'child_bicycle_flat', cat: 'life', weight: 12, minAge: 10, maxAge: 17,
    title: '自行车漏气', text: '放学骑到半路车胎软了，离修车铺还有两条街。',
    choices: [
      { text: '推车去修', run: () => ({ deltas: { money: -35, health: -1, skill: 1 }, lines: ['师傅补好内胎，你走出铺子时开始飘雨'] }) },
      { text: '锁车坐公交', run: () => ({ deltas: { money: -8, mood: -1 }, lines: ['你第二天又绕回来取车'] }) },
    ]},
  { id: 'child_lost_in_store', cat: 'life', weight: 7, minAge: 5, maxAge: 12,
    title: '超市走散', text: '你跟着玩具走了几步，抬头看不见家人了。',
    choices: [
      { text: '找工作人员', run: () => ({ deltas: { mood: -1, skill: 2 }, lines: ['工作人员带你到服务台，家人很快赶来'] }) },
      { text: '自己找', run: () => ({ deltas: { mood: -4, health: -1 }, lines: ['你绕了两排货架才找到家人'] }) },
    ]},
  { id: 'child_kitchen_help', cat: 'life', weight: 13, minAge: 8, maxAge: 17,
    title: '第一次炒菜', text: '家里没人做饭，冰箱里只剩鸡蛋和青菜。',
    choices: [
      { text: '照视频做', run: () => ({ deltas: { skill: 3, mood: 2 }, lines: ['菜咸了一点，但家人把盘子吃空了'] }) },
      { text: '煮面', run: () => ({ deltas: { skill: 1, money: -10 }, lines: ['一锅面很快煮好，厨房台面依旧干净'] }) },
    ]},
  { id: 'child_vaccine_day', cat: 'health', weight: 8, minAge: 4, maxAge: 15,
    title: '接种疫苗', text: '学校通知去社区打疫苗，队伍从门诊口排到走廊。',
    choices: [
      { text: '按时打', run: () => ({ deltas: { health: 3, mood: -1 }, lines: ['针很快打完，胳膊酸了一阵'] }) },
      { text: '改天约', run: () => ({ deltas: { mood: 1, skill: -1 }, lines: ['家里重新约了时间'] }) },
    ]},
  { id: 'child_graduation_album', cat: 'life', weight: 9, minAge: 13, maxAge: 18,
    title: '毕业纪念册', text: '大家忙着写留言，你翻到空白页，想起有些同学几乎没说过话。',
    choices: [
      { text: '认真写几句', run: () => ({ deltas: { mood: 3, relations: 2 }, lines: ['你写下几句具体的小事，对方读完笑了'] }) },
      { text: '简单签名', run: () => ({ deltas: { mood: 1, relations: -1 }, lines: ['你合上纪念册'] }) },
    ]},

  /* ====== 批量扩充：青年职场 ====== */
  { id: 'young_commute_delay', cat: 'work', weight: 18, minAge: 18,
    cond: (s) => s.flags && s.flags.employed, maxAge: 30,
    title: '早高峰误车', text: '地铁临时限流，会议提醒还剩二十分钟，咖啡凉了。',
    choices: [
      { text: '打网约车', run: () => ({ deltas: { money: -90, mood: -1 }, lines: ['你踩着点进了会议室'] }) },
      { text: '告知迟到', run: () => ({ deltas: { mood: -2, relations: -1 }, lines: ['你发了消息说明情况'] }) },
    ]},
  { id: 'young_resume_review', cat: 'work', weight: 15, minAge: 18,
    cond: (s) => s.flags && s.flags.employed, maxAge: 28,
    title: '简历修改', text: '投出去的简历没回复，朋友说项目经历写得太笼统。',
    choices: [
      { text: '重新梳理', run: () => ({ deltas: { skill: 4, mood: -1 }, lines: ['你补上了具体成果'] }) },
      { text: '继续投', run: () => ({ deltas: { skill: -1, mood: 1 }, lines: ['你又投出几份简历'] }) },
    ]},
  { id: 'young_first_paycheck', cat: 'life', weight: 14, minAge: 18, maxAge: 27,
    title: '第一笔工资', text: '工资到账通知来了，数字比想象中具体，也比招聘写的少一点。',
    choices: [
      { text: '请家人吃饭', run: () => ({ deltas: { money: -500, mood: 4 }, bonds: { family: 2 }, lines: ['你第一次主动结了账'] }) },
      { text: '存起来', run: () => ({ deltas: { money: 300, mood: 1 }, lines: ['你把工资分进两个账户'] }) },
    ]},
  { id: 'young_rent_increase', cat: 'life', weight: 15, minAge: 20, maxAge: 30,
    title: '房租要涨', text: '房东说续租要涨五百。搬家能省，但通勤要重新算。',
    choices: [
      { text: '接受续租', run: () => ({ deltas: { money: -500, mood: 1 }, lines: ['你开始重新安排每月预算'] }) },
      { text: '找便宜住处', run: () => ({ deltas: { money: 800, health: -2 }, lines: ['你找到一处远一点但便宜的'] }) },
    ]},
  { id: 'young_blind_date2', cat: 'romance', weight: 10, minAge: 20, maxAge: 30,
    title: '朋友介绍见面', text: '朋友安排了一次见面，桌上两杯冰美式，话题一度停在天气。',
    choices: [
      { text: '再约一次', run: () => ({ deltas: { money: -120, mood: 2 }, bonds: { lover: 1 }, lines: ['你们约好下次去逛书店'] }) },
      { text: '礼貌结束', run: () => ({ deltas: { mood: 1, relations: -1 }, lines: ['你给朋友发了消息说明情况'] }) },
    ]},
  { id: 'young_long_distance', cat: 'romance', weight: 9, minAge: 20, maxAge: 30, cond: (s) => s.flags.employed && s.bonds.lover > 0,
    title: '异地通话', text: '你和伴侣总是错开下班时间，视频里常听见对方那边的洗衣机声。',
    choices: [
      { text: '订票去见', run: () => ({ deltas: { money: -900, mood: 3 }, bonds: { lover: 2 }, lines: ['你们把烦心事说开了'] }) },
      { text: '固定通话', run: () => ({ deltas: { mood: 1 }, bonds: { lover: 1 }, lines: ['你们挑了一个不加班的晚上留给彼此'] }) },
    ]},
  { id: 'young_coworker_credit', cat: 'work', weight: 10, minAge: 21,
    cond: (s) => s.flags && s.flags.employed, maxAge: 30,
    title: '方案署名', text: '汇报时同事把你整理的数据说成团队共同发现。',
    choices: [
      { text: '会后私下说', run: () => ({ deltas: { mood: -1, skill: 2, relations: -1 }, lines: ['他答应在纪要里补上你的贡献'] }) },
      { text: '当场补充', run: () => ({ deltas: { mood: -2, relations: -2, skill: 3 }, lines: ['你补充了数据来源，主管记下了你的名字'] }) },
    ]},
  { id: 'young_night_shift', cat: 'health', weight: 12, minAge: 18, maxAge: 30,
    cond: (s) => s.flags && s.flags.employed,
    title: '临时夜班', text: '同事请病假，主管问你能不能顶一晚。加班费高，但你第二天约了看家人。',
    choices: [
      { text: '接下夜班', run: () => ({ deltas: { money: 650, health: -4, mood: -1 }, lines: ['凌晨的办公室很安静'] }) },
      { text: '说明安排', run: () => ({ deltas: { health: 2, relations: -1 }, lines: ['主管找到了别人顶班'] }) },
    ]},
  { id: 'young_move_house', cat: 'life', weight: 11, minAge: 19, maxAge: 30,
    title: '周末搬家', text: '新住处离公司近一站，但楼梯没电梯。',
    choices: [
      { text: '请朋友帮忙', run: () => ({ deltas: { money: -250, health: -2, relations: 2 }, lines: ['你们搬完后坐在地上吃外卖'] }) },
      { text: '找搬家公司', run: () => ({ deltas: { money: -1200, health: 2, mood: 1 }, lines: ['搬运工把大件放好'] }) },
    ]},
  { id: 'young_flatmate_chores', cat: 'life', weight: 16, minAge: 19, maxAge: 30,
    title: '合租家务', text: '水槽堆着两天的碗，室友说太忙晚些处理。',
    choices: [
      { text: '谈轮值表', run: () => ({ deltas: { relations: -1, skill: 2 }, lines: ['你们列了轮值表，谈话不轻松但有了约定'] }) },
      { text: '先顺手洗', run: () => ({ deltas: { mood: -2, relations: 1 }, lines: ['你洗完碗赶去上班'] }) },
    ]},
  { id: 'young_driving_test', cat: 'life', weight: 8, minAge: 18, maxAge: 30,
    title: '驾照路考', text: '路考前一晚你把考场路线又看了一遍，手心出汗。',
    choices: [
      { text: '提前熟悉', run: () => ({ deltas: { money: -120, skill: 3, mood: -1 }, lines: ['你绕场地走了一圈'] }) },
      { text: '按时到', run: () => ({ deltas: { mood: 1, skill: -1 }, lines: ['你在候考区又看了一遍注意事项'] }) },
    ]},
  { id: 'young_distant_job', cat: 'work', weight: 8, minAge: 21,
    cond: (s) => s.flags && s.flags.employed, maxAge: 30,
    title: '外地工作机会', text: '外地公司发offer，薪资高一些，城市你只去过一次。',
    choices: [
      { text: '搬过去', run: () => ({ deltas: { money: 1500, skill: 4, mood: -2 }, lines: ['你收拾行李，临走和家人吃了家常菜'] }) },
      { text: '留下', run: () => ({ deltas: { mood: 1, skill: -1 }, lines: ['你婉拒了邀请'] }) },
    ]},
  { id: 'young_online_rumor', cat: 'funny', weight: 9, minAge: 18, maxAge: 30,
    title: '群聊误会', text: '朋友发的截图里一句话看起来像是在说你。',
    choices: [
      { text: '私下问清', run: () => ({ deltas: { mood: -1, relations: 2 }, lines: ['朋友解释了前因后果'] }) },
      { text: '不回应', run: () => ({ deltas: { mood: -2 }, lines: ['群聊很快换了话题'] }) },
    ]},
  { id: 'young_trip_delay', cat: 'life', weight: 10, minAge: 18, maxAge: 30,
    title: '旅途晚点', text: '火车晚点两小时，民宿要十点前入住。',
    choices: [
      { text: '联系民宿', run: () => ({ deltas: { money: -180, mood: -1 }, lines: ['房东同意延后等你'] }) },
      { text: '改签到', run: () => ({ deltas: { money: -420, mood: 1 }, lines: ['你换到更晚一班，少了一个景点但不用赶'] }) },
    ]},
  { id: 'young_internship_task', cat: 'work', weight: 10, minAge: 18,
    cond: (s) => s.flags && s.flags.employed, maxAge: 25,
    title: '实习汇报', text: '实习结束前主管让你做汇报，你发现成果散落在邮件里。',
    choices: [
      { text: '整理材料', run: () => ({ deltas: { skill: 4, health: -1, mood: 1 }, lines: ['你把数据串了起来'] }) },
      { text: '按现有讲', run: () => ({ deltas: { skill: -1, health: 1, mood: -1 }, lines: ['主管追问细节时你只能翻邮件'] }) },
    ]},
  { id: 'young_student_loan', cat: 'life', weight: 9, minAge: 21, maxAge: 30,
    title: '助学贷款还款', text: '还款提醒和房租交通费挤在同一个月。',
    choices: [
      { text: '按计划还', run: () => ({ deltas: { money: -1200, mood: -1 }, lines: ['你完成了还款，周末去公园走了走'] }) },
      { text: '调整预算', run: () => ({ deltas: { money: -900, mood: 1, skill: 2 }, lines: ['你停了几个很少用的订阅'] }) },
    ]},
  { id: 'young_roommate_noise', cat: 'life', weight: 12, minAge: 19, maxAge: 30,
    title: '深夜噪音', text:'快到午夜隔壁还在开视频会议，你明早要早起。',
    choices: [
      { text: '发消息提醒', run: () => ({ deltas: { mood: 1, relations: -1 }, lines: ['室友把音量调低了'] }) },
      { text: '忍一晚', run: () => ({ deltas: { health: -2, mood: -2 }, lines: ['你翻来覆去到很晚'] }) },
    ]},
  { id: 'young_marriage_question', cat: 'romance', weight: 10, minAge: 23, maxAge: 30,
    title: '被问婚期', text: '聚餐时亲戚问起婚期，桌上几个人都停下筷子。',
    choices: [
      { text: '坦白想法', run: () => ({ deltas: { mood: 1, relations: -2 }, bonds: { lover: 1 }, lines: ['伴侣轻轻碰了碰你的手'] }) },
      { text: '含糊带过', run: () => ({ deltas: { mood: -2, relations: 1 }, lines: ['你笑着说顺其自然'] }) },
    ]},
  { id: 'young_freelance_offer', cat: 'work', weight: 9, minAge: 20,
    cond: (s) => s.flags && s.flags.employed, maxAge: 30,
    title: '接私活', text: '前同事问你接不接周末兼职，报酬不错但交付紧。',
    choices: [
      { text: '接下', run: () => ({ deltas: { money: 2800, skill: 3, health: -3 }, lines: ['你连着两晚赶工，周一仍有点困'] }) },
      { text: '拒绝', run: () => ({ deltas: { health: 2, mood: 1 }, lines: ['你给朋友推荐了别人'] }) },
    ]},
  { id: 'young_burnout_sign', cat: 'health', weight: 11, minAge: 20, maxAge: 30,
    cond: (s) => s.flags && s.flags.employed,
    title: '工作倦怠', text: '连续加班后你早上不想开电脑，待办越写越长。',
    choices: [
      { text: '和主管谈', run: () => ({ deltas: { mood: 2, skill: 2, relations: -1 }, lines: ['主管删掉了两项低优先级任务'] }) },
      { text: '周末休息', run: () => ({ deltas: { health: 4, mood: 2 }, lines: ['你关了工作通知，睡了个无闹钟的早晨'] }) },
    ]},

  /* ====== 批量扩充：中年 ====== */
  { id: 'middle_parent_group_chat', cat: 'life', weight: 15, minAge: 30, maxAge: 45, cond: (s) => s.flags.hasChild,
    title: '家长群通知', text: '晚上十点班级群发了十几条通知，第二天要交材料。',
    choices: [
      { text: '现在准备', run: () => ({ deltas: { health: -2, mood: 1 }, bonds: { child: 1 }, lines: ['孩子睡前把表格装进了书包'] }) },
      { text: '明早再弄', run: () => ({ deltas: { health: 1, mood: -1 }, lines: ['你早起半小时补齐了材料'] }) },
    ]},
  { id: 'middle_mortgage_repair', cat: 'life', weight: 11, minAge: 32, maxAge: 52,
    title: '卫生间漏水', text: '楼下邻居说天花板有水渍，维修师傅报价比预想高。',
    choices: [
      { text: '尽快修', run: () => ({ deltas: { money: -6200, mood: -1 }, lines: ['师傅拆开墙砖找到接口'] }) },
      { text: '再问价', run: () => ({ deltas: { money: -500, mood: -2, skill: 2 }, lines: ['第二位师傅给了不同判断'] }) },
    ]},
  { id: 'middle_parent_hearing', cat: 'life', weight: 10, minAge: 35, maxAge: 55,
    title: '父亲听不清', text: '聚餐时父亲几次没听清话题，电视音量开得很大。',
    choices: [
      { text: '陪他检查', run: () => ({ deltas: { money: -300, mood: -1 }, bonds: { family: 2 }, lines: ['医生建议进一步评估'] }) },
      { text: '先观察', run: () => ({ deltas: { mood: -1 }, bonds: { family: 1 }, lines: ['你说话时有意识坐到他对面'] }) },
    ]},
  { id: 'middle_team_layoff', cat: 'work', weight: 8, minAge: 32,
    cond: (s) => s.flags && s.flags.employed, maxAge: 55,
    title: '裁员风声', text: '几个熟悉的工位空了，主管只说业务要调整。',
    choices: [
      { text: '更新简历', run: () => ({ deltas: { skill: 3, mood: -1 }, lines: ['你整理了近两年项目'] }) },
      { text: '专注手头', run: () => ({ deltas: { skill: 1, mood: 1 }, lines: ['你把本周交付做好'] }) },
    ]},
  { id: 'middle_project_presentation', cat: 'work', weight: 13, minAge: 30,
    cond: (s) => s.flags && s.flags.employed, maxAge: 55,
    title: '关键汇报', text: '客户把汇报提前一天，做图表的同事又发烧请假。',
    choices: [
      { text: '今晚补数据', run: () => ({ deltas: { skill: 4, health: -3, mood: -1 }, lines: ['你逐项核对到深夜'] }) },
      { text: '说明范围', run: () => ({ deltas: { health: 1, skill: 1, relations: -1 }, lines: ['客户要求后续补一页分析'] }) },
    ]},
  { id: 'middle_neighbor_renovation', cat: 'life', weight: 11, minAge: 30, maxAge: 55,
    title: '邻居装修', text: '楼上装修敲了几天，周末一早又传来电钻声。',
    choices: [
      { text: '找物业', run: () => ({ deltas: { relations: 1, mood: 1 }, lines: ['物业把施工时段写得更明确'] }) },
      { text: '去图书馆', run: () => ({ deltas: { money: -90, health: 1, mood: 2 }, lines: ['你在图书馆处理完邮件'] }) },
    ]},
  { id: 'middle_car_service', cat: 'life', weight: 12, minAge: 33, maxAge: 55,
    title: '汽车保养', text: '维修店列出一长串要换的零件，有些你不确定是否紧急。',
    choices: [
      { text: '先做安全项', run: () => ({ deltas: { money: -1800, skill: 2 }, lines: ['你确认了刹车和轮胎检查'] }) },
      { text: '全做', run: () => ({ deltas: { money: -5600, mood: 1 }, lines: ['车很快保养完，这个月预算要调整'] }) },
    ]},
  { id: 'middle_family_trip2', cat: 'life', weight: 9, minAge: 32, maxAge: 55, cond: (s) => s.flags.hasChild,
    title: '全家短途游', text: '孩子提议周末去看海，天气预报有阵雨。',
    choices: [
      { text: '照去', run: () => ({ deltas: { money: -3200, mood: 3, health: -1 }, bonds: { family: 2 }, lines: ['海边下了一阵雨，你们在小店躲雨吃面'] }) },
      { text: '改附近', run: () => ({ deltas: { money: -600, mood: 1 }, bonds: { family: 1 }, lines: ['你们去了附近博物馆'] }) },
    ]},
  { id: 'middle_child_class', cat: 'life', weight: 14, minAge: 30, maxAge: 48, cond: (s) => s.flags.hasChild,
    title: '孩子选兴趣班', text: '孩子想学画画又说喜欢篮球，两种课时间撞了。',
    choices: [
      { text: '先试篮球', run: () => ({ deltas: { money: -850, mood: 1 }, bonds: { child: 2 }, lines: ['孩子路上讲了一路队里的新朋友'] }) },
      { text: '报画画', run: () => ({ deltas: { money: -1100, mood: -1 }, bonds: { child: -1 }, lines: ['孩子上课时仍问起篮球'] }) },
    ]},
  { id: 'middle_chore_balance', cat: 'romance', weight: 10, minAge: 30, maxAge: 55, cond: (s) => s.bonds.lover > 0,
    title: '家务分配', text: '水槽堆着碗，你忽然意识到这周家务几乎都是自己做的。',
    choices: [
      { text: '说具体分工', run: () => ({ deltas: { mood: 1, relations: -1, skill: 2 }, bonds: { lover: 1 }, lines: ['你们列了每周轮值'] }) },
      { text: '今晚做完', run: () => ({ deltas: { health: -1, mood: -2 }, bonds: { lover: -1 }, lines: ['你洗完碗才发现衣服没晾'] }) },
    ]},
  { id: 'middle_promotion_offer', cat: 'work', weight: 9, minAge: 35,
    cond: (s) => s.flags && s.flags.employed, maxAge: 55,
    title: '升职机会', text: '主管让你接手新团队，薪资提高但会议会明显变多。',
    choices: [
      { text: '接受', run: () => ({ deltas: { money: 2500, skill: 4, health: -3 }, lines: ['你接过团队名单，日历一下排满了'] }) },
      { text: '暂不接', run: () => ({ deltas: { health: 2, skill: -1, mood: -1 }, lines: ['你决定把现有项目先收好尾'] }) },
    ]},
  { id: 'middle_old_friend2', cat: 'life', weight: 9, minAge: 35, maxAge: 55,
    title: '老同学来信', text: '多年没联系的老同学回本地了，想找一天喝茶。',
    choices: [
      { text: '约见面', run: () => ({ deltas: { money: -160, mood: 3, relations: 2 }, bonds: { friends: 2 }, lines: ['你们聊起同一间快拆掉的旧食堂'] }) },
      { text: '在线寒暄', run: () => ({ deltas: { mood: 1, relations: 1 }, bonds: { friends: 1 }, lines: ['约见面的事留待以后'] }) },
    ]},
  { id: 'middle_parent_care', cat: 'life', weight: 9, minAge: 38, maxAge: 55,
    title: '陪母亲复诊', text: '母亲说腿疼，复诊在工作日早上，兄弟姐妹都有安排。',
    choices: [
      { text: '请假陪', run: () => ({ deltas: { money: -150, mood: -1 }, bonds: { family: 3 }, lines: ['你把医生交代逐条记下'] }) },
      { text: '帮约车', run: () => ({ deltas: { money: -100, mood: -1 }, bonds: { family: 1 }, lines: ['母亲回家把检查单拍给你'] }) },
    ]},
  { id: 'middle_career_course', cat: 'work', weight: 8, minAge: 33,
    cond: (s) => s.flags && s.flags.employed, maxAge: 55,
    title: '报名夜校', text: '你发现新工具越用越顺手，报了晚间课程，每周两次。',
    choices: [
      { text: '坚持上完', run: () => ({ deltas: { money: -1600, skill: 5, health: -2 }, lines: ['你能独立完成新工具的基础操作'] }) },
      { text: '学免费资料', run: () => ({ deltas: { skill: 2, mood: 1 }, lines: ['你午休时一点点练习'] }) },
    ]},
  { id: 'middle_child_exam', cat: 'life', weight: 13, minAge: 35, maxAge: 52, cond: (s) => s.flags.hasChild,
    title: '孩子考试失利', text: '孩子把试卷放餐桌上，几道错题旁写着看错题意。',
    choices: [
      { text: '先听他讲', run: () => ({ deltas: { mood: 1, relations: 1 }, bonds: { child: 2 }, lines: ['你们一起找出两道能补上的题型'] }) },
      { text: '马上补习', run: () => ({ deltas: { skill: 1, mood: -2 }, bonds: { child: -1 }, lines: ['你联系了老师，孩子吃饭时仍折着试卷'] }) },
    ]},
  { id: 'middle_household_budget', cat: 'life', weight: 11, minAge: 35, maxAge: 55,
    title: '月度账单', text: '月底账单比平时高，水电补习和自动续费挤在一起。',
    choices: [
      { text: '逐项查', run: () => ({ deltas: { skill: 3, mood: 1, money: 500 }, lines: ['你取消了两个很少用的订阅'] }) },
      { text: '砍娱乐预算', run: () => ({ deltas: { money: 700, mood: -2 }, bonds: { family: -1 }, lines: ['周末改成在家休息'] }) },
    ]},
  { id: 'middle_aging_pet', cat: 'life', weight: 8, minAge: 32, maxAge: 55, cond: (s) => s.flags.pet || s.bonds.pet > 0,
    title: '宠物年纪大了', text: '老狗爬楼梯停了两次，散步也比以前慢。',
    choices: [
      { text: '做检查', run: () => ({ deltas: { money: -1400, mood: -1 }, bonds: { pet: 2 }, lines: ['医生建议调整活动量'] }) },
      { text: '缩短散步', run: () => ({ deltas: { health: 1, mood: -1 }, bonds: { pet: 1 }, lines: ['你把水碗挪到了近处'] }) },
    ]},
  { id: 'middle_community_volunteer', cat: 'life', weight: 7, minAge: 30, maxAge: 55,
    title: '社区志愿', text: '社区办旧物交换活动，邻居问你能不能帮忙登记。',
    choices: [
      { text: '去帮半天', run: () => ({ deltas: { mood: 2, relations: 2, health: -1 }, lines: ['你换回一盏旧台灯'] }) },
      { text: '送旧物', run: () => ({ deltas: { mood: 1 }, lines: ['你整理了两袋闲置物品'] }) },
    ]},
  { id: 'middle_family_recipe', cat: 'life', weight: 8, minAge: 35, maxAge: 55,
    title: '家里的老菜谱', text: '你翻出泛黄的手写菜谱，上面有母亲年轻时记的火候。',
    choices: [
      { text: '一起做', run: () => ({ deltas: { money: -120, skill: 2, mood: 3 }, bonds: { family: 2 }, lines: ['味道和记忆里有点不同，但大家吃完了'] }) },
      { text: '拍照收好', run: () => ({ deltas: { skill: 1, mood: 1 }, bonds: { family: 1 }, lines: ['你把菜谱拍进手机'] }) },
    ]},
  { id: 'middle_company_reorg', cat: 'work', weight: 9, minAge: 35,
    cond: (s) => s.flags && s.flags.employed, maxAge: 55,
    title: '公司架构调整', text: '你的团队要和另一组并到一起，新负责人还没来。',
    choices: [
      { text: '主动约新领导', run: () => ({ deltas: { skill: 2, relations: 1, mood: -1 }, lines: ['你整理了项目清单'] }) },
      { text: '等通知', run: () => ({ deltas: { mood: -2, health: 1 }, lines: ['你先按旧安排推进'] }) },
    ]},
  { id: 'middle_anniversary', cat: 'romance', weight: 8, minAge: 30, maxAge: 55, maxTimes: 5, cond: (s) => s.flags.married || s.bonds.lover >= 50,
    title: '结婚纪念日', text: '日历提醒跳出来，你才想起今天是纪念日，伴侣还在加班。',
    choices: [
      { text: '做顿简餐', run: () => ({ deltas: { money: -180, mood: 3 }, bonds: { lover: 2 }, lines: ['你们在厨房边吃边聊到很晚'] }) },
      { text: '改天补过', run: () => ({ deltas: { mood: 1 }, bonds: { lover: 1 }, lines: ['你把日期记进共享日历'] }) },
    ]},
  { id: 'middle_spouse_appointment', cat: 'life', weight: 8, minAge: 35, maxAge: 55, cond: (s) => s.bonds.lover > 0,
    title: '伴侣看诊', text: '伴侣常头疼约了门诊，你当天有个不能改的会。',
    choices: [
      { text: '调工作陪同', run: () => ({ deltas: { mood: -1, skill: -1 }, bonds: { lover: 2 }, lines: ['你把复诊时间写进日历'] }) },
      { text: '整理资料', run: () => ({ deltas: { mood: 1 }, bonds: { lover: 1 }, lines: ['伴侣自己完成了就诊'] }) },
    ]},
  { id: 'middle_trip_teen', cat: 'life', weight: 8, minAge: 38, maxAge: 55, cond: (s) => s.flags.hasChild,
    title: '和孩子出游', text: '孩子到了不太爱跟家人出门的年纪，你提议周末去郊外。',
    choices: [
      { text: '让孩子选目的地', run: () => ({ deltas: { money: -900, mood: 2 }, bonds: { child: 2 }, lines: ['孩子路上主动讲了几件学校的事'] }) },
      { text: '按原计划', run: () => ({ deltas: { money: -700, mood: -1 }, bonds: { child: -1 }, lines: ['孩子多数时间戴着耳机'] }) },
    ]},
  { id: 'middle_side_business', cat: 'work', weight: 7, minAge: 35,
    cond: (s) => s.flags && s.flags.employed, maxAge: 55,
    title: '周末小生意', text: '朋友提议一起做周末市集摊位，卖你做的手工品。',
    choices: [
      { text: '试摆一周', run: () => ({ deltas: { money: -800, skill: 3, mood: 2, health: -1 }, lines: ['你收到顾客对价格和颜色的建议'] }) },
      { text: '不参与', run: () => ({ deltas: { health: 1, mood: -1 }, lines: ['你把设计留在笔记本里'] }) },
    ]},

  /* ====== 批量扩充：老年 ====== */
  { id: 'old_pension_budget', cat: 'life', weight: 12, minAge: 60, maxAge: 90,
    title: '退休金规划', text: '你整理每月支出，发现药费和人情比预想多。',
    choices: [
      { text: '做保守预算', run: () => ({ deltas: { money: 500, mood: 1, skill: 2 }, lines: ['你把暂时不用的钱留在稳妥账户'] }) },
      { text: '咨询专业人士', run: () => ({ deltas: { money: -100, skill: 3, mood: -1 }, lines: ['你决定先看清风险再选'] }) },
    ]},
  { id: 'old_park_chess', cat: 'life', weight: 14, minAge: 58, maxAge: 90,
    title: '公园下棋', text: '公园里一位老人招呼你坐下对弈。',
    choices: [
      { text: '坐下下棋', run: () => ({ deltas: { mood: 3, skill: 1, relations: 2 }, lines: ['你输了两盘，第三盘守住了中局'] }) },
      { text: '继续散步', run: () => ({ deltas: { health: 2, mood: 1 }, lines: ['你沿湖边走了一圈'] }) },
    ]},
  { id: 'old_colleague_invite', cat: 'life', weight: 9, minAge: 58, maxAge: 85,
    title: '老同事聚会', text: '退休群里有人提议重聚，地点在以前公司附近的老饭馆。',
    choices: [
      { text: '去聚会', run: () => ({ deltas: { money: -260, mood: 3, relations: 2 }, bonds: { friends: 2 }, lines: ['大家比着谁记得的办公室故事多'] }) },
      { text: '改天单聊', run: () => ({ deltas: { mood: 1, relations: 1 }, bonds: { friends: 1 }, lines: ['你约了下周通电话'] }) },
    ]},
  { id: 'old_grandchild_care', cat: 'life', weight: 11, minAge: 58, maxAge: 85, cond: (s) => s.flags.hasChild,
    title: '帮忙带孙辈', text: '孩子临时有工作，问你能不能照看孙辈一个下午。',
    choices: [
      { text: '答应', run: () => ({ deltas: { health: -2, mood: 3 }, bonds: { child: 2, family: 1 }, lines: ['你们写完作业又下楼买水果'] }) },
      { text: '今天不方便', run: () => ({ deltas: { health: 1, mood: -1 }, bonds: { family: -1 }, lines: ['你给孙辈打了视频电话道歉'] }) },
    ]},
  { id: 'old_elevator_repair', cat: 'life', weight: 10, minAge: 60, maxAge: 90,
    title: '电梯停运', text: '电梯检修要停一天，你住六楼。',
    choices: [
      { text: '提前买齐东西', run: () => ({ deltas: { money: -120, health: -1 }, lines: ['你在楼梯间歇了两次'] }) },
      { text: '请邻居帮忙', run: () => ({ deltas: { relations: 2, mood: 1 }, lines: ['邻居帮你带上药，你下次帮他收快递'] }) },
    ]},
  { id: 'old_hearing_aid', cat: 'health', weight: 8, minAge: 65, maxAge: 90,
    title: '助听器试戴', text: '医生建议试戴助听器，价格让人犹豫。',
    choices: [
      { text: '试戴调整', run: () => ({ deltas: { money: -3200, health: 2, mood: 1 }, bonds: { family: 2 }, lines: ['你终于听清电视对白了'] }) },
      { text: '先观察', run: () => ({ deltas: { mood: -1 }, bonds: { family: -1 }, lines: ['家人说话改得更慢更清楚'] }) },
    ]},
  { id: 'old_balcony_garden', cat: 'life', weight: 13, minAge: 58, maxAge: 90,
    title: '阳台种菜', text: '邻居送你几粒番茄种子，你清理了旧花盆。',
    choices: [
      { text: '认真照料', run: () => ({ deltas: { mood: 3, health: 1, money: -60 }, lines: ['你每天浇水时顺手看看'] , flags: { garden: true } }) },
      { text: '只种两盆', run: () => ({ deltas: { mood: 1, health: 1, money: -20 }, lines: ['剩下的种子分给了邻居'] }) },
    ]},
  { id: 'old_museum_day', cat: 'classical', weight: 8, minAge: 60, maxAge: 90,
    title: '博物馆开放日', text: '市博物馆有免费讲解，地铁要换乘一次。',
    choices: [
      { text: '报名参加', run: () => ({ deltas: { money: -40, skill: 2, mood: 3 }, lines: ['你在出口买了张明信片'] }) },
      { text: '在家看资料', run: () => ({ deltas: { skill: 1, mood: 1 }, lines: ['你把喜欢的图片发给了孙辈'] }) },
    ]},
  { id: 'old_retirement_trip', cat: 'life', weight: 8, minAge: 60, maxAge: 85,
    title: '退休旅行', text: '朋友邀你坐火车去山城住几天，你膝盖偶尔发酸。',
    choices: [
      { text: '参加慢行程', run: () => ({ deltas: { money: -2400, health: -1, mood: 4 }, bonds: { friends: 1 }, lines: ['你们每天只安排一两个地点'] }) },
      { text: '改约喝茶', run: () => ({ deltas: { money: -100, health: 1, mood: 1 }, bonds: { friends: 1 }, lines: ['朋友回来后带了当地点心'] }) },
    ]},
  { id: 'old_spouse_care', cat: 'life', weight: 8, minAge: 65, maxAge: 90, cond: (s) => s.bonds.lover > 0,
    title: '伴侣需要照看', text: '伴侣走路不太稳，你也开始腰背容易累。',
    choices: [
      { text: '接受孩子帮忙', run: () => ({ deltas: { health: 2, mood: 1 }, bonds: { family: 2, lover: 1 }, lines: ['孩子固定周三来一趟'] }) },
      { text: '尽量自己来', run: () => ({ deltas: { health: -3, mood: -1 }, bonds: { lover: 1 }, lines: ['你把常用物品挪到顺手的位置'] }) },
    ]},
  { id: 'old_blood_pressure', cat: 'health', weight: 10, minAge: 60, maxAge: 90,
    title: '血压记录', text: '社区医生建议连续记一周血压。',
    choices: [
      { text: '每天记录', run: () => ({ deltas: { health: 3, skill: 1, money: -260 }, lines: ['你把测量时间贴在冰箱上'] }) },
      { text: '下次再说', run: () => ({ deltas: { health: -1 }, lines: ['复诊时医生又问起记录'] }) },
    ]},
  { id: 'old_senior_university', cat: 'classical', weight: 8, minAge: 58, maxAge: 85,
    title: '老年大学', text: '社区开了摄影和书法班。',
    choices: [
      { text: '报摄影班', run: () => ({ deltas: { money: -500, skill: 3, mood: 3 }, lines: ['你开始留意街角的光线'] }) },
      { text: '报书法班', run: () => ({ deltas: { money: -220, skill: 2, mood: 2 }, lines: ['老师让你从基本笔画练起'] }) },
    ]},
  { id: 'old_family_reunion', cat: 'life', weight: 8, minAge: 60, maxAge: 90,
    title: '亲戚聚餐', text: '亲戚群里约了周末聚餐，多年没见的表亲也来。',
    choices: [
      { text: '去参加', run: () => ({ deltas: { money: -240, mood: 3, relations: 2 }, bonds: { family: 2 }, lines: ['你们拍了张合照'] }) },
      { text: '发消息问候', run: () => ({ deltas: { mood: 1, relations: 1 }, bonds: { family: 1 }, lines: ['亲戚回了你一张热菜照片'] }) },
    ]},
  { id: 'old_photo_sorting', cat: 'life', weight: 9, minAge: 58, maxAge: 90,
    title: '整理旧照片', text: '纸箱里装满旧照片，有些背面写着年份。',
    choices: [
      { text: '挑几张讲故事', run: () => ({ deltas: { mood: 3, skill: 1 }, bonds: { family: 2 }, lines: ['孩子把照片扫描进手机'] }) },
      { text: '分类收好', run: () => ({ deltas: { skill: 2, mood: 1 }, lines: ['你把几张最喜欢的放在相框里'] }) },
    ]},
  { id: 'old_pet_companion', cat: 'life', weight: 7, minAge: 60, maxAge: 90,
    title: '邻居的小狗', text: '邻居家的狗常在你门口等主人下班，问你愿不愿意白天遛一圈。',
    choices: [
      { text: '答应遛狗', run: () => ({ deltas: { health: 2, mood: 3 }, bonds: { pet: 2, friends: 1 }, lines: ['小狗每到午后就守在门边'] }) },
      { text: '偶尔照看', run: () => ({ deltas: { health: 1, mood: 1 }, bonds: { pet: 1 }, lines: ['你偶尔帮忙添水'] }) },
    ]},
  { id: 'old_reading_volunteer', cat: 'life', weight: 7, minAge: 58, maxAge: 85,
    title: '去学校读书', text: '社区邀你去小学给孩子读故事。',
    choices: [
      { text: '报名试一次', run: () => ({ deltas: { skill: 2, mood: 3, health: 1 }, bonds: { child: 1 }, lines: ['孩子们围着问故事里的动物'] }) },
      { text: '先帮忙选书', run: () => ({ deltas: { mood: 1, relations: 1 }, lines: ['你挑了几本图画书交给老师'] }) },
    ]},
  { id: 'old_neighbor_moving', cat: 'life', weight: 8, minAge: 60, maxAge: 90,
    title: '老邻居搬走', text: '住了几十年的老邻居要搬去和孩子同住，送来一盆养了多年的绿植。',
    choices: [
      { text: '收下并帮忙搬', run: () => ({ deltas: { health: -1, mood: 2 }, bonds: { friends: 2 }, lines: ['你们约好常打电话'] }) },
      { text: '只收下绿植', run: () => ({ deltas: { mood: 1 }, bonds: { friends: 1 }, lines: ['你接过花盆站在门口挥手'] }) },
    ]},
  { id: 'old_family_gift', cat: 'life', weight: 8, minAge: 60, maxAge: 90, cond: (s) => s.flags.hasChild,
    title: '给孙辈红包', text: '节日快到了，你想给孙辈准备红包，又怕金额太多。',
    choices: [
      { text: '适量红包', run: () => ({ deltas: { money: -500, mood: 2 }, bonds: { child: 2, family: 1 }, lines: ['孙辈跑来抱了你一下'] }) },
      { text: '手作点心', run: () => ({ deltas: { money: -120, mood: 3 }, bonds: { child: 2 }, lines: ['形状不太整齐，但都吃完了'] }) },
    ]},
  { id: 'old_password_help', cat: 'life', weight: 11, minAge: 58, maxAge: 90,
    title: '手机密码忘了', text: '手机更新后要求重新输入密码，你试了几次都不对。',
    choices: [
      { text: '联系客服', run: () => ({ deltas: { skill: 2, mood: 1 }, lines: ['你把密码记在安全的地方'] }) },
      { text: '家人远程帮', run: () => ({ deltas: { mood: 2, skill: 1 }, bonds: { family: 1 }, lines: ['你们一起设了容易记的新密码'] }) },
    ]},
  { id: 'old_transit_card', cat: 'life', weight: 9, minAge: 60, maxAge: 90,
    title: '公交卡不见了', text: '你出门时发现公交卡不在常放的位置。',
    choices: [
      { text: '找一会儿', run: () => ({ deltas: { mood: -1, skill: 1 }, lines: ['你在零钱盒里找到了卡'] }) },
      { text: '投币先出发', run: () => ({ deltas: { money: -5, mood: 1 }, lines: ['你回来后重新整理了常用物品位置'] }) },
    ]},
  { id: 'old_neighborhood_help', cat: 'life', weight: 8, minAge: 55, maxAge: 90,
    title: '楼道停水', text: '小区临时停水，隔壁独居老人家里只剩半壶水。',
    choices: [
      { text: '分点水给邻居', run: () => ({ deltas: { mood: 2, relations: 2 }, bonds: { friends: 1 }, lines: ['邻居把备用饼干塞给你'] }) },
      { text: '留给自己', run: () => ({ deltas: { mood: -1 }, lines: ['邻居后来联系了物业'] }) },
    ]},

  /* ====== 闭关事件（低境界尺度的短闭关）====== */
  { id: 'x_ten_stillroom_mist', cat: 'classical', weight: 5, minAge: 15, cond: (s) => s.flags.xianxia,
    title: '静室灵雾初生', text: '石室久未开启，墙缝间白雾流转，绕着蒲团不散。',
    choices: [
      { text: '顺势引气', run: () => ({ deltas: { mood: 1, health: -1 }, lines: ['灵雾入体气息渐稳'], special: { title: '灵台更明', text: '一缕灵机落定，修为向前迈了一步。' } }) },
      { text: '先行收功', run: () => ({ deltas: { mood: 1, health: 1 }, lines: ['根基安稳灵雾散去'], special: { title: '根基渐稳', text: '此番闭关根基扎实，修为已有精进。' } }) },
    ]},
  { id: 'x_ten_copper_bell', cat: 'classical', weight: 4, minAge: 16, cond: (s) => s.flags.xianxia,
    title: '铜铃自鸣三声', text: '门外旧铜铃忽然自鸣三声，声声落在心湖深处。',
    choices: [
      { text: '循铃声悟法', run: () => ({ deltas: { mood: 2, health: -1 }, lines: ['灵力顺了不少'], special: { title: '听音悟进', text: '借一缕清音破开滞碍，修为更进一步。' } }) },
      { text: '不为外物所动', run: () => ({ deltas: { mood: 1, health: 1 }, lines: ['气息比从前沉稳'], special: { title: '气息沉凝', text: '心境不乱，修为稳稳向前。' } }) },
    ]},
  { id: 'x_ten_cold_spring', cat: 'classical', weight: 4, minAge: 18, cond: (s) => s.flags.xianxia,
    title: '寒泉映出旧我', text: '洞府旁寒泉映着你面容，泉底灵光一闪与丹田气息相应。',
    choices: [
      { text: '取泉水入定', run: () => ({ deltas: { mood: 1, health: -2 }, lines: ['步伐比从前轻快'], special: { title: '寒泉助修', text: '灵泉洗练经脉，修为小有突破。' } }) },
      { text: '只观泉不取', run: () => ({ deltas: { mood: 2, health: 1 }, lines: ['吐纳更顺畅'], special: { title: '观水明心', text: '心境澄澈，修行又进一层。' } }) },
    ]},
  { id: 'x_ten_broken_pill', cat: 'classical', weight: 3, minAge: 18, cond: (s) => s.flags.xianxia,
    title: '丹丸裂纹生光', text: '炉中养气丹忽现细纹，缝隙透出青光。',
    choices: [
      { text: '服下残丹', run: () => ({ deltas: { mood: 1, health: -1, money: 10 }, lines: ['灵力充沛'], special: { title: '药力化灵', text: '借残丹之力，修为再进一步。' } }) },
      { text: '埋入灵土', run: () => ({ deltas: { mood: 1, health: 1 }, lines: ['有了新领悟'], special: { title: '静悟药理', text: '不急于求成，仍从修行中有所精进。' } }) },
    ]},
  { id: 'x_ten_snow_window', cat: 'classical', weight: 4, minAge: 24, cond: (s) => s.flags.xianxia,
    title: '雪落窗前无声', text: '大雪封住山路，你察觉心口多年滞涩松动了。',
    choices: [
      { text: '趁机冲开', run: () => ({ deltas: { mood: 2, health: -3 }, lines: ['灵脉终于畅通'], special: { title: '瓶颈松动', text: '积年滞碍被撬开，修为迈出关键一步。' } }) },
      { text: '随雪调息', run: () => ({ deltas: { mood: 2, health: 1 }, lines: ['根基愈发稳固'], special: { title: '根基厚实', text: '水滴石穿，积年苦修化作实在进境。' } }) },
    ]},
  { id: 'x_ten_ancient_chess', cat: 'classical', weight: 4, minAge: 82, cond: (s) => s.flags.xianxia,
    title: '石桌落下棋子', text: '石桌上凭空多了一枚黑棋，每条线都像灵气运行支脉。',
    choices: [
      { text: '推演棋局', run: () => ({ deltas: { mood: 2, health: -1 }, lines: ['周天少了滞碍'], special: { title: '棋局观脉', text: '由棋路悟得气脉相通之理，修为精进。' } }) },
      { text: '收起棋子', run: () => ({ deltas: { mood: 0, health: 1 }, lines: ['气息更凝练'], special: { title: '凝息有成', text: '屏除杂念，修为稳步提升。' } }) },
    ]},
  { id: 'x_ten_final_breath', cat: 'classical', weight: 5, minAge: 250, cond: (s) => s.flags.xianxia,
    title: '闭关末日气机翻涌', text: '这一段闭关的最后一日，洞府灵气汇成漩涡，丹田气旋加快。',
    choices: [
      { text: '全力冲关', run: () => ({ deltas: { mood: 2, health: -4 }, lines: ['修为踏上新台阶'], special: { title: '闭关破境', text: '积年积累在此刻化为突破，境界迈入新层次。' } }) },
      { text: '护住根基', run: () => ({ deltas: { mood: 1, health: 2 }, lines: ['修为比入关前深厚'], special: { title: '积累更深', text: '根基稳固，下一次突破已有更足把握。' } }) },
    ]},

  /* ====== 闭关事件（高境界尺度的长闭关）====== */
  { id: 'x_century_sealed_scroll', cat: 'classical', weight: 3, minAge: 100, cond: (s) => s.flags.xianxia,
    title: '出关展旧卷', text: '漫长闭关结束，展开当年书卷，纸页已脆如秋叶。',
    choices: [
      { text: '逐字读完', run: () => ({ deltas: { mood: -2 }, lines: ['悲意沉淀化宁静'], special: { title: '修为渐进', text: '漫长静修积累化为境界进益，心境亦更沉厚。' } }) },
      { text: '收进藏阁', run: () => ({ deltas: { mood: 1, health: 1 }, lines: ['灵气归入元神'], special: { title: '功行圆满', text: '漫长闭关凝成修为，元神更见稳固。' } }) },
    ]},
  { id: 'x_century_village_ruins', cat: 'classical', weight: 3, minAge: 120, cond: (s) => s.flags.xianxia,
    title: '故村只剩残墙', text: '曾经住过的村落只剩几段长满野草的土墙。',
    choices: [
      { text: '修补刻字', run: () => ({ deltas: { mood: -2, health: -1, money: -5 }, lines: ['风过草坡'], special: { title: '百年修为有进', text: '百年苦修已有所得，故地旧痕也让道心更明。' } }) },
      { text: '转身离去', run: () => ({ deltas: { mood: 0, health: 1 }, lines: ['元神更沉静'], special: { title: '百年灵台更稳', text: '百年积累沉入元神，修为再进一分。' } }) },
    ]},
  { id: 'x_century_old_friend_grave', cat: 'classical', weight: 3, minAge: 180, cond: (s) => s.flags.xianxia,
    title: '友人坟前荒草深', text: '凡人旧友的坟碑字已磨去大半，荒草没过膝头。',
    choices: [
      { text: '清理杂草', run: () => ({ deltas: { mood: -3, health: -1 }, lines:['酒洒碑前'], special: { title: '百年修持有成', text: '百年静修使修为精进，旧友之情也化作更深道心。' } }) },
      { text: '放束野花', run: () => ({ deltas: { mood: -1, health: 1 }, lines: ['灵台仍向前'], special: { title: '境界精进', text: '漫长岁月淬炼神识，修为再上一层。' } }) },
    ]},
  { id: 'x_century_tribulation_cloud', cat: 'classical', weight: 2, minAge: 140, cond: (s) => s.flags.xianxia,
    title: '劫云压住孤峰', text: '百年修行积满，孤峰上方劫云无声聚拢。',
    choices: [
      { text: '登峰迎劫', run: () => ({ deltas: { mood: 2, health: -8 }, lines: ['山下新村落炊烟'], special: { title: '破境渡劫', text: '渡过大境界天劫，修为跨入新的层次。' } }) },
      { text: '布阵分散', run: () => ({ deltas: { mood: 1, health: -4, money: -25 }, lines: ['禁制需重布'], special: { title: '阵护破境', text: '借阵法分担天劫，终于突破境界。' } }) },
    ]},
  { id: 'x_century_spirit_tide', cat: 'classical', weight: 3, minAge: 200, cond: (s) => s.flags.xianxia,
    title: '灵潮漫过石阶', text: '山间灵潮涨起漫过石阶，潮水里夹着无数陌生人愿望。',
    choices: [
      { text: '引潮入体', run: () => ({ deltas: { mood: -1, health: -3 }, lines: ['气海扩大'], special: { title: '百年吸纳灵潮', text: '炼化灵潮中的精纯灵气，修为大幅精进。' } }) },
      { text: '只取清气', run: () => ({ deltas: { mood: 1, health: -1 }, lines: ['新城镇灯火连片'], special: { title: '灵气凝实', text: '功行配合潮头清气，境界稳步上升。' } }) },
    ]},
  { id: 'x_century_inner_demon', cat: 'classical', weight: 2, minAge: 420, cond: (s) => s.flags.xianxia,
    title: '梦中故友问归期', text: '梦见凡人故友站在老桥边问你为何百年不归，心魔趁隙而入。',
    choices: [
      { text: '直面破心障', run: () => ({ deltas: { mood: -4, health: -5 }, lines: ['故友走进晨雾'], special: { title: '百年心魔化解', text: '直面心魔后道心更坚，修为迈过新的关隘。' } }) },
      { text: '静心诀压下', run: () => ({ deltas: { mood: -1, health: -1 }, lines: ['积累未圆满'], special: { title: '百年修为稳进', text: '百年修持继续增长，心障仍需日后化解。' } }) },
    ]},
  { id: 'x_century_tribulation_mountain', cat: 'classical', weight: 2, minAge: 380, cond: (s) => s.flags.xianxia,
    title: '万峰雷劫将至', text: '化神关隘将开，万峰上空同时聚起劫云。',
    choices: [
      { text: '独自迎劫心', run: () => ({ deltas: { mood: 2, health: -12 }, lines: ['庄稼已收一季又一季'], special: { title: '化神天劫渡成', text: '冲破大境界天劫，踏入化神之境。' } }) },
      { text: '借山势分劫', run: () => ({ deltas: { mood: 1, health: -7, money: -40 }, lines: ['灵脉受损但跨过门槛'], special: { title: '万峰护渡', text: '借山势分担天劫，成功突破化神境界。' } }) },
    ]},
];

/** 年度小事：无选择，轻微影响，避免重复 */
const SMALL_EVENTS = [
  { id: 's_convenience_cat', cat: 'life', weight: 8,  title: '便利店有一只很乖的猫', run: () => ({ deltas: { mood: 3 }, lines: ['它允许你摸了三分钟头'] }) },
  { id: 's_osmanthus',      cat: 'life', weight: 8,  title: '今年的桂花特别香',     run: () => ({ deltas: { mood: 3 }, lines: ['你沿着那条路多走了两遍'] }) },
  { id: 's_seat',           cat: 'life', weight: 7,  title: '公交上有人给你让座',   run: () => ({ deltas: { mood: 2, relations: 2 }, lines: ['你坚持没坐，两个人都笑了'] }) },
  { id: 's_new_dish',       cat: 'funny', weight: 7, title: '终于学会了一道新菜',   run: () => ({ deltas: { skill: 2, mood: 2 }, lines: ['味道勉强及格，你很骄傲'] }) },
  { id: 's_jeans',          cat: 'funny', weight: 5, title: '旧牛仔裤穿不上了',     run: () => ({ deltas: { health: -1, mood: -1 }, lines: ['你决定把它改成帆布包'] }) },
  { id: 's_phone',          cat: 'funny', weight: 5, title: '手机掉进了水杯',       run: () => ({ deltas: { money: -1300, mood: -2 }, lines: ['它在米里躺了两天，活过来了'] }) },
  { id: 's_postcard',       cat: 'life', weight: 6,  title: '收到一张陌生城市的明信片', run: () => ({ deltas: { mood: 4 }, lines: ['背面写着“愿你一切都好”'] }) },
  { id: 's_firefly',        cat: 'life', weight: 5,  title: '夜跑时看见了萤火虫',   run: () => ({ deltas: { mood: 4, health: 1 }, lines: ['你站在原地看了很久'] }) },
  { id: 's_cake',           cat: 'work',  weight: 6,  title: '同事分了你一块蛋糕',   run: () => ({ deltas: { mood: 3, relations: 2 }, lines: ['是你不爱吃的那种，但很开心'] }) },
  { id: 's_snacks',         cat: 'life', weight: 6,  title: '台风天囤对了零食',     run: () => ({ deltas: { money: -300, mood: 3 }, lines: ['风雨夜里，你吃了一包最爱的薯片'] }) },
  { id: 's_rain_window',    cat: 'classical', weight: 6, title: '雨声很适合睡个午觉', run: () => ({ deltas: { health: 2, mood: 2 }, lines: ['你梦见了很长的夏天'] }) },
  { id: 's_old_song',       cat: 'life', weight: 6,  title: '随机播放到十七岁那年的歌', run: () => ({ deltas: { mood: 4 }, lines: ['你在原地站完了整首'] }) },
];

/** 年龄里程碑：到点触发，写入手账 */
const MILESTONES = [
  { age: 18, title: '十八岁的夏天', text: '你高中毕业，把课本卖了三十块。未来是一张没画线的地图。' },
  { age: 20, title: '二十岁', text: '你开始相信“以后会好的”，并且第一次为此付出行动。' },
  { age: 25, title: '二十五岁', text: '你第一次觉得时间是有限的，于是开始挑剔要做什么。' },
  { age: 30, title: '三十而立？', text: '你立下的 flag 倒了一半，站起来的那个反而更结实。' },
  { age: 35, title: '三十五岁', text: '你终于承认自己喜欢什么、不喜欢什么，这很不容易。' },
  { age: 40, title: '四十岁的下午', text: '云走得比年轻时慢，你也学会了等一件事成熟。' },
  { age: 45, title: '四十五岁', text: '上有老下有小的年纪，你在中间把自己活成了一座桥。' },
  { age: 50, title: '半个世纪', text: '你把这个年纪活成了一句：还行，继续。' },
  { age: 55, title: '五十五岁', text: '你开始有选择地见人、说话、赴约，世界因此变干净了。' },
  { age: 60, title: '退休前的最后一年', text: '你在工位上收拾东西，发现自己比想象中平静。' },
  { age: 65, title: '退休金到账的第一年', text: '每个月固定一笔钱，像岁月终于开始给你发工资。' },
  { age: 70, title: '七十岁', text: '你的早晨属于公园，下午属于茶，晚上属于早睡。' },
  { age: 75, title: '七十五岁', text: '你把很多事情放下了，剩下的都是真的。' },
  { age: 80, title: '八十岁', text: '这一生的天气，到这里全部放晴。' },
];

// ===== src/data/mortality.js =====
// 分年龄性别年死亡率（‰），来源：中国人口普查年鉴 + WHO 中国数据
// 男性 MALE / 女性 FEMALE，按年龄段区间
const TABLE = [
  [0,    6.0, 5.2],
  [1,    0.6, 0.5],
  [5,    0.3, 0.25],
  [10,   0.3, 0.2],
  [15,   0.9, 0.4],
  [20,   1.05, 0.4],
  [25,   1.0, 0.4],
  [30,   1.0, 0.5],
  [35,   1.2, 0.6],
  [40,   1.8, 1.0],
  [45,   2.8, 1.6],
  [50,   4.5, 2.6],
  [55,   7.5, 4.5],
  [60,   12.5, 7.5],
  [65,   20, 12],
  [70,   35, 22],
  [75,   60, 40],
  [80,   100, 70],
  [85,   170, 120],
  [90,   280, 210],
  [95,   450, 380],
];

function lookup(age, female) {
  let row = TABLE[TABLE.length - 1];
  for (let i = 0; i < TABLE.length; i++) {
    if (age >= TABLE[i][0]) row = TABLE[i];
    else break;
  }
  return female ? row[2] : row[1];
}

/**
 * 返回该年死亡概率（0~1）。
 * @param {object} state - 当前游戏状态
 * @returns {number} 0~1
 */
function annualMortality(state) {
  // patch90：**修仙者改「寿元制」**，不吃凡人死亡率。
  // 原来按「凡人年死亡率 × 境界折扣」逐年判定，而闭关一跳就是几千年，
  // 2000 年要判 2000 次，累计必死（实测活到 2020 岁就死，修为只停在筑基）。
  // 现在只按「当前境界的寿元」算：寿元充裕时几乎不死，寿元将尽才开始衰竭。
  if (state.flags && state.flags.xianxia && (state.cultivationLevel || 0) >= 1) {
    const realm = realmOf(state.cultivationLevel || 0);
    const lifespan = realm.lifespanBonus || 1000;
    const ratio = (state.age || 0) / lifespan;
    // patch158：**按本次跨度摊薄**。引擎把年度结算逐年跑（跳 40 万年 = 判 40 万次），
    // 若仍返回「每年死亡率」，一次闭关就能把角色判死。除以 span 后，
    // 「整个跨度的累计风险」才与跨度无关。
    const _span = Math.max(1, state.crossedSpan || 1);
    if (ratio < 0.85) return 0.000005 / _span;          // 寿元充裕：整个跨度内几乎不会死
    if (ratio < 1) {                                     // 85%~100%：开始衰竭
      const t = (ratio - 0.85) / 0.15;
      return (0.0002 + t * t * 0.05) / _span;
    }
    return 1 / _span;                                     // 寿元尽了：整个跨度内必死一次
  }
  const female = state.gender === 'female';
  // patch85：**让 lifespanBonus 真正生效**（它以前是完全没被读取的死代码）。
  // 修仙者的「生理年龄」= 实际年龄 - 当前境界的寿元加成，下限 20 岁（身体回春但不回童年）。
  // 例：元婴(+500) 在 300 岁时，生理年龄 = max(20, -200) = 20 → 死亡率极低。
  let effAge = state.age;
  if (state.flags && state.flags.xianxia) {
    const lifespanBonus = realmOf(state.cultivationLevel || 0).lifespanBonus || 0;
    // patch86：下限 20 → 30。太低的生理年龄会让死亡率几乎归零，
    // 配合寿命延长就变成"修仙者几乎不会自然死亡"，飞升率失控。
    effAge = Math.max(30, state.age - lifespanBonus);
  }
  let perMille = lookup(effAge, female);

  // 健康系数
  const h = state.attrs.health;
  if (h >= 85) perMille *= 0.5;
  else if (h >= 60) perMille *= 1.0;
  else if (h >= 30) perMille *= 2.0;
  else perMille *= 4.0;

  // 生活方式修正
  if (state.streak && state.streak.n >= 5 && state.streak.action === 'work') perMille *= 1.3;
  if (state.streak && state.streak.n >= 2 && state.streak.action === 'rest') perMille *= 0.8;
  if (state.bonds && (state.bonds.lover > 0 || state.bonds.child > 0)) perMille *= 0.85;
  if (state.attrs.relations < 20) perMille *= 1.2;
  if (state.streak && state.streak.action === 'finance' && state.streak.n >= 3) perMille *= 1.2;


  return perMille / 1000;
}

/** 根据年龄和状态选一个死因文案 */
function pickDeathCause(state, rng) {
  const age = state.age;
  if (state.flags && state.flags.xianxia) {
    return rng.pick([
      '渡劫时兵解，散作满天星光',
      '坐化于洞府，只留下一部未写完的道经',
      '与魔道高手决战后油尽灯枯',
    ]);
  }
  if (age < 1) return rng.pick(['早产并发症，没能看一眼这个世界', '先天不足，在睡梦中安静离开']);
  if (age < 15) return rng.pick(['一场急病带走了', '意外溺水，夏天永远停在了那年']);
  if (age < 30) return rng.pick(['一场交通事故，人生戛然而止', '突发急病，来不及告别', '意外摔倒后再没醒来']);
  if (age < 50) return rng.pick(['积劳成疾，身体先垮了', '一场重病，治疗了很久还是走了', '意外，谁也没想到']);
  if (age < 70) return rng.pick(['癌症，抗争了两年还是输了', '心脑血管意外，走得很突然', '在医院的病床上，家人陪着走完最后一程']);
  if (age < 90) return rng.pick(['在睡梦中平静地离开了', '器官衰竭，慢慢熄灭', '换季时一场肺炎，没扛过去']);
  return rng.pick(['高寿，在一个寻常的午后安然辞世', '儿孙环绕中走完了最后一程', '无疾而终，像翻完最后一页书']);
}

/** 判断是否算"早逝"（结局标签用） */
function isEarlyDeath(age) {
  return age < 50;
}

// ===== src/data/cultivation.js =====
// 修仙境界系统：五个境界，每境界12层，共60层后飞升
// 练气(1-12) → 筑基(13-24) → 金丹(25-36) → 元婴(37-48) → 化神(49-60) → 飞升

const REALMS = [
  /* patch101：**每境 12 层，共 108 层**。
     patch156：**重设跨度曲线**——玩家要求「不要一上来就闭关几千年」。
     现在起步很低再指数增长：练气 5 年、筑基 50 年、金丹 400 年……
     每境约 2 次闭关，累计约 2500 万年（寿元 3 亿，占 8.3%，安全）。 */
  { id: 'mortal',   name: '凡人', minLevel: 0,   lifespanBonus: 0,          desc: '未入仙途',           yearSkip: 1 },
  { id: 'lianqi',   name: '练气', minLevel: 1,   lifespanBonus: 5000,       desc: '感气入体，寿元初增',   yearSkip: 5 },
  { id: 'zhuji',    name: '筑基', minLevel: 13,  lifespanBonus: 20000,      desc: '道基初成，百病不侵',   yearSkip: 50 },
  { id: 'jindan',   name: '金丹', minLevel: 25,  lifespanBonus: 100000,     desc: '金丹凝成，寿过三纪',   yearSkip: 400 },
  { id: 'yuanying', name: '元婴', minLevel: 37,  lifespanBonus: 500000,     desc: '元婴出窍，陆地神仙',   yearSkip: 2500 },
  { id: 'huashen',  name: '化神', minLevel: 49,  lifespanBonus: 2000000,    desc: '神游太虚，千年一瞬',   yearSkip: 15000 },
  { id: 'fanxu',    name: '返虚', minLevel: 61,  lifespanBonus: 8000000,    desc: '炼神还虚，身与道同',   yearSkip: 80000 },
  { id: 'heti',     name: '合体', minLevel: 73,  lifespanBonus: 30000000,   desc: '天人合一，万法归元',   yearSkip: 400000 },
  { id: 'dacheng',  name: '大乘', minLevel: 85,  lifespanBonus: 100000000,  desc: '万法归一，只差一步',   yearSkip: 2000000 },
  { id: 'dujie',    name: '渡劫', minLevel: 97,  lifespanBonus: 300000000,  desc: '雷劫加身，九死一生',   yearSkip: 10000000 },
  // patch102：109 → 102。实测 109 层时飞升率只有 5%，大部分修仙者停在合体/返虚。
  { id: 'feisheng', name: '飞升', minLevel: 102, lifespanBonus: 9999999999, desc: '功德圆满，羽化登仙',   yearSkip: 1 },
];

/* patch89：跨度说人话——500 年 / 2 万年 / 15 万年 */
function fmtYears(n) {
  n = Math.max(0, Math.round(n || 0));
  if (n < 10000) return n + ' 年';
  const w = n / 10000;
  return (w >= 100 ? Math.round(w) : w.toFixed(1).replace(/\.0$/, '')) + ' 万年';
}
function fmtAge(n) {
  n = Math.max(0, Math.round(n || 0));
  if (n < 10000) return n + ' 岁';
  if (n < 100000000) {
    const w = n / 10000;
    return (w >= 100 ? Math.round(w) : w.toFixed(1).replace(/\.0$/, '')) + ' 万岁';
  }
  const y = n / 100000000;
  return (y >= 100 ? Math.round(y) : y.toFixed(1).replace(/\.0$/, '')) + ' 亿岁';
}

function realmOf(cultivationLevel) {
  let r = REALMS[0];
  for (const realm of REALMS) {
    if (cultivationLevel >= realm.minLevel) r = realm;
  }
  return r;
}

// 当前境界内第几层（1-12）
function layerInRealm(cultivationLevel) {
  const realm = realmOf(cultivationLevel);
  if (realm.id === 'mortal' || realm.id === 'feisheng') return 0;
  return cultivationLevel - realm.minLevel + 1;
}

// 修仙者死亡率修正
function xianxiaMortalityFactor(state) {
  if (!state.flags || !state.flags.xianxia) return 1;
  const lv = state.cultivationLevel || 0;
  if (lv >= 49) return 0.01;
  if (lv >= 37) return 0.04;
  if (lv >= 25) return 0.12;
  if (lv >= 25) return 0.15;
  if (lv >= 13) return 0.35;
  return 0.6;
}

// 闭关修炼：增加修为，可能突破，时间快进
function cultivate(state, rng, mods) {
  const results = [];
  const lv = state.cultivationLevel || 0;
  if (!state.flags.xianxia) return results;

  // patch51：原来每次 +6~9 层，7 次就能到 61 层飞升（实测中位 4 次闭关就飞升、52-60 岁）。
  // 改成：基础 3~5 层，并且**境界越高越难**（瓶颈）——高境界一次闭关只能推进很少。
  const __root = spiritRootOf(state);
  const lvNow = state.cultivationLevel || 0;
  // patch52：原来 55+ 只有 0.18，化神期几乎推不动（中位只到 36 层）。
  // 放宽一档：让高境界仍然吃力，但可及。
  // patch86：化神后期（55+）收益 0.4 → 0.3——飞升门槛提高到 72 层后，
  // 最后十几层必须非常吃力，否则「活得久就自动飞升」。
  // patch101：层数上限 81 → 108（每境 12 层），各档位按新境界重排。
  // 108 层 / 平均约 6 层每次 ≈ 18 次闭关，配合递增跨度累计约 215 万年。
  const realmEase = lvNow >= 97 ? 0.30 : lvNow >= 85 ? 0.42 : lvNow >= 73 ? 0.52
    : lvNow >= 61 ? 0.62 : lvNow >= 49 ? 0.72 : lvNow >= 37 ? 0.82
    : lvNow >= 25 ? 0.92 : lvNow >= 13 ? 1.05 : 1.15;
  // patch92：**单次涨幅上限 6 层**。原来灵根+技能加成叠加，一次闭关能涨 19 层
  //（从凡人直跳金丹），跳 1 万年，节奏失控。6 层 ≈ 半个境界，81 层约需 14 次闭关。
  const _rawGain = Math.round(rng.float(3, 5) * realmEase
    * (1 + state.attrs.skill / 300) * (__root ? __root.gainMult : 1) * ((mods && mods.cultivateGain) || 1));
  // patch101：每境从 9 层加到 12 层，单次上限 6 → 8（约 2/3 个境界），
  // 这样每境约 1.5~2 次闭关，108 层约 18 次。
  // patch111：体质加成（修行快慢）
  const _bodyGain = (function () { try { const c = constitutionOf(state); return c ? (c.gainMult || 1) : 1; } catch (e) { return 1; } })();
  const gain = Math.min(9, Math.max(1, Math.round(_rawGain * _bodyGain))); // patch6：特质也影响修为
  const oldRealm = realmOf(lv);
  state.cultivationLevel = lv + gain;
  const newRealm = realmOf(state.cultivationLevel);
  // patch85：闭关本身就是养身——每次小幅回健康，突破境界大幅回健康（脱胎换骨）。
  // 否则「一次闭关几百年、一次休息才一年」的时间不对等会直接把修仙者耗死。
  try {
    state.attrs.health = Math.min(100, (state.attrs.health || 0) + 4);
    if (newRealm.id !== oldRealm.id && newRealm.id !== 'feisheng') {
      state.attrs.health = Math.min(100, (state.attrs.health || 0) + 18);
    }
  } catch (e) { /* 不影响主流程 */ }

  // 时间快进：**按境界递增**（练气 330 年 → 渡劫 41 万年），数值见 REALMS[].yearSkip
  const skipYears = newRealm.yearSkip;
  state.age += skipYears;
  state.year += skipYears;
  results.push({ text: `闭关 ${fmtYears(skipYears)}，修为精进了 ${gain} 层（当前 ${state.cultivationLevel} 层，${newRealm.name} · 第${layerInRealm(state.cultivationLevel)}层）` });
  // patch78：**岁月回顾**——闭关跳过的这几年要有"被讲述"的感觉，
  // 否则玩家点一下就从 30 岁跳到 75 岁，完全不知道中间发生了什么（失去控制感）。
  // patch153/156：档位覆盖 5 年 ~ 1000 万年（跟新的 yearSkip 曲线对齐）
  results.push({ text: (function (n) {
    if (n >= 5000000) return '几百万年过去了。你出关时，连这片山都不在了，只有你还站在原地。';
    if (n >= 1000000) return '一百万年。你出关那天，天上有两颗星已经换了方位。';
    if (n >= 300000) return '三十万年。山下的国家连传说都没留下，只有你还记得那些名字。';
    if (n >= 100000) return '十万年。你出关时，脚下那条河改了道，山也矮了一截。';
    if (n >= 30000) return '三万年。洞府外的石头都被风磨圆了，你还坐在原来的位置。';
    if (n >= 8000) return '八千年。你出关时，洞口那棵小树已经枯了又生了好几轮。';
    if (n >= 2000) return '两千年。你出关那天，发现山下的城早就不在那里了。';
    if (n >= 350) return '几百年过去。山下的孩子长大了、老了、走了，你都没看见。';
    if (n >= 40) return '五十年。你出关时，认识的人已经老了一轮，你还是原来的样子。';
    if (n >= 10) return '十几年。等你回过神，季节已经轮过好几圈。';
    return '又是几年。等你回过神，季节已经轮过好几圈。';
  })(skipYears) });

  // 突破判定
  if (newRealm.id !== oldRealm.id && newRealm.id !== 'feisheng') {
    results.push({ breakthrough: true, text: `【突破】你从${oldRealm.name}突破到了${newRealm.name}！${newRealm.desc}` });
  }
  if (newRealm.id === 'feisheng') {
    results.push({ breakthrough: true, text: '【飞升】你功德圆满，云霞满天，羽化登仙而去！' });
    state.flags.feisheng = true;
    state.died = true;
    state.deathCause = '白日飞升，得道成仙';
    return results;
  }

  // 走火入魔：境界越高风险越大，高境界可能直接陨落
  // patch101：层数上限 81 → 108，走火风险的分母同步放大（保持同样的曲线形状）
  const _bodyDanger = (function () { try { const c = constitutionOf(state); return c ? (c.dangerMult || 1) : 1; } catch (e) { return 1; } })();
  // patch159：**按 108 层归一化**。原来 level/33 × 0.88 在 84 层就是 224%，
  // 乘 0.34 后仍有 76% 走火率——角色一旦活到高境界就必然被磨死。
  // patch160：0.35 → 0.50。飞升率 26.7% 偏高，历史基线是 8~10%
  const danger = (state.cultivationLevel / 108) * 0.50 * (spiritRootOf(state) ? spiritRootOf(state).dangerMult : 1) * _bodyDanger;
  // patch51：原来基准 0.25，配合"只需 4-7 次闭关"几乎不会出事（飞升率 82.8%）。
  // 现在闭关次数大幅增加，风险基数也提高，让飞升成为少数人的结局。
  // patch52：0.42 配 uppercase"收益放宽"后仍要试；先回到 0.3 观察
  // patch53：14.5% → 目标 10%，再压一档
  const hit = rng.chance(danger);   // patch159：danger 本身已经是概率，不再乘 0.34
  if (hit) {
    results.push({ danger: true, text: '走火入魔！你经脉逆行，休养了数年才恢复' });
    state.attrs.health = Math.max(0, state.attrs.health - 30);
    state.cultivationLevel = Math.max(0, state.cultivationLevel - Math.round(gain));
    // 高境界走火入魔可能直接陨落
    if (state.cultivationLevel >= 33 && rng.chance(0.10)) {
      state.died = true;
      state.deathCause = '走火入魔，身殒道消';
      results.push({ breakthrough: false, text: '【陨落】你经脉尽断，元神溃散，一代修士就此落幕。' });
    }
  }

  return results;
}

// ===== src/rng.js =====
// 可控随机数工具：种子确定后序列可复现，rng.state 可写入存档，便于测试与刷新后续玩。

function createRng(seed) {
  let s = (seed >>> 0) || 0x9e3779b9;
  const api = {
    next() {
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    int(min, max) { return min + Math.floor(api.next() * (max - min + 1)); },
    float(min, max) { return min + api.next() * (max - min); },
    chance(p) { return api.next() < p; },
    pick(arr) { return arr[Math.floor(api.next() * arr.length)]; },
    get state() { return s >>> 0; },
    set state(v) { s = v >>> 0; },
  };
  return api;
}

function randomSeed() {
  return (Math.random() * 0xffffffff) >>> 0;
}

/** 按权重抽取；weightOf 返回 0 或负数视为不参与。 */
function weightedPick(rng, items, weightOf) {
  let total = 0;
  const weights = items.map((it) => {
    const w = Math.max(0, Number(weightOf(it)) || 0);
    total += w;
    return w;
  });
  if (total <= 0) return rng.pick(items);
  let r = rng.next() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

