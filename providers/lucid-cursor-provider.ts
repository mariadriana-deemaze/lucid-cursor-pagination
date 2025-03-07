import { setupCursorPagination } from 'lucid-cursor-pagination';
import type { ApplicationService } from '@adonisjs/core/types';

export default class LucidCursorProvider {
  constructor(protected app: ApplicationService) {}
  public register() {}

  async boot() {
    await setupCursorPagination();
  }
}
