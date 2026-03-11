export interface ReplacementFee {
  amount: number;
  currency: string;
}

export interface CardData {
  id: string;
  name: string;
  number: string;
  replacementFee: ReplacementFee; // This is correct, as replacementFee is an object of type ReplacementFee
  type: "Virtual" | "Physical"; // You can expand this union if there are more types
  // Add other properties that might be present in the card data if needed
  logo?: string; // Assuming 'logo' might be part of cardData
  assoc?: string; // Assuming 'assoc' might be part of cardData
  cardName?: string; // Assuming 'cardName' might be part of cardData
}

export interface DeleteFee {
  amount: number;
  currency: string;
}

export interface DeleteCardData {
  id: string;
  name: string;
  number: string;
  deleteFee: DeleteFee; // This is correct, as replacementFee is an object of type ReplacementFee
  type: "Virtual" | "Physical"; // You can expand this union if there are more types
  // Add other properties that might be present in the card data if needed
  logo?: string; // Assuming 'logo' might be part of cardData
  assoc?: string; // Assuming 'assoc' might be part of cardData
  cardName?: string; // Assuming 'cardName' might be part of cardData
}