// Bank TypeScript type definitions
export interface BankAccount {
  id: string;
  name: string;
  currency: string;
  amount: number;
  accountNumber?: string;
  bankStatus: string;
}

export interface BankKpiResponse {
  ok: boolean;
  data: BankAccount[];
}

export interface BankAccountResponse {
  ok: boolean;
  data: {
    totalAmount: number;
  };
}

export interface PaymentPayload {
  amount: number;
  currency: string;
  accountId: string;
}

export interface KybRequirement {
  id: string;
  name: string;
  required: boolean;
  type: string;
}

export interface UboDetails {
  id: string;
  name: string;
  percentage: number;
  type: string;
}