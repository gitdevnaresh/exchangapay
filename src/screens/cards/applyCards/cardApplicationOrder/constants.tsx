import { Address, Card } from "../interface";

export function buildApplyCardPayload({
  card,
  promoCode,
  billingAddress,
  shippingAddress,
  encryptAES,
}: {
  card: Card;
  promoCode: string;
  billingAddress: Address;
  shippingAddress?: Address;
  encryptAES: (text: string) => string;
}) {
  const isPhysical = card.cardType === 'Physical';
  return( {
    programId: card.id,
    promoCode,
    billingAddress: {
      CardHolderName: encryptAES(billingAddress.cardholderName),
      addressLine1: billingAddress.address1||"",
      addressLine2: billingAddress.address2||"",
      town: billingAddress?.town||"",
      city: billingAddress.city,
      state: billingAddress.state,
      postalCode: encryptAES(billingAddress.postalCode),
      country: billingAddress.country,
    },
    ...(isPhysical && shippingAddress && {
      shippingAddress: {
        CardHolderName: encryptAES(shippingAddress.cardholderName),
        addressLine1: shippingAddress.address1 || "",
        addressLine2: shippingAddress.address2 || "",
        town: shippingAddress.town || "",
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: encryptAES(shippingAddress.postalCode),
        country: shippingAddress.country,
      }
    })
  })
}