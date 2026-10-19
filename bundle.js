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
function spiritRootOf(state) { return SPIRIT_ROOT_BY_ID[(state.flags || {}).spiritRoot] || null; }

/* ===== patch111：**体质系统**（道体是体质，不是灵根） =====
   测灵根时有独立概率附带一种体质。灵根决定「修行快慢」，体质决定「特殊天赋」。 */
const CONSTITUTIONS = [
  /* ===== patch115：体质池扩充到 24 种（六档）=====
     灵根决定「修行快慢」，体质决定「特殊天赋」。两者独立抽取、可同时出现。
     权重按品级递减，负面体质也占少量比例——不然「抽体质」就没有惊喜感了。 */

  // ── 顶级（tier 9）──
  { id: 'daoti',         name: '先天道体',   tier: 9, weight: 1, desc: '不必引气，周天自转，是传说里才有的资质',         gainMult: 1.45, dangerMult: 0.45 },
  { id: 'chaos_body',    name: '混沌道体',   tier: 9, weight: 1, desc: '无属可归，五系俱在心中，修行全看自己怎么开',     gainMult: 1.4,  dangerMult: 0.5 },
  { id: 'creation_body', name: '造化道体',   tier: 9, weight: 1, desc: '万物生机皆可为我所用，草木虫鱼在你身边都长得旺', gainMult: 1.42, dangerMult: 0.48 },

  // ── 高级（tier 8）──
  { id: 'taichu_body',   name: '太初之体',   tier: 8, weight: 2, desc: '生于混沌之前，天地初开时的那口精气留在你身上',   gainMult: 1.32, dangerMult: 0.6 },
  { id: 'wuxing_body',   name: '五行灵体',   tier: 8, weight: 2, desc: '五系皆通，学什么都比人快一截，也哪一系都不算精', gainMult: 1.3,  dangerMult: 0.62 },

  // ── 中高（tier 7）──
  { id: 'sword_body',    name: '剑道体',     tier: 7, weight: 4, desc: '生来就懂剑意，杀伐一途几乎无坎',                 gainMult: 1.22, dangerMult: 0.85 },
  { id: 'thunder_body',  name: '雷灵体',     tier: 7, weight: 4, desc: '经脉天生导电，雷劫比常人轻一半',                 gainMult: 1.2,  dangerMult: 0.6 },
  { id: 'sun_body',      name: '太阳之体',   tier: 7, weight: 4, desc: '至阳至刚，正午修行事半功倍，夜里则事倍功半',     gainMult: 1.24, dangerMult: 0.8 },
  { id: 'moon_body',     name: '太阴之体',   tier: 7, weight: 4, desc: '至阴至静，夜里周身自生清辉，心境极难被撼动',     gainMult: 1.24, dangerMult: 0.78 },
  { id: 'star_body',     name: '星辰体',     tier: 7, weight: 4, desc: '与周天星辰同频，观星一夜胜过闭关一月',           gainMult: 1.2,  dangerMult: 0.7 },

  // ── 中级（tier 6）──
  { id: 'pill_body',     name: '药王体',     tier: 6, weight: 6, desc: '百毒不侵，丹药之力在你身上能翻倍',               gainMult: 1.15, dangerMult: 0.7 },
  { id: 'ice_body',      name: '冰魄体',     tier: 6, weight: 6, desc: '心境天生冷硬，走火入魔几乎找不上你',             gainMult: 1.14, dangerMult: 0.55 },
  { id: 'yang_body',     name: '纯阳体',     tier: 6, weight: 6, desc: '阳气极盛，阴邪之物近不了身',                     gainMult: 1.16, dangerMult: 0.8 },
  { id: 'yin_body',      name: '纯阴体',     tier: 6, weight: 6, desc: '阴气极盛，通幽见微，最擅窥人心事',               gainMult: 1.16, dangerMult: 0.8 },
  { id: 'glass_heart',   name: '琉璃心',     tier: 6, weight: 6, desc: '心念澄澈如琉璃，道心几乎不会碎',                 gainMult: 1.12, dangerMult: 0.5 },
  { id: 'spirit_eye',    name: '灵眼',       tier: 6, weight: 6, desc: '能直接看见天地灵气的流动，找灵脉一找一个准',     gainMult: 1.18, dangerMult: 0.85 },

  // ── 中低（tier 5）──
  { id: 'body_strong',   name: '不坏体',     tier: 5, weight: 8, desc: '筋骨比同辈厚一层，硬抗天劫活下来的几率更高',     gainMult: 1.08, dangerMult: 0.78 },
  { id: 'strong_bone',   name: '天生神力',   tier: 5, weight: 8, desc: '一身蛮力，动手从不吃亏',                         gainMult: 1.06, dangerMult: 1.0 },
  { id: 'void_body',     name: '空灵体',     tier: 5, weight: 8, desc: '心里天生空，修行不易心烦',                       gainMult: 1.1,  dangerMult: 0.75 },
  { id: 'blood_body',    name: '血煞体',     tier: 5, weight: 8, desc: '修得极快，全靠烧自己的气血，经脉受损几乎不可逆', gainMult: 1.26, dangerMult: 1.15 },

  // ── 特殊 / 负面（tier 3-4）──
  { id: 'mortal_bone',   name: '凡骨',       tier: 4, weight: 3, desc: '最普通的骨头，练什么都要比别人多花三倍功夫',     gainMult: 0.78, dangerMult: 1.1 },
  { id: 'leaky_body',    name: '漏气体',     tier: 3, weight: 3, desc: '灵气进来了存不住，一年修出别人一月的量',         gainMult: 0.7,  dangerMult: 1.05 },
  { id: 'short_life',    name: '短命相',     tier: 3, weight: 3, desc: '天生长寿无望，寿元比同境界的人短一大截',         gainMult: 1.05, dangerMult: 1.3 },
  { id: 'obsessed_body', name: '痴心体',     tier: 4, weight: 3, desc: '情之一字最伤人，也最能入道——极险，也极快',       gainMult: 1.22, dangerMult: 1.2 },
];
const CONSTITUTION_BY_ID = CONSTITUTIONS.reduce(function (m, c) { m[c.id] = c; return m; }, {});
function constitutionOf(state) { return CONSTITUTION_BY_ID[(state.flags || {}).constitution] || null; }

/** 测体质：约 12% 概率出现（仙缘深厚/幸运加成会提高） */
function rollConstitution(rng, state) {
  var bonus = ((state.traitIds || []).indexOf("immortal_fate") >= 0 ? 1 : 0)
    + ((state.traitIds || []).indexOf("lucky") >= 0 ? 1 : 0);
  var p = 0.10 + bonus * 0.04;
  if (rng.next() > p) return null;
  var total = 0, i;
  for (i = 0; i < CONSTITUTIONS.length; i++) total += CONSTITUTIONS[i].weight;
  var x = rng.next() * total;
  for (i = 0; i < CONSTITUTIONS.length; i++) { x -= CONSTITUTIONS[i].weight; if (x <= 0) return CONSTITUTIONS[i]; }
  return null;
}


/** 测灵根：仙缘深厚 / 抓周抓到药罐 / 运气好 会向高资质倾斜 */
function rollSpiritRoot(rng, state) {
  const bonus = ((state.traitIds || []).includes('immortal_fate') ? 1 : 0)
    + (state.flags.zhuazhou_medicine ? 1 : 0)
    + ((state.traitIds || []).includes('lucky') ? 1 : 0);
  const n = SPIRIT_ROOTS.length;
  // patch8：改成按品级档缩放权重（原来是按名次的指数曲线，对表的后半段几乎无效）
  const weights = SPIRIT_ROOTS.map((r) => r.weight * rootWeightFactor(r.tier, bonus));
  const total = weights.reduce((a, b) => a + b, 0);
  let x = rng.next() * total;
  for (let i = 0; i < n; i++) { x -= weights[i]; if (x <= 0) return SPIRIT_ROOTS[i]; }
  return SPIRIT_ROOTS[n - 1];
}

/* ================= 灵根专属事件（patch7 注入） =================
   27 个：26 种灵根各一个（id 以 rx_ 开头）+ 1 个通用的「灵根化形」。
   与既有 x_ 修仙事件并存，不冲突；cond 里用的是 rootIs/rootTierOf，
   所以只有对应的灵根才可能抽到自己的那一个。 */
const ROOT_AWAKEN_EVENT = {
  id: 'x_root_awaken', cat: 'classical', weight: 9, minAge: 20, maxAge: 420,
  cond: (s) => s.flags.xianxia && !s.flags.rootAwakened && rootTierOf(s) >= 6,
  title: '灵根化形',
  text: '闭关到第七年，你的灵根忽然自己动了。经脉里像有什么东西在找出口，一圈一圈往外顶。',
  choices: [
    {
      text: '顺着它走，让灵根自己长出来', hint: '让灵根显形，修行再上一层',
      run: ({ rng, draft }) => {
        const r = rootOfState(draft);
        const ok = rng.chance(0.62 + r.tier * 0.03);
        if (ok) {
          return {
            deltas: { health: 6, mood: 8, skill: 4 },
            lines: [`你在镜子里看见自己的瞳孔变了颜色——那是${r.name}的痕迹`, '老道看了很久，说：「成了。以后再没有人能装作看不出你是谁。」'],
            flags: { rootAwakened: true },
            special: { title: `灵根化形 · ${r.name}`, text: `${r.desc}。从今往后，这一身资质再也藏不住。` },
          };
        }
        return {
          deltas: { health: -8, mood: -3 },
          lines: ['那东西顶到一半又缩了回去', '你吐了一口血，经脉比从前更涩'],
        };
      },
    },
    {
      text: '强行压住，只当没有这回事', hint: '稳妥，但错过一次显形',
      run: () => ({
        deltas: { health: 2, mood: -2 },
        lines: ['你用静心诀压了三个月', '它安静了。你不知道这是好事还是坏事'],
        flags: { rootAwakened: true },
      }),
    },
  ],
};

/* ================= 二、26 种灵根各自的专属事件 ================= */
const ROOT_EVENTS = [
  {
    id: 'rx_tian', cat: 'classical', weight: 12, minAge: 16, maxAge: 600,
    cond: (s) => rootIs(s, 'tian'),
    title: '天灵根之累',
    text: '你测出天灵根的消息传出去了。三天里来了七拨人：有来求亲的世家、有来招揽的宗门、也有两个不愿留名的夜里翻墙进来过。老道说：「你从今天起，不再是一个人了。」',
    choices: [
      {
        text: '闭门谢客，一个人修到底', hint: '清静，但得罪所有人',
        run: () => ({
          deltas: { skill: 16, mood: 6, relations: -14 },
          lines: ['你在门上贴了一张「闭关」的字条', '第七拨人来了以后，再没有人敲过那扇门'],
          flags: { tianHermit: true },
        }),
      },
      {
        text: '挑一家最正派的入门', hint: '有靠山，也有规矩',
        run: () => ({
          deltas: { skill: 9, relations: 16, mood: 4, money: 5000 },
          lines: ['你选了一家，拜了师', '有了靠山，也有了要还的人情'],
          flags: { tianSect: true },
        }),
      },
    ],
  },
  {
    id: 'rx_dual', cat: 'classical', weight: 10, minAge: 16, maxAge: 400,
    cond: (s) => rootIs(s, 'dual'),
    title: '两系的歧路',
    text: '两系都练到了练气九层，再往上必须选一条主路。老道把两本功法摊在桌上，只让你拿一本。',
    choices: [
      {
        text: '选修得快的那一系', hint: '先上去再说',
        run: () => ({
          deltas: { skill: 13, mood: 4, health: -4 },
          lines: ['你拿了那一本，另一本还摊在桌上', '三年后你筑基了。另一本已经落灰'],
          flags: { dualFast: true },
        }),
      },
      {
        text: '选修得稳的那一系', hint: '慢，但不容易翻车',
        run: () => ({
          deltas: { skill: 8, health: 8, mood: 6 },
          lines: ['你拿了那一本，另一本你还给了老道', '老道说：「你会走得比他们远，只是没人给你鼓掌。」'],
          flags: { dualSteady: true },
        }),
      },
    ],
  },
  {
    id: 'rx_chaos_origin', cat: 'classical', weight: 12, minAge: 16, maxAge: 600,
    cond: (s) => rootIs(s, 'chaos_origin'),
    title: '无属之试',
    text: '老道拿出一只空碗，往里注了五种灵气，五色在碗里互相吞噬，最后变成一碗浑水。他把碗推到你面前："无属之人，只能自己定一条路。"',
    choices: [
      {
        text: '选定一系，把其余四系按下去', hint: '换来一条快路',
        run: ({ draft }) => ({
          deltas: { skill: 12, mood: -6 },
          lines: ['你选了其中一色，另外四色沉到了碗底', '从那以后你的出手干净利落，只是偶尔会梦见那四色'],
          flags: { rootPathFixed: true },
        }),
      },
      {
        text: '把五色都留下，一样一样地走', hint: '又慢又险，但没人知道尽头',
        run: ({ rng }) => {
          const bad = rng.chance(0.28);
          return bad
            ? { deltas: { health: -14, mood: -4 }, lines: ['五色在你经脉里打了一架', '你躺了半年，起来时觉得自己老了一截'] }
            : { deltas: { skill: 6, health: -6, mood: 4 }, lines: ['五色各自安顿了下来', '老道说：「我看不懂你在练什么。这可能是好事。」'] };
        },
      },
    ],
  },
  {
    id: 'rx_daoti', cat: 'classical', weight: 12, minAge: 16, maxAge: 600,
    cond: (s) => rootIs(s, 'daoti'),
    title: '道体自鸣',
    text: '你没打坐，只是在溪边站着。回头时，整条溪的水都停了，鱼悬在半空。老道跑过来，看了你很久，什么也没说。',
    choices: [
      {
        text: '追问老道，这到底是什么', hint: '弄明白，但要担风险',
        run: ({ rng }) => {
          const bad = rng.chance(0.2);
          return bad
            ? { deltas: { health: -10, mood: -5 }, lines: ['老道说了三个字，你只听见第一个', '剩下两个像钉子一样留在脑子里，疼了很多年'] }
            : { deltas: { skill: 15, mood: 6 }, lines: ['老道把那三个字说完了', '你当场明白了一件事，是别人一辈子也到不了的地方'] };
        },
      },
      {
        text: '什么都不问，继续站着', hint: '不求甚解，水到渠成',
        run: () => ({
          deltas: { health: 8, mood: 10 },
          lines: ['水又流了起来，鱼落回水里', '你什么也没得到，也什么也没失去'],
        }),
      },
    ],
  },
  {
    id: 'rx_jin', cat: 'classical', weight: 10, minAge: 16, maxAge: 400,
    cond: (s) => rootIs(s, 'jin'),
    title: '金气割脉',
    text: '你按功法引气，金气比谁都听话，也比谁都利。一夜之间，三道经脉被自己的灵气割开。',
    choices: [
      {
        text: '以金养金，让伤口也变成剑', hint: '越伤越强，也越难收',
        run: () => ({
          deltas: { skill: 14, health: -10 },
          lines: ['你没有止血，只是把金气引向伤处', '伤口结痂的形状，像一柄很小的剑'],
          flags: { jinScar: true },
        }),
      },
      {
        text: '改用木系药材温养经脉', hint: '慢一步，但走得远',
        run: () => ({
          deltas: { health: 8, skill: 4, money: -800 },
          lines: ['你花了一笔钱买药，把三道伤口养了回去', '这一养就是三年。老道说：「你比我想的沉得住气。」'],
        }),
      },
    ],
  },
  {
    id: 'rx_mu', cat: 'classical', weight: 10, minAge: 16, maxAge: 400,
    cond: (s) => rootIs(s, 'mu'),
    title: '药圃夜话',
    text: '你在药圃守夜，一株枯了很久的灵芝在你脚边重新抽了芽。第二天，山下村子来人求药，说有个孩子快不行了。',
    choices: [
      {
        text: '把刚抽芽的灵芝摘下来送人', hint: '救人，自己少一味药',
        run: () => ({
          deltas: { mood: 12, relations: 8, skill: -3 },
          lines: ['孩子救回来了', '村里人送来一篮鸡蛋，你不会收，他们就放在门口走了'],
          flags: { savedChild: true },
        }),
      },
      {
        text: '留着灵芝，只给对方一张方子', hint: '不亏自己，也帮了人',
        run: ({ rng }) => {
          const bad = rng.chance(0.35);
          return bad
            ? { deltas: { mood: -8, relations: -4, skill: 5 }, lines: ['方子抓不到药，孩子没撑过去', '灵芝长得很好。你很久没去药圃'] }
            : { deltas: { mood: 5, skill: 6, relations: 3 }, lines: ['方子凑齐了，孩子好了', '你的灵芝也留下来了'] };
        },
      },
    ],
  },
  {
    id: 'rx_shui', cat: 'classical', weight: 10, minAge: 16, maxAge: 400,
    cond: (s) => rootIs(s, 'shui'),
    title: '水磨之期',
    text: '同门三年就筑基，你还在练气九层。老道往你面前放了一块石头和一碗水："你自己选。"',
    choices: [
      {
        text: '每日以水磨石一角', hint: '极慢，但每一步都算数',
        run: () => ({
          deltas: { skill: 8, mood: 4 },
          lines: ['你把石头放进溪里，每天去看一眼', '第十一年，石头没了。你的境界也到了'],
          flags: { waterGrind: true },
        }),
      },
      {
        text: '引大水冲开经脉', hint: '快，但根基会松',
        run: ({ rng }) => {
          const bad = rng.chance(0.3);
          return bad
            ? { deltas: { health: -16, skill: 6 }, lines: ['水冲得太急，经脉裂了几处', '你境界上去了，可从此怕冷'] }
            : { deltas: { skill: 16, health: -4 }, lines: ['一夜间你跨了两个小境界', '老道看了看你的根基，没说话'] };
        },
      },
    ],
  },
  {
    id: 'rx_huo', cat: 'classical', weight: 10, minAge: 16, maxAge: 400,
    cond: (s) => rootIs(s, 'huo'),
    title: '炉前取舍',
    text: '你守着一炉丹，火候到了最紧要的关口。丹成了，至少值半年的灵石；可山下那户人家正等着这炉药救命。',
    choices: [
      {
        text: '撤火，把药先送下去', hint: '丹毁了，人活了',
        run: () => ({
          deltas: { mood: 10, relations: 10, money: -2000, skill: -4 },
          lines: ['你亲手把火撤了', '丹在炉里裂成两半。你听见自己咬牙的声音'],
        }),
      },
      {
        text: '守住火候，把这一炉炼成', hint: '丹成，钱到，心里留个疙瘩',
        run: () => ({
          deltas: { money: 6000, skill: 10, mood: -8 },
          lines: ['丹成了，成色极好', '你卖了它。那户人家后来怎么样，你没敢打听'],
        }),
      },
    ],
  },
  {
    id: 'rx_tu', cat: 'classical', weight: 10, minAge: 16, maxAge: 400,
    cond: (s) => rootIs(s, 'tu'),
    title: '守脉十年',
    text: '门里要派人去守一条灵脉，十年不许离开，也不能修行进境——可那条脉养着山下几百口人。',
    choices: [
      {
        text: '去守', hint: '十年不进境，换来一份厚根',
        run: () => ({
          deltas: { skill: 3, health: 12, mood: 6, relations: 8 },
          lines: ['你在山洞口坐了十年', '十年里什么也没发生。这本身就是最好的事'],
          flags: { guardedLand: true },
        }),
      },
      {
        text: '留下修行，让别人去', hint: '进境快，但会记得这件事',
        run: () => ({
          deltas: { skill: 14, mood: -6, relations: -6 },
          lines: ['你留在洞府里，修为涨得很快', '三年后听说那边出了事。你再没提过这件事'],
        }),
      },
    ],
  },
  {
    id: 'rx_lei_x', cat: 'classical', weight: 10, minAge: 16, maxAge: 400,
    cond: (s) => rootIs(s, 'lei_x'),
    title: '雷池引体',
    text: '山后有一处雷池，门里立着牌子：入者十死其三。你的雷灵根从昨天起就一直在跳。',
    choices: [
      {
        text: '跳进去，把雷引进经脉', hint: '大进境，或大伤',
        run: ({ rng }) => {
          const bad = rng.chance(0.34);
          return bad
            ? { deltas: { health: -22, skill: 8 }, lines: ['雷进去了，也把你里外翻了一遍', '你在雷池边躺了两个月才爬起来'] }
            : { deltas: { skill: 20, health: -8, mood: 8 }, lines: ['雷在你体内排成了一条线', '你从雷池里走出来的时候，头发还是直的'] };
        },
      },
      {
        text: '只在池边引一丝细雷', hint: '慢慢磨，风险小',
        run: () => ({
          deltas: { skill: 7, health: -3 },
          lines: ['你每天傍晚去池边站一刻钟', '三年下来，经脉已经认得雷了'],
        }),
      },
    ],
  },
  {
    id: 'rx_hun_x', cat: 'classical', weight: 10, minAge: 16, maxAge: 400,
    cond: (s) => rootIs(s, 'hun_x'),
    title: '夜半魂游',
    text: '半夜你自己醒了，发现自己正站在院子里，而屋里那个"你"还在睡。',
    choices: [
      {
        text: '跟着那股力走出去', hint: '看看它要把你带到哪',
        run: ({ rng }) => {
          const bad = rng.chance(0.3);
          return bad
            ? { deltas: { mood: -12, health: -8 }, lines: ['你看见了不该看的东西', '回来后你三天没敢闭眼'] }
            : { deltas: { skill: 14, mood: 5 }, lines: ['你走到了后山一处旧洞府', '里面有一本没人翻过的功法'] };
        },
      },
      {
        text: '强行把自己叫醒', hint: '稳，但那扇门关上了',
        run: () => ({
          deltas: { mood: 4, health: 3 },
          lines: ['你掐了自己一把，硬生生醒了过来', '那之后再没有过第二次'],
          flags: { hunSealed: true },
        }),
      },
    ],
  },
  {
    id: 'rx_ri_x', cat: 'classical', weight: 10, minAge: 16, maxAge: 400,
    cond: (s) => rootIs(s, 'ri_x'),
    title: '正午一线',
    text: '一年里日照最长的那一天，正午的日头直直照在你身上。你周身的灵气自己烧了起来。',
    choices: [
      {
        text: '借这一线冲关', hint: '今日不进则退',
        run: ({ rng }) => {
          const bad = rng.chance(0.25);
          return bad
            ? { deltas: { health: -18, mood: -4 }, lines: ['日头偏了，火没接上', '你被自己的阳气烧了一场，躺到入秋'] }
            : { deltas: { skill: 18, health: -6, mood: 6 }, lines: ['你在正午站了两个时辰', '太阳落山时，你已经不是早上那个人了'] };
        },
      },
      {
        text: '退到阴处，把灵气收回去', hint: '不赌这一天',
        run: () => ({
          deltas: { skill: 5, health: 5 },
          lines: ['你走进树荫，灵气慢慢平了下去', '老道说：「知道什么时候不冲，也是本事。」'],
        }),
      },
    ],
  },
  {
    id: 'rx_yue_x', cat: 'classical', weight: 10, minAge: 16, maxAge: 400,
    cond: (s) => rootIs(s, 'yue_x'),
    title: '月下问心',
    text: '满月。你一个人在庭中坐了整夜，忽然发现自己这些年的心事，一件一件都摆在眼前，摆得很整齐。',
    choices: [
      {
        text: '一件一件看过去', hint: '心境大进，也可能崩',
        run: ({ rng }) => {
          const bad = rng.chance(0.22);
          return bad
            ? { deltas: { mood: -16, skill: 4 }, lines: ['你看到了最不愿看的那一件', '天亮时你还坐在那里，茶已经结了一层膜'] }
            : { deltas: { mood: 16, skill: 10, health: 4 }, lines: ['你看完了全部，然后把它们收了起来', '从那天起，没有什么能轻易让你动怒了'] };
        },
      },
      {
        text: '起身回屋', hint: '不看，也就不必担',
        run: () => ({
          deltas: { mood: 3, health: 4 },
          lines: ['你站起来，把心事留在院子里', '它们明晚还会在那里'],
        }),
      },
    ],
  },
  {
    id: 'rx_feng_x', cat: 'classical', weight: 10, minAge: 16, maxAge: 400,
    cond: (s) => rootIs(s, 'feng_x'),
    title: '御风三日',
    text: '老道说：御风之术，只在你落地之前有用。他把你带到崖边，让你自己跳。',
    choices: [
      {
        text: '跳，落地之前必须学会', hint: '学不会就是山下的一具',
        run: ({ rng }) => {
          const bad = rng.chance(0.3);
          return bad
            ? { deltas: { health: -25, skill: 5 }, lines: ['你在半空抓到了一缕风，只抓到一半', '摔断了两根骨头。老道说：「下次就学会了。」'] }
            : { deltas: { skill: 16, mood: 10, health: -5 }, lines: ['你在离地三尺的地方停住了', '风托着你，像托着一片叶子'] };
        },
      },
      {
        text: '退回崖内，改在平地练', hint: '稳，但永远慢半拍',
        run: () => ({
          deltas: { skill: 7, mood: -4 },
          lines: ['你在平地上练了三年', '你会御风了，只是每到崖边就慢半拍'],
        }),
      },
    ],
  },
  {
    id: 'rx_bing_x', cat: 'classical', weight: 10, minAge: 16, maxAge: 400,
    cond: (s) => rootIs(s, 'bing_x'),
    title: '封心一诀',
    text: '同门死于一场斗法，全门都在哭。你站在灵前，眼睛干得发疼，一滴也流不出来。',
    choices: [
      {
        text: '把这份情绪冻起来，封进丹田', hint: '心境大稳，但你会变成另一个人',
        run: () => ({
          deltas: { skill: 10, mood: -10, health: 6 },
          lines: ['你把那块东西冻住了，放在丹田最深处', '从那以后你出手极稳。同门说你变了'],
          flags: { heartFrozen: true },
        }),
      },
      {
        text: '逼自己哭出来', hint: '宁可破境，不要变成石头',
        run: () => ({
          deltas: { mood: 14, health: -6, skill: -4 },
          lines: ['你在灵前站到后半夜，终于哭了出来', '那一晚你的境界退了一点。第二天你说值'],
        }),
      },
    ],
  },
  {
    id: 'rx_huan_x', cat: 'classical', weight: 10, minAge: 16, maxAge: 400,
    cond: (s) => rootIs(s, 'huan_x'),
    title: '真幻之间',
    text: '山门外来了个孩子，说他是你失散多年的弟弟。你心里清楚：你没有弟弟。可他的手是暖的。',
    choices: [
      {
        text: '陪他演完这一场', hint: '明知是幻，也认了',
        run: () => ({
          deltas: { mood: 14, relations: 6, skill: 4 },
          lines: ['你带他去吃了三天的饭', '第四天他不见了。你在门口留了一双鞋'],
          flags: { huanKind: true },
        }),
      },
      {
        text: '当场以神识拆穿它', hint: '练就一双辨幻的眼',
        run: ({ rng }) => {
          const bad = rng.chance(0.25);
          return bad
            ? { deltas: { mood: -12, skill: 6 }, lines: ['你拆开它，看见里面是自己的一张旧脸', '你吐了很久'] }
            : { deltas: { skill: 12, mood: -4 }, lines: ['它散成一片雾', '从那天起，再没有幻术能骗过你'] };
        },
      },
    ],
  },
  {
    id: 'rx_di_x', cat: 'classical', weight: 10, minAge: 16, maxAge: 400,
    cond: (s) => rootIs(s, 'di_x'),
    title: '地脉低语',
    text: '你踩在山上，脚下的地脉在响。老道说这条脉快断了，断的那天，山下的镇子会被埋。',
    choices: [
      {
        text: '以自身灵气下去接上它', hint: '折损修为，换一座镇子',
        run: () => ({
          deltas: { skill: -12, health: -10, mood: 12, relations: 10 },
          lines: ['你在地底待了四十天', '爬出来的时候，镇子还在，炊烟照常'],
          flags: { savedTown: true },
        }),
      },
      {
        text: '只布阵把脉接到自家山门', hint: '门里得益，镇上自求多福',
        run: () => ({
          deltas: { skill: 14, health: 6, mood: -8, relations: -8 },
          lines: ['阵布成了，山门的灵气浓了一倍', '后来听说那个镇子迁走了。你没去看'],
        }),
      },
    ],
  },
  {
    id: 'rx_xue_x', cat: 'classical', weight: 10, minAge: 16, maxAge: 400,
    cond: (s) => rootIs(s, 'xue_x'),
    title: '以血换境',
    text: '功法最后一页写着：若求速成，可取己血三升。你有三升血吗？有。你舍得吗？',
    choices: [
      {
        text: '取血，冲关', hint: '拿这一身血换一次进境，代价留在身上',
        run: () => ({
          deltas: { skill: 22, health: -20, mood: -4 },
          lines: ['你割开手腕，看着血滴进丹炉', '炉子红了三天。你出来时瘦得脱了形'],
          flags: { bloodPath: true },
        }),
      },
      {
        text: '合上书，走慢路', hint: '不进境，但人还完整',
        run: () => ({
          deltas: { health: 8, mood: 6 },
          lines: ['你把那一页撕了', '老道知道以后，什么都没说，给了你一瓶补药'],
        }),
      },
    ],
  },
  {
    id: 'rx_dual_shu', cat: 'classical', weight: 9, minAge: 16, maxAge: 400,
    cond: (s) => rootIs(s, 'dual_shu'),
    title: '两系相借',
    text: '你练木系时金气自己动了，练金系时木气又来托着。老道说这叫相生，是极少数人才有的便宜。',
    choices: [
      {
        text: '两系并练，让它们互托', hint: '进境最快的一条',
        run: () => ({
          deltas: { skill: 14, mood: 8, health: 4 },
          lines: ['你把两系的功法摊在一张案上，同时练', '它们不但不打架，还互相补'],
          flags: { dualHarmony: true },
        }),
      },
      {
        text: '只练一系，把另一系养着', hint: '慢，但路子最干净',
        run: () => ({
          deltas: { skill: 7, health: 8, mood: 4 },
          lines: ['你选了其中一系，另一系只用来养身', '老道说：「你比大多数人清楚自己要什么。」'],
        }),
      },
    ],
  },
  {
    id: 'rx_dual_ke', cat: 'classical', weight: 9, minAge: 16, maxAge: 400,
    cond: (s) => rootIs(s, 'dual_ke'),
    title: '两系相冲',
    text: '一次打坐，两系灵气在丹田里撞上了。你半边身子发烫，半边身子结霜。',
    choices: [
      {
        text: '以心念强行调和，让它们对着顶', hint: '顶出一条路，或者顶坏自己',
        run: ({ rng }) => {
          const bad = rng.chance(0.42);
          return bad
            ? { deltas: { health: -20, mood: -8, skill: 4 }, lines: ['两系谁也不让谁，把丹田撞出了裂口', '你花了两年才把裂口养住'] }
            : { deltas: { skill: 18, health: -8, mood: 6 }, lines: ['你把两股力拧成了一股', '出手时一冷一热，没人接得住'] };
        },
      },
      {
        text: '分开修：白练一系，夜练一系', hint: '慢，但稳',
        run: () => ({
          deltas: { skill: 8, health: 4, mood: -2 },
          lines: ['你把一天劈成两半，一半给火，一半给冰', '很多年后你才明白这是最笨也最管用的办法'],
        }),
      },
    ],
  },
  {
    id: 'rx_dual_tong', cat: 'classical', weight: 9, minAge: 16, maxAge: 400,
    cond: (s) => rootIs(s, 'dual_tong'),
    title: '镜像之难',
    text: '同源的两系，练起来像照镜子。你往左，它也往左，谁也推不动谁。',
    choices: [
      {
        text: '左右同时出手，逼它们对齐', hint: '把同源练成一股',
        run: ({ rng }) => {
          const bad = rng.chance(0.28);
          return bad
            ? { deltas: { health: -12, mood: -6 }, lines: ['两只手先打了起来', '你把自己的左手打青了'] }
            : { deltas: { skill: 13, mood: 4 }, lines: ['某一天它们忽然合成了一个动作', '那之后你出手比别人快一倍'] };
        },
      },
      {
        text: '只留一系，另一系散掉', hint: '放弃一半资质',
        run: () => ({
          deltas: { skill: 6, mood: 8, health: 4 },
          lines: ['你把其中一系慢慢散掉了', '镜子没了。你觉得清静了很多'],
        }),
      },
    ],
  },
  {
    id: 'rx_single', cat: 'classical', weight: 9, minAge: 16, maxAge: 400,
    cond: (s) => rootIs(s, 'single'),
    title: '一意孤行',
    text: '你的路太窄，同门都说你迟早卡在某一道坎上再也过不去。老道问你：要不要兼修一系别的？',
    choices: [
      {
        text: '不兼，只把这一系走到底', hint: '极快，也极险',
        run: ({ rng }) => {
          const bad = rng.chance(0.25);
          return bad
            ? { deltas: { skill: 8, mood: -10, health: -8 }, lines: ['你撞上了那道坎，撞了整整十年', '坎后面还是坎'] }
            : { deltas: { skill: 20, mood: 8 }, lines: ['你把一系练到了头', '老道说：「这辈子我只见过两个这样的人。」'] };
        },
      },
      {
        text: '兼修一系，把路拓宽', hint: '慢一点，路长一点',
        run: () => ({
          deltas: { skill: 9, health: 5, mood: 6 },
          lines: ['你兼了一系，路一下子宽了', '纯是回不去了，但你能走更久'],
        }),
      },
    ],
  },
  {
    id: 'rx_triple', cat: 'classical', weight: 9, minAge: 16, maxAge: 400,
    cond: (s) => rootIs(s, 'triple'),
    title: '勤能补拙',
    text: '同批入门的十个人，九个已经筑基，你还在练气。掌教让人来问你：还要不要继续。',
    choices: [
      {
        text: '继续。别人练一遍，你练三遍', hint: '慢，但没有上限',
        run: () => ({
          deltas: { skill: 10, mood: -4, health: -4 },
          lines: ['你把同门三年的功课铺成了十年', '第十年你筑基那天，没人来道贺，你自己坐了一夜'],
          flags: { diligentPath: true },
        }),
      },
      {
        text: '转去管药圃、抄经文', hint: '不进境，但活得安稳',
        run: () => ({
          deltas: { mood: 10, health: 8, relations: 6, skill: -6 },
          lines: ['你把功法收进了箱子', '药圃里的活你干得很好。老道说这也是一种修'],
        }),
      },
    ],
  },
  {
    id: 'rx_quad', cat: 'classical', weight: 9, minAge: 16, maxAge: 400,
    cond: (s) => rootIs(s, 'quad'),
    title: '驳杂之身',
    text: '四系灵气在经脉里各走各的，你连最基础的引气都做不圆。老道给你两条路：散掉两系，或者硬走。',
    choices: [
      {
        text: '散掉两系，把身子里清出来', hint: '降一档资质，换一条走得通的路',
        run: () => ({
          deltas: { skill: 12, health: -8, mood: -4 },
          lines: ['你散了整整两年', '经脉清了。你再测一次灵根，已经变成了两系'],
          flags: { rootPurified: true },
        }),
      },
      {
        text: '四系全留，走最笨的路', hint: '又慢又险，没人这么干',
        run: ({ rng }) => {
          const bad = rng.chance(0.4);
          return bad
            ? { deltas: { health: -18, mood: -8 }, lines: ['四系在你体内撞了一辈子', '你到死也没能引气入丹田'] }
            : { deltas: { skill: 15, health: -10, mood: 8 }, lines: ['四系最后各自认了位置', '老道说：「这不是资质，这是命硬。」'] };
        },
      },
    ],
  },
  {
    id: 'rx_pseudo', cat: 'classical', weight: 9, minAge: 16, maxAge: 400,
    cond: (s) => rootIs(s, 'pseudo'),
    title: '以命叩门',
    text: '伪灵根理论上修不成。你已经叩了三十年，门缝里连一丝光都没有。',
    choices: [
      {
        text: '再叩三十年', hint: '把一辈子押上去',
        run: ({ rng }) => {
          const bad = rng.chance(0.45);
          return bad
            ? { deltas: { health: -25, mood: -12 }, lines: ['你在蒲团上老得很快', '门一直没开。你没有后悔，只是不再说话了'] }
            : { deltas: { skill: 18, health: -15, mood: 18 }, lines: ['门开了一道缝', '你从缝里挤了进去。身后一片灰'],
              flags: { pseudoBreak: true } };
        },
      },
      {
        text: '下山，做个普通人', hint: '放下，也是一种活法',
        run: () => ({
          deltas: { mood: 14, health: 10, relations: 12 },
          lines: ['你背着包袱下了山', '山下的日子比山上长，也比山上暖'],
          flags: { leftMountain: true },
        }),
      },
    ],
  },
  {
    id: 'rx_chaos', cat: 'classical', weight: 9, minAge: 16, maxAge: 400,
    cond: (s) => rootIs(s, 'chaos'),
    title: '五系皆浊',
    text: '五行杂灵根是公认最坏的一种。你引一次气，五系一起乱。有人劝你去种地，说那更适合你。',
    choices: [
      {
        text: '把五系当五条命，一条一条养', hint: '最慢，也可能是唯一的路',
        run: () => ({
          deltas: { skill: 9, health: -10, mood: 6 },
          lines: ['你把丹田分成五格，一系一格', '五十年后，五格都有了动静'],
          flags: { chaosPath: true },
        }),
      },
      {
        text: '承认走不通，去种地', hint: '这一世就这样了',
        run: () => ({
          deltas: { mood: 12, health: 12, money: 3000, relations: 8 },
          lines: ['你回村种了地', '你的地里什么都长得好，只有灵气不长'],
        }),
      },
    ],
  },
];
EVENTS.push(ROOT_AWAKEN_EVENT, ...ROOT_EVENTS);

/* ================= 内容扩充：工作成败 / 恋爱 / 健康（patch11 新增） =================
   31 个事件，分三条线：
     工作成功与失败 12 个（玩家点名的「多做点磨难出来，比如工作失败」）
     恋爱与关系      11 个（玩家说「关系绝了」，这是这游戏的口碑点）
     健康与就医       8 个（配合新增的疾病系统，让「生病」这件事能被玩家看见和应对）
   所有事件都带 minAge/maxAge 与 cond，不会在不相称的年龄冒出来。
   数值口径沿用既有事件：deltas 走 attr() 的通用派发（所以自动吃特质倍率），
   重大转折用 perks 记长期影响。 */
const CONTENT_EVENTS = [
  /* ───── 工作：失败 ───── */
  { id:'cw_project_fail', cat:'work', weight:14, minAge:22, maxAge:60,
    cond:(s)=>!!s.flags.employed,
    title:'项目黄了', text:'你在这个项目上耗了整整一年，最后上头一句话就停了。没人说是谁的错，但谁都知道总得有人背。',
    choices:[
      { text:'把责任接下来', hint:'丢掉一次机会，留下一个名声', run:()=>({ deltas:{ mood:-10, skill:4, relations:6 }, lines:['你在会上把话揽了下来','有人没说话，但你看得出他记着这件事'] }) },
      { text:'把工分争清楚', hint:'保住了自己，得罪了人', run:()=>({ deltas:{ mood:-4, relations:-8, money:3000 }, lines:['你把自己那一份摆在了桌上','事情是清楚了，气氛也变了'] }) },
    ] },
  { id:'cw_politics', cat:'work', weight:12, minAge:24, maxAge:58,
    cond:(s)=>!!s.flags.employed,
    title:'被穿了小鞋', text:'你发现自己被排除在几个重要的会之外。原因不必问，问也问不出。',
    choices:[
      { text:'忍着，把手上的活做漂亮', hint:'熬，但憋屈', run:()=>({ deltas:{ mood:-8, skill:7 }, lines:['你把所有力气都用在了做事上','局面没变，但你的手确实更稳了'] }) },
      { text:'找上级摊开说', hint:'可能转好，也可能更糟', run:({ rng })=> rng.chance(0.45)
        ? { deltas:{ mood:6, relations:5 }, lines:['对方愣了一下，然后说了实话','事情不像你想的那么糟'] }
        : { deltas:{ mood:-12, relations:-6 }, lines:['你说完之后，对方只是笑了笑','从那以后，重要的会一次也没叫过你'] } },
    ] },
  { id:'cw_no_raise', cat:'work', weight:13, minAge:25, maxAge:58,
    cond:(s)=>!!s.flags.employed && s.age-s.flags.jobSince>=2,
    title:'连续两年不涨薪', text:'同批进来的人都动过了，只有你的数字没变。你算了一下，扣掉物价其实是降的。',
    choices:[
      { text:'提一次', hint:'开口要，得看运气', run:({ rng })=> rng.chance(0.5)
        ? { deltas:{ money:9000, mood:6 }, lines:['你开口了，而且拿到了','原来只是没人替你想这件事'] }
        : { deltas:{ mood:-8 }, lines:['对方说今年情况特殊，明年一定','你把这句「明年」记在了心里'] } },
      { text:'不说了，开始看外面的机会', hint:'把力气花在别处', run:()=>({ deltas:{ mood:-3, skill:5, relations:4 }, flags:{ lookingOut:true }, lines:['你更新了简历，开始留意别的可能','手上有选择的人，心里会稳一些'] }) },
    ] },
  { id:'cw_reorg', cat:'work', weight:11, minAge:25, maxAge:58,
    cond:(s)=>!!s.flags.employed,
    title:'部门被撤了', text:'一次组织调整，你的部门整个没了。人被拆散分到各处，你的新位置还没定。',
    choices:[
      { text:'主动申请去最缺人的地方', hint:'险，但可能被看见', run:({ rng })=> rng.chance(0.55)
        ? { deltas:{ money:6000, skill:8, mood:4 }, lines:['没人愿意去的地方，你去了','半年后，那里成了重点'] }
        : { deltas:{ mood:-6, health:-4 }, lines:['你去了，但那里比想象中更难','熬了半年，还是没熬出头'] } },
      { text:'拿补偿离开', hint:'先落地再说', run:()=>({ deltas:{ money:26000, mood:-4 }, flags:{ laidOffOnce:true, employed:false }, lines:['你签了字，抱着纸箱走出大楼','那天下午阳光很好，你有点恍惚'] }) },
    ] },
  { id:'cw_overwork', cat:'work', weight:14, minAge:24, maxAge:55,
    cond:(s)=>!!s.flags.employed,
    title:'连续半年没休', text:'项目赶得急，你已经很久没有完整休过一天。镜子里的脸和记忆里不太一样了。',
    choices:[
      { text:'顶到底', hint:'拿到结果，身体记账', run:()=>({ deltas:{ money:12000, health:-10, mood:-6 }, lines:['项目按期交付，你拿了不小的奖金','体检报告上多了两行加号'] }) },
      { text:'请假去住几天山里', hint:'少赚一点，缓过来', run:()=>({ deltas:{ health:8, mood:12, money:-4000 }, lines:['你在山里住了五天，什么都没做','回来之后，那些急事也没那么急了'] }) },
    ] },
  { id:'cw_blame', cat:'work', weight:11, minAge:24, maxAge:56,
    cond:(s)=>!!s.flags.employed,
    title:'背了一次锅', text:'出了事，那个位置上只有你。心里清楚不全是你，但话已经说出去了。',
    choices:[
      { text:'认了，然后想办法把系统补上', hint:'用一件事换一套机制', run:()=>({ deltas:{ mood:-9, skill:9 }, lines:['你写了一份复盘，把漏洞一条条列出来','没人夸你，但那个坑后来没再出现过'] }) },
      { text:'当场把经过说清楚', hint:'清白重要，关系不一定', run:()=>({ deltas:{ mood:-3, relations:-7 }, lines:['你说的都是事实','事实有时候比指责更让人下不来台'] }) },
    ] },

  /* ───── 工作：成功 ───── */
  { id:'cw_credit', cat:'work', weight:14, minAge:23, maxAge:58,
    cond:(s)=>!!s.flags.employed,
    title:'立功了', text:'你提出的那个方案被人拍了板，还做成了。汇报那天你的名字被念了两次。',
    choices:[
      // patch146：把功劳让出去 → 不升职（原来两个选项都升，导致升职率 98%）
      { text:'把功劳分给一起干的人', hint:'少拿一点名声，多几个人', run:()=>({ deltas:{ relations:12, mood:8, money:6000 }, lines:['你把名字一个一个念了一遍','那几个人后来跟了你很多年'] }) },
      { text:'自己领下来', hint:'快，但会有人不服', run:()=>({ deltas:{ money:16000, mood:6, relations:-6 }, flags:{ promoted:true }, lines:['功劳簿上只有你一个名字','升得快，走得也孤单'] }) },
    ] },
  { id:'cw_poach', cat:'work', weight:11, minAge:26, maxAge:55,
    cond:(s)=>!!s.flags.employed && s.attrs.skill>=60,
    title:'有人来挖你', text:'一个以前合作过的人找你，开的价不低，但要你去一个完全陌生的地方。',
    choices:[
      { text:'去', hint:'钱多，人脉清零重来', run:()=>({ deltas:{ money:40000, skill:8, relations:-14, mood:5 }, flags:{ changedJob:true }, lines:['你去了。第一周一个人吃完了所有饭','钱是很多，但没有人认识你'] }) },
      { text:'留下，把价码拿去谈', hint:'两头都能要点', run:({ rng })=> rng.chance(0.6)
        ? { deltas:{ money:22000, mood:8 }, flags:{ promoted:true }, lines:['你把话说得很客气，也很清楚','对方加了钱，还给了个新头衔'] }
        : { deltas:{ mood:-5, relations:-4 }, lines:['对方说知道了，然后没有下文','你留在原地，心里有点悬'] } },
    ] },
  { id:'cw_lead', cat:'work', weight:11, minAge:28, maxAge:55,
    cond:(s)=>!!s.flags.employed && s.attrs.skill>=65,
    title:'第一次带团队', text:'你手下忽然有了六个人。会上所有人都在等你说话。',
    choices:[
      { text:'把活分下去，自己看方向', hint:'学做管理者', run:()=>({ deltas:{ relations:10, skill:5, mood:6, money:8000 }, lines:['你花了三个月学会不亲自做每件事','团队开始能自己跑了'] }) },
      { text:'什么都自己来', hint:'效率高，人会累', run:()=>({ deltas:{ skill:10, health:-8, relations:-6, money:10000 }, lines:['你成了团队里最忙的人','事情做完了，但没人跟得上你'] }) },
    ] },
  { id:'cw_bonus', cat:'work', weight:12, minAge:24, maxAge:60,
    cond:(s)=>!!s.flags.employed,
    title:'年终奖', text:'今年的年终比往年厚一些，也比往年晚。发下来那天，群里没人说话。',
    choices:[
      { text:'存起来', hint:'钱是底气', run:()=>({ deltas:{ money:24000, mood:6 }, lines:['你把它转进另一张卡，没有动','看着那个数字，心里踏实了一点'] }) },
      { text:'带家里人出去玩', hint:'花掉，但会记得很久', run:()=>({ deltas:{ money:-12000, mood:16, relations:12 }, lines:['你们出去玩了七天','照片里所有人都在笑'] }) },
    ] },
  { id:'cw_own_biz', cat:'work', weight:9, minAge:28, maxAge:52,
    cond:(s)=>!!s.flags.employed && s.attrs.money>=80000 && s.attrs.skill>=60,
    title:'要不要自己干', text:'手里有点积蓄，也有点手艺。有人劝你出来做，说自己干和替人干是两回事。',
    choices:[
      { text:'出来做', hint:'可能大赚，也可能全赔', run:({ rng })=> rng.chance(0.42)
        ? { deltas:{ money:180000, mood:14, health:-8, skill:10 }, flags:{ selfEmployed:true, employed:false }, lines:['第一年很难，第二年开始有回头客','你终于不用再向谁汇报了'] }
        : { deltas:{ money:-70000, mood:-16, health:-8 }, flags:{ employed:false, selfFailed:true }, lines:['账上的钱一点点见底','关掉那天，你把牌子摘下来放在后备厢里'] } },
      { text:'再等等', hint:'先攒够底气', run:()=>({ deltas:{ money:6000, skill:4, mood:-2 }, lines:['你把这个念头记在本子上','那个本子后来翻过很多次'] }) },
    ] },
  { id:'cw_handover', cat:'work', weight:10, minAge:55, maxAge:70,
    cond:(s)=>!!s.flags.employed,
    title:'交接', text:'你开始把手上的事一件件交出去。年轻人学得很快，你有点欣慰，也有点空。',
    choices:[
      { text:'认真带最后一批人', hint:'留下点什么', run:()=>({ deltas:{ relations:12, mood:10, skill:2 }, lines:['你把知道的全写了文档','有人后来跟你说，那份文档救过他'] }) },
      { text:'安安静静退到一边', hint:'不再操心', run:()=>({ deltas:{ health:6, mood:6, relations:-3 }, lines:['你不再主动开会，也不再揽事','日子忽然多了很多空'] }) },
    ] },

  /* ───── 恋爱与关系 ───── */
  { id:'cr_blind_date', cat:'romance', weight:16, minAge:24, maxAge:38,
    cond:(s)=>!s.flags.married,
    title:'相亲', text:'家里安排见了一个人。坐下来的前十分钟，两个人都在想怎么把话说得体面。',
    choices:[
      { text:'认真聊下去', hint:'给彼此一次机会', run:({ rng })=> rng.chance(0.5)
        ? { deltas:{ mood:10, relations:8 }, flags:{ dating:true }, lines:['聊到后来，你们把外套都脱了','原来他也不是来应付的'] }
        : { deltas:{ mood:-4 }, lines:['你们礼貌地吃完了那顿饭','出门各自扫了共享单车，朝两个方向'] } },
      { text:'客气收场', hint:'不将就', run:()=>({ deltas:{ mood:-2, relations:2 }, lines:['你把单买了，说下次再约','谁都知道没有下次'] }) },
    ] },
  { id:'cr_long_distance', cat:'romance', weight:13, minAge:22, maxAge:40,
    cond:(s)=>!!s.flags.dating && !s.flags.married,
    title:'异地', text:'你们隔了一千多公里。视频里的背景越来越像两个不同的世界。',
    choices:[
      { text:'想办法凑到一个城市', hint:'有人要放弃一些东西', run:({ rng })=> rng.chance(0.6)
        ? { deltas:{ mood:12, relations:14, money:-20000 }, flags:{ movedCity:true }, lines:['你们选了一个中间的城市','搬家那天，两个人都累得说不出话，但一直在笑'] }
        : { deltas:{ mood:-10, relations:-10 }, lines:['谁都没能先动，各有各的放不下','后来视频变成了一周一次'] } },
      { text:'就这样先撑着', hint:'赌时间', run:({ rng })=> rng.chance(0.4)
        ? { deltas:{ mood:4, relations:2 }, lines:['你们居然撑下来了','回头看，那两年像被跳过了一样'] }
        : { deltas:{ mood:-12, relations:-8 }, flags:{ brokeUp:true, dating:false }, lines:['最后一条消息是「你忙吧」','之后就没有之后了'] } },
    ] },
  { id:'cr_propose', cat:'romance', weight:12, minAge:26, maxAge:42,
    cond:(s)=>!!s.flags.dating && !s.flags.married && s.bonds.lover>=70,
    title:'要不要定下来', text:'你们在一起有些年头了。家里开始问，你们自己也开始问。',
    choices:[
      { text:'结婚', hint:'把日子绑在一起', run:()=>({ deltas:{ mood:16, relations:10, money:-30000 }, bonds:{ lover:12 }, flags:{ married:true, tryingBaby:true }, lines:['你们办了一场不大的婚礼','那天你一直在笑，笑到脸酸'] }) },
      { text:'再等等', hint:'不是不想要，是还没准备好', run:({ rng })=> rng.chance(0.5)
        ? { deltas:{ mood:2, relations:2 }, lines:['你们说好了再过两年','两年后你们真的做了这件事'] }
        : { deltas:{ mood:-12, relations:-14 }, flags:{ married:false, dating:false, brokeUp:true }, lines:['对方说，等不起了','你没拦，也拦不住'] } },
    ] },
  { id:'cr_inlaws', cat:'romance', weight:12, minAge:26, maxAge:50,
    cond:(s)=>!!s.flags.married,
    title:'婆媳之间', text:'两边都是你在乎的人，两边都觉得你不站她那边。',
    choices:[
      { text:'当着面把话说清楚', hint:'当场难看，长远可能更好', run:()=>({ deltas:{ mood:-8, relations:8 }, bonds:{ family:6, lover:-4 }, lines:['你把两位长辈请到一起，把话摊开了','那顿饭吃得很难受，但后来确实顺了些'] }) },
      { text:'两头哄着', hint:'短期太平', run:()=>({ deltas:{ mood:-10, relations:4, health:-3 }, bonds:{ family:4, lover:8 }, lines:['你在两边分别说对方的好话','这一年你过得像个翻译'] }) },
    ] },
  { id:'cr_anniv', cat:'romance', weight:13, minAge:28, maxAge:70,
    cond:(s)=>!!s.flags.married,
    title:'纪念日', text:'又一个纪念日。你们都忙，谁也没提前准备。',
    choices:[
      { text:'当天补一个小惊喜', hint:'不用贵，用心', run:()=>({ deltas:{ mood:12, relations:8, money:-2000 }, bonds:{ lover:10 }, lines:['你绕路去买了一束花','对方看见的时候愣了一下，然后笑了'] }) },
      { text:'都算了，改天再说', hint:'改天常常是没有', run:()=>({ deltas:{ mood:-4, relations:-4 }, bonds:{ lover:-6 }, lines:['那天你们各自加了班','谁也没提这件事'] }) },
    ] },
  { id:'cr_child', cat:'romance', weight:14, minAge:26, maxAge:42,
    cond:(s)=>!!s.flags.married && !s.flags.hasChild,
    title:'要不要孩子', text:'这个问题你们讨论过很多次，每次都是在某个节点上停住。',
    choices:[
      { text:'要', hint:'人生换一个重心', run:()=>({ deltas:{ mood:12, money:-40000, health:-6 }, bonds:{ lover:8 }, flags:{ hasChild:true }, lines:['孩子出生那天，你在走廊里坐了很久','你忽然明白了一件事：从此以后，你不是最重要的那个了'] }) },
      { text:'不要，把日子过成两个人的', hint:'也是完整的一生', run:()=>({ deltas:{ mood:8, relations:6, money:20000 }, bonds:{ lover:6 }, lines:['你们把这个决定认真说定了一次','之后再没人提过这件事'] }) },
    ] },
  { id:'cr_care', cat:'romance', weight:11, minAge:32, maxAge:70,
    cond:(s)=>!!s.flags.married && s.bonds.lover>=60,
    title:'对方病了一场', text:'不算重，但需要人照顾。你请了假，把工作往后推了。',
    choices:[
      { text:'亲自照顾到底', hint:'钱会少，人会近', run:()=>({ deltas:{ money:-26000, health:-6, mood:8 }, bonds:{ lover:16 }, lines:['你学会了煲汤、换药、记吃药的时间','对方说这辈子记住了这一段'] }) },
      { text:'请护工，自己继续上班', hint:'现实的选择', run:()=>({ deltas:{ money:-12000, mood:-6 }, bonds:{ lover:-6 }, lines:['你每天下班都去，但终究不是你在照顾','对方没说什么，你知道她/他记住了'] }) },
    ] },
  { id:'cr_old_friend', cat:'romance', weight:12, minAge:30, maxAge:75,
    cond:(s)=>s.attrs.relations>=40,
    title:'多年不见的朋友', text:'一个很久没联系的人忽然找你，说路过你这边，想见一面。',
    choices:[
      { text:'去见', hint:'有些关系值得续上', run:()=>({ deltas:{ mood:12, relations:10 }, bonds:{ friends:12 }, lines:['你们从下午聊到打烊','走出店门的时候，你觉得这些年也没那么远'] }) },
      { text:'推了', hint:'太忙，或者不知道说什么', run:()=>({ deltas:{ mood:-4, relations:-6 }, bonds:{ friends:-8 }, lines:['你说下次一定','没有下次了'] }) },
    ] },
  { id:'cr_lonely', cat:'romance', weight:13, minAge:28, maxAge:70,
    cond:(s)=>!s.flags.married && s.attrs.relations<50,
    title:'一个人的半夜', text:'半夜醒了，屋里静得能听到冰箱的声音。你忽然很想找个人说话。',
    choices:[
      { text:'给一个老朋友打电话', hint:'不一定接，但要试', run:({ rng })=> rng.chance(0.65)
        ? { deltas:{ mood:14, relations:9 }, lines:['那边接得很快，像一直在等你','你们聊到天亮'] }
        : { deltas:{ mood:-6 }, lines:['响了很多声，没人接','你把手机放在枕边，睁眼到天亮'] } },
      { text:'自己泡了杯茶，坐着', hint:'学会和自己待着', run:()=>({ deltas:{ mood:6, health:3 }, lines:['你坐到窗子亮起来','有些夜晚不需要解决，熬过去就好'] }) },
    ] },
  { id:'cr_divorce', cat:'romance', weight:10, minAge:30, maxAge:65,
    cond:(s)=>!!s.flags.married && s.bonds.lover<45,
    title:'要不要继续', text:'你们已经很久没有好好说过一句话。同一个屋檐下，像两个租客。',
    choices:[
      { text:'认真谈一次', hint:'可能修好，也可能收尾', run:({ rng })=> rng.chance(0.45)
        ? { deltas:{ mood:10, relations:8 }, bonds:{ lover:18 }, lines:['你们把憋了很多年的话都说了','说完之后，都哭了'] }
        : { deltas:{ mood:-8, money:-60000 }, bonds:{ lover:-10 }, flags:{ married:false, divorced:true }, lines:['你们把该分的都分了','最后一起吃了一顿饭，AA'] } },
      { text:'就这样过下去', hint:'耗着', run:()=>({ deltas:{ mood:-12, health:-5 }, lines:['你们继续住在一起，各过各的','很多年后你才发现，这几年是空白的'] }) },
    ] },
  { id:'cr_late_love', cat:'romance', weight:11, minAge:45, maxAge:75,
    cond:(s)=>!s.flags.married,
    title:'这个年纪还能遇到', text:'认识了一个人。你们都不年轻了，也都不打算装年轻。',
    choices:[
      // patch151：晚婚也要能生育（原来不设 tryingBaby，晚婚的人永远没有孩子）
      { text:'试着在一起', hint:'晚一点也算数', run:()=>({ deltas:{ mood:18, relations:10 }, bonds:{ lover:20 }, flags:{ married:true, lateMarry:true, tryingBaby:true }, lines:['你们没有办婚礼，只是一起搬了家','有人陪着吃饭，这件事比想象中重要'] }) },
      { text:'做朋友就好', hint:'不想再折腾', run:()=>({ deltas:{ mood:6, relations:8 }, bonds:{ friends:14 }, lines:['你们成了常常见面的朋友','这样也挺好，至少不孤单'] }) },
    ] },

  /* ───── 健康与就医 ───── */
  { id:'ch_symptom', cat:'health', weight:15, minAge:30, maxAge:85,
    cond:(s)=>s.attrs.health<70,
    title:'身体给的信号', text:'最近总是累，睡多久都不解乏。你有点不敢去查。',
    choices:[
      { text:'去查，查清楚', hint:'早发现早处理', run:({ rng })=> rng.chance(0.7)
        ? { deltas:{ money:-3000, health:6, mood:4 }, lines:['不是什么大问题，但医生列了一张单子','按着单子改了三个月，人确实轻快了'] }
        : { deltas:{ money:-8000, health:-6, mood:-10 }, flags:{ illnessFound:true }, lines:['报告上有个指标不太好看','需要在半年后复查'] } },
      { text:'先拖着，忙完这阵再说', hint:'最常见的选项', run:()=>({ deltas:{ mood:-3, health:-7 }, lines:['你把它放在了待办清单的最后','后来那张清单也不知道去哪了'] }) },
    ] },
  { id:'ch_checkup', cat:'health', weight:14, minAge:30, maxAge:85,
    cond:()=>true,
    title:'年度体检', text:'单位组织体检。抽血的时候你扭头不看，怕疼这件事是不会变的。',
    choices:[
      { text:'顺便把该查的都查了', hint:'花钱买放心', run:()=>({ deltas:{ money:-2600, health:5, mood:3 }, flags:{ checkup:true }, lines:['加了几项，也贵了不少','报告出来那天，你把它读完了'] }) },
      { text:'只做基础项', hint:'省事', run:()=>({ deltas:{ health:2 }, flags:{ checkup:true }, lines:['基础项一切正常','你没再多问'] }) },
    ] },
  { id:'ch_hospital', cat:'health', weight:13, minAge:18, maxAge:90,
    cond:(s)=>s.attrs.health<75,
    title:'去医院', text:'排队排到下午，医生看了两分钟，开了药，让你两周后复查。',
    choices:[
      { text:'老老实实复查', hint:'把事办完', run:()=>({ deltas:{ money:-1800, health:7 }, lines:['复查结果比上次好','医生说，能按医嘱的人不多'] }) },
      { text:'拿了药就没再去', hint:'忙起来了', run:()=>({ deltas:{ money:-900, health:-4, mood:-2 }, lines:['药吃完就停了','你想着等有空了再去看'] }) },
    ] },
  { id:'ch_surgery', cat:'health', weight:9, minAge:35, maxAge:85,
    cond:(s)=>s.attrs.health<55,
    title:'需要做个小手术', text:'医生说这个位置不处理会越来越麻烦，但也不急在这一两个月。',
    choices:[
      { text:'尽早做', hint:'花钱花时间，换干净', run:()=>({ deltas:{ money:-45000, health:16, mood:-6 }, lines:['住院七天，躺得骨头都酸了','出院那天你自己走出的门'] }) },
      { text:'保守治疗看看', hint:'能不挨刀就不挨', run:({ rng })=> rng.chance(0.5)
        ? { deltas:{ money:-8000, health:4 }, lines:['吃药加上理疗，居然稳住了','医生说，运气占一部分'] }
        : { deltas:{ health:-10, money:-10000, mood:-6 }, lines:['半年后还是得做，而且更麻烦','你有点后悔当时没听医生的'] } },
    ] },
  { id:'ch_depressed', cat:'health', weight:13, minAge:18, maxAge:70,
    cond:(s)=>s.attrs.mood<45,
    title:'很长一段时间提不起劲', text:'说不上哪里不对，就是什么事都不想做。醒来第一件事是算还有多久能再睡。',
    choices:[
      { text:'去看医生', hint:'把这件事当病来处理', run:()=>({ deltas:{ money:-6000, mood:18, health:4 }, flags:{ therapy:true }, lines:['医生说这很常见，而且能好','你在诊室里松了一口气'] }) },
      { text:'自己扛', hint:'说不出口', run:({ rng })=> rng.chance(0.45)
        ? { deltas:{ mood:8, skill:3 }, lines:['过了很久，它自己淡了一点','你不太愿意回想那段时间'] }
        : { deltas:{ mood:-10, health:-6, relations:-6 }, lines:['你把所有邀请都推掉了','房间越来越暗，你也没去开灯'] } },
    ] },
  { id:'ch_quit_smoke', cat:'health', weight:12, minAge:25, maxAge:70,
    cond:()=>true,
    title:'戒不戒', text:'你知道这件事对身体没好处，也知道现在改还来得及。',
    choices:[
      { text:'戒', hint:'难受一阵，赚后面几十年', run:({ rng })=> rng.chance(0.6)
        ? { deltas:{ health:12, mood:-6, money:4000 }, lines:['前三个月很难，后面就顺了','你算了一下，省下的钱够出两趟远门'] }
        : { deltas:{ mood:-4, health:3 }, lines:['戒了两次，抽回来三次','至少比以前少了一些'] } },
      { text:'不减了，人就这点爱好', hint:'各有各的活法', run:()=>({ deltas:{ mood:6, health:-5 }, lines:['你决定不为难自己','这一点上你想得很开'] }) },
    ] },
  { id:'ch_care_old', cat:'health', weight:12, minAge:35, maxAge:70,
    cond:(s)=>s.age>=35,
    title:'长辈病重', text:'家里来电话，说老人住院了。你请了假赶回去。',
    choices:[
      { text:'能陪多久陪多久', hint:'钱和工作都得让路', run:()=>({ deltas:{ money:-20000, mood:-6, health:-5, relations:10 }, bonds:{ family:18 }, flags:{ caregiving:true }, lines:['你在医院陪了四十天','走的时候，老人拉着你的手说了很久的话'] }) },
      { text:'出钱，让家里人照顾', hint:'现实的分工', run:()=>({ deltas:{ money:-40000, mood:-8, relations:2 }, bonds:{ family:4 }, flags:{ caregiving:true }, lines:['钱你一分没少出','但你没能一直在场，这件事你记了很久'] }) },
    ] },
  { id:'ch_recover', cat:'health', weight:13, minAge:25, maxAge:80,
    cond:(s)=>s.attrs.health<60,
    title:'从头开始养身体', text:'你决定认真对待这件事：早睡、走路、按时吃饭。听着简单，做起来难。',
    choices:[
      { text:'坚持一整年', hint:'慢功夫', run:()=>({ deltas:{ health:14, mood:8, money:-5000, relations:4 }, flags:{ gym:true }, lines:['你走了三百多天，一天没落下','年底的时候，爬楼不喘了'] }) },
      { text:'试了两个月就断了', hint:'大多数人的结局', run:()=>({ deltas:{ health:2, mood:-3 }, lines:['第三个月开始下雨，然后就没有然后了','也不算白试，至少知道了方法'] }) },
    ] },
];

/* ================= 自动结算事件（patch14） =================
   玩家给的原则：「他人决定的事情或者客观上不受玩家控制的事情不要交给玩家选，
   要么随机要么根据数值来确定」。
   这些事件挂上 auto: true 之后，引擎不再向玩家要选项，而是由 AUTO_BRANCH 按
   当前数值（有时加一点随机）直接判定结果，并把结果作为一条叙事行写出来。
   婴儿／幼儿期的 5 个也在其中：那些选项本来就是家长在做决定。 */
const AUTO_BRANCH = {
  'baby_sick_night': (s) => {
      if (s.attrs.health >= 75) return { t: '烧了一夜，天亮自己退了。大人守了一整晚，你什么都不记得。', d: { health: -2, mood: -1, relations: 3 } };
      if (s.attrs.money >= 30000) return { t: '连夜送了急诊，吊了水，第二天就活蹦乱跳。', d: { health: -3, money: -4000, relations: 3 } };
      if (rng.chance(0.65)) return { t: '物理降温守了一夜，天亮退了烧。', d: { health: -5, mood: -2, relations: 2 } };
      return { t: '连着烧了三天才退，人瘦了一圈。', d: { health: -10, mood: -3 } };
    },
  'baby_first_word': (s) => (rng.chance(0.5)
      ? { t: '先叫的是妈妈。她抱着你哭了。', d: { relations: 6, mood: 2 } }
      : { t: '先叫的是爸爸。他那天高兴得多喝了两杯。', d: { relations: 5, mood: 2 } }),
  'baby_first_steps': (s) => (s.attrs.health >= 60
      ? { t: '走得比同龄人早，摇摇晃晃扑进大人怀里。', d: { health: 3, mood: 3, relations: 2 } }
      : { t: '走得晚一些，摔了很多次，但到底会走了。', d: { health: 1, mood: 2, relations: 2 } }),
  'baby_daycare': (s) => {
      const ok = s.attrs.mood >= 50 || s.attrs.relations >= 40;
      return ok
        ? { t: '哭了三天就适应了，还交到一个朋友。', d: { mood: 4, relations: 5 } }
        : { t: '每天送去都哭，哭了一个月才停。', d: { mood: -4, relations: 2 } };
    },
  // patch17：抓周改成自动结算后，原来那 5 个选项里的 zhuazhou_* flag 就不再生效，
  // 三枚抓周成就（书/钱/药）再也拿不到。现在按抽到的结果把 flag 补上。
  'zhuazhou': (s) => {
      const pick = rng.pick([
        { t: '你伸手抓了书。全家说这孩子将来是读书的命。', d: { skill: 4, mood: 2 }, f: { zhuazhou_book: true } },
        { t: '你一把抓住了笔。爷爷当场说以后能写文章。', d: { skill: 3, mood: 2 }, f: { zhuazhou_pen: true } },
        { t: '你盯了半天，抓了铜钱。大人笑作一团。', d: { money: 2000, mood: 1 }, f: { zhuazhou_money: true } },
        { t: '你抓了那把木剑，举起来挥了两下。', d: { health: 3, mood: 2 }, f: { zhuazhou_sword: true } },
        { t: '你伸手抓了那个药罐，又摸了摸旁边的佛珠。', d: { health: 2, mood: 2 }, f: { zhuazhou_medicine: true } },
      ]);
      return pick;
    },
  'spring_festival_kid': (s) => {
      const rich = s.attrs.money >= 60000 || s.attrs.relations >= 60;
      if (rich) return { t: '亲戚们给的红包一个比一个厚，家里人也大方，那年收了不少。', d: { money: 3000, mood: 6, relations: 4 } };
      if (s.attrs.relations >= 35) return { t: '收了几封红包，回家全被妈妈收走说「替你存着」。', d: { money: 800, mood: 4 } };
      return { t: '亲戚给的红包不多，但那天有新衣服和好多菜。', d: { money: 300, mood: 5 } };
    },
  'parents_fight': (s) => (s.attrs.mood >= 60
      ? { t: '你听着听着睡着了。第二天他们又和好了。', d: { mood: -2, relations: -2 } }
      : { t: '你躲在被子里听了很久，从那以后有点怕大声说话。', d: { mood: -7, relations: -4 } }),
  'grandparent': (s) => (s.attrs.relations >= 45
      ? { t: '被老人带大的那段日子，后来成了你最软的回忆。', d: { mood: 5, relations: 6 } }
      : { t: '老人管得严，你那时不太喜欢，后来才明白。', d: { mood: 2, relations: 4, skill: 2 } }),
  'move_house': (s) => (rng.chance(0.45)
      ? { t: '新学校很快适应了，还认识了一个到现在都联系的人。', d: { mood: 4, relations: 6 } }
      : { t: '换了环境，你安静了很长一段时间。', d: { mood: -6, relations: -4, skill: 2 } }),
  'first_day_school': (s) => (s.attrs.mood >= 55
      ? { t: '哭着进了教室，放学时是笑着跑出来的。', d: { mood: 3, relations: 4, skill: 2 } }
      : { t: '你抱着门框不肯进去，最后是被老师抱走的。', d: { mood: -4, relations: 2 } }),
  'middle_school': (s) => (s.attrs.skill >= 30
      ? { t: '课程难了不少，但你跟得上，第一次尝到「认真有用」。', d: { skill: 5, mood: 3, relations: 2 } }
      : { t: '一下跟不上进度，名次掉了一截。', d: { mood: -5, skill: 2 } }),
  'puberty': (s) => (s.attrs.mood >= 50
      ? { t: '长个子、变声、心事变多。你开始照镜子了。', d: { health: 4, mood: -2, relations: 2 } }
      : { t: '那几年你不太愿意说话，也不太愿意拍照。', d: { mood: -6, health: 3 } }),
  'child_vaccine_day': (s) => (s.attrs.health >= 55
      ? { t: '打针当天胳膊酸，第二天就没事了。', d: { health: 3, mood: -1 } }
      : { t: '打完发了低烧，在家歇了两天。', d: { health: -2, mood: -2 } }),
  'parents_health': (s) => {
      if (s.attrs.money >= 150000) return { t: '查出来得早，花钱治好了。你松了一口大气。', d: { money: -50000, mood: -4, relations: 6 } };
      if (s.attrs.money >= 40000) return { t: '住了半个月院，医保报了一部分，家里紧了两年。', d: { money: -30000, mood: -8, relations: 6 } };
      return { t: '家里拿不出钱，只能先拖着。这件事你记了很多年。', d: { money: -8000, mood: -14, relations: 4 } };
    },
  'parents_old': (s) => (s.attrs.relations >= 50
      ? { t: '你开始每年回去几趟。他们老得很慢，又很快。', d: { mood: -3, relations: 8 } }
      : { t: '有天你发现父亲上楼梯要扶着栏杆了。', d: { mood: -8, relations: 4 } }),
  'middle_parent_hearing': (s) => (s.attrs.money >= 60000
      ? { t: '配了助听器，父亲又能听清电视了。', d: { money: -9000, mood: 4, relations: 6 } }
      : { t: '没配。以后跟他说话都得大声些。', d: { mood: -6, relations: 3 } }),
  'middle_parent_care': (s) => (s.attrs.money >= 50000
      ? { t: '你请了假陪诊，排了一整天的队。结果还算好。', d: { money: -12000, mood: -3, relations: 8 } }
      : { t: '你要上班，只能让亲戚陪着去。心里一直不踏实。', d: { mood: -9, relations: 3 } }),
  'grandchild': (s) => (s.attrs.health >= 50
      ? { t: '抱上孙子那天，你笑得合不拢嘴，还能抱着他走两圈。', d: { mood: 14, health: -2, relations: 8 } }
      : { t: '你想抱，但腰不允许。只能在旁边看着。', d: { mood: 8, health: -4, relations: 6 } }),
  'middle_team_layoff': (s) => (s.attrs.skill >= 70
      ? { t: '名单里没有你。但你第一次认真算了算自己的年纪。', d: { mood: -5, skill: 3 } }
      : { t: '你被叫去谈话了。', d: { mood: -14, health: -4 } }),
  'middle_neighbor_renovation': (s) => (s.attrs.mood >= 55
      ? { t: '吵了三个月，你买了一副降噪耳机，居然忍下来了。', d: { mood: -3, money: -1500 } }
      : { t: '吵了三个月，你和邻居吵了一架。', d: { mood: -9, relations: -5 } }),
  'old_neighborhood_help': (s) => (s.attrs.health >= 45
      ? { t: '停水那几天，你拎着桶上下楼，权当锻炼。', d: { health: 2, relations: 5, mood: -2 } }
      : { t: '停水那几天你只能去儿子女儿家凑合。', d: { health: -3, relations: 4, mood: -3 } }),
  'old_neighbor_moving': (s) => (s.attrs.relations >= 45
      ? { t: '老邻居搬走了。你们互留了电话，之后再没打过。', d: { mood: -6, relations: -4 } }
      : { t: '隔壁空了下来。楼道比以前安静，也更冷清。', d: { mood: -4, relations: -2 } }),
};
const AUTO_IDS = Object.keys(AUTO_BRANCH);
for (const e of EVENTS) {
  if (AUTO_IDS.indexOf(e.id) >= 0) e.auto = true;
}

/* ================= 恋爱事件扩充（patch14） =================
   玩家反馈「恋爱事件多一些」。恋爱线原本 23 个事件，在五年一选下一次决策管 5 年，
   密度明显不够——实测只占总回合的 6.4%。这里加 16 个事件，并给 romance 类
   整体 1.6 倍权重（见 pickEvent 的 patch14 分支），让恋爱线稳定占到 8% 以上。
   覆盖「认识→确认→相处→考验→收尾」五个环节。 */
const MORE_LOVE = [
  { id:'cr_met_at', cat:'romance', weight:15, minAge:20, maxAge:35,
    cond:(s)=>!s.flags.married && !s.flags.dating,
    title:'认识了一个人', text:'不是相亲，就是碰上的。聊了几句，发现能接得上话。',
    choices:[
      { text:'主动要个联系方式', hint:'迈出那一步', run:({ rng })=> rng.chance(0.62)
        ? { deltas:{ mood:12, relations:6 }, flags:{ dating:true }, bonds:{ lover:22 }, lines:['你把话问出口了，对方笑了','那天回去的路上，你一直在看手机'] }
        : { deltas:{ mood:-5 }, lines:['你犹豫了几秒，对方已经走了','那几秒你后来想了很久'] } },
      { text:'算了，随缘', hint:'不主动', run:()=>({ deltas:{ mood:-2 }, lines:['你低头继续走路','之后很多天，你都想起那几句对话'] }) },
    ] },
  { id:'cr_text_stage', cat:'romance', weight:14, minAge:20, maxAge:40,
    cond:(s)=>!!s.flags.dating,
    title:'聊到凌晨两点', text:'你们已经连着一周聊到很晚。手机烫手，第二天还要早起。',
    choices:[
      { text:'把想说的都说了', hint:'快，也容易翻车', run:({ rng })=> rng.chance(0.7)
        ? { deltas:{ mood:14, relations:8 }, bonds:{ lover:16 }, lines:['你把心里话全倒了出来','对方回了一句：我也是'] }
        : { deltas:{ mood:-8, relations:-4 }, bonds:{ lover:-8 }, lines:['你说得太满，那边沉默了很久','后来你们又回到了客气'] } },
      { text:'聊点轻的，慢慢来', hint:'稳', run:()=>({ deltas:{ mood:8, relations:4 }, bonds:{ lover:8 }, lines:['你们聊了电影、天气和一家面馆','不着急，也挺好'] }) },
    ] },
  { id:'cr_meet_parents', cat:'romance', weight:13, minAge:24, maxAge:45,
    cond:(s)=>!!s.flags.dating && !s.flags.married,
    title:'见家长', text:'要在饭桌上见对方父母了。你提前一小时到了，坐在楼下便利店。',
    choices:[
      { text:'老老实实，有什么说什么', hint:'真，但可能不够讨喜', run:({ rng })=> rng.chance(0.6)
        ? { deltas:{ mood:10, relations:10 }, bonds:{ lover:12 }, lines:['对方母亲后来跟他说：这孩子实诚','你松了一口气'] }
        : { deltas:{ mood:-6, relations:3 }, bonds:{ lover:4 }, lines:['饭桌上冷了几次场','对方一直悄悄给你夹菜'] } },
      { text:'提前做好功课', hint:'准备充分', run:()=>({ deltas:{ mood:8, relations:8, skill:2 }, bonds:{ lover:10 }, lines:['你聊到了对方父亲的爱好','那顿饭吃得很顺'] }) },
    ] },
  { id:'cr_money_talk', cat:'romance', weight:13, minAge:25, maxAge:50,
    cond:(s)=>!!s.flags.dating || !!s.flags.married,
    title:'谈钱', text:'存款、房租、以后要不要买房。这个话题你们绕了很多次。',
    choices:[
      { text:'摊开来算清楚', hint:'难看，但省事', run:()=>({ deltas:{ mood:-4, relations:8 }, bonds:{ lover:10 }, lines:['你们把账摊在桌上算了一晚上','有点难堪，但心里踏实了'] }) },
      { text:'先不谈，还早', hint:'避开', run:()=>({ deltas:{ mood:3, relations:-4 }, bonds:{ lover:-6 }, lines:['你们换了个话题','那件事以后还是要谈'] }) },
    ] },
  { id:'cr_jealous', cat:'romance', weight:12, minAge:22, maxAge:45,
    cond:(s)=>!!s.flags.dating,
    title:'因为一件小事吵架', text:'一件很小的事，最后翻出了三个月前的旧账。',
    choices:[
      { text:'当天就把话说开', hint:'不过夜', run:()=>({ deltas:{ mood:6, relations:6 }, bonds:{ lover:8 }, lines:['你当晚就去敲了门','两个人在楼道里说到了深夜'] }) },
      { text:'冷战一周', hint:'看谁先低头', run:({ rng })=> rng.chance(0.55)
        ? { deltas:{ mood:-6, relations:2 }, bonds:{ lover:-4 }, lines:['一周后对方先开口','你们都装作没事'] }
        : { deltas:{ mood:-10, relations:-6 }, bonds:{ lover:-12 }, lines:['一周变成两周，两周变成一个月','后来你们都不知道在气什么了'] } },
    ] },
  { id:'cr_travel', cat:'romance', weight:14, minAge:22, maxAge:55,
    cond:(s)=>!!s.flags.dating || !!s.flags.married,
    title:'一起出门旅行', text:'第一次一起出远门。行李、路线、几点起床，全是分歧。',
    choices:[
      { text:'全听对方的', hint:'省事', run:()=>({ deltas:{ mood:8, money:-8000, relations:6 }, bonds:{ lover:12 }, lines:['你什么都不争，跟着走','回来看照片，居然还挺好玩'] }) },
      { text:'坚持按自己的来', hint:'可能吵起来', run:({ rng })=> rng.chance(0.55)
        ? { deltas:{ mood:12, money:-9000, relations:6 }, bonds:{ lover:10 }, lines:['按你的路线走，意外地顺','对方说下次还听你的'] }
        : { deltas:{ mood:-6, money:-9000, relations:-6 }, bonds:{ lover:-8 }, lines:['一天里吵了两次','最后一个景点谁都没去'] } },
    ] },
  { id:'cr_apology', cat:'romance', weight:13, minAge:22, maxAge:60,
    cond:(s)=>!!s.flags.dating || !!s.flags.married,
    title:'该道歉了', text:'事情过去好几天了，你其实知道自己哪里不对。',
    choices:[
      { text:'认认真真道歉', hint:'低头一次', run:()=>({ deltas:{ mood:8, relations:10 }, bonds:{ lover:14 }, lines:['你说了对不起，没有加「但是」','对方眼圈红了'] }) },
      { text:'用做事代替说话', hint:'不开口，靠行动', run:({ rng })=> rng.chance(0.6)
        ? { deltas:{ mood:6, relations:6 }, bonds:{ lover:8 }, lines:['你默默把家里收拾了一遍，饭也做好了','对方什么也没说，但笑了'] }
        : { deltas:{ mood:-4, relations:-3 }, bonds:{ lover:-4 }, lines:['你做了很多，但一句话也没说','对方说：你到底怎么想的'] } },
    ] },
  { id:'cr_breakup', cat:'romance', weight:11, minAge:20, maxAge:50,
    cond:(s)=>!!s.flags.dating && !s.flags.married,
    title:'要不要分手', text:'想了很久。不是突然不爱了，是发现两个人想去的方向不一样。',
    choices:[
      { text:'说清楚，然后分开', hint:'难，但干净', run:()=>({ deltas:{ mood:-14, relations:2, health:-3 }, bonds:{ lover:-20 }, flags:{ dating:false, brokeUp:true }, lines:['你们把话说完，然后各自回家','那天你走了很久才到家'] }) },
      { text:'再试一段时间', hint:'也许能好', run:({ rng })=> rng.chance(0.45)
        ? { deltas:{ mood:8, relations:6 }, bonds:{ lover:12 }, lines:['你们约定各自让一步','后来居然真的好了起来'] }
        : { deltas:{ mood:-12, relations:-4 }, bonds:{ lover:-10 }, flags:{ dating:false, brokeUp:true }, lines:['拖了半年，还是散了','只是这半年谁也过得不痛快'] } },
    ] },
  { id:'cr_marry_simple', cat:'romance', weight:12, minAge:24, maxAge:45,
    cond:(s)=>!!s.flags.dating && !s.flags.married && s.bonds.lover>=60,
    title:'要不就简单办了', text:'算了算预算，办一场像样的要花掉大半积蓄。',
    choices:[
      { text:'简单办，钱留着过日子', hint:'实在', run:()=>({ deltas:{ mood:10, money:-15000, relations:6 }, bonds:{ lover:12 }, flags:{ married:true, tryingBaby:true }, lines:['两桌人，一顿饭，一场雨','你们撑着一把伞回家'] }) },
      { text:'该有的都要有', hint:'花光也认', run:()=>({ deltas:{ mood:16, money:-90000, relations:10 }, bonds:{ lover:16 }, flags:{ married:true }, lines:['那天来了很多人，照片拍了几百张','账还了两年，照片翻了很多次'] }) },
    ] },
  { id:'cr_late_companion', cat:'romance', weight:13, minAge:55, maxAge:80,
    cond:(s)=>!s.flags.married,
    title:'找个人搭伙', text:'这个年纪，不谈爱情了，就想有个人一起吃饭、一起看病。',
    choices:[
      { text:'找个伴，先处着', hint:'不领证也行', run:()=>({ deltas:{ mood:14, relations:8, health:4 }, bonds:{ lover:16 }, flags:{ dating:true }, lines:['你们每天一起走路、买菜','有人一起吃饭，饭都香一些'] }) },
      { text:'一个人也挺好', hint:'自在', run:()=>({ deltas:{ mood:4, health:2, relations:-2 }, lines:['你把日子安排得很清楚','只是晚上有点长'] }) },
    ] },
  /* ── 再补 6 个：把「相处 → 磨合 → 收尾」这条线填厚（实测恋爱线只占 6.4%，需要加密度）── */
  { id:'cr_reject_again', cat:'romance', weight:12, minAge:24, maxAge:50,
    cond:(s)=>!!s.flags.dating && !s.flags.married,
    title:'前一个又来找你', text:'前任发来消息，说想再见一面，说这些年想明白了一些事。',
    choices:[
      { text:'见一面，把话说完', hint:'算清旧账', run:({ rng })=> rng.chance(0.5)
        ? { deltas:{ mood:8, relations:4 }, bonds:{ lover:6 }, lines:['你们在咖啡馆坐了两小时','走的时候你说了句「都过去了」，这次是真的'] }
        : { deltas:{ mood:-10, relations:-4 }, bonds:{ lover:-6 }, lines:['话没说完就又吵起来了','你删了那个号码'] } },
      { text:'不回', hint:'不给自己找麻烦', run:()=>({ deltas:{ mood:4, relations:2 }, lines:['你把消息划掉了','心里空了一下，但也就这样'] }) },
    ] },
  { id:'cr_change_for', cat:'romance', weight:13, minAge:22, maxAge:55,
    cond:(s)=>!!s.flags.dating || !!s.flags.married,
    title:'为对方改一个习惯', text:'对方提过很多次了，那个习惯确实不太好，但你做了很多年。',
    choices:[
      { text:'真的改掉', hint:'难，但值', run:({ rng })=> rng.chance(0.6)
        ? { deltas:{ mood:10, health:6, relations:8 }, bonds:{ lover:14 }, lines:['一开始很难受，后来就习惯了','对方看你的眼神都不一样了'] }
        : { deltas:{ mood:-4, health:3, relations:3 }, bonds:{ lover:4 }, lines:['改了两个月又回去了','对方没说什么，你自己有点过不去'] } },
      { text:'不改，这就是我', hint:'坦率', run:({ rng })=> rng.chance(0.5)
        ? { deltas:{ mood:6, relations:4 }, bonds:{ lover:6 }, lines:['你说清楚了自己的想法','对方想了想，说也行'] }
        : { deltas:{ mood:-6, relations:-5 }, bonds:{ lover:-8 }, lines:['对方说：那以后别再提了','这句话你记了很久'] } },
    ] },
  { id:'cr_wedding_guest', cat:'romance', weight:11, minAge:24, maxAge:60,
    cond:(s)=>!!s.flags.married,
    title:'参加别人的婚礼', text:'朋友结婚，你和伴侣一起去了。回来的路上两个人都很安静。',
    choices:[
      { text:'聊聊我们自己', hint:'借题发挥一次', run:()=>({ deltas:{ mood:12, relations:8 }, bonds:{ lover:14 }, lines:['你们在车里聊了很久','有些话只有在这种时候才说得出口'] }) },
      { text:'什么都不说', hint:'有些事不用讲', run:()=>({ deltas:{ mood:2, relations:-3 }, bonds:{ lover:-4 }, lines:['到家各自洗漱，各自睡了','那晚的安静一直留着'] }) },
    ] },
  { id:'cr_joint_old', cat:'romance', weight:13, minAge:60, maxAge:90,
    cond:(s)=>!!s.flags.married,
    title:'一起变老', text:'你们互相搀着下楼。楼道很窄，谁也没说话，但步子是一致的。',
    choices:[
      { text:'把日子过细一点', hint:'记录、陪伴', run:()=>({ deltas:{ mood:16, health:4, relations:8 }, bonds:{ lover:16 }, lines:['开始一起记每天的药和天气','那些琐碎的事，成了晚年最重要的部分'] }) },
      { text:'各过各的，互不干涉', hint:'清静，也疏远', run:()=>({ deltas:{ mood:4, health:2, relations:-6 }, bonds:{ lover:-8 }, lines:['两个人在一个屋子里，各占一间','日子过得很快，也很静'] }) },
    ] },
  { id:'cr_grandchild_love', cat:'romance', weight:12, minAge:55, maxAge:85,
    cond:(s)=>!!s.bonds.child && s.bonds.child>=50,
    title:'孩子的感情问题', text:'孩子跟你说了对方的事，问你怎么看。你忽然发现自己站在了当年父母的位置。',
    choices:[
      { text:'只说自己的经历，不替孩子决定', hint:'像长辈该做的那样', run:()=>({ deltas:{ mood:12, relations:12 }, bonds:{ child:16, family:8 }, lines:['你讲了当年自己怎么选的','孩子听完，说想再想想'] }) },
      { text:'明确给意见', hint:'痛快，但可能不中听', run:({ rng })=> rng.chance(0.5)
        ? { deltas:{ mood:8, relations:6 }, bonds:{ child:10 }, lines:['你说得很直接，孩子居然听了','后来孩子说，还好当时问了你'] }
        : { deltas:{ mood:-6, relations:-6 }, bonds:{ child:-10 }, lines:['孩子说这不一样，然后不说话了','你想起自己当年也没听父母的'] } },
    ] },
  { id:'cr_final_letter', cat:'romance', weight:11, minAge:65, maxAge:95,
    cond:(s)=>!!s.flags.married && s.bonds.lover>=50,
    title:'写了一封信', text:'你夜里睡不着，起来写了点东西。写完没给任何人看。',
    choices:[
      { text:'交给伴侣', hint:'说出来', run:()=>({ deltas:{ mood:18, relations:10 }, bonds:{ lover:20 }, lines:['对方读完，半天没说话','然后把信折好，放进了抽屉最里面'] }) },
      { text:'收进抽屉', hint:'留着', run:()=>({ deltas:{ mood:8, relations:2 }, lines:['你把信折好，压在一本旧书里','有些话不说出来，也是一种陪伴'] }) },
    ] },
];
EVENTS.push(...MORE_LOVE);

/* ================= 都市修仙线（patch18） =================
   玩家要求：「修仙不影响参加高考，可以走都市修仙的路子，扩充一下这方面的事件与设计」。
   设计思路：修仙者照常上学、上班、挤地铁、做体检——只是这些日常里多了一层修行。
   三条设计原则：
     1. **不抢戏**：这些事件都是普通权重，靠 cond 只在 xianxia 时出现，不影响普通路线。
     2. **现代与仙途互相干扰**：加班伤修为、KPI 与境界冲突、体检发现身体变化。
     3. **与既有系统挂钩**：闭关收益、走火风险、灵根品级都在这些事件里被引用。
   一共 12 个，覆盖「上学 → 上班 → 中年 → 老年」四个阶段的都市修行。 */
/* patch97：都市修仙线（URBAN_XIAN_EVENTS，24 个 ux_*）已按玩家要求删除。
   原因：修仙者默认抛弃凡尘、不再上班，这条线的事件全部要求 employed，本来就触发不了。
   取而代之的是下面的「修仙专属事件」（赚钱/机缘/尘缘），不依赖工作与婚育。 */


//
// 设计：一张竖版「书页」长图——外书框 + 内细框、宋体、居中的书名与题记、
//       正文分段、页脚是二维码与署名（贴在书框底部，不与正文重叠）。
// 为什么用 SVG：矢量放大不糊、零依赖、纯字符串拼装。
// 本文件**不使用模板字符串**（避免注入 bundle 时与反引号冲突）。
//
// 二维码指向的网址：改 SHARE_URL 就能换。作者署名也在这里改。

// patch169：搬到自己的域名（GitHub Pages + 自定义域名）
var SHARE_URL = 'https://Ithaqua228.online';
var SHARE_AUTHOR = 'Ithaqua_228';
var SHARE_AUTHOR_EXTRA = 'KFCCrazyThursdayVivo50';

// ============ 1) QR 编码器（byte 模式，版本 1-10，纠错 L/M）============
var QR_EXP = new Uint8Array(512), QR_LOG = new Uint8Array(256);
(function () {
  var x = 1;
  for (var i = 0; i < 255; i++) { QR_EXP[i] = x; QR_LOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11d; }
  for (var j = 255; j < 512; j++) QR_EXP[j] = QR_EXP[j - 255];
})();
function qrMul(a, b) { return (a === 0 || b === 0) ? 0 : QR_EXP[QR_LOG[a] + QR_LOG[b]]; }
var QR_EC = {
  L: [null, [19, 7, 1], [34, 10, 1], [55, 15, 1], [80, 20, 1], [108, 26, 1], [136, 18, 2], [156, 20, 2], [194, 24, 2], [232, 30, 2], [274, 18, 2]],
  M: [null, [16, 10, 1], [28, 16, 1], [44, 26, 1], [64, 18, 2], [86, 24, 2], [108, 16, 4], [124, 18, 4], [154, 22, 2], [182, 22, 3], [216, 26, 4]]
};
var QR_ALIGN = [null, [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]];

function qrUtf8(str) {
  var out = [];
  for (var i = 0; i < str.length; i++) {
    var c = str.codePointAt(i);
    if (c > 0xffff) i++;
    if (c < 0x80) out.push(c);
    else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
    else if (c < 0x10000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    else out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
  }
  return out;
}
function qrRs(data, ecCount) {
  var gen = [1];
  for (var i = 0; i < ecCount; i++) {
    var nx = new Array(gen.length + 1); for (var z = 0; z < nx.length; z++) nx[z] = 0;
    for (var j = 0; j < gen.length; j++) { nx[j] ^= gen[j]; nx[j + 1] ^= qrMul(gen[j], QR_EXP[i]); }
    gen = nx;
  }
  var res = new Array(ecCount); for (var z2 = 0; z2 < ecCount; z2++) res[z2] = 0;
  for (var k = 0; k < data.length; k++) {
    var factor = data[k] ^ res[0];
    res.shift(); res.push(0);
    if (factor !== 0) for (var t = 0; t < ecCount; t++) res[t] ^= qrMul(gen[t + 1], factor);
  }
  return res;
}
function qrPickVersion(len, ec) {
  var table = QR_EC[ec];
  for (var v = 1; v <= 10; v++) {
    var lenBits = v < 10 ? 8 : 16;
    if (4 + lenBits + len * 8 <= table[v][0] * 8) return v;
  }
  return 0;
}
/** 文本 -> { size, version, matrix }；装不下返回 null */
function qrEncode(text, ecLevel) {
  var ec = ecLevel || 'M';
  var bytes = qrUtf8(String(text));
  var version = qrPickVersion(bytes.length, ec);
  if (!version) return null;
  var info = QR_EC[ec][version];
  var dataCw = info[0], ecPerBlock = info[1], blockCount = info[2];
  var lenBits = version < 10 ? 8 : 16;

  var bits = [];
  function push(val, n) { for (var i = n - 1; i >= 0; i--) bits.push((val >> i) & 1); }
  push(4, 4); push(bytes.length, lenBits);
  for (var bi = 0; bi < bytes.length; bi++) push(bytes[bi], 8);
  var cap = dataCw * 8;
  for (var t = 0; t < 4 && bits.length < cap; t++) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);
  var cws = [];
  for (var i2 = 0; i2 < bits.length; i2 += 8) {
    var vv = 0; for (var j2 = 0; j2 < 8; j2++) vv = (vv << 1) | bits[i2 + j2];
    cws.push(vv);
  }
  var pad = 0;
  while (cws.length < dataCw) cws.push((pad++ % 2 === 0) ? 0xec : 0x11);

  var per = Math.floor(dataCw / blockCount);
  var blocks = [];
  for (var b = 0; b < blockCount; b++) {
    var chunk = cws.slice(b * per, (b + 1) * per);
    blocks.push({ d: chunk, e: qrRs(chunk, ecPerBlock) });
  }
  var final = [];
  for (var m1 = 0; m1 < per; m1++) for (var n1 = 0; n1 < blocks.length; n1++) final.push(blocks[n1].d[m1]);
  for (var m2 = 0; m2 < ecPerBlock; m2++) for (var n2 = 0; n2 < blocks.length; n2++) final.push(blocks[n2].e[m2]);

  var size = version * 4 + 17;
  var mat = [], res = [];
  for (var r0 = 0; r0 < size; r0++) {
    var row = [], row2 = [];
    for (var c0 = 0; c0 < size; c0++) { row.push(false); row2.push(false); }
    mat.push(row); res.push(row2);
  }
  function finder(r, c) {
    for (var ii = -1; ii <= 7; ii++) for (var jj = -1; jj <= 7; jj++) {
      var rr = r + ii, cc = c + jj;
      if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
      var ring = (ii >= 0 && ii <= 6 && (jj === 0 || jj === 6)) || (jj >= 0 && jj <= 6 && (ii === 0 || ii === 6));
      var core = ii >= 2 && ii <= 4 && jj >= 2 && jj <= 4;
      mat[rr][cc] = ring || core; res[rr][cc] = true;
    }
  }
  finder(0, 0); finder(0, size - 7); finder(size - 7, 0);
  for (var s1 = 8; s1 < size - 8; s1++) {
    mat[6][s1] = (s1 % 2 === 0); res[6][s1] = true;
    mat[s1][6] = (s1 % 2 === 0); res[s1][6] = true;
  }
  var aps = QR_ALIGN[version];
  for (var ai = 0; ai < aps.length; ai++) for (var aj = 0; aj < aps.length; aj++) {
    var ar = aps[ai], ac = aps[aj];
    if ((ar <= 8 && ac <= 8) || (ar <= 8 && ac >= size - 9) || (ar >= size - 9 && ac <= 8)) continue;
    for (var di = -2; di <= 2; di++) for (var dj = -2; dj <= 2; dj++) {
      mat[ar + di][ac + dj] = Math.max(Math.abs(di), Math.abs(dj)) !== 1;
      res[ar + di][ac + dj] = true;
    }
  }
  for (var f1 = 0; f1 <= 8; f1++) { res[8][f1] = true; res[f1][8] = true; }
  for (var f2 = 0; f2 < 8; f2++) { res[8][size - 1 - f2] = true; res[size - 1 - f2][8] = true; }
  if (version >= 7) {
    var rv = version;
    for (var vi = 0; vi < 12; vi++) rv = (rv << 1) ^ ((rv >> 11) * 0x1f25);
    var vinfo = ((version << 12) | rv) & 0x3ffff;
    for (var vk = 0; vk < 18; vk++) {
      var bv = ((vinfo >> vk) & 1) === 1;
      mat[Math.floor(vk / 3)][size - 11 + (vk % 3)] = bv;
      mat[size - 11 + (vk % 3)][Math.floor(vk / 3)] = bv;
      res[Math.floor(vk / 3)][size - 11 + (vk % 3)] = true;
      res[size - 11 + (vk % 3)][Math.floor(vk / 3)] = true;
    }
  }
  var dataBits = [];
  for (var q1 = 0; q1 < final.length; q1++) for (var q2 = 7; q2 >= 0; q2--) dataBits.push((final[q1] >> q2) & 1);
  var idx = 0, up = true;
  for (var col = size - 1; col > 0; col -= 2) {
    if (col === 6) col = 5;
    for (var k2 = 0; k2 < size; k2++) {
      var rowIdx = up ? size - 1 - k2 : k2;
      for (var ci = 0; ci < 2; ci++) {
        var cc2 = ci === 0 ? col : col - 1;
        if (res[rowIdx][cc2]) continue;
        mat[rowIdx][cc2] = dataBits[idx] === 1; idx++;
      }
    }
    up = !up;
  }
  var masks = [
    function (r, c) { return (r + c) % 2 === 0; },
    function (r) { return r % 2 === 0; },
    function (r, c) { return c % 3 === 0; },
    function (r, c) { return (r + c) % 3 === 0; },
    function (r, c) { return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0; },
    function (r, c) { return ((r * c) % 2) + ((r * c) % 3) === 0; },
    function (r, c) { return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0; },
    function (r, c) { return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0; }
  ];
  var ecBits = { L: 1, M: 0, Q: 3, H: 2 }[ec];
  function putFmt(m, mask) {
    var d = (ecBits << 3) | mask;
    var rr2 = d << 10;
    for (var i3 = 0; i3 < 10; i3++) rr2 = (rr2 << 1) ^ ((rr2 >> 14) * 0x537);
    var fmt = (((d << 10) | rr2) ^ 0x5412) & 0x7fff;
    for (var p1 = 0; p1 <= 5; p1++) m[8][p1] = ((fmt >> p1) & 1) === 1;
    m[8][7] = ((fmt >> 6) & 1) === 1; m[8][8] = ((fmt >> 7) & 1) === 1; m[7][8] = ((fmt >> 8) & 1) === 1;
    for (var p2 = 9; p2 < 15; p2++) m[14 - p2][8] = ((fmt >> p2) & 1) === 1;
    for (var p3 = 0; p3 < 8; p3++) m[8][size - 1 - p3] = ((fmt >> p3) & 1) === 1;
    for (var p4 = 8; p4 < 15; p4++) m[size - 15 + p4][8] = ((fmt >> p4) & 1) === 1;
    m[size - 8][8] = true;
  }
  function score(m) {
    var p = 0, r, c;
    for (r = 0; r < size; r++) { var run = 1; for (c = 1; c < size; c++) { if (m[r][c] === m[r][c - 1]) run++; else { if (run >= 5) p += 3 + run - 5; run = 1; } } if (run >= 5) p += 3 + run - 5; }
    for (c = 0; c < size; c++) { var run2 = 1; for (r = 1; r < size; r++) { if (m[r][c] === m[r - 1][c]) run2++; else { if (run2 >= 5) p += 3 + run2 - 5; run2 = 1; } } if (run2 >= 5) p += 3 + run2 - 5; }
    for (r = 0; r < size - 1; r++) for (c = 0; c < size - 1; c++) {
      var v = m[r][c];
      if (v === m[r][c + 1] && v === m[r + 1][c] && v === m[r + 1][c + 1]) p += 3;
    }
    var dark = 0;
    for (r = 0; r < size; r++) for (c = 0; c < size; c++) if (m[r][c]) dark++;
    p += Math.floor(Math.abs(dark / (size * size) * 100 - 50) / 5) * 10;
    return p;
  }
  var best = null, bs = Infinity;
  for (var mk = 0; mk < 8; mk++) {
    var mm = [];
    for (var mr = 0; mr < size; mr++) mm.push(mat[mr].slice());
    for (var xr = 0; xr < size; xr++) for (var xc = 0; xc < size; xc++) {
      if (res[xr][xc]) continue;
      if (masks[mk](xr, xc)) mm[xr][xc] = !mm[xr][xc];
    }
    putFmt(mm, mk);
    var sc = score(mm);
    if (sc < bs) { bs = sc; best = mm; }
  }
  return { size: size, version: version, matrix: best };
}

// ============ 2) 分享长图（拟书页） ============
/** 收集书页上要展示的文字 */
function buildShareLines(state, ending) {
  var lines = [];
  var e = ending || {};
  lines.push({ k: 'kicker', t: '人生天气预报' });
  lines.push({ k: 'title', t: (e.name || '某人') + '的一生' });
  // patch164：飞升用「飞升于」，不是「享年」
  lines.push({ k: 'sub', t: (e.feisheng ? '飞升于 ' : '享年 ') + (e.yearsLived || 0) + ' 岁 · ' + (e.styleName || '—') });
  var paras = (e.paras || []).slice(0, 3);
  for (var i = 0; i < paras.length; i++) lines.push({ k: 'para', t: String(paras[i]) });
  if (e.styleBlurb) lines.push({ k: 'poetic', t: String(e.styleBlurb) });

  var attrs = (e.finalAttrs || []).slice(0, 5).map(function (a) {
    var mv = (typeof moneyText === 'function') ? moneyText(a.value) : String(a.value);
    return a.name + ' ' + (a.name === '金钱' ? '￥' + mv : a.value);
  }).join('   ');
  if (attrs) lines.push({ k: 'stats', t: attrs });

  // 大事：从手账里挑带关键字的事件
  var bigRe = /高考|中考|退休|结婚|生子|入道|灵根|飞升|考上|毕业|第一份|买房|生病|天灾|亲人|父母|孩子|离别/;
  var journal = (state && state.journal) || [];
  var bigs = [];
  for (var j = 0; j < journal.length; j++) {
    var jj = journal[j];
    if (jj.kind === 'special') continue;
    var title = String(jj.eventTitle || jj.title || '');
    if (bigRe.test(title)) bigs.push(jj);
  }
  bigs = bigs.slice(Math.max(0, bigs.length - 8));
  if (bigs.length) {
    lines.push({ k: 'section', t: '这一生的大事' });
    for (var b = 0; b < bigs.length; b++) {
      var s = bigs[b].age + ' 岁   ' + String(bigs[b].eventTitle || bigs[b].title || '');
      if (bigs[b].choiceText) s += '　→ ' + bigs[b].choiceText;
      lines.push({ k: 'event', t: s });
    }
  }
  if ((e.tags || []).length) lines.push({ k: 'stats', t: '标签　' + e.tags.slice(0, 6).join(' · ') });
  return lines;
}

/** 生成拟书页样式的分享长图（SVG 字符串）
 *  版式：外书框 → 内细框 → 居中书名与题记 → 横线 → 正文 → 页脚（二维码+署名）
 *  ★ 页脚高度按二维码尺寸精算，并且页脚之后只有固定的底部留白，
 *    不再出现「二维码压住正文」或「下方大片空白」。 */
/* ===== patch167：分享卡三种背景（玩家提供的水墨图）=====
   普通人正常死亡 → normal（暖黄水墨花鸟）
   普通人早夭 / 横死 → sad（黑白雪梅）
   修仙者飞升 → xian（金色仙山云海）
   修仙者非正常死亡 → sad
   图片压缩到长边 720、JPEG 质量 72，三张合计约 163KB（base64）。 */
const CARD_BG = {
  normal: 'data:image/jpeg;base64,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',
  xian: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5Ojf/2wBDAQoKCg0MDRoPDxo3JR8lNzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzf/wgARCALQAeQDASIAAhEBAxEB/8QAGQABAQEBAQEAAAAAAAAAAAAAAQACAwQF/8QAGAEBAQEBAQAAAAAAAAAAAAAAAAECAwT/2gAMAwEAAhADEAAAAfv6rzdlEGQaI0BqiGBoGQaC0FMExCBKZtQNFNQ0UJVITBMFS1JkQjRGZANEoayFRpWwaqaKkJimCZC0KLBMVRTIUrm0FSEwLBKmbUZkWpTKwTBIEhm0KTGRYyaDJoMWqNk6VJIlSUyDIS0DQLBUVSyKEhSLVDUUyVREmZgaGEhqBgagmMKKSAJFnQVRQ00lWgpRhqqhstNA1RDFENRVFUtQKJVIlA0FIUg0VNFRCRQhQFrKkkWWCKFnSaJlBopqKQtBDFVFUUwUhMFQjKNDUhagNATBMDNEwSBJGWiGAZQcxCBNE1o1DSSVkyCQ1FUVRVRVFUVQSKwlSVKCRVFMCQ1VOUqgkCqAYBJbOgs6AiNE1IloSmsqhRIQSikKoqoSipCRakFkqgqKkRAqFy1UhURoASCRQaCQDQEwQ1NC5UXOqkSSEkpgoKqKoqiRKoqhoGoqiKEoqiaKIYqSoqTIylQSQVBUFIM0aFJNEjVSFJVBIFUUwNFMEwJDUFRNBMA0tDZVFUSIVFUFQSLCRCDECVKSWhFGqYJjOiEQSgZCokYoiaKooQpKQqgqlqikqqSpBIqgkKQBIhFqgc6qaRTVDRIkkDRCEiVQVRNBSFRVSyRNWJRVBItUkkVRVFUVRFLCRDBIURnVVaJF55Ozza20UwVEMEwCQklMUJQg0DS1QiJVFUVQVSwxCEiVVDQSBJCYq3ZonJVmoESzqOvXzdrNo0VBIUhDQVFSVIVFUVRUhISRTAJKTEjRVFSFNFCaAHASwxmYYipCYBhzqjs8t6m7Cas4Otyl6OdISDVQ1BIJRVDCVQNFUEigc8t65NdXlo2BSBAIVIWgGQmrMxUmbWYc6TNIbyxsnQmgNRnRHQxqzVmrUJDRDA0EhokqgLmaw2dZtEM2oTFVQNGVCpI0WA5VsSbuepdudVDBKYtEIg2dGd5joVVVA0QwaKtOFNhCjQ0UADS5tUZNBloXKJnAwR0sRtxVqzCQRoKoBItEdXjqulnVlXE6Pl1L6LOymBqkzRumsrBakJgmqSEoqoJKqgxozQYyyZNRm1GViGC8+ZfVct2Nczdwo7U0IGiiy0ZNALKdOSdDknr1x7WZNxiaNOGtQ2VVIhTBUQwVFVAIpVFNRaAmC4Zze/n5Wbk64xc6zrUdDqER6pdzJqM6mMmoxbjBujC5WtRnrzk9bw66mqzSWoLRRMDRIoVKSBIWcZzWxS9zlJ0MprXNp8mc89a52c3etcCSrVnVm8tYRH0BumSZZpBYLUYO2DGelLytxm1RjWmlyV1jSGiqcxuJKQoVBIBFxaMsW457crpNWZ4dvLm86cXG9i45dcBarLes2IBVHvsvTK85elhTpY3Wok0SZz0FydI5myMshKDILVIiaEKimMmpciQGxQ8es3p5unLnXt5d1vRiLXPqFjpWLdYZ3zreWgtFZukekrUpjKwaoaadZbFJGEqTDqI1Vm3mDWU0UJVUhCQiAJLnyPPlrn0O0ueXXJyd6o57TDJl1UWizI6JUxOqzbq6VWTUSQo1UlrMasqahpgNOY04U1FVTBIUZN4zSiyoeeMY6Z56cMbjpZnGiW6AZumaybTDq1CU56pJoWaZqpkDWJdc/OY16evzep7oemZEqUXKOUpgjbya6PLRuyGs5opTOrBvlilc6oMtLnVoxnpkyoGrRC2S7rkbyZdRjPTBSkzVUaM84eTnN3nhvNenj+gXbHn1PbfM6y+659N5JKLWQqitBIjTZazVvJmLKy5tVZx0xBpTL01Z5zqS4d5Jetnnu/MzuQzvJkSXIxazsZrM248tnz89HDWeXSml5+nluT6J5/R1xzOnnrr28uJfpvl9HXCWB5azmvbz9Dq8u2oMWRqMnQMatFbrDHWOLuU1CWWMZ6EtrNSQQwZ0RmSUFBalzpGzV8znu83Xnas3Kwd+W5e3D1+RnyejG7r6mvH6O/LYupjPSjnblznZA0ei8/XU6OWxhGqxEpEIiGIcooJEkRC6SQIUpgWsqFqE1Zj55q4dckRRoHLi+ngelPD6PL1X1RhPZvxa659tnXXJMBoM52SlQuY7vHVnVw6i5E1kldZ0QyZqWpMyQCqDlIQtEIgUCUpMeE6Y5azapc47cYz1z0xrzduGZfRjG078evml7a47r1e35Xv7c+1XXEIoaIzqTLQGqM6ymnm1tKzTlrUJVJCLZSBIKQzoKooiEUmGI8laxcPSOWexLx61m+bn68Zvl9WMy9vL6COFZl9Hr81qfTuPf0ciZIZSQihgECN3PJ1eKve5KdnlqtxWVQSBagtFYkgNCkhDA0VR5OvPeLrHDzy+vfz8Zv1jwfQ1OWe2I48vTylOmeuL5sd8UerzdpT1+TG8/U8vDep26+bUeq463nU6rmdCOduXB0jndKOWPSHn6dEG1ZTWDOkikIGdC5kgGWpMyJTHj828895NefN63PWbd/L6uej1/M+nrOMe3h2xx1rOdZ59Qx0Ohnl2wlvCvRNFvm2b7+bWp6jnveWoqiqKQKpZA1Y0mrNWnmmgBAjRmVCNQDENmPma82uPTry5945Z9HGXPv8AF6uet+zye2898+vLtz58+ud64msyu8kdx6anB7aMbtWY5enjLlo1vnWdrlk7vmJfWcO1m8hXm8P1fLi+bz/Q4y8fp+X12drDqaiEghCKUcqVA2VWI+QYvP15Nzrv6vD68vL7fL6s309vN6GOmvF7tZ4a6ce8zzuM1CY119HDNn0b5/t6Z6ubWXHQMHWOR1xGLpleeepGLRK75qdLO9I1GWUJjMi1BrNBQFQ51kYhiT4+h4ddc/RwzeXTl2MmvNX1fd8b6mM+Wxzx0+lxzvry49fBnevc5xvOte6s8uvTBs56nU8Gca+o/M9lnozG8uUDCZtRGnLWoqXKac6sqrA0SghZ0BNLkQYiisbMfL0XHpx00c7pVrzdbN830/n9o93k9OMa8/XlnU3xzqX0dufaPbrzHo5enhy3WLfpl15+vjTrjv0zefZt5qtIQqDVQuGzVnQxDQOdASGZos6FMoTBOUqj5+OljXM6Uc12cuXbGdcEc30d/J6cuPPpx0z1Cz2nm65el8Xpl8evV49zvze9Z3j0Yemxaw46eC36G/m+/pN0by5g1DBMVQ1VUlTWWoBCKAcywhVFUeJnNLSc3VHLPfMvhu2Jeljtz1zOu68uvo+bWPO7bcY1S9NFhhjR6+frXo153L0Z8yK89T6Wvn+zrjZmrdKVVEhoomhhqIioIckajJsjLKk1eY6OWLpkxz7BhWOPm9/nzrlrW5eW+vM69ePNE3zWx3NQ6WcjpjrL5tdjU5cvXzry9npLnl6ROHdKzb55b9Xk3qesNdMjQTDUJNFUFRU0WpMmwxMtNHLOwESzqOe3Ry5erMvlu2c3kdSK3qvM9Mw7OlnO6NctbI525Wt6mMdcmNNAbjNvMY1SvXnWdg1qVRIjVYGhSYkk0FSVBQtEZrRi2GV0Zdhnpy2lx9PM457Zzrk6Jc56Zi0Nm4q1ChllzozHUiqoGSNBnPTMIao3hNY1k674bs6VWQgwlCVBFEIUSmiNxWahKtHLokNQ8uscMd8ZvPT0rheniYmlqCNRmmKmhIaiELKg6BpoNSZtILFNZDUgkIFEJQVKgi5TdlsUjoAasMu3Cjz3LnQpqKgSXljrzlEooDUQwi5SzvJlkc6C0Io2KVVBqJKqoQSISlBCqKzGnKb1jVlCMUWhBJWEYEoJdZocouc7o5zowdecVBpy0kFQahJamxpNOWkcmohiScytmNEEQUUTlpQOkRpxG3Cashp5sbsJpyhlDM5Vco0QazRvFkgjSVNQjEwaslLhN2ZFIYhiGIohgEg1Zj//xAAsEAACAgEDBAIDAAEEAwAAAAAAAQIREAMSISAxQFAwQRMiMmAEFCMzQnCg/9oACAEBAAEFAvdv/wBcV/8AEZeNxfs7LLy31Q98n6y8X4CfoXwbiy+my/DWbL6E/I3eavNbN3u78W/Lsvxmzd8tl+sb8JPrv3FieXLFid+qcz8jFqIUkxjZb+C+pSN5v5WK9E2kSleH40H6KU6f5OLvH14lZjLqrwGzczdiyyy8SdDbbeEfV5Wb8NSoTvzZOy+MMfPi112LovxtR8YZRLoRTx39buSO+JOlmhYYvHrypSrEZUSnxeYlizXDYrfq0N0nOVrUY3n7XAzufX2ss++ivCrxW6JSeEqHxEoWGdsJCy+mvTdhySG3IYj+R85oeK9ZebHKiT3PPYXI/asfRWXzjtis14O+ItRPxLL6tw8VisvoWaKK+ZuiWqVKa2yuMnfy38FFDfypdCw/kbo3jSZsVfiHTktLiMNvi2N/JWaK+dyNzw2on5nf5+FqtS09TenJIlrKlNkZSINteK10JDRt6Fmivls4J6nRRB8rkcYpPTchacot6jRCe7rT+NFCxXVWKF4U3fShx5hdOa21tjWpNbEKLuMnm80Jil00UUUJedKV4ro+4kf61OJOyGpK07+NOn6tkRms8R4e7aRd/GhP1LzB2tRcLvDmLXGnwKaYmn8SLEy/RPK7vtfL4cOZJcvh6bprkb5q3B0J38u70n08UIUkiUU5RdMZu/a+YTXgX6H6oSPv7aId5EXZ2aL/AEs05bvYUUIsa/ZiHKyh8H1Fn1Ca8G/SNFDZFmosLvH+WacrXx31WbvJWHSN8RNdaR3KxD+klULTjqJ4k7F2T8DcX410S1cUUQbiLlUNYeKz9jVu+bdROz7PfzeaKxWKKKKNptKK8XsPl107mlp6rcuGUULorDwsrtixO/RPDLHwPkV3wycWhRVygVh4axQ1j6ErEXlcCd/LdCafhxleGUNKoXu5R/4J3HR/l/w+pYrMcbSui8WX0vg1NZQJa9z/ANySlGRp6kkoKfhdluN7IckuR8P6X/XX7LtRJcD6NyFWKKK+PcbujamS0lf4kS0ncNMS8KLtdkyLIzJqzlEHxB7lFpN8quEtraw0ypG5IXeCa66+GzcJ35DYhrmqJGk90H2+9FjiN/rpzRPlKXEmJvc3C4qBshTZDUItP4a6aKEivHirxs41ER7R/XDZoOiX7R3U4TptzipyURaqZs3JxSlBpQWjuPwtH45GyaUbxZuXpF3kRmicrku/DJwaRoyJQ3xmqJSocv01FakkiE3Ajrc/6NcdMpIdsdxItkZxL6H5qJ8oqysOdkhGnqOm1bIuownRaxDum4NO0N0PWR+SdxmLlP8Av/kZ+OVrevQ1n7H2J0yjT5NJ3CavPNohFuMf2ID1Uha5vgyo7ltN8Rz3TjuN3PpK6Jx/YXEtOX7dk+cPvGXMHtNV0JpmotwxOhMdkGSVSS4nGxSHqxQpJ+hrp1Mxi90pfqxyO+IOn/STcRTROP5CqF3GQaYo/rF2P+tRU9NkX6H6xRWEIkW2fjspwZQ+z7rhxe0vksTPuM2dm3Rbaqjftad+groofesKVlIijgnDbiuMKPG3HbCHyWzdxvNzJmm6SZZYn5LRRWaFiSO2NtnIhSIbdslhoWHyUmbLjRQ+zEhRtUc3WOUd1CYnfoXHkXA6ef5fFYax2xyz7o2lG0iM247HYXDoSoTvx666KJIroiSRXQsVh5orKxRRWfu/PaKxRQhlFZrorC61jv0p+e0VivlYvmTG8J+HRWKKysMrwl8dFZT81ro2lfEvX1ihYr31DXy8/wCB16u/8OXr7+Zeyv0P/8QAIhEAAgIBBAIDAQAAAAAAAAAAAREAQAIQEiAhMFBBUXCQ/9oACAEDAQE/Af4Fq6orqvC4rw9aoryMLE7M233Oorg0I9Bt9BkLLjjuKKELkYrOQAjtLhlB4lFFSP1MsVoNSK40yHbnxFFFHHpthFd8CNRO7L5dxQi2uKqOPwOP9K//xAAlEQADAAIBBAIDAAMAAAAAAAAAARECEEASIDAxIVADQVEiYID/2gAIAQIBAT8B/wCV79CvoLql+2vHvlvG6kVavgvZfN1IeXIb7W7zsmLwXunl6i9i5Ld5rfdPE8hZf3hzxNlxF0lSOvzQmoTwNjd3jlfY0f5ITu12rc8r7aY5XuvIZRfk77wYTT7fxv8AXIhBog0LSE6u27pfM8isTo1uEE4PIThVqdkJ5HqjZjm9NahNTVnCoyjMfZR9k1N06i6dPkXlZTB0xf6G9L4FleO9L+GPsos/6Jp+jpOhHo62LPhPsaITVhjnRshk0fDEuI9oaIemXT9nwLIxy4c01pamlkNDWkJ8NohCC01uCRCHoXAhCbmpqch/RQn+5//EAC0QAAEDAgUDAwQCAwAAAAAAAAEAESEQMQIgIkFQElFhQHGRMDKBsVJgkKCh/9oACAEBAAY/Av8Afmjj7KPQz/Yo5y/07cjHOMOdPMyoq1Hyyo4+V5yOatyz7823O+VP9WvzkSrBWD7lN1D1EcDqB+VdXKizT4WpQTy91eVaFZEsJyTjUOtXJ6coBKbEnX8V35p0f0nOMxugS61OEYKkcuxtW780ChQKJDcy269qMorHLBdMNU/ITrsjy4JK070E2r1cxDo5G7FPypyCcnlDl/ahq3ISVdXFWyh6sm42VpCmpn8Z/bLG+ZuIbJpZTZR9d+InIy/aGPtCjgI9RJX7r0k7MiyB7+rkFYcWwVk7F104MKfGZ8ej75m+UcS6hdQn9YKW9I29bspT0mxCfdN3TWRhEfFYWohTddld+KGTqG6OE7WULD7IMmeF7V8qFJVjKYw3eFEKMSkqOJZQgUQupeU6w1ZCydtS7L7oTYnA911YzdEjSNgygqS6hvZaq34bsjQ+UKBSWo66gnGyfutC1jZYj5zSVoxEqykHCm6uD80eocVHu6Y3oQURiXdBBPsdlFYBKtC19PxScXlQQ3cqy78OyFDgQ77pwvORwmTK0qQpChMFdDF2UymPEmjovvlsiRbcLqH5CcWKYMKwflOmKdAIHcJqRw3VUU02XjIz2o5TjbJ+lK6T9qIp44sCs1ill3Ub5H/6mKdTIWpRxUqKMQ6BFssK+Zk2KgijcT5pKbDvkasprEZdW6n5pavVh/Kfh3rFXyPv9OP8e/8A/8QAKhAAAwABBAICAgICAwEBAAAAAAERIRAgMUFRYTBxQIGRoVCxwdHx8OH/2gAIAQEAAT8hWdr0XBCbn88073dbX8UHuSiWzn8CEF86J8r0eyHA93fxwXxQms+Oadaz5HpfwV+CvxHsmnZkdar89bGL4Zq/j70WxEJ/jno93QvyZrNj0fyPc9OdLqud6+F/4dnGjM/CtkFuRPnW6fA9zOhD2L8l/n3WaLVaLRarb3rPzX8D1eiFwL8DvRbOh/Ah/Atz3Pa/gn4XW9fgvV74MS2LVfP3+Y/gXwX8Rflv4cfDP8qti+B6sf4Xej0f5s1X5b/xT/HX5C+Z/gL8l7l/lXuW1/kr/ArS/wCWe2wZrbFCyT5Fx/j3o3BjHneOh6N1/kHxtuj2MgsF1nn/ABq0adDbM7+zvYtS/nwZJkSMgjY3obbZrN8IIfI2l0PRWy5EP8dxD8B5eRImiZS6zRaTRfE9GchY2TRrRNoTv4cNDbbJ8L/AWvK07LueiKUos/LUMvJPkgxa0bWhFm1iITXgWRuFYndy+Yo3rPgbR4T2LdLsuxaLy0Im+azRaPSbIT538BCaZ8k3vV6idW1kedlxqn5+Gaz5Lq3uYtk3PZwcCnOlLDsqknvSatUYnGX8mDW2aPCH1yEnxUMdjkAxPC5Pfp1tbH7HexeuSCHbBXLgyV0YhRY+vwn8kOUH8BiapZ2vRaQmxi5Ho1TpeyCRJ+Y+CIbZDZ6dPB4HZc+hC4GyrvZBbZgW1ISZPJwIhCQl/AMShgvLSNN+BXpF5eiDZ5TG8HmOQ6V2ZbHoukrVNJrCEIQhw9vGfAviylycF+ZuDb70Z2ekQmkOMj3gWBdspG+OyJngZsdacnCHxBqckZN0ETSD0YaONJggqnUIsmQgtFOt9KN6PSad7eUci78vkS/9EooeTKJDTFwcieBOMJUeVfBztmyEINb4PVMT1Yi/E9Zo+UyxVxpyBjJdGb/sfBKM7exoW6EqzhYE355GT4Fug0JE3lrdEifIhnEXI00rORnJyx6SYbG7eRuLA4TIeXkaSL+RORjQpCWDY36GTSXSjKylEylLshNWt00mi3zaU5j2DHBDPLf0Ovl044P6o5P0I/ochTgGrgMv0ezljDQTfHnXkt9bHuRd0GGhISITS/A9sJRjsz0dzmZQlm5YEjlehGPn0chNJ7G/51Po7OBMCXjSCGfLF8S+RkGhfG2uTh2A4zhHPj0cEnLPYfpwiaJ+yuEJToYaEsCQzs/4J5Ehoglgh18aey/PR+I6xNrvQlKx3jL4HlfQzEvwEdtngSDyJZQ3W2cZRIh8aJE1h2IaJpB/h34eBvxoiEGiMnSdEVOymMWEl+x69HRI9s5cMBomiE0mnenei3/9w7r+RfE/heg3sbSVG1wZcnL0SHC+SE70TJMUWRI9o9U07Ed71K2xifFB4H3iycRxHRegnTQt9KUo2UoomUbGImj2MEYn7IM4KSkyTTvR/wBECZ0RS2IcD40XAkTZ7B6Ibch+AntGyQspnlXkbrUrHl1gthSfoqv72fgzq9LomURNMIYY9IQeiRCE0lF6EJRmhoVMkGh6MQtIQhDgyZG8TIU3LwEnBUMMnvoQfIrvgQjEOdOBo5Xj5y4MZR/UMER7oLSEIQmlLrNEqMIImlU4CUetE0dCjRjej2LRasFW8DbMF5K3ls805X0ZkGSdwZKmO9+xqRceqNFEp8Oltf0Gdw0dpJfvWDGN0m/jQYQgykQWw1oTcx6shBaLRxIii4IhiFjgwafDOh4tOQzBpylnIeCsdjvCXWP+R4+BhKFA/wCmiMTxOqjY6HlcjWhqRkOdUqMIPeE3P4X8TmnQ/QhMsglkXL+TJ1xzyJG5HlCwfoZnK3PIqjbeSYtKilGx5Jo9cD/QJ3eviet0s0WrLpN1O8jWx8iQzx0dF4KY8ETfsV+0cVLoCFTWkIQg0QhBoZooJ/O9Vo9XoybHthD7Hzgp/UWW6LDOMeh1JlmdnYJSpHgq1QyNdo7ufYl7LY9nY0M0NyYka0WtKXRD+N6PRaP4H0fZS9DEKkvmGQv9DL2hL5DcYyI2rwzJdGBHjJV6usFZMucF6cIR2T2vZCE0XkJlKUbEIWj+F7Fge1aLRnZBrn75OeRNuLwPGLwNDGAoyyzg/c4FUm5eXA3PlDZX01kd4MMskad+R6Jie4tYTV60erFteqPY1g7IQcJop3LmeB4YpyO1xPHoTPJ9pwkfOVR8TfD7G4b4RSRM9gkb6EDv+i6Pc9JpNaXVC+KfExE1g16Hh6H4CNDTtUsxedCx0UiTXrBaSJM8MtneUxvJd9ElzkTV1OP7IMs/C9JugTWiYmXSl+bvVawSxoyEHwYv+zOcRjSFIseqXbL9kx7QkvwOm1Z8kxSxca3NKnxsmlZSh1mSmROaUnkTL8MGNfFfQtE8D8AvsztSN8fzEGjrwGNEyR45Q43lXQ4QllwSo3A5/ANhcnp/ss5GtnijO/KKtLz8UGiMaGvQm0JhFPS72P4oNVobwr7Y/P8AMY82qPHtpdxlRdmD0HpmfsWEfb+iY/ZI0LFeC9mZLC5yVTP6MuRXIJh3FksWSak0TXss+h9CfAk8ISXhGPHwvV76HeYQbVotqG0mk+ypZ8vLHmCJeRvUMZGmsHgMJh+uBPv9DWMDOjQuIPVa88+mPLIWSxj8jJ4cow8C4EJNs1wYMERgxvulLpdbpdj0S5ExjAmrXLyPabfswOvjI+H+UhQfGrmCVZk5HNnYp0N+vjRBTHZ4OyQVGJoSJkJNpDE8iRcGHH/ovXGjNsE3xUq0acml9sSttY5vpfjg4OxvAxY89HrXiEblcdhpL/5wJs1x/QjS3A0s4WDPhw6GhkFpicj4YEhaZkaDhiR/s4MimRCmS7G8G/oezL9EgXhQ+tL6H1+fnBPJtunEbbpMIuyj3vSjER0uBMq7Q6f8D/XyLyS7Fqypsny0LhTwl+lMUF3gnMqZMFISfkQoOz+hRq9EDQkYgrS5GbsXvQkgoIIayQaFwP0dGUUpPkT3PBdGPlIxTSwCwMNyh3ndNHsWzsRAi/YarXDkzNFkG8ZXGXwQNGo+GVmeuxPdgPA5CcJgWnWEKzPA5S5PgY94osNDHKEHUftirix/Q9ZKN/LFmcwuNEXRqHkR0Q9Ho1dEy7F5CE0mSaJdCWr2UejKIoyl0VGj9lQyMjZsdMhz7COyCVhWs1uINYnh4ueTMkKrgnk3jkn5Rf4GMdxfQkpyswS7f2Q94aMiAxbb6GR6lJl7Em2XtcI5oY5h5YS1ine1pDWiDRCIyJ0E3RGQhCE3vR7GtJpwGuDjNP2NngKQSvcM2/FGhMuMM4xYhXyHNDTJbGqsqHqtDEIpMNjwXJZ8met0wf8APmeEfisjMx5KNY/b8D4j9+0sFDNv/wBBjQa7tdZaP63gTBtXhgZ1gk/T0aJZZ64mnxr+jHgcLqiMjP38j+9IMmvQ9KJ9MjRrHKGnIoMc4H5s4ViwdGc+nBtpNEkl7wSOdzDjrrgoi/ryPaYMT2JWixV/0JMcP/B6NY7wZvbDgjFzgm/Gy6Q8P0xm/ooJBOn4fZYYguT7PTYjIQh0J6/rZPZNr+G6NMCLlqcQXWDmTn2YZOGMbKXfsSPJSdREPl5Ob5Xoei9oTmNnlsQf7RC3B9eBIctZyLye5+mLtoTyEQH3CbtpclWnyfZkImPrArhNi5N/oeVOJwiUUF4d0VeV/ITb5U0u2bv2XS60uxj3sKp45GlccCx6MkbRlwPYZEdY0c9M5TOXrLCf0cIz4JepX8mO+BtnEqi+4NV8cjcmR3w5XnssZQIeFHEimKVs41/9kdMyx0cngSBeI15CFxn171hCEJqylKUpSlL8D2LSjVQxLrQkNYYlwSR7J0NDwEJeCfL7G3Jv99nBgeFwIEJHE8EKX3LCJYf7EOEzAJVMcuMcmDjPuIc3eblcCbwnlFnCPyYZhPFYxsTClI+BxkpRo9t9HOtl2whN0ITe9qIOOCRiWYSo6EbiH2coQgnlHkWyKELNduCD/kKf8Rogiytlwp+s6Eqir/7AnMV6LwUz7XlH8xakmrBM44GBZVcpjk7a2FOUZS8kOseDKJZcn9RXV/h3b2LRaQlExToYeE6GvQvgZ1NWrB+h9GQ28lSk034HIQa6JWSsmf0M3ks+Rmh5Z4OYr2nkfK3CTwcYFgZMZ8EssN9Bd3//AEUTXI6uhhdiwVJvpdFs8scoWR0/6JKUbF8V3veiDUZ6OjAa/jSdDC/9jD9CvCcpxMr5Y1K0hC4eXlsSlMJ/s85OrwMdN5FZ9efBBDrnw0Z/6KDdauBrAazRn1+15MPvr0WTfnyXw8ZhyTmWOzPJdiJqJc54M4Koy4Zjyyi1vxPVjIQexIyaPLR8Cl1dldxnlGBofk+yQ8TyeDCnX/4Icj2QhNzi/wAHoTLOS6wsZ/klCnp7GlXYT8ifhig8gr5KKx4GBzfSFofDE8ocZE315G2Zn/sN8ghz+zoPevkhNUdkGiEyNYEhIa8ig0PSa6EouO0z/wBE7K6oypo2+B19Z4glVjkgJcUeE84FhnE9ckT8KOPZkn4MVOz6ZKT9GRI0uxeXAsl0MnwxJyuGWY/Ej07KPsNTgWkGhaHoUEhroXjo4TQzTQvL5FyNVFwa86Fjg5Ns8PTIZkaGhBowFDOGVYRELy4FXPyra9sJq8kGJaLaE0MQjgPsPIWULjQvA1k6OH2LjPJyJo9ZowdkxiY/Onk5+KfFRHGj32RgQejsh0sZFyLT3sfN/kTA2j0Y+dWvGn1p2NqE8MbcCb/Zbb38vIgxBaD2FzoaJo9F40Wi1/5OozgTwPVHteBckqILQhGM7E/hu2oWi1gxiWRLTBLpNDQo9Ddc6et3f2M8Ca96cnY3pNEltYil2LV7Hoi6rVE2taZoYawNiZ39HGqY9LpTDFCowfo/WihCEJs72Mpd91TLpS7JkS8iWkGlMA0TV63ZGNeBnXMMiLja9Ltuzj4VqtaUpR60oxjWB51el0XOn8kM+R/Z+xIaIJiMW1v5buW260o8i0pdLobQx7Hzpdj151W9PfdGyj3Jl1ei0xotKUeieC6/ZEdkyNKE0mi2LRKTRsWt30pd61pdiGylKUuvYylKJl0UTKMpds1Yo9FoxMpR6X4cbFzrRPRD0ZS6vRjWxcbTedrYi7aNi1Wq07FrdnRg/9oADAMBAAIAAwAAABCUGt8eNaqK6YrY5jmaSgg/fW6rxK1Kb7KyRDwbOaRY6EjRjyQuPYuNcO/4j5/39hyggP8A5HjPMj3m8sT7b33PJ9Ljik+fBY8KbNSMlfTPPLUsk/DvZ7r4sX7v0G7/AJJo5+WNGD54/wCPVzwfdf8Aft0EnvBYSN/w8+tpMoMNfPLLAYQbvn/uAoEgLRiabBYumV9gU41xPTD0Q3rr/SvJgcQn82G//MmPpJUYANXnHr3/AN4Q20XwzzW63CIqv8qL27WOKJP851874fdcWqdy67//AOA5Y8Ce+zTiRxzCks+cFnn2kIYQFu/OevdrEgNnSiiRShj8vvmob32+z20HGMEg5q4yCPvS5L7Tj7vMsumDx38UHpJaqySjajIS7Rn8r7SRf/tN/wDvZ1txOwo+K47PKxNLqxFSDnHInjEuHfZBLjFk3xGcqEI2jwIYGRdnQySCb44ybn3bK9CWV6M6lKRQ97McYidJ9UK+ekbXkolI+epqyzThrH3AXvCRFVuItRqmzD5s8LV9acpdZuYg9vzZlVbNo88mq/eD8Ew8xFrAuAEgUsjqJ94dnflbQ4rmImEwsPss9uIHL+eCyiOZ9f8Aj59927U4dIqHBdaEhL88o/Y+Hl3zQS7OWF01mK4aauAh/wDvA/BALG0/SfE8U0YWGZTTetO9wOdtXdddJMdOwmkTfArwAzIahjTtgS6s3ud0fSDYaH6Lwjiq/wDSMjyCYkoZ7UTtsAT5hcReqmEIfiqihVIwiSjl6euskcyKBsmAcAh5Jmp1H/agqHDXA0vbB8tq+a+tdZVfzUnP3cE990eM78y7Te7yF6TgSyc5SX0Rf3WTnQjEuNA3zyIlX77RlM+VeMg2olYspwoP6nZD+PS+nSTvynlER/AhhJzbOnBUvQDjrdXj00wdB4GpocCkeTWOZlzlebOz1FDEr0QY8ALmeDjFbtcAYs1orMEG0hbHoHXcn4I9BkNDPWrc9CLIKgofZR11qmLJNd/e+2y+8C1ytFqE/hKfWEJ3SbEzetPDDLS7rK+scy4ay0KgWc2QBXgNcnoWNz266k00CDpidN7pj8V220MIU5YH8A6KtT1R6e6J92XJbyQLPPPi8f1ToQkSp5D2WVvWMguyMB90OsEzX2Akhs+e+9D3fxA4r1xuU8CBoLkYjEn/ABP2jGCgP+MydVfiHlTdb5vA8uV9mosqgMdDhCobAX0YdUuKkqM/+AgUTafluwj+/ZcEFJ8V1KkaTg+IFXEovmgDMD8eAIlQgyojjMNEyJPsc1+ywu0wonVJL+mVxZRFJLgBounFHOSTt9Xef68nvhfdepymwCDKhOHBlkNtrpPI8dZyngrNqfQy7mD/ALlC7hqZw5Tzhm3AIOiwDz4zRDLKwumkXRCC/esSIaKxi2NPO/udcH//xAAgEQADAAICAwEBAQAAAAAAAAAAAREQICEwMUBBUVCA/9oACAEDAQE/EPbX8e7v/B0J/Af8CEITtSGvUm/IlfIkkXZ6TshNJi6QnTCCJi4nWtLmiYmqxCDL6FC1XoY00c4uizCIhCCRZY9aUpS5fcg2WFLrCDzSlL10QixB4vS+3kSD1fZNJpCHAkcIulKNlw9V+x/nWYmZmZpSlw2XdYE5CA2Gp0TFKUpcUurKUSrEkvGH4Gp4E305DjCGtWylLm9DwtTSI+NoQg/Sojwx8olQ/wAYpdGiE61pS4Rx9JOBDh9M3aE6ZrcFgtG8NUajnRCEJm9K/RGAmLCY2ImKBqkZYJouaVDfWhciXJEcwKhMpS4qw1SPF2hCEIQhMkhcHwmYLEp4KNieGLAxBQ4HOuYT+CpsMXgXKoh4Gr9GLNKUuGsUpd7mkCcIIGk6Ei8j/I2Xkss8sj9GrwTC0g+pMpT4Lnhi4FJTh+RqcEkNpfBG2VPA3fQmKUTOH4wxQfaNJo4HDhKkqiR8kPHo0pRMTTGN8iZYeRhMUIND5E6qUpSlxRM4DFoyiY2NiY8FOGNdNLm5pS4pRspS4pSiZeh7UuGJly+1rvRSifbS9k0Zyc+u917sJtPR/8QAIBEAAwACAwADAQEAAAAAAAAAAAERECEgMDFAQVFQYf/aAAgBAgEBPxDMJyhCYnVCYf8AAhO1fw13P4K5Tofzb8m8p8e9s/uX5l5r8VYnJ5b5D6ELkTuJ1N/gm803iZnFYhBYvPQ2NtiQl0VZTEyuV4XEJi4UubmC0UTG8PRYprqeZiYQJn2PXQThQtjRBC5nF5mJODGbbEUpCEIQmVoTTNEpCcyspWJ/o1iTCQsb4QhBohBLheLxCCJaQhG2QS4XCieZhCcZwg9bIGzE2M8WCQ1D0nNPhCE5tpF3+D84QSFhISITlc0vBuFuGLwapCEGrgkxIhMLL0V0hqcCd40pSlNng22NEIQghBIhMLLZ+gnDNpi0xK/oTqvQ2ekGseDQggwlwWZKjG2PQmvsQn6EPxFZ6LDaG2xp6Jp5aE2QavBFi4fLYkIQYmEevcQaIeCFwuL4IZCcGiDQ9aE2ejR0p6J3whMTCFKXpXIw0L9jX4fW8L8ZHB8IbQni9swWDoaBIP0Y3GFMXClwgTLxfKn4Yl6GwaGtjpGjHiyiwLEo2IyMg6EyEmQnB8dhuHkamOPZKbBIQ9EZQtaEFTzrDxSlKUpSlwv2MjY9lhMnRKQqQo8EtDQaFotYJGUQMV99fo0vUK9MTJUS4n0f5HrGezFZQaZBojQm8QnU0JOlJkqG0xShFLwoGCE4LA/oQp+lGNs2LKw+hPshNC0z7keqbKo8Gz1Cl2U8YmfrElGJ+5Dw2b4ovVCCbHV6NbLRQemzZKxJlCohqUKaeG8zhOcIQYaumMXgqlRqSnjY1GfQU2biVDOQutlFsnRCExCEJgdCkcrQxC4kL/R4L20bDb1Y7XJ4RCEIQhMGGIJKGhKsJgtohCDWhIVysQgi8YTCYg0TCeNDPOLxvCfbMNEEHxLilmCXB9F4I0aGuUxvK6lxeKPLJ0LjSlzc0uKUvB4pRZnZ/8QAKBABAAICAgICAgIDAQEBAAAAAQARITFBURBhcYGRobHB0fDx4SAw/9oACAEBAAE/EDS+SVxDNXK9Q/MFcytPPfgcp/KJupWJVJH3C/mbEoYbwTm468VmAO+o4a4gYYlVKxKqJK7+JygaqAxX4lUqGanUC245r1GDXNeaKuDn6xCJgJVbJgvHhLv3K2VNMpuA5ILJ8ysZlYb+pUFHcKrGUaiL1C8S/uGUeWBZqBzvqMq9xxqVgmcypQaJ9QnEq8TiZDzAUwFe4u/UERIjio3Frcq5WG2MqcmJ64lZviUf8mn1BcVcqt+K/EoutxIANsr9RLzEuAXG63KxN/cPXECTbUfWo+j5jbN8TlzLdagpofqBAoJTeIFvuBUJhhjLOPiJQ1zAibIHzK54hr1PVRyg7lZxKzA11Av1KmOp9St5nEMsXHlUCgxKw8TTcrOIGZXULYErqBVY/EvjFzFLzKv/ABNImMStHcqJzNJqV9RZ1uV6lV1K7Mx9RO9TlwkTDcyxE043MJX4mjEs1GG8kdagcT33OrhA5jvErDUCpj/2VBHLupTepxWoO3iP8T6jXzOfUI6hnqO68fcMM3MMSuoGNRJiyIblUQYbJVOIGcyszUqMv4lb+Yl/USG+Jd1C7ySiVnLHL5lOfT3GgfFytmn6g4Y3PzDevicoFNsrEqgrzwQuZmmVzEJpxA61ObmlP4juGNxLz4o6lVKPuJiMqV1uBeZX4iVqVZ7mGyXiXnMUYMzSBKlSuYFN8RHnUfUdQy8BBKrEEIgxU/E38x1LzqV+WBXEPhmWhKaH8zLUSVq4Zy7g8Lea5lYjupVOYFeD1H9wN6lYx5HE5iypqWMFI8+A3AszE6l3K7jAKzDcbNT6l+5o+Y5A6mJWoGY7lURLMR/uUd4l1uLG4o61MMPhKNQ+WcZrMCtGJnJ/Xg7uVWp/iG7l8zcqalMPcaiXCV19ysznyk+o6uanzDVke0qbm0/xDiXxx4AXqKceDXm4Z3Kj4548FucYjmYqJ/tT+EWjO2BZFzHBMqiL3Lyz2YqaJwQL3KKTmJT/ABPnwd6jMy3UHMdnnSbjmoTK+XSTVx6nFRfBDF3H1KyQeZuDUX1K+pW5x4subgRHiVmfcefF5qL7qEVv4ImSOlWHWI4YgqZmHdz0ZVpRAVuqIFEMQ0tTOYRIM5jrEzPuaTCVidTUckJw8LpiR3ExAw3OczFypUNzLGGUqV1BEeokLIlnqVjwComMQuI9zMr1nwJWNeDMO3wMNFyqHrUFlsHv3HJ8T4Lh6xHuGCpUJqGYkCIRxAuonMDEY+5iyPqcw34NT34dTmaQ1OIEr1OI7gVAzCPnicTZA8bYGInh9xb8mYlz1NajxLFRyY1Krn6lpRcwpnJUJpcT8TT+IyzEhNpePNZgfSJAtntDMWsVN4l1Km4mIaly4PzCMvEGXmLNwJU2w34ZcNMYJzMpUQucw8Jm5fE/aBeIHHh8zRmX5RZSY07hjBCsXBK9+A5iSrhjmfNRMypzOb8kqaXHUrUf+XOEEq4WQn8Q+IaiQYzBuoe5zCETMMS9SnMS9TW4dTUPBMxIsZrUSwMOMxDwE5vMPcPXcviMNyvcC/8AM4Qlwc+V9+Xc1Gc3Fl5nOYcdfxHj/bg4M2xKhUaublQSvDDqENyozvwPTB1zHU5vzlG7zOfAIlQySsYuF3TUbt/qGmfqBalsDvUr6gYzEfiF1mevB2TFXCoblQMZnMcNTMrvxzK/nwdoRzDHxK5iYlRIVUCc+NSiMIRjqfcTOPFlwgXOYNw8Ny4x6ZWJj3qOMktkiVL/AFD1B+IOeIP4g8zLiXiHXcMj8QfxKGoFbg09S8UNjHDivUC2JT5Nzc04jZ/8uJ7iTmazzOpf/wAMuXuLicTcywGvnws9wdYi8ReYf3O0+YmLIbqo/wBSo0S5ZfqLbczXdwO5hl4gHEdfMOofEy/5M1RMxMxKlW5gVEtl4icw/icQ3N581jwa8JCOY8TknPiseM8y9x1N/iEAnxLiy25mVjMcwlRx4q9wLiY4m+5wwNVLO/1BfxOdQK8DE1OYGJ1K7lTnlmUITDX/AMF4leQuZgTR448Opm//AIBiWgLBDcv7gcwKjPzPcJUZUJcdz3PccTFR2RMzmofMpPmFxBvED7ldT5irGVmqnPg4hncahiXH3HMeLm5V54lYnLK7ldwc+KlTfl8E9wYvCzmUupSS2LfioVFi+vHPi5efDfE+o/xLx7Y7arqB7i2wCviHvcce4bgbudQ+PFSsxhuX+ZW5txOfUyIFENRJ3O5xmEuV/wDBKiQ6leKiVGP9+G4FebjvUMxEllbg5jPiG5WIR1OImp1Mw33B6loXzzMs1MTiGpxB1OYe4xhOyc48djxWIuYk4nEXHjiDF8GpuPhojCMZs8FRDww8XxGVKrU/qfMNziXuZmvvwcymFBKtp4idRUepWdwMZjiFVLzrwTdkKxKqXmOG/HEqcSs3PiA//DxL8fMWXU3AjHwxCc6hPU0R1OPBLieHWPH+Ybly6mlVDMbjCDNv5g1awIYKg/mAYUS4eLzK1ceY7j/8LAgyyLDflnMSVXlcXziJ7moanEXUGzyeHfirmmcSsxMSs/UTEDMT1cTEqHEGi5tv+4CmZslLqwl3CVmGZUZqfMcwMRm4tS7cy8TmZTEBmMzmOCdyoMqBKjK8vhlYhGEb8XUuXBvww3H4j8+QmPuD/SUyswMygeZUOT/Ep0RRXUCs3UNeGdyjYbJVTfhZvw+UuanMrEDiVR54hz4e5U48cy8S7z4ZXjuXTFgwJTPUcanxKgYzHO4RlEwahk6gQzzRD2CB7hmyLQTAV9y/n8xzicCCDhf6ghb6jAmvFTnwkfFVKqELman+fDOY+OIkIR1U48EYSmOZVyqhkmyOpjwYm59Q1cC7iUTvEoKPzEeSJlm7uestcM/SJcptYCFS0NPiZLuEAoLvXhg+HcuM1A5Y+DzzH/8ABPJ5bj6lvguPqVKgRhNywMypsqVyuAG1xgweUX8xu7ZVMcXNNz0wIrafUX7juZGHDApa3x6ioXuoZaxK/wDI4WceAvmfcO3icXGUQJ1Kncc3CEXwe/8A5PFS8RlMFL1+E3gnUHMMNEM68HuUaizRHcxVc5ltVKo1Btm0BvcJ8o4m5SBKjhK6ntjTNQHMxdYGUsSvfBxBpl7wrK8mZcS3uWLFgi3M2G+4enPcYb14Tykr/wCN+CViVAjibleKFrRGGgD3MhVrMNVL6JTeSMRz1FVG2LUovcTEFeTAcR/UtIZqBnxWPmU1D0QyYYE1+ILzcKgmzEsPOGO1OZQMoiE2mmJlgVU5CyAJVPi5z4ZzKj4qVBlznwkCCe2JdGWWpfqbSrYEMRLgJ8TnM3FzUE+NQM9yuoHRKxdROpVDNQbLqUVRNSrlVNEeoedXGjMS1z8QLK3UMAzYSFt6eZeM6jlxKlajNqlRJiWfHFiBKalSoR8sCEJYblBawKombO4TWowZUqpUqoEcM5l3+JwgzrmcppMzGIgX/MIRWUq/ctm2Ag9wJ9QMwFQ3hjlgxGjCzJuIIesMMG9xH9o2Fwuu8S5lhll5Y5lUTnydWQW8QRvMpWYNwqPlPKCXaJslWxG4lT3UYEOIZZjmG5i6YZ2wQ6J6hRuxgBK95l61FIJfEx1UVbb3H5xcSszSBzYyqAOCZTDU2QAjaFRJUqIdMLGLeIoLnAkyMSs3A8RxMvCamybQjFVMmpaQbh4YoRbYlypUqJBcSiOtR3ucbg1zEdOJlW37Y2cyv7lINYn4p7OZVTItTbuJjE16gYry0T03M8VFHNwbJdFQ9+RRYQtrbqFLYykvRK3zAYO5Q5Nz43FGoa2sATEqiBmJbKxAlVPaBEthSHiokZUSARGYDMUrEUzJLRtIm4qkq6uVbi5W7gUHzLHzBZMVKxUr3z4VExNMYRXg1DdyuRlW51LdPmX03NLBll7/AHEValdx8FR3e5nlbe4Da6gZnDdMCUf7iU3N5lCn6gFpXEYuuZ7k41A8UR56ieOJcPF+GXiXjxdx1E6gZlfqLg9xLJpEuVUS6lYlQylRZEYOoA0Vb8ymsNviCqg/TMP+QqANKX8wS0P8I8G0DcPpLq5i9yyvcCt9zkIi1l6itKMSmppz3LrRGiKrhMYMdxvQx4XcCw/DmUEZvNwogMcD14OhWf4QTGYamp34qcRgeSLOJwTmVLVBxmO48xIGNRgSpRKlT0mBf4jAC84DqDbWb0RLsv8A8gNbfiJbRfqpyLb5lZsgNa/DKBhTBTHBiBxfETNOZgZmUQ54mNxDcrUCBJbf5io6xBFwy8Al/DEuBEMxjLBKDB/+agSvFxZx5Y6iR7lQJUqaOI8yo0OYLYDa5zF3Vescsyzm9Eas0uhggUVeVZdpaFjiD0uItdWTHD7mT+J9yGiBEV9Ri93HhqIfrwljHRMolle+5puH/SIda9wOCajoOLiFC/wmQJmM14IeAaagRq4+GVAZUfFeK8KiAdvUY4o9EZa1llWanVliTYwuyPzC4UzHcAqyNB18wdaRNGKgXyOU7j4VgziWapjj3GkAAc9svbWHB7nIE4XqLBgB/cWuSYGMy3UA0X/cTAQHmUI5+IcpWMylccS9S8MtRBNI/rM4JivU39Ss+uoGbv7iGi/TiDX9TuUIp2gqywCcSi8RM1ExKleDc1HPhPFQA2lxSqS9Ry+oNtwOU1QNPcHPSBniEKBTgLWd/HLeiAEWy1DFTs/iWQVWDfcGVVbRjEwkQNHqKWKTG5kKaf7jpx3AocbojxFXyVplLBtjdjXxHCpWSoHLKgYiXMGC5SVKcwYZVvzLPmYKJSxlW44zKPtFEqkqI7M+ppXPgwknsZi6g3aV4qfMSovUtGE7lCZ3DfEqP/iUjkzAcmFyqyyiomyoOAVZp0QOFlKr1AClF49CMnBRvO4VSvG/XqXFCjP3GNjVZLaucQHF4mU3+47VPmAXWDqF0ORr3E4Gn6m1mCDykG44zB0QjJiBcDwLStT1RMz4lZsiXExRASvcLQdblQK1hj85lm8RDiBiDEtogjFxrwvUq5VRiRrqVBE9QLPZqY3mAdy44GmswAIK0wK3Cst8ERNQpQ99ws/thWWs1ABpxapiI0M840RlL1eA6lgvbDWzFR2rBz/mItj2tVDF2HCqgSlOMXCjnVQwcfiA1TBRl9T2y6qXn/4Bz4TE2nRLcxV0RVSshAogXmVEmkGoXWIUKZxiWPUQRKm//h9xyxImYle4lQNarwyFOBfMIIBDTuIovILeahyEGeJSEt5gVrJavcEUF8r6lXBQCnmELNqrwYLZtx3Baoy3PqZy1pghAwcqyp7BweswO7X5gqzcSsvcpAoTIuJlDVxt5YZWFoPiiJYAIx34AlVCVDUIDEcMQGoG/CHniVcfaVi4xnsSoloXNIQNBLoQgWOm5VvVgrgfEN6i5WZSjRe5VgUpp6ahLBy0DuWQbc8+2WqI3VUMfQZXj7mTaBromleBxt9w3hi4UAY5iI0+r/mXK3UNQLBT8RG965Y3TRzKwPeIXkvnc0Tm4FwQshC4c1NhLEIGXBizmGUCpTLCdsZacQ+YRQygmJcIEfrwuVGVcbxLQt4ItTaxxjUyttQZeiaqWxTUwgetYdEwVpdymbTiXcm20gwowz8yzbGuI2ctalgC2s2YiJfQ4iouspmWgW7XENKOYqIczAF0stCnxKy4iG7xE0P/AJHLAB0xWzkCOInMKlFypVJCcQQ8XBnEvEHES4Y14JpMpkmBuLL8kW8ReLPFxmmvkwa0N6qCVZNjWPUYtMDAXiC8hsuViVVKf8QWUrUTam6ZRarddSkc3NH6gTu+oZtVrUJdAGZoriXIPn54lRWvcFN6zCz4ETX0ilAcXODEoFlnJ+IuRAHD4EqLDcv4g2eRxBzAqXLIMPAeIOIQYPh8VElPlPdRl4xJlj2bHuCeI6yU1QyxKg/JElAoMZ3HWYAYzqFMCsEyLFBdFy4YDKwalFYxBp9XLwO7fiFaObpqoKnc4qUFSsVvcCDbKw9zGG6harIlhfOY5NG5mspr8QUksaqF+NOZyB4i5qjxWcz48GvFTjwZipBthKqOZcGMDBYePmXFmYpk6luIzDe45zQlk1b1BdbK4Y0oOHbGgJjiA2Ayb9ssUOCC2u8/cV6HbOppcdIYFYbtiKV1YvXzKoFtvERzV2sbnbKVQNNTBFMRWGcPmVm+KlKdcEDLuLSYIn3F4QwvUWofEcsrfz45zLDcSaA0LTNRNCtb0iuvcuXK+o7g4huFR1CYQZuoZ1uOIOJdkFriDjMovxRdS+5ZzNOJbz9XErAOuonZfqXgr4lLpy/xEYBnvuGRIdOZpjHzA8LrUuqB0vuLpnPPxNj0fuXSr8wBXXqZq6M6lXhMwXBBdRruJjMDBcEue4FXcbsQ5vqUbYhYFcwIOJU14WHAQKlJuqqYNE5cPY/MOzggUDiiLZZN3M9dsag4cQoM1DLlx5Ny6gWIeI/jEJ8EyfEvsi3MPeLDPOpZG8QMulwqdxpdqDuEbDsYqrbTzDQvBo7gziCFvmZtVLWzlN9QtZ+CaZjj6xEw6JsAptgXA4alA4+Y0p7iOKfmAxmOzkhfhV4lcEqlvuUh2wXackNJValLyQg5Ij0RsKanC7i9B2F/FQfq7jk+z4lsqtW0Dz9sQjFRcbNly6a6iZoFPTnFagrkDJu+5x778YqJzczMx9RYb7ipj+IFYWYYZVLvMplWKUS4BiKErMEApZXBuCMwu2upQt6mFtz0QLsN9xwxD84oMxFt/Ubg4mXoQI0/qDWD4iBmCalGYuEBbnsSiBqOiVqrgzBkgXqFjMdIDm4ST6NYY4aAvNEueVsxGKHE1uIDgBXPzKZJldgIkjXQugVV+ogNz02RvNw01BtqWwRwQEgWBQ9WmocHww6Nf3x+4ReX3NxxHwzK0iD1MIxyxfgQCAjQS0cssWNdQBxHHMQUMyqKDuPp6mmDM9oLuEMNR7JacxYkLrqArMQDiOruBs3CosTFGfxhl9VAeH4ga/MOCGoM7iU6gGyqHqW1VMxFBs33UsKG21dyjLtwwBj/AIlgBe6PfqcygrYv1++5SgbANHynKRNVAvREEOjs3njXPcuRleNX/iPKXcWVg4vuJkC6eUsX1KubSpFQsdV74ibLIZ1zN6Ya1McxjOI5Zq5hRljj9zDjMU3UQmSGMEZlDRUvFRIh9Q6xF8MY2xi1hlhGDnUWMGZR+SJ3Gr+oDcBcqfEFVB4+JkzEs1wHcc8fK+YrQZdwULvu5XWM8QZcnhzLELoOS4pQKuBejmYVwqvfQxLUFaZ/5FuRavHB1r6i9BlsCPi9n4gKVSYPnsKr/WLIgb3Z/v19yrKZ40fMrAVfcUMyxd6ixWudVk4J+pSHNRMVK7gAsZQOY/VQvBAJaxQlSiVjUPDmJdwDiVGcxiviXxUuXFltTcCO4D/sd1HBX68GWIVK6/MIOP6lPcBAwbB5l04PbxKnDac9xzHSalaHaZ9RAmNwIBxhW/8AsWqdjTr+4jSzcZDGr+JjAumKqz4lwEVlrLho68iz/sFggmoCqor+Iu2gZb9RIrXjVMyXq4APEGm+SF6vTg+ZUG+0AiIjzKIY1BvcuYmK8LxCMrxqXFlkcv3L9wh1EbS78FjuaS0T/sMoFFwq41XzDVSw7gPc5UGaGs9pEbb3uG7/AIgNasioo2QkI6c11AoLsKHURSLgU81iG7Lo06xemCV4ruuPiJFfHhYGnNVNhxMZFlhdys3PaZy8ylOY2+Sa2nzMDG9wHJe4bixOO4pFmDcuFw3uVDEuEYuZe5a6lMvwIkqCnMfU+EfxDR4XudCCIECsM5qKbJyRdQmA3liLKWGfSuYbBRPcpTxiXadLBBSyqqmAOBwkJ2qORA0XvWgdYiD9UEi0V9PX3KJYurwVbr+obAMwVtOv5mqsq6FMsCyVc0eKpmRKDUrDZGq1Nfyi8QVE+YiwK9yxTbMAYVMNxZcwjSMXNZpKl58VElJ4q5i5ZUVsrFeAKwcQL1vmYal5YuqhrqcjKXJDJVffU6F/iN1Qy8sMNC/ZMjY2jDN564mJj3cxiiYXNssbucFGv9IqCRk0sbXvZNibD8ajWlVhNY2RluD8i6/s/cwJNkKneP8AsAEjGXDPPUsIbDC4HWZqPiMOo+AgxE1Kx8QMIy1fwxaQyIY1coKvfcyYzHKOOPIVs2zKBjxpEhDwkYFwMQUENxruOXfgVhBxiOT5iG49hFjEvNsyIWNJXzL7NRMLq6xKA0b/AHK3UKwERZojKPMJb+ZgUWWDlGWUbovWPklv4BR04hhPU5TEoL1kvjj/AH4lCoVNynJ+KfuXAdlt4vOorAN6zu6uo6LIpsoszv2QCsP7cwRJWIRxHcTBDcrqVfqFjTAvqWTDUdXHpLZTvMownEOItuJaoDK8jKmEZdeCF8Ym0W43cHMvuXiOCBM4gxEsP0lrv+YFaZ4jZz3ADEMiN/G5bMjWICYMmXEqbKqVyhRbpS4XJTWL/UrCyUhpXqOZMliindfNxbNAcjDWH9kKqmxQOd9y1Jkq3kjZg2PpVH8EMj0cczeFjgaTpLKiyz64iys1Kh8QW5INbmRKjuYgYwRNwZiF8y7r5g6iily/fhlxYxLjRPhEiRJRjx3HWepVRMUwD9eFnIwXVSsZI6swN2EpO5ehOxZMDpGN/wBQC4GKSUgsUrDhJXWa7l+LCuXD+buFcVFjgOf6WGvjkVxBMARa/wDYoVgXbvESAF70/wBf3EXEe7xcw6lITNe5VysypUqLUM+Duqj7+5i8NTca4lDdx2buYP8A4DYxoTKM7j4rUMxIs3EhqHMcZJdCc5iW/M0yRQdQFtuoWh2uN5rEF74m1fcuOpgr1uNrJZ0P4g2buUEGK5mIsvR1HvWLtjF9Q8pxWNB0/iN0Nofnv+IabAbirODd6Uuh/iHjU0W0/wBzDO20MfE3qFogF2EMxDcCBEtjDiVEe4wSWNpMOdQTj+40x+I1k/caluZyQeoaWIwyiweJUCVmbgYleoUzB4ErUtqVZljP4lbqVXNzeSJ/MGcI8lvxDjl+YAxCv5NUVAyH1Cyw+hC28QabLIbU7X1Dq1x+omccxWac5iWtR3cGxFC7OJoOMWcxeNeX2wcgpmz8QQ0u6Lh31MTiXlq4UZW7Bp6uAForuOFIKAcQgl5N/H/kO8yLP8T3HHEtXOJTHUsHib1KOdxBMsrsiXiCeo3Vz9yX9Yl6n+ICYblpiD34XcIeGMGIMzjxUS4CalPj4Z8l+4WrOpZwA/caoH+mCZFlq0qVIXjVsSiGjisMxZXSKGS/7g6nAaTJFYcD6l1mO4EKYK1BJTFOeZS9l5XKl9N4VHAG9/MBU1s9y6mWX8XHFBybcZ5Iq4hA5eH/AH9QoyQKbRpqwaXg7ipYVvMoBULwnH+4hVWC0pNS2fX6iNJSPaIvU+PgNaiuoLpJdO8ik0/MKLYfuep+Z/6Zg+D7ZQ4THqFeCHx4ZzMmJifzFmVKr7hHxnhiA26iJSnHqZK6hwg3h/8AZRbUJciaDLANUheCoUqRtVtFGo25K0UnfzLFNtNOoxSM8R0NIuFKGz/iA2CI5IGhwg8dRS8TZ2QJtrYe4A9gAqjmZA7GxlRw13CnXPPcYZGOGUOiXMCktb9MP/SUBu94ZmbzzmYTMQlEousyg3mFSjuV7Sv9EflPQyjwz1hUv1BOoJ1FOoJfgsYpFnSKEsq5tLxNIvcfUU/0jXtzcudo17dmULAN5dTLSUCjPxE6U6XWuiPA01Y3fH5jaagJVrv85lPBKg1XP0RgAFBM4g+6ab6ZiJHRtp6/3uCFsjRElKpA5U7gDegxBB+ZVsiNRpyJwzRhO7hWw4ahk8e5VXB1KYyp4IWGLeG4YNr7OSLjF5gq2U57m4sepcH3M34qfP8AMKmKmIjqOLReszEos5qguUgiP0mEiy75i8XB9wXuL7jDhHuCze5fUqa4l7n+I63G7wXEQW0XcHY09ShaWtpYyxtMcc/cAtqEz4gVybnQnT8P8QTwKyWZTCqATatLqVEpalvKnZ8cahhAVcd494lc5hBd1huvZ8yo0LrWF9QqeoWnqNMsyw6CGT333LCupimfUf7N9xM3uHEHMSJC423ebMRmTJyQkOmUBmDKzfqApnNSlFsAMMWDZlbqXd3D5lPccDv1hqBL8WYExQIqXm8ZjpgXFq2vvUz9OVVT8Jg+4CYxOcfWoSyQXiBwPhcH3FmXUQai2TJMMWamItwaK9Qp9xW3Fj7gNfbVaXmDUE+q9RjzZu3M0w0yvIc17ghSOOayxCNtY9v9XApDQb6OvevmC4Q1Gb/gq/5nAB+AQrW9X+JZckrXJ/pAGqlgrH/2YGS1ThzjjuOkRXNyoyZZgJQ/3FFupd002Q0Qbre5mVARuKWJxmWruArirjNVUhk+otexuBbckeTSIoFuGgaIq7293EVFjiV2HaCS5edxCZZepP1EZlK3M9g3MCvY5i7UGsNQGHSpSQi13D7mYqViKtzczWIlNMXESPzmVrmLGue4DtUq3hiodPohRlN6iwF4H0xLo7PghkPJsBwzBZIFDsNn4z3NFQeR1MRYn+hCdsVgqoVv3uEItChjHf5TqAVSSiOv9oYDMspSkurtM9wic7YcPEDY1KcW/iVVdM5IOZBy4eHU9lhTYjm+881VwEuIFtBqr1NieTRiK/SE2hsSk+JuHMCmUSy1U+GK5hGN0UwvZKqLa+5WKxvmA0YPEQOXsm0Iy7wfzF5e5bdP4iZupUabvczXjXcCZOfCmruDUVvcNI8vUHNy1YfzLXFlzccNRZZ6TN9yzm46oWuBzxuIcOwYD8j7hMRdnr/kQcg4tJCfg21S1sixoMWG/cIr7ZUxTDjcygmhlvS/tgCiRVF7r+WKwqKAO8LH6hSNGfZNHf8A7BRe2yUO774qAyQY2VDnpV8wJA3guwvk6Y1yeDgfJKoQoMCJhc3l5rrcRgqrpJhCK0rAZwfO41XTrHsOc6uZUDwGFsiXAKlHMqSrRiV45jlSQev1DO6jkxEAI0b/AFKVpc+oHMFeZb/hK9x9ifKFIh6jicXLi5lMGbhi3ifCFDzBzjGIuolyuIZfUS2YPMa0/wCscBJGkLof9/MZpWmb3/upgBoA+EPaKPTApKwLzw/qc7EqK4eolrWCxdxnAbFDs/nEQTs5kevqIBsRd3hv/v6hh0ug54OX9yoSKlv8McRlohsaWte+WUoonFG331CmL2Eyx8uoNVhxtezlqrKltGkXuBjnB+2JZ/prodh7qw4xLAuqh+4Re9xKBldihfBionCg4A9evqfAVWS6j5IPcMPL7hloTuWPEaTUwb/aXRjkqJTX7lv1cpW+4FcH7gHX5lGn9zNf5Snv9wU5Zb1C/cL9w1H4iHUo9yjuUYzCEc7+ILsgxllG2AVuIDCizmDMugvU9CpZYwfwmqKoTcHqizm7+P1GNSxgCrhDHYlnEKEJSsodMBJFFxReH7mo+OP7iKUAuWRvLKmKOYpHo9YlkcQ0KzR/v7gDocbGFJLuLsF2jBf0R+yAAxQZXbV1K7W5eRbr7/Uxiyq5J/33DdPiFgFrZ9yzr3nZBwdGYe0g1Bnyl2wPEl8gfEZXt0u33dVXMRUCktz9CWp9xdWl0UAHTDmUZvlA4VZ2S7yssRqC3qcCDeT8y+ivzLXoghpMGh+YOdfqN3og+0HOmA9Q9v7jhcabmQwxX1MMouU6qYx4S34jW5dNH3G6uZz1Lc3FGfzL+fpltWR1CDicNA3/AJmgVhw3GtVDfL1HUsriU7av1bGUsGPSv9+4zGdBndjqO1UvJwy8IbQAdjti/v3LKyyizRW7+JWNiWPxK0LcR6Oq+2EgUVUKC+39QpWgEVhhr+PxEGlVVr3crUWypc44g4l/YbefxT8whmH9PUGF3FYMXkCqlPklAy8jNfmMTBkh6FOP9uBi5rnYlJc2oE4Gq7z9Q3mW8fSsnuYA5XTG+9b/ABOdhbs4gg3Hi4riXuXe2OOY6wQ+GH0gJtl+4L3FvTcz8TiD7S8cwtq4x9SxxHDMW2J7YX3LXWaIHuAjuXiDhvxgDEqtShZoBh+e5SuaOtPUSl4suVoMjq7zAB0jdZHFncuIYWsz9yg4gBRObap/2vxAYC6NS3mnT33NJBcqhT/kWHJMKyDn7iEcyliF03/2CAiaKzitxG0OXBDuDglWOPp79TQbOQ2fcclglWMV999MECFhVcwOy+9/mbiRlrFzJw929VWWazqEAIKQ3R7jVQIs0alAolBiwex/U2aH0dSuS/kY+EcgjC2W8j6zSBD5ifnw+cPUuV5CGeA/EobCVrB45HBD5isXNy6NQzsqAjuPMtAzH/bi41j4iWsxxKkse6gVs7qotqLKwRSYvMuDm8HzBEqZGFt0DODAyD36hZzMtZ4+5RRtlf8Af9qVEgK5O8/nn3HjlXKHLQPpILZLTNw9ijLu4ok3WG5RwZSNQ7CCKYDWe6glrLSGxu/99TOweOs3+f8AELC7V/a8ENwgmxItgycMZAy56r+Pk9QosrQHH/kJTLyK1/cvWtCDR3HMtmOXg9jCtAIEyMAdQ29V38Rktpq4fQLM16l+osGIrUUWCTDE6lrzKXqU6/covB+5xkfzKvioHqVcdqirOpT4ldznOpZ1F9RllRQSoYxGZ4nfiJv17jK9DiDTIZ+pQhdQGXFlPzNowP8AEZsZKaeZVDbFcQp6LyTHeYC7y9QwC0U1MW2/LuNgFkbrWaY9Vqmw99/MNoY9pV9NMfQu6ekdj6gygGPR/wB/iXDs/AxpVMryvaHJQODCPfqXBqorMQhbFN+4boWBz9fxEopRdkL+GbMDkNc/UQYGxewz6rDKaZy4yYc+4SZkMquGgHDRsv4glC2qijXqWUu+nv8A9mJlzAhUCHg4xLiyyX7iZxD3/MrP/s0z6jPmc+oxajpLtZdf9jrMNZih8szbMLz8zCjntjeHuXRuZF7jkZkaQhQq44lzZWTdTdqLI9NYjXSBMPqUJp7iMYdMVv8Ae4GkUBeaZ9MCOKEDgveOoMTINOOc/UGPLsE5gKIz/EMhkXrUqrCOe0TDADF31EINi3cQ5paNwOvZ/ZBSFLIxl2PP+8QLqdZxxC2LB0bH1ErYBsl1AYChTWDVUnHxKVLHNlZckWcw/wDPUtQQSTS++/UphYlunFy5uyFCq5sl6lNuqXKf3BMuI9JbLVK8GviY3mNQSWdxfqDgqbS878upfj5xx4MxO9sRs7gV3mYH1KPFxwKh6VUC7e4Ws2lZczC1UKiuNS81iFRRvJ7RQ0dviWNk0bvrmMELjGiv6Y2pNt5/1gZSpgaSWO28Baufj5fUxDmygr91xC/Bq45kw0+v8xnN5KLeiQN4VSqb2cQMhWwf16ZxYBjtRmCgBlaxwQsFXwkQBx09Q5azxZIwAaLf9EzRGlehdYl+YbDZ7+8dy5UUUD/UxA1lsWbz9R0xDgcOo9wvWKv3AIXLz3MmDHFyiKL6gXDZ/EHl1F6JaPxPqDFviGS5U03WosIswg5g/MFqwkoQZic8wE4lYLuB7lyPUMm41AOEyTZrUK4fpqZecrRbgS2AcV1E+BiiMj+RmZ0YGP1DisTJBHV0v8MRWSaj36qKiWiPMR4bKGrwl6xmsAfh7fcoajRS5XUSktzvpjBgcHsZR7mLgaBS+EBEDorVYgSX9FH5iIrPRv3+IBprOSWm8FwlTTu8wA7D1ij56sjZYjpjsmtgzzC7I0lR79xYpjLs/ERbb3EAbNmJEC2gcOT2ckXY5q3CM9Tf0giwSr3C3USswU3FYL7ls0qDTub1ESEcyscQxiHuIZgZlBcbOphEgazOWOZmy3cBcsKDEsLhzLWuOUJWlFTFRuClUb3csD3XreGYM/DGQIqOJQDtL0/xEShjsEb4Zv1ubGE0Rz9a2cV/v8yhYgNoS8NsNy0U51MtrKcGo6MMvapoBdUy7UKgGqeaiuXhyOD1+4tMmGGAE7d8RzBY5jSzQ2Y0QgXjriEBxmU1S47lK8qmRrdILit5++JiOPVQdJewm4JRX4gC7ybI1RTiPcsCB4vwSllRJmZhvMDECV4rcS3JA7fMNtQlwgq8pnsK5lDv9RjEkOZTjBFcGYjVZZbhsXuPo/EYu1VkhBV/4jr0agpebDD3FVwN6jLNoLXOYA0pbsmNtubB/wAiuWUvBAiFZ4/xA5r6uIVLXk5gtBjGT6g4wRBvniAlvxGqmVCYqePcDrE0Ys7m454iMhStI3GDFV6jbN0pB0I4QacpivcDMMY8ECcQuZisubYM+CLLnw8V6lBiVxFXZCjbEg18QU3AnEGCE81GvG93BBTMtan5gltmTWe5YlHUYQ0N7lCrqwho1ukYdm2jEKN8NwGm5Tbd8SrXoz3Mkc/yNQNzIbqYkdM9MTdkNnTKsqFiPDiVLPc0rFREF7qA6BDZClJkqM4L7Is4FOX0y6eioVUgEYalC7JSQlzcSyc1MC5WMw+ZcF6ly4pcbzFvUsTKLC3nEVkCoe4X/iBZmVSH7lFHMPATZjc28SaEhajh3LInMtU0O5cVGGPPq8+LiiVmzmOfmYgacRi51z3FaFzUTm9wU6xCCsmpY2wwGk+yomn8z4Cc9y7tNXpnH6S8Xe44txLBc/1MTIcMxDrGL5ly19GaLua9y5/EX5lvSKtSmocxJf5lTNfEdhHPjHuESlEPnmGPMMc2wOoDcNFk23cSlM2UxGlaijPhbW1K7gyOcbgZa5i2Ooc/mKsjvcHHxFe9RgUuZ2KQN8iZxW05l3WK867mlchEEqYM7P4hjNfEXhMMy7111KL+fUr8PUS5fmCoqWG+PU5A+pkW64ihXHxNlNXqodqrASKcM7nPE52RaxBbj8zEaa4ircG/6jTndxU8HCDnyAhTN+Ax4YjCo2lBAHBA1EHP1AmeZdLCZgagVA/9eNN+45KiRM2MAG3dNTH/AMhoU7ioWWnWIC/E17Mqii8sq2WOOVTJvETLn1UFcpGqYzee5g0S62Rq4b/uDOOZY5YKjFwWqg3HUdyix3U9MGpfEouViVcfxK9XMDMMoNm6g5xMsyzUviEqOMBhYyswITYxpfUQlMKqk4HFQMkuM0ZJa5mIhHjPqDWJtiV9zhCVeHMoU4uoUfcoPniUUQzLyxp17i3Zn6larNzkzBS83OVv8ks6M/MxW1xw6Sh3/EC4lL6gL3j3KUUw7ysYmPUGDwg8McFS8mYtVHAqFdxfdS65m8SswYMAEMs5uIQhq7lWGUvMUiLFmWJZpDG6htIiou0JwCDdXMHMFCX65lLMVBqVZc0hvmVZpgLwzDYQV3FaMzevzCziLRiFuP1G5xnjEMF75xOdyn5hkhibOJdYqASL/teNRYZVF/mL6jpxHB6jmuJRZTL9QZct5YJWYucTWXBixmLUvmcGbE08KMviDXqUiO4pmYYuUMOOov7lhJ+40OJzvZ3LZSkur9QGyLY+eZQr0nK/zjrRlumYD4g9bxAViapY6gnqeyY7m03AO84hoIag8S7xPuVzzOI/+wjWOI4cF/EsyaYDjXHi6JZBuscwIDmG9wqGooEbTFal1rmGwzYi0gpncciaRb11LDE4EnwIrbqFG5dA1BM4jaaii6zzFPMv8zpjSbizUEzjMEqLpLb+oNUcxU531LIaSDjMHOJdmIvcwXFzXqOyXfxLzL8bWka2ETEYHv3N5El7l44mINMsLhDuFSx7hnmA1LyzbMa3N7TM7Zyf5m0eopUEhCsxK0lShsFMaO6hnLUW4BUFFBuo/cLZ6jg0xNRIrZZK3icr+o2ROUTio0bZki+pzUHF+5S69x9S4uZeJeNcy8PcaeDaLxcac7l719RRxD5r1De5aDZBhhCBgmpeYjiZCaMF4GUxKlzHUcxcuC0/uO1bqFdzSy8cvmKqia/7mTjXuY3TLBuftLa+YLW6ipzMrnVQ6dYmk5l4bIB4ZTOP1O+LYJ9xUfMsbm2uI5RckGj2MafmXas3xqYZm9xq8xdX3mXS6g3uPZYNy816nUWE4l4hCZi0EXhzFX9ziQi7YagxC4bZSalgO5vHqGCziAt7jD6WLWoUxMiK5gt+oViCDiWcb7mH5xHHOIUsAe73OczJn7JbNzkGPG46sYt/mKiEbqKx8OnRFSvvEcy84+o78QcsX+YufmMCi3H3P//Z',
  sad: 'data:image/jpeg;base64,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',
};

// patch168：每张背景在 720×900 裁切后的**分带亮度**（每 50px 一条），
// 用来决定文字用深色还是浅色（对比度不足就反转），避免压在相近色上看不清。
const CARD_LUM = {"normal":[0.954,0.951,0.942,0.926,0.904,0.876,0.861,0.847,0.844,0.844,0.864,0.884,0.893,0.931,0.952,0.957,0.953,0.957],"xian":[0.872,0.88,0.885,0.888,0.879,0.87,0.854,0.84,0.846,0.844,0.838,0.829,0.821,0.807,0.79,0.753,0.759,0.808],"sad":[0.802,0.802,0.796,0.802,0.82,0.831,0.833,0.843,0.849,0.8,0.766,0.716,0.702,0.711,0.62,0.629,0.609,0.563]};
const CARD_BAND = 50;
function _hexLum(c) {
  var s = String(c || '').replace('#', '');
  if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
  if (s.length < 6) return 0.5;
  var r = parseInt(s.slice(0, 2), 16) / 255, g = parseInt(s.slice(2, 4), 16) / 255, b = parseInt(s.slice(4, 6), 16) / 255;
  if (isNaN(r) || isNaN(g) || isNaN(b)) return 0.5;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function shareCardSvg(state, ending, opts) {
  /* patch84：分享卡重设计为 **720×900（4:5）一屏版**。
     原来是 680×1198 的长条（塞 3 段正文 + 8 条大事 + 标签），手机上要滚。
     现在固定比例、内容精简，一屏能看完。 */
  var o = opts || {};
  var url = o.url || SHARE_URL;
  var e = ending || {};
  var W = 720, H = 900;                 // 4:5 竖图（手机上能完整显示）
  var PAD = 34, INNER = 12;
  var TEXT_X = PAD + INNER + 20;        // 66
  var TEXT_W = W - TEXT_X * 2;          // 588
  var SERIF = 'Songti SC,SimSun,Noto Serif SC,Georgia,serif';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function wrap(text, fs, maxW) {
    var out = [], cur = '', width = 0;
    var chars = String(text == null ? '' : text).split('');
    for (var i = 0; i < chars.length; i++) {
      var ch = chars[i];
      var w = /[\x00-\xff]/.test(ch) ? fs * 0.55 : fs;
      if (width + w > maxW && cur) { out.push(cur); cur = ''; width = 0; }
      cur += ch; width += w;
    }
    if (cur) out.push(cur);
    return out.length ? out : [''];
  }
  function txt(x, y, fs, fill, anchor, extra, content, forceFill) {
    // patch168：**按背景亮度自适应文字色**
    //   · 取该行所在的亮度带；文字色与背景亮度差 < 0.42 就判定「看不清」→ 反转（深↔浅）
    //   · 无论深浅，都加一层与文字反色的描边（paint-order="stroke"，描边压在字底下），
    //     保证压在花枝、山影这类细节上也清楚
    // patch170：**forceFill=true 时不反转**（评语固定紫色，玩家明确要求）
    var _bands = CARD_LUM[bgKey] || [];
    var _bi = Math.min(_bands.length - 1, Math.max(0, Math.floor(y / CARD_BAND)));
    var _L = (_bands[_bi] != null) ? _bands[_bi] : 0.9;
    var _useFill = fill;
    if (!forceFill && Math.abs(_hexLum(fill) - _L) < 0.42) {
      _useFill = (_L > 0.55) ? '#2b2620' : '#fdfaf2';
    }
    var _stroke = (_hexLum(_useFill) < 0.5) ? 'rgba(255,253,247,0.88)' : 'rgba(26,22,16,0.62)';
    var _sw = Math.max(1.8, fs * 0.14);
    return '<text x="' + x + '" y="' + y.toFixed(1) + '" text-anchor="' + anchor + '"' +
      ' font-family="' + SERIF + '" font-size="' + fs + '" fill="' + _useFill + '"' +
      ' stroke="' + _stroke + '" stroke-width="' + _sw.toFixed(2) + '" paint-order="stroke"' +
      (extra ? ' ' + extra : '') + '>' + esc(content) + '</text>';
  }

  var name = e.name || '某人';
  var styleName = e.styleName || '—';
  var years = e.yearsLived || 0;
  var blurb = String(e.styleBlurb || (e.paras && e.paras[0]) || '');
  // patch99：判断这条人生是修仙线还是凡人线
  var isXian = !!(state && state.flags && state.flags.xianxia);

  var p = [];
  p.push('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">');
  // patch167：**按结局类型换背景**（长宽比、文字内容、布局都不动）
  var bgKey = 'normal';
  if (e.feisheng) bgKey = 'xian';
  else if (isXian) bgKey = 'sad';
  else if (e.earlyEnd) bgKey = 'sad';
  else if (/意外|事故|横死|夭折/.test(String(e.cause || ''))) bgKey = 'sad';
  var bgUrl = CARD_BG[bgKey] || CARD_BG.normal;
  // patch168：**背景不透明、铺满整张卡**；除了文字和二维码，其余框、底色、书脊、遮罩全部去掉
  p.push('<image x="0" y="0" width="' + W + '" height="' + H + '" preserveAspectRatio="xMidYMid slice" href="' + bgUrl + '" xlink:href="' + bgUrl + '"/>');

  var y = 92;
  // ① 眉题
  p.push(txt(W / 2, y, 12, '#a89a86', 'middle', 'letter-spacing="5"', 'LIFE WEATHER · 人生模拟器'));
  y += 44;
  // ② 书名
  p.push(txt(W / 2, y, 34, '#2b2620', 'middle', 'font-weight="600" letter-spacing="3"', name + '的一生'));
  y += 32;
  // ③ 享年 · 结局
  // patch164：飞升不是死亡
  p.push(txt(W / 2, y, 15, '#7a7062', 'middle', 'letter-spacing="1"', (e.feisheng ? '飞升于 ' : '享年 ') + years + ' 岁 · ' + styleName));
  y += 22;
  // ④ patch168：分隔线已删（背景图上的线条会破坏画面）
  y += 30;

  // ⑤ 一句评语（最多 2 行，超出截断）
  if (blurb) {
    var bl = wrap(blurb, 16, TEXT_W).slice(0, 2);
    for (var bi = 0; bi < bl.length; bi++) {
      // patch170：评语固定紫色（第 8 个参数 forceFill=true，跳过背景反转）
      p.push(txt(W / 2, y, 16, '#8d6fa8', 'middle', null, bl[bi], true));
      y += 26;
    }
    y += 8;
  }

  // ⑥ 五维数据（一行）
  var attrs = (e.finalAttrs || []).slice(0, 5).map(function (a) {
    var mv = (typeof moneyText === 'function') ? moneyText(a.value) : String(a.value);
    return a.name + ' ' + (a.name === '金钱' ? '￥' + mv : a.value);
  }).join('　');
  if (attrs) {
    p.push(txt(W / 2, y, 13, '#463f36', 'middle', 'letter-spacing="0.5"', attrs));
    y += 30;
  }

  // ⑦ 大事（只留 3 条）
  // patch99：**大事按人生轨道分流**——修仙者不该在分享卡上写「高考冲刺」「买房上车」。
  var bigRe = isXian
    ? /入道|灵根|突破|练气|筑基|金丹|元婴|化神|炼虚|合体|大乘|渡劫|飞升|闭关|天劫|走火/
    : /高考|中考|退休|结婚|生子|考上|毕业|第一份|买房|买car|生病|天灾|亲人|父母|孩子|离别/;
  var journal = (state && state.journal) || [];
  var bigs = [];
  for (var ji = 0; ji < journal.length; ji++) {
    var jj = journal[ji];
    if (jj.kind === 'special') continue;
    var ttl = String(jj.eventTitle || jj.title || '');
    if (bigRe.test(ttl)) bigs.push(jj);
  }
  // 取「最有代表性」的 3 条：均匀取样，避免全是同一时期
  if (bigs.length > 3) {
    var pick = [];
    var step = (bigs.length - 1) / 2;
    for (var pi = 0; pi < 3; pi++) pick.push(bigs[Math.round(pi * step)]);
    bigs = pick;
  }
  if (bigs.length) {
    p.push(txt(TEXT_X, y, 13, '#a89a86', 'start', 'letter-spacing="2"', '这一生的大事'));
    y += 30;
    for (var bi2 = 0; bi2 < bigs.length; bi2++) {
      var s = bigs[bi2].age + ' 岁　' + String(bigs[bi2].eventTitle || bigs[bi2].title || '');
      if (bigs[bi2].choiceText) s += '　→ ' + bigs[bi2].choiceText;
      var one = wrap(s, 14, TEXT_W)[0] || '';
      if (one.length < s.length) one = one.slice(0, Math.max(0, one.length - 1)) + '…';
      p.push(txt(TEXT_X, y, 14, '#5c5347', 'start', null, one));
      y += 28;
    }
    y += 6;
  }

  // ⑧ 页脚：二维码（居中）+ 扫码/署名（下方一行）
  var QR_END = 786;                       // 白底底部固定位置
  var qrSize = 280;
  var qrUnit = 8;                         // 每模块 8px（33 模块 → 264；45 模块 → 360 太高，用 6）
  var qr = null, qrUrl = String(url).split('?')[0];
  try { qr = qrEncode(qrUrl, 'M'); } catch (e2) { qr = null; }
  if (qr) {
    qrUnit = Math.max(4, Math.floor(qrSize / qr.size));
    var qrBox = qrUnit * qr.size;
    var QUIET = Math.round(4 * qrUnit);   // 4 码元静区
    var boxW = qrBox + QUIET * 2;
    var boxX = (W - boxW) / 2;
    var boxY = QR_END - boxW;
    var qx = boxX + QUIET, qy = boxY + QUIET;
    // patch169：不再画白色底。改为按二维码所在区域的背景亮度自动选色——
    // 背景亮就用深墨模块，背景暗就用米白模块，保证去掉白底后仍有对比。
    var _qrBands = CARD_LUM[bgKey] || [];
    var _qb0 = Math.max(0, Math.floor(boxY / CARD_BAND));
    var _qb1 = Math.min(_qrBands.length - 1, Math.floor((boxY + boxW) / CARD_BAND));
    var _qrL = 0, _qrN = 0;
    for (var _qi = _qb0; _qi <= _qb1; _qi++) { _qrL += (_qrBands[_qi] != null ? _qrBands[_qi] : 0.9); _qrN++; }
    _qrL = _qrL / Math.max(1, _qrN);
    var _qrFill = (_qrL > 0.58) ? '#2b2620' : '#fdfaf2';
    for (var r = 0; r < qr.size; r++) for (var c = 0; c < qr.size; c++) {
      if (!qr.matrix[r][c]) continue;
      p.push('<rect x="' + (qx + c * qrUnit) + '" y="' + (qy + r * qrUnit) + '" width="' + qrUnit + '" height="' + qrUnit + '" fill="' + _qrFill + '"/>');
    }
  }
  // 署名三行（固定贴近书框底部）
  p.push(txt(W / 2, H - 96, 13, '#7a7062', 'middle', 'letter-spacing="3"', '扫码来玩'));
  p.push(txt(W / 2, H - 68, 15, '#2b2620', 'middle', null, (typeof SHARE_AUTHOR !== 'undefined' ? SHARE_AUTHOR : '')));
  p.push(txt(W / 2, H - 46, 11, '#a89a86', 'middle', 'letter-spacing="1"', (typeof SHARE_AUTHOR_EXTRA !== 'undefined' ? SHARE_AUTHOR_EXTRA : '')));

  p.push('</svg>');
  return p.join('');
}
// 供测试用（注入 bundle 时这行会被去掉）

/* ================= 现实节点事件（patch29） =================
   玩家说「补齐现实节点事件」。这一批补的是普通人生里绕不开的几件事：
   房子、车子、孩子上学、失业再就业、父母同住、体检异常、副业、职称、创业、
   养宠物、搬家、孩子叛逆、孙辈、老屋。
   设计：每件都带后续影响（flags / perks），不只是当场加减数值。 */
const REAL_LIFE_EVENTS = [
  { id:'rl_house', cat:'life', weight:14, minAge:26, maxAge:48,
    cond:(s)=>!s.flags.hasHouse && s.attrs.money>=225000,   // patch141：门槛=扣款×1.5
    title:'要不要买房', text:'首付凑得出，但接下来二三十年每月都要还。签下名字那一刻手会抖。',
    choices:[
      { text:'买', hint:'有根，也有压力', run:()=>({ deltas:{ money:-150000, mood:14, health:-4 }, flags:{ hasHouse:true, mortgage:true },
        lines:['你签了三十年的贷款','那天晚上你在空房子里坐到很晚'] }) },
      { text:'再等等', hint:'钱留着，心里悬着', run:({ rng })=> rng.chance(0.5)
        ? { deltas:{ mood:-6, money:12000 }, lines:['你决定再观望一年','后来房价确实松动了一点'] }
        : { deltas:{ mood:-10 }, flags:{ missedHouse:true }, lines:['你等了几年','等到的时候，首付又不够了'] } },
    ] },
  { id:'rl_car', cat:'life', weight:12, minAge:24, maxAge:55,
    cond:(s)=>!s.flags.hasCar && s.attrs.money>=90000,     // patch141：门槛=扣款×1.5
    title:'买第一辆车', text:'不算贵，但要养。保险、油费、停车位，每月都在提醒你它的存在。',
    choices:[
      { text:'买', hint:'方便，也花钱', run:()=>({ deltas:{ money:-60000, mood:12, health:2 }, flags:{ hasCar:true },
        lines:['提车那天你绕着小区开了三圈','第一次自己开车回家，心里很踏实'] }) },
      { text:'继续坐地铁', hint:'省下的钱能办事', run:()=>({ deltas:{ money:15000, health:-2, mood:-2 },
        lines:['你把钱留着','早高峰还是那样挤'] }) },
    ] },
  // patch141：**补上金钱门槛**——原来只要 hasChild 就触发，扣 12 万，直接把有娃家庭打成负资产
  { id:'rl_kid_school', cat:'life', weight:13, minAge:32, maxAge:50,
    cond:(s)=>!!s.flags.hasChild && (s.attrs.money||0) >= 180000,
    title:'孩子上学', text:'学区、择校、接送。你忽然发现自己开始研究以前从不关心的政策。',
    choices:[
      { text:'砸钱进好学区', hint:'起跑线要紧', run:()=>({ deltas:{ money:-120000, mood:-4 }, flags:{ goodSchool:true },
        lines:['你们换了房子，搬到了学校旁边','孩子第一天背着新书包出门，你在窗口看了很久'] }) },
      { text:'就近入学，把日子过稳', hint:'孩子轻松些', run:()=>({ deltas:{ mood:8, relations:6 }, lines:['你们没折腾','孩子每天自己走十分钟就到学校'] }) },
    ] },
  { id:'rl_layoff_self', cat:'work', weight:14, minAge:28, maxAge:55,
    cond:(s)=>!!s.flags.employed,
    title:'轮到你了', text:'HR 约你到会议室，桌上放着一份文件。你早就听说这次规模不小。',
    choices:[
      { text:'要足补偿，再慢慢找', hint:'保钱，但有空窗', run:()=>({ deltas:{ money:90000, mood:-12, health:-3 }, flags:{ laidOffOnce:true, employed:false },
        lines:['你算清楚了每一分该拿的','走出大楼时是下午三点，太阳很好'] }) },
      { text:'接受调岗，先待着', hint:'保住饭碗，咽下委屈', run:()=>({ deltas:{ mood:-10, relations:-4, skill:3 }, lines:['你去了一个没人愿意去的岗位','每天上班像在还债'] }) },
    ] },
  { id:'rl_parents_move_in', cat:'life', weight:11, minAge:35, maxAge:60,
    cond:(s)=>!!s.flags.married || s.attrs.relations>=40,
    title:'父母要不要搬来一起住', text:'他们年纪大了，一个人在老家你不放心；可住一起是什么样，你也想得到。',
    choices:[
      { text:'接来同住', hint:'照顾方便，摩擦也多', run:()=>({ deltas:{ mood:6, relations:8, health:-4 }, bonds:{ family:16 }, flags:{ parentsLiveIn:true },
        lines:['他们把老家的东西搬了一半过来','屋子小了，热闹了'] }) },
      { text:'留在老家，多跑几趟', hint:'各自安生', run:()=>({ deltas:{ money:-30000, mood:-3, relations:4 }, bonds:{ family:6 },
        lines:['你开始每两个月回去一次','每次走的时候，他们都在楼下站很久'] }) },
    ] },
  { id:'rl_health_warning', cat:'health', weight:13, minAge:38, maxAge:70,
    cond:(s)=>s.attrs.health<60,
    title:'体检报告上的箭头', text:'几项指标后面画了向上的箭头。医生说：先改变生活方式，三个月后复查。',
    choices:[
      { text:'认真改', hint:'慢，但有效', run:()=>({ deltas:{ health:14, mood:6, money:-5000, relations:-3 }, flags:{ healthFixed:true },
        lines:['你把酒戒了，开始每天走一万步','三个月后复查，箭头少了一半'] }) },
      { text:'先忙完这段', hint:'大多数人这么选', run:()=>({ deltas:{ health:-10, mood:-4 }, flags:{ ignoredWarning:true },
        lines:['你把报告放进抽屉','再想起来已经是两年后'] }) },
    ] },
  { id:'rl_side_biz', cat:'work', weight:12, minAge:28, maxAge:55,
    cond:(s)=>!!s.flags.employed && s.attrs.skill>=50,
    title:'要不要做点副业', text:'你手上有点别人需要的手艺。周末的时间换钱，值不值？',
    choices:[
      { text:'试着接单', hint:'钱多一点，休息少一点', run:({ rng })=> rng.chance(0.6)
        ? { deltas:{ money:45000, skill:6, health:-6, mood:4 }, flags:{ sideBiz:true }, lines:['第一年接了不少单','你发现自己其实挺喜欢做这个'] }
        : { deltas:{ money:8000, health:-8, mood:-6 }, lines:['接了几单就累了','周末不再属于自己'] } },
      { text:'不折腾，把主业做好', hint:'专注', run:()=>({ deltas:{ skill:8, mood:4, relations:2 }, lines:['你把精力都放在本职上','年底评价不错'] }) },
    ] },
  { id:'rl_title', cat:'work', weight:13, minAge:32, maxAge:58,
    cond:(s)=>!!s.flags.employed && s.attrs.skill>=65,
    title:'评职称 / 晋升名额', text:'名额只有一个，符合条件的有三个。你知道除了材料，还得看别的。',
    choices:[
      { text:'把材料做到最好', hint:'只靠本事', run:({ rng })=> rng.chance(0.55)
        ? { deltas:{ money:30000, mood:14, skill:5 }, flags:{ promoted:true }, lines:['你评上了','掌声里你想起熬的那些夜'] }
        : { deltas:{ mood:-10, skill:4 }, lines:['名额给了别人','你安慰自己：材料还留着'] } },
      { text:'该走动走动', hint:'现实一点', run:()=>({ deltas:{ money:-20000, relations:10, mood:6 }, flags:{ promoted:true },
        lines:['你请人吃了两顿饭','事情办成了，心里有点不是滋味'] }) },
    ] },
  { id:'rl_startup', cat:'work', weight:10, minAge:30, maxAge:48,
    cond:(s)=>!!s.flags.employed && s.attrs.money>=200000,
    title:'有人拉你一起干', text:'老同事说有个方向，差一个懂行的人。要你出一部分钱，也要你辞职。',
    choices:[
      { text:'下场', hint:'要么翻身，要么归零', run:({ rng })=> rng.chance(0.38)
        ? { deltas:{ money:400000, mood:18, health:-10, skill:12 }, flags:{ selfEmployed:true, employed:false }, lines:['第二年就开始回本','你终于有了一件完全属于自己的事'] }
        : { deltas:{ money:-180000, mood:-20, health:-10 }, flags:{ selfFailed:true, employed:false }, lines:['撑了两年，还是关了','收拾工位那天你一个人待到很晚'] } },
      { text:'不入股，帮他看看', hint:'帮个人情', run:()=>({ deltas:{ money:10000, relations:10, skill:4 }, lines:['你帮他把方案理了一遍','后来他们成了','你也有点庆幸'] }) },
    ] },
  { id:'rl_pet', cat:'life', weight:11, minAge:26, maxAge:75,
    cond:(s)=>!s.flags.hasPet,
    title:'要不要养只猫', text:'朋友家的猫生了一窝，问你要不要。养了就是十几年的事。',
    choices:[
      { text:'养', hint:'多了个家人', run:()=>({ deltas:{ mood:16, money:-8000, health:3 }, bonds:{ pet:30 }, flags:{ hasPet:true },
        lines:['它第一天躲在沙发底下不出来','第三天就睡在你枕头边了'] }) },
      { text:'算了，怕照顾不好', hint:'不添牵挂', run:()=>({ deltas:{ mood:-2 }, lines:['你摸了摸它，还是走了','后来偶尔会想起那一窝小猫'] }) },
    ] },
  { id:'rl_move_after_breakup', cat:'life', weight:11, minAge:24, maxAge:45,
    cond:(s)=>!!s.flags.brokeUp,
    title:'搬离那个房子', text:'房租快到期了。这个房子你们一起住过，到处都是痕迹。',
    choices:[
      { text:'搬走，换个区', hint:'重新开始', run:()=>({ deltas:{ money:-15000, mood:10, relations:-4 }, flags:{ movedCity:true },
        lines:['新房子很小，但很干净','你把旧东西扔掉了一多半'] }) },
      { text:'留下来', hint:'舍不得，也怕麻烦', run:()=>({ deltas:{ mood:-8, money:8000 }, lines:['你续了约','有几个月，你还是会下意识买两份菜'] }) },
    ] },
  { id:'rl_kid_rebel', cat:'life', weight:12, minAge:40, maxAge:58,
    cond:(s)=>!!s.flags.hasChild,
    title:'孩子不跟你说话了', text:'房门一关就是一整天。你想说点什么，又怕说错。',
    choices:[
      { text:'先不逼，等他自己开口', hint:'忍着', run:({ rng })=> rng.chance(0.6)
        ? { deltas:{ mood:10, relations:8 }, bonds:{ child:16 }, lines:['过了两个月，他主动敲了你的门','他说：其实我一直想跟你说'] }
        : { deltas:{ mood:-8, relations:-4 }, bonds:{ child:-6 }, lines:['这一等就是好几年','后来他上了大学，很少回来'] } },
      { text:'硬碰一次，把话说清', hint:'可能吵翻，也可能说开', run:({ rng })=> rng.chance(0.45)
        ? { deltas:{ mood:12, relations:10 }, bonds:{ child:14 }, lines:['你们吵了一架，然后都哭了','那天之后他反而愿意说了'] }
        : { deltas:{ mood:-14, relations:-8 }, bonds:{ child:-14 }, lines:['他说你根本不懂','之后半年没叫过你'] } },
    ] },
  { id:'rl_grandkid', cat:'life', weight:12, minAge:52, maxAge:78,
    cond:(s)=>!!s.bonds.child && s.bonds.child>=50 && s.age>=52,
    title:'要当爷爷奶奶了', text:'孩子打电话来，声音里带着点紧张。你愣了两秒才反应过来。',
    choices:[
      { text:'去帮忙带', hint:'累，但亲', run:()=>({ deltas:{ health:-8, mood:20, relations:10 }, bonds:{ child:14, family:14 }, flags:{ helpingGrandkid:true },
        lines:['你学会了冲奶粉和换尿布','孩子睡在你怀里的时候，你想起很多年前'] }) },
      { text:'出钱请人带，自己常去看', hint:'保住自己的日子', run:()=>({ deltas:{ money:-60000, mood:12, relations:6 }, bonds:{ child:10 },
        lines:['你每月打钱过去','每次去都带一大包东西'] }) },
    ] },
  { id:'rl_old_house', cat:'life', weight:11, minAge:60, maxAge:85,
    cond:(s)=>!!s.flags.hasHouse,
    title:'老房子要不要卖', text:'房子旧了，修起来费钱。孩子劝你换个小点的、电梯房。',
    choices:[
      { text:'卖掉换小的', hint:'钱多出来，地方小了', run:()=>({ deltas:{ money:200000, mood:6, relations:-2 }, flags:{ oldHouseSold:true },
        lines:['搬家那天你最后一个走','在门口站了很久，才把钥匙交出去'] }) },
      { text:'不卖，住惯了', hint:'舍不得', run:()=>({ deltas:{ money:-30000, health:2, mood:8 }, lines:['你请人把漏雨的地方修了','邻居还是那些邻居'] }) },
    ] },
];
EVENTS.push(...REAL_LIFE_EVENTS);
/* ===== patch93：入道事件（大学期间的老先生 + 入道抉择） ===== */
const XIAN_ENTRY_EVENTS = [
  {
    // patch94：cat 从 life 改 classical（避免和普通生活事件撞类别），
    // 年龄窗收到 18-20（"大学期间"更聚焦，也减少对候选位的挤占）
    id: 'meet_old_man', cat: 'classical', weight: 99, minAge: 18, maxAge: 20, force: true,
    // 大学期间强制出现，但不影响高考（高考在 18 岁那年，这个在之后）
    // patch157：测完灵根要给一次反悔的机会，所以这里只记 spiritRootSeen，不直接入道
    cond: (s) => !s.flags.xianxia && !s.flags.spiritRootSeen && !s.flags.refusedXian,
    title: '图书馆的老先生',
    text: '古籍区最里排。你蹲下来找一本书，旁边也有个老头在翻——一本没有书名的线装册子。他抬头看你一眼，笑了笑：「你这手相……有点意思。想听真话吗？」',
    choices: [
      // patch97：按玩家要求，拜师**直接抛弃凡尘**（不再有「再想想」那一步）
      { text: '想听', run: ({ rng, draft }) => {
          // patch100：拜师时补上「测灵根」——这是修仙线的关键一眼
          const root = rollSpiritRoot(rng, draft);
          // patch111：体质是**独立**的一件事，和灵根可以同时出现
          const body = rollConstitution(rng, draft);
          const bodyLine = body ? `他还多看了你一眼：「……${body.name}。这可不是灵根能解释的。」` : null;
          return {
            // patch157：**先不入道**，只记下测出的灵根/体质，等老先生再问一次
            flags: { spiritRootSeen: true, spiritRoot: root.id, constitution: body ? body.id : null },
            deltas: { mood: 3 },
            lines: [
              '他说了三件事。当时你觉得是玩笑，后来有两件都应验了。',
              `他捏住你的手腕，闭目良久：「${root.name}。${root.desc}」`,
            ].concat(bodyLine ? [bodyLine] : []),
            special: {
              title: `灵根测试 · ${root.name}${body ? ' · ' + body.name : ''}`,
              text: `${root.desc}。${root.flavor}` + (body ? `\n\n【体质】${body.name}：${body.desc}` : ''),
            },
          };
        } },
      { text: '不了，我还有论文', run: () => ({ lines: ['他点点头，继续低头翻书。你走的时候，那本书还在他手里。'] }) },
    ],
  },

  /* patch157：**测完灵根之后的第二次选择**——可以真正放弃修仙路 */
  {
    id: 'xian_confirm', cat: 'classical', weight: 99, minAge: 18, maxAge: 24, force: true,
    cond: (s) => !!s.flags.spiritRootSeen && !s.flags.xianxia && !s.flags.refusedXian,
    title: '要不要跟我走',
    text: '老先生合上那本线装册子，把测灵石收进袖子里：「灵根这东西，一辈子只测一次。你想清楚了——跟不跟我走，是你自己的事。」',
    choices: [
      { text: '好，我跟你走', hint: '此后与凡尘两清', run: () => ({
          flags: { xianxia: true, abandonedMortal: true },
          deltas: { mood: 4 },
          lines: ['你跟着他走出图书馆，再没有回头', '很多年后你才明白，那一眼就是一生'],
          special: { title: '入道', text: '你抛弃了原本那条路。从此别人的一生是几十年，你的计量单位是「劫」。' } }) },
      { text: '不了，凡人也有凡人的活法', hint: '把灵根留在身上，路走自己的', run: () => ({
          flags: { refusedXian: true },
          deltas: { mood: 6, skill: 3, relations: 4 },
          lines: ['他点点头，没有劝你', '「也好。灵根是天赋，不是命。」', '你走出图书馆的时候，外面正好是晴天'],
          special: { title: '放弃仙途', text: '你带着一份没人知道的灵根，去走那条普通人的路。' } }) },
    ],
  },
];
EVENTS.push(...XIAN_ENTRY_EVENTS);
/* ===== patch97：修仙专属事件（抛弃凡尘之后的人生内容） ===== */
/* 这些事件**不依赖** employed / married / hasChild，是纯粹的修仙者日常。
   重点覆盖「赚钱」——修仙也要资源：灵石、丹药、法器、坊市。
   还有「尘缘」——凡人亲人的衰老与离去，是这条线的重量所在。 */
const XIAN_LIFE_EVENTS = [
  { id:'xs_spirit_stone', cat:'xian', weight:14, minAge:25, maxAge:2000,
    cond:(s)=>!!s.flags.xianxia,
    title:'发现灵石矿脉', text:'你在山里打坐时，察觉到地底有微弱的灵气波动。挖下去，是一条没被人发现过的灵石矿脉。',
    choices:[
      { text:'全部带走', run:()=>({ deltas:{ money:180000, mood:4, skill:2 }, lines:['你花了三个月把矿脉采空。下山的路上，你第一次觉得修行也是要花钱的。'] }) },
      { text:'留一半给后来的修士', run:()=>({ deltas:{ money:90000, mood:9 }, lines:['你只取了一半。多年后听说，有个人靠这半条矿脉活下来了。'] }) },
    ] },
  { id:'xs_market_trade', cat:'xian', weight:13, minAge:22, maxAge:3000,
    cond:(s)=>!!s.flags.xianxia,
    title:'坊市', text:'山下的坊市每十年开一次。你在摊子间走，用些小东西换了灵石。',
    choices:[
      { text:'老实做买卖', run:()=>({ deltas:{ money:60000 }, lines:['银子放进了储物袋，你没数。对修士来说，这东西越来越只是数字了。'] }) },
      { text:'替人出手，赚一笔大的', run:()=>({ deltas:{ money:150000, health:-4, mood:-2 }, lines:['你替人解决了一桩麻烦事。钱来得快，因果也重。'] }) },
    ] },
  { id:'xs_auction', cat:'xian', weight:11, minAge:35, maxAge:5000,
    cond:(s)=>!!s.flags.xianxia && s.attrs.money>=200000,
    title:'拍卖会', text:'百年一次的拍卖会。台上的东西一件比一件贵，你带的灵石开始不够看了。',
    choices:[
      { text:'拍下一件', run:()=>({ deltas:{ money:-200000, skill:6, mood:5 }, lines:['你拍下一件法器。回到洞府才发现，它比你想的有用。'] }) },
      { text:'只是看看', run:()=>({ deltas:{ mood:2 }, lines:['你在角落里看了一整天。有些东西看过，也算是见识。'] }) },
    ] },
  { id:'xs_herb_field', cat:'xian', weight:12, minAge:28, maxAge:4000,
    cond:(s)=>!!s.flags.xianxia,
    title:'灵田', text:'你在洞府旁辟了一块灵田，种下几株不知名的草。',
    choices:[
      { text:'精心照料', run:()=>({ deltas:{ money:80000, skill:4, mood:4 }, lines:['几百年后，这几株草长成了一小片灵田。'] }) },
      { text:'任由它长', run:()=>({ deltas:{ money:30000, mood:2 }, lines:['你没怎么管它。它自己活得挺好，还结了不少种子。'] }) },
    ] },
  { id:'xs_poor_years', cat:'xian', weight:10, minAge:25, maxAge:2000,
    cond:(s)=>!!s.flags.xianxia && s.attrs.money<50000,
    title:'清贫岁月', text:'灵石用完了。你把最后的丹药也吃了，只剩一身破道袍和一部翻烂的经书。',
    choices:[
      { text:'继续闭关，不管这些', run:()=>({ deltas:{ mood:-6, skill:7, health:-5 }, lines:['你饿了几百年。修为涨了，人瘦得像是随时会散。'] }) },
      { text:'下山换些灵石', run:()=>({ deltas:{ money:70000, mood:3 }, lines:['你下山替人解决了几件怪事。修行人也不能完全不顾世俗。'] }) },
    ] },
  { id:'xs_cave', cat:'xian', weight:12, minAge:30, maxAge:3000,
    cond:(s)=>!!s.flags.xianxia && s.attrs.money>=200000,
    title:'洞府', text:'你找到一处灵气充沛的山洞。要在这里长住，得先把里面收拾出来。',
    choices:[
      { text:'花大价钱布置', run:()=>({ deltas:{ money:-200000, skill:8, health:6 }, lines:['聚灵阵、静心室、藏书阁。你在山上安了一个几千年的家。'] }) },
      { text:'简单将就', run:()=>({ deltas:{ money:-30000, skill:2 }, lines:['一张石床、一盏灯。修行到这地步，也算够用。'] }) },
    ] },
  { id:'xs_demon_hunt', cat:'xian', weight:12, minAge:30, maxAge:2500,
    cond:(s)=>!!s.flags.xianxia,
    title:'下山除妖', text:'山下最近的镇子连着死了十几个人。官府束手无策，有人想起了山上那位。',
    choices:[
      { text:'去', run:()=>({ deltas:{ money:120000, skill:5, health:-8, mood:6 }, lines:['一只化形不久的妖。你收了它，镇上给你送了三车东西。'] }) },
      { text:'不去', run:()=>({ deltas:{ mood:-6 }, lines:['你继续闭关。多年后路过那个镇子，那里已经没有镇子了。'] }) },
    ] },
  { id:'xs_artifact', cat:'xian', weight:10, minAge:40, maxAge:6000,
    cond:(s)=>!!s.flags.xianxia,
    title:'炼器', text:'你收集了几块上好的矿石，想试着炼一件东西。',
    choices:[
      { text:'倾家荡产也要炼成', run:()=>({ deltas:{ money:-150000, skill:10, mood:6 }, lines:['炸了七次，第八次成了。那件东西你留着自己用。'] }) },
      { text:'炼个简单的', run:()=>({ deltas:{ money:-40000, skill:4 }, lines:['一把趁手的剑。够用就行。'] }) },
    ] },
  { id:'xs_mortal_gone', cat:'xian', weight:16, minAge:40, maxAge:2000,
    cond:(s)=>!!s.flags.xianxia && !s.flags.parentsGone,
    title:'尘缘', text:'下山采买时，你顺路回了那个村子。房子还在，但不是你家了。邻居说，你爹娘走了很多年。',
    choices:[
      { text:'在那站一会儿', run:()=>({ flags:{ parentsGone:true }, deltas:{ mood:-16, health:-2 }, lines:['你在原来的门槛上站了两个时辰。修行这么久，第一次觉得时间真的会带走东西。'] }) },
      { text:'转身就走', run:()=>({ flags:{ parentsGone:true }, deltas:{ mood:-8, skill:4 }, lines:['你没有回头。道心里那块地方从此更硬了一点。'] }) },
    ] },
  { id:'xs_disciple', cat:'xian', weight:9, minAge:80, maxAge:8000,
    cond:(s)=>!!s.flags.xianxia,
    title:'收徒', text:'有个年轻人在山门外跪了三天，说要拜你为师。你想起了当年那个出租屋。',
    choices:[
      { text:'收下', run:()=>({ flags:{ hasDisciple:true }, deltas:{ mood:12, skill:3 }, lines:['你给了他一本翻烂的经书。他接过去的手，和当年你一样抖。'] }) },
      { text:'让他回去', run:()=>({ deltas:{ mood:-4 }, lines:['他说他还会来。你没作答。山门一关，又是几百年。'] }) },
    ] },
];
EVENTS.push(...XIAN_LIFE_EVENTS);
/* ===== patch116：**重生废柴流**剧本事件（7 个）=====
   触发条件统一是「特质里有 rebirth」。主线：觉醒 → 救厂 → 救母 → 结交贵人 → 彩票 → 风口 → 前世那个人。
   金手指不是白给——每次都要用「被当成疯子」的风险去换。 */
const REBIRTH_EVENTS = [
  {
    // patch117：5 岁以下的事件必须是 auto（婴儿不能做选择），所以觉醒挪到 5-9 岁
    id: 'rb_awake', cat: 'life', weight: 99, minAge: 6, maxAge: 10, force: true,
    cond: (s) => (s.traitIds || []).indexOf('rebirth') >= 0 && !s.flags.rebirth,
    title: '记忆回来了',
    text: '六岁这年的某天早上，你醒过来，忽然什么都想起来了。\n不是做梦——你记得后面十几年会发生什么：父亲的厂子要倒，母亲的病几年后才查出来，还有很多人、很多事。\n你全都记得。',
    choices: [
      { text: '这次，我要改', hint: '重来一次', run: () => ({ flags: { rebirth: true }, deltas: { mood: 8, skill: 3 },
          lines: ['你在心里说了一遍：这一次，不会再一样了。', '那时候你还太小，能做的事不多。但你记住了。'] }) },
    ],
  },
  {
    id: 'rb_factory', cat: 'life', weight: 30, minAge: 9, maxAge: 16,
    cond: (s) => !!s.flags.rebirth && !s.flags.rbFactory,
    title: '父亲厂里的账',
    text: '你看见父亲半夜坐在客厅抽烟，桌上摊着几张单子。你知道那是什么——再有半年，那个厂子就撑不住了。你前世是在它彻底倒掉之后才知道的。',
    choices: [
      { text: '想办法提醒他', hint: '可能被骂', run: () => ({ flags: { rbFactory: true, savedFather: true },
          deltas: { relations: 18, mood: 10, money: 60000 },
          lines: ['你装作在电视上看到新闻，说了几句', '父亲愣了很久，第二天去退了两套房', '厂子没塌。他后来一直觉得是你那句话救了他'] }) },
      { text: '不说，太像小孩胡话', run: () => ({ flags: { rbFactory: true }, deltas: { mood: -8 },
          lines: ['你把话咽了回去', '厂子半年后倒了'] }) },
    ],
  },
  {
    id: 'rb_mother', cat: 'life', weight: 30, minAge: 11, maxAge: 22,
    cond: (s) => !!s.flags.rebirth && !s.flags.rbMother,
    title: '母亲还没病',
    text: '你知道再过一年多，她会在体检时查出那个东西。你也知道如果早一年发现，结果完全不一样。\n可你现在只是个孩子，没人会信你。',
    choices: [
      { text: '闹着要她去做体检', hint: '哪怕被当成怪小孩', run: () => ({ flags: { rbMother: true, savedMother: true },
          deltas: { relations: 24, mood: 18, money: -8000 },
          lines: ['你在地上打滚，说梦见妈妈生病', '她被你闹得没办法，去做了检查', '早期。医生说再晚一年就麻烦了'] }) },
      { text: '不敢说', run: () => ({ flags: { rbMother: true }, deltas: { mood: -16 },
          lines: ['那一年你什么都没说', '后来发生的事，和记忆里一模一样'] }) },
    ],
  },
  {
    id: 'rb_classmate', cat: 'life', weight: 26, minAge: 15, maxAge: 22,
    cond: (s) => !!s.flags.rebirth && !s.flags.rbClassmate,
    title: '那个坐后排的人',
    text: '你认得他。前世他坐在最后一排，没人爱跟他说话。十五年后，他在资本圈里说一句话，半个行业要抖。',
    choices: [
      { text: '主动去搭话', run: () => ({ flags: { rbClassmate: true, metFutureRich: true },
          deltas: { relations: 20, skill: 4, mood: 8 },
          lines: ['你借了他一支笔，然后聊了一节课', '你们成了朋友。很多年后他说，那支笔他记了一辈子'] }) },
      { text: '算了，没兴趣', run: () => ({ flags: { rbClassmate: true }, deltas: { mood: -4 },
          lines: ['你没去搭话', '后来他成了另一个人身边的座上宾'] }) },
    ],
  },
  {
    id: 'rb_lottery', cat: 'life', weight: 28, minAge: 18, maxAge: 27,
    cond: (s) => !!s.flags.rebirth && !s.flags.rbLottery,
    title: '那组号码',
    text: '你记得那期彩票的号码。前世你是在新闻里看见的，为这个还懊恼了很久。\n现在你知道它了。',
    choices: [
      { text: '全押进去', hint: '一把梭', run: () => ({ flags: { rbLottery: true, rbRich: true },
          deltas: { money: 3000000, mood: 14 },
          lines: ['你把攒的所有钱都买了那一注', '开奖那晚你没睡，因为你知道结果', '三百万。你的第一桶金来得毫无悬念'] }) },
      { text: '小买一点，别太扎眼', run: () => ({ flags: { rbLottery: true },
          deltas: { money: 80000, mood: 6 },
          lines: ['你只买了一注', '中了八万。够交学费了'] }) },
      { text: '不买，这种钱来得太邪', run: () => ({ flags: { rbLottery: true }, deltas: { mood: -4 },
          lines: ['你把这件事压了下去', '那一期真的开出了那个号。你在街边站了很久'] }) },
    ],
  },
  {
    id: 'rb_fortune', cat: 'life', weight: 26, minAge: 24, maxAge: 38,
    cond: (s) => !!s.flags.rebirth && !s.flags.rbFortune,
    title: '你知道哪个方向会起来',
    text: '现在还没人看好的那个行当，五年后会挤满人。你知道那一刻什么时候来。',
    choices: [
      { text: '全身扑进去', run: () => ({ flags: { rbFortune: true, rbRich: true },
          deltas: { money: 6000000, mood: 12, health: -8, skill: 8 },
          lines: ['你把所有钱和人脉都压了上去', '三年后，风口来了', '那些当初笑你的人，后来成了你的客户'] }) },
      { text: '稳一点，跟一小步', run: () => ({ flags: { rbFortune: true },
          deltas: { money: 400000, skill: 5, mood: 5 },
          lines: ['你跟了一小步', '赚到了，不算多，但踏实'] }) },
    ],
  },
  {
    id: 'rb_regret', cat: 'life', weight: 24, minAge: 28, maxAge: 55,
    cond: (s) => !!s.flags.rebirth && !s.flags.rbRegret,
    title: '前世那个人',
    text: '你看见了她——或者说，你又看见了她。前世你们没能在一起，你懊恼了半辈子。\n这一世她还在这里。',
    choices: [
      { text: '这次不放手', run: () => ({ flags: { rbRegret: true, rbLove: true },
          deltas: { mood: 22, relations: 16 },
          lines: ['你走过去，说了一句早就想说的话', '她愣了愣，然后笑了', '这一次，你没有错过'] }) },
      { text: '算了，各走各路', run: () => ({ flags: { rbRegret: true }, deltas: { mood: -14 },
          lines: ['你们擦肩而过', '你没有回头。这一次也一样'] }) },
    ],
  },
];
EVENTS.push(...REBIRTH_EVENTS);
/* ===== patch121：超晚期修仙事件（1000 岁 ~ 100 万年）=====
   原来修仙事件集中在早中期，1000 岁以后可用事件越来越少，导致空候选。
   这 8 个覆盖「几千年 → 百万年」的漫长岁月。 */
const XIAN_LATE_EVENTS = [
  { id:'xs_sea_eye', cat:'xian', weight:12, minAge:200, maxAge:200000,
    cond:(s)=>!!s.flags.xianxia,
    title:'海眼', text:'东海最深处有一处眼，据说通向另一个世界。你潜到那里的时候，水已经是黑色的了。',
    choices:[
      { text:'下去看看', run:()=>({ deltas:{ skill:10, mood:8, health:-10 }, lines:['你在海眼里待了三天。上来的时候说不出话','但你从此知道，这世界比你想的大得多'] }) },
      { text:'记下位置就走', run:()=>({ deltas:{ skill:4, money:200000 }, lines:['你把坐标刻在玉简上','后来有人拿它换了一整座岛'] }) },
    ] },
  { id:'xs_sky_iron', cat:'xian', weight:11, minAge:500, maxAge:500000,
    cond:(s)=>!!s.flags.xianxia,
    title:'天外陨铁', text:'那东西砸进山里的时候，整座山都在抖。你赶过去，坑底是一块还在发烫的黑色铁块。',
    choices:[
      { text:'拿回去炼器', run:()=>({ deltas:{ skill:12, money:-50000, mood:6 }, lines:['你用了七百年才把它烧软','最后炼出来的东西，连你自己都舍不得用'] }) },
      { text:'就地封印', run:()=>({ deltas:{ mood:4, health:6 }, lines:['你布了个阵把它压在原地','后来那里长出一片没有名字的林子'] }) },
    ] },
  { id:'xs_dream_teach', cat:'xian', weight:12, minAge:800, maxAge:800000,
    cond:(s)=>!!s.flags.xianxia,
    title:'梦中传道', text:'你闭目养神的时候，忽然有人在你耳边讲了一段道理。醒来只记得一半，可就这一半，让你卡了很久的那道关松动了。',
    choices:[
      { text:'顺着这一半继续参', run:()=>({ deltas:{ skill:14, mood:6 }, lines:['你想了三千年','想通那天，天上下了一场没人见过的雨'] }) },
      { text:'不去深究', run:()=>({ deltas:{ mood:3 }, lines:['你把它记在本子上','本子后来丢了'] }) },
    ] },
  { id:'xs_old_descendant', cat:'xian', weight:10, minAge:1000, maxAge:1000000,
    cond:(s)=>!!s.flags.xianxia,
    title:'故人之后', text:'有个年轻人拦在山道上，说他是某个人的第十九代孙。那个名字你记得——是你还没入道时的朋友。',
    choices:[
      { text:'给点东西', run:()=>({ deltas:{ mood:10, money:-100000 }, lines:['你给了他一件不重要的法器','他跪下来磕头，你没躲'] }) },
      { text:'说认错人了', run:()=>({ deltas:{ mood:-10, skill:3 }, lines:['你从他身边走过','那之后你闭关了很久'] }) },
    ] },
  { id:'xs_world_tree', cat:'xian', weight:9, minAge:2000, maxAge:2000000,
    cond:(s)=>!!s.flags.xianxia,
    title:'一株树', text:'洞府门口那株你随口种下的小树，如今高得看不见顶。它把这一整片山的灵气都拢在了自己身上。',
    choices:[
      { text:'在树下闭关', run:()=>({ deltas:{ skill:16, health:10, mood:8 }, lines:['你在树下坐了一万年','树又长高了一半'] }) },
      { text:'把它移走', run:()=>({ deltas:{ money:300000, mood:-4 }, lines:['你把它移到了别处','那块地从此空了'] }) },
    ] },
  { id:'xs_time_river', cat:'xian', weight:8, minAge:5000, maxAge:5000000,
    cond:(s)=>!!s.flags.xianxia,
    title:'时间长河', text:'你在入定时看见了一条河。河里漂着的，是你认识过的所有人。他们都已经不在了，只有你还在岸上。',
    choices:[
      { text:'看着它流过去', run:()=>({ deltas:{ mood:-8, skill:18 }, lines:['你看了一千年','看完之后，你不再做梦了'] }) },
      { text:'闭上眼睛', run:()=>({ deltas:{ mood:6 }, lines:['你睁开眼，什么都不记得了','这也许是好事'] }) },
    ] },
  { id:'xs_empty_city', cat:'xian', weight:9, minAge:10000, maxAge:10000000,
    cond:(s)=>!!s.flags.xianxia,
    title:'空城', text:'你路过一座城。楼还在，路还在，人一个也没有。你记得这里从前很热闹。',
    choices:[
      { text:'在城里住几天', run:()=>({ deltas:{ mood:-6, skill:6 }, lines:['你在原来的酒楼位置坐了一夜','没人来给你上酒'] }) },
      { text:'直接过去', run:()=>({ deltas:{ mood:2 }, lines:['你没有停','身后那座城很快就看不见了'] }) },
    ] },
  { id:'xs_last_lamp', cat:'xian', weight:8, minAge:50000, maxAge:99999999,
    cond:(s)=>!!s.flags.xianxia,
    title:'最后一盏灯', text:'你回到最初那间出租屋的位置。屋子早没了，地下几万丈全是岩层。可你记得那盏灯就是放在这里的。',
    choices:[
      { text:'在原地坐一会儿', run:()=>({ deltas:{ mood:12, skill:8 }, lines:['你坐了很久','那一刻你忽然想起来，自己当初为什么要修这个道'] }) },
      { text:'算了吧', run:()=>({ deltas:{ mood:-4 }, lines:['你转身走了','山还是那座山'] }) },
    ] },
];
EVENTS.push(...XIAN_LATE_EVENTS);
/* ===== patch131：扩充修仙专属事件（12 个，覆盖 30 岁 ~ 100 万年）=====
   patch130 之后修仙者看不到凡尘事件了，事件池需要补足。
   这些事件都不依赖工作/婚育，纯修仙日常。 */
const XIAN_MORE_EVENTS = [
  { id:'xs_sword_intent', cat:'xian', weight:12, minAge:30, maxAge:3000,
    cond:(s)=>!!s.flags.xianxia,
    title:'剑意', text:'你盯着瀑布看了三年。某天忽然觉得，那道水痕就是一把剑。',
    choices:[
      { text:'顺势出关', run:()=>({ deltas:{ skill:12, mood:8 }, lines:['你抬手一划，瀑布断了一瞬','从此你的剑不用拔出来'] }) },
      { text:'再看几年', run:()=>({ deltas:{ skill:6, mood:3 }, lines:['你又看了三年','水还是那道水，你已经不是那个你'] }) },
    ] },
  { id:'xs_pill_furnace', cat:'xian', weight:11, minAge:40, maxAge:5000,
    cond:(s)=>!!s.flags.xianxia,
    title:'丹炉', text:'你守着一炉丹，已经守了七百年。还差最后三日。',
    choices:[
      { text:'继续守', run:()=>({ deltas:{ skill:10, money:150000, health:-6 }, lines:['三日之后，丹成','你把它收进玉瓶，没舍得吃'] }) },
      { text:'先去处理别的事', run:()=>({ deltas:{ money:-30000, mood:-4 }, lines:['回来时炉子凉了','那炉丹废了'] }) },
    ] },
  { id:'xs_beast_contract', cat:'xian', weight:11, minAge:50, maxAge:8000,
    cond:(s)=>!!s.flags.xianxia,
    title:'灵兽', text:'一只白鹤落在你洞府前的石头上，不肯走。你看出它开了灵智。',
    choices:[
      { text:'收下它', run:()=>({ flags:{ hasBeast:true }, deltas:{ mood:14, relations:8 }, lines:['它跟了你三千年','最后老死在你怀里，那时你才知道它一直想说话'] }) },
      { text:'放它走', run:()=>({ deltas:{ mood:2 }, lines:['它飞走了','很多年后你听说，山那边有只鹤成了精'] }) },
    ] },
  { id:'xs_rival', cat:'xian', weight:10, minAge:80, maxAge:20000,
    cond:(s)=>!!s.flags.xianxia,
    title:'宿敌', text:'有个和你同时入道的修士，这些年一直跟你较劲。这次他堵在你洞府门口。',
    choices:[
      { text:'应战', run:()=>({ deltas:{ skill:14, health:-12, mood:6 }, lines:['打了三天三夜','他输了，走的时候说：下次我还来'] }) },
      { text:'避而不见', run:()=>({ deltas:{ mood:-8, skill:3 }, lines:['你关了洞府','他在门外站了七天'] }) },
    ] },
  { id:'xs_heart_demon', cat:'xian', weight:10, minAge:100, maxAge:50000,
    cond:(s)=>!!s.flags.xianxia,
    title:'心魔', text:'闭关到某个节点，你忽然看见了自己。那个自己问你：你修这个，到底为了什么。',
    choices:[
      { text:'直面它', run:()=>({ deltas:{ mood:-14, skill:16 }, lines:['你想了整整一千年','想通那天，你哭了一场，然后笑了'] }) },
      { text:'压下它', run:()=>({ deltas:{ health:-8, mood:-6 }, lines:['你把它压了下去','它没走，只是暂时不说话了'] }) },
    ] },
  { id:'xs_avatar', cat:'xian', weight:9, minAge:200, maxAge:80000,
    cond:(s)=>!!s.flags.xianxia,
    title:'化身', text:'你可以分出一缕神念，化作另一个自己，去走另一条路。',
    choices:[
      { text:'分出化身', run:()=>({ deltas:{ skill:12, health:-10 }, lines:['化身去了很远的地方','几百年后它回来，带回了你没见过的风景'] }) },
      { text:'不，我就是我', run:()=>({ deltas:{ mood:6, skill:4 }, lines:['你拒绝了','一个人一辈子，走一条路就够了'] }) },
    ] },
  { id:'xs_mortal_town', cat:'xian', weight:11, minAge:300, maxAge:100000,
    cond:(s)=>!!s.flags.xianxia,
    title:'山下小镇', text:'你每隔几百年下山一次。这次去，镇上的人换了一茬又一茬，没人认得你。',
    choices:[
      { text:'住几天', run:()=>({ deltas:{ mood:10, money:-5000 }, lines:['你买了几个包子，坐在路边吃','没人知道你是谁，这让你很放松'] }) },
      { text:'看看吧，不打扰', run:()=>({ deltas:{ mood:3 }, lines:['你站在山上看了很久','然后就回去了'] }) },
    ] },
  { id:'xs_star_map', cat:'xian', weight:9, minAge:500, maxAge:200000,
    cond:(s)=>!!s.flags.xianxia,
    title:'星图', text:'夜里抬头，星象比凡人看见的多得多。你忽然发现，有一片星是自己挪过去的。',
    choices:[
      { text:'顺着星图参', run:()=>({ deltas:{ skill:15, mood:6 }, lines:['你参了三千年','最后发现，那片星本来就是那样'] }) },
      { text:'不看了', run:()=>({ deltas:{ mood:2 }, lines:['你低头继续打坐','星星还在那里'] }) },
    ] },
  { id:'xs_void_walk', cat:'xian', weight:8, minAge:1000, maxAge:1000000,
    cond:(s)=>!!s.flags.xianxia,
    title:'虚空', text:'你试着往没人的地方走。走了不知多久，回头一看，连时间都断了。',
    choices:[
      { text:'继续走', run:()=>({ deltas:{ skill:18, mood:-6, health:-10 }, lines:['你在虚空里待了很久','回来时，你的道袍已经风化成了灰'] }) },
      { text:'回来', run:()=>({ deltas:{ mood:4 }, lines:['你转身往回走','走了很久才重新看见光'] }) },
    ] },
  { id:'xs_heaven_gate', cat:'xian', weight:8, minAge:5000, maxAge:10000000,
    cond:(s)=>!!s.flags.xianxia,
    title:'天门', text:'你在云海深处看见一道门。门上没有锁，也没有把手。',
    choices:[
      { text:'推它', run:()=>({ deltas:{ skill:20, health:-15, mood:10 }, lines:['门开了，里面是更深的云','你退了回来，但记住了那个方向'] }) },
      { text:'记住位置就走', run:()=>({ deltas:{ skill:5 }, lines:['你把它记在玉简上','那道门后来再没人见过'] }) },
    ] },
  { id:'xs_eternal_wait', cat:'xian', weight:8, minAge:10000, maxAge:99000000,
    cond:(s)=>!!s.flags.xianxia,
    title:'等', text:'你在等一样东西。等什么，你已经记不清了。但你还在等。',
    choices:[
      { text:'继续等', run:()=>({ deltas:{ mood:-4, skill:10 }, lines:['又过去了几万年','你还是没等到，也没走'] }) },
      { text:'不等了', run:()=>({ deltas:{ mood:12, skill:6 }, lines:['你站起来，走了','走出洞府那天，你觉得天很蓝'] }) },
    ] },
  { id:'xs_last_thought', cat:'xian', weight:8, minAge:50000, maxAge:99999999,
    cond:(s)=>!!s.flags.xianxia,
    title:'最后一念', text:'修到这个地步，你偶尔会想：如果当年没在图书馆蹲下来找那本书，现在会怎样。',
    choices:[
      { text:'想一会儿', run:()=>({ deltas:{ mood:8, skill:4 }, lines:['你想了很多年','最后觉得，那个蹲下来的自己挺好的'] }) },
      { text:'不去想', run:()=>({ deltas:{ skill:6 }, lines:['你把念头压下去','继续闭关'] }) },
    ] },
];
EVENTS.push(...XIAN_MORE_EVENTS);


/* ===== patch121：兜底事件（权重 0，正常抽不到）=====
   只在「某个回合一个候选都找不到」时用它，避免游戏卡死。它不参与次数上限。 */
const FALLBACK_EVENT = {
  id: 'generic_quiet', cat: 'life', weight: 0, minAge: 6, maxAge: 99999999,
  cond: () => true,
  title: '平静的岁月',
  text: '这一段没有什么值得记下的事。日子一天一天过去，像水一样。',
  choices: [{ text: '继续', run: () => ({ deltas: {}, lines: ['又过去了一段' ] }) }],
};
EVENTS.push(FALLBACK_EVENT);

/* ===== patch173：晚年叙事（80 岁往后）=====
   设计约束：**deltas 全部为空对象**，只提供文字，不改任何属性、不给钱、不动关系，
   所以对平衡零影响；它们的作用是让「活得很老」这件事有东西可读，而不是一直撞无聊的兜底。
   maxTimes 默认是 2（沿用普通事件规则），4 个事件足够覆盖到一百一二十岁。 */
const CENTENARIAN_EVENTS = [
  { id: 'cent_greatgrand', cat: 'life', weight: 22, minAge: 80, maxAge: 99999999,
    cond: () => true,
    title: '曾孙',
    text: '曾孙来看你。你摸着他的头，忽然想起自己小时候也这么被摸过。',
    choices: [{ text: '摸摸他的头', run: () => ({ deltas: {}, lines: ['他的手很小，很暖。'] }) }] },

  { id: 'cent_old_friend', cat: 'life', weight: 25, minAge: 82, maxAge: 99999999,
    cond: () => true,
    title: '最后一个老朋友',
    text: '又一个名字从通讯录上划掉了。你成了那个还记得所有事的人。',
    choices: [{ text: '安静一会', run: () => ({ deltas: {}, lines: ['屋子里很静。窗外的树影动了一下。'] }) }] },

  { id: 'cent_memory', cat: 'life', weight: 28, minAge: 85, maxAge: 99999999,
    cond: () => true,
    title: '记性',
    text: '昨天的事转眼就忘，小时候的事却越来越清楚。你开始分不清哪些是真发生过的。',
    choices: [{ text: '坐着想', run: () => ({ deltas: {}, lines: ['你想了很久，最后记起了一个下午的光。'] }) }] },

  { id: 'cent_banquet', cat: 'life', weight: 30, minAge: 88, maxAge: 99999999,
    cond: () => true,
    title: '一百岁的寿宴',
    text: '来的人你大多叫不出名字了。他们轮流过来握手，说一些你听不太清的话。',
    choices: [{ text: '笑一笑', run: () => ({ deltas: {}, lines: ['你笑了一整天，脸有点酸。'] }) }] },
];
for (const _ce of CENTENARIAN_EVENTS) EVENTS.push(_ce);






/* ================= 叙事回响（patch77） =================
   方法论：有意义的四要素之一是 **Reminders**——玩家必须被提醒「你当年做过这个选择」。
   这批事件不送数值，只把过去的选择**讲出来**：
     · 条件读取远期 flag（firstCrush / brokeUp / path / gap / xianxia / fairyRefused …）
     · 年龄窗口在中晚年（38-80），处在「回想」的人生阶段
     · 每个事件只触发一次（eventLog 天然去重）
     · 收益很小（mood/relations 各几点），重点在文案与认同感 */
const ECHO_EVENTS = [
  {
    id: 'echo_first_crush', cat: 'life', weight: 16, force: true, minAge: 35, maxAge: 62,
    cond: (s) => !!s.flags.firstCrush && !s.flags.married,
    title: '在超市遇见初恋',
    text: '推着购物车转过货架，你认出了那张脸。TA 也愣了一下，然后笑了："好久不见。"',
    choices: [
      { text: '站着聊了很久', hint: '聊聊这些年', run: () => ({ deltas: { mood: 8, relations: 3 },
        lines: ['你们说起当年的教室、走廊和那场没看完的电影', '分开时都没提"下次"'] }) },
      { text: '点头，然后推车走开', hint: '有些事留在原地', run: () => ({ deltas: { mood: 2 },
        lines: ['你听见自己在心里说了句"都过去了"', '结账时手有点抖'] }) },
    ],
  },
  {
    id: 'echo_broke_up', cat: 'life', weight: 14, force: true, minAge: 40, maxAge: 60,
    cond: (s) => !!s.flags.brokeUp,
    title: '听说 TA 过得不错',
    text: '老朋友吃饭时顺口提起："你知道吗，TA 去年搬去别的城市了，孩子都会走路了。"',
    choices: [
      { text: '"挺好的"', hint: '真的觉得挺好', run: () => ({ deltas: { mood: 4, relations: 2 },
        lines: ['你说完这句，端起杯子喝了一口', '那一刻你发现自己是真的放下了'] }) },
      { text: '没接话', hint: '换了个话题', run: () => ({ deltas: { mood: -3 },
        lines: ['你把话岔开了', '回家路上绕了很远'] }) },
    ],
  },
  {
    id: 'echo_path_what_if', cat: 'life', weight: 13, force: true, minAge: 40, maxAge: 64,
    cond: (s) => s.flags.path === 'job' && !!s.flags.employed,
    title: '你偶尔会想"如果当年"',
    text: '同学群里有人发了张照片，是那个当年继续读书的老同学。实验室、白大褂、一个你看不懂的仪器。',
    choices: [
      { text: '"各有各的好"', hint: '想通了', run: () => ({ deltas: { mood: 6 },
        lines: ['你关掉手机，看了看自己的工位', '你确实没走那条路，但这条路也是你自己选的'] }) },
      { text: '把群消息设成了免打扰', hint: '不看了', run: () => ({ deltas: { mood: 3 },
        lines: ['你把群消息静音了', '后来再没点开过'] }) },
    ],
  },
  {
    id: 'echo_gap_year', cat: 'life', weight: 12, force: true, minAge: 35, maxAge: 55,
    cond: (s) => !!s.flags.gap,
    title: '那一年你什么都没干',
    text: '有人问你简历上那段空档。你忽然发现，那一年是你这辈子记得最清楚的十二个月。',
    choices: [
      { text: '认真讲了讲那一年', hint: '那是一段好日子', run: () => ({ deltas: { mood: 9 },
        lines: ['你说起那条街、那家店、那些晒到下午的太阳', '对方听完说："真羡慕你"'] }) },
      { text: '"就是想歇一歇"', hint: '不必解释', run: () => ({ deltas: { mood: 4 },
        lines: ['你笑了笑，没多说', '有些事说出来就不对了'] }) },
    ],
  },
  {
    id: 'echo_xian_residue', cat: 'life', weight: 15, force: true, minAge: 55, maxAge: 82,
    cond: (s) => !!s.flags.xianxia && !s.flags.feisheng,
    title: '你还是习惯在深夜坐一会儿',
    text: '不点灯，也不说话。只是坐着，呼吸放慢。家里人以为你在打盹。',
    choices: [
      { text: '坐到天亮', hint: '就当什么都没发生', run: () => ({ deltas: { mood: 7, health: 2 },
        lines: ['窗外的天一点点亮起来', '你说不清自己在等什么，但好像等到了'] }) },
      { text: '起身回去睡觉', hint: '凡人该睡觉', run: () => ({ deltas: { mood: 3 },
        lines: ['你拍了拍膝盖上的灰', '有些东西你说不清，也没打算说清'] }) },
    ],
  },
  {
    id: 'echo_fairy_refused', cat: 'life', weight: 12, force: true, minAge: 50, maxAge: 72,
    cond: (s) => !!s.flags.fairyRefused || !!s.flags.refusedXian,
    title: '那年你说不',
    text: '你偶尔会想起那个雨天、那句邀请、那个你没有答应的下午。',
    choices: [
      { text: '不后悔', hint: '选定了就是选定了', run: () => ({ deltas: { mood: 8 },
        lines: ['你想起那天自己是怎么摇头的', '这些年你没后悔过，一次都没有'] }) },
      { text: '忍不住想"如果"', hint: '只是想想', run: () => ({ deltas: { mood: -2 },
        lines: ['你想象了另一个自己', '然后把这个念头放下了'] }) },
    ],
  },
  {
    id: 'echo_old_friend', cat: 'life', weight: 14, force: true, minAge: 45, maxAge: 68,
    cond: (s) => !!s.flags.metOldFriend || (s.bonds && s.bonds.friends >= 70),
    title: '很多年没联系的朋友打来电话',
    text: '"喂？是我。你听得出我的声音吗？" 你听得出。一点都没变。',
    choices: [
      { text: '聊了两个小时', hint: '像从前一样', run: () => ({ deltas: { mood: 10, relations: 8 },
        lines: ['两个小时，把二十几年补了一半', '挂了电话你才发现自己一直在笑'] }) },
      { text: '说了句"有空再聚"', hint: '都忙', run: () => ({ deltas: { mood: 2, relations: 2 },
        lines: ['"有空再聚啊"', '你们都知道，这个有空大概要等到退休'] }) },
    ],
  },
  {
    id: 'echo_child_grown', cat: 'life', weight: 16, force: true, minAge: 52, maxAge: 72,
    cond: (s) => !!s.flags.hasChild,
    title: '孩子说了一句你当年说过的话',
    text: '"算了吧，反正努力也没用。" 这句话你太熟了——因为三十年前你也说过一模一样的话。',
    choices: [
      { text: '坐下来认真聊聊', hint: '就像当年没人跟你聊一样', run: () => ({ deltas: { mood: 8, relations: 10 },
        lines: ['你说了很多，孩子没怎么说话', '但你看见 TA 在听'] }) },
      { text: '什么都没说', hint: '有些路得自己走', run: () => ({ deltas: { mood: -2, relations: 2 },
        lines: ['你只是给 TA 多盛了一碗饭', '有些话，说了也没用'] }) },
    ],
  },
];
EVENTS.push(...ECHO_EVENTS);


/* ================= 三条线的内容扩充（patch31） =================
   ⑧ 修仙与都市的两难：修仙者照常上班、买房、开会、出差，但修行的关口和现实的责任
      总会撞在一起。每个选择都会在「修为」和「现实」之间留下痕迹。
   ⑨ 朋友线的长期跨度：不再只是「多年不见的朋友」这一下，而是隔十几年一次的重逢——
      每次见面都看得出彼此的变化。
   ⑩ 子女线延续：孩子长大、离家、成家，而当年怎么养他的选择，在晚年回响。 */
const EXTRA_EVENTS = [
  
  /* ───── ⑨ 朋友线的长期跨度 ───── */
  { id:'fr_ten_years', cat:'life', weight:13, minAge:32, maxAge:60,
    cond:(s)=>s.attrs.relations>=35,
    title:'十年没见的老朋友', text:'忽然接到电话，说在你这个城市出差。你们上次见面还是十年前。',
    choices:[
      { text:'请一天假，好好聚', hint:'有些关系值得', run:()=>({ deltas:{ mood:16, relations:12 }, bonds:{ friends:18 }, flags:{ metOldFriend:true }, lines:['你们从中午聊到夜里两点','临走时他说：下次别等十年'] }) },
      { text:'抽两小时见一面', hint:'意思到了', run:()=>({ deltas:{ mood:6, relations:5 }, bonds:{ friends:8 }, lines:['咖啡喝完了，话没说完','各自赶下一场'] }) },
    ] },
  { id:'fr_reunion_20', cat:'life', weight:12, minAge:40, maxAge:70,
    cond:(s)=>!!s.flags.metOldFriend,
    title:'又一次重逢', text:'又过了许多年。这次是他孩子结婚，请你过去。',
    choices:[
      { text:'去，还包个大红包', hint:'到场就是情分', run:()=>({ deltas:{ money:-8000, mood:14, relations:10 }, bonds:{ friends:16 }, lines:['婚礼上他拉着你给亲戚介绍','他说：这是我最好的朋友'] }) },
      { text:'随礼，人不到', hint:'实在走不开', run:()=>({ deltas:{ money:-3000, mood:-2, relations:2 }, bonds:{ friends:2 }, lines:['他回了个“理解”','你看着那两个字，心里不太舒服'] }) },
    ] },
  { id:'fr_help_money', cat:'life', weight:12, minAge:36, maxAge:65,
    cond:(s)=>s.attrs.relations>=45 && s.attrs.money>=80000,
    title:'朋友来借钱', text:'他说是周转，三个月就还。数目不小，你们的关系也不短。',
    choices:[
      { text:'借，写个条子', hint:'情分和规矩都要', run:({ rng })=> rng.chance(0.6)
        ? { deltas:{ mood:8, relations:10 }, bonds:{ friends:12 }, lines:['他按时还了，还多给了一点','你把多的那部分退了回去'] }
        : { deltas:{ money:-60000, mood:-14, relations:-8 }, bonds:{ friends:-16 }, lines:['三个月变成了三年','后来他不再接你的电话'] } },
      { text:'不借，但请他吃饭', hint:'把话说软', run:()=>({ deltas:{ money:-1000, mood:-3, relations:3 }, lines:['他说理解，你们还是朋友','但你知道有些东西变了'] }) },
    ] },
  { id:'fr_sick', cat:'life', weight:12, minAge:42, maxAge:72,
    cond:(s)=>s.attrs.relations>=40,
    title:'老友病重', text:'医院说情况不太好。他在电话里的声音还是很轻松。',
    choices:[
      { text:'常去看他', hint:'时间要挤出来', run:()=>({ deltas:{ mood:-6, health:-3, relations:12 }, bonds:{ friends:20 }, flags:{ caredForFriend:true }, lines:['你每周去一次','他总说别跑了，但你去了他就笑'] }) },
      { text:'打个电话，托人带点东西', hint:'现实的距离', run:()=>({ deltas:{ money:-5000, mood:-8, relations:4 }, bonds:{ friends:4 }, lines:['你在电话里说了很多','挂断之后，你坐了很久'] }) },
    ] },
  { id:'fr_drift', cat:'life', weight:12, minAge:34, maxAge:65,
    cond:(s)=>s.attrs.relations<45,
    title:'朋友越来越少', text:'翻通讯录，能直接打电话的人不超过三个。有些名字你已经想不起脸了。',
    choices:[
      { text:'主动联系几个人', hint:'关系要维护', run:({ rng })=> rng.chance(0.6)
        ? { deltas:{ mood:12, relations:10 }, bonds:{ friends:14 }, lines:['有两个人回了很快','其中一个人说：我早就想找你了'] }
        : { deltas:{ mood:-6, relations:2 }, bonds:{ friends:2 }, lines:['大部分没有回','你把手机放下，喝了杯水'] } },
      { text:'算了，就这样吧', hint:'不勉强', run:()=>({ deltas:{ mood:-2, relations:-4 }, bonds:{ friends:-6 }, lines:['你把通讯录划到底','也不是难过，就是有点空'] }) },
    ] },
  { id:'fr_final_meeting', cat:'life', weight:11, minAge:60, maxAge:85,
    cond:(s)=>s.attrs.relations>=45,
    title:'最后一次聚会', text:'老朋友们约了一次饭。有人是被人扶着来的，有人已经来不了了。',
    choices:[
      { text:'把这顿饭吃很久', hint:'慢慢吃，慢慢说', run:()=>({ deltas:{ mood:16, health:2, relations:10 }, bonds:{ friends:16 }, lines:['你们吃了四个小时','散场的时候谁也没先走'] }) },
      { text:'坐一会儿就回', hint:'身体撑不住', run:()=>({ deltas:{ mood:4, health:1 }, bonds:{ friends:4 }, lines:['你提前走了','走到门口回头看了一眼'] }) },
    ] },

  /* ───── ⑩ 子女线延续 ───── */
  { id:'kd_grow_up', cat:'life', weight:13, minAge:44, maxAge:62,
    cond:(s)=>!!s.flags.hasChild,
    title:'孩子长大了', text:'他不再需要你接送、不再问你作业。你忽然发现自己在等他回家。',
    choices:[
      { text:'学着放手，但留一盏灯', hint:'远远地看着', run:()=>({ deltas:{ mood:12, relations:8 }, bonds:{ child:16 }, lines:['你不再过问他的每一件事','他反而什么都愿意说'] }) },
      { text:'还是想管', hint:'放不下', run:({ rng })=> rng.chance(0.5)
        ? { deltas:{ mood:6, relations:4 }, bonds:{ child:6 }, lines:['你试着少说两句','他明显松了口气'] }
        : { deltas:{ mood:-10, relations:-6 }, bonds:{ child:-12 }, lines:['你们又吵了一次','他说：你能不能别管了'] } },
    ] },
  { id:'kd_leave_home', cat:'life', weight:13, minAge:46, maxAge:64,
    cond:(s)=>!!s.flags.hasChild,
    title:'孩子要搬出去住', text:'他找好了房子，交了定金，才告诉你。',
    choices:[
      { text:'帮他搬家，送到门口', hint:'体面地放手', run:()=>({ deltas:{ mood:8, relations:8 }, bonds:{ child:14 }, flags:{ childLeft:true }, lines:['你把他送到楼下','回来之后，那个房间你一直没动'] }) },
      { text:'让他再住两年', hint:'舍不得', run:({ rng })=> rng.chance(0.5)
        ? { deltas:{ mood:4, relations:2 }, bonds:{ child:4 }, lines:['他答应了','但你们都知道这事迟早的'] }
        : { deltas:{ mood:-8, relations:-6 }, bonds:{ child:-8 }, lines:['他第二天就搬走了','走之前只说了句“我走了”'] } },
    ] },
  { id:'kd_marry', cat:'life', weight:12, minAge:50, maxAge:70,
    cond:(s)=>!!s.flags.hasChild && s.bonds.child>=45,
    title:'孩子要结婚了', text:'他带对方回家吃饭。你在厨房里忙了一下午，话却没说几句。',
    choices:[
      { text:'尽力办得体面', hint:'把家底掏一部分', run:()=>({ deltas:{ money:-80000, mood:18, relations:10 }, bonds:{ child:16, family:12 }, flags:{ childMarried:true }, lines:['婚礼那天你站在台下','你想起自己结婚那年'] }) },
      { text:'让他们自己决定，钱留着', hint:'务实', run:()=>({ deltas:{ money:20000, mood:6, relations:2 }, bonds:{ child:6 }, flags:{ childMarried:true }, lines:['他们旅行结婚去了','寄回来的照片里，笑得很开'] }) },
    ] },
  { id:'kd_away', cat:'life', weight:12, minAge:54, maxAge:75,
    cond:(s)=>!!s.flags.hasChild && !!s.flags.childLeft,
    title:'孩子在外地定居', text:'他在那边买了房，说以后可能就在那了。一年回来一两次。',
    choices:[
      { text:'学会用视频，常联系', hint:'跟上他的生活', run:()=>({ deltas:{ mood:10, relations:8 }, bonds:{ child:12 }, lines:['你学会了打视频','每周日晚上八点，是你们的固定时间'] }) },
      { text:'不打扰，等他想起来', hint:'克制', run:()=>({ deltas:{ mood:-6, relations:-4 }, bonds:{ child:-8 }, lines:['电话越来越少','你总觉得他忙'] }) },
    ] },
  { id:'kd_grandkid_love', cat:'life', weight:12, minAge:56, maxAge:80,
    cond:(s)=>!!s.flags.helpingGrandkid,
    title:'孙子跟你最亲', text:'他什么都跟你说，比跟他爸妈说的还多。',
    choices:[
      { text:'什么都听，不评判', hint:'当他的树洞', run:()=>({ deltas:{ mood:18, relations:10 }, bonds:{ child:8, family:14 }, lines:['他趴在你腿上说了一下午','你什么都没说，就是听着'] }) },
      { text:'该讲的道理也讲', hint:'长辈的责任', run:()=>({ deltas:{ mood:10, relations:6 }, bonds:{ family:10 }, lines:['你讲了自己年轻时的错','他听得认真'] }) },
    ] },
  { id:'kd_care_you', cat:'life', weight:12, minAge:66, maxAge:88,
    cond:(s)=>!!s.flags.hasChild && s.attrs.health<60,
    title:'孩子要接你去住', text:'你病了一场，他请了假回来，说不如搬过去跟他一起。',
    choices:[
      { text:'去，让他们放心', hint:'离开老房子', run:()=>({ deltas:{ mood:12, health:6, relations:10 }, bonds:{ child:18 }, flags:{ movedToChild:true }, lines:['你收拾出三个箱子','在新家的第一晚，你睡得还不错'] }) },
      { text:'不去，我在这儿住惯了', hint:'守住自己的日子', run:()=>({ deltas:{ mood:4, health:-4, relations:-4 }, bonds:{ child:-6 }, lines:['他拗不过你','走的时候把药分好了一星期的量'] }) },
    ] },
  { id:'kd_legacy', cat:'life', weight:11, minAge:68, maxAge:90,
    cond:(s)=>!!s.flags.hasChild,
    title:'想留点什么给他', text:'你开始整理东西。有些是值钱的，有些只是你舍不得扔的。',
    choices:[
      { text:'把值钱的立个清楚的字据', hint:'省得以后麻烦', run:()=>({ deltas:{ mood:10, relations:8 }, bonds:{ child:12 }, flags:{ madeWill:true }, lines:['你把该写的都写了','孩子看了一眼，说：爸，你说这些干嘛'] }) },
      { text:'写一封信，讲讲自己这一生', hint:'留话', run:()=>({ deltas:{ mood:16, relations:10 }, bonds:{ child:16 }, flags:{ wroteLetter:true }, lines:['你写了十几页','写到一半停了很久'] }) },
    ] },
];
EVENTS.push(...EXTRA_EVENTS);

/* ================= 上一世的回响（patch32） =================
   只有在继承了上一世记录时才出现。它不是奖励，是让玩家在新的一世里
   碰到一点似曾相识的东西。 */
const LEGACY_EVENTS = [
  { id:'lg_deja_vu', cat:'life', weight:16, minAge:10, maxAge:40,
    cond:(s)=>!!s.legacy,
    title:'似曾相识', text:'这个地方、这句话，你说不清为什么，就是觉得经历过一遍。',
    choices:[
      { text:'顺着这个感觉走', hint:'也许会碰到什么', run:()=>({ deltas:{ mood:8, skill:3 },
        lines:['你按直觉做了一个选择','后来你发现，这个选择居然是对的'] }) },
      { text:'不管它，按自己的想法来', hint:'这一世是自己的', run:()=>({ deltas:{ mood:4, relations:3 },
        lines:['你把那点熟悉感放在一边','路还是你自己走的'] }) },
    ] },
  { id:'lg_old_habit', cat:'life', weight:14, minAge:18, maxAge:55,
    cond:(s)=>!!s.legacy && s.legacy.skill >= 40,
    title:'手上的老习惯', text:'有些事情你从没学过，但一做就会——像是很久以前做过很多遍。',
    choices:[
      { text:'靠着这份手感往下走', hint:'上辈子没白干', run:()=>({ deltas:{ skill:6, money:12000, mood:6 },
        lines:['别人要练三个月的东西，你三天就上手了'] }) },
      { text:'从头系统学一遍', hint:'把底子打正', run:()=>({ deltas:{ skill:8, mood:2, money:-3000 },
        lines:['你发现自己原来有很多坏习惯','改完之后，比凭感觉更稳'] }) },
    ] },
  { id:'lg_same_place', cat:'life', weight:13, minAge:22, maxAge:60,
    cond:(s)=>!!s.legacy,
    title:'又走到这个地方', text:'这条街你上一世也来过。那时候陪你的人，这次不在。',
    choices:[
      { text:'站一会儿再走', hint:'跟过去打个招呼', run:()=>({ deltas:{ mood:10, health:2 }, bonds:{ friends:6 },
        lines:['你在原地站了十几分钟','走的时候心里松了一点'] }) },
      { text:'快步走过去', hint:'不回头看', run:()=>({ deltas:{ mood:-2, skill:2 },
        lines:['你没有停','但那天晚上还是梦到了'] }) },
    ] },
  { id:'lg_familiar_stranger', cat:'life', weight:12, minAge:20, maxAge:70,
    cond:(s)=>!!s.legacy,
    title:'一张很熟的脸', text:'街上一个人回头看了你一眼。那张脸你上一世见过，但这一世你们从没认识过。',
    choices:[
      { text:'上去搭话', hint:'也许能重新认识', run:({ rng })=> rng.chance(0.55)
        ? { deltas:{ mood:14, relations:10 }, bonds:{ friends:12 }, lines:['你们聊了很久','他说：感觉像认识你很久了'] }
        : { deltas:{ mood:-6 }, lines:['他礼貌地笑了笑就走了','你站在原地有点尴尬'] } },
      { text:'点头致意，各走各路', hint:'不打扰', run:()=>({ deltas:{ mood:4 }, lines:['你朝他点了点头','他也点了点头'] }) },
    ] },
  { id:'lg_final_thought', cat:'life', weight:12, minAge:62, maxAge:90,
    cond:(s)=>!!s.legacy,
    title:'想上一世的自己', text:'你忽然想起，自己好像活过一次了。那一次的你，会怎么看现在？',
    choices:[
      { text:'照上一世没做完的做下去', hint:'把遗憾补上', run:()=>({ deltas:{ mood:16, skill:3 },
        lines:['你去做了一件一直想做的事','做完之后，你说：这次总算'] }) },
      { text:'这一世已经够了', hint:'不比较', run:()=>({ deltas:{ mood:12, health:3 },
        lines:['你坐在院子里喝茶','两世都很好，不用分高下'] }) },
    ] },
];
EVENTS.push(...LEGACY_EVENTS);

/* ================= 成就系统 ================= */
const ACHIEVEMENTS = [
  /* 学业 */
  { id:'ach_hongbang',   cat:'学业', name:'红榜题名',   desc:'中考考上重点高中',       cond:(s)=>!!s.flags.goodHighSchool },
  { id:'ach_985',        cat:'学业', name:'金榜题名',   desc:'高考考入 985',           cond:(s)=>s.flags.university==='985' },
  { id:'ach_benke',      cat:'学业', name:'本科上岸',   desc:'高考达到一本线',         cond:(s)=>s.flags.university==='985'||s.flags.university==='一本' },
  { id:'ach_gaokao_top', cat:'学业', name:'高考状元',   desc:'高考分数达到 690',       cond:(s)=>(s.flags.gaokaoScore||0)>=640 },
  { id:'ach_master',     cat:'学业', name:'硕士帽',     desc:'取得硕士学位',           cond:(s)=>!!s.flags.masterDegree },
  { id:'ach_civil',      cat:'学业', name:'铁饭碗',     desc:'考公上岸',               cond:(s)=>s.flags.jobType==='civil' },
  { id:'ach_study10',    cat:'学业', name:'学而不厌',   desc:'一生进修学习 10 次以上', cond:(s)=>(s.counts.study||0)>=10 },
  /* 事业 */
  { id:'ach_first_job',  cat:'事业', name:'第一份工资', desc:'获得第一份正式工作',     cond:(s)=>!!s.flags.employed },
  { id:'ach_bigtech',    cat:'事业', name:'大厂入场券', desc:'进入大厂',               cond:(s)=>s.flags.jobType==='bigtech' },
  { id:'ach_promoted',   cat:'事业', name:'更进一步',   desc:'获得一次晋升',           cond:(s)=>!!s.flags.promoted },
  { id:'ach_hop',        cat:'事业', name:'人往高处走', desc:'跳槽成功',               cond:(s)=>!!s.flags.changedJob },
  { id:'ach_layoff',     cat:'事业', name:'重新出发',   desc:'经历过一次裁员并走出来', cond:(s)=>!!s.flags.laidOffOnce && !!s.flags.employed },
  { id:'ach_work12',     cat:'事业', name:'工作狂',     desc:'一生专注工作 12 次以上', cond:(s)=>(s.counts.work||0)>=12 },
  /* ── 疾病与意外（patch10 新增）── */
  /* ── 开局补齐的成就（patch34）── */
  { id:'ach_autofill', cat:'人生', name:'随遇而安', desc:'没选满特质就出发，并活到七十岁',
    cond:(s)=>(s.autoFilledTraits && s.autoFilledTraits.length > 0) && s.age>=70 },
  /* ── 上一世继承的成就（patch32）── */
  { id:'ach_legacy_back', cat:'人生', name:'带着痕迹回来', desc:'在继承上一世的开局里活到六十岁',
    cond:(s)=>!!s.legacy && s.age>=60 },
  { id:'ach_legacy_two', cat:'人生', name:'两世为人', desc:'继承上一世并解锁十项以上成就',
    // patch47：s.achievements 是「成就id → 解锁年份」的对象，.length 永远是 undefined，
    // 所以这个成就以前根本解锁不了。改成数 key 的个数。
    cond:(s)=>!!s.legacy && (s.achievements ? Object.keys(s.achievements).length : 0)>=10 },
  /* ── 三条新内容线的成就（patch31）── */
  { id:'ach_urban_twice', cat:'修仙', name:'两根绳',     desc:'修仙的同时升到管理岗或买下房子',
    cond: (s)=>!!s.flags.xianxia && ((s.cultivationLevel||0) >= 13 || !!s.flags.hasHouse) },
  { id:'ach_mortal_spouse', cat:'婚姻', name:'几十年',   desc:'与普通人成家并活到七十岁',
    cond:(s)=>!!s.flags.married && s.age>=70 },
  { id:'ach_friend_long', cat:'友情', name:'不止十年',   desc:'与老朋友重逢过并活到七十岁',
    cond:(s)=>!!s.flags.metOldFriend && s.age>=70 },
  { id:'ach_friend_care', cat:'友情', name:'一直在',     desc:'在老友病中常去看他',
    cond:(s)=>!!s.flags.caredForFriend },
  { id:'ach_child_root', cat:'家庭', name:'灯还留着',    desc:'孩子离家后仍与他保持联系到七十岁',
    cond:(s)=>!!s.flags.childLeft && s.bonds.child>=60 && s.age>=70 },
  /* ── 现实节点的成就（patch29）── */
  { id:'ach_sidebiz', cat:'事业', name:'两条腿走路',   desc:'做过副业并活到六十岁',     cond:(s)=>!!s.flags.sideBiz && s.age>=60 },
  { id:'ach_health_u',cat:'健康', name:'听劝的人',     desc:'认真改过生活方式并活到七十岁', cond:(s)=>!!s.flags.healthFixed && s.age>=70 },
  { id:'ach_grandpa', cat:'家庭', name:'隔代人',       desc:'亲手带过孙辈',             cond:(s)=>!!s.flags.helpingGrandkid },
  /* ── 都市修仙的成就（patch18）── */
  { id:'ach_urban_xian',  cat:'修仙', name:'红尘炼心',   desc:'在城市里修到金丹以上',
    cond:(s)=>!!s.flags.xianxia && (s.cultivationLevel||0)>=25 },
  { id:'ach_dao_and_job', cat:'修仙', name:'上班也修行', desc:'修仙的同时工作满十年',
    cond: (s)=>!!s.flags.xianxia && ((s.counts.cultivate||0)>=10 || ((s.counts.work||0)>=10 && !!s.flags.employed)) },
  /* ── 三条新内容线的成就（patch11）── */
  { id:'ach_biz_fail',   cat:'事业', name:'黄过一次',   desc:'创业失败后仍活到六十岁',
    cond:(s)=>!!s.flags.selfFailed && s.age>=60 },
  { id:'ach_care_giver', cat:'家庭', name:'一直在场',   desc:'为长辈的照护投入过时间',
    cond:(s)=>!!s.flags.caregiving && s.bonds.family>=70 },
  { id:'ach_late_love',  cat:'婚姻', name:'晚来的',     desc:'四十五岁之后才成家',
    cond:(s)=>!!s.flags.lateMarry },
  { id:'ach_illness_3',  cat:'健康', name:'扛过来了',   desc:'一生得过三次以上病并活到六十岁',
    cond:(s)=>((s.flags.illnessCount||0)>=3) && s.age>=60 },
  { id:'ach_no_illness', cat:'健康', name:'没怎么病过', desc:'活到七十岁，一次病也没得过',
    cond:(s)=>s.age>=70 && !(s.flags.illnessCount>0) },
  /* 财富 */
  { id:'ach_first100k',  cat:'财富', name:'第一个十万', desc:'存款达到 10 万',         cond:(s)=>s.attrs.money>=100000 },
  { id:'ach_house',      cat:'财富', name:'有瓦遮头',   desc:'买下自己的房子',         cond:(s)=>!!s.flags.hasHouse },
  { id:'ach_car',        cat:'财富', name:'四个轮子',   desc:'买下自己的车',           cond:(s)=>!!s.flags.hasCar },
  { id:'ach_rich',       cat:'财富', name:'财务自由',   desc:'存款达到 50 万',         cond:(s)=>s.attrs.money>=300000 },
  // patch152：-25000 → -8000。原值低于 MONEY_FLOOR(-10000)，数学上永远不可能。
  { id:'ach_debt',       cat:'财富', name:'负债累累',   desc:'账户跌到 -8000 以下',    cond:(s)=>s.attrs.money<=-8000 && s.age>=35 },
  /* 家庭 */
  { id:'ach_married',    cat:'家庭', name:'成家',       desc:'结婚',                   cond:(s)=>!!s.flags.married },
  { id:'ach_child',      cat:'家庭', name:'为人父母',   desc:'有了孩子',               cond:(s)=>!!s.flags.hasChild },
  { id:'ach_pet',        cat:'家庭', name:'铲屎官',     desc:'收养了一只猫或狗',       cond:(s)=>!!s.flags.pet },
  { id:'ach_caregiver',  cat:'家庭', name:'照顾者',     desc:'长期照顾家人',           cond:(s)=>!!s.flags.caregiving },
  { id:'ach_golden',     cat:'家庭', name:'金婚',       desc:'与伴侣走到 75 岁仍恩爱', cond:(s)=>!!s.flags.married&&s.bonds.lover>=85&&s.age>=75 },
  /* 健康 */
  { id:'ach_checkup',    cat:'健康', name:'年年体检',   desc:'认真做过体检',           cond:(s)=>!!s.flags.checkup },
  { id:'ach_gym',        cat:'健康', name:'办了卡真去', desc:'认真健身',               cond:(s)=>!!s.flags.gym },
  { id:'ach_therapy',    cat:'健康', name:'懂得求助',   desc:'接受过心理咨询',         cond:(s)=>!!s.flags.therapy },
  { id:'ach_iron',       cat:'健康', name:'铁打的身体', desc:'70 岁后健康仍在 85 以上', cond:(s)=>s.attrs.health>=85&&s.age>=70 },
  { id:'ach_100',        cat:'健康', name:'百岁人瑞',   desc:'活到 100 岁',            cond:(s)=>s.age>=100 },
  /* 兴趣 */
  { id:'ach_created',    cat:'兴趣', name:'作品被看见', desc:'创作被陌生人认可',       cond:(s)=>!!s.flags.created },
  { id:'ach_penpal',     cat:'兴趣', name:'笔友',       desc:'与笔友通了一整年的信',   cond:(s)=>!!s.flags.penpal },
  { id:'ach_travel',     cat:'兴趣', name:'在路上',     desc:'出去旅行过',             cond:(s)=>!!s.flags.travel },
  { id:'ach_moved',      cat:'兴趣', name:'换个城市',   desc:'搬到另一座城市生活',     cond:(s)=>!!s.flags.movedCity },
  { id:'ach_dance',      cat:'兴趣', name:'广场舞领队', desc:'加入广场舞',             cond:(s)=>!!s.flags.dance },
  { id:'ach_book',       cat:'兴趣', name:'藏书家',     desc:'珍藏了一本旧书',         cond:(s)=>!!s.flags.bookSaved },
  /* 修仙 */
  { id:'ach_xian',       cat:'修仙', name:'踏入仙途',   desc:'拜入修仙之门',           cond:(s)=>!!s.flags.xianxia },
  { id:'ach_root_high',  cat:'修仙', name:'上等灵根',   desc:'灵根为上等及以上（tier≥6）', cond:(s)=>rootTierOf(s)>=6 },
  { id:'ach_root_low',   cat:'修仙', name:'以勤补拙',   desc:'下等灵根仍修到金丹以上',   cond:(s)=>rootTierOf(s)>=0 && rootTierOf(s)<=2 && (s.cultivationLevel||0)>=25 },
  { id:'ach_jindan',     cat:'修仙', name:'金丹大成',   desc:'修炼到金丹期',           cond:(s)=>(s.cultivationLevel||0)>=25 },
  { id:'ach_feisheng',   cat:'修仙', name:'白日飞升',   desc:'飞升成仙',               cond:(s)=>!!s.flags.feisheng },
  /* 奇遇 */
  { id:'ach_zhua_book',  cat:'奇遇', name:'抓到了书',   desc:'抓周抓住一本书',         cond:(s)=>!!s.flags.zhuazhou_book },
  { id:'ach_zhua_money', cat:'奇遇', name:'抓到了钱',   desc:'抓周抓住一枚铜钱',       cond:(s)=>!!s.flags.zhuazhou_money },
  { id:'ach_zhua_med',   cat:'奇遇', name:'抓到了药罐', desc:'抓周抓住药罐/佛珠',      cond:(s)=>!!s.flags.zhuazhou_medicine },
  { id:'ach_fairy_no',   cat:'奇遇', name:'凡人的清醒', desc:'拒绝了仙缘',             cond:(s)=>!!s.flags.fairyRefused },

  /* ── 学业（8）── */
  { id:'ach_senior',     cat:'学业', name:'高中毕业',   desc:'完成高考',                 cond:(s)=>!!s.flags.gaokaoDone },
  { id:'ach_univ_admit', cat:'学业', name:'大学录取',   desc:'收到录取通知',             cond:(s)=>!!s.flags.university },
  { id:'ach_top3',       cat:'学业', name:'名列前茅',   desc:'重点高中 + 技能 60',       cond:(s)=>!!s.flags.goodHighSchool && s.attrs.skill>=60 },
  { id:'ach_phd',        cat:'学业', name:'博士',       desc:'硕士 + 学习 12 次以上',    cond:(s)=>!!s.flags.masterDegree && (s.counts.study||0)>=12 },
  { id:'ach_scholar_50', cat:'学业', name:'学无止境',   desc:'技能达到 85',              cond:(s)=>s.attrs.skill>=85 },
  { id:'ach_self_taught',cat:'学业', name:'自学成才',   desc:'学习 6 次以上',            cond:(s)=>(s.counts.study||0)>=8 },

  /* ── 婚姻（8）── */
  { id:'ach_first_love', cat:'婚姻', name:'第一次心动', desc:'写下第一封情书',           cond:(s)=>!!s.flags.firstCrush },
  { id:'ach_dating',     cat:'婚姻', name:'开始恋爱',   desc:'进入一段关系',             cond:(s)=>!!s.flags.dating },
  { id:'ach_honeymoon',  cat:'婚姻', name:'蜜月旅行',   desc:'婚后一起出去走走',         cond:(s)=>!!s.flags.married && !!s.flags.travel },
  { id:'ach_late_marry', cat:'婚姻', name:'晚婚',       desc:'40 岁之后才结婚',          cond:(s)=>!!s.flags.married && s.age>=40 },
  { id:'ach_silver',     cat:'婚姻', name:'银婚',       desc:'与伴侣走到 50 岁仍恩爱',   cond:(s)=>!!s.flags.married && s.bonds.lover>=70 && s.age>=50 },
  { id:'ach_divorce',    cat:'婚姻', name:'各自安好',   desc:'经历一次分手',             cond:(s)=>!!s.flags.brokeUp },
  { id:'ach_love_letter',cat:'婚姻', name:'一封信',     desc:'寄出／收到一封手写信',     cond:(s)=>!!s.flags.letter },
  { id:'ach_no_marry_ok',cat:'婚姻', name:'一个人也很好',desc:'未婚但关系健康',          cond:(s)=>!s.flags.married && s.attrs.relations>=70 },

  /* ── 工作（8）── */
  { id:'ach_interview',  cat:'工作', name:'第一次面试', desc:'投出第一份简历',           cond:(s)=>Number.isFinite(s.flags.jobScore) },
  { id:'ach_probation',  cat:'工作', name:'通过试用期', desc:'站稳脚跟',                 cond:(s)=>!!s.flags.probationDone },
  { id:'ach_raise',      cat:'工作', name:'第一次加薪', desc:'获得一次晋升',             cond:(s)=>!!s.flags.promoted },
  { id:'ach_team',       cat:'工作', name:'带团队的人', desc:'晋升 + 技能 70',           cond:(s)=>!!s.flags.promoted && s.attrs.skill>=70 },
  { id:'ach_retire',     cat:'工作', name:'光荣退休',   desc:'走完最后一天班',           cond:(s)=>!!s.flags.retired },
  { id:'ach_hire_back',  cat:'工作', name:'重新上岸',   desc:'被裁后再次就业',           cond:(s)=>!!s.flags.laidOffOnce && !!s.flags.employed },
  { id:'ach_soe',        cat:'工作', name:'国企人',     desc:'进入国企',                 cond:(s)=>s.flags.jobType==='soe' },
  { id:'ach_work_20',    cat:'工作', name:'三十年工龄', desc:'专注工作 20 次以上',       cond:(s)=>(s.counts.work||0)>=20 },

  /* ── 挣钱（8）── */
  { id:'ach_first_10k',  cat:'挣钱', name:'第一个一万', desc:'存款达到 1 万',            cond:(s)=>s.attrs.money>=10000 },
  { id:'ach_million',    cat:'挣钱', name:'百万富翁',   desc:'存款达到 100 万',          cond:(s)=>s.attrs.money>=800000 },
  { id:'ach_high_salary',cat:'挣钱', name:'高薪阶层',   desc:'存款达到 30 万',           cond:(s)=>s.attrs.money>=300000 },
  { id:'ach_invest',     cat:'挣钱', name:'投资获利',   desc:'理财 5 次以上',            cond:(s)=>(s.counts.finance||0)>=4 },
  { id:'ach_steady',     cat:'挣钱', name:'稳健理财',   desc:'理财 3 次 + 存款 10 万',   cond:(s)=>(s.counts.finance||0)>=3 && s.attrs.money>=80000 },
  { id:'ach_no_debt',    cat:'挣钱', name:'无债一身轻', desc:'50 岁后存款为正',          cond:(s)=>s.attrs.money>=50000 && s.age>=50 },
  { id:'ach_selfmade',   cat:'挣钱', name:'白手起家',   desc:'非富家出身却存到 50 万',   cond:(s)=>!(s.traitIds||[]).includes('richkid') && s.attrs.money>=500000 },
  { id:'ach_big_spend',  cat:'挣钱', name:'人生大事',   desc:'买下房或车',               cond:(s)=>!!s.flags.hasHouse || !!s.flags.hasCar },

  /* ── 运动（7）── */
  { id:'ach_sports_day', cat:'运动', name:'校运会',     desc:'站上过起跑线',             cond:(s)=>!!s.flags.sportsDayDone },
  { id:'ach_sports_fit', cat:'运动', name:'身体不错',   desc:'健康达到 80',              cond:(s)=>s.attrs.health>=85 && s.age>=40 },
  { id:'ach_peak',       cat:'运动', name:'巅峰体能',   desc:'健康达到 95',              cond:(s)=>s.attrs.health>=92 && s.age>=35 },
  { id:'ach_fit_old',    cat:'运动', name:'老当益壮',   desc:'70 岁后健康仍 75 以上',    cond:(s)=>s.attrs.health>=75 && s.age>=70 },
  { id:'ach_active_50',  cat:'运动', name:'动到五十',   desc:'50 岁后健康仍 70 以上',    cond:(s)=>s.attrs.health>=80 && s.age>=50 },
  { id:'ach_outdoor',    cat:'运动', name:'户外爱好者', desc:'旅行 + 健康 70',           cond:(s)=>!!s.flags.travel && s.attrs.health>=70 },
  { id:'ach_no_hospital',cat:'运动', name:'少去医院',   desc:'体检正常',                 cond:(s)=>!!s.flags.checkup && s.attrs.health>=70 },

  /* ── 修仙（7）── */
  { id:'ach_lianqi',     cat:'修仙', name:'练气期',     desc:'感气入体',                 cond:(s)=>(s.cultivationLevel||0)>=1 },
  { id:'ach_zhuji',      cat:'修仙', name:'筑基期',     desc:'道基初成',                 cond:(s)=>(s.cultivationLevel||0)>=13 },
  { id:'ach_yuanying',   cat:'修仙', name:'元婴期',     desc:'元婴出窍',                 cond:(s)=>(s.cultivationLevel||0)>=37 },
  { id:'ach_huashen',    cat:'修仙', name:'化神期',     desc:'神游太虚',                 cond:(s)=>(s.cultivationLevel||0)>=49 },
  { id:'ach_alchemy',    cat:'修仙', name:'炼丹有成',   desc:'成功炼出一炉丹',           cond:(s)=>!!s.flags.alchemyOk },
  { id:'ach_duel',       cat:'修仙', name:'切磋获胜',   desc:'赢下一场斗法',             cond:(s)=>!!s.flags.duelWin },
  { id:'ach_spirit_land',cat:'修仙', name:'灵脉主人',   desc:'发现并占据一条灵脉',       cond:(s)=>!!s.flags.hasLand },
  /* ── 灵根成就（patch7 新增 28 枚）── */
  { id:'ach_root_chaos_origin', cat:'修仙', name:'无属之始', desc:'混沌灵根修到金丹以上',
    cond:(s)=>s.flags.xianxia && (s.flags.constitution==='chaos_body' || s.flags.spiritRoot==='chaos_origin') && ((s) => (s.cultivationLevel || 0) >= 25)(s) },
  { id:'ach_root_daoti', cat:'修仙', name:'生而合道', desc:'先天道体修到筑基以上',
    cond:(s)=>s.flags.xianxia && (s.flags.constitution==='daoti' || s.flags.spiritRoot==='daoti') && ((s) => (s.cultivationLevel || 0) >= 13)(s) },
  { id:'ach_root_tian', cat:'修仙', name:'天灵根', desc:'测得天灵根',
    cond:(s)=>s.flags.xianxia && s.flags.spiritRoot==='tian' && (() => true)(s) },
  { id:'ach_root_jin', cat:'修仙', name:'金石之声', desc:'金灵根修到筑基以上',
    cond:(s)=>s.flags.xianxia && s.flags.spiritRoot==='jin' && ((s) => (s.cultivationLevel || 0) >= 13)(s) },
  { id:'ach_root_mu', cat:'修仙', name:'草木有心', desc:'木灵根救下一次人的性命',
    cond:(s)=>s.flags.xianxia && s.flags.spiritRoot==='mu' && ((s) => !!s.flags.savedChild)(s) },
  { id:'ach_root_shui', cat:'修仙', name:'水磨成针', desc:'水灵根走完水磨之期',
    cond:(s)=>s.flags.xianxia && s.flags.spiritRoot==='shui' && ((s) => !!s.flags.waterGrind)(s) },
  { id:'ach_root_huo', cat:'修仙', name:'炉火纯青', desc:'火灵根炼成一炉上品丹',
    cond:(s)=>s.flags.xianxia && s.flags.spiritRoot==='huo' && ((s) => !!s.flags.alchemyOk)(s) },
  { id:'ach_root_tu', cat:'修仙', name:'厚土载物', desc:'土灵根守脉十年',
    cond:(s)=>s.flags.xianxia && s.flags.spiritRoot==='tu' && ((s) => !!s.flags.guardedLand)(s) },
  { id:'ach_root_lei', cat:'修仙', name:'雷池一线', desc:'雷灵根入雷池而全身',
    cond:(s)=>s.flags.xianxia && s.flags.spiritRoot==='lei_x' && ((s) => (s.cultivationLevel || 0) >= 25)(s) },
  { id:'ach_root_hun', cat:'修仙', name:'神魂出游', desc:'魂灵根夜半魂游后生还',
    cond:(s)=>s.flags.xianxia && s.flags.spiritRoot==='hun_x' && ((s) => (s.cultivationLevel || 0) >= 13)(s) },
  { id:'ach_root_ri', cat:'修仙', name:'正午无影', desc:'日灵根借正午一线破境',
    cond:(s)=>s.flags.xianxia && s.flags.spiritRoot==='ri_x' && ((s) => (s.cultivationLevel || 0) >= 25)(s) },
  { id:'ach_root_yue', cat:'修仙', name:'月下问心', desc:'月灵根把心事看完',
    cond:(s)=>s.flags.xianxia && s.flags.spiritRoot==='yue_x' && ((s) => (s.attrs.mood || 0) >= 85)(s) },
  { id:'ach_root_feng', cat:'修仙', name:'御风而行', desc:'风灵根学会御风',
    cond:(s)=>s.flags.xianxia && s.flags.spiritRoot==='feng_x' && ((s) => (s.cultivationLevel || 0) >= 13)(s) },
  { id:'ach_root_bing', cat:'修仙', name:'冰心不染', desc:'冰灵根封心一诀而不失本心',
    cond:(s)=>s.flags.xianxia && s.flags.spiritRoot==='bing_x' && ((s) => (s.attrs.mood || 0) >= 80 && (s.cultivationLevel || 0) >= 25)(s) },
  { id:'ach_root_huan', cat:'修仙', name:'真幻两忘', desc:'幻灵根在真幻之间做出选择',
    cond:(s)=>s.flags.xianxia && s.flags.spiritRoot==='huan_x' && ((s) => (s.attrs.skill || 0) >= 70)(s) },
  { id:'ach_root_di', cat:'修仙', name:'地脉低语', desc:'地灵根接上一条地脉',
    cond:(s)=>s.flags.xianxia && s.flags.spiritRoot==='di_x' && ((s) => (s.cultivationLevel || 0) >= 25)(s) },
  { id:'ach_root_xue', cat:'修仙', name:'以血换境', desc:'血灵根取血冲关后活到六十岁',
    cond:(s)=>s.flags.xianxia && s.flags.spiritRoot==='xue_x' && ((s) => s.age >= 60 && (s.cultivationLevel || 0) >= 25)(s) },
  { id:'ach_root_dual_shu', cat:'修仙', name:'两系相借', desc:'相生双灵根修到金丹以上',
    cond:(s)=>s.flags.xianxia && s.flags.spiritRoot==='dual_shu' && ((s) => (s.cultivationLevel || 0) >= 25)(s) },
  { id:'ach_root_dual_ke', cat:'修仙', name:'相冲不溃', desc:'相克双灵根凝成金丹',
    cond:(s)=>s.flags.xianxia && s.flags.spiritRoot==='dual_ke' && ((s) => (s.cultivationLevel || 0) >= 25)(s) },
  { id:'ach_root_dual_tong', cat:'修仙', name:'同源归元', desc:'同类双灵根把两系合成一股',
    cond:(s)=>s.flags.xianxia && s.flags.spiritRoot==='dual_tong' && ((s) => (s.cultivationLevel || 0) >= 25)(s) },
  { id:'ach_root_dual', cat:'修仙', name:'双系同修', desc:'双灵根修到金丹以上',
    cond:(s)=>s.flags.xianxia && s.flags.spiritRoot==='dual' && ((s) => (s.cultivationLevel || 0) >= 25)(s) },
  { id:'ach_root_single', cat:'修仙', name:'一意孤行', desc:'单灵根修到元婴以上',
    cond:(s)=>s.flags.xianxia && [s.flags.spiritRoot==='jin',s.flags.spiritRoot==='mu',s.flags.spiritRoot==='shui',s.flags.spiritRoot==='huo',s.flags.spiritRoot==='tu',s.flags.spiritRoot==='lei',s.flags.spiritRoot==='bing',s.flags.spiritRoot==='feng',s.flags.spiritRoot==='guang',s.flags.spiritRoot==='an',s.flags.spiritRoot==='xue',s.flags.spiritRoot==='meng',s.flags.spiritRoot==='hun',s.flags.spiritRoot==='xu'].some(Boolean) && ((s) => (s.cultivationLevel || 0) >= 37)(s) },
  { id:'ach_root_triple', cat:'修仙', name:'勤能补拙', desc:'三灵根修到金丹以上',
    cond:(s)=>s.flags.xianxia && s.flags.spiritRoot==='triple' && ((s) => (s.cultivationLevel || 0) >= 25)(s) },
  { id:'ach_root_quad', cat:'修仙', name:'以勤证道', desc:'四灵根修到筑基以上',
    cond:(s)=>s.flags.xianxia && s.flags.spiritRoot==='quad' && ((s) => (s.cultivationLevel || 0) >= 13)(s) },
  { id:'ach_root_pseudo', cat:'修仙', name:'伪灵根的天花板', desc:'伪灵根修到筑基以上',
    cond:(s)=>s.flags.xianxia && s.flags.spiritRoot==='pseudo' && ((s) => (s.cultivationLevel || 0) >= 13)(s) },
  { id:'ach_root_chaos', cat:'修仙', name:'五系皆浊，我自走通', desc:'五行杂灵根修到练气以上',
    cond:(s)=>s.flags.xianxia && s.flags.spiritRoot==='chaos' && ((s) => (s.cultivationLevel || 0) >= 1)(s) },
  { id:'ach_root_tian_huashen', cat:'修仙', name:'天灵根化神', desc:'天灵根修到化神期',
    cond:(s)=>s.flags.xianxia && s.flags.spiritRoot==='tian' && ((s) => (s.cultivationLevel || 0) >= 49)(s) },
  { id:'ach_root_dual_yuanying', cat:'修仙', name:'双系同修至元婴', desc:'双灵根修到元婴以上',
    cond:(s)=>s.flags.xianxia && s.flags.spiritRoot==='dual' && ((s) => (s.cultivationLevel || 0) >= 37)(s) },
];
// patch11：把内容扩充的事件并进事件表
EVENTS.push(...CONTENT_EVENTS);

const ACH_BY_ID = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));

/* ===== patch177：跨轮回的历史成就 ===== */
const ACH_HISTORY_KEY = 'life_sim_ach_history_v1';

function readAchHistory() {
  try {
    if (typeof localStorage === 'undefined') return {};
    const raw = localStorage.getItem(ACH_HISTORY_KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    return (obj && typeof obj === 'object') ? obj : {};
  } catch (e) { return {}; }
}
function writeAchHistory(hist) {
  try {
    if (typeof localStorage === 'undefined') return false;
    localStorage.setItem(ACH_HISTORY_KEY, JSON.stringify(hist));
    return true;
  } catch (e) { return false; }
}
function mergeAchHistory(state, ach) {
  const hist = readAchHistory();
  const rec = hist[ach.id];
  if (rec) {
    rec.times = (rec.times || 1) + 1;
    rec.lastName = (state && state.name) || rec.lastName || '';
  } else {
    hist[ach.id] = {
      firstYear: (state && state.year != null) ? state.year : null,
      firstAge: (state && state.age != null) ? state.age : null,
      times: 1,
      lastName: (state && state.name) || '',
    };
  }
  writeAchHistory(hist);
}

function checkAchievements(draft, special) {
  if (!draft.achievements) draft.achievements = {};
  for (const ach of ACHIEVEMENTS) {
    if (draft.achievements[ach.id]) continue;
    let ok = false;
    try { ok = !!ach.cond(draft); } catch (e) { ok = false; }
    if (ok) {
      draft.achievements[ach.id] = draft.year;
      try { mergeAchHistory(draft, ach); } catch (e) {}   // patch177
      special(`【成就 · ${ach.cat}】${ach.name}`, ach.desc, 'achievement');
    }
  }
}

function resolveYear(draft, rng) {
  const stage = stageOf(draft.age);
  const trait = traitOf(draft);
  const m = modsOfState(draft); // patch6：改用所有选中特质合并后的 mods
  const weather = WEATHER_BY_ID[draft.pending.weatherId] || WEATHER_BY_ID.cloudy;
  const event = EVENTS.find((e) => e.id === draft.pending.eventId) || null;
  const action = ACTION_BY_ID[draft.pending.actionId] || null;
  const choice = event && event.choices && Number.isInteger(draft.pending.choice)
    ? event.choices[draft.pending.choice] : null;

  const deltas = [];
  const lines = [];
  const specials = [];
  // patch103：防护——有些事件的 run 会读 draft.counts.xxx，若未初始化会抛错，
  // 导致整条 patch 变成 {}、special（如「高考 XXX 分」）丢失。
  draft.counts = draft.counts || {};

  // patch58：**跨度补偿**——这一步跨了 N 年，收益/损失就该按 N 年累积。
  // 原来 attr() 完全不知道跨度，导致「五年做一件事」和「一年做一件事」加的分一样，
  // 粗粒度模式的数值累积只有一年一选的 1/3（实测技能中位 51.5 vs 69.8）。
  // 只放大**正收益**（扣减不放大，否则粗粒度模式会被惩罚得更惨）。
  // patch61：关系的补偿单独降幂——关系衰减已随跨度放大过（patch39），补偿再给满就双重加码。
  const spanGain = (key, s) => {
    const n = Math.max(1, Math.min(6, s || 1));      // 封顶 6 年，防止闭关跳年把收益放到失真
    // patch59：1.28 太猛（按节点关系长期高位冲到 91%、技能中位 84，比一年一选还高）。
    // 温和累积：1年→1.00　3年→1.17　5年→1.36
    // patch60：1.08 偏保守、1.28 过冲，取折中 1.15（1年→1.00　3年→1.32　5年→1.75）
    const base = Math.pow(1.15, n - 1);
    // patch61：关系的补偿降幂到 0.7（5 年时 1.75^0.7 ≈ 1.47）
    return key === 'relations' ? Math.pow(base, 0.7) : base;
  };
  function attr(key, raw, reason) {
    const before = draft.attrs[key];
    let v = raw;
    // patch58：正收益按本回合跨度补偿
    // patch71：**健康高位压制**——健康已经很高时，休息恢复大幅打折。
    // 原来 growthScale 在 90+ 只削 1~5%，等于「越健康越容易更健康」，
    // 所以一年一选（62 个回合、每回合都能休息）的健康长期停在高位（实测 80%）。
    if (v > 0) {
      v = v * spanGain(key, draft.crossedSpan || 1);
      if (key === 'health') {
        const hv = draft.attrs.health;
        if (hv >= 88) v *= 0.12;
        else if (hv >= 82) v *= 0.35;
        else if (hv >= 75) v *= 0.62;
      }
      // patch73：技能同样存在「越高越容易更高」的正反馈——
      // 一年一选 60 个回合反复学，技能长期高位率 62%（目标 <=45%）。
      // 压制幅度比健康温和（技能是主动投入换来的）。
      // patch134：技能压制**对齐健康的力度**（原来 90+/82+ 的 0.3/0.55 压不住，
      // 实测超高率 14~49%）。只改 skill 一档，其他维度一个字不动。
      if (key === 'skill') {
        const sv = draft.attrs.skill;
        if (sv >= 88) v *= 0.12;
        else if (sv >= 82) v *= 0.32;
        else if (sv >= 76) v *= 0.58;
      }
      // patch74：心情同样有「越高越容易更高」——五年一选长期高位 52%。
      // 压制比健康轻（心情是体验核心，不该让人觉得「开心也没用」）。
      // patch135：心情压制**对齐健康和技能**（原来 93+/86+ 的 0.3/0.6 太松，
      // 在「钱多就休息」的玩法下心情长期顶格，实测超高率 40%）。
      if (key === 'mood') {
        const mv = draft.attrs.mood;
        if (mv >= 88) v *= 0.12;
        else if (mv >= 82) v *= 0.32;
        else if (mv >= 76) v *= 0.58;
      }
    }
    if (key === 'money') {
      // patch142：**未成年人没有收入能力，所有支出由家里承担**（不扣钱）。
      // 现实里孩子上学、买书、参加活动都不是自己掏钱；让一个 10 岁角色
      // 用自己的存款付学费，本身就是错的。把 v 归零而不是 clamp，
      // 是为了让结算里显示「由家里承担」而不是「花了 0 元」。
      if (v < 0 && draft.age < 18) {
        v = 0;
        if (reason) reason = String(reason).replace(/[，,]?\s*[^，,]*$/, '') + '（由家里承担）';
      }
      if (v > 0) v = v * (m.moneyGain ?? 1); // patch6：金钱获得的倍率（只作用于收入，扣钱不放大）
      draft.attrs.money = clamp(Math.round(draft.attrs.money + v), MONEY_FLOOR, 99999999);
      v = draft.attrs.money - before;
    } else {
      let mod = 1;
      if (v > 0) mod = m[key + 'Gain'] ?? 1;
      else if (v < 0) mod = m[key + 'Loss'] ?? 1;
      if (key === 'relations') mod = v > 0 ? (m.relationGain ?? 1) : (m.relationDecay ?? 1);
      if (key === 'health') mod = v > 0 ? (m.healthGain ?? 1) : (m.healthDecay ?? 1);
      draft.attrs[key] = clamp(draft.attrs[key] + v * mod, 0, 100);
      v = draft.attrs[key] - before;
    }
    v = Math.round(v);
    if (!v) return;
    deltas.push({ key, value: v });
    // P0-4：给人看的文案走收紧；deltas 里的 value 保持原始数值
    if (reason) lines.push({ group: 'note', text: exactNumbersOn() ? reason : loosenNumbers(reason, { keepMoney: true }) });
  }
  function bond(key, v, reason) {
    const before = draft.bonds[key];
    let mod = 1;
    if (key === 'family') mod = v > 0 ? (m.familyGain ?? 1) : 1;
    if (key === 'friends') mod = v > 0 ? (m.relationGain ?? 1) : (m.relationDecay ?? 1);
    draft.bonds[key] = clamp(Math.round(before + v * mod), 0, 100);
    if (draft.bonds[key] !== before) {
      lines.push({ group: 'bond', text: reason || (v > 0 ? '关系更近了一点' : '关系淡了一点') });
    }
  }
  function note(text, group = 'note') { lines.push({ group, text: exactNumbersOn() ? text : loosenNumbers(text, { keepMoney: true }) }); }
  // patch25：本步跨了几年。时间轴按节点分配后，一步可能是 1 年，也可能 5-7 年，
  // 所以所有「这一年/下一年」的说法都要跟着跨度走。
  // 大于 4 年时说「这一段」更自然（说「这七年」有点怪）。
  const spanYears = Math.max(1, draft.crossedSpan || YEAR_SPAN || 1);
  const spanLabel = spanYears <= 1 ? '这一年' : (spanYears <= 4 ? ('这' + spanYears + '年') : '这一段');
  function special(title, text, source = 'event') { specials.push({ title, text, source }); }

  /* —— 岁月 —— */
  // patch39：年龄越大力不从心。原来是「75+ 才 1.1、60+ 才 1.2」，几乎不随年龄变化，
  // 加上休息恢复很快，健康就长期顶在高位（实测 92% 的局长期 ≥88）。
  let ageFactor = draft.age >= 85 ? 4.2 : draft.age >= 75 ? 3.4 : draft.age >= 65 ? 2.6
    : draft.age >= 55 ? 1.9 : draft.age >= 45 ? 1.4 : draft.age >= 35 ? 1.15 : 1;
  // patch64：**一年一选的年龄衰减单独加重**。
  // 它每回合只代表 1 年，spanFactor = 1.0（粗粒度是 1.4-1.7），所以它的衰减天然更弱，
  // 健康在中高位达到平衡后就不降（实测长期高位 81%）。这里按年龄线性补上。
  if (draft.timeMode === 'year') {
    ageFactor *= 1 + Math.max(0, draft.age - 35) * 0.06;    // patch68：0.045 下健康长期高位仍 80%   // patch65：0.022 力度不够，加大到 0.045   // 40岁×1.11　50岁×1.33　65岁×1.66　80岁×1.99
  }
  // patch85：**修仙者的健康衰减按境界大幅打折**。
  // healthAndLuckYear 把跨度拆成逐年跑（闭关 45 年 = 衰减 45 次），
  // 而闭关一次跳 10-45 年、休息只补 1 年——不修的话修仙者必然被健康耗死
  //（实测元婴/化神终局健康中位都是 0）。
  if (draft.flags && draft.flags.xianxia && (draft.cultivationLevel || 0) >= 1) {
    // patch92：**修仙者完全不按年自然衰减**。
    // 原来用 0.06~0.65 的折扣，但元婴一次闭关就是 3 万年，
    // 3 万年 × 每年衰减 × 0.12 依然会把健康扣到 0（实测直接扣死）。
    // 修仙者不老，健康只受事件（天劫/走火）影响，靠闭关慢慢回。
    ageFactor = 0;
  }
  // 跨度越长，这段时间的磨损也越多（原来跨 10 年和跨 1 年扣一样多）
  const spanFactor = 1 + Math.max(0, spanYears - 1) * 0.18;
  const healthDrop = stage.healthDecay * ageFactor * spanFactor * rng.float(0.85, 1.15);
  // patch165：**文案不再每次都一样**
  //   ① 从本次跨度里随机挑一年来叙述（"第 3 年"），让时间流更自然
  //   ② 身体感应 / 情绪回归各准备 6 句随机文案
  const _hpLines = [
    '身体先有了感应',
    '腰背开始有点沉',
    '熬夜后没那么容易缓过来了',
    '爬两层楼会喘一下',
    '眼睛看久了会发涩',
    '手上的力气小了一点',
  ];
  const _moodLines = [
    '情绪慢慢回到日常的水位',
    '心情不咸不淡',
    '日子过成了一杯温开水',
    '没什么大悲大喜',
    '情绪自己会找平衡',
    '心里那片水面，又平了',
  ];
  const _pickYear = (spanYears > 1 && rng && typeof rng.int === 'function') ? rng.int(1, spanYears) : 0;
  const _hpWhere = _pickYear ? `第 ${_pickYear} 年，` : '';
  const _hpLine = (rng && typeof rng.pick === 'function') ? rng.pick(_hpLines) : _hpLines[0];
  const _moodLine = (rng && typeof rng.pick === 'function') ? rng.pick(_moodLines) : _moodLines[0];
  attr('health', -healthDrop, spanYears <= 1 ? `又长一岁，${_hpLine}（${fmtDelta(-healthDrop)}）` : `${_hpWhere}${_hpLine}（${fmtDelta(-healthDrop)}）`);
  attr('mood', (25 - draft.attrs.mood) * 0.25, _moodLine);
  // patch39：关系随时间淡得更明显，并且跨度越长淡得越多（原来固定 -3.4，跨度多大都一样）
  // patch40：关系跌破谷底时漂移减半——否则一旦掉下去就再也回不来
  // （实测三种模式的关系长期低位率 41~57%）
  // patch41：关系很高时衰减更快（高关系需要持续投入才能维持）；
  // 一年一选再乘 1.5（它回合多、累积快）
  // patch42：跨度加成从 0.6 降到 0.35——三年一段的跨度为 3，
  // 原来要多扣 1.2 点/回合，青年段根本攒不起关系（实测结婚年龄中位 71 岁）
  const relationDrop = (3.0 + Math.max(0, spanYears - 1) * 0.35)
    * (draft.attrs.relations <= 25 ? 0.45 : draft.attrs.relations >= 80 ? 1.6 : 1)
    * (draft.timeMode === 'year' ? 1.5 : 1);
  attr('relations', -relationDrop, spanYears <= 1 ? '一年没有主动联系，有些人悄悄淡了' : spanYears + ' 年没怎么联系，有些人悄悄淡了');
  attr('skill', -2.0, '久不练手，手艺有点生（-2.0）');

  /* —— 持久效果（perks）：来自过往选择的长期复利 —— */
  applyPerks(draft, attr);

  /* —— 疾病 / 事故 / 天灾 / 幸运（patch10） —— */
  // patch20：跨度不再是常量，按时间表算（这一步实际走了几年，就逐次判几年）
  healthAndLuckYear(draft, rng, { attr, note, special, span: draft.crossedSpan || YEAR_SPAN });

  /* —— 里程碑前兆（patch21） —— */
  // 玩家反馈：大事往往是突然砸下来的，没有铺垫。
  // 这里在跨入关键节点的那一步，先给一句「要来的事」的伏笔。
  if (draft.crossedAges && draft.crossedAges.length) {
    const OMENS = {
      13: '初中的门一推开，节奏就完全不一样了。',
      16: '有些事开始进入倒计时——比如那场考试。',
      18: '成年这道门槛就在眼前，往后的路要自己挑了。',
      22: '校园的日子快要收尾，接下来该靠本事吃饭。',
      30: '身边人陆续安定下来，你也会开始想这件事。',
      60: '镜子里的自己和记忆里的不太一样了。',
      65: '该考虑把手上的事交给别人了。',
    };
    for (const a of draft.crossedAges) if (OMENS[a]) note(OMENS[a]);
  }

  /* —— 高考兜底（patch18，patch19 收窄到 19 岁） —— */
  // gaokaoDone 只由「高考出分」事件设置；玩家没选到它的话，整条大学链会断。
  // 玩家要求「高考必须在 17-19 岁之间，不允许提前也不允许拖」——
  // 所以兜底改成「17 岁那年收口」，不再允许拖。
  if (draft.age >= 18 && !draft.flags.gaokaoDone) {
    try {
      const sc = gaokaoScore(draft, rng);
      draft.flags.gaokaoDone = true;
      draft.flags.university = universityOf(sc);
      draft.flags.gaokaoScore = sc;
      note(`高考出分：${sc} 分，录取层次 ${draft.flags.university}`);
    } catch (e) { /* 兜底失败不该影响游戏 */ }
  }

  /* —— 房贷（patch76）：首付之后每年还，60 岁还清 —— */
  // 现实里买房是「首付 + 长期贷款」。原来 buy_house 要求一次性付清 50 万，
  // 而玩家终局金钱中位只有 15-35 万 → 这个最大的 sink 永远够不到（实测买房率 0%）。
  // 现在改成首付 12 万 + 每年 9000 的房贷，30 年总计约 39 万，接近原来的量级但**可达**。
  if (draft.flags && draft.flags.mortgage) {
    if (draft.age >= 60) {
      draft.flags.mortgage = false;
      note('最后一期房贷扣掉了。你对着还款记录看了一会儿，没说话。', 'good');
    } else {
      const _due = 7000 * Math.max(1, spanYears);
      attr('money', -_due, `房贷：${fmtMoney(_due)} 元`);
    }
  }

  /* —— 生活费 / 退休金 —— */
  const isMinor = draft.age < 18;
  // patch133：**刚成年时生活费低**——22 岁前多半是合租 / 家里帮衬，
  // 而这段时间工资还没起来，原来一刀切 0.38 会把年轻人按进负债。
  // patch138：负债时自动「节衣缩食」——生活费打 6 折（自适应，不是硬约束）
  const _broke = (draft.attrs.money || 0) < 0 ? 0.6 : 1;
  const _livingRate = (draft.age < 23 ? 0.20 : 0.38) * _broke;
  const living = isMinor ? 0 : Math.round(stage.cost * _livingRate * (m.costRate ?? 1) * (draft.age >= 65 ? 0.85 : 1));
  if (living > 0) attr('money', -living, `生活费 ${fmtMoney(living)} 元，静静扣掉了`);
  // patch137：未成年人读书不花钱（义务教育，家里出）。
  // 这一步是「金钱为负集中在童年」的根因——12 年固定支出把本金吃光。
  else if (isMinor && draft.age >= 4) note('学费和书本费，爸妈帮你出了');
  if (draft.age >= 65) {
    const pension = Math.round(5000 + draft.attrs.skill * 55 + draft.attrs.relations * 30);
    // patch12：一次结算覆盖 5 年时，这 5 年里从 65 岁那年起就该领退休金，
    // 所以按「跨过 65 之后的年数」补发，别让玩家白亏几年。
    const crossed65 = (draft.crossedAges || []).indexOf(65) >= 0;
    const yearsOfPension = crossed65 ? Math.max(1, draft.age - 65 + 1) : 1;
    attr('money', pension * yearsOfPension,
      yearsOfPension > 1
        ? `退休金到账：${fmtMoney(pension * yearsOfPension)} 元（这 5 年里从 65 岁开始领）`
        : `退休金到账：${fmtMoney(pension)} 元`);
    if (crossed65) note('从这一年起，收入从工资换成了退休金');
  }

  /* —— 自动结算事件（patch14）：玩家控制不了的事，不由他选 —— */
  if (draft.pending && draft.pending.autoPatch) {
    const ap = draft.pending.autoPatch;
    const ev = EVENTS.find((e) => e.id === ap.eventId) || null;
    // 显示成事件卡的一行，让玩家知道发生了什么（不是他能决定的事）
    // patch19：这些事不在回合里出现，统一在这里报告。
    // 文案上标明「不由你决定」，和玩家自己选的事区分开。
    special('不由你决定 · ' + (ev ? ev.title : '这件事'), ap.text, 'event');
    for (const k of Object.keys(ap.delta)) attr(k, ap.delta[k], null);
    if (draft.flags && draft.flags.recentEvents) {
      draft.flags.recentEvents = [ap.eventId].concat(draft.flags.recentEvents.filter((x) => x !== ap.eventId)).slice(0, 3);
    }
  }

  /* —— 事件选择 —— */
  if (choice) {
    const patch = choice.run({ rng, draft }) || {};
    const entries = Object.entries(patch.deltas || {});
    entries.forEach(([k, v], i) => attr(k, v, patch.lines && patch.lines[i] ? patch.lines[i] : null));
    const bonds = patch.bonds || {};
    for (const k of Object.keys(bonds)) bond(k, bonds[k], patch.bondLines && patch.bondLines[k]);
    for (const k of Object.keys(patch.flags || {})) draft.flags[k] = patch.flags[k];
    draft.perks = draft.perks || {};
    for (const [k, v] of Object.entries(patch.perks || {})) draft.perks[k] = (draft.perks[k] || 0) + v;
    // 初次入道：自动设为练气一层
    if (patch.flags && patch.flags.xianxia && !draft.cultivationLevel) draft.cultivationLevel = 1;
    if (patch.special) special(patch.special.title, patch.special.text);
  }

  /* —— 年度行动 —— */
  const streakN = (draft.streak.action === draft.pending.actionId ? draft.streak.n : 0) + 1;
  const isCultivate = draft.pending.actionId === 'cultivate' && !!draft.flags.xianxia;
  if (action || isCultivate) applyAction(draft, draft.pending.actionId, { rng, attr, bond, note, special, m, stage, weather, n: streakN });

  /* —— 天气 —— */
  attr('mood', weather.mood, `今年的主旋律是${weather.name}`);
  if (weather.health) attr('health', weather.health, `${weather.name}对健康不太友好`);
  if (weather.id === 'storm' && rng.chance(0.28)) note('雷阵雨那年，你错过了两趟航班和一桩生意');
  if ((weather.id === 'rainbow' || weather.id === 'dusk') && rng.chance(0.5)) note(`${weather.name}让你相信，好事值得等一等`);

  /* —— 年度小事（每年1-2个，丰富内容） —— */
  const smallCount = rng.chance(0.6) ? 2 : 1;
  for (let si = 0; si < smallCount; si++) {
    if (rng.chance(0.9)) {
      const pool = SMALL_EVENTS.filter((e) => {
        const last = draft.eventLog[e.id];
        return typeof last !== 'number' || draft.year - last >= 3;
      });
      if (pool.length) {
        const se = weightedPick(rng, pool, (e) => e.weight);
        const patch = se.run({ rng, draft }) || {};
        const entries = Object.entries(patch.deltas || {});
        entries.forEach(([k, v], i) => attr(k, v, patch.lines && patch.lines[i] ? patch.lines[i] : null));
        special(se.title, se.text || (spanYears <= 1 ? '这一年里一件很小很好的事。' : '这段时间里一件很小很好的事。'), 'small');
        draft.eventLog[se.id] = draft.year;
        // patch120：auto 事件的计数也挪到 beginYear（与候选一起记）
      }
    }
  }

  /* —— 年龄里程碑 —— */
  const ms = MILESTONES.find((x) => x.age === draft.age);
  if (ms) special(ms.title, ms.text, 'milestone');

  /* —— 属性里程碑（一次性） —— */
  const attrMilestones = [
    { key: 'skill', flag: 'ms_skill', title: '手艺到了被人信任的地步', text: '越来越多人来找你，说“这事你做得来”。' },
    { key: 'relations', flag: 'ms_relations', title: '被很多人稳稳地爱着', text: '生日那天，你数了数，来了十九个人。' },
    { key: 'money', flag: 'ms_money', title: '第一次觉得“可以不干了”', text: '账户里的数字，终于替你说了句话。' },
    { key: 'health', flag: 'ms_health', title: '身体成了你最拿得出手的资产', text: '体检报告干干净净，医生让你继续保持。' },
    { key: 'mood', flag: 'ms_mood', title: '快乐变成了一种能力', text: '你发现自己很久没有刻意高兴，却一直很高兴。' },
  ];
  for (const am of attrMilestones) {
    if (!draft.flags[am.flag] && draft.attrs[am.key] >= (am.key === 'money' ? 500000 : 90)) {
      draft.flags[am.flag] = true;
      special(am.title, am.text, 'milestone');
    }
  }

  /* —— 成就解锁 —— */
  checkAchievements(draft, special);

  /* —— 低状态温和提醒 —— */
  if (draft.attrs.health < 25) note('健康已经很低了，明年请务必善待自己', 'warn');
  if (draft.attrs.money < 0) note('账户是负的：明年要想办法补一补', 'warn');
  if (draft.attrs.mood < 25) note('心情跌得很低，记得这不是你的错', 'warn');

  /* —— 死亡判定（按真实分年龄死亡率，修仙者大幅降低） —— */
  if (!draft.died) {
    const baseP = annualMortality(draft);
    const p = baseP * xianxiaMortalityFactor(draft);
    if (rng.chance(p)) {
      draft.died = true;
      draft.deathCause = pickDeathCause(draft, rng);
      special('人生落幕', draft.deathCause, 'death');
    }
  }

  /* —— 记账 —— */
  if (event) {
    draft.eventLog[event.id] = draft.year;
    // patch120：计数已挪到 pickEventChoices（候选生成时），这里不再重复计
    // patch127：记录「本回合实际发生了什么」，下一回合据此排除
    draft.lastEventId = event.id;
  }
  draft.weatherHistory.push({ year: draft.year, age: draft.age, weatherId: weather.id });
  if (draft.weatherHistory.length > 400) draft.weatherHistory.shift();
  if (action || isCultivate) {
    const actId = action ? action.id : 'cultivate';
    if (draft.streak.action === actId) draft.streak.n += 1;
    else { draft.streak.action = actId; draft.streak.n = 1; }
    draft.counts[actId] = (draft.counts[actId] || 0) + 1;
  }

  const entry = {
    kind: 'year',
    year: draft.year,
    age: draft.age,
    stage: stage.name,
    weatherId: weather.id,
    weather: weather.name,
    actionId: action ? action.id : null,
    actionName: action ? action.name : (isCultivate ? '闭关修炼' : '平淡的一年'),
    eventTitle: event ? event.title : null,
    choiceText: choice ? choice.text : null,
    title: `${draft.age} 岁 · ${action ? action.name : '平淡的一年'}`,
    text: yearSummary(weather, event, lines, spanYears),
    deltas: deltas.slice(),
  };
  draft.journal.push(entry);
  // patch106：**高考分数统一在这里补 special**。
  // 不依赖哪个 gaokao_* 事件被选中——只要这一年刚算出分数（gaokaoScore 有值且还没报过），
  // 就补一条「高考 XXX 分」。这样成绩弹窗一定能触发。
  try {
    if (draft.flags && draft.flags.gaokaoScore != null && !draft.flags._gkSp) {
      draft.flags._gkSp = true;
      const _s = draft.flags.gaokaoScore;
      const _u = draft.flags.university || '';
      const _w = _s >= 630 ? '你考出了高中三年最好的成绩'
        : _s >= 530 ? '分数够上一个不错的学校'
        : _s >= 450 ? '有学上就行' : '接下来的路要更努力了';
      specials.push({ title: `高考 ${_s} 分`, text: `${_w}${_u ? '。录取层次：' + _u : ''}`, source: 'event' });
    }
  } catch (e) {}
  for (const sp of specials) {
    draft.journal.push({
      kind: 'special', source: sp.source, year: draft.year, age: draft.age,
      title: sp.title, text: sp.text, deltas: [],
    });
  }

  // patch21：标出自动事件（它没有玩家选择，手账里要写清楚）
  if (draft.journal && draft.journal.length) {
    const last = draft.journal[draft.journal.length - 1];
    if (last && last.kind !== 'special') {
      last.autoEvent = !!(draft.pending && draft.pending.autoPatch && draft.pending.autoPatch.eventId === last.eventId)
        || !!(event && event.auto);
    }
  }

  const forecastId = pickWeather(draft, rng);
  const report = {
    year: draft.year,
    age: draft.age,
    spanYears: spanYears,        // patch25：本步跨了几年（界面文案要用）
    spanLabel: spanLabel,
    stage: stage.name,
    weatherId: weather.id,
    weatherName: weather.name,
    actionId: action ? action.id : null,
    actionName: action ? action.name : '平淡的一年',
    eventTitle: event ? event.title : null,
    choiceText: choice ? choice.text : null,
    deltas,
    lines,
    specials,
    journal: entry,
    forecastId,
    ended: shouldEnd(draft),
  };
  draft.lastReport = report;
  draft.phase = 'settle';
  return report;
}

function yearSummary(weather, event, lines, span) {
  const seg = [span <= 1 ? `这一年的天气是${weather.name}。` : `这几年的天气是${weather.name}。`];
  if (event) seg.push(`${event.title}。`);
  lines.filter((l) => l.group !== 'warn').slice(0, 2).forEach((l) => seg.push(`${l.text}。`));
  return seg.join('');
}

/* ===== 疾病 / 事故 / 天灾与幸运（patch10 新增） =====
   玩家反馈：「完全生不了病」「多做点事故、天灾、幸运事件」。
   设计原则（这一版只加存在，不调难度）：
     1. 所有概率与数值都写成可读常量，不散落在逻辑里——以后统一调难度时只动这些数。
     2. 疾病是「一次一病」：state.flags.illness 存一个对象 { id, since }，
        同时只得一种，病着的时候不会再抽到新的病（避免 5 种病叠一起）。
     3. 天灾各只遭一次（flags.disasters 记账），幸运事件可重复。
     4. 触发时机在结算年里（resolveYear 的岁月漂移之后），与事件、行动互不干扰；
        死亡只写 died / deathCause，交给引擎原有的 shouldEnd 处理。
     5. 检测间隔 5 年一次：一年一检的话 80 年要判 80 次，病会太多。
*/
const DISEASE_CHECK_EVERY = 5;          // 每 5 年做一次得病判定（判定内部仍按年计数，与 YEAR_SPAN 无关）
const DISEASE_BASE_RATE = 0.06;         // 基础得病率（每次判定）
const DISEASE_MAX_HEALTH_PENALTY = 0.35; // 健康越差越容易得病（最多加到基准的 1.35 倍）

const DISEASES = [
  { id: 'cold', name: '一场重感冒', severity: 1, weight: 34,
    hp: 3, mood: 1, cost: 600, heal: 0.75,
    text: '换季的时候你到底没扛住，发烧躺了几天。' },
  { id: 'stomach', name: '胃病', severity: 1, weight: 20,
    hp: 4, mood: 2, cost: 1200, heal: 0.6,
    text: '常年不按点吃饭，胃先提出了抗议。' },
  { id: 'spine', name: '颈椎与腰椎的劳损', severity: 1, weight: 18,
    hp: 5, mood: 3, cost: 2000, heal: 0.55,
    text: '坐得太久，肩颈像锈住了一样，转头都费劲。' },
  { id: 'heart', name: '心血管的毛病', severity: 2, weight: 12, minAge: 45,
    hp: 10, mood: 4, cost: 26000, heal: 0.3,
    text: '检查报告上出现了几个不太好看的指标，医生说要注意了。' },
    { id: 'major', name: '一场重病', severity: 3, weight: 6,
    hp: 22, mood: 10, cost: 90000, heal: 0.1,
    text: '这场病来得很突然。治疗要花不少钱，也要耗掉很多时间。' },
    /* ===== patch174：补充的 3 个轻症（heal 都偏高，属于好得快的类型）===== */
  { id: 'flu', name: '一场流感', severity: 1, weight: 22,
    hp: 3, mood: 2, cost: 800, heal: 0.7,
    text: '全身酸痛，盖着被子还是冷。你请了三天假，睡得昏天黑地。' },
  { id: 'allergy', name: '过敏发作', severity: 1, weight: 16,
    hp: 2, mood: 3, cost: 1000, heal: 0.65,
    text: '不知道碰了什么，皮肤上起了一片。痒得整夜没睡好。' },
  { id: 'eyes_strain', name: '眼睛吃不消了', severity: 1, weight: 14, minAge: 35,
    hp: 3, mood: 2, cost: 2500, heal: 0.5,
    text: '看东西开始发虚，滴了眼药水也不管用。医生说该换副眼镜了。' },
  ];

const TREAT_COST_BASE = 5000;   // 治疗费 = 严重度 × 这个数
const TREAT_HEAL_BONUS = 0.3;   // 选择治疗后，当年痊愈概率加这么多
const SELF_HEAL_BASE = 0.25;    // 每年自愈基础概率
const DISEASE_FATAL_UNDER = 12; // 健康低于这个数、且病着，才可能因病去世

const ACCIDENT_BASE_RATE = 0.035; // 每年遇上一次事故的基础概率
const ACCIDENTS = [
  { id: 'commute', name: '通勤路上的事故', severity: 1, weight: 24, minAge: 16,
    hp: 6, mood: 3, cost: 2000,
    text: '上班路上被一辆电动车刮倒，膝盖和手掌都蹭破了皮。' },
  { id: 'work_injury', name: '工作中的意外', severity: 1, weight: 20, minAge: 18,
    hp: 8, mood: 3, cost: 3000,
    text: '手上的活出了岔子，机器比人反应快。' },
  { id: 'home_fall', name: '家里摔了一跤', severity: 1, weight: 18, minAge: 55,
    hp: 10, mood: 4, cost: 5000,
    text: '地上有水，你没看见。摔下去那一下，骨头和地板都很响。' },
  { id: 'car', name: '一场交通事故', severity: 2, weight: 12, minAge: 18,
    hp: 24, mood: 8, cost: 40000, fatal: 0.05,
    text: '那辆车冲出来的时候，你只来得及把方向盘往左打一点。' },
    { id: 'scam', name: '被骗了一笔钱', severity: 1, weight: 14, minAge: 20,
    hp: 0, mood: 10, cost: 0, fatal: 0,
    text: '对方说得太像真的了。等你反应过来，钱已经转出去了。' },
    /* ===== patch174：补充的 4 个事故（数值全部落在现有区间内）===== */
  { id: 'kitchen_burn', name: '厨房里烫了一下', severity: 1, weight: 20, minAge: 16,
    hp: 5, mood: 3, cost: 1500,
    text: '油锅溅起来的那一下，手背先反应过来。你冲了十分钟冷水。' },
  { id: 'bike_fall', name: '骑车摔了', severity: 1, weight: 18, minAge: 10,
    hp: 7, mood: 4, cost: 2500,
    text: '轮子卡进路沿的缝里，人和车一起倒下去。路边有人看了一眼，又走了。' },
  { id: 'stairs_miss', name: '楼梯上踩空', severity: 1, weight: 16, minAge: 40,
    hp: 9, mood: 4, cost: 4000,
    text: '最后一级台阶看错了。你抓住扶手，但膝盖还是磕在了棱角上。' },
  { id: 'bee_sting', name: '被蜂蛰了', severity: 1, weight: 22, minAge: 6,
    hp: 4, mood: 3, cost: 800,
    text: '它本来只是路过。你挥了一下手，它就当成了挑衅。' },
  ];

const DISASTER_BASE_RATE = 0.02; // 每年遇上一次天灾的基础概率
const DISASTERS = [
  { id: 'flood', name: '洪水', weight: 18, cost: 30000, mood: 8, once: true,
    text: '雨下了半个月，水漫过门槛，很多东西来不及搬。' },
  { id: 'quake', name: '地震', weight: 14, cost: 60000, mood: 10, fatal: 0.02, once: true,
    text: '夜里那一下摇晃，把所有人都摇醒了。' },
  { id: 'typhoon', name: '台风', weight: 18, cost: 12000, mood: 5, once: true,
    text: '风把窗户拍得直响，第二天街上到处是断下来的树枝。' },
  { id: 'drought', name: '旱灾', weight: 14, cost: 8000, mood: 5, once: true,
    text: '一整个季节没下雨，地都裂了。' },
    { id: 'industry_winter', name: '行业寒冬', weight: 20, cost: 0, mood: 10, hp: 3, once: true,
    text: '整个行业都在收缩，人心浮动，谁都怕下一个是自己。' },
    /* ===== patch174：补充的 3 个天灾 ===== */
  { id: 'hail', name: '一场冰雹', weight: 16, cost: 15000, mood: 6, once: true,
    text: '冰粒砸在窗上像有人抓了一把石子扔过来。阳台上的花全毁了。' },
  { id: 'blackout', name: '整片区停电', weight: 18, cost: 3000, mood: 5, once: true,
    text: '停了整整两天。冰箱里的东西化了一地，晚上点着蜡烛吃饭。' },
  { id: 'pest', name: '家里闹了虫鼠', weight: 15, cost: 6000, mood: 4, hp: 2, once: true,
    text: '先是听见墙里有声音，后来柜子角落出现了咬痕。折腾了半个月才清干净。' },
  ];

const LUCK_BASE_RATE = 0.05; // 每年遇上一次好运气的基础概率（比天灾高，玩家反馈要「幸运事件」）
const LUCKIES = [
  { id: 'lottery', name: '中了个大奖', weight: 16, gain: 30000,
    text: '随手买的那一张，中了个不大不小的奖。' },
  { id: 'lottery_big', name: '中了头奖', weight: 4, gain: 500000,
    text: '号码一个不差。你在兑奖处站了很久才相信是真的。' },
  { id: 'mentor', name: '遇上了贵人', weight: 22, gain: 0, skill: 6, relations: 8,
    text: '有个人愿意教你，而且不图什么。这种运气一辈子遇不上几次。' },
  { id: 'tailwind', name: '赶上了风口', weight: 18, gain: 0, incomeYears: 5, incomeBonus: 0.25,
    text: '你所在的行业忽然起来了，往后几年，钱会比以前好赚。' },
  { id: 'demolition', name: '拆迁补偿', weight: 10, gain: 260000, minAge: 22,
    text: '住了很多年的老房子要拆了，补偿款打过来那天，你盯着短信看了很久。' },
    { id: 'find', name: '捡到一笔', weight: 12, gain: 3000,
    text: '在旧外套口袋里翻出一笔早就忘了的钱。' },
    /* ===== patch174：补充的 4 个好运（都避开极端金额，gain 不超过 2 万）===== */
  { id: 'old_debt', name: '一笔旧账收回来了', weight: 12, gain: 8000,
    text: '你早就当这钱打水漂了。对方忽然转过来，还多给了两百说是利息。' },
  { id: 'good_teacher', name: '遇到一个肯教的人', weight: 16, gain: 0, skill: 5, relations: 6,
    text: '他把自己踩过的坑一个个讲给你听，讲完摆摆手说不用谢。' },
  { id: 'community', name: '碰上了一群同好', weight: 14, gain: 0, relations: 7, skill: 3,
    text: '原以为这种爱好只有你一个人在坚持，结果一屋子都是。' },
  { id: 'refund', name: '一笔退款到账', weight: 15, gain: 20000,
    text: '你都快忘了申诉过这件事。钱打回来那天，你在超市多买了两样东西。' },
  ];

/** 按权重抽一个；池子为空时返回 null。
 *  ★ 一定要用这个而不是 pool[pool.length-1] —— 幼儿期（<16 岁）的 ACCIDENTS 池是空的，
 *    直接取末位会拿到 undefined，接着读 .hp 就崩。这是实跑 800 局抓出来的 bug。 */
function pickWeighted(rng, pool) {
  if (!pool || !pool.length) return null;
  const total = pool.reduce((s, d) => s + d.weight, 0);
  let x = rng.next() * total;
  for (const d of pool) { x -= d.weight; if (x <= 0) return d; }
  return pool[pool.length - 1];
}

/** 得病判定 + 疾病推进 + 事故 + 天灾 + 幸运。在 resolveYear 的岁月漂移之后调用。 */
function healthAndLuckYear(draft, rng, ctx) {
  const { attr, note, special } = ctx;
  const f = draft.flags;
  // patch12：一次决策覆盖 YEAR_SPAN 年，这些判定要逐年跑。
  // 每次都用自己的概率，所以「一生得几次病」的口径与一年一选时一致。
  const span = (ctx && ctx.span) || 1;
  // 跨关键年龄的提示放在 span 判断之前：span>1 时下面会 return，放后面就永远不会执行
  if (!ctx._inner && draft.crossedAges && draft.crossedAges.length) {
    for (const a of draft.crossedAges) {
      if (a === 60) note('六十岁这年，身体和心态都换了档');
      else if (a === 65) note('到了该歇一歇的年纪');
      else if (a === 75) note('七十五岁以后，日子是按天算的');
      else if (a === 18) note('成年了。从这一年起，很多事要自己拿主意');
      else if (a === 22) note('该正式走进社会了');
    }
  }
  if (span > 1) {
    for (let i = 0; i < span; i++) {
      if (draft.died) break;
      healthAndLuckYear(draft, rng, { attr, note, special, _inner: true });
    }
    return;
  }


  /* ── 一、疾病 ── */
  // patch163：**修仙者不生病**。疾病判定是逐年跑的（跨 40 万年 = 40 万次），
  // 修仙者必然"得病 → 病死"，死因还写着凡人病症，与设定完全冲突。
  const _isCultivator = !!(draft.flags && draft.flags.xianxia && (draft.cultivationLevel || 0) >= 1);
  if (_isCultivator) { f.illness = null; }   // 入道前的旧病也一并清掉
  if (!_isCultivator && f.illness) {
    const def = DISEASES.filter((d) => d.id === f.illness.id)[0] || DISEASES[0];
    const years = draft.year - f.illness.since;
    attr('health', -def.hp, years === 0 ? null : '病还没走干净，体力一直没能完全回来');
    // 治疗或自愈
    const canPay = draft.attrs.money >= TREAT_COST_BASE * def.severity;
    if (years >= 1 && canPay && rng.chance(0.4)) {
      const fee = Math.round(TREAT_COST_BASE * def.severity * rng.float(0.8, 1.2));
      attr('money', -fee, '去医院做了系统的治疗');
      f.illness = null;
      note(def.name + '好了。那段时间落下的课，你慢慢补了回来');
    } else if (rng.chance(SELF_HEAL_BASE + def.heal * 0.3)) {
      f.illness = null;
      note('身体自己扛过去了，' + def.name + '不知不觉就好了');
    } else if (years >= 1) {
      note('这一年还是带着病在过，很多事只能推后');
    }
    // 重症 + 健康见底：有这个可能
    if (f.illness && def.severity >= 2 && draft.attrs.health <= DISEASE_FATAL_UNDER) {
      const p = def.severity >= 3 ? 0.35 : 0.15;
      if (rng.chance(p)) {
        draft.died = true;
        draft.deathCause = def.name + '拖得太久，身体终于撑不住了';
        return;
      }
    }
  } else if (!_isCultivator && (f.diseaseChecks = (f.diseaseChecks || 0) + 1) % DISEASE_CHECK_EVERY === 0) {
    const h = draft.attrs.health;
    let p = DISEASE_BASE_RATE;
    p *= 1 + Math.max(0, (60 - h) / 60) * DISEASE_MAX_HEALTH_PENALTY;
    if (draft.age >= 60) p *= 1.5;
    if (draft.age >= 75) p *= 1.4;
    if (draft.streak && draft.streak.action === 'work' && draft.streak.n >= 5) p *= 1.4;
    if (draft.attrs.mood < 40) p *= 1.2;
    const got = rng.chance(p) ? pickWeighted(rng, DISEASES.filter((d) => !d.minAge || draft.age >= d.minAge)) : null;
    if (got) {
      f.illness = { id: got.id, since: draft.year };
      f.illnessCount = (f.illnessCount || 0) + 1; // patch10：供成就判定
      attr('health', -got.hp, got.text);
      attr('mood', -got.mood, '病着的时候，什么事都变成了一件难事');
      special('生病 · ' + got.name, got.text + (got.severity >= 2 ? '这一场不轻，往后几年都要小心。' : ''), 'health');
      draft.perks = draft.perks || {};
      if (got.severity >= 2) draft.perks.treatmentNeed = (draft.perks.treatmentNeed || 0) + 1;
    }
  }

  /* ── 二、事故 ── */
  // patch170：**修仙者不遇凡人事故**（通勤/工伤/摔跤这些在几百万年的尺度下毫无意义，
  // 而且事故是逐年判定，修仙者必然撞上无数次）
  if (!draft.died && !_isCultivator) {
    let pa = ACCIDENT_BASE_RATE;
    const emp = f.employed;
    if (emp) pa *= 1.3;                                  // 上班通勤的人
    if (f.jobType === 'bigtech' || f.jobType === 'temp') pa *= 1.15;
    if (draft.age >= 60) pa *= 0.8;
    const acc = rng.chance(pa) ? pickWeighted(rng, ACCIDENTS.filter((d) => !d.minAge || draft.age >= d.minAge)) : null;
    if (acc) {
      const got = acc;
      if (got.hp) attr('health', -got.hp, got.text);
      else attr('mood', -got.mood, got.text);
      if (got.mood && got.hp) attr('mood', -got.mood, null);
      if (got.cost) attr('money', -Math.round(got.cost * rng.float(0.6, 1.4)), '这一下花掉的钱');
      note(got.text);
      special('意外 · ' + got.name, got.text, 'health');
      if (got.fatal && rng.chance(got.fatal)) {
        draft.died = true;
        draft.deathCause = got.name;
        return;
      }
    }
  }

  /* ── 三、天灾（各只遭一次） ── */
  if (!draft.died && !_isCultivator) {
    let pd = DISASTER_BASE_RATE;
    if (draft.age >= 20 && draft.age <= 70) pd *= 1.2;
    const seen = f.disasters || {};
    const dis = rng.chance(pd) ? pickWeighted(rng, DISASTERS.filter((d) => !seen[d.id])) : null;
    if (dis) {
      {
        const got = dis;
        f.disasters = seen; f.disasters[got.id] = draft.year;
        if (got.cost) attr('money', -Math.round(got.cost * rng.float(0.5, 1.5)), got.text);
        if (got.hp) attr('health', -got.hp, null);
        attr('mood', -got.mood, null);
        note(got.text);
        special('天灾 · ' + got.name, got.text, 'health');
        if (got.fatal && rng.chance(got.fatal)) {
          draft.died = true;
          draft.deathCause = got.name;
          return;
        }
      }
    }
  }

  /* ── 四、幸运（可重复） ── */
  if (!draft.died && !_isCultivator) {
    let pl = LUCK_BASE_RATE;
    if (draft.attrs.mood >= 70) pl *= 1.2;   // 心情好的人更容易注意到机会
    const luck = rng.chance(pl) ? pickWeighted(rng, LUCKIES.filter((d) => !d.minAge || draft.age >= d.minAge)) : null;
    if (luck) {
      const got = luck;
      if (got.gain) attr('money', Math.round(got.gain * rng.float(0.8, 1.2)), got.text);
      if (got.skill) attr('skill', got.skill, null);
      if (got.relations) attr('relations', got.relations, null);
      if (got.incomeYears) {
        draft.perks = draft.perks || {};
        draft.perks.tailwind = (draft.perks.tailwind || 0) + got.incomeYears;
        f.tailwindBonus = got.incomeBonus;
      }
      attr('mood', 6, null);
      note(got.text);
      special('好运 · ' + got.name, got.text, 'health');
    }
  }
}

/* ---------------- 六种行动的结算 ---------------- */
function applyAction(draft, actionId, ctx) {
  const { rng, attr, bond, note, special, m, stage, weather, n } = ctx;
  const a = draft.attrs;
  const wet = !!weather.wet;

  if (actionId === 'work') {
    const retireFactor = draft.age >= 65 ? 0.35 : draft.age >= 60 ? 0.7 : 1;
    const agePay = 1 + Math.max(0, draft.age - 26) * 0.012;
    const fatigue = n >= 5 ? 0.62 : n === 4 ? 0.76 : n === 3 ? 0.88 : 1;
    const kidPay = draft.age < 18 ? 0 : 1;
    const jobType = draft.flags.jobType || 'normal';
    const jobMult = jobType === 'bigtech' ? 1.3 : jobType === 'civil' ? 0.6 : jobType === 'soe' ? 0.8 : jobType === 'master' ? 1.2 : jobType === 'temp' ? 0.7 : 1;
    const base = kidPay === 0
      ? rng.float(200, 800)
      : (20000 + a.skill * 240 + a.relations * 70) * stage.workFactor * agePay * retireFactor * jobMult;
    const weatherFactor = weather.id === 'drizzle' ? 0.94 : weather.id === 'rainbow' ? 1.05 : 1;
    // patch138：负债时「被逼着更拼」——收入 ×1.5（自适应，不是放宽，是让玩家真的会去赚钱）
    const _hustle = (draft.attrs.money || 0) < 0 ? 1.5 : 1;
    const income = Math.round(base * (m.workGain ?? 1) * fatigue * weatherFactor * _hustle * rng.float(0.9, 1.12));
    const kidJob = draft.age < 18;
    attr('money', income, kidJob
      ? `打零工赚了点零花钱：${fmtMoney(income)} 元`
      : `工资到账：${fmtMoney(income)} 元（技能 ${a.skill} · 人脉 ${a.relations} · 年资加成）`);
    const civil = draft.flags.jobType === 'civil';
    const hp = (draft.age >= 60 ? 2.8 : draft.age < 18 ? 0.5 : civil ? 0.5 : 1.5) * Math.min(1.8, 1 + (n - 1) * 0.1);
    attr('health', -hp, civil ? '朝九晚五，身体没什么负担' : `工作对身体的磨损（${fmtDelta(-hp)}）`);
    attr('mood', civil ? -0.5 : -(3.2 * (n >= 4 ? 1.6 : 1)), civil ? '稳定但有点无聊' : '重复的工作日让心情有点褪色');
    if (n >= 5) note('连续第五年把全部时间交给工作，倦怠是真的', 'warn');
    if (draft.age >= 65) note('这个年纪还在认真工作，钱和尊重都该有一份');
  } else if (actionId === 'study') {
    const ageCost = 1 + Math.max(0, draft.age - 25) * 0.035;
    // patch136：**未成年人学费只算 10%**——义务教育，大头家里出。
    // 原来 18 岁前也按成人价 5500 扣，导致穷孩子童年直接负资产。
    // patch137：未成年人进修也不收学费（原来 10% 仍要扣，累积起来照样吃掉本金）
    const minorDiscount = draft.age < 18 ? 0 : 1;
    const tuition = Math.round(5500 * ageCost * (m.learnCost ?? 1) * (draft.age >= 60 ? 0.6 : 1) * minorDiscount);
    if (a.money >= tuition) {
      attr('money', -tuition, `学费与书本：${fmtMoney(tuition)} 元`);
      // patch39：学习收益提高一点，并在中年之后仍保有相当的效率
      // （实测技能终值中位只有 37.7，是五个维度里最弱的）
      // patch41：技能也越高越难涨（一年一选实测技能中位 88.4）
      const modeScale = (draft.timeMode === 'year') ? 0.75 : 1;
      const gain = (draft.age >= 60 ? 4.5 : draft.age >= 45 ? 9 : 10) * rng.float(0.8, 1.2)
        * growthScale(draft.attrs.skill) * modeScale;
      attr('skill', gain, `系统学习带来的进步（${fmtDelta(gain)}）`);
      attr('mood', -2.5, '考试季的焦躁还是会紧张');
      if (rng.chance(0.3)) attr('relations', 3, '认识了几个聊得来的同学');
    } else {
      attr('skill', 3, '付不起学费，你在图书馆自学了一年'); // patch6：skillGain 交给 attr()
      attr('mood', -1.5, '想学的很多，能付的很少');
      note('学费不够，这一年只能靠公开课和自己', 'warn');
    }
  } else if (actionId === 'rest') {
    // patch39：恢复也随年龄递减——年轻睡得回来，年老睡不回来。
    // 原来是固定 6~10，跟时间衰减（最多 1 点）差了一个数量级，所以健康永远满格。
    const recoverFactor = draft.age >= 75 ? 0.38 : draft.age >= 65 ? 0.5 : draft.age >= 55 ? 0.64
      : draft.age >= 45 ? 0.78 : draft.age >= 35 ? 0.9 : 1;
    // patch40：一年一选模式的回合数约是按节点的 3 倍，恢复机会也多 3 倍，
    // 所以这个模式单独再压 35%（否则健康长期高位率达 99%）。
    // patch42：一年一选 70 个回合、恢复机会是别人的 3 倍，0.65 还不够
    // patch63：一年一选 69 个回合、每回合都能恢复，健康长期高位率 81%
    // （粗粒度只有 21-33%，因为它靠跨度吃过补偿、恢复次数少）。
    // 再压到 0.28：让它「恢复次数多、但每次都少」。
    const modeFactor = (draft.timeMode === 'year') ? 0.28 : 1;
    // patch41：健康越高，休息恢复越少（避免一直满格）
    const hg = rng.float(6, 10) * recoverFactor * modeFactor * growthScale(draft.attrs.health); // patch6：healthGain 交给 attr()
    attr('health', hg, `好好睡觉、按时吃饭（${fmtDelta(hg)}）`);
    attr('mood', rng.float(3, 5), '心情从睡眠里一点点回来'); // patch6：moodGain 交给 attr()
    attr('money', -Math.round(stage.cost * 0.2), '休息年没有工资，额外动用了积蓄');
    if (n >= 3) {
      attr('mood', -4, '闲到第三年，开始有点发慌');
      note('休息很舒服，但人也需要一点点被需要', 'warn');
    }
  } else if (actionId === 'social') {
    const wetPenalty = wet ? 0.85 : 1;
    // patch39：社交收益随年龄递减（年纪大了，维系关系更费力也更值钱）
    const socialFactor = draft.age >= 75 ? 0.55 : draft.age >= 65 ? 0.68 : draft.age >= 55 ? 0.8
      : draft.age >= 45 ? 0.9 : 1;
    // patch41：越高越难涨；一年一选模式再乘 0.7（它回合最多，累积最猛）
    const modeScale = (draft.timeMode === 'year') ? 0.7 : 1;
    const rg = rng.float(10, 16) * wetPenalty * socialFactor * growthScale(draft.attrs.relations) * modeScale;
    attr('relations', rg, `聚会、通话与互相惦记（${fmtDelta(rg)}）`);
    bond('friends', rng.float(6, 12), '朋友又多了一圈');
    attr('money', -Math.round(stage.cost * 0.35), '人情往来与聚餐开销');
    attr('mood', 3, '被人接住的感觉很好');
    if (wet) note('雨天出门的人少了一半，但你还是见到了想见的人');
    // patch70：pMeet 提到外层（patch69 误把它嵌在 rng.chance(0.5) 里面，等于打了对折）。
    // 单身时更容易遇到人——粗粒度模式婚育窗口只有约 8 个回合，不这样攒不到 propose 门槛。
    if (draft.age >= 18 && draft.age <= 45 && draft.bonds.lover < 75) {
      const __single = !draft.flags.married && (draft.bonds.lover || 0) < 45;
      if (rng.chance(__single ? 0.75 : 0.3)) {
        bond('lover', __single ? 34 : 18, '爱情来得比计划早一点');
        attr('mood', 6, '恋爱了，世界突然有了滤镜');
        draft.flags.dating = true;
        special('遇见了一个人', '从一次聚会开始，到很多个晚安结束。');
      }
    }
    if (rng.chance(0.18)) {
      attr('skill', 3, '聊天中得到一个新机会的线索');
      note('席间有人提到一个机会，你记在了备忘录里');
    }
  } else if (actionId === 'create') {
    attr('mood', rng.float(4, 6) * (m.createGain ?? 1), '做喜欢的事，心情自己会亮'); // patch6：创作收获
    // patch41：创作带来的技能成长同样递减
    attr('skill', rng.float(2, 4) * (m.createGain ?? 1) * growthScale(draft.attrs.skill), '手艺在练习里变好');
    attr('money', -Math.round(stage.cost * 0.2), '材料、课程与工具');
    if (rng.chance(0.2 * (m.specialChance ?? 1) * (m.createGain ?? 1))) {
      const pool = [
        { title: '作品第一次被陌生人看见', text: '有人留言说：“谢谢你把它做出来。”' },
        { title: '参加了一次市集', text: '摊位第一天只卖出一件，你却记了很多年。' },
        { title: '写完了一首自己的歌', text: '旋律很普通，歌词很诚实。' },
      ];
      const sp = rng.pick(pool);
      special(sp.title, sp.text);
      attr('mood', 6, sp.title);
      attr('skill', 4, '创作被看见，也学到了很多');
      draft.flags.created = true;
    }
    if (n >= 3) {
      attr('mood', -3, '连续第三年没什么读者，热情被磨掉一点');
      note('热爱也需要一点点回声', 'warn');
    }
  } else if (actionId === 'finance') {
    if (a.money < 5000) {
      note('本金太少，理财无从下手——这一年只能看着账户叹气', 'warn');
      attr('mood', -1, '想钱生钱，钱还不够');
    } else {
      const rate = 0.045 + a.skill * 0.0006 + a.relations * 0.0004 + rng.float(-0.06, 0.06) * (m.financeRisk ?? 1);
      let gain = a.money * rate;
      if (a.money > 200000) gain *= 0.5;
      if (a.money > 1000000) gain *= 0.5;
      gain = Math.round(gain * (m.financeGain ?? 1));
      attr('money', gain, `投资回报：${fmtDelta(gain)} 元（眼光与运气各占一半）`);
      attr('mood', -2.5, '盯盘的一年，心情跟着曲线起伏');
      attr('relations', -1, '忙着看数字，联系变少了');
      if (rate < 0) note('今年市场不太好，亏了一点，也学会了一点', 'warn');
      if (n >= 3) {
        attr('mood', -4, '连续几年只在数字里生活，错过很多真实的东西');
        note('钱很重要，但生活不全是钱', 'warn');
      }
    }
  } else if (actionId === 'cultivate' && draft.flags.xianxia) {
    // 闭关修炼
    const results = cultivate(draft, rng, m); // patch6：把特质倍率传进去
    for (const r of results) {
      if (r.breakthrough) {
        special(r.text.split('】')[0].slice(1), r.text.split('】')[1] || r.text);
        attr('mood', 8, '突破的喜悦');
      } else if (r.danger) {
        note(r.text, 'warn');
      } else {
        note(r.text);
      }
    }
    attr('health', -1, '闭关耗神');
    attr('relations', -3, '闭关一年，与世隔绝');
  }
}

// ===== src/ending.js =====
// 结局生成：不按单一分数排名，而是根据一路的选择给出不同的人生风格与个性化总结





const STYLE_TEXT = {
  relations: {
    name: '关系丰盛',
    blurb: '你把一生过成了一张温暖的网：很多人因为你，觉得人间值得。',
    closing: '临终前你想起的不是某件大事，而是很多张笑脸。这一生，爱是主线。',
  },
  career: {
    name: '事业有成',
    blurb: '你在自己的领域里站住了脚，后来者踩着你的脚印往前走。',
    closing: '你留下的作品与规矩，比你活得更久一些。',
  },
  wealth: {
    name: '稳稳的幸福',
    blurb: '你把日子打理得妥帖，有钱、有健康、有心气，很少大起大落。',
    closing: '一生平稳是很难的事，你做到了，而且做得很好看。',
  },
  calm: {
    name: '平静满足',
    blurb: '你不追风口，也不与人较劲，把自己的小日子过成了别人羡慕的样子。',
    closing: '你走得很安静，像一场下得恰到好处的雨。',
  },
  explore: {
    name: '不断探索',
    blurb: '你一辈子都在学新东西、去新地方，年龄从没成为你的边界。',
    closing: '好奇心陪你到了最后一天，你从未真正变老。',
  },
  art: {
    name: '手艺人',
    blurb: '你靠一双手和一点审美活了一生，作品里全是你认真过的证据。',
    closing: '后来有人在旧物市拿起你的作品，轻轻吹掉上面的灰。',
  },
  wander: {
    name: '四海为家',
    blurb: '你的行李比家具多，地图上全是你的脚印，家在哪里都能搭起来。',
    closing: '你把一生走成了一条很长的路，路上都是风景。',
  },
  scholar: {
    name: '终身学习者',
    blurb: '你把一生过成了一场漫长的自习：书越读越厚，人越读越安静。',
    closing: '你最后记住的不是答案，而是那些终于想通了的夜晚。',
  },
  caregiver: {
    name: '被需要的人',
    blurb: '你把自己活成了别人的退路：家里出事时，第一个被想起的总是你。',
    closing: '你没什么惊天动地的成就，但很多人的安稳，是你托着的。',
  },
  survivor: {
    name: '与身体和解',
    blurb: '身体给过你很多次警告，你学会了不再跟它较劲，而是慢慢陪它走。',
    closing: '你赢的不是健康，是接受。这比赢难得多。',
  },
  hermit: {
    name: '低欲望的清醒',
    blurb: '你不追风口，不攒人头，把生活削到只剩真正需要的几样东西。',
    closing: '你算过一笔账：少要一点，反而够用很久。',
  },
  immortal: {
    name: '此身已非尘世客',
    blurb: '你走的是另一条路：别人的一生是几十年，你的计量单位是"劫"。',
    closing: '后来山下的人只在传说里见过你——云深不知处。',
  },
  plain: {
    name: '平凡而独特',
    blurb: '你没有惊天动地的故事，但认真活过的每一天都在悄悄发光。',
    closing: '普通人的生活也有自己的史诗，你这一篇，写得不错。',
  },
  short: {
    name: '匆匆一生',
    blurb: '身体提前叫停了这一程。你走过的年岁不多，但每一年都不含糊。',
    closing: '有些花开得短，可那几天，整条街都是香的。',
  },
};

function mainActionOf(entries) {
  const tally = {};
  for (const e of entries) if (e.actionId) tally[e.actionId] = (tally[e.actionId] || 0) + 1;
  let best = null;
  for (const k of Object.keys(tally)) if (!best || tally[k] > tally[best]) best = k;
  return best ? ACTION_BY_ID[best] : null;
}

const STAGE_COMMENT = {
  work: '那几年你把大部分时间交给了工作，也换来了安身立命的底气。',
  study: '那几年你在不停地学，世界因此在你面前宽了一圈。',
  rest: '那几年你把自己照顾得很好，慢也是种进度。',
  social: '那几年你热闹地活着，认识了很多重要的人。',
  create: '那几年你做了不少“没什么用但很喜欢”的事。',
  finance: '那几年你和数字打了很久的交道，账户老实记录了结果。',
};


/* ================= 结局卡池 =================
   按"闪光点"匹配：稀有度分层（legend > rare > uncommon > common）优先，
   同层内按 prio 排序。未命中任何卡时回落到基础风格（STYLE_TEXT）。 */
const ENDING_CARDS = [
  /* ───── 灵根专属结局（23 张，一灵根一张；另 3 种灵根复用下面的 root_tian / root_chaos / root_pseudo）─────
     口径：prio 按灵根品级分档。仙途卡池只留「prio ≥ 该境界最高分 × 0.85」的卡，所以 prio 越低能进的档位越少：
       tier 9（传说）104 → 到化神档（阈值 100.3），进不了飞升档（105.4）
       tier 8（顶级） 94 → 到金丹档（88.4），进不了元婴档（95.2）
       tier 6（上等） 90 → 到金丹档
       tier 5（中上） 90 → 到金丹档
       tier ≤4       76 → 只在筑基档（76 ≥ 74.8 进得去，76 < 88.4 进不了金丹档）
     match 的条件是「灵根 id 命中 + 修为层数达标」，层数门槛让同一张卡不在一入道就出现。 */
  { id:'root2_chaos_origin', name:'无属之始', rarity:'legend', prio:104,
    blurb:'石头说不清你是什么。五系俱在你经脉里，谁也没能压过谁，你只好自己定一条路走。',
    closing:'后来有人问你是什么灵根。你想了很久，说：不知道，反正我修成了。',
    match:(s,c)=>c.root==='chaos_origin' && c.level>=1 },
  { id:'root2_daoti', name:'生而合道', rarity:'legend', prio:104,
    blurb:'你没学过引气，周天自己就转。老道把测灵石收起来那天说：不必测了。',
    closing:'你这一生没跟谁争过什么。你只是站着，天就自己向你这边倾了一点。',
    match:(s,c)=>c.root==='daoti' && c.level>=1 },
  { id:'root2_jin', name:'金石之声', rarity:'rare', prio:90,
    blurb:'你的金气比谁都快，也比谁都利。头三年，你先伤的是自己。',
    closing:'你后来出手极稳。稳的人是从被自己割伤的那些年里长出来的。',
    match:(s,c)=>c.root==='jin' && c.level>=13 },
  { id:'root2_mu', name:'草木有心', rarity:'rare', prio:90,
    blurb:'你腕上的擦伤当着老道的面收了口。他点点头，说木灵根活得久，也救得了人。',
    closing:'你这一生救过的人比你记得的多。药圃里那株灵芝还在，长得比谁都慢。',
    match:(s,c)=>c.root==='mu' && c.level>=13 },
  { id:'root2_shui', name:'水磨之期', rarity:'rare', prio:90,
    blurb:'同门三年筑基，你还在练气九层。老道给了你一块石头和一碗水，让你自己选。',
    closing:'第十一年，石头没了。你也没跟谁说起过这件事。',
    match:(s,c)=>c.root==='shui' && c.level>=13 },
  { id:'root2_huo', name:'炉火纯青', rarity:'rare', prio:90,
    blurb:'你的火来得又快又猛。丹炉炸过三次，手背上留着三处浅疤。',
    closing:'第四次，你炼成了。开炉那一刻你没有笑，只是把手在衣襟上擦了擦。',
    match:(s,c)=>c.root==='huo' && c.level>=13 },
  { id:'root2_tu', name:'厚土载物', rarity:'rare', prio:90,
    blurb:'门里派人去守灵脉，十年不许离开，也不能进境。你举手说我去。',
    closing:'十年里什么也没发生。这本身就是最好的事。',
    match:(s,c)=>c.root==='tu' && c.level>=13 },
  { id:'root2_lei', name:'雷池一线', rarity:'rare', prio:90,
    blurb:'门里立着牌子：入雷池者十死其三。你的雷灵根从昨天起就一直在跳。',
    closing:'你从雷池里走出来的时候头发还是直的。同门说那天全山的灯都灭了。',
    match:(s,c)=>c.root==='lei_x' && c.level>=13 },
  { id:'root2_hun', name:'神魂出游', rarity:'rare', prio:90,
    blurb:'半夜你自己醒了，发现自己正站在院子里，屋里那个"你"还在睡。',
    closing:'老道说夜里别一个人往祠堂去。你去了，也回来了。',
    match:(s,c)=>c.root==='hun_x' && c.level>=13 },
  { id:'root2_ri', name:'正午无影', rarity:'rare', prio:90,
    blurb:'一年里日照最长的那天，正午的日头直直照在你身上，你周身的灵气自己烧了起来。',
    closing:'太阳落山时你已经不是早上那个人了。玉牌烫得老道换了一次手。',
    match:(s,c)=>c.root==='ri_x' && c.level>=13 },
  { id:'root2_yue', name:'月下问心', rarity:'rare', prio:90,
    blurb:'满月那夜你一个人在庭中坐了整晚，这些年的心事一件一件摆在眼前，摆得很整齐。',
    closing:'你看完了全部，然后把它们收了起来。从那天起，没什么能轻易让你动怒了。',
    match:(s,c)=>c.root==='yue_x' && c.level>=13 },
  { id:'root2_single', name:'一意孤行', rarity:'rare', prio:90,
    blurb:'你的路太窄，同门说你迟早会卡在某一道坎上。老道问你要不要兼修一系。',
    closing:'你说不兼。你把一系练到了头——这辈子他只见过两个这样的人。',
    match:(s,c)=>c.root==='single' && c.level>=13 },
  { id:'root2_dual', name:'两系的歧路', rarity:'rare', prio:90,
    blurb:'两系都练到练气九层，再往上必须选一条主路。老道把两本功法摊在桌上，只让你拿一本。',
    closing:'你拿了其中一本。另一本还摊在桌上，落了很厚的灰。',
    match:(s,c)=>c.root==='dual' && c.level>=13 },
  { id:'root2_dual_shu', name:'两系相借', rarity:'rare', prio:90,
    blurb:'你练木系时金气自己动了，练金系时木气又来托着。老道说这叫相生，是极少数人才有的便宜。',
    closing:'它们不打架，还互相补。你这一路走得比大多数人都顺。',
    match:(s,c)=>c.root==='dual_shu' && c.level>=13 },
  { id:'root2_dual_tong', name:'同源归元', rarity:'rare', prio:90,
    blurb:'同源的两系练起来像照镜子：你往左，它也往左，谁也推不动谁。',
    closing:'某一天它们忽然合成了一个动作。那之后你出手比别人快一倍。',
    match:(s,c)=>c.root==='dual_tong' && c.level>=13 },
  { id:'root2_feng', name:'御风而行', rarity:'uncommon', prio:90,
    blurb:'老道把你带到崖边，说御风之术只在你落地之前有用，然后让你自己跳。',
    closing:'你在离地三尺的地方停住了。风托着你，像托着一片叶子。',
    match:(s,c)=>c.root==='feng_x' && c.level>=13 },
  { id:'root2_bing', name:'冰心不染', rarity:'uncommon', prio:90,
    blurb:'同门死在斗法里，全门都在哭。你站在灵前，眼睛干得发疼，一滴也流不出来。',
    closing:'你把那块东西冻在丹田最深处。从那以后你出手极稳，同门说你变了。',
    match:(s,c)=>c.root==='bing_x' && c.level>=13 },
  { id:'root2_huan', name:'真幻两忘', rarity:'uncommon', prio:90,
    blurb:'山门外来了个孩子，说是你失散多年的弟弟。你心里清楚你没有弟弟——可他的手是暖的。',
    closing:'你带他去吃了三天饭。第四天他不见了，你在门口留了一双鞋。',
    match:(s,c)=>c.root==='huan_x' && c.level>=13 },
  { id:'root2_di', name:'地脉低语', rarity:'uncommon', prio:90,
    blurb:'你踩在山上，脚下的地脉在响。老道说这条脉快断了，断的那天，山下的镇子会被埋。',
    closing:'你在地底待了四十天。爬出来的时候镇子还在，炊烟照常。',
    match:(s,c)=>c.root==='di_x' && c.level>=13 },
  { id:'root2_xue', name:'以血换境', rarity:'uncommon', prio:90,
    blurb:'功法最后一页写着：若求速成，可取己血三升。你有三升血，你也舍得。',
    closing:'炉子红了三天。你出来时瘦得脱了形，境界却连跳了两层。',
    match:(s,c)=>c.root==='xue_x' && c.level>=13 },
  { id:'root2_dual_ke', name:'相冲不溃', rarity:'uncommon', prio:76,
    blurb:'两系在丹田里撞上了，你半边身子发烫，半边身子结霜。老道说你的坎不在天上，在你自己身上。',
    closing:'你把两股力拧成了一股。出手时一冷一热，没人接得住。',
    match:(s,c)=>c.root==='dual_ke' && c.level>=13 },
  { id:'root2_triple', name:'勤能补拙', rarity:'uncommon', prio:76,
    blurb:'同批入门的十个人，九个已经筑基，你还在练气。掌教让人来问你还要不要继续。',
    closing:'第十年你筑基那天没人来道贺，你自己坐了一夜。',
    match:(s,c)=>c.root==='triple' && c.level>=13 },
  { id:'root2_quad', name:'驳杂之身', rarity:'uncommon', prio:76,
    blurb:'四系灵气各走各的，你连最基础的引气都做不圆。老道给你两条路：散掉两系，或者硬走。',
    closing:'经脉清了。你再测一次灵根，已经变成了两系——少了两种可能，也少了两种拖累。',
    match:(s,c)=>c.root==='quad' && c.level>=13 },
  /* ───── 修仙线（14）───── */
  { id:'xian_feisheng', name:'白日飞升', rarity:'legend', prio:100,
    blurb:'你走完了那条几乎没人走完的路：云霞满天，肉身化作金光，山下的人抬头看了很久。',
    closing:'从此人间少了一个名字，天上多了一颗星。',
    match:(s,c)=>c.f.feisheng },
  { id:'xian_huashen', name:'化神·神游太虚', rarity:'legend', prio:96,
    blurb:'你活成了传说本身。凡人的朝代更替了几轮，你只是在洞府里睁了一次眼。',
    closing:'你最后想问的不是长生，而是"山下那棵桃树还在吗"。',
    match:(s,c)=>c.f.xianxia && c.level>=49 },
  { id:'xian_yuanying', name:'元婴·陆地神仙', rarity:'rare', prio:88,
    blurb:'元婴出窍那一刻你看见了整座山，也看见了自己这一路踩过的尸骨。',
    closing:'你终于明白：修仙不是变强，是变久。',
    match:(s,c)=>c.f.xianxia && c.level>=37 },
  { id:'xian_jindan_huohuo', name:'金丹走火入魔', rarity:'rare', prio:90,
    blurb:'丹成之日，经脉逆行。你用了三十年爬上来的山，一夜之间滑到了半山腰。',
    closing:'后来有人在崖边捡到半枚碎丹，还带着余温。',
    match:(s,c)=>c.f.xianxia && c.level>=25 && /走火入魔/.test(c.cause) },
  { id:'xian_jindan', name:'金丹不坏', rarity:'rare', prio:84,
    blurb:'丹田那团气终于凝成了形。你摸着腹部，像摸着一件不属于自己的东西。',
    closing:'寿元大增，代价是再也记不清老家的路。',
    match:(s,c)=>c.f.xianxia && c.level>=25 },
  { id:'xian_zhuji', name:'筑基初成', rarity:'uncommon', prio:70,
    blurb:'道基稳了，凡人的病再难侵。你在草庐里坐了很久，第一次感到"可以慢慢来"。',
    closing:'你没能走到终点，但你确实走出了第一步。',
    match:(s,c)=>c.f.xianxia && c.level>=13 },
  { id:'xian_lianqi', name:'练气而终', rarity:'uncommon', prio:66,
    blurb:'气感初现的那年你以为自己抓住了什么，后来才知道那只是门槛。',
    closing:'你把这本没写完的道经留在了石桌上。',
    match:(s,c)=>c.f.xianxia && c.level>=1 },
  { id:'xian_huohuo_die', name:'走火入魔·身殒道消', rarity:'rare', prio:92,
    blurb:'经脉尽断，元神溃散。你冲得比谁都快，也就比谁都早停下。',
    closing:'道消那日无风，只有一盏灯自己灭了。',
    match:(s,c)=>c.f.xianxia && /走火入魔/.test(c.cause) },
  { id:'xian_battle', name:'与魔道决战而亡', rarity:'rare', prio:86,
    blurb:'你把最后一口气用在了那记剑上。对手倒下时，你也笑了。',
    closing:'修真界记了你很多年，虽然只有一句"那个人很能打"。',
    match:(s,c)=>c.f.xianxia && /决战/.test(c.cause) },
  { id:'xian_sit', name:'洞府坐化', rarity:'uncommon', prio:72,
    blurb:'你在蒲团上坐了很久，久到灰尘盖住了肩膀。没有痛苦，只是停下来了。',
    closing:'洞府外的桃树开了又谢，谢了又开。',
    match:(s,c)=>c.f.xianxia && /坐化/.test(c.cause) },
  { id:'xian_alchemy', name:'一代丹师', rarity:'rare', prio:80,
    blurb:'你炼过的丹救过很多人，也炸过很多次炉。眉毛烧没的那次，你笑了整晚。',
    closing:'后来修士们提起你，都说"那个人手里的药，是热的"。',
    match:(s,c)=>c.f.xianxia && (c.counts.cultivate||0)>=3 && c.a.skill>=70 },
  { id:'xian_land', name:'灵脉主人', rarity:'uncommon', prio:68,
    blurb:'你在后山发现了一条灵脉，搭了草庐，从此再没下过山。',
    closing:'你守着一口泉，守了一辈子，也觉得值。',
    match:(s,c)=>c.f.xianxia && c.f.hasLand },
  { id:'xian_mortal_heart', name:'红尘归来', rarity:'uncommon', prio:64,
    blurb:'师父赶你下山炼心，你在街边吃了碗面，看了场夕阳，忽然就通透了。',
    closing:'尘缘未了的人，反而走得最远。',
    match:(s,c)=>c.f.xianxia && c.bonds.family>=60 && c.a.relations>=60 },
  { id:'fairy_refused', name:'凡人的清醒', rarity:'uncommon', prio:62,
    blurb:'那个白胡子老道说你有仙缘。你摇了摇头，下了山，回去上班了。',
    closing:'你偶尔会想起他，然后继续过自己的日子。这也是一种道。',
    match:(s,c)=>c.f.fairyRefused },

  /* ───── 职业线（14）───── */
  { id:'job_bigtech_rise', name:'大厂中层', rarity:'rare', prio:78,
    blurb:'从工位到会议室，你用了十年。PPT 越做越漂亮，头发越来越少。',
    closing:'你带过的人后来去了很多地方，他们都说"在他手下能学到东西"。',
    match:(s,c)=>c.f.jobType==='bigtech' && c.f.promoted && c.a.money>=100000 },
  { id:'job_bigtech_out', name:'被优化的人', rarity:'uncommon', prio:74,
    blurb:'抱着纸箱走出写字楼那天天气很好。你在楼下站了十分钟，不知道去哪。',
    closing:'后来你总说：那不是一个坏结局，只是一次换乘。',
    match:(s,c)=>c.f.laidOffOnce },
  { id:'job_soe', name:'国企老同志', rarity:'common', prio:50,
    blurb:'朝九晚五，食堂三块五。你在同一个办公室坐了三十年，窗外的树从树苗长成了荫。',
    closing:'退休那天，同事送了你一个搪瓷杯。',
    match:(s,c)=>c.f.jobType==='soe' },
  { id:'job_small', name:'小公司多面手', rarity:'common', prio:48,
    blurb:'什么都要你干：写方案、修打印机、陪客户。十年下来你什么都会一点。',
    closing:'你的简历很难写，但你确实什么都干得成。',
    match:(s,c)=>c.f.jobType==='small' },
  { id:'job_civil', name:'体制内的一生', rarity:'rare', prio:76,
    blurb:'考上的那天你妈哭了。此后的日子平淡、稳定，也慢慢变得很长。',
    closing:'你把一辈子的力气，用在了"不出错"上。',
    match:(s,c)=>c.f.jobType==='civil' },
  { id:'job_civil_fail', name:'差的那0.5分', rarity:'uncommon', prio:66,
    blurb:'面试差 0.5 分。你在公告栏前站了很久，然后转身去了人才市场。',
    closing:'命运有时只用半道题，就把人推到另一条路上。',
    match:(s,c)=>c.f.path==='civil' && c.f.jobType!=='civil' },
  { id:'job_master', name:'硕士毕业', rarity:'uncommon', prio:64,
    blurb:'论文大修两次，答辩那天你紧张得手心出汗。学历到手，起薪高了一截。',
    closing:'你终于有资格说"这个我研究过"。',
    match:(s,c)=>c.f.masterDegree },
  { id:'job_phd_teacher', name:'留在校园的人', rarity:'rare', prio:78,
    blurb:'你读了太久书，久到发现自己最适合的地方就是图书馆。后来你留校了。',
    closing:'你教过的学生里，有人成了你当年想成为的样子。',
    match:(s,c)=>c.f.gradSchool && c.f.graduated && (c.counts.study||0)>=8 },
  { id:'job_temp', name:'过渡了一辈子', rarity:'common', prio:44,
    blurb:'你总说"先干着，再慢慢找"。后来那个"慢慢"就过了三十年。',
    closing:'你没什么可后悔的，只是偶尔会想"如果当时"。',
    match:(s,c)=>c.f.jobType==='temp' },
  { id:'job_hopper', name:'跳槽之王', rarity:'uncommon', prio:70,
    blurb:'你换了七八份工作，每份都干得不错，每份都没待久。',
    closing:'你简历很长，朋友很多，存款一般。',
    match:(s,c)=>(c.f.changedJob?1:0)+(c.counts.work||0)>=1 && c.f.changedJob && (c.counts.work||0)>=6 },
  { id:'job_gap', name:'空窗期很长', rarity:'common', prio:46,
    blurb:'你给自己放了个假，结果那个假比你想象中长。白天逛菜市场的感觉，你记了很久。',
    closing:'停下来不是失败，只是没人告诉你什么时候该重新开始。',
    match:(s,c)=>c.f.gap && (c.counts.work||0)<=5 },
  { id:'job_freelance', name:'接私活的人', rarity:'uncommon', prio:62,
    blurb:'白天上班，晚上赶工。你有过很多个"连续三个月没有周末"。',
    closing:'账户很诚实，身体也是。',
    match:(s,c)=>(c.counts.finance||0)>=4 && (c.counts.work||0)>=4 && c.a.money>=100000 },
  { id:'job_burnout', name:'倦怠的人', rarity:'common', prio:52,
    blurb:'你连续很多年把全部时间交给工作。有一天你发现自己很久没笑过了。',
    closing:'你不是不努力，你只是忘了为什么要努力。',
    match:(s,c)=>(c.counts.work||0)>=12 },
  { id:'job_last_day', name:'最后一天上班', rarity:'common', prio:42,
    blurb:'同事给你办了欢送会，蛋糕上写着你的名字。走出写字楼，你忽然不知道该干嘛。',
    closing:'工牌交回去的那刻，你才意识到自己真的干了这么久。',
    match:(s,c)=>c.f.retired },

  /* ───── 关系与家庭（17）───── */
  { id:'love_golden', name:'金婚', rarity:'legend', prio:98,
    blurb:'五十年，你们把"喜欢"过成了"习惯"，又把"习惯"过成了"离不开"。',
    closing:'最后那几年，你们每天傍晚都牵着手走同一条路。',
    match:(s,c)=>c.f.married && c.bonds.lover>=85 && c.age>=75 },
  // patch47：金婚(98) 与白头偕老(84) 的比值是 0.857，刚好过了 0.85 阈值，
  // 于是金婚玩家可能被分到「白头偕老」。把这张降到 82（0.837），金婚独占。
  { id:'love_white_head', name:'白头偕老', rarity:'rare', prio:82,
    blurb:'你认真地爱过，也被一个人稳稳地爱过。争吵、和解、再争吵，然后一起变老。',
    closing:'你临终前想起的不是某件大事，是很多个"今天吃什么"。',
    match:(s,c)=>c.f.married && c.bonds.lover>=60 },
  { id:'love_first_love', name:'和初恋结了婚', rarity:'rare', prio:86,
    blurb:'从传纸条到领证，中间隔了十几年。同学会上大家起哄，你们只是笑。',
    closing:'你们把青春谈成了一场很长的恋爱。',
    match:(s,c)=>c.f.married && c.f.firstCrush },
  { id:'love_blinddate', name:'相亲结婚', rarity:'common', prio:48,
    blurb:'介绍人说"条件很好"。你们在一张桌子上从尴尬聊到了家常，然后就过了一辈子。',
    closing:'爱情有很多种开场，你们那种叫"慢慢来"。',
    // patch47：原来只要 married 就成立，会把金婚(98)、初恋结婚(86)、白头偕老(84) 都抢走。
    // 收紧成「结婚但不是高好感恋爱、也不是初恋」——那才是相亲结婚的样子。
    match:(s,c)=>c.f.married && c.bonds.lover<60 && !c.f.firstCrush },
  { id:'love_single', name:'独身主义者', rarity:'common', prio:50,
    blurb:'你谈过几次，也认真过，但最终选择了一个人。不是没人要，是你要的不一样。',
    closing:'你把独处过成了一种本事。',
    match:(s,c)=>!c.f.married && c.a.relations>=50 },
  { id:'love_alone', name:'一个人吃饭', rarity:'uncommon', prio:58,
    blurb:'热闹是偶尔的。你的手机通讯录很长，深夜能打的电话不多。',
    closing:'你不觉得孤单，只是偶尔会希望有人问一句"吃了吗"。',
    match:(s,c)=>!c.f.married && c.a.relations<50 },
  { id:'love_breakup', name:'散场的人', rarity:'uncommon', prio:60,
    blurb:'没有争吵，只是一个平常的傍晚，你们同时意识到这段路走到这里了。',
    closing:'你把那扇门轻轻关上，没有回头。',
    match:(s,c)=>!c.f.married && c.bonds.lover<25 && c.age>=45 },
  { id:'family_dink', name:'丁克夫妻', rarity:'uncommon', prio:62,
    blurb:'你们达成了共识：两个人也很好。于是把日子过成了一场很长的二人旅行。',
    closing:'亲戚问了很多年，你们答了很多年，最后没人再问了。',
    match:(s,c)=>c.f.married && !c.f.hasChild && c.age>=55 },
  { id:'family_one_child', name:'为人父母', rarity:'common', prio:52,
    blurb:'你成了爸爸/妈妈。熬夜喂奶的那一年，你第一次知道什么叫"用命去护一个人"。',
    closing:'孩子长大的速度，比你想象中快得多。',
    match:(s,c)=>c.f.hasChild && c.bonds.child>=40 },
  { id:'family_many', name:'人丁兴旺', rarity:'uncommon', prio:64,
    blurb:'家里一直很吵。餐桌上永远有人抢最后一块排骨，你觉得这样很好。',
    closing:'你走的时候，房间里站不下所有人。',
    match:(s,c)=>c.bonds.child>=70 && c.f.married },
  { id:'family_grandkid', name:'含饴弄孙', rarity:'uncommon', prio:66,
    blurb:'孩子打电话说"你要当爷爷奶奶了"。你开始研究带娃攻略，退休生活有了新内容。',
    closing:'你教孙辈做的第一道菜，是当年你妈教你的那道。',
    match:(s,c)=>c.f.hasChild && c.age>=62 && c.bonds.child>=50 },
  { id:'family_caregiver', name:'被需要的人', rarity:'rare', prio:74,
    blurb:'家里出事时，第一个被想起的总是你。陪床的椅子很硬，你坐了很多年。',
    closing:'你没什么惊天动地的成就，但很多人的安稳是你托着的。',
    match:(s,c)=>c.f.caregiving && c.bonds.family>=70 },
  { id:'family_loyal', name:'一直在原地的人', rarity:'common', prio:46,
    blurb:'你每周给家里打电话，每年回去几趟。你把"孝顺"过成了一种日常习惯。',
    closing:'家人一直在原地等你，这是你最硬的底牌。',
    match:(s,c)=>c.bonds.family>=80 },
  { id:'family_estrange', name:'很少联系的人', rarity:'uncommon', prio:56,
    blurb:'你总说"下周就回"，那个"下周"出现了一百多次。',
    closing:'有一天你翻到家里的旧照片，才发现爸妈比记忆里老了很多。',
    match:(s,c)=>c.f.distant },
  { id:'family_widow', name:'晚年丧偶', rarity:'uncommon', prio:68,
    blurb:'他/她先走了。你把他/她的拖鞋收进了柜子，又拿了出来。',
    closing:'之后很多年，你还是会做两个人的饭。',
    match:(s,c)=>c.f.married && c.bonds.lover>=50 && c.age>=78 },
  { id:'family_pet', name:'猫狗双全', rarity:'uncommon', prio:58,
    blurb:'你把沙发最中间的位置让给了一只理直气壮的动物，它替你守了很多年家。',
    closing:'它先走的那天，你在楼下坐了很久。',
    match:(s,c)=>c.f.pet && c.bonds.pet>=60 },
  { id:'family_one_cat', name:'一人一猫', rarity:'common', prio:44,
    blurb:'你没有结婚，但有一只猫。它不爱你，只是需要你，而你也一样。',
    closing:'你们互相将就了一辈子，居然还挺好。',
    match:(s,c)=>c.f.pet && !c.f.married },

  /* ───── 财富与资产（11）───── */
  { id:'money_rich', name:'千万身家', rarity:'legend', prio:94,
    blurb:'账户里的数字终于替你说了一次话。你可以对任何事说不。',
    closing:'钱没让你变快乐，但确实让你不再害怕。',
    match:(s,c)=>c.money>=350000 },
  { id:'money_great', name:'小有积蓄', rarity:'rare', prio:72,
    blurb:'你攒下了一笔说得出口的钱。不多，但足够在关键时刻不用低头。',
    closing:'你终于睡了个不需要算账的觉。',
    match:(s,c)=>c.money>=150000 },
  { id:'money_ok', name:'够花就好', rarity:'common', prio:46,
    blurb:'你的钱不算多，但每一笔都算得清楚。日子过得紧，但没塌过。',
    closing:'够花，是一种很难得的运气。',
    match:(s,c)=>c.money>=50000 },
  { id:'money_mortgage', name:'房奴的一生', rarity:'uncommon', prio:64,
    blurb:'签合同那天手都在抖。之后三十年，每个月都有一笔钱准时离开你。',
    closing:'但那扇门后面是你的。这件事本身就很值。',
    // patch47：原来只有 hasHouse，被「有房有车」完整包含（prio 只差 2，会互相抢）
    match:(s,c)=>c.f.hasHouse && !c.f.hasCar },
  { id:'money_car_house', name:'有房有车', rarity:'uncommon', prio:66,
    blurb:'你终于凑齐了那两样东西。周末可以周边游，停车费是真的贵。',
    closing:'你没什么大志向，只是想让家人少走点路。',
    match:(s,c)=>c.f.hasHouse && c.f.hasCar },
  { id:'money_debt', name:'账单追着跑', rarity:'uncommon', prio:56,
    blurb:'短信提示余额不足的那一刻，你正在超市结账。后面的队伍安静地往前挪了一格。',
    closing:'你学会了在打折区里找体面。',
    match:(s,c)=>c.a.money<0 },
  { id:'money_broke', name:'破产者', rarity:'rare', prio:70,
    blurb:'你曾经有过机会，也曾经有过钱。后来那些数字变成了一条很陡的曲线。',
    closing:'你重新学会了一件事：从零开始，其实没有想象中难。',
    match:(s,c)=>c.a.money<=-20000 },
  { id:'money_middle_crisis', name:'中年跑车', rarity:'uncommon', prio:60,
    blurb:'你买了辆跑车，跟伴侣吵了一架，然后在深夜的城市里绕了三圈。',
    closing:'引擎声很响，但盖不住心里的那个问题。',
    match:(s,c)=>c.f.crisisBought },
  { id:'money_frugal', name:'省出来的一生', rarity:'common', prio:48,
    blurb:'你砍掉了所有订阅、外卖和不需要的东西。账户确实变大了，生活也变安静了。',
    closing:'你不是抠，你只是知道什么才重要。',
    match:(s,c)=>c.f.frugal },
  { id:'money_pension', name:'靠退休金生活', rarity:'common', prio:42,
    blurb:'每个月固定一笔钱，像岁月终于开始给你发工资。你把日子过得很稳。',
    closing:'你开始研究超市几点打折，并且很享受这件事。',
    match:(s,c)=>c.age>=68 && c.f.employed },
  { id:'money_rich_kid', name:'家里有矿', rarity:'rare', prio:76,
    blurb:'你从一开始就站在别人的终点线上。你用这笔钱做了一些别人不敢做的事。',
    closing:'你后来才明白，起点高不代表路好走，只是摔下去更疼。',
    match:(s,c)=>c.traits.includes('richkid') && c.money>=150000 },

  /* ───── 健康与身体（10）───── */
  { id:'health_iron', name:'铁打的身体', rarity:'rare', prio:74,
    blurb:'体检报告干干净净，医生让你继续保持。你把身体当成了最拿得出手的资产。',
    closing:'你八十岁还能一口气上六楼，这是你最骄傲的事。',
    match:(s,c)=>c.a.health>=60 && c.age>=70 },
  { id:'health_centenarian', name:'百岁人瑞', rarity:'legend', prio:95,
    blurb:'你活过了一个世纪。记者来采访过三次，你每次都讲了不同的版本。',
    closing:'你最后记住的，是小时候家门口那棵树的样子。',
    match:(s,c)=>c.age>=100 },
  { id:'health_chronic', name:'与慢病共处', rarity:'uncommon', prio:60,
    blurb:'血压、血糖、关节，每一样都在提醒你慢一点。你学会了跟它们谈判。',
    closing:'你赢的不是健康，是接受。这比赢难得多。',
    match:(s,c)=>c.a.health<45 && c.age>=65 },
  { id:'health_gym', name:'健身房常客', rarity:'uncommon', prio:56,
    blurb:'你办了卡，而且真的去了。跑步机上你看完了三部剧，也把身体练回了原样。',
    closing:'你没变年轻，但你确实变结实了。',
    match:(s,c)=>c.f.gym },
  { id:'health_checkup', name:'年年体检的人', rarity:'common', prio:46,
    blurb:'你比同龄人更早地知道自己的身体出了什么问题，因此也更早地处理了它。',
    closing:'你没什么惊天动地的养生法，只是从不逃避报告上的箭头。',
    match:(s,c)=>c.f.checkup },
  { id:'health_insomnia', name:'睡不着的一生', rarity:'uncommon', prio:52,
    blurb:'凌晨三点你还睁着眼，天花板上的纹路你都数清楚了。这件事持续了很多年。',
    closing:'你后来习惯了，甚至觉得夜里那段安静也不错。',
    match:(s,c)=>(c.counts.rest||0)>=6 && c.a.health<70 },
  { id:'health_survivor', name:'熬过来的人', rarity:'rare', prio:76,
    blurb:'医生说过几次不太好的话，你都听懂了，然后活了下来。',
    closing:'你不是不怕，你只是没打算认输。',
    match:(s,c)=>c.a.health<35 && c.age>=80 },
  { id:'health_frail', name:'体弱多病', rarity:'common', prio:50,
    blurb:'你从小就比同龄人弱一点。别人跑一千米，你在旁边看着。',
    closing:'你比谁都知道，能好好走路是一件值得高兴的事。',
    match:(s,c)=>c.traits.includes('sickly') && c.a.health<60 },
  { id:'health_athlete', name:'运动健将', rarity:'common', prio:48,
    blurb:'你一直跑得比别人快。运动会上拿过的奖状，你留到了很老。',
    closing:'身体是你最早的朋友，也是最晚离开的那个。',
    match:(s,c)=>c.traits.includes('athlete') && c.a.health>=55 },
  { id:'health_therapy', name:'懂得求助的人', rarity:'uncommon', prio:62,
    blurb:'你走进心理咨询室那天，第一次知道"求助"本身就需要勇气。',
    closing:'你哭过十分钟，然后轻了很多。',
    match:(s,c)=>c.f.therapy },

  /* ───── 死亡方式（11）───── */
  { id:'death_accident', name:'人生戛然而止', rarity:'rare', prio:82,
    blurb:'一场意外，来不及告别。你还有很多事没做完，还有很多话没说。',
    closing:'有些人离开得太快，快到连一句"再见"都显得多余。',
    match:(s,c)=>c.died && /交通事故|意外/.test(c.cause) },
  { id:'death_drown', name:'停在那个夏天', rarity:'uncommon', prio:68,
    blurb:'那年夏天很热。水很凉，然后就什么都不知道了。',
    closing:'夏天的蝉还在叫，只是不再为你叫了。',
    match:(s,c)=>c.died && /溺水|意外/.test(c.cause) },
  { id:'death_cancer', name:'抗争了两年', rarity:'uncommon', prio:66,
    blurb:'确诊那天你在医院门口坐了很久。之后的两年，你比前半生都活得认真。',
    closing:'你把该说的话都说了，该见的人都见了。',
    match:(s,c)=>c.died && /癌症/.test(c.cause) },
  { id:'death_heart', name:'走得很突然', rarity:'common', prio:52,
    blurb:'心脑血管意外。前一刻你还在说话，下一刻就安静了。',
    closing:'没有痛苦，也没有准备。',
    match:(s,c)=>c.died && /心脑血管/.test(c.cause) },
  { id:'death_illness', name:'积劳成疾', rarity:'common', prio:50,
    blurb:'身体先垮了。它其实提醒过你很多次，你每次都说明年再说。',
    closing:'你把一辈子花在了"以后"，可惜没有以后。',
    match:(s,c)=>c.died && /积劳成疾|重病|急病/.test(c.cause) },
  { id:'death_pneumonia', name:'一场肺炎', rarity:'common', prio:48,
    blurb:'换季时一场肺炎，没扛过去。你走的时候是冬天。',
    closing:'窗外很冷，屋里的人都握着你的手。',
    match:(s,c)=>c.died && /肺炎/.test(c.cause) },
  { id:'death_sleep', name:'在睡梦中离开', rarity:'uncommon', prio:64,
    blurb:'你像往常一样躺下，只是这次没有醒来。',
    closing:'这大概是最好的一种走法：不痛、不吵、不用告别。',
    match:(s,c)=>c.died && /睡梦中/.test(c.cause) },
  { id:'death_organ', name:'慢慢熄灭', rarity:'common', prio:46,
    blurb:'器官衰竭，像一盏灯把油用完了。家人一直陪着。',
    closing:'你走得很慢，所以每个人都说上了最后一句。',
    match:(s,c)=>c.died && /器官衰竭/.test(c.cause) },
  { id:'death_old', name:'无疾而终', rarity:'rare', prio:72,
    blurb:'像翻完最后一页书，你合上了自己。儿孙环绕，天气很好。',
    closing:'你这一生没有大病，也没有大憾。',
    match:(s,c)=>c.died && /无疾而终|高寿|安然辞世|儿孙/.test(c.cause) },
  { id:'death_infant', name:'没能看一眼这个世界', rarity:'rare', prio:88,
    blurb:'你来得太早，也太轻。这一页还没写完就合上了。',
    closing:'有些名字只被念过几次，但被记了一辈子。',
    match:(s,c)=>c.died && c.age<2 },
  { id:'death_early', name:'英年早逝', rarity:'rare', prio:80,
    blurb:'身体提前叫停了这一程。你走过的年岁不多，但每一年都不含糊。',
    closing:'有些花开得短，可那几天整条街都是香的。',
    match:(s,c)=>c.died && c.age<45 },

  /* ───── 起始特质（16）───── */
  { id:'trait_optimist', name:'乐天派的一生', rarity:'common', prio:40,
    blurb:'天塌下来你也能先睡一觉。别人觉得你没心没肺，只有你知道这是本事。',
    closing:'你把"想开点"活成了一种肌肉记忆。',
    match:(s,c)=>c.traits.includes('optimist') && c.a.mood>=62 },
  { id:'trait_carefree', name:'心大的人', rarity:'common', prio:40,
    blurb:'很多事你当时没在意，后来发现不在意是对的。',
    closing:'你忘掉的东西，比记住的多，也比记住的值。',
    match:(s,c)=>c.traits.includes('carefree') },
  { id:'trait_chill', name:'佛系', rarity:'common', prio:40,
    blurb:'你不争不抢，别人着急的时候你在喝茶。奇怪的是，你过得还不差。',
    closing:'你的秘诀是：把标准调低一点，幸福感就上来了。',
    match:(s,c)=>c.traits.includes('chill') },
  { id:'trait_ironman', name:'铁人', rarity:'common', prio:42,
    blurb:'你的身体像是有额外的零件。别人躺下休息的时候，你还在干活。',
    closing:'你八十岁那年还能自己搬动花盆。',
    match:(s,c)=>c.traits.includes('ironman') && c.a.health>=70 },
  { id:'trait_longevity', name:'长寿基因', rarity:'uncommon', prio:58,
    blurb:'你家里人大多活得很久。这件事在你年轻时不重要，在你老了之后很重要。',
    closing:'你最后是笑着走的，像完成了一件早就知道结果的事。',
    match:(s,c)=>c.traits.includes('longevity') && c.age>=85 },
  { id:'trait_prodigy', name:'天才少年', rarity:'rare', prio:70,
    blurb:'你小时候什么都学得快，大人们说这孩子以后不得了。后来你确实还不错。',
    closing:'天赋是起点，不是终点。这句话你用了半辈子才懂。',
    match:(s,c)=>c.traits.includes('prodigy') && c.a.skill>=68 },
  { id:'trait_prodigy_lost', name:'被耽误的天才', rarity:'uncommon', prio:60,
    blurb:'你曾经是那个"别人家的孩子"。后来的路走得不顺，天赋慢慢变成了遗憾。',
    closing:'你偶尔会想，如果当年再坚持一下会怎样。',
    match:(s,c)=>c.traits.includes('prodigy') && c.a.skill<50 },
  { id:'trait_thinker', name:'内向深思', rarity:'common', prio:44,
    blurb:'你话不多，但想得很多。你的世界很安静，也很深。',
    closing:'你没跟多少人说过心里话，但那些话都还在。',
    match:(s,c)=>c.traits.includes('thinker') },
  { id:'trait_scholar', name:'好学生', rarity:'common', prio:44,
    blurb:'你一直是老师喜欢的那种学生。作业工整，笔记齐全，从不迟到。',
    closing:'你后来发现，人生没有标准答案，但认真这件事本身有用。',
    match:(s,c)=>c.traits.includes('scholar') },
  { id:'trait_social', name:'社牛', rarity:'uncommon', prio:56,
    blurb:'你认识的人比谁都多。走到哪都有人跟你打招呼，连菜市场阿姨都记得你。',
    closing:'你一生最大的资产，是一串能打的电话。',
    match:(s,c)=>c.traits.includes('social') && c.a.relations>=70 },
  { id:'trait_slowwarm', name:'慢热型', rarity:'common', prio:42,
    blurb:'你交朋友很慢，但一旦交上就很难散。你的圈子小，但都是真的。',
    closing:'你一辈子只有几个朋友，但他们随叫随到。',
    match:(s,c)=>c.traits.includes('slowwarm') },
  { id:'trait_nice', name:'好好先生', rarity:'common', prio:42,
    blurb:'你几乎不会拒绝别人。这让你很受欢迎，也让你很累。',
    closing:'你后来学会了一件事：拒绝别人不等于伤害别人。',
    match:(s,c)=>c.traits.includes('nice') },
  { id:'trait_networker', name:'人脉广', rarity:'common', prio:44,
    blurb:'你从一开始就认识很多人。机会常常是别人告诉你的，而不是你找来的。',
    closing:'你的人生有很多次转折，都源于某个人的一句话。',
    match:(s,c)=>c.traits.includes('networker') },
  { id:'trait_poor_rise', name:'穷孩子翻身', rarity:'legend', prio:92,
    blurb:'你从负数开始。没有背景，没有本金，只有一股不甘心。后来你把自己活成了答案。',
    closing:'你妈第一次坐你买的车时，哭了很久。',
    match:(s,c)=>c.traits.includes('poor') && c.money>=120000 },
  { id:'trait_poor', name:'穷人家的孩子', rarity:'common', prio:46,
    blurb:'你从小就知道钱是有限的。这让你早熟，也让你在很多事上比别人慢一步。',
    closing:'你没什么可抱怨的，你已经比起点走得远了很多。',
    match:(s,c)=>c.traits.includes('poor') },
  { id:'trait_tryhard', name:'卷王', rarity:'common', prio:46,
    blurb:'你永远在加班，永远在准备下一个目标。你确实得到了很多，也失去了不少。',
    closing:'你最后才发现，最难的不是赢，是停下来。',
    match:(s,c)=>c.traits.includes('tryhard') },

  /* ───── 兴趣与技能（12）───── */
  { id:'skill_master', name:'手艺人', rarity:'rare', prio:72,
    blurb:'你靠一双手和一点审美活了一生。你做的每一样东西里，都有你认真过的证据。',
    closing:'后来有人在旧物市拿起你的作品，轻轻吹掉上面的灰。',
    match:(s,c)=>c.a.skill>=72 && (c.counts.create||0)>=4 },
  { id:'skill_lifelong', name:'终身学习者', rarity:'uncommon', prio:64,
    blurb:'你一辈子都在学新东西。年龄从没成为你的边界，只会成为你的注脚。',
    closing:'你最后学会的那件事，是八十岁那年的事。',
    match:(s,c)=>(c.counts.study||0)>=10 },
  { id:'skill_penpal', name:'笔友一生', rarity:'rare', prio:76,
    blurb:'你和一个人通了整整一年的信，从未见面，也从未间断。',
    closing:'后来你把那些信按日期排好，装进了一个铁盒。',
    match:(s,c)=>c.f.penpal },
  { id:'skill_photo', name:'留在相册里的人', rarity:'uncommon', prio:56,
    blurb:'你拍了很多照片。年底翻相册时，最满意的总是某一张很普通的月亮。',
    closing:'照片替你记住了那些你当时没来得及感受的瞬间。',
    match:(s,c)=>c.f.photo },
  { id:'skill_guitar', name:'弹吉他的人', rarity:'uncommon', prio:58,
    blurb:'你学会了弹唱一首歌，虽然很生涩，但你弹了很多年。',
    closing:'你最后一次弹它，是在自己的生日上。',
    match:(s,c)=>c.a.skill>=65 && (c.counts.create||0)>=3 },
  { id:'skill_dance', name:'广场舞领队', rarity:'uncommon', prio:60,
    blurb:'你一开始嫌音响吵，后来不仅加入了，还站到了最前面。',
    closing:'你带着一帮老伙伴跳了很多年，直到膝盖不允许。',
    match:(s,c)=>c.f.dance },
  { id:'skill_university_old', name:'老年大学优秀学员', rarity:'uncommon', prio:58,
    blurb:'你去老年大学报了摄影和书法，老师让你从基本笔画练起。',
    closing:'你的作业被贴在教室后墙上，你偷偷看了好几遍。',
    match:(s,c)=>c.age>=62 && c.a.skill>=60 },
  { id:'skill_garden', name:'阳台种菜', rarity:'common', prio:46,
    blurb:'邻居送你几粒番茄种子。你每天浇水时顺手看看，后来收获了一小篮。',
    closing:'你把最大的那颗给了邻居，说"你种的"。',
    match:(s,c)=>c.f.garden },
  { id:'skill_book', name:'藏书家', rarity:'uncommon', prio:56,
    blurb:'你在旧书市淘到过一本泛黄的书，里面夹着一片干透的银杏叶。',
    closing:'那本书一直在书架最显眼的位置。',
    match:(s,c)=>c.f.bookSaved },
  { id:'skill_tea', name:'茶客', rarity:'common', prio:44,
    blurb:'你在山间小馆喝过一壶茶，老板说"茶要趁热，话要趁早"。你记住了后半句。',
    closing:'之后每个深夜，你都泡一杯。',
    match:(s,c)=>c.f.tea },
  { id:'skill_created', name:'作品被看见过的人', rarity:'rare', prio:74,
    blurb:'有人留言说"谢谢你把它做出来"。就这一句，你记了很多年。',
    closing:'你做的那些"没什么用"的东西，确实让某个人好过了一点。',
    match:(s,c)=>c.f.created },
  { id:'skill_volunteer', name:'读书给孩子的老人', rarity:'uncommon', prio:58,
    blurb:'社区邀你去小学读故事。孩子们围着问故事里的动物后来怎么样了。',
    closing:'你答不上来，就说"你们长大自己写"。',
    match:(s,c)=>c.age>=60 && c.bonds.child>=20 && c.a.relations>=55 },

  /* ───── 心境与哲学（10）───── */
  { id:'mind_hermit', name:'低欲望的清醒', rarity:'uncommon', prio:62,
    blurb:'你不追风口，不攒人头，把生活削到只剩真正需要的几样东西。',
    closing:'你算过一笔账：少要一点，反而够用很久。',
    match:(s,c)=>(c.counts.social||0)<=6 && c.a.mood>=52 && (c.counts.rest||0)>=4 },
  { id:'mind_calm', name:'平静满足', rarity:'common', prio:48,
    blurb:'你不追风口，也不与人较劲，把自己的小日子过成了别人羡慕的样子。',
    closing:'你走得很安静，像一场下得恰到好处的雨。',
    match:(s,c)=>c.a.mood>=72 && c.a.health>=70 },
  { id:'mind_wander', name:'四海为家', rarity:'uncommon', prio:60,
    blurb:'你的行李比家具多，地图上全是你的脚印。家在哪里都能搭起来。',
    closing:'你把一生走成了一条很长的路，路上都是风景。',
    match:(s,c)=>c.f.movedCity && c.f.travel },
  { id:'mind_explore', name:'不断探索', rarity:'common', prio:46,
    blurb:'你一辈子都在学新东西、去新地方。好奇心陪你到了最后一天。',
    closing:'你从未真正变老。',
    match:(s,c)=>(c.counts.study||0)+(c.counts.create||0)>=8 },
  { id:'mind_art', name:'艺术的一生', rarity:'uncommon', prio:58,
    blurb:'你做了很多"没什么用但很喜欢"的事。它们没让你发财，但让你活得像自己。',
    closing:'你的作品里全是你认真过的证据。',
    match:(s,c)=>(c.counts.create||0)>=8 },
  { id:'mind_relations', name:'关系丰盛', rarity:'common', prio:48,
    blurb:'你把一生过成了一张温暖的网：很多人因为你，觉得人间值得。',
    closing:'临终前你想起的不是某件大事，而是很多张笑脸。',
    match:(s,c)=>c.a.relations>=75 && c.bonds.friends>=50 },
  { id:'mind_career', name:'事业有成', rarity:'common', prio:50,
    blurb:'你在自己的领域里站住了脚，后来者踩着你的脚印往前走。',
    closing:'你留下的东西，比你活得更久一些。',
    match:(s,c)=>c.a.skill>=70 && (c.counts.work||0)>=8 },
  { id:'mind_plain', name:'平凡而独特', rarity:'common', prio:38,
    blurb:'你没有惊天动地的故事，但认真活过的每一天都在悄悄发光。',
    closing:'普通人的生活也有自己的史诗，你这一篇，写得不错。',
    // patch47：与「不断探索」(study+create≥8) 重叠 57%。
    // 「平凡而独特」应当是「没怎么折腾、但也不难看」——加一条排他。
    match:(s,c)=>!c.f.xianxia && (c.counts.study||0)+(c.counts.create||0)<8 },
  { id:'mind_regret', name:'有很多"如果当时"', rarity:'uncommon', prio:54,
    blurb:'你想起了很多个岔路口。每一个你都选了更稳的那条，然后一直想到现在。',
    closing:'你不是后悔，只是偶尔会好奇另一条路上有什么。',
    match:(s,c)=>c.a.mood<45 && c.age>=60 },
  { id:'mind_late_bloomer', name:'大器晚成', rarity:'rare', prio:70,
    blurb:'你前半生平平无奇，直到很晚才找到自己真正擅长的事。',
    closing:'别人三十岁就定型了，你六十岁才刚开始。',
    match:(s,c)=>c.a.skill>=75 && (c.counts.study||0)>=6 && c.age>=70 },

  /* ───── 闪光点组合（16）───── */
  /* ── 分数 / 学历 / 灵根 / 成就 ── */
  { id:'score_gaokao_top', name:'高考状元', rarity:'legend', prio:96,
    blurb:'查分网站卡了十分钟，数字跳出来那一刻，你妈先哭了。',
    closing:'那串数字成了你此后很多年的自我介绍。',
    match:(s,c)=>c.score>=640 },
  { id:'score_gaokao_low', name:'落榜之后', rarity:'uncommon', prio:62,
    blurb:'分数比预想低了很多。你在志愿表前坐了一整夜，最后填了一个没听过的学校。',
    closing:'后来你才明白，那只是路绕了一点，不是路断了。',
    match:(s,c)=>c.score>0 && c.score<420 },
  { id:'score_zhongkao_top', name:'红榜上的名字', rarity:'uncommon', prio:60,
    blurb:'中考红榜贴在校门口，你的名字在很靠前的位置。你妈在那里站了半个小时。',
    closing:'那天之后，你第一次觉得自己"还行"。',
    match:(s,c)=>c.f.goodHighSchool && (c.f.zhongkaoScore||0)>=330 },
  { id:'score_zhongkao_low', name:'中专那条路', rarity:'uncommon', prio:58,
    blurb:'中考没考好，你去了中专。学一门手艺，早一点挣钱。',
    closing:'你后来发现，手上有活的人，走到哪里都不会太慌。',
    match:(s,c)=>c.f.zhongkaoScore>0 && c.f.zhongkaoScore<340 },
  { id:'root_tian', name:'天生道体', rarity:'legend', prio:120,
    blurb:'天灵根，万中无一。老道盯着你看了很久，声音都在抖。',
    closing:'你从入道那天起，就注定和所有人不一样。',
    match:(s,c)=>c.root==='tian' },
  { id:'root_chaos', name:'五系俱全', rarity:'rare', prio:78,
    blurb:'五行杂灵根，是最坏的一种资质。所有人都劝你放弃，你偏不。',
    closing:'你走得比谁都慢，但你真的走到了别人没走到的地方。',
    match:(s,c)=>c.root==='chaos' && c.level>=13 },
  { id:'root_pseudo', name:'伪灵根的执念', rarity:'rare', prio:110,
    blurb:'伪灵根，理论上修不成。你用了别人三倍的时间，换来了同一层台阶。',
    closing:'你最后没能飞升，但你再也没被人叫过"废物"。',
    match:(s,c)=>c.root==='pseudo' && c.level>=1 },
  { id:'ach_collector', name:'活成了一张清单', rarity:'rare', prio:105,
    blurb:'你这一生做了很多"第一次"：第一份工作、第一套房、第一次出国、第一次被人需要。',
    closing:'你走的时候，清单上打了大半的勾。',
    match:(s,c)=>c.achCount>=18 },
  { id:'ach_perfect', name:'圆满', rarity:'legend', prio:100,   // patch71：125→112，一年一选曾占 10.2%
    blurb:'学业、事业、家庭、健康、兴趣、奇遇——你几乎把这张人生的表填满了。',
    closing:'不是每一格都完美，但每一格你都认真填过。',
    match:(s,c)=>c.achCount>=26 },   // patch75：20 对 60 回合的一年一选太容易达成（曾占 11.1%）
  { id:'ach_few', name:'没留下什么', rarity:'uncommon', prio:54,
    blurb:'回头看，你这一生没什么值得写下来的事。',
    closing:'但你确实过完了它，这件事本身就不容易。',
    match:(s,c)=>c.achCount<=14 && c.years>=60 && !c.f.xianxia },

  { id:'combo_zhua_book', name:'书香门第', rarity:'uncommon', prio:66,
    blurb:'一岁那年你死死抓住那本书不放。长辈们笑了：这孩子以后爱读书。',
    closing:'那本书后来真的被你翻烂了。',
    match:(s,c)=>c.f.zhuazhou_book && c.a.skill>=60 },
  { id:'combo_zhua_money', name:'抓到了钱', rarity:'uncommon', prio:64,
    blurb:'你抓起铜钱就往嘴里塞，全家笑翻。这件事后来被讲了很多年。',
    closing:'你确实一辈子都在跟钱打交道。',
    match:(s,c)=>c.f.zhuazhou_money && c.money>=60000 },
  { id:'combo_zhua_pen', name:'最早的创作者', rarity:'uncommon', prio:64,
    blurb:'你攥着笔在纸上乱画了一通。妈妈说这是你最早的作品。',
    closing:'你后来真的做了很多年创作。',
    match:(s,c)=>c.f.zhuazhou_pen && (c.counts.create||0)>=4 },
  { id:'combo_zhua_sword', name:'好动的人', rarity:'common', prio:50,
    blurb:'你抡着木剑追家里的猫，体力是真的好。',
    closing:'这份体力陪了你很久。',
    match:(s,c)=>c.f.zhuazhou_sword && c.a.health>=70 },
  { id:'combo_zhua_medicine', name:'奶奶说的仙缘', rarity:'rare', prio:74,
    blurb:'你对着那个小药罐笑了很久。奶奶说这孩子有仙缘。',
    closing:'后来你上山了，再也没有下来。',
    match:(s,c)=>c.f.zhuazhou_medicine },
  { id:'combo_good_school', name:'重点高中出身', rarity:'common', prio:48,
    blurb:'中考红榜上有你的名字。那三年你过得比别人紧，也比别人稳。',
    closing:'你后来发现，起点确实会改变一些事情。',
    match:(s,c)=>c.f.goodHighSchool && c.a.skill>=60 },
  { id:'combo_985', name:'名校毕业', rarity:'rare', prio:72,
    blurb:'高考出分那天全家松了口气。你去了一个不错的学校，见了一些不一样的人。',
    closing:'文凭是一张纸，但那四年确实重塑了你。',
    match:(s,c)=>c.f.university==='985' },
  { id:'combo_science', name:'理科生的一生', rarity:'common', prio:44,
    blurb:'你选了理科。数理化的世界很冷，但很讲道理。',
    closing:'你一辈子都习惯用逻辑解决问题，偶尔也会失效。',
    match:(s,c)=>c.f.science },
  { id:'combo_arts', name:'文科生的一生', rarity:'common', prio:44,
    blurb:'你选了文科。你更喜欢背书，也更喜欢那些没有标准答案的问题。',
    closing:'你最后写了一辈子字，虽然没人看过。',
    match:(s,c)=>c.f.arts },
  { id:'combo_no_city', name:'城市漂流者', rarity:'uncommon', prio:58,
    blurb:'你搬过城市，在陌生的街道迷过路，也在陌生的早餐店里开心过。',
    closing:'你后来把很多城市都叫过"家"，但只有一个是真的。',
    match:(s,c)=>c.f.movedCity },
  { id:'combo_reverse', name:'逆天改命', rarity:'legend', prio:90,
    blurb:'你的健康从一开始就不好，医生说要多注意。你注意了，然后活到了很老。',
    closing:'你把每一天都当成借来的，所以一天都没浪费。',
    match:(s,c)=>c.a.health<40 && c.age>=85 },
  { id:'combo_double', name:'双向奔赴', rarity:'rare', prio:80,
    blurb:'你们从同桌到恋人，从恋人到夫妻，从夫妻到老友。中间没有一次走散。',
    closing:'你最后想说的是：谢谢你，从十七岁开始。',
    match:(s,c)=>c.f.married && c.f.firstCrush && c.bonds.lover>=75 },
  { id:'combo_repay', name:'报恩的人', rarity:'rare', prio:74,
    blurb:'你花了半辈子照顾家人。没人要求你这么做，你就是觉得该这么做。',
    closing:'你走的时候，床边站满了人。',
    match:(s,c)=>c.f.caregiving && c.bonds.family>=75 },
  { id:'combo_alone_old', name:'独居老人', rarity:'uncommon', prio:62,
    blurb:'你一个人住了很多年。房间很整洁，安静得能听见冰箱的声音。',
    closing:'你把每天要做的事写在便利贴上，一张一张撕下来。',
    match:(s,c)=>c.a.relations<30 && c.age>=75 },
  { id:'combo_no_event', name:'什么都没发生', rarity:'uncommon', prio:52,
    blurb:'你的人生没有大起大落，没有刻骨铭心，也没有无法挽回。',
    closing:'后来你才明白，这本身就是一种很难得的运气。',
    match:(s,c)=>c.exp<=1 },
  { id:'combo_survivor_bad', name:'一路磕碰着走过来', rarity:'uncommon', prio:60,
    blurb:'你摔过很多跤：失业、生病、被人辜负。每次你都爬起来，虽然爬得越来越慢。',
    closing:'你最后不是赢了，是撑住了。',
    match:(s,c)=>c.a.mood<55 && c.a.health<60 && c.a.money<50000 && c.age>=65 },

  /* ── 学业（4）── */
  { id:'school_top', name:'学霸', rarity:'rare', prio:74,
    blurb:'你从小学一路考到名校，红榜上有过你的名字，也拿过奖学金。',
    closing:'你后来发现，会读书这件事，最大的价值是让你有了选择权。',
    match:(s,c)=>c.f.goodHighSchool && c.f.university==='985' && c.a.skill>=75 },
  { id:'school_cram', name:'苦读出来的', rarity:'uncommon', prio:62,
    blurb:'高三那年你学到凌晨一点，教室的灯总是最后灭的。',
    closing:'你考出来的每一分，都是自己熬出来的。',
    match:(s,c)=>c.f.crammed && (c.f.university==='985' || c.f.university==='一本') },
  { id:'school_phd', name:'博士', rarity:'rare', prio:76,
    blurb:'你读了太久书，久到同龄人已经换了两份工作。最后你戴上了那顶帽子。',
    closing:'你的名字后来出现在几篇没人看的论文上。',
    match:(s,c)=>c.f.masterDegree && (c.counts.study||0)>=12 },
  { id:'school_skill', name:'技校出身', rarity:'uncommon', prio:58,
    blurb:'中考没考好，你去了中专。别人还在背课文的时候，你已经在车间里了。',
    closing:'你手上那门手艺，比很多文凭都值钱。',
    match:(s,c)=>c.f.zhongkaoScore>0 && c.f.zhongkaoScore<265 && c.a.skill>=70 },

  /* ── 婚姻（4）── */
  { id:'marry_late', name:'晚婚', rarity:'uncommon', prio:60,
    blurb:'别人三十岁就成家了，你四十岁才遇到那个人。',
    closing:'你说：晚一点没关系，对上就好。',
    match:(s,c)=>c.f.married && c.age>=40 && c.bonds.lover>=60 },
  { id:'marry_honeymoon', name:'蜜月', rarity:'uncommon', prio:58,
    blurb:'婚后你们出去走了一趟。照片里两个人都笑得很傻。',
    closing:'那是你们之后很多年都会翻出来看的一组照片。',
    match:(s,c)=>c.f.married && c.f.travel && c.bonds.lover>=70 },
  { id:'marry_divorced', name:'各自安好', rarity:'uncommon', prio:60,
    blurb:'没有争吵，只是一个平常的傍晚，你们同时意识到这段路走到这里了。',
    closing:'你把那扇门轻轻关上，没有回头。',
    match:(s,c)=>c.f.brokeUp && !c.f.married },
  { id:'marry_old_pair', name:'老来伴', rarity:'rare', prio:72,
    blurb:'八十多岁的时候，你们还是每天傍晚牵着手走同一条路。',
    closing:'你走得比他/她早，但你们说好了，下辈子还走这条路。',
    match:(s,c)=>c.f.married && c.bonds.lover>=60 && c.age>=85 },

  /* ── 工作（4）── */
  { id:'work_raise_king', name:'年年加薪', rarity:'uncommon', prio:62,
    blurb:'你在同一家公司待了很多年，每年都比上一年更值钱一点。',
    closing:'你不是最聪明的，但你最稳。',
    match:(s,c)=>c.f.promoted && c.a.money>=200000 },
  { id:'work_slave', name:'打工一生', rarity:'uncommon', prio:58,
    blurb:'你一生做得最多的事就是工作。日历上大部分格子都写着"上班"。',
    closing:'你换来了安身立命，也换来了很多个错过的傍晚。',
    match:(s,c)=>(c.counts.work||0)>=15 },
  { id:'work_startup', name:'摆摊创业', rarity:'rare', prio:70,
    blurb:'你利用周末摆过摊，卖自己做的东西。赚得不多，但那是你自己的生意。',
    closing:'你后来常说：那几个月是我最累也最像自己的时候。',
    match:(s,c)=>(c.counts.finance||0)>=4 && (c.counts.work||0)>=6 && c.a.money>=80000 },
  { id:'work_burnout_out', name:'从倦怠里走出来', rarity:'rare', prio:72,
    blurb:'你曾经连着很多年把全部时间交给工作，后来你终于学会停下来。',
    closing:'你不是不努力了，你只是换了一种努力法。',
    match:(s,c)=>(c.counts.work||0)>=10 && c.a.mood>=68 && c.a.health>=70 },

  /* ── 挣钱（4）── */
  { id:'money_million', name:'百万富翁', rarity:'legend', prio:92,
    blurb:'账户里的数字第一次到了七位数。你盯着看了很久，然后去睡了个好觉。',
    closing:'钱没有解决你的所有问题，但确实解决了很多。',
    match:(s,c)=>c.money>=1000000 },
  { id:'money_steady', name:'稳健理财', rarity:'uncommon', prio:60,
    blurb:'你不追热点，只做看得懂的投资。收益不高，但每一年都是正的。',
    closing:'你最后发现，慢就是快。',
    match:(s,c)=>(c.counts.finance||0)>=6 && c.money>=150000 },
  { id:'money_debt_life', name:'一生负债', rarity:'uncommon', prio:56,
    blurb:'账单一直追着你跑。你很努力，但那个数字从来没真正转正过。',
    closing:'你最后学会了一件事：体面可以很便宜。',
    match:(s,c)=>c.a.money<0 && c.age>=70 },
  { id:'money_selfmade', name:'白手起家', rarity:'rare', prio:78,
    blurb:'你没有任何家底，从负数开始。后来你有了自己的房子、车和存款。',
    closing:'你妈第一次坐你买的车时，哭了很久。',
    match:(s,c)=>!(c.traits||[]).includes('richkid') && c.money>=500000 },

  /* ── 运动（3）── */
  { id:'sport_marathon', name:'马拉松跑者', rarity:'rare', prio:72,
    blurb:'你五十岁那年跑完了人生第一个全马。冲线的时候你哭了。',
    closing:'你后来一直跑，跑到跑不动为止。',
    match:(s,c)=>c.a.health>=62 && c.age>=50 },
  { id:'sport_school_team', name:'校队出身', rarity:'uncommon', prio:58,
    blurb:'学生时代的奖状你留到了很老。你一直是那个跑得比别人快的人。',
    closing:'身体是你最早的朋友，也是最晚离开的那个。',
    match:(s,c)=>c.f.sportsDayDone && c.a.health>=70 },
  { id:'sport_forever', name:'一生运动', rarity:'rare', prio:74,
    blurb:'你七十多岁还能一口气上六楼。体检报告干净得让医生都羡慕。',
    closing:'你没什么养生秘诀，只是从来没停下来过。',
    match:(s,c)=>c.a.health>=55 && c.age>=75 },

  /* ── 修仙（4）── */
  { id:'xian_sword', name:'剑修成名', rarity:'rare', prio:78,
    blurb:'你一招破过很多人的剑。修真界提起你，都会说"那个人很能打"。',
    closing:'你的剑后来插在了一座无名山头上。',
    match:(s,c)=>c.f.duelWin && (c.level||0)>=25 && c.a.skill>=75 },
  { id:'xian_long_body', name:'长生体', rarity:'rare', prio:80,
    blurb:'修为到高处，你的身体也跟着变了——不再生病，不再疲惫。',
    closing:'你后来记不清自己上一次"累"是什么时候。',
    match:(s,c)=>(c.level||0)>=49 && c.a.health>=85 },   // patch149：修仙线回滚，不套用凡人分布
  { id:'xian_huohuo_3', name:'三度走火', rarity:'uncommon', prio:64,
    blurb:'你走火入魔过不止一次。每次经脉逆行，你都咬牙重来。',
    closing:'你身上有很多看不见的伤，但你从没退过一步。',
    match:(s,c)=>(c.level||0)>=25 && c.a.health<55 },
  { id:'xian_lone', name:'独修一生', rarity:'uncommon', prio:60,
    blurb:'你上山之后就很少下来了。同门散了，朋友老了，只有你还在。',
    closing:'你最后想的是：山下那棵桃树，还在吗。',
    match:(s,c)=>c.f.xianxia && c.a.relations<35 },
];

/* ===== patch116：重生废柴流专属结局 ===== */
const REBIRTH_ENDINGS = [
  { id:'ending_rebirth_king', name:'重来一次，我全都要', rarity:'legend', prio:110,
    blurb:'你从一张烂牌开始，把整副牌都重新洗了一遍。厂子没倒，母亲还在，那个人也没走。',
    closing:'这一世你没许过什么大愿。你只是把前一世所有来不及做的事，一件一件补上了。',
    match:(s)=>!!s.flags.rebirth && (s.attrs.money||0) >= 5000000 && (s.attrs.mood||0) >= 55 },
  { id:'ending_rebirth_again', name:'重蹈覆辙', rarity:'rare', prio:60,
    blurb:'你带着记忆回来，却什么也没能改变。那些话你一次都没说出口。',
    closing:'最后一刻你想：如果还能再来一次。然后就没有然后了。',
    match:(s)=>!!s.flags.rebirth && (s.attrs.mood||0) < 35 },
];
ENDING_CARDS.push(...REBIRTH_ENDINGS);


/* ── 选择策略：稀有度分层抽签 + 层内按 prio 加权 ──
   直接按稀有度硬排序会让一张宽松的 legend 卡吞掉全局，
   所以先按概率决定"抽哪一层"，该层无命中则逐层下探。 */
const RARITY_ROLL = [['legend', 0.06], ['rare', 0.18], ['uncommon', 0.34], ['common', 0.42]];
const RARITY_ORDER = ['legend', 'rare', 'uncommon', 'common'];

/** 由 state 派生的确定性伪随机（保证存档可复现，不用 Math.random） */
function endingHash(state, salt) {
  let h = ((state.seed >>> 0) ^ 0x9e3779b9 ^ (salt * 0x27d4eb2d)) | 0;
  const mix = (x) => { h = Math.imul(h ^ (x | 0), 0x85ebca6b); h ^= h >>> 13; };
  mix(state.age);
  mix(Math.round(state.attrs.health * 7));
  mix(Math.round(state.attrs.mood * 7));
  mix(Math.round(state.attrs.money));
  mix(Math.round(state.attrs.skill * 7));
  mix(Math.round(state.attrs.relations * 7));
  const counts = state.counts || {};
  for (const k of Object.keys(counts)) { mix(counts[k]); for (let i = 0; i < k.length; i++) mix(k.charCodeAt(i)); }
  const flags = state.flags || {};
  for (const k of Object.keys(flags)) if (flags[k]) for (let i = 0; i < k.length; i++) mix(k.charCodeAt(i) * (i + 1));
  return ((h >>> 0) % 1000003) / 1000003;
}

/** 仙途结局卡：id 以 xian_ / root_ 开头 */
// patch8：灵根专属结局卡的 id 以 root2_ 开头，必须一起认进来，
// 否则它们会被当成普通卡池的卡，在修仙者的结局里永远选不到。
function isXianCard(c) { return /^(xian_|root2?_)/.test(c.id); }

/* 仙途结局的优先级表：境界越高 / 条件越具体越优先。
   修仙结局不能走"稀有度抽签"——那样飞升的玩家可能被抽到 common 层，
   而 common 层没有任何仙途卡，就会被"平凡而独特"抢走。 */
const XIAN_PRIO = {
  xian_huohuo_die: 130, xian_battle: 128, xian_sit: 126,   // 死因明确，最优先
  xian_feisheng: 124, xian_huashen: 118, xian_long_body: 116,
  xian_yuanying: 112, xian_sword: 108, xian_huohuo_3: 106,
  xian_jindan: 104, xian_alchemy: 100, xian_land: 96,
  root_tian: 94, root_chaos: 76, xian_zhuji: 88,
  /* ── 灵根专属结局卡（patch8 新增，prio 按品级分档）── */
  root2_chaos_origin: 104,
  root2_daoti: 104,
  root2_jin: 90,
  root2_mu: 90,
  root2_shui: 90,
  root2_huo: 90,
  root2_tu: 90,
  root2_lei: 90,
  root2_hun: 90,
  root2_ri: 90,
  root2_yue: 90,
  root2_single: 90,
  root2_dual: 90,
  root2_dual_shu: 90,
  root2_dual_tong: 90,
  root2_feng: 90,
  root2_bing: 90,
  root2_huan: 90,
  root2_di: 90,
  root2_xue: 90,
  root2_dual_ke: 76,
  root2_triple: 76,
  root2_quad: 76,
  xian_mortal_heart: 86, root_pseudo: 76, xian_lone: 82, xian_lianqi: 80,
};
const xianPrio = (c) => (XIAN_PRIO[c.id] != null ? XIAN_PRIO[c.id] : (c.prio || 50));

function pickEndingCard(state, ctx) {
  const buckets = { legend: [], rare: [], uncommon: [], common: [] };
  const xianBuckets = { legend: [], rare: [], uncommon: [], common: [] };
  for (const c of ENDING_CARDS) {
    let ok = false;
    try { ok = !!c.match(state, ctx); } catch (e) { ok = false; }
    if (!ok) continue;
    (isXianCard(c) ? xianBuckets : buckets)[c.rarity].push(c);
  }
  const roll = endingHash(state, 1);
  let acc = 0, tier = 'common';
  for (const [name, p] of RARITY_ROLL) { acc += p; if (roll < acc) { tier = name; break; } }
  // patch48：tier 仍然抽（决定"这次运气够不够好"），但 pickIn 只看最高非空档，
  // 所以 tier 的实际作用是：让稀有度分布仍由 RARITY_ROLL 决定，而不是被最具体的卡垄断。
  const tierIdx = RARITY_ORDER.indexOf(tier);
  // patch49：稀有度系数——越稀有的档乘得越小，保证稀有结局仍然稀有；
  // 但 prio 直接参与权重，所以「最具体的那张卡」权重最高，不会被低档卡抢走。
  // patch50：拉开稀有度权重——原来 0.75/0.9/1.1/1.35 差距太小，
  // 「金婚(legend,98×0.75=73.5)」只比「丁克(uncommon,62×1.1=68.2)」高 8%，
  // 于是够金婚的玩家仍有一半被抢。现在 98×2.0=196 远胜 62×1.0=62。
  const RARITY_WEIGHT = { legend: 2.0, rare: 1.5, uncommon: 1.0, common: 0.7 };
  const pickIn = (bk) => {
    const all = [];
    for (const t of RARITY_ORDER) for (const c of bk[t]) all.push(c);
    if (!all.length) return null;
    const wt = (c) => (c.prio || 50) * (RARITY_WEIGHT[c.rarity] || 1);
    const total = all.reduce((a, c) => a + wt(c), 0);
    let r = endingHash(state, 7) * total;
    for (const c of all) { r -= wt(c); if (r <= 0) return c; }
    return all[all.length - 1];
  };
  // 修仙者且已筑基：人生主线已是仙途，结局必须在仙途卡池里选
  //   先取"最高匹配境界"，再在同一境界区间（≥最高分 ×0.85）内按 prio 加权随机，
  //   这样既保证「飞升的不会得到练气而终」，又保留同境界内剑修/丹师/灵脉等变体。
  const isXian = !!(state.flags && state.flags.xianxia);
  const lv = state.cultivationLevel || 0;
  if (isXian && lv >= 13) {
    const flat = [];
    for (const t of RARITY_ORDER) flat.push(...xianBuckets[t]);
    if (flat.length) {
      const maxP = Math.max(...flat.map(xianPrio));
      // patch43：原来是 0.85 —— 飞升(124)×0.85=105.4，把化神(118)、元婴(112)、
      // 金丹走火(106) 也放了进来一起随机，导致飞升玩家只有 24% 拿到飞升卡。
      // 提到 0.96（124×0.96=119）后，各境界只会选到自己那一档，不再越级错配。
      const near = flat.filter((c) => xianPrio(c) >= maxP * 0.96);
      const total = near.reduce((a, c) => a + xianPrio(c), 0);
      let r = endingHash(state, 11) * total;
      for (const c of near) { r -= xianPrio(c); if (r <= 0) return c; }
      return near[near.length - 1];
    }
  }
  return pickIn(buckets) || (isXian ? pickIn(xianBuckets) : null);
}

function buildEnding(state) {
  const a = state.attrs;
  const bonds = state.bonds;
  const counts = state.counts || {};
  const years = state.journal.filter((j) => j.kind === 'year');
  const allSpecials = state.journal.filter((j) => j.kind === 'special');
  // 只有事件/行动带来的“特别经历”计入风格评分；年龄与属性里程碑不计
  const specials = allSpecials.filter((j) => j.source !== 'milestone' && j.source !== 'small' && j.source !== 'achievement');
  const experiences = specials.length;
  const first = years[0] || {};
  const last = years[years.length - 1] || {};
  const earlyEnd = state.died ? isEarlyDeath(state.age) : a.health <= 0;
  const yearsLived = state.age + 1;

  /* —— 风格判定：先把各维度归一化到 0~1，再比较，避免量纲不公 —— */
  const achList = ACHIEVEMENTS
    .filter((x) => state.achievements && state.achievements[x.id])
    .map((x) => ({ name: x.name, cat: x.cat, desc: x.desc, year: state.achievements[x.id] }))
    .sort((p, q) => p.year - q.year);
  const moneyCap = Math.min(a.money, 1200000);
  const raw = {
    relations: a.relations * 0.6 + bonds.friends * 0.25 + bonds.lover * 0.35 + bonds.family * 0.2 + (counts.social || 0) * 1.2,
    career: a.skill * 0.5 + moneyCap / 2500 + (counts.work || 0) * 1.8,
    wealth: moneyCap / 1600 + a.health * 0.3 + a.mood * 0.3,
    calm: a.health * 0.55 + a.mood * 0.6 + (counts.rest || 0) * 2.2,
    explore: (counts.study || 0) * 2.2 + (counts.create || 0) * 1.2 + a.skill * 0.4 + (state.flags.travel ? 20 : 0) + (state.flags.movedCity ? 15 : 0),
    art: (counts.create || 0) * 3 + a.skill * 0.35 + experiences * 2,
    wander: (state.flags.travel ? 28 : 0) + (state.flags.movedCity ? 24 : 0) + experiences * 3 + (counts.create || 0) * 0.5,
    scholar: (counts.study || 0) * 3 + a.skill * 0.5,
    caregiver: bonds.family * 0.45 + bonds.child * 0.35 + (state.flags.caregiving ? 35 : 0) + (state.flags.married ? 10 : 0),
    survivor: (state.age >= 80 ? 45 : 0) + (100 - a.health) * 0.45 + (state.flags.checkup ? 15 : 0) + (state.flags.gym ? 15 : 0),
    hermit: a.mood * 0.5 + a.health * 0.35 + (counts.social ? 0 : 30) + (counts.rest || 0) * 2 - Math.max(0, moneyCap) / 4000,
  };
  const norm = {"relations":144.8,"career":74.1,"wealth":71.7,"calm":137.5,"explore":114,"art":109.3,"wander":78,"scholar":95.5,"caregiver":79.2,"survivor":63.4,"hermit":106.7};
  state.__raw = raw;
  const scores = {};
  for (const k of Object.keys(raw)) scores[k] = raw[k] / norm[k];

  // 主导行动加成：一生中做得最多的事，应该让人生风格偏向它
  const mainAct = state.journal
    .map((j) => j.actionId)
    .filter(Boolean)
    .sort((a, b) => (counts[b] || 0) - (counts[a] || 0))[0];
  const mainShare = mainAct ? (counts[mainAct] || 0) / Math.max(1, yearsLived) : 0;
  if (mainShare >= 0.3) {
    const bonus = { work: 'career', study: 'explore', rest: 'calm', social: 'relations', create: 'art', finance: 'wealth' };
    if (bonus[mainAct]) scores[bonus[mainAct]] += 0.28;
    if (mainAct === 'work' && moneyCap > 600000) scores.wealth += 0.1;
    if (mainAct === 'create' && (state.flags.travel || state.flags.movedCity)) scores.wander += 0.12;
  }

  let styleId = 'plain';
  if (state.flags && state.flags.xianxia) styleId = 'immortal';
  else if (earlyEnd) styleId = 'short';
  else {
    let best = -1;
    for (const k of Object.keys(scores)) if (scores[k] > best) { best = scores[k]; styleId = k; }
    if (best < 0.35) styleId = 'plain';   // 没有任何主线时，才归为"平凡而独特"
  }
  let style = STYLE_TEXT[styleId] || STYLE_TEXT.plain;
  let __card = null;
  try {
    __card = pickEndingCard(state, {
      a, bonds, f: state.flags || {}, counts,
      age: state.age, traits: Array.isArray(state.traitIds) ? state.traitIds : [state.traitId].filter(Boolean),
      cause: state.deathCause || '', exp: experiences, money: moneyCap,
      level: state.cultivationLevel || 0, years: yearsLived, died: !!state.died, base: styleId,
      achCount: achList.length, root: (state.flags || {}).spiritRoot || null,
      score: (state.flags || {}).gaokaoScore || 0,
    });
  } catch (e) { __card = null; }
  if (__card) style = { name: __card.name, blurb: __card.blurb, closing: __card.closing };
  const trait = TRAIT_BY_ID[state.traitId] || TRAIT_BY_ID.optimist;
  // patch33：本局自动补入的特质（开局没选满时），用来在界面上标一下
  const autoFilled = (state && state.autoFilledTraits) || [];
  // patch34：也写进手账，这样进游戏翻手账就能看到
  if (autoFilled.length) {
    try {
      journal.unshift({ age: 0, kind: 'special', title: '出发时补上的特质',
        text: '你没有选满五个特质，于是「' + autoFilled.map((t) => t.name).join('、') + '」被随机补了上来。' });
    } catch (e) { /* 手账结构异常时不影响其它流程 */ }
  }

  /* —— 人生叙述 —— */
  const paras = [];
  paras.push(
    `${state.name}的一生，从 ${first.year || state.year - yearsLived + 1} 年的那个${
      WEATHER_BY_ID[first.weatherId] ? WEATHER_BY_ID[first.weatherId].name : '普通'
    }天开始，到 ${last.year || state.year} 年的${
      WEATHER_BY_ID[last.weatherId] ? WEATHER_BY_ID[last.weatherId].name : '普通'
    }天收尾。一共 ${yearsLived} 年，起始特质是「${trait.name}」——${trait.desc}`
  );
  // patch34：补入的特质要说出来，否则玩家不知道自己身上多了什么
  if (autoFilled.length) {
    paras.push('出发时你还没拿定主意，于是「' + autoFilled.map((t) => t.name).join('、') + '」被随机补了上来。');
  }

  for (const st of STAGES) {
    if (st.min > state.age) continue;                       // 没活到这个阶段，直接略过
    const actualMax = Math.min(st.max, state.age);
    const stYears = years.filter((y) => y.age >= st.min && y.age <= st.max);
    const main = stYears.length ? mainActionOf(stYears) : null;
    // 年数必须按【年龄跨度】算，而不是手账条目数：闭关一次跳 10 年却只产生 1 条记录，
    // 否则会出现「61–83 岁：这 3 年」这种自相矛盾，且各阶段年数之和对不上总寿命。
    const spanYears = Math.max(1, actualMax - st.min + 1);
    const tail = main
      ? (STAGE_COMMENT[main.id] || '那几年没有明确的主线，但也都算数。')
      : (state.flags && state.flags.xianxia
          ? '这几年你几乎都在闭关，山下的事与你无关。'
          : '这几年你没有留下太多记录，时间过得很快。');
    paras.push(
      `${st.min}—${actualMax} 岁，${st.name}：这 ${spanYears} 年里，${
        main ? `你最常做的事是「${main.name}」。` : ''
      }${tail}`
    );
  }

  /* —— 关系 —— */
  const bondLines = [];
  if (bonds.lover >= 45) bondLines.push('你认真地爱过，也被一个人稳稳地爱过');
  if (bonds.child >= 30) bondLines.push('你把一个孩子养大了，他/她现在是你最软的牵挂');
  if (bonds.family >= 65) bondLines.push('家人一直在原地等你，这是你最硬的底牌');
  if (bonds.friends >= 55) bondLines.push('你有几个随叫随到的朋友，深夜也敢打电话');
  if (bonds.pet >= 50) bondLines.push('还有一只把沙发当成国土的小动物，替你守了很多年家');
  if (!bondLines.length) bondLines.push('这一生你多数时候一个人，但你把独处过成了一种本事');
  if (state.flags.penpal) bondLines.push('你和一个人通了整整一年的信，从未见面，也从未间断');
  if (state.flags.caregiving) bondLines.push('有几年你在照顾家人，那几年你比自己以为的更勇敢');

  /* —— 天气记忆 —— */
  const weatherTally = {};
  for (const w of state.weatherHistory) weatherTally[w.weatherId] = (weatherTally[w.weatherId] || 0) + 1;
  let topWeatherId = null;
  for (const k of Object.keys(weatherTally)) if (!topWeatherId || weatherTally[k] > weatherTally[topWeatherId]) topWeatherId = k;
  const stormCount = weatherTally.storm || 0;
  const weatherLine = topWeatherId
    ? `${state.weatherHistory.length} 个有记录的年头里，${WEATHER_BY_ID[topWeatherId].name}天最多（${weatherTally[topWeatherId]} 年）${
        stormCount ? `，也经历过 ${stormCount} 场雷阵雨` : ''
      }。天气替你记住了那些说不出口的心情。`
    : '这一生的天气，平淡得恰到好处。';

  /* —— 关键时刻 —— */
  const scored = years
    .map((y) => ({ y, s: (y.deltas || []).reduce((acc, d) => acc + Math.abs(d.value), 0) }))
    .sort((p, q) => q.s - p.s)
    .slice(0, 5)
    .map((x) => x.y);
  const moments = [...specials.slice(-4), ...scored]
    .sort((p, q) => p.year - q.year)
    .slice(0, 9);

  /* —— 标签 —— */
  const tags = [`起始特质：${trait.name}`];
  const tagRules = [
    [(counts.work || 0) >= 8, '工作狂'],
    [(counts.rest || 0) >= 8, '休息艺术家'],
    [(counts.create || 0) >= 6, '手艺人'],
    [(counts.social || 0) >= 8, '人间关系户'],
    [(counts.study || 0) >= 6, '终身学习者'],
    [(counts.finance || 0) >= 5, '精明钱串子'],
    [a.health >= 80, '铁打的身体'],
    [a.mood >= 80, '快乐体质'],
    [a.money >= 500000, '小有积蓄'],
    [bonds.lover >= 80, '恋爱脑（褒义）'],
    [state.flags.pet, '有猫/有狗的人'],
    [state.flags.movedCity, '换过城市的人'],
    [state.flags.travel, '在路上的人'],
    [state.flags.therapy, '懂得求助的人'],
    [state.flags.created, '作品被看见过的人'],
  ];
  for (const [cond, label] of tagRules) if (cond) tags.push(label);
  // 死亡标签
  if (state.died && state.age < 30) tags.push('英年早逝');
  else if (state.died && state.age < 50) tags.push('天不假年');
  else if (state.age >= 100) tags.push('百岁高寿');
  else if (state.age >= 85) tags.push('喜丧');
  else if (state.flags && state.flags.feisheng) tags.push('白日飞升');
  else if (state.flags && state.flags.xianxia) tags.push('修仙者');
  if (state.flags && state.flags.married) tags.push('成过家');
  if (state.flags && state.flags.hasChild) tags.push('为人父母');
  if (tags.length === 1) tags.push('自成一派');

  /* —— 最终属性 —— */
  const finalAttrs = [
    { name: '健康', value: Math.round(a.health) },
    { name: '心情', value: Math.round(a.mood) },
    { name: '金钱', value: Math.round(a.money) },
    { name: '关系', value: Math.round(a.relations) },
    { name: '技能', value: Math.round(a.skill) },
  ];

  const actionCounts = Object.keys(ACTION_BY_ID).map((id) => ({
    name: ACTION_BY_ID[id].name,
    n: counts[id] || 0,
  })).sort((p, q) => q.n - p.n);

  return {
    achievements: achList,
    achievementTotal: ACHIEVEMENTS.length,
    styleId,
    cardId: __card ? __card.id : null,
    cardRarity: __card ? __card.rarity : null,
    styleName: style.name,
    styleBlurb: style.blurb,
    closing: style.closing,
    paras,
    bondLines,
    weatherLine,
    moments,
    tags,
    finalAttrs,
    actionCounts,
    yearsLived,
    // patch164：飞升不是死亡，界面不该用「享年」
    feisheng: !!(state.flags && state.flags.feisheng),
    specialCount: specials.length,
    earlyEnd,
    name: state.name,
    traitName: trait.name,
  };
}

// ===== src/ui/modals.js =====
// 弹窗与 Toast


const root = () => document.getElementById('modal-root');

function toast(msg, ms = 2600) {
  const host = document.getElementById('toast-root');
  if (!host) return;
  const el = h('div', { class: 'toast', text: msg });
  host.append(el);
  setTimeout(() => {
    el.classList.add('leaving');
    setTimeout(() => el.remove(), 260);
  }, ms);
}

function openModal({ title, body, actions = [], onClose }) {
  const host = root();
  clear(host);
  const close = () => { clear(host); if (onClose) onClose(); };
  const backdrop = h('div', {
    class: 'modal-backdrop',
    onclick: (e) => { if (e.target === backdrop) close(); },
  });
  const titleId = 'modal-title-' + Math.random().toString(36).slice(2, 7);
  const modal = h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': titleId },
    h('div', { class: 'modal-title', id: titleId, text: title }),
    body,
    h('div', { class: 'modal-actions' },
      actions.map((a) => h('button', {
        class: `btn ${a.kind || ''}`,
        type: 'button',
        onclick: () => { if (a.keepOpen !== true) close(); if (a.onClick) a.onClick(); },
        disabled: a.disabled || false,
      }, a.html ? h('span', { html: icon(a.icon || '') + ' ' + a.text }) : [a.icon ? h('span', { html: icon(a.icon) }) : null, a.text]))
    )
  );
  backdrop.append(modal);
  host.append(backdrop);
  // 焦点管理
  const focusable = modal.querySelector('button, [href], input, select, textarea');
  if (focusable) focusable.focus();
  const onKey = (e) => {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); }
  };
  document.addEventListener('keydown', onKey);
  return { close };
}

function confirmDialog({ title, message, confirmText = '确定', cancelText = '取消', danger = false, onConfirm }) {
  return openModal({
    title,
    body: h('p', { style: { color: 'var(--ink-soft)', fontSize: '14.5px' }, text: message }),
    actions: [
      { text: cancelText, kind: 'btn-ghost' },
      { text: confirmText, kind: danger ? 'btn-danger' : 'btn-primary', onClick: onConfirm },
    ],
  });
}

function closeModal() { clear(root()); }

// ===== src/ui/settlement.js =====
// 年末结算弹窗





function renderSettlementModal(report, { onNext, onFinish }) {
  const forecast = WEATHER_BY_ID[report.forecastId] || WEATHER_BY_ID.cloudy;
  const deltaChips = report.deltas.map((d) => {
    const meta = ATTRS.find((a) => a.key === d.key);
    return h('span', { class: `delta-item ${d.value > 0 ? 'up' : 'down'}` },
      h('span', { html: icon(meta ? meta.icon : 'sparkle') }),
      `${meta ? meta.name : d.key} ${deltaText(d.value)}`
    );
  });

  const feedback = report.lines.map((l) => h('li', { text: l.text }));

  // patch21：成就单独高亮——原来混在「这一年留下的东西」里，玩家根本注意不到。
  const achList = report.specials.filter((s) => s.source === 'achievement');
  const otherList = report.specials.filter((s) => s.source !== 'achievement');
  const achBox = achList.length
    ? h('div', { class: 'settle-ach' },
        h('h3', { class: 'card-title', html: icon('star') }, `解锁了 ${achList.length} 项成就`),
        h('ul', { class: 'feedback-list' },
          achList.map((s) => h('li', { class: 'ach-line', html: `<b>${s.title.replace(/^【成就 · (.*?)】/, '【$1】')}</b> —— ${s.text}` }))
        )
      )
    : null;
  const specials = otherList.length
    ? h('div', { class: 'settle-journal' },
        h('h3', { class: 'card-title', html: icon('stamp') }, (report.spanLabel || '这一年') + '留下的东西'),
        h('ul', { class: 'feedback-list' },
          otherList.map((s) => h('li', { html: `<b>${s.title}</b> —— ${s.text}` }))
        )
      )
    : null;
  // 自动结算的「不由你决定」单独再列一块——它们不在回合里出现，必须在这里交代清楚
  const autoList = report.specials.filter((s) => String(s.title || '').indexOf('不由你决定') === 0);
  const autoBox = autoList.length
    ? h('div', { class: 'settle-auto' },
        h('h3', { class: 'card-title', html: icon('cloud') }, '这些事不由你决定'),
        h('ul', { class: 'feedback-list' },
          autoList.map((s) => h('li', { text: `${s.title.replace(/^不由你决定 · /, '')}：${s.text}` }))
        )
      )
    : null;

  const body = h('div', {},
    h('div', { class: 'settle-weather' },
      h('span', { html: icon(forecast.icon) }),
      h('span', {}, `明年的天气预报：${forecast.name}。${forecast.desc}`)
    ),
    h('h3', { class: 'card-title', html: icon('calendar') },
      `${report.age} 岁${report.spanYears > 1 ? '，这 ' + report.spanYears + ' 年发生了这些变化' : '这一年，发生了这些变化'}`),
    deltaChips.length ? h('div', { class: 'delta-list' }, deltaChips) : h('p', { class: 'start-note', text: '这一年风平浪静，数值没有什么变化。' }),
    h('ul', { class: 'feedback-list' }, feedback),
    specials,
    achBox,
    autoBox,
    h('div', { class: 'settle-journal' },
      h('h3', { class: 'card-title', html: icon('note') }, '写进手账的一页'),
      h('div', { class: 'j-title' }, h('span', { text: report.journal.title })),
      h('p', { class: 'j-text', text: report.journal.text })
    ),
    report.ended
      ? h('p', { class: 'repeat-warn', style: { marginTop: '14px' }, // patch67：原来写死「八十岁了」，所以 111 岁去世也显示这句。改成按真实年龄。
        text: report.age >= 80 ? (report.age + ' 岁了，这一生即将收尾。') : '身体到了极限，这一生要提前收尾了。' })
      : null
  );

  return openModal({
    title: `${report.year} 年年末结算`,
    body,
    actions: report.ended
      ? [{ text: '查看人生总结', kind: 'btn-primary', icon: 'star', onClick: onFinish }]
      : [{ text: report.spanYears > 1 ? '继续往后' : '进入下一年', kind: 'btn-primary', icon: 'arrow', onClick: onNext }],
  });
}

// ===== src/ui/scene.js =====
// 场景：真实照片背景 + 天气色调遮罩


const SCENE_IMG = {
  // patch175：改用 WebP（同画质下比 JPEG 小 20-55%）
  city: 'assets/bg/city.webp',
  park: 'assets/bg/park.webp',
  mountain: 'assets/bg/mountain.webp',
  seaside: 'assets/bg/seaside.webp',
};

const SCENE_NAMES = { city: '城市街角', park: '公园长椅', mountain: '山间小路', seaside: '海边黄昏' };

const WEATHER_TINT = {
  sunny:   'linear-gradient(180deg, rgba(255,224,150,.18) 0%, rgba(255,224,150,0) 100%)',
  cloudy:  'linear-gradient(180deg, rgba(175,192,210,.28) 0%, rgba(175,192,210,.08) 100%)',
  drizzle: 'linear-gradient(180deg, rgba(130,158,188,.38) 0%, rgba(130,158,188,.12) 100%)',
  storm:   'linear-gradient(180deg, rgba(60,70,90,.55) 0%, rgba(60,70,90,.28) 100%)',
  fog:     'linear-gradient(180deg, rgba(232,229,220,.4) 0%, rgba(232,229,220,.12) 100%)',
  snow:    'linear-gradient(180deg, rgba(215,232,250,.35) 0%, rgba(215,232,250,.1) 100%)',
  wind:    'linear-gradient(180deg, rgba(195,218,220,.22) 0%, rgba(195,218,220,.05) 100%)',
  rainbow: 'linear-gradient(180deg, rgba(255,230,180,.18) 0%, rgba(255,230,180,.05) 100%)',
  dusk:    'linear-gradient(180deg, rgba(255,150,90,.3) 0%, rgba(255,150,90,.08) 100%)',
};

function sceneSVG(weatherId, stageId) {
  const w = WEATHER_BY_ID[weatherId] || WEATHER_BY_ID.cloudy;
  const stage = STAGES.find((s) => s.scene === stageId) || STAGES[0];
  const img = SCENE_IMG[stage.scene] || SCENE_IMG.city;
  const tint = WEATHER_TINT[w.id] || WEATHER_TINT.cloudy;
  return `<div class="scene-photo" role="img" aria-label="${SCENE_NAMES[stage.scene] || '场景'}，天气${w.name}" style="background-image:url('${img}')">
    <div class="scene-tint" style="background:${tint}"></div>
  </div>`;
}

// ===== src/ui/board.js =====
// 主界面各区块渲染：顶栏 / 场景 / 状态 / 事件 / 行动 / 手账








const CAT_LABELS = { funny: '人间喜剧', work: '现实职场', romance: '恋爱季节', classical: '古风味', life: '生活现场', health: '身心信号' };

function renderTopbar(slot, state, handlers = {}) {
  clear(slot);
  const stage = stageOf(state.age);
  const toolBtn = (iconName, label, title, extra = {}, onClick) => h('button', {
    class: 'btn btn-sm', type: 'button', title, ...extra, onclick: onClick,
  }, h('span', { html: icon(iconName) }), h('span', { class: 'btn-label', text: label }));

  slot.append(
    h('div', { class: 'brand', html: icon('cloudSun') }, '人生天气预报'),
    h('div', { class: 'meta' },
      h('span', { class: 'age-pill' },
        h('span', { class: 'age', text: fmtAge(state.age) }),   // patch130：万岁以上说人话
        h('span', { class: 'year', text: `${state.year} 年` })
      ),
      h('span', { class: 'chip stage-chip' },
        h('span', { class: 'stage-name', text: stage.name }),
        h('span', { class: 'stage-blurb', text: stage.blurb })
      )
    ),
    h('div', { class: 'spacer' }),
    h('div', { class: 'tools' },
      toolBtn('help', '说明', '玩法说明', { 'aria-label': '玩法说明' }, handlers.onHelp),
        // patch172：成就入口（与上面几个按钮同一套 toolBtn，外观完全一致）
        toolBtn('star', '成就', '看看已经拿到了哪些成就', { 'aria-label': '成就' }, handlers.onAchievements),
      toolBtn(state.paused ? 'play' : 'pause', state.paused ? '继续' : '暂停',
        state.paused ? '继续游戏' : '暂停游戏',
        { 'aria-label': state.paused ? '继续游戏' : '暂停游戏', 'aria-pressed': String(!!state.paused) },
        handlers.onTogglePause),
      // P0-4：精确数值开关（默认关，只看故事；打开后恢复原来的精确写法）
      toolBtn('note', (typeof globalThis !== 'undefined' && globalThis.__SHOW_EXACT__) ? '数值·显示' : '数值·隐藏',
        (typeof globalThis !== 'undefined' && globalThis.__SHOW_EXACT__) ? '当前显示精确数值，点一下只看故事' : '当前只看故事，点一下显示精确数值',
        { 'aria-label': '切换精确数值显示', 'aria-pressed': String(!!(typeof globalThis !== 'undefined' && globalThis.__SHOW_EXACT__)) },
        handlers.onToggleNumbers),
      toolBtn('refresh', '重开', '重新开始', { class: 'btn btn-sm btn-danger', 'aria-label': '重新开始' }, handlers.onRestart)
    )
  );
}

function renderScene(slot, state) {
  clear(slot);
  const w = WEATHER_BY_ID[state.pending.weatherId] || WEATHER_BY_ID.cloudy;
  const stage = stageOf(state.age);
  const card = h('div', { class: 'scene-card' },
    h('div', { html: sceneSVG(w.id, stage.scene) }),
    h('div', { class: 'postmark', 'aria-hidden': 'true' },
      h('span', { text: 'LIFE WEATHER' }),
      h('span', { class: 'pm-year', text: `${state.year}` })
    ),
    state.paused ? h('div', { class: 'scene-paused', text: '已 暂 停' }) : null,
    h('div', { class: 'scene-foot' },
      h('span', { html: icon(w.icon), style: { color: 'var(--honey)' } }),
      h('span', { class: 'weather-name', text: `今年是${w.name}天` }),
      h('span', { class: 'weather-desc', text: w.desc })
    )
  );
  slot.append(card);
}

/** 灵根卡（patch7）：入道之后常驻在状态卡下面，把灵根名、品级、倍率与专属事件亮出来。 */
/* 灵根卡样式（patch7）：跟着页面已有的 .card / .bar 走，只补灵根专用的几行。 */
const ROOT_CARD_CSS = `
.root-card .root-body { display: flex; flex-direction: column; gap: 6px; }
.root-card .root-name { font-size: 22px; font-weight: 700; letter-spacing: 2px; }
.root-card .root-sub { display: flex; gap: 12px; font-size: 12px; opacity: .75; flex-wrap: wrap; }
.root-card .root-desc { font-size: 13px; line-height: 1.6; opacity: .85; }
.root-card .root-bars { display: flex; flex-direction: column; gap: 4px; margin-top: 2px; }
.root-card .root-hot { font-size: 12px; color: hsl(35 60% 38%); }
.root-card .root-ev { font-size: 12px; opacity: .6; }
`;
(function injectRootCardCss() {
  if (typeof document === 'undefined' || !document.createElement) return;
  const s = document.createElement('style');
  s.textContent = ROOT_CARD_CSS;
  if (document.head && document.head.appendChild) document.head.appendChild(s);
})();

function renderSpiritRoot(slot, state) {
  if (!(state.flags && state.flags.xianxia)) return;
  const r = spiritRootOf(state);
  if (!r) return;
  const tierName = TIER_NAME[r.tier] || '';
  const hot = r.tier >= 6;
  const pe = Math.round((r.gainMult / 2.45) * 100);          // 修炼增益条
  const pd = Math.round((r.dangerMult / 1.45) * 100);        // 走火风险条
  const evDone = !!state.flags.rootAwakened;
  const card = h('section', { class: 'card root-card', 'aria-label': '灵根' },
    h('h2', { class: 'card-title', html: icon('sparkle') }, '你的灵根'),
    h('div', { class: 'root-body' },
      h('div', { class: 'root-name', style: { color: `hsl(${r.hue} 62% 38%)` }, text: r.name }),
      h('div', { class: 'root-sub' },
        h('span', { class: 'root-tier', text: `${tierName}品 · tier ${r.tier}` }),
        h('span', { class: 'root-mult', text: `闭关收益 ×${r.gainMult}` }),
        h('span', { class: 'root-risk', text: `走火风险 ×${r.dangerMult}` })
      ),
      h('div', { class: 'root-desc', text: r.desc }),
      h('div', { class: 'root-bars' },
        h('div', { class: 'bar' }, h('i', { style: { width: pe + '%', background: `hsl(${r.hue} 62% 52%)` } })),
        h('div', { class: 'bar bar-warn' }, h('i', { style: { width: pd + '%', background: 'var(--danger, #b4543f)' } }))
      ),
      hot ? h('div', { class: 'root-hot', text: '生来就在终点线上——你的每一分修为，都比别人省力。' }) : null,
      h('div', { class: 'root-ev', text: evDone ? '灵根化形：已完成' : '灵根化形：尚未触发（品级 ≥6 才有此关）' })
    )
  );
  slot.append(card);
}

function renderStats(slot, state) {
  clear(slot);
  const deltas = state.phase === 'settle' && state.lastReport ? state.lastReport.deltas : [];
  const card = h('section', { class: 'card', 'aria-label': '当前状态' },
    h('h2', { class: 'card-title', html: icon('sparkle') }, '你现在的状态'),
    h('div', {})
  );
  const list = card.lastChild;
  for (const a of ATTRS) {
    const v = state.attrs[a.key];
    const d = deltas.find((x) => x.key === a.key);
    const ratio = a.key === 'money' ? moneyRatio(v) : v / 100;
    list.append(
      h('div', { class: 'stat-row' },
        h('span', { class: 'stat-ico', html: icon(a.icon), style: { color: a.color } }),
        h('div', { class: 'stat-main' },
          h('div', { class: 'stat-head' },
            h('span', { class: 'stat-name', text: a.name }),
            d ? h('span', { class: `stat-delta ${d.value > 0 ? 'up' : 'down'}`, text: `${deltaText(d.value)}` }) : null,
            h('span', { class: 'stat-val', text: a.key === 'money' ? `￥${moneyText(v)}` : String(Math.round(v)) })
          ),
          h('div', { class: 'bar' }, h('i', { style: { width: `${Math.round(ratio * 100)}%`, background: a.color } })),
          h('div', { class: 'stat-desc', text: a.desc(v) })
        )
      )
    );
  }

  /* ===== patch143：修仙者的「境界」维度 =====
     凡人只有健康/心情/金钱/关系/技能五行；入道之后多一行境界。 */
  if (state.flags && state.flags.xianxia && (state.cultivationLevel || 0) > 0) {
    const _lv = state.cultivationLevel;
    const _realm = realmOf(_lv);
    const _layer = (typeof layerInRealm === 'function') ? layerInRealm(_lv) : 1;
    const _ratio = Math.max(0, Math.min(1, _layer / 12));
    list.append(
      h('div', { class: 'stat-row' },
        h('span', { class: 'stat-ico', html: icon('sparkle'), style: { color: '#8d6fa8' } }),
        h('div', { class: 'stat-main' },
          h('div', { class: 'stat-head' },
            h('span', { class: 'stat-name', text: '境界' }),
            h('span', { class: 'stat-val', text: _realm.name + ' · 第 ' + _layer + ' 层' })
          ),
          h('div', { class: 'bar' }, h('i', { style: { width: Math.round(_ratio * 100) + '%', background: '#8d6fa8' } })),
          h('div', { class: 'stat-desc', text: (_realm.desc || '') + '　共 ' + _lv + ' / 108 层' })
        )
      )
    );
  }

  slot.append(card);
  renderSpiritRoot(slot, state); // patch7：灵根卡常驻在状态卡之后
}

function renderEvent(slot, state, handlers = {}) {
  clear(slot);
  const ev = EVENTS.find((e) => e.id === state.pending.eventId) || null;
  const locked = !!state.paused;
  const card = h('section', { class: 'card event-card' });

  // patch14：本回合有两个候选事件时，先让玩家挑一个方向（选完再看选项）
  const cands = (state.pending.eventChoices || []).filter((id) => id && id !== state.pending.eventId);
  if (cands.length && !state.pending.autoPatch) {
    const picker = h('div', { class: 'event-choices-picker' });
    picker.append(h('div', { class: 'event-cat', html: icon('sparkle') }, '先奔哪件事去'));
    const row = h('div', { class: 'choices' });
    const cur = EVENTS.find((e) => e.id === state.pending.eventId);
    for (const id of [state.pending.eventId, ...cands]) {
      const e2 = EVENTS.find((x) => x.id === id);
      if (!e2) continue;
      row.append(h('button', {
        class: 'choice', type: 'button', disabled: locked,
        'aria-pressed': String(e2.id === state.pending.eventId),
        onclick: () => handlers.onPickEvent && handlers.onPickEvent(e2.id),
      }, h('span', { class: 'c-text', text: e2.title }),
         h('span', { class: 'c-hint', text: (CAT_LABELS[e2.cat] || '年度事件') })));
    }
    picker.append(row);
    slot.append(picker);
  }

  if (!ev) {
    card.append(
      h('div', { class: 'event-cat', html: icon('note') }, '平静的一年'),
      h('h2', { class: 'event-title', text: '没有什么大事发生' }),
      h('p', { class: 'event-text', text: '这一段像一杯温水：不烫口，也不凉。你把日子过成了日常，而日常本身就是答案。' })
    );
    slot.append(card);
    return;
  }

  const choices = ev.choices || [];
  const chosen = Number.isInteger(state.pending.choice) ? state.pending.choice : null;

  card.append(
    h('div', { class: 'event-cat', html: icon('sparkle') }, `${CAT_LABELS[ev.cat] || '年度事件'}`),
    h('h2', { class: 'event-title', text: ev.title }),
    h('p', { class: 'event-text', text: ev.text })
  );

  // patch19：自动结算的事件**不再出现在回合里**（玩家要求「不用出现在玩家回合中」）。
  // 它们由 resolveYear 直接判、结果写进年末结算。所以这里不再渲染 auto 分支。

  if (choices.length) {
    const list = h('div', { class: 'choices', role: 'group', 'aria-label': '事件选项' });
    choices.forEach((c, i) => {
      list.append(h('button', {
        class: 'choice', type: 'button',
        'aria-pressed': String(chosen === i),
        disabled: locked,
        onclick: () => handlers.onChoice && handlers.onChoice(i),
      },
        h('span', { class: 'c-text', text: c.text }),
        c.hint ? h('span', { class: 'c-hint', text: c.hint }) : null
      ));
    });
    card.append(list);

    // patch15：去掉「选完选项后的数值预览」。
    // 玩家反馈要看内容而不是算属性——选之前只给文案与 hint，真实结果等年末结算。
  }
  slot.append(card);
}

function renderActions(slot, state, handlers = {}) {
  clear(slot);
  const locked = !!state.paused;
  const chosenAction = state.pending.actionId;
  const ev = EVENTS.find((e) => e.id === state.pending.eventId) || null;
  const needChoice = ev && ev.choices && ev.choices.length && !Number.isInteger(state.pending.choice);

  // 婴儿期：没有行动选择，直接推进——按钮文案按**实际跨度**显示
  // patch165：原来无论跨几年都写"长大一岁"，五年一段时明显和实际不符
  if (state.age < 7) {
    state.pending.actionId = 'rest';
    const _babySpan = Math.max(1, state.crossedSpan || 1);
    const _babyBtnText = _babySpan > 1 ? `长大 ${_babySpan} 岁` : '长大一岁';
    const card = h('section', { class: 'card' },
      h('h2', { class: 'card-title', html: icon('cloudSun') }, '天气'),
      h('p', { class: 'event-text', text: state.age < 1 ? '你还是个襁褓中的婴儿，世界是模糊的。饿了哭，困了睡。' : state.age < 3 ? '你在学走路、学说话，一切都新鲜。' : '背上书包上学了，认识了第一个朋友。' }),
      h('div', { class: 'settle-row' },
        h('span', { class: 'settle-hint', text: '小朋友还不会做选择，大人帮你安排好了' }),
        h('button', {
          class: 'btn', type: 'button', id: 'btn-auto',
          disabled: locked,
          'aria-pressed': String(!!state.auto),
          onclick: () => handlers.onToggleAuto && handlers.onToggleAuto(),
        }, h('span', { html: icon(state.auto ? 'pause' : 'play') }), state.auto ? '停止自动' : '自动'),
        h('button', { class: 'btn btn-primary', type: 'button', disabled: locked,
          onclick: () => handlers.onSettle && handlers.onSettle() },
          h('span', { html: icon('arrow') }), _babyBtnText)
      )
    );
    slot.append(card);
    return;
  }

  const streak = state.streak;
  const repeatN = streak.action && streak.n >= 3 ? streak.n : 0;

  const grid = h('div', { class: 'actions-grid', role: 'group', 'aria-label': '年度行动' });
  for (const act of ACTIONS) {
    // 没找到工作前，不能选"专注工作"
    const noJobYet = act.id === 'work' && !(state.flags && state.flags.employed);
    const tooPoor = act.id === 'finance' && state.attrs.money < 5000;
    const disabled = locked || tooPoor || noJobYet;
    const selected = chosenAction === act.id;
    const isMarried = !!(state.flags && state.flags.married);
    const displayName = act.id === 'social' && isMarried ? '经营家庭' : act.name;
    const displayTagline = act.id === 'social' && isMarried ? '和TA好好过日子，把家过暖。' : act.tagline;
    const costNote = noJobYet ? '还没找到工作，先选别的'
      : tooPoor ? '本金不足 5000，无法开始'
      : act.id === 'work' ? '收入稳，连轴会累'
      : act.id === 'study' ? '花钱换成长'
      : act.id === 'rest' ? '没收入，回状态'
      : act.id === 'social' ? (isMarried ? '花小钱，暖小家' : '花小钱，暖关系')
      : act.id === 'create' ? '花小钱，养心情'
      : '眼光与运气各占一半';
    grid.append(h('button', {
      class: 'action', type: 'button',
      'aria-pressed': String(selected),
      disabled,
      title: noJobYet ? '你还没找到工作，不能选这个' : (tooPoor ? '本金太少，先靠工作或学习攒一点钱' : `${act.name}：${act.detail}`),
      onclick: () => { if (!noJobYet && handlers.onAction) handlers.onAction(act.id); },
    },
      h('span', { class: 'a-ico', html: icon(act.icon), style: { color: act.color } }),
      h('span', { class: 'a-name', text: displayName }),
      h('span', { class: 'a-tag', text: displayTagline }),
      h('span', { class: 'a-cost', text: costNote })
    ));
  }

  // 修仙者：额外加"闭关修炼"按钮
  if (state.flags && state.flags.xianxia) {
    const lv = state.cultivationLevel || 0;
    // patch153：**统一走引擎的 realmOf / layerInRealm / yearSkip**，不再硬编码。
    // 原来这里只认到「化神期」，返虚/合体/大乘/渡劫都显示成化神；跨度也写死成「十年」。
    const _realm = realmOf(lv);
    const _layerNo = (typeof layerInRealm === 'function') ? layerInRealm(lv) : 1;
    const layer = (_realm.id === 'feisheng') ? '飞升' : `${_realm.name} · ${_layerNo}/12层`;
    const skipTxt = (_realm.yearSkip && _realm.yearSkip > 1) ? `闭关${fmtYears(_realm.yearSkip)}` : '闭关一年';
    const selected = chosenAction === 'cultivate';
    grid.append(h('button', {
      class: 'action', type: 'button',
      'aria-pressed': String(selected),
      disabled: locked,
      title: '闭关修炼：增加修为，可能突破境界，时间快进',
      onclick: () => handlers.onAction && handlers.onAction('cultivate'),
    },
      h('span', { class: 'a-ico', html: icon('sparkle'), style: { color: '#9b8bb4' } }),
      h('span', { class: 'a-name', text: '闭关修炼' }),
      h('span', { class: 'a-tag', text: layer }),
      h('span', { class: 'a-cost', text: `${skipTxt}，与世隔绝` })
    ));
  }

  // patch15：去掉「选完行动后的数值预览」。
  // 原来这里会把「工作 → 金钱 +15000 / 健康 −1.5 / 心情 −3」直接摆出来，
  // 玩家就会去算性价比而不看这件事本身。保留 null 以维持下面的渲染结构。
  const actionPreview = null;

  const card = h('section', { class: 'card' },
    h('h2', { class: 'card-title', html: icon('calendar') }, '接下来，你最想做什么？'),
    grid,
    actionPreview,
    repeatN >= 3
      ? h('p', { class: 'repeat-warn', text: `提醒：这已经是你连续第 ${repeatN} 年做同一件事了，收益会打折，代价会变多。` })
      : null,
    h('div', { class: 'settle-row' },
      h('span', { class: 'settle-hint', text: locked
        ? '已暂停：点击顶栏「继续」后操作'
        : needChoice ? '先从上面的事件里做一个选择'
        : !chosenAction ? '再选一件本年度的主要行动'
        : '选好了，看看会发生什么' }),
      h('button', {
        class: 'btn', type: 'button', id: 'btn-random',
        disabled: locked,
        onclick: () => handlers.onRandom && handlers.onRandom(),
      }, h('span', { html: icon('sparkle') }), '随机'),
      h('button', {
        class: 'btn', type: 'button', id: 'btn-auto',
        disabled: locked,
        'aria-pressed': String(!!state.auto),
        onclick: () => handlers.onToggleAuto && handlers.onToggleAuto(),
      }, h('span', { html: icon(state.auto ? 'pause' : 'play') }), state.auto ? '停止自动' : '自动'),
      h('button', {
        class: 'btn btn-primary', type: 'button',
        disabled: locked || needChoice || !chosenAction,
        onclick: () => handlers.onSettle && handlers.onSettle(),
      }, h('span', { html: icon('arrow') }), '结算这一段')
    )
  );
  slot.append(card);
}

/* ===== patch21：人生大事记 =====
   原来手账渲染的是「行动名称 + 天气 + 数值 chips」，
   而记录里真正珍贵的两项——**遇到了什么事（eventTitle）**、**你选了什么（choiceText）**——
   根本没被显示出来（数据一直在存，白存了）。
   这里改成「大事记」：以事件与选择为主体，天气收成小字，数值默认折叠。
   里程碑（force）与特殊事件标记为「大事」，人生骨架一眼可见。 */
const JOURNAL_STAGE_GROUPS = [
  { name: '幼年', test: (a) => a < 7 },
  { name: '求学', test: (a) => a >= 7 && a < 19 },
  { name: '青年', test: (a) => a >= 19 && a < 30 },
  { name: '成年', test: (a) => a >= 30 && a < 60 },
  { name: '晚年', test: (a) => a >= 60 },
];
/** 一条大事记 */
function journalEntry(j, opts) {
  const showNumbers = opts && opts.showNumbers;
  const evTitle = j.eventTitle || null;
  const choiceText = j.choiceText || null;
  const isSpecial = j.kind === 'special';
  const isBig = !!j.force || /成就|天灾|生病|意外|好运|高考|中考|退休|结婚|生子|灵根|飞升/.test(String(j.title || ''));
  const chips = (j.deltas || []).map((d) => {
    const meta = ATTRS.find((a) => a.key === d.key);
    return h('span', { class: `chip ${d.value > 0 ? 'chip-up' : 'chip-down'}`,
      text: `${meta ? meta.name : d.key} ${deltaText(d.value)}` });
  });
  return h('li', { class: 'journal-item' + (isBig || isSpecial ? ' journal-big' : '') },
    h('div', { class: 'j-year' },
      h('b', { text: fmtAge(j.age) }),
      h('span', { class: 'j-year-num', text: `${j.year}` })
    ),
    h('div', { class: 'j-body' },
      // 主体：遇到了什么事
      h('div', { class: 'j-what' },
        isBig || isSpecial ? h('span', { class: 'j-mark', text: isSpecial ? '事' : '大事' }) : null,
        h('span', { class: 'j-what-text', text: evTitle || j.title })
      ),
      // 次主体：你选了什么（这是手账最有价值的一行，原来根本没显示）
      //   有些记录没有选择——自动结算的事（不由你决定）、或单选项事件。
      //   这两种情况给一句恰当的说明，不留空。
      (() => {
        if (choiceText) return h('div', { class: 'j-choice' },
          h('span', { class: 'j-choice-label', text: '你选了' }), h('span', { text: choiceText }));
        if (j.autoEvent) return h('div', { class: 'j-choice j-choice-auto' },
          h('span', { class: 'j-choice-label', text: '这事不由你决定' }));
        if (evTitle) return h('div', { class: 'j-choice j-choice-one' },
          h('span', { class: 'j-choice-label', text: '没有别的选择' }));
        return null;
      })(),
      // 结果叙述
      j.text ? h('p', { class: 'j-text', text: j.text }) : null,
      // 天气收成小字
      j.weather ? h('span', { class: 'j-weather', text: j.weather }) : null,
      // 数值默认折叠（与"默认隐藏精确数值"的思路一致）
      (showNumbers && chips.length) ? h('div', { class: 'j-deltas' }, chips) : null
    )
  );
}

function renderJournal(slot, state) {
  clear(slot);
  const card = h('section', { class: 'card' },
    h('h2', { class: 'card-title', html: icon('note') }, '人生手账',
      h('span', { class: 'num', text: `${state.journal.length} 条记录` })
    )
  );
  if (!state.journal.length) {
    card.append(h('p', { class: 'journal-empty', text: '还没有记录。结算第一年之后，这里会慢慢长出你的一生。' }));
    slot.append(card);
    return;
  }
  // patch21：按人生阶段分组，让「骨架」看得见（原来是一长串流水账）
  const items = state.journal.slice().reverse();
  for (const g of JOURNAL_STAGE_GROUPS) {
    const inGroup = items.filter((j) => g.test(j.age));
    if (!inGroup.length) continue;
    card.append(h('h3', { class: 'journal-stage', text: `${g.name} · ${inGroup.length} 条` }));
    const list = h('ol', { class: 'journal-list' });
    for (const j of inGroup) list.append(journalEntry(j, { showNumbers: exactNumbersOn(), keepMoney: true }));
    card.append(list);
  }
  slot.append(card);
}

// ===== src/ui/startScreen.js =====
// 开始页：姓名 / 文风 / 20 种起始特质 / 开始或继续





const DECO = `<svg viewBox="0 0 420 120" role="img" aria-label="装饰：太阳、云朵和打伞的小人">
  <g class="anim-sun" style="transform-origin:78px 44px">
    <circle cx="78" cy="44" r="18" fill="#f6c95e"/><circle cx="78" cy="44" r="26" fill="#f6c95e" opacity=".22"/>
  </g>
  <g stroke="#f6d98a" stroke-width="2.2" stroke-linecap="round" opacity=".8">
    ${Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2;
      return `<line x1="${78 + Math.cos(a) * 24}" y1="${44 + Math.sin(a) * 24}" x2="${78 + Math.cos(a) * 33}" y2="${44 + Math.sin(a) * 33}"/>`; }).join('')}
  </g>
  <g class="anim-cloud slow" opacity=".95">
    <ellipse cx="250" cy="40" rx="26" ry="13" fill="#fffdf7"/>
    <ellipse cx="232" cy="45" rx="15" ry="9" fill="#fffdf7"/>
    <ellipse cx="268" cy="45" rx="16" ry="10" fill="#fffdf7"/>
  </g>
  <g class="anim-cloud" opacity=".7">
    <ellipse cx="150" cy="26" rx="18" ry="9" fill="#fffdf7"/>
    <ellipse cx="136" cy="30" rx="11" ry="6.5" fill="#fffdf7"/>
  </g>
  <g class="anim-rain" stroke="#b9c9d8" stroke-width="1.6" stroke-linecap="round" opacity=".85">
    <line x1="240" y1="58" x2="236" y2="74"/><line x1="252" y1="58" x2="248" y2="74"/>
    <line x1="264" y1="58" x2="260" y2="74"/><line x1="276" y1="58" x2="272" y2="74"/>
  </g>
  <g class="anim-bob">
    <circle cx="330" cy="62" r="6" fill="#5b4f42"/>
    <path d="M324 69q6-8 12 0l4 22h-20z" fill="#8a7563"/>
    <g><path d="M312 54a19 19 0 0 1 38 0z" fill="#e8a37c"/><path d="M331 54v24" stroke="#b07a52" stroke-width="1.8"/></g>
  </g>
  <rect x="0" y="104" width="420" height="16" rx="8" fill="#b7cf9e" opacity=".8"/>
</svg>`;

function renderStartScreen(slot, { saveInfo, onStart, onContinue }) {
  clear(slot);
  // patch166：**开局不预选特质**（原来默认带一个「乐天派」）
  const ui = { name: '', style: 'random', traitIds: [], gender: 'random', timeMode: DEFAULT_TIME_MODE, useLegacy: true };
  const legacyRec = readLegacy();

  const nameInput = h('input', {
    type: 'text', id: 'player-name', maxlength: '12', placeholder: '旅人',
    'aria-label': '给自己起个名字', oninput: (e) => { ui.name = e.target.value; },
  });

  const genderChips = h('div', { class: 'style-chips', role: 'group', 'aria-label': '性别' });
  [['random','？随机'],['male','♂ 男'],['female','♀ 女']].forEach(([id,label]) => {
    genderChips.append(h('button', {
      class: 'style-chip', type: 'button',
      'aria-pressed': String(ui.gender === id),
      onclick: () => {
        ui.gender = id;
        genderChips.querySelectorAll('.style-chip').forEach((b) => b.setAttribute('aria-pressed','false'));
        genderChips.querySelectorAll('.style-chip')[['random','male','female'].indexOf(id)].setAttribute('aria-pressed','true');
      },
    }, label));
  });
  genderChips.querySelectorAll('.style-chip')[0].setAttribute('aria-pressed','true');

  const styleChips = h('div', { class: 'style-chips', role: 'group', 'aria-label': '文案风格' });
  STYLES.forEach((id) => {
    styleChips.append(h('button', {
      class: 'style-chip', type: 'button',
      'aria-pressed': String(ui.style === id),
      onclick: (e) => {
        ui.style = id;
        styleChips.querySelectorAll('.style-chip').forEach((b, i) => b.setAttribute('aria-pressed', String(STYLES[i] === id)));
      },
    }, STYLE_NAMES[id]));
  });

  // patch26：时间单位选择（开局就定这一局的节奏）
  const timeChips = h('div', { class: 'style-chips', role: 'group', 'aria-label': '时间单位' });
  const timeHint = h('p', { class: 'start-note', text: TIME_MODE_DESC[ui.timeMode] });
  ['node', 'three', 'year'].forEach((id) => {
    timeChips.append(h('button', {
      class: 'style-chip', type: 'button',
      'aria-pressed': String(ui.timeMode === id),
      onclick: () => {
        ui.timeMode = id;
        timeChips.querySelectorAll('.style-chip').forEach((b, i) => b.setAttribute('aria-pressed', String(['node','three','year'][i] === id)));
        timeHint.textContent = TIME_MODE_DESC[id];
      },
    }, TIME_MODE_NAMES[id]));
  });

  const traitGrid = h('div', { class: 'trait-grid', role: 'group', 'aria-label': '起始特质（选5个，矛盾的不能同时选）' });
  const traitCount = h('span', { class: 'num', text: `已选 ${ui.traitIds.length}/5` });

  function refreshTraitUI() {
    traitCount.textContent = `已选 ${ui.traitIds.length}/5`;
    traitGrid.querySelectorAll('.trait').forEach((btn) => {
      const id = btn.dataset.traitId;
      btn.setAttribute('aria-pressed', String(ui.traitIds.includes(id)));
    });
  }

  TRAITS.forEach((t) => {
    const btn = h('button', {
      class: 'trait', type: 'button',
      dataset: { traitId: t.id },
      onclick: () => {
        const idx = ui.traitIds.indexOf(t.id);
        if (idx >= 0) {
          ui.traitIds.splice(idx, 1);
        } else {
          // 检查矛盾
          const conflicts = TRAIT_CONFLICTS.filter(pair => pair.includes(t.id))
            .map(pair => pair.find(x => x !== t.id));
          const hit = conflicts.find(c => ui.traitIds.includes(c));
          if (hit) {
            toast(`「${t.name}」和「${(TRAITS.find(x=>x.id===hit)||{}).name}」矛盾，不能同时选`);
            return;
          }
          if (ui.traitIds.length >= 5) {
            toast('最多选5个特质');
            return;
          }
          ui.traitIds.push(t.id);
        }
        refreshTraitUI();
      },
    },
      h('span', { class: 't-name', text: t.name }),
      h('span', { class: 't-desc', text: t.desc })
    );
    traitGrid.append(btn);
  });

  slot.append(
    h('div', { class: 'page-bg', style: { backgroundImage: "url('assets/journal/journal-01.webp')" } }),
    h('header', { class: 'start-hero' },
      h('p', { class: 'kicker', text: 'LIFE WEATHER' }),
      h('h1', { text: '人生天气预报' }),
      h('p', { class: 'sub', text: '从出生到老去，每一段是一页手账：天气、际遇和你做的选择，会一起决定这一生的样子。没有唯一正确的答案，只有属于你的那条路。' }),
    ),
    h('div', { class: 'start-body' },
      h('section', { class: 'card' },
        h('h2', { class: 'card-title', html: icon('smile') }, '出发前的准备'),
        h('div', { class: 'field', style: { marginBottom: '14px' } },
          h('label', { for: 'player-name', text: '怎么称呼你？（可不填）' }),
          nameInput
        ),
        h('div', { class: 'field', style: { marginBottom: '14px' } },
          h('label', { text: '性别？' }),
          genderChips
        ),
        h('div', { class: 'field', style: { marginBottom: '6px' } },
          h('label', { text: '想体验哪种文风？（影响事件口味）' }),
          styleChips
        ),
        legacyRec
          ? h('div', { class: 'field', style: { marginBottom: '14px' } },
              h('label', { text: '上一世' }),
              h('p', { class: 'start-note', text: '上一世是「' + legacyRec.name + '」的一生：' + legacyRec.endingName + ' · ' + legacyRec.years + ' 岁 · 解锁 ' + legacyRec.achievements + ' 项成就' }),
              h('div', { class: 'style-chips', role: 'group', 'aria-label': '是否继承上一世' },
                (function () {
                  const wrap = h('div', { class: 'style-chips' });
                  [['with', '带着痕迹回来'], ['fresh', '全新的一世']].forEach(([id, label]) => {
                    wrap.append(h('button', {
                      class: 'style-chip', type: 'button',
                      'aria-pressed': String((id === 'with') === ui.useLegacy),
                      onclick: () => {
                        ui.useLegacy = (id === 'with');
                        wrap.querySelectorAll('.style-chip').forEach((b, i) => b.setAttribute('aria-pressed', String((i === 0) === ui.useLegacy)));
                      },
                    }, label));
                  });
                  return wrap;
                })()
              )
            )
          : null,
        h('div', { class: 'field', style: { marginBottom: '14px' } },
          h('label', { text: '时间单位（这一局的节奏）' }),
          timeChips,
          timeHint
        ),
        h('p', { class: 'start-note', text: '进度会自动保存在浏览器本地，刷新页面可以继续这一生。' })
      ),
      h('section', { class: 'card' },
        h('h2', { class: 'card-title', html: icon('star') }, '选5个起始特质（矛盾的不能同时选）',
          traitCount
        ),
        h('p', { class: 'start-note', text: '没选满也能直接开始——剩下的会随机补上，进游戏后在特质栏能看到。' }),
        traitGrid
      )
    ),
    h('div', { class: 'start-actions' },
      h('button', {
        class: 'btn btn-primary', type: 'button', id: 'btn-start',
        // patch33：没选满就直接开始（补齐交给 startGame），不必拦下玩家
        onclick: () => onStart({ name: ui.name, style: ui.style, traitIds: ui.traitIds.slice(), gender: ui.gender, timeMode: ui.timeMode, useLegacy: ui.useLegacy }),
      }, h('span', { html: icon('play') }), '开始新的人生'),
      saveInfo
        ? h('button', {
            class: 'btn', type: 'button', id: 'btn-continue',
            onclick: onContinue,
          }, h('span', { html: icon('calendar') }), `继续上次的人生（${saveInfo.name} · ${saveInfo.age} 岁）`)
        : null,
      h('span', { class: 'start-note', text: saveInfo ? '继续会接着上次那一年的进度' : '不填名字也可以直接开始' })
    )
  );
}

// ===== src/ui/endingScreen.js =====
// 结局页：人生总结


function renderEndingScreen(slot, ending, state, { onRestart, onJournal }) {
  // patch23：结局页要能生成分享卡，先把 ending 挂到 state 上供 showShareCard 取用
  try { state.lastEnding = ending; } catch (e) { /* 忽略 */ }
  clear(slot);
  slot.append(
    h('div', { class: 'page-bg', style: { backgroundImage: "url('assets/journal/journal-03.webp')" } }),
    h('header', { class: 'ending-hero' },
      h('p', { class: 'e-kicker', text: 'LIFE WEATHER · 人生总结' }),
      h('h1', { text: `${ending.name}的一生` }),
      // patch164：飞升用「修道」，普通人仍是「年」
      h('p', { class: 'start-note', text: `${ending.feisheng ? '修道 ' : ''}${ending.yearsLived} 年 · ${ending.specialCount} 件特别的事` }),
      h('div', {},
        h('span', { class: 'e-style', html: icon('sparkle') }, `人生风格：${ending.styleName}`)
      ),
    ),
    h('div', { class: 'ending-body' },
      h('div', {},
        h('section', { class: 'card' },
          h('h2', { class: 'card-title', html: icon('note') }, '这一生是怎么过的'),
          ending.paras.map((p) => h('p', { class: 'ending-para', html: highlight(p) })),
          h('p', { class: 'ending-para poetic', text: ending.styleBlurb })
        ),
        h('section', { class: 'card', style: { marginTop: '16px' } },
          h('h2', { class: 'card-title', html: icon('people') }, '关系与牵挂'),
          h('ul', { class: 'feedback-list' }, ending.bondLines.map((b) => h('li', { text: b }))),
          h('p', { class: 'ending-para', style: { marginTop: '10px' }, text: ending.weatherLine })
        ),
        h('section', { class: 'card', style: { marginTop: '16px' } },
          h('h2', { class: 'card-title', html: icon('star') }, '最后的状态'),
          h('div', { class: 'final-stats' },
            ending.finalAttrs.map((a) => h('div', { class: 'final-stat' },
              h('div', { class: 'fs-name', text: a.name }),
              h('div', { class: 'fs-val', text: a.name === '金钱' ? `￥${moneyText(a.value)}` : String(a.value) })
            ))
          ),
          h('h3', { class: 'card-title', style: { marginTop: '14px' }, html: icon('calendar') }, '这些年你做得最多的事'),
          h('div', { class: 'tag-cloud' },
            ending.actionCounts.map((c) => h('span', { class: 'chip', text: `${c.name} × ${c.n}` }))
          )
        )
      ),
      h('div', {},
        h('section', { class: 'card' },
          h('h2', { class: 'card-title', html: icon('sparkle') }, '你的人生标签'),
          h('div', { class: 'tag-cloud' }, ending.tags.map((t) => h('span', { class: 'chip', text: t })))
        ),
        h('section', { class: 'card', style: { marginTop: '16px' } },
          h('h2', { class: 'card-title', html: icon('star') }, `成就（${(ending.achievements || []).length} / ${ending.achievementTotal || 0}）`),
          (ending.achievements || []).length
            ? h('div', { class: 'tag-cloud' },
                ending.achievements.map((a) => h('span', { class: 'chip', title: a.desc, text: `${a.cat} · ${a.name}` })))
            : h('p', { class: 'journal-empty', text: '这一生没有解锁任何成就。' })
        ),
        h('section', { class: 'card', style: { marginTop: '16px' } },
          h('h2', { class: 'card-title', html: icon('stamp') }, '值得记住的时刻'),
          ending.moments.length
            ? h('div', { class: 'moments' },
                ending.moments.map((m) => h('div', { class: 'moment' },
                  h('div', { class: 'm-year', text: fmtYears(m.year) + ' · ' + fmtAge(m.age) }),
                  h('div', { class: 'm-title', text: m.title }),
                  h('p', { class: 'm-text', text: m.text })
                ))
              )
            : h('p', { class: 'journal-empty', text: '这一生平淡安静，没有大波大澜。' })
        ),
        h('section', { class: 'card', style: { marginTop: '16px' } },
          h('h2', { class: 'card-title', html: icon('help') }, '写在最后'),
          h('p', { class: 'ending-para poetic', text: ending.closing }),
          h('p', { class: 'start-note', text: '人生没有标准答案。你做的每一个选择，都已经在这一生里留下了痕迹。' })
        )
      )
    ),
    h('div', { class: 'ending-actions' },
        // patch43：① 去掉「新窗口预览」那个按钮，只留直接生成（原「下载长图」改名）
        h('button', { class: 'btn', type: 'button', onclick: downloadShareCard },
          h('span', { html: icon('share') }), '生成分享卡'),
        // patch43：② 「翻完整手账」与「再过一次人生」互换位置，颜色也跟着换
        h('button', { class: 'btn btn-primary', type: 'button', onclick: onJournal },
          h('span', { html: icon('note') }), '翻完整手账'),
        h('button', { class: 'btn', type: 'button', onclick: onRestart },
          h('span', { html: icon('refresh') }), '再过一次人生')
    ),
    h('p', { class: 'ending-note', text: '进度已保存在浏览器本地，刷新页面仍会看到这份总结。' })
  );
}

/** 把「」里的内容加粗，读起来有节奏 */
function highlight(text) {
  const esc = text.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  return esc.replace(/「([^」]+)」/g, '<b>「$1」</b>');
}

// ===== src/main.js =====
// 入口：状态编排 + 界面调度















const els = {
  start: document.getElementById('start-screen'),
  game: document.getElementById('game'),
  ending: document.getElementById('ending-screen'),
  topbar: document.getElementById('topbar'),
  scene: document.getElementById('scene-slot'),
  event: document.getElementById('event-slot'),
  action: document.getElementById('action-slot'),
  stats: document.getElementById('stats-slot'),
  journal: document.getElementById('journal-slot'),
};

const app = { state: null, rng: null, saveInfo: null };

/* ---------------- 渲染 ---------------- */
function renderBoard() {
  if (!app.state) return;
  // patch104：renderTopbar 会重建 .brand，所以每次渲染后都要重新绑定作弊触发器
  renderTopbar(els.topbar, app.state, {
    onHelp: showHelp,
    onAchievements: showAchievements,   // patch172
    onTogglePause: togglePause,
    onToggleNumbers: toggleNumbers,
    onRestart: confirmRestart,
  });
  renderScene(els.scene, app.state);
  renderStats(els.stats, app.state);
  renderEvent(els.event, app.state, { onChoice: chooseOption });
  renderActions(els.action, app.state, {
    onAction: chooseAction,
    onSettle: settleYear,
    onRandom: randomPick,
    onToggleAuto: toggleAuto,
  });
  renderJournal(els.journal, app.state);
  applyRandomCurls();  try { __cheatInstall(); } catch (e) {}

}

/* ---------------- 界面切换 ---------------- */
function showStart() {
  // patch67：开始界面不该出现「停止自动」浮动按钮
  try { hideAutoFab(); } catch (e) {}
  els.game.hidden = true;
  els.ending.hidden = true;
  els.start.hidden = false;
  renderStartScreen(els.start, {
    saveInfo: app.saveInfo,
    onStart: startGame,
    onContinue: continueGame,
  });
}

/* ===== patch103：隐藏作弊菜单 ===== 
   局内连续点击顶栏标题 5 次打开。**没有任何提示**，分享卡上也不标注。 */
/* ===== patch129：作弊菜单的「自选灵根 / 自选体质」 ===== */
function __cheatListModal(title, items, onPick, onBack) {
  const grid = h("div", {
    style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", maxHeight: "58vh", overflowY: "auto", padding: "2px" },
  });
  items.forEach(function (it) {
    grid.append(h("button", {
      class: "btn", type: "button",
      style: { justifyContent: "flex-start", fontSize: "12.5px", padding: "7px 10px" },
      onclick: function () {
        try { onPick(it); persist(); renderBoard(); } catch (e) {}
        setTimeout(onBack, 40);
      },
    }, it.name));
  });
  openModal({
    title: title,
    body: grid,
    actions: [{ text: "返回", kind: "btn-ghost", onClick: function () { setTimeout(onBack, 40); } }],
  });
}
function __cheatPickRoot(st) {
  const list = SPIRIT_ROOTS.filter(function (r) { return (r.weight || 0) > 0; });
  __cheatListModal("选择灵根（" + list.length + " 种）", list, function (r) {
    st.flags.xianxia = true;
    st.flags.abandonedMortal = true;   // patch130：修仙就该抛弃凡尘
    st.flags.spiritRoot = r.id;
    if (!st.cultivationLevel) st.cultivationLevel = 1;
  }, __cheatOpen);
}
function __cheatPickBody(st) {
  __cheatListModal("选择体质（" + CONSTITUTIONS.length + " 种）", CONSTITUTIONS, function (c) {
    st.flags.xianxia = true;
    st.flags.abandonedMortal = true;
    st.flags.constitution = c.id;
    if (!st.cultivationLevel) st.cultivationLevel = 1;
  }, __cheatOpen);
}
function __cheatOpen() {
  const st = app.state;
  if (!st) return;
  const B = (label, fn) => h('button', {
    class: 'btn', type: 'button',
    style: { width: '100%', justifyContent: 'center', marginBottom: '6px' },
    onclick: () => { try { fn(); persist(); renderBoard(); } catch (e) {} },
  }, label);
  const body = h('div', { style: { display: 'flex', flexDirection: 'column' } },
    B('金钱 +10 亿', () => { st.attrs.money = (st.attrs.money || 0) + 1000000000; }),
    B('全属性 100', () => {
      st.attrs.health = 100; st.attrs.mood = 100; st.attrs.skill = 100;
      st.attrs.relations = 100;
    }),
    B('修为 +20 层', () => {
      st.flags.xianxia = true;
      st.flags.abandonedMortal = true;
      if (!st.cultivationLevel) st.cultivationLevel = 1;
      st.cultivationLevel = (st.cultivationLevel || 0) + 20;
    }),
    B('直接飞升', () => {
      st.flags.xianxia = true;
      st.flags.feisheng = true;
      st.cultivationLevel = 108;
      st.died = true;
      st.deathCause = '白日飞升，得道成仙';
    }),
    B('寿元 +100 万年', () => {
      st.ageBonus = (st.ageBonus || 0);
      st.flags.longevity = (st.flags.longevity || 0) + 1000000;
    }),
    B('自选灵根', () => {
      st.flags.xianxia = true;
      __cheatPickRoot(st);
    }),
    B('自选体质', () => {
      st.flags.xianxia = true;
      __cheatPickBody(st);
    }),
  );
  openModal({
    title: '',
    body,
    actions: [{ text: '关闭', kind: 'btn-ghost' }],
  });
}
function __cheatInstall() {
  try {
    const brand = document.querySelector('.brand');
    if (!brand || brand.__cheatBound) return;
    brand.__cheatBound = true;
    let n = 0, timer = null;
    brand.addEventListener('click', function () {
      n++;
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () { n = 0; }, 2000);
      if (n >= 5) { n = 0; if (timer) clearTimeout(timer); __cheatOpen(); }
    });
  } catch (e) {}
}
function showGame() {
  els.start.hidden = true;
  els.ending.hidden = true;
  els.game.hidden = false;
  renderBoard();
  try { __cheatInstall(); } catch (e) {}
}

function showEnding() {
  // patch67：结算界面不该出现「停止自动」浮动按钮
  try { hideAutoFab(); } catch (e) {}
  els.start.hidden = true;
  els.game.hidden = true;
  els.ending.hidden = false;
  renderEndingScreen(els.ending, app.state.ending, app.state, {
    onRestart: confirmRestart,
    onJournal: showFullJournal,
  });
}

/* ---------------- 流程 ---------------- */
function persist() {
  if (!app.state) return;
  const ok = writeSave(app.state);
  if (!ok) toast('浏览器本地存储不可用，进度无法保存（刷新会丢失）');
}

function startGame({ name, style, traitIds, gender, timeMode, useLegacy }) {
  const seed = randomSeed();
  const legacy = (useLegacy === false) ? null : readLegacy();
  // patch33：没选满 5 个就随机补满——玩家可以直接开始，不会被拦下
  const filledTraits = fillTraitsToFive(traitIds);
  app.state = createNewGame({ name, style, traitIds: filledTraits.ids, seed, gender, timeMode, legacy });
  app.rng = createRng(seed);
  beginYear(app.state, app.rng);
  app.state.rngState = app.rng.state;
  app.saveInfo = null;
  persist();
  // patch33：补入的特质不弹窗，但记进状态——游戏里的特质栏与手账会显示出来
  if (filledTraits.filled.length) app.state.autoFilledTraits = filledTraits.filled.map((t) => ({ id: t.id, name: t.name }));
  if (legacy) {
    const l = app.state.legacyBonus;
    toast('你带着上一世的痕迹回来了' + (l ? '（' + l.summary + '）' : ''));
  }
  showGame();
}

function continueGame() {
  const res = readSave();
  if (!res.ok || !res.state) {
    toast(res.reason || '没有找到存档，已为你开始新的人生');
    app.saveInfo = null;
    startGame({ name: '', style: 'random', traitId: 'optimist', gender: 'random' });
    return;
  }
  app.state = res.state;
  app.rng = createRng(app.state.seed);
  app.rng.state = app.state.rngState;
  showGame();
  if (app.state.phase === 'settle' && app.state.lastReport) {
    openSettlement(app.state.lastReport);
  } else if (app.state.phase === 'end' && app.state.ending) {
    showEnding();
  } else {
    toast(`欢迎回来，${app.state.name}。今年你 ${app.state.age} 岁。`);
  }
}

function chooseOption(i) {
  if (!app.state || app.state.paused) return;
  app.state.pending.choice = i;
  persist();
  renderEvent(els.event, app.state, { onChoice: chooseOption, onPickEvent: (id) => {
    // patch14：玩家选了另一个方向——换掉本回合的主事件（此时尚未结算，安全）。
    // 不碰 autoPatch：本回合若有自动结算事件，它照旧执行（那件事玩家控制不了）。
    app.state.pending.eventId = id;
    app.state.pending.choice = null;
    renderBoard();
  } });
  renderActions(els.action, app.state, { onAction: chooseAction, onSettle: settleYear, onRandom: randomPick, onToggleAuto: toggleAuto });
}

function chooseAction(id) {
  if (!app.state || app.state.paused) return;
  app.state.pending.actionId = app.state.pending.actionId === id ? null : id;
  persist();
  renderActions(els.action, app.state, { onAction: chooseAction, onSettle: settleYear, onRandom: randomPick, onToggleAuto: toggleAuto });
}


/* ---------------- 随机 / 自动 ---------------- */
function randomPick() {
  if (!app.state || app.state.paused) return;
  const st = app.state;
  const ev = EVENTS.find(e => e.id === st.pending.eventId);
  if (ev && ev.choices && ev.choices.length && !Number.isInteger(st.pending.choice)) {
    // 优先修仙：一切选项选第一个（修炼/正面）
    if (st.autoPref === 'cultivate') {
      st.pending.choice = 0;
    } else {
      const pivotal = ['propose', 'have_baby', 'baby_born', 'marry', 'child_teen'];
      if (pivotal.includes(ev.id) && st.auto) {
        st.pending.choice = 0;
      } else {
        st.pending.choice = Math.floor(Math.random() * ev.choices.length);
      }
    }
  }
  if (!st.pending.actionId) {
    // 优先修仙：直接闭关
    if (st.autoPref === 'cultivate' && st.flags && st.flags.xianxia) {
      st.pending.actionId = 'cultivate';
    } else {
      let avail = ACTIONS.filter(a => !(a.id === 'finance' && st.attrs.money < 5000));
      // 没工作时不能选work
      if (!(st.flags && st.flags.employed)) avail = avail.filter(a => a.id !== 'work');
      if (st.autoPref && Math.random() < 0.8) {
        const pref = avail.filter(a => a.id === st.autoPref);
        if (pref.length) avail = pref;
      }
      if (!avail.length) avail = ACTIONS.filter(a => a.id !== 'work' && a.id !== 'finance');
      st.pending.actionId = avail[Math.floor(Math.random() * avail.length)].id;
    }
  }
  persist();
  renderBoard();
  applyRandomCurls();
  setTimeout(() => settleYear(), 60);
}

function toggleAuto() {
  if (!app.state) return;
  if (app.state.auto) {
    app.state.auto = false;
    persist();
    renderBoard();
    hideAutoFab();
    toast('自动模式已停止');
    return;
  }
  // 开启：先问偏好
  const opts = [
    ['', '完全随机'],
    ['work', '优先工作'], ['study', '优先学习'], ['rest', '优先休息'],
    ['social', '优先社交'], ['create', '优先创作'], ['finance', '优先投资'],
    ['cultivate', '优先修仙（唯道是图）'],
  ];
  const body = h('div', { style: { display:'flex',flexWrap:'wrap',gap:'8px',justifyContent:'center' } });
  opts.forEach(([id, label]) => {
    body.append(h('button', {
      class: 'btn btn-sm', type: 'button',
      onclick: () => {
        app.state.autoPref = id || null;
        app.state.auto = true;
        persist();
        document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
        renderBoard();
        showAutoFab();
        toast(id ? `自动模式开启：偏好${label.slice(2)}` : '自动模式开启：完全随机');
        randomPick();
      },
    }, label));
  });
  openModal({ title: '自动模式 · 偏好（可跳过）', body, actions: [{ text: '取消', kind: 'btn-ghost', icon: 'close' }] });
}

/* 浮动停止按钮（不被弹窗挡住） */
function showAutoFab() {
  let fab = document.getElementById('auto-fab');
  if (!fab) {
    fab = h('button', { id: 'auto-fab', class: 'auto-fab', type: 'button', onclick: toggleAuto },
      h('span', { html: icon('pause') }), '停止自动');
    document.body.appendChild(fab);
  }
  fab.style.display = 'flex';
}
function hideAutoFab() {
  const fab = document.getElementById('auto-fab');
  if (fab) fab.style.display = 'none';
}

/* 随机卷边 */
function applyRandomCurls() {
  document.querySelectorAll('.card, .scene-card').forEach(el => {
    el.classList.remove('curl-1','curl-2','curl-3','curl-4');
    if (Math.random() < 0.35) {
      el.classList.add('curl-' + (1 + Math.floor(Math.random() * 4)));
    }
  });
}

function settleYear() {
  if (!app.state || app.state.paused) return;
  const draft = structuredClone(app.state);
  app.rng.state = draft.rngState;
  const report = resolveYear(draft, app.rng);
  draft.rngState = app.rng.state;
  app.state = draft;
  persist();
  renderBoard();
  openSettlement(report);
}

/* patch100：判断这一回合有没有「必须停下来看一眼」的大事。
   高考出分、灵根测试——自动模式也要停下，等玩家手动点确认。 */
function majorMomentOf(report) {
  const sps = (report && report.specials) || [];
  for (const sp of sps) {
    const t = String((sp && sp.title) || '');
    if (/^高考\s*\d+\s*分/.test(t) || /^灵根测试/.test(t)) return sp;
  }
  return null;
}
function openSettlement(report, _skipMajor) {
  // patch100/118：重大事件 —— 先停自动，再弹窗；**关掉弹窗后必须继续结算**
  const _major = !_skipMajor && majorMomentOf(report);
  if (_major) {
    if (app.state.auto) {
      app.state.auto = false;
      try { persist(); } catch (e) {}
      renderBoard();
      try { hideAutoFab(); } catch (e) {}
    }
    // 关掉普通结算弹窗，只留这个重点提示
    document.querySelectorAll('.modal-backdrop').forEach((b) => b.remove());
    setTimeout(() => {
      openModal({
        title: _major.title,
        body: h('p', {
          style: { fontSize: '16px', lineHeight: '2', color: 'var(--ink)', textAlign: 'center', padding: '10px 0 4px' },
          text: String(_major.text || ''),
        }),
        actions: [{ text: '知道了', kind: 'btn-primary', icon: 'check' }],
        // ★ patch118：**关掉这个弹窗后，必须继续走正常结算**，否则游戏卡死
        onClose: () => { openSettlement(report, true); },
      });
    }, 120);
    return;
  }
  renderSettlementModal(report, {
    onNext: () => {
      const draft = structuredClone(app.state);
      app.rng.state = draft.rngState;
      advanceYear(draft, app.rng);
      draft.rngState = app.rng.state;
      app.state = draft;
      persist();
      renderBoard();
      if (app.state.auto) setTimeout(() => randomPick(), 120);
    },
    onFinish: () => {
      app.state.auto = false;
      app.state.ending = buildEnding(app.state);
  // patch32：把这一世记成「上一世」，供下一局继承
  writeLegacy(buildLegacyRecord(app.state, app.state.ending));
      app.state.phase = 'end';
      persist();
      showEnding();
    },
  });
  // auto 模式：更快自动点结算/继续按钮
  if (app.state.auto && !report.ended) {
    setTimeout(() => {
      const btn = document.querySelector('.modal-actions .btn-primary');
      if (btn) btn.click();
    }, 280);
  }
}

/* P0-4：切换「精确数值」显示。
   默认关——只看故事，不看 +4.2 / -1.5 这类数字；打开后恢复原来的精确写法。
   通过 globalThis 上的镜像读写，不依赖 core 段与界面段的作用域关系。 */
function toggleNumbers() {
  const cur = !!(typeof globalThis !== 'undefined' && globalThis.__SHOW_EXACT__);
  const next = !cur;
  if (typeof globalThis !== 'undefined') globalThis.__SHOW_EXACT__ = next;
  try { if (typeof setShowExactNumbers === 'function') setShowExactNumbers(next); } catch (e) { /* 用 globalThis 那份也一样 */ }
  renderBoard();
  toast(next ? '数值显示已打开：结算里会写清加减多少' : '数值显示已隐藏：只讲故事，不看数字');
}

function togglePause() {
  if (!app.state) return;
  app.state.paused = !app.state.paused;
  persist();
  renderBoard();
  toast(app.state.paused ? '已暂停，场景静止，随时可以继续' : '继续，时间又流动了');
}

function confirmRestart() {
  confirmDialog({
    title: '重新开始这一生？',
    message: '当前的人生记录会被清空（无法恢复），确定要从 18 岁重新开始吗？',
    confirmText: '重新开始',
    danger: true,
    onConfirm: () => {
      clearSave();
      app.state = null;
      app.rng = null;
      app.saveInfo = null;
      showStart();
      toast('新的一生开始了');
    },
  });
}

/* ---------------- 弹窗内容 ---------------- */
function showHelp() {
  const body = h('div', { class: 'help-list' },
    h('li', { html: '<b>目标</b>：从 18 岁活到 80 岁，看看这一生会走出什么形状。' }),
    h('li', { html: '<b>每一段</b>：先读天气和一个事件，做一个选择；再选一件主要行动；最后点「结算这一段」。' }),
    h('li', { html: '<b>五项状态</b>：健康、心情、金钱、关系、技能。它们互相牵制，没有一项可以单独刷满。' }),
    h('li', { html: '<b>重复有代价</b>：连续做同一件事，收益会打折；年纪越大，健康衰退越快、学费越贵。' }),
    h('li', { html: '<b>补救机会</b>：健康、金钱或心情太低时，会出现专门的事件帮你补回来。' }),
    h('li', { html: '<b>结局</b>：不看总分，只看你这一生更像哪一种风格。' }),
    h('li', { html: '<b>存档</b>：进度自动保存在浏览器 localStorage，刷新可继续。' })
  );
  openModal({ title: '玩法说明', body, actions: [{ text: '知道了', kind: 'btn-primary', icon: 'check' }] });
}


  /* ===== patch172：成就一览 =====
     设计约束：**不引入任何新 class、不覆盖字体**。
     顶栏按钮用 toolBtn，弹窗用 openModal，列表用 .help-list / li——
     这三样都是「玩法说明」在用的，所以配色、圆角、字体、间距全部天然一致。 */
  function showAchievements() {
    const st = app.state || {};
    // patch177：**读历史累计**，不只是本局
    const thisRound = st.achievements || {};
    let hist = {};
    try { hist = (typeof readAchHistory === 'function') ? readAchHistory() : {}; } catch (e) { hist = {}; }
    let freshThisRound = 0;
    const total = (typeof ACHIEVEMENTS !== 'undefined' && ACHIEVEMENTS.length) || 0;

    // 已解锁的整理成「分类 → 成就」
    const byCat = {};
    let unlocked = 0;
    for (const a of ACHIEVEMENTS) {
      const isThisRound = !!thisRound[a.id];
      const rec = hist[a.id];
      if (!isThisRound && !rec) continue;
      unlocked++;
      if (isThisRound) freshThisRound++;
      let ageShow = null;
      if (rec && rec.firstAge != null) ageShow = fmtAge(rec.firstAge);
      else if (isThisRound) ageShow = '第 ' + thisRound[a.id] + ' 年';
      const times = (rec && rec.times) ? rec.times : (isThisRound ? 1 : 0);
      const cat = a.cat || '其它';
      (byCat[cat] = byCat[cat] || []).push({ a, ageShow, times, isThisRound });
    }

    const body = h('div', {});
    // 顶部进度
    body.append(h('p', {
      class: 'start-note',
      text: `历史累计拿到 ${unlocked} / ${total} 个成就` + (unlocked >= total ? '　全都拿到了。' : '　慢慢来，它们散在不同的活法里。') + (freshThisRound ? `　本局新拿 ${freshThisRound} 个。` : ''),
    }));

    if (!unlocked) {
      body.append(h('p', { class: 'start-note', text: '还没有拿到成就。成就不是任务，是你某一生活成了那个样子时，顺带留下的记号。' }));
    } else {
      const list = h('div', { class: 'help-list' });
      for (const cat of Object.keys(byCat)) {
        list.append(h('h3', { class: 'journal-stage', text: `${cat} · ${byCat[cat].length} 个` }));
        for (const it of byCat[cat]) {
          const ageTxt = it.ageShow ? ('　' + it.ageShow) : '';
          const timesTxt = it.times > 1 ? ('　累计 ' + it.times + ' 次') : '';
          const freshTxt = it.isThisRound ? '　本局' : '';
          list.append(h('li', {
            html: `★ <b>${it.a.name}</b>${ageTxt}${timesTxt}${freshTxt}<br>${it.a.desc || ''}`,
          }));
        }
      }
      body.append(list);
    }

    openModal({
      title: '成就',
      body,
      actions: [{ text: '知道了', kind: 'btn-primary', icon: 'check' }],
    });
  }

function showFullJournal() {
  // patch21：完整手账也用大事记渲染（与卡片共用 journalEntry），并给出数值开关
  const all = (app.state.journal || []).slice().reverse();
  const body = h('div', {});
  if (exactNumbersOn()) {
    body.append(h('p', { class: 'start-note', text: '（数值已展开；关掉顶部「数值·显示」即可只看事情本身）' }));
  }
  for (const g of JOURNAL_STAGE_GROUPS) {
    const items = all.filter((j) => g.test(j.age));
    if (!items.length) continue;
    body.append(h('h3', { class: 'journal-stage', text: `${g.name} · ${items.length} 条` }));
    const list = h('ol', { class: 'journal-list', style: { maxHeight: '50dvh' } });
    for (const j of items) list.append(journalEntry(j, { showNumbers: exactNumbersOn() }));
    body.append(list);
  }
  openModal({
    title: '完整人生手账',
    body: body,
    actions: [{ text: '合上本子', kind: 'btn-primary', icon: 'close' }],
  });
}

/* ================= 样式注入（patch22） =================
   项目里没有 CSS 文件，而引擎用了 130 个 class——这里在运行时把整套样式注入 <style>。
   交付仍然只有 bundle.js 一个文件，替换即生效。 */
const APP_CSS = String.raw`
/* ===== 人生模拟器 · 样式（patch22 注入；patch66 补分享卡预览层） =====
   引擎用了 130 个 class 但项目里没有样式文件，这里补齐一整套。
   基调：纸感、暖色、留白——配合场景照片（城市/公园/山间/海边）。 */
:root{
  --paper:#f7f3ea; --paper-2:#fffdf8; --ink:#2f2a24; --ink-soft:#6b6357; --ink-faint:#9c9285;
  --line:#e6ddcd; --line-soft:#f0e9dd;
  --gold:#b08d57; --green:#6f9b7a; --blue:#6d8fb5; --red:#c2705f; --purple:#8d6fa8;
  --shadow:0 1px 2px rgba(60,48,34,.06), 0 10px 28px rgba(60,48,34,.08);
  --shadow-sm:0 1px 2px rgba(60,48,34,.06);
  --radius:14px; --radius-sm:9px;
  /* patch27：折角（右上角折页）的尺寸；卡片大一点，小元素小一点 */
  --fold:14px; --fold-sm:11px;
}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{
  background:
    radial-gradient(1200px 500px at 50% -12%, #efe7d8 0%, rgba(239,231,216,0) 70%),
    var(--paper);
  color:var(--ink);
  font:15px/1.75 "Songti SC","SimSun",Georgia,"Noto Serif SC",-apple-system,"PingFang SC","Microsoft YaHei",serif;
  -webkit-font-smoothing:antialiased;
}
a{color:var(--blue);text-decoration:none}
b,strong{font-weight:600}
ol,ul{margin:0;padding:0;list-style:none}
h1,h2,h3,h4{margin:0;font-weight:600;line-height:1.4}
p{margin:.5em 0}
button{font:inherit;color:inherit}

/* ---------- 场景背景 ---------- */
.page-bg{position:fixed;inset:0;background-size:cover;background-position:center;
  opacity:.5;filter:saturate(.85) brightness(1.06);z-index:-2}
.scene-card{position:relative;overflow:hidden;border-radius:0;margin-bottom:16px;
  border:1px solid rgba(203,188,163,.95);box-shadow:0 2px 6px rgba(80,66,48,.10), 0 8px 20px rgba(80,66,48,.08);
  min-height:132px;background:#fffdf7}
.scene-card img,.scene-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.scene-tint{position:absolute;inset:0;pointer-events:none}
.scene-foot{position:relative;padding:12px 16px;display:flex;align-items:center;gap:10px;
  background:linear-gradient(180deg,rgba(247,243,234,0) 0%,rgba(247,243,234,.88) 55%,rgba(247,243,234,.97) 100%)}
.scene-name{font-size:14px;letter-spacing:.06em;color:var(--ink-soft)}
.scene-paused{font-size:12.5px;color:var(--red);margin-left:auto}

/* ---------- 顶栏 ---------- */
.brand{display:flex;align-items:baseline;gap:10px;padding:16px 4px 10px}
.kicker,.e-kicker{font-size:12px;letter-spacing:.22em;color:var(--ink-faint);text-transform:uppercase}
.brand .sub{font-size:12.5px;color:var(--ink-faint)}
.tools,.start-actions,.ending-actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.age-pill{display:inline-flex;align-items:baseline;gap:6px;padding:3px 12px;border-radius:999px;
  background:var(--paper-2);border:1px solid var(--line);font-size:13.5px;color:var(--ink-soft)}
.age-pill .year{color:var(--ink-faint);font-size:12px}
.spacer{flex:1}
.moment,.moments{display:flex;flex-direction:column;gap:6px}
.moment{font-size:13px;color:var(--ink-faint)}

/* ---------- 卡片 ---------- */
/* patch27：正常卡片——直角、实边框、有厚度的阴影，右上角折角 */
.card{background-color:#fbf8f1;background-image:linear-gradient(225deg, #efe7d8 0, #efe7d8 50%, #e6d9c2 50%, #e6d9c2 100%);
  background-repeat:no-repeat; background-position:top right; background-size:var(--fold) var(--fold);
  border:1px solid rgba(203,188,163,.95);border-radius:0;
  padding:18px 20px;margin-bottom:16px;
  box-shadow:0 1px 2px rgba(80,66,48,.08), 0 8px 20px rgba(80,66,48,.10)}
/* 气泡化的标题：只用一条虚线把它和正文轻轻分开，不做成卡片标题栏 */
.card-title{display:flex;align-items:center;gap:8px;font-size:15px;color:var(--ink-soft);
  margin-bottom:12px;padding-bottom:8px;letter-spacing:.03em;
  border-bottom:1px solid rgba(214,202,182,.85)}
.card-title .num{margin-left:auto;font-size:12.5px;color:var(--ink-faint);font-weight:400}
.card-title svg{width:17px;height:17px}

/* ---------- 状态栏 ---------- */
.stat-row{display:flex;gap:12px;align-items:flex-start;padding:9px 0;border-bottom:1px dashed var(--line-soft)}
.stat-row:last-child{border-bottom:0}
.stat-ico{flex:none;width:22px;height:22px;margin-top:2px;opacity:.95}
.stat-ico svg{width:22px;height:22px}
.stat-main{flex:1;min-width:0}
.stat-head{display:flex;align-items:baseline;gap:8px}
.stat-name{font-size:13.5px;color:var(--ink-soft);letter-spacing:.04em}
.stat-val{margin-left:auto;font-size:15px;font-variant-numeric:tabular-nums}
.stat-delta{font-size:12.5px;font-variant-numeric:tabular-nums}
.stat-delta.up{color:var(--green)}
.stat-delta.down{color:var(--red)}
.stat-desc{font-size:12.5px;color:var(--ink-faint);margin-top:2px}
.bar{height:5px;border-radius:99px;background:#eae2d4;overflow:hidden;margin:6px 0 2px}
.bar i{display:block;height:100%;border-radius:99px;background:var(--gold);transition:width .5s ease}
.bar-warn{color:var(--red)}

/* ---------- 灵根卡 ---------- */
.root-card{box-shadow:inset 4px 0 0 var(--purple), 0 1px 2px rgba(80,66,48,.08), 0 8px 20px rgba(80,66,48,.10);
  background:linear-gradient(180deg,#faf7ff,#fdfbf7)}
.root-name{font-size:17px;letter-spacing:.05em}
.root-tier{font-size:12.5px;color:var(--purple)}
.root-sub,.root-desc{font-size:13px;color:var(--ink-soft)}
.root-mult,.root-risk,.root-hot,.root-ev{font-size:12.5px;color:var(--ink-faint);margin-top:3px}
.root-bars{margin:8px 0}
.root-body{padding:2px 0}
.root-mult b,.root-risk b{color:var(--ink-soft)}

/* ---------- 事件卡 ---------- */
/* patch27：事件卡恢复顶部强调线（厚重感的一部分） */
.event-card{background-color:#fffdf7;border-top:3px solid var(--gold)}
.event-cat{display:flex;align-items:center;gap:6px;font-size:12px;letter-spacing:.16em;
  color:var(--ink-faint);margin-bottom:6px}
.event-cat svg{width:15px;height:15px}
.event-title{font-size:21px;line-height:1.35;margin:2px 0 8px;letter-spacing:.02em}
.event-text{font-size:14.5px;color:var(--ink-soft);margin-bottom:12px}
.event-auto-hint{font-size:13px;color:var(--ink-faint);font-style:italic}
.event-choices-picker{margin-bottom:10px;padding-bottom:10px;border-bottom:1px dashed var(--line-soft)}
.choices{display:flex;flex-direction:column;gap:9px}
.choice{display:flex;flex-direction:column;gap:3px;align-items:flex-start;width:100%;text-align:left;
  padding:13px 18px;border:1px solid rgba(203,188,163,.95);border-radius:0;
  background-color:#fffefb;background-image:linear-gradient(225deg, #f3ece0 0, #f3ece0 50%, #e6d9c2 50%, #e6d9c2 100%);
  background-repeat:no-repeat; background-position:top right; background-size:var(--fold-sm) var(--fold-sm);
  cursor:pointer;transition:transform .12s ease,border-color .12s ease,background-color .12s ease,box-shadow .12s ease}
.choice:hover:not([disabled]){border-color:rgba(176,141,87,.9);transform:translateY(-1px);
  box-shadow:0 2px 4px rgba(80,66,48,.10), 0 6px 16px rgba(80,66,48,.10)}
.choice[aria-pressed="true"]{border-color:rgba(176,141,87,.75);background:#fdf8ee;
  box-shadow:0 2px 10px rgba(176,141,87,.12)}
.choice[disabled]{opacity:.55;cursor:default}
.c-text{font-size:14.5px}
.c-hint{font-size:12.5px;color:var(--ink-faint)}
.choice-preview{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}

/* ---------- 行动区 ---------- */
.actions-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:9px}
.action{display:flex;flex-direction:column;gap:4px;align-items:flex-start;padding:13px 15px;
  border:1px solid rgba(203,188,163,.95);border-radius:0;
  background-color:#fffefb;background-image:linear-gradient(225deg, #f3ece0 0, #f3ece0 50%, #e6d9c2 50%, #e6d9c2 100%);
  background-repeat:no-repeat; background-position:top right; background-size:var(--fold-sm) var(--fold-sm);
  cursor:pointer;transition:transform .12s ease,border-color .12s ease,box-shadow .12s ease}
.action:hover:not([disabled]){border-color:rgba(176,141,87,.9);transform:translateY(-1px);
  box-shadow:0 2px 4px rgba(80,66,48,.10), 0 6px 16px rgba(80,66,48,.10)}
.action[aria-pressed="true"]{border-color:rgba(176,141,87,.75);background:#fdf8ee;
  box-shadow:0 2px 10px rgba(176,141,87,.12)}
.action[disabled]{opacity:.55;cursor:default}
.a-ico svg{width:20px;height:20px}
.a-name{font-size:14px}
.a-cost,.a-tag{font-size:12px;color:var(--ink-faint)}
.settle-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:14px;
  padding-top:12px;border-top:1px solid var(--line-soft)}
.settle-hint{font-size:12.5px;color:var(--ink-faint);margin-right:auto}
.repeat-warn{font-size:12.5px;color:var(--red);margin-top:8px}

/* ---------- 结算 ---------- */
.settle-weather{display:flex;align-items:center;gap:8px;font-size:13.5px;color:var(--ink-soft);
  padding:9px 12px;border-radius:var(--radius-sm);background:var(--paper);margin-bottom:12px}
.settle-weather svg{width:20px;height:20px}
.delta-list{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}
.delta-item{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:99px;
  font-size:12.5px;background:var(--paper);border:1px solid var(--line)}
.delta-item.up{color:var(--green);border-color:#d6e4d9}
.delta-item.down{color:var(--red);border-color:#eed9d3}
.delta-item svg{width:14px;height:14px}
.chip{display:inline-flex;align-items:center;padding:3px 11px;border-radius:99px;font-size:12px;
  background:#fdfbf6;border:1px solid rgba(214,202,182,.6)}
.chip-up{color:var(--green);border-color:#d6e4d9}
.chip-down{color:var(--red);border-color:#eed9d3}
.feedback-list{display:flex;flex-direction:column;gap:5px;font-size:13.5px;color:var(--ink-soft)}
.feedback-list li{position:relative;padding-left:13px}
.feedback-list li::before{content:"·";position:absolute;left:2px;color:var(--gold)}
.settle-journal,.settle-ach,.settle-auto{margin-top:16px;padding:14px 18px;border-radius:0;
  border:1px solid rgba(203,188,163,.9);background-color:#fbf8f1;
  box-shadow:0 1px 2px rgba(80,66,48,.07)}
.settle-ach{border-color:rgba(232,220,191,.9);background:linear-gradient(180deg,#fffaf0,#fdfaf3)}
.settle-auto{background:#f6f5f1;border-style:dashed}
.settle-ach .card-title{color:var(--gold);margin-bottom:8px}
.settle-auto .card-title{color:var(--ink-faint);margin-bottom:8px}
.ach-line{color:var(--ink)}
.j-title{font-size:14px;color:var(--ink-soft);margin-bottom:4px}
.j-text{font-size:14px;color:var(--ink);margin:0}

/* ---------- 手账（大事记） ---------- */
.journal-empty{font-size:13px;color:var(--ink-faint)}
.journal-stage{font-size:12px;letter-spacing:.18em;color:var(--ink-faint);
  margin:16px 0 8px;padding-bottom:5px;border-bottom:1px solid var(--line-soft)}
.journal-stage:first-child{margin-top:0}
.journal-list{display:flex;flex-direction:column;gap:10px}
.journal-item{display:flex;gap:12px;padding:13px 16px;border-radius:0;
  border:1px solid rgba(215,203,182,.95);background-color:#fffdf8;
  box-shadow:0 1px 2px rgba(80,66,48,.06);position:relative}
.journal-big{border-color:#e8dcbf;background:linear-gradient(180deg,#fffaf0,#fffdf8);box-shadow:var(--shadow-sm)}
.journal-big::before{content:"";position:absolute;left:0;top:10px;bottom:10px;width:3px;
  border-radius:99px;background:var(--gold)}
.j-year{flex:none;width:52px;text-align:right;color:var(--ink-soft)}
.j-year b{display:block;font-size:13.5px}
.j-year-num{font-size:11.5px;color:var(--ink-faint)}
.j-body{flex:1;min-width:0}
.j-what{display:flex;align-items:baseline;gap:7px;font-size:14.5px;margin-bottom:2px}
.j-what-text{font-weight:600}
.j-mark{flex:none;font-size:10.5px;letter-spacing:.1em;padding:1px 6px;border-radius:4px;
  background:var(--gold);color:#fff}
.j-choice{font-size:13px;color:var(--ink-soft);margin:3px 0}
.j-choice-label{color:var(--ink-faint);margin-right:6px;font-size:12px}
.j-choice-label::after{content:"："}
.j-choice-auto .j-choice-label::after{content:"——"}
.j-choice-one .j-choice-label::after{content:"——"}
.j-choice-auto,.j-choice-one{color:var(--ink-faint);font-style:italic}
.j-weather{display:inline-block;font-size:11.5px;color:var(--ink-faint);margin-top:4px}
.j-deltas{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px}

/* ---------- 结局 ---------- */
.ending-hero{padding:22px 18px;border-radius:var(--radius);border:1px solid var(--line);
  background:linear-gradient(180deg,#fffaf0,#fffdf8);box-shadow:var(--shadow);margin-bottom:14px}
.e-style{font-size:22px;letter-spacing:.04em;margin:4px 0 6px}
.ending-body{font-size:14.5px;color:var(--ink-soft)}
.ending-para{margin:.6em 0}
.ending-note{font-size:12.5px;color:var(--ink-faint);margin-top:10px}
.poetic{font-size:14px;color:var(--ink-soft);font-style:italic}
.postmark{font-size:11.5px;letter-spacing:.16em;color:var(--ink-faint)}
.final-stats{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;margin:12px 0}
.final-stat{padding:10px 12px;border-radius:var(--radius-sm);background:var(--paper);border:1px solid var(--line-soft)}
.fs-name{display:block;font-size:12px;color:var(--ink-faint)}
.fs-val{font-size:16px;font-variant-numeric:tabular-nums}
.tag-cloud{display:flex;flex-wrap:wrap;gap:6px}
.style-chip,.stage-chip{display:inline-block;padding:2px 10px;border-radius:99px;font-size:12px;
  background:var(--paper);border:1px solid var(--line);color:var(--ink-soft)}
.style-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}

/* ---------- 模态 ---------- */
.modal-backdrop{position:fixed;inset:0;background:rgba(47,42,36,.44);display:flex;
  align-items:center;justify-content:center;padding:18px;z-index:60;animation:fade .18s ease}
.modal{width:min(560px,100%);max-height:88dvh;overflow:auto;background:#fffdf8;
  border-radius:0;border:1px solid rgba(203,188,163,.95);
  box-shadow:0 4px 10px rgba(47,42,36,.14), 0 24px 60px rgba(47,42,36,.24);
  padding:24px;animation:rise .22s ease}
.modal-title{font-size:17px;margin-bottom:10px;letter-spacing:.03em}
.modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}
.m-title{font-size:17px}
.m-year,.m-text{font-size:13px;color:var(--ink-soft)}
.toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:80;
  padding:10px 16px;border-radius:99px;background:rgba(47,42,36,.92);color:#fff;font-size:13.5px;
  box-shadow:0 10px 30px rgba(0,0,0,.25);animation:rise .22s ease}
.help-list li{font-size:13.5px;color:var(--ink-soft);margin:6px 0;padding-left:13px;position:relative}
.help-list li::before{content:"·";position:absolute;left:2px;color:var(--gold)}
.start-note{font-size:12.5px;color:var(--ink-faint)}

/* ---------- 按钮 ---------- */
.btn{display:inline-flex;align-items:center;gap:6px;padding:9px 15px;border-radius:99px;
  border:1px solid var(--line);background:var(--paper);cursor:pointer;font-size:13.5px;
  transition:transform .12s ease,border-color .12s ease,background .12s ease}
.btn:hover:not([disabled]){border-color:var(--gold);transform:translateY(-1px)}
.btn[disabled]{opacity:.5;cursor:default}
.btn-primary{background:var(--gold);border-color:var(--gold);color:#fff}
.btn-primary:hover:not([disabled]){filter:brightness(1.06)}
.btn-danger{border-color:#e5c3ba;color:var(--red);background:#fdf5f3}
.btn-sm{padding:6px 12px;font-size:12.5px}
.btn svg{width:15px;height:15px}
.btn-label{font-size:12.5px;color:var(--ink-faint)}
.auto-fab{position:fixed;right:18px;bottom:18px;z-index:70;display:inline-flex;align-items:center;
  gap:6px;padding:11px 17px;border-radius:99px;border:0;background:var(--ink);color:#fff;cursor:pointer;
  box-shadow:0 10px 30px rgba(0,0,0,.28)}
.auto-fab svg{width:16px;height:16px}

/* ---------- 开始页 ---------- */
.start-hero{padding:22px 4px 10px}
.start-body{padding:0 2px}
.field{margin:12px 0}
.field > label,.field .label{display:block;font-size:12.5px;color:var(--ink-faint);margin-bottom:6px}
.field input,.field select,.field textarea{width:100%;padding:10px 12px;border-radius:var(--radius-sm);
  border:1px solid var(--line);background:var(--paper-2);font:inherit;color:inherit}
.trait-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:9px;margin-top:8px}
.trait{padding:11px 12px;border:1px solid rgba(203,188,163,.95);border-radius:0;background:var(--paper);
  box-shadow:0 1px 2px rgba(80,66,48,.07);
  cursor:pointer;transition:transform .12s ease,border-color .12s ease,box-shadow .12s ease}
.trait:hover{border-color:var(--gold);transform:translateY(-1px)}
.trait[aria-pressed="true"]{border-color:var(--gold);background:#fdf8ee}
.t-name{display:block;font-size:14px}
.t-desc{display:block;font-size:12px;color:var(--ink-faint);margin-top:3px}
.stage-blurb{font-size:13.5px;color:var(--ink-soft)}
.stage-name{font-size:14px;color:var(--ink-faint)}
.num{font-variant-numeric:tabular-nums}
.meta{font-size:12.5px;color:var(--ink-faint)}
.sub{font-size:12.5px;color:var(--ink-faint)}
.weather-name{font-size:14px}
.weather-desc{font-size:12.5px;color:var(--ink-faint)}
.age{font-size:13px;color:var(--ink-faint)}
.year{font-size:12.5px;color:var(--ink-faint)}
.pm-year{font-size:12px;color:var(--ink-faint)}

/* ---------- 动画 ---------- */
@keyframes fade{from{opacity:0}to{opacity:1}}
@keyframes rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.anim-sun,.anim-cloud,.anim-rain,.anim-umbrella{animation:none}

@media (max-width:520px){
  :root{--fold:11px;--fold-sm:9px}
  .event-title{font-size:19px}
  .card{padding:14px}
  .journal-item{gap:9px;padding:10px}
  .j-year{width:44px}
  /* patch66：分享卡预览层——图片真实渲染在页面上，长按 / 右键即可保存 */
  .sharecard-wrap{max-width:min(560px,86vw);margin:0 auto}
  .sharecard-hold{background:#fff;border:1px solid #e2d8c8;border-radius:10px;
    padding:10px;display:flex;flex-direction:column;align-items:center;gap:8px}
  .sharecard-img{display:block;max-width:100%;height:auto;border-radius:6px;
    -webkit-user-select:auto;user-select:auto;-webkit-touch-callout:default;cursor:zoom-in}
  .sharecard-hint{margin:0;font-size:13px;color:#8a7f6d;text-align:center;line-height:1.5}
  .sharecard-sub{margin:10px 0 0;font-size:12px;color:#a89a86;text-align:center;line-height:1.5}
  .actions-grid{grid-template-columns:repeat(auto-fill,minmax(104px,1fr))}
  .tools{width:100%}
}
/* ============================================================
   patch82：UI 重制（按参考图）
   · 大背景 = 图一（花影 / 玻璃 / 蝴蝶，清透日系）
   · 文本框 = 图二（纸纹 + 右下压花 + 胶带）
   · 按钮 = 复古双线边框
   只改样式，不动任何内容与文案。
   ============================================================ */

/* ① 全局大背景 —— 图一（叠一层米白，保证文字可读） */
html, body { background-color: #f1ebdf !important; }
body {
  background-image:
    linear-gradient(180deg, rgba(250,247,240,.40) 0%, rgba(250,247,240,.55) 60%, rgba(246,241,231,.62) 100%),
    url("__BG_MAIN__") !important;
  background-size: cover, cover !important;
  background-position: center center, center center !important;
  background-repeat: no-repeat, no-repeat !important;
  background-attachment: fixed, fixed !important;
}

/* ② 文本框 —— 图二（纸纹 + 右下压花，上覆米白让字清楚） */
.card, .event-card, .root-card, .scene-card, .modal,
.journal-entry, .journal-item, .settle-card, .entry, .sheet {
  background-color: #fbf8f1 !important;
  background-image:
    linear-gradient(rgba(252,249,242,.86), rgba(252,249,242,.90)),
    url("__BG_CARD__") !important;
  background-size: cover, cover !important;
  background-position: center, bottom right !important;
  background-repeat: no-repeat, no-repeat !important;
  border: 1px solid rgba(178,160,126,.70) !important;
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,.55),
    0 2px 8px rgba(92,74,52,.09),
    0 12px 30px rgba(92,74,52,.07) !important;
}

/* ③ 按钮 —— 复古双线边框 + 小圆角 */
.btn {
  border-radius: 3px !important;
  border: 1px solid #b9a685 !important;
  background-color: #fdfaf3 !important;
  background-image: linear-gradient(180deg, rgba(255,253,247,.95), rgba(246,240,228,.95)) !important;
  color: #453a2a !important;
  letter-spacing: .04em;
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,.85),
    inset 0 0 0 3px rgba(214,199,172,.50),
    0 1px 3px rgba(92,74,52,.12) !important;
  transition: transform .1s ease, box-shadow .14s ease, border-color .14s ease;
}
.btn:hover {
  border-color: #9a8660 !important;
  background-image: linear-gradient(180deg, rgba(255,253,248,.98), rgba(243,235,219,.98)) !important;
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,.95),
    inset 0 0 0 3px rgba(196,178,146,.72),
    0 2px 7px rgba(92,74,52,.18) !important;
}
.btn:active { transform: translateY(1px); }
.btn-primary {
  border-color: #a08b63 !important;
  background-image: linear-gradient(180deg, #f1e7d0, #e5d6b8) !important;
  color: #40351f !important;
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,.75),
    inset 0 0 0 3px rgba(186,164,124,.70),
    0 2px 7px rgba(92,74,52,.20) !important;
}
.btn-primary:hover {
  background-image: linear-gradient(180deg, #efe3c8, #dfcfac) !important;
  border-color: #8f7a54 !important;
}
.btn-ghost {
  border-color: rgba(178,160,126,.55) !important;
  background-image: none !important;
  background-color: rgba(253,250,243,.70) !important;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.7) !important;
}

/* ④ 选项 / 行动卡 —— 同样用复古框 */
.choice, .action {
  border: 1px solid rgba(178,160,126,.65) !important;
  background-color: rgba(253,250,243,.88) !important;
  background-image: linear-gradient(180deg, rgba(255,253,247,.85), rgba(247,241,229,.85)) !important;
  border-radius: 3px !important;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.6), 0 1px 2px rgba(92,74,52,.08) !important;
}
.choice:hover, .action:hover {
  border-color: #9a8660 !important;
  background-color: #fbf6e9 !important;
}
.choice.chosen, .action.chosen, .choice.selected, .action.selected {
  border-color: #a08b63 !important;
  box-shadow: inset 0 0 0 2px rgba(196,178,146,.75), 0 1px 4px rgba(92,74,52,.14) !important;
}

/* ⑤ 小标签 / 特质片 —— 复古描边 */
.chip, .style-chip, .trait-chip, .gender-chip, .c-hint {
  border-radius: 2px !important;
}
.style-chip, .trait-chip, .gender-chip {
  border: 1px solid rgba(178,160,126,.60) !important;
  background-color: rgba(253,250,243,.80) !important;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.6) !important;
}
.style-chip.active, .trait-chip.active, .gender-chip.active,
.style-chip[aria-pressed="true"], .trait-chip[aria-pressed="true"], .gender-chip[aria-pressed="true"] {
  border-color: #9a8660 !important;
  background-color: #f3e9d4 !important;
}

/* ⑥ 输入框 —— 内阴影 + 细框 */
input[type="text"], input:not([type]), textarea {
  border-radius: 2px !important;
  border: 1px solid rgba(178,160,126,.70) !important;
  background-color: rgba(255,253,247,.9) !important;
  box-shadow: inset 0 1px 3px rgba(92,74,52,.10) !important;
}

/* ⑦ 细节：标题下缘、弹窗遮罩 */
.card-title { border-bottom: 1px solid rgba(178,160,126,.35); padding-bottom: 8px; }
.modal-backdrop { background: rgba(47,42,36,.38) !important; }
`;
function injectAppStyle() {
  if (typeof document === "undefined") return;
  try {
    if (document.getElementById("app-style")) return;
    const st = document.createElement("style");
    st.id = "app-style";
    // patch82：把 CSS 里的占位符替换成内嵌图片的 data URI
    st.textContent = APP_CSS.split('__BG_MAIN__').join(BG_MAIN_URI).split('__BG_CARD__').join(BG_CARD_URI);
    (document.head || document.documentElement).appendChild(st);
  } catch (e) { /* 注入失败不该影响游戏 */ }
}


/* ================= 分享卡（patch23） =================
   生成一张竖版长图：结局 + 数据 + 人生大事 + 二维码（扫码回到游戏网页）+ 作者署名。
   实现走 SVG（矢量、不糊、零依赖）；点按钮后在新窗口打开，长按或右键即可保存。 */
/** patch29：把分享卡直接存成 PNG。
 *  做法：把 SVG 转成 data URL → 画到 Canvas → toBlob 下载。
 *  全程在浏览器里完成，不启动任何外部进程。 */
/* patch66：改成「可保存模式」。
   原来只做自动下载（a.download + a.click），**手机上完全无效**——
   豆包 webview / 微信都不支持 a.download。现在：生成 PNG → 弹出预览层，
   图片真实渲染在页面上，长按或右键即可保存；桌面端另有「保存图片」按钮。 */
/* patch83：三级保存策略——移动端优先 Web Share API（系统面板能「存储图像」到相册），
   桌面端走下载，都不行再提示长按。原来的 a.download 在手机 webview 里基本无效。 */
function __shareCardTrySave(st, blobOrUrl) {
  var isTouch = ('ontouchstart' in window) || ((navigator.maxTouchPoints || 0) > 0);
  // ① Web Share API（移动端最佳：分享面板里有「存储图像」/「保存到相册」）
  try {
    if (blobOrUrl && typeof blobOrUrl !== 'string' && navigator.share && navigator.canShare) {
      var file = new File([blobOrUrl], '人生模拟器-' + ((st && st.name) || '旅人') + '.png', { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file] }).then(function () {
          toast('已弹出保存/分享面板');
        }).catch(function () {
          toast('请长按上面的图片 → 选「保存图片」', 4500);
        });
        return;
      }
    }
  } catch (e) { /* 不支持就往下走 */ }
  // ② 桌面端：a.download
  if (!isTouch) { __shareCardSaveBlob(st, blobOrUrl); return; }
  // ③ 移动端兜底：明确引导长按
  toast('请长按上面的图片 → 选「保存图片」', 4500);
}
function __shareCardSaveBlob(st, blobOrUrl) {
  try {
    var url = (typeof blobOrUrl === 'string') ? blobOrUrl : URL.createObjectURL(blobOrUrl);
    var a = document.createElement('a');
    a.download = '人生模拟器-' + (st.name || '旅人') + '.png';
    a.href = url;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      if (typeof blobOrUrl !== 'string') { try { URL.revokeObjectURL(url); } catch (e) {} }
      if (a.parentNode) a.parentNode.removeChild(a);
    }, 2000);
    toast('已开始保存到你的下载目录');
  } catch (e) { toast('保存失败，请长按图片保存'); }
}
function downloadShareCard() {
  try {
    var st = app.state;
    var ending = st && st.lastEnding;
    if (!ending) { toast('还没有结束这一生，暂时没有可以分享的卡片'); return; }
    var svg = shareCardSvg(st, ending, {});
    // 用 data URL（而不是 blob URL）：避免 Canvas 被判定为跨源污染
    var svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    var img = new Image();
    img.onload = function () {
      try {
        var m = svg.match(/width="(\d+)" height="(\d+)"/);
        var cssW = m ? parseInt(m[1], 10) : 680;
        var cssH = m ? parseInt(m[2], 10) : 1000;
        var w = cssW * 2, ch = cssH * 2;              // 2 倍分辨率，放大不糊
        var cv = document.createElement('canvas');
        cv.width = w; cv.height = ch;
        var g = cv.getContext('2d');
        if (!g) { toast('这个浏览器不支持导出图片'); return; }
        g.fillStyle = '#f7f3ea'; g.fillRect(0, 0, w, ch);
        g.drawImage(img, 0, 0, w, ch);
        var finish = function (url, blobOrUrl) {
          // 预览层里图片按屏幕宽高比缩放，长图也放得下
          var vw = (window.innerWidth || 360) - 48;
          var vh = (window.innerHeight || 640) - 190;
          var k = Math.min(vw / cssW, vh / cssH, 1);
          var dw = Math.max(120, Math.round(cssW * k));
          var dh = Math.max(160, Math.round(cssH * k));
          var touch = ('ontouchstart' in window) || ((navigator.maxTouchPoints || 0) > 0);
          // patch83：文案写成分步骤，避免玩家误以为要截屏
          // patch99：玩家要求删掉这段操作提示
          var hint = '';
          // patch83：用 CSS 控制显示尺寸，**不写 width/height 属性**——
          // 否则某些浏览器长按保存时会存「显示尺寸」的缩略图，而不是原图（1360×2396）。
          var imgEl = h('img', { class: 'sharecard-img', src: url, alt: '分享卡', draggable: 'false' });
          imgEl.style.width = dw + 'px';
          imgEl.style.maxWidth = '100%';
          imgEl.style.height = 'auto';
          var holder = h('div', { class: 'sharecard-hold' },
            imgEl,
            hint ? h('p', { class: 'sharecard-hint', text: hint }) : null
          );
          var body = h('div', { class: 'sharecard-wrap' }, holder,
            // patch99：玩家要求删掉这段说明文字
          );
          openModal({
            title: '保存分享卡',
            body: body,
            actions: [
              { text: '保存图片', kind: 'btn-primary',
                onClick: function () { __shareCardTrySave(st, blobOrUrl); } },
              { text: '关闭', onClick: function () {} },
            ],
            onClose: function () { try { holder.querySelector('img').src = ''; } catch (e) {} }
          });
        };
        var toUrl = function (blobOrUrl) {
          if (typeof blobOrUrl === 'string') finish(blobOrUrl, blobOrUrl);   // dataURL
          else {
            try { finish(URL.createObjectURL(blobOrUrl), blobOrUrl); }
            catch (e) { finish(cv.toDataURL('image/png'), cv.toDataURL('image/png')); }
          }
        };
        if (cv.toBlob) cv.toBlob(function (b) { toUrl(b || cv.toDataURL('image/png')); }, 'image/png');
        else toUrl(cv.toDataURL('image/png'));
      } catch (e) { toast('导出失败：' + (e && e.message ? e.message : e)); }
    };
    img.onerror = function () { toast('图片生成失败，请稍后重试'); };
    img.src = svgUrl;
  } catch (e) { toast('生成失败：' + (e && e.message ? e.message : e)); }
}

/* patch43：原来的 showShareCard（在新窗口打开预览）已按玩家要求删除。
   保留下面的 downloadShareCard —— 它现在就是「生成分享卡」。 */
function __removed_showShareCard() {
  try {
    var st = app.state;
    var ending = st && st.lastEnding;
    if (!ending) { toast("还没有结束这一生，暂时没有可以分享的卡片"); return; }
    var svg = shareCardSvg(st, ending, {});
    var html = '<!doctype html><meta charset="utf-8"><title>人生天气预报 · 分享卡</title>' +
      '<body style="margin:0;background:#f7f3ea;display:flex;justify-content:center;padding:20px 0">' +
      svg + '</body>';
    var blob = new Blob([html], { type: "text/html" });
    var url = URL.createObjectURL(blob);
    var w = window.open(url, "_blank");
    if (!w) { toast("浏览器拦住了新窗口，请允许弹出窗口后重试"); return; }
    toast("分享卡已生成——长按或右键即可保存图片");
  } catch (e) { toast("生成分享卡失败：" + (e && e.message ? e.message : e)); }
}
/* ---------------- 启动 ---------------- */
function boot() {
  injectAppStyle();
  const res = readSave();
  if (!res.ok) {
    toast(`存档无法恢复（${res.reason}），已为你开启新的人生`);
    clearSave();
  } else if (res.state) {
    app.saveInfo = { name: res.state.name, age: res.state.age };
  }
  showStart();

  window.addEventListener('error', (e) => {
    console.error('运行错误：', e.error || e.message);
    toast('出了点小问题，请试试刷新页面；如反复出现请重新开始');
  });
  window.addEventListener('unhandledrejection', (e) => {
    console.error('未处理的 Promise 拒绝：', e.reason);
  });
}

boot();
