# Queue Board

Queue Board is a Browser Kitty app for temporary reception desks and small events. It issues numbered Tickets, keeps a shared queue, and calls people in order.

The project is currently at **v0.7.0 — History / Export**.

## Features

- One to four Counter queue operation
- Sequential / manual Ticket entry
- Call / recall / complete / absent / return-to-waiting flow
- Waiting-room Display
- Built-in chime / Fullscreen / Wake Lock
- Active-Session autosave and recovery
- History screen
- Status filters: All / Waiting / Calling / Completed / Absent
- Issued / called / absent / completed timestamps per Ticket
- callCount display
- CSV export
- Session Summary
- Average wait time
- Confirmed Session-ending flow
- Local archive for ended Sessions
- Start-new-reception flow
- Japanese / English UI
- Fully local processing

## History

Open **History** from the Operator screen to review Tickets in the current Session.

Each Ticket shows the timestamps that are available for:

- Issued
- Called
- Absent
- Completed

History can be filtered by current status and also shows call count and the most recent Counter associated with the Ticket.

## CSV

CSV can be saved from History or Session Summary.

The file contains these seven columns:

```text
number
status
created_at
called_at
completed_at
counter
call_count
```

CSV is generated as UTF-8 with BOM, with filenames in the form `queue-board-YYYY-MM-DD.csv`.

## Session Summary

**End reception** is a confirmed operation. Queue Board first saves the ended Session history locally and only ends the active Session after that save succeeds.

Summary shows:

- Issued count
- Completed count
- Absent count
- Still-waiting count
- Started time
- Ended time
- Average wait

Average wait is calculated from `createdAt → calledAt`, as defined by the specification.

After ending reception, the user can:

- Save CSV
- View History
- Start a new reception

Starting a new reception does not delete the archived ended Session.

## Persistence

The active Session is autosaved with IndexedDB as the primary store and localStorage as fallback.

Ended Sessions are also archived locally. After reload, when no active Session exists, Queue Board can restore the latest ended Session Summary.

## v0.7.0 limitations

- Up to four Counters
- No cross-Session archive browser yet
- No ticket printing yet
- Final Mobile / Accessibility release-candidate refinement is not yet complete

Ticket printing is planned for v0.8.0 and Mobile / UX / Accessibility RC work for v0.9.0.

## Privacy

Tickets, Session history, settings, and Display state are processed in the browser. The app uses no external API, analytics, or telemetry, and its Content Security Policy blocks runtime external connections.

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
