export const MOCK_BENEFICIARIES = [
  {
    id: "1",
    name: "John Doe",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1234567890",
    bankDetails: {
      transferType: "Swift",
      accountNumber: "1234567890",
      accountType: "Savings",
      routingNumber: "123456789",
      branchCode: "123456789",
      bankAccountCountry: "USA",
      bankDocumentNumber: "1234567890",
      bankId: "1234567890",
      ifscCode: "1234567890",
      sortCode: "1234567890",
      bankIdentifierCode: "1234567890",
      bsbCode: "1234567890"
    },
    compliance: {
      remittancePurpose: "Family Support",
      relationship: "Spouse",
      sourceOfFunds: "Income"
    }
  },
  {
    id: "2",
    name: "Jane Smith",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    phone: "+1987654321",
    bankDetails: {
      transferType: "ACH",
      accountNumber: "9876543210",
      accountType: "Checking",
      routingNumber: "987654321",
      branchCode: "987654321",
      bankAccountCountry: "USA",
      bankDocumentNumber: "9876543210",
      bankId: "9876543210",
      ifscCode: "9876543210",
      sortCode: "9876543210",
      bankIdentifierCode: "9876543210",
      bsbCode: "9876543210"
    },
    compliance: {
      remittancePurpose: "Business Payment",
      relationship: "Business Partner",
      sourceOfFunds: "Business Income"
    }
  }
];
