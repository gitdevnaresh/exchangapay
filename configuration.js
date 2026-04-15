import { ICONSURLS } from "./src/assets/blobUrls";

const CONFIGURATION = {
    IDENITY_CONFIG: {
        AUTH0: false,  //if auth0 logins make it true the flag
        FFRONTEGG: {
            enabled: true,    //Main Frontegg feature flag and need to enable manual flow or sdk flow  need to make it true (need to enable 2 for frontegg)
            manualForm: true,  //manualForm means  frontegg inside logins 
            sdk: false   //  front eggsdk login
        }
    },
    PASSWORD_LEVEL: {
        passwordLevel: "hard", // "medium" or "hard" For Tst add Medium-[8] for Stagging Add Hard-[10]
        criteria: {
            medium: {
                minLength: 8,
                maxLength: 32,
                maxRecurringChars: 3
            },
            hard: {
                minLength: 10,
                maxLength: 32,
                maxRecurringChars: 3
            }
        }
    },

    TABS: [
        { title: "GLOBAL_CONSTANTS.HOME", componentName: "_home", isDisplay: true, iconWidth: 22, iconHeight: 20, icon: ICONSURLS.HOME, isActive: true },
        { title: "GLOBAL_CONSTANTS.PACKAGES", componentName: "_packages", isDisplay: false, iconWidth: 20, iconHeight: 18, icon: ICONSURLS.PRODUCTS, isActive: false },
        { title: "GLOBAL_CONSTANTS.SHOP", componentName: "_products", isDisplay: false, iconWidth: 20, iconHeight: 18, icon: ICONSURLS.PRODUCTS, isActive: false },
        { title: "GLOBAL_CONSTANTS.WALLETS", componentName: "_samratWallets", isDisplay: false, iconWidth: 22, iconHeight: 24, icon: ICONSURLS.WALLETS, isActive: false },
        { title: "GLOBAL_CONSTANTS.ORDERS", componentName: "_orders", isDisplay: false, iconWidth: 19, iconHeight: 19, icon: ICONSURLS.ORDERS, isActive: false },
        { title: "GLOBAL_CONSTANTS.TAB_REWARDS", componentName: "_rewards", isDisplay: true, iconWidth: 22, iconHeight: 20, icon: ICONSURLS.HOME, isActive: true },
        { title: "GLOBAL_CONSTANTS.REFER", componentName: "_refer", isDisplay: true, iconWidth: 22, iconHeight: 20, icon: ICONSURLS.HOME, isActive: true },
        { title: "GLOBAL_CONSTANTS.CARDS", componentName: "_cards", isDisplay: true, iconWixdth: 19, iconHeight: 19, icon: ICONSURLS.CARDS, isActive: false },
        { title: "GLOBAL_CONSTANTS.PROFILE", componentName: "_profile", isDisplay: false, iconWixdth: 19, iconHeight: 19, icon: ICONSURLS.CARDS, isActive: false },
        { title: "GLOBAL_CONSTANTS.HUB", componentName: "_hub", isDisplay: false, iconWidth: 22, iconHeight: 24, icon: ICONSURLS.HUB, isActive: false },
        { title: "GLOBAL_CONSTANTS.AI", componentName: "_ai", isDisplay: false, iconWixdth: 19, iconHeight: 19, icon: ICONSURLS.CARDS, isActive: false },
        { title: "GLOBAL_CONSTANTS.PERKS", componentName: "_perks", isDisplay: false, iconWidth: 22, iconHeight: 24, icon: ICONSURLS.HUB, isActive: false },
        { title: "GLOBAL_CONSTANTS.HUB", componentName: "_hub", isDisplay: false, iconWixdth: 19, iconHeight: 19, icon: ICONSURLS.CARDS, isActive: false },
    ],
    WALLETS: {
        QUCIKLINKS: {
            Buy: false,
            Sell: false,
            Withdraw: true,
            Swap: false,
            Deposit: true,
            AddVault: false,
            BuyCoupon: false,
            Samrat_withdraw: false
        },

    },
    HOME: {
        QUCIKLINKS: {
            Crypto: false,
            Cards: false,
            Bank: false,
            Payments: false,
            Withdraw: true,
            Deposit: true,
            send: true,
            convert: false,
            scanQrCode: true,
            Gift: false
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
    },
    CARDS: {
        QUCIKLINKS: {
            MyCards: true,
            AssignCards: true,
            ApplyCards: true,
            BindCards: true,
        }
    },
    PAYEES: {
        QUCIKLINKS: {
            BankFields: false
        }
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
        },
        RECENT_ACTIVITY: {
            HOME: true,
            Crypto: true,
        }
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
        HELP_CENTER: true
    },
    CURRENCY: {
        "USD": '$',
        "INR": "₹",
        "USDC": '$',
        "USDT": '$',
        "EUR": '€',
        "GBP": '£',
        "BTC": "₿",
        "ETH": "Ξ"
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
        IS_INITIAL_SUBSCRIPTION: false
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
        "ms": false,
        "de": false

    },
}
export const getTabsConfigation = type => {
    return CONFIGURATION[type] || [];
}
export const getLanguageConfiguration = () => {
    const languages = Object.entries(CONFIGURATION.LANGUAGES)
        .filter(([key, value]) => value === true)
        .map(([key]) => key);
    return languages;
};


