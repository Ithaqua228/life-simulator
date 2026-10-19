# 人生模拟器

一个单页的人生模拟游戏：一年一年地过，看这一生会变成什么样子。

- 普通人生线：学业、工作、恋爱、婚姻、家庭、健康、财富
- 修仙线：测灵根 → 入道（也可以放弃）→ 练气到渡劫 → 飞升
- 三种时间节奏：五年一段 / 三年一段 / 一年一年
- 结局卡与分享卡（可导出图片）

**纯前端，无后端、无依赖、无构建步骤。**

**线上地址**：https://Ithaqua228.online

---

## 目录结构

```
.
├── index.html              # 入口
├── CNAME                   # 自定义域名（GitHub Pages 用）
├── README.md
└── js/
    ├── 01-data-events.js   # 数据与事件库
    ├── 02-ui-icons.js      # 界面图标与引擎（上）
    ├── 03-engine-1.js      # 引擎（一）
    ├── 04-engine-2.js      # 引擎（二）
    ├── 05-engine-3.js      # 引擎（三）
    ├── 06-ending-ui.js     # 结局与界面
    └── bundle.js           # 单文件版（与上面 6 个等价，备用）
```

**注意**：`js/01` ~ `js/06` 这六个文件**按顺序加载、共享同一作用域**，顺序不能变。
想用单文件版，把 `index.html` 里的六行 `<script>` 换成：

```html
<script src="js/bundle.js"></script>
```

---

## 本地运行

直接双击 `index.html` 即可。

如果浏览器对 `file://` 有限制：

```bash
python -m http.server 8000
# 打开 http://localhost:8000
```

---

## 部署到 GitHub Pages（不需要 git）

这个仓库**不需要用 git 命令行**，网页上拖拽上传就行。

### 一、建仓库并上传

1. GitHub → **New repository**
   - 仓库名随意（比如 `lifesim`）
   - 可见性选 **Public**（Pages 免费版需要公开）
   - **不要**勾 "Add a README file"
2. 进入空仓库 → 点 **uploading an existing file**
3. 把这个文件夹里的**所有文件和 `js` 文件夹**一起拖进去
4. 底部点 **Commit changes**

### 二、开启 Pages

仓库 → **Settings** → **Pages**：

- **Source**：`Deploy from a branch`
- **Branch**：`main`，目录选 **`/ (root)`**
- **Save**

等 1-2 分钟，会得到 `https://<用户名>.github.io/<仓库名>/`。

### 三、绑定域名 `Ithaqua228.online`

**1. CNAME 文件（已在仓库根目录）**

内容就是一行：

```
Ithaqua228.online
```

**2. 去域名服务商配 DNS**

`Ithaqua228.online` 是**根域名**（apex），所以要配 **A 记录**（不是 CNAME）：

| 类型 | 主机记录 | 记录值 | TTL |
|---|---|---|---|
| `A` | `@` | `185.199.108.153` | 自动/3600 |
| `A` | `@` | `185.199.109.153` | 自动/3600 |
| `A` | `@` | `185.199.110.153` | 自动/3600 |
| `A` | `@` | `185.199.111.153` | 自动/3600 |

**建议再加一条 `www`**（万一根域名解析出问题可以兜底）：

| 类型 | 主机记录 | 记录值 |
|---|---|---|
| `CNAME` | `www` | `<你的用户名>.github.io` |

**3. 回到 Pages 设置页**

- **Custom domain** 填 `Ithaqua228.online`
- 等 DNS 检查通过（可能几分钟到几小时）
- 勾上 **Enforce HTTPS**（证书签发可能要等一会儿）

**4. 验证**

浏览器打开 `https://Ithaqua228.online`，能玩就成了。

---

## 以后再更新内容

**不需要 git**：仓库页面 → 点某个文件 → 铅笔图标编辑，或者重新拖拽上传覆盖。

> 如果以后想用 git（更新更方便，只推改动的文件），装个 [Git for Windows](https://git-scm.com/download/win) 就行。

---

## 存档

进度保存在浏览器 `localStorage`，刷新会继续这一生。

清档：控制台执行 `localStorage.clear()` 后刷新。

---

## 说明

- 所有数值（属性、金钱、境界、结局）都由 `js/` 里的数据和引擎决定，没有外部接口。
- 分享卡是前端用 SVG 现场绘制再导出的，不上传任何数据。
- 分享卡上的二维码指向 `https://Ithaqua228.online`。
