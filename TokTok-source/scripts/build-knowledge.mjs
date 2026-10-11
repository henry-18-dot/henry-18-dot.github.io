import fs from 'node:fs/promises';
import path from 'node:path';
import { root, loadBookPackages, validateBookPackages } from './content-validate.mjs';

const packages = await loadBookPackages();
const validation = validateBookPackages(packages);
if (validation.errors.length) throw new Error(validation.errors.join('\n'));
const revisions = new Set(packages.map(({ data }) => data.revision));
if (revisions.size !== 1) throw new Error('三本书必须使用同一 revision');
const revision = [...revisions][0];
const records = [];
const textOf = markdown => markdown
  .replace(/```(?:mermaid)?[\s\S]*?```/g, '')
  .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  .replace(/^\s*#{1,6}\s+/gm, '')
  .replace(/[*_`]/g, '')
  .replace(/\n{3,}/g, '\n\n')
  .trim();
const span = sources => {
  const located = sources.filter(source => Number.isInteger(source?.startLine));
  if (!located.length) return sources.find(Boolean);
  return { label: located[0].label, startLine: Math.min(...located.map(s => s.startLine)), endLine: Math.max(...located.map(s => s.endLine)) };
};

for (const { data: pkg } of packages) {
  const bookId = pkg.book.id;
  const entities = new Map(pkg.entities.map(entity => [entity.id, entity]));
  const tagsFor = (ids = [], extra = []) => [...new Set([...pkg.book.tags, ...extra, ...ids.map(id => entities.get(id)?.name).filter(Boolean)])];
  const allSources = pkg.chapters.flatMap(chapter => chapter.pages.map(page => page.source));
  records.push({ bookId, pageId: `${bookId}-overview`, title: `${pkg.book.title}：全书概览`, text: pkg.book.overview, tags: pkg.book.tags, source: span(allSources), entityIds: [] });
  for (const review of pkg.reviews) {
    records.push({ bookId, pageId: review.id, title: review.title, text: textOf(review.markdown), tags: tagsFor(review.entityIds, ['书籍评价']), source: review.source, entityIds: review.entityIds || [] });
  }
  for (const chapter of pkg.chapters) {
    records.push({ bookId, chapterId: chapter.id, pageId: `${chapter.id}-overview`, title: chapter.title, text: chapter.overview, tags: tagsFor([], [chapter.title]), source: span(chapter.pages.map(page => page.source)), entityIds: [] });
    for (const page of chapter.pages) {
      records.push({ bookId, chapterId: chapter.id, pageId: page.id, title: page.title, text: textOf(page.markdown), tags: tagsFor(page.entityIds, [chapter.title, page.sectionTitle].filter(Boolean)), source: page.source, entityIds: page.entityIds || [] });
    }
  }
}
await fs.mkdir(path.join(root, 'data'), { recursive: true });
await fs.writeFile(path.join(root, 'data', 'knowledge.json'), `${JSON.stringify({ revision, records }, null, 2)}\n`, 'utf8');
const books = packages.map(({ data }) => ({ id: data.book.id, file: `books/${data.book.id}.json`, title: data.book.title }));
await fs.writeFile(path.join(root, 'public', 'books', 'book-index.json'), `${JSON.stringify({ revision, books }, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ revision, records: records.length, ...validation.totals, warnings: validation.warnings.length }, null, 2));
