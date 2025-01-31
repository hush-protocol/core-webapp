export type RecoveryCanisterOption = {
  key: string;
  label: string;
  component: string;
};
export const RECOVERY_CANISTERS_OPTIONS : RecoveryCanisterOption[] = [
  {key:"b77ix-eeaaa-aaaaa-qaada-cai",label:"Email Verification Using DKIM",component:"email-dkim-form"},
  {key:"j",label:"Github Verification Using zkTLS",component:"github-tlszk-form"},
  {key:"c5kvi-uuaaa-aaaaa-qaaia-cai",label:"Aadhar Verification Using Zk",component:"aadhar-zk-form"},
]
