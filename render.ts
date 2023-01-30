// @deno-types="npm:@types/markdown-it"
import { default as MarkdownIt } from "markdown-it";
import { default as hljs } from "highlightjs";
import { makeTable } from "make_table";

function csvToTable(md: MarkdownIt) {
  const defaultFence = md.renderer.rules.fence!;
  md.renderer.rules.fence = (token, idx, options, env, self): string => {
    const tok = token[idx];
    if (tok.info === "table") {
      const table = makeTable(tok.content);
      return `<pre>${table}</pre>`;
    }
    return defaultFence(token, idx, options, env, self);
  };
}

const md = MarkdownIt({
  breaks: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (_) {
        // do nothing
      }
    }
    return "";
  },
}).use(csvToTable);

export function renderMarkdown(src: string): string {
  return md.render(src);
}
