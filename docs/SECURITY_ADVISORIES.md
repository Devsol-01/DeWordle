# SECURITY ADVISORIES

This file tracks active security advisories in the `backend` dependency tree that cannot currently be automatically or manually remediated due to architectural blockers, major version migration risks, or upstream delays.

## Blocked High Severity Advisories

### 1. `multer` (Multiple DoS Vulnerabilities)
- **Current Version:** `1.0.0` - `2.1.1`
- **Severity:** High
- **Vulnerabilities:**
  - Denial of Service via deeply nested field names (GHSA-72gw-mp4g-v24j)
  - Denial of Service via incomplete cleanup of aborted uploads (GHSA-3p4h-7m6x-2hcm)
  - Denial of Service via unhandled exception from malformed request (GHSA-fjgf-rc76-4x9p)
- **Blocker:** `multer` is a direct dependency of `@nestjs/platform-express`. The current stable version of `@nestjs/platform-express` we are using (`11.0.1`) restricts `multer` to these vulnerable versions. Forcing an update to the secure version of `multer` requires a downgrade or significant architectural breaking change to `@nestjs/testing` and the core `@nestjs` ecosystem. We must wait for the NestJS maintainers to release a patch for `@nestjs/platform-express` that bumps `multer` to a secure version.

## Remediation Steps Completed
- All auto-fixable advisories were resolved via `npm audit fix --workspaces=false`.
- Manually updated the following direct dependencies to their latest secure minor/patch releases:
  - `axios`
  - `typeorm`
  - `nodemailer`
  - `validator`

### 2. `next` & `postcss` (Multiple Critical & High Vulnerabilities)
- **Current Version:** `9.3.4-canary.0` - `16.3.0-canary.5` (Targeting `15.4.4`)
- **Severity:** Critical
- **Vulnerabilities:**
  - Multiple SSRF, XSS, Cache Poisoning, and DoS vulnerabilities in Server Components and Image Optimization.
- **Blocker:** Addressing these vulnerabilities requires forcing an update to `next@15.5.19`. Bumping `next` involves breaking changes to the App Router and Server Components architecture, requiring an extensive codebase migration that is currently out of scope. We must delay this upgrade until a major frontend framework version migration is planned.

## Remediation Steps Completed (Frontend)
- All backwards-compatible, auto-fixable advisories were resolved via `npm audit fix --workspaces=false` (this cleared out vulnerabilities in `fast-xml-parser`, `flatted`, `js-yaml`, `minimatch`, `picomatch`, `tar`, and `tmp`).
- Added type narrowing fixes to TypeScript interfaces affected by strict mode dependency resolution.
