# Queue Board

Queue Board is a Browser Kitty app for temporary reception desks and small events. It issues numbered tickets, keeps a waiting queue, and calls people in order.

The project is currently at **v0.1.0 — Core Queue**.

## What v0.1.0 includes

- Start a session with a chosen starting number
- Issue sequential tickets
- Add issued tickets to the waiting queue
- Call the first waiting ticket at one counter
- Complete the currently called ticket
- Show waiting, issued, and completed counts
- Reset the session with confirmation
- Japanese / English UI
- Responsive desktop and smartphone layout
- Single-HTML build with runtime external connections blocked

## Usage

1. Check the starting number and select **Start reception**.
2. Select **Issue number** for each visitor.
3. When the counter is free, select **Call next**.
4. Select **Complete** when service is finished.

## v0.1.0 limitations

This version intentionally implements only the core flow defined in the roadmap.

- One counter only
- No autosave or session recovery
- No manual ticket entry
- No absent or recall flow
- No Display window
- No CSV export
- No ticket printing

Reloading the page, closing the tab, or resetting the session discards the current queue. Persistence is planned for a later version.

## Privacy

Ticket numbers and session state are processed in the browser. The app uses no external API, analytics, or telemetry, and its Content Security Policy blocks runtime external connections.

## Single HTML

The template build produces:

- `dist/index.html`
- `dist/index.self-extract.html`
- `queue-board.html`

## Development

```powershell
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-powershell-syntax.ps1
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-repository.ps1
```

See `APP_SPEC.md` for the formal product specification and the v0.1.0–v1.0.0 roadmap.

## License

MIT License
