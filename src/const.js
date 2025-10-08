'use strict'

const isBfxApiStaging = require('./helpers/is-bfx-api-staging')

const stagingDbLable = isBfxApiStaging()
  ? '-staging'
  : ''

const CONFIGS_FILE_NAME = 'bfx-report-configs.json'
const DEFAULT_ARCHIVE_DB_FILE_NAME = 'bfx-report-db-archive'
const DB_FILE_NAME = `db-sqlite_sync${stagingDbLable}_m0.db`
const DB_SHM_FILE_NAME = `${DB_FILE_NAME}-shm`
const DB_WAL_FILE_NAME = `${DB_FILE_NAME}-wal`
const SECRET_KEY_FILE_NAME = 'secret-key'
const REPORT_FILES_PATH_VERSION = 1

module.exports = {
  CONFIGS_FILE_NAME,
  DEFAULT_ARCHIVE_DB_FILE_NAME,
  DB_FILE_NAME,
  DB_SHM_FILE_NAME,
  DB_WAL_FILE_NAME,
  SECRET_KEY_FILE_NAME,
  REPORT_FILES_PATH_VERSION
}
