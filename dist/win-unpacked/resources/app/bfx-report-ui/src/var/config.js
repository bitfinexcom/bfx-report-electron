// Static config files to tune components
const platforms = {
  bitfinex: {
    Name: 'Bitfinex',
    API_URL: 'https://api.bitfinex.com',
    KEY_URL: 'https://www.bitfinex.com/api',
  },
  ethfinex: {
    Name: 'Ethfinex',
    API_URL: 'https://api.ethfinex.com',
    KEY_URL: 'https://dev-prdn.bitfinex.com:2998/api',
  },
  localhost: {
    Name: 'Bfx',
    API_URL: 'http://localhost:31339',
    KEY_URL: 'https://dev-prdn.bitfinex.com:2998/api',
  },
}

export const platformId = process.env.REACT_APP_PLATFORM || 'localhost'
export const platform = platforms[platformId] || {}
