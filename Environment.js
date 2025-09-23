const ENV = {
  dev: {
    envName: "dev",
    oAuthConfig: {
      issuer: "exchangapay.us.auth0.com",
      clientId: "7cpZsKwJutx5HU5lMvqib4eqvYCK0WtO",
      audience: "https://ExchangaApi.net",
      scope: "openid profile email",
    },
    apiUrls: {
      uploadUrl: "https://devapi.exchangapay.com/",
      cardsUrl: "https://devapi.exchangapay.com/",
    },
    localization: {
      defaultResourceName: "Exchanga Pay",
    },
  },
  prod: {
    envName: "prod",
    oAuthConfig: {
      issuer: "exchangapay.eu.auth0.com",
      clientId: "0zf1gFmgg6rp3BezUDn1jAimFY5FF3hH",
      audience: "https://ExchangaApi.net",
      scope: "openid profile email",
    },
    apiUrls: {
      uploadUrl: "https://api.exchangapay.com/",
      cardsUrl: "https://api.exchangapay.com/",
    },
    localization: {
      defaultResourceName: "Exchanga Pay",
    },
  },
  tst: {
    envName: "tst",
    oAuthConfig: {
      issuer: "exchangapay-tst.eu.auth0.com",
      clientId: "QN7NMqYHzengFUnmR0HCvenDCSOwGwNs",
      audience: "https://ExchangaTstApi.net",
      scope: "openid profile email enroll offline_access",
    },
    apiUrls: {
      uploadUrl: " https://tstapi.exchangapay.com/",
      cardsUrl: " https://tstapi.exchangapay.com/",
    },
    localization: {
      defaultResourceName: "Exchanga Pay",
    },
  },
};

export const getAllEnvData = (envName) => {
  return ENV["tst"] || ENV.prod;
};

export const getEnvVars = () => {
  return __DEV__ ? ENV.local : ENV.prod;
};
