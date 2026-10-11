const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { gunzipSync } = require('node:zlib');
let html = fs.readFileSync(path.resolve(__dirname, '..', process.env.QUEUE_BOARD_SOURCE || 'src/index.template.html'), 'utf8');
const payload = html.match(/<script id="self-extract-payload"[^>]*>([A-Za-z0-9+/=\s]+)<\/script>/);
if (payload) html = gunzipSync(Buffer.from(payload[1], 'base64')).toString('utf8');
// Source contracts complement native wheel and geometry checks, not replace them.
test('native modal root and body locks are scoped to an open modal', () => {
  assert.match(html, /html:has\(dialog:modal\),\s*body:has\(dialog:modal\)\s*\{\s*overflow:\s*hidden;?\s*\}/);
});
test('JA and EN Help document the temporary background lock', () => {
  assert.match(html, /ダイアログを開いている間は背景のスクロールが止まります。/);
  assert.match(html, /Background scrolling is paused while a dialog is open\./);
});
test('the existing decorative local-processing shield is retained', () => {
  const badge = html.match(/<div class="local-badge">([\s\S]*?)<\/div>/)[1];
  assert.match(badge, /aria-hidden="true"/);
  assert.match(badge, /d="M12 3 5 6v5c0 4\.6 2\.8 8 7 10 4\.2-2 7-5\.4 7-10V6z"/);
  assert.match(badge, /d="m9 12 2 2 4-5"/);
});

test('confirmation has a modal-only bounded flex shell', () => {
  const css = html.match(/#appConfirmDialog\[open\]\s*\{([^}]+)\}/)?.[1] || '';
  assert.match(css, /display:\s*flex/);
  assert.match(css, /flex-direction:\s*column/);
  assert.match(css, /max-height:\s*calc\(100dvh - 28px/);
});
test('confirmation header cannot shrink away while body scrolls', () => {
  const css = html.match(/#appConfirmDialog \.app-confirm-header\s*\{([^}]+)\}/)?.[1] || '';
  assert.match(css, /flex:\s*0 0 auto/);
});
test('confirmation body can shrink and scroll to both existing actions', () => {
  const css = html.match(/#appConfirmDialog \.app-confirm-body\s*\{([^}]+)\}/)?.[1] || '';
  assert.match(css, /min-height:\s*0/);
  assert.match(css, /flex:\s*1 1 auto/);
  assert.match(css, /overflow:\s*auto/);
  assert.match(css, /overscroll-behavior:\s*contain/);
  assert.match(html, /<div class="app-confirm-body">[\s\S]*?<div class="app-confirm-actions">[\s\S]*?id="appConfirmCancel"[\s\S]*?id="appConfirmOk"/);
});
