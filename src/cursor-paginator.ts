import { LucidModel, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model';
import type { CursorResponse } from 'src/types.js';

export class CursorPaginator<T extends LucidModel> {
  constructor(
    private query: ModelQueryBuilderContract<T>,
    private cursor: string | undefined,
    private limit: number
  ) {}

  public async cursorPaginate<T>(): Promise<CursorResponse<T>> {
    const countQuery = this.query.clone();
    countQuery.knexQuery.clear('order');
    const totalRecords = await countQuery.count('* as total');
    const total = Number(totalRecords[0].$extras.total) || 0;

    this.applyCursorFilter();

    const results = await this.query.limit(this.limit + 1);
    const hasMore = results.length > this.limit;
    if (hasMore) results.pop();

    const { nextCursor, prevCursor } = this.generateCursors(results, hasMore);

    return {
      data: results as T[],
      meta: {
        total,
        perPage: this.limit,
        currentPageCursor: this.cursor,
        nextCursor,
        previousCursor: prevCursor,
        nextPageUrl: nextCursor ? `/?cursor=${nextCursor}` : null,
        previousPageUrl: prevCursor ? `/?cursor=${prevCursor}` : null,
      },
    };
  }

  private decodeCursor(cursor: string) {
    const [value, direction] = Buffer.from(cursor, 'base64').toString('utf-8').split('|');
    return { value, direction };
  }

  private encodeCursor(value: string, direction: 'next' | 'prev') {
    return Buffer.from(`${value}|${direction}`).toString('base64');
  }

  private getCursorValue(model: any) {
    return model.$attributes ? model.$attributes.createdAt : model.createdAt;
  }

  private getOrderDirection() {
    return this.query.knexQuery.toString().toLowerCase().includes('order by')
      ? this.query.knexQuery.toString().toLowerCase().includes('asc')
      : true;
  }

  private applyCursorFilter() {
    if (!this.cursor) return;

    const { value, direction } = this.decodeCursor(this.cursor);
    const isAscending = this.getOrderDirection();

    const operator = direction === 'next' ? (isAscending ? '>' : '<') : isAscending ? '<' : '>';

    this.query.where('createdAt', operator, value);
  }

  private generateCursors(results: any[], hasMore: boolean) {
    if (results.length === 0) {
      return { nextCursor: null, prevCursor: null };
    }

    const firstValue = this.getCursorValue(results[0]);
    const lastValue = this.getCursorValue(results[results.length - 1]);

    if (this.cursor) {
      const { direction } = this.decodeCursor(this.cursor);
      return {
        nextCursor: direction === 'prev' || hasMore ? this.encodeCursor(lastValue, 'next') : null,
        prevCursor: direction === 'next' ? this.encodeCursor(firstValue, 'prev') : null,
      };
    }

    return {
      nextCursor: hasMore ? this.encodeCursor(lastValue, 'next') : null,
      prevCursor: null,
    };
  }
}
