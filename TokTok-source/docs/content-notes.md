# 三本示范内容

内容包位于 `public/books/`。书 ID 为 `greatness`、`human-condition`、`solitude`，版本为 `2026-10-11-v1`。正文是基于本机材料写出的原创提炼，保留原文行号便于对照。

| 内容包 | 章数 | 正文卡 | 问题 |
| --- | ---: | ---: | ---: |
| greatness | 11 | 33 | 141 |
| human-condition | 6 | 45 | 162 |
| solitude | 20 | 60 | 249 |
| 合计 | 37 | 138 | 552 |

另有 9 张历史评价、18 条 AI 角色评论，知识库包含 187 条记录。《人的境况》的 45 个小节各有一张正文卡。

## 章节与版本

| 书 | 本机版本 | 正文结构 |
| --- | --- | --- |
| 为什么伟大不能被计划 | 肯尼斯·斯坦利、乔尔·雷曼著，彭相珍译，中译出版社，2023 年 | 11 章；作者序言、万维钢推荐序及前言不计为正文 |
| 人的境况 | 汉娜·阿伦特著，王寅丽译，上海人民出版社，2021 年 | 6 大章、连续编号 1–45 节；导言、序言、索引、重订后记不计为正文 |
| 百年孤独 | 加西亚·马尔克斯著，范晔译，南海出版公司，2011 年 | 20 个无标题章节；以正文分隔线还原，排除末尾募捐页、制作说明及目录 |

《为什么伟大不能被计划》分别保留机制、实验与社会应用，第 10、11 章保留案例研究身份。《人的境况》固定劳动、工作、行动等术语，各小节映射到其第一张正文卡。《百年孤独》沿用译本人物名字，以独立实体 ID 区分重复名字；目录章名仍为“第 n 章”，卡片标题为编辑题名。

人物链接写为 `[姓名](entity:实体ID)`。小说的关系图和人物引用限定到当前章已出现的人物。历史评价与角色评论分别存储，角色评论的 `ai` 字段始终为 `true`。

## 评价来源

- 探索书：本机中文版推荐序中的万维钢评论，以及 [Springer 原版出版页](https://link.springer.com/book/10.1007/978-3-319-15524-1)收录的评论。英文评价以中文转述呈现。
- 政治哲学：Mary McCarthy 的 [1958 年书评](https://www.newyorker.com/magazine/1958/10/18/1958-10-18-198-tny-cards-000059912)，本机 Margaret Canovan 导言和 Danielle Allen 序言。[芝加哥大学出版社](https://press.uchicago.edu/ucp/books/book/chicago/H/bo29137972.html)列出相应版本与作者。
- 小说：RAE 纪念版中的 [Álvaro Mutis](https://www.rae.es/sites/default/files/Alvaro_Mutis_Lo_que_se_de_Gabriel.pdf)、[Carlos Fuentes](https://www.rae.es/sites/default/files/Carlos_Fuentes_Homenaje_Para_darle_nombre_a_America_2.pdf)、[Mario Vargas Llosa](https://www.rae.es/sites/default/files/Mario_Vargas_Llosa_Cien_anos_de_soledad._Realidad_total_novela_total.pdf)原文。[RAE 出版说明](https://www.rae.es/noticia/conversacion-sobre-cien-anos-de-soledad-de-gabriel-garcia-marquez)列出文章，官方资料 PDF 提供对应摘录。

## 重建入口

在项目根目录运行：

```powershell
node scripts/content-validate.mjs
node scripts/build-knowledge.mjs
```

第一条检查章节、小节、问题、链接与来源行号。第二条生成 `data/knowledge.json` 和 `public/books/book-index.json`。索引中的 `file` 相对站点根路径，前台加载时加上部署的 `BASE_URL`。

知识库结构为 `{revision, records}`，记录包含 `bookId`、`chapterId`、`pageId`、`title`、`text`、`tags`、`source`、`entityIds`。收录全书概览、章节概述、历史评价和正文提炼，不收录原书正文、角色评论及电子书制作页。

角色评论初稿的两项分数和虚拟点赞数均为 0；真实 AI 评分由评分脚本写回，内容生成脚本不把本地估计冒充评分结果。
