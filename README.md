# Queue Board

Queue Board is a Browser Kitty app for temporary reception desks and small events. It issues numbered tickets, keeps a shared waiting queue, and calls people in order.

The project is currently at **v0.3.0 — Multi Counter**.

## Features

- Start a session with a chosen starting number
- Configure one to four counters
- Give each counter a custom name
- Issue sequential tickets
- Add an arbitrary number manually
- Prevent duplicate numbers within the same session
- Let each counter call from the same shared waiting queue
- Prevent the same Ticket from being assigned to multiple counters
- Recall, complete, mark absent, or delete independently at each counter
- Return absent tickets to the end of the queue
- Delete waiting / absent tickets with Undo
- Show waiting, active-counter, registered, and completed counts
- Japanese / English UI
- Desktop layout optimized for multiple counters and a stacked smartphone layout
- Fully local processing

## Usage

1. Set the starting number, counter count, and optional counter names, then select **Start reception**.
2. Use **Issue number** for normal sequential tickets, or manual entry for existing paper tickets.
3. Select **Call next** at any available counter to assign the first waiting ticket to that counter.
4. Use **Call again** at that counter when needed.
5. Finish with **Complete** or **Absent** at the same counter.
6. Return an absent ticket to the end of the queue when the visitor comes back.

## v0.3.0 limitations

- Up to four counters
- No autosave or session recovery
- No Display window
- No CSV export
- No ticket printing

Reloading the page, closing the tab, or resetting the session discards the current queue. Persistence is planned for a later version.

## Privacy

Ticket numbers, counter settings, and session state are processed in the browser. The app uses no external API, analytics, or telemetry, and its Content Security Policy blocks runtime external connections.

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
