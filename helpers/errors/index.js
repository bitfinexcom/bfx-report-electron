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

module.exports = {
  BaseError,
  InvalidFilePathError,
  InvalidFileNameInArchiveError
}
