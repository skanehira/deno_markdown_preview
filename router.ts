import { Router } from "oak";
import { Watcher } from "./watcher.ts";
import { render } from "./render.ts";

const HTML = `
<html>
  <head>
    <title>Markdown Preview</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.1.0/github-markdown-light.css">
  </head>
  <body>
    <div class="markdown-body" id="body">
    </div>
  </body>
	<script type="text/javascript">
		const socket = new WebSocket("ws://localhost:9000/wss");

		socket.addEventListener("message", (ev) => {
			document.getElementById("body").innerHTML = ev.data;
		});
	</script>
</html>
`;

const router = new Router().get("/", (ctx) => {
  ctx.response.headers.set("Content-Type", "text/html");
  ctx.response.body = HTML;
}).get("/wss", (ctx) => {
  if (!ctx.isUpgradable) {
    ctx.throw(501, "cannot upgrade to a websocket");
  }

  const file = Deno.args[0];
  const ws = ctx.upgrade();

  ws.onopen = async () => {
    const html = render(await Deno.readTextFile(file));
    ws.send(html);
  };

  const wacther = new Watcher(ws, file);
  wacther.watch();
});

export { router };
