import { renderMarkdown } from "./render.ts";

export class Watcher {
  #ws: WebSocket;
  #file: string;

  constructor(ws: WebSocket, file: string) {
    this.#ws = ws;
    this.#file = file;
  }

  shouldClose(): boolean {
    const state = this.#ws.readyState;
    return WebSocket.CLOSED === state || WebSocket.CLOSING === state;
  }

  async watch() {
    console.log(`watching ${this.#file}...`);
    const watcher = Deno.watchFs(this.#file);

    // エディタによるファイルへの書き込みでは
    // Deno.watchFs は複数イベントが発火するので
    // レンダリング後は一定期間は(0.1秒)レンダリングを行わない
    const renderer = () => {
      let before = Date.now();
      return async (render: () => Promise<void>) => {
        const elasped = Date.now() - before;
        if (elasped < 100) {
          return;
        }
        console.log("rendering...");
        await render();
        before = Date.now();
      };
    };

    const render = renderer();

    for await (const event of watcher) {
      if (this.shouldClose()) {
        break;
      }
      await render(async () => {
        const file = event.paths[0];
        const content = await Deno.readTextFile(file);
        this.#ws.send(renderMarkdown(content));
      });
    }
  }
}
