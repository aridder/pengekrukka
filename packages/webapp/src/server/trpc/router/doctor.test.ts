import { inferProcedureInput } from "@trpc/server";
import { describe, it } from "vitest";
import { createContextInner } from "../context";
import { AppRouter, appRouter } from "./_app";

describe("the doctor router", async () => {
  it("can be called without crashing", async () => {
    const ctx = await createContextInner({});
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
  });
});
