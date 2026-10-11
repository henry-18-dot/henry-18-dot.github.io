export type Layout = 'prose'|'comparison'|'timeline'|'relations'|'concept'|'quote';
export type QuestionKind = '理解'|'比较'|'应用'|'反驳'|'背景';
export interface Question {id:string;text:string;kind:QuestionKind;entityIds?:string[];score?:number}
export interface Source {label:string;url?:string;startLine?:number;endLine?:number}
export interface Author {id:string;name:string;years?:string;bio:string;initial:string;color:string;tags?:string[]}
export interface Entity {id:string;name:string;kind:'author'|'book'|'event'|'concept'|'person';description:string;authorId?:string;bookId?:string;question?:string;aliases?:string[];firstChapter?:number}
export interface Page {id:string;title:string;markdown:string;layout:Layout;questions:Question[];entityIds?:string[];source?:Source;sectionId?:string;sectionTitle?:string}
export interface Chapter {id:string;number:number;title:string;overview:string;pages:Page[];questions:Question[];sections?:{id:string;number:number;title:string;pageId:string}[]}
export interface Review {id:string;authorId:string;title:string;markdown:string;source:Source;entityIds:string[];questions:Question[]}
export interface RoleComment {id:string;authorId:string;body:string;constructive:number;mischief:number;likes:number;ai:true}
export interface BookPackage {schemaVersion:1;revision:string;book:{id:string;title:string;subtitle:string;authors:string[];headline:string[];tags:string[];overview:string;theme:{bg:string;paper:string;ink:string;accent:string};music:'discovery'|'thought'|'macondo'};authors:Author[];reviews:Review[];chapters:Chapter[];entities:Entity[];comments:RoleComment[]}
export type Phase='cover'|'reviews'|'toc'|'bookOverview'|'chapterTitle'|'chapterOverview'|'chapterPage'|'chapterQuestions';
export interface Location {bookId:string;phase:Phase;chapterId?:string;pageId?:string;reviewIndex?:number}
export interface Progress {current?:Location;chapters:Record<string,Location>}
export interface SavedQuestion extends Question {bookId:string;chapterId?:string;pageId?:string;createdAt:number;state:'pending'|'asked'|'removed';origin:'auto'|'manual'}
export interface Settings {entranceMotion:boolean;entranceMusic:boolean;readingMusic:boolean;autoSave:boolean;apiBase:string;accessCode:string;rememberCode:boolean;interests:string[]}
