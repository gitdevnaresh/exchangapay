interface Option {
    label: string;
    value: string;
  }
  
export  interface CreateInvoiceRadioButtonProps {
    options: Option[];
    radioIsSide?: boolean;
    selectedOption: string;
    onSelect: (value: string) => void;
    nameField?: string;
    valueField?: string;
    isDisabled ?:boolean;
  }