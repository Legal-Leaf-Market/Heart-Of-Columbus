// Front matter and Markdown for content/, with no npm dependency.
// TODO(owner): the plan leaves "small dependency or our own parser" to you.
// This is the small own parser: it covers what the CMS writes and what a
// story needs, and throws on anything it doesn't understand, so a story
// never renders wrong in silence. Swapping in `marked` later only touches
// this file.
import { esc } from '../layout.mjs';

// ---------- YAML front matter (the subset Decap and Sveltia write) ----------
// Maps, lists of scalars or maps, quoted and plain scalars, flow lists
// ([a, b]), and block scalars (| and >, with an optional -).

const scalar = (raw) => {
  const s = raw.trim();
  if (s === '' || s === '~' || s === 'null') return null;
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  if (s.startsWith('"')) return JSON.parse(s);
  if (s.startsWith("'")) return s.slice(1, -1).replace(/''/g, "'");
  if (s.startsWith('[')) return s.slice(1, -1).split(',').map((x) => x.trim()).filter(Boolean).map(scalar);
  if (s.startsWith('{') || s.startsWith('&') || s.startsWith('*') || s.startsWith('!')) throw new Error(`front matter: unsupported YAML "${s}"`);
  return s.replace(/\s+#.*$/, '');
};

const indentOf = (l) => l.match(/^ */)[0].length;

export function parseYaml(text) {
  const lines = text.split('\n').filter((l) => l.trim() && !/^\s*#/.test(l));
  let i = 0;

  function block(indent, style, keep) {
    const out = [];
    while (i < lines.length && (indentOf(lines[i]) >= indent)) out.push(lines[i++].slice(indent));
    const s = style === '|' ? out.join('\n') : out.join(' ').replace(/\s+/g, ' ');
    return keep ? s : s.trim();
  }

  function value(rest, indent) {
    const m = rest.match(/^([|>])(-?)\s*$/);
    if (m) return block(i < lines.length ? indentOf(lines[i]) : indent + 2, m[1], false);
    if (rest.trim() !== '') return scalar(rest);
    if (i < lines.length && indentOf(lines[i]) > indent) return node(indentOf(lines[i]));
    if (i < lines.length && indentOf(lines[i]) === indent && lines[i].trim().startsWith('- ')) return node(indent);
    return null;
  }

  function node(indent) {
    if (lines[i].trim().startsWith('-')) {
      const list = [];
      while (i < lines.length && indentOf(lines[i]) === indent && /^\s*-(\s|$)/.test(lines[i])) {
        const item = lines[i].slice(indent + 1).replace(/^ /, '');
        if (/^[\w-]+:(\s|$)/.test(item)) {
          // "- key: v" starts a map; its other keys sit two spaces in.
          lines[i] = ' '.repeat(indent + 2) + item;
          list.push(node(indent + 2));
        } else { i++; list.push(item.trim() === '' ? node(indentOf(lines[i])) : scalar(item)); }
      }
      return list;
    }
    const map = {};
    while (i < lines.length && indentOf(lines[i]) === indent) {
      const m = lines[i].slice(indent).match(/^([\w-]+):(?:\s+(.*)|\s*)$/);
      if (!m) throw new Error(`front matter: can't read "${lines[i].trim()}"`);
      i++;
      map[m[1]] = value(m[2] || '', indent);
    }
    return map;
  }

  if (!lines.length) return {};
  const out = node(indentOf(lines[0]));
  if (i < lines.length) throw new Error(`front matter: can't read "${lines[i].trim()}"`);
  return out;
}

export function splitFrontMatter(src) {
  const m = src.replace(/^﻿/, '').match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error('missing front matter (--- at the top and bottom)');
  return { data: parseYaml(m[1].replace(/\r/g, '')), body: m[2] };
}

// ---------- Markdown ----------
// Paragraphs, ## and ### headings, bullet and numbered lists, > quotes,
// --- rules, **bold**, *italic*, [links](url) and line breaks. Raw HTML is
// shown as text, never run. Straight quotes become curly ones.

const curly = (s) => s.replace(/(^|[\s(\[“])'/g, '$1‘').replace(/'/g, '’').replace(/(^|[\s(\[‘])"/g, '$1“').replace(/"/g, '”');

export function inline(src) {
  const links = [];
  let s = src.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, href) => {
    if (!/^(https?:\/\/|\/|#|mailto:)/.test(href)) throw new Error(`markdown: link must be https, mailto or a site path: ${href}`);
    links.push([text, href]);
    return `\u0000${links.length - 1}\u0000`;
  });
  s = curly(esc(s).replace(/&quot;/g, '"'))
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\s][^*]*?)\*/g, '$1<em>$2</em>')
    .replace(/ {2,}\n|\\\n/g, '<br>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, n) => {
    const [text, href] = links[n];
    const ext = /^https?:/.test(href);
    return `<a href="${esc(href)}"${ext ? ' target="_blank" rel="noopener"' : ''}>${inline(text)}</a>`;
  });
}

export function markdown(src) {
  const blocks = String(src).replace(/\r/g, '').trim().split(/\n{2,}/);
  return blocks.map((b) => {
    if (/^###\s/.test(b)) return `<h3>${inline(b.replace(/^###\s+/, ''))}</h3>`;
    if (/^##\s/.test(b)) return `<h2>${inline(b.replace(/^##\s+/, ''))}</h2>`;
    if (/^#\s/.test(b)) throw new Error('markdown: use ## for headings; the headline is the only h1');
    if (/^(---|\*\*\*)$/.test(b.trim())) return '<hr>';
    if (/^>\s?/.test(b)) return `<blockquote><p>${inline(b.split('\n').map((l) => l.replace(/^>\s?/, '')).join('\n'))}</p></blockquote>`;
    const lines = b.split('\n');
    if (lines.every((l) => /^[-*]\s/.test(l))) return `<ul>${lines.map((l) => `<li>${inline(l.replace(/^[-*]\s+/, ''))}</li>`).join('')}</ul>`;
    if (lines.every((l) => /^\d+\.\s/.test(l))) return `<ol>${lines.map((l) => `<li>${inline(l.replace(/^\d+\.\s+/, ''))}</li>`).join('')}</ol>`;
    return `<p>${inline(b)}</p>`;
  }).join('\n');
}
