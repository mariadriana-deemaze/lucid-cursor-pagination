import { BaseModel } from '@adonisjs/lucid/orm';

export interface CursorPaginateOptions {
  cursor?: string;
  limit?: number;
}

export interface CursorData {
  total: number;
  perPage: number;
  nextCursor: string | null;
  previousCursor: string | null;
  nextPageUrl: string | null;
  previousPageUrl: string | null;
  currentPageCursor?: string;
}

export interface CursorResponse<T> {
  data: T[];
  meta: CursorData;
}

export interface ModelNode {
  model: typeof BaseModel;
  dependencies: ModelNode[];
}
