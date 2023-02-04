import { renderMarkdown } from "./render.ts";
import { debounce } from "debounce";

export class Watcher {
  #ws: WebSocket;
  #file: string;

  constructor(ws: WebSocket, file: string) {
    this.#ws = ws;
    this.#file = file;
  }

  shouldStop(): boolean {
    const state = this.#ws.readyState;
    return WebSocket.CLOSED === state || WebSocket.CLOSING === state;
  }

  async watch() {
    console.log(`watching ${this.#file}...`);
    // エディタでファイルを更新すると複数のイベントが発生するため、
    // レンダリング後は一定期間は(0.2秒)レンダリングを行わない
    const render = debounce((ws: WebSocket, content: string) => {
      ws.send(renderMarkdown(content));
    }, 200);

    const watcher = Deno.watchFs(this.#file);
    for await (const event of watcher) {
      if (this.shouldStop()) {
        break;
      }

      const file = event.paths[0];
      const content = await Deno.readTextFile(file);
      render(this.#ws, content);
    }
  }
}
