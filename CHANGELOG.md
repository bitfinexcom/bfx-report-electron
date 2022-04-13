# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.7.0] - 2021-04-12

### Added

- Added Portuguese language and translations. PRs: [bfx-report-ui#489](https://github.com/bitfinexcom/bfx-report-ui/pull/489), [bfx-report-ui#491](https://github.com/bitfinexcom/bfx-report-ui/pull/491)

### Changed

- Improved using and creating sub-accounts in the UI. PRs: [bfx-report-ui#483](https://github.com/bitfinexcom/bfx-report-ui/pull/483), [bfx-report-ui#484](https://github.com/bitfinexcom/bfx-report-ui/pull/484)

### Fixed

- Fixed the fees of the sub-accounts for the account summary section. Fees should not be added up, should pick the lower of the accounts for each section. PR: [bfx-reports-framework#210](https://github.com/bitfinexcom/bfx-reports-framework/pull/210)
- Fixed double response by WS when sing-in. PRs: [bfx-report-express#25](https://github.com/bitfinexcom/bfx-report-express/pull/25), [bfx-reports-framework#209](https://github.com/bitfinexcom/bfx-reports-framework/pull/209)
- Handle the common network disconnection errors to be able to continue the sync process if the internet connection is failed and then restored for not more than 10 min (will try to get data again at intervals of 10 sec).
  - Related to issues: [#131](https://github.com/bitfinexcom/bfx-report-electron/issues/131), [#135](https://github.com/bitfinexcom/bfx-report-electron/issues/135), [#138](https://github.com/bitfinexcom/bfx-report-electron/issues/138), [#139](https://github.com/bitfinexcom/bfx-report-electron/issues/139).
  - PRs: [bfx-report#257](https://github.com/bitfinexcom/bfx-report/pull/257), [bfx-reports-framework#208](https://github.com/bitfinexcom/bfx-reports-framework/pull/208), [bfx-api-node-rest#95](https://github.com/bitfinexcom/bfx-api-node-rest/pull/95)
- Fixed copy-paste table data issue in the UI. PR: [bfx-report-ui#486](https://github.com/bitfinexcom/bfx-report-ui/pull/486)
- Removed redundant translations request. PR: [bfx-report-ui#488](https://github.com/bitfinexcom/bfx-report-ui/pull/488)
- Fixed copy metadata in the UI. PR: [bfx-report-ui#490](https://github.com/bitfinexcom/bfx-report-ui/pull/490)
- Fixed invoices table values copy in the UI. PR: [bfx-report-ui#492](https://github.com/bitfinexcom/bfx-report-ui/pull/492)
- Fixed account summary fees tables titles in the UI. PR: [bfx-report-ui#493](https://github.com/bitfinexcom/bfx-report-ui/pull/493)
- Fixed merchant payment data copy in the UI. PR: [https://github.com/bitfinexcom/bfx-report-ui#496](https://github.com/bitfinexcom/bfx-report-ui/pull/496)

### Security

- Updated/Hardcoded dependencies versions

## [3.6.3] - 2021-01-12

### Added

- Added usd equivalents columns to ledgers csv export. This request was got from issue: [#114](https://github.com/bitfinexcom/bfx-report-electron/issues/114)

### Fixed

- Fixed data consistency error message, while DB is being synced, we should display the message that: `This particular endpoints are not available for the selected time frame while DB is being synced`
- Fixed `Logins` metadata duplicated data preview on mobiles

## [3.6.2] - 2021-12-17

### Added

- Added ability to `backup/restore` DB
- Added ability to track server worker errors
- Added `changelog` file and flow to show one in the modal dialog after the app was updated

### Fixed

- Fixed snapshots tickers. The issue is the following: when taking a snapshot of wallets it's not showing the correspondent tickers as to represent crypto in fiat equivalent
- Fixed error manager

### Changed

- Updated electron version up to `13.6.3`

## [3.6.1] - 2021-11-03

### Fixed

- Fixed `account summary` response for sub-account
- Fixed issue with app crashing on `Start Snapshot` and related `React` errors

### Added

- Added `win/loss` vs `account balance` report
- Added `Show Unrealized Profits` selectors to `Average Win/Loss` and `Account Balance` sections
