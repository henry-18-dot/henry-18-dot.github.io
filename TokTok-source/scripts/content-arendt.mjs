import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const bookId = 'human-condition';
const two = n => String(n).padStart(2, '0');
const eid = name => `${bookId}-${name}`;
const question = (id, text, kind = '理解', names = []) => ({ id, text, kind, ...(names.length ? { entityIds: names.map(eid) } : {}) });
function chapter(number, title, overview, rows, reflection) {
  const id = `${bookId}-c${two(number)}`;
  const pages = rows.map((row, i) => {
    const pageId = `${id}-p${two(i + 1)}`;
    const [section, sectionTitle, title, layout, startLine, endLine, markdown, questions, entities] = row;
    return {
      id: pageId, title, layout, markdown,
      sectionId: `${bookId}-s${two(section)}`, sectionTitle,
      source: { label: `《人的境况》王寅丽译本，第${section}节`, startLine, endLine },
      entityIds: entities.map(eid),
      questions: questions.map((q, j) => question(`${pageId}-q${two(j + 1)}`, q[0], q[1], q[2] || [])),
    };
  });
  return {
    id, number, title, overview, pages,
    questions: reflection.map((q, i) => question(`${id}-reflect${two(i + 1)}`, q[0], q[1], q[2] || [])),
    sections: rows.map((row, i) => ({ id: `${bookId}-s${two(row[0])}`, number: row[0], title: row[1], pageId: pages[i].id })),
  };
}

const firstChapters = [
  chapter(1, '人的条件', '人的活动要在给定的条件中展开，也会改变这些条件。劳动维持生命，工作建造相对持久的世界，行动发生在彼此不同的人之间。阿伦特先分清这些活动，再追问传统为何把它们都放到沉思之下。个体生命会结束，人留下的作品和言行却可能继续被记住。这里的区分将为后面五章提供坐标。', [
    [1, '积极生活与人的条件', '人活着，还要有一个世界', 'comparison', 208, 226,
      `做饭、造桌子、和别人商量一项公共决定，都可以叫“做事”，但它们回应的条件不同。阿伦特把积极生活分成劳动、工作、行动。这里的“工作”有专门含义，不能直接套上“上班”的意思。

| 活动 | 回应的条件 | 典型结果 |
| --- | --- | --- |
| 劳动 | 身体必须持续活着 | 做出的食物又被吃掉 |
| 工作 | 人需要相对持久的居所 | 一张桌子留下来供人使用 |
| 行动 | 世上有许多不同的人 | 言行开启一段共同经历 |

劳动随着需要不断重来。工作给短暂的生命一个比较稳固的背景。行动让人通过言说和参与显露自己的独特性，因为任何人都无法预先替所有人发言。

这些是人的条件，也包括出生、死亡和地球环境。条件会影响我们，却不能直接给出一个人的本质。人制造的建筑、制度和工具，随后也会限制人的下一步行动。诞生性尤其关联行动：新人来到世界，新的开端也随之成为可能。`,
      [['同一个人做饭、设计餐桌、参加社区会议，分别涉及哪种活动？', '应用', ['labor', 'work', 'action']], ['人的条件为什么不能直接等同于人的本性？', '理解', ['world', 'plurality']], ['诞生性怎样解释人能够开启新的事情？', '理解', ['natality', 'action']]], ['labor', 'work', 'action', 'plurality', 'natality', 'world']],
    [2, '积极生活的术语', '忙碌为何曾经低于沉思', 'timeline', 228, 248,
      `“积极生活”在思想史中换过含义。它早先指向公民参与公共事务的生活，后来逐渐涵盖一切现世活动。词的范围扩大，活动之间的差别却变得模糊了。

| 思想阶段 | 积极生活的位置 |
| --- | --- |
| 希腊城邦经验 | 言说和行动构成政治生活 |
| 哲学传统 | 沉思的宁静被置于活动之上 |
| 中世纪思想 | 现世活动为沉思和彼世生活服务 |
| 现代的倒转 | 活动被抬高，原有共同尺度仍保留 |

如果判断只问某种活动会不会打扰沉思，做饭、制作器物、处理公共事务便都成了“不得安宁”。劳动、工作和行动各自的目的消失在这个尺度下。马克思和尼采倒转传统等级，也可能继续沿用一个原则统摄全部活动的做法。

阿伦特要恢复各类活动本身的关切。生命的维持、世界的建造、人与人的共同行动，都有需要单独说明的性质。她保留沉思经验的问题，同时拒绝让它预先决定其他活动的高低。`,
      [['把所有活动都放在“是否打扰沉思”的尺度下，会遗漏什么？', '理解', ['contemplation', 'labor', 'action']], ['倒转一套等级为什么仍可能保留原来的思想框架？', '理解', ['contemplation']], ['参与公共事务与“忙了一整天”的差别在哪里？', '比较', ['public', 'action']]], ['contemplation', 'public', 'action']],
    [3, '永恒对不朽', '被记住与超越时间', 'concept', 250, 262,
      `不朽与永恒指向两种不同的关切。希腊人的不朽愿望仍留在这个世界里：一个人的生命结束了，他的作品、业绩和言辞继续存在。自然以循环延续，个人的一生却有开端和终结，留下值得记忆的痕迹便成为一种回应。

永恒经验试图越出时间和人类事务。哲学家在沉思中追求它，任何动作甚至内在的言语都可能打断这种宁静。于是，投身城邦并赢得身后声名，和离开人群体验永恒，出现了紧张关系。

写书提供了一个微妙例子。思想家可以关心永恒，但把思想写下来时，他已选择让一个作品留在世界。这一步需要工作的帮助，也回应了持久的愿望。

罗马帝国的覆灭让尘世作品的脆弱暴露出来。基督教把永生赋予个体，又改变了对公共功业的期待。阿伦特追问的是：当人不再关心共同世界能否超越自己的寿命，政治生活会失去怎样的动力？`,
      [['永恒和不朽在时间关系上有什么差别？', '比较', ['contemplation', 'world']], ['思想家把思想写成书，为什么重新进入了积极生活？', '理解', ['work', 'contemplation']], ['为后人保存一座公共建筑，是否体现对尘世不朽的关切？', '应用', ['world', 'public']]], ['contemplation', 'world', 'work', 'public']],
  ], [
    ['人的条件会制约活动，也由活动改变，怎样理解这个往返关系？', '理解', ['world', 'action']],
    ['劳动、工作、行动各自的关切，能否用效率这一条尺度比较？', '反驳', ['labor', 'work', 'action']],
    ['如果一个社会只关心当代人的需要，它如何为后来者保存世界？', '应用', ['world', 'natality']],
  ]),
  chapter(2, '公共和私人领域', '公共生活让不同的人围绕共同事物相见，私人生活提供遮蔽和休息。阿伦特借城邦与家庭的历史区分，追问现代“社会”的出现怎样改变两者。公开可见不等于已有公共领域，许多私人经历被大量展示也未必形成共同世界。财产、财富和亲密性各有不同作用，活动需要与其性质相称的位置。', [
    [4, '人：一种社会的或政治的动物', '在一起生活与共同议事', 'concept', 318, 334,
      `人依赖他人生活，动物也有群居和合作。仅仅承认相互依赖，还不足以说明政治。阿伦特认为，把亚里士多德的“政治动物”译成“社会动物”，掩盖了希腊人关心的特殊生活方式。

行动与言说共同建立人类事务的空间。在城邦的自我理解中，公共决定靠彼此说服。命令与强迫则属于另一套关系，在家庭和对外统治中常见。一个人能发声，仍可能没有让他的言语真正参与公共事务的机会。

荷马把伟大的言辞与业绩放在一起。恰当的话语可以回应处境、改变人际关系，本身就具有行动性。后来言说越来越被看成说服技术，言与行才逐步分开。

这一区分把问题带回共同生活的质量：人们究竟只是因需要而聚在一起，还是能以不同立场共同决定事情？劳动可以独自进行，制作也能独自完成。行动始终需要他人的在场与回应，谁都不能一个人建立这种关系。`,
      [['群居为什么不能充分解释阿伦特所说的政治？', '理解', ['plurality', 'action']], ['一句话在什么条件下本身构成行动？', '应用', ['action', 'public']], ['一个人能说话却没有公共发言的位置，缺少的是什么？', '理解', ['public']]], ['action', 'plurality', 'public']],
    [5, '城邦与家庭', '自由的空间由谁承担代价', 'comparison', 336, 366,
      `在古希腊经验中，家庭处理维生和繁衍，城邦提供公民相见的自由空间。这个自由有具体条件：生活必需先得到照料，公民才可能离开家庭。两种场所按不同关系组织。

| 家庭 | 城邦 |
| --- | --- |
| 生存需要推动活动 | 公民以言行参与公共事务 |
| 家长统治家人和奴隶 | 被承认为同侪的人相见 |
| 严格的不平等关系 | 公民间追求不统治也不被统治 |

这种城邦平等以大量被排除的人为前提。妇女、奴隶和许多劳动者承担必要活动，无法分享同样的公共资格。读到古代自由时，必须把这笔代价一起读进去。

现代国家常被理解成一个巨型家庭，公共事务趋向统一的生计管理。古代的界线因而难以直接套用。阿伦特借它追问：当政治只负责保护生产和生活，公民共同参与的自由会放在哪里？离开私人庇护并在众人面前行动，还涉及暴露自己和承担风险的勇气。`,
      [['古希腊城邦的平等为什么依赖大量不平等者？', '背景', ['public', 'private']], ['把国家看成巨型家庭，会怎样改变政治的任务？', '理解', ['public', 'private']], ['离开私人生活进入公共事务，为什么需要勇气？', '理解', ['action', 'public']]], ['public', 'private', 'action']],
    [6, '社会的兴起', '规则可以让谁来统治', 'relations', 368, 408,
      `现代社会把原先隐藏在家庭中的经济活动带到公开场合。人口的生计被统一组织，家庭逐渐融入更大的管理体系。于是，公共与私人之间出现了阿伦特称为“社会”的领域。

社会期待成员遵守可预期的行为。规则、角色和统计规律让整体容易管理，也可能挤压自发行动的空间。在这样的关系里，个人首先按职位和功能被理解，独特言行则被视为偏差。

官僚制让这一问题更尖锐。找不到一个亲自下令的统治者，规则仍然能够持续支配人。无人统治甚至可能使人更难追问谁对决定负责。统计模型可以描述重复行为，却容易把改变历史的罕见事件放进噪声。

阿伦特同时看到，劳动进入公开组织后，分工和生产力获得巨大增长。问题在于，增长是否成了所有公共事务的共同尺度。需要可预测的运行，也需要允许不同的人开启新事。两者怎样共存，不能只靠提高管理精度回答。`,
      [['官僚制的“无人统治”怎样让责任更难追问？', '理解', ['public', 'action']], ['统计上的异常事件为何可能具有政治意义？', '比较', ['action', 'plurality']], ['社会需要可预测的行为，怎样给自发行动留下空间？', '应用', ['action', 'public']]], ['public', 'action', 'plurality', 'labor']],
    [7, '公共领域：共同', '桌子让人相聚，也隔开人', 'concept', 410, 438,
      `公共有两层相连的意思。一个事物能被众人看到和听到，它获得公开性。人们还需要一个共同世界，让不同位置的人围绕同一件事相见。这一世界包括器物、制度和共同经历，地球只是它得以存在的一般环境。

阿伦特以桌子作比喻。桌子把围坐的人聚拢，也保持他们之间的距离。每个人看见不同的侧面，却知道正在讨论同一张桌子。共同世界由这种多样视角支撑，要求所有人复制一个观点会破坏它。

疼痛和爱情显示公开性的边界。某些体验对个人极重要，却难以原样呈现给众人。把私人经历反复展示，并不会自动建立公共领域。

共同世界还需要超越个人寿命。它承接前人的痕迹，也为后来者留下位置。公众赞赏若只是被迅速消费的满足感，就难以完成这个任务。公共生活要保存事物的持久性，也要保存看待它们的不同角度。`,
      [['桌子的比喻怎样说明共同世界既联系又分开人？', '理解', ['world', 'public']], ['一个私人体验被很多人观看，为什么仍可能缺少公共性？', '比较', ['private', 'public']], ['观点完全一致为何可能破坏共同世界？', '反驳', ['world', 'plurality']]], ['world', 'public', 'private', 'plurality']],
    [8, '私人领域：财产', '财富与世界中的一席之地', 'comparison', 440, 462,
      `财产和财富在现代语言中常常重叠，阿伦特却用它们拆开两种关系。财富是可以积累、流动和消费的资源。财产原先意味着一个人在世界中有属于自己的处所，由这个处所获得共同体中的位置。

| 关注对象 | 主要作用 |
| --- | --- |
| 财富 | 支持生活，免受贫困的紧迫需要 |
| 财产的处所 | 提供遮蔽，标出一个人属于世界的位置 |

在古代，一个富裕的外邦人或奴隶也可能没有公民的处所。相反，拥有处所的家长即使贫穷，仍可能保有其身份。房屋边界与城市法律都带有把私人和公共领域分开、同时保护两者的含义。

私人生活因缺少他人的观看而有被剥夺的一面，但它同样能提供公共世界无法替代的庇护。没有可以退回的地方，人也难以稳定地出现在公共生活中。因而，保护个人财富增长与保护私人处所，可能走向不同方向。这里的历史区分解释两种功能，不能直接转换成今天按财产分配政治资格的主张。`,
      [['财产作为处所，怎样区别于可流动的财富？', '比较', ['private', 'world']], ['私人庇护为什么也是公共生活的条件？', '理解', ['private', 'public']], ['有收入却缺少稳定居所的人，怎样体现这个区分？', '应用', ['world', 'private']]], ['world', 'private', 'public']],
    [9, '社会的和私人的', '每件事都公开，生活会怎样', 'prose', 464, 482,
      `当公共事务围绕私人财富的积累组织起来，政府与共同世界的关系会发生变化。财富的持久靠过程不停增长，公共世界的持久则靠相对稳固的事物留存。过程与结构有不同的时间方式。

土地、房屋和器物一旦只按可交换价值理解，它们所在的位置与私人使用的意义就容易变弱。阿伦特沿着这个变化追问：一个人能依靠的是世界中的处所，还是仅剩身体的力量和出售它的能力？

亲密关系让私人体验更丰富，却未必能替代一个实际的庇护空间。持续处在他人的观看之下，生活会失去隐藏的深度。人需要见面和被看见，也需要能够退回去，让某些事情免受公共注视。

同样，生存需要得到满足也不会自动产生自由。减少必然性的压力只提供条件，人们还要建立能共同参与的场所。这一节关心的界线由活动的性质决定：哪些东西需要公开，哪些东西必须受到遮蔽。`,
      [['资本增长的持久与共同世界的持久，有什么不同？', '比较', ['world', 'process']], ['亲密关系为什么不能完全代替真实的私人处所？', '理解', ['private', 'world']], ['生活必需得到满足后，公共自由还需要什么条件？', '应用', ['public', 'action']]], ['world', 'private', 'public', 'process']],
    [10, '人类活动的定位', '善行为什么抵触公开展示', 'quote', 484, 504,
      `阿伦特用基督教的善行讨论活动的位置。善行只关心他人的需要，一旦行善者开始观看、记住自己的善，活动就可能混入自我评价和公众认可。公开慈善仍可以有益，却和绝对意义上的善有了不同性质。

这是一种极端例子：善行连施予者自己的见证都要避开。思想则能够在独处中与自己对话，还能经过记忆和书写留成作品。二者都可能远离公共事务，和世界相处的方式却并不相同。

这一分析也解释马基雅维利对政治与宗教的紧张感。政治判断涉及可见的公共后果，不能只靠行动者内心是否纯洁来裁定。用隐藏的善意担任公共角色，可能破坏行善自身，也可能让公共决定失去可讨论的依据。

这一节并不提供“所有善都应隐藏”的通用处方。阿伦特讨论的是善行的特定宗教含义，并借它提出更一般的问题：给不同活动安排同一个曝光方式，会不会改变活动本身？`,
      [['公开慈善与阿伦特讨论的绝对善行，差别在哪里？', '比较', ['public', 'private']], ['独处的思想为什么还能成为世界中的作品？', '理解', ['contemplation', 'work']], ['公共决定能否只由作决定者的善意来辩护？', '反驳', ['action', 'public']]], ['public', 'private', 'contemplation', 'work']],
  ], [
    ['展示私人生活与建设公共领域，各自需要什么条件？', '比较', ['private', 'public']],
    ['规则稳定运行时，谁负责听见那些无法被规则处理的意见？', '应用', ['plurality', 'action']],
    ['怎样同时保住私人庇护与公共参与，避免其中一方吞没另一方？', '应用', ['private', 'public']],
  ]),
  chapter(3, '劳动', '劳动回应生命反复出现的需要，产物往往随着消费迅速消失。工作产物能够相对持久，两种活动不能只按难度、收入或是否用脑划分。阿伦特在这一章与洛克、斯密、马克思对话，肯定劳动力的增殖能力，也追问生产和消费的循环怎样变成社会的共同尺度。工具能减轻辛苦，公共自由与共同世界仍须另外建立。', [
    [11, '“我们身体的劳动和我们双手的工作”', '区别要看留下什么', 'comparison', 710, 740,
      `劳动和工作常被当成同义词，阿伦特先从欧洲语言里保留的差别入手。劳动关联持续的辛劳与需要，工作还能指一个完成的作品。古代对生存必然性的轻视，以及后来沉思高于一切活动的传统，都遮蔽了这个区分。

现代赞扬劳动的生产力，也容易把所有活动放在“创造价值”这一条尺度下。阿伦特另问：活动结束以后，留下来的东西具有怎样的世界关系？

| 常用区分 | 它无法充分说明的事 |
| --- | --- |
| 脑力与体力 | 思想要进入世界，仍需要书写和制作 |
| 熟练与不熟练 | 烧饭和造屋都可能需要很高技能 |
| 生产与非生产 | 维持生命的服务也有不可替代的作用 |

劳动力还具有超出自身生存需要的余力，能够为他人生产生活资料。阿伦特重视马克思对这个剩余的分析，同时坚持把生命的再生产与世界中新增持久物分开。同一个职业可能包含两类活动，职业名称无法代替判断。`,
      [['为什么脑力与体力不能代替劳动与工作的区分？', '比较', ['labor', 'work']], ['劳动力的剩余为什么与成品是否持久是两个问题？', '理解', ['labor', 'world']], ['照护服务没有留下器物，它的必要性应怎样描述？', '应用', ['labor']]], ['labor', 'work', 'world']],
    [12, '世界的物性', '面包和桌子有不同寿命', 'concept', 742, 752,
      `面包师与木匠的辛苦程度无法说明面包与桌子的根本差别。面包很快进入身体的生命过程，桌子却可以陪伴几代人。判断产物的处所、用途和留存时间，劳动与工作的区分才真正清楚。

消费品不断出现和消失，使用物让环境变得熟悉，给日常交往一个相对稳定的背景。世界的物性由这些能够在活动结束后留下的东西支撑。耐久程度各不相同，共同点是物与制造活动可以分离。

言说、行动和思想也会消失。一次公开发言需要他人的观看、倾听和记忆，才成为共同经历。若要更长久地存在，还需要转成记录、诗、图像或纪念物。思想成为书稿，也经历了类似转换。

因此，活动之间存在相互依赖。工作为其他活动提供留存的载体，却不能把活的经历原样保存。纸上的文字延长记忆，也替代了现场的语气和回应。记录的持久与经历的鲜活之间，总会留有距离。`,
      [['面包与桌子的区别为什么比面包师与木匠的区别更关键？', '理解', ['labor', 'work', 'world']], ['一次公开发言怎样成为可以留存的共同记忆？', '理解', ['action', 'work']], ['文字保存言行时，会增加什么，也会失去什么？', '比较', ['work', 'action']]], ['world', 'work', 'labor', 'action']],
    [13, '劳动和生命', '做完之后，又得再做', 'relations', 754, 768,
      `身体需要食物，食物使人恢复力量，恢复的力量又投入劳动。劳动和消费构成同一生命循环的两个阶段。需要一再出现，活动也一再重来，单次完成无法终结它。

劳动 → 生活资料 → 消费 → 生命恢复 → 劳动

制作一张桌子有可辨认的终点，维持生活却没有同样的完成时刻。人与自然的新陈代谢会一直持续到个体死亡。相对稳固的世界，让一个人的出生、经历和死亡能够显示为有开端、有终点的生活故事。

劳动还有维护世界的一面。打扫房屋、清理废物、阻挡自然侵蚀，都帮助器物继续存在，却要日复一日进行。赫拉克勒斯清扫牛圈在神话中是一次伟大任务，现实里的清扫不会一劳永逸。

循环与线性各自说明不同对象。身体的生命循环维持我们，个人在世界中的故事具有不可重复性。把全部生活只当作重复的维持过程，会遗漏那些使一个人被辨认、被记住的事件。`,
      [['劳动与消费怎样互相接续，为什么没有最终完成的时刻？', '理解', ['labor', 'process']], ['维护一栋房屋的清扫，与制造这栋房屋有什么不同？', '比较', ['labor', 'work']], ['人的生命循环与可讲述的生活故事，时间结构有何差别？', '比较', ['world', 'action']]], ['labor', 'work', 'process', 'world', 'action']],
    [14, '劳动与繁殖', '劳动力为什么能带来剩余', 'concept', 770, 792,
      `一个人生产出供自己恢复生命的资料后，力量未必耗尽。多余的力量还可以养活他人，这使劳动具有增殖能力。阿伦特认为，马克思用活的劳动力解释生产力，抓住了劳动与生命繁殖之间的关联。

这份富余与物的耐久性没有必然联系。更多面包能够供养更多人，但面包不会因此像桌子一样留下。生命过程关心产物是否丰富，世界的建造还要关心它们能否持存。

劳动的愉悦也有特定节律。辛苦之后进食、休息和恢复，能带来活着的满足。它不同于完成作品后的成就感。贫困让消耗没有充分恢复，过度闲散也可能破坏这种循环的平衡。

阿伦特还指出马克思思想中的张力：劳动被视为最具人性的生产能力，自由的目标又被放在摆脱必要劳动之后。这个张力指向一个实质问题。人如果主要靠劳动解释自己，当必要劳动缩减时，他还能怎样理解自由活动和共同生活？`,
      [['劳动力的增殖能力为什么无法保证产品更耐久？', '理解', ['labor', 'work']], ['辛劳后恢复的喜悦与作品完成的成就感，有何差别？', '比较', ['labor', 'work']], ['把劳动放在人性中心，又追求摆脱劳动，会产生什么张力？', '反驳', ['labor', 'action']]], ['labor', 'work', 'world']],
    [15, '财产的私人性和财富', '身体为何成了占有的起点', 'prose', 794, 818,
      `洛克从一个人对身体的拥有，说明劳动为什么能够支持私人占有。身体和身体的痛苦无法由他人直接分担，这个起点让占有具有强烈的私人性。劳动把自然提供的东西带进生命过程，私人占有也随之取得理由。

阿伦特追问，这种占有关系怎样区别于人在世界中拥有一个稳定处所。前者落在身体的机能，后者与共同世界的边界相连。即使财产从劳动取得，它也能限制财富增长，使一部分事物被保存下来。

财富积累则可能借社会整体延长生命。个人会死，集体的积累过程却不断继续。土地、住宅和其他固定之物被转换成可流动的资源，原先保护个人位置的边界便容易被冲开。

疼痛提供了一个极端经验。强烈疼痛会把人拉回身体，使外部世界退远。阿伦特借此说明：私人经验确实强烈，但不能单靠它建立共同世界。物品丰裕和劳动时间缩短，也不能替代人与人共同观看、讨论和行动的空间。`,
      [['洛克为什么从身体的私人性解释占有？', '背景', ['labor', 'private']], ['稳定处所怎样限制无限财富积累的过程？', '理解', ['world', 'process']], ['疼痛为何既十分真实，又难以支撑共同世界？', '理解', ['private', 'world']]], ['private', 'world', 'labor', 'process']],
    [16, '工作器具与劳动分工', '机器减轻辛苦，改变了什么', 'comparison', 820, 850,
      `工具是工作的产物，可以增强身体力量、减轻劳动辛苦。它们改变人的负担和产出数量，身体持续需要生活资料这一条件仍在。制作的完成点由成品规定，维持生活的服务却不断被消耗。

| 工作的专门化 | 劳动分工 |
| --- | --- |
| 成品需要不同的技术配合 | 过程被拆成可接续的环节 |
| 技能以其差异互相补充 | 劳动力以可相加的数量组织 |
| 产品完成意味着制作结束 | 整体过程可以继续运转 |

这组区分解释了工业生产的一种变化。即使制造的是桌椅，生产也可能以不停重复的劳动方式组织。为了让过程持续，耐用的使用物又被当作必须迅速替换的消费品。

阿伦特因而把器具问题连到消费能力。产出不断增加，个人能够消费的东西却有限，社会就推动更快的消耗。技术减轻了痛苦，仍须追问生产究竟服务于什么。一个更轻松的循环，也可能让人更难察觉自己仍受这个循环支配。`,
      [['工作的专门化为什么强调技能差异，劳动分工又强调什么？', '比较', ['work', 'labor']], ['制造耐用品的工厂为何也可能具有劳动的过程性质？', '理解', ['process', 'work']], ['机器减轻辛苦之后，自由还缺少什么条件？', '应用', ['labor', 'public']]], ['work', 'labor', 'process', 'public']],
    [17, '一个消费者社会', '闲暇会自动带来自由吗', 'prose', 852, 874,
      `消费者社会也是劳动者社会，因为劳动与消费接续同一生命过程。它把严肃活动普遍解释成谋生，把不为谋生的活动归入爱好。建筑的目标是房屋，医疗的目标是健康，这些实际内容容易被收入与购买力遮住。

自动化能够缩短必要劳动，但剩下的时间不会自行转成公共行动或持久的创造。更多闲暇可能只扩大消费。阿伦特质疑的是这条自动推论：劳动力减少消耗，便会像储存的能量一样流向其他活动。

当桌椅、房屋甚至文化作品都以更快的消耗来理解，生产越丰富，世界反而越难留下稳固的东西。消费品支持生命，耐用品提供居所，两者都重要，但社会若只保留前一种尺度，就会把共同世界磨成连续的更换过程。

这一批判落在社会的理想上。生活更轻松、物品更丰富，未必让人发现还有别的生活关系。自由需要人能共同发言、开始行动，也需要一个值得长期照料的世界。它不能由消费的轻便程度直接推出。`,
      [['劳动者社会和消费者社会为什么是同一过程的两面？', '理解', ['labor', 'process']], ['必要劳动减少，为什么不能自动推出公共自由增加？', '反驳', ['labor', 'public', 'action']], ['怎样判断一件文化作品被当作消费品，还是被保存为世界之物？', '应用', ['world', 'work']]], ['labor', 'process', 'world', 'work', 'public', 'action']],
  ], [
    ['同一职业中的活动，如何按生命维持与世界建造重新区分？', '应用', ['labor', 'work']],
    ['减轻必要劳动后，怎样建立公共行动的机会而非继续扩大消费？', '应用', ['labor', 'action', 'public']],
    ['一种产品越丰富、替换越快，是否可能让共同世界更脆弱？', '反驳', ['world', 'process']],
  ]),
];

const authors = [
  { id: 'arendt', name: '汉娜·阿伦特', years: '1906—1975', bio: '政治思想家。研究极权主义、革命、公共生活，以及人在言说和行动中开启新事的能力。', initial: '阿', color: '#b98552', tags: ['政治思想', '公共生活'] },
  { id: 'stanley', name: '肯尼斯·斯坦利', bio: '计算机科学家。研究神经进化、开放式探索和创造过程，与乔尔·雷曼合著《为什么伟大不能被计划》。', initial: '斯', color: '#ab7554', tags: ['人工智能', '开放式探索'] },
  { id: 'lehman', name: '乔尔·雷曼', bio: '人工智能研究者。参与新奇性搜索和开放式进化研究，与肯尼斯·斯坦利合著《为什么伟大不能被计划》。', initial: '雷', color: '#6c947a', tags: ['进化计算', '创造性'] },
  { id: 'marquez', name: '加夫列尔·加西亚·马尔克斯', years: '1927—2014', bio: '哥伦比亚小说家。《百年孤独》把家族、历史、记忆与神异经验织进马孔多的生活。', initial: '马', color: '#a1844d', tags: ['小说', '拉丁美洲文学'] },
  { id: 'borges', name: '豪尔赫·路易斯·博尔赫斯', years: '1899—1986', bio: '阿根廷作家。以短篇、诗和随笔探索迷宫、无限、时间、书籍与虚构的边界。', initial: '博', color: '#827aa2', tags: ['小说', '时间'] },
  { id: 'nietzsche', name: '弗里德里希·尼采', years: '1844—1900', bio: '德国哲学家。以格言、论辩和文学形式追问道德、价值、生命与文化。', initial: '尼', color: '#957564', tags: ['哲学', '价值'] },
  { id: 'montaigne', name: '米歇尔·德·蒙田', years: '1533—1592', bio: '法国作家。《随笔集》从自己的经验出发，讨论判断、习惯、友谊及人的局限。', initial: '蒙', color: '#8b9372', tags: ['随笔', '自我观察'] },
  { id: 'mary-mccarthy', name: '玛丽·麦卡锡', years: '1912—1989', bio: '美国小说家和评论家。1958 年在《纽约客》发表《Philosophy at Work》，评论《人的境况》。', initial: '麦', color: '#9b7771', tags: ['小说', '书评'] },
  { id: 'canovan', name: '玛格丽特·加诺芬', years: '1939—2018', bio: '英国政治思想研究者。研究民粹主义与阿伦特，为《人的境况》第二版撰写导言。', initial: '加', color: '#6f8574', tags: ['政治思想', '阿伦特研究'] },
  { id: 'danielle-allen', name: 'Danielle Allen', bio: '政治理论研究者。研究民主、公民教育与平等，为《人的境况》六十周年版撰写序言。', initial: '艾', color: '#94806c', tags: ['民主', '公民教育'] },
];

authors.push(
  { id: 'marx', name: '卡尔·马克思', years: '1818—1883', bio: '哲学家、政治经济学研究者。《资本论》分析资本主义生产与劳动力。阿伦特在本书中与他的劳动观展开对话。', initial: '马', color: '#91675b', tags: ['政治经济学', '劳动'] },
  { id: 'locke', name: '约翰·洛克', years: '1632—1704', bio: '英国哲学家。《政府论》讨论政治权力与财产，其劳动和占有的关系是本书的重要讨论对象。', initial: '洛', color: '#8b8469', tags: ['政治思想', '财产'] },
  { id: 'smith', name: '亚当·斯密', years: '1723—1790', bio: '苏格兰思想家。研究道德、交换与社会财富，《国富论》讨论分工与生产性劳动。', initial: '斯', color: '#7b927f', tags: ['政治经济学', '分工'] },
  { id: 'aristotle', name: '亚里士多德', bio: '古希腊哲学家。研究政治、伦理、逻辑和自然。阿伦特借其政治动物与生活方式的区分重读城邦经验。', initial: '亚', color: '#94896c', tags: ['古希腊', '政治'] },
  { id: 'plato', name: '柏拉图', bio: '古希腊哲学家。以对话录讨论知识、正义与城邦，本书考察其以制作模型理解政治的路径。', initial: '柏', color: '#748393', tags: ['古希腊', '哲学'] },
  { id: 'socrates', name: '苏格拉底', bio: '古雅典思想者。通过交谈追问伦理与知识，没有留下自己的著作，其生平由他人记述。', initial: '苏', color: '#8b9174', tags: ['对话', '伦理'] },
  { id: 'machiavelli', name: '尼科洛·马基雅维利', years: '1469—1527', bio: '佛罗伦萨政治思想家。讨论共和政治、统治与公共行动，《君主论》《论李维》是其主要著作。', initial: '马', color: '#90755f', tags: ['共和政治', '政治思想'] },
  { id: 'homer', name: '荷马', bio: '古希腊史诗传统中的诗人，《伊利亚特》和《奥德赛》归于其名下。本书借史诗中的言辞与业绩讨论行动。', initial: '荷', color: '#a68b63', tags: ['史诗', '古希腊'] },
  { id: 'hobbes', name: '托马斯·霍布斯', years: '1588—1679', bio: '英国哲学家。《利维坦》讨论共同体与主权，阿伦特考察其构造国家的模型。', initial: '霍', color: '#8b737b', tags: ['政治思想', '主权'] },
  { id: 'vico', name: '詹巴蒂斯塔·维科', years: '1668—1744', bio: '意大利思想家。《新科学》探索历史、语言与人类制度，重视人对自己所造之物的认识。', initial: '维', color: '#a08965', tags: ['历史', '知识'] },
  { id: 'bentham', name: '杰里米·边沁', years: '1748—1832', bio: '英国思想家。发展功利主义，以快乐与痛苦讨论行为和制度的评价标准。', initial: '边', color: '#7b8990', tags: ['功利主义', '伦理'] },
  { id: 'descartes', name: '勒内·笛卡尔', years: '1596—1650', bio: '法国哲学家和数学家。以方法怀疑与意识的确定性探索知识基础。', initial: '笛', color: '#8a7795', tags: ['认识论', '数学'] },
);
const personAliases = {
  arendt: ['阿伦特'], marx: ['马克思'], locke: ['洛克'], smith: ['斯密'],
  nietzsche: ['尼采'], 'mary-mccarthy': ['麦卡锡'], canovan: ['加诺芬'],
  machiavelli: ['马基雅维利'], hobbes: ['霍布斯'], vico: ['维科'], bentham: ['边沁'], descartes: ['笛卡尔'],
};

const concepts = [
  ['labor', '劳动', '维持生命及其再生产的活动，随着需要一再出现。', '劳动怎样区别于日常说的工作？', ['labor', '劳动动物']],
  ['work', '工作', '制造相对持久的使用物，为人建立人造世界的活动。', '为什么造桌子与做饭被归为不同活动？', ['work', '技艺人']],
  ['action', '行动', '不同的人在言说与参与中展开关系，能够开启新事的活动。', '阿伦特的行动与通常说的执行任务有什么差别？', ['action']],
  ['public', '公共领域', '人们能被看见和听见，并围绕共同世界相见的空间。', '公开可见为什么不一定构成公共领域？', ['公共空间', '显现空间']],
  ['private', '私人领域', '为身体需要和需要隐藏的生活提供庇护的领域。', '私人庇护怎样支持公共参与？', ['私域', '私人生活']],
  ['plurality', '复数性', '人们同为人却各不相同，每个人都能提供不同的视角和开端。', '复数性为什么是政治生活的条件？', ['人的复数性']],
  ['natality', '诞生性', '新人不断来到世界，由此关联人开启新事的能力。', '诞生性如何把出生与政治行动联系起来？', ['新的开端', '开端启新']],
  ['promise', '承诺', '通过相互约束在不可预测的未来中建立有限的稳定关系。', '承诺怎样保留自由，又减轻不可预测性？', []],
  ['forgiveness', '宽恕', '让行动者不被过去的行为永远困住，打断后果与报复链条的能力。', '宽恕怎样区别于遗忘和取消责任？', []],
  ['world', '世界', '人与人共同居住的人造事物与关系背景，具有超越个体生命的持久性。', '地球与共同世界为什么需要分开理解？', ['共同世界', '世界性']],
  ['alienation', '世界异化', '人与相对稳固的共同世界疏离，经验向自身或无尽过程回缩的变化。', '世界异化怎样联系财富流动与现代科学？', []],
  ['earth-alienation', '地球异化', '以超出地球居民日常经验的宇宙立场理解和介入地球自然的变化。', '地球异化与世界异化各涉及什么条件？', []],
  ['power', '权力', '人们协同行动时形成并维持的能力，依赖持续共同在场。', '权力怎样区别于个人力量和暴力？', []],
  ['fabrication', '制造', '依据预先模型加工材料并获得成品的活动，与工作的过程相关。', '为什么不能把人当作制造新社会的原材料？', ['制作', '物化']],
  ['process', '过程', '可以连续展开并越出单次活动边界的运动，劳动与行动有不同的过程性质。', '劳动的循环过程与行动的连锁过程有何不同？', ['生命过程']],
  ['contemplation', '沉思', '传统中面向永恒并要求宁静的体验，区别于思想的内在对话。', '沉思和思考在阿伦特的分析中有什么差别？', ['沉思生活', '永恒']],
];
const entities = [
  { id: eid('book'), name: '人的境况', kind: 'book', bookId, description: '汉娜·阿伦特于 1958 年出版的著作，分析劳动、工作、行动及现代人的活动条件。', question: '《人的境况》为什么需要区分劳动、工作和行动？' },
  ...authors.map(a => ({ id: a.id, name: a.name, kind: 'author', authorId: a.id, description: a.bio, aliases: personAliases[a.id] || [] })),
  ...concepts.map(([name, label, description, question, aliases]) => ({ id: eid(name), name: label, kind: 'concept', description, question, aliases })),
  { id: eid('heracles'), name: '赫拉克勒斯', kind: 'person', description: '希腊神话中的英雄。清扫奥吉阿斯牛圈是其十二项劳作之一，本书以此对照现实维护工作的反复性。', question: '赫拉克勒斯清扫牛圈与日常清扫有何区别？' },
  { id: eid('jesus'), name: '耶稣', kind: 'person', description: '拿撒勒耶稣，基督教的核心人物。阿伦特从其善行与宽恕的教导中提取人类事务的经验。', question: '阿伦特怎样把宽恕的教导放进公共行动的讨论？' },
  { id: eid('archimedes'), name: '阿基米德', kind: 'person', description: '古希腊数学家。阿伦特用阿基米德点指从地球之外理解和处理地球的参照立场。', question: '阿基米德点在本书中怎样由几何立场变成认识条件？' },
];

const reviews = [
  {
    id: `${bookId}-review01`, authorId: 'mary-mccarthy', title: '熟悉的事物，重新清晰起来',
    markdown: `玛丽·麦卡锡在 1958 年的书评中，注意到阿伦特能把人们早已习惯的观念重新打开。阅读先带来惊讶，随后那些区别变得清楚，仿佛一直就在眼前。

劳动与工作的区分是她选出的关键例子。食物被消费，桌子留在世界中供人使用。重复的维持活动与相对持久的作品，不能只按辛苦程度区别。麦卡锡认为，阿伦特正借这些古老词语照见现代人的生活。`,
    source: { label: 'Mary McCarthy，《Philosophy at Work》，《纽约客》，1958 年', url: 'https://www.newyorker.com/magazine/1958/10/18/1958-10-18-198-tny-cards-000059912' },
    entityIds: ['mary-mccarthy', 'arendt', eid('labor'), eid('work')],
    questions: [question(`${bookId}-review01-q01`, '为什么熟悉的生活需要重新作概念区分？', '理解', ['labor', 'work']), question(`${bookId}-review01-q02`, '麦卡锡为什么用面包和桌子解释劳动与工作？', '理解', ['labor', 'work']), question(`${bookId}-review01-q03`, '一个活动很辛苦，就一定属于劳动吗？', '反驳', ['labor', 'work'])],
  },
  {
    id: `${bookId}-review02`, authorId: 'canovan', title: '开端带来希望，也带来失控',
    markdown: `加诺芬在导言中把阿伦特读作开端的思想家。新人能够开始新事，人类事务因此始终保留意外。但一个人的开端会与他人的行动纠缠，结果常常越出最初意图。

她提醒读者同时看见希望与危险。公共生活能让人共同开启改变，也需要承诺和宽恕来处理不可预测与不可逆的后果。劳动、工作、行动的区分帮助人认识自己的能力，并不提供一张可按图施工的社会蓝图。`,
    source: { label: 'Margaret Canovan，《人的境况》第二版导言，本地译本第 104—175 行', url: 'https://press.uchicago.edu/dam/ucp/books/pdf/course_intro/978-0-226-58660-1-introduction.pdf', startLine: 104, endLine: 175 },
    entityIds: ['canovan', 'arendt', eid('natality'), eid('action'), eid('promise'), eid('forgiveness')],
    questions: [question(`${bookId}-review02-q01`, '行动为什么同时带来希望与危险？', '理解', ['action', 'natality']), question(`${bookId}-review02-q02`, '社会蓝图为什么可能压制人的复数性？', '反驳', ['plurality', 'fabrication']), question(`${bookId}-review02-q03`, '承诺与宽恕分别回应行动的哪一种困难？', '比较', ['promise', 'forgiveness'])],
  },
  {
    id: `${bookId}-review03`, authorId: 'danielle-allen', title: '技术能力增长，判断由谁来做',
    markdown: `Danielle Allen 在六十周年版序言中，把本书的问题带回技术统治。计算能够回答原因与结果，却无法单独决定共同体应当追求什么、承担怎样的代价。公共判断需要人们在共享语言中讨论理由。

她用刑事司法、气候变化和经济政策说明这个缺口。科学知识应当进入公共讨论，公民也需要能够诊断生活条件、比较不同判断。技术的力量越大，劳动、工作和行动的区分越能提醒人们，还有哪些决定需要共同作出。`,
    source: { label: 'Danielle Allen，2018 年序言，本地译本第 48—103 行', url: 'https://press.uchicago.edu/ucp/books/book/chicago/H/bo29137972.html', startLine: 48, endLine: 103 },
    entityIds: ['danielle-allen', 'arendt', eid('public'), eid('action'), eid('plurality')],
    questions: [question(`${bookId}-review03-q01`, '经验数据为什么不能独自给出政策应追求的目标？', '理解', ['public']), question(`${bookId}-review03-q02`, '专业知识怎样支持公民判断，又不替代公共讨论？', '应用', ['public', 'plurality']), question(`${bookId}-review03-q03`, '把政治问题都当成技术问题，会遗漏哪些分歧？', '反驳', ['action', 'public'])],
  },
];

const comments = [
  { id: `${bookId}-comment01`, authorId: 'canovan', body: '记住开端，也记住开端的后果。行动的希望和危险，往往出自同一个地方。', constructive: 0, mischief: 0, likes: 0, ai: true },
  { id: `${bookId}-comment02`, authorId: 'mary-mccarthy', body: '先看看桌子，再看看午饭。词典把它们挤在一起，生活没有。', constructive: 0, mischief: 0, likes: 0, ai: true },
  { id: `${bookId}-comment03`, authorId: 'stanley', body: '无法预知的开端很熟悉。不过搜索的意外与公共行动的责任，值得分开谈。', constructive: 0, mischief: 0, likes: 0, ai: true },
  { id: `${bookId}-comment04`, authorId: 'borges', body: '我想到一座每晚自动改写书籍的图书馆。藏书更多了，世界却未必更持久。', constructive: 0, mischief: 0, likes: 0, ai: true },
  { id: `${bookId}-comment05`, authorId: 'nietzsche', body: '重复不是问题的终点。先问：这是谁肯定的生活，又是谁替他承受它？', constructive: 0, mischief: 0, likes: 0, ai: true },
  { id: `${bookId}-comment06`, authorId: 'montaigne', body: '我关上门写自己，也把书送到别人眼前。私人和公共这两扇门，看来都得留着。', constructive: 0, mischief: 0, likes: 0, ai: true },
];

const laterChapters = JSON.parse(readFileSync(join(root, 'scripts', 'content-arendt.ch456.json'), 'utf8'));
const data = {
  schemaVersion: 1, revision: '2026-10-11-v1',
  book: {
    id: bookId, title: '人的境况', subtitle: '汉娜·阿伦特 · 劳动、工作与行动', authors: ['arendt'],
    headline: ['你在忙什么？', '《人的境况》速览'], tags: ['政治哲学', '公共生活', '现代性'],
    overview: '忙着维持生活，忙着建造东西，或忙着和别人共同改变事情，三种活动回应不同的条件。阿伦特用劳动、工作与行动分析人在世界中的位置，追问公共生活如何存在，技术与财富增长如何改变它。全书的主线是思考我们正在做什么，也看清我们还能够开始什么。',
    theme: { bg: '#252920', paper: '#eee6d2', ink: '#2b3228', accent: '#b98552' }, music: 'thought',
  }, authors, reviews, chapters: [...firstChapters, ...laterChapters], entities, comments,
};
for (const item of [...data.reviews, ...data.chapters.flatMap(c => c.pages)]) {
  for (const entity of entities) {
    const terms = [entity.name, ...(entity.aliases || [])];
    if ((entity.kind === 'author' || entity.kind === 'person' || entity.id === eid('earth-alienation')) && terms.some(term => item.markdown.includes(term)) && !item.entityIds.includes(entity.id)) item.entityIds.push(entity.id);
  }
}

const ids = new Set();
function addId(id) { if (ids.has(id)) throw new Error(`Duplicate id: ${id}`); ids.add(id); }
const authorIds = new Set(authors.map(x => x.id));
const entityIds = new Set(entities.map(x => x.id));
for (const author of authors) addId(author.id);
for (const entity of entities) { if (!authorIds.has(entity.id)) addId(entity.id); }
const sections = [];
for (const ch of data.chapters) {
  addId(ch.id);
  for (const s of ch.sections || []) { addId(s.id); sections.push(s.number); if (!ch.pages.some(p => p.id === s.pageId && p.sectionId === s.id)) throw new Error(`Bad section map: ${s.id}`); }
  for (const p of ch.pages) { addId(p.id); if (p.questions.length !== 3) throw new Error(`Bad page questions: ${p.id}`); if (!p.source?.startLine || !p.source?.endLine) throw new Error(`Missing source: ${p.id}`); for (const q of p.questions) addId(q.id); }
  if (ch.questions.length !== 3) throw new Error(`Bad chapter questions: ${ch.id}`);
  for (const q of ch.questions) addId(q.id);
}
if (sections.length !== 45 || sections.some((n, i) => n !== i + 1)) throw new Error('Sections must be 1—45 in order');
for (const review of reviews) { addId(review.id); if (!authorIds.has(review.authorId)) throw new Error(`Unknown author: ${review.authorId}`); for (const q of review.questions) addId(q.id); }
for (const c of comments) { addId(c.id); if (!authorIds.has(c.authorId)) throw new Error(`Unknown author: ${c.authorId}`); }
function checkEntities(obj) { for (const id of obj.entityIds || []) if (!entityIds.has(id)) throw new Error(`Unknown entity: ${id}`); }
for (const review of reviews) { checkEntities(review); for (const q of review.questions) checkEntities(q); }
for (const ch of data.chapters) { for (const q of ch.questions) checkEntities(q); for (const p of ch.pages) { checkEntities(p); for (const q of p.questions) checkEntities(q); for (const m of p.markdown.matchAll(/\]\(entity:([^\)]+)\)/g)) if (!entityIds.has(m[1])) throw new Error(`Unknown link: ${m[1]}`); } }
mkdirSync(join(root, 'public', 'books'), { recursive: true });
const output = join(root, 'public', 'books', `${bookId}.json`);
writeFileSync(output, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log(JSON.stringify({ output, chapters: data.chapters.length, sections: sections.length, pages: data.chapters.reduce((n, c) => n + c.pages.length, 0), questions: data.chapters.reduce((n, c) => n + c.questions.length + c.pages.reduce((m, p) => m + p.questions.length, 0), reviews.reduce((n, r) => n + r.questions.length, 0)) }, null, 2));
