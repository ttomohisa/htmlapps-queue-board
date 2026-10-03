# Changelog

All notable changes to Queue Board are documented here.

## [1.0.0] - 2026-10-03

### Release

- First stable Queue Board release.
- Finalized the v0.1.0–v0.9.0 queue, Display, sound, persistence, History/CSV, ticket-printing, mobile, and accessibility work as the v1.0.0 feature set.
- Rewrote the Japanese and English READMEs for end users, following the finished-app structure used by Browser Kitty tools.
- Added release screenshots captured from the actual rendered application.
- Rechecked the standalone build, local-processing boundary, CSP, favicon source, and release documentation.

### Privacy

- Queue / Session data remains local to the browser.
- Display synchronization remains same-browser only via `postMessage` / `BroadcastChannel`.
- Runtime outbound connections remain blocked by `connect-src 'none'`; no runtime package dependency, analytics, telemetry, or external API is used.

## [0.9.0] - 2026-10-03

### Added

- Smartphone bottom navigation with Operate / Queue / History views during an active Session.
- Safe-area-aware fixed mobile navigation with 54px-class touch targets.
- Mobile navigation state synchronized with the existing History view.
- Explicit Help notes for browser support, local-storage recovery risks, and smartphone navigation.
- Repository checks that reject outbound runtime network APIs for Queue Board source.

### Changed

- Smartphone Operator view now separates primary operation from waiting / absent queues instead of stacking the full desktop workflow.
- Session actions use a compact two-column mobile grid.
- Toast placement moves above the fixed bottom navigation.
- Help and README clarify that Display synchronization uses same-browser messaging and does not send Session state to a server or another device.
- Long headings and labels wrap more safely.
- Ticket and History rows use rendering containment where supported to reduce large-list rendering cost.
- History cards receive consistent internal spacing.
- Focus-visible coverage now includes selects and links.

## [0.8.0] - 2026-10-02

### Added

- Standalone number-ticket creation independent of the active Session.
- Starting / ending number settings.
- 1–6 digit number formatting.
- Custom ticket title.
- A4 and Letter paper sizes, with A4 as the default.
- Configurable 1–20 tickets per page.
- Page-by-page print preview.
- Dashed cutting guides.
- Dynamic print grid sizing.
- Browser print flow using `window.print()`.
- Print-specific `@media print` and dynamic `@page` size.
- Print output that excludes application controls.
- Safety limit of 1000 generated tickets per print job.

### Changed

- Header now includes a printer action available independently of Session state.
- Help and README now document ticket printing and print constraints.
- Increased spacing in the recovery card, number-ticket editor, and Session Summary actions so controls have more breathing room and wrap cleanly.
- Replaced the canonical app icon / favicon with the provided Queue Board artwork.

## [0.7.0] - 2026-10-02

### Added

- Dedicated History view for the current or just-ended Session.
- Status filters for all / waiting / called / completed / absent.
- Ticket timeline with issued, called, absent, and completed timestamps.
- callCount and last-Counter display in History.
- `absentAt` and `lastCounterId` Ticket history fields.
- UTF-8 BOM CSV export with the required seven columns.
- Session Summary with issued, completed, absent, waiting, start/end time, and average wait.
- Average-wait calculation from `createdAt → calledAt`.
- Confirmed Session-ending flow.
- Local archive of ended Sessions.
- Reload restoration of the latest ended Session Summary.
- Start-new-reception flow that preserves the archived previous Session.

### Changed

- Ending reception now saves history before clearing the active Session.
- Active Session persistence and history finalization share serialized local-storage operations.
- README and Help now describe History, CSV, Session Summary, and Session-ending behavior.

## [0.6.0] - 2026-10-02

### Added

- Automatic persistence for the active Session.
- IndexedDB as the primary Session store with localStorage fallback.
- Startup detection of an in-progress saved Session.
- Recovery screen with Resume reception and confirmed Start new actions.
- Local persistence for setup preferences.
- Saving / Saved / Save failed status in the Operator UI.
- Visible error messaging when Session or settings storage fails.
- Background-page save attempt for active Sessions.
- Serialized persistence operations to prevent delayed writes from recreating a reset Session.

### Changed

- Session reset preserves the previous setup preferences.
- Startup waits for local recovery detection before exposing the setup screen.
- Help and README now describe local persistence and recovery behavior.

## [0.5.0] - 2026-10-02

### Added

- Built-in chime generated with the Web Audio API; no runtime audio download.
- Call-sound ON/OFF setting, enabled by default.
- Pre-session chime preview.
- Distinct chime pattern for recalls.
- Operator sound toggle during an active Session.
- Display Fullscreen control with feature detection.
- Display Screen Wake Lock control with feature detection.
- Wake Lock reacquisition after visibility changes when the user requested it.
- Clear fallback messaging when Web Audio, Fullscreen, or Wake Lock is unsupported or fails.

### Changed

- Display top controls now keep optional venue features compact and separate from queue information.
- Help and README now describe the v0.5.0 venue-display workflow.

## [0.4.0] - 2026-10-02

### Added

- Dedicated waiting-room Display mode opened with `window.open`.
- Real-time Operator → Display synchronization for active numbers, Counter names, recent calls, waiting count, and Display title.
- Display settings for title, waiting-count visibility, and recent-call count.
- Large active-number cards for one to four simultaneous Counters.
- Recent-call list with configured item count.
- Number-change animation with reduced-motion support.
- Display connection state in the Operator UI.
- Reopen / reconnect behavior after the Display window is closed.
- Display-ended state when the Operator resets or leaves the active Session.
- Portrait and landscape responsive Display layouts.
- `postMessage` synchronization with optional `BroadcastChannel` supplementation and `file://` handling.

### Changed

- Operator Session controls now include a Display connection indicator and Open display action.
- Help and README now describe the v0.4.0 Display workflow and same-browser synchronization model.

## [0.3.0] - 2026-10-02

### Added

- One-to-four Counter configuration before starting a Session.
- Custom Counter names.
- Independent current Ticket state for every Counter.
- Per-Counter call next, recall, complete, absent, and active-Ticket deletion actions.
- Shared-queue allocation guard so the same waiting Ticket cannot be acquired by multiple Counters.
- Multi-Counter status cards and active-Counter metric.
- Desktop Operator layout optimized for multiple Counter cards, with stacked mobile behavior.

### Changed

- The former single Counter controls are now generated from the Session Counter configuration.
- Operator Session metadata shows the configured Counter count.
- Help and README now describe the v0.3.0 Multi Counter workflow.

## [0.2.0] - 2026-10-02

### Added

- Manual Ticket number entry.
- Duplicate-number validation across the current Session.
- Absent state and a separate absent list.
- Return-to-queue behavior that moves absent Tickets to the end of the waiting queue.
- Recall action with call-count tracking.
- Waiting / absent Ticket deletion with Undo.
- Confirmed deletion for the active called Ticket.
- Clear empty states and field-local validation errors.
- Template-style “Fully local processing” / “完全ローカル処理” badge.

### Changed

- Automatic sequential issuance skips numbers already reserved through manual entry.
- Queue rows now expose task-specific actions with SVG icons.
- Help and README now describe the v0.2.0 flow.

## [0.1.0] - 2026-10-02

### Added

- Initial Queue Board implementation based on the current htmlapps-template.
- Bilingual Japanese / English UI.
- Session start with configurable starting number.
- Sequential Ticket issuance and waiting queue.
- One-counter call-next flow.
- Completion flow for the active Ticket.
- Waiting, issued, completed, and current-number status.
- Confirmed Session reset.
- Browser Kitty brand color `#16624F`.
- Queue Board favicon / app icon.
- Standalone build configuration with runtime network blocking.

### Not included yet

- Manual Ticket entry, absent handling, recall, and Ticket deletion.
- Multiple counters.
- Display window, sound, fullscreen, and Wake Lock.
- Persistence and Session recovery.
- History, CSV export, Session Summary, and ticket printing.
