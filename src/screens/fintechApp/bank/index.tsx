/**
 * BANK MODULE - SIMPLE COMPONENT EXPORTS
 * 
 * 🎯 PURPOSE: Basic entry point for Bank module React components
 * 📦 EXPORTS: Only React components and schemas (no types/interfaces)
 * 
 * 👨💻 FOR DEVELOPERS:
 * - Use this for importing components in navigation or other screens
 * - Example: import { BankDashboard } from './bank'
 * - For types/interfaces, use mainIndex.ts instead
 * 
 * 🔄 DIFFERENCE FROM mainIndex.ts:
 * - This file: Only components (for UI)
 * - mainIndex.ts: Everything (components + types + interfaces)
 */

// ===== MAIN COMPONENTS =====
// Primary bank dashboard component
export { default as BankDashboard } from './Dashboard';

// ===== WITHDRAW COMPONENTS =====
// Components for money withdrawal flow
export { default as SendFiatAmount } from './withdraw/components/SendFiatAmount';        // Amount input screen
export { default as WithdrawSummary } from './withdraw/components/withDrawSummary';      // Summary before confirmation
export { default as WithdrawSuccess } from './withdraw/components/WithdrawSuccess';      // Success confirmation screen
export { default as DynamicFieldRenderer } from './withdraw/components/DynamicFieldRenderer';  // Dynamic form fields
export { default as FiatPayeeListSheetContent } from './withdraw/components/FiatPayeeListSheetContent'; // Payee selection sheet

// ===== VALIDATION SCHEMAS =====
// Form validation rules for withdraw flow
export * from './withdraw/schemas/SendFiatSchema';

/**
 * 💡 USAGE EXAMPLES:
 * 
 * // In navigation files:
 * import { BankDashboard } from './bank';
 * 
 * // In other screens:
 * import { SendFiatAmount, WithdrawSummary } from './bank';
 * 
 * // For types, use mainIndex.ts:
 * import { KycDetails, BankAccount } from './bank/mainIndex';
 */
