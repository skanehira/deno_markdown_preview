import { Application } from "./deps.ts";
import { router } from "./router.ts";

const port = 9000;
console.log(`Setting up the server on localhost:${port}`);

const app = new Application();

app.use(router.routes());
app.use(async (ctx, _) => {
  try {
    await ctx.send({
      root: Deno.cwd(),
    });
  } catch {
    // 何もしない
  }
});

await app.listen({ port });
