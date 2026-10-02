# Changelog

All notable changes to Queue Board are documented here.

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
