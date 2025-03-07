<div align="center">
  <img src="adonisjs_lucid_orm_cursor.png" alt="Logo AdonisJS Lucid ORM Cursor Pagination"/>
</div>

# Lucid Cursor Pagination

Lucid Cursor Pagination is a package that enhances the Lucid ORM experience by enabling efficient cursor-based pagination. This method of pagination is more performant and scalable than traditional offset-based pagination, especially for large datasets.

## Installation

This package is compatible with AdonisJS v6.

1. To install the package, use `npm` or `yarn`:

```bash
npm install lucid-cursor-pagination
# or
yarn add lucid-cursor-pagination
```

2. Register the provider by adding the package to the list of providers in your adonisrc.ts file.

- a) Automatically register the provider with ace:

```bash
node ace configure lucid-cursor-pagination
```

- b) If you prefer manual setup, you can still register the provider yourself:

```ts
// adonisrc.ts

export default defineConfig({
  ...
  providers: [
    ...,
    () => import('lucid-cursor-pagination/providers/lucid-cursor-provider')
  ],
})
```

3. Import types in tsconfig (WIP)

Add the type augmentation definition into your project `tsconfig.ts`:

```ts
{
  "include": ["./node_modules/@mariaadriana-deemaze/lucid-cursor-pagination/build/src/types.js"]
}
```

> [!WARNING]
> This is a temporay fix, until I find a better and workable solution for exporting the correct type augmentation.

## Usage

### Basic Example

```ts
// start/routes.ts

import Post from '#models/Post';

const index = async (ctx: HttpContext) => {
  const posts = await Post.query()
    .orderBy('created_at', 'asc')
    .cursorPaginate({
      cursor: ctx.request.input('cursor'),
      limit: 10,
    });

  return response.json(posts);
};
```

### Other examples

```ts
// Basic pagination with default limit (10)
const page1 = await User.query().orderBy('created_at', 'asc').cursorPaginate();

// Pagination with custom limit
const page2 = await User.query().orderBy('created_at', 'asc').cursorPaginate({
  cursor: page1.meta.nextCursor,
  limit: 5,
});

// Pagination with previous cursor
const prevPage = await User.query().orderBy('created_at', 'asc').cursorPaginate({
  cursor: page2.meta.previousCursor,
  limit: 5,
});

// Sort in descending order
const paginateDesc = await User.query().orderBy('created_at', 'desc').cursorPaginate({ limit: 5 });

// Sort by multiple columns
const paginateSortByMultiple = await User.query()
  .orderBy('created_at', 'asc')
  .orderBy('name', 'asc')
  .cursorPaginate({ limit: 5 });
```

## API Reference

### CursorPaginator

- **cursorPaginate(options):** Paginate records using a cursor.

  - **Parameters:**

    - `cursor` (optional): A base64-encoded string representing the position from which to start fetching records. If not provided, pagination starts from the beginning.
    - `limit` (optional): An integer specifying the maximum number of records to return. Defaults to `10`.

  - **Returns:**
    - An object containing:
      - `data`: An array of records fetched.
      - `meta`: An object containing:
        - `total`: The total number of records available.
        - `perPage`: The number of records per page.
        - `currentPageCursor`: The cursor for the current page (if any).
        - `nextCursor`: A base64-encoded string representing the position of the next set of records.
        - `previousCursor`: A base64-encoded string representing the position of the previous set of records.
        - `nextPageUrl`: A URL for the next page of records.
        - `previousPageUrl`: A URL for the previous page of records.

### Examples

```ts
// Basic pagination
const page1 = await User.query().orderBy('created_at', 'asc').cursorPaginate({ limit: 10 });

// Pagination with next cursor
const page2 = await User.query().orderBy('created_at', 'asc').cursorPaginate({
  cursor: page1.meta.nextCursor,
  limit: 10,
});

// Pagination with previous cursor
const prevPage = await User.query().orderBy('created_at', 'asc').cursorPaginate({
  cursor: page2.meta.previousCursor,
  limit: 10,
});

// Custom limit
const smallPage = await User.query().orderBy('created_at', 'asc').cursorPaginate({ limit: 5 });
```

```ts
/**
 * Sort by a different column
 * Note: The package uses the `created_at` column by default for cursor-based pagination. The direction of pagination is automatically determined based on the query's
 * order (ascending or descending). If you need to sort by different columns, you can use Lucid's built-in `orderBy` method before calling `cursorPaginate`:
 **/

const sortedPage = await User.query().orderBy('name', 'asc').cursorPaginate({ limit: 10 });
```

## Configuration

For developers looking to customize the `lucid-cursor-pagination` package locally, ensure your development environment is properly set up. This package is an add-on to the Lucid ORM, so familiarity with Lucid and its configuration is beneficial.

### Local Development Setup

1. **Database Configuration**: Ensure your database is configured correctly. You can adjust the settings in your `.env` file to match your local development environment. Key environment variables include:

   - `DB_HOST`: The host address of your database.
   - `DB_PORT`: The port your database is running on.
   - `DB_USER`: The username for database access.
   - `DB_PASSWORD`: The password for the database user.
   - `DB_NAME`: The name of your database.
   - `DRIVER`: The database driver (e.g., `pg` for PostgreSQL, `mysql` for MySQL).

2. **Database Engine Support**: The package supports multiple database engines, as lucid does. Ensure your local setup matches the engine you intend to use. You can switch between engines by modifying the `DRIVER` variable in your `.env` file.

3. **Running Migrations**: Before testing or running the package, ensure all necessary migrations are executed. This ensures your database schema is up-to-date with the package's requirements.

4. **Environment Variables**: Customize your environment variables to suit your local development needs. This includes setting up any additional variables required by your specific database engine or development tools.

By following these steps, you can effectively tweak and test the `lucid-cursor-pagination` package in your local development environment.

## Testing

### Running Tests Locally

Run the tests using the `japa` testing framework:

```bash
npm test
```

### Running Tests in Docker

You can also run the tests in a Docker environment. This setup uses a PostgreSQL database by default, but you can customize the configuration in the `docker-compose.yaml` file.

To run the tests in Docker, use the following command:

```bash
yarn test:docker
```

This command will start the Docker containers, run the tests, and then shut down the containers.

## Contributing

We welcome contributions! Please submit issues or pull requests on GitHub.

## License

This project is licensed under the MIT License.
