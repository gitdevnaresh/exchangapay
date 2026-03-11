import { s } from "./src/newComponents/theme/scale";

const ICONSURLS = {
    HOME: 'https://storageaccountdott.blob.core.windows.net/mlmimages/Home.svg',
    ORDERS: 'https://storageaccountdott.blob.core.windows.net/mlmimages/cart.svg',
    PRODUCTS: 'https://storageaccountdott.blob.core.windows.net/mlmimages/product.svg',
    WALLETS: 'https://storageaccountdott.blob.core.windows.net/mlmimages/Wallets.svg',
    CARDS: 'https://storageaccountdott.blob.core.windows.net/mlmimages/Wallets.svg',
    HUB: 'https://storageaccountdott.blob.core.windows.net/mlmimages/Wallets.svg',
    PAYMENTS: 'https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/nav_inactivepayments.svg',
    BANK: 'https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/nav_inactivebank.svg',

}


export const walletsTabsNavigation = 'WalletsAllCoinsList';
export const supportMail = 'support@rapidz.money'

const CONFIGURATION = {
    IDENITY_CONFIG: {
        AUTH0: false,// Set to true if Auth0 manual screen is used for authentication
        AUTH0_SDK_LOGIN: true,// Set to true if Auth0 SDK is used for authentication
        ID_SERVER: false
    },
    TABS: [
        { title: "GLOBAL_CONSTANTS.HOME", componentName: "_home", isDisplay: true, iconWidth: 22, iconHeight: 20, icon: ICONSURLS.HOME, isActive: true },
        { title: "GLOBAL_CONSTANTS.PACKAGES", componentName: "_packages", isDisplay: false, iconWidth: 20, iconHeight: 18, icon: ICONSURLS.PRODUCTS, isActive: false },
        { title: "GLOBAL_CONSTANTS.SHOP", componentName: "_products", isDisplay: false, iconWidth: 20, iconHeight: 18, icon: ICONSURLS.PRODUCTS, isActive: false },
        { title: "GLOBAL_CONSTANTS.WALLETS", componentName: "_wallets", isDisplay: true, iconWidth: 22, iconHeight: 24, icon: ICONSURLS.WALLETS, isActive: false },
        { title: "GLOBAL_CONSTANTS.ORDERS", componentName: "_orders", isDisplay: false, iconWidth: 19, iconHeight: 19, icon: ICONSURLS.ORDERS, isActive: false },
        { title: "GLOBAL_CONSTANTS.CARDS", componentName: "_cards", isDisplay: true, iconWixdth: 19, iconHeight: 19, icon: ICONSURLS.CARDS, isActive: false },
        { title: "GLOBAL_CONSTANTS.PROFILE", componentName: "_profile", isDisplay: false, iconWixdth: 19, iconHeight: 19, icon: ICONSURLS.CARDS, isActive: false },
        { title: "GLOBAL_CONSTANTS.HUB", componentName: "_hub", isDisplay: false, iconWidth: 22, iconHeight: 24, icon: ICONSURLS.HUB, isActive: false },
        { title: "GLOBAL_CONSTANTS.AI", componentName: "_ai", isDisplay: false, iconWixdth: 19, iconHeight: 19, icon: ICONSURLS.CARDS, isActive: false },
        { title: "GLOBAL_CONSTANTS.BANK", componentName: "_bank", isDisplay: true, iconWixdth: 19, iconHeight: 19, icon: ICONSURLS.BANK, isActive: false },
        { title: "GLOBAL_CONSTANTS.PAYMENTS", componentName: "_payments", isDisplay: true, iconWixdth: 19, iconHeight: 19, icon: ICONSURLS.PAYMENTS, isActive: false },
        { title: "GLOBAL_CONSTANTS.EXCHANGE", componentName: "_exchange", isDisplay: true, iconWidth: 19, iconHeight: 19, icon: ICONSURLS.ORDERS, isActive: false },

    ],
    COMMON_CONFIGURATION: {
        IS_SKIP_KYC_VERIFICATION_STEP: true,
        AMOUNT_INPUT_IOS_HEIGHT_FIX: s(68),
        AMOUNT_INPUT_ANDROID_HEIGHT_FIX: s(70),
        isDetailsBgShow: false,
        uploadIcon: false,
        uploadProfile: false,
        bankSucesssRbsheetHeight: false,
        shareButton: false,
        inviteFriends: false,
        sumsubBanner: false,
        minMaxbg: false,
        showTitleAndCloseIconInRbsheet: false,
        availableAmount: false,
        isLinearGradientApply: false,
        tabContainer: false,
        isBottomSheetSearchBgApplied: false,
        showCheckIconForSelectedItem: false,
        AMOUNT_LABEL_DISPLAY: false,
        USE_UI_COLORS: false,
        REFERAL_BANNER: false,
        SHOW_NOTICES: true
    },
    WALLETS: {
        QUCIKLINKS: {
            Buy: false,
            Sell: false,
            Withdraw: true,
            Swap: false,
            Deposit: true,
            AddVault: false,
            BuyCoupon: false,
            Samrat_withdraw: false,
            IS_ON_THE_GO: false
        },
        BRL_Reapply: false,
        NETWORK_DATA: true,
        SELECTED_COIN_DATA_ACTIVE_INACTIVE: false,
    },
    CRYPTO: {
        QUCIKLINKS: {
            Withdraw: true,
            Deposit: true,
            AddVault: false,
        }
    },
    HOME: {
        QUCIKLINKS: {
            Crypto: false,
            Cards: false,
            Bank: false,
            Payments: false,
            Withdraw: true,
            Deposit: true,
        },
        KrishnaKpis: {
            avilableBalnceKpi: false,
        },
        KrishnaSection: {
            WalletKpis: false,
            MyCardsSection: false,
            bounses: false,
            Introducer: false,
            Income: false,
            RecentActivity: false
        },
        SamartAdvertisment: {
            adertisment: true,
            storeOffer: true,
            Analytics: true
        },
        SamartCurrentBalnceKpi: {
            currentValuekpi: true,
            kpisection: true,
        },
        smartRecenActivity: {
            RecentActivity: true
        },
        INVITE_FRIENDS: false,
        VERIFY_IDENTITY: true,
        CARDS_SECTION: true,
        //smashpay
        BANK_BANNER_SECTION_TITTLE: false,
        CARD_BANNER_SECTION_TITTLE: false,
    },
    CARDS: {
        QUCIKLINKS: {
            MyCards: true,
            AssignCards: true,
            ApplyCards: true,
            BindCards: true,
        },
        cardDetailsShow: false,
        cardDashboardBannerSmashpayImageDisplay: false,
        applicardBannerDesignChanges: false,
        applyCardNoteBannerBottomDisplay: false,
        chooseCardDetailsDotApply: false,
        supportedPlatformsWithIconDisplay: false,
        mycardsListStatusBackgroundColor: false,
        CARD_ICON_AND_ASSOCS: false,
        CARD_LIMIT_DETAILS_HIDE: false,
    },
    PAYEES: {
        QUCIKLINKS: {
            BankFields: false
        }
    },
    PAYMENTS: {
        QUICK_LINKS: {
            AddVault: false,
            PayIn: true,
            PayOut: true,
            Transactions: true,
        },
        FIAT_PAYINS: true,
        CRYPTO_PAYINS: true,
        FIAT_PAYOUTS: true,
        CRYPTO_PAYOUTS: true,
        TAX_ID_ONLY: true,
        //smashpay
        payinEditButtonTextChange: false,
        PAYIN_NOTE_BOTTOM_SHOW: false,
    },
    ADDS_AND_GRAPG_CONFIGURATION: {
        ADDS: {
            Home: false,
            Bank: false,
            Cards: false,
            Crypto: false,
            Payments: false,
            SamratWallet: false,
        },
        GRAPH: {
            Home: true,
            Bank: false,
            Cards: true,
            Crypto: true,
            Payments: true,
            SamratWallet: true,
            AssetCoin: true,
        },
        KPIS: {
            Home: true,
            Bank: true,
            Cards: false,
            Crypto: true,
            Payments: true,
            SamratWallet: true,
        },
        ASSETS: {
            Home: false,
            SamratWallet: false,
            Crypto: true,
            Fiat: true,
        },
        RECENT_ACTIVITY: {
            HOME: true,
            Crypto: true,
        },
        DASHBOARD_LOADER: false
    },
    MENU_DRAWER_CONGIGURATION: {
        PROFILE_INFORMATION: true,
        SECURITY: true,
        KYC_INFORMATION: false,
        ADDRESS: true,
        MEMBERS: true,
        GENEALOGY: true,
        TRANSACTIONS: true,
        PAYEES: false,
        FEES: false,
        SETTINGS: true,
        COUPONS: false,
        MY_ORDERS: true,
        LOGOUT: true,
        BONUSES: true,
        BANKDETAILS: true,
        HELP_CENTER: true,
        AVATAR: false,
        SMASH_PAY_AVATAR: false,
        ALL_ADDRESS_LIST_SMASHPAY_DESIGN: false,
    },
    CURRENCY: {
        "USD": '$',
        "INR": "₹",
        "USDC": '$',
        "USDT": '$',
        "EUR": '€',
        "GBP": '£',
        "BTC": "₿",
        "ETH": "Ξ",
        "CHF": "€",
        "IDR": "Rp",
        "BRL": "R$"
    },
    PRODUCTS_CONFIGURATION: {
        AMOUNTS: false,
        PV_POINTS: true,
        ADD_TO_CART: true,
        RATINGS: false,
        HOW_TO_USE: false,
        CATEGORY: true,
        ADD_ITEMS: true,
        STOCK_AVAILABLE: true
    },
    PAYMENT_METHODS: {
        WALLET_BALANCE: false,
        COUPONS_BALANCE: false,
        E_WALLET_BALANCE: false
    },
    SECURITY_SECTION: {
        RESET_PASSWORD: true,
        ENABLE_2_FA: true,
        SEND_VERICATION: true
    },
    ONBOARDING: {
        NETWORK_POSITION: false,
        IS_INITIAL_KYC: false,
        IS_INITIAL_SUBSCRIPTION: false,
        //Smashpay
        PASSWORD_CRITERIES_LABEL_SHOW: true,
        IS_SIGN_IN_IMAGE: false,
    },
    NETWORK_GENELOALOGY: {
        UNIL_LEVEL: true,
        BINARY_LEVEL: false
    },
    REFERRALS: {
        ADVERTISEMENT: true
    },
    LANGUAGES: {
        "en": true,
        "te": false,
        "ar": false,
        "ms": true,
        "de": true

    },
    BANK: {
        QUICK_LINKS: {
            Diposit: true,
            Withdraw: true,
            Exchange_transfer: false,
        }
    },
    EXCHANGE: {
        QUCIKLINKS: {
            Buy: true,
            Sell: true,
        },
        HIDE_COIN_NAMES: false,
        HIDE_NETWORKS: true,
        IS_EXCHANGE_SKIP_KYC_VERIFICATION_STEP: false,
    },
    CURRENCY_DECIMAL_PLACES: {
        "USD": 2,
        "INR": 2,
        "USDC": 2,
        "USDT": 2,
        "EUR": 2,
        "GBP": 2,
        "CHF": 2,
        "IDR": 2,
        "BRL": 2,
        "BTC": 4,
        "ETH": 4,
        "SOL": 4,
        "XSGD": 4,
        "MYRC": 4
    },

    COMMON: {
        isDetailsBgShow: true,
        uploadIcon: true,
        uploadProfile: true,
        referralBanner: true,
        bankSucesssRbsheetHeight: true

    },

    COMMON_COMPONENTS: {
        showTitleAndCloseIconInRbsheet: false,
        isLinearGradientApply: false,
    }
}

export const getTabsConfigation = type => {
    return CONFIGURATION[type] || [];
}
export const isDecimalSmall = false
export const getLanguageConfiguration = () => {
    const languages = Object.entries(CONFIGURATION.LANGUAGES)
        .filter(([key, value]) => value === true)
        .map(([key]) => key);
    return languages;
};