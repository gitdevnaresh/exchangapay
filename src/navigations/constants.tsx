export interface TabScreenConfig {
  name?: string;
  component?: React.ComponentType<any>;
  title?: string;
  icon?: any;
  isDisplay?: any;
  iconWidth?: any;
  iconHeight?: any;
}

export const APP_CONSTANTS = {
  HOME: 'Home',
  PRODUCTS: "Products",
  WALLETS: 'Wallets',
  ORDERS: 'Orders',
  CARDS: 'Cards',
  PACKAGES: "Packages"
}

export const NAVIGATIONS_CONSTANTS = {

}

interface IconItem {
  active: React.ReactNode;
  inactive: React.ReactNode;
}

export interface CustomIcons {
  _home: IconItem;
  _cards?: IconItem;
  _perks: IconItem;
  _hub: IconItem;
  _rewards?: IconItem;
  _refer?:IconItem;
}

export interface TabConfig {
  title: string;
  componentName: string;
  isDisplay: boolean;
}
export interface NotificationCountResponse {
  ok: boolean;
  data?: number | null | undefined | unknown;
}
