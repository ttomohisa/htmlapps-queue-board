# Queue Board

Queue Board is a Browser Kitty app for temporary reception desks and small events. It issues numbered Tickets, keeps a shared waiting queue, and calls people in order.

The project is currently at **v0.5.0 — Sound / Fullscreen / Wake**.

## Features

- Start a Session with a chosen starting number
- Configure one to four Counters with custom names
- Issue sequential or manual Tickets
- Prevent duplicate numbers within the same Session
- Let each Counter call from the same shared queue
- Recall, complete, mark absent, or delete independently at each Counter
- Return absent Tickets to the end of the queue
- Open a waiting-room Display in a separate window
- Sync active numbers, Counter names, recent calls, waiting count, and Display title
- Play a built-in chime on calls and recalls
- Turn call sound on or off
- Preview the chime before starting reception
- Use Fullscreen on the Display
- Use Screen Wake Lock on supported browsers
- Feature detection and graceful fallback for Fullscreen / Wake Lock
- Portrait and landscape Display layouts
- Japanese / English UI
- Fully local processing

## Call sound

Call sound is ON by default and can be previewed before starting reception.

The chime is generated locally with the Web Audio API. The app does not fetch an external audio file at runtime. Normal calls and recalls use slightly different chime patterns.

The Operator can toggle call sound during a Session. If Web Audio is unavailable, only the sound feature is disabled; the queue and Display remain usable.

## Display

Select **Open display** after starting reception to open the same HTML in Display mode in a separate window.

Optional Display features:

- **Fullscreen** when the browser supports the Fullscreen API
- **Keep screen awake** when the browser supports the Screen Wake Lock API

Wake Lock is reacquired when appropriate after the Display becomes visible again. Unsupported or failed optional APIs do not block the Display itself.

## v0.5.0 limitations

- Up to four Counters
- Display is limited to another window in the same browser
- No autosave or Session recovery
- No CSV export
- No ticket printing
- No spoken number announcements

## Privacy

Ticket numbers, Counter settings, Display settings, and Session state are processed in the browser. The app uses no external API, analytics, or telemetry, and its Content Security Policy blocks runtime external connections.

The chime is generated in-app, and Display synchronization stays inside the same browser.

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
