<p align="center">
  <img src="https://img.shields.io/badge/Python-3.12+-blue.svg?logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/FastAPI-0.141+-009688.svg?logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/Web_UI-127.0.0.1:8080-orange.svg?logo=google-chrome&logoColor=white" alt="Web UI">
  <img src="https://img.shields.io/badge/Platform-Douyin%20%7C%20TikTok-red.svg?logo=tiktok&logoColor=white" alt="Platform">
  <img src="https://img.shields.io/badge/License-GPL--3.0-green.svg" alt="License">
</p>

<h1 align="center">抖音 / TikTok 数据采集台</h1>

<p align="center">
  面向开发者的多维度数据采集工具<br>
  支持 <b>Web UI</b> · <b>Web API</b> · <b>终端交互</b> 三种使用方式
</p>

---

## 📌 项目简介

**抖音 / TikTok 数据采集台** 是一款基于 Python 异步生态构建的综合数据采集工具，专注于解决以下场景：

- 📥 **批量下载**：抖音 / TikTok 视频、图集、实况、封面、音乐一键保存
- 📊 **数据建模**：账号画像、合集归档、评论情感、热门榜单的结构化采集
- 🔌 **自动化集成**：标准 RESTful API，可对接爬虫平台 / BI 看板 / 数据仓库
- 🖥️ **零门槛使用**：浏览器即开即用，无需记忆命令行参数

采集完成后可选择 **CSV / Excel / SQLite / MySQL / JSON / TXT** 多种持久化格式，方便后续直接对接数据分析流程。

---

## 🏷️ 徽章说明

| 徽章 | 含义 |
|------|------|
| `Python-3.12+` | 项目要求 Python ≥ 3.12（使用了 PEP 695 类型参数语法） |
| `FastAPI-0.141+` | Web API 服务基于 FastAPI + Uvicorn |
| `Web_UI-127.0.0.1:8080` | 浏览器可视化界面默认入口 |
| `Platform-Douyin+TikTok` | 同时支持国内抖音与国际版 TikTok |

---

## 🔧 核心特性

| 类别 | 能力 |
|------|------|
| **采集维度** | 单个作品 · 账号作品 · 合集 · 评论 · 直播 · 热榜 · 搜索 · 话题 · 收藏 |
| **文件下载** | 视频 / 图集 / 实况 / 封面 / 音乐 可单独控制，多线程并发 |
| **平台支持** | 国内抖音（douyin.com）+ 国际 TikTok（tiktok.com） |
| **数据导出** | CSV / Excel / SQLite / MySQL / JSON / TXT 六种格式 |
| **使用方式** | Web UI 可视化 · Web API 接口 · 终端交互菜单 · Docker 部署 |
| **签名算法** | 自研 aBogus / xBogus / msToken / ttwid 实现 |
| **反爬措施** | 随机 UA · 请求间隔 · Cookie 轮换 · 自动重试 |

---

## 📁 目录结构

```
TikTokDownloader/
├── main.py                       # 项目主入口（终端模式 / API 模式选择）
├── web_server.py                 # Web UI 独立服务器（端口 8080）
├── start_webui.bat               # Windows 一键启动脚本
├── setup.py                      # 打包配置文件
├── pyproject.toml                # 项目元信息 + 依赖声明
├── requirements.txt              # 依赖锁定列表
├── uv.lock                       # uv 包管理器锁定文件
├── locale/                       # 国际化文案
│   ├── en_US/
│   │   ├── LC_MESSAGES/
│   │   │   ├── tk.mo
│   │   │   └── tk.po
│   │   └── *.py
│   ├── zh_CN/
│   │   ├── LC_MESSAGES/
│   │   │   ├── tk.mo
│   │   │   └── tk.po
│   │   └── *.py
│   └── tk.pot                    # gettext 翻译模板
├── static/                       # Web UI 前端资源
│   ├── index.html                 # 单页应用入口
│   ├── style.css                 # 样式表
│   ├── app.js                    # 主交互脚本
│   ├── js/                       # 浏览器端加密算法（aBogus / xBogus）
│   └── images/                   # 静态图片资源
└── src/                          # 后端核心源码
    ├── application/              # 应用入口层
    │   ├── TikTokDownloader.py   # 主类，串联各模块
    │   ├── main_terminal.py      # 终端交互模式
    │   ├── main_server.py        # Web API 服务
    │   └── main_monitor.py       # 后台监听任务
    ├── interface/                # 各平台数据接口（21 个模块）
    │   ├── detail.py / detail_tiktok.py      # 单个作品
    │   ├── account.py / account_tiktok.py    # 账号作品
    │   ├── mix.py / mix_tiktok.py            # 合集作品
    │   ├── comment.py / comment_tiktok.py    # 作品评论
    │   ├── user.py / info.py                 # 账号资料
    │   ├── live.py / live_tiktok.py          # 直播数据
    │   ├── search.py                         # 综合搜索
    │   ├── hot.py                            # 抖音热榜
    │   ├── collection.py / collects.py       # 收藏 / 收藏夹
    │   ├── hashtag.py                        # 话题作品
    │   └── slides.py                         # 图集
    ├── encrypt/                  # 签名加密算法（X-Bogus / aBogus / msToken）
    ├── downloader/               # 文件下载器（断点续传 / 分片 / 异步）
    ├── link/                     # 分享文本 / URL 解析
    ├── extract/                  # 原始响应数据 → 结构化数据
    ├── storage/                  # 数据持久化（CSV / Excel / SQLite / MySQL）
    ├── manager/                  # 数据库 / 缓存管理
    ├── models/                   # Pydantic 数据模型
    ├── custom/                   # 自定义配置（颜色 / 端口 / 签名表）
    ├── translate/                # 多语言翻译模块
    └── tools/                    # 通用工具函数
```

---

## 📚 模块详解

### 一、抖音平台采集模块

#### 1. 单个 / 批量作品（`detail.py`）

输入抖音作品链接或 19 位作品 ID，支持批量粘贴多条链接。

**输出字段：**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `aweme_id` | str | 作品唯一 ID |
| `desc` | str | 作品文案 |
| `create_time` | int | 发布时间戳 |
| `nickname` | str | 作者昵称 |
| `sec_uid` | str | 作者 sec_uid |
| `digg_count` | int | 点赞数 |
| `comment_count` | int | 评论数 |
| `share_count` | int | 分享数 |
| `collect_count` | int | 收藏数 |
| `video_url` | str | 无水印视频地址 |
| `cover_url` | str | 封面图地址 |
| `music_url` | str | 背景音乐地址 |
| `image_urls` | list | 图集图片列表 |
| `live_photo_url` | str | 实况照片视频 |

#### 2. 账号作品（`account.py`）

通过账号主页链接或 `sec_uid` 采集该账号的全部作品，支持：
- `post` — 发布的作品
- `like` — 点赞的作品

支持分页与增量采集，记录已采集的 cursor。

#### 3. 合集作品（`mix.py`）

通过合集链接或 `mix_id` 采集合集下全部作品，支持自定义采集页数。

#### 4. 作品评论（`comment.py`）

采集指定作品的全部评论，支持：
- `comment` — 评论内容
- `reply` — 评论回复（楼中楼）
- 分页游标自动翻页
- 可导出为 Excel / CSV

#### 5. 直播数据（`live.py`）

输入直播间链接或 `web_rid`，返回：
- 直播推流地址（`flv` / `m3u8`）
- 直播标题、主播昵称、观看人数、点赞数
- 可调用 `ffmpeg` 录制直播流到本地

#### 6. 综合搜索（`search.py`）

支持四种搜索类型：
- `general` — 综合搜索（混合结果）
- `video` — 仅搜索视频
- `user` — 仅搜索用户
- `live` — 仅搜索直播

可指定关键词、搜索数量、排序方式（综合 / 最新 / 最热）。

#### 7. 抖音热榜（`hot.py`）

获取抖音全网热点榜单，包含：
- 热点标题、热度值、封面图
- 一键导出为表格

#### 8. 账号 / 收藏 / 收藏夹 / 话题

| 模块 | 功能 |
|------|------|
| `user.py` | 通过分享文本或主页链接获取账号资料（昵称、签名、粉丝数等） |
| `info.py` | 当前登录用户自己的账号信息 |
| `collection.py` | 自己的收藏作品列表 |
| `collects.py` | 收藏夹内作品批量采集 |
| `hashtag.py` | 话题 / 挑战下作品采集 |
| `slides.py` | 图集作品（多图）单独处理 |

---

### 二、TikTok 平台采集模块

TikTok 平台对应接口文件均以 `_tiktok.py` 后缀命名：

| 模块 | 功能 |
|------|------|
| `detail_tiktok.py` | TikTok 单个作品数据 |
| `account_tiktok.py` | TikTok 账号发布 / 喜欢作品 |
| `mix_tiktok.py` | TikTok 合辑作品 |
| `comment_tiktok.py` | TikTok 作品评论 |
| `live_tiktok.py` | TikTok 直播拉流地址 |
| `info_tiktok.py` | TikTok 当前登录用户信息 |

> ⚠️ TikTok 接口在国内访问需配置代理（推荐 SOCKS5）。

---

### 三、Web UI 可视化模块（`web_server.py` + `static/`）

独立的浏览器可视化操作台，**无需记忆任何命令行参数**。

**功能 Tab：**

| Tab | 用途 |
|-----|------|
| 作品采集 | 粘贴链接 / ID → 获取数据 → 选择下载 |
| 账号作品 | 输入账号主页 → 批量采集该账号作品 |
| 合集作品 | 输入合集链接 → 批量采集合集全部作品 |
| 作品评论 | 输入作品 ID → 采集评论 + 回复 |
| 账号详情 | 输入账号主页 → 获取资料数据 |
| 直播数据 | 输入直播链接 → 获取拉流地址 |
| 抖音热榜 | 一键获取全网热点 |
| 搜索 | 综合 / 视频 / 用户 / 直播 四种搜索 |
| 设置 | 配置 Cookie / 代理 / 下载目录 |

**顶部状态栏：** 实时显示 Cookie 就绪状态、保存目录、API 服务连通性。

---

### 四、Web API 接口模块（`main_server.py`）

基于 FastAPI 构建的标准 RESTful 服务，所有接口均在 `/docs` 提供 Swagger UI 文档。

**接口分类：**

| 路径前缀 | 用途 |
|----------|------|
| `POST /douyin/*` | 抖音数据接口（17 个端点） |
| `POST /tiktok/*` | TikTok 数据接口（6 个端点） |
| `GET/POST /settings` | 配置读写 |
| `GET /token` | Token 验证测试 |

**Token 鉴权：** 默认未开启，公开部署前请修改 `src/custom/function.py` 中的 `is_valid_token()`。

---

## ⚙️ 环境依赖

### 基础要求

| 项目 | 要求 |
|------|------|
| 操作系统 | Windows 10+ / macOS 12+ / Linux (Ubuntu 20.04+) |
| Python | **≥ 3.12**（使用了 PEP 695 类型参数语法） |
| 内存 | ≥ 512 MB |
| 网络 | 可访问 `douyin.com` 与 `tiktok.com` |
| ffmpeg | 可选，仅在录制直播流时需要 |

### Python 依赖列表

| 包名 | 用途 |
|------|------|
| `fastapi` | Web API 框架 |
| `uvicorn` | ASGI 服务器 |
| `httpx[socks]` | 异步 HTTP 客户端（支持 SOCKS 代理） |
| `pydantic` | 数据模型验证 |
| `rich` | 终端美化输出 |
| `openpyxl` | Excel 文件生成 |
| `aiosqlite` | 异步 SQLite 驱动 |
| `aiofiles` | 异步文件 IO |
| `lxml` | XML / HTML 解析 |
| `gmssl` | 国密 SM4 加密（用于抖音签名） |
| `never-jscore` | JavaScript 运行时（执行 aBogus 算法） |
| `emoji` | Emoji 字符处理 |
| `pyperclip` | 剪贴板读写（用于快速粘贴链接） |

### 安装命令

```bash
# 方式一：使用 pip
pip install -r requirements.txt

# 方式二：使用 uv（更快，推荐）
uv pip install -r requirements.txt

# 方式三：使用 Poetry
poetry install
```

---

## 🚀 快速开始

### 第 1 步：克隆仓库

```bash
git clone https://github.com/xuanz54/TikTokDownloader.git
cd TikTokDownloader
```

### 第 2 步：创建虚拟环境（强烈建议）

**Windows**

```powershell
python -m venv venv
venv\Scripts\activate
```

**macOS / Linux**

```bash
python3 -m venv venv
source venv/bin/activate
```

### 第 3 步：安装依赖

```bash
pip install -r requirements.txt
```

### 第 4 步：选择启动方式

#### 🅰️ 启动 Web UI（推荐新手）

```bash
# Windows 用户可直接双击 start_webui.bat
python web_server.py
```

启动成功后浏览器打开 [http://127.0.0.1:8080](http://127.0.0.1:8080) 即可。

#### 🅱️ 启动 Web API（面向开发者）

```bash
python main.py
```

按提示选择 `Web API 接口模式`，启动后访问 [http://127.0.0.1:5555/docs](http://127.0.0.1:5555/docs) 查看 Swagger UI。

#### 🅲️ 启动终端交互（服务器无 GUI）

```bash
python main.py
```

按提示选择 `终端交互模式`，根据菜单输入编号执行采集任务。

---

## 🔑 获取抖音 Cookie（关键步骤）

> 大多数数据接口需要登录态 Cookie 才能正常访问。未配置 Cookie 时，仅热搜、公开搜索等接口可用。

### 第 1 步：浏览器登录抖音

打开 [https://www.douyin.com/](https://www.douyin.com/)，使用 **抖音 App 扫码** 或 **手机号 + 验证码** 登录。

### 第 2 步：打开开发者工具

| 操作系统 | 快捷键 |
|----------|--------|
| Windows / Linux | `F12` 或 `Ctrl + Shift + I` |
| macOS | `⌥ Option + ⌘ Command + I` |

切换到 `Network`（网络）面板，勾选 `Preserve log`（保留日志）。

### 第 3 步：触发请求

在抖音网页版进行一次操作（刷新首页 / 点击任意视频），确保列表中出现至少一条 `douyin.com` 请求。

### 第 4 步：复制 Cookie

1. 在网络请求列表中点击任意一条 `douyin.com` 请求
2. 右侧切换到 `Headers` 标签页
3. 向下滚动找到 `Request Headers` → `cookie:` 字段
4. **全选并复制** `cookie:` 后面那串很长的文本

示例：

```
ttwid=xxx%7Cxxx; odin_tt=xxx; msToken=xxx; sessionid=xxx; ...
```

> 完整 Cookie 长度通常在 **200 ~ 600 字符**之间，包含 `ttwid`、`odin_tt`、`msToken`、`sessionid` 等关键字段。

### 第 5 步：填入配置

| 启动方式 | 操作 |
|----------|------|
| **Web UI** | 打开「设置」Tab → 粘贴到「抖音 Cookie」输入框 → 点击「保存」 |
| **终端模式** | 首次启动时自动生成 `Volume/settings.json`，将 Cookie 粘贴到 `cookie` 字段 |
| **API 模式** | 在请求参数中传入 `cookie` 字段（无需重启） |

### TikTok Cookie 获取

方法完全一致，访问 [https://www.tiktok.com/](https://www.tiktok.com/) 并捕获 `tiktok.com` 请求的 Cookie，填入 `cookie_tiktok` 字段。

---

## 📖 API 接口示例

### Web UI 模式（端口 8080）

```bash
# 获取单个作品数据
curl -X POST http://127.0.0.1:8080/api/detail \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.douyin.com/video/7234567890123456789",
    "cookie": "ttwid=xxx; odin_tt=xxx; msToken=xxx; sessionid=xxx",
    "proxy": ""
  }'
```

**响应示例：**

```json
{
  "success": true,
  "message": "ok",
  "count": 1,
  "data": [
    {
      "aweme_id": "7234567890123456789",
      "desc": "示例作品文案",
      "nickname": "示例作者",
      "create_time": 1704067200,
      "digg_count": 12345,
      "comment_count": 678,
      "collect_count": 90,
      "share_count": 12,
      "video_url": "https://...",
      "cover_url": "https://...",
      "music_url": "https://..."
    }
  ]
}
```

### Web API 模式（端口 5555）

```bash
# 获取抖音账号作品
curl -X POST http://127.0.0.1:5555/douyin/account \
  -H "Content-Type: application/json" \
  -H "Token: 1" \
  -d '{
    "url": "https://www.douyin.com/user/MS4wLjABAAAA...",
    "cookie": "ttwid=xxx; ...",
    "pages": 5,
    "post": true,
    "like": false
  }'
```

更多接口请参考 `main_server.py` 或访问 `/docs` Swagger UI。

---

## 🗂️ 配置文件说明

### 1. `Volume/settings.json`（运行时自动生成）

| 字段 | 类型 | 说明 |
|------|------|------|
| `cookie` | str | 抖音 Cookie |
| `cookie_tiktok` | str | TikTok Cookie |
| `proxy` | str | 抖音代理（如 `http://127.0.0.1:7890`） |
| `proxy_tiktok` | str | TikTok 代理（如 `socks5://127.0.0.1:1080`） |
| `download` | bool | 是否下载作品文件 |
| `folder_name` | str | 保存目录名 |
| `name_format` | list | 文件名模板（如 `["nickname", "desc", "create_time"]`） |
| `storage_format` | str | 数据持久化格式（`csv` / `xlsx` / `sqlite` / `mysql` / `json` / `txt`） |
| `music` | bool | 是否下载背景音乐 |
| `dynamic_cover` | bool | 是否下载动态封面 |
| `static_cover` | bool | 是否下载静态封面 |
| `max_size` | int | 单个文件最大体积（MB），0 表示不限制 |
| `chunk` | int | 分片下载大小（字节） |
| `max_retry` | int | 失败重试次数 |

### 2. `src/custom/static.py`（项目级配置）

```python
MAX_WORKERS = 4              # 同时下载的最大任务数
SERVER_HOST = "0.0.0.0"      # API 服务器监听地址
SERVER_PORT = 5555           # API 服务器监听端口
COOKIE_UPDATE_INTERVAL = 900 # Cookie 自动更新间隔（秒）
```

---

## ❓ 常见问题（FAQ）

### Q1：启动报错 `ModuleNotFoundError`

未安装依赖或未激活虚拟环境：

```bash
source venv/bin/activate    # macOS / Linux
venv\Scripts\activate       # Windows
pip install -r requirements.txt
```

### Q2：采集不到数据 / 返回为空

按顺序排查：

| 序号 | 排查项 | 处理方式 |
|------|--------|----------|
| ① | Cookie 是否有效 | 重新登录并复制最新 Cookie |
| ② | 网络是否可达 | 浏览器打开 `douyin.com` 测试 |
| ③ | 是否触发风控 | 等待 5~10 分钟，降低采集频率 |
| ④ | 代码是否为最新 | `git pull` 拉取最新提交 |
| ⑤ | 抖音接口是否更新 | 查看仓库 Issues 是否有公告 |

### Q3：Web UI 显示「Cookie: 未设置」

- 检查「设置」Tab 中是否完整粘贴了 Cookie（包含 `ttwid`、`sessionid` 等）
- 修改 `settings.json` 后必须重启服务才能生效
- 也可以在请求参数中临时传入 `cookie`，无需重启

### Q4：如何只采集数据不下载文件

| 模式 | 操作 |
|------|------|
| Web UI | 「设置」中关闭「下载开关」 |
| API 模式 | 仅调用 `/api/detail` 等查询接口 |
| 终端模式 | 菜单「下载设置」中选择「否」 |

### Q5：直播流下载失败

- 必须安装 `ffmpeg` 并加入系统 PATH
- 直播 URL 有时效性（通常 1~2 分钟），获取后尽快调用
- 部分直播存在版权保护，下载后只能在抖音内播放

### Q6：是否支持 Docker 部署

原项目提供 `Dockerfile`，本项目未保留。如需容器化可参考以下最小化 Dockerfile：

```dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5555 8080
CMD ["python", "main.py"]
```

### Q7：是否支持抖音极速版

不支持。极速版接口协议与正式版不同，请使用正式版抖音。

### Q8：终端模式中文乱码

Windows 下请使用 Windows Terminal 或 PowerShell（已默认 UTF-8）。如使用 CMD：

```cmd
chcp 65001
python main.py
```

### Q9：如何贡献代码

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/awesome`
3. 提交修改：`git commit -m "feat: 添加xxx功能"`
4. 推送分支：`git push origin feature/awesome`
5. 提交 Pull Request

---

## ⚠️ 免责声明

| 条款 | 内容 |
|------|------|
| 用途限制 | 本工具仅供 **学习与研究** 使用，请勿用于商业用途 |
| 数据归属 | 采集的数据版权归原作者所有，下载内容请勿二次分发 |
| 风控责任 | 频繁高频请求可能导致账号被风控，请合理设置采集间隔 |
| 法律责任 | 使用本工具造成的一切法律责任由用户本人承担，与开发者无关 |
| 接口变更 | 抖音 / TikTok 接口随时可能变更，本项目不保证永久可用 |

---

## 🤝 贡献与反馈

- 🐛 **Bug 反馈**：请在仓库 [Issues](https://github.com/xuanz54/TikTokDownloader/issues) 区留言，附上复现步骤与日志
- 💡 **功能建议**：欢迎提交 Pull Request 或在 Discussions 区讨论
- ⭐ **支持项目**：如果觉得有帮助，请给个 Star 鼓励一下

---

## 🙏 致谢

本项目基于 [JoeanAmier/TikTokDownloader](https://github.com/JoeanAmier/TikTokDownloader) 进行二次开发，感谢原作者的开源贡献。

---

## 📜 许可协议

本项目遵循 **GPL-3.0** 开源协议。详见 `LICENSE` 文件。