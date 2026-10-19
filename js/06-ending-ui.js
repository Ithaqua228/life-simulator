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
      `${st.min}–${actualMax} 岁，${st.name}：这 ${spanYears} 年里，${
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
  city: 'assets/bg/city.jpg',
  park: 'assets/bg/park.jpg',
  mountain: 'assets/bg/mountain.jpg',
  seaside: 'assets/bg/seaside.jpg',
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
            h('span', { class: 'stat-val', text: a.key === 'money' ? `¥${moneyText(v)}` : String(Math.round(v)) })
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
    h('div', { class: 'page-bg', style: { backgroundImage: "url('assets/journal/journal-01.jpg')" } }),
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
    h('div', { class: 'page-bg', style: { backgroundImage: "url('assets/journal/journal-03.jpg')" } }),
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
              h('div', { class: 'fs-val', text: a.name === '金钱' ? `¥${moneyText(a.value)}` : String(a.value) })
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
