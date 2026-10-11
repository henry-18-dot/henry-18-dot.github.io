import type { Author, BookPackage } from '../src/types.ts';

export interface Context { bookId: string; chapterId?: string; pageId?: string; revision?: string; question?: string; interests?: string[] }
export interface KnowledgeRecord { bookId: string; chapterId?: string; pageId: string; title: string; text: string; source?: {label: string; url?: string}; entityIds?: string[] }
export interface Knowledge { revision: string; records: KnowledgeRecord[]; books: BookPackage[]; authors: Author[] }
export interface Usage { prompt_tokens: number; completion_tokens: number; prompt_cache_hit_tokens?: number; prompt_cache_miss_tokens?: number }
export type Env = Record<string, string | undefined>;
export class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }
export const PROMPT_VERSION = '2026-10-11-v1';
