import { LucidModel, ModelQueryBuilderContract } from "@adonisjs/lucid/types/model"

export class CursorPaginator<T extends LucidModel> {
 constructor(
  private query: ModelQueryBuilderContract<T>,
  private cursor?: string,
  private direction: 'next' | 'prev' = 'next',
  private limit: number = 10
 ) { }

 private decodeCursor(cursor: string) {
  return Buffer.from(cursor, 'base64').toString('utf-8')
 }

 private encodeCursor(value: string) {
  return Buffer.from(value).toString('base64')
 }

 public async paginate(orderBy: string = 'id') {
  if (this.cursor) {
   const decodedCursor = this.decodeCursor(this.cursor)
   this.query.where(orderBy, this.direction === 'next' ? '>' : '<', decodedCursor)
  }

  const results = await this.query.orderBy(orderBy, this.direction === 'next' ? 'asc' : 'desc').limit(this.limit + 1)

  const hasMore = results.length > this.limit
  if (hasMore) results.pop()

  const nextCursor = hasMore ? this.encodeCursor(results[results.length - 1][orderBy]) : null
  const prevCursor = this.cursor ? this.encodeCursor(results[0][orderBy]) : null

  return {
   data: results,
   nextCursor,
   prevCursor
  }
 }
}
