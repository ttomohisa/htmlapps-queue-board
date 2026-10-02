# Queue Board

Queue Board is a Browser Kitty app for temporary reception desks and small events. It issues numbered tickets, keeps a shared waiting queue, and calls people in order.

The project is currently at **v0.4.0 — Display Board**.

## Features

- Start a Session with a chosen starting number
- Configure one to four Counters with custom names
- Issue sequential Tickets
- Add an arbitrary number manually
- Prevent duplicate numbers within the same Session
- Let each Counter call from the same shared waiting queue
- Prevent one Ticket from being assigned to multiple Counters
- Recall, complete, mark absent, or delete independently at each Counter
- Return absent Tickets to the end of the queue
- Delete waiting / absent Tickets with Undo
- Open a waiting-room Display in a separate window
- Sync current numbers, Counters, recent calls, waiting count, and Display title from Operator to Display
- Keep Operator running if Display is closed and reconnect to current state when reopened
- Support portrait and landscape Display layouts
- Japanese / English UI
- Fully local processing

## Display Board

Before starting reception, **Display settings** can configure:

- Display title
- Waiting-count visibility
- Number of recent calls to show (0–5)

After reception starts, select **Open display** to open the same HTML in Display mode in a separate browser window. On desktop, that window can be moved to an external monitor.

Synchronization stays inside the same browser. `postMessage` is the primary path, with `BroadcastChannel` used as a supplementary path when available. The standalone HTML does not need an external server when opened through `file://`.

## v0.4.0 limitations

- Up to four Counters
- Display is limited to another window in the same browser
- No call chime yet
- No Fullscreen or Wake Lock yet
- No autosave or Session recovery
- No CSV export
- No ticket printing

Chime, Fullscreen, and Wake Lock are planned for the next milestone.

## Privacy

Ticket numbers, Counter settings, Display settings, and Session state are processed in the browser. The app uses no external API, analytics, or telemetry, and its Content Security Policy blocks runtime external connections.

Display synchronization does not send entered data to an external server.

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
