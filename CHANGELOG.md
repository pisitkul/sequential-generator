# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-02-21

### Added

- **Project Rebirth**: Complete restructuring and modernization of the project.
- **New Feature**: `parse(code)` method to decompose generated codes into prefix, date, and sequence.
- **New Feature**: `reset()` method to clear the internal generator state (useful for tests and long-running processes).
- **Dual Package Support**: Added support for both ESM (`import`) and CommonJS (`require`).
- **Use Cases**: Added a detailed "Use Cases" section to README.
- **Support Links**: Added direct links to Day.js and IANA timezone documentation.

### Fixed

- Fixed `@jest/types` module resolution issue in `jest.config.ts`.
- Fixed ESM build issue related to module resolution in `tsconfig.json`.
- Standardized README examples to use `Asia/Bangkok` timezone consistently.
- Corrected sequence padding inconsistencies in documentation.
- Added missing edge-case tests (overflow, empty prefix, etc.).

### Changed

- Cleaned up project root: Consolidated all tests into the `/tests` directory and removed `.spec.ts` files from `src/`.
- Updated `README.md` with clearer configuration examples and standardized sequence padding (`0001`).
- Simplified date format and timezone documentation with external links.

## [1.0.4] - 2024

- Initial versions (Legacy / Broken state)
