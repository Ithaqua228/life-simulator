function _hexLum(c) {
  var s = String(c || '').replace('#', '');
  if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
  if (s.length < 6) return 0.5;
  var r = parseInt(s.slice(0, 2), 16) / 255, g = parseInt(s.slice(2, 4), 16) / 255, b = parseInt(s.slice(4, 6), 16) / 255;
  if (isNaN(r) || isNaN(g) || isNaN(b)) return 0.5;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

var lastCardBgKey = 'normal';   // patch183：最近一次分享卡用的背景键（供 canvas 合成时取背景图）
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
  // patch183：**背景改由调用方用 Canvas 直接画**（见 __downloadShareCardRaw）。
  // 原因：微信/部分 Android WebView 把 SVG 画到 Canvas 时会丢弃内嵌的 <image>，
  // 导致分享卡只剩文字和二维码、背景空白。这里只在明确要求时才画背景。
  if (!o.noBg) {
    p.push('<image x="0" y="0" width="' + W + '" height="' + H + '" preserveAspectRatio="xMidYMid slice" href="' + bgUrl + '" xlink:href="' + bgUrl + '"/>');
  }

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

