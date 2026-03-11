export interface Network {
  id: string;
  name: string;
  code: string;
  minLimit: number;
  maxLimit: number;
  depositMinLimit: number;
  depositMaxLimit: number;
  address: string | null;
  amount: number;
  logo?: string;
}
export interface Payee {
  id: string;
  payeeId: string;
  favoriteName: string;
  walletAddress: string;
  state: string; // Added state for grouping
  network: string; // Added network for filtering
}