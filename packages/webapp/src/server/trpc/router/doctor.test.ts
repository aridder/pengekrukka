import { inferProcedureInput } from "@trpc/server";
import dotenv from "dotenv";
import { describe, it, TestContext, TestFunction } from "vitest";
import { AppRouter, appRouter } from "./_app";

const keys = [
  "WELFARE_MNEMONIC",
  "DOCTOR_MNEMONIC",
  "OPTICIAN_MNEMONIC",
  "FREDRIK_MNEMONIC",
  "RPC_URL",
  "BASE_URL",
] as const;

type TestConfig = { [key in typeof keys[number]]: string };

const withConfig =
  (overrides: Partial<TestConfig>, action: TestFunction) =>
  async (context: TestContext) => {
    const config: TestConfig = {
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
    for (const key of keys) {
      process.env[key] = config[key];
    }

    await action(context);
    process.env = original;
  };

describe("the doctor router", async () => {
  it(
    "can be called without throwing",
    withConfig({}, async () => {
      await dotenv.config();

      const caller = appRouter.createCaller({
        session: {
          expires: "never",
          user: {
            name: "test",
            email: "",
          },
        },
      });

      const input: inferProcedureInput<AppRouter["doctor"]["glassesProof"]> = {
        publicKey: "0x123",
      };

      const post = await caller.doctor.glassesProof(input);

      console.log("post", post);
    })
  );
});
