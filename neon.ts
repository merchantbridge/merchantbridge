import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  auth: true,
  dataApi: {
    authProvider: "external",
    jwksUrl:
      "https://ep-jolly-cloud-b5ay2bbw.neonauth.c-7.us-east-2.aws.neon.tech/neondb/auth/.well-known/jwks.json",
  },
  preview: {
    // Upgrade to a paid plan to enable AI Gateway for your project.
    // aiGateway: true,
    buckets: {
      uploads: { access: "private" },
    },
    functions: {
      api: { name: "api", source: "./hello.ts" },
    },
  },
});
