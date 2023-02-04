import { Application } from "oak";
import { router } from "./router.ts";

const port = 9000;
console.log(`Listening localhost: ${port}`);

const app = new Application();

app.use(router.routes());
app.use(async (ctx, _) => {
  try {
    await ctx.send({
      root: Deno.cwd(),
    });
  } catch {
    // do nothing
  }
});

await app.listen({ port });
