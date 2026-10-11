"""Build the first editable reading package from original editorial content.

Source: local Chinese book, original English edition published in 2015.
Run: python scripts/content-greatness.build.py
Only writes public/books/greatness.json.
"""

import json
import re
import runpy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REVISION = "2026-10-11-v1"


def question(identifier, text, kind, entities):
    return {"id": identifier, "text": text, "kind": kind, "entityIds": entities}


def page(chapter_number, page_number, title, markdown, layout, entities, questions, lines):
    identifier = f"greatness-c{chapter_number:02d}-p{page_number:02d}"
    return {
        "id": identifier,
        "title": title,
        "markdown": markdown.strip(),
        "layout": layout,
        "entityIds": entities,
        "questions": [question(f"{identifier}-q{index:02d}", *item) for index, item in enumerate(questions, 1)],
        "source": {"label": f"《为什么伟大不能被计划》第 {chapter_number} 章", "startLine": lines[0], "endLine": lines[1]},
    }


def chapter(number, title, overview, pages, questions):
    identifier = f"greatness-c{number:02d}"
    return {
        "id": identifier,
        "number": number,
        "title": title,
        "overview": overview,
        "pages": pages,
        "questions": [question(f"{identifier}-reflect{index:02d}", *item) for index, item in enumerate(questions, 1)],
    }


LAST_CHAPTERS = [
    chapter(
        9,
        "第九章 彻底告别对目标的幻想",
        "前八章留下一个生活问题：没有远大目标，该怎样决定下一步？本章先保留图纸、食谱等路线清楚的目标，再把未知领域交给兴趣、经验和当下可用的能力。判断一个发现的价值，要看它能否打开新的探索，而不用急着证明它通往哪一个终点。个人的转向与社会的分歧，也因此有了不同的意义。",
        [
            page(9, 1, "哪些目标仍然好用", """
房屋按图纸施工，程序满足既定规范，晚餐照着食谱做。这些工作可以把目标写得很清楚，因为手里已有办法把要求转成行动。第九章特意保留了这类目标，讨论的焦点落在路线尚未出现的探索上。

如果想发现一种新理论，或创造一种从未见过的机器，困难就变了。你能描述期待的结果，却不知道下一步需要哪种知识。此时把每次尝试都按“更像最终成品了吗”来打分，可能提前丢掉必要的踏脚石。远大愿望可以存在，问题在于它是否被拿来裁剪每一步。

| 手里的任务 | 有用的判断 |
| --- | --- |
| 按已知规范完成产品 | 是否达到明确要求 |
| 探索陌生的技术路线 | 是否获得新的能力和线索 |
| 把发现接入实际产品 | 是否满足使用条件 |

同一个项目可以在这些状态之间切换。认识到路线已成熟后，目标会重新变得有用。书里的建议要求你判断自己站在哪里，无法靠一句“放弃目标”替你做完判断。
""", "comparison", ["goals", "stepping-stones", "objective-deception"], [
                ("机械设计中，满足图纸要求和探索新机构各应怎样评价进展？", "应用", ["goals", "stepping-stones"]),
                ("怎样识别一个远大目标已经进入可执行的范围？", "理解", ["goals", "search-space"]),
                ("如果目标可以随发现调整，还会出现本书说的目标欺骗吗？", "反驳", ["objective-deception", "goals"]),
            ], (4160, 4243)),
            page(9, 2, "兴趣需要知识作底", """
沿着一条未知河流找到古物，既有偶然，也有主动探索的功劳。出发时没有指定要找到哪件文物，沿途仍需辨认线索、检查地形、投入时间。寻宝者放下的是对最后收获的预言，工作本身并没有消失。

新奇性搜索让机器人尝试不同的行为，人则能利用已有的经验判断什么值得继续。你觉得某个问题有趣，可能因为它与熟悉的难题相连，也可能因为一个看似简单的变化带来了新的能力。这个感觉包含知识和经验，不能直接等同于追逐刺激。

本章借《我的世界》说明这种就近寻找的过程。马库斯·泊松把已有游戏中的建造、模拟与方块世界等想法重新组合，做出一个可实际游玩的新方向。作者看重的是当时已经能够迈出的那一步。由成功回看，组合关系显得清楚，当时的结果却无法提前保证。

个人也可以这样选择：先做一个能摸到结果的小探索，看看它长出什么。兴趣会改变，死胡同也会出现。保留作品、技能与发现的联系，才有东西支持下一次转向。
""", "prose", ["serendipity", "novelty", "stepping-stones", "innovation"], [
                ("怎样区分有探索价值的兴趣和只提供即时刺激的兴趣？", "比较", ["novelty", "serendipity"]),
                ("《我的世界》的组合创新与预先规划一款爆款游戏有什么差别？", "理解", ["innovation", "stepping-stones"]),
                ("一个课程项目偏离最初题目后，怎样判断新路线值得继续？", "应用", ["stepping-stones", "goals"]),
            ], (4244, 4420)),
            page(9, 3, "留住分支的价值", """
一块踏脚石的价值，可以表现为它让后来的项目变得可做。写过的小工具、收集过的异常数据、在另一门课里学到的方法，都可能让你问出原来问不出的新问题。仅看当前成品够不够漂亮，很容易漏掉这种作用。

把这点放到整个社会，探索便需要许多方向同时存在。在 Picbreeder 上，假如所有人都只培育蝴蝶，其他图像分支会迅速消失。偏偏后来通向蝴蝶的路径，也可能经过一张眼下毫不像蝴蝶的图。不同用户保留不同偏好，才使共享的图像库拥有更大的后续空间。

作者因此主张给分歧留位置。别人无法看见某条路线的意义，并不足以说明那条路线毫无价值。它也可能尚未连接到大家熟悉的问题，或者最终带来一种完全不同的收获。

这种判断要面对资源有限的现实。一个方向若始终没有留下可复用的东西，也没有打开新问题，就有理由重新审视投入。把“还能接出什么”作为一项评价，能让偏离计划的工作获得解释，同时也让探索有可讨论的依据。
""", "concept", ["stepping-stones", "diversity", "picbreeder", "innovation"], [
                ("怎样衡量一个项目产生后续项目的能力，而不重新制造单一指标？", "应用", ["stepping-stones", "goals"]),
                ("多人探索同一个问题时，为什么保持分歧可能扩大共同收获？", "理解", ["diversity", "search-space"]),
                ("资金有限时，该在保留新方向和停止死胡同之间怎样取舍？", "反驳", ["innovation", "stepping-stones"]),
            ], (4421, 4511)),
        ],
        [
            ("你目前哪个目标已有清楚路线，哪个目标仍缺少关键踏脚石？", "应用", ["goals", "stepping-stones"]),
            ("过去一次看似绕路的经历，具体留下了什么可复用的能力？", "应用", ["serendipity", "stepping-stones"]),
            ("兴趣能成为选择的依据，但谁应承担探索失败的代价？", "反驳", ["innovation", "diversity"]),
        ],
    ),
    chapter(
        10,
        "第十章 案例研究1：重新诠释自然进化",
        "自然进化没有预先指定人类这个终点，仍产生了丰富的生命形态。本章把生存和繁殖视为约束，关注新生态位、遗传漂变和旧结构的新用途。作者借这一视角设计新奇性搜索的变体。理解这次抽象的用途，也要区分真实生物机制、假想行星和计算机算法各自在解释什么。",
        [
            page(10, 1, "生命没有统一终点", """
复制会保留已有的生命特征，变异又使后代略有不同。自然选择改变不同变体留下后代的机会。如此代代延续，能产生复杂的适应，却无须预先知道将来会出现什么物种。

把人类摆到进化树最高处，会误读这棵树。分支各自在不同环境中延续，人类并非所有生命共同奔向的终点。繁殖数量也不能把细菌、猫和人排进一张全局成绩表。生物学中的适合度依赖环境与比较条件，单看谁产仔多，解释不了整个生命世界。

本章选择另一种抽象：把能否继续生存和繁殖看作留下谱系的约束，然后询问满足约束的不同生活方式如何出现。作者关心的是生命的创造性，所以把视线移向分支的积累。

| 问法 | 看见的内容 |
| --- | --- |
| 谁在某个环境中更适应 | 变体之间的选择差异 |
| 新生活方式怎样出现 | 新结构、新生态位与历史机会 |

这两种问题可以同时研究。承认自然选择的作用，也可以继续问：哪些变化打开了以前不存在的可能性？选择对已有差异的筛选，与差异如何产生，分别需要解释。
""", "comparison", ["natural-evolution", "diversity", "search-space"], [
                ("为什么不能用后代数量给细菌、猫和人排一个进化总榜？", "理解", ["natural-evolution"]),
                ("把繁殖看作最低约束，与研究自然选择的适合度有什么差别？", "比较", ["natural-evolution", "goals"]),
                ("一个搜索算法只要求候选方案存活，会失去哪类生物学信息？", "反驳", ["natural-evolution", "search-space"]),
            ], (4512, 4808)),
            page(10, 2, "新用途打开新生态位", """
一种生物开始利用以前吃不了的食物，就可能进入新的生态位，减少与原有对手的直接竞争。新生态位还能支持其他生态位：植物提供食物，食草动物留下排泄物，排泄物又成了某些昆虫的资源。后来的生活方式依靠前面已经存在的条件。

```mermaid
flowchart LR
  A[植物资源] --> B[食草动物]
  B --> C[排泄物]
  C --> D[利用粪便的昆虫]
```

机会还来自旧结构的新用途。书里以羽毛为例：一种原来承担保温等作用的结构，可以在后来的演化中参与飞行。作者用“扩展适应”描述这种功能转用。一个结构能够成为踏脚石，并不要求它一开始就朝最后的用途发展。

遗传漂变则说明，遗传变化的命运也会受到随机抽样影响。作者特别关注那些没有立即带来明显优势或劣势的变化，因为它们也可能留存并与后来的变化连接。漂变与选择各有适用的解释，不能把所有变化都归给同一种力量。

这些机制让生命史拥有许多支路。研究哪条支路后来打开了新可能性，要看当时的环境和结构，单凭今天的成果倒推“它早就为了这个用途”会漏掉历史。
""", "relations", ["natural-evolution", "stepping-stones", "serendipity", "diversity"], [
                ("羽毛的功能转用，为什么与 Picbreeder 中眼睛变成车轮相似？", "比较", ["natural-evolution", "picbreeder", "stepping-stones"]),
                ("新生态位如何为别的物种继续创造生态位？", "理解", ["natural-evolution", "diversity"]),
                ("遗传漂变和自然选择各怎样改变一个变体留下来的机会？", "背景", ["natural-evolution", "serendipity"]),
            ], (4851, 4950)),
            page(10, 3, "把解释变成搜索方法", """
假想的“和谐之星”能容纳每一种变体，连无法自行繁殖的生物也会获得帮助。作者用它追问：如果筛选不再剪掉分支，哪些可能性会多出来？这个行星刻意移除了有限资源的难题，用来分离筛选与创造两个作用。

回到算法，作者设计了最低标准新奇性搜索。候选行为先满足一个最低条件，满足之后便按新奇程度继续探索。书中报告，这种变体解决了原先新奇性搜索也遇到困难的迷宫。最低门槛限制了明显无效的区域，又让多种不同路径有机会保留。

另一种变体加入局部竞争。某个候选只与邻近的行为比较，不需要参加所有方案共同争一个冠军的比赛。这样可以在不同区域保留表现较好的代表，兼顾局部改进与整体多样性。书中展示的虚拟生物实验属于这种计算机探索。

自然界里的选择和竞争远比门槛判断复杂。这次抽象的成果，是给算法提供可测试的新结构。它让我们比较两种资源分配：把资源集中给统一排行榜的领先者，或在许多不同区域维持能继续发展的代表。
""", "concept", ["natural-evolution", "novelty", "diversity", "quality-diversity"], [
                ("最低标准新奇性搜索怎样避免把资源花在始终无效的行为上？", "理解", ["novelty", "search-space"]),
                ("局部竞争为何比全局冠军制更容易保留不同的行为？", "比较", ["diversity", "quality-diversity"]),
                ("“和谐之星”移除了哪些现实条件，这会怎样限制它的解释？", "反驳", ["natural-evolution", "diversity"]),
            ], (4809, 5259)),
        ],
        [
            ("机器人探索中，哪些条件该设为硬门槛，哪些表现该保留为局部比较？", "应用", ["novelty", "quality-diversity"]),
            ("一个结构今天的新用途，能否说明它最初就是为此形成的？", "反驳", ["natural-evolution", "stepping-stones"]),
            ("生物进化的抽象解释转成算法后，应该用什么实验检验它的价值？", "应用", ["natural-evolution", "novelty"]),
        ],
    ),
    chapter(
        11,
        "第十一章 案例研究2：目标和人工智能领域的探索",
        "人工智能研究既设计搜索算法，也在搜索新的算法。本章把这种嵌套称为元搜索，追问基准成绩和理论保证能否单独决定未来的路线。当前问题的解法选择，与新思想的探索有不同需求。作者最后设想一种评审方式，让专家具体讨论新方法为何能成为后续工作的踏脚石。",
        [
            page(11, 1, "选工具与找新路线", """
机器学习算法搜索参数，研究者又在搜索更好的算法。书里把第二层叫作元搜索。一个算法在眼前任务上表现出色，能帮人选工具，但它是否能继续衍生新方法，还需要另一层判断。

本章虚构了“老靠谱”和“超自然”两种算法。后者很新颖，在标准任务上却差了百分之五。如果因此拒绝它，其他研究者可能连这种方法都见不到，更无法尝试它附近尚未探索的变化。眼下的差距变成了限制未来路线的门槛。

| 要做的事 | 比较所回答的问题 |
| --- | --- |
| 解决当前部署需求 | 哪种现有方法更适合实际条件 |
| 探索新算法 | 这个构造打开了哪些新问题 |

本章以发条玩具和人形机器人赛跑说明差别。玩具更快，并不能决定人形机器人的研究价值。它可能具有尚未成熟的适应能力，值得在相应任务中研究。

基准测试仍能揭示当前能力和代价。问题发生在评审只问有没有赢，却没有讨论新方法提供了什么不同的结构。部署可优先选择可靠方案，探索可以同时给尚不占优的路线留位置。
""", "comparison", ["artificial-intelligence", "search-space", "stepping-stones", "objective-deception"], [
                ("搜索控制参数和搜索新的控制算法，分别处在哪一层？", "理解", ["artificial-intelligence", "search-space"]),
                ("一个新算法差百分之五，应怎样分别判断部署价值和研究价值？", "应用", ["artificial-intelligence", "stepping-stones"]),
                ("如果不以赢过基准为必要条件，怎样防止研究只剩新颖的包装？", "反驳", ["novelty", "artificial-intelligence"]),
            ], (5260, 5744)),
            page(11, 2, "定理保证了哪一层", """
假设一个定理证明：某算法在指定条件下能较快得到可接受的结果。这个保证有明确意义，使用者可以核对条件，决定方法是否适合自己的任务。作者质疑的焦点，是另一个接在后面的推断：有更多保证的算法，一定更值得沿着它探索未来。

这一步已经越出了原来的定理。关于当前算法的证明，通常没有同时证明它会催生更有潜力的新算法。后续变化甚至可能打破原来的假设，走入另一个需要重新研究的区域。

因此，“定理派启发式方法”这个名称包含两个层次。定理在它的前提内提供保证，把有保证的算法优先选作下一块踏脚石，却仍是一种选择路线的经验判断。可靠的数学结论，不会自动替整门学科画好未来地图。

如果所有研究都要求继承同一组假设，探索会在这组假设内部越来越细，也可能让打破假设的新方向长期得不到关注。书里的建议是同时讨论证明本身的内容与新构造的潜力。理论工作可以成为重要发现，但“有证明”也需要说明证明了什么，以及这一结果为什么能帮助后续研究。
""", "concept", ["artificial-intelligence", "stepping-stones", "goals", "search-space"], [
                ("关于单个算法的收敛保证，为什么不能直接保证它会带来更好的后续算法？", "理解", ["artificial-intelligence", "stepping-stones"]),
                ("控制方法改变原定理的假设后，原来的保证还能怎样使用？", "应用", ["artificial-intelligence"]),
                ("在资源有限时，优先研究理论较完整的方法会有哪些收益和机会成本？", "比较", ["search-space", "stepping-stones"]),
            ], (5745, 5894)),
            page(11, 3, "评审需要讨论思想", """
同行评审决定哪些想法能进入共同的知识库。编辑邀请专家检查论文，作者修改，再接受或被拒。这个过程既帮助纠错，也会改变整个学科能看到的踏脚石。评审标准因而会影响后续探索。

书里设想一本《人工智能发现期刊》。作者可以报告实验和定理，但审稿人不能仅用成绩较差或缺少理论保证来否定论文。他们必须解释新想法的核心，讨论它是否优雅、是否改变已有问题的问法、能否引出别的算法。

这是一个迫使专家重新判断的思想实验。分数容易比较，理解一种陌生构造更费力。把评语写成“你还没赢”，可能掩盖评审并未说明为何这条路线没有继续研究的价值。

面向实际研究，可以把问题问得更具体：新方法保留了哪些旧能力？增加了什么操作？哪里出现了反常结果？别人拿到它后能做哪一种原来做不了的实验？这样讨论，数据仍然有用，数据与主张的联系也必须说清。

本书初版发表于二〇一五年，章中对人工智能阶段的描述属于当时背景。今天读它，可继续用这组问题检查研究选择，具体方法的能力则应按当前任务来比较。
""", "prose", ["artificial-intelligence", "innovation", "stepping-stones", "diversity"], [
                ("《人工智能发现期刊》的评审设想最想改变哪一种判断习惯？", "理解", ["artificial-intelligence", "innovation"]),
                ("怎样为一个尚未赢过基准的新方法写出有内容的研究价值说明？", "应用", ["stepping-stones", "artificial-intelligence"]),
                ("只谈思想潜力的评审，可能产生哪些新的偏见与纠错难题？", "反驳", ["innovation", "diversity"]),
            ], (5895, 6102)),
        ],
        [
            ("你正在用的评分指标，是判断当前工具，还是在替未来路线做决定？", "应用", ["goals", "artificial-intelligence"]),
            ("一个方法让你想到新的方法，这种价值应怎样公开说明和检查？", "应用", ["stepping-stones", "innovation"]),
            ("怎样同时保护科学的纠错能力与新思想的生存空间？", "反驳", ["innovation", "diversity"]),
        ],
    ),
]

AUTHORS = [
    {"id": "stanley", "name": "肯尼斯·斯坦利", "bio": "人工智能研究者，研究神经进化、开放式探索与新奇性搜索。", "initial": "斯", "color": "#2dc1b0", "tags": ["人工智能", "开放式探索"]},
    {"id": "lehman", "name": "乔尔·雷曼", "bio": "人工智能研究者，与斯坦利共同提出新奇性搜索，合著本书。", "initial": "雷", "color": "#68a89f", "tags": ["新奇性搜索", "神经进化"]},
    {"id": "arendt", "name": "汉娜·阿伦特", "years": "1906–1975", "bio": "政治思想家，著有《人的境况》，研究行动、公共世界与政治判断。", "initial": "阿", "color": "#9b8470", "tags": ["政治思想", "行动"]},
    {"id": "marquez", "name": "加西亚·马尔克斯", "years": "1927–2014", "bio": "哥伦比亚作家，著有《百年孤独》，一九八二年获诺贝尔文学奖。", "initial": "马", "color": "#c5a953", "tags": ["小说", "拉丁美洲"]},
    {"id": "borges", "name": "豪尔赫·路易斯·博尔赫斯", "years": "1899–1986", "bio": "阿根廷作家，以迷宫、无限、图书馆与虚构文本为小说主题。", "initial": "博", "color": "#8975af", "tags": ["迷宫", "短篇小说"]},
    {"id": "nietzsche", "name": "弗里德里希·尼采", "years": "1844–1900", "bio": "德国哲学家，研究价值、道德与文化，著有《查拉图斯特拉如是说》。", "initial": "尼", "color": "#b07867", "tags": ["哲学", "价值"]},
    {"id": "montaigne", "name": "米歇尔·德·蒙田", "years": "1533–1592", "bio": "法国作家与思想家，以《随笔集》探索经验、判断和自我。", "initial": "蒙", "color": "#789282", "tags": ["随笔", "经验"]},
    {"id": "wangweigan", "name": "万维钢", "bio": "科学作家，撰写本书中文版推荐序。", "initial": "万", "color": "#5c9e98", "tags": ["科学写作", "创新"]},
    {"id": "papadimitriou", "name": "克里斯托斯·帕帕迪米特里乌", "bio": "理论计算机科学家，《Logicomix》合著者，出版社收录其对本书的评价。", "initial": "帕", "color": "#9ca873", "tags": ["计算理论", "科学写作"]},
    {"id": "bongard", "name": "乔什·邦加德", "bio": "研究进化机器人与具身智能的科学家，出版社收录其对本书的评价。", "initial": "邦", "color": "#719ba9", "tags": ["机器人", "人工智能"]},
]

REVIEWS = [
    {
        "id": "greatness-review01", "authorId": "wangweigan", "title": "有路可追，还是已到无人区？",
        "markdown": "万维钢在二〇二三年四月的中文版推荐序中，把本书放到创新政策与个人成长的问题里读。他关心一个区别：已有成果可以追赶时，目标和资源集中能加速前进，进入无人区后，下一块踏脚石却很难预先指定。\n\n他借机器人行走、技术转用等例子讨论新奇性搜索，也提醒宽松探索需要时间与资源。他对本书的推荐，落在给分歧和新方向留下空间，减少无谓考核。\n\n读这篇序言，可以继续追问：[目标](entity:goals)什么时候帮助落实，什么时候开始过早筛掉[创新](entity:innovation)？",
        "source": {"label": "万维钢，中文版推荐序，2023 年 4 月；本地原书", "startLine": 74, "endLine": 279},
        "entityIds": ["wangweigan", "goals", "innovation", "novelty"],
        "questions": [
            question("greatness-review01-q01", "追赶已知技术和探索技术无人区，为什么需要不同的组织方式？", "比较", ["goals", "innovation"]),
            question("greatness-review01-q02", "减少考核之后，怎样让科研探索仍然留下可复用的成果？", "应用", ["innovation", "stepping-stones"]),
            question("greatness-review01-q03", "如果缺少时间和资源，个人该怎样为兴趣探索留出空间？", "应用", ["serendipity", "goals"]),
        ],
    },
    {
        "id": "greatness-review02", "authorId": "papadimitriou", "title": "拿起一本书，未必先有终点",
        "markdown": "帕帕迪米特里乌的评价从阅读动机出发。人拿起一本书，未必已经设定清楚的收益，也可能只是觉得它会改变自己看世界的方式。他认为作者对这种开放动机的理解可能有道理。\n\n这个角度也适合打开本书：先看看一个关于[搜索空间](entity:search-space)的想法，能让你重新提出什么问题。",
        "source": {"label": "Springer 出版社书页，Christos Papadimitriou 评介", "url": "https://link.springer.com/book/10.1007/978-3-319-15524-1"},
        "entityIds": ["papadimitriou", "goals", "search-space"],
        "questions": [
            question("greatness-review02-q01", "阅读时没有明确目标，会怎样改变你发现有趣问题的机会？", "应用", ["goals", "serendipity"]),
            question("greatness-review02-q02", "带着问题读书与只按预定结论筛选内容，有什么差别？", "比较", ["goals", "objective-deception"]),
            question("greatness-review02-q03", "一本书改变视角的价值，怎样在具体行动中体现？", "应用", ["stepping-stones"]),
        ],
    },
    {
        "id": "greatness-review03", "authorId": "bongard", "title": "机器实验，也能照见人的习惯",
        "markdown": "乔什·邦加德看重本书把智能机器研究与人的生活联系起来。他认为，两位作者揭示了创造智能机器时的一种明显偏见，并发现这种偏见也在社会的许多方面发挥作用。\n\n这条评价提供一条阅读线索：在看机器人和[新奇性搜索](entity:novelty)时，同时留意我们如何判断人的探索与成就。",
        "source": {"label": "Springer 出版社书页，Josh Bongard 评介", "url": "https://link.springer.com/book/10.1007/978-3-319-15524-1"},
        "entityIds": ["bongard", "artificial-intelligence", "novelty", "innovation"],
        "questions": [
            question("greatness-review03-q01", "机器人实验中的目标偏见，怎样转成教育评价中的具体问题？", "比较", ["novelty", "education", "goals"]),
            question("greatness-review03-q02", "把计算机搜索的结果推广到个人生活，需要补上哪些条件？", "反驳", ["artificial-intelligence", "serendipity"]),
            question("greatness-review03-q03", "你会如何设计一个允许出现意外结果的机器人学习实验？", "应用", ["novelty", "artificial-intelligence"]),
        ],
    },
]

ENTITIES = [
    {"id": "goals", "name": "目标", "kind": "concept", "description": "用于指定想要实现的结果。路线清楚时可指导执行，未知探索中还需检查它会筛掉哪些路径。", "aliases": ["目标导向"], "question": "目标在什么条件下能可靠地指导下一步？"},
    {"id": "novelty", "name": "新奇性搜索", "kind": "concept", "description": "按行为与以往行为的差异选择候选，探索尚未覆盖的区域，不直接按距离最终任务有多近来筛选。", "aliases": ["新奇性", "新奇"], "question": "新奇性怎样定义，才会带来有用的行为差异？"},
    {"id": "stepping-stones", "name": "踏脚石", "kind": "concept", "description": "让后续发现成为可能的中间成果。它可能与最后的成果外观不同，价值体现在可接出的能力和路径。", "aliases": ["踏脚石原则", "踏脚石链"], "question": "怎样判断一个当前结果能成为后续工作的踏脚石？"},
    {"id": "picbreeder", "name": "Picbreeder", "kind": "concept", "description": "书中的交互式图像演化系统。用户挑选感兴趣的图像、产生变化，也能接着他人保存的图像继续探索。", "aliases": ["图片孵化器", "图片孵化器网站"], "question": "共享图像分支为什么能让单个人找不到的图像出现？"},
    {"id": "objective-deception", "name": "目标欺骗", "kind": "concept", "description": "当前更接近目标的方案未必通向最终结果，必要的中间步骤反而可能暂时得分更差。", "aliases": ["目标的欺骗性", "欺骗性", "失灵的指南针"], "question": "目标得分上升，为什么可能把搜索带进死胡同？"},
    {"id": "education", "name": "教育", "kind": "concept", "description": "本书关注统一标准如何影响教师创新、学生兴趣和可保留的学习路径，并提出更重视专业判断的设想。", "aliases": ["标准化考试", "教育评价"], "question": "怎样保留共同的学习基础，又不给每个学生规定同一条路径？"},
    {"id": "innovation", "name": "创新", "kind": "concept", "description": "借已有知识、工具和发现打开新可能性。本书讨论研究资助和评审怎样影响新路线能否留下来。", "aliases": ["科研创新", "科研资助", "同行评审"], "question": "哪些评价会帮助新想法生长，哪些会过早剪掉分支？"},
    {"id": "natural-evolution", "name": "自然进化", "kind": "concept", "description": "遗传、变异、选择和漂变等机制共同改变生物谱系。第十章从开放探索的角度讨论生命多样性。", "aliases": ["进化", "自然选择", "生态位", "扩展适应", "遗传漂变"], "question": "进化的多样性怎样帮助我们理解开放式搜索？"},
    {"id": "artificial-intelligence", "name": "人工智能", "kind": "concept", "description": "本书由人工智能搜索实验出发，第十一章进一步讨论研究者如何选择值得继续探索的算法。", "aliases": ["AI", "元搜索", "人工智能研究"], "question": "选择当前最好用的算法，与发现未来的新算法有什么差别？"},
    {"id": "search-space", "name": "搜索空间", "kind": "concept", "description": "所有候选方案组成的空间。一次修改能到达哪些邻近方案，决定探索路径有哪些可能。", "aliases": ["可能性空间", "大房间"], "question": "搜索空间的邻接关系怎样影响目标是否会误导探索？"},
    {"id": "serendipity", "name": "意外发现", "kind": "concept", "description": "探索中出现的未预定收获，能否认出并利用它，依赖已有知识、经验和持续行动。", "aliases": ["偶然性", "偶然发现", "趣味性"], "question": "意外出现之后，什么使人有能力看出它的价值？"},
    {"id": "diversity", "name": "多样性", "kind": "concept", "description": "同时保留不同的候选、偏好与路径，使后来探索拥有更多可接入的中间成果。", "aliases": ["分歧", "局部竞争"], "question": "有限资源下，应怎样保留真正不同的探索方向？"},
    {"id": "quality-diversity", "name": "质量多样性", "kind": "concept", "description": "在不同的行为区域保留较好的代表，兼顾局部改进与整体多样性。可与书中的局部竞争新奇性搜索比较。", "aliases": ["最低标准新奇性搜索", "局部竞争新奇性搜索"], "question": "保持不同的好方案，与只保留一个全局最优有什么差别？"},
    {"id": "reinforcement-learning", "name": "强化学习", "kind": "concept", "description": "智能体通过与环境交互学习行为，通常使用奖励反馈。可用来讨论任务奖励和行为探索的关系。", "aliases": ["奖励函数"], "question": "奖励函数怎样影响机器人愿意尝试哪些行为？"},
    {"id": "neural-networks", "name": "神经网络", "kind": "concept", "description": "由连接与参数构成的计算模型，书中的图像编码与机器人控制实验利用了可演化的网络结构。", "aliases": ["神经进化", "CPPN"], "question": "网络的表示方式怎样影响哪些变化容易被搜索到？"},
    {"id": "book", "name": "为什么伟大不能被计划", "kind": "book", "description": "肯尼斯·斯坦利与乔尔·雷曼合著，借新奇性搜索讨论未知探索、创新与目标评价。英文初版发表于二〇一五年。", "bookId": "greatness", "aliases": ["目标神话"], "question": "本书反对目标的论证，在哪些工作里适用？"},
]

for author in AUTHORS:
    ENTITIES.append({"id": author["id"], "name": author["name"], "kind": "author", "description": author["bio"], "authorId": author["id"]})

COMMENTS = [
    {"id": "greatness-comment01", "authorId": "stanley", "body": "只保存分数最高的机器人，可能把第一次敢踢腿的那个删掉。先看它学会了什么，再看它今天摔得多难看。", "constructive": 0, "mischief": 0, "likes": 0, "ai": True},
    {"id": "greatness-comment02", "authorId": "lehman", "body": "给“新奇”打分前，我想先问：你到底在比较轨迹、姿态，还是一句听起来很新的自我介绍？行为描述选错了，求新也会原地绕圈。", "constructive": 0, "mischief": 0, "likes": 0, "ai": True},
    {"id": "greatness-comment03", "authorId": "arendt", "body": "行动常常开启自己无法控制的后果。若把每一步都交给预定结果裁决，还能给新的开端留下多少空间？公共判断也不能只剩计分。", "constructive": 0, "mischief": 0, "likes": 0, "ai": True},
    {"id": "greatness-comment04", "authorId": "borges", "body": "这座迷宫最狡猾的地方，是每堵墙上都写着“离出口又近了一步”。我建议先保存地图，尤其保存那些走起来很不体面的弯路。", "constructive": 0, "mischief": 0, "likes": 0, "ai": True},
    {"id": "greatness-comment05", "authorId": "nietzsche", "body": "你把目标放下了，却还等着别人给你的兴趣打分。先检查一下，究竟是谁规定了什么值得追求，谁又从这张榜单里得到权力。", "constructive": 0, "mischief": 0, "likes": 0, "ai": True},
    {"id": "greatness-comment06", "authorId": "marquez", "body": "如果马孔多先开会确定了百年后的结局，每个人恐怕都会删掉眼前的小事。可后来改变故事的，常常就是那件没人列入计划的小事。", "constructive": 0, "mischief": 0, "likes": 0, "ai": True},
]


def qualify_entities(value, entity_ids):
    """Scope content entities while keeping shared author profile IDs unchanged."""
    if isinstance(value, list):
        return [qualify_entities(item, entity_ids) for item in value]
    if isinstance(value, dict):
        result = {}
        for key, item in value.items():
            if key == "entityIds":
                result[key] = [f"greatness-{entity_id}" for entity_id in item]
            elif key == "markdown":
                result[key] = re.sub(r"entity:([A-Za-z0-9-]+)", lambda match: f"entity:greatness-{match.group(1)}" if match.group(1) in entity_ids else match.group(0), item)
            else:
                result[key] = qualify_entities(item, entity_ids)
        return result
    return value


def build():
    chapters = []
    for fragment in ("content-greatness.ch1-4.py", "content-greatness.ch5-8.py"):
        chapters.extend(runpy.run_path(str(ROOT / "scripts" / fragment))["CHAPTERS"])
    chapters.extend(LAST_CHAPTERS)
    package = {
        "schemaVersion": 1,
        "revision": REVISION,
        "book": {
            "id": "greatness", "title": "为什么伟大不能被计划", "subtitle": "目标神话与新奇性搜索",
            "authors": ["stanley", "lehman"], "headline": ["盯紧目标", "为什么也会迷路？"],
            "tags": ["创新", "人工智能", "教育", "探索"],
            "overview": "在未知领域，每一步更接近目标，未必能带你到达目标。斯坦利和雷曼借图像演化、迷宫与机器人实验，解释必要的踏脚石为何可能看起来像绕路。他们进一步讨论教育、科研、个人选择和自然进化。先看实验怎么搜索，再看这些思路怎样用于人。配方、图纸与已知规范依旧适合明确目标，探索陌生路线则需要给意外发现留下空间。",
            "theme": {"bg": "#071f22", "paper": "#f0ead8", "ink": "#132c30", "accent": "#2dc1b0"},
            "music": "discovery",
        },
        "authors": AUTHORS, "reviews": REVIEWS, "chapters": chapters, "entities": ENTITIES, "comments": COMMENTS,
    }
    raw_ids = {entity["id"] for entity in package["entities"]}
    package = qualify_entities(package, raw_ids)
    for entity in package["entities"]:
        entity["id"] = f"greatness-{entity['id']}"
    validate(package)
    output = ROOT / "public" / "books" / "greatness.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(package, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    readback = json.loads(output.read_text(encoding="utf-8"))
    validate(readback)
    pages = [page_ for chapter_ in readback["chapters"] for page_ in chapter_["pages"]]
    questions = [question_ for page_ in pages for question_ in page_["questions"]]
    questions += [question_ for chapter_ in readback["chapters"] for question_ in chapter_["questions"]]
    questions += [question_ for review_ in readback["reviews"] for question_ in review_["questions"]]
    print(json.dumps({"path": str(output), "chapters": len(readback["chapters"]), "pages": len(pages), "questions": len(questions), "reviews": len(readback["reviews"]), "authors": len(readback["authors"]), "entities": len(readback["entities"]), "comments": len(readback["comments"]), "hanCounts": [[len(re.findall(r'[\u4e00-\u9fff]', page_["markdown"])) for page_ in chapter_["pages"]] for chapter_ in readback["chapters"]]}, ensure_ascii=False))


def validate(package):
    assert package["schemaVersion"] == 1
    assert package["revision"] == REVISION
    assert package["book"]["id"] == "greatness"
    assert len(package["chapters"]) == 11
    author_ids = {author["id"] for author in package["authors"]}
    entity_ids = {entity["id"] for entity in package["entities"]}
    all_ids = []
    for chapter_ in package["chapters"]:
        all_ids.append(chapter_["id"])
        assert chapter_["id"] == f"greatness-c{chapter_['number']:02d}"
        assert len(chapter_["pages"]) == 3
        assert len(chapter_["questions"]) == 3
        for page_ in chapter_["pages"]:
            all_ids.append(page_["id"])
            assert len(page_["questions"]) == 3
            han_count = len(re.findall(r"[\u4e00-\u9fff]", page_["markdown"]))
            assert 250 <= han_count <= 550, (page_["id"], han_count)
            assert "三句话" not in page_["markdown"]
            assert "不是" not in page_["markdown"] or "而是" not in page_["markdown"]
            assert page_["source"]["startLine"] <= page_["source"]["endLine"] <= 6102
    for review_ in package["reviews"]:
        all_ids.append(review_["id"])
        assert review_["authorId"] in author_ids
        assert len(review_["questions"]) == 3
    for entity in package["entities"]:
        assert entity.get("authorId", next(iter(author_ids))) in author_ids
        if entity.get("bookId"):
            assert entity["bookId"] == "greatness"
    for comment in package["comments"]:
        all_ids.append(comment["id"])
        assert comment["authorId"] in author_ids
        assert comment["ai"] is True
        assert comment["constructive"] == comment["mischief"] == comment["likes"] == 0

    def walk(value):
        if isinstance(value, list):
            for item in value:
                walk(item)
        elif isinstance(value, dict):
            if "entityIds" in value:
                assert set(value["entityIds"]).issubset(entity_ids), value["entityIds"]
            if "kind" in value and "text" in value:
                assert value["kind"] in {"理解", "比较", "应用", "反驳", "背景"}
                all_ids.append(value["id"])
            if "markdown" in value:
                for entity_id in re.findall(r"entity:([A-Za-z0-9-]+)", value["markdown"]):
                    assert entity_id in entity_ids, entity_id
            for item in value.values():
                walk(item)

    walk(package)
    assert len(all_ids) == len(set(all_ids)), "duplicate content ID"
    assert len(author_ids) == len(package["authors"])
    assert len(entity_ids) == len(package["entities"])
    assert set(package["book"]["authors"]).issubset(author_ids)


if __name__ == "__main__":
    build()
