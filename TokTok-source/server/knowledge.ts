import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { ApiError, type Context, type Knowledge, type KnowledgeRecord } from './types.ts';
import type { BookPackage } from '../src/types.ts';

let loaded: Promise<Knowledge> | undefined;
function normalizeRecord(raw: unknown): KnowledgeRecord | undefined {
  if (!raw || typeof raw !== 'object') return;
  const r = raw as Record<string, unknown>;
  const text = r.text ?? r.markdown ?? r.content;
  if (typeof r.bookId !== 'string' || typeof r.title !== 'string' || typeof text !== 'string' || !text.trim()) return;
  return {bookId:r.bookId, chapterId: typeof r.chapterId === 'string' ? r.chapterId : undefined, pageId: typeof r.pageId === 'string' ? r.pageId : typeof r.id === 'string' ? r.id : `${r.bookId}:overview`, title:r.title, text, source:r.source as KnowledgeRecord['source'], entityIds:Array.isArray(r.entityIds) ? r.entityIds as string[] : undefined};
}
export function recordsFromBooks(books: BookPackage[]): KnowledgeRecord[] {
  return books.flatMap(b => [
    {bookId:b.book.id,pageId:`${b.book.id}-overview`,title:b.book.title,text:b.book.overview},
    ...b.reviews.map(r=>({bookId:b.book.id,pageId:r.id,title:r.title,text:r.markdown,source:r.source,entityIds:r.entityIds})),
    ...b.chapters.flatMap(c=>[
      {bookId:b.book.id,chapterId:c.id,pageId:`${c.id}-overview`,title:c.title,text:c.overview},
      ...c.pages.map(p=>({bookId:b.book.id,chapterId:c.id,pageId:p.id,title:p.title,text:p.markdown,source:p.source,entityIds:p.entityIds}))
    ])
  ]);
}
export async function loadKnowledge(root = process.cwd()): Promise<Knowledge> {
  const dir = resolve(root, 'public/books');
  const books: BookPackage[] = [];
  for (const filename of (await readdir(dir).catch(()=>[])).filter(f=>f.endsWith('.json'))) {
    const b = JSON.parse(await readFile(resolve(dir,filename),'utf8'));
    if (b.schemaVersion === 1 && b.book?.id && Array.isArray(b.chapters)) books.push(b);
  }
  const raw = await readFile(resolve(root,'data/knowledge.json'),'utf8').then(JSON.parse).catch((e:NodeJS.ErrnoException)=>{ if(e.code==='ENOENT') return undefined; throw new ApiError(503,'阅读资料无法载入'); });
  const records = raw ? (Array.isArray(raw) ? raw : raw.records || []).map(normalizeRecord).filter(Boolean) as KnowledgeRecord[] : recordsFromBooks(books);
  if (!records.length) throw new ApiError(503,'还没有发布可供问答的书籍资料');
  return { revision:raw?.revision || books.map(b=>b.revision).sort().join('|') || 'v1', records, books, authors:[...new Map(books.flatMap(b=>b.authors).map(a=>[a.id,a])).values()] };
}
export function getKnowledge(): Promise<Knowledge> { return loaded ||= loadKnowledge().catch(e=>{loaded=undefined;throw e;}); }
export function terms(text: string): string[] {
  const normalized = text.toLowerCase();
  const latin = normalized.match(/[a-z0-9]{2,}/g) || [];
  const chinese = normalized.match(/[\p{Script=Han}]{2,}/gu) || [];
  return [...new Set([...latin,...chinese.flatMap(s=>Array.from({length:s.length-1},(_,i)=>s.slice(i,i+2)))])];
}
export function retrieve(knowledge: Knowledge, context: Context, limit = 6): KnowledgeRecord[] {
  const book = knowledge.books.find(b=>b.book.id === context.bookId);
  if (context.revision && context.revision !== knowledge.revision && context.revision !== book?.revision) throw new ApiError(409,'书籍内容已更新，请刷新后再问');
  const records = knowledge.records.filter(r=>r.bookId===context.bookId);
  if (!records.length) throw new ApiError(404,'没有找到这本书的阅读资料');
  const query = terms(context.question || '');
  return records.map((r,index)=>{
    const text = `${r.title} ${r.text}`.toLowerCase();
    const overlap = query.reduce((n,q)=>n+(text.includes(q)?1:0),0);
    return {r,index,score:overlap*3+(r.pageId===context.pageId?20:0)+(r.chapterId && r.chapterId===context.chapterId?4:0)};
  }).sort((a,b)=>Number(b.r.pageId===context.pageId)-Number(a.r.pageId===context.pageId)||b.score-a.score||a.index-b.index).slice(0,limit).map(x=>({...x.r,text:x.r.text.slice(0,2200)}));
}
export function contextText(records: KnowledgeRecord[]): string {
  return records.map(r=>`[${r.pageId}] ${r.title}\n${r.text}`).join('\n\n').slice(0,13000);
}
