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
  // patch181：**结算页就开始预解码分享卡背景** —— 玩家在这里通常要停留几秒，
    // 正好拿来把三张 base64 背景解码进内存，之后点「生成分享卡」就秒出图。
  try { if (typeof preloadCardBg === 'function') preloadCardBg(); } catch (e) {}
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
/* ===== patch178：分享卡背景预解码 =====
   问题：SVG 里内嵌的 base64 背景图，在 img.onload 触发时可能还没解码完，
   于是第一次 drawImage 画出来是空白；退出去再点一次（base64 已缓存）才正常。
   解决：先把所有 CARD_BG 的 base64 用 Image 真正解码一遍，再执行原来的生成流程。 */
var __cardBgReady = null;
function preloadCardBg() {
  if (__cardBgReady) return __cardBgReady;
  __cardBgReady = new Promise(function (resolve) {
    var urls = [];
    try { for (var k in CARD_BG) { if (CARD_BG[k]) urls.push(CARD_BG[k]); } } catch (e) {}
    if (!urls.length) { resolve(true); return; }
    var left = urls.length, settled = false;
    var done = function () { if (!settled) { settled = true; resolve(true); } };
    var tick = function () { left--; if (left <= 0) done(); };
    setTimeout(done, 4000);                    // 兜底：最多等 4 秒
    urls.forEach(function (u) {
      var im = new Image();
      im.onload = function () {
        if (im.decode) { try { im.decode().then(tick).catch(tick); } catch (e) { tick(); } }
        else tick();
      };
      im.onerror = tick;
      try { im.src = u; } catch (e) { tick(); }
    });
  });
  return __cardBgReady;
}

function downloadShareCard() {
  try {
    var st = app.state;
    var ending = st && st.lastEnding;
    if (!ending) { toast('还没有结束这一生，暂时没有可以分享的卡片'); return; }
    // patch178：预解码 → 留 30ms 给渲染管线 → 再走原来的生成逻辑
    toast('正在生成分享卡…');
    preloadCardBg().then(function () {
      setTimeout(function () { try { __downloadShareCardRaw(); } catch (e) {} }, 30);
    });
  } catch (e) { toast('生成失败：' + (e && e.message ? e.message : e)); }
}

function __downloadShareCardRaw() {
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
