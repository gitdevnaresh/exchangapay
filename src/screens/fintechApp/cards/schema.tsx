import * as Yup from "yup";
export const CreateTopUpSchema = (data: any) => {
  const minAmount = data?.minLimit;
  const maxAmount = data?.maxLimit;
  return Yup.object().shape({
    currency: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    amount: Yup.string()
      .required("GLOBAL_CONSTANTS.IS_REQUIRED")
      .test('is-min-valid', `Please top up the minimum amount.`, (value) => {
        if (minAmount === null || minAmount === undefined) return true;
        const amount = parseFloat(value as string);
        if (isNaN(amount)) return true;
        return amount >= minAmount;
      })
      // Check for maxAmount validation
      .test('is-max-valid', `Should not exceed ${maxAmount ? Number(maxAmount).toFixed(2) : 'the limit'}`, (value) => {
        if (maxAmount === null || maxAmount === undefined) return true;
        const amount = parseFloat(value as string);
        if (isNaN(amount)) return true;
        return amount <= maxAmount;
      }),
  });
}

export const CreateWithdrawSchema = (data: any) => {
  const minAmount = data?.minLimit;
  const maxAmount = data?.maxLimit;
  return Yup.object().shape({
    currency: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    network: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    amount: Yup.string()
      .required("GLOBAL_CONSTANTS.IS_REQUIRED")
      .test('is-min-valid', `Please top up the minimum amount.`, (value) => {
        if (minAmount === null || minAmount === undefined) return true;
        const amount = parseFloat(value as string);
        if (isNaN(amount)) return true;
        return amount >= minAmount;
      })
      // Check for maxAmount validation
      .test('is-max-valid', `Should not exceed ${maxAmount ? Number(maxAmount).toFixed(2) : 'the limit'}`, (value) => {
        if (maxAmount === null || maxAmount === undefined) return true;
        const amount = parseFloat(value as string);
        if (isNaN(amount)) return true;
        return amount <= maxAmount;
      }),
  });
}

export const QuickLinkSchema = (bindCardInfo: any) => {
  return Yup.object().shape({
    cardNumber: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED")
      .matches(/^\d+$/, "GLOBAL_CONSTANTS.INVALID_CARD_NUMBER")
      .length(16, "GLOBAL_CONSTANTS.CARD_NUMBER_MUST_16_DIGITS"),
    handHoldingIDPhoto: bindCardInfo?.needPhotoForActiveCard
      ? Yup.string().required('is required')
      : Yup.string().notRequired(),
    envelopNumber: bindCardInfo?.envelopeNoRequired
      ? Yup.string()
        .matches(/^[a-zA-Z0-9]+$/, 'Member number must contain only alphabets, numerics, or both')
        .required('is required')
      : Yup.string().notRequired(),
  });
};