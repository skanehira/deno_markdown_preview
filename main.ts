import { Application } from "oak";
import { router } from "./router.ts";

const port = 9000;
console.log(`Listening localhost: ${port}`);

await new Application().use(router.routes()).listen({ port });
