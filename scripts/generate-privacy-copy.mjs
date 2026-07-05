import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const text = fs.readFileSync(path.join(root, 'filee.txt'), 'utf8');
const lines = text.split(/\r?\n/);
const sectionStartRe = /^(\d+)\.\s+(.+)$/;

let idx = 0;
while (idx < lines.length && !sectionStartRe.test(lines[idx].trim())) idx++;

const headerLines = lines.slice(0, idx).map((l) => l.trim()).filter(Boolean);
const title = headerLines[0] || 'MaritimeLink Privacy Policy';
const meta = headerLines.slice(1);

const sections = [];
let current = null;
let buffer = [];

function flush() {
    if (current && buffer.length) {
        current.content = buffer
            .join('\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }
    buffer = [];
}

for (; idx < lines.length; idx++) {
    const trimmed = lines[idx].trim();
    const m = trimmed.match(sectionStartRe);
    if (m && !trimmed.match(/^\d+\.\d+/)) {
        flush();
        if (current) sections.push(current);
        current = { number: m[1], title: m[2] };
        buffer = [];
    } else if (current) {
        buffer.push(lines[idx]);
    }
}
flush();
if (current) sections.push(current);

const output = `// Auto-generated from filee.txt — do not edit manually; re-run scripts/generate-privacy-copy.mjs
export const PRIVACY_TITLE = ${JSON.stringify(title)};

export const PRIVACY_META = ${JSON.stringify(meta, null, 4)};

export const PRIVACY_SECTIONS = ${JSON.stringify(sections, null, 4)};
`;

fs.writeFileSync(path.join(root, 'src/content/privacyCopy.js'), output, 'utf8');
console.log(`Generated ${sections.length} sections (${sections.reduce((n, s) => n + s.content.length, 0)} chars)`);
