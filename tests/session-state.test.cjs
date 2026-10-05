const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Execute the actual application functions, with only browser/storage boundaries replaced.
// Deferred storage is deterministic: no timing sleeps or real user storage are involved.
const sourcePath = path.resolve(__dirname, '..', process.env.QUEUE_BOARD_SOURCE || 'src/index.template.html');
const source = fs.readFileSync(sourcePath, 'utf8');
function span(start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from);
  assert(from >= 0 && to > from, `Missing source boundary: ${start}`);
  return source.slice(from, to);
}
const functionCode = [
  span('      function normalizeRecoveredSession(', '      function detectLanguage('),
  span('      function parseNumber(', '      function renderCounterSetupFields('),
  span('      function startSession(', '      function defaultPrintTitle('),
  span('      async function endSession(', '      function iconDelete('),
  span('      function iconDelete(', '      function flashCounterNumber('),
  span('      function render(', '      function applyLanguage('),
  span('      function applyLanguage(', "      $('#mobileSessionNav').addEventListener"),
  span('      function enqueuePersistenceOperation(', '      function collectSetupSettings('),
  // The owned transition helpers are deliberately optional so baseline tests exercise old code.
  source.includes('      function beginSessionTransition(')
    ? span('      function beginSessionTransition(', '      function parseNumber(') : ''
].join('\n');
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const tick = () => new Promise(resolve => setImmediate(resolve));
function fixture(nextNumber = 1, { confirm = true } = {}) {
  const nodes = new Map();
  let activeElement = null, id = 0;
  function element(key = '') {
    const listeners = new Map();
    return {
      key, textContent: '', value: '', checked: false, hidden: false, disabled: false,
      isConnected: true, open: false, dataset: {}, children: [], attributes: {},
      classList: { toggle() {}, add() {}, remove() {} },
      append(...children) { this.children.push(...children); },
      replaceChildren(...children) { this.children = children; },
      setAttribute(name, value) { this.attributes[name] = value; },
      removeAttribute(name) { delete this.attributes[name]; },
      querySelector(selector) { return get(key + ' ' + selector); },
      querySelectorAll() { return []; },
      focus() { if (!this.disabled && !this.hidden) activeElement = this; },
      showModal() { this.open = true; this.showCount = (this.showCount || 0) + 1; }, close() { this.open = false; },
      getBoundingClientRect() { return { left: 10, right: 100, top: 10, bottom: 100 }; },
      addEventListener(event, handler) { listeners.set(event, handler); },
      trigger(event, extra = {}) { listeners.get(event)?.({ preventDefault() {}, ...extra }); }
    };
  }
  function get(key) { if (!nodes.has(key)) nodes.set(key, element(key)); return nodes.get(key); }
  const context = {
    session: { id: 'synthetic-session', startedAt: 1000, endedAt: null, nextNumber,
      digits: 3, title: 'Test', soundEnabled: false, recentCallCount: 0,
      usedNumbers: [], tickets: [], counters: [{ id: 'counter-1', name: 'A', currentTicketId: null }] },
    counterDraftNames: [], counterDraftCustom: [],
    sessionTransition: null, lastIssuedId: null, endedSession: null, recoveryCandidate: null,
    historyVisible: false, historyFilter: 'all', mobileSessionTab: 'operate', printVisible: false,
    displayMode: false, displayChannel: null, displayTitleCustom: true, printTitleCustom: true,
    persistenceReady: true, persistenceTimer: 0, persistenceSaveSerial: 0,
    persistenceOperation: Promise.resolve(), persistenceRecordKey: 'active',
    saveState: 'saved', saveFailureNotified: false, language: 'en',
    APP_CONFIG: { name: 'Queue Board', nameJa: 'Queue Board' },
    $: get, HTMLElement: Object, structuredClone, clearTimeout() {},
    window: { setTimeout() { return 1; } },
    document: { createElement: element, querySelectorAll: () => [], documentElement: {},
      get activeElement() { return activeElement; } },
    makeId: () => 'ticket-' + (++id), formatTicketNumber: n => String(n).padStart(3, '0'),
    formatTime: () => '00:00', defaultCounterName: () => 'Counter', defaultDisplayTitle: () => 'Test',
    translate: key => context.language + ':' + key, announcements: [],
    announce(message, options) { context.announcements.push({ message, ...options }); },
    AppToast: { dismiss() {} },
    AppConfirm: { ask: async () => confirm },
    writePersistedSessionRecord: async () => true,
    finalizeSessionPersistence: async () => true, deletePersistedSessionRecord: async () => true,
    sendDisplayEnded() {}, syncMobileSessionNav() {}, renderRecoveryCandidate() {},
    renderHistory() {}, renderSummary() {}, syncDisplayState() {},
    setupDisplayChannel() {}, loadSetupSettings() {}, renderCounterSetupFields() {},
    initializeSoundSupport() {}, saveSetupSettings() {},
    audioContextConstructor: () => null, playChime() {}, flashCounterNumber() {},
    defaultPrintTitle: () => 'Tickets'
  };
  const c = vm.createContext(context);
  vm.runInContext(functionCode, c, { filename: sourcePath });
  c.get = get;
  c.render();
  return c;
}
const event = { preventDefault() {} };
const numbers = c => Array.from(c.session.tickets, ticket => ticket.number);
function pendingStorage(c, name = 'finalizeSessionPersistence') {
  const write = deferred();
  c[name] = snapshot => { write.snapshot = snapshot && structuredClone(snapshot); return write.promise; };
  return write;
}
function actualConfirm(c) {
  delete c.AppConfirm;
  c.requestAnimationFrame = callback => callback();
  vm.runInContext(span('      const AppConfirm = (() => {', '      const AppToast = (() => {'), c);
}

for (const method of ['endSession', 'resetSession']) {
  test(`${method}: locks issue/manual/counter/Undo actions during pending storage`, async () => {
    const c = fixture();
    c.issueTicket(); c.issueTicket(); c.issueTicket();
    c.callNextTicket('counter-1'); c.markCurrentAbsent('counter-1');
    c.returnAbsentTicket(c.session.tickets[0].id);
    const undoReturn = c.announcements.at(-1).onAction;
    c.deleteQueuedTicket(c.session.tickets[0].id);
    const undoDelete = c.announcements.at(-1).onAction;
    c.callNextTicket('counter-1');
    const before = JSON.stringify(c.session);
    const write = pendingStorage(c, method === 'endSession' ? 'finalizeSessionPersistence' : 'deletePersistedSessionRecord');
    const operation = c[method]();
    await tick();
    c.issueTicket(); c.get('#manualNumber').value = '20'; c.addManualTicket(event);
    c.callNextTicket('counter-1'); c.recallCurrentTicket('counter-1');
    c.completeCurrentTicket('counter-1'); c.markCurrentAbsent('counter-1');
    c.returnAbsentTicket(c.session.tickets[0].id); c.deleteQueuedTicket(c.session.tickets[0].id);
    await c.deleteCurrentTicket('counter-1'); undoReturn(); undoDelete();
    c.language = 'ja'; c.applyLanguage();
    assert.equal(JSON.stringify(c.session), before, 'all session mutations must be blocked');
    assert.equal(c.get('#issueButton').disabled, true);
    assert.equal(c.get('#resetButton').disabled, true);
    assert.equal(c.get('#endSessionButton').disabled, true);
    assert.equal(c.get('#manualNumber').disabled, true);
    for (const card of c.get('#countersGrid').children) {
      assert(card.children.at(-1).children.every(button => button.disabled));
    }
    write.resolve(true); await operation;
    assert.equal(c.session, null);
    assert.equal(c.sessionTransition, null);
  });
  test(`${method}: rejection/false keeps state, reports error, restores focus and allows retry`, async () => {
    for (const failure of ['reject', 'false']) {
      const c = fixture(); c.issueTicket();
      const button = c.get(method === 'endSession' ? '#endSessionButton' : '#resetButton'); button.focus();
      const before = JSON.stringify(c.session);
      const storage = method === 'endSession' ? 'finalizeSessionPersistence' : 'deletePersistedSessionRecord';
      const write = pendingStorage(c, storage);
      const operation = c[method](); await tick();
      if (failure === 'reject') write.reject(new Error('synthetic storage error'));
      else write.resolve(false);
      await operation;
      assert.equal(JSON.stringify(c.session), before);
      assert.equal(c.saveState, 'error');
      assert.equal(c.sessionTransition, null);
      assert.equal(c.get('#issueButton').disabled, false);
      assert.equal(c.document.activeElement, button);
      assert.match(c.announcements.at(-1).message, /Failed$/);
      c[storage] = async () => true;
      await c[method]();
      assert.equal(c.session, null);
    }
  });
  test(`${method}: repeated transition requests do not replace the original confirmation`, async () => {
    const c = fixture(); c.issueTicket(); actualConfirm(c);
    const button = c.get(method === 'endSession' ? '#endSessionButton' : '#resetButton'); button.focus();
    const original = c[method]();
    const duplicates = [c.endSession(), c.resetSession()];
    assert.equal(c.get('#appConfirmDialog').showCount, 1);
    c.get('#appConfirmCancel').trigger('click'); await original; await Promise.all(duplicates);
    assert.equal(c.session.tickets.length, 1);
    assert.equal(c.sessionTransition, null);
    assert.equal(c.document.activeElement, button);
    const retry = c[method](); c.get('#appConfirmOk').trigger('click'); await retry;
    assert.equal(c.session, null);
  });
}

test('finalization does not enqueue an active autosave behind the archive write', async () => {
  const c = fixture(); c.issueTicket();
  let activeWrites = 0;
  c.writePersistedSessionRecord = async () => { activeWrites++; return true; };
  const write = pendingStorage(c);
  const ending = c.endSession(); await tick();
  c.applyLanguage(); c.schedulePersistSession();
  const pageHideSave = c.persistSessionNow();
  write.resolve(true); await ending; await pageHideSave;
  assert.equal(activeWrites, 0, 'pagehide/language/navigation must not resurrect the active record');
});

test('an older autosave settles before end without replacing the transition save status', async () => {
  const c = fixture(); c.issueTicket();
  const oldWrite = pendingStorage(c, 'writePersistedSessionRecord');
  const saving = c.persistSessionNow(); await tick();
  const endWrite = pendingStorage(c);
  const ending = c.endSession(); await tick();
  oldWrite.resolve(true); await saving; await tick();
  assert.equal(c.saveState, 'saving');
  endWrite.resolve(false); await ending;
  assert.equal(c.saveState, 'error');
  assert.deepEqual(numbers(c), [1]);
});

test('late confirmation and late storage cannot clear a replacement session', async () => {
  for (const stage of ['confirmation', 'storage']) {
    const c = fixture(); c.issueTicket();
    const gate = deferred();
    if (stage === 'confirmation') c.AppConfirm.ask = () => gate.promise;
    else c.finalizeSessionPersistence = () => gate.promise;
    const ending = c.endSession(); await tick();
    const replacement = { ...structuredClone(c.session), id: 'replacement-session', nextNumber: 50 };
    c.session = replacement;
    gate.resolve(true); await ending;
    assert.equal(c.session, replacement);
    assert.equal(c.endedSession, null);
    assert.equal(c.sessionTransition, null);
  }
});

test('ordinary zero start and pre-existing manual numbers preserve sequential numbering', () => {
  const c = fixture(0);
  c.get('#manualNumber').value = '2'; c.addManualTicket(event);
  c.issueTicket(); c.issueTicket(); c.issueTicket();
  assert.deepEqual(numbers(c), [2, 0, 1, 3]);
  assert.equal(c.session.nextNumber, 4);
  c.get('#manualNumber').value = '2'; c.addManualTicket(event);
  assert.deepEqual(numbers(c), [2, 0, 1, 3]);
  assert.match(c.get('#manualNumberError').textContent, /duplicateNumber$/);
});

test('999999 exhausts automatic numbering across render, language changes and reload/resume', () => {
  const c = fixture(999999); c.issueTicket();
  assert.equal(c.session.nextNumber, null);
  assert.equal(c.get('#issueButton').disabled, true);
  c.language = 'ja'; c.applyLanguage(); c.language = 'en'; c.applyLanguage();
  assert.equal(c.session.nextNumber, null);
  c.recoveryCandidate = JSON.parse(JSON.stringify(c.session)); c.session = null;
  c.resumeSavedSession(); c.issueTicket();
  assert.deepEqual(numbers(c), [999999]);
  assert.equal(c.session.nextNumber, null);
  assert.equal(c.get('#nextNumber').textContent, '—');
});

test('manual unused numbers remain available after exhaustion without reviving automatic issue', () => {
  const c = fixture(999999); c.issueTicket();
  for (const value of ['7', '0']) { c.get('#manualNumber').value = value; c.addManualTicket(event); }
  assert.deepEqual(numbers(c), [999999, 7, 0]);
  assert.equal(c.session.nextNumber, null);
  assert.equal(c.get('#issueButton').disabled, true);
  c.get('#manualNumber').value = '999999'; c.addManualTicket(event);
  assert.match(c.get('#manualNumberError').textContent, /duplicateNumber$/);
  assert.equal(c.session.tickets.length, 3);
});

test('terminal search skips used max number; deleting tickets never reuses their number', () => {
  const c = fixture(999998);
  c.get('#manualNumber').value = '999999'; c.addManualTicket(event);
  c.issueTicket();
  assert.equal(c.session.nextNumber, null);
  c.deleteQueuedTicket(c.session.tickets[0].id); c.issueTicket();
  assert.deepEqual(numbers(c), [999998]);
  assert.equal(c.session.nextNumber, null);
});

test('failed fallback archive must retain the persisted active session for reload', async () => {
  const c = fixture(); c.issueTicket();
  const active = JSON.stringify({ schemaVersion: 1, session: c.session });
  const stored = new Map([['active', active]]);
  Object.assign(c, { fallbackSessionStorageKey: 'active', fallbackHistoryStorageKey: 'history',
    persistenceStoreName: 'sessions', openPersistenceDb: async () => { throw new Error('unavailable'); },
    writeStorage: () => false, readStorage: key => stored.get(key) ?? null,
    removeStorage: key => { stored.delete(key); return true; } });
  vm.runInContext(span('      async function finalizeSessionPersistence(', '      function enqueuePersistenceOperation('), c);
  const result = await c.finalizeSessionPersistence(structuredClone(c.session));
  assert.equal(result, false);
  assert.equal(stored.get('active'), active);
  assert.equal(JSON.parse(stored.get('active')).session.tickets[0].number, 1);
});

test('discard saved reception owns the recovery candidate until deletion settles', async () => {
  const c = fixture(); c.issueTicket(); c.recoveryCandidate = c.session; c.session = null;
  const original = c.recoveryCandidate;
  const write = pendingStorage(c, 'deletePersistedSessionRecord');
  const discard = c.discardSavedSession(); await tick();
  c.resumeSavedSession();
  assert.equal(c.session, null);
  assert.equal(c.recoveryCandidate, original);
  assert.equal(c.get('#resumeSessionButton').disabled, true);
  write.resolve(false); await discard;
  assert.equal(c.recoveryCandidate, original);
  assert.equal(c.get('#resumeSessionButton').disabled, false);
  c.resumeSavedSession(); assert.deepEqual(numbers(c), [1]);
});

test('failed IndexedDB archive cannot claim success via fallback while the old active record survives', async () => {
  const c = fixture();
  let fallbackCleared = false;
  Object.assign(c, { fallbackSessionStorageKey: 'active', fallbackHistoryStorageKey: 'history',
    persistenceStoreName: 'sessions',
    openPersistenceDb: async () => ({ transaction() { throw new Error('synthetic transaction failure'); } }),
    writeStorage: () => true, readStorage: () => 'active-record',
    removeStorage: () => { fallbackCleared = true; return true; } });
  vm.runInContext(span('      async function finalizeSessionPersistence(', '      function enqueuePersistenceOperation('), c);
  assert.equal(await c.finalizeSessionPersistence(structuredClone(c.session)), false);
  assert.equal(fallbackCleared, false);
});

for (const close of ['close', 'escape', 'backdrop']) {
  test(`confirmation ${close} restores controls and focus without ending reception`, async () => {
    const c = fixture(); c.issueTicket(); actualConfirm(c);
    const button = c.get('#endSessionButton'); button.focus();
    const ending = c.endSession();
    if (close === 'close') c.get('#appConfirmClose').trigger('click');
    if (close === 'escape') c.get('#appConfirmDialog').trigger('cancel');
    if (close === 'backdrop') c.get('#appConfirmDialog').trigger('click', { clientX: 0, clientY: 0 });
    await ending;
    assert.deepEqual(numbers(c), [1]);
    assert.equal(c.get('#issueButton').disabled, false);
    assert.equal(c.document.activeElement, button);
    assert.equal(c.sessionTransition, null);
  });
}

test('explicit new reception restarts numbering, but duplicate start never replaces an active session', async () => {
  const c = fixture(999999); c.issueTicket();
  c.get('#startNumber').value = '10'; c.get('#counterCount').value = '1';
  c.startSession(event);
  assert.deepEqual(numbers(c), [999999]);
  await c.endSession(); c.startNewAfterSummary(); c.startSession(event);
  assert.equal(c.session.nextNumber, 10);
  assert.equal(c.get('#issueButton').disabled, false);
  c.issueTicket(); assert.deepEqual(numbers(c), [10]);
});

test('autosave rejection is reported without an unhandled promise rejection', async () => {
  const c = fixture(); c.issueTicket();
  c.writePersistedSessionRecord = async () => { throw new Error('synthetic rejection'); };
  assert.equal(await c.persistSessionNow(), false);
  assert.equal(c.saveState, 'error');
  assert.deepEqual(numbers(c), [1]);
});

test('successful fallback finalization archives exact tickets and removes recovery record', async () => {
  const c = fixture(); c.issueTicket(); c.issueTicket();
  const stored = new Map([['active', JSON.stringify({ schemaVersion: 1, session: c.session })]]);
  Object.assign(c, { fallbackSessionStorageKey: 'active', fallbackHistoryStorageKey: 'history',
    persistenceStoreName: 'sessions', openPersistenceDb: async () => { throw new Error('unavailable'); },
    writeStorage: (key, value) => { stored.set(key, value); return true; },
    readStorage: key => stored.get(key) ?? null,
    removeStorage: key => { stored.delete(key); return true; } });
  vm.runInContext(span('      async function finalizeSessionPersistence(', '      function enqueuePersistenceOperation('), c);
  await c.endSession();
  assert.equal(c.session, null);
  assert.equal(stored.has('active'), false);
  const history = JSON.parse(stored.get('history'));
  assert(history.session.endedAt > 0);
  assert.deepEqual(history.session.tickets.map(ticket => ticket.number), [1, 2]);
  assert.deepEqual(Array.from(c.normalizeRecoveredSession(history.session).tickets, ticket => ticket.number), [1, 2]);
});

test('failed IndexedDB deletion preserves fallback recovery for reset and discard after reload', async () => {
  for (const method of ['resetSession', 'discardSavedSession']) {
    const c = fixture(); c.issueTicket();
    const active = JSON.stringify({ schemaVersion: 1, session: c.session });
    const stored = new Map([['active', active]]);
    if (method === 'discardSavedSession') { c.recoveryCandidate = c.session; c.session = null; }
    Object.assign(c, { fallbackSessionStorageKey: 'active', persistenceStoreName: 'sessions',
      openPersistenceDb: async () => ({ transaction() { throw new Error('synthetic transaction failure'); } }),
      readStorage: key => stored.get(key) ?? null,
      removeStorage: key => { stored.delete(key); return true; } });
    vm.runInContext(span('      async function readPersistedSessionRecord(', '      async function writePersistedSessionRecord(') +
      span('      async function deletePersistedSessionRecord(', '      async function readLatestArchivedSessionRecord('), c);
    await c[method]();
    assert.equal(c.saveState, 'error');
    assert.equal(stored.get('active'), active);
    const recovered = await c.readPersistedSessionRecord();
    assert.equal(recovered.session.tickets[0].number, 1);
  }
});
