'use strict'

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
  // TODO:
  [
    'ledgers',
    (args) => {
      return [[
        12345,
        'BTC',
        null,
        Date.now(),
        null,
        -0.00001,
        5.555555,
        null,
        'Crypto Withdrawal fee on wallet exchange'
      ]]
    }
  ]
])
