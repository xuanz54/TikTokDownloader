# 抖音数据采集台

一款基于 Python 的 **抖音 / TikTok** 数据采集工具，提供 **Web UI 网页台**、**Web API 接口** 与 **终端交互** 三种使用方式。可采集作品、账号、合集、评论、直播、热榜、搜索等多维度数据，并支持将作品文件（视频 / 图集 / 实况 / 封面 / 音乐）一键保存到本地。

> 无需复杂的命令行操作，浏览器打开即用；面向开发者也可作为标准 RESTful 接口集成到自动化系统中。

---

## 一、功能特性

### 1. 数据采集维度

| 维度 | 抖音 | TikTok |
| --- | :---: | :---: |
| 单个 / 批量作品 | ✅ | ✅ |
| 账号作品（发布 / 喜欢） | ✅ | ✅ |
| 合集 / 合辑作品 | ✅ | ✅ |
| 作品评论 + 评论回复 | ✅ | ✅ |
| 账号详细资料 | ✅ | ✅ |
| 直播拉流地址 | ✅ | ✅ |
| 综合 / 视频 / 用户 / 直播搜索 | ✅ | ✅ |
| 抖音全网热榜 | ✅ | — |
| 话题 / 收藏 / 收藏夹作品 | ✅ | — |

### 2. 文件下载

- 一键下载作品文件，**视频 / 图集 / 实况 / 封面 / 音乐** 可单独控制
- 多线程并发下载，断点续传
- 文件名模板、下载目录、保存格式（CSV / Excel / SQLite / MySQL / JSON / TXT）可配置
- 自动跳过已下载记录（数据库记录）

### 3. 使用方式

- **Web UI 模式**（推荐）：浏览器交互，所见即所得
- **Web API 模式**：FastAPI 标准 RESTful 接口，便于集成
- **终端交互模式**：命令行菜单式操作，适合服务器环境

---

## 二、环境要求

| 项目 | 要求 |
| --- | --- |
| 操作系统 | Windows / macOS / Linux |
| Python | **≥ 3.12** |
| 网络 | 可访问 `douyin.com` 与 `tiktok.com`（国内用户可能需要代理） |
| ffmpeg（可选） | 仅在使用「下载直播流」时需要 |

> 抖音接口频繁更新，若采集失败请拉取最新代码。

---

## 三、安装

### 1. 克隆项目

```bash
git clone https://github.com/<你的用户名>/<仓库名>.git
cd <仓库名>
```

或者直接下载 ZIP 解压。

### 2. 创建虚拟环境（强烈建议）

**Windows**

```powershell
python -m venv venv
venv\Scripts\pip install -r requirements.txt
```

**macOS / Linux**

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

或使用 uv（更快）：

```bash
uv venv
uv pip install -r requirements.txt
```

> Windows 用户也可以直接双击 `start_webui.bat`，脚本会自动检查 `venv\Scripts\python.exe` 是否存在。

### 3. 验证安装

```bash
venv\Scripts\python.exe -c "import fastapi, httpx, rich; print('依赖安装成功')"
```

---

## 四、快速开始

### 方式一：Web UI 模式（推荐新手）

启动浏览器可视化界面：

**Windows**

```powershell
# 方法 1：双击 start_webui.bat
# 方法 2：命令行
venv\Scripts\python.exe web_server.py
```

**macOS / Linux**

```bash
venv/bin/python web_server.py
```

启动成功后会输出：

```
[DouK-Downloader Web UI] 启动成功！
[DouK-Downloader Web UI] 本机访问: http://127.0.0.1:8080
```

浏览器打开 [http://127.0.0.1:8080](http://127.0.0.1:8080) 即可使用。

> 默认仅监听 `127.0.0.1`，仅本机可访问。如需局域网共享，可修改 `web_server.py` 中的 `UI_HOST`。

### 方式二：Web API 模式（面向开发者）

启动标准 RESTful API 服务：

```bash
venv/bin/python main.py
```

按提示选择「Web API 接口模式」，服务启动后访问 [http://127.0.0.1:5555/docs](http://127.0.0.1:5555/docs) 查看交互式 API 文档（Swagger UI）。

服务监听地址可在 `src/custom/static.py` 中修改 `SERVER_HOST` / `SERVER_PORT`。

> 默认无需 Token，但 **公开部署前请务必修改 `src/custom/function.py` 中的 `is_valid_token()` 函数** 添加校验逻辑。

### 方式三：终端交互模式

```bash
venv/bin/python main.py
```

按提示选择「终端交互模式」，根据菜单提示输入编号即可：

```
[1] 采集单个作品
[2] 采集账号作品
[3] 采集合集作品
[4] 采集作品评论
[5] 采集账号详细资料
[6] 采集直播数据
[7] 采集抖音热榜
[8] 综合搜索
...
```

---

## 五、获取抖音 Cookie（关键步骤）

> 大多数数据接口需要登录态 Cookie 才能正常访问。未配置 Cookie 时，仅热搜、搜索等公开接口可用。

### 步骤 1：浏览器登录抖音

打开 [https://www.douyin.com/](https://www.douyin.com/)，**扫码登录** 或 **手机号登录** 你的抖音账号。

### 步骤 2：打开「网络」面板

1. 按 `F12` 打开开发者工具
2. 切换到 `Network`（网络）面板
3. 勾选 `Preserve log`（保留日志）
4. 在网页上进行一次操作（如刷新、滑动首页）

### 步骤 3：复制 Cookie

1. 在网络请求列表中找到任意一条 `douyin.com` 请求
2. 右键 → `Copy` → `Copy value` → `Cookie` 所在行
3. 或者直接拷贝 **请求头** 中的整段 `cookie:` 字段

```
Cookie: ttwid=...; odin_tt=...; msToken=...; sessionid=...; ...
```

> 完整 Cookie 通常 200~600 字符，包含 `ttwid`、`odin_tt`、`msToken`、`sessionid` 等字段。

### 步骤 4：填入配置

**Web UI 模式**：在网页「设置」Tab 中粘贴到「抖音 Cookie」输入框，点击保存。

**终端 / API 模式**：将 Cookie 粘贴到首次启动时生成的 `Volume/settings.json` 中的 `cookie` 字段，或在请求参数中临时传入 `cookie`。

### TikTok Cookie 获取

方法同上，访问 [https://www.tiktok.com/](https://www.tiktok.com/) 并捕获 `tiktok.com` 请求的 Cookie，填到「TikTok Cookie」字段。

---

## 六、Web UI 使用指南

### 顶部状态栏

- 显示当前 Cookie 是否就绪
- 显示文件保存目录
- 主题切换（暗色 / 亮色）

### 功能 Tab

| Tab | 用途 |
| --- | --- |
| 作品采集 | 输入作品链接或 ID，获取作品元数据 + 下载文件 |
| 账号作品 | 输入账号主页链接或 sec_uid，采集账号作品 |
| 合集作品 | 输入合集链接或 mix_id，采集合集全部作品 |
| 作品评论 | 输入作品 ID，采集评论 + 回复 |
| 账号详情 | 输入账号主页链接，采集账号资料 |
| 直播数据 | 输入直播链接或 web_rid，获取拉流地址 |
| 抖音热榜 | 一键获取全网热点榜单 |
| 设置 | 配置 Cookie / 代理 / 文件夹 |

### 操作流程示例：批量下载作品

1. 打开「作品采集」Tab
2. 在「作品链接」粘贴抖音作品分享文本（可粘贴多条）
3. 切换平台到「抖音」
4. 点击「获取数据」
5. 在结果列表中选择需要的作品
6. 点击「保存到本地」即可下载视频 / 图集 / 封面

---

## 七、API 接口文档

> Web UI 模式与 Web API 模式共享底层逻辑，API 端点见 `web_server.py`。
> 原项目完整的 OpenAPI 文档见 `main_server.py`。

### Web UI API 端点（默认端口 8080）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/env` | 获取当前环境配置（端口、Cookie 状态、保存目录等） |
| `POST` | `/api/env` | 更新 settings.json |
| `POST` | `/api/detail` | 获取单个 / 多个作品数据 |
| `POST` | `/api/account` | 获取账号作品数据 |
| `POST` | `/api/mix` | 获取合集作品数据 |
| `POST` | `/api/comment` | 获取作品评论数据 |
| `POST` | `/api/user` | 获取账号详细资料 |
| `POST` | `/api/live` | 获取直播拉流地址 |
| `POST` | `/api/hot` | 获取抖音热榜数据 |
| `POST` | `/api/save` | 下载作品文件到本地 |
| `POST` | `/api/export-excel` | 导出 Excel 表格 |
| `GET` | `/api/stream` | 流式下载代理（用于下载视频） |

### 原项目 API 端点（默认端口 5555）

服务启动后访问 `/docs` 路径查看 Swagger UI 文档，包含：

- `POST /douyin/share` — 解析抖音分享文本
- `POST /douyin/detail` — 获取抖音单个作品
- `POST /douyin/account` — 获取抖音账号作品
- `POST /douyin/mix` — 获取抖音合集作品
- `POST /douyin/comment` — 获取抖音作品评论
- `POST /douyin/reply` — 获取抖音评论回复
- `POST /douyin/live` — 获取抖音直播数据
- `POST /douyin/search/{general,video,user,live}` — 抖音搜索
- `POST /tiktok/*` — TikTok 对应接口
- `GET/POST /settings` — 配置读写
- `GET /token` — Token 验证测试

### 调用示例

```bash
curl -X POST http://127.0.0.1:8080/api/detail \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.douyin.com/video/7234567890123456789",
    "cookie": "ttwid=xxx; odin_tt=xxx; ...",
    "proxy": ""
  }'
```

返回：

```json
{
  "success": true,
  "message": "ok",
  "data": [
    {
      "id": "7234567890123456789",
      "desc": "作品文案",
      "nickname": "作者昵称",
      "create_time": "2024-01-01 12:00",
      "digg_count": 12345,
      "comment_count": 678,
      "collect_count": 90,
      "share_count": 12,
      "downloads": ["https://..."]
    }
  ],
  "count": 1
}
```

---

## 八、配置文件

### 1. `Volume/settings.json`（运行时自动生成）

首次启动后会在项目目录生成 `Volume/settings.json`，结构示例：

```json
{
  "cookie": "ttwid=xxx; odin_tt=xxx; ...",
  "cookie_tiktok": "",
  "proxy": "",
  "proxy_tiktok": "",
  "download": true,
  "folder_name": "Download",
  "name_format": ["nickname", "desc", "create_time"],
  "storage_format": "",
  "music": true,
  "dynamic_cover": false,
  "static_cover": true,
  "max_size": 0,
  "chunk": 2097152,
  "max_retry": 5
}
```

### 2. `src/custom/static.py`（项目配置）

```python
MAX_WORKERS = 4              # 同时下载的最大任务数
SERVER_HOST = "0.0.0.0"      # API 服务器监听地址
SERVER_PORT = 5555           # API 服务器监听端口
COOKIE_UPDATE_INTERVAL = 900 # Cookie 更新间隔（秒）
```

### 3. 代理配置

```json
{
  "proxy": "http://127.0.0.1:7890",
  "proxy_tiktok": "socks5://127.0.0.1:1080"
}
```

支持 `http://`、`https://`、`socks5://` 协议。

---

## 九、项目结构

```
.
├── main.py                  # 终端模式主入口
├── web_server.py            # Web UI 服务器（独立 Flask 风格）
├── start_webui.bat          # Windows 一键启动脚本
├── pyproject.toml           # 项目配置
├── requirements.txt         # 依赖锁定
├── locale/                  # 国际化文件
│   ├── en_US/
│   ├── zh_CN/
│   └── tk.pot
├── static/                  # Web UI 前端
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   ├── images/
│   └── js/                  # 浏览器端加密算法
└── src/
    ├── application/         # 应用入口
    │   ├── TikTokDownloader.py
    │   ├── main_terminal.py # 终端交互
    │   ├── main_server.py   # API 服务
    │   └── main_monitor.py  # 后台监听
    ├── interface/            # 各平台接口
    │   ├── detail.py / detail_tiktok.py
    │   ├── account.py / account_tiktok.py
    │   ├── comment.py / comment_tiktok.py
    │   ├── mix.py / mix_tiktok.py
    │   ├── live.py / live_tiktok.py
    │   ├── search.py / hot.py
    │   └── ...
    ├── encrypt/             # 签名加密（aBogus / xBogus / msToken ...）
    ├── downloader/          # 文件下载器
    ├── link/                # 链接解析
    ├── extract/             # 数据提取
    ├── storage/             # 数据持久化
    ├── manager/             # 数据库 / 缓存管理
    ├── models/              # 数据模型
    ├── custom/              # 自定义配置
    └── tools/               # 工具函数
```

---

## 十、常见问题（FAQ）

### Q1：启动报错 `ModuleNotFoundError`

未安装依赖或未激活虚拟环境：

```bash
source venv/bin/activate   # Linux / macOS
venv\Scripts\activate      # Windows
pip install -r requirements.txt
```

### Q2：采集不到数据 / 返回为空

按顺序排查：

1. **Cookie 是否有效**：Cookie 过期后必须重新获取
2. **网络是否可达**：浏览器打开 `douyin.com` 看能否访问
3. **是否触发风控**：频繁请求可能被限流，等待一段时间再试
4. **代码是否为最新**：抖音接口经常更新，`git pull` 拉取最新代码

### Q3：Web UI 显示「Cookie: 未设置」

Cookie 未生效。检查：

1. 「设置」Tab 中是否正确粘贴 Cookie
2. 保存后是否重启了服务（修改 `settings.json` 后必须重启）
3. 或者直接在请求时临时传入 `cookie` 参数，无需重启

### Q4：如何只采集数据不下载文件

- **Web UI**：在「设置」中关闭「下载开关」
- **API 模式**：使用 `/api/detail` 等查询接口，不会自动下载
- **终端模式**：在「下载设置」中选择「否」

### Q5：直播流下载失败

- 必须安装 ffmpeg 并加入系统 PATH
- 直播 URL 有时效性，需尽快调用

### Q6：如何更新到最新版

```bash
git pull origin master
pip install -r requirements.txt --upgrade
```

### Q7：是否支持 Docker

原项目提供 `Dockerfile`，本项目未保留。如需容器化部署，请自行编写 Dockerfile（基于 `python:3.12-slim` 安装依赖并暴露端口）。

### Q8：是否支持抖音极速版

不支持。极速版接口协议不同，请使用正式版抖音。

---

## 十一、免责声明

1. 本工具仅供 **学习与研究** 使用，请勿用于商业用途
2. 采集的数据版权归原作者所有，下载的内容请勿二次分发
3. 频繁高频请求可能导致账号被风控，请合理设置采集间隔
4. 使用本工具造成的一切法律责任由用户本人承担，与开发者无关
5. 抖音 / TikTok 接口随时可能变更，本项目不保证永久可用

---

## 十二、致谢

- 本项目基于 [JoeanAmier/TikTokDownloader](https://github.com/JoeanAmier/TikTokDownloader) 进行二次开发
- 感谢所有开源贡献者

---

## 十三、License

本项目遵循 GPL-3.0 开源协议。

---

## 十四、问题反馈

- 提交 Issue：仓库的 Issues 页面
- 功能建议：欢迎 Pull Request