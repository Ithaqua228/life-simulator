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
        text: '改用木系藥材温养经脉', hint: '慢一步，但走得远',
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
