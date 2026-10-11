# AI 后端

前台部署在 GitHub Pages。Vercel Hobby 单独运行 AI 接口，开启 Fluid Compute。AI 只接受个人访问码，公开阅读不需要登录。

## 本地运行

1. 复制 `.env.example` 为 `.env.local`，填写 DeepSeek 密钥和至少 24 字符的随机 `LOCAL_ACCESS_CODE`。
2. 运行 `npm run dev:api`。API 地址为 `http://127.0.0.1:8796`，Vite 将 `/api` 转发到此端口。
3. 前台设置中填写同一访问码。粘贴书稿仍只保存在当前浏览器。

本地账本在 `server/.runtime/ledger.json`，仅用于一个本地 API 进程。账本格式损坏时停止 AI 请求，不自行清零。预算按北京时间日／月累计。

## 发布后端

新建独立 Vercel Hobby 项目，使用本仓库的 `vercel.json`，开启 Fluid Compute。在 Vercel 环境变量中配置 `DEEPSEEK_API_KEY`、`TOKEN_HASH` 和 Upstash REST 连接参数。`TOKEN_HASH` 是个人访问码的 SHA-256 十六进制摘要。生产环境不使用 `LOCAL_ACCESS_CODE`，没有 Redis 就停止付费请求。

Upstash 选择 Free，不开启自动升级。前台将 API 地址设为该项目生产域名。允许的浏览器来源仅为 `https://henry-18-dot.github.io` 和本机 HTTP。访问码不要放进源代码、导出书籍包、URL 或运行日志。

`data/knowledge.json` 与 `public/books/*.json` 随函数发布。更新书籍时发布同版本前台和后台。只有导出并发布的原创提炼进入问答资料。原始整本书不放进公开目录。

## 接口

请求使用 `POST`，JSON 为 `{bookId, chapterId?, pageId?, revision?, question?, interests?}`，并带 `Authorization: Bearer 个人访问码`。

- `/api/questions` 返回 `{questions}`，围绕当前位置排序并去重。
- `/api/comments` 返回 `{comments,authors}`。Flash 生成 5 个相关角色及 1 个跨领域角色，Pro 隔离上下文匿名评分。明显事实错误和假引语不进入返回结果。热度为 `round(20 + 780 × (0.65×建设性/4 + 0.35×幽默/4)²)`。
- `/api/ask` 返回 SSE：`delta {text}` → `sources {sources:[{bookId,chapterId?,pageId,title}]}` → `done {usage}`。中断返回 `error {message}`，已显示正文保留。
- `/api/health` 使用 GET，只返回是否配置与运行模式，不返回凭据。

默认限制为同时 2 个请求、每分钟 5 次、每日 1 元、每月 10 元。每次模型调用先原子预留高峰费用，正常完成按 usage 对账。连接中断或缺少完整 usage 保留预留额度。网络状态不明时不自动重试。429、500、503 最多重试一次，重新预留费用。401、402 不重试。整个应用请求 90 秒超时。

问题缓存 1 小时，评论缓存 24 小时，问答缓存 1 小时。缓存键含内容版本、兴趣、当前位置和提示词版本。费用使用保守高峰单价，即使低峰也不会放宽预算。

## 环境限制

Vercel Hobby 免费超额会暂停对应功能，通常需等 30 天恢复。暂停 AI 不影响 GitHub Pages 阅读。手机网络可达性需实际检查。角色评分是隔离提示词下的模型判断，虚拟热度不是真实用户点赞数。

参考：[Vercel 流式响应](https://vercel.com/docs/functions/streaming-functions)、[Hobby 额度](https://vercel.com/docs/plans/hobby)、[Upstash Free](https://upstash.com/pricing/redis)、[DeepSeek 人民币价格](https://api-docs.deepseek.com/zh-cn/quick_start/pricing/)。
