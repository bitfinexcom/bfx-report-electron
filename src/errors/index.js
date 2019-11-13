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

module.exports = {
  BaseError,
  InvalidFilePathError,
  InvalidFileNameInArchiveError,
  DbImportingError,
  InvalidFolderPathError,
  RunningExpressOnPortError,
  IpcMessageError,
  AppInitializationError,
  FreePortError
}
