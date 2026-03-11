export const formatBillingAddress = (address: any) => {
  if (!address) return '';
  const fields = [
    address.cardholder,
    address.address1,
    address.address2,
    address.town,
    address.city,
    address.state,
    address.country,
    address.postalCode
  ].filter(Boolean);
  return fields.join(', ');
};