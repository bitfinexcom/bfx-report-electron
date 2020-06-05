'use strict'

const { promisify } = require('util')
const path = require('path')
const fs = require('fs')
const { cloneDeep } = require('lodash')

const {
  writeFileSync,
  mkdirSync,
  accessSync,
  constants: { F_OK, W_OK }
} = fs
const access = promisify(fs.access)
const mkdir = promisify(fs.mkdir)
const writeFile = promisify(fs.writeFile)

const { CONFIGS_FILE_NAME } = require('./const')
const {
  WrongPathToUserDataError
} = require('./errors')

class ConfigsKeeper {
  constructor (
    {
      pathToUserData,
      configsFileName = CONFIGS_FILE_NAME
    } = {},
    configsByDefault
  ) {
    if (!pathToUserData) {
      throw new WrongPathToUserDataError()
    }

    this.pathToUserData = pathToUserData
    this.configsFileName = configsFileName
    this.configsByDefault = configsByDefault

    this.pathToConfigsFile = path.join(
      this.pathToUserData,
      this.configsFileName
    )
    this.configs = {
      ...this.configsByDefault,
      ...this._loadConfigs()
    }

    this.queue = []
  }

  _loadConfigs () {
    try {
      return require(this.pathToConfigsFile)
    } catch (err) {}
  }

  getConfigs () {
    return cloneDeep(this.configs)
  }

  getConfigByName (name) {
    return (
      this.configs[name] &&
      typeof this.configs[name] === 'object'
    )
      ? cloneDeep(this.configs[name])
      : this.configs[name]
  }

  setConfigs (configs) {
    this.configs = {
      ...this.configs,
      ...configs
    }

    return this
  }

  async _process () {
    for (const promise of [...this.queue]) {
      await promise

      this.queue.shift()
    }
  }

  async _saveConfigs (configs) {
    try {
      await this._process()

      const dir = path.dirname(this.pathToConfigsFile)

      try {
        await access(dir, F_OK | W_OK)
      } catch (err) {
        await mkdir(dir, { recursive: true })
      }

      const _configs = this
        .setConfigs(configs)
        .getConfigs()

      await writeFile(
        this.pathToConfigsFile,
        JSON.stringify(_configs)
      )

      return true
    } catch (err) {
      console.error(err)

      return false
    }
  }

  async saveConfigs (configs) {
    const task = this._saveConfigs(configs)
    this.queue.push(task)

    const res = await task

    return res
  }

  saveConfigsSync (configs) {
    try {
      const dir = path.dirname(this.pathToConfigsFile)

      try {
        accessSync(dir, F_OK | W_OK)
      } catch (err) {
        mkdirSync(dir, { recursive: true })
      }

      const _configs = this
        .setConfigs(configs)
        .getConfigs()

      writeFileSync(
        this.pathToConfigsFile,
        JSON.stringify(_configs)
      )

      return true
    } catch (err) {
      console.error(err)

      return false
    }
  }
}

module.exports = {
  configsKeeperFactory: (
    opts = {},
    configsByDefault
  ) => {
    const {
      configsKeeperName = 'main'
    } = opts

    const configsKeeper = new ConfigsKeeper(
      opts,
      configsByDefault
    )
    this[configsKeeperName] = configsKeeper

    return configsKeeper
  },
  getConfigsKeeperByName: (name) => this[name]
}
