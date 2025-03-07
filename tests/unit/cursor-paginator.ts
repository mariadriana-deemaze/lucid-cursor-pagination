import { setupCursorPagination } from 'index.js';
import test from 'japa';
import { setupLucid, runMigrations, db, truncateAllTables } from 'tests/utils.js';
import User from '../entities/user.js';
import { DateTime } from 'luxon';
import { faker } from '@faker-js/faker';

test.group('Lucid cursor based pagination', group => {
  let users: User[];

  group.before(async () => {
    setupCursorPagination();
    await setupLucid();
    await runMigrations();
  });

  group.beforeEach(async () => {
    const data = new Array(10).fill(0).map((_, index) => ({
      name: faker.person.firstName(),
      createdAt: DateTime.now().set({ hour: index + 1, minute: 0, second: 0, year: 2000 }),
    }));
    users = await User.createMany(data);
  });

  group.afterEach(async () => {
    await truncateAllTables();
  });

  test("should paginate correctly with 'prev' and 'next' cursor", async assert => {
    const limit = 4;
    const page1 = await User.query().cursorPaginate({ limit });
    assert.lengthOf(page1.data, limit);
    assert.exists(page1.meta.nextPageUrl);
    assert.isNull(page1.meta.previousPageUrl);

    const page2 = await User.query().cursorPaginate({ cursor: page1.meta.nextCursor!, limit });
    assert.lengthOf(page2.data, limit);
    assert.exists(page2.meta.nextPageUrl);
    assert.exists(page2.meta.previousPageUrl);

    const page3 = await User.query().cursorPaginate({ cursor: page2.meta.previousCursor!, limit });
    assert.isNull(page3.meta.previousPageUrl);
    assert.exists(page3.meta.nextPageUrl);

    assert.deepEqual(
      page1.data.map(u => u.id),
      page3.data.map(u => u.id)
    );
  });

  test('should return entities with given order', async assert => {
    const result = await User.query().cursorPaginate({ limit: 5 });
    const expected = users.map(u => u.id).slice(0, 5);
    assert.deepEqual(
      result.data.map(u => u.id),
      expected
    );
  });

  test('should return entities with given limit', async assert => {
    const result = await User.query().cursorPaginate({ limit: 3 });
    assert.lengthOf(result.data, 3);
  });

  test('should return empty array and null cursor if no data', async assert => {
    await db.rawQuery('DELETE FROM users');
    const result = await User.query().cursorPaginate({ limit: 3 });
    assert.deepEqual(result.data, []);
    assert.isNull(result.meta.nextPageUrl);
    assert.isNull(result.meta.previousPageUrl);
  });

  test('should paginate in descending order', async assert => {
    const result = await User.query().orderBy('created_at', 'desc').cursorPaginate({ limit: 5 });
    const expected = users
      .map(u => u.id)
      .reverse()
      .slice(0, 5);
    assert.deepEqual(
      result.data.map(u => u.id),
      expected
    );
  });

  test('should paginate with multiple order-by columns', async assert => {
    const result = await User.query().cursorPaginate({ limit: 5 });
    const expected = users.map(u => u.id).slice(0, 5);
    assert.deepEqual(
      result.data.map(u => u.id),
      expected
    );
  });

  test('should return correct structure and types', async assert => {
    const limit = 3;
    const result = await User.query().cursorPaginate({ limit });

    assert.containsAllKeys(result, ['data', 'meta']);
    assert.containsAllKeys(result.meta, [
      'total',
      'perPage',
      'nextCursor',
      'previousCursor',
      'nextPageUrl',
      'previousPageUrl',
      'currentPageCursor',
    ]);

    assert.isArray(result.data);
    assert.isNumber(result.meta.total);
    assert.isNumber(result.meta.perPage);
    assert.isTrue(result.meta.nextCursor === null || typeof result.meta.nextCursor === 'string');
    assert.isTrue(
      result.meta.previousCursor === null || typeof result.meta.previousCursor === 'string'
    );
    assert.isTrue(result.meta.nextPageUrl === null || typeof result.meta.nextPageUrl === 'string');
    assert.isTrue(
      result.meta.previousPageUrl === null || typeof result.meta.previousPageUrl === 'string'
    );
    assert.isTrue(
      result.meta.currentPageCursor === undefined ||
        typeof result.meta.currentPageCursor === 'string'
    );
    assert.equal(result.meta.perPage, limit);
    assert.equal(result.meta.total, users.length);
  });
});
