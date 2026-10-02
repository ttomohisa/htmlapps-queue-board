# Queue Board

Queue Board is a Browser Kitty app for temporary reception desks and small events. It issues numbered Tickets, keeps a shared waiting queue, and calls people in order.

The project is currently at **v0.6.0 — Persistence / Recovery**.

## Features

- Start a Session with a chosen starting number
- Configure one to four Counters with custom names
- Issue sequential or manual Tickets
- Prevent duplicate numbers within the same Session
- Let each Counter call from the same shared queue
- Recall, complete, mark absent, or delete independently
- Return absent Tickets to the end of the queue
- Open a waiting-room Display in a separate window
- Built-in chime, Fullscreen, and Wake Lock
- Autosave the in-progress Session
- Resume a Session after a page reload
- Discard a saved Session and start new with confirmation
- Save starting-number, Counter, sound, and Display settings
- Show Saving / Saved / Save failed state
- Japanese / English UI
- Fully local processing

## Autosave and recovery

The in-progress Session is saved locally on the device.

**IndexedDB is the primary Session store.** If IndexedDB is unavailable, Queue Board falls back to localStorage. Lightweight setup values such as starting number, Counter count and names, call sound, and Display settings are stored in localStorage.

After a reload, if an in-progress Session exists, Queue Board does not silently open a blank setup screen. It presents:

- Resume reception
- Start new

Starting new requires confirmation before the saved Session is discarded.

Ticket changes are saved after a short debounce. Queue Board also attempts a save when the page moves into the background. Save and delete operations are serialized so a delayed save cannot recreate a Session immediately after reset.

## Reused settings

The following settings are stored locally and reused for the next reception:

- Starting number
- Counter count
- Counter names
- Call sound ON/OFF
- Display title
- Recent-call count
- Waiting-count visibility

Resetting the active Session does not reset these setup preferences.

## Save errors

If Session or settings storage fails, Queue Board exposes a Save failed state and shows an explanatory toast. Core queue operation can continue, but recovery after reload cannot be guaranteed.

## v0.6.0 limitations

- Up to four Counters
- Display is limited to another window in the same browser
- No Session history screen
- No CSV export
- No Session Summary
- No ticket printing

History, CSV, and the formal Session-ending flow are planned for the next milestone.

## Privacy

Ticket numbers, Counter settings, Display settings, and Session state are processed in the browser. Persistence uses only local device storage such as IndexedDB / localStorage.

The app uses no external API, analytics, or telemetry, and its Content Security Policy blocks runtime external connections.

## Single HTML

The build produces:

- `dist/index.html`
- `dist/index.self-extract.html`
- `queue-board.html`

## Development

```powershell
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-powershell-syntax.ps1
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-repository.ps1
```

See `APP_SPEC.md` for the formal specification and v0.1.0–v1.0.0 roadmap.

## License

MIT License
