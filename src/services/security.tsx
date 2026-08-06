import { get } from "../utils/ApiService";
// M-09: changePassword was removed. It called api.put() (the unhardened
// legacy API instance — no bearer token, no attestation, no pinning) against
// a password-change endpoint. Dead code that reaches a security endpoint over
// an unhardened channel has negative value: a future developer would wire it up
// and inherit the vulnerability silently.
//
// The live password-reset path is getResetPassword() below, which correctly
// goes through the hardened get() from ApiService.ts.
//
// Any future password-change flow must:
//   1. Go through ApiService.ts (bearer token + attestation interceptors).
//   2. Be added to the attestationPolicy.ts fragment list.
//   PASSWORD_CHANGE is already a HighRiskOperation in guard.ts — the guard
//   exists, the route just must not bypass it.
//
// Backend action required: confirm PUT api/v1/Customer/ChangePWD on
// the first-party API requires authentication and step-up.
// If it does not, that is a Critical backend finding independent of this client.
const SecurityService = {
  getResetPassword: async () => {
    return get(`api/v1/Security/ResetPWD`);
  },
};
export default SecurityService;
