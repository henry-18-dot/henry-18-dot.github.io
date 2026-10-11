import { createHandler } from '../server/handler.ts';
export const config = { maxDuration: 120 };
export default createHandler('questions');
