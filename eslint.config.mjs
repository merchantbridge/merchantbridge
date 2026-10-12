import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  globalIgnores([".next/**", "out/**", "android/**", "public/**", "components/app/**", "components/public/images/**", "components/preview/**"]),
  {
    rules: {
      // Next 16 enables the React Compiler lint rules, which flag `Date.now()`
      // inside async Server Components. That is data fetching, not render, so it is safe.
      "react-hooks/purity": "off",
      // Fetching on mount in a client component (setState in an effect) is the
      // standard pattern for these admin/dashboard screens and is not a defect.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);
