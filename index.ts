import { CursorPaginator } from './src/cursor-paginator.js';
import { configure } from './configure.js';
import { CursorPaginateOptions, CursorResponse } from './src/types.js';

export async function setupCursorPagination() {
  await import('./src/cursor-paginator-mixin.js');
}

export { configure, CursorPaginator, type CursorPaginateOptions, type CursorResponse };
