export interface ApplicationInfo {
  androidBuildVersion: number;
  androidForceUpdateVersion: number;
  iosBuildVersion: number | string;
  iosForceUpdateVersion: number | string;
}

export interface ApplicationDetail {
  applicationId: string;
  applicationInfo: ApplicationInfo;
}

export interface VersionInfo {
  androidBuildVersion: number;
  androidForceUpdateVersion: number;
  iosBuildVersion: number | string;
  iosForceUpdateVersion: number | string;
  Info: ApplicationDetail[];
}

export type FeedbackReasonList = FeedbackReason[];
export interface FeedbackReason {
  code: string;
  flag: string | null;
  length: number;
  logo: string | null;
  name: string;
  recorder: number;
}
