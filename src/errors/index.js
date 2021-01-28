'use strict'

class BaseError extends Error {
  constructor (message) {
    super(message)

    this.name = this.constructor.name
    this.message = message

    Error.captureStackTrace(this, this.constructor)
  }
}

class InvalidFilePathError extends BaseError {
  constructor (message = 'ERR_INVALID_FILE_PATH') {
    super(message)
  }
}

class InvalidFileNameInArchiveError extends BaseError {
  constructor (message = 'ERR_INVALID_FILE_NAME_IN_ARCHIVE') {
    super(message)
  }
}

class DbImportingError extends BaseError {
  constructor (message = 'ERR_DB_HAS_NOT_IMPORTED') {
    super(message)
  }
}

class DbRemovingError extends BaseError {
  constructor (message = 'ERR_DB_HAS_NOT_REMOVED') {
    super(message)
  }
}

class InvalidFolderPathError extends BaseError {
  constructor (message = 'ERR_INVALID_FOLDER_PATH') {
    super(message)
  }
}

class RunningExpressOnPortError extends BaseError {
  constructor (message = 'ERR_EXPRESS_PORT_IS_REQUIRED') {
    super(message)
  }
}

class IpcMessageError extends BaseError {
  constructor (message = 'ERR_IPC_MESSAGE') {
    super(message)
  }
}

class AppInitializationError extends BaseError {
  constructor (message = 'ERR_APP_HAS_NOT_INITIALIZED') {
    super(message)
  }
}

class FreePortError extends BaseError {
  constructor (message = 'ERR_NO_FREE_PORT') {
    super(message)
  }
}

class WrongPathToUserDataError extends BaseError {
  constructor (message = 'ERR_WRONG_PATH_TO_USER_DATA') {
    super(message)
  }
}

class WrongPathToUserCsvError extends BaseError {
  constructor (message = 'ERR_WRONG_PATH_TO_USER_CSV') {
    super(message)
  }
}

class WrongSecretKeyError extends BaseError {
  constructor (message = 'ERR_WRONG_SECRET_KEY') {
    super(message)
  }
}

class ReportsFolderChangingError extends BaseError {
  constructor (message = 'ERR_REPORTS_FOLDER_HAS_NOT_CHANGED') {
    super(message)
  }
}

class SyncFrequencyChangingError extends BaseError {
  constructor (message = 'ERR_SYNC_FREQUENCY_HAS_NOT_CHANGED') {
    super(message)
  }
}

module.exports = {
  BaseError,
  InvalidFilePathError,
  InvalidFileNameInArchiveError,
  DbImportingError,
  DbRemovingError,
  InvalidFolderPathError,
  RunningExpressOnPortError,
  IpcMessageError,
  AppInitializationError,
  FreePortError,
  WrongPathToUserDataError,
  WrongPathToUserCsvError,
  WrongSecretKeyError,
  ReportsFolderChangingError,
  SyncFrequencyChangingError
}
