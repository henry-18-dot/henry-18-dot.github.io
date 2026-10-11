# TokTok

像刷短视频一样刷书，点开后逐页阅读。公开阅读，实时 AI 使用个人访问码。

## 本机启动

```powershell
npm install
npm run dev:api
# 另开终端
npm run dev
```

浏览器打开 `http://127.0.0.1:8795/TokTok/`。在“我的 → 设置”输入 `.local/个人访问码.txt` 的访问码。本机接口地址留空即可。

`.env.local` 保存服务端配置，不上传。环境字段见 `.env.example`。

## 内容

三本示范的内容包位于 `public/books/`。原书留在电脑书库中。入口索引是 `public/books/book-index.json`。

在“我的 → 导入章节”粘贴 Markdown，预览、修改并保存到本机。导出 BookPackage 后替换相应公开内容包，运行：

```powershell
node scripts/content-validate.mjs
node scripts/build-knowledge.mjs
npm test
npm run build
```

阅读进度、问题和导入内容在当前浏览器保存。换设备时使用阅读备份的导出、恢复入口。

## 发布

`dist/` 放到个人站的 `TokTok/` 子目录。Vercel 单独部署 AI 后端，设置 `TOKEN_HASH`、`DEEPSEEK_API_KEY` 及免费 Redis 环境变量。生产缺预算库时暂停 AI。

填写 `public/runtime-config.json` 的 `apiBase` 后重新构建。后端配置与运行说明见 `docs/backend.md`，给 Side Chat 的提示词见 `docs/Side-Chat提示词.md`。

音频为代码生成的原创器乐循环，源代码在 `src/audio.ts`。无音乐订阅。
