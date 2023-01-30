import { renderMarkdown } from "./render.ts";
import { debounce } from "debounce";

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
    // エディタによるファイルへの書き込みでは、
    // Deno.watchFs は複数イベントが発火するので、
    // レンダリング後は一定期間は(0.1秒)レンダリングを行わない
    const render = debounce((ws: WebSocket, content: string) => {
      console.log("redering...");
      ws.send(renderMarkdown(content));
    }, 200);

    const watcher = Deno.watchFs(this.#file);
    for await (const event of watcher) {
      if (this.shouldClose()) {
        break;
      }

      const file = event.paths[0];
      const content = await Deno.readTextFile(file);
      render(this.#ws, content);
    }
  }
}
