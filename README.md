# Queue Board

Queue Board is a Browser Kitty app for temporary reception desks and small events. It issues numbered Tickets, manages a shared queue, shows a waiting-room Display, records History, and can prepare printable number tickets.

The project is currently at **v0.9.0 — Mobile / UX / Accessibility RC**.

## Features

- One to four Counter queue operation
- Sequential / manual Ticket entry
- Call / recall / complete / absent / return-to-waiting flow
- Waiting-room Display
- Built-in chime / Fullscreen / Wake Lock
- Active-Session autosave and recovery
- History / CSV / Session Summary
- Number-ticket creation
- Print preview
- Browser printing
- Smartphone Operate / Queue / History bottom navigation
- Safe-area-aware mobile controls and dialogs
- Keyboard focus / ARIA polish
- Japanese / English UI
- Fully local processing

## Mobile / UX

On smartphones, an active reception is split into three bottom-navigation views: **Operate / Queue / History**. The fixed navigation respects the device safe area, and transient messages are raised above it so controls and status text are not covered.

Long titles and Counter names wrap safely, touch targets are kept practical, and large Ticket / History lists use browser rendering containment where supported.

## Number-ticket creation

Use the printer icon in the header to create number tickets independently from the current Session.

Settings:

- Starting number
- Ending number
- Digits
- Title
- Paper size
- Tickets per page

Defaults:

- Starting number: 001
- Ending number: 030
- Digits: 3
- Title: “Queue Number”
- Paper size: A4
- Tickets per page: 8

Paper sizes: **A4 / Letter**. Tickets per page can be set from 1 to 20.

## Print preview

Queue Board generates a page-by-page preview from the selected settings.

- Ticket title and number
- Dashed cutting guides
- Page break after each paper sheet
- Dynamic print `@page` size
- Application controls excluded from printed output

Select **Print** to open the browser's standard print dialog.

Printer margins and scaling can still vary depending on the browser, operating system, and printer driver.

## Printing limitations

To avoid freezing the browser, one print job can generate up to **1000 tickets**.

- Number range: 0–999999
- Digits: 1–6
- Tickets per page: 1–20
- Paper sizes: A4 / Letter
- Desktop browser printing is the primary target
- Printed dimensions can vary slightly with browser / OS / printer settings

Ticket creation is independent of the active Session, so it can be used before, during, or after reception.

## Other features

### History / CSV

Filter Session History by five states and export it as UTF-8 BOM CSV.

### Session Summary

Ending reception shows issued, completed, absent, waiting, start/end time, and average wait.

### Persistence

The active Session uses IndexedDB as the primary local store with localStorage fallback.

## Privacy

Tickets, Session History, printable number tickets, settings, and Display state are processed in the browser. Printing does not send ticket data to an external service.

The waiting-room Display is another window of the same app. Queue state is synchronized with same-browser messaging (`postMessage` / `BroadcastChannel`), not a server or another device. When the hosted app opens that window, the browser may request the same HTML document again, but the Session state is not included in that request; the `#display=...` fragment stays in the browser.

The app uses no external API, analytics, telemetry, or runtime package dependency, and its Content Security Policy uses `connect-src 'none'`.

## Single HTML

The build produces:

- `dist/index.html`
- `dist/index.self-extract.html`
- `queue-board.html`

Number-ticket creation and printing are included in the same standalone HTML.

## Development

```powershell
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-powershell-syntax.ps1
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-repository.ps1
```

See `APP_SPEC.md` for the formal specification and v0.1.0–v1.0.0 roadmap.

## License

MIT License
