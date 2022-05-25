'use strict'

const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const { promisify } = require('util')
const archiver = require('archiver')
const exec = promisify(require('child_process').exec)

let version
const appOutDirs = new Map()

/* eslint-disable no-template-curly-in-string */

const nodeModulesFilter = [
  '**/*',
  '!**/*/{CHANGELOG.md,CHANGELOG,README.md,README,readme.md,readme}',
  '!**/*/{test,__tests__,tests,powered-test,example,examples}',
  '!**/*.d.ts',
  '!**/.bin'
]

const getNodeModulesSubSource = (
  deps = [],
  mainSource = 'bfx-reports-framework'
) => deps.map((dep) => {
  const from = `${mainSource}/node_modules/${dep}/node_modules`

  return { from, to: from, filter: nodeModulesFilter }
})

module.exports = {
  npmRebuild: false,
  extends: null,
  asar: false,
  productName: 'Bitfinex Report',
  artifactName: 'BitfinexReport-${version}-x64-${os}.${ext}',
  appId: 'com.bitfinex.report',
  publish: {
    provider: 'github',
    repo: 'bfx-report-electron',
    owner: 'bitfinexcom',
    vPrefixedTagName: true,
    channel: 'latest',

    // Available: 'draft', 'prerelease', 'release'
    releaseType: 'draft',
    allowPrerelease: true,
    useMultipleRangeRequest: false,
    updaterCacheDirName: 'bfx-report-electron-updater'
  },
  linux: {
    executableName: 'app',
    description: 'Bitfinex Report',
    maintainer: '<bitfinex.com>',
    category: 'Network',
    target: [
      'dir',
      'AppImage'
    ]
  },
  win: {
    target: [
      'dir',
      'nsis'
    ],
    publisherName: 'Bitfinex Report',
    verifyUpdateCodeSignature: false
  },
  mac: {
    type: 'development',
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: 'build/entitlements.mac.plist',
    entitlementsInherit: 'build/entitlements.mas.inherit.plist',
    category: 'public.app-category.finance',
    target: [
      'dir'
    ]
  },
  files: [
    '**/*',
    'build/icons',
    'build/icon.*',
    'build/loader.*',
    '!scripts${/*}',

    '!bfx-report-ui',
    'bfx-report-ui/build',
    'bfx-report-ui/bfx-report-express/**/*',
    '!bfx-report-ui/bfx-report-express/config/default.json.example',
    '!bfx-report-ui/bfx-report-express/pm2.config.js',

    '!bfx-reports-framework/bfx-report-ui/${/*}',
    '!bfx-reports-framework/config/*/*.json.example',
    '!bfx-reports-framework/nginx-configs/${/*}',
    '!bfx-reports-framework/terraform/${/*}',
    '!bfx-reports-framework/test/${/*}',
    '!bfx-reports-framework/scripts/${/*}',
    '!bfx-reports-framework/*/*.sh',
    '!bfx-reports-framework/.mocharc.json',

    '!**/.dockerignore',
    '!**/*Dockerfile*',
    '!**/*docker-compose*',
    '!**/.env',
    '!**/.env.example',
    '!**/README.md',
    '!**/LICENSE.md',
    '!**/.gitmodules',
    '!**/.npmrc',
    {
      from: 'bfx-reports-framework/node_modules',
      to: 'bfx-reports-framework/node_modules',
      filter: nodeModulesFilter
    },
    {
      from: 'bfx-report-ui/bfx-report-express/node_modules',
      to: 'bfx-report-ui/bfx-report-express/node_modules',
      filter: nodeModulesFilter
    },
    ...getNodeModulesSubSource([
      'bfx-api-node-rest',
      'bfx-svc-boot-js',
      'yargs',
      'bfx-report',
      'request',
      'lokue'
    ])
  ],
  async afterPack (context) {
    const {
      appOutDir,
      outDir
    } = context

    await fs.promises.access(appOutDir, fs.constants.F_OK)
    await exec(`chmod -fR a+xwr ${outDir}`)

    version = context.packager.appInfo.version
    appOutDirs.set(
      context.packager.platform.buildConfigurationKey,
      appOutDir
    )
  },
  async afterAllArtifactBuild (buildResult) {
    const {
      outDir,
      artifactPaths,
      platformToTargets
    } = buildResult
    const macBlockmapFilePaths = []

    for (const [platform, targets] of platformToTargets) {
      const {
        buildConfigurationKey: targetPlatform
      } = platform

      if (!appOutDirs.has(targetPlatform)) {
        throw new Error('ERR_APP_DIST_DIR_IS_NOT_DEFINED')
      }

      if (
        targetPlatform === 'mac' &&
        !targets.has('zip')
      ) {
        targets.set('zip', {})
        artifactPaths.push(path.join(
          outDir,
          `BitfinexReport-${version}-x64-${targetPlatform}.zip`
        ))
      }

      for (const [targetName] of targets) {
        const ext = targetName === 'nsis'
          ? 'exe'
          : targetName
        const appFilePath = artifactPaths.find((path) => (
          new RegExp(`${targetPlatform}.*${ext}$`, 'i').test(path)
        ))

        if (
          targetPlatform === 'mac' &&
          targetName === 'zip'
        ) {
          macBlockmapFilePaths.push(
            `${appFilePath}.blockmap`,
            path.join(outDir, 'latest-mac.yml')
          )

          require('./scripts/node/make-mac-app-update-yml')
          await new Promise((resolve, reject) => {
            try {
              const output = fs.createWriteStream(appFilePath)
              const archive = archiver('zip', {
                zlib: { level: zlib.constants.Z_BEST_COMPRESSION }
              })

              output.on('close', resolve)
              output.on('error', reject)
              archive.on('error', reject)
              archive.on('warning', reject)

              archive.pipe(output)
              archive.directory(appOutDirs.get(targetPlatform), false)

              archive.finalize()
            } catch (err) {
              reject(err)
            }
          })
          require('./scripts/node/generate-mac-zipand-blockmap')

          console.log('Mac release has been zipped successfully')
        }

        await fs.promises.access(appFilePath, fs.constants.F_OK)
        await fs.promises.chmod(appFilePath, '777')
      }
    }

    return macBlockmapFilePaths.length > 0
      ? [...artifactPaths, ...macBlockmapFilePaths]
      : []
  }
}
