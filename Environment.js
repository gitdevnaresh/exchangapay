
export const getAppName = () => {
  const appName = "rapidz"
  return appName;
};
// const SentEnvironmentVariable="development" : "production"
const ENV = {
  local: {
    reduxEncryptKey: '11AA7AE9-4575-4C12-8F2E-C8DAFFE82416',
    oAuthConfig: {
      issuer: 'neodigitalbank.us.auth0.com',
      clientId: '7cpZsKwJutx5HU5lMvqib4eqvYCK0WtO',
      audience: 'https://ExchangaApi.net',
      scope: 'openid profile email enroll offline_access',
      dataBase: "Rapidz-tst"
    },
    apiUrls: {
      uploadUrl: 'https://neocardsapi.exchangapay.com/',
      apiUrl: 'https://neocardsapi.exchangapay.com/',
      marketBaseUrl: 'https://api.coingecko.com',
    }
  },
  tst: {
    reduxEncryptKey: '11AA7AE9-4575-4C12-8F2E-C8DAFFE82416',
    bundlerId: "money.rapidz.rapidzmoney.dev",
    oAuthConfig: {
      issuer: 'dev-2gauj4g0kyi8jm02.us.auth0.com',
      clientId: 'EguqL0EDQg0Xnn0MUYsZztWFfO7byN2p',
      audience: 'https://Rapidztst.net',
      scope: 'openid profile email enroll offline_access',
      dataBase: "Rapidz-tst",
      sentryEnvornment: "development",
      sentryLoggs: false,
      sentryDsn: 'https://b996932428dba962fe9fb362331aab2e@o4509932318949376.ingest.us.sentry.io/4509932375244800',
      sumsubWebUrl: 'https://tst.rapidz.money/',
      appStoreUrl: ''

    },
    apiUrls: {
      apiUrl: 'https://tstcore.rapidz.money/',
      uploadUrl: 'https://tstcore.rapidz.money/',
      marketBaseUrl: 'https://api.coingecko.com',
      cardsUrl: 'https://tstcards.rapidz.money/',
      paymentsBaseUrl: 'https://tstpayments.rapidz.money/',
      bankApiUrl: 'https://tstbanks.rapidz.money/',
      rewards: 'https://loyalityapitst.azurewebsites.net',
      exchangeApiUrl: 'https://tstexchange.rapidz.money/',
    }
  },
  staging: {
    reduxEncryptKey: 'ED8FC691-8EC2-4969-A73A-3480E794F335',
    bundlerId: "money.rapidz.rapidzmoney.staging",
    oAuthConfig: {
      issuer: 'rapidz-stg.us.auth0.com',
      clientId: 'FbFwvrL9LCjiXfj58fCpjeXt4RO58cVH',
      audience: 'https://Rapidzstg.net',
      scope: 'openid profile email enroll offline_access',
      dataBase: "Rapidz-stg",
      sentryEnvornment: "production",
      sentryLoggs: true,
      sentryDsn: 'https://b202f380d5d87679e54d4cd99644be1b@o4509953990131712.ingest.de.sentry.io/4509988812947536',
      sumsubWebUrl: 'https://stg.rapidz.money/',
      playStoreUrl: 'https://play.google.com/store/apps/details?id=money.rapidz.rapidzmoney.staging',
      appStoreUrl: 'https://www.apple.com/in/app-store/'


    },
    apiUrls: {
      apiUrl: 'https://stgcoreapi.rapidz.money/',
      uploadUrl: 'https://stgcoreapi.rapidz.money/',
      marketBaseUrl: 'https://api.coingecko.com',
      cardsUrl: 'https://stgcardsapi.rapidz.money/',
      paymentsBaseUrl: 'https://stgpaymentsapi.rapidz.money/',
      bankApiUrl: 'https://stgbankapi.rapidz.money/',
      rewards: 'https://loyalityapi.azurewebsites.net/',
      exchangeApiUrl: 'https://stgexchangeapi.rapidz.money/',
    },
  },
  prod: {
    reduxEncryptKey: 'ED8FC691-8EC2-4969-A73A-3480E794F335',
    bundlerId: "money.rapidz.rapidzmoney",
    oAuthConfig: {
      issuer: 'rapidz.us.auth0.com',
      clientId: 'zifsdYszqALzz10TA36KGBoJn66ZSbnA',
      audience: 'https://Rapidz.net',
      scope: 'openid profile email enroll offline_access',
      dataBase: "Rapidz",
      sentryEnvornment: "production",
      sentryLoggs: true,
      sentryDsn: 'https://2eb5d74663f6818a2bc89c0c367c01d1@o4509953990131712.ingest.de.sentry.io/4510616742199376',
      sumsubWebUrl: 'https://stg.rapidz.money/',
      playStoreUrl: 'https://play.google.com/store/apps/details?id=money.rapidz.rapidzmoney',
      appStoreUrl: 'https://www.apple.com/in/app-store/'


    },
    apiUrls: {
      apiUrl: 'https://coreapi.rapidz.money/',
      uploadUrl: 'https://coreapi.rapidz.money/',
      marketBaseUrl: 'https://api.coingecko.com/',
      cardsUrl: 'https://cardsapi.rapidz.money/',
      paymentsBaseUrl: 'https://paymentsapi.rapidz.money/',
      bankApiUrl: 'https://bankapi.rapidz.money/',
      rewards: 'https://loyalityapi.azurewebsites.net/',
      exchangeApiUrl: 'https://exchangeapi.rapidz.money/',
    },
  },
  dev: {
    reduxEncryptKey: 'devsecretkey12345678901234567890',
    bundlerId: "money.rapidz.rapidzmoney.dev",
    oAuthConfig: {
      issuer: 'yellowblockllp.us.auth0.com',
      clientId: 'FupavKI3iG7WIWyOwzJkWbaajaUvqsyn',
      audience: 'https://devarthapayApi.net',
      scope: 'openid profile email enroll offline_access',
      dataBase: "DevArthaPay",
      sentryEnvornment: "development",
      sentryLoggs: false,
      sentryDsn: 'https://b996932428dba962fe9fb362331aab2e@o4509932318949376.ingest.us.sentry.io/4509932375244800'
    },
    apiUrls: {
      apiUrl: 'https://arthadevcore.artha.work/',
      uploadUrl: 'https://arthadevcore.artha.work/',
      marketBaseUrl: 'https://api.coingecko.com',
      cardsUrl: 'https://arthadevcards.artha.work/',
      paymentsBaseUrl: 'https://arthadevpayments.artha.work/',
      bankApiUrl: 'https://arthadevbanks.artha.work/',
      rewards: 'https://loyalityapi.azurewebsites.net/'

    },
  },
};
export const getAllEnvData = () => {
  return ENV['tst'];
};
export const getEnvVars = () => {
  return __DEV__ ? ENV.local : ENV.prod;
};


