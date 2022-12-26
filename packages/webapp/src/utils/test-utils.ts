import { AnyRootConfig } from "@trpc/server";
import { TestContext, TestFunction } from "vitest";
import { appRouter } from "../server/trpc/router/_app";
import { MnemonicConfig } from "./config";

const envKeys = [...MnemonicConfig, "RPC_URL", "BASE_URL"] as const;
type TestEnvironment = { [key in typeof envKeys[number]]: string };

export const withIssuerEnv =
  (overrides: Partial<TestEnvironment>, action: TestFunction) =>
  async (context: TestContext) => {
    const config: TestEnvironment = {
      WELFARE_MNEMONIC:
        "method salon soft whip predict develop shift misery wild exhibit anger curve",
      DOCTOR_MNEMONIC:
        "engage impulse federal index journey muffin hunt recall smile amateur betray sport",
      OPTICIAN_MNEMONIC:
        "naive apple embrace two gossip current crucial ivory typical toe walk canal",
      FREDRIK_MNEMONIC:
        "gauge swift critic choose churn message avoid dust drive inherit wrestle steel",
      RPC_URL:
        "https://eth-goerli.g.alchemy.com/v2/MpVc6bA01dS6MQbdBpqMA9fHxrGyYKQT",
      BASE_URL: "http://localhost:3000",
      ...overrides,
    };

    const original = process.env;
    for (const key of envKeys) {
      process.env[key] = config[key];
    }

    await action(context);
    process.env = original;
  };

export const getAPICaller = <T extends AnyRootConfig>() =>
  appRouter.createCaller({
    session: {
      expires: "never",
      user: {
        name: "test",
        email: "",
      },
    },
  });