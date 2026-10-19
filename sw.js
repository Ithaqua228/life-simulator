/* ===== 人生模拟器 · Service Worker（patch182）=====
 *
 * 目的：首次打开后把所有资源存进浏览器缓存，之后**再打开不再下载**，秒开。
 *
 * 为什么必须用 Service Worker：
 *   GitHub Pages 给静态资源的 Cache-Control 只有 max-age=600（10 分钟），
 *   而且我们没法改服务器头。Service Worker 是唯一能在客户端强制长期缓存的办法。
 *
 * 策略：
 *   · install  → 预缓存全部资源（分片 JS、CSS、字体、图片、首页）
 *   · fetch    → 缓存优先（cache first）；缓存没有再走网络，并回填缓存
 *   · activate → 清掉旧版本缓存
 *
 * 更新方法：改下面的 CACHE 版本号（比如 v179 → v180），
 *          新 SW 安装时会重新拉一遍，旧缓存自动清掉。
 */

var CACHE = 'life-sim-v188';

var ASSETS = [
  './',
  './index.html',
  './styles/base.css',
  './styles/app-style.css',
  './styles/game.css',
  './01-数据与事件库.js',
  './02-界面图标与引擎上.js',
  './03-引擎上.js',
  './04-引擎上-2.js',
  './05-引擎.js',
  './06-结局与界面.js',
  './07-入口.js',
  './assets/fonts/wawa-subset.woff2',
  './assets/bg/city.jpg',
  './assets/bg/park.jpg',
  './assets/bg/mountain.jpg',
  './assets/bg/seaside.jpg',
  './assets/journal/journal-01.jpg',
  './assets/journal/journal-03.jpg'
];

// ── 安装：把全部资源拉进缓存 ──
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      // 逐个 add，某个失败不影响其它（比如某张图 404 不应该让整个 SW 装不上）
      return Promise.all(ASSETS.map(function (url) {
        return cache.add(new Request(url, { cache: 'reload' })).catch(function () { return null; });
      }));
    }).then(function () {
      return self.skipWaiting();   // 立刻接管，不等旧页面关掉
    })
  );
});

// ── 激活：清理旧版本缓存 ──
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE && k.indexOf('life-sim-') === 0) return caches.delete(k);
        return null;
      }));
    }).then(function () {
      return self.clients.claim();   // 立刻接管所有页面
    })
  );
});

// ── 请求：缓存优先 ──
self.addEventListener('fetch', function (event) {
  var req = event.request;
  // 只处理 GET
  if (req.method !== 'GET') return;
  // 只处理同源
  var url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      // 缓存没有 → 走网络，顺手回填
      return fetch(req).then(function (res) {
        if (!res || !res.ok) return res;
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); }).catch(function () {});
        return res;
      }).catch(function () {
        // 断网且没缓存 → 如果是导航请求，回首页
        if (req.mode === 'navigate') return caches.match('./index.html');
        return new Response('', { status: 504, statusText: 'offline' });
      });
    })
  );
});
