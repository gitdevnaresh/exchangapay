export interface CardPrivacyControlOption {
  key: string;
  type: string;
  title: string;
  description: string;
  isEnabled: boolean;
  method?:any;
}

export interface CardPrivacyControlResponse {
  ok: boolean;
  data: CardPrivacyControlOption[] & { selectedOption: string };
}
