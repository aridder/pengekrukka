import { inferProcedureInput } from "@trpc/server";
import { expect } from "chai";
import { describe, it, TestContext, TestFunction } from "vitest";
import { MnemonicConfig } from "../../../utils/config";
import { AppRouter, appRouter } from "./_app";

const envKeys = [...MnemonicConfig, "RPC_URL", "BASE_URL"] as const;
type TestEnvironment = { [key in typeof envKeys[number]]: string };

const withConfig =
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

const getAPICaller = () =>
  appRouter.createCaller({
    session: {
      expires: "never",
      user: {
        name: "test",
        email: "",
      },
    },
  });

describe("the doctor router", async () => {
  it(
    "can be called without throwing",
    withConfig({}, async () => {
      const caller = getAPICaller();

      const input: inferProcedureInput<AppRouter["doctor"]["glassesProof"]> = {
        publicKey: "0x123",
      };

      await caller.doctor.glassesProof(input);
    })
  );

  it(
    "does return a VC",
    withConfig({}, async () => {
      const caller = getAPICaller();

      const response = await caller.doctor.glassesProof({ publicKey: "0x123" });
      expect(response.vc.proof).not.to.be.null;
      expect(response.vc.proof).not.to.be.undefined;
    })
  );
});
