import { renderMarkdown } from "./render.ts";
import { debounce } from "./deps.ts";

export class Watcher {
  #ws: WebSocket;
  #file: string;

  constructor(ws: WebSocket, file: string) {
    this.#ws = ws;
    this.#file = file;
  }

  #shouldStop(): boolean {
    const state = this.#ws.readyState;
    return WebSocket.CLOSED === state || WebSocket.CLOSING === state;
  }

  async watch() {
    console.log(`watching ${this.#file}...`);
    const render = debounce((ws: WebSocket, file: string) => {
      const content = Deno.readTextFileSync(file);
      ws.send(renderMarkdown(content));
    }, 200);

    const watcher = Deno.watchFs(this.#file);
    for await (const event of watcher) {
      if (this.#shouldStop()) {
        break;
      }

      const file = event.paths[0];
      render(this.#ws, file);
    }
  }
}
