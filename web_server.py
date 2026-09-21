"""DouK-Downloader Web UI 服务器

提供可视化网页，通过浏览器采集 / 下载抖音 / TikTok 数据。

启动方式：
    python web_server.py [--host 127.0.0.1] [--port 8000]
"""
import io
import platform
import re
import subprocess
from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"

from src.application import TikTokDownloader
from src.application.main_terminal import TikTok
from src.interface.template import API

UI_HOST = "127.0.0.1"
UI_PORT = 8080

ILLEGAL_CHARS = re.compile(r'[\\/:*?"<>|\x00-\x1f]')


class DetailRequest(BaseModel):
    """获取单个 / 多个作品数据"""

    url: str = ""
    ids: str = ""
    tiktok: bool = False
    cookie: str = ""
    proxy: str = ""


class AccountRequest(BaseModel):
    """获取账号作品数据"""

    url: str = ""
    sec_user_id: str = ""
    tiktok: bool = False
    tab: str = "post"
    pages: Optional[int] = None
    cursor: int = 0
    count: int = Field(18, ge=1)
    cookie: str = ""
    proxy: str = ""


class MixRequest(BaseModel):
    """获取合集作品数据"""

    url: str = ""
    mix_id: str = ""
    detail_id: str = ""
    tiktok: bool = False
    cookie: str = ""
    proxy: str = ""


class CommentRequest(BaseModel):
    """获取作品评论数据"""

    detail_id: str
    cookie: str = ""
    proxy: str = ""


class UserRequest(BaseModel):
    """获取账号详细资料"""

    url: str = ""
    sec_user_id: str = ""
    tiktok: bool = False
    cookie: str = ""
    proxy: str = ""


class LiveRequest(BaseModel):
    """获取直播拉流地址"""

    url: str = ""
    web_rid: str = ""
    room_id: str = ""
    sec_user_id: str = ""
    tiktok: bool = False
    cookie: str = ""
    proxy: str = ""


class SaveRequest(BaseModel):
    """将作品文件下载到本机文件夹"""

    items: list[dict]
    tiktok: bool = False


class ExportExcelRequest(BaseModel):
    """导出 Excel"""

    items: list[dict]
    type: str = "detail"


class EnvUpdateRequest(BaseModel):
    """更新 settings.json 配置"""

    cookie: Optional[str] = None
    cookie_tiktok: Optional[str] = None
    proxy: Optional[str] = None
    proxy_tiktok: Optional[str] = None
    download: Optional[bool] = None
    folder_name: Optional[str] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    downloader = TikTokDownloader()
    await downloader.__aenter__()
    await downloader.read_config()
    downloader.check_config()
    await downloader.check_settings(False)
    await downloader.parameter.update_params()
    await downloader.database.update_config_data("Disclaimer", 1)
    api = TikTok(
        downloader.parameter,
        downloader.database,
        server_mode=True,
    )
    app.state.downloader = downloader
    app.state.api = api
    print("\n[DouK-Downloader Web UI] 启动成功！")
    print(f"[DouK-Downloader Web UI] 本机访问: http://{UI_HOST}:{UI_PORT}")
    print("[DouK-Downloader Web UI] 文件将保存在本机 Download 文件夹，可在网页中查看路径")
    try:
        yield
    finally:
        downloader.event_cookie.set()
        await downloader.__aexit__(None, None, None)
        print("\n[DouK-Downloader Web UI] 已退出")


app = FastAPI(
    title="DouK-Downloader Web UI",
    lifespan=lifespan,
)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/", response_class=FileResponse)
async def index():
    return STATIC_DIR / "index.html"


def _jsondata(request: Request) -> dict:
    """返回统一格式的响应"""

    def wrapper(data=None, message="", success=True, **extra):
        payload = {"success": success, "message": message, "data": data}
        payload.update({k: v for k, v in extra.items() if v is not None})
        return payload

    return wrapper


def _clean_filename(name: str, default: str = "download") -> str:
    name = ILLEGAL_CHARS.sub("_", str(name)).strip(" ._")
    return name or default


def _resolve_ids(api: TikTok, url: str, tiktok: bool):
    link_obj = api.links_tiktok if tiktok else api.links
    return link_obj.run(url, "detail")


async def _fetch_detail(api: TikTok, ids, tiktok, cookie="", proxy=""):
    root, params, logger = api.record.run(api.parameter)
    async with logger(root, console=api.console, **params) as record:
        return await api._handle_detail(
            ids,
            tiktok,
            record,
            True,
            False,
            cookie,
            proxy,
        )


@app.post("/api/detail")
async def api_detail(extract: DetailRequest, request: Request):
    api = request.app.state.api
    try:
        if extract.ids:
            ids = [i.strip() for i in extract.ids.replace("，", ",").split(",") if i.strip()]
        elif extract.url:
            ids = await _resolve_ids(api, extract.url, extract.tiktok)
        else:
            return _jsondata(request)(success=False, message="请提供作品链接或作品 ID")
        if not ids:
            return _jsondata(request)(success=False, message="链接解析失败，未提取到作品 ID")
        data = await _fetch_detail(
            api,
            ids,
            extract.tiktok,
            extract.cookie,
            extract.proxy,
        )
        if not data:
            return _jsondata(request)(success=False, message="获取作品数据失败，请检查 Cookie / 网络")
        return _jsondata(request)(data=data, message="ok", count=len(data))
    except Exception as e:
        return _jsondata(request)(success=False, message=f"获取作品数据失败: {e}")


@app.post("/api/account")
async def api_account(extract: AccountRequest, request: Request):
    api = request.app.state.api
    try:
        sec_user_id = extract.sec_user_id
        if not sec_user_id:
            if not extract.url:
                return _jsondata(request)(success=False, message="请提供账号主页链接或 sec_user_id")
            link_obj = api.links_tiktok if extract.tiktok else api.links
            sec_ids = await link_obj.run(extract.url, "user")
            sec_user_id = sec_ids[0] if sec_ids else ""
        if not sec_user_id:
            return _jsondata(request)(success=False, message="账号链接解析失败（提取 sec_user_id 失败）")
        data = await api.deal_account_detail(
            0,
            sec_user_id,
            tab=extract.tab,
            pages=extract.pages,
            api=True,
            source=False,
            cookie=extract.cookie,
            proxy=extract.proxy,
            tiktok=extract.tiktok,
            cursor=extract.cursor,
            count=extract.count,
        )
        if not data:
            return _jsondata(request)(success=False, message="获取账号作品失败，请检查 Cookie / 网络")
        return _jsondata(request)(data=data, message="ok", count=len(data))
    except Exception as e:
        return _jsondata(request)(success=False, message=f"获取账号作品失败: {e}")


@app.post("/api/mix")
async def api_mix(extract: MixRequest, request: Request):
    api = request.app.state.api
    try:
        mix_id = extract.mix_id
        detail_id = extract.detail_id
        if not mix_id and not detail_id:
            if extract.url:
                link_obj = api.links_tiktok if extract.tiktok else api.links
                mix_ids = await link_obj.run(extract.url, "detail")
                if mix_ids:
                    detail_id = mix_ids[0]
            if not mix_id and not detail_id:
                return _jsondata(request)(success=False, message="请提供合集链接或 mix_id / detail_id")
        data = await api.deal_mix_detail(
            mix_id=bool(mix_id),
            id_=mix_id or detail_id,
            mark="",
            api=True,
            source=False,
            cookie=extract.cookie,
            proxy=extract.proxy,
            tiktok=extract.tiktok,
        )
        if not data:
            return _jsondata(request)(success=False, message="获取合集作品失败，请检查 Cookie / 网络")
        return _jsondata(request)(data=data, message="ok", count=len(data) if isinstance(data, list) else 1)
    except Exception as e:
        return _jsondata(request)(success=False, message=f"获取合集作品失败: {e}")


@app.post("/api/comment")
async def api_comment(extract: CommentRequest, request: Request):
    api = request.app.state.api
    try:
        if not extract.detail_id:
            return _jsondata(request)(success=False, message="请提供作品 ID")
        data = await api.comment_handle_single(
            detail_id=extract.detail_id,
            cookie=extract.cookie,
            proxy=extract.proxy,
            source=True,
        )
        if not data:
            return _jsondata(request)(success=False, message="获取评论失败，请检查 Cookie / 网络")
        return _jsondata(request)(data=data, message="ok", count=len(data))
    except Exception as e:
        return _jsondata(request)(success=False, message=f"获取评论失败: {e}")


@app.post("/api/user")
async def api_user(extract: UserRequest, request: Request):
    api = request.app.state.api
    try:
        sec_user_id = extract.sec_user_id
        if not sec_user_id:
            if not extract.url:
                return _jsondata(request)(success=False, message="请提供账号主页链接或 sec_user_id")
            link_obj = api.links_tiktok if extract.tiktok else api.links
            sec_ids = await link_obj.run(extract.url, "user")
            sec_user_id = sec_ids[0] if sec_ids else ""
        if not sec_user_id:
            return _jsondata(request)(success=False, message="账号链接解析失败（提取 sec_user_id 失败）")
        data = await api._get_user_data(
            sec_user_id=sec_user_id,
            cookie=extract.cookie,
            proxy=extract.proxy,
        )
        if not data:
            return _jsondata(request)(success=False, message="获取账号详情失败，请检查 Cookie / 网络")
        return _jsondata(request)(data=[data], message="ok", count=1)
    except Exception as e:
        return _jsondata(request)(success=False, message=f"获取账号详情失败: {e}")


@app.post("/api/live")
async def api_live(extract: LiveRequest, request: Request):
    api = request.app.state.api
    try:
        web_rid = extract.web_rid
        room_id = extract.room_id
        if not web_rid and not room_id:
            if extract.url:
                link_obj = api.links_tiktok if extract.tiktok else api.links
                live_ids = await link_obj.run(extract.url, "live")
                if live_ids:
                    web_rid = live_ids[0]
            if not web_rid and not room_id:
                return _jsondata(request)(success=False, message="请提供直播链接或 web_rid / room_id")
        data = await api.get_live_data(
            web_rid=web_rid,
            room_id=room_id,
            sec_user_id=extract.sec_user_id,
            cookie=extract.cookie,
            proxy=extract.proxy,
        )
        if not data:
            return _jsondata(request)(success=False, message="获取直播数据失败，请检查 Cookie / 网络")
        return _jsondata(request)(data=[data], message="ok", count=1)
    except Exception as e:
        return _jsondata(request)(success=False, message=f"获取直播数据失败: {e}")


@app.post("/api/hot")
async def api_hot(request: Request):
    api = request.app.state.api
    try:
        time_str, data = await api._deal_hot_data(source=True)
        if not data:
            return _jsondata(request)(success=False, message="获取热榜数据失败")
        return _jsondata(request)(data=data, message="ok", count=sum(len(v) for d in data for v in d.values()))
    except Exception as e:
        return _jsondata(request)(success=False, message=f"获取热榜数据失败: {e}")


@app.post("/api/save")
async def api_save(extract: SaveRequest, request: Request):
    api = request.app.state.api
    downloader = api.downloader
    try:
        if not extract.items:
            return _jsondata(request)(success=False, message="没有可保存的作品")
        await downloader.run(extract.items, "detail", tiktok=extract.tiktok)
        root = downloader.storage_folder(mode="detail")
        files = []
        for item in extract.items:
            name = downloader.generate_detail_name(item)
            files.append(name)
        return _jsondata(request)(
            data={"root": str(root), "files": files},
            message=f"已保存至: {root}",
        )
    except Exception as e:
        return _jsondata(request)(success=False, message=f"保存作品失败: {e}")


@app.post("/api/export-excel")
async def api_export_excel(extract: ExportExcelRequest, request: Request):
    from openpyxl import Workbook
    from openpyxl.styles import Alignment, Font, PatternFill

    if not extract.items:
        return _jsondata(request)(success=False, message="没有可导出的数据")

    wb = Workbook()
    ws = wb.active
    header_fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
    header_font = Font(color="FFFFFF", bold=True)

    if extract.type == "hot":
        ws.title = "抖音热榜"
        headers = ["榜单", "排名", "热搜词", "热度", "搜索链接"]
        for col, header in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col, value=header)
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal="center")
        for row_idx, item in enumerate(extract.items, 2):
            ws.cell(row=row_idx, column=1, value=item.get("board", ""))
            ws.cell(row=row_idx, column=2, value=item.get("rank", ""))
            ws.cell(row=row_idx, column=3, value=item.get("word", ""))
            ws.cell(row=row_idx, column=4, value=item.get("hot_value", 0))
            word = item.get("word", "")
            ws.cell(row=row_idx, column=5, value=f"https://www.douyin.com/search/{word}" if word else "")
        ws.column_dimensions["A"].width = 15
        ws.column_dimensions["B"].width = 8
        ws.column_dimensions["C"].width = 35
        ws.column_dimensions["D"].width = 12
        ws.column_dimensions["E"].width = 50
        filename = f"抖音热榜_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    else:
        ws.title = "抖音数据"
        headers = ["标题", "作者", "发布时间", "点赞量", "评论量", "收藏量", "转发量", "视频链接", "作品ID"]
        for col, header in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col, value=header)
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal="center")
        for row_idx, item in enumerate(extract.items, 2):
            ws.cell(row=row_idx, column=1, value=item.get("desc", ""))
            ws.cell(row=row_idx, column=2, value=item.get("nickname", ""))
            ws.cell(row=row_idx, column=3, value=item.get("create_time", ""))
            ws.cell(row=row_idx, column=4, value=item.get("digg_count", 0))
            ws.cell(row=row_idx, column=5, value=item.get("comment_count", 0))
            ws.cell(row=row_idx, column=6, value=item.get("collect_count", 0))
            ws.cell(row=row_idx, column=7, value=item.get("share_count", 0))
            aweme_id = item.get("id", "")
            ws.cell(row=row_idx, column=8, value=f"https://www.douyin.com/video/{aweme_id}" if aweme_id else "")
            ws.cell(row=row_idx, column=9, value=aweme_id)
        ws.column_dimensions["A"].width = 40
        ws.column_dimensions["B"].width = 15
        ws.column_dimensions["C"].width = 20
        ws.column_dimensions["D"].width = 10
        ws.column_dimensions["E"].width = 10
        ws.column_dimensions["F"].width = 10
        ws.column_dimensions["G"].width = 10
        ws.column_dimensions["H"].width = 45
        ws.column_dimensions["I"].width = 20
        filename = f"抖音数据_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"

    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)

    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{_urlencode(filename)}"},
    )


@app.get("/api/stream")
async def api_stream(
    url: str,
    name: str = "download",
    tiktok: bool = False,
    kind: str = "",
    request: Request = None,
):
    api = request.app.state.api
    parameter = api.parameter
    client = parameter.client_tiktok if tiktok else parameter.client
    headers = dict(
        parameter.headers_download_tiktok if tiktok else parameter.headers_download
    )
    filename = _clean_filename(name)
    suffix = {"video": "mp4", "image": "jpeg", "cover": "jpeg"}.get(kind, "")
    if suffix:
        filename = f"{filename}.{suffix}"
    content_type = "video/mp4" if suffix == "mp4" else "image/jpeg"

    async def body():
        async with client.stream("GET", url, headers=headers) as response:
            response.raise_for_status()
            async for chunk in response.aiter_bytes(1024 * 256):
                yield chunk

    headers_out = {
        "Content-Disposition": f"attachment; filename*=UTF-8''{_urlencode(filename)}"
    }
    return StreamingResponse(
        body(),
        headers=headers_out,
        media_type=content_type,
    )


def _urlencode(name: str) -> str:
    from urllib.parse import quote

    return quote(name)


@app.get("/api/env")
async def api_env(request: Request):
    downloader = request.app.state.downloader
    api = request.app.state.api
    settings = downloader.settings.read()
    return {
        "success": True,
        "data": {
            "version": f"{downloader.VERSION_MAJOR}.{downloader.VERSION_MINOR}" + ("-beta" if downloader.VERSION_BETA else ""),
            "host": UI_HOST,
            "port": UI_PORT,
            "root": str(downloader.settings.path.parent),
            "download_root": str(api.downloader.storage_folder(mode="detail")),
            "folder_name": settings.get("folder_name", "Download"),
            "cookie_set": bool(settings.get("cookie", "")),
            "cookie_tiktok_set": bool(settings.get("cookie_tiktok", "")),
            "proxy": settings.get("proxy", ""),
            "proxy_tiktok": settings.get("proxy_tiktok", ""),
            "download": bool(settings.get("download", True)),
            "storage_format": settings.get("storage_format", ""),
            "name_format": settings.get("name_format", ""),
            "msToken": API.params.get("msToken", "")[:20] + "..." if API.params.get("msToken") else "",
            "uifid": API.params.get("uifid", "")[:20] + "..." if API.params.get("uifid") else "",
        },
    }


@app.post("/api/env")
async def api_env_update(extract: EnvUpdateRequest, request: Request):
    downloader = request.app.state.downloader
    try:
        settings = downloader.settings.read()
        for key in (
            "cookie",
            "cookie_tiktok",
            "proxy",
            "proxy_tiktok",
            "download",
            "folder_name",
        ):
            value = getattr(extract, key, None)
            if value is not None:
                settings[key] = value
        downloader.settings.update(settings)
        return _jsondata(request)(
            data=None,
            message="配置已保存到 settings.json，重启服务后生效（Cookie / 代理也可在请求中临时传入）",
        )
    except Exception as e:
        return _jsondata(request)(success=False, message=f"保存配置失败: {e}")


@app.post("/api/open-folder")
async def api_open_folder(request: Request):
    payload = await request.json()
    path = payload.get("path", "")
    downloader = request.app.state.downloader
    root = Path(downloader.settings.path.parent).resolve()
    target = Path(path).resolve()
    try:
        target.relative_to(root)
    except ValueError:
        return {"success": False, "message": "路径不在项目目录内，已拒绝打开"}
    if platform.system() == "Windows":
        subprocess.Popen(["explorer", str(target)])
        return {"success": True, "message": "已调用资源管理器打开文件夹"}
    return {"success": True, "message": str(target)}


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="DouK-Downloader Web UI")
    parser.add_argument("--host", default=UI_HOST)
    parser.add_argument("--port", type=int, default=UI_PORT)
    args = parser.parse_args()

    import uvicorn

    uvicorn.run(app, host=args.host, port=args.port, log_level="info")