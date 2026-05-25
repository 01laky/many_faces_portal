# Changelog

All notable changes to **`many_faces_portal`** are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) — **version headings only, no dates**. SemVer: [`VERSION`](./VERSION).

### Release index

| Version       | Theme                                      |
| ------------- | ------------------------------------------ |
| [0.9.0](#090) | PSH1 security hardening                    |
| [0.8.0](#080) | VideoLounge, i18n, preloader, AI switch    |
| [0.7.0](#070) | Moderation helpers, localization bootstrap |
| [0.6.0](#060) | Content approval, colocation               |
| [0.5.0](#050) | ACL, remember-me, modular routes           |
| [0.4.0](#040) | Albums, blog, reels, chat, wall            |
| [0.3.0](#030) | Social features and grid list              |
| [0.2.0](#020) | Husky, face routing, Cypress E2E           |
| [0.1.0](#010) | React SPA foundation                       |

## [Unreleased]

### Added

### Changed

### Fixed

---

## [0.9.0]

### Added

- Portal security hardening v1 (PSH1) regression tests.

### Fixed

- DOMPurify dev deps; profile grid and blog detail types; preloader layout.

## [0.8.0]

### Added

- Video lounge lobby and live UI; profile detail grid; de/fr/it languages.
- Global AI switch; global preloader and brand font; gradient animation preference.

### Changed

- Same-origin API on nginx dev proxy; Phase A DRY pass.

## [0.7.0]

### Added

- SHV2 PI-8 plain-text preview for pending blogs; localization bootstrap retry shell.
- Messenger moderation helpers; paginated list envelope parsing.

### Fixed

- Register password min 12; JWT exp-at-current-second; face home path after login.

## [0.6.0]

### Added

- Content approval UI; my submissions; backend localization fetch; two-step registration.

### Changed

- Component folder colocation convention.

## [0.5.0]

### Added

- Face-scoped grid data; remember-me login; ACL capabilities client; modular routes.

### Fixed

- Story grid layout; API and hub URLs prefixed with face segment.

## [0.4.0]

### Added

- Albums, blog WYSIWYG, reels, face profiles, stories, chat rooms, face wall page.

## [0.3.0]

### Added

- Friend requests, messenger, notifications, users list, face role slide-out.

## [0.2.0]

### Added

- Husky/commitlint; face path routing in API client; Cypress E2E tests.

## [0.1.0]

### Added

- React/TypeScript SPA with OAuth2 and Docker dev scripts.

[Unreleased]: https://github.com/01laky/many_faces_portal/compare/v0.9.0...HEAD
[0.9.0]: https://github.com/01laky/many_faces_portal/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/01laky/many_faces_portal/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/01laky/many_faces_portal/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/01laky/many_faces_portal/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/01laky/many_faces_portal/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/01laky/many_faces_portal/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/01laky/many_faces_portal/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/01laky/many_faces_portal/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/01laky/many_faces_portal/releases/tag/v0.1.0
