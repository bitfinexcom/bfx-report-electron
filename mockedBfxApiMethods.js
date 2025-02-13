'use strict'

const moment = require('moment')
const { randomInt } = require('node:crypto')

const userAccountStart = Date.UTC(2013, 0, 1)
const numberOfEntriesPerDay = 1_000
const msPerDay = 24 * 60 * 60 * 1_000
const msBetweenEnrties = msPerDay / (numberOfEntriesPerDay - 1)

const getMtsArray = (params) => {
  const start = Math.max(userAccountStart, params?.start ?? 0)
  const end = Math.min(Date.now(), params?.end ?? Date.now())
  const limit = Math.min(10_000, params?.limit ?? 10_000)
  const order = params?.order ?? -1
  const isASC = order > 0

  const res = []

  const timePoint = isASC ? start : end
  const roundOff = (ms) => (
    isASC ? Math.ceil(ms) : Math.floor(ms)
  )
  const mDate = moment.utc(timePoint)
  const year = mDate.year()
  const month = mDate.month()
  const date = mDate.date()
  const mDateOfDay = moment.utc({ year, month, date })
  const mDateOfDayMs = mDateOfDay.valueOf()
  const diff = mDate.diff(mDateOfDay)
  const firstPointMs = diff === 0
    ? timePoint
    : mDateOfDayMs + (
      roundOff(diff / msBetweenEnrties) * msBetweenEnrties
    )

  for (let i = 0; res.length < limit; i += 1) {
    const ms = isASC
      ? firstPointMs + (msBetweenEnrties * i)
      : firstPointMs - (msBetweenEnrties * i)

    if (isASC && ms > end) {
      break
    }
    if (!isASC && ms < start) {
      break
    }

    res.push(Math.trunc(ms))
  }

  return res
}

const getIdByMts = (mts = Date.now()) => (
  Number.parseInt(`${mts}${randomInt(100, 1000)}`)
)

const getOneFromRangeByCounter = (counter = 0, range = []) => {
  const i = counter % range.length

  return range[i]
}

const ccyList = ['BTC', 'ETH', 'LTC', 'UST', 'USD']
const ledgerDescriptionList = [
  'Crypto Withdrawal fee on wallet exchange',
  'Transfer of 1020.0 UST from wallet Exchange to Exchange SA(ezewer->ezewert) on wallet exchange',
  'Exchange 0.136 AAVE for USD @ 60.343 on wallet exchange',
  'Trading fees for 0.005778 XAUT (XAUT:USD) @ 1896.6 on BFX (0.2%) on wallet exchange',
  'Margin Funding Charge on wallet margin',
  'Settlement @ 1.0005 on wallet margin',
  'Position closed @ 1.0001 (TRADE) on wallet margin',
  'Position #168174072 funding cost on wallet margin'
]

module.exports = new Map([
  [
    'platform_status',
    () => [1]
  ],
  [
    'login',
    () => [
      '12345678-8888-4321-1234-8cb090a01360',
      [
        [
          'otp',
          true
        ]
      ]
    ]
  ],
  [
    'login_verify',
    () => [
      'pub:api:88888888-4444-4444-4444-121212121212-caps:s:o:f:w:wd:a-write',
      '2023-03-21T12:00:00.000Z'
    ]
  ],
  [
    'generate_token',
    () => ['pub:api:88888888-4444-4444-4444-121212121212-caps:s:o:f:w:wd:a-write']
  ],
  [
    'delete_token',
    () => [1]
  ],
  [
    'user_info',
    () => [
      123,
      'fake@email.fake',
      'fakename',
      null,
      null,
      null,
      null,
      'Timisoara'
    ]
  ],
  [
    'ledgers',
    (args) => {
      return getMtsArray(args)
        .map((mts, i) => {
          const num = 0.001 * (i + 1)

          return [
            getIdByMts(mts),
            getOneFromRangeByCounter(i, ccyList),
            null,
            mts,
            null,
            num * (i % 2 ? -1 : 1),
            num,
            null,
            getOneFromRangeByCounter(i, ledgerDescriptionList)
          ]
        })
    }
  ],
  [
    'symbols',
    [[
      '1INCH:USD',
      '1INCH:UST',
      'AAVE:USD',
      'AAVE:UST',
      'ADABTC',
      'ADAUSD',
      'ADAUST',
      'AIOZ:USD',
      'ALGUSD',
      'ALT11M2507:USD',
      'ALT11M2507:UST',
      'ALT11M250830:USD',
      'ALT11M250830:UST',
      'ALT11M251029:USD',
      'ALT11M251029:UST',
      'ALT2612:USD',
      'ALT2612:UST',
      'AMPUSD',
      'AMPUST',
      'APENFT:USD',
      'APEUSD',
      'APEUST',
      'APTUSD',
      'APTUST',
      'ARBUSD',
      'ARBUST',
      'ATHUSD',
      'ATHUST',
      'ATOUSD',
      'ATOUST',
      'AUSDT:USD',
      'AUSDT:UST',
      'AVAX:BTC',
      'AVAX:USD',
      'AVAX:UST',
      'AZERO:USD',
      'AZERO:UST',
      'B2MUSD',
      'B2MUST',
      'BCHN:USD',
      'BEST:USD',
      'BGBUSD',
      'BGBUST',
      'BLAST:USD',
      'BLAST:UST',
      'BONK:USD',
      'BONK:UST',
      'BTC:USDR',
      'BTC:XAUT',
      'BTCEUR',
      'BTCGBP',
      'BTCJPY',
      'BTCTRY',
      'BTCUSD',
      'BTCUST',
      'BTTUSD',
      'BXNUSD',
      'BXNUST',
      'CCDUSD',
      'CCDUST',
      'CELO:USD',
      'CELO:UST',
      'CHEX:USD',
      'CHZUSD',
      'CHZUST',
      'CNHT:USD',
      'COMP:USD',
      'COMP:UST',
      'CRVUSD',
      'CRVUST',
      'DAIUSD',
      'DOGE:BTC',
      'DOGE:USD',
      'DOGE:UST',
      'DOPUSD',
      'DOPUST',
      'DOTUSD',
      'DOTUST',
      'DSHBTC',
      'DSHUSD',
      'DYMUSD',
      'DYMUST',
      'EGLD:USD',
      'EGLD:UST',
      'EIGEN:USD',
      'EIGEN:UST',
      'ENAUSD',
      'ENAUST',
      'EOSBTC',
      'EOSUSD',
      'EOSUST',
      'ETCBTC',
      'ETCUSD',
      'ETCUST',
      'ETH2X:ETH',
      'ETH2X:USD',
      'ETH2X:UST',
      'ETH:XAUT',
      'ETHBTC',
      'ETHEUR',
      'ETHGBP',
      'ETHJPY',
      'ETHUSD',
      'ETHUST',
      'ETHW:USD',
      'ETHW:UST',
      'EURQ:USD',
      'EURQ:UST',
      'EURR:USD',
      'EURR:UST',
      'EURUST',
      'EUTUSD',
      'EUTUST',
      'FETUSD',
      'FETUST',
      'FILUSD',
      'FILUST',
      'FLOKI:USD',
      'FLOKI:UST',
      'FTMUSD',
      'FTMUST',
      'GALA:USD',
      'GALA:UST',
      'GBPUST',
      'GMMT:USD',
      'GMMT:UST',
      'GOMINING:USD',
      'GOMINING:UST',
      'GRTUSD',
      'GRTUST',
      'GTXUSD',
      'GTXUST',
      'HILSV:USD',
      'HIXUSD',
      'HIXUST',
      'HMSTR:USD',
      'HMSTR:UST',
      'HTXDAO:USD',
      'HTXDAO:UST',
      'ICPUSD',
      'ICPUST',
      'IOTBTC',
      'IOTUSD',
      'JASMY:USD',
      'JASMY:UST',
      'JPYUST',
      'JSTUSD',
      'JSTUST',
      'JUPUSD',
      'JUPUST',
      'JUSTICE:USD',
      'JUSTICE:UST',
      'JXXUSD',
      'JXXUST',
      'KANUSD',
      'KANUST',
      'KARATE:USD',
      'KARATE:UST',
      'KAVA:USD',
      'KAVA:UST',
      'KMNO:USD',
      'KMNO:UST',
      'LDOUSD',
      'LDOUST',
      'LEOBTC',
      'LEOETH',
      'LEOUSD',
      'LEOUST',
      'LIFIII:USD',
      'LIFIII:UST',
      'LINK:USD',
      'LINK:UST',
      'LTCBTC',
      'LTCUSD',
      'LTCUST',
      'MANEKI:USD',
      'MANEKI:UST',
      'MATIC:BTC',
      'MATIC:USD',
      'MATIC:UST',
      'MEWUSD',
      'MEWUST',
      'MIMUSD',
      'MIMUST',
      'MKRUSD',
      'MKRUST',
      'MLNUSD',
      'MNAUSD',
      'MPCUSD',
      'MPCUST',
      'MXNT:USD',
      'NEAR:USD',
      'NEAR:UST',
      'NEOUSD',
      'NEOUST',
      'NEXO:BTC',
      'NEXO:USD',
      'NEXO:UST',
      'NOTUSD',
      'NOTUST',
      'NYMUSD',
      'NYMUST',
      'OMGBTC',
      'OMGUSD',
      'OMNUSD',
      'OPXUSD',
      'OPXUST',
      'PEPE:USD',
      'PEPE:UST',
      'PNKUSD',
      'POLUSD',
      'POLUST',
      'RRTUSD',
      'SAND:USD',
      'SAND:UST',
      'SCROLL:USD',
      'SCROLL:UST',
      'SEIUSD',
      'SEIUST',
      'SHIB:USD',
      'SHIB:UST',
      'SOLBTC',
      'SOLUSD',
      'SOLUST',
      'SPEC:USD',
      'SPEC:UST',
      'SPELL:USD',
      'SPELL:UST',
      'STGUSD',
      'STGUST',
      'STRK:USD',
      'STRK:UST',
      'SUIUSD',
      'SUIUST',
      'SUNUSD',
      'SUNUST',
      'SUSHI:USD',
      'SUSHI:UST',
      'SWEAT:USD',
      'SWEAT:UST',
      'TESTADA:TESTUSD',
      'TESTALGO:TESTUSD',
      'TESTAPT:TESTUSD',
      'TESTAVAX:TESTUSD',
      'TESTBTC:TESTUSD',
      'TESTBTC:TESTUSDT',
      'TESTDOGE:TESTUSD',
      'TESTDOT:TESTUSD',
      'TESTEOS:TESTUSD',
      'TESTETH:TESTUSD',
      'TESTFIL:TESTUSD',
      'TESTLTC:TESTUSD',
      'TESTMATIC:TESTUSD',
      'TESTMATIC:TESTUSDT',
      'TESTNEAR:TESTUSD',
      'TESTSOL:TESTUSD',
      'TESTXAUT:TESTUSD',
      'TESTXTZ:TESTUSD',
      'TIAUSD',
      'TIAUST',
      'TITAN1:GBP',
      'TITAN1:USD',
      'TITAN2:GBP',
      'TITAN2:USD',
      'TOKEN:USD',
      'TOKEN:UST',
      'TOMI:USD',
      'TOMI:UST',
      'TONUSD',
      'TONUST',
      'TRXBTC',
      'TRXEUR',
      'TRXUSD',
      'TRXUST',
      'TRYUST',
      'TSDUSD',
      'TSDUST',
      'TURBO:USD',
      'TURBO:UST',
      'UDCUSD',
      'UDCUST',
      'UNIUSD',
      'UNIUST',
      'UOSBTC',
      'UOSUSD',
      'USDQ:USD',
      'USDQ:UST',
      'USDR:USD',
      'USDR:UST',
      'UST:CNHT',
      'UST:MXNT',
      'USTBL:USD',
      'USTBL:UST',
      'USTUSD',
      'UXLINK:USD',
      'UXLINK:UST',
      'VELAR:USD',
      'VELAR:UST',
      'WBTBTC',
      'WBTUSD',
      'WHBT:USD',
      'WHBT:UST',
      'WIFUSD',
      'WIFUST',
      'WILD:USD',
      'WOOUSD',
      'WOOUST',
      'XAUT:BTC',
      'XAUT:USD',
      'XAUT:UST',
      'XDCUSD',
      'XDCUST',
      'XLMBTC',
      'XLMUSD',
      'XLMUST',
      'XMRBTC',
      'XMRUSD',
      'XMRUST',
      'XRDBTC',
      'XRDUSD',
      'XRPBTC',
      'XRPUSD',
      'XRPUST',
      'XTPUSD',
      'XTPUST',
      'XTZUSD',
      'YFIUSD',
      'YFIUST',
      'ZECBTC',
      'ZECUSD',
      'ZKXUSD',
      'ZKXUST',
      'ZROUSD',
      'ZROUST',
      'ZRXUSD'
    ]]
  ]
])
