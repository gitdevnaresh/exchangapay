export interface TransactionDetailsProps {
  modalVisible: boolean;
  closePopUp: () => void;
  transactionId: string;
  txType?: string;
}