const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const cfgKey = "douk_webui_cfg";
let cfg = {};
try { cfg = JSON.parse(localStorage.getItem(cfgKey) || "{}"); } catch (e) { cfg = {}; }

let currentResults = [];
let currentTiktok = false;
let selectedIds = new Set();

/* ---------- 主题切换 ---------- */
const THEME_KEY = "douk_theme";
function getTheme() { return localStorage.getItem(THEME_KEY) || "dark"; }
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const btn = $("#theme-toggle");
  if (btn) btn.textContent = theme === "dark" ? "☀️" : "🌙";
  localStorage.setItem(THEME_KEY, theme);
}
function toggleTheme() {
  applyTheme(getTheme() === "dark" ? "light" : "dark");
}

/* ---------- 工具 ---------- */
function toast(message, type = "info", ms = 4000) {
  const root = $("#toast-root");
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = message;
  root.appendChild(el);
  setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity .3s"; }, ms - 300);
  setTimeout(() => el.remove(), ms);
}

async function post(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function fmt(n) {
  n = Number(n || 0);
  if (n >= 100000000) return (n / 100000000).toFixed(1) + "亿";
  if (n >= 10000) return (n / 10000).toFixed(1) + "万";
  return String(n);
}

function baseParams(tiktok) {
  return {
    cookie: tiktok ? (cfg.cookie_tiktok || "") : (cfg.cookie || ""),
    proxy: tiktok ? (cfg.proxy_tiktok || "") : (cfg.proxy || ""),
  };
}

function platformValue(groupId) {
  const btn = $(`#${groupId} .platform-toggle button.active`);
  return btn ? btn.dataset.value : "douyin";
}

function getShareUrl(item, tiktok) {
  return item.share_url || (tiktok && item.unique_id
    ? `https://www.tiktok.com/@${item.unique_id}/video/${item.id}`
    : `https://www.douyin.com/video/${item.id}`);
}

/* ---------- 标签页 ---------- */
function bindTabs() {
  $$(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".tab-btn").forEach(b => b.classList.remove("active"));
      $$(".tab-pane").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      $(`#tab-${btn.dataset.tab}`).classList.add("active");
      clearResults();
    });
  });
}

function clearResults() {
  currentResults = [];
  currentHotData = [];
  selectedIds.clear();
  $("#cards").innerHTML = "";
  $("#select-bar").classList.add("hidden");
  $("#result-head").classList.add("hidden");
  $("#empty").classList.add("hidden");
  $("#result-area").classList.add("hidden");
  const hotBtn = $("#hot-export-btn");
  if (hotBtn) hotBtn.style.display = "none";
}

function bindPlatformToggles() {
  $$(".platform-toggle").forEach(group => {
    $$("button", group).forEach(btn => {
      btn.addEventListener("click", () => {
        $$("button", group).forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });
  });
}

/* ---------- 选择管理 ---------- */
function updateSelectBar() {
  const works = currentResults.filter(isWork);
  const count = works.filter(it => selectedIds.has(it.id)).length;
  const bar = $("#select-bar");
  if (!bar) return;
  bar.classList.toggle("hidden", !works.length);
  $("#select-count").textContent = count ? `已选 ${count} / ${works.length}` : `共 ${works.length} 条`;
  const allCb = $("#select-all");
  if (allCb) allCb.checked = works.length > 0 && works.every(it => selectedIds.has(it.id));
}

function toggleSelect(id) {
  if (selectedIds.has(id)) selectedIds.delete(id);
  else selectedIds.add(id);
  updateSelectBar();
}

function toggleSelectAll() {
  const works = currentResults.filter(isWork);
  const allSelected = works.every(it => selectedIds.has(it.id));
  if (allSelected) works.forEach(it => selectedIds.delete(it.id));
  else works.forEach(it => selectedIds.add(it.id));
  $$(".work-card .card-check input").forEach(cb => { cb.checked = !allSelected; });
  updateSelectBar();
}

function getSelectedWorks() {
  return currentResults.filter(it => isWork(it) && selectedIds.has(it.id));
}

/* ---------- 渲染 ---------- */
function showLoading(text = "正在采集数据...") {
  $("#loading").classList.remove("hidden");
  $("#loading-text").textContent = text;
  $("#cards").innerHTML = "";
  $("#result-head").classList.add("hidden");
  $("#result-area").classList.remove("hidden");
  selectedIds.clear();
}

function hideLoading() {
  $("#loading").classList.add("hidden");
}

function coverOf(item) {
  return item.static_cover || item.cover || item.dynamic_cover || "";
}

function isWork(item) {
  return ["视频", "图集", "实况"].includes(item.type);
}

function renderResults(items, tiktok) {
  hideLoading();
  currentResults = items || [];
  currentTiktok = !!tiktok;
  selectedIds.clear();
  const cards = $("#cards");
  cards.innerHTML = "";

  if (!items?.length) {
    $("#empty").classList.remove("hidden");
    $("#empty").innerHTML = `<div class="card" style="text-align:center;color:var(--muted)">没有数据</div>`;
    $("#select-bar").classList.add("hidden");
    $("#result-area").classList.add("hidden");
    return;
  }
  $("#empty").classList.add("hidden");
  $("#result-summary").textContent = `共 ${items.length} 条${tiktok ? " TikTok" : " 抖音"}数据`;
  $("#result-head").classList.remove("hidden");
  $("#save-all-btn").classList.toggle("hidden", !items.some(isWork));
  $("#export-excel-btn").classList.toggle("hidden", !items.some(isWork));
  $("#result-area").classList.remove("hidden");
  updateSelectBar();

  items.forEach((item, idx) => {
    cards.appendChild(isWork(item) ? workCard(item, idx, tiktok) : simpleCard(item, idx, tiktok));
  });
}

function workCard(item, idx, tiktok) {
  const el = document.createElement("div");
  el.className = "work-card";
  const cover = coverOf(item);
  const downloads = item.downloads || [];
  const isImage = item.type === "图集";
  const dur = isImage ? "" : `<span class="dur">${esc(item.duration)}</span>`;
  const mediaUrl = downloads[0] || "";

  el.innerHTML = `
    <div class="thumb">
      <label class="card-check"><input type="checkbox" data-id="${esc(item.id)}"></label>
      ${cover ? `<img src="${esc(cover)}" alt="" loading="lazy" onerror="this.style.display='none'">` : ""}
      <span class="badge">${esc(item.type)}</span>
      ${dur}
      <span class="platform-note">${tiktok ? "TikTok" : "抖音"}</span>
    </div>
    <div class="body">
      <div class="title">${esc(item.desc || item.id)}</div>
      <div class="author">${esc(item.nickname || "")}</div>
      <div class="meta"><span>${esc(item.create_time || "")}</span><span>#${esc(item.id)}</span></div>
      <div class="stats">
        <span>❤️ ${fmt(item.digg_count)}</span>
        <span>💬 ${fmt(item.comment_count)}</span>
        <span>⭐ ${fmt(item.collect_count)}</span>
        <span>↗️ ${fmt(item.share_count)}</span>
        ${item.play_count != null ? `<span>▶️ ${fmt(item.play_count)}</span>` : ""}
      </div>
    </div>
    <div class="actions">
      <button class="btn primary small" data-act="save">保存到本机</button>
      <button class="btn ghost" data-act="copy">复制链接</button>
      <button class="btn ghost" data-act="view">查看数据</button>
    </div>`;

  el.querySelector(".card-check input").addEventListener("change", (e) => {
    toggleSelect(item.id);
    e.stopPropagation();
  });

  el.querySelector("[data-act=save]").addEventListener("click", async () => {
    const btn = el.querySelector("[data-act=save]");
    btn.disabled = true;
    btn.textContent = "保存中...";
    try {
      const res = await post("/api/save", { items: [item], tiktok });
      if (res.success) {
        const paths = (res.data.files || []);
        toast(`已保存 ${paths.length ? paths.join("、").slice(0, 80) : ""}\n目录: ${res.data.root}`, "ok", 6000);
        if (res.data.root) openFolderBtnValue = res.data.root;
      } else {
        toast(res.message || "保存失败", "err");
      }
    } catch (e) {
      toast("保存失败: " + e.message, "err");
    } finally {
      btn.disabled = false;
      btn.textContent = "保存到本机";
    }
  });

  el.querySelector("[data-act=copy]").addEventListener("click", () => {
    const url = getShareUrl(item, tiktok);
    navigator.clipboard?.writeText(url).then(() => toast("链接已复制", "ok")).catch(() => toast(url, "info", 8000));
  });

  el.querySelector("[data-act=view]").addEventListener("click", () => {
    openModal(item.desc || "作品数据", JSON.stringify(item, null, 2));
  });

  return el;
}

function simpleCard(item, idx, tiktok) {
  const el = document.createElement("div");
  el.className = "work-card user-card";
  const isUser = item.nickname && !item.type;
  const avatar = item.avatar || "";
  el.innerHTML = `
    <div class="body">
      <div style="display:flex;align-items:center">
        ${avatar ? `<img class="avatar" src="${esc(avatar)}" alt="" onerror="this.style.display='none'">` : ""}
        <div>
          <div class="author" style="font-size:15px">${esc(item.nickname || item.room_id || item.id)}</div>
          <div class="meta">${esc(item.signature || item.desc || "")}</div>
        </div>
      </div>
      ${isUser ? `<div class="stats"><span>粉丝 ${fmt(item.follower_count)}</span><span>获赞 ${fmt(item.total_favorited)}</span><span>作品 ${fmt(item.aweme_count)}</span></div>` : ""}
      <div class="meta">#${esc(item.sec_uid || item.uid || item.room_id || "")} · ${tiktok ? "TikTok" : "抖音"}</div>
    </div>
    <div class="actions">
      <button class="btn ghost" data-act="view">查看数据</button>
    </div>`;
  el.querySelector("[data-act=view]").addEventListener("click", () => {
    openModal(item.nickname || "数据", JSON.stringify(item, null, 2));
  });
  return el;
}

/* ---------- 弹窗 ---------- */
function openModal(title, body) {
  $("#modal-title").textContent = title;
  $("#modal-body").textContent = body;
  $("#modal").classList.remove("hidden");
}
$("#modal-close").addEventListener("click", () => $("#modal").classList.add("hidden"));
$("#modal").addEventListener("click", e => { if (e.target.id === "modal") $("#modal").classList.add("hidden"); });

/* ---------- 采集 ---------- */
async function runDetail() {
  const raw = $("#detail-input").value.trim();
  const platform = platformValue("detail-platform");
  const tiktok = platform === "tiktok";
  if (!raw) { toast("请输入作品链接或 ID", "err"); return; }
  showLoading("正在解析链接并采集作品数据...");
  try {
    const res = await post("/api/detail", Object.assign({ url: raw, tiktok }, baseParams(tiktok)));
    if (!res.success) { hideLoading(); toast(res.message, "err"); return; }
    renderResults(res.data, tiktok);
  } catch (e) { hideLoading(); toast("请求失败: " + e.message, "err"); }
}

async function runAccount() {
  const url = $("#account-input").value.trim();
  const platform = platformValue("account-platform");
  const tiktok = platform === "tiktok";
  if (!url) { toast("请输入账号主页链接", "err"); return; }
  showLoading("正在采集账号作品（可能需要较长时间）...");
  try {
    const res = await post("/api/account", Object.assign({
      url, tiktok,
      tab: $("#account-tab").value,
      pages: parseInt($("#account-pages").value) || null,
    }, baseParams(tiktok)));
    if (!res.success) { hideLoading(); toast(res.message, "err"); return; }
    renderResults(res.data, tiktok);
  } catch (e) { hideLoading(); toast("请求失败: " + e.message, "err"); }
}

async function runSearch() {
  toast("搜索功能暂不可用", "info");
}

let openFolderBtnValue = "";

/* ---------- 设置 ---------- */
function loadEnv() {
  fetch("/api/env").then(r => r.json()).then(res => {
    if (!res.success) return;
    const d = res.data;
    $("#env-cookie").textContent = `抖音Cookie: ${d.cookie_set ? "已设置" : "未设置"} · TikTok: ${d.cookie_tiktok_set ? "已设置" : "未设置"}`;
    $("#env-cookie").classList.toggle("ok", d.cookie_set);
    $("#env-root").textContent = "保存目录: " + d.download_root;
    $("#env-ver").textContent = "v" + d.version;
    $("#set-cookie").value = cfg.cookie || "";
    $("#set-cookie-tiktok").value = cfg.cookie_tiktok || "";
    $("#set-proxy").value = cfg.proxy || "";
    $("#set-proxy-tiktok").value = cfg.proxy_tiktok || "";
    const dl = $("#set-download");
    dl.checked = d.download;
    dl.addEventListener("change", () => { cfg.download = dl.checked; saveCfg(); });
    $("#set-tip").textContent = "提示：Cookie / 代理可直接在下方表单填写并点击「应用到本次请求」；「保存到 settings.json」会写入配置文件，重启服务后自动生效。";
    openFolderBtnValue = d.download_root;
  }).catch(() => {});
}

function collectCfg() {
  return {
    cookie: $("#set-cookie").value.trim(),
    cookie_tiktok: $("#set-cookie-tiktok").value.trim(),
    proxy: $("#set-proxy").value.trim(),
    proxy_tiktok: $("#set-proxy-tiktok").value.trim(),
    download: $("#set-download").checked,
  };
}
function saveCfg() { localStorage.setItem(cfgKey, JSON.stringify(cfg)); }
function applyCfg() {
  cfg = Object.assign({}, cfg, collectCfg());
  saveCfg();
  toast("已应用到本次请求（Cookie / 代理）", "ok");
}
async function saveCfgFile() {
  try {
    const res = await post("/api/env", collectCfg());
    toast(res.message || "已保存", res.success ? "ok" : "err", 6000);
    loadEnv();
  } catch (e) { toast("保存失败: " + e.message, "err"); }
}
async function openFolder() {
  if (!openFolderBtnValue) return;
  const res = await post("/api/open-folder", { path: openFolderBtnValue });
  toast(res.message || "已打开", res.success ? "ok" : "err");
}

/* ---------- 下载选中 / 全部 ---------- */
async function saveSelected() {
  const items = getSelectedWorks();
  if (!items.length) { toast("请先勾选要下载的作品", "err"); return; }
  await doSave(items);
}

async function saveAll() {
  const items = currentResults.filter(isWork);
  if (!items.length) return;
  await doSave(items);
}

async function doSave(items) {
  const btn = $("#save-all-btn");
  btn.disabled = true;
  const total = items.length;
  btn.textContent = `保存中 (0/${total})...`;
  let okCount = 0;
  try {
    for (let i = 0; i < total; i++) {
      const res = await post("/api/save", { items: [items[i]], tiktok: currentTiktok });
      if (res.success) okCount++;
      btn.textContent = `保存中 (${i + 1}/${total})...`;
    }
    toast(`保存完成，成功 ${okCount}/${total}`, "ok", 6000);
  } catch (e) {
    toast("保存中断: " + e.message, "err");
  } finally {
    btn.disabled = false;
    btn.textContent = "全部保存到本机";
  }
}

/* ---------- 导出 Excel ---------- */
async function exportExcel() {
  if (currentHotData.length) {
    await exportHotExcel();
    return;
  }
  const items = getSelectedWorks();
  if (!items.length) { toast("请先勾选要导出的作品", "err"); return; }
  const btn = $("#export-excel-btn");
  btn.disabled = true;
  btn.textContent = "导出中...";
  try {
    const res = await fetch("/api/export-excel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, type: "detail" }),
    });
    if (!res.ok) throw new Error("导出失败");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `抖音数据_${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`已导出 ${items.length} 条数据`, "ok");
  } catch (e) {
    toast("导出失败: " + e.message, "err");
  } finally {
    btn.disabled = false;
    btn.textContent = "导出 Excel";
  }
}

/* ---------- 合集作品 ---------- */
async function runMix() {
  const raw = $("#mix-input").value.trim();
  const platform = platformValue("mix-platform");
  const tiktok = platform === "tiktok";
  if (!raw) { toast("请输入合集链接或 mix_id", "err"); return; }
  showLoading("正在获取合集作品...");
  try {
    const isMixId = /^[A-Za-z0-9_-]{20,}$/.test(raw);
    const body = isMixId
      ? { mix_id: raw, tiktok, ...baseParams(tiktok) }
      : { url: raw, tiktok, ...baseParams(tiktok) };
    const res = await post("/api/mix", body);
    if (!res.success) { hideLoading(); toast(res.message, "err"); return; }
    renderResults(res.data, tiktok);
  } catch (e) { hideLoading(); toast("请求失败: " + e.message, "err"); }
}

/* ---------- 作品评论 ---------- */
async function runComment() {
  const detailId = $("#comment-input").value.trim();
  if (!detailId) { toast("请输入作品 ID", "err"); return; }
  showLoading("正在获取评论...");
  try {
    const res = await post("/api/comment", Object.assign({ detail_id: detailId }, baseParams(false)));
    if (!res.success) { hideLoading(); toast(res.message, "err"); return; }
    renderCommentResults(res.data);
  } catch (e) { hideLoading(); toast("请求失败: " + e.message, "err"); }
}

function renderCommentResults(items) {
  hideLoading();
  currentResults = items || [];
  selectedIds.clear();
  const cards = $("#cards");
  cards.innerHTML = "";
  if (!items?.length) {
    $("#empty").classList.remove("hidden");
    $("#empty").innerHTML = `<div class="card" style="text-align:center;color:var(--muted)">没有评论数据</div>`;
    $("#select-bar").classList.add("hidden");
    $("#result-area").classList.add("hidden");
    return;
  }
  $("#empty").classList.add("hidden");
  $("#result-summary").textContent = `共 ${items.length} 条评论`;
  $("#result-head").classList.remove("hidden");
  $("#save-all-btn").classList.add("hidden");
  $("#export-excel-btn").classList.add("hidden");
  $("#select-bar").classList.add("hidden");

  items.forEach((item, idx) => {
    const el = document.createElement("div");
    el.className = "work-card";
    el.innerHTML = `
      <div class="body">
        <div class="author">${esc(item.nickname || "匿名")}</div>
        <div class="title" style="-webkit-line-clamp:unset">${esc(item.text || "")}</div>
        <div class="meta">
          <span>❤️ ${fmt(item.digg_count)}</span>
          <span>💬 ${fmt(item.reply_comment_total || 0)}</span>
          <span>${esc(item.create_time || "")}</span>
        </div>
      </div>
      <div class="actions">
        <button class="btn ghost" data-act="view">查看数据</button>
      </div>`;
    el.querySelector("[data-act=view]").addEventListener("click", () => {
      openModal(item.nickname || "评论数据", JSON.stringify(item, null, 2));
    });
    cards.appendChild(el);
  });
}

/* ---------- 账号详情 ---------- */
async function runUser() {
  const raw = $("#user-input").value.trim();
  const platform = platformValue("user-platform");
  const tiktok = platform === "tiktok";
  if (!raw) { toast("请输入账号主页链接或 sec_user_id", "err"); return; }
  showLoading("正在获取账号详情...");
  try {
    const isSecUid = raw.startsWith("MS4wLj");
    const body = isSecUid
      ? { sec_user_id: raw, tiktok, ...baseParams(tiktok) }
      : { url: raw, tiktok, ...baseParams(tiktok) };
    const res = await post("/api/user", body);
    if (!res.success) { hideLoading(); toast(res.message, "err"); return; }
    renderCommentResults(res.data);
  } catch (e) { hideLoading(); toast("请求失败: " + e.message, "err"); }
}

/* ---------- 直播数据 ---------- */
async function runLive() {
  const raw = $("#live-input").value.trim();
  const platform = platformValue("live-platform");
  const tiktok = platform === "tiktok";
  if (!raw) { toast("请输入直播间链接", "err"); return; }
  showLoading("正在获取直播数据...");
  try {
    const isWebRid = /^\d+$/.test(raw) && raw.length > 10;
    const body = isWebRid
      ? { web_rid: raw, tiktok, ...baseParams(tiktok) }
      : { url: raw, tiktok, ...baseParams(tiktok) };
    const res = await post("/api/live", body);
    if (!res.success) { hideLoading(); toast(res.message, "err"); return; }
    renderCommentResults(res.data);
  } catch (e) { hideLoading(); toast("请求失败: " + e.message, "err"); }
}

let currentHotData = [];

/* ---------- 抖音热榜 ---------- */
async function runHot() {
  showLoading("正在获取热榜数据...");
  try {
    const res = await post("/api/hot", {});
    if (!res.success) { hideLoading(); toast(res.message, "err"); return; }
    renderHotResults(res.data);
  } catch (e) { hideLoading(); toast("请求失败: " + e.message, "err"); }
}

function renderHotResults(data) {
  hideLoading();
  currentResults = [];
  currentHotData = [];
  selectedIds.clear();
  const cards = $("#cards");
  cards.innerHTML = "";
  if (!data?.length) {
    $("#empty").classList.remove("hidden");
    $("#empty").innerHTML = `<div class="card" style="text-align:center;color:var(--muted)">没有热榜数据</div>`;
    $("#select-bar").classList.add("hidden");
    $("#result-area").classList.add("hidden");
    return;
  }
  $("#empty").classList.add("hidden");
  $("#result-summary").textContent = "抖音实时热榜";
  $("#result-head").classList.remove("hidden");
  $("#save-all-btn").classList.add("hidden");
  $("#export-excel-btn").classList.add("hidden");
  $("#select-bar").classList.add("hidden");
  $("#hot-export-btn").style.display = "";

  data.forEach(board => {
    Object.entries(board).forEach(([name, items]) => {
      (items || []).forEach((item, i) => {
        currentHotData.push({
          board: name,
          rank: i + 1,
          word: item.word || "",
          hot_value: item.hot_value || 0,
          group_id: item.group_id || "",
          word_sub_board: item.word_sub_board || [],
        });
      });

      const el = document.createElement("div");
      el.className = "work-card hot-board";
      let listHtml = "";
      (items || []).forEach((item, i) => {
        const hotValue = item.hot_value ? `<span class="hot-value">${fmt(item.hot_value)}</span>` : "";
        const label = item.word || item.sentence_tag || item.word_sub_board || "";
        const searchUrl = `https://www.douyin.com/search/${encodeURIComponent(label)}`;
        listHtml += `<div class="hot-item"><span class="hot-rank">${i + 1}</span><a class="hot-label" href="${esc(searchUrl)}" target="_blank" rel="noopener">${esc(label)}</a>${hotValue}</div>`;
      });
      el.innerHTML = `
        <div class="body">
          <div class="author" style="font-size:16px;margin-bottom:8px">📋 ${esc(name)}</div>
          ${listHtml || '<div class="meta">暂无数据</div>'}
        </div>`;
      cards.appendChild(el);
    });
  });
}

async function exportHotExcel() {
  if (!currentHotData.length) { toast("请先获取热榜数据", "err"); return; }
  const btn = $("#export-excel-btn");
  btn.disabled = true;
  btn.textContent = "导出中...";
  try {
    const res = await fetch("/api/export-excel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: currentHotData, type: "hot" }),
    });
    if (!res.ok) throw new Error("导出失败");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `抖音热榜_${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`已导出 ${currentHotData.length} 条热榜数据`, "ok");
  } catch (e) {
    toast("导出失败: " + e.message, "err");
  } finally {
    btn.disabled = false;
    btn.textContent = "导出热榜 Excel";
  }
}

/* ---------- 事件绑定 ---------- */
function bindEvents() {
  $("#detail-btn").addEventListener("click", runDetail);
  $("#account-btn").addEventListener("click", runAccount);
  $("#mix-btn").addEventListener("click", runMix);
  $("#comment-btn").addEventListener("click", runComment);
  $("#user-btn").addEventListener("click", runUser);
  $("#live-btn").addEventListener("click", runLive);
  $("#hot-btn").addEventListener("click", runHot);
  $("#hot-export-btn").addEventListener("click", exportHotExcel);

  ["detail-input", "account-input", "mix-input", "comment-input", "user-input", "live-input"].forEach(sel => {
    $(`#${sel}`)?.addEventListener("keydown", e => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        const map = { "detail-input": runDetail, "account-input": runAccount, "mix-input": runMix, "comment-input": runComment, "user-input": runUser, "live-input": runLive };
        map[sel]?.();
      }
    });
  });

  $("#set-apply-btn").addEventListener("click", applyCfg);
  $("#set-save-btn").addEventListener("click", saveCfgFile);
  $("#open-folder-btn").addEventListener("click", openFolder);
  $("#save-all-btn").addEventListener("click", saveAll);
  $("#export-excel-btn").addEventListener("click", exportExcel);
  $("#select-all").addEventListener("change", toggleSelectAll);
  $("#download-selected-btn").addEventListener("click", saveSelected);
}

(() => {
  applyTheme(getTheme());
  bindTabs();
  bindPlatformToggles();
  bindEvents();
  loadEnv();
  $("#theme-toggle").addEventListener("click", toggleTheme);
})();