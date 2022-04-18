# User manual

The Bitfinex Report Tools allows traders to more conveniently track, manage and analyse trading/funding activity across their Bitfinex account. Built to be both faster and easier to use, traders can now instantly compile an overview of necessary account information. A highlight of this software is the fact that all data is synced locally, automatically. The sync experience has been developed in a manner which is as smooth and simple as possible, and which allows you to always remain up to date with account developments

## Report sections

The Tool provides the following main reports sections

<details>

<summary>Types of filters available</summary>

> The columns might be filtered, so as to have a smaller screen, thereby removing information that is not required for analysis
> Available the following types of filters:
> - for string:
>   - contains
>   - begins with
>   - ends with
>   - equal to
>   - not equal to
> - for number
>   - equal to
>   - not equal to
>   - greater than
>   - greater/equal
>   - less than
>   - less/equal
> - for date
>   - before
>   - equal to
>   - not equal to
> - for specific columns provides `equal to` and `not equal to` by selection list

</details>

<details>

<summary>Ledgers</summary>

> Shows your past ledger entries. Most recent entries are returned by default, but a timestamp can be used to retrieve time-specific data. Contain sections `Date Range Selection`, `Filters`, `Refresh Button`, `Table`, `Pagination`

</details>

<details>

<summary>Trades</summary>

> - Shows your trades. Your most recent trades will be retrieved by default, but a timestamp can be used to retrieve time-specific data. Contain sections `Date Range Selection`, `Filters`, `Refresh Button`, `Table`, `Pagination`
> - Shows candles, **displays your trades and trade information over** the market trading candles providing OCHL (Open, Close, High, Low) and volume data for the specified funding currency or trading pair. This section provides optional functionality to sync certain pairs and time period. Contain sections `Date Range Selection`, `Filters`, `Query Button`, `Refresh Button`, `Sync Preferences`, `Chart`

</details>

<details>

<summary>Orders</summary>

> Shows historic closed or cancelled orders. Contain sections `Date Range Selection`, `Filters`, `Refresh Button`, `Table`, `Pagination`

</details>

<details>

<summary>Movements</summary>

> Shows your past deposits/withdrawals. Currency can be specified to retrieve movements specific to that currency. Contain sections `Date Range Selection`, `Filters`, `Refresh Button`, `Table`, `Pagination`

</details>

<details>

<summary>Positions</summary>

> - Shows data on past positions. Timestamps can be used to retrieve results for a specific time period. Contain sections `Date Range Selection`, `Filters`, `Refresh Button`, `Table`, `Pagination`
> - Shows an audit of your positions by click on position ID. Contain sections `Date Range Selection`, `Refresh Button`, `Table`
> - Shows your active positions. Timestamps can be used to retrieve results for a specific time period. Contain sections `Date Range Selection`, `Filters`, `Refresh Button`, `Table`, `Pagination`

</details>

<details>

<summary>Wallets</summary>

> Shows account wallet balances. Contain sections `End Time Selection`, `Query Button`, `Refresh Button`, `Tables`

</details>

<details>

<summary>Funding Bids & Offers</summary>

> Shows past inactive funding offers. Contain sections `Date Range Selection`, `Filters`, `Refresh Button`, `Table`, `Pagination`

</details>

<details>

<summary>Funding Loans (Unused)</summary>

> Shows inactive funds not used in positions. Contain sections `Date Range Selection`, `Filters`, `Refresh Button`, `Table`, `Pagination`

</details>

<details>

<summary>Funding Credit (Used)</summary>

> Shows inactive funds used in positions. Contain sections `Date Range Selection`, `Filters`, `Refresh Button`, `Table`, `Pagination`

</details>

<details>

<summary>Funding Earnings</summary>

> Shows your past ledger entries for interest earnings. Most recent entries are returned by default, but a timestamp can be used to retrieve time-specific data. Contain sections `Date Range Selection`, `Filters`, `Refresh Button`, `Table`, `Pagination`

</details>

<details>

<summary>Staking Earnings</summary>

> Shows your past ledger entries for staking payment. To get more information about staking and how it works, visit https://staking.bitfinex.com. Most recent entries are returned by default, but a timestamp can be used to retrieve time-specific data. Contain sections `Date Range Selection`, `Filters`, `Refresh Button`, `Table`, `Pagination`

</details>

<details>

<summary>Affiliates Earnings</summary>

> Shows your past ledger entries for earned fee/affiliate rebate. To get more information about affiliate program and how it works, visit https://www.bitfinex.com/affiliate. Most recent entries are returned by default, but a timestamp can be used to retrieve time-specific data. Contain sections `Date Range Selection`, `Filters`, `Refresh Button`, `Table`, `Pagination`

</details>

<details>

<summary>Public Trades</summary>

> Shows past public trades and includes details such as price, size, and time. This section provides optional functionality to sync certain pairs and time period. Contain sections `Date Range Selection`, `Filters`, `Refresh Button`, `Sync Preferences`, `Table`, `Pagination`

</details>

<details>

<summary>Public Funding</summary>

> Shows past public funding and includes details such as price, size, and time. This section provides optional functionality to sync certain pairs and time period. Contain sections `Date Range Selection`, `Filters`, `Refresh Button`, `Sync Preferences`, `Table`, `Pagination`

</details>

<details>

<summary>Tickers</summary>

> Shows history of recent tickers. Provides historic data of the best bid and ask at a 10-second interval. Historic data goes back 1 year. The oldest results have a 30-minute interval. This section provides optional functionality to sync certain pairs and time period. Contain sections `Date Range Selection`, `Filters`, `Refresh Button`, `Sync Preferences`, `Table`, `Pagination`

</details>

<details>

<summary>Derivatives</summary>

> Shows platform information about derivatives pair status. This section provides optional functionality to sync certain pairs and time period. Contain sections `Filters`, `Refresh Button`, `Sync Preferences`, `Table`

</details>

<details>

<summary>Account Balance</summary>

> Shows the daily, weekly or monthly account balances expressed in USD for the selected time frames. Contain sections `Date Range Selection`, `Filters`, `Query Button`, `Refresh Button`, `Chart`

</details>

<details>

<summary>Loan Report</summary>

> Shows users how their funding strategy is working. The results are displayed as daily returns, accumulative returns on the time period and as an annualized percentage return. Contain sections `Date Range Selection`, `Filters`, `Query Button`, `Refresh Button`, `Chart`

</details>

<details>

<summary>Traded Volume</summary>

> Shows the amount of traded volume over a certain period of time, allowing users to filter by pairs if required. Contain sections `Date Range Selection`, `Filters`, `Query Button`, `Refresh Button`, `Chart`

</details>

<details>

<summary>Fees Report</summary>

> Shows the fees paid by the user over selected periods of time, enabling users to filter by pairs if required. Contain sections `Date Range Selection`, `Filters`, `Query Button`, `Refresh Button`, `Chart`

</details>

<details>

<summary>Average Win/Loss</summary>

> Shows the daily, weekly and monthly portfolio gains across a selected time frame. Values are represented in USD or fiat currency of choice. The formula used takes into consideration equity, trades, funding earnings, funding costs, price movements, transactions, and fees; it does not take into account open margin positions. Contain sections `Date Range Selection`, `Filters`, `Query Button`, `Refresh Button`, `Chart`

</details>

<details>

<summary>Concentration Risk</summary>

> Shows the currency breakdown of your portfolio, at a select moment in time, allowing you to view a visual breakdown of your trading wallet and the respective proportions of each asset. Contain sections `End Time Selection`, `Query Button`, `Refresh Button`, `Table`, `Chart`

</details>

<details>

<summary>Snapshots</summary>

> Shows snapshot of an account at a certain moment:
> - Positions: captures all the positions opened, displaying the key information at that moment for each position.
> - Tickers: amounts are displayed in US dollar (USD). This section displays the tickers used to convert the amounts into the relative USD value.
> - Wallets: snapshot of the wallets, the information is displayed consists of the currencies and balance for that exact moment
> - Contain sections `End Time Selection`, `Query Button`, `Refresh Button`, `Tables`

</details>

<details>

<summary>Tax Report</summary>

> Shows tax report by selecting the relevant dates for the generation of the report. The report will be displayed in the `Final Result` tab:
> - Total Result (USD): Total gains or losses during the selected period, expressed in US Dollars.
> - Movements Total Amount (USD): The total result of movements expressed in US Dollars.
> - Movements: All deposits and withdrawals completed during the specified period.
> - Starting Period Balances: Total balances between all wallets and positions expressed in US Dollars.
> - Ending Period Balances: Total balances between all wallets and positions expressed in US Dollars.
> `Start snapshot` and `End snapshot` details the snapshots at the start or end of the period, with details of wallets, positions and tickers used to calculate the final result
> Contain sections `Date Range Selection`, `Tables`

</details>

<details>

<summary>Account Summary</summary>

> Provides an overview of the different fee rates for the account as well as the LEO discount level and the average amount of LEO held over the last 30 days. Contain sections `Volume in the last 30 days`, `Fees on Bitfinex`, `Fees on Bitfinex Derivatives`, `Total return on your margin funds provided in the last 30 days`, `Trading fees charged in the last 30 days`, `Volume (eligible for fee tier calculation) in the last 30 days`

</details>

<details>

<summary>Logins</summary>

> Shows a list of past logins. Contain sections `Date Range Selection`, `Filters`, `Refresh Button`, `Table`, `Pagination`

</details>

<details>

<summary>Change Logs</summary>

> Shows all the changes made to the Bitfinex account, enabling users to keep track of changes made to their account. It shows where changes have been made providing the ability to track any suspicious activity. Contain sections `Date Range Selection`, `Filters`, `Refresh Button`, `Table`, `Pagination`

</details>

## Preferences

Let users set preferred language, theme etc. The dialog places in the popup near top right user icon

<details>

<summary>Language</summary>

> The dialog shows language selection menu. The menu lists all support languages:
> - English
> - Spanish
> - Russian
> - Turkish
> - Chinese (China)
> - Chinese (Taiwan)
> - Portuguese

</details>

<details>

<summary>Themes</summary>

> The dialog list available theme in button group, there is light and dark

</details>

<details>

<summary>Timezone</summary>

> The dialog list available selections for timezone and date format which displays

</details>

<details>

<summary>Precision</summary>

> The checkbox provide ability to `Display Milliseconds` in the dates of the reports

</details>

<details>

<summary>Display</summary>

> Available checkboxes to show/hide vertical `Table Scroll` and `Preserve Timeframe`

</details>

## Bitfinex Reporting App extra features

Bitfinex Reporting App provides additional features that are not available in the online version.
This is because the App saves all the users information locally enhancing the ability to present the information in new ways.
Is worth noticing that as to provide this new type of reports the information must be priorly synced.
First time opening the App or Syncing an account users would need to wait the process to be ended. After the first time the process works on the background

<details>

<summary>Start/Stop sync manually</summary>

> All data is synced to the local database automatically with a set period of time that can be configured (see the corresponding section). However, sync can be enabled/disabled at any time by clicking on the `Start Sync/Stop Sync` button

</details>

<details>

<summary>Online/Offline mode</summary>

> The data might be obtained from cloud or locally database just clicking the `Query Online/Query Offline` button. As data is synced locally, users can log in and check their account developments regardless of whether there is an active internet connection available or not. Another refreshing benefit of the local data sync setup is that there is no longer any need to wait for queries. All data queries complete in less than seconds, regardless of the quantity of data being processed

</details>

<details>

<summary>Local CSV export</summary>

> The data might be exported between the selected time frames just clicking the CSV export button and selecting the date format intended to receive. As to make the reporting software compatible with unrelated trading software's used by our users, it has been added the option to export all reporting data. The storage location for report files can be set manually (see the corresponding section), by default they are saved as follows:
> - if uses `Mac` or `AppImage` on `Linux` or `NSIS` on `Windows` CSV files would be stored in the directory for a user's `My Documents` + `bitfinex/reports` folder
> - if uses `ZIP` releases (not Mac) CSV files would be stored in `csv` folder of the application root

</details>

<details>

<summary>How to show/hide columns</summary>

> To show/hide columns just push the `Filter Columns` button and in the popup push the `Column Selection` item to use corresponding checkboxes

</details>

<details>

<summary>Login methodology</summary>

> Users are saved locally, which means that there is no need to remember the `API keys`. This makes the process faster and more intuitive. Users can also add a password that encrypts their login information, protecting it from other users using the same terminal

</details>

<details>

<summary>Password Recovery</summary>

> As a means of preventing users from resetting the database after forgetting a password, it can be recovered. `API keys` need to repeat and choose a new password

</details>

<details>

<summary>How to add/remove a sub account</summary>

> To create a sub-account firstly need to login with `API keys` which will be the master-user. Then need to create sub-account with `API keys` of the master-user and sub-users. For this need to go to the `Sub Accounts` section clicking item in bottom of the left menu bar. The sync will be processed for data of the master-user and all sub-users. Then to the system would be able to login with `API keys` of the master-user using corresponging `Sub Accounts` checkbox.
> Once created, a user can login from the sub accounts section or from the normal login ticking the sub-account feature. Once logged in as a sub-account user, the information displayed is aggregated across the list of accounts added in the previous step. This can be extremely useful as a means of tracking the activity of all a user’s accounts in a single place, with aggregated data such as volume and performance metrics
> Also there is possible to remove the sub-account totally and add/remove sub-users in the sub-account particularly

</details>

<details>

<summary>How to display the menu bar</summary>

> By pressing the `ALT` key, a menu will pop up on the top with the respective options:
>
> - Bitfinex Report *`if Mac`*
>   - About Bitfinex Report
>   - Services
>   - Hide Bitfinex Report
>   - Hide Others
>   - Show All
>   - Quit Bitfinex Report
> - File
>   - Close Window *`if Mac`*
>   - Quit *`if not Mac`*
> - Edit
>   - Undo
>   - Redo
>   - Cut
>   - Copy
>   - Paste
>   - Select All
> - View
>   - Reload
>   - Force Reload
>   - Toggle Developer Tools
>   - Actual Size
>   - Zoom In
>   - Zoom Out
>   - Toggle Full Screen
> - Window
>   - Minimize
>   - Zoom
>   - Front *`if Mac`*
>   - Window *`if Mac`*
>   - Close *`if not Mac`*
> - Tools
>   - Data Management
>      - Export DB
>      - Import DB
>      - Restore DB
>      - Backup DB
>      - Remove DB
>      - Clear all data
>   - Change reports folder
>   - Change sync frequency
> - Help
>   - Open new GitHub issue
>   - Check for update
>   - User manual
>   - Changelog
>   - About *`if not Mac`*

</details>

<details>

<summary>Manage DB</summary>

> - If a user wishes to upgrade between report versions, change the computer or replicate a report on another computer, without syncing their data again, there is an option added to import/export the reports DB.
By pressing the `ALT` key, a menu will pop up on the top with the respective tools relating to do the export/import task.
> - If it becomes necessary to clear all confidential data, it is possible to completely delete the database files using the menu bar item `Tools`->`Data Management`->`Remove DB`.
> - Also has ability to drop all data except users login information to be able to login using the menu bar item `Tools`->`Data Management`->`Clear all data`.
> After it the app would be launched except exporting case

> In addition to the above, there is an option to restore the DB from previously saved backups:
> - when a new version of the app is published DB structure might be changed
> - in this case, the corresponding DB backup would be saved to keep users data safe
> - if DB migration to a new version has some trouble would restore the previous DB version from the made backups
> - also, available an option into the menu bar to be able to restore DB from the selected backup `Tools`->`Data Management`->`Restore DB` and make a new backup file `Tools`->`Data Management`->`Backup DB`
> - backups store in the same place where the main DB is placed, in a separated folder `backups/`
> - stores only two last versions of backup files (e.g. `backup_v26_TIMESTAMP.db` and `backup_v25_TIMESTAMP.db`). And not more than two backup files of the last DB version (e.g. `backup_v26_2021-11-05T00-00-00.000Z.db` and `backup_v26_2021-09-05T00-00-00.000Z.db`) for cases when user wants to store more than one backup file for current supported DB schema. Taking into account the previously described, max number of backup files might be three

</details>

<details>

<summary>Manage CSV Exports</summary>

> It might be selected the folder where the csv files will be exported using the menu bar item `Tools`->`Change reports folder`.
> After it the app would be launched

</details>

<details>

<summary>Manage sync frequency</summary>

> The sync frequency might be managed specifying it in the modal dialog shown by click on the menu bar item `Tools`->`Change sync frequency`.
> After it the app would be launched

</details>

## Report bugs

To improve the performance of the software was added ability to open a new GitHub issue via the users account

<details>

> For it can just be used the menu bar item `Help`->`Open new GitHub issue`
> Also if an error is occurred the app would open the modal dialog to open a new GitHub issue
The feature collects different system info and log files and then open a new GitHub issue in corresponding browser with that debbug information

</details>

## Auto updates

Auto-update has the following workflow

<details>

> - On the first launching would be checked for updates in the GitHub repository
> - The auto-update feature will download a new release if exists
> - The new one will be installed if push on OK button in a toast window or just close the app
> Also it's posible to check for update manually using the menu bar item `Help`->`Check for update`

</details>

---

*For any questions feel free to open a new [GitHub Issue](https://github.com/bitfinexcom/bfx-report-electron/issues/new)*
