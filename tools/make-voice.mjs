// Pre-records every narration line of a lesson as a neural-voice mp3.
//
//   node tools/make-voice.mjs lessons/lisa-money            (only missing clips)
//   node tools/make-voice.mjs lessons/lisa-money --force    (re-record everything)
//   VOICE=zh-TW-YunJheNeural node tools/make-voice.mjs ...  (another voice)
//
// Needs Python with edge-tts:  python -m pip install edge-tts
// Clips are named by a hash of the spoken text, so editing a line just needs a re-run;
// clips no longer used by the lesson are deleted.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const dir = process.argv[2];
if (!dir) { console.error('usage: node tools/make-voice.mjs <lesson folder> [--force]'); process.exit(1); }
const force = process.argv.includes('--force');
const VOICE = process.env.VOICE || 'zh-TW-HsiaoChenNeural';
const RATE = process.env.RATE || '+0%';

const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
// the lesson content (QUIZ, feedback, SCENES) sits between these two markers in the page script
const a = html.indexOf('const QUIZ'), b = html.indexOf('/* ---------- notation helper');
if (a < 0 || b < 0) throw new Error('could not find the lesson content block');
const { QUIZ, SCENES, feedback } = new Function(html.slice(a, b) + ';return {QUIZ, SCENES, feedback};')();

// same hash as voiceId() in the page
const voiceId = t => { let h = 0x811c9dc5; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };

const lines = new Set();
SCENES.forEach(s => s.caps.forEach(c => lines.add(c.say || c.t)));
QUIZ.forEach(q => q.pick.forEach(({ ans }) => q.opts.forEach((_, j) => lines.add(feedback(q, j === ans, ans)))));

const out = path.join(dir, 'voice');
fs.mkdirSync(out, { recursive: true });
const keep = new Set();
let made = 0;
for (const text of lines) {
  const file = voiceId(text) + '.mp3';
  keep.add(file);
  const dest = path.join(out, file);
  if (!force && fs.existsSync(dest)) continue;
  execFileSync('python', ['-m', 'edge_tts', '--voice', VOICE, `--rate=${RATE}`, '--text', text, '--write-media', dest], { stdio: ['ignore', 'ignore', 'inherit'] });
  made++;
  console.log(`${file}  ${text}`);
}
let removed = 0;
for (const f of fs.readdirSync(out)) if (f.endsWith('.mp3') && !keep.has(f)) { fs.unlinkSync(path.join(out, f)); removed++; }
console.log(`${lines.size} lines, ${made} recorded, ${removed} stale removed (${VOICE})`);
