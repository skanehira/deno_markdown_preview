import { Application } from "oak";
import { router } from "./router.ts";

const port = 9000;
console.log(`Listening localhost: ${port}`);

const app = new Application();
app.use(async (ctx, next) => {
  try {
    await ctx.send({
      root: Deno.cwd(),
      index: "/",
    });
  } catch {
    await next();
  }
});
app.use(router.routes());

await app.listen({ port });
