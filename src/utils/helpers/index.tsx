
export const formatDateLocal = (transactionData: any) => {
  if (typeof transactionData === "string") {
    transactionData =
      transactionData.indexOf("Z") === -1
        ? transactionData + "Z"
        : transactionData;
  }
  const date = new Date(transactionData);
  const options: any = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  let formattedDate = "--";
  if (transactionData) {
    formattedDate = date?.toLocaleString("en-US", options);
  }

  return formattedDate;
};
