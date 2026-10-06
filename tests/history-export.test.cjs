const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Execute the real application functions and handlers. Only DOM/download boundaries
// are synthetic; no browser, user storage or network is used by these tests.
const sourcePath = path.resolve(__dirname, '..', process.env.QUEUE_BOARD_SOURCE || 'src/index.template.html');
const source = fs.readFileSync(sourcePath, 'utf8');
function span(start, end) {
  const from = source.indexOf(start), to = source.indexOf(end, from);
  assert(from >= 0 && to > from, `Missing source boundary: ${start}`);
  return source.slice(from, to);
}
function parseCsv(text) {
  const rows = []; let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (ch === ',' && !quoted) { row.push(field); field = ''; }
    else if (ch === '\r' && text[i + 1] === '\n' && !quoted) {
      row.push(field); rows.push(row); row = []; field = ''; i++;
    } else field += ch;
  }
  row.push(field); rows.push(row); return rows;
}
function fixture(language = 'en') {
  const nodes = new Map(), blobs = [], downloads = [], notices = [], revoked = [], timers = [];
  function element(key = '') {
    const listeners = new Map();
    return { key, children: [], dataset: {}, value: '', textContent: '', hidden: false, disabled: false,
      append(...xs) { this.children.push(...xs); },
      replaceChildren(...xs) { this.children = xs; },
      querySelector(s) { return get(key + ' ' + s); },
      querySelectorAll() { return []; },
      setAttribute(k, v) { this[k] = v; }, removeAttribute(k) { delete this[k]; },
      classList: { toggle() {}, add() {}, remove() {} }, focus() {},
      addEventListener(event, handler) { listeners.set(event, handler); },
      trigger(event, extra = {}) { return listeners.get(event)?.({ target: this, preventDefault() {}, ...extra }); },
      remove() { this.removed = true; },
      click() { if (c.failDownload) throw Error('synthetic download failure'); downloads.push({ name: this.download, url: this.href }); }
    };
  }
  function get(key) { if (!nodes.has(key)) nodes.set(key, element(key)); return nodes.get(key); }
  const base = new Date(2026, 9, 6, 9).getTime();
  const session = { id: 'synthetic-session', startedAt: base, endedAt: null, nextNumber: 5,
    usedNumbers: [1, 2, 3, 4], counters: [{ id: 'counter-1', name: 'Desk, "A"\r\nEast' }],
    tickets: ['waiting', 'completed', 'absent', 'called'].map((status, i) => ({
      id: 'ticket-' + (i + 1), number: i + 1, displayNumber: String(i + 1).padStart(3, '0'), status,
      createdAt: base + i * 1000, calledAt: i ? base + i * 1000 + 100 : null,
      completedAt: status === 'completed' ? base + i * 1000 + 500 : null,
      absentAt: status === 'absent' ? base + i * 1000 + 500 : null,
      lastCounterId: i ? 'counter-1' : null, callCount: i ? 1 : 0
    })) };
  const forbidden = () => { throw Error('Unexpected state/broadcast/storage boundary'); };
  const c = vm.createContext({ session, endedSession: null, historyFilter: 'all', csvExportState: null,
    historyVisible: true, mobileSessionTab: 'history', language, displayMode: false, displayChannel: null,
    displayTitleCustom: true, printTitleCustom: true, printVisible: false, recoveryCandidate: null,
    sessionTransition: null, lastIssuedId: null, saveState: 'saved', APP_CONFIG: { name: 'Queue Board', nameJa: '呼び出し番号' },
    $: get, document: { createElement: element, querySelectorAll: () => [], body: element('body'), documentElement: {} },
    Blob, URL: { createObjectURL(b) { if (c.failBlob) throw Error('synthetic Blob failure'); blobs.push(b); return 'blob:test-' + blobs.length; }, revokeObjectURL(url) { revoked.push(url); } },
    window: { setTimeout(fn) { timers.push(fn); }, matchMedia: () => ({ matches: false }) },
    formatTime: () => '09:00', announce: (msg, opts) => notices.push({ msg, ...opts }),
    localStorage: { setItem: forbidden }, schedulePersistSession: forbidden, syncDisplayState: forbidden,
    postDisplayMessage: forbidden, sendDisplayEnded() {}, setSaveState() {}, initializeSoundSupport() {},
    renderCounterSetupFields() {}, loadSetupSettings() {}, renderRecoveryCandidate() {},
    normalizeRecoveredSession: value => structuredClone(value), finalizeSessionPersistence: async () => true,
    runSessionTransition: async options => { await options.persist(options.target); options.commit(); c.render(); }
  });
  vm.runInContext([
    span('      const translations = {', '      const $ = selector'),
    span('      function historySession()', '      function iconDelete('),
    span('      function applyLanguage()', "      $('#mobileSessionNav').addEventListener"),
    span("      $('#openHistoryButton').addEventListener", "      $('#setupForm').addEventListener")
  ].join('\n'), c, { filename: sourcePath });
  c.translate = (key, params = {}) => vm.runInContext('translations', c)[c.language][key]?.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? '') ?? key;
  c.render = () => { if (c.historyVisible) c.renderHistory(); else if (c.endedSession) c.renderSummary(); };
  function scope(value) { get('#historyCsvScope').value = value; get('#historyCsvScope').trigger('change'); }
  function name(value, id = 'historyCsvFilename') { get('#' + id).value = value; get('#' + id).trigger('input'); }
  async function csv(index = blobs.length - 1) {
    const bytes = Buffer.from(await blobs[index].arrayBuffer());
    assert.equal(bytes.subarray(0, 3).toString('hex'), 'efbbbf');
    return { bytes, rows: parseCsv(bytes.subarray(3).toString('utf8')) };
  }
  return { c, get, scope, name, csv, blobs, downloads, notices, revoked, timers };
}

test('full export preserves seven columns, BOM, CRLF, statuses and escaping', async () => {
  const h = fixture(); h.c.renderHistory(); h.get('#historyCsvButton').trigger('click');
  const { rows, bytes } = await h.csv();
  assert.deepEqual(rows[0], ['number', 'status', 'created_at', 'called_at', 'completed_at', 'counter', 'call_count']);
  assert.deepEqual(rows.slice(1).map(r => r[1]), ['waiting', 'completed', 'absent', 'called']);
  assert(rows.every(row => row.length === 7));
  assert.equal(rows[2][5], 'Desk, "A"\r\nEast');
  assert.equal(rows[1][3], ''); assert.equal(rows[1][4], '');
  assert(!bytes.toString('utf8').replaceAll('\r\n', '').includes('\n'));
  assert.equal(h.downloads[0].name, 'queue-board-2026-10-06.csv');
});

for (const language of ['en', 'ja']) {
  test(`${language}: scope defaults to All and explicitly describes the current filter and counts`, () => {
    const h = fixture(language); h.c.historyFilter = 'completed'; h.c.renderHistory();
    assert.equal(h.get('#historyCsvScope').value, 'all');
    assert.match(h.get('#historyCsvScope option[value="all"]').textContent, /4/);
    assert.match(h.get('#historyCsvScope option[value="filtered"]').textContent, /1/);
    assert.match(h.get('#historyCsvScope option[value="filtered"]').textContent, language === 'en' ? /Completed/ : /完了/);
    assert.equal(h.get('#historyExportCount').textContent, h.c.translate('csvExportCount', { count: '4' }));
    assert.equal(h.get('#historyCsvButton span').textContent, h.c.translate('saveAllCsv'));
  });
  for (const filter of ['all', 'waiting', 'called', 'completed', 'absent']) {
    test(`${language}: ${filter} display/count/filtered export use the same readonly selection`, async () => {
      const h = fixture(language); h.c.session.tickets.reverse();
      const before = JSON.stringify(h.c.session), identities = h.c.session.tickets.slice();
      h.c.historyFilter = filter; h.c.renderHistory(); h.scope('filtered');
      h.get('#historyCsvButton').trigger('click');
      const { rows } = await h.csv();
      const shown = h.get('#historyList').children.map(item => item.children[0].textContent);
      assert.deepEqual(rows.slice(1).map(row => row[0]), shown);
      assert.equal(rows.length - 1, filter === 'all' ? 4 : 1);
      assert.equal(h.get('#historyExportCount').textContent, h.c.translate('csvExportCount', { count: String(shown.length) }));
      assert.equal(h.get('#historyCsvButton span').textContent, h.c.translate('saveFilteredCsv'));
      assert.equal(JSON.stringify(h.c.session), before);
      identities.forEach((ticket, index) => assert.equal(h.c.session.tickets[index], ticket));
    });
  }
}

test('changing a filter or a ticket status updates the filtered count and next download', async () => {
  const h = fixture(); h.c.renderHistory(); h.scope('filtered');
  h.get('#historyFilters').trigger('click', { target: { closest: () => ({ dataset: { historyFilter: 'completed' } }) } });
  h.get('#historyCsvButton').trigger('click'); assert.equal((await h.csv()).rows.length, 2);
  h.c.session.tickets[0].status = 'completed'; h.c.renderHistory();
  h.get('#historyCsvButton').trigger('click'); assert.equal((await h.csv()).rows.length, 3);
  assert.match(h.get('#historyExportCount').textContent, /2/);
});

test('zero-match filtered export is disabled and creates no header-only file; All remains available', async () => {
  const h = fixture(); h.c.session.tickets = h.c.session.tickets.filter(ticket => ticket.status === 'completed');
  h.c.historyFilter = 'absent'; h.c.renderHistory(); h.scope('filtered');
  assert.equal(h.get('#historyCsvButton').disabled, true);
  h.get('#historyCsvButton').trigger('click'); assert.equal(h.blobs.length, 0);
  assert.equal(h.get('#historyEmpty').hidden, false);
  assert.match(h.get('#historyExportCount').textContent, /0/);
  h.scope('all'); assert.equal(h.get('#historyCsvButton').disabled, false);
  h.get('#historyCsvButton').trigger('click'); assert.equal((await h.csv()).rows.length, 2);
});

test('empty and missing sessions cannot create a CSV in either view', () => {
  const h = fixture(); h.c.session.tickets = []; h.c.renderHistory();
  for (const scope of ['all', 'filtered']) {
    h.scope(scope); assert.equal(h.get('#historyCsvButton').disabled, true);
    h.get('#historyCsvButton').trigger('click');
  }
  h.c.endedSession = h.c.session; h.c.session = null; h.c.renderSummary();
  assert.equal(h.get('#summaryCsvButton').disabled, true); h.get('#summaryCsvButton').trigger('click');
  h.c.endedSession = null; h.get('#historyCsvButton').trigger('click'); h.get('#summaryCsvButton').trigger('click');
  assert.equal(h.blobs.length, 0);
});

test('Summary always exports all tickets despite History scope and filter', async () => {
  const h = fixture(); h.c.historyFilter = 'absent'; h.c.renderHistory(); h.scope('filtered');
  h.c.endedSession = h.c.session; h.c.session = null; h.c.renderSummary();
  h.get('#summaryCsvButton').trigger('click');
  assert.equal((await h.csv()).rows.length, 5);
  assert.equal(h.get('#summaryCsvButton span').textContent, h.c.translate('saveAllCsv'));
});

test('selection preserves createdAt/number ordering, including equal times, without sorting the session', async () => {
  const h = fixture(); h.c.session.tickets.forEach(ticket => { ticket.createdAt = h.c.session.startedAt; });
  h.c.session.tickets.reverse(); const before = JSON.stringify(h.c.session);
  h.c.renderHistory(); h.get('#historyCsvButton').trigger('click');
  assert.deepEqual((await h.csv()).rows.slice(1).map(row => row[0]), ['001', '002', '003', '004']);
  assert.equal(JSON.stringify(h.c.session), before);
});

test('filename is editable and shared across language, navigation and same-ID session end', async () => {
  const h = fixture(); h.c.renderHistory(); h.name('受付 夕方'); h.scope('filtered');
  h.c.language = 'ja'; h.c.applyLanguage();
  assert.equal(h.get('#historyCsvFilename').value, '受付 夕方');
  h.c.closeHistoryView(); h.c.openHistoryView();
  assert.equal(h.get('#historyCsvFilename').value, '受付 夕方');
  h.get('#historyCsvButton').trigger('click'); assert.equal(h.downloads.at(-1).name, '受付 夕方.csv');
  await h.c.endSession(); assert.equal(h.get('#summaryCsvFilename').value, '受付 夕方');
  h.name('Updated name.CSV', 'summaryCsvFilename'); h.get('#summaryCsvButton').trigger('click');
  assert.equal(h.downloads.at(-1).name, 'Updated name.csv');
  h.c.openHistoryView(); assert.equal(h.get('#historyCsvFilename').value, 'Updated name.CSV');
  assert.equal(h.get('#historyCsvScope').value, 'filtered');
});

test('new session ID resets filename and export scope, same-ID snapshot replacement does not', () => {
  const h = fixture(); h.c.renderHistory(); h.name('Previous'); h.scope('filtered');
  h.c.session = structuredClone(h.c.session); h.c.renderHistory();
  assert.equal(h.get('#historyCsvFilename').value, 'Previous');
  h.c.session = { ...h.c.session, id: 'new-session', startedAt: new Date(2026, 9, 7, 10).getTime() };
  h.c.renderHistory(); assert.equal(h.get('#historyCsvFilename').value, 'queue-board-2026-10-07');
  assert.equal(h.get('#historyCsvScope').value, 'all');
});

for (const [raw, expected] of [
  ['report', 'report.csv'], ['Report.CSV', 'Report.csv'], ['report.csv.csv', 'report.csv'],
  [' report.CSV. ', 'report.csv'], ['report.csv .csv', 'report.csv'],
  ['  受付 集計  ', '受付 集計.csv'], ['../desk\\east:*?"<>|\u0000\u007f', 'deskeast.csv'],
  ['', 'queue-board-2026-10-06.csv'], ['... /\\:*?"<>|\u0001', 'queue-board-2026-10-06.csv'],
  ['.CSV', 'queue-board-2026-10-06.csv'], ['CON', 'queue-board-2026-10-06.csv']
]) {
  test(`filename ${JSON.stringify(raw)} is sanitized only for the download`, () => {
    const h = fixture(); h.c.renderHistory(); h.name(raw); h.c.renderHistory();
    assert.equal(h.get('#historyCsvFilename').value, raw);
    h.get('#historyCsvButton').trigger('click');
    assert.equal(h.downloads.at(-1).name, expected);
    assert.equal(h.get('#historyCsvFilename').value, raw);
  });
}

test('fresh ended-session view derives its default from the end date', () => {
  const h = fixture(); h.c.endedSession = h.c.session; h.c.session = null;
  h.c.endedSession.endedAt = new Date(2026, 9, 7, 10).getTime(); h.c.renderSummary();
  assert.equal(h.get('#summaryCsvFilename').value, 'queue-board-2026-10-07');
  h.get('#summaryCsvButton').trigger('click'); assert.equal(h.downloads[0].name, 'queue-board-2026-10-07.csv');
});

for (const failure of ['failBlob', 'failDownload']) {
  test(`${failure}: download failure retains name, scope, filter and session`, () => {
    const h = fixture(); h.c.historyFilter = 'completed'; h.c.renderHistory(); h.name('Retry'); h.scope('filtered');
    const before = JSON.stringify(h.c.session); h.c[failure] = true; h.get('#historyCsvButton').trigger('click');
    assert.equal(h.notices.at(-1).tone, 'warning'); assert.equal(JSON.stringify(h.c.session), before);
    assert.equal(h.get('#historyCsvFilename').value, 'Retry'); assert.equal(h.get('#historyCsvScope').value, 'filtered');
    assert.equal(h.c.historyFilter, 'completed');
    h.c[failure] = false; h.get('#historyCsvButton').trigger('click');
    assert.equal(h.downloads.at(-1).name, 'Retry.csv');
  });
}

test('download failures clean up the temporary link and Blob URL; success revokes after the click', () => {
  const h = fixture(); h.c.renderHistory(); h.c.failDownload = true;
  h.get('#historyCsvButton').trigger('click');
  assert.equal(h.c.document.body.children.at(-1).removed, true);
  h.timers.forEach(fn => fn()); assert.deepEqual(h.revoked, ['blob:test-1']);
  h.c.failDownload = false; h.get('#historyCsvButton').trigger('click');
  assert.equal(h.c.document.body.children.at(-1).removed, true);
  assert.equal(h.downloads.length, 1);
});

test('Help documents scope, Summary full export and the temporary shared filename in both languages', () => {
  assert(source.includes('data-i18n="helpCsvExport"'));
  for (const language of ['en', 'ja']) {
    const h = fixture(language); const help = h.c.translate('helpCsvExport');
    assert.match(help, language === 'en' ? /current filter/i : /絞り込み/);
    assert.match(help, language === 'en' ? /Summary.*all/ : /サマリー.*すべて/);
    assert.match(help, language === 'en' ? /reload/i : /再読み込み/);
  }
});

test('export UI has native labeled controls, a visible fixed suffix and live result count', () => {
  for (const id of ['historyCsvFilename', 'summaryCsvFilename']) {
    assert.match(source, new RegExp('<label[^>]*for="' + id + '"'));
    assert.match(source, new RegExp('<input[^>]*id="' + id + '"[^>]*type="text"'));
  }
  assert.match(source, /<select[^>]*id="historyCsvScope"/);
  assert.match(source, /id="historyExportCount"[^>]*role="status"/);
  assert.equal((source.match(/class="csv-filename-suffix">\.csv<\/span>/g) || []).length, 2);
});
