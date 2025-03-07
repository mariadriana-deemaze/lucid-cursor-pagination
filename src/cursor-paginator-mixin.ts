import { ModelQueryBuilder } from '@adonisjs/lucid/orm';
import { CursorPaginator } from './cursor-paginator.js';
import { CursorPaginateOptions, CursorResponse } from './types.js';
import { ModelObject } from '@adonisjs/lucid/types/model';

declare module '@adonisjs/lucid/types/model' {
  interface ModelQueryBuilderContract<Model extends LucidModel, Result = InstanceType<Model>> {
    cursorPaginate(options?: CursorPaginateOptions): Promise<CursorResponse<ModelObject>>;
  }
}

declare module '@adonisjs/lucid/orm' {
  interface ModelQueryBuilder {
    cursorPaginate(options?: CursorPaginateOptions): Promise<CursorResponse<ModelObject>>;
  }
}

ModelQueryBuilder.prototype.cursorPaginate = function (
  options: {
    cursor?: string;
    limit?: number;
  } = {}
) {
  const { cursor, limit = 10 } = options;
  return new CursorPaginator(this, cursor, limit).cursorPaginate();
};
