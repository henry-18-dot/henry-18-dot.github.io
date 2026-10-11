import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const expectedBooks = {
  greatness: { chapters: 11, lines: 6102, starts: [366, 862, 1156, 1418, 1916, 2624, 3008, 3574, 4160, 4512, 5260], end: 6102 },
  'human-condition': { chapters: 6, sections: 45, lines: 3320, starts: [206, 316, 706, 1068, 1280, 1716], end: 2157 },
  solitude: { chapters: 20, lines: 2528, starts: [77, 266, 395, 511, 634, 801, 899, 1024, 1156, 1334, 1431, 1539, 1661, 1770, 1836, 1957, 2035, 2125, 2230, 2310], ends: [262, 391, 507, 630, 797, 895, 1020, 1152, 1330, 1427, 1535, 1657, 1766, 1832, 1953, 2031, 2121, 2226, 2306, 2426] },
};
const layouts = new Set(['prose', 'comparison', 'timeline', 'relations', 'concept', 'quote']);
const questionKinds = new Set(['理解', '比较', '应用', '反驳', '背景']);
const entityKinds = new Set(['author', 'book', 'event', 'concept', 'person']);

export async function loadBookPackages() {
  return Promise.all(Object.keys(expectedBooks).map(async id => {
    const filename = path.join(root, 'public', 'books', `${id}.json`);
    return { filename, data: JSON.parse(await fs.readFile(filename, 'utf8')) };
  }));
}

export function validateBookPackages(packages) {
  const errors = [];
  const warnings = [];
  const globalIds = new Set();
  const pageBodies = new Set();
  const totals = { books: packages.length, chapters: 0, sections: 0, pages: 0, questions: 0, reviews: 0, comments: 0 };
  const fail = (where, message) => errors.push(`${where}: ${message}`);
  const register = (id, where) => {
    if (typeof id !== 'string' || !id) fail(where, '缺少 ID');
    else if (globalIds.has(id)) fail(where, `重复 ID ${id}`);
    else globalIds.add(id);
  };
  for (const { data: pkg } of packages) {
    const bookId = pkg.book?.id;
    const rules = expectedBooks[bookId];
    if (!rules) { fail(bookId || '未知书', '书 ID 不在示范目录中'); continue; }
    if (pkg.schemaVersion !== 1) fail(bookId, 'schemaVersion 必须为 1');
    if (!pkg.revision) fail(bookId, '缺少 revision');
    const authors = new Map((pkg.authors || []).map(author => [author.id, author]));
    const entities = new Map((pkg.entities || []).map(entity => [entity.id, entity]));
    const chapters = pkg.chapters || [];
    if (authors.size !== pkg.authors?.length) fail(bookId, '作者 ID 重复');
    if (entities.size !== pkg.entities?.length) fail(bookId, '实体 ID 重复');
    for (const authorId of pkg.book.authors || []) if (!authors.has(authorId)) fail(bookId, `作者不存在 ${authorId}`);
    for (const author of authors.values()) {
      if (!author.name || !author.bio || !author.initial || !author.color) fail(bookId, `作者资料不完整 ${author.id}`);
    }
    for (const entity of entities.values()) {
      if (!entity.name || !entity.description || !entityKinds.has(entity.kind)) fail(bookId, `实体资料不完整 ${entity.id}`);
      if (entity.authorId && !authors.has(entity.authorId)) fail(bookId, `实体作者不存在 ${entity.authorId}`);
      if (entity.bookId && !expectedBooks[entity.bookId]) fail(bookId, `实体书籍不存在 ${entity.bookId}`);
    }
    const checkEntityIds = (ids, where, chapterNumber) => {
      for (const id of ids || []) {
        const entity = entities.get(id);
        if (!entity) fail(where, `实体不存在 ${id}`);
        else if (bookId === 'solitude' && chapterNumber && entity.firstChapter > chapterNumber) fail(where, `提前引用人物 ${id}`);
      }
    };
    const checkMarkdown = (markdown, where, chapterNumber) => {
      if (typeof markdown !== 'string' || !markdown.trim()) { fail(where, '正文为空'); return; }
      for (const match of markdown.matchAll(/\]\(entity:([^\s)]+)\)/g)) checkEntityIds([match[1]], where, chapterNumber);
      if (/<(?:script|iframe|object|embed)\b/i.test(markdown)) fail(where, '正文包含可执行 HTML');
      if (/三句话(?:讲清|说清)|不是[^。\n]{1,35}而是/.test(markdown)) warnings.push(`${where}: 检查套式句法`);
    };
    const checkSource = (source, where, chapterNumber) => {
      if (!source?.label) fail(where, '缺少出处');
      if (source?.url && !/^https?:\/\//.test(source.url)) fail(where, '出处 URL 不是 HTTP(S)');
      if (source?.startLine !== undefined) {
        if (!Number.isInteger(source.startLine) || source.startLine < 1 || !Number.isInteger(source.endLine) || source.endLine < source.startLine || source.endLine > rules.lines) fail(where, '原文行号无效');
        if (chapterNumber) {
          const chapterStart = rules.starts[chapterNumber - 1];
          const chapterEnd = rules.ends?.[chapterNumber - 1] ?? ((rules.starts[chapterNumber] || rules.end + 1) - 1);
          if (source.startLine < chapterStart || source.endLine > chapterEnd) fail(where, '原文出处越出对应章节');
        }
      } else if (chapterNumber) {
        fail(where, '正文页缺少原文行号');
      }
    };
    const checkQuestions = (questions, where, chapterNumber) => {
      if (!Array.isArray(questions) || questions.length !== 3) { fail(where, '必须有 3 个问题'); return; }
      const texts = new Set();
      for (const question of questions) {
        register(question.id, where);
        if (!question.id?.startsWith(bookId)) fail(where, `问题 ID 未加书前缀 ${question.id}`);
        if (!question.text?.trim() || texts.has(question.text)) fail(where, '问题为空或重复');
        if (!questionKinds.has(question.kind)) fail(where, `问题类型无效 ${question.kind}`);
        texts.add(question.text);
        checkEntityIds(question.entityIds, where, chapterNumber);
        totals.questions++;
      }
    };
    if (chapters.length !== rules.chapters) fail(bookId, `章节数量应为 ${rules.chapters}，实为 ${chapters.length}`);
    const sectionNumbers = [];
    for (const [index, chapter] of chapters.entries()) {
      const where = `${bookId}/${chapter.id}`;
      register(chapter.id, where);
      if (!chapter.id?.startsWith(bookId)) fail(where, '章节 ID 未加书前缀');
      if (chapter.number !== index + 1) fail(where, '章节编号不连续');
      if (!chapter.title || !chapter.overview) fail(where, '缺少章标题或概述');
      if (!Array.isArray(chapter.pages) || chapter.pages.length < 3) fail(where, '每章至少 3 张正文页');
      const pageIds = new Set((chapter.pages || []).map(page => page.id));
      for (const page of chapter.pages || []) {
        const pageWhere = `${where}/${page.id}`;
        register(page.id, pageWhere);
        if (!page.id?.startsWith(chapter.id)) fail(pageWhere, '正文页 ID 未含章节前缀');
        if (!page.title || !layouts.has(page.layout)) fail(pageWhere, '缺少标题或布局无效');
        checkMarkdown(page.markdown, pageWhere, chapter.number);
        checkSource(page.source, pageWhere, chapter.number);
        checkEntityIds(page.entityIds, pageWhere, chapter.number);
        checkQuestions(page.questions, pageWhere, chapter.number);
        const plainLength = (page.markdown || '').replace(/```[\s\S]*?```/g, '').replace(/\]\(entity:[^)]+\)/g, ']').replace(/\s/g, '').length;
        if (plainLength < 240 || plainLength > 720) warnings.push(`${pageWhere}: 正文长度 ${plainLength}，建议约 250–550 字`);
        const normalizedBody = (page.markdown || '').replace(/\s/g, '');
        if (pageBodies.has(normalizedBody)) fail(pageWhere, '重复使用另一页正文');
        pageBodies.add(normalizedBody);
        if (rules.sections && !(chapter.sections || []).some(section => section.id === page.sectionId)) fail(pageWhere, '正文页未对应实际小节');
        totals.pages++;
      }
      for (const section of chapter.sections || []) {
        sectionNumbers.push(section.number);
        if (!pageIds.has(section.pageId)) fail(where, `节映射页不存在 ${section.pageId}`);
        const firstPage = chapter.pages.find(page => page.id === section.pageId);
        if (firstPage?.sectionId !== section.id) fail(where, `节 ID 与首页不一致 ${section.id}`);
        if (!section.title) fail(where, '节标题为空');
        totals.sections++;
      }
      checkQuestions(chapter.questions, where, chapter.number);
      totals.chapters++;
    }
    if (rules.sections && (sectionNumbers.length !== rules.sections || sectionNumbers.some((n, i) => n !== i + 1))) fail(bookId, '应覆盖连续编号 1–45 节');
    for (const review of pkg.reviews || []) {
      const where = `${bookId}/${review.id}`;
      register(review.id, where);
      if (!authors.has(review.authorId)) fail(where, `评价作者不存在 ${review.authorId}`);
      checkMarkdown(review.markdown, where);
      checkSource(review.source, where);
      checkEntityIds(review.entityIds, where);
      checkQuestions(review.questions, where);
      totals.reviews++;
    }
    if (!pkg.reviews?.length || pkg.reviews.length > 5) fail(bookId, '评价页应为 1–5 张');
    if ((pkg.comments || []).length < 6) fail(bookId, '至少 6 条角色评论');
    for (const comment of pkg.comments || []) {
      register(comment.id, `${bookId}/评论`);
      if (!authors.has(comment.authorId) || comment.ai !== true || !comment.body) fail(bookId, `角色评论无效 ${comment.id}`);
      for (const score of ['constructive', 'mischief']) if (!Number.isFinite(comment[score]) || comment[score] < 0 || comment[score] > 100) fail(bookId, `评论评分无效 ${comment.id}`);
      if (!Number.isFinite(comment.likes) || comment.likes < 0) fail(bookId, `评论点赞数无效 ${comment.id}`);
      totals.comments++;
    }
  }
  return { totals, errors, warnings };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = validateBookPackages(await loadBookPackages());
  console.log(JSON.stringify(result, null, 2));
  if (result.errors.length) process.exitCode = 1;
}
