/**
 * translator.ts
 * DOM-based page translator using the free Google Translate API.
 * Works on localhost — no external page-fetch required.
 */

const GT_API = "https://translate.googleapis.com/translate_a/single";

// Map of text node → original english text (stored on first translation)
let savedNodes: Map<Text, string> | null = null;

/** Fetch a single text translation from Google's free API */
async function fetchTranslation(text: string, lang: string): Promise<string> {
  const url =
    `${GT_API}?client=gtx&sl=en&tl=${lang}&dt=t&q=` +
    encodeURIComponent(text);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: string[][][] = await res.json();
  // data[0] = array of [translatedChunk, originalChunk, ...]
  return data[0].map((item) => item[0]).join("");
}

const SKIP_TAGS = new Set([
  "SCRIPT", "STYLE", "NOSCRIPT", "SVG", "PATH",
  "INPUT", "TEXTAREA", "SELECT", "OPTION", "BUTTON",
]);

/** Walk the DOM and collect translatable text nodes */
function collectTextNodes(): Text[] {
  const root = document.getElementById("root") || document.body;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node: Node) {
      const parent = (node as Text).parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
      // Skip elements marked notranslate
      if (parent.closest(".notranslate,[data-notranslate]"))
        return NodeFilter.FILTER_REJECT;
      const text = node.textContent?.trim() ?? "";
      // Skip empty, pure-numeric, or symbol-only strings
      if (text.length < 2) return NodeFilter.FILTER_REJECT;
      if (/^[\d\s.,+\-–—%$€£¥@#!?:;/\\|^*()[\]{}<>~`"'_=]+$/.test(text))
        return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes: Text[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) nodes.push(n as Text);
  return nodes;
}

/** Translate all visible text on the page to `lang` */
export async function translatePage(lang: string): Promise<void> {
  const nodes = collectTextNodes();

  // Save originals once (before any translation)
  if (!savedNodes) {
    savedNodes = new Map(nodes.map((n) => [n, n.textContent!]));
  }

  // Translate in parallel batches of 8 to avoid hammering the API
  const BATCH_SIZE = 8;
  for (let i = 0; i < nodes.length; i += BATCH_SIZE) {
    const batch = nodes.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (node) => {
        const original = savedNodes!.get(node) ?? node.textContent ?? "";
        if (!original.trim()) return;
        try {
          const translated = await fetchTranslation(original.trim(), lang);
          if (node.parentNode && translated) {
            // Preserve surrounding whitespace
            const leading = original.match(/^\s*/)?.[0] ?? "";
            const trailing = original.match(/\s*$/)?.[0] ?? "";
            node.textContent = leading + translated + trailing;
          }
        } catch {
          // Keep original on error
        }
      })
    );
  }
}

/** Restore the page to English */
export function resetPage(): void {
  if (!savedNodes) return;
  savedNodes.forEach((text, node) => {
    if (node.parentNode) node.textContent = text;
  });
  savedNodes = null;
}
