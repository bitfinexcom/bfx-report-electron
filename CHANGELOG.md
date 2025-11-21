# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [4.39.0] - 2025-11-19

### Added

- Added `summary statistics` info into `getSummaryByAsset` endpoint. PR: [bfx-reports-framework#485](https://github.com/bitfinexcom/bfx-reports-framework/pull/485)
- Added ability to send event to UI to refresh menu states and rerender to be able to show/hide/enable/disable the menu items dynamically, eg menu items like changelog or update. PR: [bfx-report-electron#565](https://github.com/bitfinexcom/bfx-report-electron/pull/565)
- Provided `DEB` installable package for `Linux` for better UX giving more native behavior. PR: [bfx-report-electron#564](https://github.com/bitfinexcom/bfx-report-electron/pull/564)
- Implemented the `Statistics` section for the app `Summary` page and predefined `unrealized` profits accounting (should always be included) for the summary by assets and statistics calculations. PR: [bfx-report-ui#977](https://github.com/bitfinexcom/bfx-report-ui/pull/977)

### Changed

- Updated `better-sqlite3` version up to `12.4.1` to have the last binary prebuild and be able to launch the driver under `electron` `v38`. PR: [bfx-facs-db-better-sqlite#13](https://github.com/bitfinexcom/bfx-facs-db-better-sqlite/pull/13)
- Reduced WS connection frequency to avoid overloading the backend, added a small `300ms` delay to help balance the amount of reconnection instead of the forward recursion. PR: [bfx-report-ui#983](https://github.com/bitfinexcom/bfx-report-ui/pull/983)
- Separated DB files for the `prod` and `staging` to prevent mixing data when testing. In general the issue is in the candles table. It's a public endpoint, and we don't associate it with a specific user id. And it means we can sync staging candles and mix them up with prod candles. As a good solution would be better to separate DB files for prod and staging. PRs: [bfx-reports-framework#488](https://github.com/bitfinexcom/bfx-reports-framework/pull/488), [bfx-report-electron#562](https://github.com/bitfinexcom/bfx-report-electron/pull/562)
- Moved `auto-update` toast UI under main UI control instead of creating new windows using `electron-alert` lib. PR: [bfx-report-electron#566](https://github.com/bitfinexcom/bfx-report-electron/pull/566)
- Enabled login via `__bfx_token` possibility for all environments and adjusted login type priority. PR: [bfx-report-ui#974](https://github.com/bitfinexcom/bfx-report-ui/pull/974)
- Predefined the timeframe as a `day` and included `unrealized` profits as a default for the `Account Balance` section, like we already had for other sections, for represented data consistency. Removed the unused selectors and the `Filter` button, also implemented an auto-refreshing for all sections on the `Date` range changes for a cleaner UI and intuitive UX. PR: [bfx-report-ui#978](https://github.com/bitfinexcom/bfx-report-ui/pull/978)
- Removed the `Filter` button from the `Account Balance` report and implemented an auto-refreshing on each parameter change for a cleaner UI and intuitive UX. PR: [bfx-report-ui#980](https://github.com/bitfinexcom/bfx-report-ui/pull/980)
- Removed the `Filter` button from the `Analysis & Statistics` sections (Weighted Averages, Traded Volume, Average Win/Loss, Concentration Risk, Loan Report, Fees Report) and implemented an auto-refreshing on each parameter change for a cleaner UI and intuitive UX. PR: [bfx-report-ui#982](https://github.com/bitfinexcom/bfx-report-ui/pull/982)
- Removed the `Generate` button from the `Tax Report` and implemented an auto-refreshing on each parameter change for a cleaner UI and intuitive UX. Prevented changing the params possibility(auto-refresh) during the report generation and initial sync to avoid errors. PR: [bfx-report-ui#984](https://github.com/bitfinexcom/bfx-report-ui/pull/984)
- Removed the `Filter` button from the `Snapshots` sections (Positions, Tickers, Wallets) and implemented an auto-refreshing on each parameter change for a cleaner UI and intuitive UX. Prevented changing the params possibility(auto-refresh) during the report loading and initial sync to avoid errors. PR: [bfx-report-ui#985](https://github.com/bitfinexcom/bfx-report-ui/pull/985)
- Changed the link for the `Bitfinex` logo from https://www.bitfinex.com to https://trading.bitfinex.com/t. PR: [bfx-report-ui#986](https://github.com/bitfinexcom/bfx-report-ui/pull/986)
- Removed the `Filter` button from the `My History` reports(Ledgers, Movements, Balances, Earnings sections, Trades sections, Orders, Positions sections, Funding sections) and implemented an auto-refreshing on each parameter change for a cleaner UI and intuitive UX. PR: [bfx-report-ui#987](https://github.com/bitfinexcom/bfx-report-ui/pull/987)
- Removed the `Filter` button from the Public Trades, Public Funding, Spot, Derivatives, Login History, Change Logs reports and implemented an auto-refreshing on each parameter change. PR: [bfx-report-ui#988](https://github.com/bitfinexcom/bfx-report-ui/pull/988)

### Fixed

- Fixed `winston` write stream issue in hot reload dev mode. PRs: [bfx-report-express#54](https://github.com/bitfinexcom/bfx-report-express/pull/54), [bfx-report#453](https://github.com/bitfinexcom/bfx-report/pull/453)
- Fixed `database is locked` issue after DB driver update for the `updateSubAccount` endpoint. PR: [bfx-reports-framework#489](https://github.com/bitfinexcom/bfx-reports-framework/pull/489)
- Fixed `symbol` params mapping for the test pairs (should be `tTESTBTC:TESTUSD` instead of `tBTC:TESTUSD` etc.) that cause errors. PR: [bfx-report-ui#973](https://github.com/bitfinexcom/bfx-report-ui/pull/973)

### Security

- Migrated `electron-updater` from `v5` to `v6`. This is necessary to add `DEB` release as a new version of lib supports it (it adds the installable experience for Linux users and fixes the missing app icon), and also fixed the high-severity [vulnerability](https://github.com/advisories/GHSA-9jxc-qjr9-vjxq) of the electron app

## [4.38.0] - 2025-10-08

### Added

- Added `Summary Statistics` info into the `getSummaryByAsset` endpoint. PR: [bfx-reports-framework#485](https://github.com/bitfinexcom/bfx-reports-framework/pull/485)
- Implemented the possibility to login via `__bfx_token` cookie from the main platform for the `Reports` web in production. PR: [bfx-report-ui#968](https://github.com/bitfinexcom/bfx-report-ui/pull/968)
- Implemented auto-refreshing possibility for the currently opened report after the regular/scheduled synchronization for represented data actualization. PR: [bfx-report-ui#969](https://github.com/bitfinexcom/bfx-report-ui/pull/969)

### Changed

- Disabled `Account Balance` refresh button during initial synchronization to prevent report generation errors possibility. PR: [bfx-report-ui#967](https://github.com/bitfinexcom/bfx-report-ui/pull/967)
- Removed ivoices-related logic due to the removal of the `payInvoiceList` endpoint from the BFX API. PR: [bfx-report-ui#970](https://github.com/bitfinexcom/bfx-report-ui/pull/970)

## [4.37.0] - 2025-09-24

### Added

- Implemented `USDT0ARB`, `USDT0INK` and `USDT0OPX` support in the symbols filters. PR: [bfx-report-ui#958](https://github.com/bitfinexcom/bfx-report-ui/pull/958)
- Added network to `Tether` ccy for movement export similar to the UI representation. Added a similar approach as on the UI side. PR: [bfx-report#446](https://github.com/bitfinexcom/bfx-report/pull/446)
- Showed `mtsStarted` instead of `mtsUpdated` timestamp in the `Date` column of the `Movements` report. PR: [bfx-report-ui#960](https://github.com/bitfinexcom/bfx-report-ui/pull/960)
- Added `created` and `updated` timestamp for movements export. PR: [bfx-report#448](https://github.com/bitfinexcom/bfx-report/pull/448)

### Changed

- Reworked and optimized `WalletSelector` in a more performant way. PR: [bfx-report-ui#955](https://github.com/bitfinexcom/bfx-report-ui/pull/955)
- Reworked `SectionSwitch` in a more performant way and reduced redundant code. PR: [bfx-report-ui#956](https://github.com/bitfinexcom/bfx-report-ui/pull/956)
- Removed the filter normalizer to speed up requests, as it is not being used. PRs: [bfx-report#445](https://github.com/bitfinexcom/bfx-report/pull/445), [bfx-reports-framework#473](https://github.com/bitfinexcom/bfx-reports-framework/pull/473)

### Fixed

- Hid the `Invoices` report due to unannounced removal of the `payInvoiceList` endpoint from the `BFX API`. PR: [bfx-report-ui#961](https://github.com/bitfinexcom/bfx-report-ui/pull/961)
- Removed `payInvoiceList` endpoint support due to unannounced removal from the `BFX API`. PRs: [bfx-report#449](https://github.com/bitfinexcom/bfx-report/pull/449), [bfx-reports-framework#479](https://github.com/bitfinexcom/bfx-reports-framework/pull/479)

### Security

- Showed npm lib scripts output to the foreground due to security reasons, disabled npm lib scripts where it's possible. PRs: [bfx-report-express#51](https://github.com/bitfinexcom/bfx-report-express/pull/51), [bfx-report-ui#959](https://github.com/bitfinexcom/bfx-report-ui/pull/959), [bfx-report-electron#551](https://github.com/bitfinexcom/bfx-report-electron/pull/551), [bfx-report#447](https://github.com/bitfinexcom/bfx-report/pull/447), [bfx-reports-framework#478](https://github.com/bitfinexcom/bfx-reports-framework/pull/478)

## [4.36.4] - 2025-08-27

### Changed

- Reworked `filter` query param validation schemas. PR: [bfx-report#441](https://github.com/bitfinexcom/bfx-report/pull/441)
  - Brings the JSON schemas of query params to common consistent form for easier support
  - Disables the ability to pass undeclared params to improve understanding of what is being passed and increase the security and durability of the system
  - Splits the schemas into separate files for better readability
  - Uses JSON schema compilation on the initialization stage before validation (when module loading) to increase performance
  - Makes corresponding minor changes
- Brought adjustments due to reworking `filter` query param schemas of bfx-report. PR: [bfx-reports-framework#470](https://github.com/bitfinexcom/bfx-reports-framework/pull/470)
- Reworked query param validation schemas for the report framework. PR: [bfx-reports-framework#471](https://github.com/bitfinexcom/bfx-reports-framework/pull/471)
  - Brings the JSON schemas of query params to common consistent form for easier support
  - Disables the ability to pass undeclared params to improve understanding of what is being passed and increase the security and durability of the system
  - Splits the schemas into separate files for better readability
  - Uses JSON schema compilation on the initialization stage before validation (when module loading) to increase performance
  - Makes corresponding minor changes due to adding the restriction of passing undeclared params
  - Removes the old validation module and JSON schemas
- Brought adjustments due to reworking query param schemas of bfx-reports-framework. PR: [bfx-report#442](https://github.com/bitfinexcom/bfx-report/pull/442)
- Reworked `ColumnsFilterDialog` in a more performant way and improved props linting. PR: [bfx-report-ui#948](https://github.com/bitfinexcom/bfx-report-ui/pull/948)
- Reworked and optimized `SideSelector` in a more performant way. PR: [bfx-report-ui#950](https://github.com/bitfinexcom/bfx-report-ui/pull/950)
- Reworked `NoData` section in a more performant way, actualized prop-types and improved props linting. PR: [bfx-report-ui#951](https://github.com/bitfinexcom/bfx-report-ui/pull/951)

### Fixed

- Removed redundant `limit` param for the `getTransactionTaxReportFile` request according to the latest backend validation changes. PR: [bfx-report-ui#952](https://github.com/bitfinexcom/bfx-report-ui/pull/952)

### Security

- Updated UI dependencies to fix a critical vulnerability. PR: [bfx-report-ui#949](https://github.com/bitfinexcom/bfx-report-ui/pull/949)

## [4.36.3] - 2025-07-30

### Changed

- Reworked query param validation schemas. PR: [bfx-report#438](https://github.com/bitfinexcom/bfx-report/pull/438)
  - Brings the JSON schemas of query params to common consistent form for easier support
  - Disables the ability to pass undeclared params to improve understanding of what is being passed and increase the security and durability of the system
  - Splits the schemas into separate files for better readability
  - Uses JSON schema compilation on the initialization stage before validation (when module loading) to increase performance
  - Adds official ajv-formats lib to have extra formats of validation like email
  - Makes corresponding minor changes due to adding the restriction of passing undeclared params
- Brought adjustments due to reworking query param schemas of bfx-report. PR: [bfx-reports-framework#466](https://github.com/bitfinexcom/bfx-reports-framework/pull/466)
- Disabled wallets `Balances` refresh button during initial synchronization to prevent report generation errors. Added a corresponding notice to communicate this to the user. PR: [bfx-report-ui#944](https://github.com/bitfinexcom/bfx-report-ui/pull/944)

### Fixed

- Removed redundant (start, end, limit) params for the `getActivePositionsFile` request. PR: [bfx-report-ui#943](https://github.com/bitfinexcom/bfx-report-ui/pull/943)
- Fixed `id` param type (should be an array of numbers) for the `getPositionsAuditFile` request. PR: [bfx-report-ui#945](https://github.com/bitfinexcom/bfx-report-ui/pull/945)

## [4.36.2] - 2025-07-16

### Added

- Implemented a class for the sync schema models to typify and unify model objects. PR: [bfx-reports-framework#459](https://github.com/bitfinexcom/bfx-reports-framework/pull/459)

### Changed

- Reworked sync schema model usage to use the new model interface implemented in the previous PR #459. It speeded up the work by avoiding the usage of `cloneDeep` fn based on `JSON.parse(JSON.stringify(obj))` for the models. PR: [bfx-reports-framework#461](https://github.com/bitfinexcom/bfx-reports-framework/pull/461)
- Improved the `isUserMerchant` checking flow and hides the `Merchant History` section(Invoices) for non-merchant users. Removed the outdated `NonMerchant` screen and related unused handlers. PR: [bfx-report-ui#936](https://github.com/bitfinexcom/bfx-report-ui/pull/936)
- Disabled `Snapshots` refresh button during initial synchronization to prevent report generation errors. Added a corresponding notice to communicate this to the user. PR: [bfx-report-ui#937](https://github.com/bitfinexcom/bfx-report-ui/pull/937)
- Improved currency and fees formatting in the `Movements` details modal. PR: [bfx-report-ui#939](https://github.com/bitfinexcom/bfx-report-ui/pull/939)

### Fixed

- Fixed symbols/pairs duplication. When sync data is moved from the temp tables to the main ones it's needed to remove previous data for the updatable collections such as symbols, etc to prevent deleted currencies from getting stuck. PR: [bfx-reports-framework#463](https://github.com/bitfinexcom/bfx-reports-framework/pull/463)
- Prevented duplication possibility for selectors items noted in some cases.PR: [bfx-report-ui#940](https://github.com/bitfinexcom/bfx-report-ui/pull/940)
- Hidden the `Export` from the header and account menu for the `Summary` as we currently don't support exporting for this page. PR: [bfx-report-ui#941](https://github.com/bitfinexcom/bfx-report-ui/pull/941)

### Security

- Updated `Grenache` dependencies due to the last Grenache updates, removed unsupported `request` lib, fixed high severity vulnerabilities by `npm audit`. PRs: [bfx-report-express#49](https://github.com/bitfinexcom/bfx-report-express/pull/49), [bfx-report#435](https://github.com/bitfinexcom/bfx-report/pull/435), [bfx-reports-framework#462](https://github.com/bitfinexcom/bfx-reports-framework/pull/462), [bfx-report-electron#541](https://github.com/bitfinexcom/bfx-report-electron/pull/541)

## [4.36.1] - 2025-05-28

### Added

- Added `isUserMerchant` flag into user info model. PR: [bfx-api-node-models#89](https://github.com/bitfinexcom/bfx-api-node-models/pull/89)
- Added `isUserMerchant` flag into the response of `verifyUser` endpoint. PR: [bfx-report#432](https://github.com/bitfinexcom/bfx-report/pull/432)
- Added `isUserMerchant` flag into the response of the `signUp` and `signIn` endpoints for the UI to remove `Merchant` nav item for non merchant users. PR: [bfx-reports-framework#457](https://github.com/bitfinexcom/bfx-reports-framework/pull/457)

### Changed

- Implemented redirection to the main platform login page (only for web production) on logout or in cases where there is no auth available. PR: [bfx-report-ui#932](https://github.com/bitfinexcom/bfx-report-ui/pull/932)
- Improved currency formatting in the `Trading fees charged in the last 30 days` section. PR: [bfx-report-ui#931](https://github.com/bitfinexcom/bfx-report-ui/pull/931)
- Disabled `Fees Report` refresh button during initial synchronization to prevent report generation errors. Added a corresponding notice to communicate this to the user. PR: [bfx-report-ui#933](https://github.com/bitfinexcom/bfx-report-ui/pull/933)

## [4.36.0] - 2025-05-14

### Added

- Added `package-lock` file, bumped dev dependencies and bumped up `NODEJS` to `v20` for the `GH Actions`. PR: [bfx-facs-db-better-sqlite#12](https://github.com/bitfinexcom/bfx-facs-db-better-sqlite/pull/12)
- Implemented user notifications about inaccurate `Tax Report` calculations due to `delisted` tokens. PR: [bfx-report-ui#926](https://github.com/bitfinexcom/bfx-report-ui/pull/926)
- Implemented the possibility to `Deduct Fees` in the `Tax Report`. PR: [bfx-report-ui#928](https://github.com/bitfinexcom/bfx-report-ui/pull/928)

### Changed

- Made two loading windows for a startup without a parent window independently and for common purposes as a modal window with a parent window to prevent the main window interaction when showing the loading window for some sensitive cases such as import/export DB. PR: [bfx-report-electron#535](https://github.com/bitfinexcom/bfx-report-electron/pull/535)
- Disabled `Loan Report` refresh button during initial synchronization to prevent report generation errors. Added a corresponding notice to communicate this to the user. PR: [bfx-report-ui#927](https://github.com/bitfinexcom/bfx-report-ui/pull/927)

### Fixed

- Fixed the sync requested by the user via the UI button in case the sync was added by the scheduler and the app was closed before completing earlier. PR: [bfx-reports-framework#454](https://github.com/bitfinexcom/bfx-reports-framework/pull/454)

## [4.35.0] - 2025-04-23

### Added

- Added warning message styles for PDF reports. PR: [bfx-report#429](https://github.com/bitfinexcom/bfx-report/pull/429)
- Added ability to continue the `Tax Report` generation without `delisted` currencies. PR: [bfx-reports-framework#449](https://github.com/bitfinexcom/bfx-reports-framework/pull/449)
- Added ability to deduct trading fees in the `Tax Report`. Added a flag `shouldFeesBeDeducted` to use that via a checkbox in the UI. PR: [bfx-reports-framework#450](https://github.com/bitfinexcom/bfx-reports-framework/pull/450)
- Added native behavior to minimize and close the loading window. The main reason is to provide the ability to `minimize` and then `restore` the loading window on all OSs as each OS has a specific behavior. Also added a close button to be able to interrupt the app startup. PR: [bfx-report-electron#530](https://github.com/bitfinexcom/bfx-report-electron/pull/530)
- Implemented `Credit Line` wallet representation in the `Balances` section. Added `Credit Line` wallet support in the columns filters. PR: [bfx-report-ui#920](https://github.com/bitfinexcom/bfx-report-ui/pull/920)
- Implemented UI theme selection binding with Electron wrapper. The main idea is to have synchronized theme in UI and Electron-specific menus, modals, etc. PR: [bfx-report-ui#921](https://github.com/bitfinexcom/bfx-report-ui/pull/921)

### Changed

- Actualized the `Tax Report` data handling. PR: [bfx-report-ui#922](https://github.com/bitfinexcom/bfx-report-ui/pull/922)
- Disabled `Concentration Risk` refresh button during initial synchronization to prevent report generation errors. Added a corresponding notice to communicate this to the user. PR: [bfx-report-ui#923](https://github.com/bitfinexcom/bfx-report-ui/pull/923)

## [4.34.1] - 2025-04-09

### Added

- Added ability to avoid queuing sync by scheduler if sync is already in progress to prevent redundant sync in case a user has lots of data and sync takes time until the run of the scheduler. PR: [bfx-reports-framework#446](https://github.com/bitfinexcom/bfx-reports-framework/pull/446)
- Added `Margin trading` and `Derivative` support to the `Tax Report` sources. PR: [bfx-report-ui#909](https://github.com/bitfinexcom/bfx-report-ui/pull/909)

### Changed

- Changed the order of getting the price of the pub trades moving from the end to the start by timestamps to overcome some rare cases. Related to this issue: [bfx-report-electron#493](https://github.com/bitfinexcom/bfx-report-electron/issues/493). PR: [bfx-reports-framework#445](https://github.com/bitfinexcom/bfx-reports-framework/pull/445)
- Disabled `Average Win/Loss` refresh button during initial synchronization to prevent report generation errors. Added a corresponding notice to communicate this to the user. PR: [bfx-report-ui#916](https://github.com/bitfinexcom/bfx-report-ui/pull/916)
- Improved derivative currencies formatting (like `ETHF0` -> `ETH (deriv)` etc.) for a more consistent looking and representation. PR: [bfx-report-ui#910](https://github.com/bitfinexcom/bfx-report-ui/pull/910)
- Improved sync info popup proportions for a better look after the changing used font family. PR: [bfx-report-ui#901](https://github.com/bitfinexcom/bfx-report-ui/pull/901)
- Disabled `Traded Volume` refresh button during initial synchronization to prevent report generation errors. Added a corresponding notice to communicate this to the user. PR: [bfx-report-ui#906](https://github.com/bitfinexcom/bfx-report-ui/pull/906)

### Fixed

- Fixed `auto-update-toast:width` listener by adding `uid` to define `alert` instance and ajusts toast position and theme colors. Related to this issue: [bfx-report-electron#526](https://github.com/bitfinexcom/bfx-report-electron/issues/526). PR: [bfx-report-electron#527](https://github.com/bitfinexcom/bfx-report-electron/pull/527)
- Fixed query builder for `null` operator for sub-query. PR: [bfx-reports-framework#444](https://github.com/bitfinexcom/bfx-reports-framework/pull/444)
- Prevented `getLastFinishedSyncMts` requests and sync progress checking after the logout to avoid auth errors. PR: [bfx-report-ui#917](https://github.com/bitfinexcom/bfx-report-ui/pull/917)
- Fixed the `Electron` menu functionality to be available before login. PR: [bfx-report-ui#907](https://github.com/bitfinexcom/bfx-report-ui/pull/907)

## [4.34.0] - 2025-03-26

### Added

- Added `light/dark` themes to the electron wrapper and adds ability to couple with the UI. PR: [bfx-report-electron#511](https://github.com/bitfinexcom/bfx-report-electron/pull/511)
- Added the rest of translation files to the electron wrapper. PR: [bfx-report-electron#517](https://github.com/bitfinexcom/bfx-report-electron/pull/517)
- Added ability to display `Login to Reports with token` screen after the logout (like it was before the previous updates) and removed the outdated title from it. Implemented logging out from the main platform on `Reports` logout. PR: [bfx-report-ui#902](https://github.com/bitfinexcom/bfx-report-ui/pull/902)

### Changed

- Increased `WebSockets` ping interval between `HTTP` server and `Grenache` worker for performance due to heavy sync cases. PR: [bfx-report-express#44](https://github.com/bitfinexcom/bfx-report-express/pull/44)
- Removed seeing `changelog` on startup. PR: [bfx-report-electron#514](https://github.com/bitfinexcom/bfx-report-electron/pull/514)
- Increased app initialization timeout to `30min` to be able to execute sqlite `vacuum` command on launch. PR: [bfx-report-electron#516](https://github.com/bitfinexcom/bfx-report-electron/pull/516)

### Fixed

- Fixed local path showing when exporting report files. PR: [bfx-report#422](https://github.com/bitfinexcom/bfx-report/pull/422)
- Made comprehensive sync performance improvement. PR: [bfx-reports-framework#437](https://github.com/bitfinexcom/bfx-reports-framework/pull/437)
- Fixed `WebSocket` reconnection flow for long sync cases to prevent losing sync finishing event. PR: [bfx-report-ui#904](https://github.com/bitfinexcom/bfx-report-ui/pull/904)
- Fixed incorrect symbols processing during redirection from `Orders` to `Order Trades` section for paper trading pairs and related errors. PR: [bfx-report-ui#905](https://github.com/bitfinexcom/bfx-report-ui/pull/905)
- Fixed the synchronization type checking flow to prevent the possibility of an incorrect state setting in some cases. Allowed fetching of previously synced reports during the auto-sync after the app update. PR: [bfx-report-ui#908](https://github.com/bitfinexcom/bfx-report-ui/pull/908)

### Security

- Updated deps with vulnerabilities and added `package-lock` file due to the last security requirements. PRs: [bfx-report-ui#912](https://github.com/bitfinexcom/bfx-report-ui/pull/912), [bfx-report#424](https://github.com/bitfinexcom/bfx-report/pull/424), [bfx-report#427](https://github.com/bitfinexcom/bfx-report/pull/427), [bfx-reports-framework#439](https://github.com/bitfinexcom/bfx-reports-framework/pull/439), [bfx-reports-framework#441](https://github.com/bitfinexcom/bfx-reports-framework/pull/441), [bfx-report-express#45](https://github.com/bitfinexcom/bfx-report-express/pull/45), [bfx-report-electron#518](https://github.com/bitfinexcom/bfx-report-electron/pull/518), [bfx-report-electron#520](https://github.com/bitfinexcom/bfx-report-electron/pull/520)
- Updated `axios` to `1.8.4` in the UI. PR: [bfx-report-ui#911](https://github.com/bitfinexcom/bfx-report-ui/pull/911)

## [4.33.0] - 2025-02-19

### Added

- Implemented `Electron` app menu bar and corresponding functionality in the UI title instead of the native one. This is very useful as it saves overall space and at the same time constantly displays the menu and does not require the user to press the `Alt` key to display it (as the practice has shown, because of the last one, many inexperienced users do not even know about the existence of menu functions). Available for the `Windows` and `Linux` app users. On the `Mac` we have to hide the menu in the UI and show the native electron menu bar due to some `MacOS` specifics, it's impossible to have proper menu item control from the UI. PR: [bfx-report-ui#898](https://github.com/bitfinexcom/bfx-report-ui/pull/898)
- Added exponential backoff and jitter for bfx-api requests to improve `Rate Limit` bypassing. Here we implemented `Decorrelated Jitter` described in AWS article https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/ And added a small improvement to shift the starting point of jitter for each iteration. In practice, it helps better to move through the `Rate Limit` for the `Sync` and `Tax Report`. PR: [bfx-report#420](https://github.com/bitfinexcom/bfx-report/pull/420)

### Changed

- Changed font family to `Inter` similar to used on the main platform. PR: [bfx-report-ui#896](https://github.com/bitfinexcom/bfx-report-ui/pull/896)
- Reworked and optimized `ThemeSwitcher` component in a more performant way and reduced redundant code. PR: [bfx-report-ui#897](https://github.com/bitfinexcom/bfx-report-ui/pull/897)
- Changed the font family from `Roboto` to `Inter` in the Electron env to prevent throwing error due to the last UI changes (electron layouts use font source from the UI sub-module). PR: [bfx-report-electron#494](https://github.com/bitfinexcom/bfx-report-electron/pull/494)
- Disabled native title menu bar to use UI implementation via Electron renderer IPC bridge. PR: [bfx-report-electron#504](https://github.com/bitfinexcom/bfx-report-electron/pull/504)
- Migrated from `html-pdf` to `puppeteer` for `pdf` creation as the first one repo is not `maintained` anymore. PRs: [bfx-reports-framework#432](https://github.com/bitfinexcom/bfx-reports-framework/pull/432), [bfx-report#419](https://github.com/bitfinexcom/bfx-report/pull/419)

### Fixed

- Fixed setting `IS_AUTO_UPDATE_DISABLED` config flag for the `dev` mode. PR: [bfx-report-electron#484](https://github.com/bitfinexcom/bfx-report-electron/pull/484)
- Fixed the UI setup flow for the `dev` mode. PR: [bfx-report-electron#485](https://github.com/bitfinexcom/bfx-report-electron/pull/485)
- Fixed error metadata processing, related to this test pipeline: https://github.com/bitfinexcom/bfx-report/actions/runs/12114987593/job/33772854879 PR: [bfx-report#418](https://github.com/bitfinexcom/bfx-report/pull/418)

## [4.32.0] - 2025-01-22

### Added

- Added the backend logic to move the electron app menu bar to the UI title instead of the electron one so that we can customize the electron menu, as the native electron menu API doesn't provide that. It allows us to build the menu in the UI in one small line with the main app title and typical window buttons (minimize, maximize, and close in the top corner). This is very useful as it saves overall space and at the same time constantly displays the menu and does not require the user to press the `Alt` key to display it (as practice has shown, because of the last one, many inexperienced users do not even know about the existence of menu functions). PRs: [bfx-report-electron#478](https://github.com/bitfinexcom/bfx-report-electron/pull/478), [bfx-facs-db-better-sqlite#11](https://github.com/bitfinexcom/bfx-facs-db-better-sqlite/pull/11)
- Added a small typical `_` button (in the top right corner) to minimize the loading window. PR: [bfx-report-electron#479](https://github.com/bitfinexcom/bfx-report-electron/pull/479)
- Added the logout flow for web users and prevented the issue when logged-out users are still logged in after the page refreshing. PR: [bfx-report-ui#889](https://github.com/bitfinexcom/bfx-report-ui/pull/889)

### Changed

- Renamed `Filter` button to `Generate` and also disabled it during the initial synchronization to prevent `Tax Report` generation errors. Implemented corresponding notice for the users during the initial sync. PR: [bfx-report-ui#888](https://github.com/bitfinexcom/bfx-report-ui/pull/888)
- Actualized app download link generation flow. PR: [bfx-report-ui#890](https://github.com/bitfinexcom/bfx-report-ui/pull/890)
- Actualized `Reports` translations and extended coverage for newly added elements/features. PR: [bfx-report-ui#891](https://github.com/bitfinexcom/bfx-report-ui/pull/891)
- Improved theme setting flow and fixed issues noted after the latest `Electron` version update. PR: [bfx-report-ui#893](https://github.com/bitfinexcom/bfx-report-ui/pull/893)

### Fixed

- Fixed `isAuthTokenGenerationError` flag processing in query response for the 2FA re-login after token expiration. PR: [bfx-report-ui#892](https://github.com/bitfinexcom/bfx-report-ui/pull/892)

## [4.31.0] - 2024-12-04

### Added

- Added translation support to the `export-db` module. PR: [bfx-report-electron#441](https://github.com/bitfinexcom/bfx-report-electron/pull/441)
- Added translation support to the `import-db` module. PR: [bfx-report-electron#442](https://github.com/bitfinexcom/bfx-report-electron/pull/442)
- Added `progress` perc to the `loading window` for the `export-db` module as it can take significant time for large DB. PR: [bfx-report-electron#445](https://github.com/bitfinexcom/bfx-report-electron/pull/445)
- Added `progress` perc to the `loading window` for the `import-db` module as it can take significant time for large DB. [bfx-report-electron#449](https://github.com/bitfinexcom/bfx-report-electron/pull/449)
- Added translation support to the `remove-db` module. PR: [bfx-report-electron#450](https://github.com/bitfinexcom/bfx-report-electron/pull/450)
- Added translation support to the `manage-worker-messages` module. Add translation support to the `backup-db` and `migration-db` modules. Fixed showing modal dialogs in sequence. PR: [bfx-report-electron#456](https://github.com/bitfinexcom/bfx-report-electron/pull/456)
- Added translation support to the `show-about-modal-dialog` module. PR: [bfx-report-electron#457](https://github.com/bitfinexcom/bfx-report-electron/pull/457)

### Changed

- Optimized electron translation file data structure to prevent some common duplication and redundant nesting for easier support. PR: [bfx-report-electron#468](https://github.com/bitfinexcom/bfx-report-electron/pull/468)
- Reworked and optimized the `TimeRangePreservePref` component in a more performant way and reduced redundant code. PR: [bfx-report-ui#885](https://github.com/bitfinexcom/bfx-report-ui/pull/885)
- Extended data logging by showing public request params to simplify debugging BFX API issues. PR: [bfx-report#414](https://github.com/bitfinexcom/bfx-report/pull/414)
- Removed `language` schema param check and added `en` fallback language to prevent returning the translation key `key.nestedKey.etc` if a value is missing for a certain language and added the ability to try to take one from the default `en` translation file. PR: [bfx-report#415](https://github.com/bitfinexcom/bfx-report/pull/415)

### Fixed

- Fixed docker desktop container user permissions breaks. Fixed `chown`: `changing ownership of 'path-to-file': Operation not permitted` when using it in `dockerfile`. PR: [bfx-report-electron#460](https://github.com/bitfinexcom/bfx-report-electron/pull/460)
- Fixed error metadata processing for logging. PRs: [bfx-report#418](https://github.com/bitfinexcom/bfx-report/pull/418), [bfx-reports-framework#428](https://github.com/bitfinexcom/bfx-reports-framework/pull/428)

## [4.30.0] - 2024-11-13

### Added

- Implemented `Your Assets` section for the web `Account Summary` page. Improved sections titles styling. PR: [bfx-report-ui#880](https://github.com/bitfinexcom/bfx-report-ui/pull/880)
- Implemented `UI` language selection binding with `ElectronJS` wrapper. PR: [bfx-report-ui#882](https://github.com/bitfinexcom/bfx-report-ui/pull/882)
- Extended ElectronJS app wrapper translations. Improved the app-init-error layout. Fixed logs collection for bug report. PR: [bfx-report-electron#422](https://github.com/bitfinexcom/bfx-report-electron/pull/422)
- Added translation support to the `error manager` module. PR: [bfx-report-electron#428](https://github.com/bitfinexcom/bfx-report-electron/pull/428)
- Added translation support to the `native notifications` module. PR: [bfx-report-electron#429](https://github.com/bitfinexcom/bfx-report-electron/pull/429)
- Added translation support to the `auto-updater` module. PRs: [bfx-report-electron#430](https://github.com/bitfinexcom/bfx-report-electron/pull/430), [bfx-report-electron#438](https://github.com/bitfinexcom/bfx-report-electron/pull/438)
- Added translation support to the `restore DB` module. PR: [bfx-report-electron#431](https://github.com/bitfinexcom/bfx-report-electron/pull/431)
- Added translation support to the `show-docs` module, and added the ability to set the `markdown` user manual with different languages into `i18next` (if doc for the corresponding lang does not exist takes `en` by default). PR: [bfx-report-electron#434](https://github.com/bitfinexcom/bfx-report-electron/pull/434)
- Added translation support to the `print-to-pdf` module. PR: [bfx-report-electron#435](https://github.com/bitfinexcom/bfx-report-electron/pull/435)
- Added translation support to the `change-reports-folder` module. PR: [bfx-report-electron#436](https://github.com/bitfinexcom/bfx-report-electron/pull/436)
- Added translation support to the `change-sync-frequency` module. PR: [bfx-report-electron#437](https://github.com/bitfinexcom/bfx-report-electron/pull/437)
- Added translation support to the `enforce-macos-app-location` module. PR: [bfx-report-electron#439](https://github.com/bitfinexcom/bfx-report-electron/pull/439)

### Changed

- Improved the loading window workflow to bring more consistency in the sequence of showing windows. Added ability to send/listen events for the app-init layout via the context bridge between the main and renderer ipc to be secure. Fixed issue with focusing the main window on the launch. PR: [bfx-report-electron#424](https://github.com/bitfinexcom/bfx-report-electron/pull/424)
- Prevented returning the translation key `key.nestedKey.etc` if a value is missing for a certain language and added the ability to try to take one from the default `en` translation file. PR: [bfx-report-electron#426](https://github.com/bitfinexcom/bfx-report-electron/pull/426)
- Reworked `sed` commands to be able to run the build `bash` scripts on both OSs `Ubuntu` and `MacOS` as they have slightly different implementation. PR: [bfx-report-electron#427](https://github.com/bitfinexcom/bfx-report-electron/pull/427)

### Fixed

- Fixed `2FA` login flow to prevent the token request duplication possibility noted in some user scenarios. PR: [bfx-report-ui#881](https://github.com/bitfinexcom/bfx-report-ui/pull/881)
- Fixed issue with `Wine` to build `Windows` release under container. PR: [bfx-report-electron#425](https://github.com/bitfinexcom/bfx-report-electron/pull/425)
- Fixed loading UI fonts to all modal windows. PR: [bfx-report-electron#432](https://github.com/bitfinexcom/bfx-report-electron/pull/432)

### Security

- Bumped `cookie` from `0.6.0` to `0.7.1`, `express` from `4.21.0` to `4.21.1`. PR: [bfx-report-ui#879](https://github.com/bitfinexcom/bfx-report-ui/pull/879)
- Bumped `electron` from `27.3.11` to `27.3.5`. PR: [bfx-report-electron#424](https://github.com/bitfinexcom/bfx-report-electron/pull/424)

## [4.29.0] - 2024-10-16

### Added

- Implemented `Active Positions` section on the app `Summary` page. PR: [bfx-report-ui#873](https://github.com/bitfinexcom/bfx-report-ui/pull/873)
- Added `Active Positions` section to the web `Account Summary` page. PR: [bfx-report-ui#874](https://github.com/bitfinexcom/bfx-report-ui/pull/874)
- Improved `fallback` languages for i18next https://www.i18next.com/principles/fallback. PR: [bfx-report#406](https://github.com/bitfinexcom/bfx-report/pull/406)
- Added translation flow to electronjs wrapper. PR: [bfx-report-electron#412](https://github.com/bitfinexcom/bfx-report-electron/pull/412)

### Changed

- Reworked `ColumnsSelectDialog` in a more performant way and improved props linting. PR: [bfx-report-ui#868](https://github.com/bitfinexcom/bfx-report-ui/pull/868)
- Moved `Account Fees` below other sections on the app `Summary` page. PR: [bfx-report-ui#871](https://github.com/bitfinexcom/bfx-report-ui/pull/871)
- Reworked and optimized the `Account Balance` section in a more performant way and reduced redundant code. PR: [bfx-report-ui#872](https://github.com/bitfinexcom/bfx-report-ui/pull/872)
- Actualized assets section title/subtitle on the `Summary` page, improved currencies formatting. PR: [bfx-report-ui#875](https://github.com/bitfinexcom/bfx-report-ui/pull/875)
- Improved fetching `opened positions` for the ending point of the `balance` report. PR: [bfx-reports-framework#421](https://github.com/bitfinexcom/bfx-reports-framework/pull/421)
- Moved window modules into the common folder. This small refactoring is part of adding translation support into the electronjs wrapper. PR: [bfx-report-electron#410](https://github.com/bitfinexcom/bfx-report-electron/pull/410)

### Fixed

- Fixed `opened positions` consideration in `balances` and `win/loss` reports. PR: [bfx-reports-framework#420](https://github.com/bitfinexcom/bfx-reports-framework/pull/420)
- Updated `macOS` on `GH Actions` from `12` to `15` due to caught warning on the last release: https://github.com/bitfinexcom/bfx-report-electron/actions/runs/11010191592. PR: [bfx-report-electron#413](https://github.com/bitfinexcom/bfx-report-electron/pull/413)
- Fixed `dotenv` importing for `prod` env. PR: [bfx-report-electron#414](https://github.com/bitfinexcom/bfx-report-electron/pull/414)
- Fixed `Docker` container preparation for release building. PR: [bfx-report-electron#417](https://github.com/bitfinexcom/bfx-report-electron/pull/417)

### Security

- Bumped `rollup` from `2.79.1` to `2.79.2`. PR: [bfx-report-ui#870](https://github.com/bitfinexcom/bfx-report-ui/pull/870)
- Bumped `express` from `4.18.2` to `4.21.0`, `ws` from `8.2.3` to `8.18.0`, `grenache-nodejs-http` from `0.7.12` to `0.7.13`, `grenache-nodejs-link` from `0.7.12` to `1.0.0`. PR: [bfx-report-express#42](https://github.com/bitfinexcom/bfx-report-express/pull/42)

## [4.28.0] - 2024-09-25

### Added

- Implemented dynamic height calculation for the `Concentration Risk` pie chart to prevent overflow issues possibility spotted in some cases. PR: [bfx-report-ui#859](https://github.com/bitfinexcom/bfx-report-ui/pull/859)
- Implemented `Last Sync time` handling and representation (approximately in hours) for the `Reports`. PR: [bfx-report-ui#863](https://github.com/bitfinexcom/bfx-report-ui/pull/863)
- Implemented `Profits` section (port of the `Win/Loss` chart with several predefined parameters) on the app `Summary` page. Removed charts smoothness for better precision. PR: [bfx-report-ui#864](https://github.com/bitfinexcom/bfx-report-ui/pull/864)
- Added logic to have separated translations by language in `JSON` files using `i18next` lib for easier translation maintenance. PRs: [bfx-report#402](https://github.com/bitfinexcom/bfx-report/pull/402), [bfx-reports-framework#417](https://github.com/bitfinexcom/bfx-reports-framework/pull/417)

### Changed

- Improved user notification and auth flow behavior for the cases when the user tries to re-add an existing account via email/password. PR: [bfx-report-ui#860](https://github.com/bitfinexcom/bfx-report-ui/pull/860)

### Fixed

- Improved `Docker`/`Terraform` deployment, fixed `html-pdf` module usage under Docker container with using docker container based on the `Debian` image to make `html-pdf` module workable, fixed deprecation warnings. PR: [bfx-reports-framework#415](https://github.com/bitfinexcom/bfx-reports-framework/pull/415)
- Fixed an infrequent case for `process.send()` when the app is on its way to being closed and the child process channel is closed but the worker still sends a message to the main one. PR: [bfx-reports-framework#416](https://github.com/bitfinexcom/bfx-reports-framework/pull/416)

### Security

- Bumped `path-to-regexp` from `1.8.0` to `1.9.0`, `express` from `4.19.2` to `4.21.0`. PR: [bfx-report-ui#858](https://github.com/bitfinexcom/bfx-report-ui/pull/858)

## [4.27.0] - 2024-09-11

### Added

- Added `DNS` availability error processing: `net::ERR_NAME_NOT_RESOLVED`. PR: [bitfinexcom/bfx-report#395](https://github.com/bitfinexcom/bfx-report/pull/395)
- Added `socket hang up` error processing as `ENet` error. PR: [bfx-report#396](https://github.com/bitfinexcom/bfx-report/pull/396)
- Added common net `net::ERR_` error processing as `ENet` error. PR: [bfx-report#397](https://github.com/bitfinexcom/bfx-report/pull/397)
- Implemented endpoint to get the last finished sync timestamp for the UI/UX. PR: [bfx-reports-framework#410](https://github.com/bitfinexcom/bfx-reports-framework/pull/410)
- Implemented the possibility of `Cancel` the generation process for the tax report. PR: [bfx-report-ui#854](https://github.com/bitfinexcom/bfx-report-ui/pull/854)

### Changed

- Improved the interruption flow of getting data from the `BFX API` for the tax report, provided event-driven flow after delay processing, speeded up interruption not to wait for timeout in case of a slow internet connection. PRs: [bfx-report#399](https://github.com/bitfinexcom/bfx-report/pull/399), [bfx-reports-framework#411](https://github.com/bitfinexcom/bfx-reports-framework/pull/411)
- Reworked DB model usage to use the new model interface implemented, speeded up the work by avoiding the usage of `cloneDeep` fn based on `JSON.parse(JSON.stringify(obj))` for the models. PR: [bfx-reports-framework#412](https://github.com/bitfinexcom/bfx-reports-framework/pull/412)
- Removed duplicate buttons with the same functionality, improved and unified reports refreshing flow. PR: [bfx-report-ui#852](https://github.com/bitfinexcom/bfx-report-ui/pull/852)
- Reworked and enhanced navigation tabs positioning and representation to be more consistent all across the app. Adjusted app `Summary` section spacing. PR: [bfx-report-ui#853](https://github.com/bitfinexcom/bfx-report-ui/pull/853)

### Fixed

- Fixed `node-fetch` timeout error processing for slow network connection. PR: [bfx-report#398](https://github.com/bitfinexcom/bfx-report/pull/398)

### Security

- Bumped `webpack` from `5.90.0` to `5.94.0`, `axios` from `1.6.7` to `1.7.4`. PR: [bfx-report-ui#851](https://github.com/bitfinexcom/bfx-report-ui/pull/851)

## [4.26.0] - 2024-08-28

### Added

- Added ability to send `IPC` messages when the sync is ready. PR: [bfx-reports-framework#405](https://github.com/bitfinexcom/bfx-reports-framework/pull/405)
- Added ability to show native notifications in case another screen is displayed and the app window is not hidden with multiple workspaces mode in `Ubuntu`/`Mac`. PR: [bfx-report-electron#389](https://github.com/bitfinexcom/bfx-report-electron/pull/389)
- Added ability to show the native notification in the electron app in case the `sync` is being processed in the background with the hidden main window. There we check if the main window is invisible and show a notification otherwise don't. PR: [bfx-report-electron#390](https://github.com/bitfinexcom/bfx-report-electron/pull/390)

### Changed

- Enhanced and unified `Logins` and `Change Logs` reports column configuration getters and reduced redundant code. PR: [bfx-report-ui#840](https://github.com/bitfinexcom/bfx-report-ui/pull/840)
- Reworked and optimized the `TimeFrameSelector` component in a more performant way and reduced redundant code. PR: [bfx-report-ui#841](https://github.com/bitfinexcom/bfx-report-ui/pull/841)
- Reworked cell generation configurations more concisely and optimally for `Wallets`, `Weighted Averages` and `Concentration Risk` reports. PR: [bfx-report-ui#842](https://github.com/bitfinexcom/bfx-report-ui/pull/842)
- Reworked and optimized `LedgersCategorySelect` in a more concise and performant way. PR: [bfx-report-ui#843](https://github.com/bitfinexcom/bfx-report-ui/pull/843)
- Reworked and optimized `Movements`, `Trades`, `Orders` and `Positions` reports column configuration getters. Implemented unified `getFeeCell` and `getActionCell` helpers for better reusability. PR: [bfx-report-ui#844](https://github.com/bitfinexcom/bfx-report-ui/pull/844)
- Reworked `CandlesTimeframe` in a more performant way and improved props linting. PR: [bfx-report-ui#845](https://github.com/bitfinexcom/bfx-report-ui/pull/845)
- Enhanced and unified `Snapshots` sections column configuration getters and reduced redundant code. PR: [bfx-report-ui#846](https://github.com/bitfinexcom/bfx-report-ui/pull/846)
- Removed deprecated methods and fields without breaking the logic and UI functionality. PRs: [bfx-report#389](https://github.com/bitfinexcom/bfx-report/pull/389), [bfx-reports-framework#403](https://github.com/bitfinexcom/bfx-reports-framework/pull/403)
- Improved DB file cleanups for test coverage hooks. PRs: [bfx-report#390](https://github.com/bitfinexcom/bfx-report/pull/390), [bitfinexcom/lokue#3](https://github.com/bitfinexcom/lokue/pull/3)
- Removed unused public colls conf accessor endpoints to use the common `getAllPublicCollsConfs`/`editAllPublicCollsConfs` ones without breaking the logic and UI functionality. PR: [bfx-reports-framework#404](https://github.com/bitfinexcom/bfx-reports-framework/pull/404)
- Implemented a class for DB models to typify and unify model objects. PR: [bfx-reports-framework#406](https://github.com/bitfinexcom/bfx-reports-framework/pull/406)
- Proxied `ENet` error tester for import in electron env. PR: [bfx-reports-framework#407](https://github.com/bitfinexcom/bfx-reports-framework/pull/407)

### Fixed

- Extended network error processing. Related to these issues: [bfx-report-electron#396](https://github.com/bitfinexcom/bfx-report-electron/issues/396), [bfx-report-electron#274](https://github.com/bitfinexcom/bfx-report-electron/issues/274). PR: [bfx-report#392](https://github.com/bitfinexcom/bfx-report/pull/392)
- Improved the tax report ccy conversion by adding `6` retries with `10sec` delay for getting `pub-trades` if returns non-array. PR: [bfx-reports-framework#402](https://github.com/bitfinexcom/bfx-reports-framework/pull/402)
- Extended network error processing and prevented showing the error modal dialog. Related to these issues: [bfx-report-electron#396](https://github.com/bitfinexcom/bfx-report-electron/issues/396), [bfx-report-electron#274](https://github.com/bitfinexcom/bfx-report-electron/issues/274). PR: [bfx-report-electron#397](https://github.com/bitfinexcom/bfx-report-electron/pull/397)

## [4.25.0] - 2024-07-31

### Added

- Added transaction tax report. PRs: [bfx-reports-framework#373](https://github.com/bitfinexcom/bfx-reports-framework/pull/373), [bfx-reports-framework#378](https://github.com/bitfinexcom/bfx-reports-framework/pull/378), [bfx-reports-framework#379](https://github.com/bitfinexcom/bfx-reports-framework/pull/379), [bfx-reports-framework#380](https://github.com/bitfinexcom/bfx-reports-framework/pull/380), [bfx-reports-framework#381](https://github.com/bitfinexcom/bfx-reports-framework/pull/381), [bfx-reports-framework#382](https://github.com/bitfinexcom/bfx-reports-framework/pull/382), [bfx-reports-framework#383](https://github.com/bitfinexcom/bfx-reports-framework/pull/383), [bfx-reports-framework#384](https://github.com/bitfinexcom/bfx-reports-framework/pull/384), [bfx-reports-framework#385](https://github.com/bitfinexcom/bfx-reports-framework/pull/385)
- Increased the math precision of the trx tax report using `bignumber.js`. PR: [bfx-reports-framework#386](https://github.com/bitfinexcom/bfx-reports-framework/pull/386)
- Added test coverage for the transaction tax report. PR: [bfx-reports-framework#387](https://github.com/bitfinexcom/bfx-reports-framework/pull/387)
- Added unit test for core `look-up-trades` fn of the transaction tax report. PR: [bfx-reports-framework#388](https://github.com/bitfinexcom/bfx-reports-framework/pull/388)
- Added ability to select `EXCHANGE` trades for the trx tax report. PR: [bfx-reports-framework#389](https://github.com/bitfinexcom/bfx-reports-framework/pull/389)
- Added `_isInvoicePayOrder`, `_isAirdropOnWallet`, `_isMarginFundingPayment`, `_isAffiliateRebate`, `_isStakingPayments` ledgers to movements. PR: [bfx-reports-framework#391](https://github.com/bitfinexcom/bfx-reports-framework/pull/391)
- Added ability to show taxable payment amounts in the tax report. PR: [bfx-reports-framework#392](https://github.com/bitfinexcom/bfx-reports-framework/pull/392)
- Added perc progress of the trx tax report based on transactions that should be converted to USD using the pub-trade endpoint. PR: [bfx-reports-framework#394](https://github.com/bitfinexcom/bfx-reports-framework/pull/394)
- Added ability to send `IPC` messages when the trx tax report is ready. This is used in the electronjs environment to show a native OS notification to the app in case the tax report is being generated in the background. PR: [bfx-reports-framework#397](https://github.com/bitfinexcom/bfx-reports-framework/pull/397)
- Added ability to overwrite common interrupter when query bfx api. PR: [bfx-report#371](https://github.com/bitfinexcom/bfx-report/pull/371)
- Added interruption ability in case rate limit. When getting `Rate Limit` or `cool down` due to `Rate Limit` for 1min occurs, it needs to provide a feature to interrupt the tax report and sync being processed. PR: [bfx-report#373](https://github.com/bitfinexcom/bfx-report/pull/373)
- Added `TRY` to the FOREX ccy list. PR: [bfx-report#377](https://github.com/bitfinexcom/bfx-report/pull/377)
- Added `CSV`/`PDF` formatter for the tax report `source` field to follow the UI view, eg show `AIRDROP_ON_WALLET` as `Airdrop on wallet`. PR: [bfx-report#381](https://github.com/bitfinexcom/bfx-report/pull/381)
- Added `source` field to `CSV`/`PDF` of the tax report to follow the UI view. PR: [bfx-reports-framework#398](https://github.com/bitfinexcom/bfx-reports-framework/pull/398)
- Added ability to show the native notification in the electron app in case the tax report is being generated in the background. There we check if the main window is invisible show a notification otherwise don't. PR: [bfx-report-electron#386](https://github.com/bitfinexcom/bfx-report-electron/pull/386)
- Implemented UI representation for the new Tax Report. PR: [bfx-report-ui#816](https://github.com/bitfinexcom/bfx-report-ui/pull/816)
- Implemented dismissable `Disclaimer` message for the new `Tax Report`. PR: [bfx-report-ui#831](https://github.com/bitfinexcom/bfx-report-ui/pull/831)
- Implemented `Source` column representation for the new Tax Report and formatted like `Airdrop on wallet`. PR: [bfx-report-ui#836](https://github.com/bitfinexcom/bfx-report-ui/pull/836)
- Implemented generation `progress` representation for the new `Tax Report`. Implemented notification on `Tax Report` generation finish. PR: [bfx-report-ui#837](https://github.com/bitfinexcom/bfx-report-ui/pull/837)

### Changed

- Refactored DB models to be moved to separate files for easier supporting and readability. PR: [bfx-reports-framework#393](https://github.com/bitfinexcom/bfx-reports-framework/pull/393)
- Refactored sync schema to be moved to separate files for easier supporting and readability. PR: [bfx-reports-framework#395](https://github.com/bitfinexcom/bfx-reports-framework/pull/395)
- Refactored and optimizes `CollapsedTable` component. PR: [bfx-report-ui#815](https://github.com/bitfinexcom/bfx-report-ui/pull/815)
- Reworked and optimized `Spot` report column configuration getters. PR: [bfx-report-ui#817](https://github.com/bitfinexcom/bfx-report-ui/pull/817)
- Refactored and optimized the `DateFormatSelector` component. PR: [bfx-report-ui#818](https://github.com/bitfinexcom/bfx-report-ui/pull/818)
- Reworked and optimized `Funding Bids & Offers`, `Funding Loans (Unused)` and `Funding Credits (Used)` reports column configuration getters. Extended unified cell getter customizability for the cases when the tooltip content should be formatted differently from the main cell content. PR: [bfx-report-ui#819](https://github.com/bitfinexcom/bfx-report-ui/pull/819)
- Reworked and optimized the `LangMenu` component in a more performant way and reduces redundant code to avoid potential issues in the future. PR: [bfx-report-ui#820](https://github.com/bitfinexcom/bfx-report-ui/pull/820)
- Enhanced and unified `Ledgers`, `Funding Earnings`, `Staking Earnings` and `Affiliates Earnings` reports configuration getters. PR: [bfx-report-ui#821](https://github.com/bitfinexcom/bfx-report-ui/pull/821)
- Reworked and optimized the `Export` menu toggler component in a more performant way and reduces redundant code. PR: [bfx-report-ui#822](https://github.com/bitfinexcom/bfx-report-ui/pull/822)
- Reworked and optimized `Public Trades`, `Public Funding` and `Derivatives` reports column configuration getters. Implemented unified `formatType` utility for better reusability. PR: [bfx-report-ui#823](https://github.com/bitfinexcom/bfx-report-ui/pull/823)
- Reworked and optimized the `NavSwitcher` component and improved props linting. PR: [bfx-report-ui#824](https://github.com/bitfinexcom/bfx-report-ui/pull/824)
- Reworked and optimized `Invoices` report columns configuration getters. Implemented unified `getLinkCell` and `getJsonFormattedCell` utilities for better reusability. PR: [bfx-report-ui#827](https://github.com/bitfinexcom/bfx-report-ui/pull/827)
- Reworked and optimized the `ShowMilliseconds` component  in a more performant way and reduces redundant code. PR: [bfx-report-ui#828](https://github.com/bitfinexcom/bfx-report-ui/pull/828)
- Prevented the `Tax Report` loading state still active in cases when the `emitTrxTaxReportGenerationInBackgroundToOne` event returns an `error` during report generation. PR: [bfx-report-ui#832](https://github.com/bitfinexcom/bfx-report-ui/pull/832)

### Fixed

- Strengthened consistency data for export. PR: [bfx-report#372](https://github.com/bitfinexcom/bfx-report/pull/372)
- Fixed pub-trade price lookup for the trx tax report. PR: [bfx-reports-framework#390](https://github.com/bitfinexcom/bfx-reports-framework/pull/390)
- Fixed the tax report if bfx-api `pub-trades` endpoint does not return array. PR: [bfx-reports-framework#396](https://github.com/bitfinexcom/bfx-reports-framework/pull/396)
- Prevented requests duplication on `Tax Report` refreshing in some cases. PR: [bfx-report-ui#833](https://github.com/bitfinexcom/bfx-report-ui/pull/833)
- Fixed issue with showing the sync state in some cases when the scheduler launches the synchronization. PR: [bfx-report-ui#835](https://github.com/bitfinexcom/bfx-report-ui/pull/835)
- Fixed `disabling` the `Authenticate` button during the `2FA` login flow to prevent the possibility of requests with the same token duplication and related errors. PR: [bfx-report-ui#838](https://github.com/bitfinexcom/bfx-report-ui/pull/838)

### Security

- Added `dependabot` config for the ability to open new PRs against the `staging` branch. Also bumped `pug` version to `3.0.3` to have a [security improvement](https://github.com/pugjs/pug/pull/3438). PR: [bfx-report#380](https://github.com/bitfinexcom/bfx-report/pull/380)
- Bumped `braces` from `3.0.2` to `3.0.3`. PR: [bfx-report-ui#826](https://github.com/bitfinexcom/bfx-report-ui/pull/826)

## [4.24.0] - 2024-05-08

### Added

- Added `3` retries for the test run before it fails, increased timeouts for mocha hooks. PRs: [bfx-report#368](https://github.com/bitfinexcom/bfx-report/pull/368), [bfx-report-electron#374](https://github.com/bitfinexcom/bfx-report-electron/pull/374), [bfx-reports-framework#372](https://github.com/bitfinexcom/bfx-reports-framework/pull/372), [bfx-reports-framework#374](https://github.com/bitfinexcom/bfx-reports-framework/pull/374)
- Implemented the possibility to `Reset Column Widths` via the context menu (right click) on column headers. PR: [bfx-report-ui#808](https://github.com/bitfinexcom/bfx-report-ui/pull/808)
- Implemented the possibility to customize (1-7 days range supported) authorization token TTL via the `Preferences` menu in the app. PR: [bfx-report-ui#809](https://github.com/bitfinexcom/bfx-report-ui/pull/809)

### Changed

- Disabled the `Changelog` menu option if the description of the current version is not available. PR: [bfx-report-electron#373](https://github.com/bitfinexcom/bfx-report-electron/pull/373)
- Enhanced `sub-account` ledger balance recalc to prevent setting non-recalced balances. Prevented `funding trades` sync issue when `end` less than `start`. Related to this issue: [bfx-report-electron#375](https://github.com/bitfinexcom/bfx-report-electron/issues/375). PR: [bfx-reports-framework#375](https://github.com/bitfinexcom/bfx-reports-framework/pull/375)
- Enhanced default column widths calculation flow using dynamic calculated average and widths multipliers based on the column types. PR: [bfx-report-ui#810](https://github.com/bitfinexcom/bfx-report-ui/pull/810)

### Security

- Resolved `dependabot` dependency updates, bumped `ejs` from `3.1.9` to `3.1.10`. PR: [bfx-report-ui#813](https://github.com/bitfinexcom/bfx-report-ui/pull/813)

## [4.23.0] - 2024-04-17

### Added

- Implemented `isStagingBfxApi` flag handling and shows `Staging` prefix for the corresponding keys stored in the DB to improve the manual testing process convenience. PR: [bfx-report-ui#800](https://github.com/bitfinexcom/bfx-report-ui/pull/800)
- Implemented the possibility of manually adjusting columns width and persisting these between sessions. Added the ability to set the auto-calculated dynamic defaults via the context menu. Improved charts responsiveness. PR: [bfx-report-ui#805](https://github.com/bitfinexcom/bfx-report-ui/pull/805)

### Changed

- Updated `GH Actions` `setup-node` to `v4` to prevent breaking changes in workflow. PRs: [bfx-facs-db-better-sqlite#10](https://github.com/bitfinexcom/bfx-facs-db-better-sqlite/pull/10), [bfx-report#365](https://github.com/bitfinexcom/bfx-report/pull/365), [bfx-reports-framework#369](https://github.com/bitfinexcom/bfx-reports-framework/pull/369)
- Increased the inner `limit` for the BFX API `trades/{symbol}/hist` endpoint. It's useful for the `Transaction Tax Report` in case of currency conversion to USD to reduce the amount of calls and help users to go through `Rate Limit`. PR: [bfx-report#363](https://github.com/bitfinexcom/bfx-report/pull/363)
- Speeded up `auth` in case token expiration to prevent redundant awaiting. PR: [bfx-report#364](https://github.com/bitfinexcom/bfx-report/pull/364)
- Reverted tables responsiveness in the UI. PR: [bfx-report-ui#801](https://github.com/bitfinexcom/bfx-report-ui/pull/801)
- Reverted the option to revert table width as an always dynamic component. PR: [bfx-report-ui#802](https://github.com/bitfinexcom/bfx-report-ui/pull/802)
- Extended and improved click tracking all across the `Reports`. PR: [bfx-report-ui#803](https://github.com/bitfinexcom/bfx-report-ui/pull/803)
- Enhanced `Reports` navigation menu representation. PR: [bfx-report-ui#804](https://github.com/bitfinexcom/bfx-report-ui/pull/804)

### Fixed

- Fixed `action` prop passing for the `WS` in case an error. PR: [bfx-report-express#38](https://github.com/bitfinexcom/bfx-report-express/pull/38)

## [4.22.0] - 2024-04-03

### Added

- Implemented dynamic width support for the `Reports` tables according to: the tables should stretch and fill horizontally (width 100%). PR: [bfx-report-ui#794](https://github.com/bitfinexcom/bfx-report-ui/pull/794)
- Added `DMG` Mac dist release uploading in case of manual build on a fork. Related to this issue: [bfx-report-electron#352](https://github.com/bitfinexcom/bfx-report-electron/issues/352). PR: [bfx-report-electron#357](https://github.com/bitfinexcom/bfx-report-electron/pull/357)
- Added handling unexpected BFX API errors, added `3` retries with a timeout `10sec` if catches any unexpected errors during report generation or DB sync in framework mode. Related to these issues: [bfx-report-electron#354](https://github.com/bitfinexcom/bfx-report-electron/issues/354), [bfx-report-electron#355](https://github.com/bitfinexcom/bfx-report-electron/issues/355). PR: [bfx-report#359](https://github.com/bitfinexcom/bfx-report/pull/359)
- Added additional processing for JSON DB file of the `LokiJS`. In some rare cases due to an unexpected termination of the app process, the JSON file used for LokiJS can not be finished recording correctly. Related to this issue: [bfx-report-electron#353](https://github.com/bitfinexcom/bfx-report-electron/issues/353). PR: [bfx-reports-framework#365](https://github.com/bitfinexcom/bfx-reports-framework/pull/365)

### Changed

- Improved export type selection, added Export Format selector (similar to Date Format) with 2 options: 1-export as CSV (should be selected by default), 2-export as PDF. PR: [bfx-report-ui#795](https://github.com/bitfinexcom/bfx-report-ui/pull/795)
- Extended error logs for sync proc, the idea is to add `serializedError` field to the error object with a serialized error string that contains composed error metadata for easier debugging of the user's error reports. This field will be used for logging in case catching error occurs during sync in the framework mode. PRs: [bfx-report#360](https://github.com/bitfinexcom/bfx-report/pull/360), [bfx-reports-framework#366](https://github.com/bitfinexcom/bfx-reports-framework/pull/366)

### Security

- Resolved `dependabot` dependency updates, bumped `follow-redirects` from `1.15.5` to `1.15.6`, `webpack-dev-middleware` from `5.3.3` to `5.3.4`, `express` from `4.18.2` to `4.19.2`. PRs: [bfx-report-ui#792](https://github.com/bitfinexcom/bfx-report-ui/pull/792), [bfx-report-ui#797](https://github.com/bitfinexcom/bfx-report-ui/pull/797)

## [4.21.0] - 2024-03-20

### Added

- Added ability to handle `PDFBufferUnderElectronCreationError` error to use WebSockets to inform users for better UX. PRs: [bfx-report#354](https://github.com/bitfinexcom/bfx-report/pull/354), [bfx-reports-framework#359](https://github.com/bitfinexcom/bfx-reports-framework/pull/359)
- Implemented support for `emitReportFileGenerationFailedToOne` ws events on UI side to inform users about report generation failing. PR: [bfx-report-ui#787](https://github.com/bitfinexcom/bfx-report-ui/pull/787)
- Added missing translations for PDF reports. PRs: [bfx-report#356](https://github.com/bitfinexcom/bfx-report/pull/356), [bfx-reports-framework#362](https://github.com/bitfinexcom/bfx-reports-framework/pull/362)
- Added DB migration for `publicCollsConf` table name with Cyrillic `c`. PR: [bfx-reports-framework#360](https://github.com/bitfinexcom/bfx-reports-framework/pull/360)
- Added migration for public colls conf endpoint name with Cyrillic `c`. PR: [bfx-report-ui#788](https://github.com/bitfinexcom/bfx-report-ui/pull/788)
- Added ability to upload dist release if repo owner is customized using manual build run. PR: [bfx-report-electron#347](https://github.com/bitfinexcom/bfx-report-electron/pull/347)

### Changed

- Updated `GH Actions` to use Nodejs `v20` to prevent breaking changes in workflow. PRs: [bfx-report#355](https://github.com/bitfinexcom/bfx-report/pull/355), [bfx-reports-framework#361](https://github.com/bitfinexcom/bfx-reports-framework/pull/361), [bfx-report-electron#344](https://github.com/bitfinexcom/bfx-report-electron/pull/344), [bfx-facs-db-better-sqlite#9](https://github.com/bitfinexcom/bfx-facs-db-better-sqlite/pull/9)
- Migrated from the `deprecated` reports generation methods usage to the actual ones according to the latest backend changes. PR: [bfx-report-ui#784](https://github.com/bitfinexcom/bfx-report-ui/pull/784)
- Allowed all pairs removal at the `Market History / Spot` section according to the latest UX improvement proposals: We should allow the user to remove the current pair and display an empty table that says `No history to display`. PR: [bfx-report-ui#786](https://github.com/bitfinexcom/bfx-report-ui/pull/786)
- Improved print PDF under Electronjs. Turned off ipc log transport between render and main process as unused, it prevents ipc transport error from `electron-log` lib. Suppressed error modal window if pdf gen failed: the idea here is to inform the user if something goes wrong using WS event for better UX instead of showing a modal window error as it is annoying in most cases. Improved pdf generation performance for big html templates, uses `loadFile` method of electron api instead of `base64` encoding. Bumped up Electronjs minor version to have the last fixes. PR: [bfx-report-electron#342](https://github.com/bitfinexcom/bfx-report-electron/pull/342)

### Fixed

- Prevented duplication possibility for items in the selectors of the UI. PR: [bfx-report-ui#785](https://github.com/bitfinexcom/bfx-report-ui/pull/785)

## [4.20.0] - 2024-03-06

### Added

- Added missing translations for `2FA`. PR: [bfx-report-ui#774](https://github.com/bitfinexcom/bfx-report-ui/pull/774)
- Implemented exporting to PDF support for `Ledgers` and `Tax Reports`. PRs: [bfx-report#347](https://github.com/bitfinexcom/bfx-report/pull/347), [bfx-reports-framework#352](https://github.com/bitfinexcom/bfx-reports-framework/pull/352), [bfx-report-electron#319](https://github.com/bitfinexcom/bfx-report-electron/pull/319), [bfx-ext-pdf-js#4](https://github.com/bitfinexcom/bfx-ext-pdf-js/pull/4), [bfx-report#349](https://github.com/bitfinexcom/bfx-report/pull/349), [bfx-reports-framework#354](https://github.com/bitfinexcom/bfx-reports-framework/pull/354), [bfx-report-ui#775](https://github.com/bitfinexcom/bfx-report-ui/pull/775)
- Added detection for `BFX` auth error: `ERR_AUTH_API: ERR_TOKEN_ALREADY_USED`. PR: [bfx-report#348](https://github.com/bitfinexcom/bfx-report/pull/348)
- Added improvements to the token refresh flow: stop the auth token refresh interval if catch an auth error. PR: [bfx-reports-framework#353](https://github.com/bitfinexcom/bfx-reports-framework/pull/353)
- Added option to set repo owner for auto-update in manual run. PR: [bfx-report-electron#331](https://github.com/bitfinexcom/bfx-report-electron/pull/331)

### Changed

- Reworked navigation for the `Movements` report according to the latest UX improvement proposals: remove tabs from wallets & movements, make movements a separate navigation item under `My History`. PR: [bfx-report-ui#771](https://github.com/bitfinexcom/bfx-report-ui/pull/771)
- Reworked navigation for the `My History` section according to the latest UX improvement proposals. PR: [bfx-report-ui#778](https://github.com/bitfinexcom/bfx-report-ui/pull/778)
- Enhanced `loading` and `no data` states representation for reports with tables. PR: [bfx-report-ui#779](https://github.com/bitfinexcom/bfx-report-ui/pull/779)
- Set `90sec` timeout for grc requests to have the same timeout as for api requests. PR: [bfx-report#351](https://github.com/bitfinexcom/bfx-report/pull/351)
- Set `90sec` timeout for `html-pdf` lib. PR: [bfx-reports-framework#355](https://github.com/bitfinexcom/bfx-reports-framework/pull/355)
- Optimized GitHub Actions Workflow for release build. PR: [bfx-report-electron#322](https://github.com/bitfinexcom/bfx-report-electron/pull/322)
- Updated Actions to use Nodejs `v20`. PR: [bfx-report-electron#323](https://github.com/bitfinexcom/bfx-report-electron/pull/323)

### Fixed

- Updated UI engines configuration to prevent issues. PR: [bfx-report-ui#772](https://github.com/bitfinexcom/bfx-report-ui/pull/772)
- Fixed `2FA` authorization flow according to: After the first push of the auth button, we should lock the button (till we get any response from this endpoint) to prevent sending several of the same requests. PR: [bfx-report-ui#776](https://github.com/bitfinexcom/bfx-report-ui/pull/776)
- Fixed the potential possibility of duplicated sending for correct `OTP`: it should keep btn disabled until the successful auth will be completed. PR: [bfx-report-ui#780](https://github.com/bitfinexcom/bfx-report-ui/pull/780)
- Fixed 11 `auto-update-toast:width` listeners added. PR: [bfx-report-electron#330](https://github.com/bitfinexcom/bfx-report-electron/pull/330)

## [4.19.0] - 2024-02-14

### Added

- Added ability to close the drawer on mobile when clicking on a item of the menu. PR: [bfx-report-ui#764](https://github.com/bitfinexcom/bfx-report-ui/pull/764)
- Added environment configuration during the `Google Tag Manager` initialization. PR: [bfx-report-ui#767](https://github.com/bitfinexcom/bfx-report-ui/pull/767)
- Added an option to skip `Mac` build notarizing and signing when running manually. PR: [bfx-report-electron#314](https://github.com/bitfinexcom/bfx-report-electron/pull/314)

### Changed

- Enhanced representation of the app `Summary` sections loading states according to the latest design updates. Added showing loading states for them during initial sync. PR: [bfx-report-ui#768](https://github.com/bitfinexcom/bfx-report-ui/pull/768)

## [4.18.0] - 2024-01-31

### Added

- Added Apple signing and notarization workflow. PR: [bfx-report-electron#299](https://github.com/bitfinexcom/bfx-report-electron/pull/299)
- Implemented users informing about the [platform maintenance](https://bitfinex.statuspage.io/) mode. PR: [bfx-report-ui#756](https://github.com/bitfinexcom/bfx-report-ui/pull/756)
- Implemented configurable balances representation `Filter` for the `Summary by Asset` section. PR: [bfx-report-ui#753](https://github.com/bitfinexcom/bfx-report-ui/pull/753)
- Implemented `Google Tag Manager` support for the `Reports` and events tracking. PR: [bfx-report-ui#762](https://github.com/bitfinexcom/bfx-report-ui/pull/762)

### Changed

- Improved user informing about the initial synchronization. PR: [bfx-report-ui#760](https://github.com/bitfinexcom/bfx-report-ui/pull/760)
- Improved login to sign in when `otp` length is `6`. PR: [bfx-report-ui#758](https://github.com/bitfinexcom/bfx-report-ui/pull/758)

### Fixed

- Fixed lint error. PR: [bfx-report-ui#763](https://github.com/bitfinexcom/bfx-report-ui/pull/763)

### Security

- Resolved `dependabot` dependency updates, bumped `follow-redirects` from `1.15.3` to `1.15.4`. PR: [bfx-report-ui#755](https://github.com/bitfinexcom/bfx-report-ui/pull/755)
- Replaced `Lodash` `_isObject` helper usage with the corresponding one from the internal library for security reasons. PR: [bfx-report-ui#761](https://github.com/bitfinexcom/bfx-report-ui/pull/761)

## [4.17.0] - 2024-01-10

### Added

- Added ability to define what kind of API keys are stored `prod`/`staging`. The `prod`/`staging` is detected by existing the `staging` string in the restUrl config option: `https://api-pub.bitfinex.com`/`https://api.staging.bitfinex.com`. And `isStagingBfxApi` flag is set or updated on `signUp`/`signIn` to the `user` table. Than, `getUsers` endpoint will return the `isStagingBfxApi` flag to be shown in the UI for each user on the login stage. PR: [bfx-reports-framework#347](https://github.com/bitfinexcom/bfx-reports-framework/pull/347)
- Added automated testing for electron app binaries. The flow: build release on GitHub Actions, use unpacked builds for E2E tests, launch E2E test on Linux and Mac and Win OSs independently, provide E2E test reports for every OS launch. PR: [bfx-report-electron#276](https://github.com/bitfinexcom/bfx-report-electron/pull/276)

### Fixed

- Fixed `parentCellHeight` related warnings for the several column configurations. PR: [bfx-report-ui#749](https://github.com/bitfinexcom/bfx-report-ui/pull/749)
- Fixes skipping publishing of artifact for `Mac` by `electron-builder`. The issue came from this PR of `electron-builder`: [electron-builder#7715](https://github.com/electron-userland/electron-builder/pull/7715). PR: [bfx-report-electron#290](https://github.com/bitfinexcom/bfx-report-electron/pull/290)

### Security

- Replaced `Lodash` `_isEqual` helper usage all across the app with the corresponding one from the internal library for security reasons. PR: [bfx-report-ui#750](https://github.com/bitfinexcom/bfx-report-ui/pull/750)
- Resolved `dependabot` dependency updates: [bfx-report-electron#269](https://github.com/bitfinexcom/bfx-report-electron/pull/269), [bfx-report-electron#270](https://github.com/bitfinexcom/bfx-report-electron/pull/270), [bfx-report-electron#272](https://github.com/bitfinexcom/bfx-report-electron/pull/272), [bfx-report-electron#273](https://github.com/bitfinexcom/bfx-report-electron/pull/273), [bfx-report-electron#280](https://github.com/bitfinexcom/bfx-report-electron/pull/280). PR: [bfx-report-electron#289](https://github.com/bitfinexcom/bfx-report-electron/pull/289)

## [4.16.0] - 2023-12-13

### Added

- Added the `start` param to the `Summary by Asset` to be able to select a period more than `30d`. PR: [bfx-reports-framework#342](https://github.com/bitfinexcom/bfx-reports-framework/pull/342)
- Added exchange volume and trading fee values to the the `Summary by Asset`. PR: [bfx-reports-framework/pull/344](https://github.com/bitfinexcom/bfx-reports-framework/pull/344)
- Added exceptions for the error modal window. It should cover the follow cases: `database is locked` and `network timeout`. PR: [bfx-report-electron#285](https://github.com/bitfinexcom/bfx-report-electron/pull/285)
- Implemented `ETH2P (ETH2Pending)`, `ETH2R (ETH2Rewards)` and `ETH2U (ETH2Unstaking)` availability in the `Symbol` selector. PR: [bfx-report-ui#740](https://github.com/bitfinexcom/bfx-report-ui/pull/740)
- Implemented dynamic selectable date range support for the `Summary by Asset` section. PR: [bfx-report-ui#741](https://github.com/bitfinexcom/bfx-report-ui/pull/741)
- Implemented representation of `Volume (eligible for fee tier calculation) in the last 30 days` in the `Account Fees` table of the `Summary` page. PR: [bfx-report-ui#743](https://github.com/bitfinexcom/bfx-report-ui/pull/743)
- Implemented displaying the selected period as a subtitle in the `Summary by Asset` section. PR: [bfx-report-ui#745](https://github.com/bitfinexcom/bfx-report-ui/pull/745)

### Changed

- Considered the requested `start` time point instead of the existing one in the `ledgers` for the `Account Balance`. The idea is to show users the Account Balance started from the wallet snapshot of the start time point. PR: [bfx-reports-framework#341](https://github.com/bitfinexcom/bfx-reports-framework/pull/341)
- Removed the `Profits` column from the `Summary by Asset` table temporally. PR: [bfx-report-ui#744](https://github.com/bitfinexcom/bfx-report-ui/pull/744)
- Actualized columns for the `Summary by Asset` section. PR: [bfx-report-ui#746](https://github.com/bitfinexcom/bfx-report-ui/pull/746)

### Fixed

- Fixed `Account Balance` unrealized profit. The issue is in passing the correct timestamp for currency conversion of PL values of daily positions snapshot. PR: [bfx-reports-framework#340](https://github.com/bitfinexcom/bfx-reports-framework/pull/340)
- Fixed initialization requests order for all reports according to the proposals to prevent received data inconsistency in some cases. PR: [bfx-report-ui#742](https://github.com/bitfinexcom/bfx-report-ui/pull/742)

### Security

- Used `max` and `min` utils from the `lib-js-util-base` lib instead of the `lodash`. PRs: [bfx-reports-framework#343](https://github.com/bitfinexcom/bfx-reports-framework/pull/343), [lib-js-util-base#19](https://github.com/bitfinexcom/lib-js-util-base/pull/19)

## [4.15.0] - 2023-11-29

### Added

- Added `Summary by Asset` section for the last 30 days on the new `Summary` for the `Reports` app. Added refreshing for all `Summary` sections on the `Filter` button click. PR: [bfx-report-ui#726](https://github.com/bitfinexcom/bfx-report-ui/pull/726)
- Added ability to sync daily `candles` once per day to reduce the number of sync requests to `BFX API` and as a result improve the situation with the `Rate Limit` restriction. PR: [bfx-reports-framework#334](https://github.com/bitfinexcom/bfx-reports-framework/pull/334)
- Added ability to reference specific user currencies when `candles` sync. The aim is to reduce the amount of requests to the `BFX API` candles endpoint and speed up the sync essentially. Also for better UX, added approximate candles sync time estimation considering the amount of syncing currencies. And set candles limit `20 reqs/min` instead of 30 to go through the `Rate Limit`. PR: [bfx-reports-framework#335](https://github.com/bitfinexcom/bfx-reports-framework/pull/335)

### Changed

- Set `10 reqs/min` for `BFX API` `trades` endpoint to help big users go through `Rate Limit` for the `Tax Report`. PR: [bfx-reports-framework#337](https://github.com/bitfinexcom/bfx-reports-framework/pull/337)
- Temporarily hidden `Unrealized Profit` selectors from the new app `Summary` and `Account Balance` reports. PR: [bfx-report-ui#730](https://github.com/bitfinexcom/bfx-report-ui/pull/730)
- Updated TW Translations. PR: [bfx-report-ui#734](https://github.com/bitfinexcom/bfx-report-ui/pull/734)
- Improved `Balance Change` representation in the `Summary by Asset` section. PR: [bfx-report-ui#736](https://github.com/bitfinexcom/bfx-report-ui/pull/736)

### Fixed

- Prevented throwing error when `GitHub` server can't respond to auto-update requests. It fixed the following issues: [bfx-report-electron#239](https://github.com/bitfinexcom/bfx-report-electron/issues/239), [bfx-report-electron#264](https://github.com/bitfinexcom/bfx-report-electron/issues/264). PR: [bfx-report-electron#265](https://github.com/bitfinexcom/bfx-report-electron/pull/265)
- Fixed double requests while syncing `candles`. The issue is: when we sync data in the framework mode, candles request can give only one item, in this case, we shouldn't process the part of logic with handling of containing the same timestamps in all items. PR: [bfx-report#343](https://github.com/bitfinexcom/bfx-report/pull/343)
- Fixed getting data from `BFX API` with undefined args. PRs: [bfx-report#344](https://github.com/bitfinexcom/bfx-report/pull/344), [lib-js-util-base#15](https://github.com/bitfinexcom/lib-js-util-base/pull/15)
- Fixed `BFX` auth token refreshing. PR: [bfx-reports-framework#336](https://github.com/bitfinexcom/bfx-reports-framework/pull/336)
- Fixed initial synchronization flow, improved data handling for `Summary` sections. PR: [bfx-report-ui#731](https://github.com/bitfinexcom/bfx-report-ui/pull/731)
- Fixed `candles/trades` requests duplication on `Candles` report refreshing. PR: [bfx-report-ui#732](https://github.com/bitfinexcom/bfx-report-ui/pull/732)
- Fixed synchronization state checking flow and fixed a couple of potential issues that have been spotted in some syncing scenarios. PR: [bfx-report-ui#735](https://github.com/bitfinexcom/bfx-report-ui/pull/735)

### Security

- Replaced `Lodash` `_get` helper usage all across the app with the corresponding one from the internal library for security reasons. PR: [bfx-report-ui#727](https://github.com/bitfinexcom/bfx-report-ui/pull/727)

## [4.14.0] - 2023-11-01

### Added

- Added test runner and report to the `GitHub Actions` of the `bfx-facs-db-better-sqlite` repo. PR: [bfx-facs-db-better-sqlite#8](https://github.com/bitfinexcom/bfx-facs-db-better-sqlite/pull/8)
- Added an endpoint to get the `summary by asset` (for 30 day period) for the new summary page of the framework mode. PR: [bfx-reports-framework#330](https://github.com/bitfinexcom/bfx-reports-framework/pull/330)
- Implemented currency name representation depending on the transport layer used for the `Tether` transactions in the `Movements` report. PR: [bfx-report-ui#721](https://github.com/bitfinexcom/bfx-report-ui/pull/721)
- Implemented the possibility of submitting `username/password` and `OTP` via the `Enter` button during the `2FA` sign-up flow. PR: [bfx-report-ui#722](https://github.com/bitfinexcom/bfx-report-ui/pull/722)

### Changed

- Bumped `Electronjs` version up to `v27` to have under hood Nodejs `v18.17.1`, to have Nodejs version similar to UI build requirements. PR: [bfx-report-electron#263](https://github.com/bitfinexcom/bfx-report-electron/pull/263)
- Bumped `better-sqlite3` up to `9.0.0` to have the ability to launch the DB driver on Nodejs `v18.17.1` under electron env at least `v27`. PR: [bfx-facs-db-better-sqlite#7](https://github.com/bitfinexcom/bfx-facs-db-better-sqlite/pull/7)
- Set the [dependabot](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file) against the `stagin` branch to not trigger test-runner workflow

### Fixed

- Fixed the `candles` sync for the `currency converter`, to convert the first ledgers to USD it needs to provide some overlap of candles (5 days). PR: [bfx-reports-framework#329](https://github.com/bitfinexcom/bfx-reports-framework/pull/329)
- Fixed deep clone of arguments with `lib-js-util-base`, the issue is the following: when calling `generateToken/invalidateAuthToken` methods pass whole session object with `setInterval` id, and that id cannot be serialized with `JSON.stringify`, it should be omitted. PR: [bfx-reports-framework#331](https://github.com/bitfinexcom/bfx-reports-framework/pull/331)
- Fixed the [dependabot](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file) config path for the `bfx-report-ui` repo. PR: [bfx-report-ui#720](https://github.com/bitfinexcom/bfx-report-ui/pull/720)

### Security

- Removed `lodash` lib usage. PRs: [bfx-report#340](https://github.com/bitfinexcom/bfx-report/pull/340), [bfx-reports-framework#328](https://github.com/bitfinexcom/bfx-reports-framework/pull/328), [bfx-report-ui#723](https://github.com/bitfinexcom/bfx-report-ui/pull/723)

## [4.13.0] - 2023-10-18

### Added

- Added `test` runner and `HTML report` maker workflows to the GitHub Actions which launch after creating PRs against the `master` branch. PRs: [bfx-report#337](https://github.com/bitfinexcom/bfx-report/pull/337), [bfx-reports-framework#325](https://github.com/bitfinexcom/bfx-reports-framework/pull/325), [bfx-report-electron#259](https://github.com/bitfinexcom/bfx-report-electron/pull/259)
- Implemented `Account Fees`, `Account Value` and `LEO level` sections on the new `Summary` page, added minor styling adjustments. PR: [bfx-report-ui#716](https://github.com/bitfinexcom/bfx-report-ui/pull/716)

### Security

- Removed `lodash` lib usage. PRs: [bfx-report#336](https://github.com/bitfinexcom/bfx-report/pull/336), [bfx-report-ui#717](https://github.com/bitfinexcom/bfx-report-ui/pull/717), [lib-js-util-base#6](https://github.com/bitfinexcom/lib-js-util-base/pull/6)

## [4.12.0] - 2023-10-04

### Added

- Added ability to inform user that the `platform` is marked in the `maintenance` mode by `WebSocket`. PRs: [bfx-report#331](https://github.com/bitfinexcom/bfx-report/pull/331), [bfx-reports-framework#321](https://github.com/bitfinexcom/bfx-reports-framework/pull/321), [bfx-api-mock-srv#56](https://github.com/bitfinexcom/bfx-api-mock-srv/pull/56)
- Added `Vietnamese` language. PRs: [bfx-report-ui#711](https://github.com/bitfinexcom/bfx-report-ui/pull/711), [bfx-report-ui#712](https://github.com/bitfinexcom/bfx-report-ui/pull/712)

### Changed

- Actualized synchronization progress handling flow according to the latest backend updates. PR: [bfx-report-ui#710](https://github.com/bitfinexcom/bfx-report-ui/pull/710)

### Fixed

- Fixed `MaxListenersExceededWarning` for complicated csv reports using the `transform` csv stream waiting for writing to complete `one by one` instead of pipelining all csv streams `simultaneously`. And it also fixed `MaxListenersExceededWarning` for the `process message manager`. PRs: [bfx-report#333](https://github.com/bitfinexcom/bfx-report/pull/333), [bfx-reports-framework#322](https://github.com/bitfinexcom/bfx-reports-framework/pull/322)
- Fixed `Movements` extra info representation for fiat transfers. PR: [bfx-report-ui#707](https://github.com/bitfinexcom/bfx-report-ui/pull/707)

### Security

- Removed `lodash` lib usage. PRs: [bfx-report#332](https://github.com/bitfinexcom/bfx-report/pull/332), [bfx-facs-deflate#4](https://github.com/bitfinexcom/bfx-facs-deflate/pull/4), [bfx-report-express#34](https://github.com/bitfinexcom/bfx-report-express/pull/34), [bfx-report-electron#255](https://github.com/bitfinexcom/bfx-report-electron/pull/255)

## [4.11.0] - 2023-09-20

### Added

- Added ability to show success dialog for `CSV` exporting only after the `emitCsvGenerationCompletedToOne` event was sent by the backend for better understanding by users when the exporting process actually completed. PR: [bfx-report-ui#698](https://github.com/bitfinexcom/bfx-report-ui/pull/698)
- Added the possibility of tweaking the ability to auto-start sync after the auto-update of the electron app via the `Preferences` menu: `shouldNotSyncOnStartupAfterUpdate` flag received on sign in. PR: [bfx-report-ui#699](https://github.com/bitfinexcom/bfx-report-ui/pull/699)
- Implemented [extra information](https://docs.bitfinex.com/reference/movement-info) handling and representation for the `Movements` report. PR: [bfx-report-ui#702](https://github.com/bitfinexcom/bfx-report-ui/pull/702)
- Implemented `LNX (LN-BTC)` availability in the `Symbol` selector. PR: [bfx-report-ui#703](https://github.com/bitfinexcom/bfx-report-ui/pull/703)

### Changed

- Decreased `candles` request limit to `30 reqs/min` to prevent `Rate Limit` restriction. PR: [bfx-reports-framework#316](https://github.com/bitfinexcom/bfx-reports-framework/pull/316)
- Improved server availability error message to be persistent. PR: [bfx-reports-framework#317](https://github.com/bitfinexcom/bfx-reports-framework/pull/317)
- Updated `Nodejs` to `v18` in `Docker` containers and fixes UI dependencies installation under container. PR: [bfx-reports-framework#318](https://github.com/bitfinexcom/bfx-reports-framework/pull/318)
- Bumped `Electron` version up to `v25` to have under hood `Nodejs` `v18`. PRs: [bfx-report-electron#251](https://github.com/bitfinexcom/bfx-report-electron/pull/251), [bfx-report-ui#701](https://github.com/bitfinexcom/bfx-report-ui/pull/701)
- Prevented showing error modal dialog due to `inet` issue. When the sync starts we send a ping request to `BFX API` to check that API is available. The idea is to not show error modal dialog for issues, just show error toast via UI when fetching the corresponding error with progress event via WS. PR: [bfx-report-electron#252](https://github.com/bitfinexcom/bfx-report-electron/pull/252)
- Reworked and enhanced `Columns` filter to display the actual selected filters quantity for better clearance to the users. Reworked refresh button representation according to the design updates. PR: [bfx-report-ui#697](https://github.com/bitfinexcom/bfx-report-ui/pull/697)
- Improved user notification when data should be synced. Implemented synchronization auto-initiation if not syncing at the moment. PR: [bfx-report-ui#700](https://github.com/bitfinexcom/bfx-report-ui/pull/700)
- Updated translations for UI. PR: [bfx-report-ui#704](https://github.com/bitfinexcom/bfx-report-ui/pull/704)

### Fixed
- Bumped `better-sqlite3` driver up to `8.6.0` to have this fix: `random "database is locked" timeouts` [better-sqlite3#597](https://github.com/WiseLibs/better-sqlite3/issues/597). And also to have the ability to launch the db driver on `Nodejs` `v18` under Electron env. PR: [bfx-facs-db-better-sqlite#6](https://github.com/bitfinexcom/bfx-facs-db-better-sqlite/pull/6)
- Fixed the `always-on-top` state for the `loading` window. Commit: [bfx-report-electron#251/commit#be0af27](https://github.com/bitfinexcom/bfx-report-electron/pull/251/commits/be0af278d0145558706230e2d688dbe682903f2d)

## [4.10.0] - 2023-08-23

### Added

- Added currency lists for platform consistency. PRs: [bfx-report#323](https://github.com/bitfinexcom/bfx-report/pull/323), [bfx-reports-framework#310](https://github.com/bitfinexcom/bfx-reports-framework/pull/310), [bfx-report-ui#688](https://github.com/bitfinexcom/bfx-report-ui/pull/688)
- Added support to DB migration for `temp` tables, `temp` tables will be removed for the non-completed sync if DB schema is changed. PR: [bfx-reports-framework#311](https://github.com/bitfinexcom/bfx-reports-framework/pull/311)
- Added ability to overwrite `RPC` timeout to have `httpRpcTimeout` and `wsRpcTimeout` options that can be overwritten in the electron environment to `10mins` for complicated reports which can have a lot of internal calls to the `BFX API` that can take significant time. It fixed the following issues: [bfx-report-electron#238](https://github.com/bitfinexcom/bfx-report-electron/issues/238), [bfx-report-electron#240](https://github.com/bitfinexcom/bfx-report-electron/issues/240), [bfx-report-electron#241](https://github.com/bitfinexcom/bfx-report-electron/issues/241). PRs: [bfx-report-express#31](https://github.com/bitfinexcom/bfx-report-express/pull/31), [bfx-report-electron#242](https://github.com/bitfinexcom/bfx-report-electron/pull/242)
- Implemented colored displaying on mobiles `amounts`, `volumes`, etc, the same way as on the desktop for better readability. PR: [bfx-report-ui#691](https://github.com/bitfinexcom/bfx-report-ui/pull/691)

### Changed

- Improved tables representation according to the latest design updates. PR: [bfx-report-ui#682](https://github.com/bitfinexcom/bfx-report-ui/pull/682)
- Enhanced `Reports` filter panels representation. PR: [bfx-report-ui#693](https://github.com/bitfinexcom/bfx-report-ui/pull/693)

### Fixed

- Fixed the error message of the `json rpc` response. The idea is to have extra data in case we catch an error from `BFX API` side and on the UI use a transparent error message which can contain `BFX API` error reasons. PRs: [bfx-report#327](https://github.com/bitfinexcom/bfx-report/pull/327), [bfx-report-ui#692](https://github.com/bitfinexcom/bfx-report-ui/pull/692)
- Fixed notifications positioning on page scrolling: When setting Table Scroll is turned off, the results of using `Sum` can appear below or above the part of the table that's currently visible. Fixed to be anchored to a specific part of the currently visible screen rather than a specific point in the table. PR: [bfx-report-ui#686](https://github.com/bitfinexcom/bfx-report-ui/pull/686)
- Fixed redundant `getUsers` calls for the hosted version. PR: [bfx-report-ui#689](https://github.com/bitfinexcom/bfx-report-ui/pull/689)
- Fixed issue with crashing `Change Logs` report when users remove the `2FA` option from their account. PR: [bfx-report-ui#690](https://github.com/bitfinexcom/bfx-report-ui/pull/690)

## [4.9.3] - 2023-08-09

### Fixed

- Fixed `start` timestamp of `BFX API` queries to be at least `Date.UTC(2013)` = `1356998400000` ms. The issue is the following: some restrictions of the `BFX API` are changed for the `Funding Credits History`, if we set `start: 0` throws `Internal Server Error` from the `API` side. It's an issue for the `sync` mode (as we start syncing with `0`) and setting the default value for requests. PRs: [bfx-report#324](https://github.com/bitfinexcom/bfx-report/pull/324), [bfx-reports-framework#307](https://github.com/bitfinexcom/bfx-reports-framework/pull/307)

## [4.9.2] - 2023-08-02

### Changed

- Removed the `Cumulative Weighted Price` column and corresponding logic from the `Weighted Averages` report according to the latest requirements. Added `Cost` and `Sale` columns to the `Weighted Averages` report. PRs: [bfx-report#319](https://github.com/bitfinexcom/bfx-report/pull/319), [bfx-reports-framework#302](https://github.com/bitfinexcom/bfx-reports-framework/pull/302), [bfx-report-ui#681](https://github.com/bitfinexcom/bfx-report-ui/pull/681)
- Improved sync time estimation flow as follows: in addition to existing emitting `WS` events when the next collection is syncing to not hold the previous time value (some collections can sync very long) adds an ability to emit the `progress` event every `1sec` with new values `spentTime` and `leftTime` for better UX (so that the user does not think that sync has stalled). PR: [bfx-reports-framework#303](https://github.com/bitfinexcom/bfx-reports-framework/pull/303)
- Changed `Rate Limits` for public endpoints: `trades` to 15 req/min, `candles` to 60 req/min. PR: [bfx-reports-framework#304](https://github.com/bitfinexcom/bfx-reports-framework/pull/304)

### Fixed

- Fixed issues with the incorrect synchronization estimation time conversion and representation. PR: [bfx-report-ui#680](https://github.com/bitfinexcom/bfx-report-ui/pull/680)
- Fixed handling bfx api `ERR_AUTH_API: ERR_INVALID_CREDENTIALS` error to prevent showing `500 Internal Server Error` and error modal dialog in the electron app. PR: [bfx-report#318](https://github.com/bitfinexcom/bfx-report/pull/318)
- Fixed the issue [#215](https://github.com/bitfinexcom/bfx-report-electron/issues/215) related to `MaxListenersExceededWarning` warning for the electron windows. PR: [bfx-report-electron#229](https://github.com/bitfinexcom/bfx-report-electron/pull/229)

## [4.9.1] - 2023-07-12

### Added

- Added `last/first` trades timestamps into the `Weighted Averages` report for the framework mode. PRs: [bfx-report#315](https://github.com/bitfinexcom/bfx-report/pull/315), [bfx-reports-framework#299](https://github.com/bitfinexcom/bfx-reports-framework/pull/299)

### Fixed

- Added `Rate Limit` router to control `BFX API` requests bandwidth to resolve the long timeout issue and help users to go through the data sync. Bumped API call timeout to `90s`. Reduced redundant `positionsAudit` calls to facilitate sync. Fixed stuck event loop to fix `WS` timeout on big data. PRs: [bfx-report#314](https://github.com/bitfinexcom/bfx-report/pull/314), [bfx-reports-framework#298](https://github.com/bitfinexcom/bfx-reports-framework/pull/298)

## [4.9.0] - 2023-07-05

### Added

- Added ability to fetch `Weighted Averages` data from the `BFX API` using `v2/auth/r/trades/calc` endpoint for hosted version. PRs: [bfx-report#306](https://github.com/bitfinexcom/bfx-report/pull/306), [bfx-report#307](https://github.com/bitfinexcom/bfx-report/pull/307), [bfx-report#310](https://github.com/bitfinexcom/bfx-report/pull/310), [bfx-report#311](https://github.com/bitfinexcom/bfx-report/pull/311), [bfx-reports-framework#292](https://github.com/bitfinexcom/bfx-reports-framework/pull/292)

### Changed

- Reworked navigation for the `Ledgers`, `Trades`, `Orders` and `Positions` reports as separate sub-sections in the `My History` menu instead of tabs in the `Ledgers & Trading` sub-section. PR: [bfx-report-ui#673](https://github.com/bitfinexcom/bfx-report-ui/pull/673)
- Reworked `Weighted Averages` report representation. PRs: [bfx-report-ui#674](https://github.com/bitfinexcom/bfx-report-ui/pull/674), [bfx-report-ui#677](https://github.com/bitfinexcom/bfx-report-ui/pull/677), [bfx-report-ui#678](https://github.com/bitfinexcom/bfx-report-ui/pull/678)

### Fixed

- Fixed the issue with the active state losing in the `Wallets` section when switching to the `Movements` tab. PR: [bfx-report-ui#669](https://github.com/bitfinexcom/bfx-report-ui/pull/669)
- Fixed issues with the incorrect accounts registration type detection. PR: [bfx-report-ui#670](https://github.com/bitfinexcom/bfx-report-ui/pull/670)
- Fixed the `Export` option unavailability in the top navigation menu and showing `Start Sync` only in the `framework mode`. PR: [bfx-report-ui#672](https://github.com/bitfinexcom/bfx-report-ui/pull/672)

## [4.8.1] - 2023-06-22

### Fixed

- Fixed issue with passing symbol parameter for `Order Trades` due to the last major changes of the `BFX API` [library](https://github.com/bitfinexcom/bfx-api-node-rest/blob/master/lib/rest2.js#L918). PR: [bfx-report#303](https://github.com/bitfinexcom/bfx-report/pull/303)
- Reverted [(improvements) Reports tables representation](https://github.com/bitfinexcom/bfx-report-ui/pull/664) due to an issue with table scroll. PR: [bfx-report-ui#667](https://github.com/bitfinexcom/bfx-report-ui/pull/667)

## [4.8.0] - 2023-06-21

### Added

- Added currency movement info endpoint https://docs.bitfinex.com/reference/movement-info. Due to the changed signatures of the `bitfinex-api-node` library methods in the new major version, to add this endpoint, the way of passing parameters to all bfx api methods is also changed/refactored. PRs: [bfx-report#297](https://github.com/bitfinexcom/bfx-report/pull/297), [bfx-reports-framework#287](https://github.com/bitfinexcom/bfx-reports-framework/pull/287)
- Added ability to return the `timestamp` when the last sync was launched to add this info to the layouts of the new design. PR: [bfx-reports-framework#289](https://github.com/bitfinexcom/bfx-reports-framework/pull/289)
- Added the possibility of removing registered accounts from the main `Sign In` screen. PR: [bfx-report-ui#662](https://github.com/bitfinexcom/bfx-report-ui/pull/662)
- Added the possibility of creating/updating sub-accounts for password protected users. PR: [bfx-report-ui#663](https://github.com/bitfinexcom/bfx-report-ui/pull/663)

### Changed

- Prevented proxying all `HTML` of the `BFX API` error. PR: [bfx-report#299](https://github.com/bitfinexcom/bfx-report/pull/299)
- Enhanced `Reports` tables representation according to the latest design updates. PR: [bfx-report-ui#664](https://github.com/bitfinexcom/bfx-report-ui/pull/664)

### Fixed

- Fixed `BFX API` error handling due to the last major changes of the rest-api lib: https://github.com/bitfinexcom/bfx-api-node-rest/blame/master/lib/rest2.js#LL157C14-L170C4. PRs: [bfx-report#298](https://github.com/bitfinexcom/bfx-report/pull/298), [bfx-report#300](https://github.com/bitfinexcom/bfx-report/pull/300)
- Fixed `sub-account` updating for password-protected account, it's necessary to pass the password to the master account if it's passed in the request. PR: [bfx-reports-framework#288](https://github.com/bitfinexcom/bfx-reports-framework/pull/288)

## [4.7.1] - 2023-06-07

### Added

- Added a note to the electron app that `BFX API Staging` is used. PR: [bfx-report-electron#207](https://github.com/bitfinexcom/bfx-report-electron/pull/207)
- Added app download section available for the web users and corresponding logic where they can get the latest `Reports App` version for their OS. PR: [bfx-report-ui#657](https://github.com/bitfinexcom/bfx-report-ui/pull/657)
- Implemented displaying accounts group name (if available) for multiple accounts instead of the primary account email on the main `Sign In` screen for better clearance to the users. Implemented the possibility of changing existing accounts groups names for multiple accounts. PR: [bfx-report-ui#659](https://github.com/bitfinexcom/bfx-report-ui/pull/659)

### Changed

- Increased `getAccountSummary` request timeout to `30s`, the rest requests will use `20s` timeout for the `bfx-api-node-rest` lib. PR: [bfx-report#293](https://github.com/bitfinexcom/bfx-report/pull/293)
- Added `3` retries instead of `2` when catching `Rate Limit` error to help users to go through sync in the electron app. PR: [bfx-report#294](https://github.com/bitfinexcom/bfx-report/pull/294)
- Implemented navigation via tabs between `Balances` and `Movements` reports in the `Wallets` sub-section. Expanded `My Account` and `My History` sections by default for better UX. Actualized several sub-sections naming. PR: [bfx-report-ui#658](https://github.com/bitfinexcom/bfx-report-ui/pull/658)

### Fixed

- Fixed issue with reloading UI page via the menu bar options. In the electron env need to `trigger-electron-load` event after running `Force Reload` and `Reload` menu commands with express api port. PR: [bfx-report-electron#206](https://github.com/bitfinexcom/bfx-report-electron/pull/206)

## [4.7.0] - 2023-05-24

### Added

- Added the `localUsername` field to the `getUsers` method response to be able to modify the local username on sign-in for sub-accounts. PR: [bfx-reports-framework#281](https://github.com/bitfinexcom/bfx-reports-framework/pull/281)
- Added the possibility of optional naming for multiple accounts during creating or updating, implemented displaying optional `localUsername` (if available) instead of the account email. PR: [bfx-report-ui#650](https://github.com/bitfinexcom/bfx-report-ui/pull/650)

### Changed

- Prevented selected dates range preserving by default between login sessions, the default range `Last 2 Weeks` will be set from the start until the `Preserve Timeframe` option won't be turned on in the `Preferences` menu. PR: [bfx-report-ui#651](https://github.com/bitfinexcom/bfx-report-ui/pull/651)
- Reworked and improved the `Manage Accounts` section according to the latest design updates to enhance users experience. Implemented the possibility of picking the `Use API key` option in the registered accounts selector and adding a sub-account via API key/secret in this case. Prefills the optional group name field with the master account name by default. Actualizes related elements styling and fields descriptions. Improves sub-accounts section scroll representation. PR: [bfx-report-ui#652](https://github.com/bitfinexcom/bfx-report-ui/pull/652)
- Improved `Weighted Averages` web version limit note representation according to the latest design updates. PR: [bfx-report-ui#654](https://github.com/bitfinexcom/bfx-report-ui/pull/654)

### Fixed

- Fixed issues with auth token invalidate intervals. The issue is at this moment UI flow intends to remove `sub-account` without login using `email`, it means we have to handle the absence of a user session on deletion. PR: [bfx-reports-framework#282](https://github.com/bitfinexcom/bfx-reports-framework/pull/282)
- Fixed columns filter elements overflowing issues. PR: [bfx-report-ui#649](https://github.com/bitfinexcom/bfx-report-ui/pull/649)
- Fixed the issue with the `Password` input availability on the main registered users list screen in some specific cases. PR: [bfx-report-ui#653](https://github.com/bitfinexcom/bfx-report-ui/pull/653)

## [4.6.0] - 2023-05-10

### Added

- Added `symbol` field to the `currencies` model in order to have the same payload as from the `bfx-report`. PR: [bfx-reports-framework#278](https://github.com/bitfinexcom/bfx-reports-framework/pull/278)

### Changed

- Bumped ElectronJS version up to `v21.3.3` to have NodeJS `v16` under the hood to resolve the ability to build UI and ElectronJS releases using the same NodeJS version. PRs: [bfx-report-electron#201](https://github.com/bitfinexcom/bfx-report-electron/pull/201), [bfx-report-ui#640](https://github.com/bitfinexcom/bfx-report-ui/pull/640), [bfx-facs-db-better-sqlite#5](https://github.com/bitfinexcom/bfx-facs-db-better-sqlite/pull/5)
- Resolved deprecation warning `fs.rmdir` for the `bfx-reports-framework` due to migration NodeJS to `v16`. PR: [bfx-reports-framework#276](https://github.com/bitfinexcom/bfx-reports-framework/pull/276)
- Improved selected dates range representation for better clearance to the users. PR: [bfx-report-ui#643](https://github.com/bitfinexcom/bfx-report-ui/pull/643)
- Reworked and improved `Sign In` and `Add Accounts` sections according to the latest design updates to enhance users experienc. Reworked and unifies several related sub-sections for better composition and reusability. Implemented new flow for adding `sub-accounts` to the users registered via `API keys`. Actualizes related elements styling and fields descriptions. PR: [bfx-report-ui#644](https://github.com/bitfinexcom/bfx-report-ui/pull/644)
- Updated `pt-BR`, `ru` and `tr` translations for the UI. PR: [bfx-report-ui#646](https://github.com/bitfinexcom/bfx-report-ui/pull/646)

### Fixed

- Fixed `Test` pairs/symbols handling to prevent pairs duplication/overlapping and fixed incorrect request symbol params providing in some cases. PR: [bfx-report-ui#641](https://github.com/bitfinexcom/bfx-report-ui/pull/641)
- Fixed a display issue on `Test` pairs/symbols in production. PR: [bfx-report-ui#642](https://github.com/bitfinexcom/bfx-report-ui/pull/642)

## [4.5.2] - 2023-04-28

### Fixed

- Fixed the `auto-update` issue to turn on by default. The issue is in the parsing of the environment variable `IS_AUTO_UPDATE_DISABLED` from string to boolean. PR: [bfx-report-electron#198](https://github.com/bitfinexcom/bfx-report-electron/pull/198)

## [4.5.1] - 2023-04-26

### Added

- Added ability to name multiple accounts on sign-up to the backend. For example, if a user has some sub-accounts where run `Bitcoin` strategies, the user can call them `The BTC` group. For older created accounts, it will not be there. PR: [bfx-reports-framework#271](https://github.com/bitfinexcom/bfx-reports-framework/pull/271)
- Added a dedicated flag to recognize an account registering type: via API keys or without for the UI porpuses to cover new user login flow. PR: [bfx-reports-framework#273](https://github.com/bitfinexcom/bfx-reports-framework/pull/273)

### Changed

- Reworked and improved `Add Account` authorization section according to the latest design updates to enhance users experience. Made `Remember Me` feature always active and removes unused corresponding checkboxes from all auth sections. Reworked and unifies several related sub-sections for better composition and reusability. Actualizes elements styling and fields descriptions. PR: [bfx-report-ui#635](https://github.com/bitfinexcom/bfx-report-ui/pull/635)
- Improved `Forgot Password` authorization section according to the latest design updates to enhance users experience. Reworked and unified several related sub-sections for better composition and reusability. Actualized elements styling and descriptions. Added `Bitfinex` logo. PR: [bfx-report-ui#637](https://github.com/bitfinexcom/bfx-report-ui/pull/637)

### Fixed

- Fixed `emitBfxUnamePwdAuthRequired` WebSocket event handling on which the user should be logged out and re-login via `username/password` and `Two-Factor Authentication` to receive a new auth token. PR: [bfx-report-ui#634](https://github.com/bitfinexcom/bfx-report-ui/pull/634)
- Fixed issues with the availability to the selection of restricted users with `isRestrictedToBeAddedToSubAccount` flag for `Multiple Accounts` in some specific cases. PR: [bfx-report-ui#636](https://github.com/bitfinexcom/bfx-report-ui/pull/636)

## [4.5.0] - 2023-04-12

### Added

- Added the `Weighted Averages` report to the web version. The main part of logic moved to the `bfx-report` and the behavior is the same as in the previous PR [bfx-reports-framework#246](https://github.com/bitfinexcom/bfx-reports-framework/pull/246). PRs: [bfx-report#289](https://github.com/bitfinexcom/bfx-report/pull/289), [bfx-reports-framework#266](https://github.com/bitfinexcom/bfx-reports-framework/pull/266), [bfx-report-ui#631](https://github.com/bitfinexcom/bfx-report-ui/pull/631)
- Added ability to set the selected `TTL` of the BFX auth token to the backend side. PR: [bfx-reports-framework#268](https://github.com/bitfinexcom/bfx-reports-framework/pull/268)
- Implemented logic for injection and usage of customizable ports for `API_URL` and `WS_ADDRESS` if available on `electronLoad` custom event in the framework mode, it's related to these previous changes: [bfx-report-electron#187](https://github.com/bitfinexcom/bfx-report-electron/pull/187), [bfx-report-ui#619](https://github.com/bitfinexcom/bfx-report-ui/pull/619). PR: [bfx-report-ui#630](https://github.com/bitfinexcom/bfx-report-ui/pull/630)

### Changed

- Added the `temporarily_unavailable` BFX error handler, it's related to issues when the main platform is under maintenance. Instead showing an error modal dialog under the electron app would show the network issue message. And also it added some retries for fetching data as it was done earlier for the common `isENetError` checker. PR: [bfx-report#290](https://github.com/bitfinexcom/bfx-report/pull/290)

### Fixed

- Disallowed user removal when sync going to prevent unexpected behavior. PR: [bfx-reports-framework#267](https://github.com/bitfinexcom/bfx-reports-framework/pull/267)
- Fixed issues with incorrect pairs formatting and providing a `symbol` param for the `getPublicTrades` request in some cases. Adjusted `Symbol Filter` width to fit better for all available pairs. PR: [bfx-report-ui#626](https://github.com/bitfinexcom/bfx-report-ui/pull/626)
- Fixed issues with incorrect `TEST` symbols/pairs mapping. Fixed selector width to fit better for all available pairs. PR: [bfx-report-ui#628](https://github.com/bitfinexcom/bfx-report-ui/pull/628)

## [4.4.0] - 2023-03-29

### Added

- Implemented `username/password` auth support with `Two-Factor Authentication` for simple users in a framework mode and corresponding logic to handle various `Reports` authorization flow-related specifics. Improved `Reports` login modal styling according to the actual theme. PR: [bfx-report-ui#622](https://github.com/bitfinexcom/bfx-report-ui/pull/622)
- Added ability to auto-start sync after the auto-update of the electron app. The idea is to have a configurable option (by default turned on) to force sync after the auto-update or DB migration due to changes in the DB schema, the aim is to bring data consistency after significant updates. PRs: [bfx-report-electron#190](https://github.com/bitfinexcom/bfx-report-electron/pull/190), [bfx-reports-framework#261](https://github.com/bitfinexcom/bfx-reports-framework/pull/261)
- Added `isAuthTokenGenerationError: true` flag into the `Unauthorized 401` response in cases when token is expired for better UX of 2FA. PRs: [bfx-report#285](https://github.com/bitfinexcom/bfx-report/pull/285), [bfx-reports-framework#262](https://github.com/bitfinexcom/bfx-reports-framework/pull/262)
- Added `login/verify` proxy endpoints to resolve the `CORS` issue for the BFX `username/password` auth for `/v2/login` and `/v2/login/verify` links. PRs: [bfx-reports-framework#263](https://github.com/bitfinexcom/bfx-reports-framework/pull/263), [bfx-report#286](https://github.com/bitfinexcom/bfx-report/pull/286)

### Changed

- Changed the `Sign Up` section title and button to `Add Account` for better clearance to the users of how auth flow works in the `Reports` app. Hid the `Remove Account` button in the `Preferences` menu during syncing to avoid causing related errors. Prevented the `Remember Me` from being prefilled by default. Updated passwords titles. PR: [bfx-report-ui#623](https://github.com/bitfinexcom/bfx-report-ui/pull/623)
- Fixed the `getUsers` endpoint response, `isRestrictedToBeAddedToSubAccount` flag doesn't show the correct state, it should be `true` in a case when the user signed in with the BFX auth token (using BFX username/password). PR: [bfx-reports-framework#260](https://github.com/bitfinexcom/bfx-reports-framework/pull/260)

## [4.3.1] - 2023-03-15

### Changed

- Improved the lookup of the free ports for the backend side of the app and fixes the issue: [#171](https://github.com/bitfinexcom/bfx-report-electron/issues/171). PRs: [bfx-report-electron#187](https://github.com/bitfinexcom/bfx-report-electron/pull/187), [bfx-report-ui#619](https://github.com/bitfinexcom/bfx-report-ui/pull/619)
- Reworked `getUsers` call without auth params that are redundant for this public endpoint. PR: [bfx-report-ui#618](https://github.com/bitfinexcom/bfx-report-ui/pull/618)

### Fixed

- Fixed issues with some symbols representation in the `Symbol Filter` dropdown list. PR: [bfx-report-ui#617](https://github.com/bitfinexcom/bfx-report-ui/pull/617)

## [4.3.0] - 2023-03-01

### Added

- Added `BFX` auth token support to the backend of the framework mode. PRs: [bfx-report#281](https://github.com/bitfinexcom/bfx-report/pull/281), [bfx-reports-framework#256](https://github.com/bitfinexcom/bfx-reports-framework/pull/256)
- Added ability to send `emitCsvGenerationCompletedToOne` event by the WS when CSV reports generation is finished in the background queue, only for the framework mode. In the UI we will show a spinner on the export btn and the corresponding popup at an appropriate time after finishing generation (in some cases it can take a lot of time). PRs: [bfx-report#282](https://github.com/bitfinexcom/bfx-report/pull/282), [bfx-reports-framework#257](https://github.com/bitfinexcom/bfx-reports-framework/pull/257)

### Changed

- Restructures `Reports` main navigation using navigation `item -> sub item -> tabs` approach. Reworks and unifies sub-sections switching flow for better reusability across various reports and cleans redundant duplicated logic. Moves `Logins History`, `Sub Accounts` and `Change Logs` reports to the account dropdown menu. PR: [bfx-report-ui#612](https://github.com/bitfinexcom/bfx-report-ui/pull/612)
- Reworks mobile navigation as a drawer according to the latest design updates. Implements dynamic chevrons for the navigation menus collapsible sections. Removes duplicated time frame selector from the header. Minor fixes and redundant code cleanup. PR: [bfx-report-ui#613](https://github.com/bitfinexcom/bfx-report-ui/pull/613)
- Reworks the main layout as cards according to the latest design updates. Actualizes navigation menu collapsible sections icons. Updates colors and various styling improvements. PR: [bfx-report-ui#614](https://github.com/bitfinexcom/bfx-report-ui/pull/614)

## [4.2.0] - 2023-02-01

### Added

- Added the [weighted averages report](https://www.investopedia.com/terms/w/weightedaverage.asp) representation and corresponding functionalities. PR: [bfx-report-ui#607](https://github.com/bitfinexcom/bfx-report-ui/pull/607)
- Added the ability to make releases using `GitHub Actions` against the `BFX API Staging` manually. PR: [bfx-report-electron#179](https://github.com/bitfinexcom/bfx-report-electron/pull/179)

### Fixed

- Fixed sync progress percentage calculation. PR: [bfx-reports-framework#250](https://github.com/bitfinexcom/bfx-reports-framework/pull/250)
- Fixed handling some `null` responses from the `Account Summary` endpoint. PR: [bfx-reports-framework#251](https://github.com/bitfinexcom/bfx-reports-framework/pull/251)
- Fixed navigation menu representation on some mobile screens. PR: [bfx-report-ui#606](https://github.com/bitfinexcom/bfx-report-ui/pull/606)
- Fixed issue with dropping selected pairs on `Derivatives` refreshing. PR: [bfx-report-ui#608](https://github.com/bitfinexcom/bfx-report-ui/pull/608)

## [4.1.0] - 2023-01-18

### Added

- Added the possibility of removing the account from the `Preferences` menu. PR: [bfx-report-ui#600](https://github.com/bitfinexcom/bfx-report-ui/pull/600)
- Added estimated time info of the synchronization process. PRs: [bfx-reports-framework#245](https://github.com/bitfinexcom/bfx-reports-framework/pull/245), [bfx-report-ui#601](https://github.com/bitfinexcom/bfx-report-ui/pull/601)
- Added the possibility for users to sign out by email property. PR: [bfx-reports-framework#247](https://github.com/bitfinexcom/bfx-reports-framework/pull/247)
- Added the [weighted averages report](https://www.investopedia.com/terms/w/weightedaverage.asp) to the backend side. PR: [bfx-reports-framework#246](https://github.com/bitfinexcom/bfx-reports-framework/pull/246)

### Fixed

- Fixed error handling, added an option to not throw `ENET` error in the case when there are going to make retries to resume the internet connection. API requests should not be logged to `std error` stream when making an internal call and can have some attempts due to an internet connection issue. It's important for sync to avoid showing redundant error modal dialogs in the electron app. PR: [bfx-report#278](https://github.com/bitfinexcom/bfx-report/pull/278)

## [4.0.0] - 2022-12-09

### Added

- Added `ENET` errors for reconnection when fetching data from the `BFX api_v2`. PR: [bfx-report#273](https://github.com/bitfinexcom/bfx-report/pull/273)
- Added ability to use the `inner max` request limit to the `BFX api_v2` to seed up syncing data. PR: [bfx-report#274](https://github.com/bitfinexcom/bfx-report/pull/274)
- Added ability to display minimum derivative fees between sub-accounts. PR: [bfx-reports-framework#241](https://github.com/bitfinexcom/bfx-reports-framework/pull/241)
- Added ability to turn off the auto-update while building releases using the env var `IS_AUTO_UPDATE_DISABLED=1` or the popup of GitHub Actions for `beta` releases [bfx-report-electron#170](https://github.com/bitfinexcom/bfx-report-electron/pull/170)
- Added reports for Turkey. PR: [bfx-report-ui#561](https://github.com/bitfinexcom/bfx-report-ui/pull/561)
- Implemented selected auth type persisting if the `Remember Me` option is selected for improving UX during page/app reloading. PR: [bfx-report-ui#568](https://github.com/bitfinexcom/bfx-report-ui/pull/568)
- Implemented sub-accounts handling progress indicator, to improve UX for the cases when creation/updating requests can take some time due to slow network connection, etc. PR: [bfx-report-ui#573](https://github.com/bitfinexcom/bfx-report-ui/pull/573)

### Changed

- Provided a `new Sync Core` to use temp tables during sync processing. PR: [bfx-reports-framework#240](https://github.com/bitfinexcom/bfx-reports-framework/pull/240). The main idea is to put data fetched from the BFX api_v2 to temp tables to have consistent data in the main tables and allow users to request reports from all sections any time even sync is going on, except the first sync when the DB is empty. When the sync is finished and temp tables are filled all data will be moved to the main tables in one atomic transaction thus users don't have to experience transitional processes. Basic changes:
  - Implemened `new Sync Core` to use temp tables
  - Improved transaction flow to fix the `database is locked` issue
  - Improved handling `ENET` errors from the `BFX api_v2`, added fetching data retries. Related to PR: [bfx-report#275](https://github.com/bitfinexcom/bfx-report/pull/275)
  - Added DB migration `v31`
  - Added create and update timestamps to service tables for easier debugging
  - Significantly reduced the number of requests to the `BFX api_v2`, which increases the speed of the sync
  - Fixed WebSocket timeout connection issue
  - Reduced pragma `analysis_limit` to `400` for performance
  - Used `inner max` request limit to `BFX api_v2` for syncing data to speed up
- Actualized Spanish translations PR: [bfx-report-ui#562](https://github.com/bitfinexcom/bfx-report-ui/pull/562)
- Improved invoices for not merchant users. PR: [bfx-report-ui#565](https://github.com/bitfinexcom/bfx-report-ui/pull/565)
- Increased `Fee Perc` precision in the `Trades` report to 3 decimals for better representation. PR: [bfx-report-ui#570](https://github.com/bitfinexcom/bfx-report-ui/pull/570)

### Fixed

- Fixed WebSocket `GRENACHE_WS_IS_CLOCED` error. PR: [bfx-reports-framework#239](https://github.com/bitfinexcom/bfx-reports-framework/pull/239)
- Fixed `URL` to get API keys when sign-in. PRs: [bfx-report-electron#172](https://github.com/bitfinexcom/bfx-report-electron/pull/172), [bfx-report-ui#582](https://github.com/bitfinexcom/bfx-report-ui/pull/582)
- Fixed incorrect `rate` filter param type and value passing from `Public Funding` report. PR: [bfx-report-ui#553](https://github.com/bitfinexcom/bfx-report-ui/pull/553)
- Fixed reports exporting. PR: [bfx-report-ui#558](https://github.com/bitfinexcom/bfx-report-ui/pull/558)
- Fixed wrong auth via WebSockets for `sub-accounts`. PR: [bfx-report-ui#566](https://github.com/bitfinexcom/bfx-report-ui/pull/566)
- Prevented redirection to the `Sign In` screen after the successful adding a sub-account for improving UX if the user wants to add several sub-accounts in a row. PR: [bfx-report-ui#571](https://github.com/bitfinexcom/bfx-report-ui/pull/571)
- Fixed the possibility of creating several sub-accounts with one request in the `Multiple Accounts` sign up modal same way as we have in the main `Sub Accounts` section. PR: [bfx-report-ui#572](https://github.com/bitfinexcom/bfx-report-ui/pull/572)
- Fixed missed time frame start/end params provided during exporting in CSV for `Average Win/Loss`, `Traded Volume`, `Account Balance`, `Loan` and `Fees` reports. PR: [bfx-report-ui#575](https://github.com/bitfinexcom/bfx-report-ui/pull/575)
- Prevented the possibility for already created `sub-accounts` to being selected for the creation of new one. PR: [bfx-report-ui#576](https://github.com/bitfinexcom/bfx-report-ui/pull/576)
- Fixed issue with the staled `Master Account` still selected after the dropping database, restarting the backend and reloading the app. PR: [bfx-report-ui#577](https://github.com/bitfinexcom/bfx-report-ui/pull/577)
- Prevented the possibility of `Sub Account` creation submission if the `Master Account` hadn't been selected or registered, fixed `Sign Up` modal overlay styling. PR: [bfx-report-ui#578](https://github.com/bitfinexcom/bfx-report-ui/pull/578)
- Fixed issue with stuck sync progress percentage when the main worker is restarted while the synchronization is in progress and UI performs a successful reconnection via WebSockets. PR: [bfx-report-ui#579](https://github.com/bitfinexcom/bfx-report-ui/pull/579)
- Fixed `USDt` symbols and pairs parsing. PR: [bfx-report-ui#580](https://github.com/bitfinexcom/bfx-report-ui/pull/580)
- Fixed `sign-out` issue by providing token. PR: [bfx-report-ui#583](https://github.com/bitfinexcom/bfx-report-ui/pull/583)
- Fixed issues with unavailability for selection registered users while creating `Sub Accounts` in some cases. PR: [bfx-report-ui#584](https://github.com/bitfinexcom/bfx-report-ui/pull/584)

### Security

- Updated dependencies versions to fix vulnerabilities. PRs: [bfx-facs-db-better-sqlite#4](https://github.com/bitfinexcom/bfx-facs-db-better-sqlite/pull/4), [bfx-report-express#28](https://github.com/bitfinexcom/bfx-report-express/pull/28), [bfx-report#276](https://github.com/bitfinexcom/bfx-report/pull/276), [bfx-reports-framework#242](https://github.com/bitfinexcom/bfx-reports-framework/pull/242)

## [3.8.1] - 2022-09-29

### Changed

- Enhanced the fees report for the UI. Changed the `Report Type` selector to have `Trading fees` (by default) and `Funding fees` and `Funding + Trading fees` options. Added `cumulative` result to the chart as on `Loan Report`, PR: [bfx-report-ui#549](https://github.com/bitfinexcom/bfx-report-ui/pull/549). Removed deprecated fees report methods form the backend, PR: [bfx-reports-framework#237](https://github.com/bitfinexcom/bfx-reports-framework/pull/237)

## [3.8.0] - 2022-09-20

### Added

- Added a zipped `AppImage` release of the app to the electron build flow as a simple way to avoid users adding executable permission manually after downloading binary artifact. Also, leaves unzipped `AppImage` release for auto-update. PR: [bfx-report-electron#162](https://github.com/bitfinexcom/bfx-report-electron/pull/162)
- Added `win/loss` vs `previous day balance` results. PR: [bfx-reports-framework#233](https://github.com/bitfinexcom/bfx-reports-framework/pull/233)
- Added one more option to `Select Report Type` selection of the`win/loss` chart: `Percentage Gains (gains/deposits)` and `Percentage Gains (gains/balance)` options. PR: [bfx-report-ui#545](https://github.com/bitfinexcom/bfx-report-ui/pull/545)
- Added `Sum` option to the columns context menu and related logic to show a quick total for numeric values. PR: [bfx-report-ui#538](https://github.com/bitfinexcom/bfx-report-ui/pull/538)
- Implemented copying columns sum up values to the clipboard along with displaying the result. Allowed quick total displaying if sum up value equals 0. PR: [bfx-report-ui#540](https://github.com/bitfinexcom/bfx-report-ui/pull/540)
- Implemented dynamic payload fetching on `Candles` chart scrolling for better representation and UX improvement. PR: [bfx-report-ui#547](https://github.com/bitfinexcom/bfx-report-ui/pull/547)

### Changed

- Enhanced the fees report. Added an additional selector with `Trading fees` (by default) and `Funding fees` and `Funding + Trading fees` options. Added `cumulative` result to the chart as on `Loan Report`. PR: [bfx-reports-framework#234](https://github.com/bitfinexcom/bfx-reports-framework/pull/234)
- Improved properties validation in `Affiliates Earnings`, `Funding`, `Staking Payments` and `Ledgers` reports by defining types/defaults inside the related components for better linting. PR: [bfx-report-ui#541](https://github.com/bitfinexcom/bfx-report-ui/pull/541)
- Improved candles fetching logic to speed up `Go to` specific date feature for `Candles` chart in the `Trades` report. PR: [bfx-report-ui#542](https://github.com/bitfinexcom/bfx-report-ui/pull/542)
- Improved properties validation in `Account Balance`, `Candles`, `Derivatives`, `Candlestick`, and several `Auth` sub-components. PR: [bfx-report-ui#544](https://github.com/bitfinexcom/bfx-report-ui/pull/544)

### Fixed

- Fixed auto-update toast window styles. PR: [bfx-report-electron#161](https://github.com/bitfinexcom/bfx-report-electron/pull/161)
- Fixed `win/loss` vs `account balance` report, fixed percentage calculation for sub-account transfers and for all movements. PR: [bfx-reports-framework#233](https://github.com/bitfinexcom/bfx-reports-framework/pull/233)
- Fixed issues with selected `Unrealized Profits` and `Report Type` params dropping to defaults on `Average Win/Loss` report refresh. PR: [bfx-report-ui#545](https://github.com/bitfinexcom/bfx-report-ui/pull/545)
- Fixed `win/loss` vs `account balance` export to CSV. PR: [bfx-report-ui#546](https://github.com/bitfinexcom/bfx-report-ui/pull/546)

### Security

- Updated dependencies versions. PRs: [bfx-report-ui#539](https://github.com/bitfinexcom/bfx-report-ui/pull/539), [bfx-report-ui#543](https://github.com/bitfinexcom/bfx-report-ui/pull/543)

## [3.7.4] - 2022-08-10

### Added

- Added ability to persist columns adjustments. PR: [bfx-report-ui#530](https://github.com/bitfinexcom/bfx-report-ui/pull/530)
- Implemented selectable charts area and `Sum Up` range values feature for the `Traded Volume` and `Fees` reports. PR: [bfx-report-ui#535](https://github.com/bitfinexcom/bfx-report-ui/pull/535)
- Added `FUSE` technology description for `AppImage` into the documentation section
- Added notification sync is being paused until connection is resumed. PRs: [bfx-report#266](https://github.com/bitfinexcom/bfx-report/pull/266), [bfx-reports-framework#230](https://github.com/bitfinexcom/bfx-reports-framework/pull/230), [bfx-report-ui#537](https://github.com/bitfinexcom/bfx-report-ui/pull/537)

### Changed

- Rounded `Account Summary` displayed values for better representation [bfx-report-ui#534](https://github.com/bitfinexcom/bfx-report-ui/pull/534)
- Updated columns filter configuration to show trades `id` column by default in `Trades` report. PR: [bfx-report-ui#536](https://github.com/bitfinexcom/bfx-report-ui/pull/536)
- Allowed continuing work with the app when reporting errors. This request was got from issue: [#149](https://github.com/bitfinexcom/bfx-report-electron/issues/149)

### Fixed

- Added auth refreshing on re-login via `WebSockets` and fixed issues with broken `HTTP` requests due to the staled token from the previous authorization [bfx-report-ui#532](https://github.com/bitfinexcom/bfx-report-ui/pull/532)
- Fixed issue on `win/loss` results. PR: [bfx-reports-framework#228](https://github.com/bitfinexcom/bfx-reports-framework/pull/228)
- Prevented redundant force-syncing on startup when movements are empty. PR: [bfx-reports-framework#229](https://github.com/bitfinexcom/bfx-reports-framework/pull/229)
- Fixed layout styles of the modal dialogs
- Fixed error window width in order to not has the width as a display screen by default

### Security

- Updated dependencies versions. PRs: [bfx-report-ui#531](https://github.com/bitfinexcom/bfx-report-ui/pull/531), [bfx-report-ui#533](https://github.com/bitfinexcom/bfx-report-ui/pull/533)

## [3.7.3] - 2022-07-08

### Added

- Go to a specific date on the candles chart [bfx-report-ui#527](https://github.com/bitfinexcom/bfx-report-ui/pull/527)
- Add order metadata to csv [bfx-report#264](https://github.com/bitfinexcom/bfx-report/pull/264) and [bfx-report-framework#226](https://github.com/bitfinexcom/bfx-report-framework/pull/226)

### Changed

- Changes is calendar. Picked timezone its also used in the calendar [bfx-report-ui#529](https://github.com/bitfinexcom/bfx-report-ui/pull/529)
- Charts prices representation now has thousands separator [bfx-report-ui#523](https://github.com/bitfinexcom/bfx-report-ui/pull/523)
- Increase limit in candles sync for speed improment [bfx-report#262](https://github.com/bitfinexcom/bfx-report/pull/262) and [bfx-report-framework#224](https://github.com/bitfinexcom/bfx-report-framework/pull/224)


### Fixed

- UI dependencies verification [bfx-report-ui#526](https://github.com/bitfinexcom/bfx-report-ui/pull/526)
- Fixes removing and adding sub accounts [bfx-report-framework#225](https://github.com/bitfinexcom/bfx-report-framework/pull/225)
- Fixes sub-account recalculation [bfx-report-framework#223](https://github.com/bitfinexcom/bfx-report-framework/pull/223)

## [3.7.2] - 2022-06-01

### Added

- Adds Balance(USD) precision selector to the Wallets section. PR: [bfx-report-ui#522](https://github.com/bitfinexcom/bfx-report-ui/pull/522)

### Changed

- Adds logic for merging similar trades, with the same orderId and execPrice, to the one dot on the Candles chart for better representation and readability in the UI. PR: [bfx-report-ui#515](https://github.com/bitfinexcom/bfx-report-ui/pull/515)
- Removes Input Timezone picker from Preferences and related logic for setting and using manually selected timezone for inputs. PR: [bfx-report-ui#521](https://github.com/bitfinexcom/bfx-report-ui/pull/521)
- Adds sub accounts selection persistence in Multiple Accounts login mode in the UI. PR: [bfx-report-ui#518](https://github.com/bitfinexcom/bfx-report-ui/pull/518)

### Fixed

- Fixed issues related to database being locked in sqlite PR: [bfx-reports-framework#221](https://github.com/bitfinexcom/bfx-reports-framework/pull/221)
  - Related to issues: [#146](https://github.com/bitfinexcom/bfx-report-electron/issues/146), [#147](https://github.com/bitfinexcom/bfx-report-electron/issues/147)
- Fixes sync request fail during logout issue. PR: [bfx-report-ui#519](https://github.com/bitfinexcom/bfx-report-ui/pull/519)

## [3.7.1] - 2022-04-28

### Added

- Added option to quickly clear filters in the UI. PR: [bfx-report-ui#501](https://github.com/bitfinexcom/bfx-report-ui/pull/501)
- Added a link to affiliates dashboard on `Affiliates Earnings` page for better conversion and convenience in the UI. PR: [bfx-report-ui#512](https://github.com/bitfinexcom/bfx-report-ui/pull/512)

### Changed

- Bumped UI dependency to have the last fixes. PRs: [bfx-report-ui#500](https://github.com/bitfinexcom/bfx-report-ui/pull/500), [bfx-report-ui#502](https://github.com/bitfinexcom/bfx-report-ui/pull/502), [bfx-report-ui#503](https://github.com/bitfinexcom/bfx-report-ui/pull/503), [bfx-report-ui#504](https://github.com/bitfinexcom/bfx-report-ui/pull/504), [bfx-report-ui#505](https://github.com/bitfinexcom/bfx-report-ui/pull/505), [bfx-report-ui#507](https://github.com/bitfinexcom/bfx-report-ui/pull/507), [bfx-report-ui#508](https://github.com/bitfinexcom/bfx-report-ui/pull/508), [bfx-report-ui#509](https://github.com/bitfinexcom/bfx-report-ui/pull/509)
- Updated language options in the UI. PR: [bfx-report-ui#511](https://github.com/bitfinexcom/bfx-report-ui/pull/511)
- Implemented dynamic price precision showing for different trading pairs on `Candles` chart in the UI. PR: [bfx-report-ui#513](https://github.com/bitfinexcom/bfx-report-ui/pull/513)

### Fixed

- Fixed inconsistency in wallets and earnings. PR: [bfx-reports-framework#218](https://github.com/bitfinexcom/bfx-reports-framework/pull/218)
- Fixed symbol pair splitting to handle pairs with long characters like `tMATICM:USD` and `MATICMF0` etc. PR: [bfx-report#260](https://github.com/bitfinexcom/bfx-report/pull/260)
- Actualized i18next backend in the UI. PR: [bfx-report-ui#510](https://github.com/bitfinexcom/bfx-report-ui/pull/510)

## [3.7.0] - 2022-04-12

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

## [3.6.3] - 2022-01-12

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
