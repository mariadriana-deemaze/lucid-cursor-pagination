# Lucid cursor pagination

A simple package that enhances the lucid ORM experience, by allowing to paginate the ORM records via cursor based pagination.


### Example usage:

```ts
import Post from "#models/Post";

const index(ctx:HttpContext) {
 const posts = await Post.query().cursorPaginate(
   ctx.request.input("cursor"),
   "next",
   10,
   "created_at"
 );
 
 return response.json(posts);
}
```
