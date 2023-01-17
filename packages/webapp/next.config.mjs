// @ts-check

import dotenv from "dotenv";
import path from "path";

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"));

// Setting environment to project root's .env file for the current environmnt (e.g. `development` or `production`)
dotenv.config({
  path: `${path.resolve(process.cwd(), "..", "..", `.env.${process.env.NODE_ENV}`)}`,
});

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  }
};

export default config;
