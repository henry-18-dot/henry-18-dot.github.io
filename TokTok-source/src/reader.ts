import type {BookPackage, Location, Progress} from './types';
export type Direction='left'|'right'|'up'|'down';
export function validLocation(b:BookPackage,l?:Location):Location {
  if(!l||l.bookId!==b.book.id) return {bookId:b.book.id,phase:'cover'};
  if(l.phase==='reviews') return {...l,reviewIndex:Math.min(l.reviewIndex||0,Math.max(0,b.reviews.length-1))};
  if(l.phase.startsWith('chapter')) {const c=b.chapters.find(c=>c.id===l.chapterId)||b.chapters[0]; if(!c)return{bookId:b.book.id,phase:'toc'}; return {...l,chapterId:c.id,pageId:c.pages.find(p=>p.id===l.pageId)?.id||c.pages[0]?.id};}
  return l;
}
export function move(b:BookPackage,l:Location,d:Direction,p:Progress):Location {
  const base={bookId:b.book.id}; const ci=b.chapters.findIndex(c=>c.id===l.chapterId); const c=b.chapters[ci];
  const neighboring=(delta:number)=>{const next=b.chapters[ci+delta];return next?(p.chapters[next.id]?validLocation(b,p.chapters[next.id]):{...base,phase:'chapterTitle' as const,chapterId:next.id}):(delta<0?{...base,phase:'bookOverview' as const}:l);};
  switch(l.phase){
    case 'cover': return d==='right'?{...base,phase:b.reviews.length?'reviews':'toc',reviewIndex:0}:l;
    case 'reviews': {const i=l.reviewIndex||0;if(d==='left')return i?{...l,reviewIndex:i-1}:{...base,phase:'cover'};if(d==='right')return i<b.reviews.length-1?{...l,reviewIndex:i+1}:{...base,phase:'toc'};return l;}
    case 'toc': return d==='up'?{...base,phase:'bookOverview'}:d==='left'?{...base,phase:b.reviews.length?'reviews':'cover',reviewIndex:Math.max(0,b.reviews.length-1)}:l;
    case 'bookOverview': return d==='up'&&b.chapters[0]?{...base,phase:'chapterTitle',chapterId:b.chapters[0].id}:d==='left'||d==='down'?{...base,phase:'toc'}:l;
    case 'chapterTitle': return d==='up'?{...l,phase:'chapterOverview'}:d==='left'?{...base,phase:'bookOverview'}:d==='down'?neighboring(-1):l;
    case 'chapterOverview': return d==='up'||d==='right'?{...l,phase:'chapterPage',pageId:c?.pages[0]?.id}:d==='down'?{...l,phase:'chapterTitle'}:d==='left'?{...base,phase:'bookOverview'}:l;
    case 'chapterPage': {if(!c)return{...base,phase:'toc'};if(d==='up')return neighboring(1);if(d==='down')return neighboring(-1);const pi=Math.max(0,c.pages.findIndex(page=>page.id===l.pageId));if(d==='right')return pi<c.pages.length-1?{...l,pageId:c.pages[pi+1].id}:{...l,phase:'chapterQuestions'};return pi?{...l,pageId:c.pages[pi-1].id}:{...base,phase:'bookOverview'};}
    case 'chapterQuestions': return d==='left'?{...l,phase:'chapterPage',pageId:c?.pages.at(-1)?.id}:d==='up'?neighboring(1):d==='down'?neighboring(-1):l;
  }
}
export function recordProgress(p:Progress,l:Location):Progress {return {...p,current:l,chapters:l.chapterId?{...p.chapters,[l.chapterId]:l}:p.chapters};}
export function locationHash(l:Location){return '#/book/'+encodeURIComponent(l.bookId)+'/'+l.phase+'/'+[l.chapterId,l.pageId,l.reviewIndex===undefined?undefined:String(l.reviewIndex)].filter(x=>x!==undefined).map(x=>encodeURIComponent(x!)).join('/');}
export function parseHash(hash:string):Location|undefined {const a=hash.replace(/^#\//,'').split('/').map(decodeURIComponent);if(a[0]!=='book'||!a[1])return;const phases=['cover','reviews','toc','bookOverview','chapterTitle','chapterOverview','chapterPage','chapterQuestions'];if(!phases.includes(a[2]))return;return{bookId:a[1],phase:a[2] as Location['phase'],chapterId:a[2].startsWith('chapter')?a[3]:undefined,pageId:a[4],reviewIndex:a[2]==='reviews'?Number(a[3])||0:undefined};}
