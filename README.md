# Queue Board

Queue Board is a Browser Kitty app for temporary reception desks and small events. It issues numbered tickets, keeps a waiting queue, and calls people in order.

The project is currently at **v0.2.0 — Queue Operations**.

## Features

- Start a session with a chosen starting number
- Issue sequential tickets
- Add an arbitrary number manually
- Prevent duplicate numbers within the same session
- Call the first waiting ticket at one counter
- Recall the active ticket
- Complete or mark the active ticket absent
- Return absent tickets to the end of the queue
- Delete waiting / absent tickets with Undo
- Delete the active ticket with confirmation
- Show waiting, registered, and completed counts
- Japanese / English UI
- Responsive desktop and smartphone layout
- Fully local processing

## Usage

1. Check the starting number and select **Start reception**.
2. Use **Issue number** for normal sequential tickets, or manual entry for existing paper tickets.
3. Select **Call next** to call the first waiting ticket.
4. Use **Call again** when needed.
5. Finish with **Complete** or **Absent**.
6. Return an absent ticket to the end of the queue when the visitor comes back.

## v0.2.0 limitations

- One counter only
- No autosave or session recovery
- No Display window
- No CSV export
- No ticket printing

Reloading the page, closing the tab, or resetting the session discards the current queue. Persistence is planned for a later version.

## Privacy

Ticket numbers and session state are processed in the browser. The app uses no external API, analytics, or telemetry, and its Content Security Policy blocks runtime external connections.

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
