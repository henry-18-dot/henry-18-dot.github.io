CHAPTERS = [
    {
        "id": "greatness-c05",
        "number": 5,
        "title": "第五章 有趣的和新奇的探索",
        "overview": "新奇性搜索把当前位置与已有发现比较，保留不同的行为，再沿着它们继续探索。作者用迷宫和双足机器人模拟，说明接近目标的评分可能删掉关键踏脚石。新奇性在这些任务中更有效，复杂迷宫的失败也限定了它的能力。",
        "pages": [
            {
                "id": "greatness-c05-p01",
                "title": "新奇需要参照物",
                "markdown": "新奇性要拿当前发现与过去比较。同一张图片第一次出现时可能令人意外，类似图片积累得多了，它就失去新奇感。目标搜索则拿当前结果与预先指定的终点比较：哪一个看起来更接近终点，哪一个就优先得到后续探索。两者使用了不同的信息。\n\n图片孵化器里，用户选择外星人脸，因为眼前这张图片有趣。他无需先判断它能否变成汽车。选择留下了一个可继续繁育的起点，后来的用户才有机会发现汽车。踏脚石的价值常常要等下一段探索发生后才能看见。\n\n这里的兴趣也需要积累。作者谈到偶然发现时，强调发现者具备知识，能看出异常值得追问。眼前同样的现象，有人忽略，有人会继续研究。把兴趣当成探索依据，需要观察、尝试和学习。随意更换活动，只会产生表面的变化，未必留下能让后来工作继续发展的材料。新奇性的判断因此离不开搜索历史，也离不开所处领域。",
                "layout": "prose",
                "entityIds": ["novelty", "goals", "picbreeder", "stepping-stones", "serendipity"],
                "source": {"label": "原书第五章", "startLine": 1916, "endLine": 2623},
                "questions": [
                    {"id": "greatness-c05-p01-q01", "text": "同一个发现为什么会随着探索历史变长而失去新奇性？", "kind": "理解", "entityIds": ["novelty", "search-space"]},
                    {"id": "greatness-c05-p01-q02", "text": "图片孵化器里的外星人脸怎样成为汽车图片的踏脚石？", "kind": "理解", "entityIds": ["picbreeder", "stepping-stones"]},
                    {"id": "greatness-c05-p01-q03", "text": "怎样区分能留下研究材料的兴趣与只求刺激的猎奇？", "kind": "比较", "entityIds": ["novelty", "serendipity", "innovation"]}
                ]
            },
            {
                "id": "greatness-c05-p02",
                "title": "机器人怎样积累新行为",
                "markdown": "设想机器人在走廊里探索。最初，无论撞上哪一面墙，它都做出了未曾出现的行为。类似撞墙结果逐渐积累后，继续撞同样的位置就不再新奇。能够绕开墙、进入另一片区域的行为，开始提供更多差异，搜索便沿着这些行为继续变化。\n\n| 选择依据 | 后续优先探索什么 | 可能漏掉什么 |\n| --- | --- | --- |\n| 接近目标 | 离出口更近的行为 | 先远离出口的绕行 |\n| 行为新奇 | 与已发现行为不同的结果 | 重复但仍有实用价值的动作 |\n\n新奇性搜索会对已有行为作微调，继续测试其变化，也会忽略大量重复结果。它利用已发现的材料组织下一步，因而与无差别尝试所有动作的穷举有所区别。\n\n作者据此提出，搜索可能在简单行为被充分探索后发展出更复杂的行为。绕墙需要感知环境，稳定行走需要利用重力和运动的关系，这些行为携带了关于世界的信息。这是本章解释复杂性增长的思路。增长仍受行为描述、环境和计算资源影响，不能仅凭一个动作新奇就断定它更聪明。物理约束也会把许多想象中的动作压成同一种失败结果。",
                "layout": "comparison",
                "entityIds": ["novelty", "goals", "stepping-stones", "search-space", "objective-deception"],
                "source": {"label": "原书第五章", "startLine": 1916, "endLine": 2623},
                "questions": [
                    {"id": "greatness-c05-p02-q01", "text": "搜索为什么会逐渐减少重复撞墙，又如何沿已有行为产生变化？", "kind": "理解", "entityIds": ["novelty", "search-space"]},
                    {"id": "greatness-c05-p02-q02", "text": "如果只用机器人的最终位置表示行为，会漏掉哪些有意义的差异？", "kind": "反驳", "entityIds": ["novelty", "artificial-intelligence"]},
                    {"id": "greatness-c05-p02-q03", "text": "为什么新奇性搜索不能直接等同于穷举所有动作？", "kind": "比较", "entityIds": ["novelty", "stepping-stones", "search-space"]}
                ]
            },
            {
                "id": "greatness-c05-p03",
                "title": "迷宫里的两种评分",
                "markdown": "本章把两种搜索放进同一个机器人迷宫模拟。目标搜索奖励离终点更近的行为，新奇性搜索奖励与既有行为不同的结果。迷宫中有看似接近终点的死胡同，正确路线需要先远离终点。前一种评分容易把绕路判成退步，过早停止沿它探索。\n\n书中报告，这组迷宫实验各重复四十次，新奇性搜索三十九次找到终点，目标搜索三次找到终点。数字对应特定迷宫与算法设置。它直接展示的是这套距离评分在欺骗性环境中的弱点，不能直接代表所有导航方法的表现。\n\n另一项双足机器人模拟也出现类似结果：追求新奇行为的机器人学会了行走，走得比以行走距离为目标的机器人更远。摔倒和踢腿可能留下摆动的踏脚石，过早惩罚它们会截断学习路径。\n\n作者随后写到数百个随机迷宫的测试。难度继续增加时，两种搜索都可能失败，目标搜索的能力下降更快。这让本章留下两个相连的结论：目标评分会遗漏有用路径，新奇性能够避开某些陷阱。它们都没有给出攻克任意复杂问题的保证。",
                "layout": "prose",
                "entityIds": ["novelty", "goals", "objective-deception", "stepping-stones", "artificial-intelligence"],
                "source": {"label": "原书第五章", "startLine": 1916, "endLine": 2623},
                "questions": [
                    {"id": "greatness-c05-p03-q01", "text": "迷宫中的死胡同怎样把距离更近与路线更好分开？", "kind": "理解", "entityIds": ["goals", "objective-deception"]},
                    {"id": "greatness-c05-p03-q02", "text": "双足机器人探索中，摔倒怎样可能成为学习行走的踏脚石？", "kind": "理解", "entityIds": ["novelty", "stepping-stones"]},
                    {"id": "greatness-c05-p03-q03", "text": "怎样设计新迷宫对照，检验三十九比三的优势能否延续？", "kind": "应用", "entityIds": ["novelty", "search-space", "objective-deception"]}
                ]
            }
        ],
        "questions": [
            {"id": "greatness-c05-reflect01", "text": "我的项目用什么记录探索历史，才能判断一次尝试究竟增加了什么？", "kind": "应用", "entityIds": ["novelty", "stepping-stones"]},
            {"id": "greatness-c05-reflect02", "text": "在机器人学习中，行为更不同与行为更复杂何时会分离？", "kind": "反驳", "entityIds": ["novelty", "artificial-intelligence", "search-space"]},
            {"id": "greatness-c05-reflect03", "text": "任务路径已经清楚时，目标评分还会遇到本章的迷宫陷阱吗？", "kind": "比较", "entityIds": ["goals", "objective-deception"]}
        ]
    },
    {
        "id": "greatness-c06",
        "number": 6,
        "title": "第六章 寻宝者万岁",
        "overview": "新奇性搜索能发现某些目标搜索漏掉的成果，却不能承诺抵达指定终点。本章进一步讨论如何把个人的分散兴趣组织成踏脚石网络，并用可演变的家具目录作设想。系统保留和传播发现，让不同人的探索相互接续。",
        "pages": [
            {
                "id": "greatness-c06-p01",
                "title": "搜索不能承诺目的地",
                "markdown": "新奇性搜索在迷宫里赢了，并不表示它能替人找到任何指定结果。如果迷宫向各个方向无限延伸，指定地点可能始终没有被访问。探索范围越大，有限时间里实际走过的部分越小。发现有用的东西与找到预先点名的东西，提出了不同的要求。\n\n有人因此建议，把目标与新奇性混合，既保持方向，也保留备选路径。作者反对把这当成通用补救：在有欺骗性的任务中，错误评分仍会让关键绕路受到惩罚。增加一点多样性，未必足以抵消持续施加的选择压力。真正的问题是评分是否能识别必要的踏脚石。\n\n本章也承认混合方法能解决一些问题。它批评的承诺是，只要方法恰当，任何宏大目标都能可靠实现。无论选择目标搜索、新奇性搜索，还是两者结合，都要面对有限资源和未知路径。\n\n寻宝者接受这种限制，继续寻找眼前有价值、有潜力的发现。成果可以带来惊喜，但结束时得到的东西可能与出发时的愿望不同。这里的乐观来自持续增加可用材料，而不靠许诺某个结局一定发生。",
                "layout": "prose",
                "entityIds": ["novelty", "goals", "diversity", "objective-deception", "search-space", "stepping-stones"],
                "source": {"label": "原书第六章", "startLine": 2624, "endLine": 3007},
                "questions": [
                    {"id": "greatness-c06-p01-q01", "text": "无限迷宫为什么能说明新奇性搜索不能保证找到指定地点？", "kind": "理解", "entityIds": ["novelty", "search-space"]},
                    {"id": "greatness-c06-p01-q02", "text": "保留多个候选方案为什么仍可能受同一错误评分牵引？", "kind": "理解", "entityIds": ["diversity", "objective-deception", "goals"]},
                    {"id": "greatness-c06-p01-q03", "text": "有明确交付期限的任务怎样保留探索，同时约束时间成本？", "kind": "应用", "entityIds": ["goals", "novelty", "stepping-stones"]}
                ]
            },
            {
                "id": "greatness-c06-p02",
                "title": "把发现留给后来的人",
                "markdown": "一个人对某张图片有兴趣，其他人可能毫无感觉。若每一步都要投票选出大家最满意的结果，那张图片就可能消失。图片孵化器允许个人保存选择，下一位用户可以取它作起点。两个人不需要拥有同一个终点，也能接续一段创造过程。\n\n| 组织方式 | 保留的材料 | 后来者怎样参与 |\n| --- | --- | --- |\n| 每步先达成共识 | 多数人认可的一条路径 | 沿集体选出的方向继续 |\n| 独立探索并共享 | 各人觉得有趣的不同路径 | 选择某个已有成果再发展 |\n\n这里的协作依靠可继承的成果。个人的目标可以不同，整个系统仍积累越来越多的踏脚石。合作不必要求所有人对每次选择给出相同判断，也无需把所有偏好压成一个排行榜。\n\n这种结构还改变了失败的含义。一段探索没有得到原计划的成果，只要留下可理解、可继续变化的东西，另一段探索仍可能用得上它。作者据此强调，要考察整个发现网络怎样增长，不能只盯着某个人是否抵达预定终点。系统若只保存眼前最受欢迎的产物，许多用途尚未显现的分支会被提前删掉。",
                "layout": "comparison",
                "entityIds": ["picbreeder", "stepping-stones", "diversity", "innovation", "goals"],
                "source": {"label": "原书第六章", "startLine": 2624, "endLine": 3007},
                "questions": [
                    {"id": "greatness-c06-p02-q01", "text": "没有共同终点的用户怎样通过图片孵化器形成协作？", "kind": "理解", "entityIds": ["picbreeder", "stepping-stones"]},
                    {"id": "greatness-c06-p02-q02", "text": "每一步投票与各人独立保存分支，会怎样改变探索范围？", "kind": "比较", "entityIds": ["diversity", "search-space", "innovation"]},
                    {"id": "greatness-c06-p02-q03", "text": "课程项目没有成功时，应该保存哪些材料才能让下一组接着做？", "kind": "应用", "entityIds": ["stepping-stones", "innovation"]}
                ]
            },
            {
                "id": "greatness-c06-p03",
                "title": "会演变的家具目录",
                "markdown": "本章设想一家家具网站。顾客先选一把椅子，再让系统生成变体：改变表面图案，调整腿的形状，继续选择和修改，直到找到愿意购买的款式。顾客的成品又进入目录，成为新顾客下一轮探索的起点。目录随着选择不断生长。\n\n这一设想保留了每个人的偏好。有人偏爱细腿，有人喜欢弯曲的结构，系统无需先决定唯一的理想椅子。购买记录还能帮助目录辨认哪些发现对人有吸引力，随后继续围绕它们生成变化。\n\n专业知识仍然决定探索空间怎样建立。系统需要一种可修改的数字表示，需要生成变体，也要处理真实制造的成本和工艺。椅子必须可用，变形不能无限任意。专家可以把经验投入这些条件，使普通人的选择有机会成为可实现的设计。\n\n这段家具故事是用来展示寻宝系统的思维实验。图片孵化器提供了可接续探索的实例，家具场景还增加了承重、生产与交付问题。二者可以共享保存分支的组织方式，家具目录的质量仍要靠这些具体条件来判断。读者因此应关注系统让哪些变化成为可能，也关注哪些发现能被继续使用。",
                "layout": "prose",
                "entityIds": ["stepping-stones", "search-space", "innovation", "picbreeder", "artificial-intelligence", "diversity"],
                "source": {"label": "原书第六章", "startLine": 2624, "endLine": 3007},
                "questions": [
                    {"id": "greatness-c06-p03-q01", "text": "可演变家具目录怎样让顾客从挑选成品转为提供新设计？", "kind": "理解", "entityIds": ["innovation", "stepping-stones"]},
                    {"id": "greatness-c06-p03-q02", "text": "家具设计中哪些约束必须在生成变体时就发挥作用？", "kind": "应用", "entityIds": ["search-space", "innovation"]},
                    {"id": "greatness-c06-p03-q03", "text": "购买次数能否完整代表一把椅子作为踏脚石的潜力？", "kind": "反驳", "entityIds": ["stepping-stones", "diversity", "goals"]}
                ]
            }
        ],
        "questions": [
            {"id": "greatness-c06-reflect01", "text": "团队能否共享可继续使用的成果，同时允许成员追求不同方向？", "kind": "应用", "entityIds": ["diversity", "stepping-stones", "innovation"]},
            {"id": "greatness-c06-reflect02", "text": "当保存所有分支成本过高，怎样选择仍值得保留的踏脚石？", "kind": "反驳", "entityIds": ["stepping-stones", "search-space", "novelty"]},
            {"id": "greatness-c06-reflect03", "text": "寻宝系统的整体收获应怎样衡量，才能避免重新制造单一目标？", "kind": "应用", "entityIds": ["goals", "innovation", "diversity"]}
        ]
    },
    {
        "id": "greatness-c07",
        "number": 7,
        "title": "第七章 解开禁锢教育的枷锁",
        "overview": "考试成绩成为奖惩依据后，课堂可能转向专门提高分数，教育的丰富目的随之收窄。作者进一步质疑更精确、更统一的评估能否解决这一问题，并提出教师自主探索与同行交流的方案，让教学成果成为可共享的踏脚石。",
        "pages": [
            {
                "id": "greatness-c07-p01",
                "title": "分数怎样改变课堂",
                "markdown": "考试可以帮助教师发现学生哪里不会。一旦考试成绩又决定学校排名、教师奖惩，参与者便会围绕分数调整行为。花时间练习题型、记住解题格式，可能比组织讨论或探索陌生问题更容易在下一次测试里得到回报。\n\n本章用坎贝尔定律描述这种压力：量化指标越深地参与社会决策，越容易受到操纵，并扭曲它原本要观察的过程。操纵可以是作弊，也可以是完全合规地压缩课堂，把一切活动集中到被评分的部分。数字继续上升，教学范围却可能变窄。\n\n作者引用美国《不让一个孩子掉队》框架下的年度指标，说明教育如何被安排成成绩比例逐年提高的路径。这个安排隐含着一个判断：每年更接近理想分数，就会更接近理想教育。深度理解、创造力和长远发展未必沿着同一条路径变化。\n\n本章由此把目标欺骗问题引入教育。它针对复杂教育过程被单一指标驱动的情形。日常练习可以设定明确要求，课程也需要检查学生掌握了什么。问题出现于这些局部结果被当成整个教育事业的充分尺度，并持续决定所有资源和行动。",
                "layout": "prose",
                "entityIds": ["education", "goals", "objective-deception", "innovation"],
                "source": {"label": "原书第七章", "startLine": 3008, "endLine": 3573},
                "questions": [
                    {"id": "greatness-c07-p01-q01", "text": "同一场考试用于诊断学习与用于教师奖惩，会产生哪些不同压力？", "kind": "比较", "entityIds": ["education", "goals"]},
                    {"id": "greatness-c07-p01-q02", "text": "不作弊也可能发生指标扭曲吗，课堂里有哪些具体做法？", "kind": "理解", "entityIds": ["education", "objective-deception"]},
                    {"id": "greatness-c07-p01-q03", "text": "课程实验成绩提高时，怎样判断学生的迁移能力是否也提高了？", "kind": "应用", "entityIds": ["education", "goals"]}
                ]
            },
            {
                "id": "greatness-c07-p02",
                "title": "量得更准仍可能选错",
                "markdown": "图片孵化器的一张骷髅头，曾经过月牙、甜甜圈和盘子形状的前身。假设评分器能极精确地测量每张图片有多像骷髅头，它仍可能删掉这些不像目标的前身。测量误差减小了，选择原则的错误却留下来。\n\n| 改进评估的办法 | 能帮助什么 | 尚未解决什么 |\n| --- | --- | --- |\n| 测量更精确 | 减少同一指标的读数误差 | 指标能否辨认未来的踏脚石 |\n| 全国采用相同标准 | 方便横向比较表现 | 被排除的教学路径是否有价值 |\n\n作者把这个区别用于教育。如果眼前的测试表现与长期深度学习之间关系复杂，就不能认定评分越准，教学选择必然越好。统一标准又会让不同学校受到同样的选择压力，教师能够尝试的方向随之减少。局部试错的材料也更难进入整个系统。\n\n统一教育标准有促进公平、保证共同知识基础的理由。本章着重追问的是，把所有学习经历和改进路径都推向同一尺度，会失去多少多样性。这是一种由搜索逻辑引出的制度批评。判断具体政策时，还要区分基本学习保障与探索空间，不能把允许差异直接等同于放弃对学生的责任。",
                "layout": "comparison",
                "entityIds": ["education", "picbreeder", "stepping-stones", "objective-deception", "diversity", "goals"],
                "source": {"label": "原书第七章", "startLine": 3008, "endLine": 3573},
                "questions": [
                    {"id": "greatness-c07-p02-q01", "text": "骷髅头的前身为什么说明评分精度与选择原则需要分别判断？", "kind": "理解", "entityIds": ["picbreeder", "objective-deception", "stepping-stones"]},
                    {"id": "greatness-c07-p02-q02", "text": "共同知识底线与所有课堂使用相同教学路径，有什么区别？", "kind": "比较", "entityIds": ["education", "diversity", "goals"]},
                    {"id": "greatness-c07-p02-q03", "text": "教师想尝试新教学方法时，怎样避免只因短期分数下降就被停止？", "kind": "应用", "entityIds": ["education", "innovation", "stepping-stones"]}
                ]
            },
            {
                "id": "greatness-c07-p03",
                "title": "教师之间交换踏脚石",
                "markdown": "本章给出一种同行评估设想。教师每年整理作业、测试、教学大纲、教学方法和学生作品，组成一份教学合集，再匿名交给来自不同学校的五位教师。评审者从课程完整性、创新性和学生表现等方面给出分数与书面意见。\n\n不同评审者可以带着不同经验阅读材料。接受评审的教师会看到几种判断，担任评审的教师也会接触别人的课堂方法。一个有意思的项目、一份引出讨论的作业，可以成为下一学年尝试的起点。系统通过传播具体做法，积累新的教学踏脚石。\n\n作者还保留了保障机制：合集的平均评价不及格时，学生下一年可能需要参加标准化测试，检查学习状况。评估仍然存在，只是材料更丰富，评判不再完全依赖同一场考试。教师的自主探索与学生的基本学习要求需要同时被照顾。\n\n这套方案是本章提出的替代组织思路。匿名、五人评审与学习保障并不能自动解决所有教育问题，执行时仍要处理评审负担、评价分歧和资源差异。它真正打开的问题是，教育系统能否让有价值的方法被看见、被继承，并允许教师在此基础上继续变化。",
                "layout": "prose",
                "entityIds": ["education", "stepping-stones", "diversity", "innovation", "goals"],
                "source": {"label": "原书第七章", "startLine": 3008, "endLine": 3573},
                "questions": [
                    {"id": "greatness-c07-p03-q01", "text": "教学合集比单次考试多提供了哪些能继续使用的材料？", "kind": "理解", "entityIds": ["education", "stepping-stones"]},
                    {"id": "greatness-c07-p03-q02", "text": "五位同行的平均分会不会再次压掉少数人支持的新方法？", "kind": "反驳", "entityIds": ["education", "diversity", "objective-deception"]},
                    {"id": "greatness-c07-p03-q03", "text": "在一门大学课程里试用教学合集，怎样控制教师与评审的工作量？", "kind": "应用", "entityIds": ["education", "innovation"]}
                ]
            }
        ],
        "questions": [
            {"id": "greatness-c07-reflect01", "text": "我的学习中，哪些活动增加理解却不会立即增加考试分数？", "kind": "应用", "entityIds": ["education", "goals", "stepping-stones"]},
            {"id": "greatness-c07-reflect02", "text": "教育评价怎样保住基本学习要求，同时让不同教学方法继续发展？", "kind": "应用", "entityIds": ["education", "diversity", "innovation"]},
            {"id": "greatness-c07-reflect03", "text": "从机器人迷宫推到教育制度，中间还缺哪些关于人的证据？", "kind": "反驳", "entityIds": ["education", "objective-deception", "artificial-intelligence"]}
        ]
    },
    {
        "id": "greatness-c08",
        "number": 8,
        "title": "第八章 解开禁锢创新的枷锁",
        "overview": "科研资助怎样选择尚未发生的发现，是本章的中心问题。作者质疑共识、预期影响和成功概率作为单一尺度，主张为有趣的分歧与探索留下资源。商业和艺术的例子进一步区分遥远愿景、眼前可用的踏脚石及必须满足的条件。",
        "pages": [
            {
                "id": "greatness-c08-p01",
                "title": "资助意见分歧的项目",
                "markdown": "科研申请常交给多位同行评分，平均评价高的项目更容易获得资助。这个安排能筛掉明显薄弱的提案，也偏爱大家都能理解和接受的方向。申请者于是有理由把新想法写得稳妥，减少让评审产生分歧的部分。\n\n作者把它与图片孵化器比较。网站允许某个人保留别人不感兴趣的图片，科研评审若每次都先寻求共识，类似的独特分支可能没有机会留下。重要发现的前身尚未显出用途时，少数人的兴趣可能先于普遍认可。\n\n本章因此建议，把部分资源留给评价明显分歧的提案。这里需要分开三种情形：大家认可、有人强烈支持同时有人反对、全员认为很差。分歧可以提示方向仍处于知识边界，全员差评则没有提供同样的积极理由。争议本身也不能代替严谨的研究设计。\n\n这是一项关于资助结构的主张。它试图让多个探索链同时存在，减少所有人被平均分推向一条路线的压力。研究者仍可以合作，团队内部也可以共同解决问题。作者希望减少的是整个领域在开展探索前必须同意同一个方向的要求。",
                "layout": "prose",
                "entityIds": ["innovation", "diversity", "picbreeder", "stepping-stones", "goals"],
                "source": {"label": "原书第八章", "startLine": 3574, "endLine": 4159},
                "questions": [
                    {"id": "greatness-c08-p01-q01", "text": "按平均评价资助科研，为什么会鼓励申请者写出稳妥的提案？", "kind": "理解", "entityIds": ["innovation", "goals", "diversity"]},
                    {"id": "greatness-c08-p01-q02", "text": "意见两极分化与全员差评，在支持探索的理由上有什么不同？", "kind": "比较", "entityIds": ["innovation", "diversity"]},
                    {"id": "greatness-c08-p01-q03", "text": "怎样区分有科学根据的研究分歧与仅靠夸张叙述制造的争议？", "kind": "反驳", "entityIds": ["innovation", "novelty", "stepping-stones"]}
                ]
            },
            {
                "id": "greatness-c08-p02",
                "title": "预期影响看漏了什么",
                "markdown": "科研作为整体可以追求重要发现，但单个项目不必在出发时就显得足以改变社会。群论曾由抽象的数学问题推动，后来进入物理与化学。计算复杂性和单向函数的研究，也成为公钥密码学与线上交易安全的材料。后来的用途，常常超出了最初的问题。\n\n如果资助只奖励可预测的直接影响，尚未连上应用的材料就容易被排除。作者认为，能引出更有趣问题的研究，也值得占据探索空间。眼前影响很小的工作可能被其他领域接走，成为长链条里关键的一步。\n\n本章并未说大型目标项目绝无成功可能。它用登月与更遥远的技术愿景比较，强调已有基础的差别：当必要技术已经积累到可实施范围，明确目标能组织工程工作。没有这些材料时，更多意愿和资金不能自动补出未知的路径。\n\n因此，评价项目需要问清楚处于哪种阶段。已知路线上的工程集成，可以讨论具体进度。寻找新原理的探索，应给意外发现留空间。作者据此提出，资助曾经留下有趣成果的人，也是支持未知探索的一种办法。它容许目的地暂时不明，同时仍能考察已有工作留下了什么。",
                "layout": "prose",
                "entityIds": ["innovation", "stepping-stones", "serendipity", "goals", "search-space"],
                "source": {"label": "原书第八章", "startLine": 3574, "endLine": 4159},
                "questions": [
                    {"id": "greatness-c08-p02-q01", "text": "纯数学怎样说明项目的初始用途与后来的社会影响可能分离？", "kind": "理解", "entityIds": ["innovation", "stepping-stones", "serendipity"]},
                    {"id": "greatness-c08-p02-q02", "text": "登月工程与尚缺基础原理的技术愿景，适合采用相同进度评估吗？", "kind": "比较", "entityIds": ["goals", "stepping-stones", "innovation"]},
                    {"id": "greatness-c08-p02-q03", "text": "支持有过有趣发现的人时，怎样兼顾新研究者获得机会？", "kind": "反驳", "entityIds": ["innovation", "diversity"]}
                ]
            },
            {
                "id": "greatness-c08-p03",
                "title": "商业与艺术的近处",
                "markdown": "本章比较两家设想中的电视公司。一家许诺完全沉浸的全息电视，另一家利用已有显示技术改善画质。前一家还缺许多必要发现，后一家的下一步较清楚。愿景听起来更宏大，并不自动让它成为更可实施的投入。\n\n| 工作情形 | 眼前要判断什么 | 需要保留什么 |\n| --- | --- | --- |\n| 商业创新 | 近处的技术能否形成产品 | 可实现的下一块踏脚石 |\n| 科学探索 | 附近的问题是否值得追问 | 未知用途的发现与分支 |\n| 艺术设计 | 作品怎样继续发展 | 兴趣与功能条件内的变化 |\n\n商业创新也会发现意外连接。作者举电动跑车为例，消费电子积累的电池技术，让一种新产品进入了可实现范围。创业者需要识别和理解眼前可用的材料，随后才能把它们组织成方案。\n\n艺术里的探索更容许目的暂时不明。敲打金属、让它生锈，可能引出新的材料感和作品。但设计还要满足具体条件，建筑要防雨，地基要稳固。条件划定可工作的范围，范围内仍可以有许多不同方向。作者借此提醒，保留探索不等于取消功能要求，明确任务也不需要替所有创作提前指定最终样子。",
                "layout": "comparison",
                "entityIds": ["innovation", "stepping-stones", "goals", "search-space", "serendipity", "diversity"],
                "source": {"label": "原书第八章", "startLine": 3574, "endLine": 4159},
                "questions": [
                    {"id": "greatness-c08-p03-q01", "text": "已有电池技术怎样使电动跑车成为可以实施的下一步？", "kind": "理解", "entityIds": ["stepping-stones", "innovation", "serendipity"]},
                    {"id": "greatness-c08-p03-q02", "text": "建筑的防雨与稳定要求，和规定唯一设计样式有什么不同？", "kind": "比较", "entityIds": ["goals", "search-space", "diversity"]},
                    {"id": "greatness-c08-p03-q03", "text": "机器人创业方案怎样说明眼前可用的技术，而不只描述遥远愿景？", "kind": "应用", "entityIds": ["innovation", "stepping-stones", "goals"]}
                ]
            }
        ],
        "questions": [
            {"id": "greatness-c08-reflect01", "text": "有限研究经费怎样兼顾已知方向的推进与分歧较大的探索？", "kind": "应用", "entityIds": ["innovation", "diversity", "goals"]},
            {"id": "greatness-c08-reflect02", "text": "一项暂时看不到应用的研究，应留下什么成果供其他领域接续？", "kind": "应用", "entityIds": ["stepping-stones", "innovation", "serendipity"]},
            {"id": "greatness-c08-reflect03", "text": "我的项目有哪些必须满足的条件，又有哪些终点仍可保持开放？", "kind": "比较", "entityIds": ["goals", "search-space", "innovation"]}
        ]
    }
]
