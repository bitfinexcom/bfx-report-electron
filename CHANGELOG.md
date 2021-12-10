# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Added ability to `backup/restore` DB
- Added ability to track server worker errors
- Added `changelog` file and flow to show one in the modal dialog after the app was updated

### Fixed

- Fixed snapshots tickers. The issue is the following: when taking a snapshot of wallets it's not showing the correspondent tickers as to represent crypto in fiat equivalent
- Fixed error manager

### Changed

- Updated electron version up to `13.6.1`

## [3.6.1] - 2021-11-03

### Fixed

- Fixed `account summary` response for sub-account
- Fixed issue with app crashing on `Start Snapshot` and related `React` errors

### Added

- Added `win/loss` vs `account balance` report
- Added `Show Unrealized Profits` selectors to `Average Win/Loss` and `Account Balance` sections
