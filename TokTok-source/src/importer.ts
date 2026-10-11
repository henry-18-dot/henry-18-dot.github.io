import type {BookPackage,Chapter,Page,Question} from './types';
export function stableId(text:string){let h=2166136261;for(const char of text){h^=char.charCodeAt(0);h=Math.imul(h,16777619);}return(h>>>0).toString(36);}
export function questionId(bookId:string,text:string){return bookId+'-q-'+stableId(text.replace(/[\s？?，。！!]/g,''));}
function splitLong(markdown:string,max=650):string[]{const blocks=markdown.split(/\n\s*\n/);const result:string[]=[];let buf='';let fenced=false;let fenceBuf='';for(const block of blocks){const fences=(block.match(/^```/gm)||[]).length;if(fenced||fences%2){fenceBuf+=(fenceBuf?'\n\n':'')+block;fenced=(fences%2===1)?!fenced:fenced;if(fenced)continue;const combined=fenceBuf;fenceBuf='';if(buf){result.push(buf);buf='';}result.push(combined);continue;}if(buf.length+block.length>max&&buf){result.push(buf);buf='';}buf+=(buf?'\n\n':'')+block;}if(fenceBuf)buf+=(buf?'\n\n':'')+fenceBuf;if(buf.trim())result.push(buf);return result;}
export function importChapter(book:BookPackage,chapter:Chapter,raw:string):Chapter {
  const clean=raw.trim().replace(/^```(?:markdown|md)?\s*\n([\s\S]*)\n```\s*$/i,'$1');
  const questionPart=clean.match(/^##\s*(?:沉淀(?:的)?问题|章末问题|值得追问)[^\n]*\n([\s\S]*)/m);let content=questionPart?clean.slice(0,questionPart.index):clean;
  const overviewPart=content.match(/^##\s*本章概述\s*\n([\s\S]*?)(?=\n---\s*\n|\n##\s|$)/m);
  let overview=overviewPart?.[1].trim()||chapter.overview;
  if(overviewPart)content=content.replace(overviewPart[0],'');
  content=content.replace(/^#\s+[^\n]*\n?/,'').trim();
  const fragments:string[]=[];let lines:string[]=[];let fence='';
  const flush=()=>{if(lines.join('\n').trim())fragments.push(lines.join('\n').trim());lines=[];};
  for(const line of content.split('\n')){const marker=line.match(/^\s*(`{3,}|~{3,})/);if(marker){if(!fence)fence=marker[1][0];else if(marker[1][0]===fence)fence='';}if(!fence&&/^\s*---\s*$/.test(line)){flush();continue;}if(!fence&&/^##\s/.test(line)&&lines.length)flush();lines.push(line);}flush();const pages:Page[]=[];
  for(const fragment of fragments){const title=fragment.match(/^##\s+([^\n]+)/)?.[1]||chapter.title;const body=fragment.replace(/^##\s+[^\n]*\n?/,'').trim();if(!body)continue;for(const piece of splitLong(body)){const id=chapter.id+'-import-'+stableId(title+piece);pages.push({id,title,markdown:piece,layout:piece.includes('```mermaid')?'relations':/^\s*\|.+\|\s*$/m.test(piece)?'comparison':/^>/m.test(piece)?'quote':'prose',questions:[],source:{label:'个人导入 · '+chapter.title}});}}
  if(!pages.length)throw new Error('没有可保存的正文。请保留至少一段章节内容。');
  const texts=(questionPart?.[1]||'').split('\n').map(t=>t.replace(/^\s*(?:[-*]|\d+[.、)])\s*/,'').trim()).filter(t=>t&&t.length>4&&!t.startsWith('#'));
  const questions:Question[]=texts.map(text=>({id:questionId(book.book.id,text),text,kind:'理解'}));
  if(!overview)overview=pages[0].markdown.replace(/[#*_>`]/g,'').slice(0,250);
  return{...chapter,overview,pages,questions:questions.length?questions:chapter.questions,sections:undefined};
}
export function styleWarnings(raw:string){const r:string[]=[];if(/[；;]/.test(raw))r.push('有分号串句');if(/三句话|三点讲清|不是[\s\S]{0,80}而是/.test(raw))r.push('有固定套句');return r;}
export function validatePackage(input:unknown):BookPackage {const p=input as BookPackage;if(!p||p.schemaVersion!==1||!p.book?.id||!Array.isArray(p.chapters)||!Array.isArray(p.authors)||!Array.isArray(p.entities)||!Array.isArray(p.reviews)||!Array.isArray(p.comments)||!p.book.theme||!p.chapters.every(c=>c.id&&c.title&&Array.isArray(c.pages)&&c.pages.every(pg=>pg.id&&typeof pg.markdown==='string'&&Array.isArray(pg.questions))&&Array.isArray(c.questions)))throw new Error('这不是有效的 BookPackage v1 文件。');return p;}
