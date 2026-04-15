export const getAppName = () => {
    const appName = "BullSwipe"
    return appName;
};
const ENV = {
    local: {
        reduxEncryptKey: 'devsecretkey12345678901234567890',
        oAuthConfig: {
            issuer: 'neodigitalbank.us.auth0.com',
            clientId: '7cpZsKwJutx5HU5lMvqib4eqvYCK0WtO',
            audience: 'https://ExchangaApi.net',
            scope: 'openid profile email enroll'
        },
        apiUrls: {
            uploadUrl: 'https://neocardsapi.exchangapay.com/',
            apiUrl: 'https://neocardsapi.exchangapay.com/',
            marketBaseUrl: 'https://api.coingecko.com',
        }
    },
    stg: {
        reduxEncryptKey: 'devsecretkey12345678901234567890',
        oAuthConfig: {
            issuer: "dev-p4j3kp4nk6x4m4aq.us.auth0.com",
            clientId: "UD1UIdz8sslEKPjN9A7ziT5q3qQrtqap",
            audience: "https://swokipayTSTApi.net",
            scope: 'openid profile email enroll offline_access',
            frontEgg_ClientId: "9cf22fa5-edb7-4bf3-8440-5ee35467f30b",
            frontEgg_Secret: "280ae796-ea09-4df6-961b-be2128ba4688",
            frontEgg_AppId: "ffda60b1-2844-4e20-a7bd-3efcf57b3862",
            frontEgg_host: "app-95ajy9qx6083.ca.frontegg.com",
            sentryEnvornment: "development",
            sentryLoggs: true,
            sentryDsn: 'https://072a080903356dfe26e19e25b82dccde@o4510463610126336.ingest.us.sentry.io/4510463612157952',
            playStoreUrl: '',
            appStoreUrl: ''
        },
        apiUrls: {
            apiUrl: 'https://stgapi.bullswipe.com',
            uploadUrl: 'https://stgapi.bullswipe.com',
            marketBaseUrl: 'https://stgapi.bullswipe.com',
        }

    },
    tst: {
        reduxEncryptKey: 'devsecretkey12345678901234567890',
        oAuthConfig: {
            issuer: 'bullswipe-tst.us.auth0.com',
            clientId: 'yWlNd9Q7lqIiiX919P8FmS5QlMp6NLXh',
            audience: 'https://arthapayApi.net',
            scope: 'openid profile email enroll offline_access',
            frontEgg_ClientId: 'fd8b4d3e-6b21-4f09-b4ed-cb7de7dc1af2',
            frontEgg_Secret: '3cc135f4-412e-4cb5-982f-32746c0ad86a',
            frontEgg_AppId: "ba372851-9970-4987-aaf1-8e321688daed",
            frontEgg_host: "app-rk7m05g6zv53.ca.frontegg.com",
            sentryEnvornment: "development",
            sentryLoggs: false,
            sentryDsn: 'https://072a080903356dfe26e19e25b82dccde@o4510463610126336.ingest.us.sentry.io/4510463612157952',
            playStoreUrl: '',
            appStoreUrl: ''
        },
        apiUrls: {
            apiUrl: 'https://tstapibullswipe.artha.work/',
            uploadUrl: 'https://arthapayapi.artha.work/',
            marketBaseUrl: 'https://api.coingecko.com',
        }
    },
    dev: {
        reduxEncryptKey: 'devsecretkey12345678901234567890',
        oAuthConfig: {
            issuer: "dev-p4j3kp4nk6x4m4aq.us.auth0.com",
            clientId: "UD1UIdz8sslEKPjN9A7ziT5q3qQrtqap",
            audience: "https://swokipayTSTApi.net",
            scope: 'openid profile email enroll offline_access',
            frontEgg_ClientId: 'fd8b4d3e-6b21-4f09-b4ed-cb7de7dc1af2',
            frontEgg_Secret: '3cc135f4-412e-4cb5-982f-32746c0ad86a',
            frontEgg_AppId: "ba372851-9970-4987-aaf1-8e321688daed",
            frontEgg_host: "app-rk7m05g6zv53.ca.frontegg.com",
            sentryEnvornment: "development",
            sentryLoggs: false,
            sentryDsn: 'https://072a080903356dfe26e19e25b82dccde@o4510463610126336.ingest.us.sentry.io/4510463612157952',
            playStoreUrl: '',
            appStoreUrl: ''
        },
        apiUrls: {
            uploadUrl: "https://devswokiapi.azurewebsites.net/",
            cardsUrl: "https://devswokiapi.azurewebsites.net/",
            apiUrl: 'https://swokipaydev.artha.work/',
            marketBaseUrl: 'https://api.coingecko.com',
            paymentsBaseUrl: 'https://arthadevpayments.artha.work/'

        },
    },
};
export const getAllEnvData = envName => {
    return ENV['tst'];
};
export const getEnvVars = () => {
    return __DEV__ ? ENV.local : ENV.prod;
};
