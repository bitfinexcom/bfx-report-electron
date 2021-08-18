# User manual

The Bitfinex Report Tools allows traders to more conveniently track, manage and analyse trading/funding activity across their Bitfinex account. Built to be both faster and easier to use, traders can now instantly compile an overview of necessary account information. A highlight of this software is the fact that all data is synced locally, automatically. The sync experience has been developed in a manner which is as smooth and simple as possible, and which allows you to always remain up to date with account developments

## Report sections

The Tool provides the following main reports sections

<details>

<summary>TODO:</summary>

> TODO:

</details>

<details>

<summary>TODO:</summary>

> TODO:

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

## Extra framework features

The reports framework provides additional features that are not available in the online version of the reporting tool

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

<summary>Types of filters available</summary>

> The columns might be filtered, so as to have a smaller screen, thereby removing information that is not required for analysis
> Abailable the following types of filters:
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

<summary>How to show/hide columns</summary>

> To show/hide columns just push the `Filter Columns` button and in the popup push the `Column Selection` item to use corresponding checkboxes

</details>

<details>

<summary>Login methodology</summary>

> Users are saved locally, which means that there is no need to remember the API keys. This makes the process faster and more intuitive. Users can also add a password that encrypts their login information, protecting it from other users using the same terminal

</details>

<details>

<summary>Password Recovery</summary>

> As a means of preventing users from resetting the database after forgetting a password, it can be recovered. `API keys` need to repeat and choose a new password

</details>

<details>

<summary>How to add remove a sub account</summary>

> To create a sub-account firstly need to login with `API keys` which will be the master-user. Then need to create sub-account with `API keys` of the master-user and sub-users. For this need to go to the `Sub Accounts` section clicking item in bottom of the left menu bar. The sync will be processed for data of the master-user and all sub-users. Then to the system would be able to login with `API keys` of the master-user using corresponging `Sub Accounts` checkbox.
> Once created, a user can login from the sub accounts section or from the normal login ticking the sub-account feature. Once logged in as a sub-account user, the information displayed is aggregated across the list of accounts added in the previous step. This can be extremely useful as a means of tracking the activity of all a user’s accounts in a single place, with aggregated data such as volume and performance metrics
> Also there is possible to remove the sub-account totally and add/remove sub-users in the sub-account particularly

</details>

## Extra software features

The desktop software provides the following extra features

<details>

<summary>How to display the menu bar</summary>

> By pressing the `ALT` key, a menu will pop up on the top with the respective options:
> - Application:
>   - Quit
>   - Open dev tools
>   - Refresh page
> - Edit:
>   - Undo
>   - Redo
>   - Cut
>   - Copy
>   - Paste
>   - Select All
> - Tools:
>   - Export DB
>   - Import DB
>   - Remove DB
>   - Clear all data
>   - Change reports folder
>   - Change sync frequency
> - Help:
>   - Open new GitHub issue
>   - Check for update
>   - User manual
>   - About

</details>

<details>

<summary>Manage DB</summary>

> - If a user wishes to upgrade between report versions, change the computer or replicate a report on another computer, without syncing their data again, there is an option added to import/export the reports DB.
By pressing the `ALT` key, a menu will pop up on the top with the respective tools relating to do the export/import task.
> - If it becomes necessary to clear all confidential data, it is possible to completely delete the database files using the menu bar item `Tools`->`Remove DB`.
> Also has ability to drop all data except users login information to be able to login using the menu bar item `Tools`->`Clear all data`.
> After it the app would be launched except exporting case

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
