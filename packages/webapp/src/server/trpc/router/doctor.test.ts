import { expect } from "chai";
import { describe, it } from "vitest";
import { getAPICaller, mockPersonCredential, withIssuerEnv } from "../../../utils/test-utils";

describe("the doctor router", async () => {
  it(
    "can be called without throwing",
    withIssuerEnv({}, async () => {
      const caller = getAPICaller();
      await caller.doctor.glassesProof(mockPersonCredential());
    })
  );

  it(
    "does return a VC",
    withIssuerEnv({}, async () => {
      const caller = getAPICaller();

      const response = await caller.doctor.glassesProof(mockPersonCredential());
      expect(response.vc.proof).not.to.be.null;
      expect(response.vc.proof).not.to.be.undefined;
    })
  );
});
