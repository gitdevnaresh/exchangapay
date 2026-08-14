/**
 * The repo has shipped a `test` script, a jest dependency, `@types/jest` and a
 * populated `__mocks__/` directory for some time with no config for any of it
 * to use, so `npm test` matched nothing and exited clean — the same failure
 * shape as the missing-eslintrc finding (M-16 / L-06): a green command that
 * never ran anything.
 *
 * Scope is deliberately narrow: enough to unit-test pure `src/utils` and
 * `src/security` modules. Component rendering needs
 * @testing-library/react-native, which is not a dependency yet — add it
 * alongside the first component test rather than pre-emptively here.
 */
module.exports = {
  preset: "react-native",
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/__tests__/**/*.test.{ts,tsx}"],
  // The root __mocks__/ dir is picked up automatically for node_modules
  // packages, which is how the clipboard native module is faked.
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  clearMocks: true,
};
