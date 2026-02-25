export interface TeamMember {
  id: string;
  refId: string;
  registeredDate: string;
  status: string;
  customerState: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
  phoneCode: string;
  image?:string;
}

export interface KpiItem {
  name: string;
  value: string | number;
  isCount?: boolean;
}

export interface StatusLookup {
  id: string | number;
  name?: string;
  code?: string;
  image?: string;
  recorder?: number;
  remarks?: string;
  states?: string;
  details?: string;
  [key: string]: string | number | undefined;
}

export interface TeamsListResponse {
  ok: boolean;
  data: {
    data: TeamMember[];
    total: number;
  };
}

export interface TeamsKpisResponse {
  ok: boolean;
  data: KpiItem[];
}

export interface TeamsLuResponse {
  ok: boolean;
  data: {
    TeamStatus: StatusLookup[];
    PhoneCodes: StatusLookup[];
    TeamMemberTransactionLookUp: StatusLookup[];
  };
}

export interface KycLookupResponse {
  ok: boolean;
  data: {
    Gender: StatusLookup[];
    Country: StatusLookup[];
    PhoneCodes: StatusLookup[];
  };
}

export interface ApiResponse {
  ok: boolean;
  data?: any;
}

export interface CardDetails {
  id: string;
  number: string;
  expireDate: string;
  cvv: string;
  isFreezEnable: boolean;
  colorCode: string;
  holderName: string;
  assignedTo: string;
  isCompanyCard: boolean;
  programId: string;
  name: string;
  type: string;
  image: string;
  amount: number;
  state: string;
  cardCurrency: string;
  assoc: string;
  balance?: number;
  currency?: string;
  cardName?: string;
  status?: string;
}

export interface CardApiResponse {
  ok: boolean;
  data?: {
    data: CardDetails[];
    total?: number;
  } | CardDetails;
}

export interface HistoryItem {
  id: string;
  cardWalletId: string;
  cardName: string;
  action: string;
  createdBy: string;
  status: number;
  createdDate: string;
}

export interface CardHistoryResponse {
  ok: boolean;
  data: {
    data: HistoryItem[];
    total?: number;
  };
}

export interface Card {
  id: string;
  name: string;
  type: string;
  balance: number;
  number: string;
  image: string;
  state: string;
}

export interface MemberCardsResponse {
  ok: boolean;
  data: {
    data: Card[];
    total: number;
  };
}

export interface KpiResponse {
  ok: boolean;
  data: KpiItem[];
}

export interface Transaction {
  id: string;
  transactionId: string;
  date: string;
  vaultOrCardName: string;
  txType: string;
  type: string;
  network: string;
  amount: number;
  state: string;
  wallet?: string;
  isFiatOrCrypto?: string;
}

export interface MemberTransactionsResponse {
  ok: boolean;
  data: {
    data: Transaction[];
    total: number;
  };
}
export interface CardDetailState {
  loading: boolean;
  errormsg: string;
  cardData: CardDetails | null;
  allMemberCards: CardDetails[];
  activeCardId: string;
  carouselActiveIndex: number;
  tabLoading: boolean;
  index: number;
  routes: TabRoute[];
  cardDetailsLoading: boolean;
}
export interface MemberDetailsResponse {
  ok: boolean;
  data: any;
}

export interface TransactionDetail {
  volume: number;
  id: string;
  txId: string;
  date: string;
  name: string;
  type: string;
  wallet: string;
  network: string;
  amount: string;
  fee: number;
  netAmount: number | null;
  adrress: string | null;
  adminStatus: string;
  accountName: string | null;
  description: string | null;
  remarks: string;
  hashId: string;
  status: string;
}

export interface CardTransactionDetailsProps {
  modalVisible: boolean;
  transactionId: string;
  closePopUp: () => void;
}

export interface TransactionDetailsResponse {
  ok: boolean;
  data: TransactionDetail;
}

export interface DownloadResponse {
  ok: boolean;
  data: string;
}

export interface TransactionsResponse {
  ok: boolean;
  data: {
    data: Transaction[];
    total: number;
  };
}



export interface TransactionDetails {
  id: string;
  transactionId: string;
  date: string;
  vaultOrCardName: string;
  txType: string;
  type: string;
  network: string;
  amount: number;
  state: string;
  hash?: string;
  fee?: number;
  walletAddress?: string;
  remarks?: string;
}

export interface TransactionDetailViewProps {
  modalVisible?: boolean;
  transactionId?: string;
  closePopUp?: () => void;
  route?: {
    params?: {
      transactionId?: string;
      transactionData?: TransactionDetails;
    };
  };
}

export interface CardHistoryTabProps {
  cardId: string;
  isActiveTab?: boolean;
  onError?: (error: string) => void;
}


interface RouteParams {
  cardId: string;
  cardName?: string;
}

export interface NavigationProps {
  route: {
    params: RouteParams;
  };
}

export interface HistoryDataResponse {
  data: HistoryItem[];
  total: number;
}

export interface CardDetailRouteParams {
  cardId: string;
  cardData?: CardDetails;
  memberId: string;
}

export interface CardDetailNavigationProps {
  route: {
    params: CardDetailRouteParams;
  };
}

export interface TabRoute {
  key: string;
  title: string;
}

export interface TabProps {
  navigationState: {
    index: number;
    routes: TabRoute[];
  };
}

export interface SceneProps {
  route: TabRoute;
}

export interface MemberDetails {
  firstName?: string;
  fullName?: string;
  refId?: string;
  email?: string;
  phoneCode?: string;
  phoneNo?: string;
  gender?: string;
  country?: string;
  registeredDate?: string;
  image?:string;
}

export interface MemberInfoSectionProps {
  memberDetails?: MemberDetails;
  memberData?: MemberDetails;
  showRefId?: boolean;
}

export interface TeamCardsRouteParams {
  memberId: string;
  memberData?: any;
  memberName?: string;
}

export interface TeamCardsNavigationProps {
  route: {
    params: TeamCardsRouteParams;
  };
}

export interface ReduxState {
  userReducer?: {
    userDetails?: {
      currency?: string;
    };
  };
}

export interface TeamCardsViewRouteParams {
  memberId: string;
  memberData?: any;
}

export interface TeamCardsViewNavigationProps {
  route: {
    params: TeamCardsViewRouteParams;
  };
}

export interface InviteMemberFormValues {
  userName: string;
  firstName: string;
  lastName: string;
  gender: string;
  country: string;
  phoneCode: string;
  phoneNumber: string;
  email: string;
  memberId: string;
}

export interface GenderOption {
  label: string;
  value: string;
}

export interface UserInfo {
  id: string;
  [key: string]: any;
}

export interface InviteMemberPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneCode: string;
  phoneNo: string;
  membershipType: null;
  referrerId: string;
  status: string;
  gender: string;
  country: string;
  userName: string;
  memberId: string;
}

export interface CardTransactionsListRouteParams {
  memberId: string;
  memberName?: string;
}

export interface CardTransactionsListNavigationProps {
  route: {
    params: CardTransactionsListRouteParams;
  };
}

export interface RenderTransactionProps {
  item: Transaction;
  index: number;
}

export interface TeamTransactionsListRouteParams {
  memberId: string;
  memberData?: any;
  memberDetails?: any;
}

export interface TeamTransactionsListNavigationProps {
  route: {
    params: TeamTransactionsListRouteParams;
  };
  accountType?: string;
}

export interface TransactionListItemSeparatorProps {
  commonStyles: any;
}

export interface FormikDateValues {
  startDate: Date | null;
  endDate: Date | null;
}

export interface UserDetails {
  currency?: string;
  [key: string]: any;
}

export interface UserState {
  login: boolean;
  userDetails: UserDetails | null;
  userInfo: string;
  personalInfo: string;
  accountInfo: string;
  screenName: string;
  isCustodial: string;
  usersWalletsList: any[];
  allCards: any[];
  isOnboardingSteps: boolean;
  appTheme: string;
  cartCount: string;
  referralCode: string;
  showBiometricPrompt: boolean;
  applyCardData: any;
  menuItems: any[];
  screenPermissions: any;
  identityDocuments: any[];
  selectedCurrency: any;
  selectedBank: any;
  selectedAddresses: any[];
  ipAddress: string;
  personalDob: any;
  uboFormData: any;
  uboFormDataList: any[];
  directorFormData: any;
  directorFormDataList: any[];
  documentsData: any;
  deletedApiItems: any[];
  isReapply: boolean;
  sectors: string;
  types: string;
  hasAccountCreationFee: any;
}

export interface RootState {
  userReducer: UserState;
}

export interface CustomRBSheetRef {
  open: () => void;
  close: () => void;
}
export interface CardTransactionsTabProps {
  cardId: string;
  currency?: string;
  isActiveTab?: boolean;
  onError?: (error: string) => void;
}
export interface TeamListViewProps {
  route?: {
    params?: {
      selectedStatus?: string;
      searchQuery?: string;
    };
  };
}
